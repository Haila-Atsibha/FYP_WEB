"use client";

import React from 'react';

const Badge = ({ children, variant = "default", className = "" }) => {
    const variants = {
        default: "bg-surface border-border text-foreground",
        primary: "bg-primary/10 border-primary/20 text-primary",
        success: "bg-green-500/10 border-green-500/20 text-green-500",
        warning: "bg-yellow-500/10 border-yellow-500/20 text-yellow-500",
        danger: "bg-red-500/10 border-red-500/20 text-red-500",
        info: "bg-blue-500/10 border-blue-500/20 text-blue-500",
    };

    return (
        <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${variants[variant] || variants.default} ${className}`}>
            {children}
        </span>
    );
};

export default Badge;
