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
    ArrowRight
} from "lucide-react";
import ProtectedRoute from "../../../../src/components/ProtectedRoute";
import DashboardLayout from "../../../../src/components/DashboardLayout";
import Badge from "../../../../src/components/Badge";
import Button from "../../../../src/components/Button";
import AdminDataTable from "../../../../src/components/AdminDataTable";
import api from "../../../../src/services/api";
import Modal from "../../../../src/components/Modal";

export default function AdminComplaints() {
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
                setError("Failed to load complaints. Please try again later.");
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
            setError("Failed to load complaints. Please try again later.");
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
            alert("Failed to submit reply. Please try again.");
        } finally {
            setSubmittingReply(false);
        }
    };

    const filteredComplaints = complaints.filter(complaint => {
        const matchesSearch =
            complaint.user_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            complaint.subject?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            complaint.description?.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesStatus = statusFilter === "all" || complaint.status.toLowerCase() === statusFilter.toLowerCase();

        return matchesSearch && matchesStatus;
    });

    const columns = [
        { header: "User", accessor: "user_name", render: (row) => <span className="font-bold">{row.user_name}</span> },
        { header: "Subject", accessor: "subject" },
        {
            header: "Message",
            accessor: "description",
            render: (row) => (
                <p className="max-w-xs truncate text-text-muted text-sm" title={row.description}>
                    {row.description}
                </p>
            )
        },
        {
            header: "Priority",
            render: (row) => (
                <Badge variant={row.priority === 'high' ? 'danger' : 'warning'}>
                    {row.priority}
                </Badge>
            )
        },
        {
            header: "Status",
            render: (row) => (
                <Badge variant={row.status === 'open' ? 'info' : 'success'}>
                    {row.status}
                </Badge>
            )
        },
        {
            header: "Date",
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
        closed: complaints.filter(c => c.status === "closed").length,
        highPriority: complaints.filter(c => c.priority === "high").length,
    };

    return (
        <ProtectedRoute roles={["admin"]}>
            <DashboardLayout>
                <div className="space-y-6 pb-10">
                    {/* Header */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                            <h1 className="text-3xl font-extrabold text-foreground tracking-tight">Complaints & Disputes</h1>
                            <p className="text-text-muted mt-1">Review and resolve user grievances and platform disputes.</p>
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
                        <StatMiniCard title="Resolved" value={stats.closed} icon={<CheckCircle />} color="text-green-500 bg-green-500/10" />
                        <StatMiniCard title="High Priority" value={stats.highPriority} icon={<AlertCircle />} color="text-red-500 bg-red-500/10" />
                    </div>

                    {/* Controls */}
                    <div className="bg-surface border border-border p-4 rounded-2xl flex flex-col md:flex-row gap-4 items-center">
                        <div className="relative flex-1 w-full">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                            <input
                                type="text"
                                placeholder="Search by user, subject or message content..."
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
                                <option value="all">All Statuses</option>
                                <option value="open">Open</option>
                                <option value="closed">Closed</option>
                            </select>
                        </div>
                    </div>

                    {/* Table Container */}
                    <div className="bg-surface border border-border rounded-3xl overflow-hidden shadow-sm">
                        {error ? (
                            <div className="p-20 text-center">
                                <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                                <p className="text-lg font-bold">{error}</p>
                                <Button onClick={() => window.location.reload()} className="mt-4">Retry</Button>
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
                                <p className="text-text-muted font-medium">No complaints found matching your criteria.</p>
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
                                        Complaint Detail
                                    </h2>
                                    <Badge variant={selectedComplaint.priority === 'high' ? 'danger' : 'warning'}>
                                        {selectedComplaint.priority} Priority
                                    </Badge>
                                </div>

                                <div className="space-y-4">
                                    <div className="p-4 bg-background rounded-2xl border border-border">
                                        <p className="text-xs font-bold text-text-muted uppercase tracking-wider mb-1">From User</p>
                                        <div className="flex items-center justify-between">
                                            <p className="font-bold text-lg">{selectedComplaint.user_name}</p>
                                            <p className="text-sm text-text-muted">{selectedComplaint.user_email}</p>
                                        </div>
                                    </div>

                                    <div>
                                        <p className="text-xs font-bold text-text-muted uppercase tracking-wider mb-1">Subject</p>
                                        <p className="text-foreground font-semibold">{selectedComplaint.subject}</p>
                                    </div>

                                    <div>
                                        <p className="text-xs font-bold text-text-muted uppercase tracking-wider mb-1">Message</p>
                                        <div className="bg-background/50 p-4 rounded-xl border border-border/50 text-sm leading-relaxed text-foreground whitespace-pre-wrap">
                                            {selectedComplaint.description}
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between pt-4 border-t border-border">
                                        <div className="flex items-center gap-2 text-text-muted text-sm">
                                            <Calendar className="w-4 h-4" />
                                            {new Date(selectedComplaint.created_at).toLocaleString()}
                                        </div>
                                        <Badge variant={selectedComplaint.status === 'open' ? 'info' : 'success'}>
                                            Status: {selectedComplaint.status}
                                        </Badge>
                                    </div>
                                </div>

                                {selectedComplaint.status === 'open' ? (
                                    <div className="space-y-3 pt-4 border-t border-border">
                                        <p className="text-xs font-bold text-text-muted uppercase tracking-wider mb-1">Official Reply</p>
                                        <textarea
                                            className="w-full bg-background border border-border text-foreground rounded-2xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all min-h-[100px] text-sm"
                                            placeholder="Type your official response here to resolve this complaint..."
                                            value={replyText}
                                            onChange={(e) => setReplyText(e.target.value)}
                                        />
                                    </div>
                                ) : (
                                    selectedComplaint.admin_reply && (
                                        <div className="space-y-3 pt-4 border-t border-border">
                                            <p className="text-xs font-bold text-primary uppercase tracking-wider mb-1">Our Response</p>
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
                                        Close
                                    </Button>
                                    {selectedComplaint.status === 'open' && (
                                        <Button
                                            className="flex-1"
                                            disabled={!replyText.trim() || submittingReply}
                                            onClick={() => handleReply(selectedComplaint.id)}
                                        >
                                            {submittingReply ? "Submitting..." : "Send Reply & Resolve"}
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
