"use client";

import { useContext } from "react";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";
import { AuthContext } from "../context/AuthContext";

export default function DashboardLayout({ children }) {
  const { user } = useContext(AuthContext);

  return (
    <div className="min-h-screen flex bg-background text-foreground transition-colors duration-300">

      <Sidebar role={user?.role} />

      <div className="flex-1 flex flex-col">
        <main className="p-8 flex-1 overflow-auto bg-background">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>

      </div>
    </div>
  );
}