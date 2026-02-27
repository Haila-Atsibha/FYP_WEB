"use client";

import React, { useState, useEffect, useContext } from "react";
import { AuthContext } from "../../../../src/context/AuthContext";
import ProtectedRoute from "../../../../src/components/ProtectedRoute";
import DashboardLayout from "../../../../src/components/DashboardLayout";
import api from "../../../../src/services/api";
import Link from "next/link";
import {
    Calendar,
    Clock,
    CheckCircle,
    XCircle,
    User,
    Mail,
    ChevronRight,
    MoreVertical,
    Check,
    X,
    History,
    MessageSquare
} from "lucide-react";
import Button from "../../../../src/components/Button";
import Badge from "../../../../src/components/Badge";
import Skeleton from "../../../../src/components/Skeleton";

export default function ProviderBookings() {
    const { user, loading: authLoading } = useContext(AuthContext);
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState("active"); // "active" or "history"

    useEffect(() => {
        if (!authLoading && user) {
            fetchBookings();
        }
    }, [user, authLoading]);

    const fetchBookings = async () => {
        setLoading(true);
        try {
            const response = await api.get("/api/bookings/provider");
            setBookings(response.data);
        } catch (err) {
            console.error("Error fetching provider bookings:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateStatus = async (bookingId, status) => {
        try {
            await api.put(`/api/bookings/${bookingId}/status`, { status });
            // Update local state to reflect change immediately
            setBookings(prev => prev.map(b =>
                b.id === bookingId ? { ...b, status } : b
            ));
        } catch (err) {
            console.error(`Error updating booking to ${status}:`, err);
            alert(`Failed to ${status} booking. Please try again.`);
        }
    };

    const activeBookings = bookings.filter(b => ["pending", "accepted"].includes(b.status));
    const historicalBookings = bookings.filter(b => ["completed", "rejected", "cancelled"].includes(b.status));

    const displayBookings = activeTab === "active" ? activeBookings : historicalBookings;

    return (
        <ProtectedRoute roles={["provider"]}>
            <DashboardLayout>
                <div className="max-w-6xl mx-auto space-y-8 pb-20">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                            <h1 className="text-4xl font-black text-foreground tracking-tight">Manage Bookings</h1>
                            <p className="text-text-muted font-medium mt-1">Review and update your service requests</p>
                        </div>

                        <div className="bg-surface p-1.5 rounded-2xl flex gap-1 border border-border shadow-sm shadow-primary/5">
                            <button
                                onClick={() => setActiveTab("active")}
                                className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center gap-2 ${activeTab === "active"
                                    ? "bg-primary text-white shadow-lg shadow-primary/20"
                                    : "text-text-muted hover:bg-surface-hover hover:text-foreground"
                                    }`}
                            >
                                <Clock size={18} />
                                Active Requests
                                {activeBookings.length > 0 && (
                                    <span className={`ml-1 px-2 py-0.5 rounded-full text-[10px] ${activeTab === 'active' ? 'bg-white text-primary' : 'bg-primary/10 text-primary'}`}>
                                        {activeBookings.length}
                                    </span>
                                )}
                            </button>
                            <button
                                onClick={() => setActiveTab("history")}
                                className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center gap-2 ${activeTab === "history"
                                    ? "bg-primary text-white shadow-lg shadow-primary/20"
                                    : "text-text-muted hover:bg-surface-hover hover:text-foreground"
                                    }`}
                            >
                                <History size={18} />
                                History
                            </button>
                        </div>
                    </div>

                    <div className="space-y-4">
                        {loading ? (
                            [...Array(3)].map((_, i) => (
                                <div key={i} className="bg-surface h-48 rounded-[2.5rem] border border-border animate-pulse" />
                            ))
                        ) : displayBookings.length === 0 ? (
                            <div className="py-32 text-center bg-surface rounded-[2.5rem] border border-dashed border-border shadow-inner">
                                <div className="w-20 h-20 bg-primary/5 rounded-[2rem] flex items-center justify-center text-primary/40 mx-auto mb-6">
                                    {activeTab === 'active' ? <Calendar size={40} /> : <History size={40} />}
                                </div>
                                <h3 className="text-2xl font-black text-foreground">No bookings found</h3>
                                <p className="text-text-muted mt-2 max-w-xs mx-auto font-medium">
                                    {activeTab === "active"
                                        ? "You don't have any active booking requests at the moment."
                                        : "Your booking history is currently empty."}
                                </p>
                            </div>
                        ) : (
                            displayBookings.map((booking) => (
                                <BookingCard
                                    key={booking.id}
                                    booking={booking}
                                    onUpdateStatus={handleUpdateStatus}
                                />
                            ))
                        )}
                    </div>
                </div>
            </DashboardLayout>
        </ProtectedRoute>
    );
}

const BookingCard = ({ booking, onUpdateStatus }) => {
    const isPending = booking.status === "pending";
    const isAccepted = booking.status === "accepted";

    const getStatusBadge = (status) => {
        switch (status) {
            case "pending": return <Badge variant="warning" className="text-[10px] uppercase font-black tracking-widest px-3 py-1">Pending Request</Badge>;
            case "accepted": return <Badge variant="info" className="text-[10px] uppercase font-black tracking-widest px-3 py-1">In Progress</Badge>;
            case "completed": return <Badge variant="success" className="text-[10px] uppercase font-black tracking-widest px-3 py-1">Completed</Badge>;
            case "rejected": return <Badge variant="danger" className="text-[10px] uppercase font-black tracking-widest px-3 py-1">Rejected</Badge>;
            case "cancelled": return <Badge variant="danger" className="text-[10px] uppercase font-black tracking-widest px-3 py-1">Cancelled by User</Badge>;
            default: return <Badge variant="outline">{status}</Badge>;
        }
    };

    return (
        <div className="bg-surface border border-border p-8 rounded-[2.5rem] hover:shadow-2xl hover:shadow-primary/5 transition-all group overflow-hidden relative">
            <div className="flex flex-col lg:flex-row gap-8">
                {/* Main Info */}
                <div className="flex-1 space-y-4">
                    <div className="flex items-center justify-between">
                        {getStatusBadge(booking.status)}
                        <span className="text-xs font-bold text-text-muted uppercase tracking-tighter flex items-center gap-1.5 bg-surface-hover px-3 py-1 rounded-full">
                            <Clock size={14} className="text-primary" />
                            {new Date(booking.created_at).toLocaleDateString(undefined, {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                            })}
                        </span>
                    </div>

                    <div>
                        <h3 className="text-2xl font-black text-foreground tracking-tight group-hover:text-primary transition-colors">{booking.title}</h3>
                        <div className="flex items-center gap-4 mt-3">
                            <div className="flex items-center gap-2 text-sm text-text-muted font-bold">
                                <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                                    <User size={16} />
                                </div>
                                {booking.customer_name}
                            </div>
                            <div className="w-1 h-1 bg-border rounded-full"></div>
                            <div className="flex items-center gap-2 text-sm text-text-muted font-bold">
                                <div className="w-8 h-8 rounded-xl bg-secondary/10 flex items-center justify-center text-secondary">
                                    <Mail size={16} />
                                </div>
                                {booking.customer_email}
                            </div>
                        </div>
                    </div>

                    <div className="p-4 bg-surface-hover border border-border rounded-2xl">
                        <p className="text-xs font-black text-text-muted uppercase tracking-widest mb-2 flex items-center gap-2">
                            <ChevronRight size={14} className="text-primary" />
                            Job Description
                        </p>
                        <p className="text-sm text-foreground line-clamp-3">
                            {booking.description || "No description provided."}
                        </p>
                    </div>
                </div>

                {/* Pricing and Actions */}
                <div className="lg:w-64 flex flex-col justify-between items-end gap-6 border-t lg:border-t-0 lg:border-l border-border pt-6 lg:pt-0 lg:pl-10">
                    <div className="text-right w-full">
                        <p className="text-xs font-black text-text-muted uppercase tracking-widest mb-1">Total Amount</p>
                        <p className="text-3xl font-black text-foreground tracking-tighter">${booking.total_price}</p>
                    </div>

                    <div className="flex flex-col gap-2 w-full">
                        {isPending && (
                            <div className="flex gap-2">
                                <Button
                                    onClick={() => onUpdateStatus(booking.id, "accepted")}
                                    className="flex-1 bg-primary text-white hover:bg-primary-hover shadow-lg shadow-primary/20 rounded-2xl flex items-center justify-center gap-2 py-3 px-4 font-black text-sm"
                                >
                                    <Check size={18} />
                                    Accept
                                </Button>
                                <Button
                                    onClick={() => onUpdateStatus(booking.id, "rejected")}
                                    className="flex-1 bg-surface border border-border text-red-500 hover:bg-red-50 rounded-2xl flex items-center justify-center gap-2 py-3 px-4 font-black text-sm shadow-none"
                                >
                                    <X size={18} />
                                    Reject
                                </Button>
                            </div>
                        )}
                        {isAccepted && (
                            <>
                                <Link href={`/chat/${booking.id}`} className="w-full">
                                    <Button
                                        className="w-full bg-secondary text-white hover:bg-secondary-dark shadow-lg shadow-secondary/20 rounded-2xl flex items-center justify-center gap-2 py-3 px-4 font-black text-sm mb-2"
                                    >
                                        <MessageSquare size={18} />
                                        Open Chat
                                    </Button>
                                </Link>
                                <Button
                                    onClick={() => onUpdateStatus(booking.id, "completed")}
                                    className="w-full bg-green-500 text-white hover:bg-green-600 shadow-lg shadow-green-500/20 rounded-2xl flex items-center justify-center gap-2 py-3 px-4 font-black text-sm"
                                >
                                    <CheckCircle size={18} />
                                    Mark Completed
                                </Button>
                            </>
                        )}
                        {!isPending && !isAccepted && (
                            <Button
                                variant="outline"
                                className="w-full rounded-2xl border-border text-text-muted font-bold cursor-default hover:bg-transparent"
                            >
                                Booking Finalized
                            </Button>
                        )}
                    </div>
                </div>
            </div>

            {/* Background decoration */}
            <div className="absolute -bottom-10 -right-10 opacity-[0.02] group-hover:opacity-[0.05] transition-opacity pointer-events-none transform -rotate-12">
                {booking.status === 'completed' ? <CheckCircle size={200} /> : <Calendar size={200} />}
            </div>
        </div>
    );
};
