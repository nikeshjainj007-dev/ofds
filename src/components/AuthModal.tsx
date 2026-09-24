import React, { useState, useRef, useEffect } from 'react';
import {
  X,
  Mail,
  User,
  Phone,
  Calendar,
  MapPin,
  Home,
  Hash,
  Loader2,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  RefreshCw,
  Lock,
} from 'lucide-react';
import { useAuth, type UserProfile } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export const AuthModal: React.FC = () => {
  const {
    isAuthModalOpen,
    closeAuthModal,
    sendOtp,
    verifyOtp,
    signInWithGoogle,
  } = useAuth();
  const { showToast } = useToast();

  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [step, setStep] = useState<1 | 2>(1); // State 1: Form, State 2: Verify OTP
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  // Login form state
  const [loginEmail, setLoginEmail] = useState('');

  // Sign Up form state
  const [signUpData, setSignUpData] = useState({
    name: '',
    email: '',
    phone: '',
    dob: '',
    place: '',
    pincode: '',
    address: '',
  });

  // Active email undergoing verification
  const [activeEmail, setActiveEmail] = useState('');
  const [pendingProfile, setPendingProfile] = useState<Partial<UserProfile> | null>(null);

  // 6-digit OTP boxes
  const [otpDigits, setOtpDigits] = useState(['', '', '', '', '', '']);
  const [resendTimer, setResendTimer] = useState(30);
  const [isResendActive, setIsResendActive] = useState(false);

  const otpInputsRef = useRef<(HTMLInputElement | null)[]>([]);

  // Reset modal state on open
  useEffect(() => {
    if (isAuthModalOpen) {
      setStep(1);
      setAuthMode('login');
      setLoginEmail('');
      setSignUpData({
        name: '',
        email: '',
        phone: '',
        dob: '',
        place: '',
        pincode: '',
        address: '',
      });
      setOtpDigits(['', '', '', '', '', '']);
      setIsLoading(false);
      setIsGoogleLoading(false);
    }
  }, [isAuthModalOpen]);

  // Resend countdown timer
  useEffect(() => {
    let interval: any;
    if (step === 2 && resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
    } else if (resendTimer === 0) {
      setIsResendActive(true);
    }
    return () => clearInterval(interval);
  }, [step, resendTimer]);

  if (!isAuthModalOpen) return null;

  // Handle Login Send OTP
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = loginEmail.trim();
    if (!cleanEmail || !cleanEmail.includes('@')) {
      showToast('Please enter a valid email address', 'error');
      return;
    }

    setIsLoading(true);
    try {
      const result = await sendOtp(cleanEmail);
      if (result.success) {
        setActiveEmail(cleanEmail);
        setPendingProfile({ email: cleanEmail });
        setStep(2);
        setResendTimer(30);
        setIsResendActive(false);
        showToast(result.message, 'success', 'Verification Code Sent');
        setTimeout(() => {
          otpInputsRef.current[0]?.focus();
        }, 150);
      } else {
        showToast(result.message, 'error', 'Unable to send code');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Sign Up Submit & Send OTP
  const handleSignUpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!signUpData.name.trim()) {
      showToast('Please enter your full name', 'error');
      return;
    }
    if (!signUpData.email.trim() || !signUpData.email.includes('@')) {
      showToast('Please enter a valid email address', 'error');
      return;
    }
    if (!signUpData.phone.trim() || signUpData.phone.replace(/\D/g, '').length < 10) {
      showToast('Please enter a valid 10-digit mobile number', 'error');
      return;
    }

    setIsLoading(true);
    try {
      const cleanEmail = signUpData.email.trim();
      const result = await sendOtp(cleanEmail);
      if (result.success) {
        setActiveEmail(cleanEmail);
        setPendingProfile({
          name: signUpData.name.trim(),
          email: cleanEmail,
          phone: signUpData.phone.trim(),
          dob: signUpData.dob,
          place: signUpData.place.trim(),
          pincode: signUpData.pincode.trim(),
          address: signUpData.address.trim(),
        });
        setStep(2);
        setResendTimer(30);
        setIsResendActive(false);
        showToast(result.message, 'success', 'Verification Code Sent');
        setTimeout(() => {
          otpInputsRef.current[0]?.focus();
        }, 150);
      } else {
        showToast(result.message, 'error', 'Unable to send code');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Handle OTP digit changes
  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;

    const newDigits = [...otpDigits];
    newDigits[index] = value.slice(-1);
    setOtpDigits(newDigits);

    // Auto-advance to next input
    if (value && index < 5) {
      otpInputsRef.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      otpInputsRef.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasteData = e.clipboardData.getData('text').trim().replace(/\D/g, '');
    if (pasteData.length >= 5) {
      const digits = pasteData.slice(0, 6).split('');
      while (digits.length < 6) digits.push('');
      setOtpDigits(digits);
      otpInputsRef.current[Math.min(digits.length - 1, 5)]?.focus();
    }
  };

  // Handle Verify OTP
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = otpDigits.join('').trim();
    if (token.length < 5) {
      showToast('Please enter the verification code sent to your email', 'error');
      return;
    }

    setIsLoading(true);
    try {
      const result = await verifyOtp(activeEmail, token, pendingProfile || undefined);
      if (result.success) {
        showToast(result.message, 'success', 'Verification Complete');
        closeAuthModal();
      } else {
        showToast(result.message, 'error', 'Invalid Code');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Resend OTP
  const handleResend = async () => {
    if (!isResendActive || !activeEmail) return;
    setIsLoading(true);
    try {
      const result = await sendOtp(activeEmail);
      if (result.success) {
        showToast(result.message, 'success', 'Code Resent');
        setResendTimer(30);
        setIsResendActive(false);
      } else {
        showToast(result.message, 'error');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Google OAuth
  const handleGoogleSignIn = async () => {
    setIsGoogleLoading(true);
    try {
      const result = await signInWithGoogle();
      if (!result.success) {
        showToast(result.message, 'info', 'Google Sign-In');
      }
    } finally {
      setIsGoogleLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-100 animate-in zoom-in-95 duration-200 max-h-[92vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Decorative Banner */}
        <div className="bg-gradient-to-r from-emerald-700 via-emerald-600 to-teal-700 px-6 py-5 text-white relative">
          <button
            onClick={closeAuthModal}
            className="absolute top-4 right-4 p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-emerald-100 text-xs font-semibold mb-2">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>100% Pure Veg & Satvik Delivery</span>
          </div>

          <h2 className="text-xl font-bold tracking-tight text-white">
            {step === 1
              ? authMode === 'login'
                ? 'Welcome Back to SatvikBite'
                : 'Create Your SatvikBite Account'
              : 'Verify Your Email'}
          </h2>
          <p className="text-xs text-emerald-100/90 mt-1">
            {step === 1
              ? authMode === 'login'
                ? 'Sign in to access your orders, saved addresses, and speedy checkout.'
                : 'Register to enjoy authentic pure veg cuisines and personalized thalis.'
              : `We sent a 6-digit verification code to ${activeEmail}`}
          </p>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-6 overflow-y-auto flex-1">
          {step === 1 ? (
            /* ================= STEP 1: LOGIN OR SIGN UP ================= */
            <div>
              {/* Tab Selector: Login vs Sign Up */}
              <div className="flex bg-gray-100 p-1 rounded-xl mb-5">
                <button
                  type="button"
                  onClick={() => setAuthMode('login')}
                  className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                    authMode === 'login'
                      ? 'bg-white text-emerald-800 shadow-sm'
                      : 'text-gray-500 hover:text-gray-900'
                  }`}
                >
                  Log In
                </button>
                <button
                  type="button"
                  onClick={() => setAuthMode('signup')}
                  className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                    authMode === 'signup'
                      ? 'bg-white text-emerald-800 shadow-sm'
                      : 'text-gray-500 hover:text-gray-900'
                  }`}
                >
                  Sign Up (New Customer)
                </button>
              </div>

              {/* Continue with Google (Prominent at top) */}
              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={isGoogleLoading}
                className="w-full flex items-center justify-center gap-3 py-2.5 px-4 bg-white hover:bg-gray-50 text-gray-700 text-xs font-bold rounded-xl border border-gray-300 shadow-sm transition-all hover:border-gray-400 mb-4"
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

              <div className="relative flex items-center justify-center my-4">
                <div className="border-t border-gray-200 w-full"></div>
                <span className="bg-white px-3 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
                  Or with email
                </span>
              </div>

              {/* TAB 1: LOGIN FORM */}
              {authMode === 'login' && (
                <form onSubmit={handleLoginSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1.5">
                      Email Address
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                        <Mail className="w-4 h-4" />
                      </div>
                      <input
                        type="email"
                        value={loginEmail}
                        onChange={(e) => setLoginEmail(e.target.value)}
                        placeholder="you@gmail.com"
                        required
                        className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading || !loginEmail}
                    className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-md shadow-emerald-600/20 transition-all flex items-center justify-center gap-2 mt-2"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Sending Verification Email...</span>
                      </>
                    ) : (
                      <>
                        <span>Send Email OTP</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </form>
              )}

              {/* TAB 2: SIGN UP FORM */}
              {authMode === 'signup' && (
                <form onSubmit={handleSignUpSubmit} className="space-y-3.5">
                  {/* Full Name */}
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">
                      Full Name <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                        <User className="w-4 h-4" />
                      </div>
                      <input
                        type="text"
                        value={signUpData.name}
                        onChange={(e) =>
                          setSignUpData({ ...signUpData, name: e.target.value })
                        }
                        placeholder="e.g. Nikesh Jain"
                        required
                        className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all"
                      />
                    </div>
                  </div>

                  {/* Email & Phone grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">
                        Email Address <span className="text-rose-500">*</span>
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                          <Mail className="w-4 h-4" />
                        </div>
                        <input
                          type="email"
                          value={signUpData.email}
                          onChange={(e) =>
                            setSignUpData({ ...signUpData, email: e.target.value })
                          }
                          placeholder="you@gmail.com"
                          required
                          className="w-full pl-10 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">
                        Mobile Number <span className="text-rose-500">*</span>
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                          <Phone className="w-4 h-4" />
                        </div>
                        <input
                          type="tel"
                          value={signUpData.phone}
                          onChange={(e) =>
                            setSignUpData({
                              ...signUpData,
                              phone: e.target.value.replace(/[^\d+]/g, ''),
                            })
                          }
                          placeholder="7904037699"
                          required
                          className="w-full pl-10 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Date of Birth & Place */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">
                        Date of Birth
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                          <Calendar className="w-4 h-4" />
                        </div>
                        <input
                          type="date"
                          value={signUpData.dob}
                          onChange={(e) =>
                            setSignUpData({ ...signUpData, dob: e.target.value })
                          }
                          className="w-full pl-10 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">
                        Place / City
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                          <MapPin className="w-4 h-4" />
                        </div>
                        <input
                          type="text"
                          value={signUpData.place}
                          onChange={(e) =>
                            setSignUpData({ ...signUpData, place: e.target.value })
                          }
                          placeholder="e.g. Bengaluru"
                          className="w-full pl-10 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Pincode & Delivery Address */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="sm:col-span-1">
                      <label className="block text-xs font-bold text-gray-700 mb-1">
                        Pincode
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                          <Hash className="w-4 h-4" />
                        </div>
                        <input
                          type="text"
                          maxLength={6}
                          value={signUpData.pincode}
                          onChange={(e) =>
                            setSignUpData({
                              ...signUpData,
                              pincode: e.target.value.replace(/\D/g, ''),
                            })
                          }
                          placeholder="560001"
                          className="w-full pl-9 pr-2 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all"
                        />
                      </div>
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-xs font-bold text-gray-700 mb-1">
                        Delivery Address
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                          <Home className="w-4 h-4" />
                        </div>
                        <input
                          type="text"
                          value={signUpData.address}
                          onChange={(e) =>
                            setSignUpData({ ...signUpData, address: e.target.value })
                          }
                          placeholder="Flat, building, street..."
                          className="w-full pl-10 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all"
                        />
                      </div>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={
                      isLoading ||
                      !signUpData.name ||
                      !signUpData.email ||
                      !signUpData.phone
                    }
                    className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-md shadow-emerald-600/20 transition-all flex items-center justify-center gap-2 mt-4"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Sending Verification Email...</span>
                      </>
                    ) : (
                      <>
                        <span>Create Account & Verify Email</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </form>
              )}

              {/* Security badge footer */}
              <div className="mt-5 pt-3 border-t border-gray-100 flex items-center justify-center gap-2 text-[11px] text-gray-400">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Twilio Email Delivery & Supabase Cloud Security</span>
              </div>
            </div>
          ) : (
            /* ================= STEP 2: VERIFY EMAIL OTP ================= */
            <div className="animate-in fade-in duration-150">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-sm font-bold text-gray-900">
                    Enter Verification Code
                  </h3>
                  <p className="text-xs text-gray-500">
                    Check the inbox of <strong className="text-emerald-700">{activeEmail}</strong>
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setStep(1);
                    setOtpDigits(['', '', '', '', '', '']);
                  }}
                  className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 underline"
                >
                  Change Email
                </button>
              </div>

              <form onSubmit={handleVerifyOtp} className="space-y-5">
                {/* 6-Digit OTP Inputs */}
                <div
                  className="flex items-center justify-between gap-2"
                  onPaste={handlePaste}
                >
                  {otpDigits.map((digit, index) => (
                    <input
                      key={index}
                      ref={(el) => {
                        otpInputsRef.current[index] = el;
                      }}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOtpChange(index, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(index, e)}
                      className="w-12 h-14 text-center text-xl font-bold bg-gray-50 border-2 border-gray-200 rounded-xl focus:border-emerald-600 focus:bg-white focus:outline-none transition-all shadow-sm"
                    />
                  ))}
                </div>

                <button
                  type="submit"
                  disabled={isLoading || otpDigits.join('').length < 5}
                  className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-md shadow-emerald-600/20 transition-all flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Verifying Code...</span>
                    </>
                  ) : (
                    <>
                      <span>Verify & Continue</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>

                {/* Resend OTP */}
                <div className="text-center pt-2">
                  {isResendActive ? (
                    <button
                      type="button"
                      onClick={handleResend}
                      disabled={isLoading}
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-600 hover:text-emerald-700"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      Resend Code to Email
                    </button>
                  ) : (
                    <p className="text-xs text-gray-400">
                      Didn’t receive email? Resend in{' '}
                      <span className="font-semibold text-gray-700">{resendTimer}s</span>
                    </p>
                  )}
                </div>

                <div className="bg-gray-50 border border-gray-200 rounded-xl p-3 text-[11px] text-gray-600 leading-relaxed text-center">
                  <div className="flex items-center justify-center gap-1.5 font-semibold text-gray-700">
                    <Lock className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Real-Time Email Verification</span>
                  </div>
                  <p className="text-[10px] text-gray-500 mt-1">
                    An automated verification code has been dispatched via Twilio to your email inbox. Please check your inbox and spam folder.
                  </p>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
