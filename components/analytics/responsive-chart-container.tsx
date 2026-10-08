"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface ResponsiveChartContainerProps {
  title?: string;
  subtitle?: string;
  badge?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  minHeight?: number;
}

export function ResponsiveChartContainer({
  title,
  subtitle,
  badge,
  action,
  children,
  className,
  minHeight = 280,
}: ResponsiveChartContainerProps) {
  return (
    <div
      className={cn(
        "w-full rounded-2xl border border-border/80 bg-card p-4 sm:p-6 shadow-xs flex flex-col justify-between overflow-hidden",
        className
      )}
    >
      {(title || subtitle || badge || action) && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <div className="flex items-center gap-2">
              {title && (
                <h3 className="text-sm sm:text-base font-bold text-foreground tracking-tight">
                  {title}
                </h3>
              )}
              {badge && (
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
                  {badge}
                </span>
              )}
            </div>
            {subtitle && (
              <p className="text-xs text-muted-foreground mt-0.5">
                {subtitle}
              </p>
            )}
          </div>
          {action && <div className="self-start sm:self-auto shrink-0">{action}</div>}
        </div>
      )}

      <div 
        className="w-full relative touch-pan-y overflow-hidden" 
        style={{ minHeight: `${minHeight}px` }}
      >
        {children}
      </div>
    </div>
  );
}
