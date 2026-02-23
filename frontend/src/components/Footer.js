"use client";

export default function Footer() {
  return (
    <footer className="bg-surface border-t border-border mt-20 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-6 py-12 text-center">
        <div className="flex justify-center space-x-8 mb-6">
          <a href="/" className="text-text-muted hover:text-primary transition-colors font-medium">
            Home
          </a>
          <a href="/services" className="text-text-muted hover:text-primary transition-colors font-medium">
            Services
          </a>
          <a href="/auth/login" className="text-text-muted hover:text-primary transition-colors font-medium">
            Login
          </a>
          <a href="/auth/register" className="text-text-muted hover:text-primary transition-colors font-medium">
            Register
          </a>
        </div>
        <p className="text-text-muted text-sm">&copy; {new Date().getFullYear()} QuickServe. All rights reserved.</p>
      </div>
    </footer>
  );
}
