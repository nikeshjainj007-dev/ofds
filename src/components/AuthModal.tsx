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
  Check,
  Phone,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export const AuthModal: React.FC = () => {
  const {
    isAuthModalOpen,
    closeAuthModal,
    loginWithPassword,
    signInWithGoogle,
    completeGoogleRegistration,
    pendingGoogleEmail,
    clearPendingGoogle,
  } = useAuth();
  const { showToast } = useToast();

  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  // Login form fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Registration form fields (after Google OAuth)
  const [regName, setRegName] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regDob, setRegDob] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [showRegConfirmPassword, setShowRegConfirmPassword] = useState(false);

  const handleClose = () => {
    closeAuthModal();
    clearPendingGoogle();
    setPassword('');
    setRegPassword('');
    setRegConfirmPassword('');
    setIsLoading(false);
    setIsGoogleLoading(false);
  };

  // Strong password checks
  const passwordCriteria = {
    minLength: regPassword.length >= 8,
    hasUpper: /[A-Z]/.test(regPassword),
    hasLower: /[a-z]/.test(regPassword),
    hasNumber: /[0-9]/.test(regPassword),
    hasSpecial: /[!@#$%^&*(),.?":{}|<>]/.test(regPassword),
    matches: regPassword.length > 0 && regPassword === regConfirmPassword,
  };

  const isStrongPassword =
    passwordCriteria.minLength &&
    passwordCriteria.hasUpper &&
    passwordCriteria.hasLower &&
    passwordCriteria.hasNumber &&
    passwordCriteria.hasSpecial;

  // Login Handler
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
        showToast('Account does not exist. Please Continue with Google to create an account.', 'error', 'Account Not Found');
      }
    } catch {
      setIsLoading(false);
      showToast('Account does not exist. Please Continue with Google to create an account.', 'error', 'Account Not Found');
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

  // Registration Handler (after Google OAuth)
  const handleRegistration = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!regName.trim()) {
      showToast('Please enter your full name', 'error');
      return;
    }
    if (!regPhone.trim()) {
      showToast('Please enter your phone number', 'error');
      return;
    }
    if (!regDob) {
      showToast('Please select your Date of Birth', 'error');
      return;
    }
    if (!isStrongPassword) {
      showToast(
        'Password must be at least 8 characters with uppercase, lowercase, number, and special character.',
        'error',
        'Strong Password Required'
      );
      return;
    }
    if (regPassword !== regConfirmPassword) {
      showToast('Passwords do not match.', 'error');
      return;
    }

    setIsLoading(true);
    try {
      const result = await completeGoogleRegistration({
        name: regName,
        phone: regPhone,
        dob: regDob,
        password: regPassword,
      });
      setIsLoading(false);

      if (result.success) {
        showToast(result.message, 'success', 'Account Created');
        handleClose();
      } else {
        showToast(result.message || 'Error creating account', 'error');
      }
    } catch (err: any) {
      setIsLoading(false);
      showToast(err?.message || 'Error creating account', 'error');
    }
  };

  if (!isAuthModalOpen) return null;

  // If Google OAuth completed, show registration form
  const isRegistrationMode = !!pendingGoogleEmail;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden border border-emerald-100 max-h-[92vh] flex flex-col">
        {/* Header */}
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
            {isRegistrationMode ? 'Complete Your Registration' : 'Welcome Back, Sign In'}
          </h2>
          <p className="text-xs text-emerald-100/90 mt-1">
            {isRegistrationMode
              ? 'Fill in your details below to create your campus account'
              : 'Enter your email and password to sign in'}
          </p>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-5">
          {isRegistrationMode ? (
            /* ─── REGISTRATION FORM (after Google OAuth) ─── */
            <form onSubmit={handleRegistration} className="space-y-4">
              {/* Email (read-only, from Google) */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Email ID (from Google) *
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="email"
                    value={pendingGoogleEmail}
                    readOnly
                    className="w-full pl-10 pr-4 py-2.5 bg-gray-100 border border-gray-200 rounded-xl text-xs font-semibold text-gray-600 cursor-not-allowed select-all"
                  />
                </div>
                <p className="text-[10px] text-gray-400 mt-0.5">This email cannot be changed</p>
              </div>

              {/* Name */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Full Name *
                </label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    required
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    placeholder="Enter your full name"
                    className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold focus:bg-white focus:border-emerald-600 focus:outline-none transition-colors"
                  />
                </div>
              </div>

              {/* Phone Number */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Phone Number *
                </label>
                <div className="relative">
                  <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="tel"
                    required
                    value={regPhone}
                    onChange={(e) => setRegPhone(e.target.value)}
                    placeholder="Enter your phone number"
                    className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold focus:bg-white focus:border-emerald-600 focus:outline-none transition-colors"
                  />
                </div>
              </div>

              {/* DOB */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Date of Birth (DOB) *
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="date"
                    required
                    value={regDob}
                    onChange={(e) => setRegDob(e.target.value)}
                    className="w-full pl-10 pr-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold focus:bg-white focus:border-emerald-600 focus:outline-none transition-colors"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Create Password *
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type={showRegPassword ? 'text' : 'password'}
                    required
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    placeholder="Create a strong password"
                    className="w-full pl-10 pr-10 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold focus:bg-white focus:border-emerald-600 focus:outline-none transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowRegPassword(!showRegPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
                  >
                    {showRegPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Confirm Password *
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type={showRegConfirmPassword ? 'text' : 'password'}
                    required
                    value={regConfirmPassword}
                    onChange={(e) => setRegConfirmPassword(e.target.value)}
                    placeholder="Confirm your password"
                    className="w-full pl-10 pr-10 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold focus:bg-white focus:border-emerald-600 focus:outline-none transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowRegConfirmPassword(!showRegConfirmPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
                  >
                    {showRegConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Password Criteria */}
              <div className="p-3 bg-gray-50 rounded-xl border border-gray-200 text-[11px] space-y-1.5">
                <div className="font-bold text-gray-700">Strong Password Criteria:</div>
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

              {/* Submit */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full mt-2 py-3 bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white font-extrabold text-xs rounded-xl shadow-md shadow-emerald-600/20 flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Creating Account...</span>
                  </>
                ) : (
                  <>
                    <span>Create Account</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          ) : (
            /* ─── LOGIN FORM ─── */
            <>
              <form onSubmit={handleLogin} className="space-y-4">
                {/* Email */}
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

                {/* Password */}
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

                {/* Sign In Button */}
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
              </form>

              {/* Divider */}
              <div className="flex items-center my-3">
                <div className="flex-1 border-t border-gray-200"></div>
                <span className="px-3 text-[11px] text-gray-400 font-semibold uppercase tracking-wider">
                  Don't have an account?
                </span>
                <div className="flex-1 border-t border-gray-200"></div>
              </div>

              {/* Continue with Google */}
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
                <span>Continue with Google to Create Account</span>
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
