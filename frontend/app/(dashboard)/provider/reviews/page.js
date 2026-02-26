"use client";

import React, { useState, useEffect, useContext } from "react";
import { AuthContext } from "../../../../src/context/AuthContext";
import ProtectedRoute from "../../../../src/components/ProtectedRoute";
import DashboardLayout from "../../../../src/components/DashboardLayout";
import api from "../../../../src/services/api";
import {
    Star,
    MessageSquare,
    User,
    Calendar,
    TrendingUp,
    Award,
    Filter,
    CheckCircle2
} from "lucide-react";
import Badge from "../../../../src/components/Badge";

export default function ProviderReviews() {
    const { user, loading: authLoading } = useContext(AuthContext);
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!authLoading && user) {
            fetchReviews();
        }
    }, [user, authLoading]);

    const fetchReviews = async () => {
        setLoading(true);
        try {
            const response = await api.get("/api/reviews/me");
            setReviews(response.data);
        } catch (err) {
            console.error("Error fetching provider reviews:", err);
        } finally {
            setLoading(false);
        }
    };

    const averageRating = reviews.length > 0
        ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1)
        : 0;

    const ratingCounts = [5, 4, 3, 2, 1].map(star => ({
        star,
        count: reviews.filter(r => r.rating === star).length,
        percentage: reviews.length > 0
            ? (reviews.filter(r => r.rating === star).length / reviews.length * 100).toFixed(0)
            : 0
    }));

    return (
        <ProtectedRoute roles={["provider"]}>
            <DashboardLayout>
                <div className="max-w-6xl mx-auto space-y-8 pb-20">
                    {/* Header */}
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                        <div>
                            <h1 className="text-4xl font-black text-foreground tracking-tight">Customer Reviews</h1>
                            <p className="text-text-muted font-medium mt-1">See what your customers are saying about your services</p>
                        </div>
                    </div>

                    {/* Stats Summary Section */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Main Rating Card */}
                        <div className="bg-primary rounded-[2.5rem] p-10 text-white shadow-2xl shadow-primary/20 flex flex-col items-center justify-center text-center relative overflow-hidden group">
                            <div className="relative z-10">
                                <p className="text-primary-foreground/80 font-black uppercase tracking-widest text-xs mb-2">Overall Rating</p>
                                <p className="text-7xl font-black tracking-tighter mb-4">{averageRating}</p>
                                <div className="flex gap-1 mb-4 justify-center">
                                    {[...Array(5)].map((_, i) => (
                                        <Star
                                            key={i}
                                            size={24}
                                            fill={i < Math.round(averageRating) ? "currentColor" : "none"}
                                            className={i < Math.round(averageRating) ? "text-yellow-400" : "text-white/20"}
                                        />
                                    ))}
                                </div>
                                <p className="text-sm font-bold text-white/80">Based on {reviews.length} total reviews</p>
                            </div>
                            {/* Decoration */}
                            <Award size={180} className="absolute -bottom-10 -right-10 text-white/10 rotate-12 group-hover:rotate-0 transition-transform duration-700" />
                        </div>

                        {/* Distribution Card */}
                        <div className="lg:col-span-2 bg-surface border border-border rounded-[2.5rem] p-10 flex flex-col justify-center">
                            <div className="space-y-4">
                                {ratingCounts.map(({ star, count, percentage }) => (
                                    <div key={star} className="flex items-center gap-4">
                                        <span className="w-12 text-sm font-black text-foreground flex items-center gap-1.5 shrink-0">
                                            {star} <Star size={14} fill="currentColor" className="text-yellow-500" />
                                        </span>
                                        <div className="flex-1 h-2.5 bg-border rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-primary transition-all duration-1000 ease-out"
                                                style={{ width: `${percentage}%` }}
                                            />
                                        </div>
                                        <span className="w-12 text-xs font-bold text-text-muted text-right shrink-0">{percentage}%</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Reviews List */}
                    <div className="space-y-6 pt-4">
                        <div className="flex items-center justify-between px-2">
                            <h3 className="text-xl font-bold flex items-center gap-2">
                                <MessageSquare size={20} className="text-primary" />
                                Recent Feedback
                            </h3>
                            <div className="flex items-center gap-2 text-xs font-bold text-text-muted cursor-pointer hover:text-foreground transition-colors">
                                <Filter size={14} /> Sort: Newest First
                            </div>
                        </div>

                        {loading ? (
                            [...Array(3)].map((_, i) => (
                                <div key={i} className="h-48 bg-surface border border-border rounded-[2.5rem] animate-pulse" />
                            ))
                        ) : reviews.length === 0 ? (
                            <div className="py-32 text-center bg-surface rounded-[2.5rem] border border-dashed border-border">
                                <div className="w-20 h-20 bg-primary/5 text-primary/30 rounded-full flex items-center justify-center mx-auto mb-6">
                                    <Star size={40} />
                                </div>
                                <h1 className="text-2xl font-black text-foreground">No reviews yet</h1>
                                <p className="text-text-muted font-medium mt-2">Finish more bookings to start getting feedback from customers!</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {reviews.map((review) => (
                                    <ReviewCard key={review.id} review={review} />
                                ))}
                            </div>
                        )
                        }
                    </div>
                </div>
            </DashboardLayout>
        </ProtectedRoute>
    );
}

function ReviewCard({ review }) {
    return (
        <div className="bg-surface border border-border p-8 rounded-[2.5rem] hover:shadow-xl hover:shadow-primary/5 transition-all group relative overflow-hidden">
            <div className="space-y-5 relative z-10">
                <div className="flex items-start justify-between">
                    <div className="flex gap-1">
                        {[...Array(5)].map((_, i) => (
                            <Star
                                key={i}
                                size={16}
                                fill={i < review.rating ? "currentColor" : "none"}
                                className={i < review.rating ? "text-yellow-500" : "text-border"}
                            />
                        ))}
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-text-muted flex items-center gap-1.5 bg-surface-hover px-3 py-1 rounded-full border border-border">
                        <Calendar size={12} className="text-primary" />
                        {new Date(review.created_at).toLocaleDateString()}
                    </span>
                </div>

                <div>
                    <p className="text-foreground font-black text-lg leading-tight mb-2 group-hover:text-primary transition-colors">
                        "{review.comment}"
                    </p>
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-secondary/10 flex items-center justify-center text-secondary border border-secondary/20">
                            <User size={18} />
                        </div>
                        <div>
                            <p className="text-sm font-black text-foreground leading-none">{review.customer_name}</p>
                            <p className="text-[10px] font-bold text-text-muted mt-1 uppercase flex items-center gap-1">
                                Booked: <span className="text-secondary">{review.service_title}</span>
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Background decoration */}
            <CheckCircle2 size={100} className="absolute -bottom-5 -right-5 text-primary/5 group-hover:scale-110 transition-transform" />
        </div>
    );
}
