"use client";

import Link from "next/link";

export default function CategoryPreview({ categories }) {
  return (
    <section className="py-24 bg-background transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex justify-between items-end mb-12">
          <div>
            <h2 className="text-3xl font-bold text-foreground">Browse by Category</h2>
            <p className="text-text-muted mt-2">Find exactly what you need in seconds</p>
          </div>
          <Link href="/services" className="text-primary font-semibold hover:underline decoration-2 underline-offset-4">
            View All
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              href={`/services?category=${cat.id}`}
              className="group block bg-surface border border-border rounded-2xl p-8 hover:shadow-lg hover:shadow-primary/5 hover:border-primary/30 transition-all active:scale-95"
            >
              <h3 className="text-xl font-bold mb-2 text-foreground group-hover:text-primary transition-colors">
                {cat.name}
              </h3>
              <p className="text-text-muted text-sm line-clamp-2">
                {cat.description || "Expert help in this category."}
              </p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
