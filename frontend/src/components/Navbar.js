"use client";

import Link from "next/link";
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";

export default function Navbar() {
  const { user, logout } = useContext(AuthContext);

  return (
    <nav className="bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
        <Link href="/" className="text-2xl font-bold text-orange-600">
          ServiceMarket
        </Link>
        <div className="flex items-center space-x-4">
          <Link href="/services" className="text-gray-700 hover:text-orange-600">
            Services
          </Link>
          {!user && (
            <>
              <Link href="/auth/login" className="text-gray-700 hover:text-orange-600">
                Login
              </Link>
              <Link href="/auth/register" className="text-gray-700 hover:text-orange-600">
                Register
              </Link>
            </>
          )}
          {user && (
            <>
              <span className="text-gray-700">Hello, {user.name}</span>
              <button
                onClick={logout}
                className="bg-orange-500 text-white px-3 py-1 rounded-xl hover:bg-orange-600"
              >
                Logout
              </button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
