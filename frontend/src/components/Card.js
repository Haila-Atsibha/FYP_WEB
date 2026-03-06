"use client";

export default function Card({ children, className = "", ...props }) {
  return (
    <div
      className={`bg-surface border border-border text-foreground rounded-2xl shadow-sm hover:shadow-md transition-all p-8 ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}