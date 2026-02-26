"use client";

import { useState, useEffect } from "react";
import {
  Eye,
  CheckCircle,
  XCircle,
  FileText,
  AlertCircle,
  Clock,
  User,
  ExternalLink
} from "lucide-react";
import api from "../../../../src/services/api";
import DashboardLayout from "../../../../src/components/DashboardLayout";
import ProtectedRoute from "../../../../src/components/ProtectedRoute";
import Button from "../../../../src/components/Button";
import Modal from "../../../../src/components/Modal";
import Badge from "../../../../src/components/Badge";

export default function PendingUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [rejecting, setRejecting] = useState(null);
  const [reviewing, setReviewing] = useState(null);
  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const fetchPending = async () => {
    setLoading(true);
    try {
      const res = await api.get("/api/admin/pending-users");
      setUsers(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPending();
  }, []);

  const approve = async (id) => {
    try {
      await api.post(`/api/admin/approve/${id}`);
      setUsers((u) => u.filter((x) => x.id !== id));
      setReviewing(null);
    } catch (err) {
      alert("Failed to approve user");
    }
  };

  const openReject = (user) => {
    setRejecting(user);
    setReason("");
  };

  const submitReject = async () => {
    if (!reason.trim()) return alert("Please provide a reason");
    setSubmitting(true);
    try {
      await api.post(`/api/admin/reject/${rejecting.id}`, { rejection_reason: reason });
      setUsers((u) => u.filter((x) => x.id !== rejecting.id));
      setRejecting(null);
      setReviewing(null);
    } catch (err) {
      alert("Failed to reject user");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ProtectedRoute roles={["admin"]}>
      <DashboardLayout>
        <div className="space-y-8 pb-10">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="text-3xl font-extrabold text-foreground tracking-tight">Account Verifications</h2>
              <p className="text-text-muted mt-1">Review registration requests and verify provider credentials.</p>
            </div>
            <div className="flex items-center gap-2 text-sm font-bold text-yellow-500 bg-yellow-500/10 px-4 py-2 rounded-xl border border-yellow-500/20">
              <Clock size={16} />
              {users.length} Applications Waiting
            </div>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 bg-surface border border-border border-dashed rounded-3xl">
              <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-primary mb-4"></div>
              <p className="text-text-muted font-medium">Fetching pending applications...</p>
            </div>
          ) : users.length === 0 ? (
            <div className="text-center py-24 bg-surface border border-border rounded-3xl">
              <CheckCircle className="w-16 h-16 text-green-500/20 mx-auto mb-4" />
              <p className="text-xl font-bold text-foreground">All Caught Up!</p>
              <p className="text-text-muted">No pending user applications at the moment.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {users.map((u) => (
                <div
                  key={u.id}
                  className="bg-surface border border-border rounded-2xl p-6 flex flex-col md:flex-row md:items-center justify-between shadow-sm hover:shadow-md transition-all group gap-6"
                >
                  <div className="flex items-center space-x-5">
                    <div className="relative flex-shrink-0">
                      {u.profile_image_url ? (
                        <img
                          src={u.profile_image_url}
                          alt={u.name}
                          className="w-16 h-16 rounded-2xl object-cover border-2 border-border group-hover:border-primary/50 transition-colors shadow-sm"
                        />
                      ) : (
                        <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center text-primary border-2 border-border">
                          <User size={32} />
                        </div>
                      )}
                      <div className="absolute -top-1 -right-1 w-5 h-5 bg-yellow-500 border-2 border-surface rounded-full flex items-center justify-center">
                        <Clock size={10} className="text-white" />
                      </div>
                    </div>
                    <div>
                      <p className="font-black text-xl text-foreground group-hover:text-primary transition-colors leading-tight">{u.name}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <p className="text-sm text-text-muted font-bold truncate max-w-[150px]">{u.email}</p>
                        <span className="w-1 h-1 bg-border rounded-full"></span>
                        <Badge variant="primary" className="capitalize text-[10px] py-0 px-2">{u.role}</Badge>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
                    <Button
                      onClick={() => setReviewing(u)}
                      variant="secondary"
                      className="flex-1 md:flex-none flex items-center justify-center gap-2 whitespace-nowrap"
                    >
                      <Eye size={16} />
                      Review Documents
                    </Button>
                    <Button
                      onClick={() => approve(u.id)}
                      className="flex-1 md:flex-none bg-green-600 hover:bg-green-700 items-center justify-center gap-2"
                    >
                      <CheckCircle size={16} />
                      Approve
                    </Button>
                    <Button
                      onClick={() => openReject(u)}
                      className="flex-1 md:flex-none bg-red-600 hover:bg-red-700 items-center justify-center gap-2"
                    >
                      <XCircle size={16} />
                      Reject
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Review Modal */}
        <Modal
          isOpen={!!reviewing}
          onClose={() => setReviewing(null)}
          title="Review Identification Documents"
        >
          {reviewing && (
            <div className="space-y-6">
              <div className="flex items-center gap-4 p-4 bg-background rounded-2xl border border-border">
                <img src={reviewing.profile_image_url} className="w-12 h-12 rounded-xl object-cover" />
                <div>
                  <p className="font-bold text-foreground">{reviewing.name}</p>
                  <p className="text-xs text-text-muted uppercase tracking-tighter font-black">{reviewing.role} Application</p>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-text-muted flex items-center gap-2">
                    <FileText size={14} /> National ID Card
                  </label>
                  <div className="relative group overflow-hidden rounded-2xl border border-border aspect-video bg-background flex items-center justify-center">
                    {reviewing.national_id_url ? (
                      <>
                        <img src={reviewing.national_id_url} className="w-full h-full object-contain" />
                        <a
                          href={reviewing.national_id_url}
                          target="_blank"
                          className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white gap-2 font-bold"
                        >
                          <ExternalLink size={20} /> View Full Size
                        </a>
                      </>
                    ) : (
                      <div className="text-red-500 flex flex-col items-center gap-2">
                        <AlertCircle size={24} />
                        <span className="text-xs font-bold">Document Missing</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-text-muted flex items-center gap-2">
                    <User size={14} /> Verification Selfie
                  </label>
                  <div className="relative group overflow-hidden rounded-2xl border border-border aspect-video bg-background flex items-center justify-center">
                    {reviewing.verification_selfie_url ? (
                      <>
                        <img src={reviewing.verification_selfie_url} className="w-full h-full object-contain" />
                        <a
                          href={reviewing.verification_selfie_url}
                          target="_blank"
                          className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white gap-2 font-bold"
                        >
                          <ExternalLink size={20} /> View Full Size
                        </a>
                      </>
                    ) : (
                      <div className="text-red-500 flex flex-col items-center gap-2">
                        <AlertCircle size={24} />
                        <span className="text-xs font-bold">Selfie Missing</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex gap-3 pt-4 border-t border-border mt-6">
                <Button
                  onClick={() => openReject(reviewing)}
                  variant="outline"
                  className="flex-1 border-red-500/20 text-red-500 hover:bg-red-500/10"
                >
                  Reject Application
                </Button>
                <Button
                  onClick={() => approve(reviewing.id)}
                  className="flex-1 bg-green-600 hover:bg-green-700"
                >
                  Approve User
                </Button>
              </div>
            </div>
          )}
        </Modal>

        {/* Reject Modal */}
        <Modal isOpen={!!rejecting} onClose={() => setRejecting(null)} title="Reason for Rejection">
          <p className="text-text-muted text-sm mb-4">This message will be sent to <strong>{rejecting?.name}</strong> to help them correct their application.</p>
          <textarea
            className="w-full bg-background border border-border text-foreground rounded-2xl p-4 mb-6 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all min-h-[120px] text-sm"
            placeholder="e.g. Identity card is blurry, please re-upload a clear photo."
            value={reason}
            onChange={(e) => setReason(e.target.value)}
          />
          <div className="flex space-x-3">
            <Button onClick={() => setRejecting(null)} variant="secondary" className="flex-1">
              Go Back
            </Button>
            <Button
              onClick={submitReject}
              className="flex-1 bg-red-600 hover:bg-red-700"
              loading={submitting}
            >
              Confirm Rejection
            </Button>
          </div>
        </Modal>
      </DashboardLayout>
    </ProtectedRoute>
  );
}

