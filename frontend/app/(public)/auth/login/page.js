"use client";

import { useState, useContext } from "react";
import { AuthContext } from "../../../../src/context/AuthContext";
import Input from "../../../../src/components/Input";
import Button from "../../../../src/components/Button";
import Link from "next/link";
import { motion } from "framer-motion";
import { BriefcaseBusiness, CheckCircle2 } from "lucide-react";
import { useTranslation } from "../../../../src/hooks/useTranslation";

export default function LoginPage() {
  const { t } = useTranslation();
  const { login } = useContext(AuthContext);
  const [formData, setFormData] = useState({
    email: "",
    password: ""
  });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await login(formData.email, formData.password);
      setFormData({ email: "", password: "" });
    } catch (err) {
      const errorMessage = err.response?.data?.message || t("auth_failed_login");
      if (errorMessage.includes("EMAIL_NOT_VERIFIED|")) {
        window.location.href = `/auth/verify-email?email=${encodeURIComponent(formData.email)}`;
        return;
      }
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-background font-sans overflow-hidden">
      
      {/* Left Column: Visual/Branding (Hidden on mobile) */}
      <div className="hidden lg:flex lg:w-1/2 relative flex-col justify-between p-12 bg-surface/50 border-r border-white/5">
        {/* Animated Gradient Background */}
        <div className="absolute inset-0 bg-aurora opacity-70 pointer-events-none"></div>
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-[100px] pointer-events-none animate-pulse-slow"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary/20 rounded-full blur-[100px] pointer-events-none animate-float"></div>

        {/* Logo */}
        <Link href="/" className="relative z-10 flex items-center gap-3 w-fit">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-primary to-primary-hover flex items-center justify-center text-white shadow-[0_0_20px_rgba(249,115,22,0.4)]">
            <BriefcaseBusiness size={24} />
          </div>
          <span className="text-3xl font-extrabold tracking-tight text-white">
            QuickServe
          </span>
        </Link>

        {/* Hero Content */}
        <div className="relative z-10 my-auto max-w-lg">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-5xl font-bold font-heading text-foreground mb-6 leading-tight"
          >
            {t('auth_hero_login_title_1')} <br />
            <span className="text-gradient">{t('auth_hero_login_title_2')}</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-lg text-text-muted mb-8"
          >
            {t('auth_hero_login_desc')}
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="space-y-4"
          >
            {[t('auth_feature_verified'), t('auth_feature_secure_pay'), t('auth_feature_instant')].map((feature, i) => (
              <div key={i} className="flex items-center gap-3 text-text-muted">
                <div className="bg-primary/10 rounded-full p-1 text-primary">
                  <CheckCircle2 size={18} />
                </div>
                <span className="font-medium text-foreground/80">{feature}</span>
              </div>
            ))}
          </motion.div>
        </div>

        {/* Footer info */}
        <div className="relative z-10 text-sm text-text-muted">
          &copy; {new Date().getFullYear()} QuickServe. All rights reserved.
        </div>
      </div>

      {/* Right Column: Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 lg:p-12 relative">
        {/* Mobile Logo (visible only on mobile) */}
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
          <div className="mb-10">
            <h2 className="text-3xl font-bold font-heading text-foreground mb-2">{t("auth_login_title")}</h2>
            <p className="text-text-muted">{t("auth_login_subtitle")}</p>
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl mb-6 text-sm flex items-center gap-2"
            >
              <div className="w-1.5 h-full rounded-full bg-red-500"></div>
              {error}
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-text-muted mb-1.5 ml-1">{t("auth_email")}</label>
              <Input
                type="email"
                name="email"
                id="email"
                autoComplete="email"
                placeholder={t("auth_email_placeholder")}
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full bg-surface/50 backdrop-blur-sm border-white/5 text-white focus:border-primary focus:ring-1 focus:ring-primary/50 rounded-2xl py-3 px-4 shadow-inner transition-all"
              />
            </div>
            
            <div>
              <div className="flex justify-between items-center mb-1.5 px-1">
                <label className="text-sm font-medium text-text-muted">{t("auth_password")}</label>
                <Link href="/auth/forgot-password" className="text-sm text-primary hover:text-primary-hover font-medium transition-colors">
                  {t("auth_forgot_pass_link")}
                </Link>
              </div>
              <Input
                type="password"
                name="password"
                id="password"
                autoComplete="current-password"
                placeholder={t("auth_password_placeholder")}
                value={formData.password}
                onChange={handleChange}
                required
                className="w-full bg-surface/50 backdrop-blur-sm border-white/5 text-white focus:border-primary focus:ring-1 focus:ring-primary/50 rounded-2xl py-3 px-4 shadow-inner transition-all"
              />
            </div>

            <div className="pt-6">
              <Button 
                type="submit" 
                className="w-full py-4 text-lg bg-gradient-to-r from-primary to-primary-hover border-0 shadow-[0_0_20px_rgba(249,115,22,0.3)] hover:shadow-[0_0_30px_rgba(249,115,22,0.5)] transition-all duration-300 font-semibold rounded-2xl" 
                loading={loading}
              >
                {loading ? t("auth_logging_in") : t("auth_login_btn")}
              </Button>
            </div>
          </form>

          <div className="mt-10 text-center text-sm">
            <p className="text-text-muted">
              {t("auth_no_account")}{" "}
              <Link href="/auth/register" className="text-primary font-bold hover:text-primary-hover transition-colors">
                {t("auth_create_account_link")}
              </Link>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
