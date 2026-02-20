"use client";

import { useState, useEffect } from "react";
import api from "../../../src/services/api";
import DashboardLayout from "../../../src/components/DashboardLayout";
import ProtectedRoute from "../../../src/components/ProtectedRoute";
import Button from "../../../src/components/Button";
import Modal from "../../../src/components/Modal";

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
        <div className="space-y-6">
          <h2 className="text-xl font-bold">Pending Account Approvals</h2>
          {loading && <p>Loading...</p>}
          {!loading && users.length === 0 && <p>No pending users.</p>}
          <div className="space-y-4">
            {users.map((u) => (
              <div
                key={u.id}
                className="bg-white rounded-xl shadow-md p-4 flex items-center justify-between"
              >
                <div className="flex items-center space-x-4">
                  <img
                    src={u.profileImage}
                    alt={u.name}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  <div>
                    <p className="font-semibold">{u.name}</p>
                    <p className="text-sm text-gray-500">{u.role}</p>
                  </div>
                </div>
                <div className="space-x-2">
                  <Button onClick={() => approve(u.id)} className="bg-green-500">
                    Approve
                  </Button>
                  <Button
                    onClick={() => openReject(u)}
                    className="bg-red-500"
                  >
                    Reject
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
        <Modal isOpen={!!rejecting} onClose={() => setRejecting(null)}>
          <h3 className="text-lg font-semibold mb-2">Reject User</h3>
          <textarea
            className="w-full border rounded-xl p-2 mb-4"
            placeholder="Reason for rejection"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
          />
          <Button onClick={submitReject} className="w-full">
            Send Rejection
          </Button>
        </Modal>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
