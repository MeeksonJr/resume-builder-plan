"use client";

import * as React from "react";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";

interface ResponsiveSliderProps {
  id?: string;
  label?: string;
  description?: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  unit?: string;
  formatValue?: (val: number) => string;
  onChange: (value: number) => void;
  className?: string;
  showTicks?: boolean;
}

export function ResponsiveSlider({
  id,
  label,
  description,
  value,
  min,
  max,
  step = 1,
  unit = "",
  formatValue,
  onChange,
  className,
  showTicks = false,
}: ResponsiveSliderProps) {
  const displayVal = formatValue ? formatValue(value) : `${value}${unit ? ` ${unit}` : ""}`;

  return (
    <div className={cn("w-full space-y-3", className)}>
      {(label || description) && (
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div>
            {label && (
              <label 
                htmlFor={id} 
                className="text-xs sm:text-sm font-bold text-foreground block"
              >
                {label}
              </label>
            )}
            {description && (
              <p className="text-[11px] text-muted-foreground mt-0.5">
                {description}
              </p>
            )}
          </div>
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-primary/10 text-primary border border-primary/20">
            {displayVal}
          </span>
        </div>
      )}

      <div className="relative py-1">
        <Slider
          id={id}
          value={[value]}
          min={min}
          max={max}
          step={step}
          onValueChange={(vals) => {
            if (vals && vals.length > 0) {
              onChange(vals[0]);
            }
          }}
          className="cursor-pointer"
        />

        {showTicks && (
          <div className="flex justify-between items-center text-[10px] font-mono text-muted-foreground pt-1.5 px-0.5">
            <span>{formatValue ? formatValue(min) : `${min}${unit}`}</span>
            <span>{formatValue ? formatValue(Math.round((min + max) / 2)) : `${Math.round((min + max) / 2)}${unit}`}</span>
            <span>{formatValue ? formatValue(max) : `${max}${unit}`}</span>
          </div>
        )}
      </div>
    </div>
  );
}
