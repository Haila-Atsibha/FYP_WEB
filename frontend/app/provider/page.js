"use client";

import ProtectedRoute from "../../src/components/ProtectedRoute";
import DashboardLayout from "../../src/components/DashboardLayout";

export default function ProviderDashboard() {
  return (
    <ProtectedRoute roles={["provider"]}>
      <DashboardLayout>
        <div className="space-y-6">
          <h1 className="text-2xl font-bold">Provider Dashboard</h1>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-white rounded-xl shadow-md p-6">
              <h3 className="font-semibold mb-2">Stats</h3>
              <p>Overview coming soon...</p>
            </div>
            <div className="bg-white rounded-xl shadow-md p-6">
              <h3 className="font-semibold mb-2">Manage Services</h3>
              <p>Coming soon...</p>
            </div>
            <div className="bg-white rounded-xl shadow-md p-6">
              <h3 className="font-semibold mb-2">Manage Bookings</h3>
              <p>Coming soon...</p>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-md p-6">
            <h3 className="font-semibold mb-2">Earnings Summary</h3>
            <p>Coming soon...</p>
          </div>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
