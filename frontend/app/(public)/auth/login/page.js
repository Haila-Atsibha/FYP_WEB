"use client";

import { useState, useContext } from "react";
import { AuthContext } from "../../../../src/context/AuthContext";
import Input from "../../../../src/components/Input";
import Button from "../../../../src/components/Button";
import Link from "next/link";
import { motion } from "framer-motion";
import { UtensilsCrossed } from "lucide-react";
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
      setError(err.response?.data?.message || t("auth_failed_login"));
    } finally {
      setLoading(false);
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
        {/* Decorative corner blur */}
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-primary/20 rounded-full blur-3xl pointer-events-none" />

        <div className="mb-10 text-center relative z-10 flex flex-col items-center">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-primary to-secondary flex items-center justify-center text-white mb-6 shadow-lg shadow-primary/20">
            <UtensilsCrossed size={28} />
          </div>
          <h2 className="text-3xl font-bold text-foreground mb-2">{t("auth_login_title")}</h2>
          <p className="text-text-muted">{t("auth_login_subtitle")}</p>
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

        <form onSubmit={handleSubmit} className="space-y-4 relative z-10">
          <Input
            label={t("auth_email")}
            type="email"
            name="email"
            id="email"
            autoComplete="email"
            placeholder={t("auth_email_placeholder")}
            value={formData.email}
            onChange={handleChange}
            required
            className="bg-surface/50 border-white/10 text-white focus:border-primary/50"
          />
          <Input
            label={t("auth_password")}
            type="password"
            name="password"
            id="password"
            autoComplete="current-password"
            placeholder={t("auth_password_placeholder")}
            value={formData.password}
            onChange={handleChange}
            required
            className="bg-surface/50 border-white/10 text-white focus:border-primary/50"
          />
          <div className="pt-6">
            <Button type="submit" className="w-full py-4 text-lg bg-gradient-to-r from-primary to-secondary hover:from-primary-hover hover:to-primary border-0 shadow-lg shadow-primary/20 transition-all font-semibold" loading={loading}>
              {loading ? t("auth_logging_in") : t("auth_login_btn")}
            </Button>
          </div>
        </form>

        <div className="mt-8 text-center text-sm relative z-10">
          <p className="text-text-muted">
            {t("auth_no_account")}{" "}
            <Link href="/auth/register" className="text-primary font-bold hover:text-secondary group transition-all">
              {t("auth_create_account_link")}
              <span className="block max-w-0 group-hover:max-w-full transition-all duration-300 h-0.5 bg-primary mt-0.5" />
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
