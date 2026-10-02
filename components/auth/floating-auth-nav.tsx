"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ChevronLeft, Sparkles, GraduationCap } from "lucide-react";

export function FloatingAuthNav() {
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
        className="relative flex items-center justify-between rounded-full border border-emerald-500/30 bg-[#071d1a]/90 px-4 sm:px-6 py-2.5 sm:py-3 shadow-[0_16px_40px_rgba(0,0,0,0.8),inset_0_1px_2px_rgba(255,255,255,0.2)] backdrop-blur-2xl"
      >
        {/* Subtle liquid shimmer along border */}
        <div className="pointer-events-none absolute inset-0 -z-10 rounded-full bg-gradient-to-r from-emerald-500/25 via-[#d8f36b]/20 to-teal-400/25 blur-sm" />

        {/* Left: Brand Logo & Status */}
        <Link href="/" className="group flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full border border-teal-400/60 bg-gradient-to-br from-emerald-600 via-teal-700 to-emerald-950 shadow-[0_0_18px_rgba(13,130,116,0.6)] transition-transform duration-300 group-hover:scale-105 group-hover:rotate-[-6deg]">
            <span className="font-sans text-base font-black tracking-tight text-[#d8f36b]">RF</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-base sm:text-lg font-black tracking-tight text-white drop-shadow">
              ResumeForge<span className="text-[#d8f36b]">.</span>
            </span>
            <div className="hidden items-center gap-1.5 rounded-full border border-emerald-400/40 bg-emerald-950/80 px-2.5 py-0.5 text-[11px] font-bold text-emerald-200 sm:flex">
              <span className="h-2 w-2 rounded-full bg-[#d8f36b] animate-ping" />
              <span>Campus Network</span>
            </div>
          </div>
        </Link>

        {/* Right: High-Contrast Navigation Pill */}
        <div className="flex items-center gap-2">
          <Link
            href="/"
            className="group flex items-center gap-1.5 rounded-full border border-emerald-400/40 bg-emerald-950/80 px-4 py-2 text-xs font-black text-white shadow-md transition-all duration-200 hover:border-[#d8f36b] hover:bg-[#d8f36b] hover:text-[#051412] hover:shadow-[0_0_18px_rgba(216,243,107,0.5)]"
          >
            <ChevronLeft className="h-4 w-4 text-emerald-300 transition-transform group-hover:-translate-x-1 group-hover:text-[#051412]" />
            <span className="text-white group-hover:text-[#051412]">Back to Home</span>
          </Link>
        </div>
      </motion.div>
    </motion.header>
  );
}
