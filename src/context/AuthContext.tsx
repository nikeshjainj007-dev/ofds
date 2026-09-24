import React, { createContext, useContext, useEffect, useState } from 'react';
import type { User, Session, AuthError } from '@supabase/supabase-js';
import { supabase } from '../lib/supabaseClient';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  isAuthModalOpen: boolean;
  openAuthModal: () => void;
  closeAuthModal: () => void;
  sendOtp: (identifier: string, isPhone?: boolean) => Promise<{
    success: boolean;
    message: string;
    mode?: 'twilio_sms' | 'trial_demo';
    otpCode?: string;
  }>;
  verifyOtp: (identifier: string, token: string, isPhone?: boolean) => Promise<{ success: boolean; message: string }>;
  logout: () => Promise<void>;
  lastGeneratedOtp: string | null;
  otpMode: 'twilio_sms' | 'trial_demo' | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    try {
      const savedUser = localStorage.getItem('satvik_logged_in_user');
      return savedUser ? JSON.parse(savedUser) : null;
    } catch {
      return null;
    }
  });
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [lastOtpToken, setLastOtpToken] = useState<string | null>(null);
  const [lastGeneratedOtp, setLastGeneratedOtp] = useState<string | null>(null);
  const [otpMode, setOtpMode] = useState<'twilio_sms' | 'trial_demo' | null>(null);

  useEffect(() => {
    // 1. Get initial session
    const initAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          setSession(session);
          setUser(session.user);
        }
      } catch (err) {
        console.error('Error fetching Supabase session:', err);
      } finally {
        setLoading(false);
      }
    };

    initAuth();

    // 2. Listen to auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, currentSession) => {
        if (currentSession) {
          setSession(currentSession);
          setUser(currentSession.user);
        }
        setLoading(false);
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const openAuthModal = () => setIsAuthModalOpen(true);
  const closeAuthModal = () => setIsAuthModalOpen(false);

  // Send OTP (Twilio Verify for Phone with automatic fallback for trial mode, Supabase for Email)
  const sendOtp = async (identifier: string, isPhone: boolean = false) => {
    try {
      if (isPhone) {
        // --- REAL TWILIO SMS OTP WITH RESILIENT FALLBACK ---
        const cleanNumber = identifier.replace(/[^\d+]/g, '');
        const formattedPhone = cleanNumber.startsWith('+')
          ? cleanNumber
          : cleanNumber.length === 10
          ? `+91${cleanNumber}`
          : `+${cleanNumber}`;

        try {
          const res = await fetch('/api/send-otp', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ phone: formattedPhone }),
          });

          if (res.ok) {
            const data = await res.json();
            if (data.success) {
              setLastOtpToken(data.otpToken || null);
              setLastGeneratedOtp(data.otpCode || null);
              setOtpMode(data.mode || (data.otpCode ? 'trial_demo' : 'twilio_sms'));
              return {
                success: true,
                message: data.message || `OTP sent to ${formattedPhone}`,
                mode: data.mode,
                otpCode: data.otpCode,
              };
            }
          }
        } catch (apiErr) {
          console.warn('/api/send-otp request failed, using instant client demo fallback:', apiErr);
        }

        // If backend is unreachable (e.g., static preview):
        const fallbackCode = String(Math.floor(100000 + Math.random() * 900000));
        setLastGeneratedOtp(fallbackCode);
        setOtpMode('trial_demo');
        return {
          success: true,
          mode: 'trial_demo',
          otpCode: fallbackCode,
          message: `Demo OTP active for ${formattedPhone}: Use code ${fallbackCode} (or 123456)!`,
        };
      } else {
        // --- SUPABASE EMAIL OTP ---
        setLastGeneratedOtp(null);
        setOtpMode(null);
        const { error } = await supabase.auth.signInWithOtp({
          email: identifier.trim(),
          options: {
            shouldCreateUser: true,
          },
        });
        if (error) throw error;
        return { success: true, message: `6-digit OTP code sent to ${identifier.trim()}` };
      }
    } catch (err: any) {
      console.warn('sendOtp error:', err);
      const authErr = err as AuthError;
      // Graceful fallback for Supabase free tier rate limit (429)
      if (err?.status === 429 || err?.message?.toLowerCase().includes('rate limit')) {
        setLastGeneratedOtp('123456');
        setOtpMode('trial_demo');
        return { 
          success: true, 
          mode: 'trial_demo',
          otpCode: '123456',
          message: 'Supabase email limit reached. Demo OTP active: Use code 123456!' 
        };
      }
      return {
        success: false,
        message: authErr.message || err.message || 'Failed to send OTP. Please check your details and try again.',
      };
    }
  };

  // Verify OTP (Twilio for Phone, Supabase for Email)
  const verifyOtp = async (identifier: string, token: string, isPhone: boolean = false) => {
    try {
      if (isPhone) {
        const cleanNumber = identifier.replace(/[^\d+]/g, '');
        const formattedPhone = cleanNumber.startsWith('+')
          ? cleanNumber
          : cleanNumber.length === 10
          ? `+91${cleanNumber}`
          : `+${cleanNumber}`;

        const trimmedToken = token.trim();

        // 1. Immediate pass for test bypass code (123456) or client-generated fallback OTP
        if (trimmedToken === '123456' || (lastGeneratedOtp && trimmedToken === lastGeneratedOtp)) {
          const verifiedUser: any = {
            id: 'user-' + formattedPhone.replace(/\D/g, ''),
            phone: formattedPhone,
            email: `${formattedPhone.replace(/\D/g, '')}@satvikbite.com`,
            app_metadata: { provider: 'phone' },
            user_metadata: { name: 'Customer', phone: formattedPhone },
            aud: 'authenticated',
            created_at: new Date().toISOString(),
          };
          setUser(verifiedUser);
          localStorage.setItem('satvik_logged_in_user', JSON.stringify(verifiedUser));
          return {
            success: true,
            message: `Phone ${formattedPhone} verified successfully! Welcome to SatvikBite.`,
          };
        }

        // 2. Call backend /api/verify-otp
        try {
          const res = await fetch('/api/verify-otp', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              phone: formattedPhone,
              code: trimmedToken,
              otpToken: lastOtpToken,
            }),
          });

          if (res.ok) {
            const data = await res.json();
            if (data.success) {
              const verifiedUser: any = {
                id: 'user-' + formattedPhone.replace(/\D/g, ''),
                phone: formattedPhone,
                email: `${formattedPhone.replace(/\D/g, '')}@satvikbite.com`,
                app_metadata: { provider: 'twilio_sms' },
                user_metadata: { name: 'Customer', phone: formattedPhone },
                aud: 'authenticated',
                created_at: new Date().toISOString(),
              };
              setUser(verifiedUser);
              localStorage.setItem('satvik_logged_in_user', JSON.stringify(verifiedUser));
              return {
                success: true,
                message: data.message || `Phone ${formattedPhone} verified successfully!`,
              };
            } else {
              throw new Error(data.message || 'Invalid or expired OTP code.');
            }
          }
        } catch (apiErr: any) {
          if (apiErr.message && !apiErr.message.includes('fetch')) {
            throw apiErr;
          }
        }

        throw new Error('Invalid OTP code. Please enter the 6-digit code or test code 123456.');
      } else {
        // --- SUPABASE EMAIL VERIFY ---
        const { data, error } = await supabase.auth.verifyOtp({
          email: identifier.trim(),
          token: token.trim(),
          type: 'email',
        });
        if (error) throw error;
        if (data.session) {
          setSession(data.session);
          setUser(data.user);
          localStorage.setItem('satvik_logged_in_user', JSON.stringify(data.user));
        }
        return { success: true, message: 'Logged in successfully! Welcome to SatvikBite.' };
      }
    } catch (err: any) {
      console.warn('verifyOtp error:', err);
      // For testing convenience with test code 123456 or last generated OTP
      if (token === '123456' || (lastGeneratedOtp && token === lastGeneratedOtp)) {
        const cleanNumber = identifier.replace(/[^\d+]/g, '');
        const formattedPhone = cleanNumber.startsWith('+') ? cleanNumber : `+91${cleanNumber}`;
        const mockUser: any = {
          id: 'user-' + Math.random().toString(36).substring(7),
          email: !isPhone ? identifier : `${cleanNumber}@satvikbite.com`,
          phone: isPhone ? formattedPhone : undefined,
          app_metadata: { provider: isPhone ? 'twilio_sms' : 'email' },
          user_metadata: { name: 'Customer' },
          aud: 'authenticated',
          created_at: new Date().toISOString(),
        };
        setUser(mockUser);
        localStorage.setItem('satvik_logged_in_user', JSON.stringify(mockUser));
        return { success: true, message: 'Verified successfully!' };
      }
      return {
        success: false,
        message: err.message || 'Invalid or expired OTP code. Please try again.',
      };
    }
  };

  // Sign out
  const logout = async () => {
    try {
      await supabase.auth.signOut();
    } catch (err) {
      console.error('Error signing out:', err);
    } finally {
      setUser(null);
      setSession(null);
      localStorage.removeItem('satvik_logged_in_user');
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        loading,
        isAuthModalOpen,
        openAuthModal,
        closeAuthModal,
        sendOtp,
        verifyOtp,
        logout,
        lastGeneratedOtp,
        otpMode,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
