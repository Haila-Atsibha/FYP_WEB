"use client";

import { useState, useContext } from "react";
import { AuthContext } from "../../../../src/context/AuthContext";
import Input from "../../../../src/components/Input";
import Button from "../../../../src/components/Button";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { BriefcaseBusiness, KeyRound, Mail, ArrowRight, ShieldCheck, CheckCircle2 } from "lucide-react";
import { useRouter } from "next/navigation";

import { useTranslation } from "../../../../src/hooks/useTranslation";

export default function ForgotPasswordPage() {
  const { t } = useTranslation();
  const { forgotPassword, resetPassword, verifyResetOtp } = useContext(AuthContext);
  const router = useRouter();
  
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const handleRequestOtp = async (e) => {
    e.preventDefault();
    if (!email) {
      setError("Please enter your email address.");
      return;
    }
    
    setError(null);
    setLoading(true);
    try {
      const res = await forgotPassword(email);
      setSuccess(res.message || "OTP sent successfully.");
      setStep(2);
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to request password reset.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (!otp) {
      setError("Please enter the OTP.");
      return;
    }

    setError(null);
    setLoading(true);
    try {
      await verifyResetOtp(email, otp);
      setSuccess("OTP verified successfully.");
      setStep(3);
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err.response?.data?.message || "Invalid or expired OTP.");
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    
    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    setError(null);
    setLoading(true);
    try {
      const res = await resetPassword(email, otp, newPassword);
      setSuccess(res.message || "Password reset successfully!");
      setStep(4);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to reset password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-background font-sans overflow-hidden">
      
      {/* Left Column: Visual/Branding (Hidden on mobile) */}
      <div className="hidden lg:flex lg:w-1/2 relative flex-col justify-between p-12 bg-surface/50 border-r border-white/5">
        <div className="absolute inset-0 bg-aurora opacity-70 pointer-events-none"></div>
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-[100px] pointer-events-none animate-pulse-slow"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary/20 rounded-full blur-[100px] pointer-events-none animate-float"></div>

        <Link href="/" className="relative z-10 flex items-center gap-3 w-fit">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-primary to-primary-hover flex items-center justify-center text-white shadow-[0_0_20px_rgba(249,115,22,0.4)]">
            <BriefcaseBusiness size={24} />
          </div>
          <span className="text-3xl font-extrabold tracking-tight text-white">
            QuickServe
          </span>
        </Link>

        <div className="relative z-10 my-auto max-w-lg">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-5xl font-bold font-heading text-foreground mb-6 leading-tight"
          >
            {t('auth_hero_forgot_title_1')} <br />
            <span className="text-gradient">{t('auth_hero_forgot_title_2')}</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-lg text-text-muted mb-8"
          >
            {t('auth_hero_forgot_desc')}
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="space-y-4"
          >
            {[t('auth_feature_bank'), t('auth_feature_2fa'), t('auth_feature_recovery')].map((feature, i) => (
              <div key={i} className="flex items-center gap-3 text-text-muted">
                <div className="bg-primary/10 rounded-full p-1 text-primary">
                  <CheckCircle2 size={18} />
                </div>
                <span className="font-medium text-foreground/80">{feature}</span>
              </div>
            ))}
          </motion.div>
        </div>

        <div className="relative z-10 text-sm text-text-muted">
          &copy; {new Date().getFullYear()} QuickServe. All rights reserved.
        </div>
      </div>

      {/* Right Column: Reset Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 lg:p-12 relative">
        <Link href="/" className="absolute top-8 left-6 lg:hidden flex items-center gap-2">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-primary to-primary-hover flex items-center justify-center text-white shadow-lg shadow-primary/20">
            <BriefcaseBusiness size={20} />
          </div>
          <span className="text-2xl font-bold text-white">QuickServe</span>
        </Link>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="w-full max-w-md"
        >
          <div className="mb-10 flex flex-col">
            <div className="w-12 h-12 rounded-2xl bg-surface border border-white/10 flex items-center justify-center text-primary mb-6 shadow-lg shadow-primary/10">
              {step === 4 ? <ShieldCheck size={24} /> : step === 3 ? <KeyRound size={24} /> : step === 2 ? <KeyRound size={24} /> : <Mail size={24} />}
            </div>
            <h2 className="text-3xl font-bold font-heading text-foreground mb-2">
              {step === 4 ? t("auth_reset_pass_title") : step === 3 ? t("auth_new_password") : step === 2 ? t("auth_verify_otp_title") : t("auth_forgot_pass_title")}
            </h2>
            <p className="text-text-muted">
              {step === 4 
                ? t("auth_reset_pass_subtitle")
                : step === 3 
                  ? t("auth_enter_new_password")
                  : step === 2 
                    ? t("auth_verify_otp_subtitle")
                    : t("auth_forgot_pass_subtitle")}
            </p>
          </div>

          <AnimatePresence mode="wait">
            {error && (
              <motion.div
                key="error"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl mb-6 text-sm flex items-center gap-2"
              >
                <div className="w-1.5 h-full rounded-full bg-red-500"></div>
                {error}
              </motion.div>
            )}

            {success && (
              <motion.div
                key="success"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="bg-green-500/10 border border-green-500/20 text-green-400 p-4 rounded-xl mb-6 text-sm flex items-center gap-2"
              >
                <div className="w-1.5 h-full rounded-full bg-green-500"></div>
                {success}
              </motion.div>
            )}
          </AnimatePresence>

          {step === 1 && (
            <form onSubmit={handleRequestOtp} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-text-muted mb-1.5 ml-1">{t("auth_email_address")}</label>
                <Input
                  type="email"
                  name="email"
                  id="email"
                  autoComplete="email"
                  placeholder={t("auth_enter_registered_email")}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full bg-surface/50 backdrop-blur-sm border-white/5 text-white focus:border-primary focus:ring-1 focus:ring-primary/50 rounded-2xl py-3 px-4 shadow-inner transition-all"
                />
              </div>
              <div className="pt-4">
                <Button 
                  type="submit" 
                  className="w-full py-4 text-lg bg-gradient-to-r from-primary to-primary-hover border-0 shadow-[0_0_20px_rgba(249,115,22,0.3)] hover:shadow-[0_0_30px_rgba(249,115,22,0.5)] transition-all duration-300 font-semibold rounded-2xl" 
                  loading={loading}
                >
                  {loading ? t("auth_sending") : t("auth_send_reset_code")}
                </Button>
              </div>
            </form>
          )}

          {step === 2 && (
            <form onSubmit={handleVerifyOtp} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-text-muted mb-1.5 ml-1">{t("auth_reset_code_otp")}</label>
                <Input
                  type="text"
                  name="otp"
                  id="otp"
                  placeholder={t("auth_eg_otp")}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  required
                  className="w-full bg-surface/50 backdrop-blur-sm border-white/5 text-white focus:border-primary focus:ring-1 focus:ring-primary/50 rounded-2xl py-3 px-4 shadow-inner transition-all text-center tracking-widest text-lg font-bold"
                />
              </div>
              <div className="pt-4">
                <Button 
                  type="submit" 
                  className="w-full py-4 text-lg bg-gradient-to-r from-primary to-primary-hover border-0 shadow-[0_0_20px_rgba(249,115,22,0.3)] hover:shadow-[0_0_30px_rgba(249,115,22,0.5)] transition-all duration-300 font-semibold rounded-2xl" 
                  loading={loading}
                >
                  {loading ? "Verifying..." : "Verify OTP"}
                </Button>
              </div>
              
              <div className="text-center mt-4">
                <button 
                  type="button" 
                  onClick={handleRequestOtp} 
                  disabled={loading}
                  className="text-sm text-primary hover:text-primary-hover disabled:opacity-50 font-medium"
                >
                  {t("auth_didnt_receive_code")}
                </button>
              </div>
            </form>
          )}

          {step === 3 && (
            <form onSubmit={handleResetPassword} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-text-muted mb-1.5 ml-1">{t("auth_new_password")}</label>
                <Input
                  type="password"
                  name="newPassword"
                  id="newPassword"
                  placeholder={t("auth_enter_new_password")}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  className="w-full bg-surface/50 backdrop-blur-sm border-white/5 text-white focus:border-primary focus:ring-1 focus:ring-primary/50 rounded-2xl py-3 px-4 shadow-inner transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-muted mb-1.5 ml-1">{t("auth_confirm_new_password_label")}</label>
                <Input
                  type="password"
                  name="confirmPassword"
                  id="confirmPassword"
                  placeholder={t("auth_confirm_new_password")}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className="w-full bg-surface/50 backdrop-blur-sm border-white/5 text-white focus:border-primary focus:ring-1 focus:ring-primary/50 rounded-2xl py-3 px-4 shadow-inner transition-all"
                />
              </div>
              <div className="pt-4">
                <Button 
                  type="submit" 
                  className="w-full py-4 text-lg bg-gradient-to-r from-primary to-primary-hover border-0 shadow-[0_0_20px_rgba(249,115,22,0.3)] hover:shadow-[0_0_30px_rgba(249,115,22,0.5)] transition-all duration-300 font-semibold rounded-2xl" 
                  loading={loading}
                >
                  {loading ? t("auth_resetting") : t("auth_reset_password_btn")}
                </Button>
              </div>
            </form>
          )}

          {step === 4 && (
            <div className="relative z-10 pt-4">
              <Button 
                onClick={() => router.push('/auth/login')}
                className="w-full py-4 text-lg bg-gradient-to-r from-primary to-primary-hover border-0 shadow-[0_0_20px_rgba(249,115,22,0.3)] hover:shadow-[0_0_30px_rgba(249,115,22,0.5)] transition-all duration-300 font-semibold rounded-2xl flex items-center justify-center gap-2"
              >
                {t("auth_go_to_login")} <ArrowRight size={20} />
              </Button>
            </div>
          )}

          {step !== 4 && (
            <div className="mt-8 text-sm">
              <Link href="/auth/login" className="text-text-muted hover:text-white transition-colors flex items-center gap-2">
                <ArrowRight size={16} className="rotate-180" /> {t("auth_back_to_login")}
              </Link>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
