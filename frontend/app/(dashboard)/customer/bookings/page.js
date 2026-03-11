"use client";

import React, { useState, useEffect, useContext } from "react";
import {
    Calendar,
    Clock,
    CheckCircle,
    XCircle,
    AlertCircle,
    ArrowLeft,
    RefreshCw,
    Search,
    MessageSquare,
    Star
} from "lucide-react";
import Link from "next/link";
import { AuthContext } from "../../../../src/context/AuthContext";
import ProtectedRoute from "../../../../src/components/ProtectedRoute";
import DashboardLayout from "../../../../src/components/DashboardLayout";
import Badge from "../../../../src/components/Badge";
import Button from "../../../../src/components/Button";
import Skeleton, { CardSkeleton } from "../../../../src/components/Skeleton";
import api from "../../../../src/services/api";
import { useToast } from "../../../../src/context/ToastContext";
import Modal from "../../../../src/components/Modal";

export default function BookingsPage() {
    const { user, loading: authLoading } = useContext(AuthContext);
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState("active"); // "active" or "history"
    const [cancellingId, setCancellingId] = useState(null);
    const { showToast } = useToast();

    // Review Modal State
    const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
    const [selectedBooking, setSelectedBooking] = useState(null);
    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState("");
    const [isSubmittingReview, setIsSubmittingReview] = useState(false);

    const fetchBookings = async () => {
        if (!user) return;
        setLoading(true);
        try {
            const response = await api.get("/api/bookings/my");
            setBookings(response.data);
        } catch (err) {
            console.error("Error fetching bookings:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!authLoading && user) {
            fetchBookings();
            clearNotifications();
        }
    }, [user, authLoading]);

    const clearNotifications = async () => {
        try {
            await api.put("/api/notifications/mark-type", { type: 'booking' });
        } catch (err) {
            console.error("Error clearing booking notifications:", err);
        }
    };

    const handleCancelBooking = async (id) => {
        if (!confirm("Are you sure you want to cancel this booking?")) return;

        setCancellingId(id);
        try {
            await api.put(`/api/bookings/${id}/status`, { status: "cancelled" });
            // Update local state instead of refetching for better UX
            setBookings(prev => prev.map(b => b.id === id ? { ...b, status: "cancelled" } : b));
            showToast("Booking cancelled successfully", "success");
        } catch (err) {
            console.error("Error cancelling booking:", err);
            showToast(err.response?.data?.message || "Failed to cancel booking", "error");
        } finally {
            setCancellingId(null);
        }
    };

    const handleOpenReviewModal = (booking) => {
        setSelectedBooking(booking);
        setRating(5);
        setComment("");
        setIsReviewModalOpen(true);
    };

    const handleSubmitReview = async (e) => {
        e.preventDefault();
        setIsSubmittingReview(true);
        try {
            await api.post("/api/reviews", {
                booking_id: selectedBooking.id,
                rating,
                comment
            });
            setIsReviewModalOpen(false);
            // Mark as reviewed in local state
            setReviewing(prev => prev.map(b => b.id === selectedBooking.id ? { ...b, is_reviewed: true } : b));
            showToast("Thank you for your review!", "success");
        } catch (err) {
            console.error("Error submitting review:", err);
            showToast(err.response?.data?.message || "Failed to submit review", "error");
        } finally {
            setIsSubmittingReview(false);
        }
    };

    const activeBookings = bookings.filter(b => ["pending", "accepted"].includes(b.status));
    const historyBookings = bookings.filter(b => ["completed", "rejected", "cancelled"].includes(b.status));

    const displayBookings = activeTab === "active" ? activeBookings : historyBookings;

    return (
        <ProtectedRoute roles={["customer"]}>
            <DashboardLayout>
                <div className="max-w-5xl mx-auto space-y-8">

                    {/* Header */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                            <Link href="/customer" className="text-primary text-sm font-bold flex items-center gap-1 mb-2 hover:underline">
                                <ArrowLeft size={16} /> Back to Dashboard
                            </Link>
                            <h1 className="text-3xl font-extrabold text-foreground tracking-tight">Your Bookings</h1>
                            <p className="text-text-muted mt-1 text-sm font-medium">Manage and track your service requests.</p>
                        </div>
                        <Button onClick={fetchBookings} className="bg-surface text-foreground border border-border hover:bg-surface-hover flex items-center gap-2 py-2 px-4 h-auto shadow-none">
                            <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
                            Refresh
                        </Button>
                    </div>

                    {/* Tabs */}
                    <div className="flex p-1 bg-surface rounded-2xl border border-border w-fit">
                        <button
                            onClick={() => setActiveTab("active")}
                            className={`px-6 py-2 rounded-xl text-sm font-bold transition-all ${activeTab === "active"
                                ? "bg-primary text-white shadow-lg"
                                : "text-text-muted hover:text-foreground"
                                }`}
                        >
                            Active Bookings {activeBookings.length > 0 && `(${activeBookings.length})`}
                        </button>
                        <button
                            onClick={() => setActiveTab("history")}
                            className={`px-6 py-2 rounded-xl text-sm font-bold transition-all ${activeTab === "history"
                                ? "bg-primary text-white shadow-lg"
                                : "text-text-muted hover:text-foreground"
                                }`}
                        >
                            Booking History
                        </button>
                    </div>

                    {/* Bookings List */}
                    <div className="space-y-4">
                        {loading ? (
                            [...Array(3)].map((_, i) => <CardSkeleton key={i} />)
                        ) : displayBookings.length === 0 ? (
                            <div className="py-20 text-center bg-surface rounded-[2.5rem] border border-dashed border-border">
                                <div className="w-16 h-16 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto mb-4">
                                    <Calendar size={32} />
                                </div>
                                <h3 className="text-xl font-bold text-foreground">No {activeTab} bookings found</h3>
                                <p className="text-text-muted mt-2 max-w-xs mx-auto">
                                    {activeTab === "active"
                                        ? "You don't have any bookings currently in progress."
                                        : "Your booking history is empty."}
                                </p>
                                {activeTab === "active" && (
                                    <Link href="/services">
                                        <Button className="mt-6">Explore Services</Button>
                                    </Link>
                                )}
                            </div>
                        ) : (
                            displayBookings.map((booking) => (
                                <BookingCard
                                    key={booking.id}
                                    booking={booking}
                                    onCancel={() => handleCancelBooking(booking.id)}
                                    onReview={() => handleOpenReviewModal(booking)}
                                    isCancelling={cancellingId === booking.id}
                                />
                            ))
                        )}
                    </div>
                </div>

                {/* Review Modal */}
                <Modal isOpen={isReviewModalOpen} onClose={() => setIsReviewModalOpen(false)}>
                    <div className="space-y-6">
                        <div className="text-center">
                            <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                <Star className="w-8 h-8 text-primary fill-primary" />
                            </div>
                            <h3 className="text-2xl font-bold text-foreground">Rate & Review</h3>
                            <p className="text-text-muted text-sm mt-1">How was your experience with {selectedBooking?.provider_name}?</p>
                        </div>

                        <form onSubmit={handleSubmitReview} className="space-y-4">
                            <div className="flex justify-center gap-2 py-2">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <button
                                        key={star}
                                        type="button"
                                        onClick={() => setRating(star)}
                                        className="focus:outline-none transition-transform active:scale-90"
                                    >
                                        <Star
                                            size={32}
                                            className={`${star <= rating ? "text-yellow-400 fill-yellow-400" : "text-border"}`}
                                        />
                                    </button>
                                ))}
                            </div>

                            <div className="space-y-2">
                                <label className="block text-sm font-semibold text-foreground/80 ml-1">Your Comment</label>
                                <textarea
                                    className="w-full bg-surface border border-border text-foreground rounded-2xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all min-h-[120px]"
                                    placeholder="Tell others what you thought of the service..."
                                    required
                                    value={comment}
                                    onChange={(e) => setComment(e.target.value)}
                                />
                            </div>

                            <div className="flex gap-4 pt-4">
                                <Button
                                    type="button"
                                    variant="outline"
                                    className="flex-1 bg-transparent border-border text-foreground hover:bg-surface-hover shadow-none"
                                    onClick={() => setIsReviewModalOpen(false)}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    className="flex-1"
                                    disabled={isSubmittingReview}
                                >
                                    {isSubmittingReview ? "Submitting..." : "Submit Review"}
                                </Button>
                            </div>
                        </form>
                    </div>
                </Modal>
            </DashboardLayout>
        </ProtectedRoute>
    );
}

