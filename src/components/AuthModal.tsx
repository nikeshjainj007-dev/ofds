import React, { useState, useRef, useEffect } from 'react';
import {
  X,
  Mail,
  User,
  Calendar,
  Loader2,
  ArrowRight,
  ShieldCheck,
  RefreshCw,
  CheckCircle2,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { CAMPUS_PICKUP_ZONES } from '../types';

export const AuthModal: React.FC = () => {
  const {
    isAuthModalOpen,
    authModalMode,
    closeAuthModal,
    sendOtp,
    verifyOtp,
    signInWithGoogle,
    needsDobFallback,
    dobFallbackUser,
    submitDobFallback,
    closeDobFallback,
  } = useAuth();
  const { showToast } = useToast();

  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [step, setStep] = useState<1 | 2>(1); // 1: Details form, 2: Strictly controlled OTP Verification
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  // Form State (Feature 1: Name, DOB, Email ID)
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [dob, setDob] = useState('2003-05-15');
  const role: 'Student' | 'Teacher' = 'Student';
  const pickupZone = CAMPUS_PICKUP_ZONES[8];

  // Fallback UI State for Google OAuth DOB
  const [fallbackDob, setFallbackDob] = useState('2003-05-15');
  const [isFallbackSubmitting, setIsFallbackSubmitting] = useState(false);

  // 6-digit OTP inputs
  const [otpDigits, setOtpDigits] = useState(['', '', '', '', '', '']);
  const [resendTimer, setResendTimer] = useState(30);
  const otpInputsRef = useRef<(HTMLInputElement | null)[]>([]);

  // Synchronize initial mode when opened without cascading effect renders
  const [prevOpenState, setPrevOpenState] = useState(false);
  if (isAuthModalOpen && !prevOpenState) {
    setPrevOpenState(true);
    setAuthMode(authModalMode);
    setStep(1);
    setOtpDigits(['', '', '', '', '', '']);
  } else if (!isAuthModalOpen && prevOpenState) {
    setPrevOpenState(false);
  }

  // Resend countdown timer
  useEffect(() => {
    if (step !== 2 || resendTimer <= 0) return;
    const interval = setInterval(() => {
      setResendTimer((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [step, resendTimer]);

  const handleClose = () => {
    closeAuthModal();
    setStep(1);
    setOtpDigits(['', '', '', '', '', '']);
    setIsLoading(false);
    setIsGoogleLoading(false);
  };

  // 1. Submit Form & Dispatch Twilio Email OTP
  const handleSendOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const cleanEmail = email.trim().toLowerCase();

    if (!cleanEmail || !cleanEmail.includes('@')) {
      showToast('Please enter a valid email address (e.g. name@campus.edu)', 'error');
      return;
    }

    if (authMode === 'signup') {
      if (!fullName.trim()) {
        showToast('Please enter your full name', 'error');
        return;
      }
      if (!dob) {
        showToast('Please select your Date of Birth (DOB)', 'error');
        return;
      }
    }

    setIsLoading(true);
    try {
      const res = await sendOtp(cleanEmail);
      setIsLoading(false);

      if (res.success) {
        setStep(2);
        setResendTimer(30);
        showToast(
          res.message || `Verification code sent to ${cleanEmail}. Check inbox & spam.`,
          'success',
          'Email Code Dispatched'
        );
        setTimeout(() => {
          otpInputsRef.current[0]?.focus();
        }, 150);
      } else {
        showToast(res.message || 'Unable to send verification code. Please retry.', 'error');
      }
    } catch (err: any) {
      setIsLoading(false);
      showToast(err?.message || 'Error sending code', 'error');
    }
  };

  // OTP Input Navigation
  const handleOtpChange = (index: number, val: string) => {
    const digit = val.replace(/\D/g, '').slice(-1);
    const newDigits = [...otpDigits];
    newDigits[index] = digit;
    setOtpDigits(newDigits);

    if (digit && index < 5) {
      otpInputsRef.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      otpInputsRef.current[index - 1]?.focus();
    }
  };

  // 2. Verify OTP & Process Workflow Requirements
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    const enteredCode = otpDigits.join('');

    if (enteredCode.length < 5 || enteredCode.length > 6) {
      showToast('Please enter the verification code received in your email', 'error');
      return;
    }

    setIsLoading(true);
    try {
      const cleanEmail = email.trim().toLowerCase();
      const result = await verifyOtp(
        cleanEmail,
        enteredCode,
        {
          name: fullName.trim() || cleanEmail.split('@')[0],
          dob,
          role,
          pickupZone,
        },
        authMode
      );

      setIsLoading(false);

      if (result.success) {
        if (result.requiresRedirectToLogin || authMode === 'signup') {
          // Feature 1 Requirement: "save their Name, DOB, and Email to the database, and immediately redirect them to the Login page."
          showToast(
            'Registration successful! Name, DOB, and Email saved. Please log in with your email.',
            'success',
            'Redirecting to Login'
          );
          setAuthMode('login');
          setStep(1);
          setOtpDigits(['', '', '', '', '', '']);
        } else {
          // Feature 2: Returning user logged in
          showToast(result.message, 'success', 'Login Successful');
          handleClose();
        }
      } else {
        showToast(result.message || 'Invalid or expired OTP code', 'error', 'Verification Failed');
      }
    } catch (err: any) {
      setIsLoading(false);
      showToast(err?.message || 'Verification error', 'error');
    }
  };

  // 3. Feature 3: Continue with Google (via Supabase)
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

  // 4. Feature 3 Fallback UI: DOB Collection Workflow
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
              Google OAuth Profile Completion
            </span>
            <h2 className="text-xl font-black mt-2">Date of Birth Required</h2>
            <p className="text-xs text-emerald-100/90 mt-1">
              Welcome, <strong>{dobFallbackUser.name}</strong>! Google does not share your Date of Birth by default. Please provide it to complete setup.
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
              <p className="text-[11px] text-gray-500 mt-1.5">
                Your exact Google name and email (<strong>{dobFallbackUser.email}</strong>) will be securely saved to the database.
              </p>
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
            className="absolute top-5 right-5 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-2 mb-2">
            <span className="bg-emerald-500/30 text-emerald-200 text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full border border-emerald-400/20">
              Campus Security Portal • Twilio & Supabase
            </span>
          </div>

          <h2 className="text-xl sm:text-2xl font-black tracking-tight">
            {step === 1
              ? authMode === 'login'
                ? 'Welcome Back, Sign In'
                : 'Create New Account'
              : 'Enter Verification Code'}
          </h2>
          <p className="text-xs text-emerald-100/90 mt-1">
            {step === 1
              ? authMode === 'login'
                ? 'Enter your registered email to receive an email OTP, or Continue with Google'
                : 'Fill in your Name, Date of Birth, and Email to register securely'
              : `A 6-digit code has been delivered to ${email}. Check inbox & spam.`}
          </p>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5">
          {step === 1 ? (
            <>
              {/* Login / Sign Up Tabs */}
              <div className="flex bg-gray-100 p-1 rounded-2xl">
                <button
                  type="button"
                  onClick={() => setAuthMode('login')}
                  className={`flex-1 py-2 text-xs font-black rounded-xl transition-all ${
                    authMode === 'login'
                      ? 'bg-white text-emerald-900 shadow-sm'
                      : 'text-gray-500 hover:text-gray-800'
                  }`}
                >
                  User Login (Returning Users)
                </button>
                <button
                  type="button"
                  onClick={() => setAuthMode('signup')}
                  className={`flex-1 py-2 text-xs font-black rounded-xl transition-all ${
                    authMode === 'signup'
                      ? 'bg-white text-emerald-900 shadow-sm'
                      : 'text-gray-500 hover:text-gray-800'
                  }`}
                >
                  User Signup (New Users)
                </button>
              </div>

              {/* Feature 3: Continue with Google Button on both Login and Signup pages */}
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

              {/* Form Fields */}
              <form onSubmit={handleSendOtp} className="space-y-4">
                {/* Feature 1: Name Field for New Users Signup */}
                {authMode === 'signup' && (
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
                )}

                {/* Feature 1: DOB (Date of Birth) Field for New Users Signup */}
                {authMode === 'signup' && (
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
                )}

                {/* Email ID Field (Required on both Signup & Login) */}
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

                {/* Submit button: triggers Twilio API email OTP */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full mt-2 py-3 bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white font-extrabold text-xs rounded-xl shadow-md shadow-emerald-600/20 flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Sending Email Code...</span>
                    </>
                  ) : (
                    <>
                      <span>{authMode === 'signup' ? 'Register & Send Code' : 'Send Login Code'}</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            </>
          ) : (
            /* STEP 2: STRICTLY CONTROLLED OTP VERIFICATION MODAL */
            <form onSubmit={handleVerifyOtp} className="space-y-5">
              <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 text-emerald-950 text-center space-y-1.5">
                <div className="text-xs font-black text-emerald-900">
                  Verification Email Dispatched via Twilio
                </div>
                <p className="text-xs text-gray-700">
                  Please check your inbox & <strong>Spam / Junk</strong> folder for <strong className="text-emerald-900">{email}</strong>.
                </p>
                <div className="text-[11px] text-emerald-800 bg-white/80 p-2 rounded-xl border border-emerald-200/60 leading-normal">
                  Look for an email from <strong>Twilio / Trial with Twilio</strong> (Subject: <em>Your Verification Code</em> or <em>Your Order Has Been Confirmed!</em> with code #12345).
                </div>
              </div>

              {/* 6 Digit Inputs */}
              <div>
                <label className="block text-center text-xs font-bold text-gray-700 mb-3">
                  Enter 6-Digit Code
                </label>
                <div className="flex justify-center gap-2 sm:gap-3">
                  {otpDigits.map((digit, index) => (
                    <input
                      key={index}
                      ref={(el) => { otpInputsRef.current[index] = el; }}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOtpChange(index, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(index, e)}
                      className="w-11 h-12 text-center text-lg font-black bg-gray-50 border-2 border-gray-200 rounded-xl focus:border-emerald-600 focus:bg-white focus:outline-none transition-all shadow-sm"
                    />
                  ))}
                </div>
              </div>

              {/* Resend Countdown */}
              <div className="text-center">
                {resendTimer > 0 ? (
                  <p className="text-xs text-gray-400">
                    Resend code in <span className="font-bold text-gray-700">{resendTimer}s</span>
                  </p>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleSendOtp()}
                    className="text-xs font-bold text-emerald-600 hover:text-emerald-800 transition-colors inline-flex items-center gap-1 cursor-pointer"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    Resend Code
                  </button>
                )}
              </div>

              {/* Verify Button */}
              <div className="space-y-2">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white font-extrabold text-xs rounded-xl shadow-md shadow-emerald-600/20 flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Verifying Code...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      <span>{authMode === 'signup' ? 'Verify & Complete Registration' : 'Verify & Log In'}</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="w-full py-2 text-xs font-bold text-gray-500 hover:text-gray-800 transition-colors cursor-pointer"
                >
                  ← Back to Details
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Footer Guarantee */}
        <div className="bg-gray-50 p-4 border-t border-gray-100 flex items-center justify-between text-[11px] text-gray-500 flex-shrink-0">
          <div className="flex items-center gap-1.5 text-emerald-700 font-bold">
            <ShieldCheck className="w-4 h-4" />
            <span>High-Security Twilio & Supabase Auth</span>
          </div>
          <div>Verified Portal</div>
        </div>
      </div>
    </div>
  );
};
