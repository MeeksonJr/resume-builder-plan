"use client";

import React, { Suspense } from "react";
import { LiquidAuthCard } from "@/components/auth/liquid-auth-card";
import { Loader2 } from "lucide-react";

export default function SignUpPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[460px] items-center justify-center rounded-3xl border border-white/10 bg-[#071917]/80 text-[#b4dad1]">
          <Loader2 className="mr-2 h-6 w-6 animate-spin text-[#d8f36b]" />
          <span>Loading workspace sign up...</span>
        </div>
      }
    >
      <LiquidAuthCard initialMode="signup" />
    </Suspense>
  );
}
