"use client";

import Link from "next/link";
import { useContext, useState, useEffect } from "react";
import { LogOut, X } from "lucide-react";
import { AuthContext } from "../context/AuthContext";
import { useTranslation } from "../hooks/useTranslation";
import api from "../services/api";

const menuByRole = {
  customer: [
    { id: "Dashboard", key: "sidebar_dashboard", href: "/customer" },
    { id: "Bookings", key: "sidebar_bookings", href: "/customer/bookings" },
    { id: "Messages", key: "sidebar_messages", href: "/customer/messages" },
    { id: "Complaints", key: "sidebar_complaints", href: "/customer/complaints" },
    { id: "Profile", key: "sidebar_profile", href: "/customer/profile" },
  ],
  provider: [
    { id: "Dashboard", key: "sidebar_dashboard", href: "/provider" },
    { id: "Bookings", key: "sidebar_bookings", href: "/provider/bookings" },
    { id: "Messages", key: "sidebar_messages", href: "/provider/messages" },
    { id: "Reviews", key: "sidebar_reviews", href: "/provider/reviews" },
    { id: "Complaints", key: "sidebar_complaints", href: "/provider/complaints" },
    { id: "Reports", key: "sidebar_reports", href: "/provider/reports" },
    { id: "Profile", key: "sidebar_profile", href: "/provider/profile" },
  ],
  admin: [
    { id: "Dashboard", key: "sidebar_dashboard", href: "/admin" },
    { id: "Bookings", key: "sidebar_bookings", href: "/admin/bookings" },
    { id: "Complaints", key: "sidebar_complaints", href: "/admin/complaints" },
    { id: "Categories", key: "sidebar_categories", href: "/admin/categories" },
    { id: "User Management", key: "sidebar_users", href: "/admin/users" },
    { id: "Subscriptions", key: "sidebar_subscriptions", href: "/admin/subscriptions" },
    { id: "Verification", key: "sidebar_verification", href: "/admin/pending" },
    { id: "AI Approved", key: "sidebar_ai_approved", href: "/admin/ai-approved" },
    { id: "Reports", key: "sidebar_reports", href: "/admin/reports" },
  ],
};

export default function Sidebar({ role, isMobile = false, onClose }) {
  const { t } = useTranslation();
  const { logout, user } = useContext(AuthContext);
  const [stats, setStats] = useState({ bookings: 0, messages: 0, reviews: 0, verification: 0 });

  const links = menuByRole[role] || [];

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get("/api/notifications/stats");
        setStats(res.data);
      } catch (err) {
        console.error("Error fetching badge stats:", err);
      }
    };

    if (user) {
      fetchStats();
      const interval = setInterval(fetchStats, 30000);
      return () => clearInterval(interval);
    }
  }, [user]);

  const getBadgeCount = (label) => {
    switch (label) {
      case "Bookings": return stats.bookings;
      case "Messages": return stats.messages;
      case "Reviews": return stats.reviews;
      case "Verification": return stats.verification;
      default: return 0;
    }
  };

  return (
    <aside
      className={`glass flex flex-col relative z-20 shadow-2xl ${
        isMobile
          ? "w-full max-h-[85vh] rounded-b-3xl border-b border-border"
          : "w-64 border-r border-border min-h-screen"
      }`}
    >
      <div className="p-8 flex-1">
        <div className="flex items-center justify-between mb-10">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-primary to-primary-hover flex items-center justify-center text-white shadow-lg shadow-primary/20">
              <span className="font-bold text-lg">Q</span>
            </div>
            <span className="text-xl font-bold font-heading text-foreground tracking-tight group-hover:text-primary transition-colors">QuickServe</span>
          </Link>
          {isMobile && (
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl border border-border text-text-muted hover:text-foreground hover:bg-surface/70 transition-colors"
              aria-label="Close menu"
            >
              <X size={18} />
            </button>
          )}
        </div>
        <h2 className="text-xs font-bold uppercase tracking-widest text-text-muted mb-6">{t("sidebar_menu_header")}</h2>
        <ul className="space-y-3">
          {links.map((l) => {
             const badgeCount = getBadgeCount(l.id);
             return (
              <li key={l.href}>
                <Link
                  href={l.href}
                  onClick={isMobile ? onClose : undefined}
                  className="flex items-center justify-between px-4 py-3 rounded-2xl hover:bg-surface-hover hover:text-foreground transition-all font-medium text-text-muted active:scale-95 group relative overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <span className="relative z-10">{t(l.key)}</span>
                  {badgeCount > 0 && (
                    <span className="relative z-10 bg-primary/20 text-primary border border-primary/30 text-[10px] font-black px-2 py-0.5 rounded-full min-w-[20px] text-center shadow-[0_0_10px_rgba(249,115,22,0.3)]">
                      {badgeCount}
                    </span>
                  )}
                </Link>
              </li>
             );
          })}
        </ul>
      </div>

      <div className="p-6 border-t border-border space-y-4 bg-surface/30">
        <div className="flex items-center gap-3 px-4 py-3 bg-surface/50 rounded-2xl border border-border backdrop-blur-md">
          <div className="w-10 h-10 rounded-xl bg-primary/10 overflow-hidden flex items-center justify-center text-primary font-black border border-primary/20 shadow-[0_0_15px_rgba(249,115,22,0.15)] shrink-0">
            {user?.profile_image_url ? (
              <img src={user.profile_image_url} alt={user?.name} className="w-full h-full object-cover" />
            ) : (
              user?.name?.[0] || 'U'
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-foreground truncate">{user?.name}</p>
            <p className="text-[10px] font-bold text-primary uppercase tracking-wider truncate">{user?.role}</p>
          </div>
        </div>
        <button
          onClick={logout}
          className="flex items-center gap-3 w-full px-4 py-3 rounded-2xl text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-all font-bold active:scale-95 group"
        >
          <LogOut size={18} className="group-hover:-translate-x-1 transition-transform" />
          {t("nav_logout")}
        </button>
      </div>
    </aside>
  );
}
