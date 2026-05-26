"use client";

import React, { useState, useEffect, useContext } from "react";
import { AuthContext } from "../../../../src/context/AuthContext";
import ProtectedRoute from "../../../../src/components/ProtectedRoute";
import DashboardLayout from "../../../../src/components/DashboardLayout";
import api from "../../../../src/services/api";
import Button from "../../../../src/components/Button";
import Modal from "../../../../src/components/Modal";
import { useToast } from "../../../../src/context/ToastContext";
import {
    AlertTriangle,
    MessageSquare,
    User,
    Calendar,
    Send,
    CheckCircle2,
    Clock
} from "lucide-react";
import Badge from "../../../../src/components/Badge";
import { useTranslation } from "../../../../src/hooks/useTranslation";

export default function ProviderComplaints() {
    const { t } = useTranslation();
    const { user, loading: authLoading } = useContext(AuthContext);
    const [complaints, setComplaints] = useState([]);
    const [loading, setLoading] = useState(true);
    const { showToast } = useToast();

    // Modal state
    const [isResponseModalOpen, setIsResponseModalOpen] = useState(false);
    const [selectedComplaint, setSelectedComplaint] = useState(null);
    const [responseText, setResponseText] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (!authLoading && user) {
            fetchComplaints();
            clearNotifications();
        }
    }, [user, authLoading]);

    const clearNotifications = async () => {
        try {
            await api.put("/api/notifications/mark-type", { type: 'dispute' });
        } catch (err) {
            console.error("Error clearing dispute notifications:", err);
        }
    };

    const fetchComplaints = async () => {
        setLoading(true);
        try {
            const response = await api.get("/api/complaints/provider");
            setComplaints(response.data);
        } catch (err) {
            console.error("Error fetching provider complaints:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleOpenResponseModal = (complaint) => {
        setSelectedComplaint(complaint);
        setResponseText(complaint.provider_response || "");
        setIsResponseModalOpen(true);
    };

    const handleSubmitResponse = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            const res = await api.put(`/api/complaints/${selectedComplaint.id}/provider-response`, {
                response: responseText
            });
            setComplaints(prev => prev.map(c => c.id === selectedComplaint.id ? { ...c, provider_response: responseText, provider_responded_at: new Date() } : c));
            setIsResponseModalOpen(false);
            showToast(t("msg_response_success"), "success");
        } catch (err) {
            console.error("Error submitting response:", err);
            showToast(err.response?.data?.message || t("msg_response_error"), "error");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <ProtectedRoute roles={["provider"]}>
            <DashboardLayout>
                <div className="max-w-6xl mx-auto space-y-8 pb-20">
                    {/* Header */}
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                        <div>
                            <h1 className="text-4xl font-black text-foreground tracking-tight">{t("provider_disputes_title")}</h1>
                            <p className="text-text-muted font-medium mt-1">{t("provider_disputes_desc")}</p>
                        </div>
                    </div>

                    {/* Complaints List */}
                    <div className="space-y-6 pt-4">
                        {loading ? (
                            [...Array(3)].map((_, i) => (
                                <div key={i} className="h-48 bg-surface border border-border rounded-[2.5rem] animate-pulse" />
                            ))
                        ) : complaints.length === 0 ? (
                            <div className="py-32 text-center bg-surface rounded-[2.5rem] border border-dashed border-border">
                                <div className="w-20 h-20 bg-green-500/10 text-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
                                    <CheckCircle2 size={40} />
                                </div>
                                <h1 className="text-2xl font-black text-foreground">{t("provider_no_disputes")}</h1>
                                <p className="text-text-muted font-medium mt-2">{t("provider_no_disputes_desc")}</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {complaints.map((complaint) => (
                                    <ComplaintCard 
                                        key={complaint.id} 
                                        complaint={complaint} 
                                        onRespond={() => handleOpenResponseModal(complaint)} 
                                        t={t}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Response Modal */}
                <Modal isOpen={isResponseModalOpen} onClose={() => setIsResponseModalOpen(false)}>
                    <div className="space-y-6">
                        <div className="text-center">
                            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-blue-500/20">
                                <MessageSquare className="w-8 h-8 text-white" />
                            </div>
                            <h3 className="text-2xl font-bold text-foreground">{t("provider_respond_dispute")}</h3>
                            <p className="text-text-muted text-sm mt-1">{t("provider_respond_dispute_desc")}</p>
                        </div>

                        {selectedComplaint && (
                            <div className="bg-surface border border-border p-4 rounded-2xl mb-4">
                                <p className="text-xs font-bold text-text-muted uppercase mb-1">{t("provider_customer_claim")}</p>
                                <p className="text-foreground text-sm font-medium">"{selectedComplaint.description}"</p>
                            </div>
                        )}

                        <form onSubmit={handleSubmitResponse} className="space-y-4">
                            <div className="space-y-2">
                                <label className="block text-sm font-bold text-foreground/80 ml-1">{t("provider_your_response")}</label>
                                <textarea
                                    className="w-full bg-surface/50 border border-white/10 text-white rounded-2xl px-5 py-4 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all min-h-[120px] backdrop-blur-md"
                                    placeholder={t("provider_response_placeholder")}
                                    required
                                    value={responseText}
                                    onChange={(e) => setResponseText(e.target.value)}
                                />
                            </div>

                            <div className="flex gap-4 pt-4">
                                <Button
                                    type="button"
                                    variant="outline"
                                    className="flex-1 bg-transparent border-white/10 text-foreground hover:bg-surface shadow-none rounded-xl"
                                    onClick={() => setIsResponseModalOpen(false)}
                                >
                                    {t("btn_cancel")}
                                </Button>
                                <Button
                                    type="submit"
                                    className="flex-1 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-500 shadow-lg shadow-blue-500/20 text-white border-none font-bold"
                                    disabled={isSubmitting}
                                >
                                    {isSubmitting ? t("provider_submitting") : t("btn_submit_response")}
                                </Button>
                            </div>
                        </form>
                    </div>
                </Modal>
            </DashboardLayout>
        </ProtectedRoute>
    );
}

function ComplaintCard({ complaint, onRespond, t }) {
    const hasResponded = !!complaint.provider_response;
    const isResolved = complaint.status === 'resolved';

    return (
        <div className="bg-surface border border-border p-8 rounded-[2.5rem] hover:shadow-xl hover:shadow-primary/5 transition-all group relative overflow-hidden flex flex-col justify-between">
            <div className="space-y-5 relative z-10">
                <div className="flex items-start justify-between">
                    <div>
                        <Badge variant={isResolved ? "success" : "warning"} className="mb-2">
                            {isResolved ? t("status_resolved") : t("status_active_dispute")}
                        </Badge>
                        <h3 className="font-bold text-lg">{complaint.subject}</h3>
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-text-muted flex items-center gap-1.5 bg-surface-hover px-3 py-1 rounded-full border border-border">
                        <Calendar size={12} className="text-primary" />
                        {new Date(complaint.created_at).toLocaleDateString()}
                    </span>
                </div>

                <div>
                    <p className="text-foreground font-medium text-sm leading-relaxed mb-4 text-white/80">
                        "{complaint.description}"
                    </p>
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-red-500/10 flex items-center justify-center text-red-500 border border-red-500/20">
                            <User size={14} />
                        </div>
                        <div>
                            <p className="text-xs font-black text-foreground leading-none">{complaint.customer_name}</p>
                            <p className="text-[10px] font-bold text-text-muted mt-1 uppercase flex items-center gap-1">
                                {t("label_customer")}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="mt-6 pt-4 border-t border-border relative z-10">
                {hasResponded ? (
                    <div>
                        <div className="flex items-center gap-2 mb-2 text-blue-400">
                            <CheckCircle2 size={14} />
                            <span className="text-xs font-bold uppercase tracking-widest">{t("label_you_responded")}</span>
                        </div>
                        <p className="text-xs text-text-muted line-clamp-2">"{complaint.provider_response}"</p>
                    </div>
                ) : (
                    <Button 
                        onClick={onRespond}
                        className="w-full bg-blue-500/10 text-blue-400 hover:bg-blue-500 hover:text-white border-blue-500/20 py-2.5 rounded-xl font-bold flex items-center justify-center gap-2 transition-all"
                    >
                        <MessageSquare size={16} /> {t("btn_submit_your_response")}
                    </Button>
                )}
            </div>

            {/* Background decoration */}
            <AlertTriangle size={120} className="absolute -bottom-5 -right-5 text-red-500/5 group-hover:scale-110 transition-transform" />
        </div>
    );
}
