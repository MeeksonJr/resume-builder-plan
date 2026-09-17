"use client";

import React, { useState, useMemo } from "react";
import {
  simulateCompensationOffer,
  VestingScheduleType,
  CompensationBenchmarkBand,
  BENCHMARK_LEVEL_BANDS,
} from "@/lib/compensation/equity-benchmarks";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  TrendingUp,
  DollarSign,
  Copy,
  Check,
  Sparkles,
  Sliders,
  BarChart3,
  ArrowUpRight,
  ShieldAlert,
  Calendar,
  Layers
} from "lucide-react";
import { toast } from "sonner";

interface EquityBenchmarkingSimulatorProps {
  initialRole?: string;
}

export function EquityBenchmarkingSimulator({ initialRole = "Software Engineer" }: EquityBenchmarkingSimulatorProps) {
  const [level, setLevel] = useState<CompensationBenchmarkBand["level"]>("L5 (Senior)");
  const [metro, setMetro] = useState<CompensationBenchmarkBand["metro"]>("San Francisco Bay Area");
  const [baseSalary, setBaseSalary] = useState<number>(195000);
  const [fourYearRsuGrant, setFourYearRsuGrant] = useState<number>(340000);
  const [bonusPercent, setBonusPercent] = useState<number>(15);
  const [performanceMultiplier, setPerformanceMultiplier] = useState<number>(1.0);
  const [scheduleType, setScheduleType] = useState<VestingScheduleType>("standard_quarterly");
  const [stockCagr, setStockCagr] = useState<number>(10);
  const [signingBonus, setSigningBonus] = useState<number>(25000);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const simulation = useMemo(() => {
    return simulateCompensationOffer({
      role: initialRole,
      level,
      metro,
      baseSalary,
      fourYearRsuGrant,
      annualBonusTargetPercent: bonusPercent,
      bonusPerformanceMultiplier: performanceMultiplier,
      scheduleType,
      expectedAnnualStockAppreciation: stockCagr / 100,
      signingBonusYear1: signingBonus,
    });
  }, [initialRole, level, metro, baseSalary, fourYearRsuGrant, bonusPercent, performanceMultiplier, scheduleType, stockCagr, signingBonus]);

  const handleCopyScript = (script: string, idx: number) => {
    navigator.clipboard.writeText(script);
    setCopiedIndex(idx);
    toast.success("Tactical counter-offer script copied to clipboard!");
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Overview Metric Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="rounded-2xl border-border/80 bg-card p-5 space-y-1 shadow-sm">
          <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground flex items-center justify-between">
            <span>Year 1 Total Comp</span>
            <DollarSign className="w-4 h-4 text-emerald-600" />
          </span>
          <div className="text-2xl font-black text-foreground">
            ${simulation.calculatedYear1TotalComp.toLocaleString()}
          </div>
          <p className="text-[11px] text-muted-foreground">Base + Bonus + Y1 Vested Equity</p>
        </Card>

        <Card className="rounded-2xl border-border/80 bg-card p-5 space-y-1 shadow-sm">
          <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground flex items-center justify-between">
            <span>Market Standing</span>
            <TrendingUp className="w-4 h-4 text-sky-600" />
          </span>
          <div className="text-xl font-black text-emerald-600">
            {simulation.percentileStanding}
          </div>
          <p className="text-[11px] text-muted-foreground">Levels.fyi calibrated benchmark</p>
        </Card>

        <Card className="rounded-2xl border-border/80 bg-card p-5 space-y-1 shadow-sm">
          <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground flex items-center justify-between">
            <span>75th Percentile Gap</span>
            <ArrowUpRight className="w-4 h-4 text-amber-600" />
          </span>
          <div className="text-2xl font-black text-amber-600">
            ${simulation.marketGapAmount.toLocaleString()}
          </div>
          <p className="text-[11px] text-muted-foreground">Recommended negotiation headroom</p>
        </Card>

        <Card className="rounded-2xl border-border/80 bg-card p-5 space-y-1 shadow-sm">
          <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground flex items-center justify-between">
            <span>4-Yr Projected Value</span>
            <Layers className="w-4 h-4 text-purple-600" />
          </span>
          <div className="text-2xl font-black text-foreground">
            ${(simulation.calculatedYear4TotalComp * 4).toLocaleString()}
          </div>
          <p className="text-[11px] text-muted-foreground">Compounding at {stockCagr}% CAGR</p>
        </Card>
      </div>

      {/* Inputs & Vesting Schedule Settings */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <Card className="lg:col-span-5 rounded-2xl border-border/80 bg-card p-6 space-y-5 shadow-sm">
          <div>
            <h3 className="text-base font-bold text-foreground flex items-center gap-2">
              <Sliders className="w-4 h-4 text-emerald-600" />
              Compensation Parameters
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Tune your leveling, geography, and equity parameters.
            </p>
          </div>

          <div className="space-y-3.5 text-xs">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Engineering Level</Label>
                <select
                  value={level}
                  onChange={(e) => setLevel(e.target.value as any)}
                  className="w-full h-9 px-3 rounded-xl border border-border bg-muted/40 text-xs font-medium"
                >
                  <option value="L3 (Junior)">L3 (Junior / Entry)</option>
                  <option value="L4 (Mid-Level)">L4 (Mid-Level)</option>
                  <option value="L5 (Senior)">L5 (Senior Engineer)</option>
                  <option value="L6 (Staff / Principal)">L6 (Staff / Principal)</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Market Metro</Label>
                <select
                  value={metro}
                  onChange={(e) => setMetro(e.target.value as any)}
                  className="w-full h-9 px-3 rounded-xl border border-border bg-muted/40 text-xs font-medium"
                >
                  <option value="San Francisco Bay Area">SF Bay Area</option>
                  <option value="New York City">New York City</option>
                  <option value="Seattle">Seattle, WA</option>
                  <option value="Austin / Remote">Austin / Remote</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Base Salary ($)</Label>
                <Input
                  type="number"
                  value={baseSalary}
                  onChange={(e) => setBaseSalary(Number(e.target.value))}
                  className="h-9 rounded-xl text-xs"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">4-Year RSU Grant ($)</Label>
                <Input
                  type="number"
                  value={fourYearRsuGrant}
                  onChange={(e) => setFourYearRsuGrant(Number(e.target.value))}
                  className="h-9 rounded-xl text-xs"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Vesting Schedule Model</Label>
              <select
                value={scheduleType}
                onChange={(e) => setScheduleType(e.target.value as any)}
                className="w-full h-9 px-3 rounded-xl border border-border bg-muted/40 text-xs font-medium"
              >
                <option value="standard_quarterly">Standard Quarterly (25/25/25/25 with 1-Yr Cliff)</option>
                <option value="amazon_backloaded">Amazon-Style Backloaded (5/15/40/40)</option>
                <option value="meta_frontloaded">Meta/Google Frontloaded (33/33/22/12)</option>
                <option value="uniform_monthly">Uniform Monthly (1/48th per month, No Cliff)</option>
              </select>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div className="space-y-1.5">
                <Label className="text-[11px] font-semibold">Annual Bonus %</Label>
                <Input
                  type="number"
                  value={bonusPercent}
                  onChange={(e) => setBonusPercent(Number(e.target.value))}
                  className="h-8 rounded-xl text-xs"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-[11px] font-semibold">Performance Mult.</Label>
                <select
                  value={performanceMultiplier}
                  onChange={(e) => setPerformanceMultiplier(Number(e.target.value))}
                  className="w-full h-8 px-2 rounded-xl border border-border bg-muted/40 text-xs"
                >
                  <option value={0.8}>0.8x (Conservative)</option>
                  <option value={1.0}>1.0x (Target)</option>
                  <option value={1.25}>1.25x (Strong)</option>
                  <option value={1.5}>1.5x (Exceptional)</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-[11px] font-semibold">Stock CAGR %</Label>
                <Input
                  type="number"
                  value={stockCagr}
                  onChange={(e) => setStockCagr(Number(e.target.value))}
                  className="h-8 rounded-xl text-xs"
                />
              </div>
            </div>
          </div>
        </Card>

        {/* Levels.fyi-style RSU Vesting Curve Visualizer */}
        <Card className="lg:col-span-7 rounded-2xl border-border/80 bg-card p-6 space-y-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-emerald-600" />
                RSU Cumulative Vesting Trajectory
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                Calculated over 48 months with compounding valuation
              </p>
            </div>
            <Badge variant="outline" className="text-xs font-mono capitalize border-emerald-500/30 text-emerald-600">
              {scheduleType.replace("_", " ")}
            </Badge>
          </div>

          {/* Graphical milestone cards */}
          <div className="grid grid-cols-4 gap-2 pt-2">
            {[1, 2, 3, 4].map((year) => {
              const pt = simulation.equityVestingCurve.find((p) => p.month === year * 12);
              return (
                <div
                  key={year}
                  className="p-3 rounded-xl border border-border/80 bg-muted/20 text-center space-y-1"
                >
                  <span className="text-[10px] font-mono uppercase text-muted-foreground">Year {year}</span>
                  <div className="text-sm font-bold text-foreground">
                    ${pt?.vestedValueCumulative.toLocaleString() || "0"}
                  </div>
                  <span className="text-[10px] font-semibold text-emerald-600">
                    {pt?.vestedPercentCumulative || 0}% Vested
                  </span>
                </div>
              );
            })}
          </div>

          {/* Detailed milestone table */}
          <div className="border border-border/70 rounded-xl overflow-hidden text-xs">
            <table className="w-full text-left">
              <thead className="bg-muted/50 text-muted-foreground font-semibold uppercase text-[10px] tracking-wider border-b border-border/70">
                <tr>
                  <th className="p-2.5">Timeline</th>
                  <th className="p-2.5">Cliff Event</th>
                  <th className="p-2.5 text-right">Cumulative Value</th>
                  <th className="p-2.5 text-right">Vested %</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50 font-mono">
                {simulation.equityVestingCurve.filter((p) => p.month % 12 === 0 || p.isCliffEvent).map((p) => (
                  <tr key={p.month} className="hover:bg-muted/30">
                    <td className="p-2.5 font-sans font-medium">Month {p.month} (Year {p.yearNumber})</td>
                    <td className="p-2.5">
                      {p.isCliffEvent ? (
                        <span className="inline-flex items-center gap-1 text-amber-600 font-bold text-[10px]">
                          <ShieldAlert className="w-3 h-3" /> 1-Yr Cliff Vest
                        </span>
                      ) : (
                        <span className="text-muted-foreground text-[10px]">Standard Vest</span>
                      )}
                    </td>
                    <td className="p-2.5 text-right font-bold text-foreground">
                      ${p.vestedValueCumulative.toLocaleString()}
                    </td>
                    <td className="p-2.5 text-right text-emerald-600 font-semibold">
                      {p.vestedPercentCumulative}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      {/* Tactical Counter-Offer Script Generator */}
      <Card className="rounded-2xl border-border/80 bg-card p-6 space-y-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/70 pb-4">
          <div>
            <h3 className="text-base font-bold text-foreground flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-600" />
              Tailored Counter-Offer Scripts & Levers
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Empirically grounded responses calibrated to close the ${simulation.marketGapAmount.toLocaleString()} delta.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">Target Ask:</span>
            <Badge className="bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30 text-xs font-mono font-bold">
              Base ${simulation.recommendedCounterAsk.baseSalaryAsk.toLocaleString()} / RSU ${simulation.recommendedCounterAsk.rsuGrantAsk.toLocaleString()}
            </Badge>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {simulation.tailoredScripts.map((item, idx) => (
            <div
              key={idx}
              className="p-5 rounded-2xl border border-border/80 bg-muted/20 flex flex-col justify-between space-y-4"
            >
              <div className="space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <h4 className="text-xs font-bold text-foreground leading-snug">{item.title}</h4>
                </div>
                <p className="text-[11px] text-muted-foreground leading-relaxed">{item.scenario}</p>
                <div className="p-3 rounded-xl bg-card border border-border/60 text-xs text-foreground/90 font-mono leading-relaxed max-h-48 overflow-y-auto">
                  &ldquo;{item.script}&rdquo;
                </div>
              </div>

              <div className="space-y-3 pt-2 border-t border-border/60">
                <div className="flex flex-wrap gap-1">
                  {item.keyLevers.map((lever, li) => (
                    <span
                      key={li}
                      className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20"
                    >
                      {lever}
                    </span>
                  ))}
                </div>

                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleCopyScript(item.script, idx)}
                  className="w-full text-xs h-8 rounded-xl font-semibold gap-1.5"
                >
                  {copiedIndex === idx ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Copied to Clipboard</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy Counter Script</span>
                    </>
                  )}
                </Button>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
