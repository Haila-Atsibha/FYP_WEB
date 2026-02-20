"use client";

import ProtectedRoute from "../../src/components/ProtectedRoute";
import DashboardLayout from "../../src/components/DashboardLayout";

export default function AdminDashboard() {
  return (
    <ProtectedRoute roles={["admin"]}>
      <DashboardLayout>
        <div className="space-y-6">
          <h1 className="text-2xl font-bold">Admin Dashboard</h1>
          <div className="bg-white rounded-xl shadow-md p-6">
            <h3 className="font-semibold mb-2">Pending Users</h3>
            <p>Review pending accounts in the dedicated section.</p>
          </div>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
