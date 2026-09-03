"use client";

import React, { useState } from "react";
import { 
  Coins, 
  TrendingUp, 
  Sparkles, 
  DollarSign, 
  MapPin, 
  Building, 
  Briefcase, 
  CheckCircle2, 
  Copy, 
  ExternalLink, 
  Loader2, 
  ShieldCheck, 
  ChevronRight, 
  ArrowUpRight, 
  SlidersHorizontal, 
  HelpCircle, 
  FileText, 
  Award,
  Zap
} from "lucide-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";

interface SalaryIntelligenceHubProps {
  profile?: any;
  resumes?: { id: string; title: string; target_role?: string }[];
  applications?: { id: string; company: string; role: string; salary_target?: string | null; salary_range?: string | null }[];
  initialRole?: string;
  initialCompany?: string;
}

export function SalaryIntelligenceHub({
  profile,
  resumes = [],
  applications = [],
  initialRole = "",
  initialCompany = "",
}: SalaryIntelligenceHubProps) {
  const [activeTab, setActiveTab] = useState<"benchmark" | "evaluator">("benchmark");

  // Tab 1: Market Explorer States
  const [searchRole, setSearchRole] = useState(initialRole || profile?.target_role || "Senior Software Engineer");
  const [searchLocation, setSearchLocation] = useState(profile?.location || "Remote / US");
  const [selectedResumeId, setSelectedResumeId] = useState(resumes[0]?.id || "");
  const [benchmarkLoading, setBenchmarkLoading] = useState(false);
  const [benchmarkData, setBenchmarkData] = useState<{
    low: number;
    median: number;
    high: number;
    currency: string;
    marketDemand: "High" | "Moderate" | "Steady";
    locationMultiplier: number;
    skillsValuation: { skill: string; estimatedBoost: string; explanation: string }[];
    negotiationPoints: string[];
    source?: string;
  } | null>(null);

  // Sync to Tracker Dialog States
  const [syncDialogOpen, setSyncDialogOpen] = useState(false);
  const [selectedAppId, setSelectedAppId] = useState(applications[0]?.id || "");
  const [targetAmountInput, setTargetAmountInput] = useState("");
  const [syncingTracker, setSyncingTracker] = useState(false);

  // Tab 2: Offer Evaluator States
  const [offerCompany, setOfferCompany] = useState(initialCompany || "Stripe");
  const [offerRole, setOfferRole] = useState(initialRole || searchRole);
  const [offerLocation, setOfferLocation] = useState(searchLocation);
  const [baseSalary, setBaseSalary] = useState<number>(145000);
  const [annualBonus, setAnnualBonus] = useState<number>(15000);
  const [equityAnnual, setEquityAnnual] = useState<number>(30000);
  const [signingBonus, setSigningBonus] = useState<number>(10000);

  const [coachLoading, setCoachLoading] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [negotiationResult, setNegotiationResult] = useState<{
    overallAssessment: string;
    recommendedCounterBase: number;
    recommendedCounterBonus?: number;
    scripts: {
      type: "collaborative" | "competitive" | "value_based";
      title: string;
      strategySummary: string;
      subjectLine: string;
      emailBody: string;
      keyTalkingPoints: string[];
    }[];
    tacticalAdvice: string[];
    nonSalaryLevers: { lever: string; description: string; typicalValue: string }[];
  } | null>(null);

  const totalCompensation = (baseSalary || 0) + (annualBonus || 0) + (equityAnnual || 0) + (signingBonus || 0);

  // Fetch Market Compensation Benchmark
  const handleFetchBenchmark = async () => {
    if (!searchRole.trim()) {
      toast.error("Please enter a role title to benchmark.");
      return;
    }

    try {
      setBenchmarkLoading(true);
      const res = await fetch("/api/ai/career/salary-insights", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          resumeId: selectedResumeId || (resumes[0]?.id ?? "default"),
          targetRole: searchRole.trim(),
          location: searchLocation.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        if (data.error === "LIMIT_EXCEEDED") {
          toast.error(data.message || "Daily rate limit reached.");
          return;
        }
        throw new Error(data.message || data.error || "Failed to fetch salary data");
      }

      setBenchmarkData(data);
      setTargetAmountInput(`$${Number(data.median).toLocaleString()}`);
      toast.success(`Retrieved compensation benchmark for "${searchRole}"!`);
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Could not retrieve salary benchmark.");
    } finally {
      setBenchmarkLoading(false);
    }
  };

  // Sync to Kanban Tracker
  const handleSyncToTracker = async () => {
    if (!selectedAppId || !targetAmountInput) return;

    try {
      setSyncingTracker(true);
      const supabase = createClient();
      const { error } = await supabase
        .from("applications")
        .update({
          salary_target: targetAmountInput,
        })
        .eq("id", selectedAppId);

      if (error) throw error;
      toast.success("Compensation target synced to your Job Tracker card!");
      setSyncDialogOpen(false);
    } catch (err: any) {
      toast.error("Failed to sync to tracker.");
    } finally {
      setSyncingTracker(false);
    }
  };

  // Generate AI Counter-Offer Negotiation Strategy
  const handleGenerateNegotiationStrategy = async () => {
    if (!offerCompany || !offerRole || !baseSalary) {
      toast.error("Please enter Company, Role, and Base Salary.");
      return;
    }

    try {
      setCoachLoading(true);
      const res = await fetch("/api/ai/career/negotiation-scripts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          company: offerCompany,
          role: offerRole,
          location: offerLocation,
          currentOffer: {
            baseSalary,
            bonus: annualBonus,
            equity: equityAnnual,
            signingBonus,
          },
          targetSalary: Math.round(baseSalary * 1.12),
          resumeId: selectedResumeId,
        }),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to generate scripts");

      setNegotiationResult(json.data);
      toast.success("AI Counter-Offer Strategy & Scripts generated!");
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Failed to generate negotiation strategy.");
    } finally {
      setCoachLoading(false);
    }
  };

  const handleCopyScript = async (text: string, idx: number) => {
    await navigator.clipboard.writeText(text);
    setCopiedIndex(idx);
    toast.success("Negotiation script copied to clipboard!");
    setTimeout(() => setCopiedIndex(null), 2500);
  };

  return (
    <div className="space-y-6">
      {/* Top Header Banner */}
      <div className="p-6 bg-[#102b2b] text-[#f8f4ec] border border-[#102b2b] shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="p-1.5 bg-[#d8f36b] text-[#102b2b] rounded-none">
                <Coins className="w-4 h-4" />
              </span>
              <span className="text-xs font-bold uppercase tracking-widest text-[#d8f36b]">
                Executive Intelligence
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              Compensation Benchmark & Negotiation Coach
            </h1>
            <p className="text-xs sm:text-sm text-[#f8f4ec]/80 max-w-2xl">
              Calibrate your market value using real-time compensation indices, evaluate formal job offers, and generate bespoke counter-offer scripts backed by AI.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Tabs value={activeTab} onValueChange={(v: any) => setActiveTab(v)}>
              <TabsList className="bg-[#163a3a] border border-[#d8f36b]/30 p-1 rounded-none">
                <TabsTrigger
                  value="benchmark"
                  className="data-[state=active]:bg-[#d8f36b] data-[state=active]:text-[#102b2b] rounded-none text-xs font-bold text-white px-3.5 py-1.5 cursor-pointer"
                >
                  <TrendingUp className="w-3.5 h-3.5 mr-1.5" />
                  Market Explorer
                </TabsTrigger>
                <TabsTrigger
                  value="evaluator"
                  className="data-[state=active]:bg-[#d8f36b] data-[state=active]:text-[#102b2b] rounded-none text-xs font-bold text-white px-3.5 py-1.5 cursor-pointer"
                >
                  <Award className="w-3.5 h-3.5 mr-1.5" />
                  Offer Evaluator
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </div>
      </div>

      {/* Main Tab Views */}
      {activeTab === "benchmark" && (
        <div className="space-y-6">
          {/* Query & Filter Form */}
          <Card className="rounded-none border-[#b8c8b9] bg-white shadow-xs">
            <CardHeader className="pb-4">
              <CardTitle className="text-base font-bold text-[#102b2b] flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4 text-[#0d8274]" />
                Explore Market Compensation
              </CardTitle>
              <CardDescription className="text-xs text-[#102b2b]/70">
                Aggregates salary reports across Glassdoor, enterprise job portals, and regional cost-of-living indices.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Target Role */}
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-[#102b2b]">Target Role Title</Label>
                  <Input
                    value={searchRole}
                    onChange={(e) => setSearchRole(e.target.value)}
                    placeholder="e.g. Senior Frontend Engineer"
                    className="h-9 rounded-none border-[#b8c8b9] text-xs font-medium bg-[#f7faf5]"
                  />
                </div>

                {/* Location */}
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-[#102b2b]">Location / Market</Label>
                  <Input
                    value={searchLocation}
                    onChange={(e) => setSearchLocation(e.target.value)}
                    placeholder="e.g. San Francisco, CA or Remote"
                    className="h-9 rounded-none border-[#b8c8b9] text-xs font-medium bg-[#f7faf5]"
                  />
                </div>

                {/* Resume Context */}
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-[#102b2b]">Candidate Resume</Label>
                  <select
                    value={selectedResumeId}
                    onChange={(e) => setSelectedResumeId(e.target.value)}
                    className="w-full h-9 px-3 border border-[#b8c8b9] bg-[#f7faf5] text-[#102b2b] text-xs font-medium rounded-none focus:outline-none focus:ring-1 focus:ring-[#0d8274]"
                  >
                    {resumes.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.title}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </CardContent>
            <CardFooter className="pt-0 pb-4 flex justify-between items-center border-t border-[#102b2b]/5 mt-4">
              <span className="text-[11px] text-[#102b2b]/60">
                Powered by Glassdoor & RapidAPI salary data with DB caching.
              </span>
              <Button
                onClick={handleFetchBenchmark}
                disabled={benchmarkLoading}
                className="h-9 rounded-none bg-[#102b2b] hover:bg-[#0d8274] text-[#d8f36b] hover:text-white text-xs font-bold gap-2 cursor-pointer shadow-xs"
              >
                {benchmarkLoading ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    Querying Indices...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5" />
                    Fetch Benchmark
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>

          {/* Benchmark Results Display */}
          {benchmarkData && (
            <div className="space-y-6">
              {/* Top Summary Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* 25th Percentile */}
                <Card className="rounded-none border-[#b8c8b9] bg-white shadow-2xs p-4">
                  <span className="text-[11px] font-bold text-[#102b2b]/60 uppercase tracking-wider block">
                    25th Percentile (Base)
                  </span>
                  <div className="text-2xl font-black text-[#102b2b] mt-1 font-mono">
                    ${Number(benchmarkData.low).toLocaleString()}
                  </div>
                  <span className="text-[11px] text-[#102b2b]/60 mt-1 block">Entry / Standard Band</span>
                </Card>

                {/* 50th Percentile (Median) */}
                <Card className="rounded-none border-[#0d8274] bg-[#f7faf5] shadow-2xs p-4 border-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-[#0d8274] uppercase tracking-wider block">
                      Market Median (50th)
                    </span>
                    <Badge className="rounded-none bg-[#0d8274] text-white text-[10px] px-1.5 py-0">
                      Standard
                    </Badge>
                  </div>
                  <div className="text-2xl font-black text-[#0d8274] mt-1 font-mono">
                    ${Number(benchmarkData.median).toLocaleString()}
                  </div>
                  <span className="text-[11px] text-[#102b2b]/70 mt-1 block">Median Target for {searchRole}</span>
                </Card>

                {/* 75th Percentile */}
                <Card className="rounded-none border-[#b8c8b9] bg-white shadow-2xs p-4">
                  <span className="text-[11px] font-bold text-[#102b2b]/60 uppercase tracking-wider block">
                    75th Percentile (Top Tier)
                  </span>
                  <div className="text-2xl font-black text-[#102b2b] mt-1 font-mono">
                    ${Number(benchmarkData.high).toLocaleString()}
                  </div>
                  <span className="text-[11px] text-[#102b2b]/60 mt-1 block">Senior / High-Impact Performer</span>
                </Card>

                {/* Market Dynamics */}
                <Card className="rounded-none border-[#b8c8b9] bg-white shadow-2xs p-4">
                  <span className="text-[11px] font-bold text-[#102b2b]/60 uppercase tracking-wider block">
                    Market Velocity & Index
                  </span>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="px-2 py-0.5 rounded-none bg-[#d8f36b] text-[#102b2b] text-xs font-black">
                      {benchmarkData.marketDemand} Demand
                    </span>
                    <span className="text-xs font-bold text-[#102b2b]/70">
                      {benchmarkData.locationMultiplier}x Index
                    </span>
                  </div>
                  <span className="text-[11px] text-[#102b2b]/60 mt-1 block">
                    Adjusted for {searchLocation}
                  </span>
                </Card>
              </div>

              {/* Percentile Distribution Visualizer */}
              <Card className="rounded-none border-[#b8c8b9] bg-white shadow-xs p-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
                  <div>
                    <h3 className="text-base font-bold text-[#102b2b]">Compensation Spectrum Distribution</h3>
                    <p className="text-xs text-[#102b2b]/70">Regional distribution of base compensation for {searchRole}.</p>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setSyncDialogOpen(true)}
                    className="rounded-none border-[#0d8274] text-[#0d8274] hover:bg-[#0d8274] hover:text-white text-xs font-bold gap-1.5 h-8"
                  >
                    <Briefcase className="w-3.5 h-3.5" />
                    Sync Target to Tracker
                  </Button>
                </div>

                <div className="space-y-2 py-4">
                  <div className="relative h-6 bg-[#e9eee8] rounded-none overflow-hidden flex items-center">
                    <div className="absolute left-0 h-full bg-[#102b2b]/20" style={{ width: "25%" }} />
                    <div className="absolute left-[25%] h-full bg-[#0d8274]/30" style={{ width: "50%" }} />
                    <div className="absolute left-[75%] h-full bg-[#d8f36b]/60" style={{ width: "25%" }} />
                    <div 
                      className="absolute top-0 bottom-0 w-1 bg-[#102b2b] z-10"
                      style={{ left: "50%" }}
                      title="Market Median"
                    />
                  </div>
                  <div className="flex justify-between text-xs font-mono font-bold text-[#102b2b]/80 pt-1">
                    <span>25%: ${Number(benchmarkData.low).toLocaleString()}</span>
                    <span className="text-[#0d8274]">50% (Median): ${Number(benchmarkData.median).toLocaleString()}</span>
                    <span>75%: ${Number(benchmarkData.high).toLocaleString()}</span>
                  </div>
                </div>
              </Card>

              {/* Premium Skills Valuation Table */}
              {benchmarkData.skillsValuation && benchmarkData.skillsValuation.length > 0 && (
                <Card className="rounded-none border-[#b8c8b9] bg-white shadow-xs">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-bold text-[#102b2b] flex items-center gap-2">
                      <Zap className="w-4 h-4 text-[#0d8274]" />
                      High-Value Skill Premiums for {searchRole}
                    </CardTitle>
                    <CardDescription className="text-xs text-[#102b2b]/70">
                      Estimated compensation uplift when highlighting specific technical proficiencies.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-0">
                    <div className="divide-y divide-[#102b2b]/10 text-xs">
                      {benchmarkData.skillsValuation.map((skill, idx) => (
                        <div key={idx} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2 hover:bg-[#f7faf5] transition-colors">
                          <div className="space-y-0.5">
                            <span className="font-bold text-[#102b2b] text-sm">{skill.skill}</span>
                            <p className="text-[#102b2b]/70 text-xs">{skill.explanation}</p>
                          </div>
                          <span className="px-2.5 py-1 bg-[#d8f36b] text-[#102b2b] font-mono font-black text-xs self-start sm:self-center shrink-0">
                            {skill.estimatedBoost}
                          </span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Offer Evaluator & Negotiation Coach */}
      {activeTab === "evaluator" && (
        <div className="space-y-6">
          {/* Offer Input Card */}
          <Card className="rounded-none border-[#b8c8b9] bg-white shadow-xs">
            <CardHeader className="pb-4">
              <CardTitle className="text-base font-bold text-[#102b2b] flex items-center gap-2">
                <Award className="w-4 h-4 text-[#0d8274]" />
                Job Offer Breakdown & Total Compensation (TC)
              </CardTitle>
              <CardDescription className="text-xs text-[#102b2b]/70">
                Enter details from your written or verbal offer to benchmark your package and generate negotiation leverage.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Company Name */}
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-[#102b2b]">Hiring Company</Label>
                  <Input
                    value={offerCompany}
                    onChange={(e) => setOfferCompany(e.target.value)}
                    placeholder="e.g. Stripe, Linear"
                    className="h-9 rounded-none border-[#b8c8b9] text-xs font-medium bg-[#f7faf5]"
                  />
                </div>

                {/* Role */}
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-[#102b2b]">Role Title</Label>
                  <Input
                    value={offerRole}
                    onChange={(e) => setOfferRole(e.target.value)}
                    placeholder="e.g. Senior Backend Engineer"
                    className="h-9 rounded-none border-[#b8c8b9] text-xs font-medium bg-[#f7faf5]"
                  />
                </div>

                {/* Base Salary */}
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-[#102b2b]">Base Salary ($ / yr)</Label>
                  <Input
                    type="number"
                    value={baseSalary}
                    onChange={(e) => setBaseSalary(Number(e.target.value))}
                    className="h-9 rounded-none border-[#b8c8b9] text-xs font-mono font-bold bg-[#f7faf5]"
                  />
                </div>

                {/* Annual Bonus */}
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-[#102b2b]">Annual Bonus ($ / yr)</Label>
                  <Input
                    type="number"
                    value={annualBonus}
                    onChange={(e) => setAnnualBonus(Number(e.target.value))}
                    className="h-9 rounded-none border-[#b8c8b9] text-xs font-mono font-bold bg-[#f7faf5]"
                  />
                </div>

                {/* Equity Grant */}
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-[#102b2b]">Equity / RSU ($ / yr)</Label>
                  <Input
                    type="number"
                    value={equityAnnual}
                    onChange={(e) => setEquityAnnual(Number(e.target.value))}
                    className="h-9 rounded-none border-[#b8c8b9] text-xs font-mono font-bold bg-[#f7faf5]"
                  />
                </div>

                {/* Sign-on Bonus */}
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-[#102b2b]">Signing Bonus ($ 1-time)</Label>
                  <Input
                    type="number"
                    value={signingBonus}
                    onChange={(e) => setSigningBonus(Number(e.target.value))}
                    className="h-9 rounded-none border-[#b8c8b9] text-xs font-mono font-bold bg-[#f7faf5]"
                  />
                </div>

                {/* Total Compensation Display */}
                <div className="sm:col-span-2 p-3 bg-[#102b2b] text-[#f8f4ec] rounded-none flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-[#d8f36b] font-bold uppercase tracking-wider block">
                      Total 1st-Year Comp (TC)
                    </span>
                    <span className="text-2xl font-black font-mono text-white">
                      ${totalCompensation.toLocaleString()}
                    </span>
                  </div>
                  <Button
                    onClick={handleGenerateNegotiationStrategy}
                    disabled={coachLoading}
                    className="rounded-none bg-[#d8f36b] hover:bg-[#e5ff8b] text-[#102b2b] font-bold text-xs h-9 gap-1.5 cursor-pointer"
                  >
                    {coachLoading ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        Generating Strategy...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-3.5 h-3.5" />
                        Generate Counter Strategy
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* AI Negotiation Coach Output */}
          {negotiationResult && (
            <div className="space-y-6">
              {/* Executive Assessment Card */}
              <Card className="rounded-none border-2 border-[#0d8274] bg-[#f7faf5] shadow-xs p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="p-1 rounded-none bg-[#0d8274] text-white">
                      <ShieldCheck className="w-4 h-4" />
                    </span>
                    <h3 className="text-base font-extrabold text-[#102b2b]">Executive Offer Evaluation</h3>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-[#102b2b]/70">Recommended Target Base:</span>
                    <span className="text-sm font-black font-mono text-[#0d8274] bg-white px-2 py-0.5 border border-[#0d8274]">
                      ${negotiationResult.recommendedCounterBase.toLocaleString()}
                    </span>
                  </div>
                </div>
                <p className="text-xs text-[#102b2b]/85 leading-relaxed">
                  {negotiationResult.overallAssessment}
                </p>
              </Card>

              {/* 3 Counter-Offer Scripts */}
              <div className="space-y-4">
                <h3 className="text-base font-black text-[#102b2b] flex items-center gap-2">
                  <FileText className="w-4 h-4 text-[#0d8274]" />
                  3 Tailored Counter-Offer Scripts (Ready to Send)
                </h3>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                  {negotiationResult.scripts.map((script, idx) => (
                    <Card key={idx} className="rounded-none border-[#b8c8b9] bg-white shadow-xs flex flex-col justify-between">
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between mb-1">
                          <Badge className="rounded-none bg-[#102b2b] text-[#d8f36b] text-[10px] uppercase font-bold">
                            {script.type.replace("_", " ")}
                          </Badge>
                          <button
                            onClick={() => handleCopyScript(script.emailBody, idx)}
                            className="text-xs text-[#0d8274] hover:underline font-bold flex items-center gap-1 cursor-pointer"
                          >
                            {copiedIndex === idx ? <CheckCircle2 className="w-3.5 h-3.5 text-[#0d8274]" /> : <Copy className="w-3.5 h-3.5" />}
                            <span>{copiedIndex === idx ? "Copied!" : "Copy"}</span>
                          </button>
                        </div>
                        <CardTitle className="text-sm font-bold text-[#102b2b]">{script.title}</CardTitle>
                        <CardDescription className="text-[11px] text-[#102b2b]/70 line-clamp-2">
                          {script.strategySummary}
                        </CardDescription>
                      </CardHeader>

                      <CardContent className="space-y-2">
                        <div className="text-[11px] font-mono text-[#102b2b]/60 border-b border-[#102b2b]/10 pb-1">
                          Subject: <span className="text-[#102b2b] font-medium">{script.subjectLine}</span>
                        </div>
                        <div className="max-h-56 overflow-y-auto p-3 bg-[#f7faf5] border border-[#b8c8b9]/60 text-[11px] text-[#102b2b]/90 leading-relaxed font-sans whitespace-pre-line">
                          {script.emailBody}
                        </div>
                      </CardContent>

                      <CardFooter className="pt-2 pb-4 border-t border-[#102b2b]/10 flex flex-col items-start gap-1">
                        <span className="text-[10px] font-bold text-[#0d8274] uppercase">Key Talking Points:</span>
                        <ul className="text-[11px] text-[#102b2b]/80 space-y-0.5 list-disc list-inside">
                          {script.keyTalkingPoints.slice(0, 2).map((tp, pIdx) => (
                            <li key={pIdx} className="line-clamp-1">{tp}</li>
                          ))}
                        </ul>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              </div>

              {/* Non-Salary Levers Playbook */}
              {negotiationResult.nonSalaryLevers && negotiationResult.nonSalaryLevers.length > 0 && (
                <Card className="rounded-none border-[#b8c8b9] bg-white shadow-xs">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-bold text-[#102b2b] flex items-center gap-2">
                      <Zap className="w-4 h-4 text-[#0d8274]" />
                      Non-Salary Negotiation Levers Playbook
                    </CardTitle>
                    <CardDescription className="text-xs text-[#102b2b]/70">
                      If base salary bands are strictly capped, pivot immediately to these high-value alternatives.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-0">
                    <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-[#102b2b]/10">
                      {negotiationResult.nonSalaryLevers.map((lever, idx) => (
                        <div key={idx} className="p-4 space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-[#102b2b] text-xs">{lever.lever}</span>
                            <span className="text-[11px] font-mono font-bold text-[#0d8274] bg-[#0d8274]/10 px-1.5 py-0.5">
                              {lever.typicalValue}
                            </span>
                          </div>
                          <p className="text-[11px] text-[#102b2b]/75 leading-relaxed">{lever.description}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </div>
      )}

      {/* Sync to Tracker Dialog */}
      <Dialog open={syncDialogOpen} onOpenChange={setSyncDialogOpen}>
        <DialogContent className="max-w-md bg-[#f7faf5] border-[#b8c8b9] text-[#102b2b] p-6 rounded-none shadow-xl">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-[#102b2b]">
              Sync Salary Target to Job Tracker
            </DialogTitle>
            <DialogDescription className="text-xs text-[#102b2b]/70">
              Select which application card in your Kanban board should reflect this target compensation.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-[#102b2b]">Application Card</Label>
              <select
                value={selectedAppId}
                onChange={(e) => setSelectedAppId(e.target.value)}
                className="w-full h-9 px-3 border border-[#b8c8b9] bg-white text-xs font-medium rounded-none"
              >
                {applications.map((app) => (
                  <option key={app.id} value={app.id}>
                    {app.company} — {app.role} {app.salary_target ? `(Current: ${app.salary_target})` : ""}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-[#102b2b]">Target Compensation</Label>
              <Input
                value={targetAmountInput}
                onChange={(e) => setTargetAmountInput(e.target.value)}
                placeholder="e.g. $165,000 / yr"
                className="h-9 rounded-none border-[#b8c8b9] text-xs font-mono font-bold bg-white"
              />
            </div>
          </div>

          <DialogFooter className="pt-2 gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSyncDialogOpen(false)}
              className="rounded-none border-[#b8c8b9] text-xs font-bold"
            >
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={handleSyncToTracker}
              disabled={syncingTracker || !selectedAppId}
              className="rounded-none bg-[#102b2b] hover:bg-[#0d8274] text-[#d8f36b] text-xs font-bold gap-1.5"
            >
              {syncingTracker ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
              Save Target
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
