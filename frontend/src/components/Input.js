"use client";

export default function Input({ label, type = "text", ...rest }) {
  return (
    <div className="mb-4">
      {label && <label className="block mb-1 font-medium">{label}</label>}
      <input
        type={type}
        className="w-full border border-gray-300 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-300"
        {...rest}
      />
    </div>
  );
}
