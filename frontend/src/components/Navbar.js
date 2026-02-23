"use client";

import Link from "next/link";
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { User, LogOut, LayoutDashboard } from "lucide-react";

export default function Navbar() {
  const { user, logout } = useContext(AuthContext);

  return (
    <nav className="sticky top-0 z-50 glass border-b border-border shadow-sm">
      <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
        <Link href="/" className="text-2xl font-bold text-primary hover:opacity-80 transition-opacity">
          QuickServe
        </Link>
        <div className="flex items-center space-x-6">
          <Link href="/services" className="text-foreground/80 hover:text-primary transition-colors font-medium">
            Services
          </Link>

          {user ? (
            <div className="flex items-center space-x-4">
              <Link
                href={`/${user.role}`}
                className="flex items-center gap-2 text-foreground/80 hover:text-primary transition-colors font-medium"
              >
                <LayoutDashboard size={18} />
                Dashboard
              </Link>
              <button
                onClick={logout}
                className="flex items-center gap-2 text-red-500 hover:text-red-600 transition-colors font-medium"
              >
                <LogOut size={18} />
                Logout
              </button>
            </div>
          ) : (
            <>
              <Link href="/auth/login" className="text-foreground/80 hover:text-primary transition-colors font-medium">
                Login
              </Link>
              <Link href="/auth/register" className="bg-primary hover:bg-primary-hover text-white px-5 py-2 rounded-full transition-all shadow-md hover:shadow-lg active:scale-95 font-medium">
                Register
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
