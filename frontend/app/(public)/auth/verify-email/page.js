"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { MailCheck } from "lucide-react";
import api from "../../../../src/services/api";
import Button from "../../../../src/components/Button";
import { motion } from "framer-motion";

function VerifyEmailContent() {
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email");

  useEffect(() => {
    if (!email) {
      router.push("/auth/login");
    }
  }, [email, router]);

  const handleChange = (element, index) => {
    if (isNaN(element.value)) return false;

    setOtp([...otp.map((d, idx) => (idx === index ? element.value : d))]);

    // Focus next input
    if (element.nextSibling) {
      element.nextSibling.focus();
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace" && !otp[index] && e.target.previousSibling) {
      e.target.previousSibling.focus();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const otpCode = otp.join("");
    if (otpCode.length !== 6) {
      setError("Please enter all 6 digits of the OTP.");
      return;
    }

    setError(null);
    setMessage(null);
    setLoading(true);

    try {
      // Expected backend endpoint for OTP verification
      const res = await api.post("/api/auth/verify-email", { email, otp: otpCode });
      setMessage(res.data?.message || "Email verified successfully!");
      
      setTimeout(() => {
        window.location.href = "/auth/login";
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to verify email. Please check your OTP and try again.");
    } finally {
      setLoading(false);
    }
  };

  const resendOtp = async () => {
    setError(null);
    setMessage(null);
    try {
      await api.post("/api/auth/resend-otp", { email });
      setMessage("A new OTP has been sent to your email.");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to resend OTP.");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[90vh] px-6 relative z-10 w-full overflow-hidden">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="w-full max-w-md glass-card p-10 rounded-3xl transition-all relative overflow-hidden"
      >
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-primary/20 rounded-full blur-3xl pointer-events-none" />

        <div className="mb-10 text-center relative z-10 flex flex-col items-center">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-primary to-secondary flex items-center justify-center text-white mb-6 shadow-lg shadow-primary/20">
            <MailCheck size={28} />
          </div>
          <h2 className="text-3xl font-bold text-foreground mb-2">Verify Email</h2>
          <p className="text-text-muted">Enter the 6-digit code sent to <br/><span className="text-primary font-medium">{email}</span></p>
        </div>

        {error && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl mb-6 text-sm text-center"
          >
            {error}
          </motion.div>
        )}

        {message && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="bg-green-500/10 border border-green-500/20 text-green-400 p-4 rounded-xl mb-6 text-sm text-center font-medium"
          >
            {message}
          </motion.div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
          <div className="flex justify-between items-center gap-2">
            {otp.map((data, index) => {
              return (
                <input
                  className="w-12 h-14 text-center text-xl font-bold bg-surface/50 border border-border text-foreground rounded-xl focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all outline-none"
                  type="text"
                  name="otp"
                  maxLength="1"
                  key={index}
                  value={data}
                  onChange={e => handleChange(e.target, index)}
                  onFocus={e => e.target.select()}
                  onKeyDown={e => handleKeyDown(e, index)}
                />
              );
            })}
          </div>

          <div className="pt-4">
            <Button type="submit" className="w-full py-4 text-lg bg-gradient-to-r from-primary to-secondary hover:from-primary-hover hover:to-primary border-0 shadow-lg shadow-primary/20 transition-all font-semibold" loading={loading}>
              {loading ? "Verifying..." : "Verify OTP"}
            </Button>
          </div>
        </form>

        <div className="mt-8 text-center text-sm relative z-10">
          <p className="text-text-muted">
            Didn't receive the code?{" "}
            <button type="button" onClick={resendOtp} className="text-primary font-bold hover:text-secondary group transition-all bg-transparent border-none cursor-pointer">
              Resend OTP
              <span className="block max-w-0 group-hover:max-w-full transition-all duration-300 h-0.5 bg-primary mt-0.5" />
            </button>
          </p>
        </div>
      </motion.div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<div className="min-h-[90vh] flex items-center justify-center">Loading...</div>}>
      <VerifyEmailContent />
    </Suspense>
  );
}
