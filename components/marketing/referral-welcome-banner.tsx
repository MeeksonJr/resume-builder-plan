"use client";

import React, { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Sparkles, X, ArrowRight, ShieldCheck } from "lucide-react";

export function ReferralWelcomeBanner() {
  const searchParams = useSearchParams();
  const [referralCode, setReferralCode] = useState<string | null>(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const utmSource = searchParams.get("utm_source");
    const ref = searchParams.get("ref");

    if (utmSource === "public_resume_footer" || ref) {
      const code = ref || "public_resume_referral";
      setReferralCode(code);
      if (typeof window !== "undefined") {
        localStorage.setItem("resumeforge_referral", code);
      }
    } else if (typeof window !== "undefined") {
      const saved = localStorage.getItem("resumeforge_referral");
      if (saved) {
        setReferralCode(saved);
      }
    }
  }, [searchParams]);

  if (!referralCode || dismissed) return null;

  return (
    <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 text-white px-4 py-2.5 shadow-md relative z-50">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-xs sm:text-sm">
        <div className="flex items-center gap-2 text-center sm:text-left">
          <span className="p-1 rounded-full bg-white/20">
            <Sparkles className="w-3.5 h-3.5 text-white" />
          </span>
          <span className="font-medium">
            <strong className="font-bold">Special Candidate Referral:</strong> You were invited via a verified ResumeForge resume. Your free account unlocks all 4 ATS templates and 5 instant scans!
          </span>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <Link
            href={`/auth/signup?ref=${encodeURIComponent(referralCode)}`}
            className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-white text-emerald-800 font-bold text-xs shadow hover:bg-white/90 transition-all hover:scale-105"
          >
            Claim Free Account <ArrowRight className="w-3 h-3" />
          </Link>
          <button
            onClick={() => setDismissed(true)}
            className="text-white/80 hover:text-white p-0.5"
            aria-label="Dismiss banner"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
