"use client";

import React, { useState, useEffect, useContext } from "react";
import { AuthContext } from "../../../../src/context/AuthContext";
import ProtectedRoute from "../../../../src/components/ProtectedRoute";
import DashboardLayout from "../../../../src/components/DashboardLayout";
import api from "../../../../src/services/api";
import {
    User,
    Mail,
    Phone,
    FileText,
    Save,
    ShieldCheck,
    Star,
    CheckCircle2,
    AlertCircle,
    Loader2
} from "lucide-react";

export default function ProviderProfile() {
    const { user, loading: authLoading } = useContext(AuthContext);
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState({ type: "", text: "" });

    const [formData, setFormData] = useState({
        name: "",
        bio: "",
        phone: ""
    });

    useEffect(() => {
        if (!authLoading && user) {
            fetchProfile();
        }
    }, [user, authLoading]);

    const fetchProfile = async () => {
        setLoading(true);
        try {
            const response = await api.get("/api/providers/profile/me");
            setProfile(response.data);
            setFormData({
                name: response.data.name || "",
                bio: response.data.bio || "",
                phone: response.data.phone || ""
            });
        } catch (err) {
            console.error("Error fetching profile:", err);
            setMessage({ type: "error", text: "Failed to load profile information." });
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        setMessage({ type: "", text: "" });

        try {
            await api.put("/api/providers/profile", formData);
            setMessage({ type: "success", text: "Profile updated successfully!" });
            setTimeout(() => setMessage({ type: "", text: "" }), 3000);
        } catch (err) {
            console.error("Error updating profile:", err);
            setMessage({ type: "error", text: "Failed to update profile. Please try again." });
        } finally {
            setSaving(false);
        }
    };

    return (
        <ProtectedRoute roles={["provider"]}>
            <DashboardLayout>
                <div className="max-w-4xl mx-auto pb-20 space-y-8">
                    {/* Header */}
                    <div>
                        <h1 className="text-4xl font-black text-foreground tracking-tight">Manage Profile</h1>
                        <p className="text-text-muted font-medium mt-1">Update your professional details and contact information</p>
                    </div>

                    {loading ? (
                        <div className="h-96 bg-surface border border-border rounded-[2.5rem] flex items-center justify-center">
                            <Loader2 className="animate-spin text-primary" size={40} />
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            {/* Left: Summary Card */}
                            <div className="lg:col-span-1 space-y-6">
                                <div className="bg-primary rounded-[2.5rem] p-8 text-white shadow-2xl shadow-primary/20 relative overflow-hidden group">
                                    <div className="relative z-10 flex flex-col items-center text-center">
                                        <div className="w-24 h-24 rounded-full bg-white/20 flex items-center justify-center mb-4 border-2 border-white/30 truncate">
                                            <User size={48} />
                                        </div>
                                        <h2 className="text-2xl font-black truncate w-full">{formData.name || user?.name}</h2>
                                        <div className="flex items-center gap-1.5 mt-2 bg-white/10 px-4 py-1.5 rounded-full backdrop-blur-md border border-white/20">
                                            <Star size={14} fill="currentColor" className="text-yellow-400" />
                                            <span className="text-sm font-black">{profile?.average_rating || "5.0"} Rating</span>
                                        </div>
                                    </div>
                                    <CheckCircle2 size={120} className="absolute -bottom-6 -right-6 text-white/5 opacity-50 rotate-12" />
                                </div>

                                <div className="bg-surface border border-border rounded-[2.5rem] p-8 space-y-6">
                                    <div className="space-y-4">
                                        <p className="text-xs font-black uppercase text-text-muted tracking-widest">Verification Status</p>
                                        <div className="flex items-center gap-3">
                                            {profile?.is_verified ? (
                                                <div className="w-10 h-10 bg-green-500/10 text-green-500 rounded-2xl flex items-center justify-center shrink-0 border border-green-500/20">
                                                    <ShieldCheck size={20} />
                                                </div>
                                            ) : (
                                                <div className="w-10 h-10 bg-yellow-500/10 text-yellow-500 rounded-2xl flex items-center justify-center shrink-0 border border-yellow-500/20">
                                                    <AlertCircle size={20} />
                                                </div>
                                            )}
                                            <div>
                                                <p className="text-sm font-black text-foreground leading-none">
                                                    {profile?.is_verified ? "Verified Professional" : "Verification Pending"}
                                                </p>
                                                <p className="text-[10px] font-bold text-text-muted mt-1 uppercase">Official QuickServe Status</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Right: Edit Form */}
                            <div className="lg:col-span-2">
                                <form onSubmit={handleSubmit} className="bg-surface border border-border rounded-[2.5rem] p-10 shadow-sm space-y-8">
                                    {message.text && (
                                        <div className={`p-4 rounded-2xl flex items-center gap-3 ${message.type === "success" ? "bg-green-500/10 text-green-600 border border-green-500/20" : "bg-red-500/10 text-red-600 border border-red-500/20"
                                            }`}>
                                            {message.type === "success" ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
                                            <p className="text-sm font-bold">{message.text}</p>
                                        </div>
                                    )}

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-xs font-black uppercase text-text-muted tracking-widest ml-1">Full Name</label>
                                            <div className="relative group">
                                                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-primary transition-colors" size={18} />
                                                <input
                                                    name="name"
                                                    value={formData.name}
                                                    onChange={handleChange}
                                                    className="w-full bg-surface-hover border border-border hover:border-text-muted focus:border-primary focus:ring-4 focus:ring-primary/10 rounded-2xl py-4 pl-12 pr-4 outline-none transition-all font-bold text-foreground"
                                                    placeholder="Your full name"
                                                    required
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-xs font-black uppercase text-text-muted tracking-widest ml-1">Phone Number</label>
                                            <div className="relative group">
                                                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-primary transition-colors" size={18} />
                                                <input
                                                    name="phone"
                                                    value={formData.phone}
                                                    onChange={handleChange}
                                                    className="w-full bg-surface-hover border border-border hover:border-text-muted focus:border-primary focus:ring-4 focus:ring-primary/10 rounded-2xl py-4 pl-12 pr-4 outline-none transition-all font-bold text-foreground"
                                                    placeholder="+251 ..."
                                                    required
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-xs font-black uppercase text-text-muted tracking-widest ml-1">Professional Bio</label>
                                        <div className="relative group">
                                            <FileText className="absolute left-4 top-4 text-text-muted group-focus-within:text-primary transition-colors" size={18} />
                                            <textarea
                                                name="bio"
                                                value={formData.bio}
                                                onChange={handleChange}
                                                className="w-full bg-surface-hover border border-border hover:border-text-muted focus:border-primary focus:ring-4 focus:ring-primary/10 rounded-[1.5rem] py-4 pl-12 pr-4 outline-none transition-all font-bold text-foreground min-h-[160px] resize-none"
                                                placeholder="Tell your customers about your experience and expertise..."
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2 bg-surface-hover/50 p-6 rounded-2xl border border-dashed border-border">
                                        <label className="text-xs font-black uppercase text-text-muted tracking-widest flex items-center gap-2">
                                            <Mail size={14} className="text-primary" /> Registered Email
                                        </label>
                                        <p className="text-foreground font-black ml-0.5">{profile?.email || user?.email}</p>
                                        <p className="text-[10px] font-bold text-text-muted uppercase">Email cannot be changed for security reasons.</p>
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={saving}
                                        className="w-full bg-primary hover:bg-primary-dark text-white font-black py-5 rounded-2xl shadow-xl shadow-primary/20 transition-all hover:-translate-y-1 disabled:opacity-70 disabled:hover:translate-y-0 flex items-center justify-center gap-3"
                                    >
                                        {saving ? <Loader2 className="animate-spin" size={24} /> : <Save size={24} />}
                                        {saving ? "SAVING CHANGES..." : "SAVE PROFILE SETTINGS"}
                                    </button>
                                </form>
                            </div>
                        </div>
                    )}
                </div>
            </DashboardLayout>
        </ProtectedRoute>
    );
}
