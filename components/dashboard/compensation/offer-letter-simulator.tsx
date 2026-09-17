"use client";

import React, { useState, useMemo } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  TrendingUp,
  DollarSign,
  Copy,
  Check,
  Sparkles,
  PieChart,
  ShieldCheck,
  Send,
  Building2,
  Briefcase,
  Layers,
  ArrowUpRight,
} from "lucide-react";
import {
  simulateOfferCompensation,
  type OfferDetails,
  type CompanyStage,
  type EquityType,
} from "@/lib/compensation/offer-letter-simulator";
import { toast } from "sonner";

interface OfferLetterSimulatorProps {
  initialCompany?: string;
  initialRole?: string;
}

export function OfferLetterSimulator({
  initialCompany = "Anthropic",
  initialRole = "Staff ML Infrastructure Engineer",
}: OfferLetterSimulatorProps) {
  const [companyName, setCompanyName] = useState(initialCompany);
  const [roleTitle, setRoleTitle] = useState(initialRole);
  const [baseSalary, setBaseSalary] = useState(210000);
  const [signingBonus, setSigningBonus] = useState(35000);
  const [annualBonusPercent, setAnnualBonusPercent] = useState(15);
  const [equityGrantValue, setEquityGrantValue] = useState(420000); // 4-yr value
  const [equityGrantUnits, setEquityGrantUnits] = useState(4000);
  const [equityType, setEquityType] = useState<EquityType>("rsu");
  const [companyStage, setCompanyStage] = useState<CompanyStage>("late_growth");
  const [strikePrice, setStrikePrice] = useState(2.5);

  const [copiedLetter, setCopiedLetter] = useState(false);
  const [selectedTrajectory, setSelectedTrajectory] = useState<"conservative" | "target" | "bull">("target");

  const offerDetails: OfferDetails = useMemo(() => ({
    companyName,
    roleTitle,
    baseSalary,
    signingBonus,
    annualBonusPercent,
    equityType,
    equityGrantUnits,
    equityGrantValue,
    vestingScheduleYears: 4,
    cliffMonths: 12,
    companyStage,
    strikePrice: equityType !== "rsu" ? strikePrice : undefined,
  }), [
    companyName,
    roleTitle,
    baseSalary,
    signingBonus,
    annualBonusPercent,
    equityType,
    equityGrantUnits,
    equityGrantValue,
    companyStage,
    strikePrice,
  ]);

  const analysis = useMemo(() => {
    return simulateOfferCompensation(offerDetails);
  }, [offerDetails]);

  const handleCopyScript = async () => {
    try {
      await navigator.clipboard.writeText(analysis.aiCounterOfferScript);
      setCopiedLetter(true);
      toast.success("AI Counter-Offer letter copied to clipboard!");
      setTimeout(() => setCopiedLetter(false), 2000);
    } catch {
      toast.error("Failed to copy letter");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-br from-[#102b2b] via-[#163a3a] to-[#102b2b] text-white border border-white/10 shadow-lg">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div className="space-y-1 max-w-2xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#d8f36b]/20 text-[#d8f36b] text-xs font-bold border border-[#d8f36b]/30">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Phase 57 • AI Offer Letter & Equity Vesting Simulator</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-heading font-black tracking-tight text-white">
              Compensation & 4-Year Equity Modeler
            </h2>
            <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed">
              Stress-test base salary vs RSUs and stock options, forecast 4-year vesting trajectories across multiple market scenarios, and synthesize customized counter-offer emails.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-white/10 border border-white/15 backdrop-blur-sm text-right shrink-0 min-w-[200px]">
            <div className="text-[11px] text-[#d8f36b] font-bold uppercase tracking-wider">
              Year 1 Target Comp
            </div>
            <div className="text-2xl sm:text-3xl font-mono font-black text-white">
              ${analysis.firstYearTotalComp.toLocaleString()}
            </div>
            <div className="text-[11px] text-white/70 mt-0.5">
              4-Yr Total: ${analysis.fourYearTotalCompTarget.toLocaleString()}
            </div>
          </div>
        </div>
      </div>

      {/* Grid: Inputs vs Simulator Dashboard */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Col: Offer Inputs (5 Cols) */}
        <div className="lg:col-span-5 space-y-4">
          <Card className="rounded-2xl border-border bg-white dark:bg-slate-950 shadow-sm">
            <CardHeader className="pb-3 border-b">
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <Building2 className="w-4 h-4 text-emerald-600" />
                Offer Parameters
              </CardTitle>
              <CardDescription className="text-xs">
                Fine-tune base salary, bonuses, and equity grants.
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-4 pt-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-[11px] font-semibold">Target Company</Label>
                  <Input
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    className="h-8 text-xs rounded-lg mt-1"
                  />
                </div>
                <div>
                  <Label className="text-[11px] font-semibold">Role Title</Label>
                  <Input
                    value={roleTitle}
                    onChange={(e) => setRoleTitle(e.target.value)}
                    className="h-8 text-xs rounded-lg mt-1"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-[11px] font-semibold">Base Salary ($/yr)</Label>
                  <Input
                    type="number"
                    step="5000"
                    value={baseSalary}
                    onChange={(e) => setBaseSalary(Number(e.target.value))}
                    className="h-8 text-xs font-mono rounded-lg mt-1"
                  />
                </div>
                <div>
                  <Label className="text-[11px] font-semibold">Sign-On Bonus ($)</Label>
                  <Input
                    type="number"
                    step="5000"
                    value={signingBonus}
                    onChange={(e) => setSigningBonus(Number(e.target.value))}
                    className="h-8 text-xs font-mono rounded-lg mt-1"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-[11px] font-semibold">Company Stage</Label>
                  <Select
                    value={companyStage}
                    onValueChange={(val: any) => setCompanyStage(val)}
                  >
                    <SelectTrigger className="h-8 text-xs rounded-lg mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="seed">Seed / Pre-Seed</SelectItem>
                      <SelectItem value="series_a">Series A</SelectItem>
                      <SelectItem value="series_b_c">Series B / C</SelectItem>
                      <SelectItem value="late_growth">Late Stage / Growth</SelectItem>
                      <SelectItem value="pre_ipo">Pre-IPO Unicorn</SelectItem>
                      <SelectItem value="public">Public Company (FAANG / Big Tech)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-[11px] font-semibold">Equity Instrument</Label>
                  <Select
                    value={equityType}
                    onValueChange={(val: any) => setEquityType(val)}
                  >
                    <SelectTrigger className="h-8 text-xs rounded-lg mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="rsu">RSUs (Restricted Stock)</SelectItem>
                      <SelectItem value="iso_options">Incentive Stock Options (ISOs)</SelectItem>
                      <SelectItem value="nso_options">Non-Qualified Options (NSOs)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-[11px] font-semibold">4-Year Equity Value ($)</Label>
                  <Input
                    type="number"
                    step="10000"
                    value={equityGrantValue}
                    onChange={(e) => setEquityGrantValue(Number(e.target.value))}
                    className="h-8 text-xs font-mono rounded-lg mt-1"
                  />
                </div>
                <div>
                  <Label className="text-[11px] font-semibold">Grant Units (Shares)</Label>
                  <Input
                    type="number"
                    step="500"
                    value={equityGrantUnits}
                    onChange={(e) => setEquityGrantUnits(Number(e.target.value))}
                    className="h-8 text-xs font-mono rounded-lg mt-1"
                  />
                </div>
              </div>

              {equityType !== "rsu" && (
                <div>
                  <Label className="text-[11px] font-semibold">Strike Price ($ per share)</Label>
                  <Input
                    type="number"
                    step="0.25"
                    value={strikePrice}
                    onChange={(e) => setStrikePrice(Number(e.target.value))}
                    className="h-8 text-xs font-mono rounded-lg mt-1"
                  />
                </div>
              )}
            </CardContent>
          </Card>

          {/* High-Leverage Counter-Offer Levers */}
          <Card className="rounded-2xl border-border bg-white dark:bg-slate-950 shadow-sm">
            <CardHeader className="pb-3 border-b">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-purple-600" />
                Strategic Negotiation Levers
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 pt-3 text-xs">
              {analysis.negotiationLevers.map((lever, i) => (
                <div
                  key={i}
                  className="p-3 rounded-xl border border-border bg-muted/30 space-y-1"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-foreground">{lever.lever}</span>
                    <Badge
                      variant="outline"
                      className={`text-[9px] uppercase font-bold ${
                        lever.impactScore === "high"
                          ? "border-emerald-500 text-emerald-600 bg-emerald-50/50"
                          : "border-blue-500 text-blue-600 bg-blue-50/50"
                      }`}
                    >
                      {lever.impactScore} impact
                    </Badge>
                  </div>
                  <p className="text-[11px] text-muted-foreground">{lever.description}</p>
                  <div className="text-[11px] font-semibold text-purple-700 dark:text-purple-300 pt-0.5">
                    → Ask: {lever.suggestedAsk}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Right Col: 4-Year Trajectory & Counter-Offer Email (7 Cols) */}
        <div className="lg:col-span-7 space-y-4">
          {/* 4-Year Vesting Trajectory Cards */}
          <Card className="rounded-2xl border-border bg-white dark:bg-slate-950 shadow-sm">
            <CardHeader className="pb-3 border-b flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-base font-bold flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-emerald-600" />
                  4-Year Vesting & Total Comp Trajectory
                </CardTitle>
                <CardDescription className="text-xs">
                  Projections based on 1-year cliff + standard 4-year schedule.
                </CardDescription>
              </div>

              {/* Trajectory Toggle */}
              <div className="flex items-center gap-1 bg-muted p-1 rounded-xl text-xs font-semibold">
                <button
                  onClick={() => setSelectedTrajectory("conservative")}
                  className={`px-2.5 py-1 rounded-lg transition-all ${
                    selectedTrajectory === "conservative"
                      ? "bg-white dark:bg-slate-900 text-foreground shadow-xs"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  5% Cons.
                </button>
                <button
                  onClick={() => setSelectedTrajectory("target")}
                  className={`px-2.5 py-1 rounded-lg transition-all ${
                    selectedTrajectory === "target"
                      ? "bg-white dark:bg-slate-900 text-emerald-600 font-bold shadow-xs"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  15% Target
                </button>
                <button
                  onClick={() => setSelectedTrajectory("bull")}
                  className={`px-2.5 py-1 rounded-lg transition-all ${
                    selectedTrajectory === "bull"
                      ? "bg-white dark:bg-slate-900 text-purple-600 font-bold shadow-xs"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  35% Bull
                </button>
              </div>
            </CardHeader>

            <CardContent className="p-4 space-y-3">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {analysis.yearlyProjections.map((proj) => {
                  const equityVal =
                    selectedTrajectory === "conservative"
                      ? proj.equityConservative
                      : selectedTrajectory === "bull"
                      ? proj.equityBull
                      : proj.equityTarget;

                  const totalVal = proj.baseEarnings + proj.bonusEarnings + equityVal;

                  return (
                    <div
                      key={proj.year}
                      className="p-3 rounded-xl border border-border bg-muted/20 space-y-2 text-center"
                    >
                      <div className="flex items-center justify-between text-[11px] font-bold text-muted-foreground">
                        <span>Year {proj.year}</span>
                        <Badge variant="outline" className="text-[9px] px-1 py-0">
                          {proj.vestedPercent}% Vested
                        </Badge>
                      </div>

                      <div className="text-base sm:text-lg font-black font-mono text-foreground">
                        ${Math.round(totalVal / 1000)}k
                      </div>

                      <div className="space-y-0.5 text-[10px] text-muted-foreground border-t pt-1.5">
                        <div className="flex justify-between">
                          <span>Base:</span>
                          <span className="font-semibold">${Math.round(proj.baseEarnings / 1000)}k</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Equity:</span>
                          <span className="font-semibold text-emerald-600">${Math.round(equityVal / 1000)}k</span>
                        </div>
                        {proj.bonusEarnings > 0 && (
                          <div className="flex justify-between">
                            <span>Bonus:</span>
                            <span className="font-semibold">${Math.round(proj.bonusEarnings / 1000)}k</span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* AI Counter-Offer Communication Script */}
          <Card className="rounded-2xl border-border bg-white dark:bg-slate-950 shadow-sm">
            <CardHeader className="pb-3 border-b flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-sm font-bold flex items-center gap-2">
                  <Send className="w-4 h-4 text-blue-600" />
                  Tactical AI Counter-Offer Email
                </CardTitle>
                <CardDescription className="text-xs">
                  Polite, data-grounded response calibrated to your compensation levers.
                </CardDescription>
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={handleCopyScript}
                className="h-8 text-xs font-bold gap-1.5 rounded-xl border-border"
              >
                {copiedLetter ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                {copiedLetter ? "Copied Email!" : "Copy Letter"}
              </Button>
            </CardHeader>

            <CardContent className="p-4">
              <pre className="h-56 p-4 bg-muted/50 text-foreground text-xs font-sans whitespace-pre-wrap overflow-auto rounded-xl border border-border leading-relaxed select-all">
                {analysis.aiCounterOfferScript}
              </pre>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
