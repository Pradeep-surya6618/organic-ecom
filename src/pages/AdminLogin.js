import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Mail, Lock, ArrowRight, Loader2, Leaf, Eye, EyeOff } from "lucide-react";
import toast from "react-hot-toast";
import { useAuth } from "../context/AuthContext";
import ParticlesBackground from "../components/ParticlesBackground";

export default function AdminLogin() {
  const navigate = useNavigate();
  const { adminLogin, adminVerifyLoginOtp } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [otpDigits, setOtpDigits] = useState(["", "", "", "", "", ""]);
  const [step, setStep] = useState("creds"); // creds -> otp
  const [loading, setLoading] = useState(false);

  const otpRefs = useRef([]);
  const focusBox = (i) => {
    const el = otpRefs.current[i];
    if (el) el.focus();
  };

  // Auto-focus the first OTP box when the OTP step appears
  useEffect(() => {
    if (step === "otp") {
      const t = setTimeout(() => focusBox(0), 60);
      return () => clearTimeout(t);
    }
  }, [step]);

  const handleCredsSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error("Please fill in all credentials.");
      return;
    }

    setLoading(true);
    try {
      // Admin session login (success/error toasts handled in AuthContext)
      await adminLogin({ email, password });
      setOtpDigits(["", "", "", "", "", ""]);
      setStep("otp");
    } catch {
      // error toast already shown by AuthContext
    } finally {
      setLoading(false);
    }
  };

  const handleOtpChange = (index, val) => {
    const digit = val.replace(/\D/g, "").slice(-1); // keep only the latest digit
    setOtpDigits((prev) => {
      const next = [...prev];
      next[index] = digit;
      return next;
    });
    if (digit && index < 5) focusBox(index + 1);
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === "Backspace") {
      e.preventDefault();
      if (otpDigits[index]) {
        setOtpDigits((prev) => {
          const next = [...prev];
          next[index] = "";
          return next;
        });
      } else if (index > 0) {
        focusBox(index - 1);
        setOtpDigits((prev) => {
          const next = [...prev];
          next[index - 1] = "";
          return next;
        });
      }
    } else if (e.key === "ArrowLeft" && index > 0) {
      focusBox(index - 1);
    } else if (e.key === "ArrowRight" && index < 5) {
      focusBox(index + 1);
    }
  };

  const handleOtpPaste = (e) => {
    e.preventDefault();
    const pasted = (e.clipboardData.getData("text") || "").replace(/\D/g, "").slice(0, 6);
    if (!pasted) return;
    setOtpDigits(() => {
      const next = ["", "", "", "", "", ""];
      for (let i = 0; i < pasted.length; i++) next[i] = pasted[i];
      return next;
    });
    focusBox(Math.min(pasted.length, 6) - 1);
  };

  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    const code = otpDigits.join("");
    if (code.length !== 6) {
      toast.error("Please enter the 6-digit verification code.");
      return;
    }

    setLoading(true);
    try {
      await adminVerifyLoginOtp({ email, otp: code });
      navigate("/admin");
    } catch {
      // error toast already shown by AuthContext (bad code or non-admin account)
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-[#153d2b] to-emerald-950 px-4 py-8 sm:py-12">
      <ParticlesBackground />
      <div className="relative z-10 w-full max-w-md bg-white rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden border border-stone-100 p-6 sm:p-8 md:p-10">

        {/* Brand Header */}
        <div className="text-center mb-7 sm:mb-8">
          <span className="inline-flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-2xl bg-emerald-50 text-[#153d2b] mb-4">
            <Leaf size={26} />
          </span>
          <h2 className="text-lg sm:text-xl font-black text-stone-900 tracking-tight">Admin authentication</h2>
          <p className="text-xs font-bold text-stone-400 mt-2">Access admin dashboard</p>
        </div>

        {step === "creds" ? (
          <form onSubmit={handleCredsSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-extrabold text-stone-500 uppercase tracking-wider mb-2">
                Work Email Address
              </label>
              <div className="relative flex items-center rounded-xl border-2 border-stone-200 bg-stone-50 focus-within:border-emerald-500 focus-within:bg-white focus-within:ring-4 focus-within:ring-emerald-100 transition">
                <Mail size={18} className="absolute left-4 text-stone-400 shrink-0" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@organicstore.com"
                  className="w-full h-12 bg-transparent pl-12 pr-4 text-xs font-bold text-stone-800 outline-none placeholder:text-stone-400"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-extrabold text-stone-500 uppercase tracking-wider mb-2">
                Secret Passkey
              </label>
              <div className="relative flex items-center rounded-xl border-2 border-stone-200 bg-stone-50 focus-within:border-emerald-500 focus-within:bg-white focus-within:ring-4 focus-within:ring-emerald-100 transition">
                <Lock size={18} className="absolute left-4 text-stone-400 shrink-0" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full h-12 bg-transparent pl-12 pr-12 text-xs font-bold text-stone-800 outline-none placeholder:text-stone-400"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  aria-pressed={showPassword}
                  tabIndex={-1}
                  className="absolute right-3 flex h-8 w-8 items-center justify-center rounded-lg text-stone-400 hover:text-emerald-700 hover:bg-emerald-50 transition"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full h-12 rounded-xl bg-[#153d2b] text-white text-xs font-black flex items-center justify-center gap-2 hover:bg-emerald-800 active:scale-[0.98] transition disabled:opacity-60 cursor-pointer"
            >
              {loading ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <>
                  Authenticate <ArrowRight size={14} />
                </>
              )}
            </button>
          </form>
        ) : (
          <form onSubmit={handleOtpSubmit} className="space-y-6">
            <p className="text-xs text-stone-500 font-bold text-center leading-relaxed">
              We sent a security authorization code to <br />
              <strong className="text-stone-700 break-all">{email}</strong>. Enter it below to unlock access.
            </p>

            <div>
              <label className="block text-xs font-extrabold text-stone-500 uppercase tracking-wider mb-3 text-center">
                Verification Code
              </label>
              <div className="flex justify-between gap-2 sm:gap-3" onPaste={handleOtpPaste}>
                {otpDigits.map((digit, i) => (
                  <input
                    key={i}
                    ref={(el) => (otpRefs.current[i] = el)}
                    type="text"
                    inputMode="numeric"
                    autoComplete={i === 0 ? "one-time-code" : "off"}
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(i, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(i, e)}
                    onFocus={(e) => e.target.select()}
                    className="flex-1 min-w-0 h-12 sm:h-14 text-center text-xl sm:text-2xl font-black rounded-xl border-2 border-stone-200 bg-stone-50 text-stone-800 outline-none focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-100 transition"
                  />
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full h-12 rounded-xl bg-[#153d2b] text-white text-xs font-black flex items-center justify-center gap-2 hover:bg-emerald-800 active:scale-[0.98] transition disabled:opacity-60 cursor-pointer"
            >
              {loading ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <>
                  Verify code & enter <ArrowRight size={14} />
                </>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
