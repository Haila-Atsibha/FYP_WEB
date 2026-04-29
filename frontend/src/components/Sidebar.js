"use client";

import Link from "next/link";
import { useContext, useState, useEffect } from "react";
import { LogOut } from "lucide-react";
import { AuthContext } from "../context/AuthContext";
import { useTranslation } from "../hooks/useTranslation";
import api from "../services/api";

const menuByRole = {
  customer: [
    { id: "Dashboard", key: "sidebar_dashboard", href: "/customer" },
    { id: "Bookings", key: "sidebar_bookings", href: "/customer/bookings" },
    { id: "Messages", key: "sidebar_messages", href: "/customer/messages" },
    { id: "Profile", key: "sidebar_profile", href: "/customer/profile" },
  ],
  provider: [
    { id: "Dashboard", key: "sidebar_dashboard", href: "/provider" },
    { id: "Bookings", key: "sidebar_bookings", href: "/provider/bookings" },
    { id: "Messages", key: "sidebar_messages", href: "/provider/messages" },
    { id: "Reviews", key: "sidebar_reviews", href: "/provider/reviews" },
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
  ],
};

export default function Sidebar({ role }) {
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
    <aside className="w-64 bg-surface border-r border-border min-h-screen transition-colors duration-300 flex flex-col">
      <div className="p-8 flex-1">
        <h2 className="text-sm font-bold uppercase tracking-widest text-text-muted mb-8">{t("sidebar_menu_header")}</h2>
        <ul className="space-y-2">
          {links.map((l) => (
            <li key={l.href}>
              <Link
                href={l.href}
                className="flex items-center justify-between px-4 py-3 rounded-xl hover:bg-primary/10 hover:text-primary transition-all font-medium text-foreground/80 active:scale-95 group"
              >
                <span>{t(l.key)}</span>
                {getBadgeCount(l.id) > 0 && (
                  <span className="bg-primary text-white text-[10px] font-black px-2 py-0.5 rounded-full min-w-[20px] text-center shadow-sm group-hover:scale-110 transition-transform">
                    {getBadgeCount(l.id)}
                  </span>
                )}
              </Link>
            </li>
          ))}
        </ul>
      </div>

      <div className="p-8 border-t border-border space-y-4">
        <div className="flex items-center gap-3 px-4 py-2 bg-surface-hover rounded-2xl border border-border/50">
          <div className="w-10 h-10 rounded-xl bg-primary/10 overflow-hidden flex items-center justify-center text-primary font-black border border-primary/20 shadow-inner">
            {user?.profile_image_url ? (
              <img src={user.profile_image_url} alt={user?.name} className="w-full h-full object-cover" />
            ) : (
              user?.name?.[0] || 'U'
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-black text-foreground truncate">{user?.name}</p>
            <p className="text-[10px] font-bold text-text-muted uppercase tracking-wider truncate">{user?.role}</p>
          </div>
        </div>
        <button
          onClick={logout}
          className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-red-500 hover:bg-red-500/10 transition-all font-bold active:scale-95 group"
        >
          <LogOut size={18} className="group-hover:-translate-x-1 transition-transform" />
          {t("nav_logout")}
        </button>
      </div>
    </aside>
  );
}
