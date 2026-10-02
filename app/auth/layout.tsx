"use client";

import React from "react";
import { FloatingAuthNav } from "@/components/auth/floating-auth-nav";
import { AuthShowcasePanel } from "@/components/auth/auth-showcase-panel";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative min-h-screen w-full bg-[#f4f7f6] dark:bg-[#030d0c] text-[#051a17] dark:text-white selection:bg-[#0d8274] selection:text-white dark:selection:bg-[#d8f36b] dark:selection:text-[#051110] transition-colors duration-300">
      
      {/* Background Ambient Glows & Caustic Currents */}
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -left-32 -top-20 h-[640px] w-[640px] rounded-full bg-emerald-300/35 dark:bg-emerald-600/20 blur-[140px] transition-all duration-500" />
        <div className="absolute right-0 top-1/4 h-[560px] w-[560px] rounded-full bg-[#d8f36b]/35 dark:bg-[#d8f36b]/12 blur-[150px] transition-all duration-500" />
        <div className="absolute bottom-0 left-1/3 h-[520px] w-[520px] rounded-full bg-teal-200/40 dark:bg-teal-800/25 blur-[130px] transition-all duration-500" />
      </div>

      {/* Liquid Floating Island Navbar with Theme Toggle */}
      <FloatingAuthNav />

      {/* Main Full-Width Split Container with spacing for floating nav */}
      <main className="mx-auto w-full max-w-7xl px-4 pt-24 pb-12 sm:px-6 sm:pt-28 lg:px-8">
        <div className="grid min-h-[calc(100vh-140px)] w-full grid-cols-1 items-stretch gap-8 lg:grid-cols-12 lg:gap-10">
          
          {/* Left Column: Visual Showcase (Visible on Large Screens) */}
          <div className="hidden lg:col-span-6 lg:flex xl:col-span-6">
            <AuthShowcasePanel />
          </div>

          {/* Right Column: Interactive Liquid Form Center */}
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

