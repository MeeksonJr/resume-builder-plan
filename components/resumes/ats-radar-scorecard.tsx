"use client";

import * as React from "react";
import { 
  ShieldCheck, 
  Sparkles, 
  AlertCircle, 
  CheckCircle2, 
  ArrowRight, 
  BarChart3,
  Layers,
  Award
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export interface AtsScorecardMetrics {
  overallScore: number; // 0-100
  categories: {
    skillsMatch: number;
    metricDensity: number;
    actionVerbStrength: number;
    structuralHygiene: number;
    educationRelevance: number;
  };
  matchedKeywords: string[];
  missingKeywords: string[];
  formatIssues: string[];
}

interface AtsRadarScorecardProps {
  metrics?: AtsScorecardMetrics;
  onInjectKeyword?: (keyword: string) => void;
}

export function AtsRadarScorecard({
  metrics = {
    overallScore: 88,
    categories: {
      skillsMatch: 92,
      metricDensity: 84,
      actionVerbStrength: 86,
      structuralHygiene: 98,
      educationRelevance: 94,
    },
    matchedKeywords: ["React", "TypeScript", "Next.js", "PostgreSQL", "Tailwind CSS", "REST APIs", "Git"],
    missingKeywords: ["Docker", "AWS ECS", "CI/CD GitHub Actions", "Jest / Vitest"],
    formatIssues: [],
  },
  onInjectKeyword,
}: AtsRadarScorecardProps) {
  const { overallScore, categories, matchedKeywords, missingKeywords } = metrics;

  const scoreBadgeColor =
    overallScore >= 85
      ? "text-emerald-500 bg-emerald-500/10 border-emerald-500/20"
      : overallScore >= 70
        ? "text-amber-500 bg-amber-500/10 border-amber-500/20"
        : "text-red-500 bg-red-500/10 border-red-500/20";

  const categoryList = [
    { label: "Technical Skills Alignment", score: categories.skillsMatch },
    { label: "Accomplishment Metric Density", score: categories.metricDensity },
    { label: "Action Verb Strength", score: categories.actionVerbStrength },
    { label: "ATS Structural Hygiene", score: categories.structuralHygiene },
    { label: "Academic / Education Relevance", score: categories.educationRelevance },
  ];

  return (
    <Card className="rounded-2xl border border-border/80 bg-card p-5 sm:p-6 space-y-6 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/70 pb-4">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center font-black">
            <Award className="h-6 w-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base sm:text-lg font-bold text-foreground">
                ATS Precision Scorecard
              </h3>
              <Badge className={`text-xs font-mono font-black ${scoreBadgeColor}`}>
                {overallScore}/100
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              Simulated enterprise ATS parsing against Fortune 500 employer filters.
            </p>
          </div>
        </div>

        <div className="text-xs font-mono text-muted-foreground self-start sm:self-auto">
          {overallScore >= 85 ? (
            <span className="inline-flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-bold">
              <CheckCircle2 className="h-4 w-4" /> Ready for Direct Dispatch
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 text-amber-600 dark:text-amber-400 font-bold">
              <AlertCircle className="h-4 w-4" /> Optimization Recommended
            </span>
          )}
        </div>
      </div>

      {/* Category Progress Bars */}
      <div className="space-y-3">
        {categoryList.map((c) => (
          <div key={c.label} className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="font-medium text-foreground">{c.label}</span>
              <span className="font-mono font-bold text-muted-foreground">{c.score}%</span>
            </div>
            <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
              <div 
                className={`h-full rounded-full transition-all duration-300 ${
                  c.score >= 85 ? "bg-emerald-500" : c.score >= 70 ? "bg-amber-500" : "bg-red-500"
                }`}
                style={{ width: `${c.score}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Keyword Radar Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-border/70">
        <div>
          <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block mb-2">
            Verified Keywords Detected ({matchedKeywords.length})
          </span>
          <div className="flex flex-wrap gap-1.5">
            {matchedKeywords.map((kw) => (
              <span 
                key={kw}
                className="text-xs font-mono font-medium bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20 px-2 py-0.5 rounded-md flex items-center gap-1"
              >
                <CheckCircle2 className="h-3 w-3" />
                {kw}
              </span>
            ))}
          </div>
        </div>

        <div>
          <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block mb-2">
            Target Keywords to Inject ({missingKeywords.length})
          </span>
          <div className="flex flex-wrap gap-1.5">
            {missingKeywords.map((kw) => (
              <button
                type="button"
                key={kw}
                onClick={() => onInjectKeyword?.(kw)}
                className="text-xs font-mono font-medium bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20 hover:bg-amber-500/20 px-2 py-0.5 rounded-md flex items-center gap-1 transition cursor-pointer"
                title={`Click to copy or inject ${kw}`}
              >
                <span>+ {kw}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </Card>
  );
}
