"use client";

import React, { useState, useMemo } from "react";
import { useResumeStore } from "@/lib/stores/resume-store";
import { calculateResumeStrength, ChecklistItem } from "@/lib/utils/resume-strength";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  CheckCircle2,
  AlertCircle,
  Sparkles,
  ArrowRight,
  TrendingUp,
  Target,
  FileCheck,
  Search,
  Loader2,
  ChevronRight,
  Info,
} from "lucide-react";
import { toast } from "sonner";

interface ResumeStrengthMeterProps {
  onNavigateTab?: (tab: string) => void;
  className?: string;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function ResumeStrengthMeter({
  onNavigateTab,
  className,
  open: controlledOpen,
  onOpenChange: controlledOnOpenChange,
}: ResumeStrengthMeterProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const isControlled = typeof controlledOpen === "boolean";
  const isOpen = isControlled ? controlledOpen : internalOpen;
  const setIsOpen = (open: boolean) => {
    if (controlledOnOpenChange) controlledOnOpenChange(open);
    else setInternalOpen(open);
  };
  const [activeFilter, setActiveFilter] = useState<"all" | "missing" | "passed">("all");
  const [jobDescription, setJobDescription] = useState("");
  const [isScanningATS, setIsScanningATS] = useState(false);
  const [atsResult, setAtsResult] = useState<{
    score: number;
    breakdown: Array<{ category: string; score: number; feedback: string[] }>;
    missingKeywords: string[];
    overallFeedback: string;
  } | null>(null);

  const {
    profile,
    workExperiences,
    education,
    skills,
    projects,
    certifications,
    addSkill,
  } = useResumeStore();

  const report = useMemo(() => {
    return calculateResumeStrength({
      profile,
      workExperiences,
      education,
      skills,
      projects,
      certifications,
    });
  }, [profile, workExperiences, education, skills, projects, certifications]);

  const filteredChecklist = useMemo(() => {
    if (activeFilter === "missing") {
      return report.checklist.filter((i) => !i.passed);
    }
    if (activeFilter === "passed") {
      return report.checklist.filter((i) => i.passed);
    }
    return report.checklist;
  }, [report.checklist, activeFilter]);

  const handleItemClick = (item: ChecklistItem) => {
    if (onNavigateTab) {
      onNavigateTab(item.targetTab);
      setIsOpen(false);
    }
  };

  const handleRunAtsScan = async () => {
    setIsScanningATS(true);
    try {
      const response = await fetch("/api/ai/ats-score", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          resumeData: {
            profile,
            workExperiences,
            education,
            skills,
            projects,
            certifications,
          },
          jobDescription: jobDescription.trim() || undefined,
        }),
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.message || "Failed to analyze ATS score");
      }

