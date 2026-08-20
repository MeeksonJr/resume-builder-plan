"use client";

import React from "react";
import Link from "next/link";
import { Sparkles, ChevronLeft, ShieldCheck, GraduationCap, Award } from "lucide-react";
import { motion } from "framer-motion";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col bg-slate-950 text-slate-200 selection:bg-indigo-500/30 selection:text-white">
      {/* Soft Ambient Background */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[700px] h-[500px] bg-gradient-to-b from-indigo-600/15 via-violet-600/10 to-transparent rounded-full blur-3xl opacity-70" />
        <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-emerald-500/5 rounded-full blur-3xl" />
      </div>

      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 border-b border-white/5 bg-slate-950/60 backdrop-blur-xl px-6 py-4">
        <div className="container mx-auto max-w-5xl flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 group cursor-pointer">
            <div className="flex items-center justify-center h-8 w-8 rounded-xl bg-gradient-to-br from-indigo-500 via-indigo-600 to-violet-600 text-white shadow-md shadow-indigo-500/25 group-hover:scale-105 transition-transform">
              <span className="font-extrabold text-sm tracking-tighter">G</span>
              <span className="text-[10px] text-amber-300 ml-0.5 -mt-1.5">✦</span>
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-lg font-extrabold tracking-tight text-white lowercase">grantly</span>
              <span className="text-[10px] font-mono uppercase tracking-widest text-indigo-400 font-bold px-1.5 py-0.2 bg-indigo-500/10 rounded-full border border-indigo-500/20">ai</span>
            </div>
          </Link>

          <Link
            href="/"
            className="text-xs sm:text-sm font-medium text-slate-400 hover:text-white transition-colors flex items-center gap-1 group cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Back to Home
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex flex-1 items-center justify-center px-4 pt-28 pb-16 relative z-10">
        <motion.div
          initial={{ opacity: 0, scale: 0.97, y: 8 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.35, ease: "easeOut" }}
          className="w-full flex justify-center max-w-md"
        >
          {children}
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="py-6 text-center text-xs text-slate-500 font-medium border-t border-white/5">
        <div className="container mx-auto px-4 max-w-md flex flex-wrap items-center justify-center gap-4 text-[11px] text-slate-400">
          <div className="flex items-center gap-1 text-emerald-400">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>100% Free for Students</span>
          </div>
          <span>•</span>
          <div className="flex items-center gap-1 text-amber-300">
            <Award className="w-3.5 h-3.5" />
            <span>$18.4M+ Matched</span>
          </div>
          <span>•</span>
          <div className="flex items-center gap-1 text-indigo-400">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Verified Grants & Aid</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
