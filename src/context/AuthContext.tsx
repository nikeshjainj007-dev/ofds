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
  openAuthModal: () => void;
  closeAuthModal: () => void;
  loginWithPassword: (
    email: string,
    password: string
  ) => Promise<{ success: boolean; message: string; accountNotExists?: boolean }>;
  /** Google OAuth popup — after redirect-back, pendingGoogleEmail is set for the registration form. */
  signInWithGoogle: () => Promise<{ success: boolean; message: string }>;
  /** Complete registration for a Google-authed user by setting a password + profile fields. */
  completeGoogleRegistration: (payload: {
    name: string;
    phone: string;
    dob: string;
    password: string;
  }) => Promise<{ success: boolean; message: string }>;
  logout: () => Promise<void>;
  updateProfile: (profileData: Partial<UserProfile>) => Promise<{ success: boolean; message: string }>;
  /** Non-null when Google OAuth completed and user needs to fill the registration form. */
  pendingGoogleEmail: string | null;
  clearPendingGoogle: () => void;
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
  const [pendingGoogleEmail, setPendingGoogleEmail] = useState<string | null>(null);

  const syncSupabaseUser = useCallback(async (currentSession: Session) => {
    try {
      const authUser = currentSession.user;
      const meta = authUser.user_metadata || {};
      const userEmail = (authUser.email || '').trim().toLowerCase();

      const profileName =
        meta.full_name ||
        meta.name ||
        userEmail.split('@')[0] ||
        'Campus Scholar';

      const { data: dbProfile } = await supabase
        .from('profiles')
        .select('*')
        .eq('email', userEmail)
        .maybeSingle();

      // If this is a Google OAuth user who has no profile yet (no password set),
      // show the registration form instead of auto-logging in.
      if (!dbProfile && authUser.app_metadata.provider === 'google') {
        setPendingGoogleEmail(userEmail);
        setIsAuthModalOpen(true);
        return;
      }

      const mergedProfile: UserProfile = {
        id: authUser.id,
        name: dbProfile?.name || profileName,
        email: userEmail,
        phone: dbProfile?.phone || meta.phone || '',
        role: (dbProfile?.role as 'Student' | 'Teacher') || 'Student',
        dob: dbProfile?.dob || meta.dob || '',
        usn: dbProfile?.usn || '',
        pickupZone: dbProfile?.pickup_zone || CAMPUS_PICKUP_ZONES[0],
        created_at: dbProfile?.created_at || new Date().toISOString(),
      };

      try {
        await supabase.from('profiles').upsert({
          id: authUser.id,
          email: userEmail,
          name: dbProfile?.name || profileName,
          dob: mergedProfile.dob,
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

  const openAuthModal = () => {
    setIsAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setIsAuthModalOpen(false);
  };

  const clearPendingGoogle = () => {
    setPendingGoogleEmail(null);
  };

  // Password Login
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
        return {
          success: false,
          message: 'Account does not exist. Please continue with Google to create an account.',
          accountNotExists: true,
        };
      }

      if (data.session && data.user) {
        setSession(data.session);
        await syncSupabaseUser(data.session);
        return { success: true, message: 'Logged in successfully!' };
      }

      return {
        success: false,
        message: 'Account does not exist. Please continue with Google to create an account.',
        accountNotExists: true,
      };
    } catch (err: any) {
      console.error('[loginWithPassword Exception]:', err);
      return {
        success: false,
        message: 'Account does not exist. Please continue with Google to create an account.',
        accountNotExists: true,
      };
    }
  };

  // Google Sign-In (used to initiate registration)
  const signInWithGoogle = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin,
        },
      });
      if (error) throw error;
      return { success: true, message: 'Redirecting to Google Sign-In...' };
    } catch (err: any) {
      return { success: false, message: err.message || 'Google Sign-in failed' };
    }
  };

  // Complete registration after Google OAuth — sets password + saves profile
  const completeGoogleRegistration = async (payload: {
    name: string;
    phone: string;
    dob: string;
    password: string;
  }): Promise<{ success: boolean; message: string }> => {
    if (!session || !pendingGoogleEmail) {
      return { success: false, message: 'No pending Google registration found.' };
    }

    const cleanName = payload.name.trim();
    const cleanPhone = payload.phone.trim();
    const cleanDob = payload.dob.trim();

    if (!cleanName) return { success: false, message: 'Please enter your full name.' };
    if (!cleanPhone) return { success: false, message: 'Please enter your phone number.' };
    if (!cleanDob) return { success: false, message: 'Please select your Date of Birth.' };

    try {
      // Set a password on the Google-authed account so they can login with email+password later
      const { error: updateErr } = await supabase.auth.updateUser({
        password: payload.password,
      });
      if (updateErr) {
        return { success: false, message: updateErr.message || 'Failed to set password.' };
      }

      const profileId = session.user.id;
      await supabase.from('profiles').upsert({
        id: profileId,
        email: pendingGoogleEmail,
        name: cleanName,
        phone: cleanPhone,
        dob: cleanDob,
        role: 'Student',
        updated_at: new Date().toISOString(),
      }, { onConflict: 'email' });

      const newProfile: UserProfile = {
        id: profileId,
        name: cleanName,
        email: pendingGoogleEmail,
        phone: cleanPhone,
        role: 'Student',
        dob: cleanDob,
        usn: '',
        pickupZone: CAMPUS_PICKUP_ZONES[0],
        created_at: new Date().toISOString(),
      };

      setUser(newProfile);
      storage.set(STORAGE_KEY, newProfile);
      setPendingGoogleEmail(null);

      return { success: true, message: 'Account created successfully!' };
    } catch (err: any) {
      console.error('[completeGoogleRegistration Exception]:', err);
      return { success: false, message: err.message || 'Error completing registration.' };
    }
  };

  const logout = async () => {
    try {
      await supabase.auth.signOut();
    } catch {
      // ignore
    }
    setUser(null);
    setPendingGoogleEmail(null);
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
        openAuthModal,
        closeAuthModal,
        loginWithPassword,
        signInWithGoogle,
        completeGoogleRegistration,
        logout,
        updateProfile,
        pendingGoogleEmail,
        clearPendingGoogle,
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
