"use client";

export default function Input({ label, type = "text", className = "", wrapperClassName = "", ...rest }) {
  return (
    <div className={`mb-5 ${wrapperClassName}`}>
      {label && (
        <label className="block mb-2 font-semibold text-foreground/80 text-sm ml-1">
          {label}
        </label>
      )}
      <input
        type={type}
        className={className || "w-full bg-surface border border-border text-foreground rounded-2xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all placeholder:text-text-muted/50 shadow-sm"}
        {...rest}
      />
    </div>
  );
}
