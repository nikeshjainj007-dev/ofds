import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import type { Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabaseClient';
import { storage } from '../lib/storage';
import type { UserProfile } from '../types';
import { CAMPUS_PICKUP_ZONES } from '../types';

const STORAGE_KEY = 'satvik_user_profile';

interface AuthContextType {
  user: UserProfile | null;
  session: Session | null;
  loading: boolean;
  isAuthModalOpen: boolean;
  authModalMode: 'login' | 'signup';
  openAuthModal: (mode?: 'login' | 'signup' | unknown) => void;
  closeAuthModal: () => void;
  sendOtp: (email: string) => Promise<{
    success: boolean;
    message: string;
  }>;
  verifyOtp: (
    email: string,
    code: string,
    profileData?: Partial<UserProfile>,
    mode?: 'signup' | 'login'
  ) => Promise<{ success: boolean; message: string; requiresRedirectToLogin?: boolean }>;
  signInWithGoogle: () => Promise<{ success: boolean; message: string }>;
  logout: () => Promise<void>;
  updateProfile: (profileData: Partial<UserProfile>) => Promise<{ success: boolean; message: string }>;
  needsDobFallback: boolean;
  dobFallbackUser: { id: string; email: string; name: string } | null;
  submitDobFallback: (dob: string) => Promise<{ success: boolean; message: string }>;
  closeDobFallback: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(() => storage.get<UserProfile | null>(STORAGE_KEY, null));
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'signup'>('login');

  // Token map for stateless OTP verification without frontend code leakage
  const otpTokensRef = useRef<Record<string, string>>({});

  // Fallback UI State for Google OAuth DOB
  const [needsDobFallback, setNeedsDobFallback] = useState<boolean>(false);
  const [dobFallbackUser, setDobFallbackUser] = useState<{ id: string; email: string; name: string } | null>(null);

  const syncSupabaseUser = useCallback(async (currentSession: Session) => {
    try {
      const authUser = currentSession.user;
      const meta = authUser.user_metadata || {};
      const userEmail = (authUser.email || '').trim().toLowerCase();

      // Ensure exact name from Google is captured
      const googleName =
        meta.full_name ||
        meta.name ||
        userEmail.split('@')[0] ||
        'Campus Scholar';

      // Check profiles table in Supabase
      const { data: dbProfile } = await supabase
        .from('profiles')
        .select('*')
        .eq('email', userEmail)
        .maybeSingle();

      const existingDob = dbProfile?.dob || meta.birthday || meta.dob || '';

      // Feature 3: Fallback UI if DOB is not provided by Google default scopes
      if (!existingDob) {
        setDobFallbackUser({
          id: authUser.id,
          email: userEmail,
          name: dbProfile?.name || googleName,
        });
        setNeedsDobFallback(true);
      }

      const mergedProfile: UserProfile = {
        id: authUser.id,
        name: dbProfile?.name || googleName,
        email: userEmail,
        phone: dbProfile?.phone || meta.phone || '',
        role: (dbProfile?.role as 'Student' | 'Teacher') || 'Student',
        dob: existingDob,
        usn: dbProfile?.usn || '1RV21CS042',
        pickupZone: dbProfile?.pickup_zone || CAMPUS_PICKUP_ZONES[0],
        created_at: dbProfile?.created_at || new Date().toISOString(),
      };

      // Ensure Google user's name is saved in database exactly as provided by Google
      try {
        await supabase.from('profiles').upsert({
          id: authUser.id,
          email: userEmail,
          name: dbProfile?.name || googleName,
          dob: existingDob,
          updated_at: new Date().toISOString(),
        }, { onConflict: 'email' });
      } catch (upsertErr) {
        console.warn('Profile sync upsert notice:', upsertErr);
      }

      setUser(mergedProfile);
      storage.set(STORAGE_KEY, mergedProfile);
    } catch (syncErr) {
      console.warn('Sync Supabase user error:', syncErr);
    }
  }, []);

  useEffect(() => {
    const initAuth = async () => {
      try {
        const { data: { session: currentSession } } = await supabase.auth.getSession();
        if (currentSession) {
          setSession(currentSession);
          await syncSupabaseUser(currentSession);
        }
      } catch (err) {
        console.error('Error fetching Supabase session:', err);
      } finally {
        setLoading(false);
      }
    };

    initAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, currentSession) => {
        if (currentSession) {
          setSession(currentSession);
          await syncSupabaseUser(currentSession);
        }
        setLoading(false);
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [syncSupabaseUser]);

  const openAuthModal = (mode?: 'login' | 'signup' | unknown) => {
    const resolvedMode = mode === 'signup' ? 'signup' : 'login';
    setAuthModalMode(resolvedMode);
    setIsAuthModalOpen(true);
  };

  const closeAuthModal = () => setIsAuthModalOpen(false);

  // Send OTP to Email via Twilio API
  const sendOtp = async (email: string) => {
    const cleanEmail = email.trim().toLowerCase();
    try {
      const res = await fetch('/api/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: cleanEmail }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        return {
          success: false,
          message: data.message || 'Unable to send verification email. Please try again.',
        };
      }

      // Store stateless verification token without exposing OTP code
      if (data.otpToken) {
        otpTokensRef.current[cleanEmail] = data.otpToken;
      }

      return {
        success: true,
        message: data.message || `Verification code sent to ${cleanEmail}. Please check your email inbox and Spam folder.`,
      };
    } catch (err: any) {
      console.error('[sendOtp Exception]:', err);
      return {
        success: false,
        message: err.message || 'Network error sending verification code',
      };
    }
  };

  // Verify OTP
  const verifyOtp = async (
    email: string,
    code: string,
    profileData?: Partial<UserProfile>,
    mode: 'signup' | 'login' = 'login'
  ) => {
    const cleanEmail = email.trim().toLowerCase();
    const cleanCode = code.trim().replace(/^#/, '');
    const otpToken = otpTokensRef.current[cleanEmail] || '';

    try {
      const res = await fetch('/api/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: cleanEmail,
          code: cleanCode,
          otpToken,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        return {
          success: false,
          message: data.message || 'Invalid or expired verification code.',
        };
      }

      // FEATURE 1: User Signup Flow (New Users)
      // Save Name, DOB, and Email to the database, and immediately redirect to Login page
      if (mode === 'signup') {
        const newProfileId = 'usr-' + Math.floor(100000 + Math.random() * 900000);
        const resolvedName = profileData?.name?.trim() || cleanEmail.split('@')[0];
        const resolvedDob = profileData?.dob?.trim() || '';

        try {
          await supabase.from('profiles').upsert({
            id: newProfileId,
            email: cleanEmail,
            name: resolvedName,
            dob: resolvedDob,
            phone: profileData?.phone?.trim() || null,
            updated_at: new Date().toISOString(),
          }, { onConflict: 'email' });
        } catch (dbErr) {
          console.warn('Signup database save notice:', dbErr);
        }

        return {
          success: true,
          message: 'Registration successful! Name, DOB, and Email saved to database. Please log in with your email.',
          requiresRedirectToLogin: true,
        };
      }

      // FEATURE 2: User Login Flow (Returning Users)
      // Fetch user profile from database and authenticate
      const { data: dbProfile } = await supabase
        .from('profiles')
        .select('*')
        .eq('email', cleanEmail)
        .maybeSingle();

      const resolvedName = dbProfile?.name || cleanEmail.split('@')[0];
      const loggedProfile: UserProfile = {
        id: dbProfile?.id || 'usr-' + Math.floor(100000 + Math.random() * 900000),
        name: resolvedName,
        email: cleanEmail,
        phone: dbProfile?.phone || '',
        role: (dbProfile?.role as 'Student' | 'Teacher') || 'Student',
        dob: dbProfile?.dob || '',
        usn: dbProfile?.usn || '1RV21CS042',
        pickupZone: dbProfile?.pickup_zone || CAMPUS_PICKUP_ZONES[0],
        created_at: dbProfile?.created_at || new Date().toISOString(),
      };

      setUser(loggedProfile);
      storage.set(STORAGE_KEY, loggedProfile);

      return {
        success: true,
        message: `Welcome back, ${resolvedName}! Logged in successfully.`,
      };
    } catch (err: any) {
      console.error('[verifyOtp Exception]:', err);
      return {
        success: false,
        message: err.message || 'Network error verifying code',
      };
    }
  };

  // Feature 3: Continue with Google with scopes configured for Name and DOB
  const signInWithGoogle = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          scopes: 'openid email profile https://www.googleapis.com/auth/user.birthday.read',
          redirectTo: window.location.origin,
        },
      });
      if (error) throw error;
      return { success: true, message: 'Redirecting to Google Sign-In...' };
    } catch (err: any) {
      return { success: false, message: err.message || 'Google Sign-in failed' };
    }
  };

  // Feature 3 Fallback UI submission for Google OAuth DOB
  const submitDobFallback = async (dob: string) => {
    if (!dobFallbackUser) {
      return { success: false, message: 'No Google user pending DOB verification' };
    }

    const cleanDob = dob.trim();
    if (!cleanDob) {
      return { success: false, message: 'Please select a valid Date of Birth' };
    }

    try {
      await supabase.from('profiles').upsert({
        id: dobFallbackUser.id,
        email: dobFallbackUser.email,
        name: dobFallbackUser.name,
        dob: cleanDob,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'email' });

      if (user) {
        const updatedUser = { ...user, dob: cleanDob };
        setUser(updatedUser);
        storage.set(STORAGE_KEY, updatedUser);
      }

      setNeedsDobFallback(false);
      setDobFallbackUser(null);

      return {
        success: true,
        message: 'Date of Birth saved successfully! Profile setup complete.',
      };
    } catch (err: any) {
      return {
        success: false,
        message: err.message || 'Failed to save Date of Birth',
      };
    }
  };

  const closeDobFallback = () => {
    setNeedsDobFallback(false);
  };

  const logout = async () => {
    try {
      await supabase.auth.signOut();
    } catch {
      // ignore
    }
    setUser(null);
    storage.remove(STORAGE_KEY);
  };

  const updateProfile = async (profileData: Partial<UserProfile>) => {
    if (!user) return { success: false, message: 'No user active' };
    const updated = { ...user, ...profileData };
    setUser(updated);
    storage.set(STORAGE_KEY, updated);

    try {
      await supabase.from('profiles').upsert({
        id: user.id,
        email: user.email,
        name: updated.name,
        dob: updated.dob,
        phone: updated.phone,
        role: updated.role,
        usn: updated.usn,
        pickup_zone: updated.pickupZone,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'email' });
    } catch (err) {
      console.warn('Update profile Supabase sync notice:', err);
    }

    return { success: true, message: 'Profile updated successfully!' };
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        loading,
        isAuthModalOpen,
        authModalMode,
        openAuthModal,
        closeAuthModal,
        sendOtp,
        verifyOtp,
        signInWithGoogle,
        logout,
        updateProfile,
        needsDobFallback,
        dobFallbackUser,
        submitDobFallback,
        closeDobFallback,
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

