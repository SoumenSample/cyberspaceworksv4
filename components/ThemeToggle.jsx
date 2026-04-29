"use client";

import { useEffect, useState } from "react";
import { FaMoon, FaSun } from "react-icons/fa";

const THEME_KEY = "theme";

function getSystemTheme() {
  if (typeof window === "undefined") return "light";
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

function applyTheme(theme) {
  if (typeof document === "undefined") return;
  document.documentElement.classList.toggle("dark", theme === "dark");
}

export default function ThemeToggle() {
  const [theme, setTheme] = useState("light");

  useEffect(() => {
    const storedTheme =
      typeof window !== "undefined" ? localStorage.getItem(THEME_KEY) : null;
    const initialTheme = storedTheme || getSystemTheme();

    setTheme(initialTheme);
    applyTheme(initialTheme);

    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = (event) => {
      if (localStorage.getItem(THEME_KEY)) return;
      const nextTheme = event.matches ? "dark" : "light";
      setTheme(nextTheme);
      applyTheme(nextTheme);
    };

    if (media.addEventListener) {
      media.addEventListener("change", handleChange);
    } else {
      media.addListener(handleChange);
    }

    return () => {
      if (media.removeEventListener) {
        media.removeEventListener("change", handleChange);
      } else {
        media.removeListener(handleChange);
      }
    };
  }, []);

  const isDark = theme === "dark";

  const handleToggle = () => {
    const nextTheme = isDark ? "light" : "dark";
    setTheme(nextTheme);
    localStorage.setItem(THEME_KEY, nextTheme);
    applyTheme(nextTheme);
  };

  return (
    <button
      type="button"
      onClick={handleToggle}
      className="relative inline-flex h-10 w-[64px] items-center rounded-full bg-white/80 shadow-[0_6px_18px_rgba(0,0,0,0.25)] backdrop-blur transition-colors duration-300 hover:bg-white dark:bg-black/60"
      aria-label="Toggle color theme"
      aria-pressed={isDark}
      title={isDark ? "Switch to light mode" : "Switch to dark mode"}
    >
      <span
        className={
          "absolute left-1 top-1 flex h-8 w-8 items-center justify-center rounded-full bg-white text-amber-500 shadow transition-transform duration-300 dark:bg-slate-900 dark:text-cyan-300 " +
          (isDark ? "translate-x-6" : "translate-x-0")
        }
      >
        {isDark ? <FaMoon className="text-sm" /> : <FaSun className="text-sm" />}
      </span>
      <span className="sr-only">Toggle theme</span>
    </button>
  );
}
