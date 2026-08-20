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
    <div className="space-y-6 sm:space-y-8 pb-16 bg-[#e9eee8] text-[#102b2b]">
      <div className="relative p-5 sm:p-8 rounded-md bg-[#102b2b] border border-[#102b2b] shadow-sm overflow-hidden">
        
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-sm bg-[#d8f36b] text-[#102b2b] text-xs font-semibold">
              <ShieldCheck className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Zero Repayment Financial Aid Programs</span>
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#e9eee8] tracking-tight">
              Federal, State & Emergency Grants
            </h1>
            <p className="text-sm text-[#e9eee8]/75 leading-relaxed">
              Grants are gift aid that does not have to be repaid. Check your qualification status for Pell Grants, state opportunity funds, and campus relief funds.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 w-full lg:w-auto shrink-0">
            <div className="p-4 rounded-md bg-[#0d8274] border border-[#e9eee8]/20 text-center min-w-[140px]">
              <span className="text-[10px] uppercase font-bold text-[#e9eee8]/70 block">FAFSA Status</span>
              <span className="text-sm font-extrabold text-[#d8f36b] mt-1 block">Cycle Open</span>
              <span className="text-[10px] text-[#e9eee8]/70 font-medium block mt-0.5">2026-2027</span>
            </div>
            <div className="p-4 rounded-md bg-[#d8f36b] border border-[#102b2b]/20 text-center min-w-[140px]">
              <span className="text-[10px] uppercase font-bold text-[#102b2b]/70 block">Pell Eligibility</span>
              <span className="text-2xl font-black text-[#102b2b] font-mono">Up to $7.4k</span>
              <span className="text-[10px] text-[#102b2b]/70 font-medium block mt-0.5">Annual Maximum</span>
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
                  ? "bg-[#d8f36b] text-[#102b2b]"
                  : "bg-[#102b2b] border border-[#102b2b] text-[#e9eee8]/75 hover:text-[#d8f36b]"
              }`}
            >
              {type === "All" ? "All Aid Types" : `${type} Grants`}
            </button>
          ))}
        </div>

        <Button size="sm" className="rounded-sm bg-[#0d8274] hover:bg-[#102b2b] text-[#e9eee8] font-medium text-xs gap-1.5 cursor-pointer" asChild>
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
            <Card key={grant.id} className="bg-[#f7faf5] border-[#b8c8b9] rounded-md overflow-hidden flex flex-col justify-between hover:border-[#0d8274] transition-colors duration-200 shadow-sm">
              <CardHeader className="p-6 pb-3">
                <div className="flex items-start justify-between gap-3">
                  <Badge variant="outline" className="bg-[#0d8274]/10 text-[#0d8274] border-[#0d8274]/30 text-xs rounded-sm">
                    {grant.grantType} Aid
                  </Badge>

                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-[#102b2b]/60 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-[#0d8274]" aria-hidden="true" />
                      {grant.deadlineType}
                    </span>

                    <button
                      onClick={() => toggleSave(grant.id)}
                      aria-label={isSaved ? "Remove grant from saved" : "Save grant"}
                      className="p-2 rounded-sm text-[#102b2b]/55 hover:text-[#0d8274] hover:bg-[#e9eee8] transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0d8274]"
                    >
                      {isSaved ? (
                        <BookmarkCheck className="w-4 h-4 text-[#0d8274]" />
                      ) : (
                        <Bookmark className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>

                <CardTitle className="text-lg sm:text-xl font-bold text-[#102b2b] mt-2">
                  {grant.title}
                </CardTitle>
                <CardDescription className="text-xs text-[#102b2b]/60">
                  {grant.agency}
                </CardDescription>
              </CardHeader>

              <CardContent className="p-6 pt-0 pb-4 space-y-4 flex-1">
                <div className="p-3 rounded-sm bg-[#e9eee8] border border-[#b8c8b9] flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-[#102b2b]/55 uppercase font-medium">Maximum Award</span>
                    <p className="text-base font-extrabold text-[#0d8274] font-mono">{grant.formattedAmount}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-[#102b2b]/55 uppercase font-medium">Average Award</span>
                    <p className="text-xs font-semibold text-[#102b2b]">{grant.averageAward}</p>
                  </div>
                </div>

                <p className="text-xs text-[#102b2b]/80 leading-relaxed">
                  {grant.description}
                </p>

                <div className="space-y-1.5 pt-1">
                  <span className="text-[11px] font-bold text-[#102b2b]/60 uppercase tracking-wider block">Key Eligibility</span>
                  {grant.eligibility.slice(0, 3).map((item, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-xs text-[#102b2b]/80">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#0d8274] shrink-0 mt-0.5" aria-hidden="true" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </CardContent>

              <CardFooter className="p-6 pt-0 border-t border-[#b8c8b9] mt-auto flex items-center justify-between text-xs">
                <span className="text-[#102b2b]/60 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#0d8274]" aria-hidden="true" />
                  100% Free / No Debt
                </span>

                <Button size="sm" className="rounded-sm bg-[#0d8274] hover:bg-[#102b2b] text-[#e9eee8] font-medium gap-1 cursor-pointer" asChild>
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
