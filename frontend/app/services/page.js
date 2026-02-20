"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import ServiceCard from "../../src/components/ServiceCard";
import api from "../../src/services/api";
import { useContext } from "react";
import { AuthContext } from "../../src/context/AuthContext";

export default function ServicesPage() {
  const [services, setServices] = useState([]);
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState(null);
  const [loading, setLoading] = useState(true);
  const searchParams = useSearchParams();
  const { user } = useContext(AuthContext);

  useEffect(() => {
    const cat = searchParams.get("category");
    if (cat) setCategoryFilter(cat);
  }, [searchParams]);

  useEffect(() => {
    setLoading(true);
    api
      .get("/api/services", {
        params: { q: search, category: categoryFilter },
      })
      .then((res) => setServices(res.data))
      .catch((e) => console.error(e))
      .finally(() => setLoading(false));
  }, [search, categoryFilter]);

  useEffect(() => {
    api
      .get("/api/categories")
      .then((res) => setCategories(res.data))
      .catch((e) => console.error(e));
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <input
          type="text"
          placeholder="Search services..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border rounded-xl px-4 py-2 w-full md:w-1/3 mb-4 md:mb-0"
        />
        <select
          value={categoryFilter || ""}
          onChange={(e) => setCategoryFilter(e.target.value || null)}
          className="border rounded-xl px-4 py-2 w-full md:w-1/4"
        >
          <option value="">All categories</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      {loading && <p>Loading services...</p>}
      {!loading && services.length === 0 && (
        <p>No services found.</p>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {services.map((s) => (
          <ServiceCard key={s.id} service={s} user={user} />
        ))}
      </div>
    </div>
  );
}
