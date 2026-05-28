"use client";

import { useContext, useEffect, useState } from "react";
import { Menu } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import Sidebar from "./Sidebar";
import ThemeToggle from "./ThemeToggle";
import { AuthContext } from "../context/AuthContext";

export default function DashboardLayout({ children }) {
  const { user } = useContext(AuthContext);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (!mobileMenuOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [mobileMenuOpen]);

  return (
    <div className="flex-1 flex bg-background text-foreground transition-colors duration-300 overflow-hidden relative w-full h-full">
      <div className="absolute inset-0 bg-aurora opacity-30 pointer-events-none z-0" />
      <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-primary/5 rounded-full blur-[150px] pointer-events-none z-0" />

      <div className="relative z-10 hidden md:block shrink-0">
        <Sidebar role={user?.role} />
      </div>

      <div className="flex-1 flex flex-col relative z-10 h-full min-w-0 overflow-hidden">
        <div className="md:hidden glass border-b border-border px-4 py-3 flex items-center justify-between sticky top-0 z-50">
          <button
            type="button"
            onClick={() => setMobileMenuOpen(true)}
            className="p-2.5 rounded-xl border border-border bg-surface/60 text-foreground hover:bg-surface-hover transition-colors shadow-sm"
            aria-label="Open menu"
            aria-expanded={mobileMenuOpen}
          >
            <Menu size={20} />
          </button>
          <span className="text-lg font-bold font-heading text-foreground tracking-tight truncate px-2">
            QuickServe
          </span>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <div className="w-9 h-9 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center text-primary font-bold text-sm">
              {user?.name?.[0] || "U"}
            </div>
          </div>
        </div>

        <AnimatePresence>
          {mobileMenuOpen && (
            <div className="md:hidden fixed inset-0 z-60" role="dialog" aria-modal="true" aria-label="Navigation menu">
              <motion.button
                type="button"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="absolute inset-0 bg-black/70 backdrop-blur-sm"
                onClick={() => setMobileMenuOpen(false)}
                aria-label="Close menu"
              />
              <motion.div
                initial={{ x: "-100%" }}
                animate={{ x: 0 }}
                exit={{ x: "-100%" }}
                transition={{ type: "spring", damping: 30, stiffness: 320 }}
                className="absolute top-0 left-0 bottom-0 w-[min(300px,88vw)] shadow-2xl shadow-black/40"
              >
                <Sidebar
                  role={user?.role}
                  isMobile
                  onClose={() => setMobileMenuOpen(false)}
                />
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        <main className="p-4 md:p-8 flex-1 overflow-auto custom-scrollbar relative min-w-0">
          <div className="max-w-7xl mx-auto space-y-8 pb-12">{children}</div>
        </main>
      </div>
    </div>
  );
}
