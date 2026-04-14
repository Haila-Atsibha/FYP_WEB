"use client";

import Link from "next/link";
import { Plus } from "lucide-react";

export default function ServiceCard({ service, user }) {
  const { title, category, price, provider_name, provider_id, rating, id } = service;

  return (
    <div className="glass-card rounded-3xl p-6 flex flex-col justify-between group overflow-hidden relative">
      {/* Background glow on hover */}
      <div className="absolute inset-0 bg-gradient-to-tr from-primary/0 via-primary/0 to-secondary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

      <div className="relative z-10">
        <div className="flex justify-between items-start mb-4">
          <span className="text-xs font-bold uppercase tracking-wider text-primary bg-primary/10 border border-primary/20 px-3 py-1 rounded-full shadow-sm">
            {service.category_name || service.category?.name || service.category || "Menu Item"}
          </span>
          <span className="font-bold text-xl text-foreground text-gradient">${price}</span>
        </div>
        <h3 className="text-2xl font-bold text-foreground mb-2 group-hover:text-primary transition-colors leading-tight">{title}</h3>
        <Link href={`/services/${provider_id}`} className="text-sm text-text-muted hover:text-white transition-colors block mb-4 font-medium">
          by {provider_name || service.provider?.name || service.provider}
        </Link>
      </div>

      <div className="mt-4 flex flex-col space-y-4 relative z-10">
        <div className="flex items-center justify-between text-sm">
          <span className="flex items-center text-yellow-500 font-bold bg-yellow-500/10 px-2 py-1 rounded-md">
            ★ {rating || "4.8"}
          </span>
          <span className="text-xs text-text-muted font-medium">12+ orders</span>
        </div>
        {user ? (
          <Link href={`/services/${provider_id}?service=${id}`} className="flex items-center justify-center gap-2 w-full bg-surface/50 border border-white/10 hover:border-primary/50 text-white hover:text-primary py-3 rounded-2xl font-semibold transition-all shadow-md group-hover:bg-primary/10 active:scale-95">
            <Plus size={18} />
            <span>Order Now</span>
          </Link>
        ) : (
          <Link href="/auth/login" className="flex items-center justify-center gap-2 w-full bg-surface/50 border border-white/10 hover:border-primary/50 text-text-muted hover:text-white py-3 rounded-2xl font-semibold transition-all shadow-md active:scale-95">
            Login to Order
          </Link>
        )}
      </div>
    </div>
  );
}
