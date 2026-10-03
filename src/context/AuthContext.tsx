import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
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
  verifiedEmailSuccess: boolean;
  setVerifiedEmailSuccess: (val: boolean) => void;
  openAuthModal: (mode?: 'login' | 'signup' | unknown) => void;
  closeAuthModal: () => void;
  loginWithPassword: (
    email: string,
    password: string
  ) => Promise<{ success: boolean; message: string; accountNotExists?: boolean }>;
  signUpWithPassword: (payload: {
    name: string;
    dob: string;
    email: string;
    password: string;
  }) => Promise<{ success: boolean; message: string; alreadyExists?: boolean }>;
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
  const [user, setUser] = useState<UserProfile | null>(() => {
    const saved = storage.get<UserProfile | null>(STORAGE_KEY, null);
    if (saved && (saved.email.startsWith('test') || saved.id.startsWith('test') || saved.name.includes('Test Candidate'))) {
      storage.remove(STORAGE_KEY);
      return null;
    }
    return saved;
  });
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'signup'>('login');
  const [verifiedEmailSuccess, setVerifiedEmailSuccess] = useState<boolean>(false);

  // Fallback UI State for Google OAuth DOB
  const [needsDobFallback, setNeedsDobFallback] = useState<boolean>(false);
  const [dobFallbackUser, setDobFallbackUser] = useState<{ id: string; email: string; name: string } | null>(null);

  const syncSupabaseUser = useCallback(async (currentSession: Session) => {
    try {
      const authUser = currentSession.user;
      const meta = authUser.user_metadata || {};
      const userEmail = (authUser.email || '').trim().toLowerCase();

      // Ensure exact name from Google or metadata
      const profileName =
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

      // Google OAuth DOB Fallback check
      if (!existingDob && authUser.app_metadata.provider === 'google') {
        setDobFallbackUser({
          id: authUser.id,
          email: userEmail,
          name: dbProfile?.name || profileName,
        });
        setNeedsDobFallback(true);
      }

      const mergedProfile: UserProfile = {
        id: authUser.id,
        name: dbProfile?.name || profileName,
        email: userEmail,
        phone: dbProfile?.phone || meta.phone || '',
        role: (dbProfile?.role as 'Student' | 'Teacher') || 'Student',
        dob: existingDob,
        usn: dbProfile?.usn || '',
        pickupZone: dbProfile?.pickup_zone || CAMPUS_PICKUP_ZONES[0],
        created_at: dbProfile?.created_at || new Date().toISOString(),
      };

      try {
        await supabase.from('profiles').upsert({
          id: authUser.id,
          email: userEmail,
          name: dbProfile?.name || profileName,
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

  // Handle URL email verification link return
  useEffect(() => {
    const handleUrlAuth = async () => {
      const hash = window.location.hash || '';
      const search = window.location.search || '';

      const isVerificationReturn =
        hash.includes('auth-verified') ||
        hash.includes('type=signup') ||
        hash.includes('type=email_confirmation') ||
        search.includes('type=signup') ||
        search.includes('type=email_confirmation');

      if (isVerificationReturn) {
        // PDF: "After customer receive the sign in link and click it verify it and redirect to the login page(user enters email and passwords)."
        try {
          await supabase.auth.signOut();
        } catch {
          // ignore
        }
        setUser(null);
        storage.remove(STORAGE_KEY);
        window.history.replaceState(null, '', window.location.pathname);
        setAuthModalMode('login');
        setIsAuthModalOpen(true);
        setVerifiedEmailSuccess(true);
      }
    };

    handleUrlAuth();
  }, []);

  useEffect(() => {
    const initAuth = async () => {
      try {
        const { data: { session: currentSession } } = await supabase.auth.getSession();
        if (currentSession) {
          const hash = window.location.hash || '';
          if (hash.includes('type=signup') || hash.includes('type=email_confirmation') || hash.includes('auth-verified')) {
            await supabase.auth.signOut();
            setUser(null);
            storage.remove(STORAGE_KEY);
          } else {
            setSession(currentSession);
            await syncSupabaseUser(currentSession);
          }
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
        const hash = window.location.hash || '';
        if (hash.includes('type=signup') || hash.includes('type=email_confirmation') || hash.includes('auth-verified')) {
          try {
            await supabase.auth.signOut();
          } catch {}
          setUser(null);
          storage.remove(STORAGE_KEY);
          window.history.replaceState(null, '', window.location.pathname);
          setAuthModalMode('login');
          setIsAuthModalOpen(true);
          setVerifiedEmailSuccess(true);
          setLoading(false);
          return;
        }

        if (currentSession) {
          setSession(currentSession);
          await syncSupabaseUser(currentSession);
        } else {
          setSession(null);
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

  const closeAuthModal = () => {
    setIsAuthModalOpen(false);
    setVerifiedEmailSuccess(false);
  };

  // 1. Password Login (Page 1)
  const loginWithPassword = async (
    email: string,
    password: string
  ): Promise<{ success: boolean; message: string; accountNotExists?: boolean }> => {
    const cleanEmail = email.trim().toLowerCase();
    const cleanPassword = password.trim();

    if (!cleanEmail || !cleanEmail.includes('@')) {
      return { success: false, message: 'Please enter a valid email address.' };
    }
    if (!cleanPassword) {
      return { success: false, message: 'Please enter your password.' };
    }

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password: cleanPassword,
      });

      if (error) {
        // PDF Requirement:
        // "if the login creditienals are not there says Account do not exist and Redirect to Sign up option."
        return {
          success: false,
          message: 'Account does not exist. Redirecting to Sign up option...',
          accountNotExists: true,
        };
      }

      if (data.session && data.user) {
        setSession(data.session);
        await syncSupabaseUser(data.session);
        return {
          success: true,
          message: 'Logged in successfully!',
        };
      }

      return {
        success: false,
        message: 'Account does not exist. Redirecting to Sign up option...',
        accountNotExists: true,
      };
    } catch (err: any) {
      console.error('[loginWithPassword Exception]:', err);
      return {
        success: false,
        message: 'Account does not exist. Redirecting to Sign up option...',
        accountNotExists: true,
      };
    }
  };

  // 2. Signup with Password & Verification Link (Page 2)
  const signUpWithPassword = async (payload: {
    name: string;
    dob: string;
    email: string;
    password: string;
  }): Promise<{ success: boolean; message: string; alreadyExists?: boolean }> => {
    const cleanEmail = payload.email.trim().toLowerCase();
    const cleanName = payload.name.trim();
    const cleanDob = payload.dob.trim();
    const cleanPassword = payload.password;

    if (!cleanName) {
      return { success: false, message: 'Please enter your full name.' };
    }
    if (!cleanDob) {
      return { success: false, message: 'Please select your Date of Birth (DOB).' };
    }
    if (!cleanEmail || !cleanEmail.includes('@')) {
      return { success: false, message: 'Please enter a valid email address.' };
    }
    if (!cleanPassword) {
      return { success: false, message: 'Please enter a strong password.' };
    }

    try {
      // Sign up with Supabase Auth with redirect URL for email verification
      const redirectUrl = `${window.location.origin}/#auth-verified`;
      const { data, error } = await supabase.auth.signUp({
        email: cleanEmail,
        password: cleanPassword,
        options: {
          data: {
            full_name: cleanName,
            dob: cleanDob,
          },
          emailRedirectTo: redirectUrl,
        },
      });

      if (error) {
        const errMsg = error.message?.toLowerCase() || '';
        if (
          errMsg.includes('already registered') ||
          errMsg.includes('already exists') ||
          errMsg.includes('user already exists')
        ) {
          return {
            success: false,
            message: 'An account with this email already exists. Please log in.',
            alreadyExists: true,
          };
        }
        return {
          success: false,
          message: error.message || 'Unable to register account. Please try again.',
        };
      }

      // Save profile details into Supabase public.profiles table
      const profileId = data.user?.id || ('usr-' + Date.now());
      try {
        await supabase.from('profiles').upsert({
          id: profileId,
          email: cleanEmail,
          name: cleanName,
          dob: cleanDob,
          role: 'Student',
          updated_at: new Date().toISOString(),
        }, { onConflict: 'email' });
      } catch (dbErr) {
        console.warn('Profile save warning during signup:', dbErr);
      }

      return {
        success: true,
        message: `A sign-in link has been sent to ${cleanEmail} for authentication. Please click it to verify.`,
      };
    } catch (err: any) {
      console.error('[signUpWithPassword Exception]:', err);
      return {
        success: false,
        message: err.message || 'Error creating account. Please try again.',
      };
    }
  };

  // Google Sign-In
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
        verifiedEmailSuccess,
        setVerifiedEmailSuccess,
        openAuthModal,
        closeAuthModal,
        loginWithPassword,
        signUpWithPassword,
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
