"use client";

import React, { useState, useEffect, useRef } from "react";
import { 
  Briefcase, 
  Search, 
  Sparkles, 
  MapPin, 
  DollarSign, 
  ExternalLink, 
  BookmarkCheck, 
  Bookmark, 
  Loader2, 
  ChevronRight, 
  ChevronLeft,
  ChevronsLeft,
  ChevronsRight,
  LayoutGrid,
  List,
  ArrowUpDown,
  Building,
  CheckCircle2,
  AlertCircle,
  FileText,
  Plus,
  Zap,
  TrendingUp,
  Share2
} from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { ScrapedJob } from "@/lib/scrapers/jobs-scraper";

export default function DashboardJobsPage() {
  const router = useRouter();
  const listingsRef = useRef<HTMLDivElement>(null);

  // Data States
  const [jobs, setJobs] = useState<ScrapedJob[]>([]);
  const [resumes, setResumes] = useState<{ id: string; title: string }[]>([]);
  const [selectedResumeId, setSelectedResumeId] = useState<string>("");
  const [activeResumeTitle, setActiveResumeTitle] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [scraping, setScraping] = useState(false);

  // Search & Filter Inputs
  const [searchRole, setSearchRole] = useState("");
  const [searchLocation, setSearchLocation] = useState("Remote");
  const [selectedTab, setSelectedTab] = useState<string>("all");
  const [savedJobIds, setSavedJobIds] = useState<string[]>([]);
  const [trackedJobIds, setTrackedJobIds] = useState<string[]>([]);

  // Toolbar States
  const [pageSize, setPageSize] = useState<number | "all">(12);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState<"match" | "salary_desc" | "newest">("match");
  const [minSalary, setMinSalary] = useState<"all" | "100000" | "120000" | "150000">("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  // Tailor Dialog States
  const [tailorModalJob, setTailorModalJob] = useState<ScrapedJob | null>(null);
  const [tailoringInProgress, setTailoringInProgress] = useState(false);
  const [tailorSuccessData, setTailorSuccessData] = useState<{
    newResumeId: string;
    newResumeTitle: string;
    tailoredSummary: string;
    appliedChanges: string[];
  } | null>(null);

  // Load Saved jobs from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem("resumeforge_saved_jobs");
      if (saved) {
        setSavedJobIds(JSON.parse(saved));
      }
    } catch {
      // ignore
    }
  }, []);

  const handleToggleSaveJob = (jobId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setSavedJobIds((prev) => {
      const isSaved = prev.includes(jobId);
      const next = isSaved ? prev.filter(id => id !== jobId) : [...prev, jobId];
      try {
        localStorage.setItem("resumeforge_saved_jobs", JSON.stringify(next));
      } catch {
        // ignore
      }
      toast.success(isSaved ? "Removed from saved jobs" : "Saved job opportunity!");
      return next;
    });
  };

  // Fetch Jobs Feed
  const fetchFeed = async (resumeId?: string, queryParam?: string, locParam?: string) => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (resumeId) params.set("resumeId", resumeId);
      if (queryParam) params.set("query", queryParam);
      if (locParam) params.set("location", locParam);

      const res = await fetch(`/api/jobs/feed?${params.toString()}`);
      if (!res.ok) throw new Error("Failed to load jobs feed");

      const data = await res.json();
      setJobs(data.jobs || []);
      setResumes(data.resumes || []);
      if (data.activeResume) {
        setSelectedResumeId(data.activeResume.id);
        setActiveResumeTitle(data.activeResume.title);
        if (!searchRole) setSearchRole(data.activeResume.targetRole || "Software Engineer");
      }

      // Populate already tracked jobs
      const tracked = (data.jobs || [])
        .filter((j: any) => j.is_tracked)
        .map((j: any) => j.id);
      setTrackedJobIds(tracked);
    } catch (err: any) {
      console.error(err);
      toast.error("Could not load job matches.");
    } finally {
      setLoading(false);
      setScraping(false);
    }
  };

  useEffect(() => {
    fetchFeed();
  }, []);

  const handleResumeSwitch = (newResumeId: string) => {
    setSelectedResumeId(newResumeId);
    const resumeObj = resumes.find(r => r.id === newResumeId);
    if (resumeObj) setActiveResumeTitle(resumeObj.title);
    fetchFeed(newResumeId, searchRole, searchLocation);
  };

  const handleSearchLive = () => {
    setScraping(true);
    fetchFeed(selectedResumeId, searchRole, searchLocation);
  };

  // Add Job to Kanban Tracker
  const handleAddToTracker = async (job: ScrapedJob, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    try {
      const res = await fetch("/api/tracker/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          company: job.company,
          role: job.role,
          url: job.url,
          location: job.location,
          salary_range: job.salary_range,
        }),
      });

      if (!res.ok) throw new Error("Failed to add job to tracker");
      setTrackedJobIds((prev) => [...prev, job.id]);
      toast.success(`Added ${job.role} at ${job.company} to your Job Tracker!`);
    } catch (err: any) {
      toast.error("Failed to add to tracker.");
    }
  };

  // Execute 1-Click Resume Auto-Tailor
  const handleExecuteTailor = async () => {
    if (!tailorModalJob || !selectedResumeId) return;

    try {
      setTailoringInProgress(true);
      const res = await fetch("/api/jobs/tailor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          resumeId: selectedResumeId,
          jobTitle: tailorModalJob.role,
          company: tailorModalJob.company,
          jobDescription: tailorModalJob.description,
          requirements: tailorModalJob.requirements,
          url: tailorModalJob.url,
          location: tailorModalJob.location,
          salaryRange: tailorModalJob.salary_range,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        if (data.error === "LIMIT_EXCEEDED") {
          toast.error(data.message || "Daily AI limit reached.");
          return;
        }
        throw new Error(data.error || "Failed to tailor resume");
      }

      setTrackedJobIds((prev) => [...prev, tailorModalJob.id]);
      setTailorSuccessData({
        newResumeId: data.newResumeId,
        newResumeTitle: data.newResumeTitle,
        tailoredSummary: data.tailoredSummary,
        appliedChanges: data.appliedChanges || [],
      });
      toast.success(`Tailored resume created for ${tailorModalJob.company}!`);
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Could not tailor resume.");
    } finally {
      setTailoringInProgress(false);
    }
  };

  // Filter & Sort Logic
  const getFilteredJobs = () => {
    const list = jobs.filter((job) => {
      // Search text match
      const text = `${job.role} ${job.company} ${job.location} ${(job.matching_skills || []).join(" ")}`.toLowerCase();
      const matchesSearch = searchRole ? text.includes(searchRole.toLowerCase()) : true;

      // Min Salary Filter
      if (minSalary !== "all") {
        const salaryVal = job.salary_max || job.salary_min || 0;
        if (salaryVal < Number(minSalary)) return false;
      }

      // Tabs
      if (selectedTab === "high-match") {
        return matchesSearch && (job.match_score || 0) >= 85;
      }
      if (selectedTab === "remote") {
        return matchesSearch && job.is_remote;
      }
      if (selectedTab === "saved") {
        return matchesSearch && savedJobIds.includes(job.id);
      }
      if (selectedTab === "tracked") {
        return matchesSearch && trackedJobIds.includes(job.id);
      }
      return matchesSearch;
    });

    return list.sort((a, b) => {
      if (sortBy === "match") {
        return (b.match_score || 80) - (a.match_score || 80);
      }
      if (sortBy === "salary_desc") {
        return (b.salary_max || b.salary_min || 0) - (a.salary_max || a.salary_min || 0);
      }
      if (sortBy === "newest") {
        return new Date(b.posted_at || 0).getTime() - new Date(a.posted_at || 0).getTime();
      }
      return 0;
    });
  };

  // Reset to page 1 on filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedTab, sortBy, minSalary, pageSize, searchRole]);

  const filteredJobs = getFilteredJobs();
  const totalFiltered = filteredJobs.length;
  const numericPageSize = pageSize === "all" ? totalFiltered : Number(pageSize);
  const totalPages = Math.max(1, Math.ceil(totalFiltered / (numericPageSize || 1)));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const startIndex = (safeCurrentPage - 1) * numericPageSize;
  const endIndex = pageSize === "all" ? totalFiltered : Math.min(startIndex + numericPageSize, totalFiltered);
  const paginatedJobs = pageSize === "all" ? filteredJobs : filteredJobs.slice(startIndex, endIndex);

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
    if (listingsRef.current) {
      listingsRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      if (safeCurrentPage <= 4) {
        pages.push(1, 2, 3, 4, 5, "...", totalPages);
      } else if (safeCurrentPage >= totalPages - 3) {
        pages.push(1, "...", totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
      } else {
        pages.push(1, "...", safeCurrentPage - 1, safeCurrentPage, safeCurrentPage + 1, "...", totalPages);
      }
    }
    return pages;
  };

  // High match count (>85%)
  const highMatchCount = jobs.filter(j => (j.match_score || 0) >= 85).length;

  return (
    <div className="space-y-6 sm:space-y-8 pb-16 bg-[#e9eee8] text-[#102b2b]">
      {/* Executive Header Banner */}
      <div className="relative p-6 sm:p-8 rounded-md bg-[#102b2b] border border-[#102b2b] shadow-sm overflow-hidden">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-sm bg-[#d8f36b] text-[#102b2b] text-xs font-bold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>AI Opportunity Engine • Live Aggregator</span>
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-[#e9eee8] tracking-tight">
              Matched Jobs & Real-Time Feed
            </h1>
            <p className="text-xs sm:text-sm text-[#e9eee8]/75 leading-relaxed">
              Every opening is cross-referenced against your resume to calculate true ATS compatibility. 
              Generate a tailored resume clone and launch application tracking with one click.
            </p>
          </div>

          {/* Active Resume Switcher Pill */}
          <div className="p-3.5 rounded-md bg-white/10 border border-white/15 backdrop-blur-xs flex flex-col gap-2 min-w-[260px]">
            <div className="flex items-center justify-between text-[11px] text-[#e9eee8]/80">
              <span className="font-semibold flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-[#d8f36b]" />
                Target Resume:
              </span>
              <span className="text-[10px] text-[#d8f36b] font-bold">Active Scorer</span>
            </div>

            <Select value={selectedResumeId} onValueChange={handleResumeSwitch}>
              <SelectTrigger className="h-9 bg-[#f7faf5] border-none text-xs font-bold text-[#102b2b] focus:ring-1 focus:ring-[#d8f36b]">
                <SelectValue placeholder="Select a resume" />
              </SelectTrigger>
              <SelectContent className="border-[#b8c8b9]">
                {resumes.map(r => (
                  <SelectItem key={r.id} value={r.id} className="text-xs font-medium">
                    {r.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* 4-KPI Metric Strip */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mt-6 pt-6 border-t border-white/10 text-white">
          <div className="p-3 rounded-sm bg-white/5 border border-white/10">
            <span className="text-[10px] uppercase font-bold text-[#d8f36b] block">Total Matched</span>
            <span className="text-lg sm:text-2xl font-black font-mono">{jobs.length}</span>
          </div>
          <div className="p-3 rounded-sm bg-white/5 border border-white/10">
            <span className="text-[10px] uppercase font-bold text-[#d8f36b] block">85%+ High ATS Fits</span>
            <span className="text-lg sm:text-2xl font-black font-mono text-[#d8f36b]">{highMatchCount}</span>
          </div>
          <div className="p-3 rounded-sm bg-white/5 border border-white/10">
            <span className="text-[10px] uppercase font-bold text-[#d8f36b] block">Avg. Base Comp</span>
            <span className="text-lg sm:text-2xl font-black font-mono">$152,000</span>
          </div>
          <div className="p-3 rounded-sm bg-white/5 border border-white/10">
            <span className="text-[10px] uppercase font-bold text-[#d8f36b] block">In Tracker</span>
            <span className="text-lg sm:text-2xl font-black font-mono">{trackedJobIds.length}</span>
          </div>
        </div>
      </div>

      {/* Interactive Search & Scrape Toolbar */}
      <div className="p-4 sm:p-5 rounded-md bg-white border border-[#b8c8b9] flex flex-col md:flex-row gap-3 items-stretch md:items-center shadow-2xs">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-[#0d8274] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Target role or keywords (e.g. Senior Frontend Engineer, Full Stack, Product Manager)..."
            value={searchRole}
            onChange={(e) => setSearchRole(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearchLive()}
            className="w-full h-11 pl-10 pr-4 rounded-sm bg-[#f7faf5] border border-[#b8c8b9] text-xs sm:text-sm text-[#102b2b] placeholder:text-[#102b2b]/50 focus:outline-none focus:ring-2 focus:ring-[#0d8274]"
          />
        </div>

        <div className="relative w-full md:w-[220px]">
          <MapPin className="w-4 h-4 text-[#0d8274] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Location (e.g. Remote, SF, NY)..."
            value={searchLocation}
            onChange={(e) => setSearchLocation(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearchLive()}
            className="w-full h-11 pl-10 pr-4 rounded-sm bg-[#f7faf5] border border-[#b8c8b9] text-xs sm:text-sm text-[#102b2b] placeholder:text-[#102b2b]/50 focus:outline-none focus:ring-2 focus:ring-[#0d8274]"
          />
        </div>

        <Button
          onClick={handleSearchLive}
          disabled={scraping}
          className="h-11 bg-[#0d8274] hover:bg-[#102b2b] text-white px-5 font-bold rounded-sm text-xs gap-2 transition-colors cursor-pointer shrink-0"
        >
          {scraping ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Scraping Live Feed...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 text-[#d8f36b]" />
              Search & Scrape Online
            </>
          )}
        </Button>
      </div>

      {/* Primary Category Tabs & Secondary Toolbar */}
      <div className="space-y-3">
        {/* Row 1: Category Tabs */}
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
          <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full lg:w-auto">
            <TabsList className="bg-[#102b2b] border border-[#102b2b] p-1 rounded-md h-auto min-h-11 flex flex-wrap">
              <TabsTrigger value="all" className="rounded-sm text-xs px-3 data-[state=active]:bg-[#d8f36b] data-[state=active]:text-[#102b2b]">
                All Matches ({jobs.length})
              </TabsTrigger>
              <TabsTrigger value="high-match" className="rounded-sm text-xs px-3 data-[state=active]:bg-[#d8f36b] data-[state=active]:text-[#102b2b]">
                85%+ ATS Fit ({highMatchCount})
              </TabsTrigger>
              <TabsTrigger value="remote" className="rounded-sm text-xs px-3 data-[state=active]:bg-[#d8f36b] data-[state=active]:text-[#102b2b]">
                Remote Only ({jobs.filter(j => j.is_remote).length})
              </TabsTrigger>
              <TabsTrigger value="saved" className="rounded-sm text-xs px-3 data-[state=active]:bg-[#d8f36b] data-[state=active]:text-[#102b2b]">
                Saved Roles ({savedJobIds.length})
              </TabsTrigger>
              <TabsTrigger value="tracked" className="rounded-sm text-xs px-3 data-[state=active]:bg-[#d8f36b] data-[state=active]:text-[#102b2b]">
                In Tracker ({trackedJobIds.length})
              </TabsTrigger>
            </TabsList>
          </Tabs>

          <Button
            size="sm"
            variant="outline"
            onClick={() => router.push("/dashboard/tracker")}
            className="h-10 rounded-sm border-[#102b2b] bg-white text-[#102b2b] font-bold text-xs gap-1.5 hover:bg-[#e9eee8] cursor-pointer shrink-0"
          >
            <Briefcase className="w-3.5 h-3.5 text-[#0d8274]" />
            Open Kanban Tracker →
          </Button>
        </div>

        {/* Row 2: Secondary Toolbar (Sort, Min Salary, Page Size, View Switcher) */}
        <div className="p-3 rounded-md bg-white border border-[#b8c8b9] flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 text-xs shadow-2xs">
          {/* Left: Sort & Salary Filters */}
          <div className="flex items-center gap-2.5 flex-wrap">
            {/* Sort Dropdown */}
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] font-bold text-[#102b2b]/70 uppercase tracking-wider">Sort:</span>
              <Select value={sortBy} onValueChange={(val: any) => setSortBy(val)}>
                <SelectTrigger className="h-8 w-[160px] rounded-sm bg-[#f7faf5] border-[#b8c8b9] text-xs font-bold text-[#102b2b] focus:ring-1 focus:ring-[#0d8274]">
                  <ArrowUpDown className="w-3 h-3 text-[#0d8274] mr-1.5" />
                  <SelectValue placeholder="Sort By" />
                </SelectTrigger>
                <SelectContent className="rounded-sm border-[#b8c8b9]">
                  <SelectItem value="match" className="text-xs font-medium">Best ATS Fit %</SelectItem>
                  <SelectItem value="salary_desc" className="text-xs font-medium">Highest Base Salary</SelectItem>
                  <SelectItem value="newest" className="text-xs font-medium">Newest Posted</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Min Salary Filter */}
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] font-bold text-[#102b2b]/70 uppercase tracking-wider">Comp:</span>
              <Select value={minSalary} onValueChange={(val: any) => setMinSalary(val)}>
                <SelectTrigger className="h-8 w-[130px] rounded-sm bg-[#f7faf5] border-[#b8c8b9] text-xs font-bold text-[#102b2b] focus:ring-1 focus:ring-[#0d8274]">
                  <DollarSign className="w-3 h-3 text-[#0d8274] mr-1" />
                  <SelectValue placeholder="Salary" />
                </SelectTrigger>
                <SelectContent className="rounded-sm border-[#b8c8b9]">
                  <SelectItem value="all" className="text-xs font-medium">All Salaries</SelectItem>
                  <SelectItem value="150000" className="text-xs font-medium">$150k+ Min</SelectItem>
                  <SelectItem value="120000" className="text-xs font-medium">$120k+ Min</SelectItem>
                  <SelectItem value="100000" className="text-xs font-medium">$100k+ Min</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Right: Results Counter, Page Size & View Mode Switcher */}
          <div className="flex items-center justify-between md:justify-end gap-3 flex-wrap">
            {/* Range Counter */}
            <div className="text-[11px] font-semibold text-[#102b2b]/70 hidden sm:block">
              Showing <span className="font-bold text-[#102b2b]">{totalFiltered === 0 ? 0 : startIndex + 1}–{endIndex}</span> of <span className="font-bold text-[#102b2b]">{totalFiltered}</span>
            </div>

            {/* Items Per Page */}
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] font-bold text-[#102b2b]/70 uppercase tracking-wider">Show:</span>
              <Select value={String(pageSize)} onValueChange={(val) => setPageSize(val === "all" ? "all" : Number(val))}>
                <SelectTrigger className="h-8 w-[90px] rounded-sm bg-[#f7faf5] border-[#b8c8b9] text-xs font-bold text-[#102b2b] focus:ring-1 focus:ring-[#0d8274]">
                  <SelectValue placeholder="Page Size" />
                </SelectTrigger>
                <SelectContent className="rounded-sm border-[#b8c8b9]">
                  <SelectItem value="12" className="text-xs font-medium">12 / page</SelectItem>
                  <SelectItem value="24" className="text-xs font-medium">24 / page</SelectItem>
                  <SelectItem value="48" className="text-xs font-medium">48 / page</SelectItem>
                  <SelectItem value="all" className="text-xs font-medium">Show All</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* View Mode Switcher (Grid vs Compact List) */}
            <div className="flex items-center bg-[#e9eee8] p-0.5 rounded-sm border border-[#b8c8b9]">
              <button
                type="button"
                onClick={() => setViewMode("grid")}
                className={`p-1.5 rounded-xs transition-colors cursor-pointer ${
                  viewMode === "grid"
                    ? "bg-[#102b2b] text-[#d8f36b] shadow-2xs"
                    : "text-[#102b2b]/60 hover:text-[#102b2b]"
                }`}
                title="Grid View (Large Cards)"
              >
                <LayoutGrid className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setViewMode("list")}
                className={`p-1.5 rounded-xs transition-colors cursor-pointer ${
                  viewMode === "list"
                    ? "bg-[#102b2b] text-[#d8f36b] shadow-2xs"
                    : "text-[#102b2b]/60 hover:text-[#102b2b]"
                }`}
                title="Compact List View (Dense Rows)"
              >
                <List className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Anchor for smooth scroll */}
      <div ref={listingsRef} className="scroll-mt-4" />

      {/* Loading State */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <Loader2 className="w-10 h-10 text-[#0d8274] animate-spin" />
          <p className="text-sm font-semibold text-[#102b2b]/70">Scanning live opportunities and calculating ATS compatibility...</p>
        </div>
      ) : filteredJobs.length === 0 ? (
        /* Empty State */
        <div className="flex flex-col items-center justify-center p-12 text-center rounded-md bg-[#f7faf5] border-2 border-dashed border-[#b8c8b9]">
          <div className="p-4 rounded-full bg-[#0d8274]/10 mb-4">
            <Briefcase className="w-12 h-12 text-[#0d8274]" />
          </div>
          <h3 className="text-lg font-bold text-[#102b2b]">No Matching Roles Found</h3>
          <p className="text-xs text-[#102b2b]/60 max-w-sm mt-1 mb-6">
            No openings matched your active filters. Try searching for a different job title or click "Search & Scrape Online" to fetch fresh listings.
          </p>
          <Button onClick={() => { setSearchRole(""); setSelectedTab("all"); }} className="bg-[#102b2b] text-[#d8f36b] text-xs font-bold">
            Clear Filters
          </Button>
        </div>
      ) : viewMode === "grid" ? (
        /* 3-Column Card Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {paginatedJobs.map((job) => {
            const isSaved = savedJobIds.includes(job.id);
            const isTracked = trackedJobIds.includes(job.id);

            return (
              <Card
                key={job.id}
                className="bg-[#f7faf5] hover:bg-white border-[#b8c8b9] hover:border-[#0d8274] rounded-md transition-all duration-200 shadow-sm flex flex-col justify-between overflow-hidden group"
              >
                <CardHeader className="p-5 pb-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-sm bg-[#102b2b] text-[#d8f36b] font-black text-xs flex items-center justify-center uppercase shrink-0">
                        {job.company.substring(0, 2)}
                      </div>
                      <div className="min-w-0">
                        <span className="text-xs font-bold text-[#102b2b] truncate block">
                          {job.company}
                        </span>
                        <span className="text-[10px] text-[#102b2b]/60 flex items-center gap-1">
                          <MapPin className="w-2.5 h-2.5" />
                          {job.location}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      {/* ATS Score Badge */}
                      <span className={`text-[11px] font-extrabold px-2 py-0.5 rounded-sm border flex items-center gap-1 ${
                        (job.match_score || 0) >= 85
                          ? "bg-[#d8f36b] text-[#102b2b] border-[#102b2b]/15"
                          : "bg-[#e9eee8] text-[#102b2b] border-[#b8c8b9]"
                      }`}>
                        <Sparkles className="w-3 h-3" />
                        {job.match_score || 80}% Fit
                      </span>

                      {/* Bookmark Button */}
                      <button
                        onClick={(e) => handleToggleSaveJob(job.id, e)}
                        className="p-1.5 rounded-sm text-[#102b2b]/55 hover:text-[#0d8274] hover:bg-[#e9eee8] transition-colors cursor-pointer"
                        title={isSaved ? "Saved" : "Save Job"}
                      >
                        {isSaved ? (
                          <BookmarkCheck className="w-4 h-4 text-[#0d8274] fill-[#0d8274]/20" />
                        ) : (
                          <Bookmark className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  <CardTitle className="text-base font-bold text-[#102b2b] group-hover:text-[#0d8274] transition-colors line-clamp-1 mt-2.5">
                    {job.role}
                  </CardTitle>
                </CardHeader>

                <CardContent className="p-5 pt-0 pb-4 space-y-3 flex-1">
                  {/* Salary & Remote Tag */}
                  <div className="grid grid-cols-2 gap-2 p-2.5 rounded-sm bg-[#e9eee8] border border-[#b8c8b9]">
                    <div>
                      <span className="text-[10px] text-[#102b2b]/55 block uppercase font-medium">Estimated Comp</span>
                      <span className="text-sm font-bold text-[#0d8274] font-mono">{job.salary_range}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-[#102b2b]/55 block uppercase font-medium">Workplace</span>
                      <span className="text-xs font-bold text-[#102b2b]">
                        {job.is_remote ? "🌐 Remote" : "🏢 On-site / Hybrid"}
                      </span>
                    </div>
                  </div>

                  <p className="text-[11px] text-[#102b2b]/80 line-clamp-2">
                    {job.description}
                  </p>

                  {/* Skills Matching Chips */}
                  <div className="space-y-1.5 pt-1">
                    {job.matching_skills && job.matching_skills.length > 0 && (
                      <div className="flex flex-wrap gap-1 items-center">
                        <span className="text-[10px] text-[#0d8274] font-bold mr-1">Match:</span>
                        {job.matching_skills.slice(0, 3).map((s, idx) => (
                          <span key={idx} className="text-[10px] px-1.5 py-0.5 rounded-xs bg-[#0d8274]/10 text-[#0d8274] font-semibold">
                            ✓ {s}
                          </span>
                        ))}
                      </div>
                    )}
                    {job.missing_skills && job.missing_skills.length > 0 && (
                      <div className="flex flex-wrap gap-1 items-center">
                        <span className="text-[10px] text-amber-700 font-bold mr-1">Missing:</span>
                        {job.missing_skills.slice(0, 2).map((s, idx) => (
                          <span key={idx} className="text-[10px] px-1.5 py-0.5 rounded-xs bg-amber-50 border border-amber-200 text-amber-800 font-medium">
                            + {s}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </CardContent>

                <CardFooter className="p-5 pt-3 border-t border-[#b8c8b9] mt-auto flex flex-col gap-2">
                  <div className="flex items-center gap-2 w-full">
                    {/* 1-Click Auto-Tailor Action */}
                    <Button
                      size="sm"
                      onClick={() => setTailorModalJob(job)}
                      className="flex-1 h-8 bg-[#102b2b] hover:bg-[#0d8274] text-[#d8f36b] hover:text-white text-xs font-bold rounded-sm gap-1.5 cursor-pointer shadow-xs transition-colors"
                    >
                      <Zap className="w-3.5 h-3.5 fill-current text-[#d8f36b]" />
                      Auto-Tailor Resume
                    </Button>

                    {/* Apply external link */}
                    <Button
                      size="sm"
                      variant="outline"
                      asChild
                      className="h-8 px-2.5 rounded-sm border-[#b8c8b9] text-[#102b2b] hover:bg-[#e9eee8] text-xs font-semibold"
                    >
                      <a href={job.url} target="_blank" rel="noopener noreferrer" title="Apply on Company Site">
                        Apply
                        <ExternalLink className="w-3 h-3 ml-1 text-[#0d8274]" />
                      </a>
                    </Button>
                  </div>

                  <div className="flex items-center justify-between w-full pt-1 text-[11px] text-[#102b2b]/60">
                    <button
                      onClick={(e) => handleAddToTracker(job, e)}
                      className={`font-semibold transition-colors hover:text-[#0d8274] cursor-pointer flex items-center gap-1 ${
                        isTracked ? "text-[#0d8274]" : ""
                      }`}
                    >
                      {isTracked ? "✓ In Job Tracker" : "+ Add to Job Tracker"}
                    </button>
                    <span className="text-[10px]">{job.source}</span>
                  </div>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      ) : (
        /* Compact List View (Dense Rows) */
        <div className="space-y-2.5">
          {paginatedJobs.map((job) => {
            const isSaved = savedJobIds.includes(job.id);
            const isTracked = trackedJobIds.includes(job.id);

            return (
              <div
                key={job.id}
                className="p-3.5 sm:p-4 rounded-md bg-[#f7faf5] hover:bg-white border border-[#b8c8b9] hover:border-[#0d8274] transition-all duration-150 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-3 group"
              >
                {/* Left: Role, Company & Location */}
                <div className="space-y-1 flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge variant="outline" className="bg-[#102b2b] text-[#d8f36b] border-none text-[10px] font-bold py-0.5 px-2 rounded-xs">
                      {job.company}
                    </Badge>
                    <span className="text-[11px] font-extrabold px-2 py-0.5 rounded-sm bg-[#d8f36b] text-[#102b2b] border border-[#102b2b]/15 flex items-center gap-1">
                      <Sparkles className="w-3 h-3" />
                      {job.match_score || 80}% Fit
                    </span>
                    <span className="text-[10px] text-[#102b2b]/60 font-medium">
                      {job.is_remote ? "🌐 Remote" : job.location}
                    </span>
                  </div>

                  <h3 className="text-sm sm:text-base font-bold text-[#102b2b] group-hover:text-[#0d8274] transition-colors truncate">
                    {job.role}
                  </h3>

                  {/* Matching skills snippet */}
                  {job.matching_skills && job.matching_skills.length > 0 && (
                    <p className="text-[11px] text-[#0d8274] font-medium truncate">
                      Matches: {job.matching_skills.join(", ")}
                    </p>
                  )}
                </div>

                {/* Middle: Compensation */}
                <div className="min-w-[140px] shrink-0 md:text-right border-t md:border-t-0 pt-2 md:pt-0 border-neutral-200">
                  <span className="text-[10px] text-[#102b2b]/55 uppercase font-medium block">Est. Comp</span>
                  <span className="text-sm sm:text-base font-bold text-[#0d8274] font-mono">
                    {job.salary_range}
                  </span>
                </div>

                {/* Right: Actions */}
                <div className="flex items-center gap-2 shrink-0 justify-end pt-2 md:pt-0 border-t md:border-t-0 border-neutral-200">
                  <button
                    onClick={(e) => handleToggleSaveJob(job.id, e)}
                    className="p-2 rounded-sm text-[#102b2b]/55 hover:text-[#0d8274] hover:bg-[#e9eee8] transition-colors cursor-pointer"
                    title={isSaved ? "Saved" : "Save"}
                  >
                    {isSaved ? (
                      <BookmarkCheck className="w-4 h-4 text-[#0d8274] fill-[#0d8274]/20" />
                    ) : (
                      <Bookmark className="w-4 h-4" />
                    )}
                  </button>

                  <button
                    onClick={(e) => handleAddToTracker(job, e)}
                    className={`text-[11px] font-semibold px-2.5 py-1.5 rounded-sm transition-colors cursor-pointer ${
                      isTracked ? "bg-[#d8f36b] text-[#102b2b]" : "text-[#102b2b]/70 hover:text-[#102b2b] bg-[#e9eee8]"
                    }`}
                  >
                    {isTracked ? "✓ Tracked" : "+ Track"}
                  </button>

                  <Button
                    size="sm"
                    onClick={() => setTailorModalJob(job)}
                    className="h-8 bg-[#102b2b] hover:bg-[#0d8274] text-[#d8f36b] hover:text-white text-xs font-bold rounded-sm gap-1 cursor-pointer transition-colors shadow-2xs"
                  >
                    <Zap className="w-3 h-3 fill-current" />
                    Auto-Tailor
                  </Button>

                  <Button
                    size="sm"
                    variant="outline"
                    asChild
                    className="h-8 px-2 rounded-sm border-[#b8c8b9] text-[#0d8274]"
                  >
                    <a href={job.url} target="_blank" rel="noopener noreferrer" title="Apply External">
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Bottom Pagination Bar */}
      {totalPages > 1 && pageSize !== "all" && (
        <div className="p-4 rounded-md bg-white border border-[#b8c8b9] flex flex-col sm:flex-row items-center justify-between gap-4 shadow-2xs">
          <div className="text-xs font-semibold text-[#102b2b]/70 text-center sm:text-left">
            Showing <span className="font-bold text-[#102b2b]">{startIndex + 1}–{endIndex}</span> of <span className="font-bold text-[#102b2b]">{totalFiltered}</span> matched openings
            <span className="text-neutral-400 mx-2">•</span>
            Page <span className="font-bold text-[#102b2b]">{safeCurrentPage}</span> of <span className="font-bold text-[#102b2b]">{totalPages}</span>
          </div>

          <div className="flex items-center gap-1.5 flex-wrap justify-center">
            {/* First Page */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(1)}
              disabled={safeCurrentPage === 1}
              className="h-8 w-8 p-0 rounded-sm border-[#b8c8b9] text-[#102b2b] hover:bg-[#e9eee8] disabled:opacity-40"
              title="First Page"
            >
              <ChevronsLeft className="w-4 h-4" />
            </Button>

            {/* Previous Page */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(safeCurrentPage - 1)}
              disabled={safeCurrentPage === 1}
              className="h-8 px-2.5 rounded-sm border-[#b8c8b9] text-[#102b2b] hover:bg-[#e9eee8] text-xs font-bold gap-1 disabled:opacity-40"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Prev</span>
            </Button>

            {/* Page Numbers */}
            {getPageNumbers().map((p, idx) =>
              p === "..." ? (
                <span key={`ellipsis-${idx}`} className="px-1.5 text-xs text-neutral-400 select-none">
                  ...
                </span>
              ) : (
                <Button
                  key={`page-${p}`}
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(Number(p))}
                  className={`h-8 w-8 p-0 rounded-sm text-xs font-bold transition-colors ${
                    p === safeCurrentPage
                      ? "bg-[#102b2b] text-[#d8f36b] border-[#102b2b] shadow-2xs hover:bg-[#164743] hover:text-[#d8f36b]"
                      : "border-[#b8c8b9] text-[#102b2b] hover:bg-[#e9eee8]"
                  }`}
                >
                  {p}
                </Button>
              )
            )}

            {/* Next Page */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(safeCurrentPage + 1)}
              disabled={safeCurrentPage === totalPages}
              className="h-8 px-2.5 rounded-sm border-[#b8c8b9] text-[#102b2b] hover:bg-[#e9eee8] text-xs font-bold gap-1 disabled:opacity-40"
            >
              <span className="hidden sm:inline">Next</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Button>

            {/* Last Page */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(totalPages)}
              disabled={safeCurrentPage === totalPages}
              className="h-8 w-8 p-0 rounded-sm border-[#b8c8b9] text-[#102b2b] hover:bg-[#e9eee8] disabled:opacity-40"
              title="Last Page"
            >
              <ChevronsRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Auto-Tailor Confirmation & Progress Modal */}
      <Dialog 
        open={!!tailorModalJob} 
        onOpenChange={(open) => {
          if (!open && !tailoringInProgress) {
            setTailorModalJob(null);
            setTailorSuccessData(null);
          }
        }}
      >
        <DialogContent className="max-w-xl bg-[#f7faf5] border-[#b8c8b9] text-[#102b2b] p-6 rounded-md shadow-xl">
          {tailorModalJob && !tailorSuccessData && (
            <div className="space-y-4">
              <DialogHeader>
                <div className="flex items-center gap-2 mb-1">
                  <span className="p-1.5 rounded-sm bg-[#102b2b] text-[#d8f36b]">
                    <Zap className="w-4 h-4 fill-current" />
                  </span>
                  <DialogTitle className="text-lg font-bold text-[#102b2b]">
                    1-Click AI Resume Auto-Tailoring
                  </DialogTitle>
                </div>
                <DialogDescription className="text-xs text-[#102b2b]/70">
                  ResumeForge will clone your source resume and tailor every section for this role.
                </DialogDescription>
              </DialogHeader>

              {/* Job Preview Box */}
              <div className="p-4 rounded-md bg-white border border-[#b8c8b9] space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#0d8274] uppercase">{tailorModalJob.company}</span>
                  <span className="text-xs font-extrabold px-2 py-0.5 rounded-sm bg-[#d8f36b] text-[#102b2b]">
                    {tailorModalJob.match_score || 80}% ATS Fit
                  </span>
                </div>
                <h4 className="text-base font-extrabold text-[#102b2b]">{tailorModalJob.role}</h4>
                <p className="text-xs text-[#102b2b]/70 line-clamp-2">{tailorModalJob.description}</p>
              </div>

              {/* Action Details List */}
              <div className="space-y-2 p-3.5 rounded-md bg-[#e9eee8] border border-[#b8c8b9] text-xs">
                <p className="font-bold text-[#102b2b]">What the AI will do:</p>
                <ul className="space-y-1 text-[#102b2b]/80 list-disc list-inside">
                  <li>Clone your resume into: <span className="font-bold text-[#102b2b]">&quot;{activeResumeTitle} — {tailorModalJob.company}&quot;</span></li>
                  <li>Rewrite summary to directly target {tailorModalJob.company}&apos;s requirements</li>
                  <li>Enhance experience bullet points using STAR method with keywords</li>
                  <li>Automatically add the role to your <span className="font-bold text-[#102b2b]">Job Tracker</span> Kanban board</li>
                </ul>
              </div>

              <DialogFooter className="pt-2 gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setTailorModalJob(null)}
                  disabled={tailoringInProgress}
                  className="rounded-sm border-[#b8c8b9] text-xs font-bold"
                >
                  Cancel
                </Button>
                <Button
                  size="sm"
                  onClick={handleExecuteTailor}
                  disabled={tailoringInProgress}
                  className="bg-[#0d8274] hover:bg-[#102b2b] text-white text-xs font-bold rounded-sm gap-2"
                >
                  {tailoringInProgress ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Optimizing Resume Content...
                    </>
                  ) : (
                    <>
                      <Zap className="w-3.5 h-3.5 fill-current text-[#d8f36b]" />
                      Confirm & Create Tailored Resume
                    </>
                  )}
                </Button>
              </DialogFooter>
            </div>
          )}

          {/* Success State */}
          {tailorSuccessData && (
            <div className="space-y-4">
              <div className="text-center py-2 space-y-1.5">
                <div className="w-12 h-12 rounded-full bg-[#d8f36b] text-[#102b2b] flex items-center justify-center mx-auto mb-2 border border-[#102b2b]/15 shadow-sm">
                  <CheckCircle2 className="w-7 h-7" />
                </div>
                <h3 className="text-lg font-black text-[#102b2b]">Resume Tailored & Cloned!</h3>
                <p className="text-xs text-[#102b2b]/70 max-w-sm mx-auto">
                  Your new resume <span className="font-bold text-[#102b2b]">&quot;{tailorSuccessData.newResumeTitle}&quot;</span> is live in your library and linked to the Job Tracker.
                </p>
              </div>

              {/* Tailored Summary Snippet */}
              <div className="p-3.5 rounded-md bg-white border border-[#b8c8b9] space-y-1.5 text-xs">
                <span className="text-[10px] uppercase font-bold text-[#0d8274] block">New Tailored Summary</span>
                <p className="text-[#102b2b]/85 leading-relaxed italic">
                  &quot;{tailorSuccessData.tailoredSummary}&quot;
                </p>
              </div>

              {/* Improvements summary */}
              <div className="p-3 rounded-md bg-[#e9eee8] border border-[#b8c8b9] text-xs space-y-1">
                <span className="font-bold text-[#102b2b] block">Applied Adjustments:</span>
                {tailorSuccessData.appliedChanges.map((change, idx) => (
                  <div key={idx} className="flex items-center gap-1.5 text-[#102b2b]/80">
                    <CheckCircle2 className="w-3 h-3 text-[#0d8274] shrink-0" />
                    <span>{change}</span>
                  </div>
                ))}
              </div>

              <DialogFooter className="pt-2 gap-2 flex flex-col sm:flex-row">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => router.push("/dashboard/tracker")}
                  className="rounded-sm border-[#b8c8b9] text-xs font-bold flex-1"
                >
                  <Briefcase className="w-3.5 h-3.5 mr-1.5 text-[#0d8274]" />
                  View in Job Tracker
                </Button>
                <Button
                  size="sm"
                  onClick={() => router.push(`/dashboard/resume/${tailorSuccessData.newResumeId}`)}
                  className="bg-[#102b2b] hover:bg-[#0d8274] text-[#d8f36b] text-xs font-bold rounded-sm flex-1 gap-1.5 shadow-sm"
                >
                  Open in Resume Editor →
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
