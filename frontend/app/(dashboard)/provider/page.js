"use client";

import React, { useState, useEffect, useContext } from "react";
import {
  Calendar,
  CheckCircle2,
  Clock,
  DollarSign,
  MapPin,
  Star,
  User,
  Briefcase,
  AlertCircle,
  MoreVertical,
  ChevronRight,
  ShieldCheck,
  X,
  Check
} from "lucide-react";
import ProtectedRoute from "../../../src/components/ProtectedRoute";
import DashboardLayout from "../../../src/components/DashboardLayout";
import Badge from "../../../src/components/Badge";
import Button from "../../../src/components/Button";
import Card from "../../../src/components/Card";
import Skeleton, { CardSkeleton } from "../../../src/components/Skeleton";
import api from "../../../src/services/api";
import { AuthContext } from "../../../src/context/AuthContext";

export default function ProviderDashboard() {
  const { user } = useContext(AuthContext);
  const [stats, setStats] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProviderData = async () => {
      setLoading(true);
      try {
        const [statsRes, bookingsRes] = await Promise.all([
          api.get("/api/provider/stats").catch(() => ({ data: mockStats })),
          api.get("/api/provider/bookings?status=pending").catch(() => ({ data: mockPendingBookings }))
        ]);

        setStats(statsRes.data);
        setBookings(bookingsRes.data);
      } catch (err) {
        setError("Failed to load dashboard data. Please try again later.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchProviderData();
  }, []);

  const handleBookingAction = async (id, action) => {
    try {
      await api.put(`/api/provider/bookings/${id}/${action}`);
      setBookings(prev => prev.filter(b => b.id !== id));
    } catch (err) {
      alert(`Failed to ${action} booking request`);
    }
  };

  if (error) {
    return (
      <ProtectedRoute roles={["provider"]}>
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
    <ProtectedRoute roles={["provider"]}>
      <DashboardLayout>
        <div className="space-y-10 pb-10">
          {/* Top Navbar Contextual Info */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <h1 className="text-3xl font-extrabold text-foreground tracking-tight">Provider Dashboard</h1>
            <div className="flex items-center gap-2 text-sm font-medium text-text-muted bg-surface px-4 py-2 rounded-2xl border border-border shadow-sm">
              <MapPin className="w-4 h-4 text-primary" />
              <span>{user?.location || "Bahir Dar, Ethiopia"}</span>
            </div>
          </div>

          {/* Section 1: Welcome Banner */}
          <div className="relative overflow-hidden bg-gradient-to-br from-primary via-primary-hover to-blue-600 rounded-[2rem] p-8 md:p-12 text-white shadow-2xl">
            <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
              <div className="relative">
                <div className="w-24 h-24 md:w-32 md:h-32 rounded-3xl overflow-hidden border-4 border-white/20 shadow-xl bg-white/10 backdrop-blur-sm flex items-center justify-center">
                  {user?.profileImage ? (
                    <img src={user.profileImage} alt={user?.name} className="w-full h-full object-cover" />
                  ) : (
                    <User className="w-12 h-12 md:w-16 md:h-16 text-white/60" />
                  )}
                </div>
                <div className="absolute -bottom-2 -right-2 bg-green-500 p-1.5 rounded-xl border-4 border-primary shadow-lg">
                  <ShieldCheck className="w-5 h-5 text-white" />
                </div>
              </div>

              <div className="text-center md:text-left space-y-3">
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
                  <h2 className="text-3xl md:text-4xl font-black tracking-tight">Welcome, {user?.name || "Provider"}!</h2>
                  <Badge variant="success" className="bg-white/20 border-white/10 text-white backdrop-blur-md">Verified</Badge>
                </div>
                <p className="text-white/80 font-medium flex items-center justify-center md:justify-start gap-2 text-lg">
                  <Briefcase className="w-5 h-5" />
                  {user?.category || "Professional Services"} • {user?.location || "Bahir Dar"}
                </p>
                <div className="flex items-center justify-center md:justify-start gap-6 pt-2">
                  <div className="flex items-center gap-1.5">
                    <Star className="w-6 h-6 text-yellow-400 fill-yellow-400" />
                    <span className="text-xl font-bold">4.8</span>
                    <span className="text-white/60 text-sm">(124 Reviews)</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/4 w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/4 w-64 h-64 bg-black/10 rounded-full blur-2xl"></div>
          </div>

          {/* Section 2: Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {loading ? (
              [...Array(4)].map((_, i) => <CardSkeleton key={i} />)
            ) : (
              <>
                <StatCard
                  title="Pending Requests"
                  value={stats?.pendingRequests || 0}
                  icon={<Clock className="w-6 h-6" />}
                  variant="warning"
                  onClick={() => window.location.href = "/provider/bookings?filter=pending"}
                />
                <StatCard
                  title="Active Bookings"
                  value={stats?.activeBookings || 0}
                  icon={<Calendar className="w-6 h-6" />}
                  variant="primary"
                  onClick={() => window.location.href = "/provider/bookings?filter=active"}
                />
                <StatCard
                  title="Completed Jobs"
                  value={stats?.completedJobs || 0}
                  icon={<CheckCircle2 className="w-6 h-6" />}
                  variant="success"
                  onClick={() => window.location.href = "/provider/bookings?filter=completed"}
                />
                <StatCard
                  title="Total Earnings"
                  value={`${stats?.totalEarnings || "0"}`}
                  unit="ETB"
                  icon={<DollarSign className="w-6 h-6" />}
                  variant="info"
                  onClick={() => window.location.href = "/provider/reviews"}
                />
              </>
            )}
          </div>

          {/* Section 3: Incoming Booking Requests */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-2xl font-bold text-foreground flex items-center gap-2">
                <Briefcase className="w-6 h-6 text-primary" />
                Incoming Booking Requests
              </h3>
              {bookings.length > 0 && (
                <button className="text-primary font-bold hover:underline flex items-center gap-1 text-sm">
                  View All <ChevronRight className="w-4 h-4" />
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {loading ? (
                [...Array(3)].map((_, i) => <BookingRequestSkeleton key={i} />)
              ) : bookings.length > 0 ? (
                bookings.slice(0, 3).map((booking) => (
                  <BookingRequestCard
                    key={booking.id}
                    booking={booking}
                    onAccept={() => handleBookingAction(booking.id, "accept")}
                    onReject={() => handleBookingAction(booking.id, "reject")}
                  />
                ))
              ) : (
                <div className="col-span-full py-12 flex flex-col items-center justify-center bg-surface border-2 border-dashed border-border rounded-[2rem] text-center">
                  <div className="w-16 h-16 bg-background rounded-2xl flex items-center justify-center mb-4">
                    <Calendar className="w-8 h-8 text-text-muted" />
                  </div>
                  <h4 className="text-lg font-bold text-foreground">No pending requests</h4>
                  <p className="text-text-muted max-w-xs mt-1">Once you receive new booking requests, they will appear here.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}

// Sub-components
const StatCard = ({ title, value, unit, icon, variant, onClick }) => {
  const variantStyles = {
    primary: "bg-primary/10 text-primary border-primary/20",
    success: "bg-green-500/10 text-green-500 border-green-500/20",
    warning: "bg-orange-500/10 text-orange-500 border-orange-500/20",
    info: "bg-blue-500/10 text-blue-500 border-blue-500/20 shadow-blue-500/5",
  };

  return (
    <Card
      className="p-6 cursor-pointer group hover:-translate-y-1 transition-all duration-300"
      onClick={onClick}
    >
      <div className="flex items-center gap-5">
        <div className={`p-4 rounded-2xl border ${variantStyles[variant] || variantStyles.primary} group-hover:scale-110 transition-transform duration-300`}>
          {icon}
        </div>
        <div>
          <p className="text-xs font-bold text-text-muted uppercase tracking-widest mb-1">{title}</p>
          <div className="flex items-baseline gap-1">
            <h4 className="text-3xl font-black text-foreground">{value}</h4>
            {unit && <span className="text-xs font-bold text-text-muted">{unit}</span>}
          </div>
        </div>
      </div>
    </Card>
  );
};

const BookingRequestCard = ({ booking, onAccept, onReject }) => (
  <Card className="p-0 overflow-hidden !rounded-[2rem] group hover:shadow-xl duration-500">
    <div className="p-6 space-y-5">
      <div className="flex justify-between items-start">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-surface-hover flex items-center justify-center font-bold text-primary border border-border">
            {booking.customer?.[0] || "C"}
          </div>
          <div>
            <h4 className="font-bold text-foreground leading-none mb-1">{booking.customer}</h4>
            <Badge variant="warning" className="text-[10px] py-0 px-2">Pending</Badge>
          </div>
        </div>
        <button className="p-2 text-text-muted hover:bg-background rounded-xl transition-colors">
          <MoreVertical className="w-5 h-5" />
        </button>
      </div>

      <div className="space-y-3">
        <div className="flex items-center gap-2 text-sm text-foreground/80 font-medium">
          <Badge variant="info" className="py-0.5">{booking.category}</Badge>
        </div>
        <p className="text-sm text-text-muted line-clamp-2 leading-relaxed italic">
          "{booking.description || "No description provided."}"
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 pt-2">
        <div className="bg-background/80 p-3 rounded-2xl border border-border">
          <p className="text-[10px] uppercase font-bold text-text-muted mb-1">Date & Time</p>
          <p className="text-xs font-bold text-foreground flex items-center gap-1.5">
            <Calendar className="w-3 h-3 text-primary" /> {booking.date}
          </p>
          <p className="text-[11px] font-medium text-text-muted ml-4">{booking.time}</p>
        </div>
        <div className="bg-background/80 p-3 rounded-2xl border border-border flex flex-col justify-center">
          <p className="text-[10px] uppercase font-bold text-text-muted mb-1">Price</p>
          <p className="text-lg font-black text-primary leading-none">
            {booking.price} <span className="text-[10px]">ETB</span>
          </p>
        </div>
      </div>
    </div>

    <div className="flex border-t border-border">
      <button
        onClick={onReject}
        className="flex-1 py-4 flex items-center justify-center gap-2 font-bold text-red-500 hover:bg-red-500/5 transition-colors border-r border-border"
      >
        <X className="w-4 h-4" /> Reject
      </button>
      <button
        onClick={onAccept}
        className="flex-1 py-4 flex items-center justify-center gap-2 font-bold text-green-500 hover:bg-green-500/5 transition-colors"
      >
        <Check className="w-4 h-4" /> Accept
      </button>
    </div>
  </Card>
);

const BookingRequestSkeleton = () => (
  <div className="bg-surface border border-border rounded-[2rem] p-6 space-y-4">
    <div className="flex items-center gap-3">
      <Skeleton className="w-12 h-12 rounded-2xl" />
      <div className="space-y-2">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-3 w-16" />
      </div>
    </div>
    <Skeleton className="h-4 w-1/2" />
    <Skeleton className="h-10 w-full rounded-2xl" />
    <div className="flex gap-2">
      <Skeleton className="h-12 flex-1 rounded-2xl" />
      <Skeleton className="h-12 flex-1 rounded-2xl" />
    </div>
  </div>
);

// Mock data
const mockStats = {
  pendingRequests: 3,
  activeBookings: 12,
  completedJobs: 85,
  totalEarnings: "45,200",
};

const mockPendingBookings = [
  {
    id: "B-101",
    customer: "Abebe Balcha",
    category: "Plumbing",
    description: "Leaking pipe in my kitchen under the sink. Need immediate fix.",
    date: "Oct 24, 2024",
    time: "10:30 AM",
    price: "450",
    status: "Pending"
  },
  {
    id: "B-102",
    customer: "Sifan Tadesse",
    category: "Electrical",
    description: "Short circuit in the living room area. Power keeps tripping.",
    date: "Oct 25, 2024",
    time: "02:00 PM",
    price: "800",
    status: "Pending"
  },
  {
    id: "B-103",
    customer: "Henok Mulugeta",
    category: "Cleaning",
    description: "Full house cleaning for a 2-bedroom apartment.",
    date: "Oct 26, 2024",
    time: "09:00 AM",
    price: "1,200",
    status: "Pending"
  }
];
