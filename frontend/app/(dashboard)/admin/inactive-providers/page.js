"use client";

import React, { useState, useEffect } from "react";
import {
    Users,
    Search,
    AlertCircle,
    UserX,
    CalendarX,
    Shield
} from "lucide-react";
import ProtectedRoute from "../../../../src/components/ProtectedRoute";
import DashboardLayout from "../../../../src/components/DashboardLayout";
import Badge from "../../../../src/components/Badge";
import Button from "../../../../src/components/Button";
import AdminDataTable from "../../../../src/components/AdminDataTable";
import api from "../../../../src/services/api";
import { useTranslation } from "../../../../src/hooks/useTranslation";

export default function InactiveProviders() {
    const [providers, setProviders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    const { t } = useTranslation();

    const fetchInactiveProviders = async () => {
        setLoading(true);
        try {
            const res = await api.get("/api/admin/inactive-providers");
            setProviders(res.data);
        } catch (err) {
            console.error("Failed to fetch inactive providers:", err);
            setError(t("admin_error_fetch") || "Failed to load providers list.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchInactiveProviders();
    }, []);

    const filteredProviders = providers.filter(provider => {
        const matchesSearch =
            provider.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            provider.email?.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesSearch;
    });

    const columns = [
        {
            header: t("admin_inactive_col_provider"),
            render: (row) => (
                <div className="flex items-center gap-3">
                    {row.profile_image_url ? (
                        <img 
                            src={row.profile_image_url} 
                            alt={row.name} 
                            className="w-10 h-10 rounded-full object-cover border border-border"
                        />
                    ) : (
                        <div className="w-10 h-10 rounded-full bg-danger/10 flex items-center justify-center text-danger font-bold">
                            {row.name.charAt(0).toUpperCase()}
                        </div>
                    )}
                    <div>
                        <p className="font-bold text-foreground">{row.name}</p>
                        <p className="text-xs text-text-muted">{row.email}</p>
                    </div>
                </div>
            )
        },
        {
            header: t("admin_inactive_col_status"),
            render: (row) => (
                <div className="flex flex-col gap-1">
                    <Badge variant={
                        row.status === 'approved' ? 'success' :
                            row.status === 'pending' ? 'warning' :
                                row.status === 'suspended' ? 'danger' : 'secondary'
                    }>
                        {row.status}
                    </Badge>
                </div>
            )
        },
        {
            header: t("admin_inactive_col_sub"),
            render: (row) => (
                <div className="flex flex-col gap-1">
                    <Badge variant="danger" className="capitalize w-fit">
                        {row.subscription_status || t("admin_inactive_not_subscribed")}
                    </Badge>
                    {row.subscription_expiry && (
                        <span className="text-xs text-text-muted flex items-center gap-1 mt-1">
                            <CalendarX size={12} />
                            {t("admin_inactive_expired")} {new Date(row.subscription_expiry).toLocaleDateString()}
                        </span>
                    )}
                </div>
            )
        },
        {
            header: t("admin_inactive_col_joined"),
            render: (row) => (
                <div className="text-xs text-text-muted">
                    {new Date(row.created_at).toLocaleDateString()}
                </div>
            )
        }
    ];

    return (
        <ProtectedRoute roles={["admin"]}>
            <DashboardLayout>
                <div className="space-y-6 pb-10">
                    {/* Header */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                            <h1 className="text-3xl font-extrabold text-foreground tracking-tight flex items-center gap-3">
                                <UserX className="text-danger" size={32} />
                                {t("admin_inactive_providers_title")}
                            </h1>
                            <p className="text-text-muted mt-1">{t("admin_inactive_providers_desc")}</p>
                        </div>
                    </div>

                    {/* Mini Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <StatMiniCard 
                            title={t("admin_inactive_total_inactive")} 
                            value={providers.length} 
                            icon={<Users />} 
                            color="text-danger bg-danger/10" 
                        />
                    </div>

                    {/* Filters */}
                    <div className="bg-surface border border-border p-4 rounded-2xl flex flex-col lg:flex-row gap-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                            <input
                                type="text"
                                placeholder={t("admin_inactive_search_placeholder")}
                                className="w-full pl-12 pr-4 py-2.5 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>

                    {/* Data Table */}
                    <div className="bg-surface border border-border rounded-3xl overflow-hidden shadow-sm">
                        {error ? (
                            <div className="p-20 text-center">
                                <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                                <p className="text-lg font-bold">{error}</p>
                                <Button onClick={fetchInactiveProviders} className="mt-4">{t("admin_retry")}</Button>
                            </div>
                        ) : (
                            <AdminDataTable
                                loading={loading}
                                columns={columns}
                                data={filteredProviders}
                            />
                        )}

                        {!loading && filteredProviders.length === 0 && (
                            <div className="p-20 text-center">
                                <Shield className="w-12 h-12 text-success mx-auto mb-4 opacity-80" />
                                <p className="text-text-muted font-medium text-lg">{t("admin_inactive_all_active")}</p>
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
