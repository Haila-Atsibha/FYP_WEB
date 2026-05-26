"use client";

import React, { useState, useEffect, useContext } from "react";
import { AuthContext } from "../../../../src/context/AuthContext";
import ProtectedRoute from "../../../../src/components/ProtectedRoute";
import DashboardLayout from "../../../../src/components/DashboardLayout";
import api from "../../../../src/services/api";
import {
    AlertTriangle,
    CheckCircle2,
    Calendar,
    Briefcase,
    MessageSquare,
    ShieldAlert,
    PlusCircle
} from "lucide-react";
import Badge from "../../../../src/components/Badge";
import Button from "../../../../src/components/Button";
import Modal from "../../../../src/components/Modal";
import { useToast } from "../../../../src/context/ToastContext";

export default function CustomerComplaints() {
    const { user, loading: authLoading } = useContext(AuthContext);
    const [complaints, setComplaints] = useState([]);
    const [loading, setLoading] = useState(true);
    const { showToast } = useToast();

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [subject, setSubject] = useState("");
    const [description, setDescription] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (!authLoading && user) {
            fetchComplaints();
        }
    }, [user, authLoading]);

    const fetchComplaints = async () => {
        setLoading(true);
        try {
            const response = await api.get("/api/complaints/my");
            setComplaints(response.data);
        } catch (err) {
            console.error("Error fetching customer complaints:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmitPlatformComplaint = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            await api.post("/api/complaints", {
                subject: subject,
                description: description,
                priority: "medium" // Default priority for platform issues
                // booking_id and provider_id are omitted intentionally
            });
            showToast("Platform issue submitted successfully.", "success");
            setIsModalOpen(false);
            setSubject("");
            setDescription("");
            fetchComplaints();
        } catch (err) {
            console.error("Error submitting platform complaint:", err);
            showToast(err.response?.data?.message || "Failed to submit issue", "error");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <ProtectedRoute roles={["customer"]}>
            <DashboardLayout>
                <div className="max-w-6xl mx-auto space-y-8 pb-20">
                    {/* Header */}
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                        <div>
                            <h1 className="text-4xl font-black text-foreground tracking-tight">My Disputes & Issues</h1>
                            <p className="text-text-muted font-medium mt-1">Track the status and resolutions of your filed complaints</p>
                        </div>
                        <Button 
                            onClick={() => setIsModalOpen(true)}
                            className="bg-primary hover:bg-primary-hover text-white rounded-xl py-3 px-6 font-bold shadow-lg shadow-primary/20 flex items-center gap-2"
                        >
                            <PlusCircle size={18} /> File Platform Issue
                        </Button>
                    </div>

                    {/* Complaints List */}
                    <div className="space-y-6 pt-4">
                        {loading ? (
                            [...Array(3)].map((_, i) => (
                                <div key={i} className="h-48 bg-surface border border-border rounded-[2.5rem] animate-pulse" />
                            ))
                        ) : complaints.length === 0 ? (
                            <div className="py-32 text-center bg-surface rounded-[2.5rem] border border-dashed border-border">
                                <div className="w-20 h-20 bg-green-500/10 text-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
                                    <CheckCircle2 size={40} />
                                </div>
                                <h1 className="text-2xl font-black text-foreground">No Disputes Found</h1>
                                <p className="text-text-muted font-medium mt-2">You haven't filed any complaints. Everything looks good!</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {complaints.map((complaint) => (
                                    <ComplaintCard key={complaint.id} complaint={complaint} />
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Platform Complaint Modal */}
                <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
                    <div className="space-y-6">
                        <div className="text-center">
                            <div className="w-16 h-16 bg-gradient-to-br from-primary to-secondary rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-primary/20">
                                <ShieldAlert className="w-8 h-8 text-white" />
                            </div>
                            <h3 className="text-2xl font-bold text-foreground">Report a Platform Issue</h3>
                            <p className="text-text-muted text-sm mt-1">Having trouble with the website or your account? Let us know.</p>
                        </div>

                        <form onSubmit={handleSubmitPlatformComplaint} className="space-y-4">
                            <div className="space-y-2">
                                <label className="block text-sm font-bold text-foreground/80 ml-1">Subject</label>
                                <input
                                    type="text"
                                    className="w-full bg-surface/50 border border-white/10 text-white rounded-2xl px-5 py-4 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all backdrop-blur-md"
                                    placeholder="e.g. Can't update my profile picture"
                                    required
                                    value={subject}
                                    onChange={(e) => setSubject(e.target.value)}
                                />
                            </div>
                            
                            <div className="space-y-2">
                                <label className="block text-sm font-bold text-foreground/80 ml-1">Description</label>
                                <textarea
                                    className="w-full bg-surface/50 border border-white/10 text-white rounded-2xl px-5 py-4 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all min-h-[120px] backdrop-blur-md"
                                    placeholder="Please describe the issue in detail..."
                                    required
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                />
                            </div>

                            <div className="flex gap-4 pt-4">
                                <Button
                                    type="button"
                                    variant="outline"
                                    className="flex-1 bg-transparent border-white/10 text-foreground hover:bg-surface shadow-none rounded-xl"
                                    onClick={() => setIsModalOpen(false)}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    className="flex-1 rounded-xl bg-gradient-to-r from-primary to-secondary shadow-lg shadow-primary/20 text-white border-none font-bold"
                                    disabled={isSubmitting}
                                >
                                    {isSubmitting ? "Submitting..." : "Submit Issue"}
                                </Button>
                            </div>
                        </form>
                    </div>
                </Modal>
            </DashboardLayout>
        </ProtectedRoute>
    );
}

