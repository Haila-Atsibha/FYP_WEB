"use client";

import { useEffect } from "react";

export default function Modal({ isOpen, onClose, children }) {
  useEffect(() => {
    const handler = (e) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-background/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-all duration-300">
      <div className="bg-surface border border-border rounded-3xl shadow-2xl p-8 max-w-md w-full relative active:scale-[0.99] transition-transform">
        <button
          className="absolute top-4 right-4 text-text-muted hover:text-foreground hover:bg-surface-hover w-8 h-8 flex items-center justify-center rounded-full transition-all"
          onClick={onClose}
        >
          ×
        </button>
        <div className="mt-2">
          {children}
        </div>
      </div>
    </div>
  );
}
