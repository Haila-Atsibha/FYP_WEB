"use client";

import React, { useState, useEffect } from "react";
import { CreditCard, Calendar, User, Search, Filter, ArrowLeft, ArrowUpDown, CheckCircle2, XCircle, Clock } from "lucide-react";
import Link from "next/link";
import DashboardLayout from "../../../../src/components/DashboardLayout";
import ProtectedRoute from "../../../../src/components/ProtectedRoute";
import Badge from "../../../../src/components/Badge";
import Button from "../../../../src/components/Button";
import AdminDataTable from "../../../../src/components/AdminDataTable";
import api from "../../../../src/services/api";

export default function AdminSubscriptions() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        const fetchSubscriptions = async () => {
            try {
                const res = await api.get("/api/admin/subscriptions");
                setData(res.data);
            } catch (err) {
                console.error("Failed to fetch subscriptions:", err);
                setError("Failed to load subscription data");
            } finally {
                setLoading(false);
            }
        };
        fetchSubscriptions();
    }, []);

    const filteredHistory = data?.history?.filter(h =>
        h.providerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        h.tx_ref?.toLowerCase().includes(searchTerm.toLowerCase())
    ) || [];

    return (
        <ProtectedRoute roles={["admin"]}>
            <DashboardLayout>
                <div className="space-y-8 animate-in fade-in duration-500">
                    {/* Header */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <Link href="/admin">
                                <Button variant="ghost" className="p-2 h-auto text-text-muted hover:text-primary transition-colors">
                                    <ArrowLeft className="w-6 h-6" />
                                </Button>
                            </Link>
                            <div>
                                <h1 className="text-3xl font-black text-foreground tracking-tight">Provider Subscriptions</h1>
                                <p className="text-text-muted">Monitor payments and active service members.</p>
                            </div>
                        </div>
                    </div>

                    {/* Stats Overview */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <StatItem
                            label="Monthly Subscription Revenue"
                            value={`$${data?.monthlyRevenue || '0.00'}`}
                            icon={<CreditCard className="text-green-500" />}
                            bg="bg-green-500/10"
                        />
                        <StatItem
                            label="Active Premium Providers"
                            value={data?.activePremium || 0}
                            icon={<CheckCircle2 className="text-blue-500" />}
                            bg="bg-blue-500/10"
                        />
                        <StatItem
                            label="Expiring Within 7 Days"
                            value={data?.expiringSoon || 0}
                            icon={<Clock className="text-yellow-500" />}
                            bg="bg-yellow-500/10"
                        />
                    </div>

                    {/* Transaction History Section */}
                    <div className="bg-surface border border-border rounded-3xl p-8 shadow-sm overflow-hidden">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                            <div>
                                <h2 className="text-xl font-bold flex items-center gap-2">
                                    <ArrowUpDown className="w-5 h-5 text-primary" />
                                    Transaction History
                                </h2>
                                <p className="text-sm text-text-muted">Full list of subscription payments.</p>
                            </div>
                            <div className="relative w-full md:w-80">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                                <input
                                    type="text"
                                    placeholder="Search by provider or reference..."
                                    className="w-full pl-12 pr-4 py-3 bg-background border border-border rounded-2xl focus:ring-2 focus:ring-primary/20 outline-none text-sm"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                        </div>

                        <AdminDataTable
                            loading={loading}
                            columns={[
                                {
                                    header: "Provider",
                                    render: (row) => (
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center font-black text-primary text-xs uppercase">
                                                {row.providerName?.[0]}
                                            </div>
                                            <span className="font-bold">{row.providerName}</span>
                                        </div>
                                    )
                                },
                                {
                                    header: "Amount",
                                    render: (row) => <span className="font-black text-green-500">${row.amount}</span>
                                },
                                {
                                    header: "Status",
                                    render: (row) => (
                                        <Badge variant={row.status === 'success' ? 'success' : 'warning'}>
                                            {row.status}
                                        </Badge>
                                    )
                                },
                                {
                                    header: "Date",
                                    render: (row) => <span className="text-text-muted text-sm">{new Date(row.date).toLocaleDateString()}</span>
                                },
                                {
                                    header: "Ref",
                                    render: (row) => <span className="text-xs font-mono text-text-muted truncate max-w-[100px] block" title={row.tx_ref}>{row.tx_ref}</span>
                                }
                            ]}
                            data={filteredHistory}
                        />

                        {!loading && filteredHistory.length === 0 && (
                            <div className="flex flex-col items-center justify-center py-20 text-center">
                                <XCircle className="w-12 h-12 text-text-muted mb-4 opacity-20" />
                                <p className="text-text-muted italic">No payment transactions found matching your criteria.</p>
                            </div>
                        )}
                    </div>
                </div>
            </DashboardLayout>
        </ProtectedRoute>
    );
}

const StatItem = ({ label, value, icon, bg }) => (
    <div className="bg-surface border border-border p-6 rounded-3xl flex items-center gap-6 shadow-sm hover:translate-y-[-4px] transition-all duration-300">
        <div className={`p-4 rounded-2xl ${bg}`}>
            {React.cloneElement(icon, { size: 28 })}
        </div>
        <div>
            <p className="text-xs font-bold text-text-muted uppercase tracking-wider mb-1">{label}</p>
            <h3 className="text-3xl font-black text-foreground tracking-tight">{value}</h3>
        </div>
    </div>
);
