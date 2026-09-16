"use client";

import React, { useState, useMemo } from "react";
import { useResumeStore } from "@/lib/stores/resume-store";
import {
  analyzeKeywordDensity,
  type KeywordMatch,
} from "@/lib/ats/keyword-heatmap";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Search,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Plus,
  Flame,
  Filter,
  BarChart3,
  HelpCircle,
} from "lucide-react";
import { toast } from "sonner";

interface AtsKeywordHeatmapProps {
  initialJobDescription?: string;
  className?: string;
}

export function AtsKeywordHeatmap({
  initialJobDescription = "",
  className = "",
}: AtsKeywordHeatmapProps) {
  const [jobDescription, setJobDescription] = useState(initialJobDescription);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");

  const {
    profile,
    workExperiences,
    education,
    skills,
    projects,
    certifications,
    addSkill,
  } = useResumeStore();

  const currentResumeData = useMemo(() => {
    return {
      profile,
      workExperiences,
      education,
      skills,
      projects,
      certifications,
    };
  }, [profile, workExperiences, education, skills, projects, certifications]);

  const report = useMemo(() => {
    return analyzeKeywordDensity(currentResumeData, jobDescription);
  }, [currentResumeData, jobDescription]);

  // Filter keywords based on search and category
  const filteredKeywords = useMemo(() => {
    return report.keywords.filter((item) => {
      const matchesSearch = item.term.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory =
        categoryFilter === "all" ||
        item.category === categoryFilter ||
        (categoryFilter === "missing" && item.status === "missing") ||
        (categoryFilter === "matched" && item.status === "matched") ||
        (categoryFilter === "overused" && item.status === "overused");

      return matchesSearch && matchesCategory;
    });
  }, [report.keywords, searchQuery, categoryFilter]);

  const handleAddMissingSkill = (term: string) => {
    // Capitalize term nicely
    const formattedTerm = term.charAt(0).toUpperCase() + term.slice(1);
    addSkill({
      name: formattedTerm,
      category: "Technical Skills",
      proficiency_level: 3,
    });
    toast.success(`Added '${formattedTerm}' to your Skills!`);
  };

  const scoreColor =
    report.matchScore >= 80
      ? "text-emerald-700 bg-emerald-50 border-emerald-300"
      : report.matchScore >= 50
      ? "text-amber-700 bg-amber-50 border-amber-300"
      : "text-rose-700 bg-rose-50 border-rose-300";

  return (
    <div className={`space-y-4 text-neutral-900 ${className}`}>
      {/* Header Metric Summary Bar */}
      <div className="p-4 bg-white border border-neutral-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className={`w-14 h-14 border-2 flex flex-col items-center justify-center font-bold shrink-0 ${scoreColor}`}>
            <span className="text-xl leading-none">{report.matchScore}%</span>
            <span className="text-[9px] uppercase tracking-wider font-mono">Match</span>
          </div>
          <div>
            <h3 className="text-sm font-bold text-neutral-900 flex items-center gap-1.5">
              <Flame className="w-4 h-4 text-orange-500" />
              ATS Keyword Density & Heatmap
            </h3>
            <p className="text-xs text-neutral-500">
              {report.totalWordCount} total words · {report.matchedCount} matched ·{" "}
              <span className="text-rose-600 font-semibold">{report.missingCount} missing</span>
              {report.overusedCount > 0 && (
                <span className="text-amber-600 font-semibold"> · {report.overusedCount} overused</span>
              )}
            </p>
          </div>
        </div>

        {report.stuffingRisk && (
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 border border-amber-300 text-amber-800 text-xs">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>Keyword stuffing detected (&gt;4% density). Modern ATS may penalize repetition.</span>
          </div>
        )}
      </div>

      {/* Target Job Description Comparator Input */}
      <div className="bg-neutral-50 p-3.5 border border-neutral-200 space-y-2">
        <label className="text-xs font-bold text-neutral-700 flex items-center justify-between">
          <span>Target Job Description (Paste to compare in real time):</span>
          {jobDescription && (
            <button
              onClick={() => setJobDescription("")}
              className="text-[11px] text-neutral-500 hover:text-neutral-900 underline"
            >
              Clear
            </button>
          )}
        </label>
        <Textarea
          value={jobDescription}
          onChange={(e) => setJobDescription(e.target.value)}
          placeholder="Paste requirements, job qualifications, or full job posting text here to scan for missing keywords..."
          className="h-20 text-xs bg-white border-neutral-300 rounded-none focus-visible:ring-1"
        />
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
        <div className="flex items-center gap-1.5 flex-wrap">
          {[
            { id: "all", label: "All Terms" },
            { id: "missing", label: `Missing (${report.missingCount})` },
            { id: "matched", label: `Matched (${report.matchedCount})` },
            { id: "hard_skill", label: "Languages" },
            { id: "framework_tool", label: "Frameworks" },
            { id: "cloud_devops", label: "DevOps" },
            { id: "soft_skill", label: "Soft Skills" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setCategoryFilter(tab.id)}
              className={`px-2.5 py-1 text-xs font-semibold transition-colors border ${
                categoryFilter === tab.id
                  ? "bg-[#102b2b] text-white border-[#102b2b]"
                  : "bg-white text-neutral-600 border-neutral-200 hover:bg-neutral-100"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-48">
          <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-neutral-400" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search keywords..."
            className="pl-8 h-8 text-xs rounded-none bg-white border-neutral-300"
          />
        </div>
      </div>

      {/* Keyword Heatmap Badge Cloud */}
      <div className="p-4 bg-white border border-neutral-200 min-h-[160px]">
        {filteredKeywords.length === 0 ? (
          <div className="text-center py-8 text-neutral-400 text-xs">
            No keywords match the current filter or search criteria.
          </div>
        ) : (
          <div className="flex flex-wrap gap-2">
            {filteredKeywords.map((item) => {
              if (item.status === "overused") {
                return (
                  <div
                    key={item.term}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-amber-50 border border-amber-300 text-amber-800 text-xs font-medium"
                    title={item.suggestedAction}
                  >
                    <AlertTriangle className="w-3 h-3 text-amber-600" />
                    <span>{item.term}</span>
                    <span className="font-mono text-[10px] bg-amber-200/60 px-1 py-0.2">
                      {item.occurrences}x ({item.densityPercent}%)
                    </span>
                  </div>
                );
              }

              if (item.status === "missing") {
                return (
                  <div
                    key={item.term}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-rose-50 border border-dashed border-rose-300 text-rose-800 text-xs font-medium group"
                    title={item.suggestedAction}
                  >
                    <XCircle className="w-3 h-3 text-rose-500" />
                    <span>{item.term}</span>
                    <button
                      onClick={() => handleAddMissingSkill(item.term)}
                      className="ml-1 p-0.5 hover:bg-rose-200 text-rose-700 transition-colors"
                      title="Add to resume skills"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                );
              }

              return (
                <div
                  key={item.term}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs font-medium"
                >
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                  <span>{item.term}</span>
                  <span className="font-mono text-[10px] bg-emerald-200/60 px-1 py-0.2">
                    {item.occurrences}x ({item.densityPercent}%)
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Pro ATS Tip Footer */}
      <div className="p-3 bg-neutral-100 border border-neutral-200 text-[11px] text-neutral-600 flex items-start gap-2">
        <HelpCircle className="w-4 h-4 text-neutral-500 shrink-0 mt-0.5" />
        <div>
          <span className="font-bold text-neutral-800">ATS Best Practice:</span> Aim for a 70%+ match rate on target keywords while keeping individual term densities below 3.5%. Never hide white-on-white text keywords, as modern applicant tracking systems parse OCR text streams directly.
        </div>
      </div>
    </div>
  );
}
