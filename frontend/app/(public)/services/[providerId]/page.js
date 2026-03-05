"use client";

import { useState, useEffect, useContext } from "react";
import { useParams, useRouter } from "next/navigation";
import { Star, MapPin, ShieldCheck, Clock, CheckCircle, MessageSquare } from "lucide-react";
import api from "../../../../src/services/api";
import { AuthContext } from "../../../../src/context/AuthContext";
import Button from "../../../../src/components/Button";

export default function ProviderProfilePage() {
    const { providerId } = useParams();
    const { user } = useContext(AuthContext);
    const router = useRouter();

    const [provider, setProvider] = useState(null);
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedService, setSelectedService] = useState(null);
    const [description, setDescription] = useState("");
    const [bookingLoading, setBookingLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        const fetchProviderData = async () => {
            try {
                const [providerRes, reviewsRes] = await Promise.all([
                    api.get(`/api/providers/${providerId}`),
                    api.get(`/api/reviews/provider/${providerId}`)
                ]);
                setProvider(providerRes.data);
                setReviews(reviewsRes.data);
            } catch (e) {
                console.error(e);
                setError("Failed to load provider profile.");
            } finally {
                setLoading(false);
            }
        };
        fetchProviderData();
    }, [providerId]);

    const handleBooking = async (e) => {
        e.preventDefault();
        if (!user) {
            router.push("/auth/login");
            return;
        }
        if (!selectedService) {
            setError("Please select a service first.");
            return;
        }

        setBookingLoading(true);
        setError("");
        try {
            await api.post("/api/bookings", {
                service_id: selectedService.id,
                description: description
            });
            setSuccess(true);
            setTimeout(() => {
                router.push("/customer/bookings");
            }, 2000);
        } catch (e) {
            console.error(e);
            setError(e.response?.data?.message || "Booking failed. Please try again.");
        } finally {
            setBookingLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (!provider) {
        return <div className="text-center py-20 text-foreground">Provider not found.</div>;
    }

    return (
        <div className="max-w-7xl mx-auto px-6 py-12">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">

                {/* Left Column: Profile Info */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-surface border border-border rounded-3xl p-8 sticky top-24">
                        <div className="flex flex-col items-center text-center space-y-4">
                            <div className="w-32 h-32 rounded-full bg-surface-hover border-4 border-primary/10 overflow-hidden">
                                {provider.profile_image_url ? (
                                    <img src={provider.profile_image_url} alt={provider.name} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-4xl font-bold text-primary">
                                        {provider.name?.[0]}
                                    </div>
                                )}
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold text-foreground">{provider.name}</h1>
                                <div className="flex items-center justify-center gap-1 text-yellow-500 font-bold mt-1">
                                    <Star size={18} fill="currentColor" />
                                    <span>{Number(provider.average_rating || 0).toFixed(1)}</span>
                                    <span className="text-text-muted font-normal text-sm ml-1">({reviews.length} reviews)</span>
                                </div>
                            </div>

                            <div className="flex flex-wrap justify-center gap-2 mt-2">
                                <span className="bg-primary/10 text-primary text-[10px] font-bold px-3 py-1 rounded-full flex items-center gap-1">
                                    <ShieldCheck size={12} /> VERIFIED
                                </span>
                            </div>
                        </div>

                        <div className="mt-8 pt-8 border-t border-border space-y-4">
                            <h3 className="font-bold text-lg mb-2 text-foreground">About</h3>
                            <p className="text-text-muted text-sm leading-relaxed">
                                {provider.bio || "No bio provided. This professional is dedicated to providing high-quality services to all clients."}
                            </p>
                        </div>

                        <div className="mt-8 pt-8 border-t border-border space-y-4">
                            <div className="flex items-center gap-3 text-text-muted text-sm">
                                <Clock size={16} className="text-primary" />
                                <span>Typically responds within 1 hour</span>
                            </div>
                            <div className="flex items-center gap-3 text-text-muted text-sm">
                                <CheckCircle size={16} className="text-primary" />
                                <span>{provider.completedJobs || 0}+ successful bookings</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column: Services & Booking */}
                <div className="lg:col-span-2 space-y-12">
                    <section>
                        <h2 className="text-2xl font-bold mb-6 text-foreground">Services Offered</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {provider.services?.map((svc) => (
                                <div
                                    key={svc.id}
                                    onClick={() => setSelectedService(svc)}
                                    className={`p-6 rounded-2xl border transition-all cursor-pointer group ${selectedService?.id === svc.id
                                        ? "border-primary bg-primary/5 ring-1 ring-primary"
                                        : "border-border bg-surface hover:border-primary/40"
                                        }`}
                                >
                                    <div className="flex justify-between items-start mb-2">
                                        <h4 className="font-bold text-foreground group-hover:text-primary transition-colors">{svc.title}</h4>
                                        <span className="text-primary font-bold">${svc.price}</span>
                                    </div>
                                    <p className="text-text-muted text-xs line-clamp-2">{svc.description}</p>
                                </div>
                            ))}
                            {(!provider.services || provider.services.length === 0) && (
                                <div className="col-span-2 py-10 text-center bg-surface-hover rounded-2xl text-text-muted italic border border-dashed border-border">
                                    No specific services listed. Contact for custom requests.
                                </div>
                            )}
                        </div>
                    </section>

                    <section className="bg-surface border border-border rounded-3xl p-8 shadow-sm">
                        <h2 className="text-2xl font-bold mb-2 text-foreground">Request a Booking</h2>
                        <p className="text-text-muted text-sm mb-6">Describe your requirements and we'll connect you with the provider.</p>

                        <form onSubmit={handleBooking} className="space-y-6">
                            <div>
                                <label className="block text-sm font-bold text-foreground mb-2">Selected Service</label>
                                <div className="p-4 bg-surface-hover border border-border rounded-xl text-foreground font-medium">
                                    {selectedService ? selectedService.title : "Select a service from above"}
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-foreground mb-2">Job Description</label>
                                <textarea
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    placeholder="Tell us what you need help with in detail..."
                                    rows={4}
                                    className="w-full bg-surface-hover border border-border text-foreground rounded-2xl px-5 py-4 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                                    required
                                />
                            </div>

                            {error && <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-500 rounded-xl text-sm font-medium">{error}</div>}
                            {success && <div className="p-4 bg-green-500/10 border border-green-500/20 text-green-500 rounded-xl text-sm font-medium">Booking request sent successfully! Redirecting...</div>}

                            <Button
                                type="submit"
                                className="w-full py-4 text-sm uppercase tracking-widest font-black"
                                disabled={bookingLoading || success || !selectedService}
                            >
                                {bookingLoading ? "SENDING REQUEST..." : "SUBMIT BOOKING REQUEST"}
                            </Button>
                        </form>
                    </section>

                    {/* Reviews Section */}
                    <section className="space-y-6">
                        <div className="flex items-center justify-between">
                            <h2 className="text-2xl font-bold text-foreground">Customer Reviews</h2>
                            <div className="flex items-center gap-2 text-sm font-bold bg-surface border border-border px-4 py-2 rounded-2xl shadow-sm">
                                <Star size={16} className="text-yellow-500 fill-yellow-500" />
                                <span>{Number(provider.average_rating || 0).toFixed(1)} / 5.0</span>
                            </div>
                        </div>

                        <div className="space-y-4">
                            {reviews.length > 0 ? (
                                reviews.map((review) => (
                                    <div key={review.id} className="bg-surface border border-border p-6 rounded-3xl shadow-sm space-y-4">
                                        <div className="flex justify-between items-start">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary">
                                                    {review.customer_name?.[0] || "C"}
                                                </div>
                                                <div>
                                                    <h4 className="font-bold text-foreground leading-none">{review.customer_name}</h4>
                                                    <div className="flex items-center gap-0.5 mt-1">
                                                        {[...Array(5)].map((_, i) => (
                                                            <Star
                                                                key={i}
                                                                size={12}
                                                                className={`${i < review.rating ? "text-yellow-400 fill-yellow-400" : "text-border"}`}
                                                            />
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                            <span className="text-[10px] text-text-muted font-medium bg-surface-hover px-2 py-1 rounded-lg">
                                                {new Date(review.created_at).toLocaleDateString()}
                                            </span>
                                        </div>
                                        <p className="text-sm text-text-muted italic leading-relaxed">
                                            "{review.comment}"
                                        </p>
                                    </div>
                                ))
                            ) : (
                                <div className="py-12 text-center bg-surface border-2 border-dashed border-border rounded-[2rem]">
                                    <div className="w-12 h-12 bg-background rounded-2xl flex items-center justify-center mx-auto mb-3">
                                        <MessageSquare size={24} className="text-text-muted" />
                                    </div>
                                    <p className="text-text-muted font-medium">No reviews yet for this professional.</p>
                                </div>
                            )}
                        </div>
                    </section>
                </div>

            </div>
        </div>
    );
}
