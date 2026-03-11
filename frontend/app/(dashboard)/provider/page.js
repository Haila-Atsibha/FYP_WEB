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
  Check,
  Plus,
  MessageSquare,
  CheckCircle
} from "lucide-react";
import ProtectedRoute from "../../../src/components/ProtectedRoute";
import DashboardLayout from "../../../src/components/DashboardLayout";
import Badge from "../../../src/components/Badge";
import Button from "../../../src/components/Button";
import Card from "../../../src/components/Card";
import Input from "../../../src/components/Input";
import Modal from "../../../src/components/Modal";
import Skeleton, { CardSkeleton } from "../../../src/components/Skeleton";
import api from "../../../src/services/api";
import { useToast } from "../../../src/context/ToastContext";
import { AuthContext } from "../../../src/context/AuthContext";

export default function ProviderDashboard() {
  const { user } = useContext(AuthContext);
  const [stats, setStats] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [services, setServices] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { showToast } = useToast();

  // Add Service Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newService, setNewService] = useState({
    category_id: "",
    title: "",
    description: "",
    price: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Complaint & Rating Modal States
  const [complaintModalOpen, setComplaintModalOpen] = useState(false);
  const [ratingModalOpen, setRatingModalOpen] = useState(false);
  const [complaintData, setComplaintData] = useState({ subject: "", description: "", priority: "medium" });
  const [platformRating, setPlatformRating] = useState({ rating: 5, feedback: "" });
  const [myComplaints, setMyComplaints] = useState([]);
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [viewComplaintModalOpen, setViewComplaintModalOpen] = useState(false);

  useEffect(() => {
    const fetchProviderData = async () => {
      setLoading(true);
      setError(false);
      try {
        const fetchStats = api.get("/api/providers/stats").catch(err => { console.error("Stats Fetch Error:", err.response?.data || err.message); throw err; });
        const fetchBookings = api.get("/api/bookings/provider?status=pending").catch(err => { console.error("Bookings Fetch Error:", err.response?.data || err.message); throw err; });
        const fetchServices = api.get("/api/services/me").catch(err => { console.error("Services Fetch Error:", err.response?.data || err.message); throw err; });
        const fetchCategories = api.get("/api/providers/my-categories").catch(err => { console.error("Categories Fetch Error:", err.response?.data || err.message); throw err; });
        const fetchMyComplaints = api.get("/api/complaints/my").catch(err => { console.error("Complaints Fetch Error:", err.response?.data || err.message); return { data: [] }; });

        const [statsRes, bookingsRes, servicesRes, categoriesRes, myComplaintsRes] = await Promise.all([
          fetchStats, fetchBookings, fetchServices, fetchCategories, fetchMyComplaints
        ]);

        setStats(statsRes.data);
        setBookings(bookingsRes.data);
        setServices(servicesRes.data);
        setCategories(categoriesRes.data);
        setMyComplaints(myComplaintsRes.data);
      } catch (err) {
        console.error("DEBUG: Dashboard Data Fetch Failed:", err.config?.url, err.response?.data || err.message);
        setError("Failed to load dashboard data. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchProviderData();
  }, []);

  const handleCreateService = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await api.post("/api/services", newService);
      setServices([res.data.service, ...services]);
      setIsModalOpen(false);
      setNewService({ category_id: "", title: "", description: "", price: "" });
      showToast("Service created successfully!", "success");
    } catch (err) {
      showToast(err.response?.data?.message || "Failed to create service", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubscribe = async () => {
    setIsSubmitting(true);
    try {
      const res = await api.post("/api/payments/subscribe", { amount: 200 });
      if (res.data.checkout_url) {
        window.location.href = res.data.checkout_url;
      }
    } catch (err) {
      showToast(err.response?.data?.message || "Failed to initialize payment", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBookingAction = async (id, status) => {
    try {
      // status should be 'accepted' or 'rejected'
      await api.put(`/api/bookings/${id}/status`, { status });
      setBookings(prev => prev.filter(b => b.id !== id));
      // Refresh stats to reflect the change
      const statsRes = await api.get("/api/providers/stats");
      setStats(statsRes.data);
      showToast(`Booking ${status} successfully`, "success");
    } catch (err) {
      showToast(`Failed to update booking status`, "error");
      console.error("Booking Action Error:", err.response?.data || err.message);
    }
  };

  const handleSubmitComplaint = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await api.post("/api/complaints", complaintData);
      showToast("Complaint submitted successfully. Our team will review it.", "success");
      setComplaintModalOpen(false);
      setComplaintData({ subject: "", description: "", priority: "medium" });
      // Refresh complaints
      api.get("/api/complaints/my").then(res => setMyComplaints(res.data));
    } catch (err) {
      showToast(err.response?.data?.message || "Failed to submit complaint", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmitRating = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await api.post("/api/ratings/platform", platformRating);
      showToast("Thank you for your feedback!", "success");
      setRatingModalOpen(false);
      setPlatformRating({ rating: 5, feedback: "" });
    } catch (err) {
      alert(err.response?.data?.message || "Failed to submit rating");
    } finally {
      setIsSubmitting(false);
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
            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
              <div className="flex flex-col md:flex-row items-center gap-8">
                <div className="relative">
                  <div className="w-24 h-24 md:w-32 md:h-32 rounded-3xl overflow-hidden border-4 border-white/20 shadow-xl bg-white/10 backdrop-blur-sm flex items-center justify-center">
                    {user?.profile_image_url ? (
                      <img src={user.profile_image_url} alt={user?.name} className="w-full h-full object-cover" />
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
                </div>
              </div>

              {/* Add Service Button - Enhanced Visibility */}
              <div className="flex-shrink-0 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-300">
                <Button
                  onClick={() => setIsModalOpen(true)}
                  className="bg-foreground text-background hover:bg-foreground/90 border-none px-8 py-4 text-lg rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.3)] hover:shadow-2xl flex items-center gap-3 group transition-all transform hover:-translate-y-1"
                >
                  <Plus className="w-6 h-6 group-hover:rotate-90 transition-transform duration-300" />
                  Add New Service
                </Button>
              </div>
            </div>

            <div className="flex items-center justify-center md:justify-start gap-6 pt-6 relative z-10 border-t border-white/10 mt-6 max-w-xs mx-auto md:mx-0">
              <div className="flex items-center gap-1.5">
                <Star className="w-6 h-6 text-yellow-400 fill-yellow-400" />
                <span className="text-xl font-bold">{stats?.averageRating?.toFixed(1) || "0.0"}</span>
                <span className="text-white/60 text-sm">({stats?.totalReviews || 0} Reviews)</span>
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
                  value={`${stats?.totalEarnings?.toLocaleString() || "0"}`}
                  unit="ETB"
                  icon={<DollarSign className="w-6 h-6" />}
                  variant="info"
                  onClick={() => window.location.href = "/provider/reviews"}
                />
              </>
            )}
          </div>

          {/* New Section: Provider Subscription */}
          <div className="bg-surface border border-border rounded-[2rem] p-8 shadow-sm relative overflow-hidden">
            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-6">
                <div className={`p-5 rounded-2xl ${stats?.subscriptionStatus === 'active' ? 'bg-green-500/10 text-green-500' : 'bg-orange-500/10 text-orange-500'}`}>
                  <ShieldCheck className="w-8 h-8" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-2xl font-bold text-foreground">Provider Subscription</h3>
                  <p className="text-text-muted max-w-md">
                    To receive booking requests and appear in search results, providers must maintain an active monthly subscription.
                  </p>
                  {stats?.subscriptionStatus === 'active' ? (
                    <div className="flex items-center gap-2 pt-2">
                      <Badge variant="success">Active</Badge>
                      <span className="text-sm font-medium text-text-muted">
                        Expires on: {new Date(stats.subscriptionExpiry).toLocaleDateString()}
                      </span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 pt-2">
                      <Badge variant="warning">{stats?.subscriptionStatus || 'Inactive'}</Badge>
                      <span className="text-sm font-medium text-red-500">
                        Renew to stay visible to customers.
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex-shrink-0">
                <Button
                  onClick={handleSubscribe}
                  className={`${stats?.subscriptionStatus === 'active' ? 'bg-surface border-border text-foreground hover:bg-surface-hover shadow-none' : ''}`}
                  disabled={isSubmitting}
                >
                  {stats?.subscriptionStatus === 'active' ? 'Renew Early' : 'Subscribe Now – 200 ETB'}
                </Button>
              </div>
            </div>
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -translate-y-1/2 translate-x-1/2 -z-0"></div>
          </div>

          {/* New Section: Support & Feedback */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-surface border border-border rounded-[2rem] p-8 flex flex-col md:flex-row items-center justify-between gap-6 hover:shadow-lg transition-all border-l-4 border-l-orange-500">
              <div className="flex items-center gap-6 text-center md:text-left">
                <div className="p-4 bg-orange-500/10 text-orange-600 rounded-2xl">
                  <AlertCircle className="w-8 h-8" />
                </div>
                <div>
                  <h4 className="text-xl font-bold text-foreground">Have a complaint?</h4>
                  <p className="text-sm text-text-muted">Encountered an issue or have a dispute? Let us know.</p>
                </div>
              </div>
              <Button onClick={() => setComplaintModalOpen(true)} variant="outline" className="border-orange-500/20 text-orange-600 hover:bg-orange-500/5 whitespace-nowrap">
                Report Issue
              </Button>
            </div>

            <div className="bg-surface border border-border rounded-[2rem] p-8 flex flex-col md:flex-row items-center justify-between gap-6 hover:shadow-lg transition-all border-l-4 border-l-primary">
              <div className="flex items-center gap-6 text-center md:text-left">
                <div className="p-4 bg-primary/10 text-primary rounded-2xl">
                  <Star className="w-8 h-8" />
                </div>
                <div>
                  <h4 className="text-xl font-bold text-foreground">Rate the Platform</h4>
                  <p className="text-sm text-text-muted">Help us improve by rating your experience on QuickServe.</p>
                </div>
              </div>
              <Button onClick={() => setRatingModalOpen(true)} variant="outline" className="border-primary/20 text-primary hover:bg-primary/5 whitespace-nowrap">
                Give Feedback
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-10">
            {/* Section 3: Incoming Booking Requests */}
            <div className="xl:col-span-2 space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-2xl font-bold text-foreground flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-xl">
                    <Calendar className="w-6 h-6 text-primary" />
                  </div>
                  Recent Requests
                </h3>
                {bookings.length > 0 && (
                  <button className="text-primary font-bold hover:underline flex items-center gap-1 text-sm">
                    View All <ChevronRight className="w-4 h-4" />
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {loading ? (
                  [...Array(2)].map((_, i) => <BookingRequestSkeleton key={i} />)
                ) : bookings.length > 0 ? (
                  bookings.slice(0, 4).map((booking) => (
                    <BookingRequestCard
                      key={booking.id}
                      booking={booking}
                      onAccept={() => handleBookingAction(booking.id, "accepted")}
                      onReject={() => handleBookingAction(booking.id, "rejected")}
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

            {/* Section 4: My Services */}
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-2xl font-bold text-foreground flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-xl">
                    <Briefcase className="w-6 h-6 text-primary" />
                  </div>
                  My Services
                </h3>
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="text-primary font-bold hover:bg-primary/5 p-2 rounded-xl transition-colors"
                >
                  <Plus className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-4">
                {loading ? (
                  [...Array(3)].map((_, i) => <Skeleton key={i} className="h-24 w-full rounded-2xl" />)
                ) : services.length > 0 ? (
                  services.map((service) => (
                    <div key={service.id} className="bg-surface border border-border p-4 rounded-2xl hover:shadow-lg transition-all group relative overflow-hidden">
                      <div className="flex justify-between items-start mb-2">
                        <Badge variant="info" className="text-[10px]">{service.category_name}</Badge>
                        <span className="font-black text-primary">{service.price} <span className="text-[10px]">ETB</span></span>
                      </div>
                      <h4 className="font-bold text-foreground group-hover:text-primary transition-colors">{service.title}</h4>
                      <p className="text-xs text-text-muted mt-1 line-clamp-1">{service.description}</p>
                      <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full -translate-y-1/2 translate-x-1/2 -z-10"></div>
                    </div>
                  ))
                ) : (
                  <div className="py-8 flex flex-col items-center justify-center bg-surface border border-border rounded-2xl text-center">
                    <p className="text-sm text-text-muted mb-4">You haven't added any services yet.</p>
                    <Button onClick={() => setIsModalOpen(true)} className="py-2 px-4 text-xs">Add First Service</Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Add Service Modal */}
        <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
          <div className="space-y-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Briefcase className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-2xl font-bold text-foreground">Add New Service</h3>
              <p className="text-text-muted text-sm mt-1">Create a service for customers to book</p>
            </div>

            <form onSubmit={handleCreateService} className="space-y-4">
              <Input
                label="Service Title"
                placeholder="e.g. Professional Kitchen Cleaning"
                required
                value={newService.title}
                onChange={(e) => setNewService({ ...newService, title: e.target.value })}
              />

              <div className="space-y-2">
                <label className="block text-sm font-semibold text-foreground/80 ml-1">Category</label>
                <select
                  className="w-full bg-surface border border-border text-foreground rounded-2xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all appearance-none"
                  required
                  value={newService.category_id}
                  onChange={(e) => setNewService({ ...newService, category_id: e.target.value })}
                >
                  <option value="">Select a category</option>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>

              <Input
                label="Base Price (ETB)"
                type="number"
                placeholder="e.g. 500"
                required
                value={newService.price}
                onChange={(e) => setNewService({ ...newService, price: e.target.value })}
              />

              <div className="space-y-2">
                <label className="block text-sm font-semibold text-foreground/80 ml-1">Description</label>
                <textarea
                  className="w-full bg-surface border border-border text-foreground rounded-2xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all min-h-[100px]"
                  placeholder="Describe what's included in this service..."
                  required
                  value={newService.description}
                  onChange={(e) => setNewService({ ...newService, description: e.target.value })}
                />
              </div>

              <div className="flex gap-4 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1 bg-transparent border-border text-foreground hover:bg-surface-hover shadow-none"
                  onClick={() => setIsModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="flex-1"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Creating..." : "Create Service"}
                </Button>
              </div>
            </form>
          </div>
        </Modal>

        {/* Complaint Modal */}
        <Modal isOpen={complaintModalOpen} onClose={() => setComplaintModalOpen(false)}>
          <div className="space-y-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-orange-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="w-8 h-8 text-orange-600" />
              </div>
              <h3 className="text-2xl font-bold text-foreground">Submit a Complaint</h3>
              <p className="text-text-muted text-sm mt-1">Provide details and we will investigate the matter.</p>
            </div>

            <form onSubmit={handleSubmitComplaint} className="space-y-4">
              <Input
                label="Subject"
                placeholder="e.g. Booking dispute, Technical issue"
                required
                value={complaintData.subject}
                onChange={(e) => setComplaintData({ ...complaintData, subject: e.target.value })}
              />

              <div className="space-y-2">
                <label className="block text-sm font-semibold text-foreground/80 ml-1">Priority</label>
                <select
                  className="w-full bg-surface border border-border text-foreground rounded-2xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all appearance-none"
                  value={complaintData.priority}
                  onChange={(e) => setComplaintData({ ...complaintData, priority: e.target.value })}
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-semibold text-foreground/80 ml-1">Description</label>
                <textarea
                  className="w-full bg-surface border border-border text-foreground rounded-2xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all min-h-[120px]"
                  placeholder="Tell us more about the issue..."
                  required
                  value={complaintData.description}
                  onChange={(e) => setComplaintData({ ...complaintData, description: e.target.value })}
                />
              </div>

              <div className="flex gap-4 pt-4">
                <Button type="button" variant="outline" className="flex-1" onClick={() => setComplaintModalOpen(false)}>Cancel</Button>
                <Button type="submit" className="flex-1 bg-orange-600 border-none hover:bg-orange-700" disabled={isSubmitting}>
                  {isSubmitting ? "Submitting..." : "Submit Complaint"}
                </Button>
              </div>
            </form>
          </div>
        </Modal>

        {/* Platform Rating Modal */}
        <Modal isOpen={ratingModalOpen} onClose={() => setRatingModalOpen(false)}>
          <div className="space-y-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Star className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-2xl font-bold text-foreground">Rate QuickServe</h3>
              <p className="text-text-muted text-sm mt-1">Your feedback helps us build a better platform.</p>
            </div>

            <form onSubmit={handleSubmitRating} className="space-y-6">
              <div className="flex flex-col items-center gap-4">
                <p className="font-bold text-foreground">What do you think of the platform?</p>
                <div className="flex gap-3">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setPlatformRating({ ...platformRating, rating: s })}
                      className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all ${platformRating.rating >= s ? 'bg-primary text-white scale-110 shadow-lg' : 'bg-surface border border-border text-text-muted'}`}
                    >
                      <Star className={`w-6 h-6 ${platformRating.rating >= s ? 'fill-current' : ''}`} />
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-semibold text-foreground/80 ml-1">Feedback (Optional)</label>
                <textarea
                  className="w-full bg-surface border border-border text-foreground rounded-2xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all min-h-[100px]"
                  placeholder="Anything we can improve?"
                  value={platformRating.feedback}
                  onChange={(e) => setPlatformRating({ ...platformRating, feedback: e.target.value })}
                />
              </div>

              <div className="flex gap-4 pt-4">
                <Button type="button" variant="outline" className="flex-1" onClick={() => setRatingModalOpen(false)}>Skip</Button>
                <Button type="submit" className="flex-1" disabled={isSubmitting}>
                  {isSubmitting ? "Sending..." : "Submit Feedback"}
                </Button>
              </div>
            </form>
          </div>
        </Modal>
        {/* My Complaints Section */}
        {myComplaints.length > 0 && (
          <div className="mt-12 space-y-6 pb-12 transition-all duration-500 animate-in fade-in slide-in-from-bottom-5">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-black text-foreground flex items-center gap-2">
                <AlertCircle className="text-primary w-6 h-6" /> My History
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {myComplaints.map((complaint) => (
                <Card
                  key={complaint.id}
                  className="p-6 cursor-pointer hover:-translate-y-2 transition-all duration-500 border-l-4 border-l-primary !rounded-[2rem] bg-surface relative overflow-hidden group"
                  onClick={() => { setSelectedComplaint(complaint); setViewComplaintModalOpen(true); }}
                >
                  <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                    <MessageSquare className="w-12 h-12" />
                  </div>
                  <div className="flex justify-between items-start mb-4">
                    <Badge variant={complaint.status === 'open' ? 'info' : 'success'}>{complaint.status}</Badge>
                    <span className="text-[10px] uppercase font-bold text-text-muted">{new Date(complaint.created_at).toLocaleDateString()}</span>
                  </div>
                  <h4 className="font-bold mb-2 truncate text-foreground">{complaint.subject}</h4>
                  <p className="text-sm text-text-muted line-clamp-2 mb-4 leading-relaxed italic">
                    "{complaint.description}"
                  </p>
                  {(complaint.admin_reply && String(complaint.admin_reply).trim() !== "") && (
                    <div className="mt-2 py-2.5 px-3 bg-primary/10 rounded-xl border border-primary/20 flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-primary" />
                      <span className="text-[10px] font-bold text-primary uppercase">Response Available</span>
                    </div>
                  )}
                </Card>
              ))}
            </div>
          </div>
        )}


        {/* Complaint Detail Modal */}
        <Modal isOpen={viewComplaintModalOpen} onClose={() => { setViewComplaintModalOpen(false); setSelectedComplaint(null); }}>
          {selectedComplaint && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-2xl font-black text-foreground">Ticket Review</h3>
                <Badge variant={selectedComplaint.status === 'open' ? 'info' : 'success'} className="px-3 py-1 text-sm">{selectedComplaint.status.toUpperCase()}</Badge>
              </div>

              <div className="space-y-5">
                <div className="bg-background/50 border border-border rounded-[2rem] p-6 space-y-4">
                  <div>
                    <p className="text-[10px] text-text-muted uppercase font-bold tracking-widest mb-1.5">Your Subject</p>
                    <p className="font-bold text-xl text-foreground mb-4">{selectedComplaint.subject}</p>

                    <p className="text-[10px] text-text-muted uppercase font-bold tracking-widest mb-1.5">Your Message</p>
                    <div className="bg-background p-5 rounded-2xl border border-border/50 text-sm leading-relaxed italic text-foreground/80">
                      "{selectedComplaint.description}"
                    </div>
                  </div>
                </div>

                {(selectedComplaint.admin_reply && String(selectedComplaint.admin_reply).trim() !== "") ? (
                  <div className="bg-primary/5 border border-primary/20 rounded-[2rem] p-6 animate-in zoom-in-95 duration-500">
                    <div className="flex items-center justify-between mb-3">
                      <p className="text-[10px] text-primary uppercase font-bold tracking-widest flex items-center gap-2">
                        <ShieldCheck className="w-4 h-4" /> Official Response
                      </p>
                      <span className="text-[10px] font-medium text-text-muted">
                        Replied on {selectedComplaint.replied_at ? new Date(selectedComplaint.replied_at).toLocaleDateString() : 'N/A'}
                      </span>
                    </div>
                    <div className="text-sm leading-relaxed font-medium text-foreground p-1">
                      {selectedComplaint.admin_reply}
                    </div>
                  </div>
                ) : (
                  <div className="bg-surface-hover/30 border border-dashed border-border rounded-[2rem] p-10 text-center">
                    <Clock className="w-10 h-10 text-primary/40 mx-auto mb-3 animate-pulse" />
                    <h5 className="font-bold text-foreground mb-1">Under Review</h5>
                    <p className="text-xs text-text-muted max-w-[200px] mx-auto">Our specialized team is currently reviewing your ticket. We'll respond shortly.</p>
                  </div>
                )}
              </div>

              <Button variant="secondary" className="w-full py-4 !rounded-2xl font-bold" onClick={() => setViewComplaintModalOpen(false)}>Close Review</Button>
            </div>
          )}
        </Modal>
      </DashboardLayout >
    </ProtectedRoute >
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
            {unit && <span className="text-xs font-bold text-text-muted ml-1">{unit}</span>}
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
            {booking.customer_name?.[0] || booking.customer?.[0] || "C"}
          </div>
          <div>
            <h4 className="font-bold text-foreground leading-none mb-1">{booking.customer_name || booking.customer}</h4>
            <Badge variant="warning" className="text-[10px] py-0 px-2">Pending</Badge>
          </div>
        </div>
        <button className="p-2 text-text-muted hover:bg-background rounded-xl transition-colors">
          <MoreVertical className="w-5 h-5" />
        </button>
      </div>

      <div className="space-y-3">
        <div className="flex items-center gap-2 text-sm text-foreground/80 font-medium">
          <Badge variant="info" className="py-0.5">{booking.category_name || booking.category}</Badge>
        </div>
        <p className="text-sm text-text-muted line-clamp-2 leading-relaxed italic">
          "{booking.description || "No description provided."}"
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 pt-2">
        <div className="bg-background/80 p-3 rounded-2xl border border-border">
          <p className="text-[10px] uppercase font-bold text-text-muted mb-1">Date & Time</p>
          <p className="text-xs font-bold text-foreground flex items-center gap-1.5">
            <Calendar className="w-3 h-3 text-primary" /> {new Date(booking.booking_date).toLocaleDateString()}
          </p>
          <p className="text-[11px] font-medium text-text-muted ml-5">{booking.booking_time}</p>
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
