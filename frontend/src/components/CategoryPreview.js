"use client";

import Link from "next/link";

export default function CategoryPreview({ categories }) {
  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-5xl mx-auto px-6">
        <h2 className="text-2xl font-bold mb-6">Browse by Category</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              href={`/services?category=${cat.id}`}
              className="block bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition"
            >
              <h3 className="text-lg font-semibold mb-2 text-orange-600">
                {cat.name}
              </h3>
              <p className="text-gray-600">{cat.description || ""}</p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
