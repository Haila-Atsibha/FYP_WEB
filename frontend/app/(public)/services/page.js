"use client";

import { useState, useEffect, Suspense, useContext } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import ServiceCard from "../../../src/components/ServiceCard";
import api from "../../../src/services/api";
import { AuthContext } from "../../../src/context/AuthContext";
import ProviderMiniCard from "../../../src/components/ProviderMiniCard";
import { motion, AnimatePresence } from "framer-motion";
import { Search, FolderOpen, Users, Briefcase } from "lucide-react";
import { useTranslation } from "../../../src/hooks/useTranslation";

function SectionHeading({ icon: Icon, title }) {
  return (
    <h2 className="text-base sm:text-lg md:text-xl font-bold text-foreground mb-4 sm:mb-5 flex items-center gap-2">
      <Icon size={20} className="text-primary shrink-0" />
      {title}
    </h2>
  );
}

function ServicesContent() {
  const [services, setServices] = useState([]);
  const [providers, setProviders] = useState([]);
  const [categories, setCategories] = useState([]);
  const [allCategories, setAllCategories] = useState([]);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState(null);
  const [loading, setLoading] = useState(true);

  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const { user } = useContext(AuthContext);
  const { t } = useTranslation();

  const isSearchMode = search.trim().length > 0;
  const pillCategories = isSearchMode ? categories : allCategories;

  useEffect(() => {
    const q = searchParams.get("q");
    if (q) setSearch(q);

    const cat = searchParams.get("category");
    if (cat === "null" || cat === "undefined" || !cat) {
      setCategoryFilter(null);
    } else {
      setCategoryFilter(cat);
    }
  }, [searchParams]);

  useEffect(() => {
    api
      .get("/api/categories")
      .then((res) => setAllCategories(res.data))
      .catch((e) => console.error(e));
  }, []);

  const handleCategoryChange = (val) => {
    const params = new URLSearchParams(searchParams.toString());
    if (val) {
      params.set("category", val);
    } else {
      params.delete("category");
    }
    if (search.trim()) params.set("q", search.trim());
    router.push(`${pathname}?${params.toString()}`);
  };

  useEffect(() => {
    const trimmedSearch = search.trim();
    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const categoryParams = categoryFilter ? { category: categoryFilter } : {};
        const qParams = trimmedSearch ? { q: trimmedSearch } : {};

        const [servicesRes, providersRes, categoriesRes] = await Promise.all([
          api.get("/api/services", { params: { ...categoryParams, ...qParams } }),
          api.get("/api/providers", { params: { ...categoryParams, ...qParams } }),
          api.get("/api/categories", { params: qParams }),
        ]);
        setServices(servicesRes.data);
        setProviders(providersRes.data);
        setCategories(categoriesRes.data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [search, categoryFilter]);

  const totalResults = services.length + categories.length + providers.length;
  const hasAnyResults = totalResults > 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 lg:py-12 relative z-10 w-full min-w-0">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8 sm:mb-10 lg:mb-12"
      >
        <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-3 sm:mb-4 px-2">
          {t("services_explore")}
        </h1>
        <p className="text-text-muted text-sm sm:text-base md:text-lg max-w-2xl mx-auto px-2">
          {t("services_explore_desc")}
        </p>
      </motion.div>

      <div className="flex flex-col gap-4 sm:gap-5 mb-8 sm:mb-10">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative w-full"
        >
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Search className="h-4 w-4 sm:h-5 sm:w-5 text-text-muted" />
          </div>
          <input
            type="text"
            placeholder={t("services_search_placeholder")}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-surface/50 border border-border text-foreground placeholder:text-text-muted rounded-2xl sm:rounded-full pl-11 sm:pl-12 pr-4 py-3 sm:py-3.5 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all shadow-lg backdrop-blur-md"
          />
        </motion.div>

        {pillCategories.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="-mx-4 sm:-mx-6 px-4 sm:px-6"
          >
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide snap-x snap-mandatory">
              <button
                onClick={() => handleCategoryChange("")}
                className={`snap-start shrink-0 whitespace-nowrap px-4 sm:px-6 py-2 sm:py-2.5 rounded-full text-xs sm:text-sm font-semibold transition-all border ${
                  !categoryFilter
                    ? "bg-primary text-white border-primary shadow-lg shadow-primary/20"
                    : "bg-surface/50 text-text-muted border-border hover:border-primary/50 hover:text-foreground backdrop-blur-md"
                }`}
              >
                {t("services_all")}
              </button>
              {pillCategories.map((c) => (
                <button
                  key={c.id}
                  onClick={() => handleCategoryChange(c.id)}
                  className={`snap-start shrink-0 whitespace-nowrap px-4 sm:px-6 py-2 sm:py-2.5 rounded-full text-xs sm:text-sm font-semibold transition-all border ${
                    categoryFilter == c.id
                      ? "bg-primary text-white border-primary shadow-lg shadow-primary/20"
                      : "bg-surface/50 text-text-muted border-border hover:border-primary/50 hover:text-foreground backdrop-blur-md"
                  }`}
                >
                  {c.name}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </div>

      {!loading && isSearchMode && (
        <p className="text-xs sm:text-sm text-text-muted mb-6 sm:mb-8">
          <span className="text-foreground font-medium">{providers.length}</span>{" "}
          {providers.length === 1 ? "provider" : "providers"}
          {" · "}
          <span className="text-foreground font-medium">{categories.length}</span>{" "}
          {categories.length === 1 ? "category" : "categories"}
          {" · "}
          <span className="text-foreground font-medium">{services.length}</span>{" "}
          {services.length === 1 ? "service" : "services"}
          {" found for "}
          <span className="text-foreground/90">&quot;{search.trim()}&quot;</span>
        </p>
      )}

      {!loading && !isSearchMode && services.length > 0 && (
        <p className="text-xs sm:text-sm text-text-muted mb-4 sm:mb-6">
          {services.length} {services.length === 1 ? "service" : "services"} available
        </p>
      )}

      {loading && (
        <div className="flex justify-center py-16 sm:py-20">
          <div className="animate-pulse text-primary font-medium flex items-center gap-3 text-sm sm:text-base">
            <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            {t("services_loading")}
          </div>
        </div>
      )}

      {!loading && isSearchMode && !hasAnyResults && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-12 sm:py-20 glass-card rounded-2xl sm:rounded-3xl px-4 mb-10"
        >
          <p className="text-text-muted text-base sm:text-lg">
            No providers, categories, or services found for &quot;{search.trim()}&quot;.
          </p>
        </motion.div>
      )}

      {!loading && isSearchMode && providers.length > 0 && (
        <motion.section
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10 sm:mb-12"
        >
          <SectionHeading icon={Users} title="Provider profiles" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {providers.map((p, idx) => (
              <motion.div
                key={p.provider_profile_id || p.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.04 }}
                className="min-w-0"
              >
                <ProviderMiniCard
                  provider={{
                    ...p,
                    rating: p.average_rating || "4.8",
                    completedJobs: p.completedJobs ?? 0,
                    category: p.categories?.[0] || "General Services",
                  }}
                  variant="vertical"
                />
              </motion.div>
            ))}
          </div>
        </motion.section>
      )}

      {!loading && isSearchMode && categories.length > 0 && (
        <motion.section
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10 sm:mb-12"
        >
          <SectionHeading icon={FolderOpen} title="Categories" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {categories.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => handleCategoryChange(c.id)}
                className={`text-left glass-card rounded-2xl p-4 sm:p-5 transition-all hover:-translate-y-0.5 border ${
                  categoryFilter == c.id
                    ? "border-primary bg-primary/5 shadow-lg shadow-primary/10"
                    : "border-border hover:border-primary/40"
                }`}
              >
                <h3 className="font-bold text-foreground mb-1">{c.name}</h3>
                {c.description && (
                  <p className="text-xs sm:text-sm text-text-muted line-clamp-2 mb-2">{c.description}</p>
                )}
                <span className="text-xs font-semibold text-primary">
                  {c.providerCount ?? 0} provider{(c.providerCount ?? 0) === 1 ? "" : "s"}
                </span>
              </button>
            ))}
          </div>
        </motion.section>
      )}

      {!loading && (!isSearchMode || services.length > 0) && (
        <section className="mb-12 sm:mb-16">
          {isSearchMode && services.length > 0 && (
            <SectionHeading icon={Briefcase} title="Services" />
          )}

          {!isSearchMode && services.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12 sm:py-20 glass-card rounded-2xl sm:rounded-3xl px-4"
            >
              <p className="text-text-muted text-base sm:text-lg">{t("services_no_found")}</p>
            </motion.div>
          )}

          <motion.div
            layout
            className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6 lg:gap-8"
          >
            <AnimatePresence>
              {!loading &&
                services.map((s, idx) => (
                  <motion.div
                    key={s.id}
                    layout
                    initial={{ opacity: 0, scale: 0.98, y: 16 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.98 }}
                    transition={{ duration: 0.35, delay: Math.min(idx * 0.04, 0.3) }}
                    className="min-w-0"
                  >
                    <ServiceCard service={s} user={user} />
                  </motion.div>
                ))}
            </AnimatePresence>
          </motion.div>
        </section>
      )}

      {!loading && !isSearchMode && providers.length > 0 && (
        <motion.section
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="mb-10 sm:mb-12 pt-6 sm:pt-8 border-t border-border"
        >
          <h2 className="text-lg sm:text-xl md:text-2xl font-bold mb-5 sm:mb-8 text-foreground leading-snug">
            {categoryFilter
              ? `${t("services_top_providers")}${allCategories.find((c) => c.id == categoryFilter)?.name || t("services_category")}`
              : t("services_featured_providers")}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {providers.slice(0, 6).map((p, idx) => (
              <motion.div
                key={p.provider_profile_id || p.id}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.06 }}
                className="min-w-0"
              >
                <ProviderMiniCard
                  provider={{
                    ...p,
                    rating: p.average_rating || "4.8",
                    completedJobs: p.completedJobs ?? 0,
                    category: categoryFilter
                      ? allCategories.find((c) => c.id == categoryFilter)?.name
                      : p.categories?.[0] || "General Services",
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
    <Suspense
      fallback={
        <div className="flex justify-center py-20 px-4">
          <div className="animate-pulse text-text-muted font-medium text-sm sm:text-base">Loading...</div>
        </div>
      }
    >
      <ServicesContent />
    </Suspense>
  );
}
