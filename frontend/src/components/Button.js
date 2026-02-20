"use client";

export default function Button({ children, className = "", ...props }) {
  return (
    <button
      className={`bg-orange-500 hover:bg-orange-600 text-white font-semibold py-2 px-4 rounded-xl shadow-md transition ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
