"use client";

import { useState, useEffect, Suspense, useContext } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import ServiceCard from "../../../src/components/ServiceCard";
import api from "../../../src/services/api";
import { AuthContext } from "../../../src/context/AuthContext";

import ProviderMiniCard from "../../../src/components/ProviderMiniCard";

function ServicesContent() {
  const [services, setServices] = useState([]);
  const [providers, setProviders] = useState([]);
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState(null);
  const [loading, setLoading] = useState(true);

  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const { user } = useContext(AuthContext);

  useEffect(() => {
    const cat = searchParams.get("category");
    setCategoryFilter(cat || null);
  }, [searchParams]);

  const handleCategoryChange = (e) => {
    const val = e.target.value;
    const params = new URLSearchParams(searchParams.toString());
    if (val) {
      params.set("category", val);
    } else {
      params.delete("category");
    }
    router.push(`${pathname}?${params.toString()}`);
  };

  useEffect(() => {
    setLoading(true);
    const fetchMarketplace = async () => {
      try {
        const [servicesRes, providersRes] = await Promise.all([
          api.get("/api/services", { params: { q: search, category: categoryFilter } }),
          api.get("/api/providers", { params: { category: categoryFilter } })
        ]);
        setServices(servicesRes.data);
        setProviders(providersRes.data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchMarketplace();
  }, [search, categoryFilter]);

  useEffect(() => {
    api
      .get("/api/categories")
      .then((res) => setCategories(res.data))
      .catch((e) => console.error(e));
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-10 space-y-4 md:space-y-0 md:space-x-6">
        <div className="relative flex-1 max-w-lg">
          <input
            type="text"
            placeholder="Search services..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-surface border border-border text-foreground rounded-2xl px-5 py-3 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-sm"
          />
        </div>
        <select
          value={categoryFilter || ""}
          onChange={handleCategoryChange}
          className="bg-surface border border-border text-foreground rounded-2xl px-5 py-3 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-sm cursor-pointer md:w-64"
        >
          <option value="">All Categories</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      {loading && (
        <div className="flex justify-center py-20">
          <div className="animate-pulse text-text-muted font-medium">Loading marketplace...</div>
        </div>
      )}

      {!loading && providers.length > 0 && (
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            {categoryFilter
              ? `Available Providers in ${categories.find(c => c.id == categoryFilter)?.name || "Category"}`
              : "Featured Professionals"}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {providers.slice(0, 6).map((p) => (
              <ProviderMiniCard
                key={p.id}
                provider={{
                  ...p,
                  rating: p.average_rating || "4.8",
                  completedJobs: p.completedJobs || "10+",
                  category: categoryFilter
                    ? categories.find(c => c.id == categoryFilter)?.name
                    : (p.categories?.[0] || "Expert")
                }}
                variant="vertical"
              />
            ))}
          </div>
        </section>
      )}

      <h2 className="text-xl font-bold mb-6">Available Services</h2>
      {!loading && services.length === 0 && (
        <div className="text-center py-20 bg-surface border border-border rounded-3xl">
          <p className="text-text-muted">No services found matching your criteria.</p>
        </div>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {services.map((s) => (
          <ServiceCard key={s.id} service={s} user={user} />
        ))}
      </div>
    </div>
  );
}

export default function ServicesPage() {
  return (
    <Suspense fallback={
      <div className="flex justify-center py-20">
        <div className="animate-pulse text-text-muted font-medium">Loading...</div>
      </div>
    }>
      <ServicesContent />
    </Suspense>
  );
}
