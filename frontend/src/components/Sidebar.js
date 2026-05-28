"use client";

import Link from "next/link";
import { useContext, useState, useEffect } from "react";
import { usePathname } from "next/navigation";
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

function isActivePath(pathname, href) {
  if (href === "/customer" || href === "/provider" || href === "/admin") {
    return pathname === href;
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}

export default function Sidebar({ role, isMobile = false, onClose }) {
  const { t } = useTranslation();
  const { logout, user } = useContext(AuthContext);
  const pathname = usePathname();
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
      case "Bookings":
        return stats.bookings;
      case "Messages":
        return stats.messages;
      case "Reviews":
        return stats.reviews;
      case "Verification":
        return stats.verification;
      default:
        return 0;
    }
  };

  return (
    <aside
      className={`flex flex-col h-full bg-surface border-border shadow-2xl ${
        isMobile ? "w-full border-r" : "w-64 min-h-screen border-r"
      }`}
    >
      <div className={`shrink-0 border-b border-border ${isMobile ? "px-5 pt-5 pb-4" : "p-8 pb-6"}`}>
        <div className="flex items-center justify-between gap-3">
          <Link href="/" className="flex items-center gap-2.5 group min-w-0" onClick={isMobile ? onClose : undefined}>
            <div className="w-9 h-9 rounded-xl bg-linear-to-tr from-primary to-primary-hover flex items-center justify-center text-white shadow-lg shadow-primary/25 shrink-0">
              <span className="font-bold text-base">Q</span>
            </div>
            <span className="text-lg font-bold font-heading text-foreground tracking-tight group-hover:text-primary transition-colors truncate">
              QuickServe
            </span>
          </Link>
          {isMobile && (
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl border border-border bg-background/50 text-text-muted hover:text-foreground hover:bg-surface-hover transition-colors shrink-0"
              aria-label="Close menu"
            >
              <X size={18} />
            </button>
          )}
        </div>
        {isMobile && (
          <p className="text-[11px] font-semibold uppercase tracking-widest text-text-muted mt-4">
            {t("sidebar_menu_header")}
          </p>
        )}
      </div>

      <div className={`flex-1 overflow-y-auto custom-scrollbar ${isMobile ? "px-3 py-2" : "px-4 py-2"}`}>
        {!isMobile && (
          <h2 className="text-xs font-bold uppercase tracking-widest text-text-muted mb-4 px-4">
            {t("sidebar_menu_header")}
          </h2>
        )}
        <ul className="space-y-1">
          {links.map((l) => {
            const badgeCount = getBadgeCount(l.id);
            const active = isActivePath(pathname, l.href);
            return (
              <li key={l.href}>
                <Link
                  href={l.href}
                  onClick={isMobile ? onClose : undefined}
                  className={`flex items-center justify-between gap-2 px-4 py-3 rounded-2xl transition-all font-medium active:scale-[0.98] ${
                    active
                      ? "bg-primary/15 text-primary border border-primary/25 shadow-[0_0_20px_rgba(139,92,246,0.12)]"
                      : "text-text-muted hover:bg-surface-hover hover:text-foreground border border-transparent"
                  }`}
                >
                  <span>{t(l.key)}</span>
                  {badgeCount > 0 && (
                    <span className="bg-primary/20 text-primary border border-primary/30 text-[10px] font-black px-2 py-0.5 rounded-full min-w-[20px] text-center">
                      {badgeCount}
                    </span>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </div>

      <div className={`shrink-0 border-t border-border bg-surface/80 backdrop-blur-md space-y-3 ${isMobile ? "p-4" : "p-6"}`}>
        <div className="flex items-center gap-3 px-3 py-3 bg-background/50 rounded-2xl border border-border">
          <div className="w-10 h-10 rounded-xl bg-primary/10 overflow-hidden flex items-center justify-center text-primary font-black border border-primary/20 shrink-0">
            {user?.profile_image_url ? (
              <img src={user.profile_image_url} alt={user?.name} className="w-full h-full object-cover" />
            ) : (
              user?.name?.[0] || "U"
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-foreground truncate">{user?.name}</p>
            <p className="text-[10px] font-bold text-primary uppercase tracking-wider truncate">{user?.role}</p>
          </div>
        </div>
        <button
          onClick={() => {
            onClose?.();
            logout();
          }}
          className="flex items-center justify-center gap-2 w-full px-4 py-3 rounded-2xl text-red-400 hover:text-red-300 bg-red-500/5 hover:bg-red-500/15 border border-red-500/20 transition-all font-bold active:scale-[0.98]"
        >
          <LogOut size={18} />
          {t("nav_logout")}
        </button>
      </div>
    </aside>
  );
}
