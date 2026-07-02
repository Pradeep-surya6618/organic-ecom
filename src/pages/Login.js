import React, { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import {
  Mail, Lock, Eye, EyeOff, ArrowLeft, ArrowRight,
  Leaf, ShieldCheck, Loader2, CheckCircle2,
  Sparkles, Star, Truck, Clock, RefreshCw
} from "lucide-react";
import toast from "react-hot-toast";
import { useAuth } from "../context/AuthContext";

/* ─────────────────────────────────────────────────────────────────
   OTP Input — 6 auto-advancing boxes (no highlight ring/glow, no scale)
   ───────────────────────────────────────────────────────────────── */
function OtpInput({ value, onChange, length = 6, autoFocus = true }) {
  const refs = useRef([]);
  const digits = value.split("").concat(Array(length).fill("")).slice(0, length);

  const handleChange = (i, val) => {
    if (!/^\d*$/.test(val)) return;
    const next = digits.slice();
    next[i] = val.slice(-1);
    const joined = next.join("").replace(/\s/g, "");
    onChange(joined);
    if (val && i < length - 1) refs.current[i + 1]?.focus();
  };

  const handleKeyDown = (i, e) => {
    if (e.key === "Backspace" && !digits[i] && i > 0) refs.current[i - 1]?.focus();
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, length);
    onChange(pasted);
    refs.current[Math.min(pasted.length, length - 1)]?.focus();
  };

  return (
    <div className="flex gap-2 sm:gap-3 justify-center" onPaste={handlePaste}>
      {digits.map((d, i) => (
        <input
          key={i}
          ref={el => (refs.current[i] = el)}
          autoFocus={autoFocus && i === 0}
          value={d}
          onChange={e => handleChange(i, e.target.value)}
          onKeyDown={e => handleKeyDown(i, e)}
          inputMode="numeric"
          maxLength={1}
          className={`w-11 h-13 sm:w-12 sm:h-14 text-center text-xl font-black rounded-2xl border-2 outline-none transition-all duration-200
            ${d ? "border-emerald-600 bg-emerald-50 text-emerald-800" : "border-stone-200 bg-white text-stone-900"}
            focus:border-emerald-600 focus:bg-white`}
        />
      ))}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────
   Resend Timer
   ───────────────────────────────────────────────────────────────── */
function useResendTimer(seconds = 60) {
  const [left, setLeft] = useState(seconds);
  const [active, setActive] = useState(true);

  useEffect(() => {
    if (!active || left <= 0) return;
    const t = setTimeout(() => setLeft(l => l - 1), 1000);
    return () => clearTimeout(t);
  }, [left, active]);

  const reset = useCallback(() => { setLeft(seconds); setActive(true); }, [seconds]);
  return { left, canResend: left <= 0, reset };
}

/* ─────────────────────────────────────────────────────────────────
   Field component - clean without focus-ring highlighting or hints
   ───────────────────────────────────────────────────────────────── */
function Field({ icon: Icon, error, children }) {
  return (
    <div>
      <div className={`relative flex items-center rounded-2xl border-2 bg-white transition-all duration-200
        ${error
          ? "border-red-300 bg-red-50/40"
          : "border-stone-200 focus-within:border-emerald-600"}`}>
        <Icon size={17} className="ml-4 text-stone-400 shrink-0" />
        {children}
      </div>
      {error && <p className="mt-1.5 text-xs font-bold text-red-500 px-1 flex items-center gap-1">⚠ {error}</p>}
    </div>
  );
}

const inputCls = "w-full bg-transparent h-12 sm:h-13 px-3 text-sm font-semibold text-stone-900 outline-none placeholder:text-stone-400 placeholder:font-normal";

/* ─────────────────────────────────────────────────────────────────
   Steps
   ───────────────────────────────────────────────────────────────── */
const STEPS = {
  LOGIN_CREDS: "login_creds",
  LOGIN_OTP: "login_otp",
  FORGOT_EMAIL: "forgot_email",
  FORGOT_OTP: "forgot_otp",
  FORGOT_RESET: "forgot_reset",
  SUCCESS: "success",
};

/* ─────────────────────────────────────────────────────────────────
   Left Brand Panel
   ───────────────────────────────────────────────────────────────── */
function BrandPanel() {
  const features = [
    { icon: <Truck size={15} />, text: "10-minute delivery" },
    { icon: <Leaf size={15} />, text: "100% organic & fresh" },
    { icon: <ShieldCheck size={15} />, text: "Secure OTP login" },
    { icon: <Star size={15} />, text: "4.9 ★ customer rating" },
  ];

  return (
    <div className="hidden lg:flex flex-col justify-between h-full p-10 text-white relative overflow-hidden">
      {/* Background blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-20 -left-20 w-80 h-80 bg-emerald-400/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-10 -right-20 w-96 h-96 bg-emerald-300/15 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "1s" }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-white/5 rounded-full blur-2xl" />
      </div>

      {/* Logo */}
      <div className="relative">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm border border-white/30 flex items-center justify-center">
            <Leaf size={20} />
          </div>
          <div>
            <div className="text-lg font-black tracking-tight">Organic Store</div>
            <div className="text-xs text-emerald-200 font-semibold">Farm to Door</div>
          </div>
        </div>
      </div>

      {/* Main copy */}
      <div className="relative space-y-6">
        <div>
          <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-sm border border-white/20 rounded-full px-3 py-1 text-xs font-bold mb-4">
            <Sparkles size={12} />
            Welcome back
          </div>
          <h2 className="text-4xl font-black leading-tight mb-3">
            Your organic grocery store
          </h2>
          <p className="text-emerald-100 text-sm leading-relaxed">
            Sign in to continue shopping the freshest organic produce, delivered straight from local farms.
          </p>
        </div>

        {/* Feature pills */}
        <div className="grid grid-cols-2 gap-2">
          {features.map((f, i) => (
            <div key={i} className="flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/15 rounded-xl px-3 py-2.5">
              <div className="text-emerald-300 flex-shrink-0">{f.icon}</div>
              <span className="text-xs font-semibold text-emerald-100">{f.text}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Testimonial */}
      <div className="relative bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-4">
        <div className="flex gap-0.5 mb-2">
          {[...Array(5)].map((_, i) => <Star key={i} size={11} fill="currentColor" className="text-yellow-300" />)}
        </div>
        <p className="text-sm text-emerald-100 leading-relaxed mb-2">
          "The freshest veggies I've ever had, delivered in under 10 minutes. Absolutely love this service!"
        </p>
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-white/25 flex items-center justify-center text-xs font-black">P</div>
          <div>
            <div className="text-xs font-bold">Priya S.</div>
            <div className="text-xs text-emerald-300">Verified customer</div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────
   Main Login Component
   ───────────────────────────────────────────────────────────────── */
export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, verifyLoginOtp, resendOtp, forgotPassword, verifyResetOtp, resetPassword } = useAuth();

  const [step, setStep] = useState(STEPS.LOGIN_CREDS);
  const [animKey, setAnimKey] = useState(0);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [otp, setOtp] = useState("");
  const [newPwd, setNewPwd] = useState("");
  const [resetToken, setResetToken] = useState("");

  const resendTimer = useResendTimer(60);
  const clearMessages = () => { setErrors({}); };

  // Show success messages passed from register page redirect
  useEffect(() => {
    if (location.state?.message) {
      toast.success(location.state.message);
      // clean state
      window.history.replaceState({}, document.title);
    }
  }, [location]);

  const goTo = (s) => {
    clearMessages();
    setOtp("");
    setStep(s);
    setAnimKey(k => k + 1);
  };

  /* ── LOGIN ── */
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    clearMessages();
    const errs = {};
    if (!email.trim() || !/^\S+@\S+\.\S+$/.test(email)) errs.email = "Enter a valid email address";
    if (!password) errs.password = "Password is required";
    if (Object.keys(errs).length) return setErrors(errs);

    setLoading(true);
    try {
      await login({ email, password });
      resendTimer.reset();
      goTo(STEPS.LOGIN_OTP);
    } catch {
      // error toast shown by AuthContext
    } finally {
      setLoading(false);
    }
  };

  const handleLoginOtpSubmit = async (e) => {
    e.preventDefault();
    clearMessages();
    if (otp.length !== 6) return setErrors({ otp: "Enter the complete 6-digit code" });

    setLoading(true);
    try {
      await verifyLoginOtp({ email, otp });
      goTo(STEPS.SUCCESS);
      setTimeout(() => navigate("/account"), 1400);
    } catch {
      // error toast shown by AuthContext (bad code or admin account)
      setOtp("");
    } finally {
      setLoading(false);
    }
  };

  /* ── RESEND ── */
  const handleResend = async (purpose) => {
    if (!resendTimer.canResend) return;
    clearMessages();
    try {
      await resendOtp({ email, purpose });
      resendTimer.reset();
    } catch {
      // error toast shown by AuthContext
    }
  };

  /* ── FORGOT PASSWORD ── */
  const handleForgotEmail = async (e) => {
    e.preventDefault();
    clearMessages();
    if (!email.trim() || !/^\S+@\S+\.\S+$/.test(email)) return setErrors({ email: "Enter a valid email address" });
    setLoading(true);
    try {
      await forgotPassword(email);
      resendTimer.reset();
      goTo(STEPS.FORGOT_OTP);
    } catch {
      // error toast shown by AuthContext
    } finally {
      setLoading(false);
    }
  };

  const handleForgotOtp = async (e) => {
    e.preventDefault();
    clearMessages();
    if (otp.length !== 6) return setErrors({ otp: "Enter the complete 6-digit code" });
    setLoading(true);
    try {
      const token = await verifyResetOtp({ email, otp });
      setResetToken(token);
      goTo(STEPS.FORGOT_RESET);
    } catch {
      // error toast shown by AuthContext
      setOtp("");
    } finally {
      setLoading(false);
    }
  };

  const handleForgotReset = async (e) => {
    e.preventDefault();
    clearMessages();
    if (newPwd.length < 6) return setErrors({ newPwd: "Password must be at least 6 characters" });
    setLoading(true);
    try {
      await resetPassword({ resetToken, newPassword: newPwd });
      goTo(STEPS.LOGIN_CREDS);
      setPassword(""); setOtp(""); setNewPwd("");
    } catch {
      // error toast shown by AuthContext
    } finally {
      setLoading(false);
    }
  };

  const isOtpStep = [STEPS.LOGIN_OTP, STEPS.FORGOT_OTP].includes(step);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-stone-100 via-emerald-50/50 to-stone-100 px-4 py-8">
      <div className="w-full max-w-5xl bg-white rounded-3xl shadow-2xl shadow-stone-900/10 overflow-hidden border border-stone-200/60 flex min-h-[600px]">
        
        {/* Left brand panel */}
        <div className="lg:w-5/12 bg-gradient-to-br from-[#0f2d1e] via-[#153d2b] to-[#1a5c39] flex-shrink-0">
          <BrandPanel />
        </div>

        {/* Right form panel */}
        <div className="flex-1 flex flex-col">
          
          {/* Mobile brand bar */}
          <div className="lg:hidden flex items-center justify-between px-6 pt-6 pb-4 border-b border-stone-100">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-[#153d2b] flex items-center justify-center">
                <Leaf size={16} className="text-white" />
              </div>
              <span className="font-black text-stone-900">Organic Store</span>
            </div>
            <Link to="/" className="text-xs font-bold text-emerald-700 hover:text-emerald-900">← Home</Link>
          </div>

          {/* Form area */}
          <div className="flex-1 flex flex-col justify-center px-6 sm:px-10 py-8 overflow-y-auto">
            
            {/* Step indicator for OTP steps */}
            {isOtpStep && (
              <div className="flex items-center gap-2 mb-6">
                <button onClick={() => goTo(
                  step === STEPS.LOGIN_OTP ? STEPS.LOGIN_CREDS : STEPS.FORGOT_EMAIL
                )} className="flex items-center gap-1.5 text-xs font-bold text-stone-400 hover:text-stone-700 transition-colors">
                  <ArrowLeft size={14} /> Back
                </button>
              </div>
            )}

            {/* Animated step wrapper */}
            <div key={animKey} style={{ animation: "stepIn 0.3s ease" }}>
              
              {/* ── LOGIN CREDENTIALS ── */}
              {step === STEPS.LOGIN_CREDS && (
                <>
                  <div className="mb-7">
                    <h1 className="text-2xl font-black text-stone-900 mb-1">Welcome back 👋</h1>
                    <p className="text-sm text-stone-500">Sign in — we'll send a verification code to confirm it's you.</p>
                  </div>

                  <form onSubmit={handleLoginSubmit} className="space-y-4">
                    <Field icon={Mail} error={errors.email}>
                      <input id="login-email" type="email" placeholder="you@example.com" className={inputCls}
                        value={email} onChange={e => setEmail(e.target.value)} autoComplete="email" />
                    </Field>

                    <Field icon={Lock} error={errors.password}>
                      <input id="login-password" type={showPwd ? "text" : "password"} placeholder="Your password" className={inputCls}
                        value={password} onChange={e => setPassword(e.target.value)} autoComplete="current-password" />
                      <button type="button" onClick={() => setShowPwd(v => !v)}
                        className="mr-4 text-stone-400 hover:text-stone-600 transition-colors">
                        {showPwd ? <EyeOff size={17} /> : <Eye size={17} />}
                      </button>
                    </Field>

                    <div className="flex items-center justify-between">
                      <span />
                      <button type="button" onClick={() => goTo(STEPS.FORGOT_EMAIL)}
                        className="text-xs font-bold text-emerald-700 hover:text-emerald-900 transition-colors">
                        Forgot password?
                      </button>
                    </div>

                    <button id="login-submit" type="submit" disabled={loading}
                      className="w-full h-12 rounded-2xl bg-[#153d2b] text-white text-sm font-black flex items-center justify-center gap-2
                        hover:bg-emerald-800 active:scale-[0.98] transition-all duration-150 shadow-lg shadow-emerald-900/20 disabled:opacity-60 disabled:cursor-not-allowed">
                      {loading
                        ? <><Loader2 size={17} className="animate-spin" /> Sending code…</>
                        : <>Continue <ArrowRight size={16} /></>}
                    </button>
                  </form>

                  <div className="mt-6 pt-5 border-t border-stone-100 text-center">
                    <p className="text-sm text-stone-500">
                      New here?{" "}
                      <Link to="/register" className="font-black text-emerald-700 hover:text-emerald-900 transition-colors">
                        Create an account
                      </Link>
                    </p>
                  </div>
                </>
              )}

              {/* ── LOGIN OTP ── */}
              {step === STEPS.LOGIN_OTP && (
                <OtpStepUI
                  title="Verify it's you 🔐"
                  subtitle={<>We sent a 6-digit code to <strong className="text-stone-800">{email}</strong></>}
                  devNote="💡 Check the backend console for your OTP code"
                  otp={otp} setOtp={setOtp} error={errors.otp}
                  onSubmit={handleLoginOtpSubmit} loading={loading}
                  resendTimer={resendTimer} onResend={() => handleResend("login")}
                />
              )}

              {/* ── FORGOT — EMAIL ── */}
              {step === STEPS.FORGOT_EMAIL && (
                <>
                  <div className="mb-7">
                    <button onClick={() => goTo(STEPS.LOGIN_CREDS)}
                      className="flex items-center gap-1.5 text-xs font-bold text-stone-400 hover:text-stone-700 transition-colors mb-4">
                      <ArrowLeft size={14} /> Back to sign in
                    </button>
                    <h1 className="text-2xl font-black text-stone-900 mb-1">Reset password 🔑</h1>
                    <p className="text-sm text-stone-500">Enter your email and we'll send a reset code.</p>
                  </div>
                  <form onSubmit={handleForgotEmail} className="space-y-4">
                    <Field icon={Mail} error={errors.email}>
                      <input id="forgot-email" type="email" placeholder="you@example.com" className={inputCls}
                        value={email} onChange={e => setEmail(e.target.value)} />
                    </Field>
                    <button id="forgot-submit" type="submit" disabled={loading}
                      className="w-full h-12 rounded-2xl bg-[#153d2b] text-white text-sm font-black flex items-center justify-center gap-2
                        hover:bg-emerald-800 transition-all shadow-lg shadow-emerald-900/20 disabled:opacity-60">
                      {loading
                        ? <><Loader2 size={17} className="animate-spin" /> Sending…</>
                        : <>Send reset code <ArrowRight size={16} /></>}
                    </button>
                  </form>
                </>
              )}

              {/* ── FORGOT — OTP ── */}
              {step === STEPS.FORGOT_OTP && (
                <OtpStepUI
                  title="Enter reset code 🔒"
                  subtitle={<>We sent a 6-digit reset code to <strong className="text-stone-800">{email}</strong></>}
                  devNote="💡 Check the backend console for your OTP code"
                  otp={otp} setOtp={setOtp} error={errors.otp}
                  onSubmit={handleForgotOtp} loading={loading}
                  resendTimer={resendTimer} onResend={() => handleResend("password_reset")}
                />
              )}

              {/* ── FORGOT — NEW PASSWORD ── */}
              {step === STEPS.FORGOT_RESET && (
                <>
                  <div className="mb-7">
                    <h1 className="text-2xl font-black text-stone-900 mb-1">New password 🛡️</h1>
                    <p className="text-sm text-stone-500">Choose a strong password for your account.</p>
                  </div>
                  <form onSubmit={handleForgotReset} className="space-y-4">
                    <Field icon={Lock} error={errors.newPwd}>
                      <input id="new-password" type={showPwd ? "text" : "password"} placeholder="New password (min 6 chars)" className={inputCls}
                        value={newPwd} onChange={e => setNewPwd(e.target.value)} />
                      <button type="button" onClick={() => setShowPwd(v => !v)}
                        className="mr-4 text-stone-400 hover:text-stone-600 transition-colors">
                        {showPwd ? <EyeOff size={17} /> : <Eye size={17} />}
                      </button>
                    </Field>
                    <button id="reset-submit" type="submit" disabled={loading}
                      className="w-full h-12 rounded-2xl bg-[#153d2b] text-white text-sm font-black flex items-center justify-center gap-2
                        hover:bg-emerald-800 transition-all shadow-lg shadow-emerald-900/20 disabled:opacity-60">
                      {loading
                        ? <><Loader2 size={17} className="animate-spin" /> Updating…</>
                        : <>Update password <ArrowRight size={16} /></>}
                    </button>
                  </form>
                </>
              )}

              {/* ── SUCCESS ── */}
              {step === STEPS.SUCCESS && (
                <div className="flex flex-col items-center justify-center py-10 text-center">
                  <div className="relative mb-6">
                    <div className="w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center mx-auto">
                      <CheckCircle2 size={40} className="text-emerald-600" />
                    </div>
                    <div className="absolute -top-1 -right-1 w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center">
                      <Sparkles size={12} className="text-yellow-900" />
                    </div>
                  </div>
                  <h2 className="text-2xl font-black text-stone-900 mb-2">You're all set! 🎉</h2>
                  <p className="text-sm text-stone-500 mb-1">Redirecting you to the store…</p>
                  <div className="flex gap-1 mt-3">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="w-2 h-2 rounded-full bg-emerald-400 animate-bounce"
                        style={{ animationDelay: `${i * 0.15}s` }} />
                    ))}
                  </div>
                </div>
              )}

            </div>

            {/* Desktop back-to-home */}
            <p className="hidden lg:block text-center text-xs text-stone-400 font-semibold mt-6">
              <Link to="/" className="hover:text-stone-600 transition-colors">← Back to home</Link>
            </p>

          </div>
        </div>
      </div>

      <style>{`
        @keyframes stepIn {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────
   Reusable OTP Step UI (no highlight/glow/scale)
   ───────────────────────────────────────────────────────────────── */
function OtpStepUI({ title, subtitle, devNote, otp, setOtp, error, onSubmit, loading, resendTimer, onResend }) {
  return (
    <div className="text-center">
      <div className="w-16 h-16 rounded-2xl bg-emerald-100 flex items-center justify-center mx-auto mb-5">
        <ShieldCheck size={28} className="text-emerald-600" />
      </div>
      <h1 className="text-2xl font-black text-stone-900 mb-2">{title}</h1>
      <p className="text-sm text-stone-500 mb-6">{subtitle}</p>

      {devNote && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl px-3 py-2 mb-5 text-xs text-amber-700 font-semibold">
          {devNote}
        </div>
      )}

      <form onSubmit={onSubmit} className="space-y-5">
        <OtpInput value={otp} onChange={setOtp} />
        {error && <p className="text-xs font-bold text-red-500">⚠ {error}</p>}

        <button id="otp-verify-submit" type="submit" disabled={loading || otp.length !== 6}
          className="w-full h-12 rounded-2xl bg-[#153d2b] text-white text-sm font-black flex items-center justify-center gap-2
            hover:bg-emerald-800 active:scale-[0.98] transition-all shadow-lg shadow-emerald-900/20 disabled:opacity-50 disabled:cursor-not-allowed">
          {loading
            ? <><Loader2 size={17} className="animate-spin" /> Verifying…</>
            : <>Verify code <ArrowRight size={16} /></>}
        </button>
      </form>

      <div className="mt-5 flex items-center justify-center gap-2 text-sm text-stone-500">
        {resendTimer.canResend ? (
          <button onClick={onResend}
            className="flex items-center gap-1.5 font-black text-emerald-700 hover:text-emerald-900 transition-colors">
            <RefreshCw size={13} /> Resend code
          </button>
        ) : (
          <span>
            Resend in <span className="font-black text-stone-700 tabular-nums">{resendTimer.left}s</span>
          </span>
        )}
      </div>

      <div className="mt-3 flex items-center justify-center gap-1.5 text-xs text-stone-400">
        <Clock size={12} />
        <span>Code expires in 10 minutes</span>
      </div>
    </div>
  );
}