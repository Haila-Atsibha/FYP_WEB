"use client";

import Link from "next/link";

export default function Hero() {
  return (
    <section className="bg-orange-50 py-20">
      <div className="max-w-5xl mx-auto text-center px-6">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-800">
          Find Trusted Services Near You
        </h1>
        <p className="mt-4 text-gray-600 text-lg">
          Browse, book and review professionals in your area with confidence.
        </p>
        <div className="mt-8 flex justify-center space-x-4">
          <Link href="/services" className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-xl shadow-md">
            Browse Services
          </Link>
          <Link href="/auth/register" className="bg-white border border-orange-500 text-orange-500 px-6 py-3 rounded-xl shadow-md hover:bg-orange-50">
            Become a Provider
          </Link>
        </div>
      </div>
    </section>
  );
}
