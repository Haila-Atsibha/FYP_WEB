"use client";

import { useState, useEffect, useContext } from "react";
import { useParams, useRouter } from "next/navigation";
import { Star, MapPin, ShieldCheck, Clock, CheckCircle, MessageSquare, ShoppingBag, Plus } from "lucide-react";
import api from "../../../../src/services/api";
import { AuthContext } from "../../../../src/context/AuthContext";
import Button from "../../../../src/components/Button";
import { motion, AnimatePresence } from "framer-motion";

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
                description: description || "No special instructions."
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
                <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    if (!provider) {
        return <div className="text-center py-20 text-foreground glass-card rounded-3xl m-6">Provider not found.</div>;
    }

    return (
        <div className="relative min-h-screen overflow-hidden pb-20">
            {/* Big Hero Imagery */}
            <div className="absolute top-0 inset-x-0 h-[40vh] md:h-[50vh] z-0 overflow-hidden">
                {provider.profile_image_url ? (
                    <img src={provider.profile_image_url} alt={provider.name} className="w-full h-full object-cover blur-sm opacity-30 select-none scale-105" />
                ) : (
                    <div className="w-full h-full bg-gradient-to-br from-primary/20 to-secondary/20" />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-transparent" />
            </div>

            <div className="relative z-10 max-w-7xl mx-auto px-6 pt-[20vh] md:pt-[30vh]">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">

                    {/* Left Column: Provider Info */}
                    <div className="lg:col-span-1 space-y-6">
                        <motion.div 
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="glass-card rounded-[2.5rem] p-8 md:-mt-12 shadow-2xl relative"
                        >
                            <div className="flex flex-col items-center text-center space-y-4">
                                <div className="w-32 h-32 rounded-3xl bg-surface border border-white/10 overflow-hidden shadow-xl -mt-16 bg-gradient-to-tr from-surface to-surface-hover">
                                    {provider.profile_image_url ? (
                                        <img src={provider.profile_image_url} alt={provider.name} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-4xl font-extrabold text-white">
                                            {provider.name?.[0]}
                                        </div>
                                    )}
                                </div>
                                <div className="pt-2">
                                    <h1 className="text-3xl font-bold text-foreground tracking-tight">{provider.name}</h1>
                                    <div className="flex items-center justify-center gap-1.5 text-yellow-500 font-bold mt-2 bg-yellow-500/10 w-fit mx-auto px-3 py-1 rounded-full text-sm">
                                        <Star size={14} fill="currentColor" />
                                        <span>{Number(provider.average_rating || 0).toFixed(1)}</span>
                                        <span className="text-white/60 font-medium ml-1">({reviews.length} reviews)</span>
                                    </div>
                                </div>

                                <div className="flex flex-wrap justify-center gap-2 mt-2">
                                    <span className="bg-green-500/10 text-green-400 text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1.5">
                                        <ShieldCheck size={14} /> QUALITY VERIFIED
                                    </span>
                                </div>
                            </div>

                            <div className="mt-8 pt-6 border-t border-white/5 space-y-4">
                                <h3 className="font-bold text-lg mb-2 text-foreground">About the Provider</h3>
                                <p className="text-text-muted text-sm leading-relaxed">
                                    {provider.bio || "Dedicated to providing high-quality and reliable services for clients."}
                                </p>
                            </div>

                            <div className="mt-8 pt-6 border-t border-white/5 space-y-4">
                                <div className="flex items-center gap-3 text-text-muted text-sm">
                                    <Clock size={16} className="text-primary" />
                                    <span>Average response time: 10-15 mins</span>
                                </div>
                                <div className="flex items-center gap-3 text-text-muted text-sm">
                                    <CheckCircle size={16} className="text-primary" />
                                    <span>{provider.completedJobs || 0}+ completed jobs</span>
                                </div>
                            </div>
                        </motion.div>
                    </div>

                    {/* Right Column: Services & Booking */}
                    <div className="lg:col-span-2 space-y-12">
                        <motion.section 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.2 }}
                        >
                            <h2 className="text-3xl font-bold mb-8 text-foreground tracking-tight">Available Services</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {provider.services?.map((svc) => (
                                    <div
                                        key={svc.id}
                                        onClick={() => setSelectedService(svc)}
                                        className={`p-6 rounded-[2rem] transition-all cursor-pointer group glass-card hover:translate-y-[-4px] ${selectedService?.id === svc.id
                                            ? "border-primary shadow-[0_0_30px_rgba(99,102,241,0.2)] bg-primary/5"
                                            : "border-white/5 hover:border-primary/40"
                                            }`}
                                    >
                                        <div className="flex justify-between items-start mb-3">
                                            <h4 className="font-bold text-lg text-foreground group-hover:text-primary transition-colors pr-4">{svc.title}</h4>
                                            <span className="text-white font-extrabold text-xl bg-surface/50 px-3 py-1 rounded-xl shadow-inner border border-white/5">${svc.price}</span>
                                        </div>
                                        <p className="text-text-muted text-sm line-clamp-2 leading-relaxed">{svc.description}</p>
                                        <div className="mt-4 flex justify-end">
                                            <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${selectedService?.id === svc.id ? 'bg-primary text-white scale-110' : 'bg-surface border border-white/10 text-white/50 group-hover:bg-primary/20 group-hover:text-primary'}`}>
                                                {selectedService?.id === svc.id ? <CheckCircle size={16} /> : <Plus size={16} />}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                {(!provider.services || provider.services.length === 0) && (
                                    <div className="col-span-2 py-16 text-center glass-card rounded-[2rem] text-text-muted">
                                        No services listed currently.
                                    </div>
                                )}
                            </div>
                        </motion.section>

                        <AnimatePresence>
                            {selectedService && (
                                <motion.section 
                                    initial={{ opacity: 0, height: 0, y: 20 }}
                                    animate={{ opacity: 1, height: 'auto', y: 0 }}
                                    exit={{ opacity: 0, height: 0, y: -20 }}
                                    className="glass-card rounded-[2.5rem] p-8 shadow-xl overflow-hidden"
                                >
                                    <div className="flex items-center gap-3 mb-6">
                                        <div className="w-10 h-10 rounded-full bg-gradient-to-r from-primary to-secondary flex items-center justify-center text-white shadow-lg">
                                            <ShoppingBag size={18} />
                                        </div>
                                        <h2 className="text-2xl font-bold text-foreground">Confirm Booking</h2>
                                    </div>
                                    
                                    <form onSubmit={handleBooking} className="space-y-6 relative z-10">
                                        <div className="p-6 bg-surface/50 border border-white/10 rounded-2xl flex justify-between items-center backdrop-blur-md">
                                            <div>
                                                <div className="text-text-muted text-xs font-bold uppercase tracking-wider mb-1">Selected Service</div>
                                                <div className="text-white font-bold text-lg">{selectedService.title}</div>
                                            </div>
                                            <div className="text-right">
                                                <div className="text-text-muted text-xs font-bold uppercase tracking-wider mb-1">Total</div>
                                                <div className="text-primary font-black text-2xl">${selectedService.price}</div>
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-bold text-foreground mb-3 ml-1">Job Details (Optional)</label>
                                            <textarea
                                                value={description}
                                                onChange={(e) => setDescription(e.target.value)}
                                                placeholder="e.g. Need this done before 5 PM, bring required tools..."
                                                rows={3}
                                                className="w-full bg-surface/50 border border-white/10 text-white rounded-2xl px-5 py-4 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all backdrop-blur-sm"
                                            />
                                        </div>

                                        {error && <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl text-sm font-medium">{error}</div>}
                                        {success && <div className="p-4 bg-green-500/10 border border-green-500/20 text-green-400 rounded-xl text-sm font-medium flex items-center gap-2"><CheckCircle size={16}/> Booking placed successfully! Redirecting...</div>}

                                        <Button
                                            type="submit"
                                            className="w-full py-5 text-sm uppercase tracking-widest font-black rounded-2xl bg-gradient-to-r from-primary to-secondary hover:from-primary-hover hover:to-primary border-0 shadow-xl shadow-primary/20 transition-all hover:scale-[1.02] active:scale-95"
                                            disabled={bookingLoading || success}
                                        >
                                            {bookingLoading ? "PROCESSING BOOKING..." : "BOOK SERVICE"}
                                        </Button>
                                    </form>
                                </motion.section>
                            )}
                        </AnimatePresence>

                        {/* Reviews Section */}
                        <motion.section 
                            initial={{ opacity: 0 }}
                            whileInView={{ opacity: 1 }}
                            viewport={{ once: true }}
                            className="space-y-6 pt-6"
                        >
                            <div className="flex items-center justify-between">
                                <h2 className="text-2xl font-bold text-foreground tracking-tight">Customer Reviews</h2>
                                <div className="flex items-center gap-2 text-sm font-bold glass-card px-4 py-2 rounded-2xl">
                                    <Star size={16} className="text-yellow-500 fill-yellow-500" />
                                    <span>{Number(provider.average_rating || 0).toFixed(1)} / 5.0</span>
                                </div>
                            </div>

                            <div className="grid gap-4 md:grid-cols-2">
                                {reviews.length > 0 ? (
                                    reviews.map((review) => (
                                        <div key={review.id} className="glass-card p-6 rounded-[2rem] space-y-4">
                                            <div className="flex justify-between items-start">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-full bg-surface border border-white/10 flex items-center justify-center font-bold text-white">
                                                        {review.customer_name?.[0] || "C"}
                                                    </div>
                                                    <div>
                                                        <h4 className="font-bold text-foreground leading-none">{review.customer_name}</h4>
                                                        <div className="flex items-center gap-0.5 mt-2">
                                                            {[...Array(5)].map((_, i) => (
                                                                <Star
                                                                    key={i}
                                                                    size={12}
                                                                    className={`${i < review.rating ? "text-yellow-400 fill-yellow-400" : "text-white/10"}`}
                                                                />
                                                            ))}
                                                        </div>
                                                    </div>
                                                </div>
                                                <span className="text-xs text-text-muted font-medium bg-surface/50 px-2 py-1 rounded-lg">
                                                    {new Date(review.created_at).toLocaleDateString()}
                                                </span>
                                            </div>
                                            <p className="text-sm text-text-muted italic leading-relaxed">
                                                "{review.comment}"
                                            </p>
                                        </div>
                                    ))
                                ) : (
                                    <div className="col-span-2 py-12 text-center glass-card rounded-[2rem]">
                                        <div className="w-12 h-12 bg-surface rounded-2xl flex items-center justify-center mx-auto mb-4 border border-white/5">
                                            <MessageSquare size={24} className="text-text-muted" />
                                        </div>
                                        <p className="text-text-muted font-medium">No reviews yet for this provider.</p>
                                    </div>
                                )}
                            </div>
                        </motion.section>
                    </div>

                </div>
            </div>
        </div>
    );
}
