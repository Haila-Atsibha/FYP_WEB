"use client";

import { useState, useEffect } from "react";
import api from "../../../../src/services/api";
import DashboardLayout from "../../../../src/components/DashboardLayout";
import ProtectedRoute from "../../../../src/components/ProtectedRoute";
import Button from "../../../../src/components/Button";
import Modal from "../../../../src/components/Modal";

export default function PendingUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [rejecting, setRejecting] = useState(null);
  const [reason, setReason] = useState("");

  useEffect(() => {
    api
      .get("/api/admin/pending-users")
      .then((res) => setUsers(res.data))
      .catch((e) => console.error(e))
      .finally(() => setLoading(false));
  }, []);

  const approve = async (id) => {
    await api.post(`/api/admin/approve/${id}`);
    setUsers((u) => u.filter((x) => x.id !== id));
  };

  const openReject = (user) => {
    setRejecting(user);
    setReason("");
  };

  const submitReject = async () => {
    await api.post(`/api/admin/reject/${rejecting.id}`, { reason });
    setUsers((u) => u.filter((x) => x.id !== rejecting.id));
    setRejecting(null);
  };

  return (
    <ProtectedRoute roles={["admin"]}>
      <DashboardLayout>
        <div className="space-y-8">
          <div className="flex justify-between items-center">
            <h2 className="text-3xl font-bold text-foreground">Pending Account Approvals</h2>
            <div className="text-sm font-bold text-yellow-500 bg-yellow-500/10 px-4 py-2 rounded-full border border-yellow-500/20">
              {users.length} Applications Pending
            </div>
          </div>

          {loading && (
            <div className="flex justify-center py-20">
              <div className="animate-pulse text-text-muted font-medium">Fetching applications...</div>
            </div>
          )}
          {!loading && users.length === 0 && (
            <div className="text-center py-20 bg-surface border border-border rounded-3xl">
              <p className="text-text-muted">No pending user applications at the moment.</p>
            </div>
          )}

          <div className="grid grid-cols-1 gap-4">
            {users.map((u) => (
              <div
                key={u.id}
                className="bg-surface border border-border rounded-2xl p-6 flex items-center justify-between shadow-sm hover:shadow-md transition-all group"
              >
                <div className="flex items-center space-x-5">
                  <div className="relative">
                    <img
                      src={u.profileImage}
                      alt={u.name}
                      className="w-14 h-14 rounded-full object-cover border-2 border-border group-hover:border-primary/50 transition-colors"
                    />
                    <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 border-2 border-surface rounded-full"></div>
                  </div>
                  <div>
                    <p className="font-bold text-lg text-foreground group-hover:text-primary transition-colors">{u.name}</p>
                    <p className="text-sm text-text-muted font-medium uppercase tracking-wider">{u.role}</p>
                  </div>
                </div>
                <div className="flex space-x-3">
                  <Button
                    onClick={() => approve(u.id)}
                    className="bg-green-600 hover:bg-green-700 py-2 px-5 text-sm"
                  >
                    Approve
                  </Button>
                  <Button
                    onClick={() => openReject(u)}
                    className="bg-red-600 hover:bg-red-700 py-2 px-5 text-sm"
                  >
                    Reject
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <Modal isOpen={!!rejecting} onClose={() => setRejecting(null)}>
          <h3 className="text-xl font-bold text-foreground mb-4">Reject Application</h3>
          <p className="text-text-muted text-sm mb-6">Inform the user why their application was not approved.</p>
          <textarea
            className="w-full bg-background border border-border text-foreground rounded-2xl p-4 mb-6 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all min-h-[120px]"
            placeholder="Type reason for rejection here..."
            value={reason}
            onChange={(e) => setReason(e.target.value)}
          />
          <div className="flex space-x-3">
            <Button onClick={() => setRejecting(null)} className="flex-1 bg-surface border border-border !text-foreground hover:bg-surface-hover">
              Cancel
            </Button>
            <Button onClick={submitReject} className="flex-1 bg-red-600 hover:bg-red-700">
              Confirm Rejection
            </Button>
          </div>
        </Modal>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
