"use client";

import React from "react";
import Link from "next/link";
import {
  GitCompare,
  TrendingUp,
  Briefcase,
  Trophy,
  Sparkles,
  AlertCircle,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  BarChart2,
  Layers,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ABTestExperimentResult } from "@/lib/analytics/career-intelligence";

interface AbTestingScorecardProps {
  abTesting?: ABTestExperimentResult | null;
}

export function AbTestingScorecard({ abTesting }: AbTestingScorecardProps) {
  if (!abTesting || !abTesting.hasExperimentData || !abTesting.variantA) {
    return (
      <div className="border border-[#102b2b]/15 bg-white p-6 sm:p-8 shadow-[8px_10px_0_rgba(16,43,43,.08)]">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-[#0d8274]/10 text-[#0d8274] border border-[#0d8274]/20">
              <GitCompare className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-black tracking-tight text-[#102b2b]">
                  A/B Resume Split-Testing
                </h2>
                <Badge variant="outline" className="text-[10px] font-bold border-[#0d8274]/30 text-[#0d8274]">
                  Experiment Engine
                </Badge>
              </div>
              <p className="text-xs text-[#52716a] mt-0.5">
                Measure callback conversion rates between resume variants
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-col items-center justify-center py-10 px-4 text-center bg-[#fbfaf7] border border-dashed border-[#102b2b]/15">
          <Layers className="h-10 w-10 text-[#52716a]/40 mb-3" />
          <h3 className="text-sm font-black text-[#102b2b]">No Active A/B Split Tests Detected</h3>
          <p className="text-xs text-[#52716a] max-w-md mt-1 leading-relaxed">
            Assign target resumes when logging job applications in your Kanban board. Once you send applications with 2 different resume variants, ResumeForge tracks which version secures more interview callbacks.
          </p>
          <Button asChild variant="outline" size="sm" className="mt-4 rounded-none border-[#102b2b]/30 text-xs font-bold gap-2">
            <Link href="/dashboard/jobs">
              Go to Kanban Tracker <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  const { variantA, variantB, winnerVariant, winnerTitle, relativeLift, statisticalConfidence, recommendation, totalTestedApplications } = abTesting;

  return (
    <div className="border border-[#102b2b]/15 bg-white p-6 sm:p-8 shadow-[8px_10px_0_rgba(16,43,43,.08)] space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-[#0d8274]/10 text-[#0d8274] border border-[#0d8274]/20">
            <GitCompare className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-black tracking-tight text-[#102b2b]">
                A/B Resume Split-Testing &amp; Attribution
              </h2>
              <Badge variant="outline" className="text-[10px] font-bold border-[#0d8274]/30 text-[#0d8274] bg-[#0d8274]/5">
                Statistical Model
              </Badge>
            </div>
            <p className="text-xs text-[#52716a] mt-0.5">
              Live experiment tracking across {totalTestedApplications} tagged job applications
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {statisticalConfidence === "high" && (
            <Badge className="bg-emerald-600 text-white font-bold text-[10px] uppercase tracking-widest px-2.5 py-1 rounded-none gap-1">
              <ShieldCheck className="h-3 w-3" /> High Confidence
            </Badge>
          )}
          {statisticalConfidence === "directional" && (
            <Badge className="bg-amber-500 text-white font-bold text-[10px] uppercase tracking-widest px-2.5 py-1 rounded-none gap-1">
              <TrendingUp className="h-3 w-3" /> Directional Trend
            </Badge>
          )}
          {statisticalConfidence === "insufficient_data" && (
            <Badge className="bg-slate-600 text-white font-bold text-[10px] uppercase tracking-widest px-2.5 py-1 rounded-none gap-1">
              <BarChart2 className="h-3 w-3" /> Gathering Sample
            </Badge>
          )}
        </div>
      </div>

      {/* Side-by-Side Variant Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Variant A */}
        <div
          className={`p-5 border transition-all ${
            winnerVariant === "A"
              ? "border-[#0d8274] bg-[#0d8274]/5 shadow-[4px_4px_0_rgba(13,130,116,.15)]"
              : "border-[#102b2b]/15 bg-[#fbfaf7]"
          }`}
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Badge className="bg-[#102b2b] text-[#d8f36b] font-bold text-[10px] uppercase tracking-wider rounded-none">
                Variant A
              </Badge>
              {winnerVariant === "A" && (
                <Badge className="bg-[#0d8274] text-white font-bold text-[10px] gap-1 rounded-none">
                  <Trophy className="h-3 w-3" /> Winner
                </Badge>
              )}
            </div>
            <span className="text-xs font-mono font-bold text-[#52716a]">
              {variantA.applicationsCount} Applications
            </span>
          </div>

          <h3 className="font-black text-sm text-[#102b2b] truncate mb-3" title={variantA.resumeTitle}>
            {variantA.resumeTitle}
          </h3>

          <div className="space-y-3">
            <div>
              <div className="flex items-center justify-between text-xs font-bold mb-1">
                <span className="text-[#52716a]">Interview Callback Rate</span>
                <span className="text-[#102b2b] font-mono text-sm">{variantA.interviewRate}%</span>
              </div>
              <div className="h-2.5 bg-[#e5e1d8] overflow-hidden">
                <div
                  className="h-full bg-[#0d8274] transition-all duration-700"
                  style={{ width: `${Math.max(variantA.interviewRate, 4)}%` }}
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-[#102b2b]/10 text-xs">
              <span className="text-[#52716a]">Interviews Secured:</span>
              <span className="font-bold text-[#102b2b]">{variantA.interviewsCount}</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-[#52716a]">Offers Generated:</span>
              <span className="font-bold text-[#0d8274]">{variantA.offersCount}</span>
            </div>
          </div>
        </div>

        {/* Variant B */}
        {variantB ? (
          <div
            className={`p-5 border transition-all ${
              winnerVariant === "B"
                ? "border-[#0d8274] bg-[#0d8274]/5 shadow-[4px_4px_0_rgba(13,130,116,.15)]"
                : "border-[#102b2b]/15 bg-[#fbfaf7]"
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Badge className="bg-[#52716a] text-white font-bold text-[10px] uppercase tracking-wider rounded-none">
                  Variant B
                </Badge>
                {winnerVariant === "B" && (
                  <Badge className="bg-[#0d8274] text-white font-bold text-[10px] gap-1 rounded-none">
                    <Trophy className="h-3 w-3" /> Winner
                  </Badge>
                )}
              </div>
              <span className="text-xs font-mono font-bold text-[#52716a]">
                {variantB.applicationsCount} Applications
              </span>
            </div>

            <h3 className="font-black text-sm text-[#102b2b] truncate mb-3" title={variantB.resumeTitle}>
              {variantB.resumeTitle}
            </h3>

            <div className="space-y-3">
              <div>
                <div className="flex items-center justify-between text-xs font-bold mb-1">
                  <span className="text-[#52716a]">Interview Callback Rate</span>
                  <span className="text-[#102b2b] font-mono text-sm">{variantB.interviewRate}%</span>
                </div>
                <div className="h-2.5 bg-[#e5e1d8] overflow-hidden">
                  <div
                    className="h-full bg-[#52716a] transition-all duration-700"
                    style={{ width: `${Math.max(variantB.interviewRate, 4)}%` }}
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-[#102b2b]/10 text-xs">
                <span className="text-[#52716a]">Interviews Secured:</span>
                <span className="font-bold text-[#102b2b]">{variantB.interviewsCount}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-[#52716a]">Offers Generated:</span>
                <span className="font-bold text-[#0d8274]">{variantB.offersCount}</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="p-5 border border-dashed border-[#102b2b]/20 bg-[#fbfaf7] flex flex-col items-center justify-center text-center">
            <Layers className="h-8 w-8 text-[#52716a]/40 mb-2" />
            <h4 className="text-xs font-black text-[#102b2b]">Variant B Awaiting Applications</h4>
            <p className="text-[11px] text-[#52716a] mt-1 max-w-xs">
              Tag new applications with a secondary resume variant in your Kanban tracker to unlock side-by-side comparative split testing.
            </p>
          </div>
        )}
      </div>

      {/* Lift Recommendation Banner */}
      <div className="p-4 bg-[#102b2b] text-white flex items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded bg-[#d8f36b] text-[#102b2b] shrink-0 font-black text-xs">
            {relativeLift > 0 ? `+${relativeLift}%` : "0%"}
          </div>
          <div className="space-y-0.5">
            <p className="text-xs font-bold text-[#d8f36b]">A/B Intelligence Recommendation</p>
            <p className="text-xs text-white/90 leading-relaxed">{recommendation}</p>
          </div>
        </div>

        <Button asChild variant="outline" size="sm" className="rounded-none border-white/20 text-white bg-transparent hover:bg-white/10 text-xs shrink-0 font-bold">
          <Link href="/dashboard/jobs">
            Manage Applications →
          </Link>
        </Button>
      </div>
    </div>
  );
}
