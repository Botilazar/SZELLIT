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
            next
                ? document.documentElement.classList.add("dark")
                : document.documentElement.classList.remove("dark");
            localStorage.setItem("theme", next ? "dark" : "light");
            return next;
        });
    }, []);

    // Immediately apply dark class on mount
    useEffect(() => {
        const html = document.documentElement;
        html.classList.toggle("dark", isDarkMode);
    }, [isDarkMode]);

    return { isDarkMode, toggleDarkMode };
}