function ComplaintCard({ complaint }) {
    const isResolved = complaint.status === 'resolved';
    const isPlatformIssue = !complaint.provider_name;

    return (
        <div className="bg-surface border border-border p-8 rounded-[2.5rem] hover:shadow-xl hover:shadow-primary/5 transition-all group relative overflow-hidden flex flex-col justify-between h-full">
            <div className="space-y-5 relative z-10 flex-1">
                <div className="flex items-start justify-between">
                    <div>
                        <Badge variant={isResolved ? "success" : "warning"} className="mb-2 mr-2">
                            {isResolved ? "Resolved" : "Under Review"}
                        </Badge>
                        {isPlatformIssue && (
                            <Badge variant="info" className="mb-2">Platform Issue</Badge>
                        )}
                        <h3 className="font-bold text-lg">{complaint.subject}</h3>
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-text-muted flex items-center gap-1.5 bg-surface-hover px-3 py-1 rounded-full border border-border">
                        <Calendar size={12} className="text-primary" />
                        {new Date(complaint.created_at).toLocaleDateString()}
                    </span>
                </div>

                {/* Customer Original Claim */}
                <div>
                    <p className="text-foreground font-medium text-sm leading-relaxed mb-4 text-white/80">
                        "{complaint.description}"
                    </p>
                    <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center border ${isPlatformIssue ? 'bg-blue-500/10 text-blue-500 border-blue-500/20' : 'bg-primary/10 text-primary border-primary/20'}`}>
                            {isPlatformIssue ? <ShieldAlert size={14} /> : <Briefcase size={14} />}
                        </div>
                        <div>
                            <p className="text-xs font-black text-foreground leading-none">{isPlatformIssue ? 'QuickServe Support' : complaint.provider_name}</p>
                            <p className="text-[10px] font-bold text-text-muted mt-1 uppercase flex items-center gap-1">
                                {isPlatformIssue ? 'Platform' : 'Provider'}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Provider Response Section */}
                {complaint.provider_response && (
                    <div className="mt-4 p-4 bg-blue-500/5 border border-blue-500/10 rounded-2xl relative">
                        <div className="flex items-center gap-2 mb-2 text-blue-400">
                            <MessageSquare size={14} />
                            <span className="text-xs font-bold uppercase tracking-widest">Provider's Response</span>
                        </div>
                        <p className="text-xs text-foreground/80 leading-relaxed italic">"{complaint.provider_response}"</p>
                    </div>
                )}

                {/* Admin Final Reply / Resolution */}
                {complaint.admin_reply && (
                    <div className="mt-4 p-4 bg-green-500/5 border border-green-500/10 rounded-2xl relative">
                        <div className="flex items-center gap-2 mb-2 text-green-400">
                            <ShieldAlert size={14} />
                            <span className="text-xs font-bold uppercase tracking-widest">Admin Resolution</span>
                        </div>
                        <p className="text-xs text-foreground/80 leading-relaxed font-medium">"{complaint.admin_reply}"</p>
                    </div>
                )}
            </div>

            {/* Background decoration */}
            <AlertTriangle size={120} className="absolute -bottom-5 -right-5 text-red-500/5 group-hover:scale-110 transition-transform pointer-events-none" />
        </div>
    );
}
