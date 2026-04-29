"use client";

import { useEffect, useState } from "react";
import { Eye, CheckCircle, User, ExternalLink, ShieldCheck } from "lucide-react";
import api from "../../../../src/services/api";
import DashboardLayout from "../../../../src/components/DashboardLayout";
import ProtectedRoute from "../../../../src/components/ProtectedRoute";
import Modal from "../../../../src/components/Modal";
import Badge from "../../../../src/components/Badge";
import Button from "../../../../src/components/Button";

export default function AiApprovedUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reviewing, setReviewing] = useState(null);
  const [error, setError] = useState(null);

  const fetchAiApproved = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get("/api/admin/ai-approved-users");
      setUsers(res.data || []);
    } catch (e) {
      console.error(e);
      setError(e?.response?.data?.message || e?.message || "Failed to load AI approved users.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAiApproved();
  }, []);

  return (
    <ProtectedRoute roles={["admin"]}>
      <DashboardLayout>
        <div className="space-y-8 pb-10">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="text-3xl font-extrabold text-foreground tracking-tight">AI Approved Providers</h2>
              <p className="text-text-muted mt-1">Providers that were automatically approved by AI (for audit if needed).</p>
            </div>
            <div className="flex items-center gap-2 text-sm font-bold text-green-600 bg-green-500/10 px-4 py-2 rounded-xl border border-green-500/20">
              <ShieldCheck size={16} />
              {users.length} AI Approvals
            </div>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 bg-surface border border-border border-dashed rounded-3xl">
              <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-primary mb-4"></div>
              <p className="text-text-muted font-medium">Fetching AI approved users...</p>
            </div>
          ) : error ? (
            <div className="text-center py-16 bg-surface border border-border rounded-3xl">
              <p className="text-lg font-bold text-foreground">Couldn’t load AI approved users</p>
              <p className="text-text-muted mt-2 max-w-xl mx-auto text-sm">{error}</p>
              <Button onClick={fetchAiApproved} className="mt-6">
                Retry
              </Button>
            </div>
          ) : users.length === 0 ? (
            <div className="text-center py-24 bg-surface border border-border rounded-3xl">
              <CheckCircle className="w-16 h-16 text-green-500/20 mx-auto mb-4" />
              <p className="text-xl font-bold text-foreground">No AI Approved Users Yet</p>
              <p className="text-text-muted">Once providers are auto-approved, they will appear here.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {users.map((u) => (
                <div
                  key={u.id}
                  className="bg-surface border border-border rounded-2xl p-6 flex flex-col md:flex-row md:items-center justify-between shadow-sm hover:shadow-md transition-all group gap-6"
                >
                  <div className="flex items-center space-x-5">
                    <div className="relative shrink-0">
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
                      <div className="absolute -top-1 -right-1 w-5 h-5 bg-green-600 border-2 border-surface rounded-full flex items-center justify-center">
                        <ShieldCheck size={10} className="text-white" />
                      </div>
                    </div>
                    <div>
                      <p className="font-black text-xl text-foreground group-hover:text-primary transition-colors leading-tight">{u.name}</p>
                      <p className="text-sm text-text-muted font-bold truncate max-w-[250px]">{u.email}</p>
                      <div className="mt-2 flex items-center gap-2 text-xs">
                        <Badge variant="success" className="capitalize">AI: matched</Badge>
                        {u.ai_verification_score !== null && u.ai_verification_score !== undefined && (
                          <Badge variant="info">{Number(u.ai_verification_score).toFixed(2)}%</Badge>
                        )}
                      </div>
                      {u.ai_verification_message && (
                        <p className="text-xs text-text-muted mt-2 max-w-[520px]">{u.ai_verification_message}</p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-3 w-full md:w-auto">
                    <Button
                      onClick={() => setReviewing(u)}
                      variant="secondary"
                      className="flex-1 md:flex-none flex items-center justify-center gap-2 whitespace-nowrap"
                    >
                      <Eye size={16} />
                      Review Documents
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <Modal isOpen={!!reviewing} onClose={() => setReviewing(null)} title="AI Approved - Document Review">
          {reviewing && (
            <div className="space-y-6">
              <div className="rounded-2xl border border-border bg-background p-4">
                <p className="text-sm font-bold text-foreground mb-1">AI Verification Result</p>
                <p className="text-xs text-text-muted capitalize">
                  Status: {reviewing.ai_verification_status || "matched"}
                  {reviewing.ai_verification_score !== null && reviewing.ai_verification_score !== undefined
                    ? ` (${Number(reviewing.ai_verification_score).toFixed(2)}%)`
                    : ""}
                </p>
                <p className="text-xs text-text-muted mt-1">
                  {reviewing.ai_verification_message || "No AI verification message available."}
                </p>
              </div>

              <div className="space-y-2">
                <p className="text-sm font-bold text-foreground">National ID</p>
                <div className={`grid gap-4 ${reviewing.national_id_url && reviewing.national_id_url.split(',').length > 1 ? 'grid-cols-2' : 'grid-cols-1'}`}>
                  {reviewing.national_id_url ? (
                    reviewing.national_id_url.split(',').map((url, idx) => (
                      <div key={idx} className="relative group overflow-hidden rounded-2xl border border-border aspect-[4/3] bg-background flex items-center justify-center">
                        <img src={url} className="w-full h-full object-contain" />
                        <a
                          href={url}
                          target="_blank"
                          rel="noreferrer"
                          className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white gap-2 font-bold"
                        >
                          <ExternalLink size={20} /> View Full Size
                        </a>
                      </div>
                    ))
                  ) : (
                    <div className="rounded-2xl border border-border aspect-[4/3] bg-background flex items-center justify-center text-text-muted">
                      Missing
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-sm font-bold text-foreground">Verification Selfie</p>
                <div className="relative group overflow-hidden rounded-2xl border border-border aspect-video bg-background flex items-center justify-center">
                  {reviewing.verification_selfie_url ? (
                    <>
                      <img src={reviewing.verification_selfie_url} className="w-full h-full object-contain" />
                      <a
                        href={reviewing.verification_selfie_url}
                        target="_blank"
                        rel="noreferrer"
                        className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white gap-2 font-bold"
                      >
                        <ExternalLink size={20} /> View Full Size
                      </a>
                    </>
                  ) : (
                    <div className="text-text-muted">Missing</div>
                  )}
                </div>
              </div>

              <div className="text-xs text-text-muted">
                Note: Educational documents are shown in the pending verification screen. This AI-approved list is kept lightweight for speed.
              </div>
            </div>
          )}
        </Modal>
      </DashboardLayout>
    </ProtectedRoute>
  );
}

