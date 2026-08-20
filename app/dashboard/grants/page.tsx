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
  Clock,
  Calculator,
  BookmarkCheck,
  Bookmark
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { SAMPLE_GRANTS, Grant } from "@/lib/data/grants";

export default function DashboardGrantsPage() {
  const [selectedType, setSelectedType] = useState<string>("All");
  const [savedGrants, setSavedGrants] = useState<string[]>(["grant-1", "grant-4"]);

  const toggleSave = (id: string) => {
    setSavedGrants((prev) => 
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const filteredGrants = SAMPLE_GRANTS.filter(
    (g) => selectedType === "All" || g.grantType === selectedType
  );

  return (
    <div className="space-y-8 pb-16">
      {/* Top Banner with Soft UI Evolution styling */}
      <div className="relative p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-slate-900 via-slate-900 to-emerald-950/40 border border-slate-800 shadow-xl overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs font-semibold">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Zero Repayment Financial Aid Programs</span>
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white tracking-tight">
              Federal, State & Emergency Grants
            </h1>
            <p className="text-sm text-slate-300 leading-relaxed">
              Grants are gift aid that does not have to be repaid. Check your qualification status for Pell Grants, state opportunity funds, and campus relief funds.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 w-full lg:w-auto shrink-0">
            <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 text-center min-w-[140px]">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">FAFSA Status</span>
              <span className="text-sm font-extrabold text-emerald-400 mt-1 block">Cycle Open</span>
              <span className="text-[10px] text-slate-400 font-medium block mt-0.5">2026-2027</span>
            </div>
            <div className="p-4 rounded-2xl bg-emerald-950/40 border border-emerald-500/30 text-center min-w-[140px]">
              <span className="text-[10px] uppercase font-bold text-emerald-300 block">Pell Eligibility</span>
              <span className="text-2xl font-black text-emerald-400 font-mono">Up to $7.4k</span>
              <span className="text-[10px] text-slate-300 font-medium block mt-0.5">Annual Maximum</span>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap gap-2">
          {["All", "Federal", "State", "Research", "Emergency"].map((type) => (
            <button
              key={type}
              onClick={() => setSelectedType(type)}
              className={`text-xs px-3.5 py-1.5 rounded-xl font-medium transition-all cursor-pointer ${
                selectedType === type
                  ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/20"
                  : "bg-slate-900 border border-slate-800 text-slate-400 hover:text-white"
              }`}
            >
              {type === "All" ? "All Aid Types" : `${type} Grants`}
            </button>
          ))}
        </div>

        <Button size="sm" className="rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs gap-1.5 cursor-pointer" asChild>
          <a href="https://studentaid.gov/h/apply-for-aid/fafsa" target="_blank" rel="noopener noreferrer">
            FAFSA Portal
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </Button>
      </div>

      {/* Grants Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {filteredGrants.map((grant) => {
          const isSaved = savedGrants.includes(grant.id);
          return (
            <Card key={grant.id} className="bg-slate-900/60 border-slate-800/80 rounded-3xl overflow-hidden flex flex-col justify-between hover:border-emerald-500/40 transition-all duration-200 shadow-lg">
              <CardHeader className="p-6 pb-3">
                <div className="flex items-start justify-between gap-3">
                  <Badge variant="outline" className="bg-emerald-500/10 text-emerald-300 border-emerald-500/20 text-xs">
                    {grant.grantType} Aid
                  </Badge>

                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-slate-400 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-emerald-400" />
                      {grant.deadlineType}
                    </span>

                    <button
                      onClick={() => toggleSave(grant.id)}
                      className="p-1 rounded-lg text-slate-400 hover:text-amber-300 transition-colors cursor-pointer"
                      title={isSaved ? "Saved" : "Save grant"}
                    >
                      {isSaved ? (
                        <BookmarkCheck className="w-4 h-4 text-emerald-400" />
                      ) : (
                        <Bookmark className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>

                <CardTitle className="text-lg sm:text-xl font-bold text-white mt-2">
                  {grant.title}
                </CardTitle>
                <CardDescription className="text-xs text-slate-400">
                  {grant.agency}
                </CardDescription>
              </CardHeader>

              <CardContent className="p-6 pt-0 pb-4 space-y-4 flex-1">
                <div className="p-3 rounded-2xl bg-slate-950/70 border border-slate-800 flex items-center justify-between">
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

                <div className="space-y-1.5 pt-1">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Key Eligibility</span>
                  {grant.eligibility.slice(0, 3).map((item, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-xs text-slate-300">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </CardContent>

              <CardFooter className="p-6 pt-0 border-t border-slate-800/60 mt-auto flex items-center justify-between text-xs">
                <span className="text-slate-400 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  100% Free / No Debt
                </span>

                <Button size="sm" className="rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-medium gap-1 cursor-pointer" asChild>
                  <a href={grant.fafsaRequired ? "https://studentaid.gov/h/apply-for-aid/fafsa" : "/dashboard"} target={grant.fafsaRequired ? "_blank" : "_self"} rel="noopener noreferrer">
                    {grant.fafsaRequired ? "Claim via FAFSA" : "View Steps"}
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </Button>
              </CardFooter>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
