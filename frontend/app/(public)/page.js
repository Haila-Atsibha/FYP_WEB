"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Hero from "../../src/components/Hero";
import Features from "../../src/components/Features";
import CategoryPreview from "../../src/components/CategoryPreview";
import api from "../../src/services/api";

export default function Home() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get("/api/categories")
      .then((res) => setCategories(res.data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-white text-gray-900 dark:bg-gray-900 dark:text-gray-100 transition-colors duration-300">


      {/* Sections */}
      <Hero />
      <Features />

      {!loading && categories.length > 0 && (
        <CategoryPreview categories={categories} />
      )}
    </div>
  );
}