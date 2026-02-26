"use client";

import React, { useState, useEffect, useContext, useRef } from "react";
import { AuthContext } from "../../../../src/context/AuthContext";
import ProtectedRoute from "../../../../src/components/ProtectedRoute";
import DashboardLayout from "../../../../src/components/DashboardLayout";
import api from "../../../../src/services/api";
import { Send, User, MessageCircle, ArrowLeft, Clock } from "lucide-react";
import Button from "../../../../src/components/Button";
import Input from "../../../../src/components/Input";
import Badge from "../../../../src/components/Badge";

export default function CustomerMessages() {
    const { user, loading: authLoading } = useContext(AuthContext);
    const [conversations, setConversations] = useState([]);
    const [selectedBookingId, setSelectedBookingId] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState("");
    const [loadingConv, setLoadingConv] = useState(true);
    const [loadingMsgs, setLoadingMsgs] = useState(false);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        if (!authLoading && user) {
            fetchConversations();
        }
    }, [user, authLoading]);

    useEffect(() => {
        if (selectedBookingId) {
            fetchMessages(selectedBookingId);
            const interval = setInterval(() => fetchMessages(selectedBookingId, true), 5000);
            return () => clearInterval(interval);
        }
    }, [selectedBookingId]);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const fetchConversations = async () => {
        setLoadingConv(true);
        try {
            const response = await api.get("/api/messages/conversations");
            setConversations(response.data);
            if (response.data.length > 0 && !selectedBookingId) {
                // Option to auto-select first one? Let's leave it for now
            }
        } catch (err) {
            console.error("Error fetching conversations:", err);
        } finally {
            setLoadingConv(false);
        }
    };

    const fetchMessages = async (bookingId, silent = false) => {
        if (!silent) setLoadingMsgs(true);
        try {
            const response = await api.get(`/api/messages/booking/${bookingId}`);
            setMessages(response.data);
        } catch (err) {
            console.error("Error fetching messages:", err);
        } finally {
            if (!silent) setLoadingMsgs(false);
        }
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim() || !selectedBookingId) return;

        try {
            const response = await api.post("/api/messages", {
                booking_id: selectedBookingId,
                content: newMessage,
            });
            setMessages([...messages, { ...response.data.messageObj, sender_name: user.name }]);
            setNewMessage("");
            // Refresh conversations to update preview
            fetchConversations();
        } catch (err) {
            console.error("Error sending message:", err);
        }
    };

    const selectedConversation = conversations.find(c => c.booking_id === selectedBookingId);

    return (
        <ProtectedRoute roles={["customer"]}>
            <DashboardLayout>
                <div className="max-w-7xl mx-auto h-[calc(100vh-180px)] min-h-[600px] flex flex-col">
                    <div className="flex items-center justify-between mb-6">
                        <h1 className="text-3xl font-black text-foreground tracking-tight">Messages</h1>
                        <p className="text-text-muted font-medium text-sm">Chat with your service providers</p>
                    </div>

                    <div className="flex-1 bg-surface border border-border rounded-[2.5rem] shadow-xl overflow-hidden flex flex-col md:flex-row shadow-primary/5">
                        {/* Conversations Sidebar */}
                        <div className={`w-full md:w-80 lg:w-96 border-r border-border flex flex-col ${selectedBookingId ? 'hidden md:flex' : 'flex'}`}>
                            <div className="p-6 border-b border-border bg-surface-hover/30">
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-text-muted">
                                        <MessageCircle size={18} />
                                    </div>
                                    <input
                                        type="text"
                                        placeholder="Search chats..."
                                        className="w-full bg-white dark:bg-gray-800 border border-border rounded-2xl py-3 pl-12 pr-4 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all shadow-sm"
                                    />
                                </div>
                            </div>

                            <div className="flex-1 overflow-y-auto divide-y divide-border/50">
                                {loadingConv ? (
                                    Array(5).fill(0).map((_, i) => (
                                        <div key={i} className="p-5 animate-pulse flex gap-4 items-center">
                                            <div className="w-12 h-12 bg-border rounded-2xl"></div>
                                            <div className="flex-1 space-y-2">
                                                <div className="h-4 bg-border rounded w-2/3"></div>
                                                <div className="h-3 bg-border rounded w-full"></div>
                                            </div>
                                        </div>
                                    ))
                                ) : conversations.length === 0 ? (
                                    <div className="p-10 text-center">
                                        <div className="w-16 h-16 bg-primary/5 rounded-3xl flex items-center justify-center text-primary mx-auto mb-4">
                                            <MessageCircle size={32} />
                                        </div>
                                        <p className="text-text-muted font-bold text-sm">No conversations found</p>
                                        <p className="text-[11px] text-text-muted/60 mt-1 italic">Vist the marketplace to find providers.</p>
                                    </div>
                                ) : (
                                    conversations.map((conv) => (
                                        <button
                                            key={conv.booking_id}
                                            onClick={() => setSelectedBookingId(conv.booking_id)}
                                            className={`w-full p-5 text-left flex gap-4 items-center transition-all hover:bg-primary/5 text-foreground ${selectedBookingId === conv.booking_id ? "bg-primary/10 border-r-4 border-primary" : ""
                                                }`}
                                        >
                                            <div className="w-12 h-12 rounded-2xl bg-surface-hover border border-border flex items-center justify-center text-primary relative flex-shrink-0 group-hover:scale-105 transition-transform">
                                                <User size={24} />
                                                {conv.booking_status === 'pending' && <span className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-500 rounded-full border-2 border-surface"></span>}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex justify-between items-baseline mb-0.5">
                                                    <h3 className="font-black text-sm truncate">{conv.partner_name}</h3>
                                                    <span className="text-[10px] text-text-muted font-bold whitespace-nowrap ml-2 uppercase">
                                                        {conv.last_message_time ? new Date(conv.last_message_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                                                    </span>
                                                </div>
                                                <p className="text-[11px] font-black text-primary/80 mb-1 truncate uppercase tracking-widest">{conv.service_title}</p>
                                                <p className="text-xs text-text-muted truncate leading-tight font-medium">
                                                    {conv.last_message || <span className="italic opacity-60">No messages yet</span>}
                                                </p>
                                            </div>
                                        </button>
                                    ))
                                )}
                            </div>
                        </div>

                        {/* Chat Area */}
                        <div className={`flex-1 flex flex-col bg-white dark:bg-gray-900/40 relative ${!selectedBookingId ? 'hidden md:flex items-center justify-center' : 'flex'}`}>
                            {!selectedBookingId ? (
                                <div className="text-center p-12 max-w-sm space-y-6">
                                    <div className="w-24 h-24 bg-primary/5 rounded-[2.5rem] flex items-center justify-center text-primary mx-auto shadow-inner">
                                        <MessageCircle size={48} className="opacity-40" />
                                    </div>
                                    <div>
                                        <h2 className="text-2xl font-black text-foreground tracking-tight">Your Messages</h2>
                                        <p className="text-text-muted mt-2 font-medium">Select a conversation to start chatting with your service provider.</p>
                                    </div>
                                </div>
                            ) : (
                                <>
                                    {/* Chat Header */}
                                    <div className="px-6 py-4 border-b border-border flex items-center gap-4 bg-surface/50 backdrop-blur-md sticky top-0 z-10">
                                        <button
                                            onClick={() => setSelectedBookingId(null)}
                                            className="md:hidden p-2 hover:bg-surface-hover rounded-xl transition-colors"
                                        >
                                            <ArrowLeft size={20} />
                                        </button>
                                        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-bold">
                                            {selectedConversation?.partner_name?.[0] || 'P'}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h3 className="font-black text-foreground truncate">{selectedConversation?.partner_name}</h3>
                                            <div className="flex items-center gap-2">
                                                <span className="text-[10px] font-bold text-primary uppercase tracking-tighter">{selectedConversation?.service_title}</span>
                                                <span className="w-1 h-1 bg-border rounded-full"></span>
                                                <Badge variant={selectedConversation?.booking_status === 'completed' ? 'success' : 'info'} className="text-[9px] px-1.5 h-auto leading-tight">
                                                    {selectedConversation?.booking_status}
                                                </Badge>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Messages List */}
                                    <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-thin scrollbar-thumb-border hover:scrollbar-thumb-primary/20 transition-all">
                                        {loadingMsgs ? (
                                            <div className="flex justify-center items-center h-full">
                                                <div className="animate-pulse flex flex-col items-center gap-2">
                                                    <MessageCircle size={24} className="text-primary/40" />
                                                    <p className="text-xs text-text-muted font-bold">Loading chat...</p>
                                                </div>
                                            </div>
                                        ) : messages.length === 0 ? (
                                            <div className="h-full flex flex-col items-center justify-center text-center p-10 space-y-4 opacity-60">
                                                <div className="w-16 h-16 bg-surface-hover rounded-2xl flex items-center justify-center">
                                                    <Clock size={32} />
                                                </div>
                                                <div>
                                                    <p className="font-bold text-sm text-foreground">No history yet</p>
                                                    <p className="text-[11px] max-w-[200px] mt-1 italic">Be the first to say hello! Your provider is waiting.</p>
                                                </div>
                                            </div>
                                        ) : (
                                            messages.map((msg, i) => {
                                                const isMe = msg.sender_id === user.id;
                                                return (
                                                    <div key={msg.id} className={`flex ${isMe ? "justify-end" : "justify-start"} group animate-in fade-in duration-300`}>
                                                        <div className="max-w-[80%] flex flex-col gap-1">
                                                            {!isMe && <span className="text-[10px] font-bold text-text-muted ml-3 uppercase tracking-widest">{msg.sender_name}</span>}
                                                            <div
                                                                className={`px-5 py-3 rounded-2xl text-sm font-medium shadow-sm transition-all relative ${isMe
                                                                    ? "bg-primary text-white rounded-tr-none hover:bg-primary-hover shadow-primary/20"
                                                                    : "bg-surface border border-border text-foreground rounded-tl-none hover:border-primary/30"
                                                                    }`}
                                                            >
                                                                {msg.content}
                                                                <div className={`mt-1.5 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap justify-end ${isMe ? 'text-white/60' : 'text-text-muted'}`}>
                                                                    {isMe && <Clock size={10} />}
                                                                    <span className="text-[9px] font-bold uppercase tracking-tighter">
                                                                        {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            })
                                        )}
                                        <div ref={messagesEndRef} />
                                    </div>

                                    {/* Message Input */}
                                    <div className="p-6 border-t border-border bg-surface/30 backdrop-blur-sm">
                                        <form onSubmit={handleSendMessage} className="flex gap-4">
                                            <div className="flex-1 relative">
                                                <input
                                                    type="text"
                                                    value={newMessage}
                                                    onChange={(e) => setNewMessage(e.target.value)}
                                                    placeholder="Type your message here..."
                                                    className="w-full bg-white dark:bg-gray-800 border border-border rounded-2xl px-6 py-4 pr-12 text-sm focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all shadow-inner"
                                                />
                                            </div>
                                            <Button type="submit" className="rounded-2xl h-auto px-6 bg-primary text-white hover:bg-primary-hover shadow-lg shadow-primary/20 group translate-y-[-1px] active:translate-y-[0px]">
                                                <Send size={20} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                                            </Button>
                                        </form>
                                        <p className="text-[9px] text-center mt-4 text-text-muted font-bold uppercase tracking-[0.2em] opacity-40">Secure end-to-end messaging</p>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </DashboardLayout>
        </ProtectedRoute>
    );
}
