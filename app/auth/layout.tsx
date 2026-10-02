"use client";

import React from "react";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { AuthShowcasePanel } from "@/components/auth/auth-showcase-panel";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative min-h-screen w-full bg-[#061010] text-[#f8faf8] selection:bg-[#d8f36b] selection:text-[#081211]">
      
      {/* Background Ambient Glows */}
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -left-40 top-0 h-[600px] w-[600px] rounded-full bg-[#0d8274]/15 blur-[120px]" />
        <div className="absolute right-0 top-1/4 h-[500px] w-[500px] rounded-full bg-[#d8f36b]/8 blur-[130px]" />
        <div className="absolute bottom-0 left-1/3 h-[450px] w-[450px] rounded-full bg-[#093d36]/20 blur-[110px]" />
      </div>

      {/* Top Header Bar */}
      <header className="sticky top-0 z-50 w-full border-b border-[#163833]/80 bg-[#061010]/80 px-4 py-3.5 backdrop-blur-xl sm:px-8">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <Link href="/" className="group flex items-center gap-2.5">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#20b2aa]/40 bg-gradient-to-br from-[#0d8274] to-[#0a4840] font-bold text-[#d8f36b] shadow-sm transition-transform group-hover:-rotate-6">
              R
            </span>
            <span className="text-lg font-extrabold tracking-tight text-white">
              ResumeForge<span className="text-[#d8f36b]">.</span>
            </span>
          </Link>

          <Link
            href="/"
            className="group flex items-center gap-1.5 rounded-full border border-[#163833] bg-[#0c201e]/80 px-3.5 py-1.5 text-xs font-semibold text-[#8bbcb2] transition-all hover:border-[#d8f36b]/40 hover:bg-[#0d2a26] hover:text-[#d8f36b]"
          >
            <ChevronLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
            <span>Back to Home</span>
          </Link>
        </div>
      </header>

      {/* Main Full-Width Split Container */}
      <main className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-10">
        <div className="grid min-h-[calc(100vh-130px)] w-full grid-cols-1 items-stretch gap-8 lg:grid-cols-12 lg:gap-10">
          
          {/* Left Column: Visual Showcase (Visible on Large Screens) */}
          <div className="hidden lg:col-span-6 lg:flex xl:col-span-6">
            <AuthShowcasePanel />
          </div>

          {/* Right Column: Interactive Form Center */}
          <div className="flex w-full flex-col justify-center lg:col-span-6 xl:col-span-6">
            <div className="w-full">
              {children}
            </div>
          </div>

        </div>
      </main>

    </div>
  );
}
