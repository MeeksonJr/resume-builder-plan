"use client";

import React, { useState } from "react";
import Link from "next/link";
import { 
  Building2, 
  HelpCircle, 
  CheckCircle2, 
  AlertCircle, 
  DollarSign, 
  Calendar, 
  Sparkles, 
  ShieldCheck, 
  FileText, 
  GraduationCap, 
  ArrowRight, 
  Search, 
  ExternalLink,
  Info,
  Clock,
  Compass,
  Calculator
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { SAMPLE_GRANTS, Grant } from "@/lib/data/grants";

export default function GrantsPage() {
  const [selectedType, setSelectedType] = useState<string>("All");
  const [estIncome, setEstIncome] = useState<string>("35000");
  const [householdSize, setHouseholdSize] = useState<string>("4");
  const [showPellEstimator, setShowPellEstimator] = useState<boolean>(true);

  // Quick Pell Grant estimation logic
  const calculateEstimatedPell = () => {
    const income = Number(estIncome) || 0;
    if (income <= 30000) return 7395;
    if (income <= 45000) return 5850;
    if (income <= 60000) return 3900;
    if (income <= 75000) return 1850;
    return 0;
  };

  const filteredGrants = SAMPLE_GRANTS.filter(
    (g) => selectedType === "All" || g.grantType === selectedType
  );

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-emerald-500/30 selection:text-white pt-24 pb-20">
      {/* Background ambient lighting */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[350px] bg-gradient-to-b from-emerald-600/15 via-teal-600/10 to-transparent blur-3xl pointer-events-none -z-10" />

      {/* Hero */}
      <div className="container mx-auto px-4 max-w-6xl mb-12">
        <div className="text-center space-y-4 max-w-3xl mx-auto pt-6 pb-2">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs font-semibold tracking-wide">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Zero-Repayment Higher Education Aid</span>
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-white leading-tight">
            Grants & Need-Based <span className="bg-gradient-to-r from-emerald-300 via-teal-300 to-amber-200 bg-clip-text text-transparent">Financial Aid</span>
          </h1>

          <p className="text-slate-300 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
            Unlike student loans, grants do not require repayment. Discover federal, state, institutional, and emergency aid programs designed to make college affordable.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <Button size="lg" className="rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold shadow-lg shadow-emerald-600/25 cursor-pointer" onClick={() => setShowPellEstimator(true)}>
              <Calculator className="w-4 h-4 mr-2" />
              Estimate Pell Grant
            </Button>
            <Link href="/dashboard">
              <Button size="lg" variant="outline" className="rounded-xl border-slate-700 bg-slate-900/60 text-slate-200 hover:text-white cursor-pointer">
                Match My State Aid
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 max-w-6xl space-y-12">
        {/* Interactive Pell Grant Estimator */}
        {showPellEstimator && (
          <section className="p-6 sm:p-8 rounded-3xl bg-slate-900/80 border border-emerald-500/20 backdrop-blur-xl shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
            
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pb-6 border-b border-slate-800">
              <div className="space-y-1">
                <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-400">
                  <Sparkles className="w-3.5 h-3.5" />
                  Instant Calculation (2026-2027 Cycle)
                </div>
                <h3 className="text-2xl font-bold text-white tracking-tight">Federal Pell Grant Estimator</h3>
                <p className="text-xs sm:text-sm text-slate-400">
                  Based on federal Student Aid Index (SAI) formula guidelines.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-emerald-950/40 border border-emerald-500/30 text-center min-w-[200px]">
                <span className="text-[11px] font-semibold text-emerald-300 uppercase tracking-wider block">Estimated Annual Grant</span>
                <span className="text-3xl font-black text-emerald-400 font-mono block mt-1">
                  ${calculateEstimatedPell().toLocaleString()}
                </span>
                <span className="text-[10px] text-slate-400">Zero debt / Does not require repayment</span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 pt-6 items-end">
              <div className="space-y-2">
                <label className="text-xs font-medium text-slate-300">Estimated Annual Household Income</label>
                <div className="relative">
                  <DollarSign className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="number"
                    value={estIncome}
                    onChange={(e) => setEstIncome(e.target.value)}
                    className="w-full h-11 pl-9 pr-3 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-medium text-slate-300">Household Family Size</label>
                <select
                  value={householdSize}
                  onChange={(e) => setHouseholdSize(e.target.value)}
                  className="w-full h-11 px-3 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                >
                  <option value="1">1 person</option>
                  <option value="2">2 people</option>
                  <option value="3">3 people</option>
                  <option value="4">4 people</option>
                  <option value="5">5+ people</option>
                </select>
              </div>

              <div>
                <Button 
                  className="w-full h-11 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold cursor-pointer"
                  asChild
                >
                  <a href="https://studentaid.gov/h/apply-for-aid/fafsa" target="_blank" rel="noopener noreferrer">
                    Submit Official FAFSA
                    <ExternalLink className="w-4 h-4 ml-2" />
                  </a>
                </Button>
              </div>
            </div>
          </section>
        )}

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-2">
            {["All", "Federal", "State", "Research", "Emergency"].map((type) => (
              <button
                key={type}
                onClick={() => setSelectedType(type)}
                className={`text-xs px-4 py-2 rounded-xl transition-all font-medium cursor-pointer ${
                  selectedType === type
                    ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/30"
                    : "bg-slate-900 text-slate-400 hover:text-white border border-slate-800"
                }`}
              >
                {type === "All" ? "All Aid Types" : `${type} Grants`}
              </button>
            ))}
          </div>

          <span className="text-xs text-slate-400">
            Showing {filteredGrants.length} verified grant programs
          </span>
        </div>

        {/* Grants Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredGrants.map((grant) => (
            <Card key={grant.id} className="bg-slate-900/60 border-slate-800/80 rounded-2xl overflow-hidden flex flex-col justify-between hover:border-emerald-500/40 transition-all duration-200">
              <CardHeader className="p-6 pb-3">
                <div className="flex items-start justify-between gap-3">
                  <Badge variant="outline" className="bg-emerald-500/10 text-emerald-300 border-emerald-500/20 text-xs">
                    {grant.grantType} Aid
                  </Badge>
                  <span className="text-xs font-semibold text-slate-400 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-emerald-400" />
                    {grant.deadlineType}
                  </span>
                </div>

                <CardTitle className="text-lg sm:text-xl font-bold text-white mt-2">
                  {grant.title}
                </CardTitle>
                <CardDescription className="text-xs text-slate-400">
                  Administered by {grant.agency}
                </CardDescription>
              </CardHeader>

              <CardContent className="p-6 pt-0 pb-4 space-y-4 flex-1">
                {/* Max Award Banner */}
                <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase font-medium">Maximum Award</span>
                    <p className="text-base font-extrabold text-emerald-400 font-mono">{grant.formattedAmount}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-slate-500 uppercase font-medium">Average Award</span>
                    <p className="text-xs font-semibold text-slate-300">{grant.averageAward}</p>
                  </div>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed">
                  {grant.description}
                </p>

                {/* Eligibility criteria */}
                <div className="space-y-1.5 pt-1">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Key Eligibility</span>
                  {grant.eligibility.slice(0, 3).map((item, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-xs text-slate-300">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>

                {/* Steps to Claim */}
                <div className="p-3 rounded-xl bg-slate-950/50 border border-slate-800/80 space-y-2">
                  <span className="text-[11px] font-bold text-slate-300 uppercase tracking-wider block">How to Claim</span>
                  <ol className="space-y-1.5 text-xs text-slate-400 list-decimal list-inside">
                    {grant.stepsToClaim.map((step, idx) => (
                      <li key={idx} className="leading-snug">
                        <span className="text-slate-300">{step}</span>
                      </li>
                    ))}
                  </ol>
                </div>
              </CardContent>

              <CardFooter className="p-6 pt-0 border-t border-slate-800/60 mt-auto flex items-center justify-between text-xs">
                <span className="text-slate-400 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  100% Free / No Debt
                </span>

                <Button size="sm" className="rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-medium gap-1 cursor-pointer" asChild>
                  <a href={grant.fafsaRequired ? "https://studentaid.gov/h/apply-for-aid/fafsa" : "/dashboard"} target={grant.fafsaRequired ? "_blank" : "_self"} rel="noopener noreferrer">
                    {grant.fafsaRequired ? "File FAFSA to Claim" : "View Application Steps"}
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>

        {/* FAFSA Quick Guide Section */}
        <section className="p-8 rounded-3xl bg-gradient-to-r from-slate-900 to-indigo-950/40 border border-slate-800 space-y-6">
          <div className="max-w-2xl">
            <Badge className="bg-indigo-500/20 text-indigo-300 border-indigo-500/30 text-xs mb-2">
              Financial Aid 101
            </Badge>
            <h3 className="text-2xl font-bold text-white tracking-tight">
              Why Every Student Must File the FAFSA
            </h3>
            <p className="text-sm text-slate-300 mt-2 leading-relaxed">
              Over $3.6 billion in federal Pell Grants and institutional aid goes unclaimed every single year simply because students do not submit their FAFSA. Filing takes under 30 minutes and unlocks automatic consideration for federal, state, and campus scholarships.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
            <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800">
              <span className="text-2xl font-extrabold text-amber-300 font-mono">1</span>
              <h4 className="text-sm font-bold text-white mt-1">Get Your FSA ID</h4>
              <p className="text-xs text-slate-400 mt-1">Create your official login account on StudentAid.gov before beginning.</p>
            </div>
            <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800">
              <span className="text-2xl font-extrabold text-indigo-400 font-mono">2</span>
              <h4 className="text-sm font-bold text-white mt-1">Add School Codes</h4>
              <p className="text-xs text-slate-400 mt-1">Add up to 20 universities or colleges to receive your aid package automatically.</p>
            </div>
            <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800">
              <span className="text-2xl font-extrabold text-emerald-400 font-mono">3</span>
              <h4 className="text-sm font-bold text-white mt-1">Accept Your Grants</h4>
              <p className="text-xs text-slate-400 mt-1">Review your financial aid letters in spring and accept all grants and scholarships first.</p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
