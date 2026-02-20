"use client";

import { useContext } from "react";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";
import { AuthContext } from "../context/AuthContext";

export default function DashboardLayout({ children }) {
  const { user } = useContext(AuthContext);

  return (
    <div className="min-h-screen flex bg-gray-50">
      <Sidebar role={user?.role} />
      <div className="flex-1 flex flex-col">
        <Navbar />
        <main className="p-6 bg-gray-50 flex-1 overflow-auto">{children}</main>
      </div>
    </div>
  );
}
