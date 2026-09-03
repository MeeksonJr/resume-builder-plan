"use client";

import React, { useMemo } from "react";
import { useResumeStore } from "@/lib/stores/resume-store";
import {
  calculateResumeStrength,
  ACTION_VERBS,
  METRIC_REGEX,
} from "@/lib/utils/resume-strength";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Target,
  Sparkles,
  Zap,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  ChevronRight,
} from "lucide-react";

interface LiveATSDockProps {
  onOpenAudit: () => void;
  onNavigateTab?: (tab: string) => void;
}

export function LiveATSDock({ onOpenAudit, onNavigateTab }: LiveATSDockProps) {
  const {
    profile,
    workExperiences,
    education,
    skills,
    projects,
    certifications,
  } = useResumeStore();

  const report = useMemo(() => {
    return calculateResumeStrength({
      profile,
      workExperiences,
      education,
      skills,
      projects,
      certifications,
    });
  }, [profile, workExperiences, education, skills, projects, certifications]);

  // Aggregate action verbs and quantifiable metrics count across descriptions
  const { actionVerbCount, metricCount } = useMemo(() => {
    let verbs = 0;
    let metrics = 0;

    const allTextBlocks = [
      profile?.summary || "",
      ...(workExperiences || []).map((w) => `${w.description || ""} ${(w.highlights || []).join(" ")}`),
      ...(projects || []).map((p) => `${p.description || ""} ${(p.technologies || []).join(" ")}`),
    ].join(" ").toLowerCase();

    // Check action verbs
    ACTION_VERBS.forEach((verb) => {
      const regex = new RegExp(`\\b${verb}\\b`, "i");
      if (regex.test(allTextBlocks)) {
        verbs++;
      }
    });

    // Check metric matches
    const metricMatches = allTextBlocks.match(new RegExp(METRIC_REGEX.source, "gi"));
    if (metricMatches) {
      metrics = metricMatches.length;
    }

    return { actionVerbCount: verbs, metricCount: metrics };
  }, [profile, workExperiences, projects]);

  const topSuggestion = useMemo(() => {
    const missing = report.checklist.find((i) => !i.passed);
    return missing || null;
  }, [report.checklist]);

  return (
    <div className="sticky bottom-0 z-20 w-full border-t border-[#102b2b]/15 bg-[#f8f4ec]/95 backdrop-blur-md px-4 py-2.5 shadow-md">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 max-w-full">
        {/* Left: Score Gauge & Tier */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={onOpenAudit}
            className="flex items-center gap-2 group text-left"
          >
            {/* Circular Gauge */}
            <div className="relative flex h-8 w-8 items-center justify-center">
              <svg className="h-8 w-8 -rotate-90" viewBox="0 0 36 36">
                <path
                  className="text-[#102b2b]/15"
                  strokeWidth="4"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path
                  className={
                    report.overallScore >= 75
                      ? "text-[#0d8274]"
                      : report.overallScore >= 50
                      ? "text-amber-500"
                      : "text-rose-500"
                  }
                  strokeDasharray={`${report.overallScore}, 100`}
                  strokeWidth="4"
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>
              <span className="absolute font-mono text-[10px] font-black text-[#102b2b]">
                {report.overallScore}%
              </span>
            </div>

            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-[11px] font-black uppercase tracking-wider text-[#102b2b]">
                  Live ATS Score
                </span>
                <span
                  className={`h-1.5 w-1.5 rounded-full ${
                    report.overallScore >= 75
                      ? "bg-[#0d8274]"
                      : report.overallScore >= 50
                      ? "bg-amber-500"
                      : "bg-rose-500"
                  }`}
                />
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#52716a]">
                {report.tierLabel}
              </span>
            </div>
          </button>

          {/* Micro-Pills: Action Verbs & Metrics */}
          <div className="hidden md:flex items-center gap-1.5 pl-2 border-l border-[#102b2b]/15">
            <Badge
              variant="outline"
              className={`rounded-none text-[10px] font-mono font-bold px-2 py-0.5 ${
                actionVerbCount >= 4
                  ? "border-[#0d8274]/30 bg-[#0d8274]/10 text-[#0d8274]"
                  : "border-[#102b2b]/15 bg-white text-[#52716a]"
              }`}
            >
              {actionVerbCount >= 4 ? "✓" : "•"} {actionVerbCount} Verbs
            </Badge>

            <Badge
              variant="outline"
              className={`rounded-none text-[10px] font-mono font-bold px-2 py-0.5 ${
                metricCount >= 2
                  ? "border-[#0d8274]/30 bg-[#0d8274]/10 text-[#0d8274]"
                  : "border-amber-500/30 bg-amber-50 text-amber-700"
              }`}
            >
              {metricCount >= 2 ? "✓" : "⚠️"} {metricCount} Metrics
            </Badge>

            <Badge
              variant="outline"
              className="rounded-none text-[10px] font-mono font-bold px-2 py-0.5 border-[#102b2b]/15 bg-white text-[#52716a]"
            >
              {skills.length} Skills
            </Badge>
          </div>
        </div>

        {/* Center: Live Real-Time Dynamic Suggestion */}
        <div className="flex-1 min-w-0 px-2 text-center sm:text-left">
          {topSuggestion ? (
            <button
              type="button"
              onClick={() => {
                if (onNavigateTab) onNavigateTab(topSuggestion.targetTab);
                else onOpenAudit();
              }}
              className="group inline-flex items-center gap-1.5 text-xs text-[#102b2b] hover:text-[#0d8274] transition-colors truncate max-w-full"
            >
              <Sparkles className="h-3.5 w-3.5 text-[#0d8274] shrink-0" />
              <span className="font-bold text-[11px] text-[#0d8274] uppercase tracking-wider shrink-0">
                Boost Score:
              </span>
              <span className="truncate text-xs font-medium text-[#102b2b]/80 group-hover:underline">
                {topSuggestion.title} (+{topSuggestion.points} pts)
              </span>
              <ChevronRight className="h-3 w-3 shrink-0 text-[#102b2b]/40 group-hover:translate-x-0.5 transition-transform" />
            </button>
          ) : (
            <div className="flex items-center justify-center sm:justify-start gap-1.5 text-xs text-[#0d8274] font-bold">
              <CheckCircle2 className="h-4 w-4" />
              <span>All core ATS requirements satisfied! High callback probability.</span>
            </div>
          )}
        </div>

        {/* Right: Quick Audit Button */}
        <Button
          type="button"
          size="sm"
          onClick={onOpenAudit}
          className="h-8 shrink-0 rounded-none bg-[#102b2b] px-3.5 text-xs font-bold text-[#d8f36b] hover:bg-[#0d8274] gap-1.5 shadow-none"
        >
          <Target className="h-3.5 w-3.5" />
          Full Audit & Checklist
        </Button>
      </div>
    </div>
  );
}
