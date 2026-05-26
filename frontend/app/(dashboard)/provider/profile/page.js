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
    CheckCircle2,
    AlertCircle,
    Loader2,
    CreditCard,
    Zap,
    Star,
    Calendar,
    Trash2,
    Plus
} from "lucide-react";

import { useTranslation } from "../../../../src/hooks/useTranslation";

export default function ProviderProfile() {
    const { t } = useTranslation();
    const { user, loading: authLoading } = useContext(AuthContext);
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [subscribing, setSubscribing] = useState(false);
    const [message, setMessage] = useState({ type: "", text: "" });

    const [formData, setFormData] = useState({
        name: "",
        bio: "",
        phone: ""
    });

    const [profileImageFile, setProfileImageFile] = useState(null);
    const [previewImage, setPreviewImage] = useState(null);

    const [unavailableDates, setUnavailableDates] = useState([]);
    const [newUnavailableDate, setNewUnavailableDate] = useState("");
    const [loadingDates, setLoadingDates] = useState(true);

    useEffect(() => {
        if (!authLoading && user) {
            fetchProfile();
            fetchUnavailability();
        }
    }, [user, authLoading]);

    const fetchUnavailability = async () => {
        try {
            const res = await api.get('/api/providers/me/unavailability');
            setUnavailableDates(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoadingDates(false);
        }
    };

    const handleAddUnavailability = async () => {
        if (!newUnavailableDate) return;
        try {
            const res = await api.post('/api/providers/profile/unavailability', { date: newUnavailableDate });
            setUnavailableDates([...unavailableDates, res.data]);
            setNewUnavailableDate("");
            setMessage({ type: "success", text: "Date marked as unavailable." });
            setTimeout(() => setMessage({ type: "", text: "" }), 3000);
        } catch (err) {
            console.error(err);
            setMessage({ type: "error", text: "Failed to add date." });
        }
    };

    const handleRemoveUnavailability = async (id) => {
        try {
            await api.delete(`/api/providers/profile/unavailability/${id}`);
            setUnavailableDates(unavailableDates.filter(d => d.id !== id));
            setMessage({ type: "success", text: "Date availability restored." });
            setTimeout(() => setMessage({ type: "", text: "" }), 3000);
        } catch (err) {
            console.error(err);
            setMessage({ type: "error", text: "Failed to remove date." });
        }
    };

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
            setMessage({ type: "error", text: t("provider_profile_load_error") });
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setProfileImageFile(file);
            setPreviewImage(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        setMessage({ type: "", text: "" });

        const submitData = new FormData();
        submitData.append("name", formData.name);
        submitData.append("phone", formData.phone);
        submitData.append("bio", formData.bio);
        if (profileImageFile) {
            submitData.append("profileImage", profileImageFile);
        }

        try {
            const response = await api.put("/api/providers/profile", submitData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            // Immediately apply possible image or name changes to screen
            setProfile(response.data.profile);
            setMessage({ type: "success", text: t("provider_profile_update_success") });
            setTimeout(() => setMessage({ type: "", text: "" }), 3000);
        } catch (err) {
            console.error("Error updating profile:", err);
            setMessage({ type: "error", text: t("provider_profile_update_error") });
        } finally {
            setSaving(false);
        }
    };

    const handleSubscribe = async () => {
        setSubscribing(true);
        try {
            const response = await api.post("/api/payments/subscribe", {
                plan: "premium",
                amount: "500" // example amount
            });
            if (response.data?.data?.checkout_url) {
                window.location.href = response.data.data.checkout_url;
            } else {
                setMessage({ type: "error", text: t("provider_profile_payment_init_error") });
            }
        } catch (err) {
            console.error("Subscription error:", err);
            setMessage({ type: "error", text: t("provider_profile_payment_connect_error") });
        } finally {
            setSubscribing(false);
        }
    };

    return (
        <ProtectedRoute roles={["provider"]}>
            <DashboardLayout>
                <div className="max-w-4xl mx-auto pb-20 space-y-8">
                    {/* Header */}
                    <div>
                        <h1 className="text-4xl font-black text-foreground tracking-tight">{t("provider_profile_title")}</h1>
                        <p className="text-text-muted font-medium mt-1">{t("provider_profile_desc")}</p>
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
                                        <div 
                                            className="relative w-28 h-28 mb-4 group cursor-pointer" 
                                            onClick={() => document.getElementById('providerProfileImageUpload').click()}
                                        >
                                            <div className="w-full h-full rounded-full bg-white/20 flex items-center justify-center border-2 border-white/30 truncate overflow-hidden shadow-inner">
                                                {(previewImage || profile?.profile_image_url || user?.profile_image_url) ? (
                                                    <img src={previewImage || profile?.profile_image_url || user?.profile_image_url} alt="Profile" className="w-full h-full object-cover" />
                                                ) : (
                                                    <User size={48} />
                                                )}
                                            </div>
                                            <div className="absolute inset-0 bg-black/50 rounded-full opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center transition-all duration-300 backdrop-blur-sm">
                                                <span className="text-xs font-black text-white uppercase text-center drop-shadow-md" dangerouslySetInnerHTML={{ __html: t("provider_profile_change_photo").replace(' ', '<br/>') }}></span>
                                            </div>
                                            <input type="file" id="providerProfileImageUpload" className="hidden" accept="image/*" onChange={handleImageChange} />
                                        </div>
                                        <h2 className="text-2xl font-black truncate w-full">{formData.name || user?.name}</h2>
                                        <div className="flex items-center gap-1.5 mt-2 bg-white/10 px-4 py-1.5 rounded-full backdrop-blur-md border border-white/20">
                                            <Star size={14} fill="currentColor" className="text-yellow-400" />
                                            <span className="text-sm font-black">{profile?.average_rating || "5.0"} {t("provider_profile_rating")}</span>
                                        </div>
                                    </div>
                                    <CheckCircle2 size={120} className="absolute -bottom-6 -right-6 text-white/5 opacity-50 rotate-12" />
                                </div>

                                <div className="bg-surface border border-border rounded-[2.5rem] p-8 space-y-6">
                                    <div className="space-y-4">
                                        <p className="text-xs font-black uppercase text-text-muted tracking-widest">{t("provider_profile_verification_status")}</p>
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
                                                    {profile?.is_verified ? t("provider_profile_verified_professional") : t("provider_profile_verification_pending")}
                                                </p>
                                                <p className="text-[10px] font-bold text-text-muted mt-1 uppercase">{t("provider_profile_official_status")}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                
                                {/* Subscription UI */}
                                <div className="bg-surface border border-border rounded-[2.5rem] p-8 space-y-6 mt-6 relative overflow-hidden group">
                                    <div className="absolute -right-10 -bottom-10 opacity-[0.03] group-hover:opacity-[0.05] transition-opacity">
                                        <Zap size={180} />
                                    </div>
                                    <div className="relative z-10 space-y-4">
                                        <p className="text-xs font-black uppercase text-text-muted tracking-widest flex items-center gap-2">
                                            <CreditCard size={14} className="text-primary" /> {t("provider_profile_premium_subscription")}
                                        </p>
                                        <div className="space-y-1">
                                            <p className="text-lg font-black text-foreground">{t("provider_profile_boost_visibility")}</p>
                                            <p className="text-sm font-medium text-text-muted">{t("provider_profile_boost_desc")}</p>
                                        </div>
                                        
                                        {profile?.subscription_status === 'active' ? (
                                            <div className="bg-green-500/10 border border-green-500/20 text-green-500 px-4 py-3 rounded-xl flex items-center gap-3">
                                                <CheckCircle2 size={20} />
                                                <div>
                                                    <p className="text-sm font-bold">{t("provider_profile_active_premium_plan")}</p>
                                                    <p className="text-xs font-medium opacity-80">{t("provider_profile_valid_until")} {new Date(profile.subscription_end).toLocaleDateString()}</p>
                                                </div>
                                            </div>
                                        ) : (
                                            <button
                                                onClick={handleSubscribe}
                                                disabled={subscribing}
                                                className="w-full bg-gradient-to-r from-primary to-secondary hover:opacity-90 text-white font-black py-4 rounded-xl shadow-lg shadow-primary/20 transition-all flex items-center justify-center gap-2 disabled:opacity-70"
                                            >
                                                {subscribing ? <Loader2 size={20} className="animate-spin" /> : <Zap size={20} />}
                                                {subscribing ? t("provider_profile_initializing") : t("provider_profile_upgrade_button")}
                                            </button>
                                        )}
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
                                            <label className="text-xs font-black uppercase text-text-muted tracking-widest ml-1">{t("provider_profile_full_name")}</label>
                                            <div className="relative group">
                                                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-primary transition-colors" size={18} />
                                                <input
                                                    name="name"
                                                    value={formData.name}
                                                    onChange={handleChange}
                                                    className="w-full bg-surface-hover border border-border hover:border-text-muted focus:border-primary focus:ring-4 focus:ring-primary/10 rounded-2xl py-4 pl-12 pr-4 outline-none transition-all font-bold text-foreground"
                                                    placeholder={t("provider_profile_full_name_placeholder")}
                                                    required
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-xs font-black uppercase text-text-muted tracking-widest ml-1">{t("provider_profile_phone_number")}</label>
                                            <div className="relative group">
                                                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-primary transition-colors" size={18} />
                                                <input
                                                    name="phone"
                                                    value={formData.phone}
                                                    onChange={handleChange}
                                                    className="w-full bg-surface-hover border border-border hover:border-text-muted focus:border-primary focus:ring-4 focus:ring-primary/10 rounded-2xl py-4 pl-12 pr-4 outline-none transition-all font-bold text-foreground"
                                                    placeholder={t("provider_profile_phone_placeholder")}
                                                    required
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-xs font-black uppercase text-text-muted tracking-widest ml-1">{t("provider_profile_bio")}</label>
                                        <div className="relative group">
                                            <FileText className="absolute left-4 top-4 text-text-muted group-focus-within:text-primary transition-colors" size={18} />
                                            <textarea
                                                name="bio"
                                                value={formData.bio}
                                                onChange={handleChange}
                                                className="w-full bg-surface-hover border border-border hover:border-text-muted focus:border-primary focus:ring-4 focus:ring-primary/10 rounded-[1.5rem] py-4 pl-12 pr-4 outline-none transition-all font-bold text-foreground min-h-[160px] resize-none"
                                                placeholder={t("provider_profile_bio_placeholder")}
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2 bg-surface-hover/50 p-6 rounded-2xl border border-dashed border-border">
                                        <label className="text-xs font-black uppercase text-text-muted tracking-widest flex items-center gap-2">
                                            <Mail size={14} className="text-primary" /> {t("provider_profile_registered_email")}
                                        </label>
                                        <p className="text-foreground font-black ml-0.5">{profile?.email || user?.email}</p>
                                        <p className="text-[10px] font-bold text-text-muted uppercase">{t("provider_profile_email_security_notice")}</p>
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={saving}
                                        className="w-full bg-primary hover:bg-primary-dark text-white font-black py-5 rounded-2xl shadow-xl shadow-primary/20 transition-all hover:-translate-y-1 disabled:opacity-70 disabled:hover:translate-y-0 flex items-center justify-center gap-3"
                                    >
                                        {saving ? <Loader2 className="animate-spin" size={24} /> : <Save size={24} />}
                                        {saving ? t("provider_profile_saving_changes") : t("provider_profile_save_settings")}
                                    </button>
                                </form>

                                {/* Unavailability Section */}
                                <div className="mt-8 bg-surface border border-border rounded-[2.5rem] p-10 shadow-sm space-y-6">
                                    <div>
                                        <h2 className="text-xl font-black text-foreground flex items-center gap-2">
                                            <Calendar className="text-primary" size={20} />
                                            Manage Availability
                                        </h2>
                                        <p className="text-sm font-medium text-text-muted mt-1">Select dates when you are NOT available to accept new bookings.</p>
                                    </div>

                                    <div className="flex items-center gap-4">
                                        <input
                                            type="date"
                                            value={newUnavailableDate}
                                            onChange={(e) => setNewUnavailableDate(e.target.value)}
                                            min={new Date().toISOString().split("T")[0]}
                                            className="flex-1 bg-surface-hover border border-border hover:border-text-muted focus:border-primary focus:ring-4 focus:ring-primary/10 rounded-2xl py-3 px-4 outline-none transition-all font-bold text-foreground"
                                        />
                                        <button
                                            onClick={handleAddUnavailability}
                                            disabled={!newUnavailableDate}
                                            className="bg-primary hover:bg-primary-dark text-white font-bold py-3 px-6 rounded-2xl shadow-md transition-all disabled:opacity-50 flex items-center gap-2"
                                        >
                                            <Plus size={18} /> Add
                                        </button>
                                    </div>

                                    <div className="space-y-3 mt-6">
                                        {loadingDates ? (
                                            <div className="flex justify-center p-4"><Loader2 className="animate-spin text-text-muted" size={24} /></div>
                                        ) : unavailableDates.length > 0 ? (
                                            unavailableDates.map(d => (
                                                <div key={d.id} className="flex items-center justify-between bg-surface-hover border border-border p-4 rounded-xl">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 bg-red-500/10 text-red-500 rounded-lg flex items-center justify-center">
                                                            <Calendar size={18} />
                                                        </div>
                                                        <span className="font-bold text-foreground">{new Date(d.date).toLocaleDateString()}</span>
                                                    </div>
                                                    <button 
                                                        onClick={() => handleRemoveUnavailability(d.id)}
                                                        className="text-text-muted hover:text-red-500 transition-colors p-2 rounded-lg hover:bg-red-500/10"
                                                    >
                                                        <Trash2 size={18} />
                                                    </button>
                                                </div>
                                            ))
                                        ) : (
                                            <p className="text-center text-sm font-medium text-text-muted py-6">You are available everyday.</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </DashboardLayout>
        </ProtectedRoute>
    );
}
