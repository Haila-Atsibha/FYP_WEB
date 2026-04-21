"use client";

import { useState, useEffect, Suspense, useContext } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import ServiceCard from "../../../src/components/ServiceCard";
import api from "../../../src/services/api";
import { AuthContext } from "../../../src/context/AuthContext";
import ProviderMiniCard from "../../../src/components/ProviderMiniCard";
import { motion, AnimatePresence } from "framer-motion";
import { Search } from "lucide-react";

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
    if (cat === "null" || cat === "undefined" || !cat) {
      setCategoryFilter(null);
    } else {
      setCategoryFilter(cat);
    }
  }, [searchParams]);

  const handleCategoryChange = (val) => {
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
    <div className="max-w-7xl mx-auto px-6 py-12 relative z-10 w-full overflow-hidden">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-12"
      >
        <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">Explore Our Menu</h1>
        <p className="text-text-muted text-lg max-w-2xl mx-auto">Discover premium fast food options prepared instantly around your location.</p>
      </motion.div>

      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-10 gap-6">
        {/* Search Bar */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="relative flex-1 max-w-lg"
        >
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-text-muted" />
          </div>
          <input
            type="text"
            placeholder="Search for burgers, pizza, drinks..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-surface/50 border border-white/10 text-white rounded-full pl-12 pr-5 py-4 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all shadow-lg backdrop-blur-md"
          />
        </motion.div>

        {/* Category Pills */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide md:max-w-[50%]"
        >
          <button
            onClick={() => handleCategoryChange("")}
            className={`whitespace-nowrap px-6 py-3 rounded-full text-sm font-semibold transition-all border ${!categoryFilter
                ? "bg-primary text-white border-primary shadow-lg shadow-primary/20"
                : "bg-surface/50 text-text-muted border-white/10 hover:border-primary/50 hover:text-white backdrop-blur-md"
              }`}
          >
            All Items
          </button>
          {categories.map((c) => (
            <button
              key={c.id}
              onClick={() => handleCategoryChange(c.id)}
              className={`whitespace-nowrap px-6 py-3 rounded-full text-sm font-semibold transition-all border ${categoryFilter == c.id
                  ? "bg-primary text-white border-primary shadow-lg shadow-primary/20"
                  : "bg-surface/50 text-text-muted border-white/10 hover:border-primary/50 hover:text-white backdrop-blur-md"
                }`}
            >
              {c.name}
            </button>
          ))}
        </motion.div>
      </div>

      {loading && (
        <div className="flex justify-center py-20">
          <div className="animate-pulse text-primary font-medium flex items-center gap-3">
            <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
            Loading menu...
          </div>
        </div>
      )}

      <section className="mb-16">
        {!loading && services.length === 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-20 glass-card rounded-3xl">
            <p className="text-text-muted text-lg">No menu items found matching your criteria.</p>
          </motion.div>
        )}
        <motion.div
          layout
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          <AnimatePresence>
            {!loading && services.map((s, idx) => (
              <motion.div
                key={s.id}
                layout
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.4, delay: idx * 0.05 }}
              >
                <ServiceCard service={s} user={user} />
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      </section>

      {!loading && providers.length > 0 && (
        <motion.section
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="mb-12 pt-8 border-t border-white/10"
        >
          <h2 className="text-2xl font-bold mb-8 text-foreground">
            {categoryFilter
              ? `Top Restaurants in ${categories.find(c => c.id == categoryFilter)?.name || "Category"}`
              : "Featured Restaurants"}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {providers.slice(0, 6).map((p, idx) => (
              <motion.div
                key={p.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
              >
                <ProviderMiniCard
                  provider={{
                    ...p,
                    rating: p.average_rating || "4.8",
                    completedJobs: p.completedJobs || "100+",
                    category: categoryFilter
                      ? categories.find(c => c.id == categoryFilter)?.name
                      : (p.categories?.[0] || "Fast Food")
                  }}
                  variant="vertical"
                />
              </motion.div>
            ))}
          </div>
        </motion.section>
      )}
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
