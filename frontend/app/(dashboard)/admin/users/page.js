"use client";

import React, { useState, useEffect } from "react";
import {
    Users,
    Search,
    UserCheck,
    UserMinus,
    Trash2,
    AlertCircle,
    Filter,
    Shield,
    User,
    Clock,
    MoreVertical
} from "lucide-react";
import ProtectedRoute from "../../../../src/components/ProtectedRoute";
import DashboardLayout from "../../../../src/components/DashboardLayout";
import Badge from "../../../../src/components/Badge";
import Button from "../../../../src/components/Button";
import AdminDataTable from "../../../../src/components/AdminDataTable";
import api from "../../../../src/services/api";

export default function UserManagement() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [roleFilter, setRoleFilter] = useState("all");
    const [statusFilter, setStatusFilter] = useState("all");

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const res = await api.get("/api/admin/users");
            setUsers(res.data);
        } catch (err) {
            console.error("Failed to fetch users:", err);
            setError("Failed to load users list.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const handleStatusUpdate = async (userId, newStatus) => {
        if (!window.confirm(`Are you sure you want to change this user status to ${newStatus}?`)) return;
        try {
            await api.patch(`/api/admin/users/${userId}/status`, { status: newStatus });
            fetchUsers();
        } catch (err) {
            alert(err.response?.data?.message || "Failed to update status");
        }
    };

    const handleDeleteUser = async (userId) => {
        if (!window.confirm("CRITICAL: Are you sure you want to PERMANENTLY delete this user? This action cannot be undone.")) return;
        try {
            await api.delete(`/api/admin/users/${userId}`);
            fetchUsers();
        } catch (err) {
            alert(err.response?.data?.message || "Failed to delete user");
        }
    };

    const filteredUsers = users.filter(user => {
        const matchesSearch =
            user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.email?.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesRole = roleFilter === "all" || user.role === roleFilter;
        const matchesStatus = statusFilter === "all" || user.status === statusFilter;

        return matchesSearch && matchesRole && matchesStatus;
    });

    const columns = [
        {
            header: "User",
            render: (row) => (
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                        {row.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                        <p className="font-bold text-foreground">{row.name}</p>
                        <p className="text-xs text-text-muted">{row.email}</p>
                    </div>
                </div>
            )
        },
        {
            header: "Role",
            accessor: "role",
            render: (row) => (
                <div className="flex items-center gap-1.5 capitalize">
                    {row.role === 'admin' ? <Shield size={14} className="text-primary" /> : <User size={14} className="text-text-muted" />}
                    {row.role}
                </div>
            )
        },
        {
            header: "Status",
            render: (row) => (
                <Badge variant={
                    row.status === 'approved' ? 'success' :
                        row.status === 'pending' ? 'warning' :
                            row.status === 'suspended' ? 'danger' : 'secondary'
                }>
                    {row.status}
                </Badge>
            )
        },
        {
            header: "Joined",
            render: (row) => (
                <div className="text-xs text-text-muted">
                    {new Date(row.created_at).toLocaleDateString()}
                </div>
            )
        },
        {
            header: "Actions",
            render: (row) => (
                <div className="flex items-center gap-2">
                    {row.status !== 'approved' && (
                        <button
                            onClick={() => handleStatusUpdate(row.id, 'approved')}
                            className="p-2 hover:bg-green-500/10 text-green-500 rounded-lg transition-colors"
                            title="Approve User"
                        >
                            <UserCheck size={16} />
                        </button>
                    )}
                    {row.status !== 'suspended' && (
                        <button
                            onClick={() => handleStatusUpdate(row.id, 'suspended')}
                            className="p-2 hover:bg-orange-500/10 text-orange-500 rounded-lg transition-colors"
                            title="Suspend User"
                        >
                            <UserMinus size={16} />
                        </button>
                    )}
                    <button
                        onClick={() => handleDeleteUser(row.id)}
                        className="p-2 hover:bg-red-500/10 text-red-500 rounded-lg transition-colors"
                        title="Delete User"
                    >
                        <Trash2 size={16} />
                    </button>
                </div>
            )
        }
    ];

    const stats = {
        total: users.length,
        customers: users.filter(u => u.role === "customer").length,
        providers: users.filter(u => u.role === "provider").length,
        pending: users.filter(u => u.status === "pending").length,
    };

    return (
        <ProtectedRoute roles={["admin"]}>
            <DashboardLayout>
                <div className="space-y-6 pb-10">
                    {/* Header */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                            <h1 className="text-3xl font-extrabold text-foreground tracking-tight">User Management</h1>
                            <p className="text-text-muted mt-1">Oversee all platform accounts, roles, and authorization statuses.</p>
                        </div>
                    </div>

                    {/* Mini Stats */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                        <StatMiniCard title="Total Users" value={stats.total} icon={<Users />} color="text-primary bg-primary/10" />
                        <StatMiniCard title="Customers" value={stats.customers} icon={<User />} color="text-blue-500 bg-blue-500/10" />
                        <StatMiniCard title="Providers" value={stats.providers} icon={<Shield />} color="text-purple-500 bg-purple-500/10" />
                        <StatMiniCard title="Pending" value={stats.pending} icon={<Clock />} color="text-orange-500 bg-orange-500/10" />
                    </div>

                    {/* Filters */}
                    <div className="bg-surface border border-border p-4 rounded-2xl flex flex-col lg:flex-row gap-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                            <input
                                type="text"
                                placeholder="Search by name or email..."
                                className="w-full pl-12 pr-4 py-2.5 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>

                        <div className="flex gap-4">
                            <div className="flex items-center gap-2">
                                <Filter size={14} className="text-text-muted" />
                                <select
                                    className="bg-background border border-border rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                                    value={roleFilter}
                                    onChange={(e) => setRoleFilter(e.target.value)}
                                >
                                    <option value="all">All Roles</option>
                                    <option value="customer">Customers</option>
                                    <option value="provider">Providers</option>
                                    <option value="admin">Admins</option>
                                </select>
                            </div>

                            <select
                                className="bg-background border border-border rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                            >
                                <option value="all">All Statuses</option>
                                <option value="approved">Approved</option>
                                <option value="pending">Pending</option>
                                <option value="suspended">Suspended</option>
                            </select>
                        </div>
                    </div>

                    {/* Data Table */}
                    <div className="bg-surface border border-border rounded-3xl overflow-hidden shadow-sm">
                        {error ? (
                            <div className="p-20 text-center">
                                <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                                <p className="text-lg font-bold">{error}</p>
                                <Button onClick={fetchUsers} className="mt-4">Retry</Button>
                            </div>
                        ) : (
                            <AdminDataTable
                                loading={loading}
                                columns={columns}
                                data={filteredUsers}
                            />
                        )}

                        {!loading && filteredUsers.length === 0 && (
                            <div className="p-20 text-center">
                                <Users className="w-12 h-12 text-text-muted mx-auto mb-4 opacity-20" />
                                <p className="text-text-muted font-medium">No users found matching your filters.</p>
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
