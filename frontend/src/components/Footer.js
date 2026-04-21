"use client";

import { useTranslation } from "../hooks/useTranslation";

export default function Footer() {
  const { t } = useTranslation();
  return (
    <footer className="bg-surface border-t border-border mt-20 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-6 py-12 text-center">
        <div className="flex justify-center space-x-8 mb-6">
          <a href="/" className="text-text-muted hover:text-primary transition-colors font-medium">
            {t("footer_home")}
          </a>
          <a href="/services" className="text-text-muted hover:text-primary transition-colors font-medium">
            {t("footer_services")}
          </a>
          <a href="/auth/login" className="text-text-muted hover:text-primary transition-colors font-medium">
            {t("footer_login")}
          </a>
          <a href="/auth/register" className="text-text-muted hover:text-primary transition-colors font-medium">
            {t("footer_register")}
          </a>
        </div>
        <p className="text-text-muted text-sm">&copy; {new Date().getFullYear()} {t("footer_copyright")}</p>
      </div>
    </footer>
  );
}