const BookingCard = ({ booking, onCancel, onReview, isCancelling }) => {
    const getStatusBadge = (status) => {
        switch (status) {
            case "pending": return <Badge variant="warning">Pending Approval</Badge>;
            case "accepted": return <Badge variant="primary">Accepted</Badge>;
            case "completed": return <Badge variant="success">Completed</Badge>;
            case "cancelled": return <Badge variant="danger">Cancelled</Badge>;
            case "rejected": return <Badge variant="danger">Rejected</Badge>;
            default: return <Badge>{status}</Badge>;
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return "N/A";
        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <div className="bg-surface border border-border p-6 rounded-[2rem] shadow-sm hover:shadow-md transition-all group">
            <div className="flex flex-col md:flex-row justify-between gap-6">
                <div className="flex gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
                        <Clock size={28} />
                    </div>
                    <div className="space-y-1">
                        <div className="flex items-center gap-3 flex-wrap">
                            <h3 className="text-xl font-black text-foreground">{booking.title}</h3>
                            {getStatusBadge(booking.status)}
                        </div>
                        <p className="text-text-muted font-bold text-sm">
                            Provider: <span className="text-foreground">{booking.provider_name || "Unknown Provider"}</span>
                        </p>
                        <div className="flex items-center gap-4 mt-2">
                            <div className="flex items-center gap-1.5 text-xs text-text-muted font-medium">
                                <Calendar size={14} className="text-primary" />
                                {formatDate(booking.created_at)}
                            </div>
                            <div className="text-sm font-black text-primary">
                                ETB {parseFloat(booking.total_price).toLocaleString()}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex flex-col items-center gap-2 self-end md:self-center">
                    {booking.status === "completed" && !booking.is_reviewed && (
                        <Button
                            onClick={onReview}
                            className="bg-primary text-white hover:bg-primary-hover border-none py-2.5 px-6 rounded-xl text-sm h-auto flex items-center gap-2 font-bold w-full"
                        >
                            <Star size={16} fill="currentColor" />
                            Rate & Review
                        </Button>
                    )}
                    {booking.status === "completed" && booking.is_reviewed && (
                        <Badge variant="success" className="py-2 px-4 rounded-xl flex items-center gap-1.5 opacity-80">
                            <CheckCircle size={14} /> Reviewed
                        </Badge>
                    )}
                    {booking.status === "accepted" && (
                        <Link href={`/chat/${booking.id}`} className="w-full">
                            <Button className="bg-secondary text-white hover:bg-secondary-dark border-none py-2 px-4 rounded-xl text-sm h-auto flex items-center gap-2 font-bold w-full">
                                <MessageSquare size={16} />
                                Chat with Provider
                            </Button>
                        </Link>
                    )}
                    {booking.status === "pending" && (
                        <Button
                            onClick={onCancel}
                            disabled={isCancelling}
                            className="bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white border border-red-500/20 py-2 px-4 rounded-xl text-sm h-auto shadow-none active:scale-95"
                        >
                            {isCancelling ? "Cancelling..." : "Cancel Booking"}
                        </Button>
                    )}
                </div>
            </div>
        </div>
    );
};
