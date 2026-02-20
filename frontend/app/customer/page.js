"use client";

import ProtectedRoute from "../../src/components/ProtectedRoute";
import DashboardLayout from "../../src/components/DashboardLayout";

export default function CustomerDashboard() {
  return (
    <ProtectedRoute roles={["customer"]}>
      <DashboardLayout>
        <div className="space-y-6">
          <h1 className="text-2xl font-bold">Welcome to your dashboard</h1>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl shadow-md p-6">
              <h3 className="font-semibold mb-2">Booking History</h3>
              <p>Coming soon...</p>
            </div>
            <div className="bg-white rounded-xl shadow-md p-6">
              <h3 className="font-semibold mb-2">Recent Services</h3>
              <p>Coming soon...</p>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-md p-6">
            <h3 className="font-semibold mb-2">Messages</h3>
            <p>Coming soon...</p>
          </div>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
