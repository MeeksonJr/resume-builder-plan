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
    <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-indigo-500/30 selection:text-white pt-24 pb-20">
      {/* Background ambient lighting */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[350px] bg-gradient-to-b from-indigo-600/15 via-violet-600/10 to-transparent blur-3xl pointer-events-none -z-10" />

      {/* Header / Hero */}
      <div className="container mx-auto px-4 max-w-6xl mb-12">
        <div className="text-center space-y-4 max-w-3xl mx-auto pt-6 pb-2">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-semibold tracking-wide">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>Over $18.4M+ in Verified Student Scholarships</span>
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-white leading-tight">
            Find Scholarships You <span className="bg-gradient-to-r from-indigo-300 via-violet-300 to-amber-200 bg-clip-text text-transparent">Actually Qualify For</span>
          </h1>

          <p className="text-slate-300 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
            Stop sorting through thousands of dead links. Explore vetted scholarship opportunities with real match compatibility, clear requirements, and instant deadlines.
          </p>

          {/* Quick Search Bar */}
          <div className="pt-4 max-w-2xl mx-auto">
            <div className="relative flex items-center shadow-2xl shadow-indigo-950/50 rounded-2xl overflow-hidden border border-white/10 bg-slate-900/80 backdrop-blur-xl">
              <Search className="w-5 h-5 text-slate-400 absolute left-4 pointer-events-none" />
              <input
                type="text"
                placeholder="Search by major, keyword (e.g. Computer Science, First-Gen, Nursing)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-14 pl-12 pr-28 bg-transparent text-white placeholder:text-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
              />
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery("")} 
                  className="absolute right-20 text-slate-400 hover:text-white p-1 cursor-pointer"
                  title="Clear search"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
              <Button 
                size="sm" 
                className="absolute right-2.5 h-9 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium cursor-pointer"
                onClick={() => {}}
              >
                Search
              </Button>
            </div>
          </div>

          {/* Popular Tag Pills */}
          <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
            <span className="text-xs text-slate-400 font-medium mr-1">Popular:</span>
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
                className="text-xs px-3 py-1 rounded-full bg-slate-900 border border-slate-800 hover:border-indigo-500/40 text-slate-300 hover:text-white transition-colors cursor-pointer"
              >
                {tag}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content Layout */}
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="flex items-center justify-between pb-6 border-b border-slate-800/80 mb-8">
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
              <span>Opportunities</span>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                {filteredScholarships.length} Available
              </span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Verified daily by Premio scholarship curators
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFiltersMobile(!showFiltersMobile)}
              className="lg:hidden h-9 rounded-xl border-slate-800 bg-slate-900/60 text-slate-300 hover:text-white cursor-pointer"
            >
              <SlidersHorizontal className="w-4 h-4 mr-2" />
              Filters
            </Button>

            <Link href="/dashboard">
              <Button size="sm" variant="secondary" className="rounded-xl h-9 text-xs font-semibold gap-1.5 cursor-pointer bg-slate-800 hover:bg-slate-700 text-slate-200">
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                Match My Profile
              </Button>
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Desktop Filter Sidebar */}
          <aside className={`lg:col-span-3 space-y-6 ${showFiltersMobile ? "block" : "hidden lg:block"} bg-slate-900/40 p-5 rounded-2xl border border-slate-800/80 backdrop-blur-md`}>
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-sm font-semibold text-white uppercase tracking-wider flex items-center gap-2">
                <Filter className="w-4 h-4 text-indigo-400" />
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
                  className="text-xs text-indigo-400 hover:underline cursor-pointer"
                >
                  Reset
                </button>
              )}
            </div>

            {/* Category Filter */}
            <div className="space-y-2">
              <label className="text-xs font-medium text-slate-300">Award Category</label>
              <div className="flex flex-col gap-1">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`text-left text-xs px-3 py-2 rounded-xl transition-all flex items-center justify-between cursor-pointer ${
                      selectedCategory === cat
                        ? "bg-indigo-600/20 border border-indigo-500/40 text-indigo-200 font-semibold"
                        : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/40"
                    }`}
                  >
                    <span>{cat}</span>
                    {selectedCategory === cat && <CheckCircle2 className="w-3.5 h-3.5 text-indigo-400" />}
                  </button>
                ))}
              </div>
            </div>

            {/* Education Level */}
            <div className="space-y-2 pt-2 border-t border-slate-800/60">
              <label className="text-xs font-medium text-slate-300">Education Level</label>
              <div className="flex flex-col gap-1">
                {EDUCATION_LEVELS.map((lvl) => (
                  <button
                    key={lvl}
                    onClick={() => setSelectedLevel(lvl)}
                    className={`text-left text-xs px-3 py-2 rounded-xl transition-all flex items-center justify-between cursor-pointer ${
                      selectedLevel === lvl
                        ? "bg-indigo-600/20 border border-indigo-500/40 text-indigo-200 font-semibold"
                        : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/40"
                    }`}
                  >
                    <span>{lvl}</span>
                    {selectedLevel === lvl && <CheckCircle2 className="w-3.5 h-3.5 text-indigo-400" />}
                  </button>
                ))}
              </div>
            </div>

            {/* Quick Toggle: No Essay */}
            <div className="pt-2 border-t border-slate-800/60">
              <label 
                className="flex items-center gap-3 p-2.5 rounded-xl bg-slate-800/30 hover:bg-slate-800/50 border border-slate-800 cursor-pointer select-none"
                onClick={() => setOnlyNoEssay(!onlyNoEssay)}
              >
                <input
                  type="checkbox"
                  checked={onlyNoEssay}
                  onChange={() => {}}
                  className="rounded border-slate-700 text-indigo-600 focus:ring-indigo-500 h-4 w-4 bg-slate-900 cursor-pointer"
                />
                <span className="text-xs font-medium text-slate-300">
                  No-Essay Scholarships only
                </span>
              </label>
            </div>

            {/* Min Amount */}
            <div className="space-y-2 pt-2 border-t border-slate-800/60">
              <div className="flex justify-between items-center text-xs">
                <span className="font-medium text-slate-300">Min Award Amount</span>
                <span className="font-mono text-amber-300 font-bold">${minAmount.toLocaleString()}</span>
              </div>
              <input
                type="range"
                min="0"
                max="20000"
                step="1000"
                value={minAmount}
                onChange={(e) => setMinAmount(Number(e.target.value))}
                className="w-full accent-indigo-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-500">
                <span>$0</span>
                <span>$10k</span>
                <span>$20k+</span>
              </div>
            </div>

            {/* Trust Box */}
            <div className="pt-4 border-t border-slate-800/60 text-xs text-slate-400 space-y-2">
              <div className="flex items-center gap-2 text-emerald-400 font-medium">
                <ShieldCheck className="w-4 h-4 shrink-0" />
                <span>Zero Application Scams</span>
              </div>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                Premio filters out commercial sweepstakes, loan marketing, and pay-to-apply listings.
              </p>
            </div>
          </aside>

          {/* Scholarship Cards Grid */}
          <main className="lg:col-span-9 space-y-4">
            {filteredScholarships.length === 0 ? (
              <div className="p-12 text-center rounded-2xl bg-slate-900/40 border border-slate-800 space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center mx-auto">
                  <Search className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-white">No Scholarships Matched</h3>
                <p className="text-sm text-slate-400 max-w-md mx-auto">
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
                  className="rounded-xl border-slate-700 text-white cursor-pointer"
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
                      className="group bg-slate-900/60 hover:bg-slate-900 border-slate-800/90 hover:border-indigo-500/40 transition-all duration-200 cursor-pointer rounded-2xl overflow-hidden shadow-lg hover:shadow-indigo-950/40 flex flex-col justify-between"
                    >
                      <CardHeader className="p-5 pb-3">
                        <div className="flex items-start justify-between gap-3">
                          <Badge 
                            variant="secondary" 
                            className="bg-indigo-500/15 text-indigo-300 hover:bg-indigo-500/25 border-indigo-500/30 text-[11px] font-semibold py-0.5 px-2.5 rounded-full"
                          >
                            {sch.category}
                          </Badge>

                          <div className="flex items-center gap-1.5">
                            {/* Match score badge */}
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                              <Sparkles className="w-3 h-3" />
                              {sch.matchScore}% Match
                            </span>

                            {/* Bookmark button */}
                            <button
                              onClick={(e) => toggleSave(sch.id, e)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-amber-300 hover:bg-slate-800 transition-colors cursor-pointer"
                              title={isSaved ? "Remove from saved" : "Save scholarship"}
                            >
                              {isSaved ? (
                                <BookmarkCheck className="w-4 h-4 text-amber-300 fill-amber-300/30" />
                              ) : (
                                <Bookmark className="w-4 h-4" />
                              )}
                            </button>
                          </div>
                        </div>

                        <CardTitle className="text-base sm:text-lg font-bold text-white group-hover:text-indigo-300 transition-colors line-clamp-1 mt-2">
                          {sch.title}
                        </CardTitle>
                        <CardDescription className="text-xs text-slate-400 line-clamp-1">
                          {sch.organization}
                        </CardDescription>
                      </CardHeader>

                      <CardContent className="p-5 pt-0 pb-4 space-y-3 flex-1">
                        {/* Award & Deadline Highlights */}
                        <div className="grid grid-cols-2 gap-2 p-3 rounded-xl bg-slate-950/60 border border-slate-800/80">
                          <div>
                            <span className="text-[10px] text-slate-500 font-medium block">Award Amount</span>
                            <span className="text-base font-extrabold text-amber-300 font-mono">
                              {sch.formattedAmount}
                            </span>
                          </div>
                          <div>
                            <span className="text-[10px] text-slate-500 font-medium block">Deadline</span>
                            <span className="text-xs font-semibold text-slate-300 flex items-center gap-1 mt-0.5">
                              <Clock className="w-3 h-3 text-indigo-400" />
                              {sch.daysLeft} days left
                            </span>
                          </div>
                        </div>

                        <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed">
                          {sch.description}
                        </p>

                        {/* Requirements chips */}
                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {sch.minGpa && (
                            <span className="text-[10px] px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 font-medium border border-slate-700">
                              Min {sch.minGpa} GPA
                            </span>
                          )}
                          {!sch.requirements.essay ? (
                            <span className="text-[10px] px-2 py-0.5 rounded-md bg-emerald-950/60 text-emerald-300 font-medium border border-emerald-800/50">
                              No Essay
                            </span>
                          ) : (
                            <span className="text-[10px] px-2 py-0.5 rounded-md bg-slate-800 text-slate-400 font-medium">
                              Essay Required
                            </span>
                          )}
                          {sch.renewable && (
                            <span className="text-[10px] px-2 py-0.5 rounded-md bg-violet-950/60 text-violet-300 font-medium border border-violet-800/50">
                              Renewable
                            </span>
                          )}
                        </div>
                      </CardContent>

                      <CardFooter className="p-5 pt-0 border-t border-slate-800/60 mt-auto flex items-center justify-between text-xs text-slate-400">
                        <span className="text-[11px] text-slate-500">
                          {sch.awardsAvailable} awards offered
                        </span>
                        <span className="inline-flex items-center gap-1 font-semibold text-indigo-400 group-hover:text-indigo-300 group-hover:translate-x-0.5 transition-all">
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
          <DialogContent className="max-w-2xl bg-slate-900 border-slate-800 text-slate-100 p-0 overflow-hidden max-h-[90vh] flex flex-col rounded-2xl shadow-2xl">
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-800 bg-slate-950/50 relative">
              <div className="flex items-center justify-between gap-4 mb-2">
                <Badge className="bg-indigo-500/20 text-indigo-300 border-indigo-500/30 text-xs">
                  {activeModalScholarship.category}
                </Badge>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/15 text-emerald-400 text-xs font-bold border border-emerald-500/30">
                  <Sparkles className="w-3.5 h-3.5" />
                  {activeModalScholarship.matchScore}% Match for you
                </span>
              </div>
              <DialogTitle className="text-xl sm:text-2xl font-bold text-white">
                {activeModalScholarship.title}
              </DialogTitle>
              <DialogDescription className="text-sm text-slate-400 mt-1">
                Offered by {activeModalScholarship.organization} • Last verified {activeModalScholarship.lastVerifiedDate}
              </DialogDescription>

              {/* Key Metrics Bar */}
              <div className="grid grid-cols-3 gap-3 mt-5 p-3 rounded-xl bg-slate-900 border border-slate-800 text-center">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-medium">Award</span>
                  <p className="text-lg font-black text-amber-300 font-mono">
                    {activeModalScholarship.formattedAmount}
                  </p>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-medium">Deadline</span>
                  <p className="text-xs font-bold text-white mt-1">
                    {activeModalScholarship.deadline}
                  </p>
                  <span className="text-[10px] text-indigo-400">({activeModalScholarship.daysLeft} days)</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-medium">Competition</span>
                  <p className="text-xs font-bold text-slate-200 mt-1">
                    {activeModalScholarship.competitionLevel}
                  </p>
                </div>
              </div>
            </div>

            {/* Modal Body (Scrollable) */}
            <div className="p-6 overflow-y-auto space-y-6 text-sm">
              {/* Description */}
              <div>
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Overview</h4>
                <p className="text-slate-300 leading-relaxed">{activeModalScholarship.description}</p>
              </div>

              {/* Why You Match AI Breakdown */}
              <div className="p-4 rounded-xl bg-indigo-950/30 border border-indigo-500/30 space-y-2">
                <h4 className="text-xs font-bold text-indigo-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                  Why Premio Thinks You Match
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

              {/* Eligibility Criteria */}
              <div>
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Eligibility Criteria</h4>
                <ul className="space-y-2">
                  {activeModalScholarship.eligibility.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-xs text-slate-300">
                      <span className="w-1.5 h-1.5 rounded-full bg-slate-500 mt-1.5 shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Application Requirements */}
              <div>
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Requirements Checklist</h4>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800 flex items-center justify-between">
                    <span className="text-slate-400">Essay</span>
                    <span className={`font-semibold ${activeModalScholarship.requirements.essay ? "text-amber-300" : "text-emerald-400"}`}>
                      {activeModalScholarship.requirements.essay ? "Required" : "No Essay"}
                    </span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800 flex items-center justify-between">
                    <span className="text-slate-400">Recommendations</span>
                    <span className="font-semibold text-slate-200">
                      {activeModalScholarship.requirements.recommendationLetters} Letters
                    </span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800 flex items-center justify-between">
                    <span className="text-slate-400">Transcript</span>
                    <span className="font-semibold text-slate-200">
                      {activeModalScholarship.requirements.transcriptRequired ? "Official/Unofficial" : "Not Required"}
                    </span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800 flex items-center justify-between">
                    <span className="text-slate-400">Resume / CV</span>
                    <span className="font-semibold text-slate-200">
                      {activeModalScholarship.requirements.resumeRequired ? "Required" : "Optional"}
                    </span>
                  </div>
                </div>

                {activeModalScholarship.requirements.essayPrompt && (
                  <div className="mt-3 p-3 rounded-lg bg-slate-950/80 border border-slate-800 text-xs">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Essay Prompt</span>
                    <p className="text-slate-300 italic">"{activeModalScholarship.requirements.essayPrompt}"</p>
                  </div>
                )}
              </div>
            </div>

            {/* Modal Footer Actions */}
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
                  <Button variant="secondary" size="sm" className="rounded-xl bg-slate-800 text-slate-200 hover:bg-slate-700 cursor-pointer">
                    Track in Dashboard
                  </Button>
                </Link>

                <Button
                  size="sm"
                  className="rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold shadow-lg shadow-indigo-600/30 gap-1.5 cursor-pointer"
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
