"use client";

import { useContext, useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";
import { ThemeContext } from "../context/ThemeContext";

export default function ThemeToggle({ className = "" }) {
  const { theme, toggleTheme } = useContext(ThemeContext);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const isLight = theme === "light";

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className={`flex items-center justify-center w-9 h-9 rounded-full border border-border bg-surface/80 text-foreground hover:bg-surface-hover transition-colors ${className}`}
      title={isLight ? "Switch to dark mode" : "Switch to light mode"}
      aria-label={isLight ? "Switch to dark mode" : "Switch to light mode"}
      suppressHydrationWarning
    >
      {!mounted ? <Sun size={18} /> : isLight ? <Moon size={18} /> : <Sun size={18} />}
    </button>
  );
}
