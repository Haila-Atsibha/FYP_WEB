"use client";

import React, { createContext, useState, useEffect } from "react";

export const ThemeContext = createContext({
    theme: "dark",
    toggleTheme: () => {},
});

function getStoredTheme() {
    if (typeof window === "undefined") return null;
    const stored = localStorage.getItem("app-theme");
    if (stored === "light" || stored === "dark") return stored;
    if (window.matchMedia?.("(prefers-color-scheme: light)").matches) return "light";
    return "dark";
}

function applyThemeClass(theme) {
    const root = document.documentElement;
    if (theme === "light") {
        root.classList.add("light");
        root.classList.remove("dark");
    } else {
        root.classList.add("dark");
        root.classList.remove("light");
    }
}

export const ThemeProvider = ({ children }) => {
    const [theme, setTheme] = useState(() => getStoredTheme() ?? "dark");

    useEffect(() => {
        const resolved =
            getStoredTheme() ??
            (document.documentElement.classList.contains("light") ? "light" : "dark");
        setTheme(resolved);
        applyThemeClass(resolved);
    }, []);

    useEffect(() => {
        applyThemeClass(theme);
        localStorage.setItem("app-theme", theme);
    }, [theme]);

    const toggleTheme = () => {
        setTheme((prevTheme) => (prevTheme === "light" ? "dark" : "light"));
    };

    return (
        <ThemeContext.Provider value={{ theme, toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    );
};
