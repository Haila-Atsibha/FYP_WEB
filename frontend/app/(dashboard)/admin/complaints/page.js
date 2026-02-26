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

export default function AdminComplaints() {
    const [complaints, setComplaints] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");

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

    const filteredComplaints = complaints.filter(complaint => {
        const matchesSearch =
            complaint.userName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            complaint.subject?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            complaint.message?.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesStatus = statusFilter === "all" || complaint.status.toLowerCase() === statusFilter.toLowerCase();

        return matchesSearch && matchesStatus;
    });

    const columns = [
        { header: "User", accessor: "userName", render: (row) => <span className="font-bold">{row.userName}</span> },
        { header: "Subject", accessor: "subject" },
        {
            header: "Message",
            accessor: "message",
            render: (row) => (
                <p className="max-w-xs truncate text-text-muted text-sm" title={row.message}>
                    {row.message}
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
                                onRowClick={(row) => console.log("Complaint clicked:", row)}
                            />
                        )}

                        {!loading && filteredComplaints.length === 0 && (
                            <div className="p-20 text-center">
                                <MessageSquare className="w-12 h-12 text-text-muted mx-auto mb-4 opacity-20" />
                                <p className="text-text-muted font-medium">No complaints found matching your criteria.</p>
                            </div>
                        )}
                    </div>
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