      const data = await response.json();
      setAtsResult(data);
      toast.success("AI ATS scan completed!");
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || "Could not complete ATS scan");
    } finally {
      setIsScanningATS(false);
    }
  };

  const handleAddMissingKeyword = (keyword: string) => {
    addSkill({
      name: keyword,
      category: "Technical Skills",
      proficiency_level: 3,
    });
    toast.success(`Added "${keyword}" to skills!`);
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className={`h-10 gap-2.5 rounded-none border border-[#102b2b]/20 bg-white/95 px-3 font-mono text-xs font-bold text-[#102b2b] shadow-sm transition-all hover:bg-white hover:border-[#102b2b] ${className}`}
        >
          {/* Circular SVG gauge indicator */}
          <div className="relative flex h-5 w-5 items-center justify-center">
            <svg className="h-5 w-5 -rotate-90" viewBox="0 0 36 36">
              <path
                className="text-[#102b2b]/15"
                strokeWidth="4"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <path
                className={
                  report.overallScore >= 75
                    ? "text-[#0d8274]"
                    : report.overallScore >= 50
                    ? "text-amber-500"
                    : "text-rose-500"
                }
                strokeDasharray={`${report.overallScore}, 100`}
                strokeWidth="4"
                strokeLinecap="round"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
            </svg>
          </div>
          <span className="hidden sm:inline uppercase tracking-wider text-[11px] font-black text-[#52716a]">
            Score:
          </span>
          <span className="font-extrabold text-[#102b2b]">
            {report.overallScore}%
          </span>
          <span
            className={`hidden md:inline-block h-2 w-2 rounded-full ${
              report.overallScore >= 75
                ? "bg-[#0d8274]"
                : report.overallScore >= 50
                ? "bg-amber-400"
                : "bg-rose-500"
            }`}
          />
        </Button>
      </SheetTrigger>

      <SheetContent
        side="right"
        className="w-full sm:max-w-xl p-0 bg-[#f8f4ec] border-l border-[#102b2b]/15 flex flex-col h-full overflow-hidden"
      >
        <SheetHeader className="bg-[#102b2b] text-[#f8f4ec] p-6 border-b border-[#102b2b]/10 shrink-0">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <Target className="h-4 w-4 text-[#d8f36b]" />
                <span className="text-[10px] font-black uppercase tracking-widest text-[#d8f36b]">
                  Real-Time Audit
                </span>
              </div>
              <SheetTitle className="text-xl font-black uppercase tracking-tight text-white mt-1">
                Resume Strength & ATS
              </SheetTitle>
              <SheetDescription className="text-xs text-[#a6c0b8] mt-0.5">
                Instant grading and actionable checklist to maximize interview callbacks
              </SheetDescription>
            </div>
            <div className="text-right">
              <div className="text-3xl font-black text-[#d8f36b] font-mono">
                {report.overallScore}%
              </div>
              <div className="text-[10px] uppercase font-bold text-[#a6c0b8]">
                Overall Score
              </div>
            </div>
          </div>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Score Hero Summary Card */}
          <div className={`p-4 rounded-none border ${report.tierBg} space-y-3`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-[#102b2b]">Current Standing:</span>
                <Badge
                  variant="outline"
                  className="rounded-none border-[#102b2b]/20 bg-white/80 font-bold uppercase text-[10px] tracking-wider text-[#102b2b]"
                >
                  {report.tierLabel}
                </Badge>
              </div>
              <span className="text-xs text-[#52716a] font-semibold">
                {report.completedCount} of {report.checklist.length} passed
              </span>
            </div>

            <Progress
              value={report.overallScore}
              className="h-2 rounded-none bg-black/10"
            />

            <p className="text-xs text-[#52716a] leading-relaxed">
              {report.overallScore >= 90
                ? "Outstanding! Your resume incorporates comprehensive contact details, quantifiable achievement metrics, action verbs, and core skills that pass ATS filters."
                : report.overallScore >= 75
                ? "Great progress. Your resume is well-structured and ready for review. Follow the quick suggestions below to hit top tier status."
                : report.overallScore >= 50
                ? "Good baseline. Adding quantifiable metrics (%, $) to your work experience and reaching 6+ skills will significantly boost your recruiter match rate."
                : "Getting started. Fill in key sections like contact information, professional summary, and job history to ensure ATS compatibility."}
            </p>
          </div>

          {/* Category Breakdown Bar Chart */}
          <div className="space-y-3 bg-white/70 p-4 border border-[#102b2b]/10 rounded-none">
            <h4 className="text-xs font-black uppercase tracking-wider text-[#102b2b] flex items-center gap-2">
              <TrendingUp className="h-3.5 w-3.5 text-[#0d8274]" />
              Category Score Breakdown
            </h4>

            <div className="space-y-2.5 pt-1">
              {Object.entries(report.categoryScores).map(([key, cat]) => (
                <div key={key} className="space-y-1">
                  <div className="flex justify-between text-xs font-semibold text-[#102b2b]">
                    <span>{cat.name}</span>
                    <span className="font-mono text-[11px] text-[#52716a]">
                      {cat.score} / {cat.maxScore} pts
                    </span>
                  </div>
                  <div className="h-1.5 w-full bg-black/5 rounded-none overflow-hidden">
                    <div
                      className={`h-full transition-all duration-300 ${
                        cat.percentage >= 80
                          ? "bg-[#0d8274]"
                          : cat.percentage >= 50
                          ? "bg-amber-500"
                          : "bg-rose-500"
                      }`}
                      style={{ width: `${cat.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Actionable Checklist Section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-black uppercase tracking-wider text-[#102b2b] flex items-center gap-2">
                <FileCheck className="h-3.5 w-3.5 text-[#0d8274]" />
                Interactive Optimization Checklist
              </h4>
              <span className="text-[11px] text-[#52716a] font-bold">
                {report.missingCount} remaining
              </span>
            </div>

            <Tabs
              value={activeFilter}
              onValueChange={(v) => setActiveFilter(v as any)}
              className="w-full"
            >
              <TabsList className="grid w-full grid-cols-3 rounded-none bg-white/80 border border-[#102b2b]/10 p-1">
                <TabsTrigger
                  value="all"
                  className="rounded-none text-xs font-bold text-[#52716a] data-[state=active]:bg-[#102b2b] data-[state=active]:text-white"
                >
                  All ({report.checklist.length})
                </TabsTrigger>
                <TabsTrigger
                  value="missing"
                  className="rounded-none text-xs font-bold text-[#52716a] data-[state=active]:bg-[#102b2b] data-[state=active]:text-white"
                >
                  To Improve ({report.missingCount})
                </TabsTrigger>
                <TabsTrigger
                  value="passed"
                  className="rounded-none text-xs font-bold text-[#52716a] data-[state=active]:bg-[#102b2b] data-[state=active]:text-white"
                >
                  Completed ({report.completedCount})
                </TabsTrigger>
              </TabsList>
            </Tabs>

            <div className="space-y-2.5 pt-1">
              {filteredChecklist.map((item) => (
                <div
                  key={item.id}
                  className={`p-3.5 border rounded-none transition-all flex items-start justify-between gap-3 ${
                    item.passed
                      ? "bg-white/40 border-[#102b2b]/10"
                      : "bg-white border-[#102b2b]/20 shadow-xs hover:border-[#102b2b]"
                  }`}
                >
                  <div className="flex items-start gap-2.5 flex-1 min-w-0">
                    {item.passed ? (
                      <CheckCircle2 className="h-4 w-4 text-[#0d8274] shrink-0 mt-0.5" />
                    ) : (
                      <AlertCircle className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                    )}
                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span
                          className={`text-xs font-bold ${
                            item.passed ? "text-[#52716a]" : "text-[#102b2b]"
                          }`}
                        >
                          {item.title}
                        </span>
                        <span className="text-[10px] font-mono text-[#52716a]">
                          +{item.points} pts
                        </span>
                      </div>
                      <p className="text-[11px] text-[#52716a] leading-relaxed">
                        {item.description}
                      </p>
                      {item.tip && !item.passed && (
                        <div className="flex items-start gap-1 text-[10px] text-[#0d8274] font-medium mt-1 bg-[#0d8274]/5 p-1.5 border border-[#0d8274]/15 rounded-none">
                          <Info className="h-3 w-3 shrink-0 mt-0.5" />
                          <span>{item.tip}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {!item.passed && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleItemClick(item)}
                      className="shrink-0 h-8 gap-1 rounded-none border-[#102b2b]/20 bg-[#f8f4ec] hover:bg-[#d8f36b]/40 text-[#102b2b] text-[11px] font-bold"
                    >
                      Fix Now
                      <ChevronRight className="h-3 w-3" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Deep AI ATS Audit Section */}
          <div className="border border-[#102b2b]/15 bg-white p-4 rounded-none space-y-3.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-indigo-600" />
                <h4 className="text-xs font-black uppercase tracking-wider text-[#102b2b]">
                  Deep AI ATS Keyword Scanner
                </h4>
              </div>
              <Badge
                variant="secondary"
                className="rounded-none bg-[#d8f36b]/30 text-[#102b2b] font-mono text-[9px] uppercase font-bold"
              >
                AI Powered
              </Badge>
            </div>

            <p className="text-xs text-[#52716a]">
              Optionally paste a target job description to verify keyword matching and ATS readability.
            </p>

            <textarea
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              placeholder="Paste target job description here (optional)..."
              rows={3}
              className="w-full text-xs p-2.5 rounded-none border border-[#102b2b]/15 bg-[#f8f4ec]/50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#102b2b]"
            />

            <Button
              onClick={handleRunAtsScan}
              disabled={isScanningATS}
              className="w-full h-10 rounded-none bg-[#102b2b] hover:bg-[#0d8274] text-white font-bold text-xs gap-2"
            >
              {isScanningATS ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Running AI ATS Audit...
                </>
              ) : (
                <>
                  <Search className="h-4 w-4" />
                  Run AI ATS Compatibility Scan
                </>
              )}
            </Button>

            {atsResult && (
              <div className="mt-4 pt-4 border-t border-[#102b2b]/10 space-y-3 animate-in fade-in">
                <div className="flex items-center justify-between bg-[#f8f4ec] p-3 border border-[#102b2b]/10 rounded-none">
                  <div>
                    <span className="text-[10px] font-bold text-[#52716a] uppercase tracking-wider block">
                      AI Compatibility Score
                    </span>
                    <span className="text-2xl font-black text-[#102b2b] font-mono">
                      {atsResult.score}%
                    </span>
                  </div>
                  <Badge
                    className={`rounded-none uppercase font-bold text-[10px] ${
                      atsResult.score >= 80
                        ? "bg-[#0d8274] text-white"
                        : atsResult.score >= 65
                        ? "bg-amber-500 text-white"
                        : "bg-rose-500 text-white"
                    }`}
                  >
                    {atsResult.score >= 80
                      ? "High Match"
                      : atsResult.score >= 65
                      ? "Moderate Match"
                      : "Low Match"}
                  </Badge>
                </div>

                {atsResult.missingKeywords && atsResult.missingKeywords.length > 0 && (
                  <div className="space-y-2">
                    <span className="text-[11px] font-bold text-[#102b2b] block">
                      Missing Keywords (Click to add to Skills):
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {atsResult.missingKeywords.map((kw) => (
                        <button
                          key={kw}
                          onClick={() => handleAddMissingKeyword(kw)}
                          className="text-[11px] font-semibold bg-[#102b2b]/5 hover:bg-[#d8f36b]/40 text-[#102b2b] border border-[#102b2b]/15 px-2 py-1 rounded-none transition-colors flex items-center gap-1"
                        >
                          + {kw}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {atsResult.overallFeedback && (
                  <div className="bg-[#f8f4ec] p-3 border border-[#102b2b]/10 rounded-none text-xs text-[#102b2b] space-y-1">
                    <span className="font-bold block text-[10px] uppercase tracking-wider text-[#52716a]">
                      Executive Feedback
                    </span>
                    <p className="leading-relaxed text-[#52716a]">
                      {atsResult.overallFeedback}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
