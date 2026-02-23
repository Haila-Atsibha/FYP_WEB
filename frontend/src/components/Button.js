"use client";

export default function Button({ children, className = "", ...props }) {
  return (
    <button
      className={`bg-primary hover:bg-primary-hover text-white font-bold py-3 px-6 rounded-2xl shadow-md hover:shadow-lg transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
