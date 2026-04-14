"use client";

import React, { useState, useEffect, useContext } from "react";
import { AuthContext } from "../../../../src/context/AuthContext";
import ProtectedRoute from "../../../../src/components/ProtectedRoute";
import DashboardLayout from "../../../../src/components/DashboardLayout";
import api from "../../../../src/services/api";
import { useTranslation } from "../../../../src/hooks/useTranslation";
import {
    User,
    Mail,
    Phone,
    Save,
    CheckCircle2,
    AlertCircle,
    Loader2
} from "lucide-react";

export default function CustomerProfile() {
    const { t } = useTranslation();
    const { user, loading: authLoading } = useContext(AuthContext);
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState({ type: "", text: "" });

    const [formData, setFormData] = useState({
        name: "",
        phone: ""
    });
    
    const [profileImageFile, setProfileImageFile] = useState(null);
    const [previewImage, setPreviewImage] = useState(null);

    useEffect(() => {
        if (!authLoading && user) {
            fetchProfile();
        }
    }, [user, authLoading]);

    const fetchProfile = async () => {
        setLoading(true);
        try {
            const response = await api.get("/api/customer/profile/me");
            setProfile(response.data);
            setFormData({
                name: response.data.name || "",
                phone: response.data.phone || ""
            });
        } catch (err) {
            console.error("Error fetching profile:", err);
            setMessage({ type: "error", text: t("msg_load_profile_error") });
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
        if (profileImageFile) {
            submitData.append("profileImage", profileImageFile);
        }

        try {
            const response = await api.put("/api/customer/profile", submitData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            // Update profile with returned data so avatar updates instantly if not page reloaded
            setProfile(response.data.profile);
            setMessage({ type: "success", text: t("msg_update_profile_success") });
            setTimeout(() => setMessage({ type: "", text: "" }), 3000);
        } catch (err) {
            console.error("Error updating profile:", err);
            setMessage({ type: "error", text: t("msg_update_profile_error") });
        } finally {
            setSaving(false);
        }
    };

    return (
        <ProtectedRoute roles={["customer"]}>
            <DashboardLayout>
                <div className="max-w-4xl mx-auto pb-20 space-y-8">
                    {/* Header */}
                    <div>
                        <h1 className="text-4xl font-black text-foreground tracking-tight">{t("manage_account_title")}</h1>
                        <p className="text-text-muted font-medium mt-1">{t("manage_account_subtitle")}</p>
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
                                            onClick={() => document.getElementById('profileImageUpload').click()}
                                        >
                                            <div className="w-full h-full rounded-full bg-white/20 flex items-center justify-center border-2 border-white/30 overflow-hidden shadow-inner">
                                                {(previewImage || profile?.profile_image_url || user?.profile_image_url) ? (
                                                    <img src={previewImage || profile?.profile_image_url || user?.profile_image_url} alt="Profile" className="w-full h-full object-cover" />
                                                ) : (
                                                    <User size={48} />
                                                )}
                                            </div>
                                            <div className="absolute inset-0 bg-black/50 rounded-full opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center transition-all duration-300 backdrop-blur-sm">
                                                <span className="text-xs font-black text-white uppercase text-center drop-shadow-md">{t("change_photo")}</span>
                                            </div>
                                            <input type="file" id="profileImageUpload" className="hidden" accept="image/*" onChange={handleImageChange} />
                                        </div>
                                        <h2 className="text-2xl font-black truncate w-full">{formData.name || user?.name}</h2>
                                        <div className="mt-2 bg-white/10 px-4 py-1.5 rounded-full backdrop-blur-md border border-white/20">
                                            <span className="text-xs font-black tracking-widest uppercase">{t("role_customer")}</span>
                                        </div>
                                    </div>
                                    <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-white/5 rounded-full blur-2xl"></div>
                                </div>
                            </div>

                            {/* Right: Edit Form */}
                            <div className="lg:col-span-2">
                                <form onSubmit={handleSubmit} className="bg-surface border border-border rounded-[2.5rem] p-10 shadow-sm space-y-8">
                                    {message.text && (
                                        <div className={`p-4 rounded-2xl flex items-center gap-3 animate-in fade-in slide-in-from-top-2 ${message.type === "success" ? "bg-green-500/10 text-green-600 border border-green-500/20" : "bg-red-500/10 text-red-600 border border-red-500/20"
                                            }`}>
                                            {message.type === "success" ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
                                            <p className="text-sm font-bold">{message.text}</p>
                                        </div>
                                    )}

                                    <div className="space-y-6">
                                        <div className="space-y-2">
                                            <label className="text-xs font-black uppercase text-text-muted tracking-widest ml-1">{t("label_full_name")}</label>
                                            <div className="relative group">
                                                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-primary transition-colors" size={18} />
                                                <input
                                                    name="name"
                                                    value={formData.name}
                                                    onChange={handleChange}
                                                    className="w-full bg-surface-hover border border-border hover:border-text-muted focus:border-primary focus:ring-4 focus:ring-primary/10 rounded-2xl py-4 pl-12 pr-4 outline-none transition-all font-bold text-foreground"
                                                    placeholder={t("placeholder_full_name")}
                                                    required
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-xs font-black uppercase text-text-muted tracking-widest ml-1">{t("label_phone_number")}</label>
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

                                    <div className="space-y-2 bg-surface-hover/50 p-6 rounded-2xl border border-dashed border-border mt-6">
                                        <label className="text-xs font-black uppercase text-text-muted tracking-widest flex items-center gap-2">
                                            <Mail size={14} className="text-primary" /> {t("label_registered_email")}
                                        </label>
                                        <p className="text-foreground font-black ml-0.5 mt-2">{profile?.email || user?.email}</p>
                                        <p className="text-[10px] font-bold text-text-muted uppercase mt-1">{t("desc_email_locked")}</p>
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={saving}
                                        className="w-full bg-primary hover:bg-primary-dark text-white font-black py-5 rounded-2xl shadow-xl shadow-primary/20 transition-all hover:-translate-y-1 disabled:opacity-70 disabled:hover:translate-y-0 flex items-center justify-center gap-3 mt-8"
                                    >
                                        {saving ? <Loader2 className="animate-spin" size={24} /> : <Save size={24} />}
                                        {saving ? t("btn_saving_changes") : t("btn_save_profile")}
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
