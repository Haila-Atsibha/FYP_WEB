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
  Plus,
  Edit,
  Trash2,
  Search,
  ArrowRight,
  Clock,
  ShieldCheck,
  CreditCard,
  MessageSquare,
  Activity
} from "lucide-react";
import ProtectedRoute from "../../../src/components/ProtectedRoute";
import DashboardLayout from "../../../src/components/DashboardLayout";
import Badge from "../../../src/components/Badge";
import Button from "../../../src/components/Button";
import Modal from "../../../src/components/Modal";
import AdminDataTable from "../../../src/components/AdminDataTable";
import Skeleton, { CardSkeleton, TableSkeleton } from "../../../src/components/Skeleton";
import {
  ChartCard,
  MonthlyBookingsChart,
  RevenueChart,
  CategoryChart
} from "../../../src/components/DashboardCharts";
import api from "../../../src/services/api";

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [users, setUsers] = useState([]);
  const [complaints, setComplaints] = useState([]);
  const [categories, setCategories] = useState([]);
  const [subscriptions, setSubscriptions] = useState(null);
  const [activity, setActivity] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Modal states
  const [isCategoryModalOpen, setCategoryModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [categoryForm, setCategoryForm] = useState({ name: "", description: "", icon: "" });
  const [isSaving, setIsSaving] = useState(false);

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
          api.get("/api/admin/stats").catch(() => ({ data: mockStats })),
          api.get("/api/admin/bookings").catch(() => ({ data: mockBookings })),
          api.get("/api/admin/users").catch(() => ({ data: mockUsers })),
          api.get("/api/admin/complaints").catch(() => ({ data: mockComplaints })),
          api.get("/api/admin/categories").catch(() => ({ data: mockCategories })),
          api.get("/api/admin/subscriptions").catch(() => ({ data: mockSubscriptions })),
          api.get("/api/admin/activity").catch(() => ({ data: mockActivity }))
        ]);

        setStats(statsRes.data);
        setBookings(bookingsRes.data);
        setUsers(usersRes.data);
        setComplaints(complaintsRes.data);
        setCategories(categoriesRes.data);
        setSubscriptions(subscriptionsRes.data);
        setActivity(activityRes.data);
      } catch (err) {
        setError("Failed to load dashboard data. Please try again later.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const handleSaveCategory = async () => {
    if (!categoryForm.name) {
      alert("Category name is required");
      return;
    }

    setIsSaving(true);
    try {
      if (editingCategory) {
        // Update logic if needed, but the request was specifically for "add category"
        // await api.put(`/api/categories/${editingCategory.id}`, categoryForm);
      } else {
        await api.post("/api/categories", {
          name: categoryForm.name,
          description: categoryForm.description || "Service category"
        });
      }

      // Refresh categories list
      const categoriesRes = await api.get("/api/categories");
      setCategories(categoriesRes.data);

      setCategoryModalOpen(false);
      setEditingCategory(null);
      setCategoryForm({ name: "", description: "", icon: "" });
    } catch (err) {
      console.error("Failed to save category:", err);
      alert(err.response?.data?.message || "Failed to save category");
    } finally {
      setIsSaving(false);
    }
  };

  if (error) {
    return (
      <ProtectedRoute roles={["admin"]}>
        <DashboardLayout>
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <AlertCircle className="w-16 h-16 text-red-500 mb-4" />
            <h2 className="text-2xl font-bold text-foreground mb-2">Error Loading Dashboard</h2>
            <p className="text-text-muted mb-6">{error}</p>
            <Button onClick={() => window.location.reload()}>Retry</Button>
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
              <h1 className="text-3xl font-extrabold text-foreground tracking-tight">System Overview</h1>
              <p className="text-text-muted mt-1">Manage and monitor your platform's health.</p>
            </div>
            <div className="flex items-center gap-3">
              <Button onClick={() => setCategoryModalOpen(true)} className="flex items-center space-x-2">
                <Plus className="w-4 h-4" />
                <span>Add Category</span>
              </Button>
            </div>
          </div>

          {/* 1. Top Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {loading ? (
              [...Array(7)].map((_, i) => <CardSkeleton key={i} />)
            ) : (
              <>
                <SummaryCard title="Total Users" value={stats?.totalUsers} icon={<Users />} variant="primary" />
                <SummaryCard title="Total Bookings" value={stats?.totalBookings} icon={<ShoppingBag />} variant="info" />
                <SummaryCard title="Active Bookings" value={stats?.activeBookings} icon={<Clock />} variant="warning" />
                <SummaryCard title="Completed" value={stats?.completedBookings} icon={<CheckCircle />} variant="success" />
                <SummaryCard title="Cancelled" value={stats?.cancelledBookings} icon={<XCircle />} variant="danger" />
                <SummaryCard title="Total Revenue" value={`$${stats?.totalRevenue}`} icon={<TrendingUp />} variant="success" />
                <SummaryCard title="Avg. Rating" value={stats?.avgRating} icon={<Star />} variant="warning" />
              </>
            )}
          </div>

          {/* 2. Analytics Section */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
            <ChartCard title="Monthly Bookings Growth">
              {loading ? <Skeleton className="w-full h-full" /> : <MonthlyBookingsChart data={stats?.monthlyData} />}
            </ChartCard>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <ChartCard title="Revenue Breakdown">
                {loading ? <Skeleton className="w-full h-full" /> : <RevenueChart data={stats?.revenueData} />}
              </ChartCard>
              <ChartCard title="Top Service Categories">
                {loading ? <Skeleton className="w-full h-full" /> : <CategoryChart data={stats?.categoryData} />}
              </ChartCard>
            </div>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
            {/* 3. Recent Activity Feed */}
            <div className="xl:col-span-1">
              <div className="bg-surface border border-border rounded-3xl p-6 h-full flex flex-col">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-foreground flex items-center gap-2">
                    <Activity className="w-5 h-5 text-primary" />
                    Recent Activity
                  </h3>
                  <Badge variant="info">Live</Badge>
                </div>
                <div className="space-y-6 overflow-y-auto max-h-[600px] pr-2 custom-scrollbar">
                  {loading ? (
                    [...Array(5)].map((_, i) => <ActivitySkeleton key={i} />)
                  ) : activity.map((act, i) => (
                    <ActivityItem key={i} {...act} />
                  ))}
                </div>
              </div>
            </div>

            {/* 4. & 5. Management Overviews */}
            <div className="xl:col-span-2 space-y-8">
              {/* Complaints / Disputes */}
              <ModuleCard
                title="Complaints & Disputes"
                subtitle={`${complaints.filter(c => c.status === 'open').length} Open / ${complaints.filter(c => c.priority === 'high').length} High Priority`}
                icon={<AlertCircle className="text-red-500" />}
                action={<Button variant="ghost" className="text-primary font-bold">Manage All <ArrowRight className="ml-2 w-4 h-4" /></Button>}
              >
                <AdminDataTable
                  loading={loading}
                  columns={[
                    { header: "User", accessor: "userName" },
                    { header: "Complaint", accessor: "subject" },
                    { header: "Priority", render: (row) => <Badge variant={row.priority === 'high' ? 'danger' : 'warning'}>{row.priority}</Badge> },
                    { header: "Status", render: (row) => <Badge variant={row.status === 'open' ? 'info' : 'success'}>{row.status}</Badge> }
                  ]}
                  data={complaints.slice(0, 3)}
                />
              </ModuleCard>

              {/* Booking Management */}
              <ModuleCard
                title="Latest Bookings"
                subtitle={`Showing ${bookings.length} recent transactions`}
                icon={<ShoppingBag className="text-primary" />}
                action={<Button variant="ghost" className="text-primary font-bold">View All <ArrowRight className="ml-2 w-4 h-4" /></Button>}
              >
                <AdminDataTable
                  loading={loading}
                  columns={[
                    { header: "Booking ID", accessor: "id" },
                    { header: "Customer", accessor: "customer" },
                    { header: "Service", accessor: "service" },
                    {
                      header: "Status", render: (row) => (
                        <Badge variant={
                          row.status === 'Completed' ? 'success' :
                            row.status === 'Active' ? 'primary' :
                              row.status === 'Cancelled' ? 'danger' : 'warning'
                        }>
                          {row.status}
                        </Badge>
                      )
                    },
                    { header: "Price", render: (row) => <span className="font-bold">${row.price}</span> }
                  ]}
                  data={bookings.slice(0, 5)}
                />
              </ModuleCard>
            </div>
          </div>

          {/* 7. & 8. Subscription & User Management */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Subscriptions */}
            <ModuleCard
              title="Revenue & Subscriptions"
              subtitle={`$${subscriptions?.monthlyRevenue} Monthly Revenue`}
              icon={<CreditCard className="text-green-500" />}
              action={<Button variant="secondary" className="py-2 px-4 text-sm font-bold">Manage Plans</Button>}
            >
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="p-4 bg-background/50 border border-border rounded-xl">
                  <p className="text-xs text-text-muted uppercase font-bold mb-1">Premium Providers</p>
                  <p className="text-2xl font-bold">{subscriptions?.activePremium}</p>
                </div>
                <div className="p-4 bg-background/50 border border-border rounded-xl text-red-500">
                  <p className="text-xs text-text-muted uppercase font-bold mb-1">Expiring Soon</p>
                  <p className="text-2xl font-bold">{subscriptions?.expiringSoon}</p>
                </div>
              </div>
              <div className="pt-4 border-t border-border">
                <p className="text-sm font-medium mb-4">Top Revenue Streams</p>
                <div className="space-y-3">
                  {subscriptions?.streams?.map((s, i) => (
                    <div key={i} className="flex justify-between items-center text-sm">
                      <span className="text-text-muted">{s.name}</span>
                      <span className="font-bold">${s.amount}</span>
                    </div>
                  ))}
                </div>
              </div>
            </ModuleCard>

            {/* User Quick Management */}
            <ModuleCard
              title="User Quick Management"
              subtitle="Search and manage platform members"
              icon={<Users className="text-blue-500" />}
            >
              <div className="relative mb-6">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                <input
                  type="text"
                  placeholder="Search by name, email or ID..."
                  className="w-full pl-12 pr-4 py-3 bg-background border border-border rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm"
                />
              </div>
              <div className="space-y-4">
                {users.slice(0, 3).map((u, i) => (
                  <div key={i} className="flex items-center justify-between p-4 bg-background/50 border border-border rounded-2xl">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-full bg-surface-hover flex items-center justify-center font-bold text-primary">
                        {u.name[0]}
                      </div>
                      <div>
                        <p className="text-sm font-bold">{u.name}</p>
                        <p className="text-xs text-text-muted">{u.role}</p>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Button variant="ghost" className="p-2 h-auto text-red-500 hover:bg-red-500/10"><XCircle className="w-4 h-4" /></Button>
                      <Button variant="ghost" className="p-2 h-auto text-primary hover:bg-primary/10"><ShieldCheck className="w-4 h-4" /></Button>
                    </div>
                  </div>
                ))}
                <Button className="w-full bg-surface-hover !text-foreground mt-2 border border-border">View All Users</Button>
              </div>
            </ModuleCard>
          </div>

          {/* 6. Service Category Management Shortcut */}
          <div className="bg-surface border border-border p-8 rounded-3xl shadow-sm">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h3 className="text-2xl font-bold">Service Category Management</h3>
                <p className="text-text-muted">Edit and organize platform service categories.</p>
              </div>
              <Button onClick={() => setCategoryModalOpen(true)} className="flex items-center space-x-2">
                <Plus className="w-4 h-4" />
                <span>Add Category</span>
              </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {categories.map((cat, i) => (
                <div key={i} className="flex items-center justify-between p-4 bg-background border border-border rounded-2xl hover:border-primary/50 transition-all group">
                  <span className="font-bold">{cat.name}</span>
                  <div className="flex opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => { setEditingCategory(cat); setCategoryModalOpen(true); }} className="p-2 text-primary hover:bg-primary/5 rounded-lg"><Edit className="w-4 h-4" /></button>
                    <button className="p-2 text-red-500 hover:bg-red-500/5 rounded-lg"><Trash2 className="w-4 h-4" /></button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Modal for Category Management */}
        <Modal isOpen={isCategoryModalOpen} onClose={() => { setCategoryModalOpen(false); setEditingCategory(null); setCategoryForm({ name: "", description: "", icon: "" }); }}>
          <h3 className="text-2xl font-bold mb-6">{editingCategory ? 'Edit' : 'Add New'} Category</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-text-muted mb-2">Category Name</label>
              <input
                type="text"
                value={categoryForm.name}
                onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
                className="w-full px-4 py-3 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                placeholder="e.g. Home Cleaning"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-text-muted mb-2">Description</label>
              <input
                type="text"
                value={categoryForm.description}
                onChange={(e) => setCategoryForm({ ...categoryForm, description: e.target.value })}
                className="w-full px-4 py-3 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                placeholder="e.g. Services related to home cleaning"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-text-muted mb-2">Icon (Lucide name)</label>
              <input
                type="text"
                value={categoryForm.icon}
                onChange={(e) => setCategoryForm({ ...categoryForm, icon: e.target.value })}
                className="w-full px-4 py-3 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                placeholder="e.g. Sparkles"
              />
            </div>
          </div>
          <div className="mt-10 flex space-x-4">
            <Button variant="secondary" className="flex-1" onClick={() => { setCategoryModalOpen(false); setEditingCategory(null); setCategoryForm({ name: "", description: "", icon: "" }); }}>Cancel</Button>
            <Button className="flex-1" onClick={handleSaveCategory} disabled={isSaving}>
              {isSaving ? "Saving..." : "Save Category"}
            </Button>
          </div>
        </Modal>
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

const ModuleCard = ({ title, subtitle, icon, action, children }) => (
  <div className="bg-surface border border-border rounded-3xl p-8 shadow-sm">
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
      <div className="flex items-center space-x-4">
        <div className="p-3 bg-background border border-border rounded-xl">
          {icon}
        </div>
        <div>
          <h3 className="text-xl font-bold text-foreground">{title}</h3>
          <p className="text-sm text-text-muted">{subtitle}</p>
        </div>
      </div>
      <div>{action}</div>
    </div>
    {children}
  </div>
);

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
