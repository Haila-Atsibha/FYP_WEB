"use client";

import React, { useState, useEffect } from "react";
import {
  FileText,
  Printer,
  Download,
  Calendar,
  DollarSign,
  Users,
  CheckCircle,
  Activity
} from "lucide-react";
import ProtectedRoute from "../../../../src/components/ProtectedRoute";
import DashboardLayout from "../../../../src/components/DashboardLayout";
import api from "../../../../src/services/api";
import { useTranslation } from "../../../../src/hooks/useTranslation";
import Button from "../../../../src/components/Button";

export default function AdminReports() {
  const { t } = useTranslation();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchReportData = async () => {
      setLoading(true);
      try {
        const statsRes = await api.get("/api/admin/stats");
        setStats(statsRes.data);
      } catch (err) {
        console.error("Report fetch error:", err);
        setError(t("admin_reports_fetch_error"));
      } finally {
        setLoading(false);
      }
    };

    fetchReportData();
  }, []);

  const handlePrint = () => {
    window.print();
  };

  const today = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <ProtectedRoute roles={["admin"]}>
      <DashboardLayout>
        {/* Top Action Bar - Hidden during print */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 print:hidden">
          <div>
            <h1 className="text-3xl font-extrabold text-foreground tracking-tight">{t("admin_reports_title")}</h1>
            <p className="text-text-muted mt-1">{t("admin_reports_desc")}</p>
          </div>
          <div className="flex gap-4 mt-4 md:mt-0">
            <Button onClick={handlePrint} className="flex items-center gap-2 shadow-lg shadow-primary/20">
              <Printer size={18} />
              {t("admin_reports_print_btn")}
            </Button>
          </div>
        </div>

        {/* Loading / Error States */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-20 bg-surface border border-border border-dashed rounded-3xl print:hidden">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-primary mb-4"></div>
            <p className="text-text-muted font-medium">{t("admin_reports_compiling")}</p>
          </div>
        )}

        {error && (
          <div className="p-8 bg-red-500/10 border border-red-500/20 rounded-3xl text-center print:hidden">
            <p className="text-red-500 font-bold">{error}</p>
          </div>
        )}

        {/* Report Content - This section is styled for print */}
        {!loading && !error && stats && (
          <div className="bg-surface border border-white/5 print:border-none rounded-3xl p-6 md:p-10 shadow-sm print:shadow-none print:p-0 print:bg-white">
            {/* Report Header */}
            <div className="border-b-2 border-primary/20 pb-6 mb-8 flex justify-between items-end">
              <div>
                <h1 className="text-4xl font-black text-foreground print:text-black">QuickServe</h1>
                <h2 className="text-xl font-bold text-text-muted print:text-gray-600 mt-1">{t("admin_reports_exec_title")}</h2>
              </div>
              <div className="text-right">
                <p className="text-sm font-bold text-text-muted print:text-gray-600">{t("admin_reports_generated_on")}</p>
                <p className="text-lg font-black text-foreground print:text-black">{today}</p>
              </div>
            </div>

            {/* Financial Overview */}
            <section className="mb-10">
              <h3 className="text-2xl font-black mb-6 text-foreground print:text-black flex items-center gap-2">
                <DollarSign className="text-primary" /> {t("admin_reports_finance_title")}
              </h3>
              <div className="grid grid-cols-2 gap-6">
                <ReportMetricBox title={t("admin_reports_total_rev")} value={`$${stats.totalRevenue}`} />
                <ReportMetricBox title={t("admin_reports_sub_rev")} value={`$${stats.subscriptionRevenue}`} />
              </div>
            </section>

            {/* Platform Engagement */}
            <section className="mb-10">
              <h3 className="text-2xl font-black mb-6 text-foreground print:text-black flex items-center gap-2">
                <Activity className="text-primary" /> {t("admin_reports_engagement_title")}
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <ReportMetricBox title={t("admin_reports_total_users")} value={stats.totalUsers} />
                <ReportMetricBox title={t("admin_reports_total_bookings")} value={stats.totalBookings} />
                <ReportMetricBox title={t("admin_reports_completed_jobs")} value={stats.completedBookings} />
                <ReportMetricBox title={t("admin_reports_active_bookings")} value={stats.activeBookings} />
                <ReportMetricBox title={t("admin_reports_rejected_bookings")} value={stats.rejectedBookings} />
                <ReportMetricBox title={t("admin_reports_avg_rating")} value={stats.avgRating} />
              </div>
            </section>

            {/* Users & Subscriptions */}
            <section className="mb-10">
              <h3 className="text-2xl font-black mb-6 text-foreground print:text-black flex items-center gap-2">
                <Users className="text-primary" /> {t("admin_reports_users_subs_title")}
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <ReportMetricBox title={t("admin_reports_active_subs")} value={stats.activeSubscribers} />
                <ReportMetricBox title={t("admin_reports_inactive_subs")} value={stats.inactiveSubscribers} />
                <ReportMetricBox title={t("admin_reports_pending_verifications")} value={stats.pendingVerifications} />
              </div>
            </section>

            {/* Operations & Support */}
            <section className="mb-10">
              <h3 className="text-2xl font-black mb-6 text-foreground print:text-black flex items-center gap-2">
                <CheckCircle className="text-primary" /> {t("admin_reports_ops_support_title")}
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <ReportMetricBox title={t("admin_reports_total_complaints")} value={stats.complaintsSummary?.total || 0} />
                <ReportMetricBox title={t("admin_reports_open_complaints")} value={stats.complaintsSummary?.open || 0} />
                <ReportMetricBox title={t("admin_reports_high_priority")} value={stats.complaintsSummary?.highPriority || 0} />
              </div>
            </section>

            {/* Breakdown Tables */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              {/* Category Breakdown */}
              <section>
                <h3 className="text-xl font-bold mb-4 text-foreground print:text-black">{t("admin_reports_top_categories")}</h3>
                <div className="border border-border print:border-gray-300 rounded-xl overflow-hidden">
                  <table className="w-full text-left">
                    <thead className="bg-surface-hover print:bg-gray-100 border-b border-border print:border-gray-300">
                      <tr>
                        <th className="p-4 font-black text-sm text-text-muted print:text-gray-600">{t("admin_reports_col_category")}</th>
                        <th className="p-4 font-black text-sm text-text-muted print:text-gray-600 text-right">{t("admin_reports_col_bookings")}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border print:divide-gray-300">
                      {stats.categoryData?.labels?.length > 0 ? (
                        stats.categoryData.labels.map((label, idx) => (
                          <tr key={idx} className="bg-background print:bg-white">
                            <td className="p-4 font-bold text-foreground print:text-black">{label}</td>
                            <td className="p-4 font-medium text-foreground print:text-black text-right">{stats.categoryData.values[idx]}</td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="2" className="p-4 text-center text-text-muted italic">{t("admin_reports_no_cat_data")}</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </section>

              {/* Monthly Revenue Breakdown */}
              <section>
                <h3 className="text-xl font-bold mb-4 text-foreground print:text-black">{t("admin_reports_recent_rev_trend")}</h3>
                <div className="border border-border print:border-gray-300 rounded-xl overflow-hidden">
                  <table className="w-full text-left">
                    <thead className="bg-surface-hover print:bg-gray-100 border-b border-border print:border-gray-300">
                      <tr>
                        <th className="p-4 font-black text-sm text-text-muted print:text-gray-600">{t("admin_reports_col_period")}</th>
                        <th className="p-4 font-black text-sm text-text-muted print:text-gray-600 text-right">{t("admin_reports_col_revenue")}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border print:divide-gray-300">
                      {stats.revenueData?.labels?.length > 0 ? (
                        stats.revenueData.labels.map((label, idx) => (
                          <tr key={idx} className="bg-background print:bg-white">
                            <td className="p-4 font-bold text-foreground print:text-black">{label}</td>
                            <td className="p-4 font-medium text-foreground print:text-black text-right">${stats.revenueData.values[idx]}</td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="2" className="p-4 text-center text-text-muted italic">{t("admin_reports_no_rev_data")}</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </section>
            </div>
            
            {/* Footer */}
            <div className="mt-16 pt-6 border-t border-border print:border-gray-300 text-center">
              <p className="text-xs font-bold text-text-muted print:text-gray-500 uppercase tracking-widest">{t("admin_reports_footer")}</p>
            </div>
          </div>
        )}
      </DashboardLayout>
    </ProtectedRoute>
  );
}

const ReportMetricBox = ({ title, value }) => (
  <div className="p-6 bg-surface-hover print:bg-gray-50 border border-border print:border-gray-300 rounded-2xl">
    <p className="text-xs font-black text-text-muted print:text-gray-500 uppercase tracking-widest mb-2">{title}</p>
    <p className="text-3xl font-black text-foreground print:text-black">{value}</p>
  </div>
);
