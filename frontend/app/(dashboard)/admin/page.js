"use client";

import React, { useState, useEffect } from "react";
import {
  Users,
  ShoppingBag,
  CheckCircle,
  XCircle,
  TrendingUp,
  Star,
  AlertCircle,
  Activity,
  Clock,
  ShieldCheck,
  CreditCard,
  ArrowRight
} from "lucide-react";
import Link from "next/link";
import ProtectedRoute from "../../../src/components/ProtectedRoute";
import DashboardLayout from "../../../src/components/DashboardLayout";
import Badge from "../../../src/components/Badge";
import Button from "../../../src/components/Button";
import Modal from "../../../src/components/Modal";
import Skeleton, { CardSkeleton, TableSkeleton } from "../../../src/components/Skeleton";
import api from "../../../src/services/api";
import { useToast } from "../../../src/context/ToastContext";
import { useTranslation } from "../../../src/hooks/useTranslation";

export default function AdminDashboard() {
  const { t } = useTranslation();
  const [stats, setStats] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [users, setUsers] = useState([]);
  const [complaints, setComplaints] = useState([]);
  const [categories, setCategories] = useState([]);
  const [subscriptions, setSubscriptions] = useState(null);
  const [activity, setActivity] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { showToast } = useToast();

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        const [
          statsRes,
          bookingsRes,
          usersRes,
          complaintsRes,
          categoriesRes,
          subscriptionsRes,
          activityRes
        ] = await Promise.all([
          api.get("/api/admin/stats"),
          api.get("/api/admin/bookings"),
          api.get("/api/admin/users"),
          api.get("/api/admin/complaints"),
          api.get("/api/admin/categories"),
          api.get("/api/admin/subscriptions"),
          api.get("/api/admin/activity")
        ]);

        setStats(statsRes.data);
        setBookings(bookingsRes.data);
        setUsers(usersRes.data);
        setComplaints(complaintsRes.data);
        setCategories(categoriesRes.data);
        setSubscriptions(subscriptionsRes.data);
        setActivity(activityRes.data);
      } catch (dashboardError) {
        console.error("Dashboard fetch error:", dashboardError);
        const errorMsg =
          dashboardError.response?.data?.message ||
          dashboardError.response?.data?.error ||
          t("admin_error_fetch");
        setError(errorMsg);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);


  if (error) {
    return (
      <ProtectedRoute roles={["admin"]}>
        <DashboardLayout>
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <AlertCircle className="w-16 h-16 text-red-500 mb-4" />
            <h2 className="text-2xl font-bold text-foreground mb-2">{t("admin_error_loading")}</h2>
            <p className="text-text-muted mb-6">{error}</p>
            <Button onClick={() => window.location.reload()}>{t("admin_retry")}</Button>
          </div>
        </DashboardLayout>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute roles={["admin"]}>
      <DashboardLayout>
        <div className="space-y-10 pb-10">
          {/* Top Section: Header & Quick Actions */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-extrabold text-foreground tracking-tight">{t("admin_system_overview")}</h1>
              <p className="text-text-muted mt-1">{t("admin_system_overview_desc")}</p>
            </div>
          </div>

          {/* 1. Top Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {loading ? (
              [...Array(7)].map((_, i) => <CardSkeleton key={i} />)
            ) : (
              <>
                <SummaryCard title={t("admin_total_users")} value={stats?.totalUsers} icon={<Users />} variant="primary" />
                <SummaryCard title={t("admin_total_bookings")} value={stats?.totalBookings} icon={<ShoppingBag />} variant="info" />
                <SummaryCard title={t("admin_active_bookings")} value={stats?.activeBookings} icon={<Clock />} variant="warning" />
                <SummaryCard title={t("admin_completed")} value={stats?.completedBookings} icon={<CheckCircle />} variant="success" />
                <SummaryCard title={t("admin_rejected")} value={stats?.rejectedBookings} icon={<XCircle />} variant="danger" />
                <SummaryCard title={t("admin_booking_revenue")} value={`$${stats?.totalRevenue}`} icon={<TrendingUp />} variant="success" />
                <SummaryCard title={t("admin_sub_revenue")} value={`$${stats?.subscriptionRevenue}`} icon={<CreditCard />} variant="info" />
                <SummaryCard title={t("admin_avg_rating")} value={stats?.avgRating ? `${parseFloat(stats.avgRating).toFixed(1)}/5` : "N/A"} icon={<Star />} variant="warning" />
              </>
            )}
          </div>


          <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
            {/* 3. Navigation Hub */}
            <div className="xl:col-span-2 space-y-8">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <NavHubCard
                  title={t("sidebar_bookings")}
                  description={t("admin_bookings_desc")}
                  icon={<ShoppingBag />}
                  href="/admin/bookings"
                  stats={`${bookings.length}${t("admin_total")}`}
                  color="primary"
                />
                <NavHubCard
                  title={t("admin_user_mgmt")}
                  description={t("admin_user_mgmt_desc")}
                  icon={<Users />}
                  href="/admin/users"
                  stats={`${stats?.totalUsers || 0}${t("admin_members")}`}
                  color="info"
                />
                <NavHubCard
                  title={t("sidebar_categories")}
                  description={t("admin_categories_desc")}
                  icon={<ShieldCheck />}
                  href="/admin/categories"
                  stats={`${categories.length}${t("admin_active")}`}
                  color="warning"
                />
                <NavHubCard
                  title={t("admin_verifications")}
                  description={t("admin_verifications_desc")}
                  icon={<CheckCircle />}
                  href="/admin/pending"
                  stats={`${stats?.pendingVerifications || 0}${t("admin_pending")}`}
                  color="success"
                />
                <NavHubCard
                  title={t("sidebar_complaints")}
                  description={t("admin_complaints_desc")}
                  icon={<AlertCircle />}
                  href="/admin/complaints"
                  stats={`${stats?.complaintsSummary?.open || 0}${t("admin_open")}`}
                  color="danger"
                  isUrgent={stats?.complaintsSummary?.highPriority > 0}
                />
                <NavHubCard
                  title={t("sidebar_subscriptions")}
                  description={t("admin_subscriptions_desc")}
                  icon={<CreditCard />}
                  href="/admin/subscriptions"
                  stats={`$${subscriptions?.monthlyRevenue || 0}${t("admin_monthly")}`}
                  color="info"
                />
              </div>

            </div>

            {/* 4. Recent Activity Feed */}
            <div className="xl:col-span-1">
              <div className="bg-surface border border-border rounded-3xl p-6 h-full flex flex-col shadow-sm">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-foreground flex items-center gap-2">
                    <Activity className="w-5 h-5 text-primary" />
                    {t("admin_recent_activities")}
                  </h3>
                  <Badge variant="info" className="animate-pulse">{t("admin_live")}</Badge>
                </div>
                <div className="space-y-6 overflow-y-auto max-h-[600px] pr-2 custom-scrollbar">
                  {loading ? (
                    [...Array(5)].map((_, i) => <ActivitySkeleton key={i} />)
                  ) : activity.map((act, i) => (
                    <ActivityItem key={i} {...act} />
                  ))}
                </div>
                <div className="mt-6 pt-6 border-t border-border flex justify-center">
                   <p className="text-xs text-text-muted font-medium italic">{t("admin_showing_latest")}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

      </DashboardLayout>
    </ProtectedRoute>
  );
}

// Sub-components for better modularity
const SummaryCard = ({ title, value, icon, variant }) => {
  const variantMap = {
    primary: "text-primary bg-primary/10",
    success: "text-green-500 bg-green-500/10",
    danger: "text-red-500 bg-red-500/10",
    warning: "text-yellow-500 bg-yellow-500/10",
    info: "text-blue-500 bg-blue-500/10"
  };

  return (
    <div className="bg-surface border border-border p-6 rounded-2xl shadow-sm hover:translate-y-[-4px] transition-all duration-300">
      <div className={`p-3 rounded-xl w-fit mb-4 ${variantMap[variant] || variantMap.primary}`}>
        {React.cloneElement(icon, { size: 24 })}
      </div>
      <p className="text-sm font-bold text-text-muted uppercase tracking-wider mb-1">{title}</p>
      <h3 className="text-3xl font-extrabold text-foreground tracking-tight">{value}</h3>
    </div>
  );
};

const ActivityItem = ({ userName, action, time }) => (
  <div className="flex items-start space-x-4 group animate-in slide-in-from-bottom duration-500">
    <div className="w-10 h-10 rounded-full bg-surface-hover flex-shrink-0 flex items-center justify-center font-bold text-primary border border-border">
      {userName[0]}
    </div>
    <div className="flex-1">
      <p className="text-sm font-bold text-foreground">
        {userName} <span className="font-medium text-text-muted">{action}</span>
      </p>
      <p className="text-xs text-text-muted mt-1 flex items-center gap-1">
        <Clock className="w-3 h-3" />
        {time}
      </p>
    </div>
  </div>
);

const ActivitySkeleton = () => (
  <div className="flex items-center space-x-4">
    <Skeleton className="w-10 h-10 rounded-full" />
    <div className="flex-1">
      <Skeleton className="h-4 w-3/4 mb-2" />
      <Skeleton className="h-3 w-1/4" />
    </div>
  </div>
);

const NoDataPlaceholder = ({ text }) => {
  const { t } = useTranslation();
  return (
    <div className="flex flex-col items-center justify-center h-full text-text-muted italic space-y-2">
      <div className="p-4 bg-background/50 rounded-full border border-border/50">
        <TrendingUp className="w-8 h-8 opacity-20" />
      </div>
      <p className="text-sm">{text || t("admin_no_data")}</p>
    </div>
  );
};

const NavHubCard = ({ title, description, icon, href, stats, color, isUrgent }) => {
  const { t } = useTranslation();
  const colorMap = {
    primary: "text-primary bg-primary/10 border-primary/20 hover:border-primary/40 shadow-primary/5",
    success: "text-green-500 bg-green-500/10 border-green-500/20 hover:border-green-500/40 shadow-green-500/5",
    warning: "text-yellow-500 bg-yellow-500/10 border-yellow-500/20 hover:border-yellow-500/40 shadow-yellow-500/5",
    danger: "text-red-500 bg-red-500/10 border-red-500/20 hover:border-red-500/40 shadow-red-500/5",
    info: "text-blue-500 bg-blue-500/10 border-blue-500/20 hover:border-blue-500/40 shadow-blue-500/5"
  };

  return (
    <Link href={href} className={`bg-surface border p-6 rounded-3xl transition-all duration-300 hover:translate-y-[-4px] group shadow-sm flex flex-col justify-between h-full ${colorMap[color] || colorMap.primary}`}>
      <div className="flex items-start justify-between mb-4">
        <div className={`p-3 rounded-2xl ${colorMap[color]?.split(' border')[0]}`}>
          {React.cloneElement(icon, { size: 24, className: "group-hover:scale-110 transition-transform" })}
        </div>
        {isUrgent && <Badge variant="danger" className="animate-bounce">{t("admin_action_required")}</Badge>}
      </div>
      <div>
        <h3 className="text-xl font-bold text-foreground mb-1 flex items-center gap-2">
          {title}
          <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
        </h3>
        <p className="text-sm text-text-muted mb-4">{description}</p>
        <div className="flex items-center gap-2">
          <span className="text-sm font-black px-3 py-1 bg-surface rounded-full border border-border shadow-inner truncate max-w-full">
            {stats}
          </span>
        </div>
      </div>
    </Link>
  );
};

// Mock data as fallback
const mockStats = {
  totalUsers: 1250,
  totalBookings: 840,
  activeBookings: 42,
  completedBookings: 750,
  cancelledBookings: 48,
  totalRevenue: "45,280",
  avgRating: "4.8/5",
  monthlyData: { labels: ['Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb'], values: [320, 450, 410, 580, 720, 840] },
  revenueData: { labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'], values: [8500, 12000, 10500, 14280] },
  categoryData: { labels: ['Cleaning', 'Plumbing', 'Electric', 'Moving'], values: [45, 25, 15, 15] }
};

const mockBookings = [
  { id: "QS-821", customer: "John Doe", service: "House Cleaning", status: "Completed", price: "80" },
  { id: "QS-822", customer: "Sarah Smith", service: "Plumbing Repair", status: "Active", price: "120" },
  { id: "QS-823", customer: "Mike Johnson", service: "Electrical Fix", status: "Pending", price: "95" },
  { id: "QS-824", customer: "Emily Davis", service: "Furniture Moving", status: "Cancelled", price: "250" },
  { id: "QS-825", customer: "Robert Brown", service: "Car Wash", status: "Completed", price: "45" }
];

const mockUsers = [
  { name: "Alice Thompson", email: "alice@example.com", role: "Customer", status: "Active" },
  { name: "Bob Wilson", email: "bob@proservice.com", role: "Provider", status: "Pending" },
  { name: "Charlie Davis", email: "charlie@gmail.com", role: "Customer", status: "Suspended" }
];

const mockComplaints = [
  { userName: "Emily Rose", subject: "Provider was late", priority: "high", status: "open" },
  { userName: "Mike Chen", subject: "Refund request", priority: "medium", status: "open" },
  { userName: "David Hall", subject: "Incomplete work", priority: "high", status: "closed" }
];

const mockCategories = [
  { name: "Cleaning", icon: "Sparkles" },
  { name: "Plumbing", icon: "Droplets" },
  { name: "Electric", icon: "Zap" },
  { name: "Moving", icon: "Truck" }
];

const mockSubscriptions = {
  monthlyRevenue: "12,450",
  activePremium: 85,
  expiringSoon: 12,
  streams: [
    { name: "Provider Premium Plans", amount: "8,500" },
    { name: "Service Commissions", amount: "3,150" },
    { name: "Promoted Listings", amount: "800" }
  ]
};

const mockActivity = [
  { userName: "John Doe", action: "booked a House Cleaning", time: "2 hours ago" },
  { userName: "Global Cleaners", action: "completed a service", time: "3 hours ago" },
  { userName: "Sarah Smith", action: "registered as a Provider", time: "5 hours ago" },
  { userName: "Mike Johnson", action: "filed a complaint", time: "8 hours ago" },
  { userName: "Robert Brown", action: "updated his profile", time: "1 day ago" }
];
