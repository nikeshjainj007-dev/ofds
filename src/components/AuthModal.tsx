import React, { useState, useRef, useEffect } from 'react';
import { X, Mail, Phone, Loader2, ArrowRight, ShieldCheck, Sparkles, RefreshCw } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export const AuthModal: React.FC = () => {
  const { isAuthModalOpen, closeAuthModal, sendOtp, verifyOtp, lastGeneratedOtp } = useAuth();
  const { showToast } = useToast();

  const [authMethod, setAuthMethod] = useState<'email' | 'phone'>('email');
  const [identifier, setIdentifier] = useState('');
  const [step, setStep] = useState<1 | 2>(1); // State 1: Send OTP, State 2: Verify OTP
  const [otpDigits, setOtpDigits] = useState(['', '', '', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(30);
  const [isResendActive, setIsResendActive] = useState(false);

  const otpInputsRef = useRef<(HTMLInputElement | null)[]>([]);

  // Reset modal state on open
  useEffect(() => {
    if (isAuthModalOpen) {
      setStep(1);
      setIdentifier('');
      setOtpDigits(['', '', '', '', '', '']);
      setIsLoading(false);
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

  // Handle Send OTP
  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier.trim()) {
      showToast(authMethod === 'email' ? 'Please enter a valid email address' : 'Please enter a valid phone number', 'error');
      return;
    }

    if (authMethod === 'email' && !identifier.includes('@')) {
      showToast('Please enter a valid email address', 'error');
      return;
    }

    if (authMethod === 'phone' && identifier.replace(/\D/g, '').length < 10) {
      showToast('Please enter a valid 10-digit mobile number', 'error');
      return;
    }

    setIsLoading(true);
    try {
      const result = await sendOtp(identifier, authMethod === 'phone');
      if (result.success) {
        showToast(result.message, 'success', 'OTP Sent');
        setStep(2);
        setResendTimer(30);
        setIsResendActive(false);
        // Focus first OTP field after state change
        setTimeout(() => {
          otpInputsRef.current[0]?.focus();
        }, 150);
      } else {
        showToast(result.message, 'error', 'Unable to send OTP');
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
    const pasteData = e.clipboardData.getData('text').trim();
    if (/^\d{6}$/.test(pasteData)) {
      const digits = pasteData.split('');
      setOtpDigits(digits);
      otpInputsRef.current[5]?.focus();
    }
  };

  const fillOtpCode = (code: string) => {
    const digits = code.slice(0, 6).split('');
    setOtpDigits(digits);
    setTimeout(() => {
      otpInputsRef.current[5]?.focus();
    }, 50);
  };

  // Handle Verify OTP
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = otpDigits.join('');
    if (token.length !== 6) {
      showToast('Please enter the complete 6-digit verification code', 'error');
      return;
    }

    setIsLoading(true);
    try {
      const result = await verifyOtp(identifier, token, authMethod === 'phone');
      if (result.success) {
        showToast(result.message, 'success', 'Login Successful');
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
    if (!isResendActive) return;
    setIsLoading(true);
    try {
      const result = await sendOtp(identifier, authMethod === 'phone');
      if (result.success) {
        showToast(result.message, 'success', 'OTP Resent');
        setResendTimer(30);
        setIsResendActive(false);
      } else {
        showToast(result.message, 'error');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-100 animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Decorative Banner */}
        <div className="bg-gradient-to-r from-emerald-600 via-emerald-700 to-green-700 p-6 text-white relative">
          <button
            onClick={closeAuthModal}
            className="absolute top-4 right-4 text-white/80 hover:text-white bg-black/20 hover:bg-black/30 p-2 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2 mb-2">
            <span className="veg-badge bg-white">
              <span className="veg-badge-dot"></span>
            </span>
            <span className="text-xs font-bold tracking-wider uppercase text-emerald-200 bg-white/10 px-2 py-0.5 rounded-full">
              100% Pure Veg & Satvik
            </span>
          </div>

          <h2 className="text-2xl font-black tracking-tight">
            {step === 1 ? 'Login or Sign Up' : 'Enter 6-digit OTP'}
          </h2>
          <p className="text-emerald-100 text-xs mt-1">
            {step === 1
              ? 'Get instant access to authentic pure vegetarian meals'
              : `Verification code sent to ${identifier}`}
          </p>
        </div>

        {/* Form Body */}
        <div className="p-6">
          {step === 1 ? (
            /* STATE 1: Enter Email / Phone & Send OTP */
            <div>
              {/* Method Switcher Tabs */}
              <div className="flex rounded-xl bg-gray-100 p-1 mb-5">
                <button
                  type="button"
                  onClick={() => { setAuthMethod('email'); setIdentifier(''); }}
                  className={`flex-1 flex items-center justify-center gap-2 py-2 text-xs font-semibold rounded-lg transition-all ${
                    authMethod === 'email'
                      ? 'bg-white text-emerald-700 shadow-sm'
                      : 'text-gray-500 hover:text-gray-900'
                  }`}
                >
                  <Mail className="w-4 h-4" />
                  Email OTP
                </button>
                <button
                  type="button"
                  onClick={() => { setAuthMethod('phone'); setIdentifier(''); }}
                  className={`flex-1 flex items-center justify-center gap-2 py-2 text-xs font-semibold rounded-lg transition-all ${
                    authMethod === 'phone'
                      ? 'bg-white text-emerald-700 shadow-sm'
                      : 'text-gray-500 hover:text-gray-900'
                  }`}
                >
                  <Phone className="w-4 h-4" />
                  Mobile OTP
                </button>
              </div>

              <form onSubmit={handleSendOtp} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                    {authMethod === 'email' ? 'Email Address' : 'Mobile Number'}
                  </label>

                  {authMethod === 'email' ? (
                    <div className="relative">
                      <Mail className="absolute left-3.5 top-3.5 w-5 h-5 text-gray-400" />
                      <input
                        type="email"
                        value={identifier}
                        onChange={(e) => setIdentifier(e.target.value)}
                        placeholder="you@example.com"
                        required
                        className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100 outline-none text-sm transition-all"
                      />
                    </div>
                  ) : (
                    <div className="flex">
                      <span className="inline-flex items-center px-3.5 rounded-l-xl border border-r-0 border-gray-200 bg-gray-100 text-gray-700 font-semibold text-sm">
                        🇮🇳 +91
                      </span>
                      <input
                        type="tel"
                        value={identifier}
                        onChange={(e) => setIdentifier(e.target.value.replace(/\D/g, ''))}
                        placeholder="98765 43210"
                        maxLength={10}
                        required
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-r-xl focus:bg-white focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100 outline-none text-sm transition-all"
                      />
                    </div>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full mt-2 py-3.5 px-4 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-bold rounded-xl shadow-lg shadow-emerald-600/25 flex items-center justify-center gap-2 transition-all disabled:opacity-70 disabled:cursor-not-allowed text-sm"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Sending One-Time Password...</span>
                    </>
                  ) : (
                    <>
                      <span>Send OTP</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>

              {/* Trust Badges */}
              <div className="mt-6 pt-5 border-t border-gray-100 flex items-center justify-between text-[11px] text-gray-500">
                <div className="flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>Twilio SMS & Supabase Auth</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  <span>Instant SMS Verification</span>
                </div>
              </div>
            </div>
          ) : (
            /* STATE 2: 6-Digit OTP Form */
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs text-gray-500">Enter the 6-digit code:</span>
                <button
                  type="button"
                  onClick={() => { setStep(1); setOtpDigits(['', '', '', '', '', '']); }}
                  className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 underline"
                >
                  Change {authMethod === 'email' ? 'Email' : 'Number'}
                </button>
              </div>

              <form onSubmit={handleVerifyOtp} className="space-y-5">
                {/* 6 Segmented Input Boxes */}
                <div className="flex justify-between gap-2" onPaste={handlePaste}>
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
                      className="w-12 h-14 text-center text-xl font-bold rounded-xl border-2 border-gray-200 bg-gray-50 focus:bg-white focus:border-emerald-600 focus:ring-4 focus:ring-emerald-100 outline-none transition-all"
                    />
                  ))}
                </div>

                <button
                  type="submit"
                  disabled={isLoading || otpDigits.join('').length !== 6}
                  className="w-full py-3.5 px-4 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-bold rounded-xl shadow-lg shadow-emerald-600/25 flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
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
                      Resend OTP Now
                    </button>
                  ) : (
                    <p className="text-xs text-gray-400">
                      Didn’t receive code? Resend in{' '}
                      <span className="font-semibold text-gray-700">{resendTimer}s</span>
                    </p>
                  )}
                </div>

                {/* Developer / Testing Note */}
                <div className="bg-emerald-50 border border-emerald-200/70 rounded-xl p-3 text-[11px] text-emerald-800 leading-relaxed space-y-1.5">
                  {authMethod === 'phone' && lastGeneratedOtp ? (
                    <div>
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-semibold text-emerald-900">
                          🔔 Verification Code: <code className="bg-white px-2 py-0.5 rounded font-mono font-bold text-emerald-950 border border-emerald-300 text-xs">{lastGeneratedOtp}</code>
                        </span>
                        <button
                          type="button"
                          onClick={() => fillOtpCode(lastGeneratedOtp)}
                          className="text-[11px] bg-emerald-600 hover:bg-emerald-700 text-white font-medium px-2.5 py-1 rounded-lg transition-colors shadow-sm"
                        >
                          Auto-fill
                        </button>
                      </div>
                      <p className="text-[10px] text-emerald-700 mt-1">
                        Twilio Trial restricts real SMS to verified numbers (+917904037699). For any other number, use the code above or <code className="font-mono font-bold text-emerald-900">123456</code>.
                      </p>
                    </div>
                  ) : (
                    <div>
                      <span className="font-semibold">📱 Twilio SMS:</span> Check your phone's SMS inbox for the 6-digit OTP code sent via Twilio! You can also use code <code className="bg-white px-1.5 py-0.5 rounded font-mono font-bold text-emerald-900 border border-emerald-300">123456</code> for testing.
                    </div>
                  )}
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
