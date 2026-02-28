"use client";

import Link from "next/link";

export default function ServiceCard({ service, user }) {
  const { title, category, price, provider_name, provider_id, rating, id } = service;

  return (
    <div className="bg-surface border border-border rounded-2xl shadow-sm hover:shadow-md transition-all p-5 flex flex-col justify-between group">
      <div>
        <div className="flex justify-between items-start mb-2">
          <span className="text-xs font-bold uppercase tracking-wider text-primary bg-primary/10 px-2 py-1 rounded">
            {service.category_name || service.category?.name || service.category}
          </span>
          <span className="font-bold text-lg text-foreground">${price}</span>
        </div>
        <h3 className="text-xl font-bold text-foreground mb-1 group-hover:text-primary transition-colors">{title}</h3>
        <Link href={`/services/${provider_id}`} className="text-sm text-text-muted hover:text-primary hover:underline transition-colors block mb-2">
          by {provider_name || service.provider?.name || service.provider}
        </Link>
      </div>
      <div className="mt-6 flex flex-col space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-yellow-500 font-medium">{rating || "★ 4.8"}</span>
          <span className="text-xs text-text-muted">12 reviews</span>
        </div>
        {user ? (
          <Link href={`/services/${provider_id}?service=${id}`} className="block text-center bg-primary hover:bg-primary-hover text-white py-3 rounded-xl font-semibold transition-all shadow-md hover:shadow-lg active:scale-95">
            Book Now
          </Link>
        ) : (
          <Link href="/auth/login" className="block text-center bg-primary hover:bg-primary-hover text-white py-3 rounded-xl font-semibold transition-all shadow-md hover:shadow-lg active:scale-95">
            Login to Book
          </Link>
        )}
      </div>
    </div>
  );
}
