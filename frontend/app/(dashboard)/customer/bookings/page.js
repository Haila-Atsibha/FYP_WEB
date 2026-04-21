"use client";

import React, { useState, useEffect, useContext } from "react";
import {
    Clock,
    CheckCircle,
    XCircle,
    ArrowLeft,
    RefreshCw,
    MessageSquare,
    Star,
    ShoppingBag,
    ChefHat,
    Bike
} from "lucide-react";
import Link from "next/link";
import { AuthContext } from "../../../../src/context/AuthContext";
import { useTranslation } from "../../../../src/hooks/useTranslation";
import ProtectedRoute from "../../../../src/components/ProtectedRoute";
import DashboardLayout from "../../../../src/components/DashboardLayout";
import Badge from "../../../../src/components/Badge";
import Button from "../../../../src/components/Button";
import Skeleton, { CardSkeleton } from "../../../../src/components/Skeleton";
import api from "../../../../src/services/api";
import { useToast } from "../../../../src/context/ToastContext";
import Modal from "../../../../src/components/Modal";
import { motion, AnimatePresence } from "framer-motion";

export default function BookingsPage() {
    const { t } = useTranslation();
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
            console.error("Error fetching orders:", err);
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
            console.error("Error clearing order notifications:", err);
        }
    };

    const handleCancelBooking = async (id) => {
        if (!confirm("Are you sure you want to cancel this order?")) return;

        setCancellingId(id);
        try {
            await api.put(`/api/bookings/${id}/status`, { status: "cancelled" });
            setBookings(prev => prev.map(b => b.id === id ? { ...b, status: "cancelled" } : b));
            showToast("Order cancelled successfully", "success");
        } catch (err) {
            console.error("Error cancelling order:", err);
            showToast(err.response?.data?.message || "Failed to cancel order", "error");
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
            setBookings(prev => prev.map(b => b.id === selectedBooking.id ? { ...b, is_reviewed: true } : b));
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
                <div className="max-w-5xl mx-auto space-y-8 pb-10">

                    {/* Header */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                            <Link href="/customer" className="text-primary text-sm font-bold flex items-center gap-1 mb-2 hover:text-secondary transition-colors">
                                <ArrowLeft size={16} /> {t("btn_back_to_dashboard")}
                            </Link>
                            <h1 className="text-4xl font-black text-foreground tracking-tight">{t("customer_orders_title")}</h1>
                            <p className="text-text-muted mt-2 text-sm font-medium">{t("customer_orders_subtitle")}</p>
                        </div>
                        <Button onClick={fetchBookings} className="bg-surface/50 backdrop-blur-md text-foreground border border-white/10 hover:border-primary flex items-center gap-2 py-3 px-5 h-auto shadow-sm transition-all rounded-xl">
                            <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
                            {t("btn_refresh_status")}
                        </Button>
                    </div>

                    {/* Tabs */}
                    <div className="flex p-1.5 glass-card rounded-2xl w-fit relative z-10">
                        <button
                            onClick={() => setActiveTab("active")}
                            className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all relative ${activeTab === "active"
                                ? "text-white"
                                : "text-text-muted hover:text-white"
                                }`}
                        >
                            {activeTab === "active" && (
                                <motion.div layoutId="activeTab" className="absolute inset-0 bg-primary rounded-xl -z-10 shadow-lg shadow-primary/20" />
                            )}
                            {t("tab_active_orders")} {activeBookings.length > 0 && `(${activeBookings.length})`}
                        </button>
                        <button
                            onClick={() => setActiveTab("history")}
                            className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all relative ${activeTab === "history"
                                ? "text-white"
                                : "text-text-muted hover:text-white"
                                }`}
                        >
                            {activeTab === "history" && (
                                <motion.div layoutId="activeTab" className="absolute inset-0 bg-primary rounded-xl -z-10 shadow-lg shadow-primary/20" />
                            )}
                            {t("tab_order_history")}
                        </button>
                    </div>

                    {/* Orders List */}
                    <div className="space-y-6">
                        {loading ? (
                            [...Array(2)].map((_, i) => <CardSkeleton key={i} />)
                        ) : displayBookings.length === 0 ? (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="py-24 text-center glass-card rounded-[2.5rem]">
                                <div className="w-20 h-20 bg-primary/10 text-primary rounded-[2rem] flex items-center justify-center mx-auto mb-6 shadow-inner shadow-primary/20">
                                    <ShoppingBag size={40} />
                                </div>
                                <h3 className="text-2xl font-bold text-foreground">{activeTab === "active" ? t("no_active_orders") : t("no_history_orders")}</h3>
                                <p className="text-text-muted mt-3 max-w-sm mx-auto">
                                    {activeTab === "active"
                                        ? t("no_active_orders_desc")
                                        : t("no_history_orders_desc")}
                                </p>
                                {activeTab === "active" && (
                                    <Link href="/services">
                                        <Button className="mt-8 px-8 py-4 rounded-2xl shadow-lg shadow-primary/20 hover:scale-105 transition-transform font-bold text-lg">{t("btn_explore_menu")}</Button>
                                    </Link>
                                )}
                            </motion.div>
                        ) : (
                            <AnimatePresence>
                                {displayBookings.map((booking, idx) => (
                                    <motion.div
                                        key={booking.id}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, scale: 0.95 }}
                                        transition={{ delay: idx * 0.1 }}
                                    >
                                        <OrderCard
                                            booking={booking}
                                            onCancel={() => handleCancelBooking(booking.id)}
                                            onReview={() => handleOpenReviewModal(booking)}
                                            isCancelling={cancellingId === booking.id}
                                            t={t}
                                        />
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        )}
                    </div>
                </div>

                {/* Review Modal */}
                <Modal isOpen={isReviewModalOpen} onClose={() => setIsReviewModalOpen(false)}>
                    <div className="space-y-6">
                        <div className="text-center">
                            <div className="w-16 h-16 bg-gradient-to-br from-primary to-secondary rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                                <Star className="w-8 h-8 text-white fill-white" />
                            </div>
                            <h3 className="text-2xl font-bold text-foreground">{t("rate_meal_title")}</h3>
                            <p className="text-text-muted text-sm mt-1">{t("rate_meal_desc")}{selectedBooking?.provider_name}?</p>
                        </div>

                        <form onSubmit={handleSubmitReview} className="space-y-4">
                            <div className="flex justify-center gap-2 py-4">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <button
                                        key={star}
                                        type="button"
                                        onClick={() => setRating(star)}
                                        className="focus:outline-none transition-transform active:scale-90 hover:scale-110"
                                    >
                                        <Star
                                            size={40}
                                            className={`${star <= rating ? "text-yellow-400 fill-yellow-400 drop-shadow-[0_0_8px_rgba(250,204,21,0.5)]" : "text-white/10"}`}
                                        />
                                    </button>
                                ))}
                            </div>

                            <div className="space-y-2">
                                <label className="block text-sm font-bold text-foreground/80 ml-1">{t("label_feedback")}</label>
                                <textarea
                                    className="w-full bg-surface/50 border border-white/10 text-white rounded-2xl px-5 py-4 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all min-h-[120px] backdrop-blur-md"
                                    placeholder={t("placeholder_feedback")}
                                    required
                                    value={comment}
                                    onChange={(e) => setComment(e.target.value)}
                                />
                            </div>

                            <div className="flex gap-4 pt-4">
                                <Button
                                    type="button"
                                    variant="outline"
                                    className="flex-1 bg-transparent border-white/10 text-foreground hover:bg-surface shadow-none rounded-xl"
                                    onClick={() => setIsReviewModalOpen(false)}
                                >
                                    {t("btn_cancel")}
                                </Button>
                                <Button
                                    type="submit"
                                    className="flex-1 rounded-xl bg-gradient-to-r from-primary to-secondary shadow-lg shadow-primary/20"
                                    disabled={isSubmittingReview}
                                >
                                    {isSubmittingReview ? t("btn_submitting") : t("btn_submit_review")}
                                </Button>
                            </div>
                        </form>
                    </div>
                </Modal>
            </DashboardLayout>
        </ProtectedRoute>
    );
}

