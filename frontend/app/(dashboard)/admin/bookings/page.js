"use client";

import React, { useState, useEffect } from "react";
import {
    ShoppingBag,
    Search,
    Calendar,
    Filter,
    X,
    Download,
    AlertCircle,
    CheckCircle,
    Clock,
    XCircle,
    ArrowUpDown
} from "lucide-react";
import ProtectedRoute from "../../../../src/components/ProtectedRoute";
import DashboardLayout from "../../../../src/components/DashboardLayout";
import Badge from "../../../../src/components/Badge";
import Button from "../../../../src/components/Button";
import AdminDataTable from "../../../../src/components/AdminDataTable";
import api from "../../../../src/services/api";

export default function AdminBookings() {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");

    useEffect(() => {
        const fetchBookings = async () => {
            setLoading(true);
            try {
                const res = await api.get("/api/admin/bookings");
                setBookings(res.data);
            } catch (err) {
                console.error("Failed to fetch bookings:", err);
                setError("Failed to load bookings. Please try again later.");
            } finally {
                setLoading(false);
            }
        };

        fetchBookings();
    }, []);

    const filteredBookings = bookings.filter(booking => {
        const matchesSearch =
            booking.customer?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            booking.service?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            booking.id.toString().includes(searchTerm);

        const matchesStatus = statusFilter === "all" || booking.status.toLowerCase() === statusFilter.toLowerCase();

        return matchesSearch && matchesStatus;
    });

    const columns = [
        { header: "ID", accessor: "id", render: (row) => <span className="font-mono text-xs font-bold">#{row.id}</span> },
        { header: "Customer", accessor: "customer" },
        { header: "Provider", accessor: "provider" },
        { header: "Service", accessor: "service" },
        {
            header: "Status",
            render: (row) => (
                <Badge variant={
                    row.status === 'Completed' ? 'success' :
                        row.status === 'Active' ? 'primary' :
                            row.status === 'Cancelled' ? 'danger' : 'warning'
                }>
                    {row.status}
                </Badge>
            )
        },
        {
            header: "Price",
            render: (row) => <span className="font-bold">${row.price}</span>
        },
        {
            header: "Booking Date",
            render: (row) => (
                <div className="flex items-center gap-2 text-text-muted text-sm">
                    <Calendar className="w-3 h-3" />
                    {new Date(row.booking_date).toLocaleDateString()}
                </div>
            )
        }
    ];

    const stats = {
        total: bookings.length,
        active: bookings.filter(b => b.status === "Active").length,
        completed: bookings.filter(b => b.status === "Completed").length,
        cancelled: bookings.filter(b => b.status === "Cancelled").length,
    };

    return (
        <ProtectedRoute roles={["admin"]}>
            <DashboardLayout>
                <div className="space-y-6 pb-10">
                    {/* Header */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                            <h1 className="text-3xl font-extrabold text-foreground tracking-tight">Booking Management</h1>
                            <p className="text-text-muted mt-1">Monitor and manage all service bookings across the platform.</p>
                        </div>
                        <Button variant="secondary" className="flex items-center gap-2">
                            <Download className="w-4 h-4" />
                            <span>Export CSV</span>
                        </Button>
                    </div>

                    {/* Quick Stats */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                        <StatMiniCard title="Total" value={stats.total} icon={<ShoppingBag />} color="text-primary bg-primary/10" />
                        <StatMiniCard title="Active" value={stats.active} icon={<Clock />} color="text-blue-500 bg-blue-500/10" />
                        <StatMiniCard title="Completed" value={stats.completed} icon={<CheckCircle />} color="text-green-500 bg-green-500/10" />
                        <StatMiniCard title="Cancelled" value={stats.cancelled} icon={<XCircle />} color="text-red-500 bg-red-500/10" />
                    </div>

                    {/* Controls */}
                    <div className="bg-surface border border-border p-4 rounded-2xl flex flex-col md:flex-row gap-4 items-center">
                        <div className="relative flex-1 w-full">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                            <input
                                type="text"
                                placeholder="Search bookings by ID, customer or service..."
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
                                <option value="Active">Active</option>
                                <option value="Completed">Completed</option>
                                <option value="Cancelled">Cancelled</option>
                                <option value="Pending">Pending</option>
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
                                data={filteredBookings}
                                onRowClick={(row) => console.log("Row clicked:", row)}
                            />
                        )}

                        {!loading && filteredBookings.length === 0 && (
                            <div className="p-20 text-center">
                                <ShoppingBag className="w-12 h-12 text-text-muted mx-auto mb-4 opacity-20" />
                                <p className="text-text-muted font-medium">No bookings found matching your criteria.</p>
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
