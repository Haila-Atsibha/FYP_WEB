"use client";

import Link from "next/link";
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { User, LogOut, LayoutDashboard, UtensilsCrossed, Globe } from "lucide-react";
import { motion } from "framer-motion";
import { useTranslation } from "../hooks/useTranslation";

export default function Navbar() {
  const { user, logout } = useContext(AuthContext);
  const { t, language, toggleLanguage } = useTranslation();

  return (
    <motion.nav 
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="sticky top-0 z-50 glass border-b !border-white/5 shadow-2xl"
    >
      <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-primary to-secondary flex items-center justify-center text-white shadow-lg shadow-primary/20 group-hover:shadow-primary/40 transition-all duration-300">
            <UtensilsCrossed size={20} />
          </div>
          <span className="text-2xl font-extrabold tracking-tight text-white group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-primary group-hover:to-accent transition-all duration-300">
            QuickServe
          </span>
        </Link>
        
        <div className="flex items-center space-x-8">
          <Link href="/services" className="text-text-muted hover:text-white transition-colors font-medium">
            {t("nav_menu")}
          </Link>
          <Link href="/track" className="text-text-muted hover:text-white transition-colors font-medium">
            {t("nav_track")}
          </Link>

          <button 
            onClick={toggleLanguage} 
            className="flex items-center gap-1 text-text-muted hover:text-white transition-colors font-medium"
            title="Toggle Language"
          >
            <Globe size={18} />
            {language === 'en' ? 'EN' : 'አማ'}
          </button>

          {user ? (
            <div className="flex items-center space-x-6 border-l border-white/10 pl-6">
              <Link
                href={`/${user.role}`}
                className="flex items-center gap-2 text-text-muted hover:text-white transition-colors font-medium group"
              >
                <div className="w-9 h-9 rounded-full bg-surface border border-white/10 overflow-hidden flex items-center justify-center text-primary group-hover:scale-110 transition-transform shadow-lg">
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
                className="flex items-center gap-2 text-red-400 hover:text-red-300 transition-colors font-medium"
              >
                <LogOut size={18} />
                {t("nav_logout")}
              </button>
            </div>
          ) : (
            <div className="flex items-center space-x-4 border-l border-white/10 pl-6">
              <Link href="/auth/login" className="text-text-muted hover:text-white transition-colors font-medium">
                {t("nav_login")}
              </Link>
              <Link href="/auth/register" className="relative group">
                <div className="absolute inset-0 bg-primary/40 rounded-full blur-sm group-hover:bg-primary/60 transition-all duration-300"></div>
                <div className="relative bg-gradient-to-r from-primary to-secondary hover:from-primary-hover hover:to-primary text-white px-6 py-2.5 rounded-full shadow-lg font-semibold active:scale-95 transition-all duration-300 border border-white/10">
                  {t("nav_join")}
                </div>
              </Link>
            </div>
          )}
        </div>
      </div>
    </motion.nav>
  );
}