const OrderCard = ({ booking, onCancel, onReview, isCancelling, t }) => {
    // Determine progress state (1: Received, 2: Preparing, 3: Delivered/Completed)
    let progressStep = 0;
    if (booking.status === "pending") progressStep = 1;
    if (booking.status === "accepted") progressStep = 2; // Approximating "Preparing"
    if (booking.status === "completed") progressStep = 3;
    if (booking.status === "cancelled" || booking.status === "rejected") progressStep = -1;

    const formatDate = (dateString) => {
        if (!dateString) return "N/A";
        return new Date(dateString).toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
        });
    };

    return (
        <div className="glass-card p-8 rounded-[2.5rem] relative overflow-hidden group">
            {/* Background glow for active orders */}
            {progressStep === 2 && (
                <div className="absolute inset-0 bg-primary/5 opacity-50 pointer-events-none animate-pulse duration-3000" />
            )}

            <div className="relative z-10 flex flex-col gap-8">
                {/* Header info */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div className="flex items-center gap-5">
                        <div className={`w-16 h-16 rounded-[1.5rem] flex items-center justify-center text-white shadow-xl ${progressStep === 1 ? 'bg-orange-500' :
                                progressStep === 2 ? 'bg-blue-500' :
                                    progressStep === 3 ? 'bg-green-500' : 'bg-red-500'
                            }`}>
                            {progressStep === 3 ? <CheckCircle size={32} /> : <ShoppingBag size={32} />}
                        </div>
                        <div>
                            <h3 className="text-2xl font-black text-foreground tracking-tight">{booking.title}</h3>
                            <p className="text-text-muted font-medium mt-1">
                                from <span className="text-foreground font-bold">{booking.provider_name || "Restaurant"}</span>
                            </p>
                        </div>
                    </div>
                    <div className="text-left md:text-right">
                        <div className="text-sm font-bold text-text-muted uppercase tracking-wider mb-1">{t("order_total")}</div>
                        <div className="text-3xl font-black text-primary text-gradient">
                            ${parseFloat(booking.total_price).toLocaleString()}
                        </div>
                        <div className="text-xs text-text-muted mt-1">Ordered at {formatDate(booking.created_at)}</div>
                    </div>
                </div>

                {/* Tracking UI (Only for active or completed, omit for cancelled) */}
                {progressStep > 0 && (
                    <div className="py-6 border-y border-white/5 relative">
                        <div className="flex justify-between relative z-10">
                            {/* Step 1 */}
                            <div className="flex flex-col items-center gap-3 w-1/3">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center border-4 z-10 bg-surface transition-colors ${progressStep >= 1 ? 'border-orange-500 text-orange-500' : 'border-white/10 text-white/20'}`}>
                                    <Clock size={18} />
                                </div>
                                <div className="text-center">
                                    <div className={`text-sm font-bold ${progressStep >= 1 ? 'text-white' : 'text-text-muted'}`}>{t("tracker_received")}</div>
                                    {progressStep === 1 && <div className="text-xs text-orange-400 mt-1 animate-pulse">{t("tracker_waiting")}</div>}
                                </div>
                            </div>

                            {/* Step 2 */}
                            <div className="flex flex-col items-center gap-3 w-1/3">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center border-4 z-10 bg-surface transition-colors ${progressStep >= 2 ? 'border-blue-500 text-blue-500 ' : 'border-white/10 text-white/20'}`}>
                                    <ChefHat size={18} />
                                </div>
                                <div className="text-center">
                                    <div className={`text-sm font-bold ${progressStep >= 2 ? 'text-white' : 'text-text-muted'}`}>{t("tracker_preparing")}</div>
                                    {progressStep === 2 && <div className="text-xs text-blue-400 mt-1 animate-pulse">{t("tracker_cooking")}</div>}
                                </div>
                            </div>

                            {/* Step 3 */}
                            <div className="flex flex-col items-center gap-3 w-1/3">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center border-4 z-10 bg-surface transition-colors ${progressStep >= 3 ? 'border-green-500 text-green-500 ' : 'border-white/10 text-white/20'}`}>
                                    <CheckCircle size={18} />
                                </div>
                                <div className="text-center">
                                    <div className={`text-sm font-bold ${progressStep >= 3 ? 'text-white' : 'text-text-muted'}`}>{t("tracker_delivered")}</div>
                                    {progressStep >= 3 && <div className="text-xs text-green-400 mt-1">{t("tracker_enjoy")}</div>}
                                </div>
                            </div>
                        </div>

                        {/* Progress Bar Track */}
                        <div className="absolute top-[43px] left-0 w-full h-1.5 bg-white/5 rounded-full overflow-hidden -z-0 ml-[16.5%] max-w-[67%]">
                            <motion.div
                                className={`h-full ${progressStep === 1 ? 'bg-orange-500 w-[0%]' :
                                        progressStep === 2 ? 'bg-blue-500 w-[50%]' :
                                            'bg-green-500 w-[100%]'
                                    }`}
                                initial={{ width: "0%" }}
                                animate={{ width: progressStep === 1 ? "0%" : progressStep === 2 ? "50%" : "100%" }}
                                transition={{ duration: 0.8, ease: "easeOut" }}
                            />
                        </div>
                    </div>
                )}

                {/* Cancelled / Rejected State */}
                {progressStep === -1 && (
                    <div className="py-4 border-y border-white/5 flex items-center gap-3 text-red-500">
                        <XCircle size={24} />
                        <div>
                            <div className="font-bold">{booking.status === "cancelled" ? t("order_cancelled") : t("order_declined")}</div>
                            <div className="text-sm text-white/60">{t("order_not_active")}</div>
                        </div>
                    </div>
                )}

                {/* Action Buttons */}
                <div className="flex justify-end gap-3 mt-2">
                    {booking.status === "completed" && !booking.is_reviewed && (
                        <Button
                            onClick={onReview}
                            className="bg-primary hover:bg-primary-hover text-white border-none py-3 px-6 rounded-xl text-sm font-bold shadow-lg shadow-primary/20"
                        >
                            <Star size={16} className="inline mr-2" /> {t("btn_rate_meal")}
                        </Button>
                    )}
                    {booking.status === "completed" && booking.is_reviewed && (
                        <Badge variant="success" className="py-2.5 px-4 rounded-xl flex items-center gap-1.5 opacity-80 border-0 bg-green-500/10 text-green-400 font-bold">
                            <CheckCircle size={14} /> {t("badge_reviewed")}
                        </Badge>
                    )}
                    {booking.status === "accepted" && (
                        <Link href={`/chat/${booking.id}`}>
                            <Button className="bg-surface/50 border border-white/10 hover:border-white/30 text-white rounded-xl py-3 px-6 text-sm font-bold backdrop-blur-sm">
                                <MessageSquare size={16} className="inline mr-2" /> {t("btn_message_restaurant")}
                            </Button>
                        </Link>
                    )}
                    {booking.status === "pending" && (
                        <Button
                            onClick={onCancel}
                            disabled={isCancelling}
                            className="bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white border border-red-500/20 py-3 px-6 rounded-xl text-sm shadow-none active:scale-95 transition-all font-bold"
                        >
                            {isCancelling ? t("btn_cancelling") : t("btn_cancel_order")}
                        </Button>
                    )}
                </div>
            </div>
        </div>
    );
};
