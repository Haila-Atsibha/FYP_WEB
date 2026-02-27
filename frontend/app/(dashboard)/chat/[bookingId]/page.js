"use client";

import { useState, useEffect, useContext, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { Send, ArrowLeft, User, Shield, Info, MoreVertical } from "lucide-react";
import api from "../../../../src/services/api";
import { AuthContext } from "../../../../src/context/AuthContext";
import DashboardLayout from "../../../../src/components/DashboardLayout";
import Button from "../../../../src/components/Button";
import Link from "next/link";

export default function ChatPage() {
    const { bookingId } = useParams();
    const { user } = useContext(AuthContext);
    const router = useRouter();
    const scrollRef = useRef(null);

    const [booking, setBooking] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState("");
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchBookingAndMessages = async () => {
            try {
                // We need an endpoint to get booking info including titles and names
                // For now, let's assume we can get it from the message fetch or a separate call
                const [bookingRes, messagesRes] = await Promise.all([
                    api.get(`/api/bookings/${bookingId}`),
                    api.get(`/api/messages/booking/${bookingId}`)
                ]);

                setBooking(bookingRes.data);
                setMessages(messagesRes.data);
                setLoading(false);
            } catch (e) {
                console.error(e);
                setError(e.response?.data?.message || "Failed to load chat.");
                setLoading(false);
            }
        };

        if (user) {
            fetchBookingAndMessages();
            // Poll for new messages every 3 seconds
            const interval = setInterval(async () => {
                try {
                    const res = await api.get(`/api/messages/booking/${bookingId}`);
                    setMessages(res.data);
                } catch (e) {
                    console.error("Polling error:", e);
                }
            }, 3000);
            return () => clearInterval(interval);
        }
    }, [bookingId, user]);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim() || sending) return;

        setSending(true);
        try {
            const res = await api.post("/api/messages", {
                booking_id: bookingId,
                content: newMessage
            });
            setMessages([...messages, res.data.messageObj]);
            setNewMessage("");
        } catch (e) {
            console.error(e);
            setError("Failed to send message.");
        } finally {
            setSending(false);
        }
    };

    if (loading) {
        return (
            <DashboardLayout>
                <div className="flex justify-center items-center h-[70vh]">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
                </div>
            </DashboardLayout>
        );
    }

    if (error) {
        return (
            <DashboardLayout>
                <div className="max-w-2xl mx-auto mt-20 p-10 bg-surface border border-border rounded-3xl text-center">
                    <div className="w-16 h-16 bg-red-500/10 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Shield size={32} />
                    </div>
                    <h2 className="text-2xl font-bold text-foreground mb-4">Access Restricted</h2>
                    <p className="text-text-muted mb-8">{error}</p>
                    <Link href="/customer/bookings">
                        <Button variant="primary">Back to Bookings</Button>
                    </Link>
                </div>
            </DashboardLayout>
        );
    }

    const otherMemberName = user?.role === 'customer' ? booking?.provider_name : booking?.customer_name;

    return (
        <DashboardLayout>
            <div className="max-w-5xl mx-auto h-[calc(100vh-160px)] flex flex-col gap-6">

                {/* Chat Header */}
                <div className="bg-surface border border-border rounded-3xl p-6 flex items-center justify-between shadow-sm">
                    <div className="flex items-center gap-4">
                        <Link href={user?.role === 'provider' ? "/provider/bookings" : "/customer/bookings"}>
                            <div className="w-10 h-10 rounded-xl bg-surface-hover border border-border flex items-center justify-center text-text-muted hover:text-primary transition-colors">
                                <ArrowLeft size={20} />
                            </div>
                        </Link>
                        <div>
                            <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
                                {otherMemberName || "Professional"}
                                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                            </h2>
                            <p className="text-text-muted text-xs font-medium uppercase tracking-widest mt-0.5">
                                {booking?.title || "Service Request"} • <span className="text-primary">${booking?.total_price}</span>
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="hidden md:flex flex-col items-end mr-4">
                            <span className="text-[10px] font-black text-text-muted uppercase tracking-widest">Booking Status</span>
                            <span className="text-xs font-bold text-primary uppercase">Accepted & Active</span>
                        </div>
                        <button className="w-10 h-10 rounded-xl hover:bg-surface-hover flex items-center justify-center transition-colors">
                            <MoreVertical size={20} className="text-text-muted" />
                        </button>
                    </div>
                </div>

                {/* Messages Area */}
                <div
                    ref={scrollRef}
                    className="flex-1 bg-surface border border-border rounded-[2.5rem] p-8 overflow-y-auto space-y-6 shadow-inner"
                >
                    <div className="flex flex-col items-center justify-center pb-10">
                        <div className="w-12 h-12 bg-primary/5 text-primary rounded-2xl flex items-center justify-center mb-4">
                            <Info size={24} />
                        </div>
                        <p className="text-xs font-bold text-text-muted uppercase tracking-widest text-center max-w-sm">
                            Conversation started regarding {booking?.title}. Both parties can now discuss project details, scope, and timeline.
                        </p>
                    </div>

                    {messages.map((msg, idx) => {
                        const isMe = msg.sender_id === user?.id;
                        return (
                            <div key={msg.id || idx} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                                <div className={`flex gap-3 max-w-[80%] ${isMe ? 'flex-row-reverse' : 'flex-row'}`}>
                                    <div className={`w-8 h-8 rounded-xl shrink-0 flex items-center justify-center text-xs font-bold ${isMe ? 'bg-primary text-white' : 'bg-surface-hover text-text-muted border border-border'}`}>
                                        {isMe ? 'Me' : otherMemberName?.[0] || 'O'}
                                    </div>
                                    <div>
                                        <div className={`px-5 py-3 rounded-2xl text-sm leading-relaxed ${isMe
                                                ? 'bg-primary text-white rounded-tr-none shadow-lg shadow-primary/20'
                                                : 'bg-surface-hover text-foreground border border-border rounded-tl-none'
                                            }`}>
                                            {msg.message || msg.content}
                                        </div>
                                        <p className={`text-[10px] mt-1 font-bold text-text-muted uppercase ${isMe ? 'text-right' : 'text-left'}`}>
                                            {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Message Input */}
                <form onSubmit={handleSendMessage} className="bg-surface border border-border rounded-3xl p-4 flex gap-4 shadow-lg shadow-primary/5">
                    <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Type your message here..."
                        className="flex-1 bg-transparent border-none text-foreground px-4 py-2 focus:outline-none font-medium"
                    />
                    <Button
                        type="submit"
                        disabled={!newMessage.trim() || sending}
                        className="rounded-2xl w-12 h-12 flex items-center justify-center p-0 shrink-0"
                    >
                        <Send size={20} />
                    </Button>
                </form>

            </div>
        </DashboardLayout>
    );
}
