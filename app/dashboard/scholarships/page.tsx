"use client";

import React, { useState } from "react";
import Link from "next/link";
import { 
  Sparkles, 
  Search, 
  Filter, 
  DollarSign, 
  Calendar, 
  GraduationCap, 
  Bookmark, 
  BookmarkCheck, 
  CheckCircle2, 
  Clock, 
  ExternalLink, 
  ChevronRight,
  SlidersHorizontal,
  Award,
  AlertCircle,
  HelpCircle,
  FileCheck2,
  TrendingUp,
  Share2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { SAMPLE_SCHOLARSHIPS, Scholarship } from "@/lib/data/scholarships";

export default function DashboardScholarshipsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTab, setSelectedTab] = useState("all-matches");
  const [savedIds, setSavedIds] = useState<string[]>(["sch-1", "sch-3", "sch-5"]);
  const [appliedIds, setAppliedIds] = useState<string[]>(["sch-8"]);
  const [activeModalScholarship, setActiveModalScholarship] = useState<Scholarship | null>(null);

  const toggleSave = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setSavedIds((prev) => 
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const toggleApplied = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setAppliedIds((prev) => 
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const getFilteredScholarships = () => {
    return SAMPLE_SCHOLARSHIPS.filter((sch) => {
      const matchesSearch = 
        sch.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        sch.organization.toLowerCase().includes(searchQuery.toLowerCase()) ||
        sch.majors.some((m) => m.toLowerCase().includes(searchQuery.toLowerCase()));

      if (selectedTab === "saved") {
        return matchesSearch && savedIds.includes(sch.id);
      }
      if (selectedTab === "applying") {
        return matchesSearch && appliedIds.includes(sch.id);
      }
      if (selectedTab === "high-match") {
        return matchesSearch && sch.matchScore >= 95;
      }
      if (selectedTab === "no-essay") {
        return matchesSearch && !sch.requirements.essay;
      }
      return matchesSearch;
    });
  };

  const currentList = getFilteredScholarships();
  const totalPotentialValue = SAMPLE_SCHOLARSHIPS.reduce((sum, item) => sum + item.amount, 0);

  return (
    <div className="space-y-8 pb-16">
      {/* Top Banner with Soft UI Evolution styling */}
      <div className="relative p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-slate-900 via-slate-900 to-indigo-950/40 border border-slate-800 shadow-xl overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>AI Matched Opportunities (94%+ Compatibility)</span>
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white tracking-tight">
              Scholarships Matched to Your Profile
            </h1>
            <p className="text-sm text-slate-300 leading-relaxed">
              We compared your academic profile (GPA 3.8, STEM Major, Undergraduate standing) against our database of verified student aid.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 w-full lg:w-auto shrink-0">
            <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 text-center min-w-[140px]">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Matches Found</span>
              <span className="text-2xl font-black text-white font-mono">{SAMPLE_SCHOLARSHIPS.length}</span>
              <span className="text-[10px] text-emerald-400 font-medium block mt-0.5">8 High Priority</span>
            </div>
            <div className="p-4 rounded-2xl bg-indigo-950/40 border border-indigo-500/30 text-center min-w-[140px]">
              <span className="text-[10px] uppercase font-bold text-indigo-300 block">Potential Funding</span>
              <span className="text-2xl font-black text-amber-300 font-mono">${(totalPotentialValue / 1000).toFixed(1)}k</span>
              <span className="text-[10px] text-indigo-300 font-medium block mt-0.5">Available for You</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs & Search Controls */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full sm:w-auto">
          <TabsList className="bg-slate-900 border border-slate-800 p-1 rounded-2xl h-11">
            <TabsTrigger value="all-matches" className="rounded-xl text-xs px-3 data-[state=active]:bg-indigo-600 data-[state=active]:text-white">
              All Matches ({SAMPLE_SCHOLARSHIPS.length})
            </TabsTrigger>
            <TabsTrigger value="high-match" className="rounded-xl text-xs px-3 data-[state=active]:bg-indigo-600 data-[state=active]:text-white">
              95%+ Fit
            </TabsTrigger>
            <TabsTrigger value="no-essay" className="rounded-xl text-xs px-3 data-[state=active]:bg-indigo-600 data-[state=active]:text-white">
              No Essay
            </TabsTrigger>
            <TabsTrigger value="saved" className="rounded-xl text-xs px-3 data-[state=active]:bg-indigo-600 data-[state=active]:text-white">
              Saved ({savedIds.length})
            </TabsTrigger>
            <TabsTrigger value="applying" className="rounded-xl text-xs px-3 data-[state=active]:bg-indigo-600 data-[state=active]:text-white">
              In Progress ({appliedIds.length})
            </TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="relative min-w-[240px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search matching awards..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-10 pl-9 pr-3 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
          />
        </div>
      </div>

      {/* Scholarship Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {currentList.map((sch) => {
          const isSaved = savedIds.includes(sch.id);
          const isApplied = appliedIds.includes(sch.id);

          return (
            <Card
              key={sch.id}
              onClick={() => setActiveModalScholarship(sch)}
              className="bg-slate-900/60 hover:bg-slate-900 border-slate-800/80 hover:border-indigo-500/40 rounded-3xl transition-all duration-200 cursor-pointer flex flex-col justify-between overflow-hidden shadow-lg hover:shadow-indigo-950/40 group"
            >
              <CardHeader className="p-5 pb-3">
                <div className="flex items-start justify-between gap-2">
                  <Badge variant="outline" className="bg-indigo-500/10 text-indigo-300 border-indigo-500/20 text-[11px] font-semibold py-0.5 px-2.5 rounded-full">
                    {sch.category}
                  </Badge>

                  <div className="flex items-center gap-1.5">
                    <span className="text-[11px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                      <Sparkles className="w-3 h-3" />
                      {sch.matchScore}%
                    </span>

                    <button
                      onClick={(e) => toggleSave(sch.id, e)}
                      className="p-1 rounded-lg text-slate-400 hover:text-amber-300 hover:bg-slate-800 transition-colors cursor-pointer"
                      title={isSaved ? "Saved" : "Save"}
                    >
                      {isSaved ? (
                        <BookmarkCheck className="w-4 h-4 text-amber-300 fill-amber-300/30" />
                      ) : (
                        <Bookmark className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>

                <CardTitle className="text-base font-bold text-white group-hover:text-indigo-300 transition-colors line-clamp-1 mt-2">
                  {sch.title}
                </CardTitle>
                <CardDescription className="text-xs text-slate-400 line-clamp-1">
                  {sch.organization}
                </CardDescription>
              </CardHeader>

              <CardContent className="p-5 pt-0 pb-4 space-y-3 flex-1">
                <div className="grid grid-cols-2 gap-2 p-2.5 rounded-xl bg-slate-950/60 border border-slate-800">
                  <div>
                    <span className="text-[10px] text-slate-500 block">Award Value</span>
                    <span className="text-base font-bold text-amber-300 font-mono">{sch.formattedAmount}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block">Deadline</span>
                    <span className="text-xs font-semibold text-slate-300 flex items-center gap-1 mt-0.5">
                      <Clock className="w-3 h-3 text-indigo-400" />
                      {sch.daysLeft}d left
                    </span>
                  </div>
                </div>

                {/* Match rationale preview */}
                <div className="p-2.5 rounded-xl bg-indigo-950/20 border border-indigo-500/20 space-y-1">
                  <span className="text-[10px] font-bold text-indigo-300 uppercase tracking-wider block">Why You Match</span>
                  <p className="text-[11px] text-indigo-100/90 line-clamp-2">
                    {sch.whyYouMatch[0]}
                  </p>
                </div>

                <div className="flex flex-wrap gap-1 pt-0.5">
                  {sch.minGpa && (
                    <span className="text-[10px] px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 font-medium">
                      GPA ≥ {sch.minGpa}
                    </span>
                  )}
                  {!sch.requirements.essay ? (
                    <span className="text-[10px] px-2 py-0.5 rounded-md bg-emerald-950/60 text-emerald-300 font-medium">
                      No Essay
                    </span>
                  ) : (
                    <span className="text-[10px] px-2 py-0.5 rounded-md bg-slate-800 text-slate-400 font-medium">
                      Essay Req.
                    </span>
                  )}
                </div>
              </CardContent>

              <CardFooter className="p-5 pt-0 border-t border-slate-800/60 mt-auto flex items-center justify-between text-xs">
                <button
                  onClick={(e) => toggleApplied(sch.id, e)}
                  className={`text-[11px] font-medium px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                    isApplied
                      ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                      : "text-slate-400 hover:text-white bg-slate-800/60"
                  }`}
                >
                  {isApplied ? "✓ In Progress" : "+ Track Application"}
                </button>

                <span className="inline-flex items-center gap-1 font-semibold text-indigo-400 group-hover:text-indigo-300">
                  Details
                  <ChevronRight className="w-3.5 h-3.5" />
                </span>
              </CardFooter>
            </Card>
          );
        })}
      </div>

      {/* Scholarship Detail Modal */}
      <Dialog open={!!activeModalScholarship} onOpenChange={(open) => !open && setActiveModalScholarship(null)}>
        {activeModalScholarship && (
          <DialogContent className="max-w-2xl bg-slate-900 border-slate-800 text-slate-100 p-0 overflow-hidden max-h-[90vh] flex flex-col rounded-3xl shadow-2xl">
            <div className="p-6 border-b border-slate-800 bg-slate-950/50 relative">
              <div className="flex items-center justify-between gap-4 mb-2">
                <Badge className="bg-indigo-500/20 text-indigo-300 border-indigo-500/30 text-xs">
                  {activeModalScholarship.category}
                </Badge>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/15 text-emerald-400 text-xs font-bold border border-emerald-500/30">
                  <Sparkles className="w-3.5 h-3.5" />
                  {activeModalScholarship.matchScore}% Match
                </span>
              </div>
              <DialogTitle className="text-xl sm:text-2xl font-bold text-white">
                {activeModalScholarship.title}
              </DialogTitle>
              <DialogDescription className="text-sm text-slate-400 mt-1">
                {activeModalScholarship.organization} • Deadline {activeModalScholarship.deadline} ({activeModalScholarship.daysLeft} days left)
              </DialogDescription>

              <div className="grid grid-cols-3 gap-3 mt-4 p-3 rounded-xl bg-slate-900 border border-slate-800 text-center">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-medium">Award</span>
                  <p className="text-lg font-black text-amber-300 font-mono">
                    {activeModalScholarship.formattedAmount}
                  </p>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-medium">Competition</span>
                  <p className="text-xs font-bold text-slate-200 mt-1">
                    {activeModalScholarship.competitionLevel}
                  </p>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-medium">Awards</span>
                  <p className="text-xs font-bold text-slate-200 mt-1">
                    {activeModalScholarship.awardsAvailable} available
                  </p>
                </div>
              </div>
            </div>

            <div className="p-6 overflow-y-auto space-y-6 text-sm">
              <div>
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Overview</h4>
                <p className="text-slate-300 leading-relaxed">{activeModalScholarship.description}</p>
              </div>

              <div className="p-4 rounded-xl bg-indigo-950/30 border border-indigo-500/30 space-y-2">
                <h4 className="text-xs font-bold text-indigo-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                  Why You Are a Strong Match
                </h4>
                <ul className="space-y-1.5 pt-1">
                  {activeModalScholarship.whyYouMatch.map((reason, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-xs text-indigo-100">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      <span>{reason}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Eligibility Guidelines</h4>
                <ul className="space-y-2">
                  {activeModalScholarship.eligibility.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-xs text-slate-300">
                      <span className="w-1.5 h-1.5 rounded-full bg-slate-500 mt-1.5 shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="p-4 sm:p-6 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => toggleSave(activeModalScholarship.id)}
                className="rounded-xl border-slate-700 text-slate-300 hover:text-white cursor-pointer"
              >
                {savedIds.includes(activeModalScholarship.id) ? (
                  <>
                    <BookmarkCheck className="w-4 h-4 mr-1.5 text-amber-300 fill-amber-300/30" />
                    Saved
                  </>
                ) : (
                  <>
                    <Bookmark className="w-4 h-4 mr-1.5" />
                    Save
                  </>
                )}
              </Button>

              <Button
                size="sm"
                className="rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold shadow-lg shadow-indigo-600/30 gap-1.5 cursor-pointer"
                asChild
              >
                <a href={activeModalScholarship.applicationUrl} target="_blank" rel="noopener noreferrer">
                  Apply on Provider Site
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </Button>
            </div>
          </DialogContent>
        )}
      </Dialog>
    </div>
  );
}
