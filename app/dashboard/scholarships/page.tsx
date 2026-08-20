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
    <div className="space-y-6 sm:space-y-8 pb-16 bg-[#e9eee8] text-[#102b2b]">
      <div className="relative p-5 sm:p-8 rounded-md bg-[#102b2b] border border-[#102b2b] shadow-sm overflow-hidden">
        
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-sm bg-[#d8f36b] text-[#102b2b] text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5" aria-hidden="true" />
              <span>AI Matched Opportunities (94%+ Compatibility)</span>
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#e9eee8] tracking-tight">
              Scholarships Matched to Your Profile
            </h1>
            <p className="text-sm text-[#e9eee8]/75 leading-relaxed">
              We compared your academic profile (GPA 3.8, STEM Major, Undergraduate standing) against our database of verified student aid.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 w-full lg:w-auto shrink-0">
            <div className="p-4 rounded-md bg-[#0d8274] border border-[#e9eee8]/20 text-center min-w-[140px]">
              <span className="text-[10px] uppercase font-bold text-[#e9eee8]/70 block">Matches Found</span>
              <span className="text-2xl font-black text-[#e9eee8] font-mono">{SAMPLE_SCHOLARSHIPS.length}</span>
              <span className="text-[10px] text-[#d8f36b] font-medium block mt-0.5">8 High Priority</span>
            </div>
            <div className="p-4 rounded-md bg-[#d8f36b] border border-[#102b2b]/20 text-center min-w-[140px]">
              <span className="text-[10px] uppercase font-bold text-[#102b2b]/70 block">Potential Funding</span>
              <span className="text-2xl font-black text-[#102b2b] font-mono">${(totalPotentialValue / 1000).toFixed(1)}k</span>
              <span className="text-[10px] text-[#102b2b]/70 font-medium block mt-0.5">Available for You</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs & Search Controls */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full sm:w-auto">
          <TabsList className="bg-[#102b2b] border border-[#102b2b] p-1 rounded-md h-auto min-h-11">
            <TabsTrigger value="all-matches" className="rounded-sm text-xs px-3 data-[state=active]:bg-[#d8f36b] data-[state=active]:text-[#102b2b]">
              All Matches ({SAMPLE_SCHOLARSHIPS.length})
            </TabsTrigger>
            <TabsTrigger value="high-match" className="rounded-sm text-xs px-3 data-[state=active]:bg-[#d8f36b] data-[state=active]:text-[#102b2b]">
              95%+ Fit
            </TabsTrigger>
            <TabsTrigger value="no-essay" className="rounded-sm text-xs px-3 data-[state=active]:bg-[#d8f36b] data-[state=active]:text-[#102b2b]">
              No Essay
            </TabsTrigger>
            <TabsTrigger value="saved" className="rounded-sm text-xs px-3 data-[state=active]:bg-[#d8f36b] data-[state=active]:text-[#102b2b]">
              Saved ({savedIds.length})
            </TabsTrigger>
            <TabsTrigger value="applying" className="rounded-sm text-xs px-3 data-[state=active]:bg-[#d8f36b] data-[state=active]:text-[#102b2b]">
              In Progress ({appliedIds.length})
            </TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="relative min-w-[240px]">
          <Search className="w-4 h-4 text-[#0d8274] absolute left-3 top-1/2 -translate-y-1/2" aria-hidden="true" />
          <input
            type="text"
            placeholder="Search matching awards..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            aria-label="Search matching scholarships"
            className="w-full h-10 pl-9 pr-3 rounded-md bg-[#f7faf5] border border-[#b8c8b9] text-xs text-[#102b2b] placeholder:text-[#102b2b]/50 focus:outline-none focus:ring-2 focus:ring-[#0d8274]"
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
              className="bg-[#f7faf5] hover:bg-white border-[#b8c8b9] hover:border-[#0d8274] rounded-md transition-colors duration-200 cursor-pointer flex flex-col justify-between overflow-hidden shadow-sm group"
            >
              <CardHeader className="p-5 pb-3">
                <div className="flex items-start justify-between gap-2">
                  <Badge variant="outline" className="bg-[#0d8274]/10 text-[#0d8274] border-[#0d8274]/30 text-[11px] font-semibold py-0.5 px-2.5 rounded-sm">
                    {sch.category}
                  </Badge>

                  <div className="flex items-center gap-1.5">
                    <span className="text-[11px] font-extrabold px-2 py-0.5 rounded-sm bg-[#d8f36b] text-[#102b2b] border border-[#102b2b]/15 flex items-center gap-1">
                      <Sparkles className="w-3 h-3" aria-hidden="true" />
                      {sch.matchScore}%
                    </span>

                    <button
                      onClick={(e) => toggleSave(sch.id, e)}
                      aria-label={isSaved ? "Remove scholarship from saved" : "Save scholarship"}
                      className="p-2 rounded-sm text-[#102b2b]/55 hover:text-[#0d8274] hover:bg-[#e9eee8] transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0d8274]"
                    >
                      {isSaved ? (
                        <BookmarkCheck className="w-4 h-4 text-[#0d8274] fill-[#0d8274]/20" />
                      ) : (
                        <Bookmark className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>

                <CardTitle className="text-base font-bold text-[#102b2b] group-hover:text-[#0d8274] transition-colors line-clamp-1 mt-2">
                  {sch.title}
                </CardTitle>
                <CardDescription className="text-xs text-[#102b2b]/60 line-clamp-1">
                  {sch.organization}
                </CardDescription>
              </CardHeader>

              <CardContent className="p-5 pt-0 pb-4 space-y-3 flex-1">
                <div className="grid grid-cols-2 gap-2 p-2.5 rounded-sm bg-[#e9eee8] border border-[#b8c8b9]">
                  <div>
                    <span className="text-[10px] text-[#102b2b]/55 block">Award Value</span>
                    <span className="text-base font-bold text-[#0d8274] font-mono">{sch.formattedAmount}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-[#102b2b]/55 block">Deadline</span>
                    <span className="text-xs font-semibold text-[#102b2b] flex items-center gap-1 mt-0.5">
                      <Clock className="w-3 h-3 text-[#0d8274]" aria-hidden="true" />
                      {sch.daysLeft}d left
                    </span>
                  </div>
                </div>

                {/* Match rationale preview */}
                <div className="p-2.5 rounded-sm bg-[#0d8274]/10 border border-[#0d8274]/25 space-y-1">
                  <span className="text-[10px] font-bold text-[#0d8274] uppercase tracking-wider block">Why You Match</span>
                  <p className="text-[11px] text-[#102b2b]/80 line-clamp-2">
                    {sch.whyYouMatch[0]}
                  </p>
                </div>

                <div className="flex flex-wrap gap-1 pt-0.5">
                  {sch.minGpa && (
                    <span className="text-[10px] px-2 py-0.5 rounded-sm bg-[#e9eee8] text-[#102b2b]/75 font-medium">
                      GPA ≥ {sch.minGpa}
                    </span>
                  )}
                  {!sch.requirements.essay ? (
                    <span className="text-[10px] px-2 py-0.5 rounded-sm bg-[#d8f36b] text-[#102b2b] font-medium">
                      No Essay
                    </span>
                  ) : (
                    <span className="text-[10px] px-2 py-0.5 rounded-sm bg-[#e9eee8] text-[#102b2b]/55 font-medium">
                      Essay Req.
                    </span>
                  )}
                </div>
              </CardContent>

              <CardFooter className="p-5 pt-0 border-t border-[#b8c8b9] mt-auto flex items-center justify-between text-xs">
                <button
                  onClick={(e) => toggleApplied(sch.id, e)}
                  className={`text-[11px] font-medium px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                    isApplied
                      ? "bg-[#d8f36b] text-[#102b2b] border border-[#102b2b]/15"
                      : "text-[#102b2b]/60 hover:text-[#102b2b] bg-[#e9eee8]"
                  }`}
                >
                  {isApplied ? "✓ In Progress" : "+ Track Application"}
                </button>

                <span className="inline-flex items-center gap-1 font-semibold text-[#0d8274] group-hover:text-[#102b2b]">
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
          <DialogContent className="max-w-2xl bg-[#f7faf5] border-[#b8c8b9] text-[#102b2b] p-0 overflow-hidden max-h-[90vh] flex flex-col rounded-md shadow-xl">
            <div className="p-6 border-b border-[#b8c8b9] bg-[#e9eee8] relative">
              <div className="flex items-center justify-between gap-4 mb-2">
                <Badge className="bg-[#0d8274]/10 text-[#0d8274] border-[#0d8274]/30 text-xs rounded-sm">
                  {activeModalScholarship.category}
                </Badge>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-sm bg-[#d8f36b] text-[#102b2b] text-xs font-bold border border-[#102b2b]/15">
                  <Sparkles className="w-3.5 h-3.5" aria-hidden="true" />
                  {activeModalScholarship.matchScore}% Match
                </span>
              </div>
              <DialogTitle className="text-xl sm:text-2xl font-bold text-[#102b2b]">
                {activeModalScholarship.title}
              </DialogTitle>
              <DialogDescription className="text-sm text-[#102b2b]/60 mt-1">
                {activeModalScholarship.organization} • Deadline {activeModalScholarship.deadline} ({activeModalScholarship.daysLeft} days left)
              </DialogDescription>

              <div className="grid grid-cols-3 gap-3 mt-4 p-3 rounded-sm bg-[#f7faf5] border border-[#b8c8b9] text-center">
                <div>
                  <span className="text-[10px] text-[#102b2b]/60 uppercase font-medium">Award</span>
                  <p className="text-lg font-black text-[#0d8274] font-mono">
                    {activeModalScholarship.formattedAmount}
                  </p>
                </div>
                <div>
                  <span className="text-[10px] text-[#102b2b]/60 uppercase font-medium">Competition</span>
                  <p className="text-xs font-bold text-[#102b2b] mt-1">
                    {activeModalScholarship.competitionLevel}
                  </p>
                </div>
                <div>
                  <span className="text-[10px] text-[#102b2b]/60 uppercase font-medium">Awards</span>
                  <p className="text-xs font-bold text-[#102b2b] mt-1">
                    {activeModalScholarship.awardsAvailable} available
                  </p>
                </div>
              </div>
            </div>

            <div className="p-6 overflow-y-auto space-y-6 text-sm">
              <div>
                <h4 className="text-xs font-bold text-[#102b2b]/60 uppercase tracking-wider mb-2">Overview</h4>
                <p className="text-[#102b2b]/80 leading-relaxed">{activeModalScholarship.description}</p>
              </div>

              <div className="p-4 rounded-sm bg-[#0d8274]/10 border border-[#0d8274]/25 space-y-2">
                <h4 className="text-xs font-bold text-[#0d8274] uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-[#0d8274]" aria-hidden="true" />
                  Why You Are a Strong Match
                </h4>
                <ul className="space-y-1.5 pt-1">
                  {activeModalScholarship.whyYouMatch.map((reason, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-xs text-[#102b2b]/80">
                      <CheckCircle2 className="w-4 h-4 text-[#0d8274] shrink-0 mt-0.5" aria-hidden="true" />
                      <span>{reason}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h4 className="text-xs font-bold text-[#102b2b]/60 uppercase tracking-wider mb-2">Eligibility Guidelines</h4>
                <ul className="space-y-2">
                  {activeModalScholarship.eligibility.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-xs text-[#102b2b]/80">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#0d8274] mt-1.5 shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="p-4 sm:p-6 border-t border-[#b8c8b9] bg-[#e9eee8] flex items-center justify-between gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => toggleSave(activeModalScholarship.id)}
                className="rounded-sm border-[#b8c8b9] text-[#102b2b] hover:bg-[#f7faf5] cursor-pointer"
              >
                {savedIds.includes(activeModalScholarship.id) ? (
                  <>
                    <BookmarkCheck className="w-4 h-4 mr-1.5 text-[#0d8274] fill-[#0d8274]/20" />
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
                className="rounded-sm bg-[#0d8274] hover:bg-[#102b2b] text-[#e9eee8] font-semibold gap-1.5 cursor-pointer"
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
