"use client";

import Link from "next/link";
import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import ThemeToggle from "./ThemeToggle";
import { User, LogOut, BriefcaseBusiness, Globe, Menu, X } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { useTranslation } from "../hooks/useTranslation";

export default function Navbar() {
  const { user, logout } = useContext(AuthContext);
  const { t, language, toggleLanguage } = useTranslation();
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    if (!mobileOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [mobileOpen]);

  const closeMenu = () => setMobileOpen(false);

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="sticky top-0 z-50 glass border-b border-border shadow-2xl"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 sm:py-4 flex justify-between items-center gap-3">
        <Link href="/" className="flex items-center gap-2 group min-w-0">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-linear-to-tr from-primary to-secondary flex items-center justify-center text-white shadow-lg shadow-primary/20 shrink-0">
            <BriefcaseBusiness size={18} />
          </div>
          <span className="text-xl sm:text-2xl font-extrabold tracking-tight text-foreground truncate">
            QuickServe
          </span>
        </Link>

        <div className="hidden md:flex items-center space-x-8">
          <Link href="/services" className="text-text-muted hover:text-foreground transition-colors font-medium">
            {t("nav_menu")}
          </Link>

          <ThemeToggle />

          <button
            onClick={toggleLanguage}
            className="flex items-center gap-1 text-text-muted hover:text-foreground transition-colors font-medium"
            title="Toggle Language"
          >
            <Globe size={18} />
            {language === "en" ? "EN" : "አማ"}
          </button>

          {user ? (
            <div className="flex items-center space-x-6 border-l border-border pl-6">
              <Link
                href={`/${user.role}`}
                className="flex items-center gap-2 text-text-muted hover:text-foreground transition-colors font-medium group"
              >
                <div className="w-9 h-9 rounded-full bg-surface border border-border overflow-hidden flex items-center justify-center text-primary group-hover:scale-110 transition-transform shadow-lg">
                  {user?.profile_image_url ? (
                    <img src={user.profile_image_url} alt={user?.name} className="w-full h-full object-cover" />
                  ) : (
                    <User size={16} />
                  )}
                </div>
                {t("nav_dashboard")}
              </Link>
              <button
                onClick={logout}
                className="flex items-center gap-2 text-text-muted hover:text-red-500 transition-colors font-medium"
              >
                <LogOut size={18} />
                {t("nav_logout")}
              </button>
            </div>
          ) : (
            <div className="flex items-center space-x-4 border-l border-border pl-6">
              <Link
                href="/auth/login"
                className="text-text-muted hover:text-foreground transition-colors font-medium"
              >
                {t("nav_login")}
              </Link>
              <Link href="/auth/register" className="relative group">
                <div className="absolute inset-0 bg-primary/40 rounded-full blur-sm group-hover:bg-primary/60 transition-all duration-300" />
                <div className="relative bg-linear-to-r from-primary to-secondary hover:from-primary-hover hover:to-primary text-white px-6 py-2.5 rounded-full shadow-lg font-semibold active:scale-95 transition-all duration-300 border border-white/10">
                  {t("nav_join")}
                </div>
              </Link>
            </div>
          )}
        </div>

        <button
          type="button"
          onClick={() => setMobileOpen(true)}
          className="md:hidden p-2.5 rounded-xl border border-border bg-surface/60 text-foreground hover:bg-surface-hover transition-colors shadow-sm"
          aria-label="Open navigation menu"
          aria-expanded={mobileOpen}
        >
          <Menu size={20} />
        </button>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <div className="md:hidden fixed inset-0 z-60" role="dialog" aria-modal="true" aria-label="Navigation menu">
            <motion.button
              type="button"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/70 backdrop-blur-sm"
              onClick={closeMenu}
              aria-label="Close menu"
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 320 }}
              className="absolute top-0 right-0 bottom-0 w-[min(300px,88vw)] bg-surface border-l border-border shadow-2xl flex flex-col"
            >
              <div className="flex items-center justify-between px-5 py-4 border-b border-border">
                <span className="text-sm font-bold uppercase tracking-widest text-text-muted">Menu</span>
                <button
                  type="button"
                  onClick={closeMenu}
                  className="p-2 rounded-xl border border-border text-text-muted hover:text-foreground hover:bg-surface-hover transition-colors"
                  aria-label="Close menu"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto custom-scrollbar px-4 py-5 flex flex-col gap-1">
                <Link
                  href="/services"
                  onClick={closeMenu}
                  className="px-4 py-3.5 rounded-2xl text-foreground font-medium hover:bg-surface-hover transition-colors"
                >
                  {t("nav_menu")}
                </Link>

                <div className="flex items-center justify-between px-4 py-3 rounded-2xl bg-background/50 border border-border my-2">
                  <ThemeToggle />
                  <button
                    onClick={toggleLanguage}
                    className="flex items-center gap-2 text-sm font-medium text-text-muted hover:text-foreground transition-colors"
                  >
                    <Globe size={18} />
                    {language === "en" ? "English" : "አማርኛ"}
                  </button>
                </div>

                {user ? (
                  <>
                    <Link
                      href={`/${user.role}`}
                      onClick={closeMenu}
                      className="flex items-center gap-3 px-4 py-3.5 rounded-2xl text-foreground font-medium hover:bg-surface-hover transition-colors"
                    >
                      <div className="w-9 h-9 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary overflow-hidden">
                        {user?.profile_image_url ? (
                          <img src={user.profile_image_url} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <User size={16} />
                        )}
                      </div>
                      {t("nav_dashboard")}
                    </Link>
                    <button
                      onClick={() => {
                        closeMenu();
                        logout();
                      }}
                      className="flex items-center gap-3 w-full px-4 py-3.5 rounded-2xl text-red-400 font-medium bg-red-500/5 border border-red-500/20 hover:bg-red-500/15 transition-colors mt-2"
                    >
                      <LogOut size={18} />
                      {t("nav_logout")}
                    </button>
                  </>
                ) : (
                  <div className="flex flex-col gap-2 mt-2">
                    <Link
                      href="/auth/login"
                      onClick={closeMenu}
                      className="px-4 py-3.5 rounded-2xl text-center font-medium text-foreground border border-border hover:bg-surface-hover transition-colors"
                    >
                      {t("nav_login")}
                    </Link>
                    <Link
                      href="/auth/register"
                      onClick={closeMenu}
                      className="px-4 py-3.5 rounded-2xl text-center font-semibold text-white bg-linear-to-r from-primary to-secondary shadow-lg shadow-primary/20"
                    >
                      {t("nav_join")}
                    </Link>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}
