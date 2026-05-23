"use client";

import { useTranslation } from "../hooks/useTranslation";

export default function Footer() {
  const { t } = useTranslation();
  return (
    <footer className="relative bg-surface/40 backdrop-blur-md border-t border-white/5 mt-20 overflow-hidden">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent"></div>
      <div className="max-w-7xl mx-auto px-6 py-12 text-center relative z-10">
        <div className="flex justify-center space-x-8 mb-6">
          <a href="/" className="text-text-muted hover:text-white hover:drop-shadow-[0_0_8px_rgba(255,255,255,0.5)] transition-all font-medium">
            {t("footer_home")}
          </a>
          <a href="/services" className="text-text-muted hover:text-white hover:drop-shadow-[0_0_8px_rgba(255,255,255,0.5)] transition-all font-medium">
            {t("footer_services")}
          </a>
          <a href="/auth/login" className="text-text-muted hover:text-white hover:drop-shadow-[0_0_8px_rgba(255,255,255,0.5)] transition-all font-medium">
            {t("footer_login")}
          </a>
          <a href="/auth/register" className="text-text-muted hover:text-white hover:drop-shadow-[0_0_8px_rgba(255,255,255,0.5)] transition-all font-medium">
            {t("footer_register")}
          </a>
        </div>
        <p className="text-text-muted text-sm">&copy; {new Date().getFullYear()} {t("footer_copyright")}</p>
      </div>
    </footer>
  );
}
