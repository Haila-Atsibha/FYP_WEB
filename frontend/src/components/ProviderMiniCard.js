"use client";

import Link from 'next/link';
import { Star, CheckCircle } from 'lucide-react';
import Button from './Button';

export default function ProviderMiniCard({ provider, variant = "horizontal" }) {
    const profileId = provider.provider_profile_id || provider.id;

    if (variant === "vertical") {
        return (
            <div className="bg-surface border border-border rounded-2xl p-4 shadow-sm hover:border-primary/40 transition-all group">
                <Link href={`/services/${profileId}`}>
                    <div className="flex items-center gap-4 mb-4 cursor-pointer">
                        <div className="w-12 h-12 rounded-full bg-surface-hover overflow-hidden border border-border">
                            {provider.image || provider.profile_image_url ? (
                                <img src={provider.image || provider.profile_image_url} alt={provider.name} className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-primary font-bold">{provider.name[0]}</div>
                            )}
                        </div>
                        <div>
                            <h4 className="text-sm font-bold text-foreground group-hover:text-primary transition-colors">{provider.name}</h4>
                            <div className="flex items-center gap-1 text-yellow-500 font-bold text-[10px]">
                                <Star size={10} fill="currentColor" /> {provider.rating || provider.average_rating || "4.8"}
                            </div>
                        </div>
                    </div>
                </Link>
                <div className="flex items-center justify-between text-[10px] text-text-muted mb-4">
                    <span className="flex items-center gap-1"><CheckCircle size={10} /> {provider.completedJobs || "10+"} Jobs</span>
                    <span className="font-medium text-primary">{provider.category || provider.categories?.[0]}</span>
                </div>
                <Link href={`/services/${profileId}`}>
                    <Button variant="secondary" className="w-full py-2 text-[10px] font-bold h-auto">View Profile</Button>
                </Link>
            </div>
        );
    }

    return (
        <div className="flex items-center justify-between p-3 border border-border/50 rounded-xl hover:bg-surface-hover transition-colors group">
            <Link href={`/services/${profileId}`} className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-surface-hover overflow-hidden border border-border flex-shrink-0">
                    {provider.image || provider.profile_image_url ? (
                        <img src={provider.image || provider.profile_image_url} alt={provider.name} className="w-full h-full object-cover" />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-primary font-bold text-xs">{provider.name[0]}</div>
                    )}
                </div>
                <div className="min-w-0">
                    <h4 className="text-xs font-bold text-foreground truncate group-hover:text-primary transition-colors">{provider.name}</h4>
                    <div className="flex items-center gap-1 text-[10px]">
                        <span className="flex items-center gap-0.5 text-yellow-500 font-bold">
                            <Star size={8} fill="currentColor" /> {provider.rating || provider.average_rating || "4.8"}
                        </span>
                        <span className="text-text-muted">• {provider.completedJobs || "10+"} jobs</span>
                    </div>
                </div>
            </Link>
            <Link href={`/services/${profileId}`}>
                <button className="text-[10px] font-bold text-primary hover:underline flex-shrink-0">Profile</button>
            </Link>
        </div>
    );
}
