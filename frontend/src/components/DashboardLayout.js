"use client";

import { useContext } from "react";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";
import { AuthContext } from "../context/AuthContext";

export default function DashboardLayout({ children }) {
  const { user } = useContext(AuthContext);

  return (
    <div className="min-h-screen flex bg-background text-foreground transition-colors duration-300 overflow-hidden relative">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-aurora opacity-30 pointer-events-none z-0"></div>
      <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-primary/5 rounded-full blur-[150px] pointer-events-none z-0"></div>

      {/* Sidebar */}
      <div className="relative z-10 hidden md:block">
        <Sidebar role={user?.role} />
      </div>

      <div className="flex-1 flex flex-col relative z-10 h-screen overflow-hidden">
        {/* Mobile Header */}
        <div className="md:hidden glass border-b border-white/5 p-4 flex items-center justify-between sticky top-0 z-50">
           <span className="text-xl font-bold font-heading text-white tracking-tight">QuickServe</span>
           <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
             {user?.name?.[0] || 'U'}
           </div>
        </div>

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