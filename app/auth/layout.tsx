"use client";

import React, { useEffect } from "react";
import { FloatingAuthNav } from "@/components/auth/floating-auth-nav";
import { AuthShowcasePanel } from "@/components/auth/auth-showcase-panel";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Ensure dark mode styles are active for the auth experience
  useEffect(() => {
    const root = document.documentElement;
    const previousTheme = root.className;
    root.classList.add("dark");

    return () => {
      // Revert if needed
      if (!previousTheme.includes("dark")) {
        root.classList.remove("dark");
      }
    };
  }, []);

  return (
    <div 
      className="dark relative min-h-screen w-full bg-[#030d0c] text-white selection:bg-[#d8f36b] selection:text-[#051110]"
      style={{
        colorScheme: "dark",
        // Force high-contrast variables for all inherited typography
        color: "#ffffff",
      }}
    >
      
      {/* Background Ambient Glows & Caustic Currents */}
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -left-32 -top-20 h-[640px] w-[640px] rounded-full bg-emerald-600/20 blur-[140px]" />
        <div className="absolute right-0 top-1/4 h-[560px] w-[560px] rounded-full bg-[#d8f36b]/12 blur-[150px]" />
        <div className="absolute bottom-0 left-1/3 h-[520px] w-[520px] rounded-full bg-teal-800/25 blur-[130px]" />
      </div>

      {/* Liquid Floating Island Navbar */}
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
