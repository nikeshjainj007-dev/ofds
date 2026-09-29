import React, { useState, useRef, useEffect } from 'react';
import {
  X,
  Mail,
  User,
  Phone,
  Calendar,
  GraduationCap,
  Briefcase,
  Hash,
  Loader2,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  RefreshCw,
  CheckCircle2,
  MessageSquare,
  Building
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { CAMPUS_PICKUP_ZONES } from '../types';

export const AuthModal: React.FC = () => {
  const {
    isAuthModalOpen,
    closeAuthModal,
    sendOtp,
    verifyOtp,
    signInWithGoogle,
    generatedOtpCode,
  } = useAuth();
  const { showToast } = useToast();

  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [step, setStep] = useState<1 | 2>(1); // 1: Details, 2: OTP Verification
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  // Form State
  const [role, setRole] = useState<'Student' | 'Teacher'>('Student');
  const [identifierType, setIdentifierType] = useState<'email' | 'phone'>('email');
  const [identifier, setIdentifier] = useState('');
  const [fullName, setFullName] = useState('');
  const [usn, setUsn] = useState('');
  const [dob, setDob] = useState('2003-05-15');
  const [pickupZone, setPickupZone] = useState<string>(CAMPUS_PICKUP_ZONES[8]); // 4th Floor Wing A default
  const [receivedOtpDisplay, setReceivedOtpDisplay] = useState<string>('');

  // 6-digit OTP boxes
  const [otpDigits, setOtpDigits] = useState(['', '', '', '', '', '']);
  const [resendTimer, setResendTimer] = useState(30);

  const otpInputsRef = useRef<(HTMLInputElement | null)[]>([]);

  // Reset state on open
  useEffect(() => {
    if (isAuthModalOpen) {
      setStep(1);
      setAuthMode('login');
      setIdentifier('');
      setFullName('');
      setUsn(role === 'Student' ? '1RV21CS042' : 'FAC-ENG-102');
      setOtpDigits(['', '', '', '', '', '']);
      setIsLoading(false);
      setIsGoogleLoading(false);
    }
  }, [isAuthModalOpen]);

  // Resend countdown
  useEffect(() => {
    let interval: any;
    if (step === 2 && resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [step, resendTimer]);

  if (!isAuthModalOpen) return null;

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanId = identifier.trim();

    if (!cleanId) {
      showToast(`Please enter your college ${identifierType}`, 'error');
      return;
    }

    if (identifierType === 'email' && !cleanId.includes('@')) {
      showToast('Please enter a valid email address (e.g. name@campus.edu)', 'error');
      return;
    }

    if (identifierType === 'phone' && cleanId.replace(/\D/g, '').length < 10) {
      showToast('Please enter a valid 10-digit mobile number', 'error');
      return;
    }

    if (authMode === 'signup' && !fullName.trim()) {
      showToast('Please enter your full name', 'error');
      return;
    }

    if (!usn.trim()) {
      showToast(role === 'Student' ? 'Please enter your USN / Roll No' : 'Please enter your Faculty Employee ID', 'error');
      return;
    }

    setIsLoading(true);
    try {
      const res = await sendOtp(cleanId, identifierType === 'phone');
      setIsLoading(false);

      if (res.success) {
        setStep(2);
        setReceivedOtpDisplay(res.displayOtpMessage);
        setResendTimer(30);

        // Notify user with prompt's exact OTP format: Your otp is "#otpcode"
        showToast(
          res.displayOtpMessage,
          'success',
          `OTP Sent via ${identifierType === 'phone' ? 'SMS' : 'Email'}`
        );

        setTimeout(() => {
          otpInputsRef.current[0]?.focus();
        }, 150);
      } else {
        showToast('Unable to send verification code. Please retry.', 'error');
      }
    } catch (err: any) {
      setIsLoading(false);
      showToast(err?.message || 'Error sending code', 'error');
    }
  };

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

  const handleAutoFillOtp = () => {
    const code = generatedOtpCode || '489201';
    const digits = code.split('').slice(0, 6);
    while (digits.length < 6) digits.push('0');
    setOtpDigits(digits);
    showToast(`Auto-filled code: ${code}`, 'info');
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    const enteredCode = otpDigits.join('');

    if (enteredCode.length !== 6) {
      showToast('Please enter the complete 6-digit OTP code', 'error');
      return;
    }

    setIsLoading(true);
    try {
      const result = await verifyOtp(identifier, enteredCode, {
        name: fullName || identifier.split('@')[0],
        role,
        usn: usn.trim(),
        dob,
        pickupZone,
        phone: identifierType === 'phone' ? identifier : undefined,
        email: identifierType === 'email' ? identifier : undefined,
      });

      setIsLoading(false);

      if (result.success) {
        showToast(result.message, 'success', 'Login Successful');
        closeAuthModal();
      } else {
        showToast(result.message, 'error', 'Verification Failed');
      }
    } catch (err: any) {
      setIsLoading(false);
      showToast(err?.message || 'Verification error', 'error');
    }
  };

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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden border border-emerald-100 max-h-[92vh] flex flex-col">
        {/* Header Bar */}
        <div className="bg-gradient-to-r from-emerald-800 to-green-700 p-6 text-white relative flex-shrink-0">
          <button
            onClick={closeAuthModal}
            className="absolute top-5 right-5 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-2 mb-2">
            <span className="bg-emerald-500/30 text-emerald-200 text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full border border-emerald-400/20">
              Campus Canteen Auth • Clerk & Supabase
            </span>
          </div>

          <h2 className="text-xl sm:text-2xl font-black tracking-tight">
            {step === 1
              ? authMode === 'login'
                ? 'Welcome Back, Campus Scholar'
                : 'Join Campus Canteen Delivery'
              : 'Enter Verification OTP'}
          </h2>
          <p className="text-xs text-emerald-100/90 mt-1">
            {step === 1
              ? 'Student & Faculty Portal: Order breakfast & lunch with ₹0 delivery charges'
              : `Enter the 6-digit code received via SMS/Email to verify your identity`}
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
                  Student / Teacher Log In
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
                  New Registration
                </button>
              </div>

              {/* Role Selection: Student vs Teacher */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5">
                  Select Your College Role:
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setRole('Student');
                      if (usn.startsWith('FAC-')) setUsn('1RV21CS042');
                    }}
                    className={`flex items-center gap-2.5 p-3 rounded-2xl border text-left transition-all ${
                      role === 'Student'
                        ? 'border-emerald-600 bg-emerald-50 text-emerald-900 ring-2 ring-emerald-500/20'
                        : 'border-gray-200 hover:border-gray-300 text-gray-700'
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold ${
                      role === 'Student' ? 'bg-emerald-600 text-white' : 'bg-gray-100 text-gray-600'
                    }`}>
                      <GraduationCap className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-black">Student</div>
                      <div className="text-[10px] text-gray-500">Using Personal USN</div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setRole('Teacher');
                      if (!usn.startsWith('FAC-')) setUsn('FAC-ENG-102');
                    }}
                    className={`flex items-center gap-2.5 p-3 rounded-2xl border text-left transition-all ${
                      role === 'Teacher'
                        ? 'border-emerald-600 bg-emerald-50 text-emerald-900 ring-2 ring-emerald-500/20'
                        : 'border-gray-200 hover:border-gray-300 text-gray-700'
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold ${
                      role === 'Teacher' ? 'bg-emerald-600 text-white' : 'bg-gray-100 text-gray-600'
                    }`}>
                      <Briefcase className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-black">Teacher / Faculty</div>
                      <div className="text-[10px] text-gray-500">Using Faculty ID</div>
                    </div>
                  </button>
                </div>
              </div>

              {/* Continue with Google (Clerk / OAuth) */}
              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={isGoogleLoading}
                className="w-full py-2.5 px-4 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 font-bold text-xs rounded-xl shadow-sm flex items-center justify-center gap-3 transition-colors"
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
                  Or Sign In with OTP
                </span>
                <div className="flex-1 border-t border-gray-200"></div>
              </div>

              {/* Details Form */}
              <form onSubmit={handleSendOtp} className="space-y-4">
                {/* Full Name (Sign Up only) */}
                {authMode === 'signup' && (
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">
                      Full Name *
                    </label>
                    <div className="relative">
                      <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="text"
                        required
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="e.g. Aditya Varma"
                        className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold focus:bg-white focus:border-emerald-600 focus:outline-none transition-colors"
                      />
                    </div>
                  </div>
                )}

                {/* Personal ID / USN */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1 flex items-center justify-between">
                    <span>{role === 'Student' ? 'University Seat Number (USN) *' : 'Faculty Personal ID *'}</span>
                    <span className="text-[10px] text-emerald-600 font-extrabold uppercase">Personal ID</span>
                  </label>
                  <div className="relative">
                    <Hash className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      required
                      value={usn}
                      onChange={(e) => setUsn(e.target.value.toUpperCase())}
                      placeholder={role === 'Student' ? 'e.g. 1RV21CS042' : 'e.g. FAC-ENG-102'}
                      className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold focus:bg-white focus:border-emerald-600 focus:outline-none uppercase tracking-wider transition-colors"
                    />
                  </div>
                </div>

                {/* DOB & Auth Identifier Toggle */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">
                      Date of Birth (DOB) *
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

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-xs font-bold text-gray-700">
                        {identifierType === 'email' ? 'College Email *' : 'Mobile (SMS) *'}
                      </label>
                      <button
                        type="button"
                        onClick={() => {
                          setIdentifierType(identifierType === 'email' ? 'phone' : 'email');
                          setIdentifier('');
                        }}
                        className="text-[10px] font-bold text-emerald-600 hover:text-emerald-700 underline"
                      >
                        Use {identifierType === 'email' ? 'Phone' : 'Email'}
                      </button>
                    </div>
                    <div className="relative">
                      {identifierType === 'email' ? (
                        <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      ) : (
                        <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      )}
                      <input
                        type={identifierType === 'email' ? 'email' : 'tel'}
                        required
                        value={identifier}
                        onChange={(e) => setIdentifier(e.target.value)}
                        placeholder={identifierType === 'email' ? 'name@campus.edu' : '9845012345'}
                        className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold focus:bg-white focus:border-emerald-600 focus:outline-none transition-colors"
                      />
                    </div>
                  </div>
                </div>

                {/* Pickup Zone (Ground Floor to 9th Floor in A/B wing) */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1 flex items-center justify-between">
                    <span>Default Pickup Zone (Ground to 9th Floor, Wings A & B) *</span>
                    <span className="text-[10px] text-gray-500">Free Delivery</span>
                  </label>
                  <div className="relative">
                    <Building className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                    <select
                      value={pickupZone}
                      onChange={(e) => setPickupZone(e.target.value)}
                      className="w-full pl-10 pr-8 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold focus:bg-white focus:border-emerald-600 focus:outline-none transition-colors appearance-none cursor-pointer"
                    >
                      {CAMPUS_PICKUP_ZONES.map((zone) => (
                        <option key={zone} value={zone}>
                          {zone}
                        </option>
                      ))}
                    </select>
                    <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400 text-xs">
                      ▼
                    </div>
                  </div>
                  <p className="text-[10px] text-gray-500 mt-1">
                    Canteen runners deliver hot sealed meals directly to this floor pickup point.
                  </p>
                </div>

                {/* Submit button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full mt-2 py-3 bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white font-extrabold text-xs rounded-xl shadow-md shadow-emerald-600/20 flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Sending Verification OTP...</span>
                    </>
                  ) : (
                    <>
                      <span>Get Verification Code</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            </>
          ) : (
            /* STEP 2: OTP VERIFICATION */
            <form onSubmit={handleVerifyOtp} className="space-y-5">
              {/* Prompt's specified OTP Simulation Banner */}
              <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 text-emerald-950 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-black text-emerald-800">
                    <MessageSquare className="w-4 h-4 text-emerald-600" />
                    <span>Received in {identifierType === 'phone' ? 'SMS' : 'Email'}:</span>
                  </div>
                  <button
                    type="button"
                    onClick={handleAutoFillOtp}
                    className="text-[11px] font-black text-emerald-700 hover:text-emerald-900 bg-emerald-100 hover:bg-emerald-200 px-2.5 py-1 rounded-lg transition-colors flex items-center gap-1"
                  >
                    <Sparkles className="w-3 h-3 text-amber-500" />
                    <span>Auto-Fill Code</span>
                  </button>
                </div>
                <div className="p-2.5 bg-white rounded-xl border border-emerald-100 font-mono font-bold text-xs text-gray-800 tracking-wide text-center">
                  {receivedOtpDisplay || `Your otp is "${generatedOtpCode || '489201'}"`}
                </div>
                <p className="text-[11px] text-gray-500 text-center">
                  Sent to <strong className="text-gray-800">{identifier}</strong> ({role}: {usn})
                </p>
              </div>

              {/* 6 Digit Inputs */}
              <div>
                <label className="block text-center text-xs font-bold text-gray-700 mb-3">
                  Enter 6-Digit Verification Code
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

              {/* Resend OTP */}
              <div className="text-center">
                {resendTimer > 0 ? (
                  <p className="text-xs text-gray-400">
                    Resend code in <span className="font-bold text-gray-700">{resendTimer}s</span>
                  </p>
                ) : (
                  <button
                    type="button"
                    onClick={(e) => handleSendOtp(e)}
                    className="text-xs font-bold text-emerald-600 hover:text-emerald-800 transition-colors inline-flex items-center gap-1"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    Resend Verification Code
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
                      <span>Verifying...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Verify & Continue Ordering</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="w-full py-2 text-xs font-bold text-gray-500 hover:text-gray-800 transition-colors"
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
            <span>Campus Verified Auth</span>
          </div>
          <div>Clerk • Razorpay • Pure Veg Guarantee</div>
        </div>
      </div>
    </div>
  );
};
