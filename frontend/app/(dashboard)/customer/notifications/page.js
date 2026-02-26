"use client";

import React, { useState, useEffect, useContext } from "react";
import {
    Bell,
    CheckCircle,
    Clock,
    MessageSquare,
    AlertCircle,
    ArrowLeft,
    CheckCheck,
    Calendar,
    ChevronRight
} from "lucide-react";
import Link from "next/link";
import { AuthContext } from "../../../../src/context/AuthContext";
import ProtectedRoute from "../../../../src/components/ProtectedRoute";
import DashboardLayout from "../../../../src/components/DashboardLayout";
import Badge from "../../../../src/components/Badge";
import Button from "../../../../src/components/Button";
import Skeleton, { CardSkeleton } from "../../../../src/components/Skeleton";
import api from "../../../../src/services/api";

export default function NotificationsPage() {
    const { user, loading: authLoading } = useContext(AuthContext);
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchNotifications = async () => {
        if (!user) return;
        setLoading(true);
        try {
            const response = await api.get("/api/notifications");
            setNotifications(response.data);
        } catch (err) {
            console.error("Error fetching notifications:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!authLoading && user) {
            fetchNotifications();
        }
    }, [user, authLoading]);

    const handleMarkAsRead = async (id) => {
        try {
            await api.put(`/api/notifications/${id}/read`);
            setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
        } catch (err) {
            console.error("Error marking as read:", err);
        }
    };

    const handleMarkAllRead = async () => {
        try {
            await api.put("/api/notifications/read-all");
            setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
        } catch (err) {
            console.error("Error marking all as read:", err);
        }
    };

    const unreadCount = notifications.filter(n => !n.is_read).length;

    return (
        <ProtectedRoute roles={["customer"]}>
            <DashboardLayout>
                <div className="max-w-4xl mx-auto space-y-8 pb-20">

                    {/* Header */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-6">
                        <div>
                            <Link href="/customer" className="text-primary text-sm font-bold flex items-center gap-1 mb-2 hover:underline">
                                <ArrowLeft size={16} /> Back to Dashboard
                            </Link>
                            <h1 className="text-3xl font-extrabold text-foreground tracking-tight flex items-center gap-3">
                                Notifications
                                {unreadCount > 0 && <Badge variant="primary" className="text-lg py-1 px-3">{unreadCount} New</Badge>}
                            </h1>
                            <p className="text-text-muted mt-1 text-sm font-medium">Stay updated with your service requests and system alerts.</p>
                        </div>
                        {unreadCount > 0 && (
                            <Button
                                onClick={handleMarkAllRead}
                                className="bg-surface text-foreground border border-border hover:bg-surface-hover flex items-center gap-2 py-2 px-4 h-auto shadow-none"
                            >
                                <CheckCheck size={18} />
                                Mark all as read
                            </Button>
                        )}
                    </div>

                    {/* List */}
                    <div className="space-y-4">
                        {loading ? (
                            [...Array(4)].map((_, i) => <div key={i} className="bg-surface h-24 rounded-3xl border border-border animate-pulse"></div>)
                        ) : notifications.length === 0 ? (
                            <div className="py-20 text-center bg-surface rounded-[2.5rem] border border-dashed border-border">
                                <div className="w-16 h-16 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto mb-4">
                                    <Bell size={32} />
                                </div>
                                <h3 className="text-xl font-bold text-foreground">All caught up!</h3>
                                <p className="text-text-muted mt-2 max-w-xs mx-auto">You don't have any notifications at the moment.</p>
                            </div>
                        ) : (
                            notifications.map((notification) => (
                                <NotificationCard
                                    key={notification.id}
                                    notification={notification}
                                    onRead={() => !notification.is_read && handleMarkAsRead(notification.id)}
                                />
                            ))
                        )}
                    </div>
                </div>
            </DashboardLayout>
        </ProtectedRoute>
    );
}

const NotificationCard = ({ notification, onRead }) => {
    const getIcon = (type) => {
        switch (type) {
            case 'booking': return <Calendar className="w-5 h-5" />;
            case 'message': return <MessageSquare className="w-5 h-5" />;
            case 'system': return <Bell className="w-5 h-5" />;
            default: return <AlertCircle className="w-5 h-5" />;
        }
    };

    const getIconBg = (type) => {
        switch (type) {
            case 'booking': return "bg-blue-500/10 text-blue-500";
            case 'message': return "bg-green-500/10 text-green-500";
            case 'system': return "bg-primary/10 text-primary";
            default: return "bg-orange-500/10 text-orange-500";
        }
    };

    const timeAgo = (dateString) => {
        const date = new Date(dateString);
        const now = new Date();
        const seconds = Math.floor((now - date) / 1000);

        if (seconds < 60) return "Just now";
        const minutes = Math.floor(seconds / 60);
        if (minutes < 60) return `${minutes}m ago`;
        const hours = Math.floor(minutes / 60);
        if (hours < 24) return `${hours}h ago`;
        return date.toLocaleDateString();
    };

    const CardWrapper = notification.link ? Link : 'div';

    return (
        <CardWrapper
            href={notification.link || "#"}
            onClick={onRead}
            className={`block bg-surface border ${notification.is_read ? 'border-border' : 'border-primary/30 shadow-sm shadow-primary/5'} p-5 rounded-3xl transition-all group relative overflow-hidden`}
        >
            {!notification.is_read && <div className="absolute top-0 left-0 w-1.5 h-full bg-primary"></div>}

            <div className="flex gap-5">
                <div className={`w-12 h-12 rounded-2xl ${getIconBg(notification.type)} flex items-center justify-center shrink-0`}>
                    {getIcon(notification.type)}
                </div>

                <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between gap-4">
                        <h4 className={`font-bold text-foreground ${!notification.is_read ? 'text-lg' : 'text-base'}`}>
                            {notification.title}
                        </h4>
                        <span className="text-[10px] font-bold text-text-muted uppercase tracking-widest flex items-center gap-1 shrink-0">
                            <Clock size={10} />
                            {timeAgo(notification.created_at)}
                        </span>
                    </div>
                    <p className={`text-text-muted text-sm leading-relaxed ${!notification.is_read ? 'font-medium' : ''}`}>
                        {notification.message}
                    </p>

                    {notification.link && (
                        <div className="pt-2 flex items-center gap-1 text-primary text-xs font-bold group-hover:gap-2 transition-all">
                            View details <ChevronRight size={12} />
                        </div>
                    )}
                </div>
            </div>
        </CardWrapper>
    );
};
