import { useState, useEffect, useCallback } from "react";

export default function useDarkMode() {
    const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
        const saved = localStorage.getItem("theme");
        if (saved) return saved === "dark";
        return window.matchMedia("(prefers-color-scheme: dark)").matches;
    });

    const toggleDarkMode = useCallback(() => {
        setIsDarkMode((prev) => {
            const next = !prev;
            const html = document.documentElement;
            if (next) {
                html.classList.add("dark");
                localStorage.setItem("theme", "dark");
                localStorage.setItem("isDarkMode", "true");
                localStorage.setItem("dark-mode", "true");
            } else {
                html.classList.remove("dark");
                localStorage.setItem("theme", "light");
                localStorage.setItem("isDarkMode", "false");
                localStorage.setItem("dark-mode", "false");
            }
            return next;
        });
    }, []);

    // Sync html class when mounting and when state changes
    useEffect(() => {
        const html = document.documentElement;
        html.classList.toggle("dark", isDarkMode);
    }, [isDarkMode]);

    return { isDarkMode, toggleDarkMode };
}
