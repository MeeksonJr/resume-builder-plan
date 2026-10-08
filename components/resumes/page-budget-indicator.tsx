"use client";

import * as React from "react";
import { AlertCircle, CheckCircle2, Sliders, Scissors, FileText } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface PageBudgetIndicatorProps {
  estimatedHeightPercent: number; // 0 - 200% (100% = exactly 1 page)
  targetPages?: number; // 1 or 2
  onAutoFitSpacing?: () => void;
}

export function PageBudgetIndicator({
  estimatedHeightPercent = 94,
  targetPages = 1,
  onAutoFitSpacing,
}: PageBudgetIndicatorProps) {
  const isOverflow = estimatedHeightPercent > targetPages * 100;
  const isDangerouslyClose = estimatedHeightPercent > 92 && estimatedHeightPercent <= 100;
  const isOrphanPage = estimatedHeightPercent > 100 && estimatedHeightPercent < 118;

  return (
    <div className="rounded-xl border border-border/80 bg-card p-3 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
      <div className="flex items-center gap-2.5">
        <div className={`h-8 w-8 rounded-lg flex items-center justify-center font-bold shrink-0 ${
          isOverflow 
            ? "bg-amber-500/10 text-amber-600 dark:text-amber-400"
            : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
        }`}>
          <FileText className="h-4 w-4" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="font-bold text-foreground">
              {targetPages}-Page Budget
            </span>
            <Badge className={`text-[10px] font-mono font-bold ${
              isOverflow 
                ? "bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/30"
                : "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/30"
            }`}>
              {estimatedHeightPercent}% Fill
            </Badge>
          </div>
          <p className="text-[11px] text-muted-foreground mt-0.5">
            {isOrphanPage
              ? "Warning: ~3-4 orphaned lines will spill over into Page 2."
              : isOverflow
                ? `Currently occupying ${Math.ceil(estimatedHeightPercent / 100)} physical pages.`
                : isDangerouslyClose
                  ? "Perfect 1-page fit (approaching max vertical limit)."
                  : "Generous whitespace margin remaining."}
          </p>
        </div>
      </div>

      {isOverflow && (
        <Button
          size="sm"
          onClick={onAutoFitSpacing}
          className="h-8 text-xs font-bold bg-[#102b2b] text-[#d8f36b] hover:bg-[#164743] rounded-xl gap-1.5 self-start sm:self-auto cursor-pointer shadow-xs"
        >
          <Scissors className="h-3 w-3" />
          <span>Auto-Fit 1 Page</span>
        </Button>
      )}
    </div>
  );
}
