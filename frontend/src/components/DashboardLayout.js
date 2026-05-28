"use client";

import { useContext, useState } from "react";
import { Menu } from "lucide-react";
import Sidebar from "./Sidebar";
import ThemeToggle from "./ThemeToggle";
import { AuthContext } from "../context/AuthContext";

export default function DashboardLayout({ children }) {
  const { user } = useContext(AuthContext);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="flex-1 flex bg-background text-foreground transition-colors duration-300 overflow-hidden relative w-full h-full">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-aurora opacity-30 pointer-events-none z-0"></div>
      <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-primary/5 rounded-full blur-[150px] pointer-events-none z-0"></div>

      {/* Sidebar */}
      <div className="relative z-10 hidden md:block">
        <Sidebar role={user?.role} />
      </div>

      <div className="flex-1 flex flex-col relative z-10 h-full overflow-hidden">
        {/* Mobile Header */}
        <div className="md:hidden glass border-b border-border p-4 flex items-center justify-between sticky top-0 z-50">
           <button
             type="button"
             onClick={() => setMobileMenuOpen(true)}
             className="p-2 rounded-xl border border-border text-text-muted hover:text-foreground hover:bg-surface/70 transition-colors"
             aria-label="Open menu"
           >
             <Menu size={18} />
           </button>
           <span className="text-xl font-bold font-heading text-foreground tracking-tight">QuickServe</span>
           <div className="flex items-center gap-3">
             <ThemeToggle />
             <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
               {user?.name?.[0] || 'U'}
             </div>
           </div>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden fixed inset-0 z-60">
            <button
              type="button"
              className="absolute inset-0 bg-black/60"
              onClick={() => setMobileMenuOpen(false)}
              aria-label="Close menu backdrop"
            />
            <div className="absolute top-0 left-0 right-0">
              <Sidebar
                role={user?.role}
                isMobile
                onClose={() => setMobileMenuOpen(false)}
              />
            </div>
          </div>
        )}

        {/* Main Content Area */}
        <main className="p-4 md:p-8 flex-1 overflow-auto custom-scrollbar relative">
          <div className="max-w-7xl mx-auto space-y-8 pb-12">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}