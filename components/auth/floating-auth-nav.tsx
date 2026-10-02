"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ChevronLeft, Sun, Moon } from "lucide-react";
import { useTheme } from "next-themes";

export function FloatingAuthNav() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const isDark = mounted ? (resolvedTheme === "dark" || theme === "dark") : true;

  const toggleTheme = () => {
    setTheme(isDark ? "light" : "dark");
  };

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="fixed top-4 sm:top-6 inset-x-0 z-50 mx-auto w-[94%] max-w-5xl"
    >
      <motion.div
        animate={{ y: [-1.5, 1.5, -1.5] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
        className="relative flex items-center justify-between rounded-full border border-emerald-600/30 dark:border-emerald-500/30 bg-white/90 dark:bg-[#071d1a]/90 px-4 sm:px-6 py-2.5 sm:py-3 shadow-[0_16px_40px_rgba(5,20,18,0.08),inset_0_1px_2px_rgba(255,255,255,0.9)] dark:shadow-[0_16px_40px_rgba(0,0,0,0.8),inset_0_1px_2px_rgba(255,255,255,0.2)] backdrop-blur-2xl transition-colors duration-300"
      >
        {/* Subtle liquid shimmer along border */}
        <div className="pointer-events-none absolute inset-0 -z-10 rounded-full bg-gradient-to-r from-emerald-500/25 via-[#d8f36b]/20 to-teal-400/25 blur-sm" />

        {/* Left: Brand Logo & Status */}
        <Link href="/" className="group flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full border border-teal-500/60 dark:border-teal-400/60 bg-gradient-to-br from-emerald-600 via-teal-700 to-emerald-950 shadow-[0_0_18px_rgba(13,130,116,0.5)] transition-transform duration-300 group-hover:scale-105 group-hover:rotate-[-6deg]">
            <span className="font-sans text-base font-black tracking-tight text-[#d8f36b]">RF</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-base sm:text-lg font-black tracking-tight text-emerald-950 dark:text-white drop-shadow-sm transition-colors duration-300">
              ResumeForge<span className="text-[#0d8274] dark:text-[#d8f36b]">.</span>
            </span>
            <div className="hidden items-center gap-1.5 rounded-full border border-emerald-600/30 dark:border-emerald-400/40 bg-emerald-50 dark:bg-emerald-950/80 px-2.5 py-0.5 text-[11px] font-bold text-emerald-800 dark:text-emerald-200 sm:flex transition-colors duration-300">
              <span className="h-2 w-2 rounded-full bg-[#0d8274] dark:bg-[#d8f36b] animate-ping" />
              <span>Campus Network</span>
            </div>
          </div>
        </Link>

        {/* Right: Theme Toggle & Navigation Pill */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Light / Dark Mode Island Toggle */}
          <button
            type="button"
            onClick={toggleTheme}
            aria-label="Toggle Light/Dark Theme"
            className="group flex items-center gap-2 rounded-full border border-emerald-600/30 dark:border-emerald-500/40 bg-emerald-50/90 dark:bg-emerald-950/80 px-3 py-1.5 sm:px-3.5 sm:py-2 text-xs font-black text-emerald-950 dark:text-white shadow-sm transition-all duration-300 hover:scale-105 hover:border-emerald-700 dark:hover:border-[#d8f36b] active:scale-95"
            title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
          >
            <motion.div
              key={isDark ? "dark" : "light"}
              initial={{ rotate: -90, scale: 0.6, opacity: 0 }}
              animate={{ rotate: 0, scale: 1, opacity: 1 }}
              transition={{ duration: 0.25 }}
              className="flex items-center justify-center"
            >
              {isDark ? (
                <Sun className="h-4 w-4 text-[#d8f36b] drop-shadow-[0_0_8px_rgba(216,243,107,0.7)]" />
              ) : (
                <Moon className="h-4 w-4 text-emerald-800" />
              )}
            </motion.div>
            <span className="hidden sm:inline text-[11px] font-bold tracking-tight">
              {isDark ? "Light" : "Dark"}
            </span>
          </button>

          {/* High-Contrast Navigation Pill */}
          <Link
            href="/"
            className="group flex items-center gap-1.5 rounded-full border border-emerald-600/30 dark:border-emerald-400/40 bg-emerald-50 dark:bg-emerald-950/80 px-3.5 sm:px-4 py-1.5 sm:py-2 text-xs font-black text-emerald-950 dark:text-white shadow-sm transition-all duration-200 hover:border-[#0d8274] hover:bg-[#0d8274] hover:text-white dark:hover:border-[#d8f36b] dark:hover:bg-[#d8f36b] dark:hover:text-[#051412] dark:hover:shadow-[0_0_18px_rgba(216,243,107,0.5)]"
          >
            <ChevronLeft className="h-4 w-4 text-emerald-700 dark:text-emerald-300 transition-transform group-hover:-translate-x-1 group-hover:text-white dark:group-hover:text-[#051412]" />
            <span className="hidden sm:inline">Back to Home</span>
            <span className="sm:hidden">Home</span>
          </Link>
        </div>
      </motion.div>
    </motion.header>
  );
}
