"use client";

import { useState, useEffect } from "react";
import Hero from "../src/components/Hero";
import Features from "../src/components/Features";
import CategoryPreview from "../src/components/CategoryPreview";
import api from "../src/services/api";

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
    <div>
      <Hero />
      <Features />
      {!loading && categories.length > 0 && (
        <CategoryPreview categories={categories} />
      )}
    </div>
  );
}
