"use client";

import React from 'react';

const Skeleton = ({ className = "" }) => {
    return (
        <div className={`animate-pulse bg-surface-hover rounded-md ${className}`}></div>
    );
};

export const CardSkeleton = () => (
    <div className="bg-surface border border-border p-6 rounded-2xl shadow-sm">
        <Skeleton className="h-4 w-24 mb-4" />
        <Skeleton className="h-8 w-16" />
    </div>
);

export const TableSkeleton = ({ rows = 5 }) => (
    <div className="w-full space-y-4">
        {[...Array(rows)].map((_, i) => (
            <div key={i} className="flex space-x-4">
                <Skeleton className="h-12 w-full" />
            </div>
        ))}
    </div>
);

export const CategorySkeleton = () => (
    <div className="bg-surface border border-border p-6 rounded-3xl shadow-sm space-y-4 h-48">
        <div className="flex justify-between">
            <Skeleton className="h-12 w-12 rounded-2xl" />
            <Skeleton className="h-4 w-20 rounded-full" />
        </div>
        <Skeleton className="h-6 w-3/4" />
        <Skeleton className="h-16 w-full" />
        <Skeleton className="h-4 w-1/2" />
    </div>
);

export const ProviderSkeleton = () => (
    <div className="flex items-center justify-between p-3 border border-border/50 rounded-xl">
        <div className="flex items-center gap-3">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="space-y-2">
                <Skeleton className="h-3 w-24" />
                <Skeleton className="h-2 w-16" />
            </div>
        </div>
        <Skeleton className="h-3 w-10" />
    </div>
);

export default Skeleton;
