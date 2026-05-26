"use client";

import { useState, useEffect, useContext, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { Send, ArrowLeft, User, Shield, Info, MoreVertical, Paperclip, MapPin, X, Image as ImageIcon } from "lucide-react";
import api from "../../../../src/services/api";
import { AuthContext } from "../../../../src/context/AuthContext";
import DashboardLayout from "../../../../src/components/DashboardLayout";
import Button from "../../../../src/components/Button";
import Modal from "../../../../src/components/Modal";
import Link from "next/link";
import dynamic from "next/dynamic";

const LocationPickerMap = dynamic(() => import("../../../../src/components/LocationPickerMap"), { ssr: false });

export default function ChatPage() {
    const { bookingId } = useParams();
    const { user } = useContext(AuthContext);
    const router = useRouter();
    const scrollRef = useRef(null);

    const [booking, setBooking] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState("");
    const [selectedFile, setSelectedFile] = useState(null);
    const [location, setLocation] = useState(null);
    const [isLocationChoiceModalOpen, setIsLocationChoiceModalOpen] = useState(false);
    const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
    const [tempLocation, setTempLocation] = useState(null);
    const fileInputRef = useRef(null);
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
        const clearNotifications = async () => {
            try {
                await api.put("/api/notifications/mark-type", { type: 'message' });
            } catch (e) {
                console.error("Error clearing message notifications:", e);
            }
        };

        if (user) {
            fetchBookingAndMessages();
            clearNotifications();
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
        if ((!newMessage.trim() && !selectedFile && !location) || sending) return;

        setSending(true);
        const formData = new FormData();
        formData.append("booking_id", bookingId);
        if (newMessage.trim()) formData.append("content", newMessage);
        if (selectedFile) formData.append("media", selectedFile);
        if (location) {
            formData.append("location_lat", location.lat);
            formData.append("location_lng", location.lng);
            formData.append("location_label", "Shared Location");
        }

        try {
            const res = await api.post("/api/messages", formData, {
                headers: { "Content-Type": "multipart/form-data" }
            });
            setMessages([...messages, res.data.messageObj]);
            setNewMessage("");
            setSelectedFile(null);
            setLocation(null);
        } catch (e) {
            console.error(e);
            setError("Failed to send message.");
        } finally {
            setSending(false);
        }
    };

    const handleLocationChoice = () => {
        setIsLocationChoiceModalOpen(true);
    };

    const handleSendCurrentLocation = () => {
        if (!navigator.geolocation) {
            alert("Geolocation is not supported by your browser");
            return;
        }
        navigator.geolocation.getCurrentPosition(
            (pos) => {
                setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
                setIsLocationChoiceModalOpen(false);
            },
            () => alert("Unable to retrieve your location")
        );
    };

    const handleOpenMapPicker = () => {
        setTempLocation(null);
        setIsLocationChoiceModalOpen(false);
        setIsLocationModalOpen(true);
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
            <div className="max-w-5xl mx-auto h-[calc(100vh-150px)] flex flex-col gap-6">

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
                                            {msg.message_type === 'image' && msg.media_url && (
                                                <img src={msg.media_url} alt="Shared" className="max-w-[200px] rounded-lg mb-2 cursor-pointer" onClick={() => window.open(msg.media_url, '_blank')} />
                                            )}
                                            {msg.message_type === 'video' && msg.media_url && (
                                                <video src={msg.media_url} controls className="max-w-[200px] rounded-lg mb-2" />
                                            )}
                                            {msg.message_type === 'location' && msg.location && (
                                                <div className="mb-2 p-2 bg-black/20 rounded-lg flex items-center gap-2 cursor-pointer" onClick={() => window.open(`https://maps.google.com/?q=${msg.location.lat},${msg.location.lng}`, '_blank')}>
                                                    <MapPin size={24} className="text-red-400" />
                                                    <div className="text-xs font-bold underline">View Map Location</div>
                                                </div>
                                            )}
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
                <div className="flex flex-col gap-2">
                    {(selectedFile || location) && (
                        <div className="flex gap-2 px-2">
                            {selectedFile && (
                                <div className="bg-primary/20 text-primary px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-2">
                                    <ImageIcon size={14} /> {selectedFile.name}
                                    <button onClick={() => setSelectedFile(null)}><X size={14} className="hover:text-red-500"/></button>
                                </div>
                            )}
                            {location && (
                                <div className="bg-primary/20 text-primary px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-2">
                                    <MapPin size={14} /> Location Ready
                                    <button onClick={() => setLocation(null)}><X size={14} className="hover:text-red-500"/></button>
                                </div>
                            )}
                        </div>
                    )}
                    <form onSubmit={handleSendMessage} className="bg-surface border border-border rounded-3xl p-4 flex items-center gap-4 shadow-lg shadow-primary/5">
                        <input
                            type="file"
                            className="hidden"
                            ref={fileInputRef}
                            accept="image/*,video/*"
                            onChange={(e) => e.target.files && setSelectedFile(e.target.files[0])}
                        />
                        <button type="button" onClick={() => fileInputRef.current?.click()} className="text-text-muted hover:text-primary transition-colors p-2">
                            <Paperclip size={20} />
                        </button>
                        <button type="button" onClick={handleLocationChoice} className="text-text-muted hover:text-primary transition-colors p-2">
                            <MapPin size={20} />
                        </button>
                        <input
                            type="text"
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            placeholder="Type your message here..."
                            className="flex-1 bg-transparent border-none text-foreground px-2 py-2 focus:outline-none font-medium"
                        />
                        <button
                            type="submit"
                            disabled={(!newMessage.trim() && !selectedFile && !location) || sending}
                            className="w-14 h-14 shrink-0 rounded-2xl bg-primary text-white flex items-center justify-center hover:bg-primary-hover shadow-lg shadow-primary/20 group transition-all translate-y-[-1px] active:translate-y-[0px] disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <Send size={20} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                        </button>
                    </form>
                </div>

            </div>

            {/* Location Choice Modal */}
            <Modal isOpen={isLocationChoiceModalOpen} onClose={() => setIsLocationChoiceModalOpen(false)}>
                <div className="space-y-6 text-center">
                    <div className="w-16 h-16 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto">
                        <MapPin size={32} />
                    </div>
                    <div>
                        <h3 className="text-2xl font-bold text-foreground mb-2">Share Location</h3>
                        <p className="text-sm text-text-muted">How would you like to share your location?</p>
                    </div>
                    <div className="flex flex-col gap-3">
                        <Button variant="primary" className="w-full" onClick={handleSendCurrentLocation}>
                            Send Current GPS Location
                        </Button>
                        <Button variant="outline" className="w-full" onClick={handleOpenMapPicker}>
                            Select on Map
                        </Button>
                    </div>
                </div>
            </Modal>

            {/* Location Picker Modal */}
            <Modal isOpen={isLocationModalOpen} onClose={() => setIsLocationModalOpen(false)}>
                <div className="space-y-4">
                    <h3 className="text-2xl font-bold text-foreground">Select Location</h3>
                    <p className="text-sm text-text-muted mb-4">Click anywhere on the map to drop a pin at the location you want to share.</p>
                    
                    <LocationPickerMap onLocationSelect={setTempLocation} />

                    <div className="flex gap-4 pt-4 mt-4">
                        <Button variant="outline" className="flex-1" onClick={() => setIsLocationModalOpen(false)}>
                            Cancel
                        </Button>
                        <Button 
                            className="flex-1" 
                            disabled={!tempLocation}
                            onClick={() => {
                                setLocation(tempLocation);
                                setIsLocationModalOpen(false);
                            }}
                        >
                            Confirm Location
                        </Button>
                    </div>
                </div>
            </Modal>
        </DashboardLayout>
    );
}
