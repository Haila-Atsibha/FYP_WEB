"use client";

import Link from "next/link";

export default function Hero() {
  return (
    <section className="bg-surface py-24 transition-colors duration-300">
      <div className="max-w-5xl mx-auto text-center px-6">
        <h1 className="text-4xl md:text-6xl font-bold text-foreground tracking-tight">
          Find Trusted Services <span className="text-primary">Near You</span>
        </h1>
        <p className="mt-6 text-text-muted text-lg md:text-xl max-w-2xl mx-auto">
          Browse, book and review professionals in your area with confidence. Reliable help is just a click away.
        </p>
        <div className="mt-10 flex flex-col sm:flex-row justify-center items-center space-y-4 sm:space-y-0 sm:space-x-4">
          <Link href="/services" className="w-full sm:w-auto bg-primary hover:bg-primary-hover text-white px-8 py-4 rounded-full shadow-lg hover:shadow-primary/20 transition-all font-semibold active:scale-95 text-center">
            Browse Services
          </Link>
          <Link href="/auth/register" className="w-full sm:w-auto bg-surface border-2 border-primary text-primary px-8 py-4 rounded-full shadow-md hover:bg-primary/5 transition-all font-semibold active:scale-95 text-center">
            Become a Provider
          </Link>
        </div>
      </div>
    </section>
  );
}
