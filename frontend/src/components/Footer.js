"use client";

export default function Footer() {
  return (
    <footer className="bg-white shadow-inner mt-12">
      <div className="max-w-7xl mx-auto px-6 py-8 text-center text-gray-600 text-sm">
        <div className="flex justify-center space-x-6 mb-4">
          <a href="/" className="hover:text-orange-600">
            Home
          </a>
          <a href="/services" className="hover:text-orange-600">
            Services
          </a>
          <a href="/auth/login" className="hover:text-orange-600">
            Login
          </a>
        </div>
        <p>&copy; {new Date().getFullYear()} ServiceMarket. All rights reserved.</p>
      </div>
    </footer>
  );
}
