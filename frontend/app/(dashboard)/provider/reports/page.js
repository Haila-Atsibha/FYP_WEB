"use client";

import React, { useState, useEffect } from "react";
import {
  FileText,
  Printer,
  DollarSign,
  Star,
  CheckCircle,
  Clock,
  Briefcase
} from "lucide-react";
import ProtectedRoute from "../../../../src/components/ProtectedRoute";
import DashboardLayout from "../../../../src/components/DashboardLayout";
import api from "../../../../src/services/api";
import Button from "../../../../src/components/Button";
import { useTranslation } from "../../../../src/hooks/useTranslation";

export default function ProviderReports() {
  const { t } = useTranslation();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [providerName, setProviderName] = useState("");

  useEffect(() => {
    const fetchReportData = async () => {
      setLoading(true);
      try {
        const [statsRes, profileRes] = await Promise.all([
            api.get("/api/providers/stats"),
            api.get("/api/providers/profile/me")
        ]);
        setStats(statsRes.data);
        setProviderName(profileRes.data.profile?.name || profileRes.data.user?.name || "Provider");
      } catch (err) {
        console.error("Report fetch error:", err);
        setError("Failed to load report data. Please try again later.");
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
    <ProtectedRoute roles={["provider"]}>
      <DashboardLayout>
        {/* Top Action Bar - Hidden during print */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 print:hidden">
          <div>
            <h1 className="text-3xl font-extrabold text-foreground tracking-tight">{t("provider_my_reports")}</h1>
            <p className="text-text-muted mt-1">{t("provider_reports_desc")}</p>
          </div>
          <div className="flex gap-4 mt-4 md:mt-0">
            <Button onClick={handlePrint} className="flex items-center gap-2 shadow-lg shadow-primary/20">
              <Printer size={18} />
              {t("btn_print_export")}
            </Button>
          </div>
        </div>

        {/* Loading / Error States */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-20 bg-surface border border-border border-dashed rounded-3xl print:hidden">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-primary mb-4"></div>
            <p className="text-text-muted font-medium">{t("provider_compiling_report")}</p>
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
                <h2 className="text-xl font-bold text-text-muted print:text-gray-600 mt-1">{t("provider_performance_report")}</h2>
                <p className="text-md font-bold text-primary mt-2">{providerName}</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-bold text-text-muted print:text-gray-600">{t("provider_generated_on")}</p>
                <p className="text-lg font-black text-foreground print:text-black">{today}</p>
              </div>
            </div>

            {/* Financial & Rating Overview */}
            <section className="mb-10">
              <h3 className="text-2xl font-black mb-6 text-foreground print:text-black flex items-center gap-2">
                <Star className="text-primary" /> {t("provider_performance_summary")}
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <ReportMetricBox title={t("provider_total_earnings")} value={`$${stats.totalEarnings.toFixed(2)}`} />
                <ReportMetricBox title={t("provider_average_rating")} value={`${Number(stats.averageRating).toFixed(1)}/5.0`} />
                <ReportMetricBox title={t("provider_total_reviews")} value={stats.totalReviews} />
                <ReportMetricBox title={t("provider_total_customers")} value={stats.totalCustomers} />
              </div>
            </section>

            {/* Booking Analytics */}
            <section className="mb-10">
              <h3 className="text-2xl font-black mb-6 text-foreground print:text-black flex items-center gap-2">
                <Briefcase className="text-primary" /> {t("provider_booking_analytics")}
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <ReportMetricBox title={t("provider_total_bookings")} value={stats.totalBookings} />
                <ReportMetricBox title={t("provider_completed_jobs")} value={stats.completedJobs} />
                <ReportMetricBox title={t("provider_active_bookings")} value={stats.activeBookings} />
                <ReportMetricBox title={t("provider_pending_requests")} value={stats.pendingRequests} />
              </div>
              <div className="grid grid-cols-2 gap-4 mt-4">
                <ReportMetricBox title={t("provider_cancelled_rejected")} value={stats.cancelledBookings} />
                <ReportMetricBox title={t("provider_services_offered")} value={stats.totalServices} />
              </div>
            </section>



            {/* Subscription Info */}
            <section className="mb-10">
                <h3 className="text-2xl font-black mb-6 text-foreground print:text-black flex items-center gap-2">
                    <CheckCircle className="text-primary" /> {t("provider_subscription_payments")}
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    <ReportMetricBox title={t("provider_total_sub_payments")} value={stats.subscriptionPaymentsCount} />
                    <ReportMetricBox title={t("provider_total_amount_paid")} value={`$${stats.subscriptionPaymentsTotal.toFixed(2)}`} />
                </div>
                <div className="p-6 border border-border print:border-gray-300 rounded-2xl flex justify-between items-center bg-background print:bg-white">
                    <div>
                        <p className="text-xs font-bold text-text-muted print:text-gray-500 uppercase tracking-widest mb-1">{t("provider_subscription_status")}</p>
                        <p className="text-lg font-bold text-foreground print:text-black capitalize">{stats.subscriptionStatus || "N/A"}</p>
                    </div>
                    <div className="text-right">
                        <p className="text-xs font-bold text-text-muted print:text-gray-500 uppercase tracking-widest mb-1">{t("provider_valid_until")}</p>
                        <p className="text-lg font-bold text-foreground print:text-black">
                            {stats.subscriptionExpiry ? new Date(stats.subscriptionExpiry).toLocaleDateString() : "N/A"}
                        </p>
                    </div>
                </div>
            </section>
            
            {/* Footer */}
            <div className="mt-16 pt-6 border-t border-border print:border-gray-300 text-center flex justify-between items-center">
              <p className="text-xs font-bold text-text-muted print:text-gray-500 uppercase tracking-widest">{t("provider_end_of_report")}</p>
              <p className="text-xs font-bold text-text-muted print:text-gray-500 uppercase tracking-widest">{t("provider_portal_footer")}</p>
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
