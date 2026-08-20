"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { 
  Search, 
  Filter, 
  Sparkles, 
  DollarSign, 
  Calendar, 
  GraduationCap, 
  BookOpen, 
  Award, 
  CheckCircle2, 
  Clock, 
  Bookmark, 
  BookmarkCheck, 
  ExternalLink, 
  X, 
  Info,
  ShieldCheck,
  ChevronRight,
  FileText,
  SlidersHorizontal,
  ArrowRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { SAMPLE_SCHOLARSHIPS, Scholarship } from "@/lib/data/scholarships";

const CATEGORIES = [
  "All",
  "STEM",
  "Healthcare",
  "Business",
  "Arts & Humanities",
  "First-Gen",
  "Leadership",
  "General"
];

const EDUCATION_LEVELS = [
  "All Levels",
  "High School Senior",
  "Undergraduate",
  "Graduate",
  "Transfer"
];

export default function ScholarshipsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedLevel, setSelectedLevel] = useState("All Levels");
  const [onlyNoEssay, setOnlyNoEssay] = useState(false);
  const [minAmount, setMinAmount] = useState<number>(0);
  const [savedIds, setSavedIds] = useState<string[]>([]);
  const [activeModalScholarship, setActiveModalScholarship] = useState<Scholarship | null>(null);
  const [showFiltersMobile, setShowFiltersMobile] = useState(false);

  const toggleSave = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setSavedIds((prev) => 
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const filteredScholarships = useMemo(() => {
    return SAMPLE_SCHOLARSHIPS.filter((sch) => {
      // Search
      const matchesSearch = 
        sch.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        sch.organization.toLowerCase().includes(searchQuery.toLowerCase()) ||
        sch.majors.some((m) => m.toLowerCase().includes(searchQuery.toLowerCase())) ||
        sch.description.toLowerCase().includes(searchQuery.toLowerCase());
      
      // Category
      const matchesCategory = selectedCategory === "All" || sch.category === selectedCategory;

      // Level
      const matchesLevel = selectedLevel === "All Levels" || sch.educationLevel.includes(selectedLevel as any);

      // No Essay
      const matchesNoEssay = !onlyNoEssay || !sch.requirements.essay;

      // Min Amount
      const matchesAmount = sch.amount >= minAmount;

      return matchesSearch && matchesCategory && matchesLevel && matchesNoEssay && matchesAmount;
    });
  }, [searchQuery, selectedCategory, selectedLevel, onlyNoEssay, minAmount]);

  return (
    <div className="min-h-screen bg-[#e9eee8] text-[#102b2b] selection:bg-[#d8f36b] selection:text-[#102b2b] pt-24 pb-20">

      {/* Header / Hero */}
      <div className="container mx-auto px-4 max-w-6xl mb-12">
        <div className="text-center space-y-4 max-w-3xl mx-auto pt-6 pb-2">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-sm bg-[#d8f36b] text-[#102b2b] text-xs font-semibold tracking-wide">
            <Sparkles className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Over $18.4M+ in Verified Student Scholarships</span>
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-[#102b2b] leading-tight">
            Find Scholarships You <span className="text-[#0d8274]">Actually Qualify For</span>
          </h1>

          <p className="text-[#102b2b]/70 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
            Stop sorting through thousands of dead links. Explore vetted scholarship opportunities with real match compatibility, clear requirements, and instant deadlines.
          </p>

          {/* Quick Search Bar */}
          <div className="pt-4 max-w-2xl mx-auto">
            <div className="relative flex items-center shadow-sm rounded-md overflow-hidden border border-[#b8c8b9] bg-[#f7faf5]">
              <Search className="w-5 h-5 text-[#0d8274] absolute left-4 pointer-events-none" aria-hidden="true" />
              <input
                type="text"
                placeholder="Search by major, keyword (e.g. Computer Science, First-Gen, Nursing)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                aria-label="Search scholarships by major or keyword"
                className="w-full h-14 pl-12 pr-28 bg-transparent text-[#102b2b] placeholder:text-[#102b2b]/50 text-sm focus:outline-none focus:ring-2 focus:ring-[#0d8274] transition-all"
              />
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery("")} 
                  aria-label="Clear scholarship search"
                  className="absolute right-20 text-[#102b2b]/55 hover:text-[#0d8274] p-2 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0d8274]"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
              <Button 
                size="sm" 
                className="absolute right-2.5 h-9 px-4 rounded-sm bg-[#0d8274] hover:bg-[#102b2b] text-[#e9eee8] font-medium cursor-pointer"
                onClick={() => {}}
              >
                Search
              </Button>
            </div>
          </div>

          {/* Popular Tag Pills */}
          <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
            <span className="text-xs text-[#102b2b]/60 font-medium mr-1">Popular:</span>
            {["STEM", "First-Gen", "Healthcare", "No Essay", "Undergraduate"].map((tag) => (
              <button
                key={tag}
                onClick={() => {
                  if (tag === "No Essay") {
                    setOnlyNoEssay(!onlyNoEssay);
                  } else if (CATEGORIES.includes(tag)) {
                    setSelectedCategory(tag);
                  } else if (EDUCATION_LEVELS.includes(tag)) {
                    setSelectedLevel(tag);
                  }
                }}
                className="text-xs px-3 py-1 rounded-sm bg-[#f7faf5] border border-[#b8c8b9] hover:border-[#0d8274] text-[#102b2b]/75 hover:text-[#102b2b] transition-colors cursor-pointer"
              >
                {tag}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content Layout */}
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="flex items-center justify-between pb-6 border-b border-[#b8c8b9] mb-8">
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
              <span>Opportunities</span>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-sm bg-[#0d8274]/10 text-[#0d8274] border border-[#0d8274]/30">
                {filteredScholarships.length} Available
              </span>
            </h2>
            <p className="text-xs text-[#102b2b]/60 mt-0.5">
              Verified daily by ResumeForge scholarship curators
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFiltersMobile(!showFiltersMobile)}
              className="lg:hidden h-9 rounded-sm border-[#b8c8b9] bg-[#f7faf5] text-[#102b2b]/75 hover:text-[#102b2b] cursor-pointer"
            >
              <SlidersHorizontal className="w-4 h-4 mr-2" />
              Filters
            </Button>

            <Link href="/dashboard">
              <Button size="sm" variant="secondary" className="rounded-sm h-9 text-xs font-semibold gap-1.5 cursor-pointer bg-[#102b2b] hover:bg-[#0d8274] text-[#e9eee8]">
                <Sparkles className="w-3.5 h-3.5 text-[#d8f36b]" aria-hidden="true" />
                Match My Profile
              </Button>
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Desktop Filter Sidebar */}
          <aside className={`lg:col-span-3 space-y-6 ${showFiltersMobile ? "block" : "hidden lg:block"} bg-[#f7faf5] p-5 rounded-md border border-[#b8c8b9]`}>
            <div className="flex items-center justify-between pb-3 border-b border-[#b8c8b9]">
              <h3 className="text-sm font-semibold text-white uppercase tracking-wider flex items-center gap-2">
                <Filter className="w-4 h-4 text-[#0d8274]" aria-hidden="true" />
                Refine Search
              </h3>
              {(selectedCategory !== "All" || selectedLevel !== "All Levels" || onlyNoEssay || minAmount > 0 || searchQuery) && (
                <button
                  onClick={() => {
                    setSelectedCategory("All");
                    setSelectedLevel("All Levels");
                    setOnlyNoEssay(false);
                    setMinAmount(0);
                    setSearchQuery("");
                  }}
                  className="text-xs text-[#0d8274] hover:underline cursor-pointer"
                >
                  Reset
                </button>
              )}
            </div>

            {/* Category Filter */}
            <div className="space-y-2">
              <label className="text-xs font-medium text-[#102b2b]/80">Award Category</label>
              <div className="flex flex-col gap-1">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`text-left text-xs px-3 py-2 rounded-sm transition-all flex items-center justify-between cursor-pointer ${
                      selectedCategory === cat
                        ? "bg-[#d8f36b] border border-[#102b2b]/15 text-[#102b2b] font-semibold"
                        : "text-[#102b2b]/60 hover:text-[#102b2b] hover:bg-[#e9eee8]"
                    }`}
                  >
                    <span>{cat}</span>
                    {selectedCategory === cat && <CheckCircle2 className="w-3.5 h-3.5 text-[#0d8274]" aria-hidden="true" />}
                  </button>
                ))}
              </div>
            </div>

            {/* Education Level */}
            <div className="space-y-2 pt-2 border-t border-[#b8c8b9]">
              <label className="text-xs font-medium text-[#102b2b]/80">Education Level</label>
              <div className="flex flex-col gap-1">
                {EDUCATION_LEVELS.map((lvl) => (
                  <button
                    key={lvl}
                    onClick={() => setSelectedLevel(lvl)}
                    className={`text-left text-xs px-3 py-2 rounded-sm transition-all flex items-center justify-between cursor-pointer ${
                      selectedLevel === lvl
                        ? "bg-[#d8f36b] border border-[#102b2b]/15 text-[#102b2b] font-semibold"
                        : "text-[#102b2b]/60 hover:text-[#102b2b] hover:bg-[#e9eee8]"
                    }`}
                  >
                    <span>{lvl}</span>
                    {selectedLevel === lvl && <CheckCircle2 className="w-3.5 h-3.5 text-[#0d8274]" aria-hidden="true" />}
                  </button>
                ))}
              </div>
            </div>

            {/* Quick Toggle: No Essay */}
            <div className="pt-2 border-t border-[#b8c8b9]">
              <label 
                className="flex items-center gap-3 p-2.5 rounded-sm bg-[#e9eee8] hover:bg-white border border-[#b8c8b9] cursor-pointer select-none"
                onClick={() => setOnlyNoEssay(!onlyNoEssay)}
              >
                <input
                  type="checkbox"
                  checked={onlyNoEssay}
                  onChange={() => {}}
                  className="rounded-sm border-[#b8c8b9] text-[#0d8274] focus:ring-[#0d8274] h-4 w-4 bg-[#f7faf5] cursor-pointer"
                />
                <span className="text-xs font-medium text-[#102b2b]/80">
                  No-Essay Scholarships only
                </span>
              </label>
            </div>

            {/* Min Amount */}
            <div className="space-y-2 pt-2 border-t border-[#b8c8b9]">
              <div className="flex justify-between items-center text-xs">
                <span className="font-medium text-[#102b2b]/80">Min Award Amount</span>
                <span className="font-mono text-[#0d8274] font-bold">${minAmount.toLocaleString()}</span>
              </div>
              <input
                type="range"
                min="0"
                max="20000"
                step="1000"
                value={minAmount}
                onChange={(e) => setMinAmount(Number(e.target.value))}
                className="w-full accent-[#0d8274] h-1.5 bg-[#b8c8b9] rounded-sm cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-[#102b2b]/50">
                <span>$0</span>
                <span>$10k</span>
                <span>$20k+</span>
              </div>
            </div>

            {/* Trust Box */}
            <div className="pt-4 border-t border-[#b8c8b9] text-xs text-[#102b2b]/60 space-y-2">
              <div className="flex items-center gap-2 text-[#0d8274] font-medium">
                <ShieldCheck className="w-4 h-4 shrink-0" aria-hidden="true" />
                <span>Zero Application Scams</span>
              </div>
              <p className="text-[11px] text-[#102b2b]/50 leading-relaxed">
                ResumeForge filters out commercial sweepstakes, loan marketing, and pay-to-apply listings.
              </p>
            </div>
          </aside>

          {/* Scholarship Cards Grid */}
          <main className="lg:col-span-9 space-y-4">
            {filteredScholarships.length === 0 ? (
              <div className="p-12 text-center rounded-md bg-[#f7faf5] border border-[#b8c8b9] space-y-4">
                <div className="w-12 h-12 rounded-md bg-[#0d8274]/10 text-[#0d8274] flex items-center justify-center mx-auto">
                  <Search className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-white">No Scholarships Matched</h3>
                <p className="text-sm text-[#102b2b]/60 max-w-md mx-auto">
                  Try clearing some filters or searching for broader terms like "STEM", "Undergraduate", or "Leadership".
                </p>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setSelectedCategory("All");
                    setSelectedLevel("All Levels");
                    setOnlyNoEssay(false);
                    setMinAmount(0);
                    setSearchQuery("");
                  }}
                  className="rounded-sm border-[#b8c8b9] text-[#102b2b] cursor-pointer"
                >
                  Reset All Filters
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredScholarships.map((sch) => {
                  const isSaved = savedIds.includes(sch.id);
                  return (
                    <Card
                      key={sch.id}
                      onClick={() => setActiveModalScholarship(sch)}
                      className="group bg-[#f7faf5] hover:bg-white border-[#b8c8b9] hover:border-[#0d8274] transition-colors duration-200 cursor-pointer rounded-md overflow-hidden shadow-sm flex flex-col justify-between"
                    >
                      <CardHeader className="p-5 pb-3">
                        <div className="flex items-start justify-between gap-3">
                          <Badge 
                            variant="secondary" 
                            className="bg-[#0d8274]/10 text-[#0d8274] hover:bg-[#0d8274]/20 border-[#0d8274]/30 text-[11px] font-semibold py-0.5 px-2.5 rounded-sm"
                          >
                            {sch.category}
                          </Badge>

                          <div className="flex items-center gap-1.5">
                            {/* Match score badge */}
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-sm bg-[#d8f36b] text-[#102b2b] border border-[#102b2b]/15">
                              <Sparkles className="w-3 h-3" aria-hidden="true" />
                              {sch.matchScore}% Match
                            </span>

                            {/* Bookmark button */}
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

                        <CardTitle className="text-base sm:text-lg font-bold text-[#102b2b] group-hover:text-[#0d8274] transition-colors line-clamp-1 mt-2">
                          {sch.title}
                        </CardTitle>
                        <CardDescription className="text-xs text-[#102b2b]/60 line-clamp-1">
                          {sch.organization}
                        </CardDescription>
                      </CardHeader>

                      <CardContent className="p-5 pt-0 pb-4 space-y-3 flex-1">
                        {/* Award & Deadline Highlights */}
                        <div className="grid grid-cols-2 gap-2 p-3 rounded-sm bg-[#e9eee8] border border-[#b8c8b9]">
                          <div>
                            <span className="text-[10px] text-[#102b2b]/55 font-medium block">Award Amount</span>
                            <span className="text-base font-extrabold text-[#0d8274] font-mono">
                              {sch.formattedAmount}
                            </span>
                          </div>
                          <div>
                            <span className="text-[10px] text-[#102b2b]/55 font-medium block">Deadline</span>
                            <span className="text-xs font-semibold text-[#102b2b] flex items-center gap-1 mt-0.5">
                              <Clock className="w-3 h-3 text-[#0d8274]" aria-hidden="true" />
                              {sch.daysLeft} days left
                            </span>
                          </div>
                        </div>

                        <p className="text-xs text-[#102b2b]/75 line-clamp-2 leading-relaxed">
                          {sch.description}
                        </p>

                        {/* Requirements chips */}
                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {sch.minGpa && (
                            <span className="text-[10px] px-2 py-0.5 rounded-sm bg-[#e9eee8] text-[#102b2b]/75 font-medium border border-[#b8c8b9]">
                              Min {sch.minGpa} GPA
                            </span>
                          )}
                          {!sch.requirements.essay ? (
                            <span className="text-[10px] px-2 py-0.5 rounded-sm bg-[#d8f36b] text-[#102b2b] font-medium border border-[#102b2b]/15">
                              No Essay
                            </span>
                          ) : (
                            <span className="text-[10px] px-2 py-0.5 rounded-sm bg-[#e9eee8] text-[#102b2b]/55 font-medium">
                              Essay Required
                            </span>
                          )}
                          {sch.renewable && (
                            <span className="text-[10px] px-2 py-0.5 rounded-sm bg-[#0d8274]/10 text-[#0d8274] font-medium border border-[#0d8274]/25">
                              Renewable
                            </span>
                          )}
                        </div>
                      </CardContent>

                      <CardFooter className="p-5 pt-0 border-t border-[#b8c8b9] mt-auto flex items-center justify-between text-xs text-[#102b2b]/60">
                        <span className="text-[11px] text-[#102b2b]/50">
                          {sch.awardsAvailable} awards offered
                        </span>
                        <span className="inline-flex items-center gap-1 font-semibold text-[#0d8274] group-hover:text-[#102b2b] group-hover:translate-x-0.5 transition-all">
                          View Details
                          <ChevronRight className="w-3.5 h-3.5" />
                        </span>
                      </CardFooter>
                    </Card>
                  );
                })}
              </div>
            )}
          </main>
        </div>
      </div>

      {/* Scholarship Detail Modal */}
      <Dialog open={!!activeModalScholarship} onOpenChange={(open) => !open && setActiveModalScholarship(null)}>
        {activeModalScholarship && (
          <DialogContent className="max-w-2xl bg-[#f7faf5] border-[#b8c8b9] text-[#102b2b] p-0 overflow-hidden max-h-[90vh] flex flex-col rounded-md shadow-xl">
            {/* Modal Header */}
            <div className="p-6 border-b border-[#b8c8b9] bg-[#e9eee8] relative">
              <div className="flex items-center justify-between gap-4 mb-2">
                <Badge className="bg-[#0d8274]/10 text-[#0d8274] border-[#0d8274]/30 text-xs rounded-sm">
                  {activeModalScholarship.category}
                </Badge>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-sm bg-[#d8f36b] text-[#102b2b] text-xs font-bold border border-[#102b2b]/15">
                  <Sparkles className="w-3.5 h-3.5" aria-hidden="true" />
                  {activeModalScholarship.matchScore}% Match for you
                </span>
              </div>
              <DialogTitle className="text-xl sm:text-2xl font-bold text-[#102b2b]">
                {activeModalScholarship.title}
              </DialogTitle>
              <DialogDescription className="text-sm text-[#102b2b]/60 mt-1">
                Offered by {activeModalScholarship.organization} • Last verified {activeModalScholarship.lastVerifiedDate}
              </DialogDescription>

              {/* Key Metrics Bar */}
              <div className="grid grid-cols-3 gap-3 mt-5 p-3 rounded-sm bg-[#f7faf5] border border-[#b8c8b9] text-center">
                <div>
                  <span className="text-[10px] text-[#102b2b]/60 uppercase font-medium">Award</span>
                  <p className="text-lg font-black text-[#0d8274] font-mono">
                    {activeModalScholarship.formattedAmount}
                  </p>
                </div>
                <div>
                  <span className="text-[10px] text-[#102b2b]/60 uppercase font-medium">Deadline</span>
                  <p className="text-xs font-bold text-[#102b2b] mt-1">
                    {activeModalScholarship.deadline}
                  </p>
                  <span className="text-[10px] text-[#0d8274]">({activeModalScholarship.daysLeft} days)</span>
                </div>
                <div>
                  <span className="text-[10px] text-[#102b2b]/60 uppercase font-medium">Competition</span>
                  <p className="text-xs font-bold text-[#102b2b] mt-1">
                    {activeModalScholarship.competitionLevel}
                  </p>
                </div>
              </div>
            </div>

            {/* Modal Body (Scrollable) */}
            <div className="p-6 overflow-y-auto space-y-6 text-sm">
              {/* Description */}
              <div>
                <h4 className="text-xs font-bold text-[#102b2b]/60 uppercase tracking-wider mb-2">Overview</h4>
                <p className="text-[#102b2b]/80 leading-relaxed">{activeModalScholarship.description}</p>
              </div>

              {/* Why You Match AI Breakdown */}
              <div className="p-4 rounded-sm bg-[#0d8274]/10 border border-[#0d8274]/25 space-y-2">
                <h4 className="text-xs font-bold text-[#0d8274] uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-[#0d8274]" aria-hidden="true" />
                  Why ResumeForge Thinks You Match
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

              {/* Eligibility Criteria */}
              <div>
                <h4 className="text-xs font-bold text-[#102b2b]/60 uppercase tracking-wider mb-2">Eligibility Criteria</h4>
                <ul className="space-y-2">
                  {activeModalScholarship.eligibility.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-xs text-[#102b2b]/80">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#0d8274] mt-1.5 shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Application Requirements */}
              <div>
                <h4 className="text-xs font-bold text-[#102b2b]/60 uppercase tracking-wider mb-2">Requirements Checklist</h4>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-2.5 rounded-sm bg-[#e9eee8] border border-[#b8c8b9] flex items-center justify-between">
                    <span className="text-[#102b2b]/60">Essay</span>
                    <span className={`font-semibold ${activeModalScholarship.requirements.essay ? "text-[#102b2b]" : "text-[#0d8274]"}`}>
                      {activeModalScholarship.requirements.essay ? "Required" : "No Essay"}
                    </span>
                  </div>
                  <div className="p-2.5 rounded-sm bg-[#e9eee8] border border-[#b8c8b9] flex items-center justify-between">
                    <span className="text-[#102b2b]/60">Recommendations</span>
                    <span className="font-semibold text-[#102b2b]">
                      {activeModalScholarship.requirements.recommendationLetters} Letters
                    </span>
                  </div>
                  <div className="p-2.5 rounded-sm bg-[#e9eee8] border border-[#b8c8b9] flex items-center justify-between">
                    <span className="text-[#102b2b]/60">Transcript</span>
                    <span className="font-semibold text-[#102b2b]">
                      {activeModalScholarship.requirements.transcriptRequired ? "Official/Unofficial" : "Not Required"}
                    </span>
                  </div>
                  <div className="p-2.5 rounded-sm bg-[#e9eee8] border border-[#b8c8b9] flex items-center justify-between">
                    <span className="text-[#102b2b]/60">Resume / CV</span>
                    <span className="font-semibold text-[#102b2b]">
                      {activeModalScholarship.requirements.resumeRequired ? "Required" : "Optional"}
                    </span>
                  </div>
                </div>

                {activeModalScholarship.requirements.essayPrompt && (
                  <div className="mt-3 p-3 rounded-sm bg-[#e9eee8] border border-[#b8c8b9] text-xs">
                    <span className="text-[10px] uppercase font-bold text-[#102b2b]/60 block mb-1">Essay Prompt</span>
                    <p className="text-[#102b2b]/80 italic">"{activeModalScholarship.requirements.essayPrompt}"</p>
                  </div>
                )}
              </div>
            </div>

            {/* Modal Footer Actions */}
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
                    Saved to Tracker
                  </>
                ) : (
                  <>
                    <Bookmark className="w-4 h-4 mr-1.5" />
                    Save Opportunity
                  </>
                )}
              </Button>

              <div className="flex items-center gap-2">
                <Link href="/dashboard/tracker">
                  <Button variant="secondary" size="sm" className="rounded-sm bg-[#102b2b] text-[#e9eee8] hover:bg-[#0d8274] cursor-pointer">
                    Track in Dashboard
                  </Button>
                </Link>

                <Button
                  size="sm"
                  className="rounded-sm bg-[#0d8274] hover:bg-[#102b2b] text-[#e9eee8] font-semibold gap-1.5 cursor-pointer"
                  asChild
                >
                  <a href={activeModalScholarship.applicationUrl} target="_blank" rel="noopener noreferrer">
                    Official Apply
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </Button>
              </div>
            </div>
          </DialogContent>
        )}
      </Dialog>
    </div>
  );
}
