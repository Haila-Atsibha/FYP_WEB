"use client";

import React, { useState, useEffect } from "react";
import {
    AlertCircle,
    Search,
    Calendar,
    Filter,
    CheckCircle,
    Clock,
    MessageSquare,
    ArrowRight,
    Ban
} from "lucide-react";
import ProtectedRoute from "../../../../src/components/ProtectedRoute";
import DashboardLayout from "../../../../src/components/DashboardLayout";
import Badge from "../../../../src/components/Badge";
import Button from "../../../../src/components/Button";
import AdminDataTable from "../../../../src/components/AdminDataTable";
import api from "../../../../src/services/api";
import Modal from "../../../../src/components/Modal";
import { useTranslation } from "../../../../src/hooks/useTranslation";

export default function AdminComplaints() {
    const { t } = useTranslation();
    const [complaints, setComplaints] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [selectedComplaint, setSelectedComplaint] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [replyText, setReplyText] = useState("");
    const [submittingReply, setSubmittingReply] = useState(false);

    useEffect(() => {
        const fetchComplaints = async () => {
            setLoading(true);
            try {
                const res = await api.get("/api/admin/complaints");
                setComplaints(res.data);
            } catch (err) {
                console.error("Failed to fetch complaints:", err);
                setError(t("admin_complaints_fetch_error"));
            } finally {
                setLoading(false);
            }
        };

        fetchComplaints();
    }, []);
    
    const fetchComplaints = async () => {
        setLoading(true);
        try {
            const res = await api.get("/api/admin/complaints");
            setComplaints(res.data);
        } catch (err) {
            console.error("Failed to fetch complaints:", err);
            setError(t("admin_complaints_fetch_error"));
        } finally {
            setLoading(false);
        }
    };

    const handleReply = async (complaintId) => {
        if (!replyText.trim()) return;
        
        setSubmittingReply(true);
        try {
            await api.post(`/api/complaints/${complaintId}/reply`, { reply: replyText });
            // Refresh local data
            await fetchComplaints();
            setIsModalOpen(false);
            setReplyText("");
            setSelectedComplaint(null);
        } catch (err) {
            console.error("Failed to submit reply:", err);
            alert(t("admin_complaints_reply_error"));
        } finally {
            setSubmittingReply(false);
        }
    };

    const handleSuspendProvider = async (providerId) => {
        if (!confirm(t("admin_complaints_suspend_confirm"))) return;

        try {
            await api.patch(`/api/admin/users/${providerId}/status`, { status: "suspended" });
            alert(t("admin_complaints_suspend_success"));
            fetchComplaints();
        } catch (err) {
            console.error("Error suspending provider:", err);
            alert(t("admin_complaints_suspend_error"));
        }
    };

    const filteredComplaints = complaints.filter(complaint => {
        const matchesSearch =
            complaint.userName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            complaint.subject?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            complaint.description?.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesStatus = statusFilter === "all" || complaint.status.toLowerCase() === statusFilter.toLowerCase();

        return matchesSearch && matchesStatus;
    });

    const columns = [
        { header: t("admin_complaints_col_user"), accessor: "userName", render: (row) => <span className="font-bold">{row.userName}</span> },
        { header: t("admin_complaints_col_subject"), accessor: "subject" },
        {
            header: "Type",
            render: (row) => (
                <Badge variant={row.provider_id ? "warning" : "info"} className="whitespace-nowrap">
                    {row.provider_id ? "Booking Dispute" : "Platform Issue"}
                </Badge>
            )
        },
        {
            header: "Message",
            accessor: "description",
            render: (row) => (
                <p className="max-w-[200px] truncate text-text-muted text-sm" title={row.description}>
                    {row.description}
                </p>
            )
        },
        { header: "Provider", accessor: "provider_name", render: (row) => <span className="font-medium text-sm text-text-muted">{row.provider_id ? (row.provider_name || "Unknown") : "N/A"}</span> },
        {
            header: "Priority",
            render: (row) => (
                <Badge variant={row.priority === 'high' ? 'danger' : 'warning'}>
                    {row.priority}
                </Badge>
            )
        },
        {
            header: t("admin_complaints_col_status"),
            render: (row) => (
                <Badge variant={row.status === 'open' ? 'info' : 'success'}>
                    {row.status}
                </Badge>
            )
        },
        {
            header: t("admin_complaints_col_date"),
            render: (row) => (
                <div className="flex items-center gap-2 text-text-muted text-sm">
                    <Calendar className="w-3 h-3" />
                    {new Date(row.created_at).toLocaleDateString()}
                </div>
            )
        }
    ];

    const stats = {
        total: complaints.length,
        open: complaints.filter(c => c.status === "open").length,
        resolved: complaints.filter(c => c.status === "resolved").length,
        highPriority: complaints.filter(c => c.priority === "high").length,
    };

    return (
        <ProtectedRoute roles={["admin"]}>
            <DashboardLayout>
                <div className="space-y-6 pb-10">
                    {/* Header */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                            <h1 className="text-3xl font-extrabold text-foreground tracking-tight">{t("admin_complaints_title")}</h1>
                            <p className="text-text-muted mt-1">{t("admin_complaints_desc")}</p>
                        </div>
                        <div className="flex items-center gap-3">
                            <Badge variant="danger" className="py-1.5 px-3">
                                {stats.highPriority} High Priority
                            </Badge>
                        </div>
                    </div>

                    {/* Quick Stats */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                        <StatMiniCard title="Total Complaints" value={stats.total} icon={<MessageSquare />} color="text-primary bg-primary/10" />
                        <StatMiniCard title="Open" value={stats.open} icon={<Clock />} color="text-blue-500 bg-blue-500/10" />
                        <StatMiniCard title="Resolved" value={stats.resolved} icon={<CheckCircle />} color="text-green-500 bg-green-500/10" />
                        <StatMiniCard title="High Priority" value={stats.highPriority} icon={<AlertCircle />} color="text-red-500 bg-red-500/10" />
                    </div>

                    {/* Controls */}
                    <div className="bg-surface border border-border p-4 rounded-2xl flex flex-col md:flex-row gap-4 items-center">
                        <div className="relative flex-1 w-full">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                            <input
                                type="text"
                                placeholder={t("admin_complaints_search_placeholder")}
                                className="w-full pl-12 pr-4 py-2.5 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <div className="flex items-center gap-2 w-full md:w-auto">
                            <Filter className="w-4 h-4 text-text-muted" />
                            <select
                                className="bg-background border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                            >
                                <option value="all">{t("admin_complaints_filter_all")}</option>
                                <option value="open">{t("admin_complaints_filter_pending")}</option>
                                <option value="resolved">{t("admin_complaints_filter_resolved")}</option>
                            </select>
                        </div>
                    </div>

                    {/* Table Container */}
                    <div className="bg-surface border border-border rounded-3xl overflow-hidden shadow-sm">
                        {error ? (
                            <div className="p-20 text-center">
                                <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                                <p className="text-lg font-bold">{error}</p>
                                <Button onClick={() => window.location.reload()} className="mt-4">{t("admin_retry")}</Button>
                            </div>
                        ) : (
                            <AdminDataTable
                                loading={loading}
                                columns={columns}
                                data={filteredComplaints}
                                onRowClick={(row) => {
                                    setSelectedComplaint(row);
                                    setIsModalOpen(true);
                                }}
                            />
                        )}

                        {!loading && filteredComplaints.length === 0 && (
                            <div className="p-20 text-center">
                                <MessageSquare className="w-12 h-12 text-text-muted mx-auto mb-4 opacity-20" />
                                <p className="text-text-muted font-medium">{t("admin_complaints_no_found")}</p>
                            </div>
                        )}
                    </div>

                    {/* Complaint Detail Modal */}
                    <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
                        {selectedComplaint && (
                            <div className="space-y-6">
                                <div className="flex items-center justify-between">
                                    <h2 className="text-xl font-bold flex items-center gap-2">
                                        <MessageSquare className="text-primary w-5 h-5" />
                                        {selectedComplaint.provider_id ? t("admin_complaints_type_booking") : t("admin_complaints_type_platform")}
                                    </h2>
                                    <Badge variant={selectedComplaint.priority === 'high' ? 'danger' : 'warning'}>
                                        {selectedComplaint.priority} Priority
                                    </Badge>
                                </div>

                                <div className="space-y-4">
                                    <div className="p-4 bg-background rounded-2xl border border-border">
                                        <p className="text-xs font-bold text-text-muted uppercase tracking-wider mb-1">{t("admin_complaints_from_user")}</p>
                                        <div className="flex items-center justify-between">
                                            <p className="font-bold text-lg">{selectedComplaint.userName}</p>
                                            <p className="text-sm text-text-muted">{selectedComplaint.user_email}</p>
                                        </div>
                                    </div>

                                    <div>
                                        <p className="text-xs font-bold text-text-muted uppercase tracking-wider mb-1">{t("admin_complaints_subject")}</p>
                                        <p className="text-foreground font-semibold">{selectedComplaint.subject}</p>
                                    </div>

                                    <div>
                                        <p className="text-xs font-bold text-text-muted uppercase tracking-wider mb-1">{t("admin_complaints_customer_msg")}</p>
                                        <div className="bg-background/50 p-4 rounded-xl border border-border/50 text-sm leading-relaxed text-foreground whitespace-pre-wrap">
                                            {selectedComplaint.description}
                                        </div>
                                    </div>

                                    {selectedComplaint.provider_id && (
                                        <div className="mt-4 border-t border-border pt-4">
                                            <div className="flex justify-between items-center mb-2">
                                                <p className="text-xs font-bold text-text-muted uppercase tracking-wider">{t("admin_complaints_provider_resp")}</p>
                                                <div className="flex gap-2">
                                                    <span className="text-xs font-bold bg-surface-hover px-2 py-1 rounded border border-border">
                                                        {selectedComplaint.provider_name}
                                                    </span>
                                                    {selectedComplaint.provider_response && (
                                                        <span className="text-xs font-bold bg-green-500/10 text-green-400 px-2 py-1 rounded">
                                                            {t("admin_complaints_responded")}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                            
                                            {selectedComplaint.provider_response ? (
                                                <div className="bg-blue-500/5 p-4 rounded-xl border border-blue-500/20 text-sm leading-relaxed text-blue-100 whitespace-pre-wrap">
                                                    {selectedComplaint.provider_response}
                                                </div>
                                            ) : (
                                                <div className="bg-background p-4 rounded-xl border border-dashed border-border text-sm text-text-muted italic">
                                                    {t("admin_complaints_provider_no_resp")}
                                                </div>
                                            )}

                                            <div className="mt-3 text-right">
                                                <Button 
                                                    variant="danger" 
                                                    className="py-1.5 px-3 text-xs bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white border border-red-500/20"
                                                    onClick={() => handleSuspendProvider(selectedComplaint.provider_id)}
                                                >
                                                    <Ban size={12} className="inline mr-1" /> {t("admin_complaints_suspend_provider")}
                                                </Button>
                                            </div>
                                        </div>
                                    )}

                                    <div className="flex items-center justify-between pt-4 border-t border-border">
                                        <div className="flex items-center gap-2 text-text-muted text-sm">
                                            <Calendar className="w-4 h-4" />
                                            {new Date(selectedComplaint.created_at).toLocaleString()}
                                        </div>
                                        <Badge variant={selectedComplaint.status === 'open' ? 'info' : 'success'}>
                                            {t("admin_complaints_status")}: {selectedComplaint.status}
                                        </Badge>
                                    </div>
                                </div>

                                {selectedComplaint.status === 'open' ? (
                                    <div className="space-y-3 pt-4 border-t border-border">
                                        <p className="text-xs font-bold text-text-muted uppercase tracking-wider mb-1">{t("admin_complaints_official_reply")}</p>
                                        <textarea
                                            className="w-full bg-background border border-border text-foreground rounded-2xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all min-h-[100px] text-sm"
                                            placeholder={t("admin_complaints_reply_placeholder")}
                                            value={replyText}
                                            onChange={(e) => setReplyText(e.target.value)}
                                        />
                                    </div>
                                ) : (
                                    selectedComplaint.admin_reply && (
                                        <div className="space-y-3 pt-4 border-t border-border">
                                            <p className="text-xs font-bold text-primary uppercase tracking-wider mb-1">{t("admin_complaints_our_response")}</p>
                                            <div className="bg-primary/5 p-4 rounded-xl border border-primary/20 text-sm italic text-foreground leading-relaxed">
                                                "{selectedComplaint.admin_reply}"
                                            </div>
                                        </div>
                                    )
                                )}

                                <div className="flex gap-3 pt-4">
                                    <Button
                                        variant="outline"
                                        className="flex-1"
                                        onClick={() => {
                                            setIsModalOpen(false);
                                            setReplyText("");
                                        }}
                                    >
                                        {t("admin_complaints_close")}
                                    </Button>
                                    {selectedComplaint.status === 'open' && (
                                        <Button
                                            className="flex-1"
                                            disabled={!replyText.trim() || submittingReply}
                                            onClick={() => handleReply(selectedComplaint.id)}
                                        >
                                            {submittingReply ? t("admin_complaints_submitting") : t("admin_complaints_send_resolve")}
                                        </Button>
                                    )}
                                </div>
                            </div>
                        )}
                    </Modal>
                </div>
            </DashboardLayout>
        </ProtectedRoute>
    );
}

const StatMiniCard = ({ title, value, icon, color }) => (
    <div className="bg-surface border border-border p-4 rounded-2xl flex items-center gap-4">
        <div className={`p-2.5 rounded-lg ${color}`}>
            {React.cloneElement(icon, { size: 18 })}
        </div>
        <div>
            <p className="text-xs font-bold text-text-muted uppercase tracking-wider">{title}</p>
            <p className="text-xl font-black">{value}</p>
        </div>
    </div>
);
