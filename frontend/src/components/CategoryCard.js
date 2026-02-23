"use client";

import React from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export default function CategoryCard({ category }) {
    return (
        <div className="bg-surface border border-border rounded-3xl p-6 shadow-sm hover:shadow-md transition-all group flex flex-col h-full">
            <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                    {/* Dynamic icon logic could go here */}
                    <span className="text-xl">✨</span>
                </div>
                <Badge variant="info" className="text-[10px]">{category.providerCount || 0} Providers</Badge>
            </div>
            <h3 className="font-bold text-lg text-foreground mb-2 group-hover:text-primary transition-colors">{category.name}</h3>
            <p className="text-xs text-text-muted leading-relaxed mb-6 flex-1">{category.description || "Browse top-rated professionals in this category."}</p>

            <Link
                href={`/services?category=${category.id}`}
                className="text-sm font-bold text-primary flex items-center gap-2 group-hover:gap-3 transition-all"
            >
                View All Providers <ArrowRight size={14} />
            </Link>
        </div>
    );
}

// Simple Badge component if not imported globally
const Badge = ({ children, variant = "primary", className = "" }) => {
    const variants = {
        primary: "bg-primary/10 text-primary border-primary/20",
        success: "bg-green-500/10 text-green-500 border-green-500/20",
        danger: "bg-red-500/10 text-red-500 border-red-500/20",
        info: "bg-blue-500/10 text-blue-500 border-blue-500/20",
        warning: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
    };
    return (
        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${variants[variant]} ${className}`}>
            {children}
        </span>
    );
};
