"use client";

import Link from "next/link";

export default function ServiceCard({ service, user }) {
  const { title, category, price, provider, rating, id } = service;

  return (
    <div className="bg-white rounded-xl shadow-md p-4 flex flex-col justify-between">
      <div>
        <h3 className="text-lg font-semibold mb-1">{title}</h3>
        <p className="text-sm text-gray-500">{category?.name || service.category}</p>
        <p className="mt-2 font-bold">${price}</p>
      </div>
      <div className="mt-4 flex items-center justify-between">
        <span className="text-sm text-gray-600">by {provider?.name || service.provider}</span>
        <span className="text-yellow-500">{rating || "★☆☆☆☆"}</span>
      </div>
      <div className="mt-3">
        {user ? (
          <Link href={`/services/${id}`} className="block text-center bg-orange-500 hover:bg-orange-600 text-white py-2 rounded-xl">
            Book Now
          </Link>
        ) : (
          <Link href="/auth/login" className="block text-center bg-orange-500 hover:bg-orange-600 text-white py-2 rounded-xl">
            Login to Book
          </Link>
        )}
      </div>
    </div>
  );
}
