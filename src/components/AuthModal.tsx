import React, { useState } from 'react';
import {
  X,
  Mail,
  User,
  Calendar,
  Lock,
  Eye,
  EyeOff,
  Loader2,
  ArrowRight,
  CheckCircle2,
  Check,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export const AuthModal: React.FC = () => {
  const {
    isAuthModalOpen,
    authModalMode,
    closeAuthModal,
    loginWithPassword,
    signUpWithPassword,
    signInWithGoogle,
    verifiedEmailSuccess,
    setVerifiedEmailSuccess,
    needsDobFallback,
    dobFallbackUser,
    submitDobFallback,
    closeDobFallback,
  } = useAuth();
  const { showToast } = useToast();

  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  // Form Fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [dob, setDob] = useState('');

  // Password visibility
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Verification link dispatched banner state
  const [verificationLinkSent, setVerificationLinkSent] = useState(false);

  // Google OAuth DOB Fallback state
  const [fallbackDob, setFallbackDob] = useState('');
  const [isFallbackSubmitting, setIsFallbackSubmitting] = useState(false);

  // Synchronize initial mode when opened
  const [prevOpenState, setPrevOpenState] = useState(false);
  if (isAuthModalOpen && !prevOpenState) {
    setPrevOpenState(true);
    setAuthMode(authModalMode);
    setVerificationLinkSent(false);
  } else if (!isAuthModalOpen && prevOpenState) {
    setPrevOpenState(false);
  }

  const handleClose = () => {
    closeAuthModal();
    setPassword('');
    setConfirmPassword('');
    setVerificationLinkSent(false);
    setIsLoading(false);
    setIsGoogleLoading(false);
  };

  // Strong password checks
  const passwordCriteria = {
    minLength: password.length >= 8,
    hasUpper: /[A-Z]/.test(password),
    hasLower: /[a-z]/.test(password),
    hasNumber: /[0-9]/.test(password),
    hasSpecial: /[!@#$%^&*(),.?":{}|<>]/.test(password),
    matches: password.length > 0 && password === confirmPassword,
  };

  const isStrongPassword =
    passwordCriteria.minLength &&
    passwordCriteria.hasUpper &&
    passwordCriteria.hasLower &&
    passwordCriteria.hasNumber &&
    passwordCriteria.hasSpecial;

  // 1. Password Login Handler (Page 1)
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = email.trim().toLowerCase();
    const cleanPassword = password.trim();

    if (!cleanEmail || !cleanEmail.includes('@')) {
      showToast('Please enter a valid email address', 'error');
      return;
    }

    if (!cleanPassword) {
      showToast('Please enter your password', 'error');
      return;
    }

    setIsLoading(true);
    try {
      const result = await loginWithPassword(cleanEmail, cleanPassword);
      setIsLoading(false);

      if (result.success) {
        showToast(result.message, 'success', 'Login Successful');
        handleClose();
      } else {
        // PDF Requirement:
        // "if the login creditienals are not there says Account do not exist and Redirect to Sign up option."
        showToast('Account does not exist. Redirecting to Sign up option...', 'error', 'Account Not Found');
        setAuthMode('signup');
        setPassword('');
        setConfirmPassword('');
      }
    } catch {
      setIsLoading(false);
      showToast('Account does not exist. Redirecting to Sign up option...', 'error', 'Account Not Found');
      setAuthMode('signup');
      setPassword('');
      setConfirmPassword('');
    }
  };

  // 2. Signup Handler (Page 2)
  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = email.trim().toLowerCase();
    const cleanName = fullName.trim();
    const cleanDob = dob.trim();

    if (!cleanName) {
      showToast('Please enter your full name', 'error');
      return;
    }

    if (!cleanDob) {
      showToast('Please select your Date of Birth (DOB)', 'error');
      return;
    }

    if (!cleanEmail || !cleanEmail.includes('@')) {
      showToast('Please enter a valid email address', 'error');
      return;
    }

    if (!isStrongPassword) {
      showToast(
        'Password must be at least 8 characters long and contain uppercase, lowercase, number, and special character.',
        'error',
        'Strong Password Required'
      );
      return;
    }

    if (password !== confirmPassword) {
      showToast('Passwords do not match. Please re-enter.', 'error');
      return;
    }

    setIsLoading(true);
    try {
      const result = await signUpWithPassword({
        name: cleanName,
        dob: cleanDob,
        email: cleanEmail,
        password,
      });

      setIsLoading(false);

      if (result.success) {
        setVerificationLinkSent(true);
        showToast(
          `A sign-in link has been sent to ${cleanEmail}. Click it to verify your account!`,
          'success',
          'Verification Link Sent'
        );
      } else {
        if (result.alreadyExists) {
          showToast(result.message, 'error', 'Account Already Exists');
          setAuthMode('login');
        } else {
          showToast(result.message || 'Error creating account', 'error');
        }
      }
    } catch (err: any) {
      setIsLoading(false);
      showToast(err?.message || 'Error registering account', 'error');
    }
  };

  // Google OAuth Handler
  const handleGoogleSignIn = async () => {
    setIsGoogleLoading(true);
    try {
      const res = await signInWithGoogle();
      if (!res.success) {
        showToast(res.message, 'error');
      }
    } catch (err: any) {
      showToast(err?.message || 'Google sign-in failed', 'error');
    } finally {
      setIsGoogleLoading(false);
    }
  };

  // Fallback DOB submit for Google OAuth
  const handleFallbackSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fallbackDob) {
      showToast('Please enter your Date of Birth', 'error');
      return;
    }
    setIsFallbackSubmitting(true);
    try {
      const res = await submitDobFallback(fallbackDob);
      setIsFallbackSubmitting(false);
      if (res.success) {
        showToast(res.message, 'success', 'Profile Completed');
      } else {
        showToast(res.message, 'error');
      }
    } catch (err: any) {
      setIsFallbackSubmitting(false);
      showToast(err?.message || 'Failed to save DOB', 'error');
    }
  };

  // FALLBACK UI MODAL: If DOB is not provided by Google default scopes
  if (needsDobFallback && dobFallbackUser) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
        <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden border border-emerald-100">
          <div className="bg-gradient-to-r from-emerald-800 to-green-700 p-6 text-white">
            <button
              onClick={closeDobFallback}
              className="absolute top-5 right-5 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
            <span className="bg-emerald-500/30 text-emerald-200 text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full border border-emerald-400/20">
              Campus Profile Completion
            </span>
            <h2 className="text-xl font-black mt-2">Date of Birth Required</h2>
            <p className="text-xs text-emerald-100/90 mt-1">
              Welcome, <strong>{dobFallbackUser.name}</strong>! Please provide your Date of Birth to complete setup.
            </p>
          </div>

          <form onSubmit={handleFallbackSubmit} className="p-6 space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Your Date of Birth (DOB) *
              </label>
              <div className="relative">
                <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="date"
                  required
                  value={fallbackDob}
                  onChange={(e) => setFallbackDob(e.target.value)}
                  className="w-full pl-10 pr-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold focus:bg-white focus:border-emerald-600 focus:outline-none transition-colors"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isFallbackSubmitting}
              className="w-full py-3 bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white font-extrabold text-xs rounded-xl shadow-md shadow-emerald-600/20 flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              {isFallbackSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Saving Date of Birth...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Complete Setup & Continue</span>
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    );
  }

  if (!isAuthModalOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden border border-emerald-100 max-h-[92vh] flex flex-col">
        {/* Header Bar */}
        <div className="bg-gradient-to-r from-emerald-800 to-green-700 p-6 text-white relative flex-shrink-0">
          <button
            onClick={handleClose}
            className="absolute top-5 right-5 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-2 mb-2">
            <span className="bg-emerald-500/30 text-emerald-200 text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full border border-emerald-400/20">
              Campus Security Portal
            </span>
          </div>

          <h2 className="text-xl sm:text-2xl font-black tracking-tight">
            {authMode === 'login' ? 'Welcome Back, Sign In' : 'Create New Account'}
          </h2>
          <p className="text-xs text-emerald-100/90 mt-1">
            {authMode === 'login'
              ? 'Enter your registered email and password to sign in, or Continue with Google'
              : 'Fill in your Name, Date of Birth, Email, and Password to register securely'}
          </p>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5">
          {/* Verified Email Success Banner */}
          {verifiedEmailSuccess && authMode === 'login' && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-3 text-emerald-900 text-xs animate-in fade-in">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
              <div>
                <p className="font-bold">Email verified successfully!</p>
                <p className="text-[11px] text-emerald-700">Please enter your email and password below to sign in.</p>
              </div>
              <button
                type="button"
                onClick={() => setVerifiedEmailSuccess(false)}
                className="ml-auto text-emerald-700 hover:text-emerald-900"
              >
                ✕
              </button>
            </div>
          )}

          {/* Login / Sign Up Tabs */}
          <div className="flex bg-gray-100 p-1 rounded-2xl">
            <button
              type="button"
              onClick={() => {
                setAuthMode('login');
                setVerificationLinkSent(false);
              }}
              className={`flex-1 py-2 text-xs font-black rounded-xl transition-all cursor-pointer ${
                authMode === 'login'
                  ? 'bg-white text-emerald-900 shadow-sm'
                  : 'text-gray-500 hover:text-gray-800'
              }`}
            >
              User Login (Returning Users)
            </button>
            <button
              type="button"
              onClick={() => {
                setAuthMode('signup');
                setVerificationLinkSent(false);
              }}
              className={`flex-1 py-2 text-xs font-black rounded-xl transition-all cursor-pointer ${
                authMode === 'signup'
                  ? 'bg-white text-emerald-900 shadow-sm'
                  : 'text-gray-500 hover:text-gray-800'
              }`}
            >
              User Signup (New Users)
            </button>
          </div>

          {/* Continue with Google Button */}
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={isGoogleLoading}
            className="w-full py-2.5 px-4 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 font-bold text-xs rounded-xl shadow-sm flex items-center justify-center gap-3 transition-colors cursor-pointer"
          >
            {isGoogleLoading ? (
              <Loader2 className="w-4 h-4 animate-spin text-emerald-600" />
            ) : (
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
            )}
            <span>Continue with Google</span>
          </button>

          <div className="flex items-center my-3">
            <div className="flex-1 border-t border-gray-200"></div>
            <span className="px-3 text-[11px] text-gray-400 font-semibold uppercase tracking-wider">
              Or Continue with Email
            </span>
            <div className="flex-1 border-t border-gray-200"></div>
          </div>

          {/* PAGE 1: USER LOGIN TAB */}
          {authMode === 'login' && (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Email ID *
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="user@example.com"
                    className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold focus:bg-white focus:border-emerald-600 focus:outline-none transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Enter Password *
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="w-full pl-10 pr-10 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold focus:bg-white focus:border-emerald-600 focus:outline-none transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full mt-2 py-3 bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white font-extrabold text-xs rounded-xl shadow-md shadow-emerald-600/20 flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Signing In...</span>
                  </>
                ) : (
                  <>
                    <span>Sign In</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => setAuthMode('signup')}
                  className="text-xs text-gray-500 hover:text-emerald-700 font-semibold transition-colors cursor-pointer"
                >
                  Don't have an account? <span className="text-emerald-700 font-bold underline">Sign up here</span>
                </button>
              </div>
            </form>
          )}

          {/* PAGE 2: USER SIGNUP TAB */}
          {authMode === 'signup' && (
            <>
              {verificationLinkSent ? (
                /* Verification Link Dispatched Card */
                <div className="p-6 bg-emerald-50 rounded-2xl border border-emerald-200 text-center space-y-4 animate-in fade-in">
                  <div className="w-12 h-12 mx-auto rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shadow-inner">
                    <Mail className="w-6 h-6 animate-pulse" />
                  </div>
                  <div>
                    <h3 className="text-base font-black text-emerald-950">
                      Sign-In Link Sent!
                    </h3>
                    <p className="text-xs text-gray-600 mt-1">
                      We have sent an authentication sign-in link to:
                    </p>
                    <p className="text-xs font-bold text-emerald-900 mt-0.5 break-all">
                      {email}
                    </p>
                  </div>
                  <div className="text-[11px] text-gray-600 bg-white/80 p-3 rounded-xl border border-emerald-200/60 text-left space-y-1.5">
                    <p className="font-semibold text-emerald-900">Next Steps:</p>
                    <p>1. Open your email inbox (and check Spam/Junk folder).</p>
                    <p>2. Click the verification link to authenticate your account.</p>
                    <p>3. You will be redirected back to the login page to sign in with your email and password.</p>
                  </div>
                  <div className="pt-2 space-y-2">
                    <button
                      type="button"
                      onClick={() => {
                        setVerificationLinkSent(false);
                        setAuthMode('login');
                      }}
                      className="w-full py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold text-xs rounded-xl shadow-md transition-all cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <span>Proceed to Login Page</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setVerificationLinkSent(false)}
                      className="text-xs text-gray-500 hover:text-gray-800 font-semibold cursor-pointer"
                    >
                      ← Edit Details or Re-send
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSignup} className="space-y-4">
                  {/* Name Field */}
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">
                      Name *
                    </label>
                    <div className="relative">
                      <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="text"
                        required
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="Enter your full name"
                        className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold focus:bg-white focus:border-emerald-600 focus:outline-none transition-colors"
                      />
                    </div>
                  </div>

                  {/* DOB (Date of Birth) Field */}
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">
                      DOB (Date of Birth) *
                    </label>
                    <div className="relative">
                      <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="date"
                        required
                        value={dob}
                        onChange={(e) => setDob(e.target.value)}
                        className="w-full pl-10 pr-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold focus:bg-white focus:border-emerald-600 focus:outline-none transition-colors"
                      />
                    </div>
                  </div>

                  {/* Email ID Field */}
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">
                      Email ID *
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="user@example.com"
                        className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold focus:bg-white focus:border-emerald-600 focus:outline-none transition-colors"
                      />
                    </div>
                  </div>

                  {/* Enter New Password */}
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">
                      Enter New Password *
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Enter new strong password"
                        className="w-full pl-10 pr-10 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold focus:bg-white focus:border-emerald-600 focus:outline-none transition-colors"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Confirm Password (Strong Passwords) */}
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">
                      Confirm Password (Strong Passwords) *
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        required
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Confirm password"
                        className="w-full pl-10 pr-10 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold focus:bg-white focus:border-emerald-600 focus:outline-none transition-colors"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
                      >
                        {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Strong Password Criteria Indicators */}
                  <div className="p-3 bg-gray-50 rounded-xl border border-gray-200 text-[11px] space-y-1.5">
                    <div className="font-bold text-gray-700 flex items-center gap-1">
                      <span>Strong Password Criteria:</span>
                    </div>
                    <div className="grid grid-cols-2 gap-1 text-[10px]">
                      <span className={`flex items-center gap-1 ${passwordCriteria.minLength ? 'text-emerald-700 font-bold' : 'text-gray-400'}`}>
                        {passwordCriteria.minLength ? <Check className="w-3 h-3" /> : '•'} 8+ characters
                      </span>
                      <span className={`flex items-center gap-1 ${passwordCriteria.hasUpper ? 'text-emerald-700 font-bold' : 'text-gray-400'}`}>
                        {passwordCriteria.hasUpper ? <Check className="w-3 h-3" /> : '•'} Uppercase (A-Z)
                      </span>
                      <span className={`flex items-center gap-1 ${passwordCriteria.hasLower ? 'text-emerald-700 font-bold' : 'text-gray-400'}`}>
                        {passwordCriteria.hasLower ? <Check className="w-3 h-3" /> : '•'} Lowercase (a-z)
                      </span>
                      <span className={`flex items-center gap-1 ${passwordCriteria.hasNumber ? 'text-emerald-700 font-bold' : 'text-gray-400'}`}>
                        {passwordCriteria.hasNumber ? <Check className="w-3 h-3" /> : '•'} Number (0-9)
                      </span>
                      <span className={`flex items-center gap-1 ${passwordCriteria.hasSpecial ? 'text-emerald-700 font-bold' : 'text-gray-400'}`}>
                        {passwordCriteria.hasSpecial ? <Check className="w-3 h-3" /> : '•'} Special char (!@#$)
                      </span>
                      <span className={`flex items-center gap-1 ${passwordCriteria.matches ? 'text-emerald-700 font-bold' : 'text-gray-400'}`}>
                        {passwordCriteria.matches ? <Check className="w-3 h-3" /> : '•'} Passwords match
                      </span>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full mt-2 py-3 bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white font-extrabold text-xs rounded-xl shadow-md shadow-emerald-600/20 flex items-center justify-center gap-2 transition-all cursor-pointer"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Sending Sign-in Link...</span>
                      </>
                    ) : (
                      <>
                        <span>Register & Send Sign-in Link</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>

                  <div className="text-center pt-2">
                    <button
                      type="button"
                      onClick={() => setAuthMode('login')}
                      className="text-xs text-gray-500 hover:text-emerald-700 font-semibold transition-colors cursor-pointer"
                    >
                      Already have an account? <span className="text-emerald-700 font-bold underline">Sign in here</span>
                    </button>
                  </div>
                </form>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
