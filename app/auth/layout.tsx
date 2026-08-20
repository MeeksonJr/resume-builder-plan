"use client";

import React from "react";
import Link from "next/link";
import { Sparkles, ChevronLeft, ShieldCheck, ArrowUpRight } from "lucide-react";
import { motion } from "framer-motion";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col bg-[#e9eee8] text-[#102b2b] selection:bg-[#d8f36b] selection:text-[#102b2b]">
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-[linear-gradient(135deg,#e9eee8_0%,#f8f4ec_55%,#dbe8df_100%)]" />
        <div className="absolute -right-40 top-20 h-[520px] w-[520px] rounded-full border border-[#0d8274]/10" />
        <div className="absolute -right-16 top-44 h-[360px] w-[360px] rounded-full border border-[#0d8274]/10" />
      </div>

      {/* Header */}
      <header className="fixed left-0 right-0 top-0 z-50 border-b border-[#102b2b]/10 bg-[#f8f4ec]/80 px-6 py-4 backdrop-blur-xl">
        <div className="container mx-auto flex max-w-6xl items-center justify-between">
          <Link href="/" className="group flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center bg-[#102b2b] text-sm font-bold text-[#d8f36b] transition-transform group-hover:-rotate-6">R</span>
            <span className="text-lg font-extrabold tracking-[-.04em]">ResumeForge<span className="text-[#0d8274]">.</span></span>
          </Link>

          <Link
            href="/"
            className="group flex items-center gap-1 text-xs font-medium text-[#52716a] transition-colors hover:text-[#102b2b] sm:text-sm"
          >
            <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Back to Home
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 flex flex-1 items-center justify-center px-4 pb-16 pt-28">
        <motion.div
          initial={{ opacity: 0, scale: 0.97, y: 8 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.35, ease: "easeOut" }}
          className="flex w-full max-w-md justify-center"
        >
          {children}
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="border-t border-[#102b2b]/10 py-6 text-center text-xs font-medium text-[#52716a]">
        <div className="container mx-auto flex max-w-3xl flex-wrap items-center justify-center gap-4 px-4 text-[11px]">
          <div className="flex items-center gap-1 text-[#0d8274]">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Your work stays yours</span>
          </div>
          <span className="text-[#9bb5aa]">/</span>
          <div className="flex items-center gap-1 text-[#0d8274]">
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span>Build, tailor, move forward</span>
          </div>
          <span className="text-[#9bb5aa]">/</span>
          <div className="flex items-center gap-1 text-[#0d8274]">
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI suggestions, human voice</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
