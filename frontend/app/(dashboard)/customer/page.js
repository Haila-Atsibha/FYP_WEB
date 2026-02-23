"use client";

import React, { useState, useEffect, useContext } from "react";
import Link from "next/link";
import {
  Calendar,
  CheckCircle,
  XCircle,
  Bell,
  Search,
  Plus,
  ArrowRight,
  Star,
  Users,
  Grid
} from "lucide-react";
import { AuthContext } from "../../../src/context/AuthContext";
import ProtectedRoute from "../../../src/components/ProtectedRoute";
import DashboardLayout from "../../../src/components/DashboardLayout";
import Badge from "../../../src/components/Badge";
import Button from "../../../src/components/Button";
import Skeleton, { CardSkeleton, CategorySkeleton, ProviderSkeleton } from "../../../src/components/Skeleton";
import CategoryCard from "../../../src/components/CategoryCard";
import ProviderMiniCard from "../../../src/components/ProviderMiniCard";
import api from "../../../src/services/api";

export default function CustomerDashboard() {
  const { user } = useContext(AuthContext);
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({
    stats: { active: 0, completed: 0, cancelled: 0, unread: 0 },
    categories: [],
    topProviders: []
  });

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [statsRes, categoriesRes, topRes] = await Promise.all([
          api.get("/api/customer/stats").catch(() => ({ data: mockStats })),
          api.get("/api/categories").catch(() => ({ data: mockCategories })),
          api.get("/api/providers/top").catch(() => ({ data: mockTopProviders }))
        ]);

        setData({
          stats: statsRes.data,
          categories: categoriesRes.data.slice(0, 6),
          topProviders: topRes.data.slice(0, 6)
        });
      } catch (err) {
        console.error("Marketplace Dashboard error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <ProtectedRoute roles={["customer"]}>
      <DashboardLayout>
        <div className="max-w-7xl mx-auto space-y-16 pb-20 px-4 sm:px-6">

          {/* 1. Welcome & Stats Section */}
          <section className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h1 className="text-3xl font-extrabold text-foreground tracking-tight">Marketplace</h1>
                <p className="text-text-muted mt-1 text-sm font-medium">Find the best professionals for your needs.</p>
              </div>
              <div className="flex items-center gap-3 bg-surface p-2 rounded-2xl border border-border shadow-sm">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-bold">
                  {user?.name?.[0] || 'C'}
                </div>
                <div className="pr-4">
                  <p className="text-xs font-bold text-foreground leading-tight">{user?.name || 'Customer'}</p>
                  <p className="text-[10px] text-text-muted">Active Session</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              {loading ? (
                [...Array(4)].map((_, i) => <CardSkeleton key={i} />)
              ) : (
                <>
                  <SummaryCard label="In Progress" value={data.stats.active} icon={<Calendar size={18} />} href="/customer/bookings" />
                  <SummaryCard label="Completed" value={data.stats.completed} icon={<CheckCircle size={18} />} href="/customer/bookings" variant="success" />
                  <SummaryCard label="Notifications" value={data.stats.unread} icon={<Bell size={18} />} href="/customer/notifications" highlight={data.stats.unread > 0} />
                  <SummaryCard label="Saved" value={0} icon={<Grid size={18} />} href="/customer/saved" variant="info" />
                </>
              )}
            </div>
          </section>

          {/* 2. Service Categories (Marketplace Preview) */}
          <section className="space-y-8">
            <div className="flex items-center justify-between border-b border-border pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg text-primary"><Grid size={20} /></div>
                <h2 className="text-xl font-bold text-foreground">Service Categories</h2>
              </div>
              <Link href="/services" className="text-xs font-extra-bold text-primary flex items-center gap-2 hover:underline tracking-wider uppercase">
                Explore All <ArrowRight size={14} />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {loading ? (
                [...Array(6)].map((_, i) => <CategorySkeleton key={i} />)
              ) : data.categories.length === 0 ? (
                <div className="col-span-full py-12 text-center text-text-muted bg-surface rounded-3xl border border-dashed border-border italic">
                  No categories available right now.
                </div>
              ) : (
                data.categories.map((cat) => (
                  <CategoryCard key={cat.id} category={cat} />
                ))
              )}
            </div>
          </section>

          {/* 3. Top Rated Providers */}
          <section className="space-y-8 bg-surface/50 p-8 sm:p-12 rounded-[2.5rem] border border-border/50 shadow-inner">
            <div className="text-center max-w-2xl mx-auto space-y-3">
              <h2 className="text-2xl font-black text-foreground sm:text-3xl">Top Rated Professionals</h2>
              <p className="text-text-muted text-sm leading-relaxed font-medium italic">Verified experts with the highest ratings and job completion rates on the platform.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 mt-12">
              {loading ? (
                [...Array(6)].map((_, i) => <div key={i} className="animate-pulse bg-surface-hover h-64 rounded-3xl border border-border"></div>)
              ) : data.topProviders.map(p => (
                <ProviderMiniCard key={p.id} provider={p} variant="vertical" />
              ))}
            </div>
          </section>

          {/* New Marketplace CTA */}
          <section className="bg-primary rounded-[3rem] p-10 sm:p-16 relative overflow-hidden group shadow-2xl shadow-primary/20">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-32 -mt-32 group-hover:scale-125 transition-transform duration-1000"></div>
            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-10">
              <div className="space-y-4 text-center md:text-left">
                <h2 className="text-3xl font-black text-white sm:text-4xl leading-tight">Can't find what you're looking for?</h2>
                <p className="text-white/80 font-bold max-w-md">Our network of thousands of verified professionals is ready to help. Try a custom search or browse all categories.</p>
              </div>
              <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
                <Button variant="secondary" className="bg-white text-primary border-none hover:bg-white/90 px-8 py-4 rounded-2xl font-black text-lg h-auto shadow-lg shadow-black/10 transition-all active:scale-95">Search Marketplace</Button>
              </div>
            </div>
          </section>

        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}

// Minimal Components
const SummaryCard = ({ label, value, icon, href, variant = "primary", highlight = false }) => {
  const variants = {
    primary: "border-primary/20 bg-primary/5 text-primary",
    success: "border-green-500/20 bg-green-500/5 text-green-500",
    danger: "border-red-500/20 bg-red-500/5 text-red-500",
    info: "border-blue-500/20 bg-blue-500/5 text-blue-500",
  };

  return (
    <Link href={href} className={`flex items-center gap-5 p-5 rounded-3xl border ${variants[variant]} shadow-sm hover:shadow-md hover:translate-y-[-2px] transition-all group relative overflow-hidden`}>
      <div className={`p-3 rounded-2xl bg-current/10 text-inherit group-hover:scale-110 transition-transform`}>
        {icon}
      </div>
      <div>
        <p className="text-2xl font-black text-foreground tracking-tight">{value}</p>
        <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest">{label}</p>
      </div>
      {highlight && <div className="absolute top-3 right-3 w-2 h-2 bg-primary rounded-full animate-pulse shadow-[0_0_8px_rgba(var(--color-primary),0.8)]"></div>}
    </Link>
  );
};

// MOCK DATA
const mockStats = {
  active: 2,
  completed: 18,
  cancelled: 3,
  unread: 5
};

const mockCategories = [
  { id: 1, name: "Cleaning Services", description: "Professional home and office cleaning experts with modern equipment.", providerCount: 124 },
  { id: 2, name: "Maintenance & Repair", description: "Top-tier plumbers, electricians, and carpenters for all your fix-it needs.", providerCount: 89 },
  { id: 3, name: "Gardening & Landscaping", description: "Beautify your outdoor space with our expert landscape designers.", providerCount: 45 },
  { id: 4, name: "Personal Care", description: "Professional wellness and beauty experts providing home services.", providerCount: 67 },
  { id: 5, name: "Tech Support", description: "Gadget repairs and software troubleshooting by verified tech gurus.", providerCount: 32 },
  { id: 6, name: "Event Planning", description: "From weddings to corporate events, plan easily with top decorators.", providerCount: 28 },
];

const mockTopProviders = [
  { id: 1, name: "Dr. Fix-It (Tekle)", rating: 5.0, completedJobs: 520, category: "Electronics", image: null },
  { id: 2, name: "Elite Bloomers", rating: 4.9, completedJobs: 410, category: "Gardening", image: null },
  { id: 3, name: "Safe Hands Security", rating: 4.9, completedJobs: 350, category: "Security", image: null },
  { id: 4, name: "Pro Move Co.", rating: 4.8, completedJobs: 290, category: "Moving", image: null },
  { id: 5, name: "Golden Scissor", rating: 4.8, completedJobs: 210, category: "Barbing", image: null },
  { id: 6, name: "Net Solution", rating: 4.7, completedJobs: 180, category: "Networking", image: null },
];
