"use client";

import Link from "next/link";
import { useContext } from "react";
import { LogOut } from "lucide-react";
import { AuthContext } from "../context/AuthContext";

const menuByRole = {
  customer: [
    { label: "Dashboard", href: "/customer" },
    { label: "Bookings", href: "/customer/bookings" },
    { label: "Messages", href: "/customer/messages" },
  ],
  provider: [
    { label: "Dashboard", href: "/provider" },
    { label: "Bookings", href: "/provider/bookings" },
    { label: "Reviews", href: "/provider/reviews" },
    { label: "Profile", href: "/provider/profile" },
  ],
  admin: [
    { label: "Dashboard", href: "/admin" },
    { label: "Bookings", href: "/admin/bookings" },
    { label: "Complaints", href: "/admin/complaints" },
    { label: "Categories", href: "/admin/categories" },
    { label: "User Management", href: "/admin/users" },
    { label: "Subscriptions", href: "/admin/subscriptions" },
    { label: "Verification", href: "/admin/pending" },
  ],
};

export default function Sidebar({ role }) {
  const { logout } = useContext(AuthContext);
  const links = menuByRole[role] || [];

  return (
    <aside className="w-64 bg-surface border-r border-border min-h-screen transition-colors duration-300 flex flex-col">
      <div className="p-8 flex-1">
        <h2 className="text-sm font-bold uppercase tracking-widest text-text-muted mb-8">Menu</h2>
        <ul className="space-y-2">
          {links.map((l) => (
            <li key={l.href}>
              <Link
                href={l.href}
                className="block px-4 py-3 rounded-xl hover:bg-primary/10 hover:text-primary transition-all font-medium text-foreground/80 active:scale-95"
              >
                {l.label}
              </Link>
            </li>
          ))}
        </ul>
      </div>

      <div className="p-8 border-t border-border">
        <button
          onClick={logout}
          className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-red-500 hover:bg-red-500/10 transition-all font-bold active:scale-95"
        >
          <LogOut size={18} />
          Logout
        </button>
      </div>
    </aside>
  );
}
