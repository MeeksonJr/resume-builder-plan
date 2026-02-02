"use client";

import React from "react";
import Link from "next/link";
import { FileText, Sparkles, ChevronLeft } from "lucide-react";
import { motion } from "framer-motion";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col bg-slate-950 text-slate-200 selection:bg-blue-500/30">
      {/* Background Decor */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[120px] mix-blend-screen animate-pulse" />
        <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-purple-500/10 rounded-full blur-[120px] mix-blend-screen" />
        <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:32px_32px]" />
      </div>

      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 border-b border-white/5 bg-slate-950/50 backdrop-blur-xl px-6 py-4">
        <div className="container mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 shadow-lg shadow-blue-500/20 group-hover:scale-110 transition-transform">
              <FileText className="h-5 w-5 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-bold tracking-tight text-white leading-none">ResumeBuilder</span>
              <span className="text-[10px] uppercase tracking-[0.2em] text-blue-400 font-semibold">AI Powered</span>
            </div>
          </Link>

          <Link
            href="/"
            className="text-sm font-medium text-slate-400 hover:text-white transition-colors flex items-center gap-1 group"
          >
            <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Back to Home
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex flex-1 items-center justify-center px-4 pt-24 pb-12 relative z-10">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="w-full flex justify-center"
        >
          {children}
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="py-6 text-center text-xs text-slate-500 font-medium">
        <div className="flex items-center justify-center gap-8 mb-4 opacity-50">
          <div className="flex items-center gap-1.5">
            <Sparkles className="w-3 h-3 text-blue-400" />
            <span>Secure Authentication</span>
          </div>
          <span>&bull;</span>
          <span>Privacy Guaranteed</span>
          <span>&bull;</span>
          <span>Cloud Sync</span>
        </div>
        <p>
          &copy; {new Date().getFullYear()} ResumeBuilder. Built with passion for your career.
        </p>
      </footer>
    </div>
  );
}
