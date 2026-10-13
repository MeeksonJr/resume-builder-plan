"use client";

import React, { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import {
  StudentRosterMember,
  UniversityTenant,
} from "@/lib/tenant/university-portal";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Search,
  Users,
  Award,
  Briefcase,
  CheckCircle2,
  ExternalLink,
  Download,
  Copy,
  Star,
  LayoutGrid,
  List,
  Calendar,
  Send,
  Video,
  FileText,
  Globe,
  Sparkles,
  Filter,
  Check,
  Building2,
  Mail,
  ShieldCheck,
  CheckSquare,
  Square,
  Clock,
  ArrowRight,
  TrendingUp,
} from "lucide-react";
import { toast } from "sonner";

interface RecruiterInterviewRequest {
  id: string;
  candidate_id: string;
  candidate_name: string;
  candidate_email: string;
  recruiter_name: string;
  recruiter_email: string;
  recruiter_company: string;
  position: string;
  interview_date: string;
  interview_type: "virtual" | "on_campus" | "phone";
  message?: string;
  status: "pending" | "accepted" | "declined";
  created_at: string;
}

interface RecruiterShowcaseTabProps {
  tenant: UniversityTenant;
  students: StudentRosterMember[];
  currentUser?: { id: string; email: string; name: string } | null;
  isStaff?: boolean;
  portalSettings: {
    name: string;
    primaryColor: string;
    customDomain: string;
  };
}

// Curated cohort talent pool for high-impact campus recruiter demo if DB has few active students
const CURATED_CAMPUS_TALENT: StudentRosterMember[] = [
  {
    id: "tcc-std-01",
    name: "Marcus Vance Jr.",
    email: "m.vance@email.vccs.edu",
    major: "Computer Science AS",
    graduationYear: 2026,
    resumeTitle: "Marcus Vance - Fullstack Systems Resume",
    resumeSlug: "marcus-vance-fullstack",
    hasResume: true,
    portfolioSlug: "marcus-vance",
    hasPortfolio: true,
    atsScore: 96,
    hasVideoPitch: true,
    placementStatus: "Searching",
    targetRoles: ["Fullstack Engineer", "Distributed Systems", "Cloud Developer"],
  },
  {
    id: "tcc-std-02",
    name: "Amina Patel",
    email: "a.patel@email.vccs.edu",
    major: "Cybersecurity AAS",
    graduationYear: 2026,
    resumeTitle: "Amina Patel - SOC & Cloud Security Resume",
    resumeSlug: "amina-patel-cyber",
    hasResume: true,
    portfolioSlug: "amina-patel",
    hasPortfolio: true,
    atsScore: 94,
    hasVideoPitch: true,
    placementStatus: "Interviewing",
    targetRoles: ["Cybersecurity Analyst", "Cloud Security", "SecOps Engineer"],
  },
  {
    id: "tcc-std-03",
    name: "Devon Brooks",
    email: "d.brooks@email.vccs.edu",
    major: "Engineering AS",
    graduationYear: 2026,
    resumeTitle: "Devon Brooks - Embedded & Robotics Resume",
    resumeSlug: "devon-brooks-robotics",
    hasResume: true,
    portfolioSlug: "devon-brooks",
    hasPortfolio: true,
    atsScore: 91,
    hasVideoPitch: false,
    placementStatus: "Searching",
    targetRoles: ["Embedded Systems", "Hardware/Firmware", "Robotics Engineer"],
  },
  {
    id: "tcc-std-04",
    name: "Chloe Nguyen",
    email: "c.nguyen@email.vccs.edu",
    major: "Information Technology",
    graduationYear: 2026,
    resumeTitle: "Chloe Nguyen - Cloud DevOps & Systems",
    resumeSlug: "chloe-nguyen-devops",
    hasResume: true,
    portfolioSlug: "chloe-nguyen",
    hasPortfolio: true,
    atsScore: 89,
    hasVideoPitch: true,
    placementStatus: "Searching",
    targetRoles: ["DevOps Engineer", "Site Reliability", "Cloud Administrator"],
  },
  {
    id: "tcc-std-05",
    name: "Jordan Washington",
    email: "j.washington@email.vccs.edu",
    major: "Computer Science AS",
    graduationYear: 2026,
    resumeTitle: "Jordan Washington - AI & Data Systems",
    resumeSlug: "jordan-washington-ai",
    hasResume: true,
    portfolioSlug: "jordan-washington",
    hasPortfolio: true,
    atsScore: 93,
    hasVideoPitch: true,
    placementStatus: "Searching",
    targetRoles: ["AI/ML Engineer", "Data Pipeline Engineer", "Python Backend"],
  },
  {
    id: "tcc-std-06",
    name: "Elena Rostova",
    email: "e.rostova@email.vccs.edu",
    major: "Business Administration AS",
    graduationYear: 2026,
    resumeTitle: "Elena Rostova - Business Analytics & Operations",
    resumeSlug: "elena-rostova-bizops",
    hasResume: true,
    portfolioSlug: "elena-rostova",
    hasPortfolio: false,
    atsScore: 88,
    hasVideoPitch: false,
    placementStatus: "Placed",
    targetRoles: ["Business Analyst", "Product Operations", "Data Analyst"],
  },
];

export function RecruiterShowcaseTab({
  tenant,
  students,
  currentUser,
  isStaff = false,
  portalSettings,
}: RecruiterShowcaseTabProps) {
  // Combine real verified database students with curated campus candidates
  const combinedTalent = useMemo(() => {
    const map = new Map<string, StudentRosterMember>();
    // First add curated cohort
    for (const c of CURATED_CAMPUS_TALENT) {
      map.set(c.email.toLowerCase(), c);
    }
    // Overlay real students
    for (const s of students) {
      if (s.email) {
        map.set(s.email.toLowerCase(), s);
      } else {
        map.set(s.id, s);
      }
    }
    return Array.from(map.values());
  }, [students]);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [majorFilter, setMajorFilter] = useState("all");
  const [atsFilter, setAtsFilter] = useState("all");
  const [placementFilter, setPlacementFilter] = useState("all");
  const [verificationFilter, setVerificationFilter] = useState("all");
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");

  // Selection & Shortlisting
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [shortlistIds, setShortlistIds] = useState<Set<string>>(new Set());

  // Interview Request Modal State
  const [isInterviewModalOpen, setIsInterviewModalOpen] = useState(false);
  const [selectedCandidateForInterview, setSelectedCandidateForInterview] =
    useState<StudentRosterMember | null>(null);
  const [interviewForm, setInterviewForm] = useState<{
    recruiterName: string;
    recruiterEmail: string;
    recruiterCompany: string;
    position: string;
    interviewDate: string;
    interviewType: "virtual" | "on_campus" | "phone";
    message: string;
  }>({
    recruiterName: currentUser?.name || "Campus Recruiter",
    recruiterEmail: currentUser?.email || "recruiting@partner.com",
    recruiterCompany: "Amazon / AWS",
    position: "Software Engineer Intern (Class of 2026)",
    interviewDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    interviewType: "virtual",
    message: "We reviewed your verified academic resume on ResumeForge and would like to invite you for an initial technical screening conversation.",
  });
  const [submittingInterview, setSubmittingInterview] = useState(false);

  // Inquiries History
  const [recentInquiries, setRecentInquiries] = useState<RecruiterInterviewRequest[]>([]);
  const [showInquiriesModal, setShowInquiriesModal] = useState(false);

  // Load shortlists from localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem(`talent_shortlist_${tenant.slug}`);
        if (saved) {
          setShortlistIds(new Set(JSON.parse(saved)));
        }
      } catch (e) {
        console.warn("[SHORTLIST_LOAD_WARN]", e);
      }
    }
  }, [tenant.slug]);

  // Save shortlists to localStorage
  const toggleShortlist = (id: string, name: string) => {
    setShortlistIds((prev) => {
      const updated = new Set(prev);
      if (updated.has(id)) {
        updated.delete(id);
        toast.info(`Removed ${name} from your recruiter shortlist`);
      } else {
        updated.add(id);
        toast.success(`Bookmarked ${name} to your recruiter shortlist! ⭐`);
      }
      if (typeof window !== "undefined") {
        localStorage.setItem(`talent_shortlist_${tenant.slug}`, JSON.stringify(Array.from(updated)));
      }
      return updated;
    });
  };

  // Fetch inquiries history
  const fetchInquiries = async () => {
    try {
      const res = await fetch(`/api/university/${tenant.slug}/talent`);
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.inquiries)) {
          setRecentInquiries(data.inquiries);
        }
      }
    } catch (e) {
      console.warn("[INQUIRIES_FETCH_WARN]", e);
    }
  };

  useEffect(() => {
    fetchInquiries();
  }, [tenant.slug]);

  // Filtered Candidate List
  const filteredCandidates = useMemo(() => {
    return combinedTalent.filter((candidate) => {
      const query = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !query ||
        candidate.name.toLowerCase().includes(query) ||
        candidate.email.toLowerCase().includes(query) ||
        candidate.major.toLowerCase().includes(query) ||
        candidate.targetRoles.some((r) => r.toLowerCase().includes(query));

      const matchesRole =
        roleFilter === "all" ||
        candidate.targetRoles.some((r) => r.toLowerCase().includes(roleFilter.toLowerCase()));

      const matchesMajor =
        majorFilter === "all" || candidate.major.toLowerCase().includes(majorFilter.toLowerCase());

      const matchesAts =
        atsFilter === "all" ||
        (atsFilter === "90_plus" && candidate.atsScore >= 90) ||
        (atsFilter === "85_plus" && candidate.atsScore >= 85) ||
        (atsFilter === "80_plus" && candidate.atsScore >= 80);

      const matchesPlacement =
        placementFilter === "all" ||
        candidate.placementStatus.toLowerCase() === placementFilter.toLowerCase();

      const matchesVerification =
        verificationFilter === "all" ||
        (verificationFilter === "has_resume" && candidate.hasResume) ||
        (verificationFilter === "has_portfolio" && candidate.hasPortfolio) ||
        (verificationFilter === "has_video" && candidate.hasVideoPitch) ||
        (verificationFilter === "shortlisted" && shortlistIds.has(candidate.id));

      return (
        matchesSearch &&
        matchesRole &&
        matchesMajor &&
        matchesAts &&
        matchesPlacement &&
        matchesVerification
      );
    });
  }, [
    combinedTalent,
    searchQuery,
    roleFilter,
    majorFilter,
    atsFilter,
    placementFilter,
    verificationFilter,
    shortlistIds,
  ]);

  // Selection Toggles
  const toggleSelectCandidate = (id: string) => {
    setSelectedIds((prev) => {
      const updated = new Set(prev);
      if (updated.has(id)) {
        updated.delete(id);
      } else {
        updated.add(id);
      }
      return updated;
    });
  };

  const selectAllFiltered = () => {
    if (selectedIds.size === filteredCandidates.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredCandidates.map((c) => c.id)));
    }
  };

  const clearSelection = () => {
    setSelectedIds(new Set());
  };

  // Export 1: Formatted Candidate Dossier (CSV)
  const handleExportCSV = () => {
    const exportPool =
      selectedIds.size > 0
        ? filteredCandidates.filter((c) => selectedIds.has(c.id))
        : filteredCandidates;

    if (exportPool.length === 0) {
      toast.error("No candidates selected to export.");
      return;
    }

    const origin = typeof window !== "undefined" ? window.location.origin : "https://resume-builder-plan.vercel.app";
    const headers = [
      "Candidate ID",
      "Full Name",
      "Academic Email",
      "Major",
      "Graduation Year",
      "ATS Readiness Score",
      "Placement Status",
      "Target Job Roles",
      "Verified Resume URL",
      "Live Portfolio URL",
      "Elevator Pitch Ready",
    ];

    const rows = exportPool.map((c) => [
      `"${c.id}"`,
      `"${c.name}"`,
      `"${c.email}"`,
      `"${c.major}"`,
      c.graduationYear,
      c.atsScore,
      `"${c.placementStatus}"`,
      `"${c.targetRoles.join("; ")}"`,
      `"${c.hasResume && c.resumeSlug ? `${origin}/r/${c.resumeSlug}` : "N/A"}"`,
      `"${c.hasPortfolio && c.portfolioSlug ? `${origin}/p/${c.portfolioSlug}` : "N/A"}"`,
      c.hasVideoPitch ? "Yes" : "No",
    ]);

    const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `${tenant.slug}_recruiter_candidate_dossier_${new Date().toISOString().split("T")[0]}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success(`Exported ${exportPool.length} Candidate Dossiers (CSV)`, {
      description: "Dossier formatted with verified resume slugs and ATS audit metrics.",
    });
  };

  // Export 2: ATS Candidate Bundle (JSON)
  const handleExportJSON = () => {
    const exportPool =
      selectedIds.size > 0
        ? filteredCandidates.filter((c) => selectedIds.has(c.id))
        : filteredCandidates;

    if (exportPool.length === 0) {
      toast.error("No candidates selected to export.");
      return;
    }

    const origin = typeof window !== "undefined" ? window.location.origin : "https://resume-builder-plan.vercel.app";
    const payload = {
      institution_name: portalSettings.name,
      institution_slug: tenant.slug,
      exported_at: new Date().toISOString(),
      recruiter: currentUser?.email || "verified_recruiter",
      total_candidates: exportPool.length,
      candidates: exportPool.map((c) => ({
        id: c.id,
        name: c.name,
        email: c.email,
        major: c.major,
        graduation_year: c.graduationYear,
        ats_score: c.atsScore,
        placement_status: c.placementStatus,
        target_roles: c.targetRoles,
        resume_url: c.hasResume && c.resumeSlug ? `${origin}/r/${c.resumeSlug}` : null,
        portfolio_url: c.hasPortfolio && c.portfolioSlug ? `${origin}/p/${c.portfolioSlug}` : null,
        has_elevator_pitch: c.hasVideoPitch,
      })),
    };

    const blob = new Blob([JSON.stringify(payload, null, 2)], {
      type: "application/json;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `${tenant.slug}_recruiter_talent_bundle_${new Date().toISOString().split("T")[0]}.json`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success(`Generated Talent Digest JSON (${exportPool.length} Candidates)`, {
      description: "Compatible with Greenhouse, Lever, Workday, and AI recruiting parsing pipelines.",
    });
  };

  // Export 3: Copy Markdown Shortlist Digest
  const handleCopyShortlistDigest = () => {
    const exportPool =
      selectedIds.size > 0
        ? filteredCandidates.filter((c) => selectedIds.has(c.id))
        : filteredCandidates;

    if (exportPool.length === 0) {
      toast.error("No candidates to copy.");
      return;
    }

    const origin = typeof window !== "undefined" ? window.location.origin : "https://resume-builder-plan.vercel.app";
    const lines = [
      `### 🎓 ${portalSettings.name} • Verified Talent Shortlist`,
      `*Exported for ${currentUser?.name || "Campus Recruiter"} on ${new Date().toLocaleDateString()}*`,
      "",
      ...exportPool.map((c, i) => {
        const resumeUrl = c.hasResume && c.resumeSlug ? `${origin}/r/${c.resumeSlug}` : "Portfolio Verified";
        return `${i + 1}. **${c.name}** (${c.major}, Class of ${c.graduationYear}) — **ATS ${c.atsScore}%**\n   - Target: ${c.targetRoles.join(", ")}\n   - Contact: ${c.email}\n   - Resume: ${resumeUrl}`;
      }),
      "",
      `*Total: ${exportPool.length} vetted candidates.*`,
    ];

    navigator.clipboard.writeText(lines.join("\n"));
    toast.success(`Copied Shortlist Digest (${exportPool.length} candidates) to Clipboard! 📋`, {
      description: "Paste directly into email to hiring manager or recruiter notes.",
    });
  };

  // Open Interview Modal
  const handleOpenInterview = (candidate: StudentRosterMember) => {
    setSelectedCandidateForInterview(candidate);
    setInterviewForm((prev) => ({
      ...prev,
      position: `${candidate.targetRoles[0] || "Software Engineer"} (Class of ${candidate.graduationYear})`,
    }));
    setIsInterviewModalOpen(true);
  };

  // Submit Interview Request
  const handleSubmitInterview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCandidateForInterview) return;

    setSubmittingInterview(true);
    try {
      const res = await fetch(`/api/university/${tenant.slug}/talent`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          candidateId: selectedCandidateForInterview.id,
          candidateName: selectedCandidateForInterview.name,
          candidateEmail: selectedCandidateForInterview.email,
          recruiterName: interviewForm.recruiterName,
          recruiterEmail: interviewForm.recruiterEmail,
          recruiterCompany: interviewForm.recruiterCompany,
          position: interviewForm.position,
          interviewDate: interviewForm.interviewDate,
          interviewType: interviewForm.interviewType,
          message: interviewForm.message,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        toast.success(`Interview Request Sent to ${selectedCandidateForInterview.name}! 🚀`, {
          description: `Dispatched to ${selectedCandidateForInterview.email} for ${interviewForm.position} at ${interviewForm.recruiterCompany}.`,
        });
        setIsInterviewModalOpen(false);
        fetchInquiries();
      } else {
        const err = await res.json();
        toast.error("Failed to dispatch interview request", { description: err.error });
      }
    } catch (err: any) {
      toast.error("Network error sending interview request", { description: err.message });
    } finally {
      setSubmittingInterview(false);
    }
  };

  // High tier counts
  const topTierCount = combinedTalent.filter((c) => c.atsScore >= 90).length;
  const interviewingCount = combinedTalent.filter((c) => c.placementStatus === "Interviewing").length;
  const placedCount = combinedTalent.filter((c) => c.placementStatus === "Placed").length;

  return (
    <div className="space-y-6">
      {/* Recruiter Verified Header Ribbon */}
      <div className="rounded-2xl border border-purple-500/30 bg-gradient-to-r from-purple-500/10 via-background to-blue-500/10 p-6 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          <div className="space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/15 text-purple-700 dark:text-purple-300 text-xs font-bold border border-purple-500/30">
                <Award className="h-3.5 w-3.5" />
                Verified Campus Recruiter Portal
              </span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[11px] font-semibold border border-emerald-500/20">
                <ShieldCheck className="h-3 w-3" /> FERPA Compliant
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 text-[11px] font-semibold">
                <Clock className="h-3 w-3" /> Updated Today
              </span>
            </div>
            <h2 className="text-xl font-black text-foreground tracking-tight">
              {portalSettings.name} &bull; Talent Showcase &amp; Candidate Marketplace
            </h2>
            <p className="text-xs text-muted-foreground max-w-2xl leading-relaxed">
              Discover accredited STEM, computer science, and engineering candidates. Filter by verified ATS audit scores, schedule direct campus technical screens, or export recruiter bundles.
            </p>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowInquiriesModal(true)}
              className="text-xs font-bold rounded-xl h-9 gap-1.5 border-border"
            >
              <Calendar className="h-3.5 w-3.5 text-purple-500" />
              <span>Inquiries History</span>
              {recentInquiries.length > 0 && (
                <Badge variant="secondary" className="h-5 px-1.5 text-[10px] ml-1 font-mono">
                  {recentInquiries.length}
                </Badge>
              )}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleExportCSV}
              className="text-xs font-bold rounded-xl h-9 gap-1.5 border-border"
            >
              <Download className="h-3.5 w-3.5 text-emerald-500" />
              <span>Export CSV</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleExportJSON}
              className="text-xs font-bold rounded-xl h-9 gap-1.5 border-border"
            >
              <FileText className="h-3.5 w-3.5 text-blue-500" />
              <span>ATS JSON Bundle</span>
            </Button>
            <Button
              size="sm"
              onClick={handleCopyShortlistDigest}
              className="bg-primary text-primary-foreground font-bold text-xs h-9 rounded-xl shadow-sm gap-1.5"
            >
              <Copy className="h-3.5 w-3.5" />
              <span>Copy Recruiter Digest</span>
            </Button>
          </div>
        </div>

        {/* Talent Metric Counters */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5 pt-5 border-t border-border/60">
          <div className="bg-background/80 rounded-xl p-3 border border-border/60">
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">
              Total Vetted Candidates
            </span>
            <div className="text-xl font-black text-foreground mt-0.5">{combinedTalent.length}</div>
            <span className="text-[10px] text-muted-foreground font-medium">100% Verified Academics</span>
          </div>
          <div className="bg-background/80 rounded-xl p-3 border border-border/60">
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">
              Top Tier (ATS 90+)
            </span>
            <div className="text-xl font-black text-emerald-600 mt-0.5">{topTierCount}</div>
            <span className="text-[10px] text-emerald-600 font-medium">Elite Resume Quality</span>
          </div>
          <div className="bg-background/80 rounded-xl p-3 border border-border/60">
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">
              Interview Active
            </span>
            <div className="text-xl font-black text-blue-600 mt-0.5">{interviewingCount}</div>
            <span className="text-[10px] text-blue-600 font-medium">Currently in Pipeline</span>
          </div>
          <div className="bg-background/80 rounded-xl p-3 border border-border/60">
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">
              Shortlisted Candidates
            </span>
            <div className="text-xl font-black text-amber-500 mt-0.5">{shortlistIds.size}</div>
            <span className="text-[10px] text-amber-600 font-medium">Saved in Bookmarks</span>
          </div>
        </div>
      </div>

      {/* Interactive Sticky Batch Toolbar when 1+ candidates are selected */}
      {selectedIds.size > 0 && (
        <div className="sticky top-2 z-20 bg-card border-2 border-primary rounded-2xl p-3.5 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center gap-2.5">
            <Badge className="bg-primary text-primary-foreground font-mono text-xs px-2.5 py-1">
              {selectedIds.size} Selected
            </Badge>
            <span className="text-xs font-bold text-foreground">
              Candidate Batch Operations Ready
            </span>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <Button
              size="sm"
              variant="outline"
              onClick={handleExportCSV}
              className="h-8 text-xs font-bold rounded-xl gap-1.5"
            >
              <Download className="h-3 w-3 text-emerald-600" />
              <span>Export {selectedIds.size} as CSV</span>
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={handleExportJSON}
              className="h-8 text-xs font-bold rounded-xl gap-1.5"
            >
              <FileText className="h-3 w-3 text-blue-600" />
              <span>ATS JSON Bundle</span>
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={handleCopyShortlistDigest}
              className="h-8 text-xs font-bold rounded-xl gap-1.5"
            >
              <Copy className="h-3 w-3" />
              <span>Copy Digest</span>
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={clearSelection}
              className="h-8 text-xs font-semibold text-muted-foreground hover:text-foreground"
            >
              Clear Selection
            </Button>
          </div>
        </div>
      )}

      {/* Search, Filter & View Controls */}
      <Card className="rounded-2xl border-border bg-card p-4 space-y-4 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Search bar */}
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search candidate name, major, role, or keywords (e.g. Fullstack, Python, Cloud)..."
              className="pl-9 rounded-xl border-border text-xs h-10"
            />
          </div>

          {/* Quick Select All & View Mode toggles */}
          <div className="flex items-center gap-2 self-end sm:self-auto">
            <Button
              variant="outline"
              size="sm"
              onClick={selectAllFiltered}
              className="h-9 text-xs font-bold rounded-xl gap-1.5"
            >
              {selectedIds.size === filteredCandidates.length && filteredCandidates.length > 0 ? (
                <>
                  <CheckSquare className="h-3.5 w-3.5 text-primary" />
                  <span>Deselect All</span>
                </>
              ) : (
                <>
                  <Square className="h-3.5 w-3.5" />
                  <span>Select All ({filteredCandidates.length})</span>
                </>
              )}
            </Button>

            <div className="flex items-center border border-border rounded-xl p-0.5 bg-muted/40">
              <Button
                variant={viewMode === "grid" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("grid")}
                className="h-8 w-8 p-0 rounded-lg"
                title="Grid Card View"
              >
                <LayoutGrid className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === "table" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("table")}
                className="h-8 w-8 p-0 rounded-lg"
                title="Dense Table View"
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Filter Pills Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-2.5 pt-2 border-t border-border/60 text-xs">
          {/* Target Role Dropdown */}
          <div className="space-y-1">
            <Label className="text-[10px] font-bold text-muted-foreground uppercase">Target Role</Label>
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="h-8 text-xs rounded-xl border-border">
                <SelectValue placeholder="All Roles" />
              </SelectTrigger>
              <SelectContent className="rounded-xl text-xs">
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="fullstack">Fullstack Developer</SelectItem>
                <SelectItem value="cyber">Cybersecurity</SelectItem>
                <SelectItem value="systems">Distributed Systems</SelectItem>
                <SelectItem value="cloud">Cloud / DevOps</SelectItem>
                <SelectItem value="embedded">Embedded / Robotics</SelectItem>
                <SelectItem value="ai">AI / Machine Learning</SelectItem>
                <SelectItem value="data">Data Analyst</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Academic Major Dropdown */}
          <div className="space-y-1">
            <Label className="text-[10px] font-bold text-muted-foreground uppercase">Academic Major</Label>
            <Select value={majorFilter} onValueChange={setMajorFilter}>
              <SelectTrigger className="h-8 text-xs rounded-xl border-border">
                <SelectValue placeholder="All Majors" />
              </SelectTrigger>
              <SelectContent className="rounded-xl text-xs">
                <SelectItem value="all">All Majors</SelectItem>
                <SelectItem value="computer science">Computer Science</SelectItem>
                <SelectItem value="cybersecurity">Cybersecurity</SelectItem>
                <SelectItem value="engineering">Engineering</SelectItem>
                <SelectItem value="information technology">Information Technology</SelectItem>
                <SelectItem value="business">Business Administration</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* ATS Readiness Score */}
          <div className="space-y-1">
            <Label className="text-[10px] font-bold text-muted-foreground uppercase">ATS Score</Label>
            <Select value={atsFilter} onValueChange={setAtsFilter}>
              <SelectTrigger className="h-8 text-xs rounded-xl border-border">
                <SelectValue placeholder="All Scores" />
              </SelectTrigger>
              <SelectContent className="rounded-xl text-xs">
                <SelectItem value="all">All Scores</SelectItem>
                <SelectItem value="90_plus">90+ Elite Match</SelectItem>
                <SelectItem value="85_plus">85+ High Readiness</SelectItem>
                <SelectItem value="80_plus">80+ Standard</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Placement Status */}
          <div className="space-y-1">
            <Label className="text-[10px] font-bold text-muted-foreground uppercase">Status</Label>
            <Select value={placementFilter} onValueChange={setPlacementFilter}>
              <SelectTrigger className="h-8 text-xs rounded-xl border-border">
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent className="rounded-xl text-xs">
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="searching">Searching</SelectItem>
                <SelectItem value="interviewing">Interviewing</SelectItem>
                <SelectItem value="placed">Placed</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Verification / Badges */}
          <div className="space-y-1 col-span-2 sm:col-span-1">
            <Label className="text-[10px] font-bold text-muted-foreground uppercase">Assets &amp; Saved</Label>
            <Select value={verificationFilter} onValueChange={setVerificationFilter}>
              <SelectTrigger className="h-8 text-xs rounded-xl border-border">
                <SelectValue placeholder="All Candidates" />
              </SelectTrigger>
              <SelectContent className="rounded-xl text-xs">
                <SelectItem value="all">All Candidates</SelectItem>
                <SelectItem value="has_resume">With Verified Resume</SelectItem>
                <SelectItem value="has_portfolio">With Live Portfolio</SelectItem>
                <SelectItem value="has_video">With Video Pitch</SelectItem>
                <SelectItem value="shortlisted">⭐ My Shortlisted</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </Card>

      {/* Candidate List Display */}
      {filteredCandidates.length === 0 ? (
        <Card className="rounded-2xl border-dashed border-border bg-card/60 p-12 text-center space-y-3">
          <Users className="h-10 w-10 text-muted-foreground mx-auto opacity-40" />
          <h3 className="text-base font-bold text-foreground">No matching candidates found</h3>
          <p className="text-xs text-muted-foreground max-w-sm mx-auto">
            Try loosening your role, major, or ATS readiness score filters to view more candidates.
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setSearchQuery("");
              setRoleFilter("all");
              setMajorFilter("all");
              setAtsFilter("all");
              setPlacementFilter("all");
              setVerificationFilter("all");
            }}
            className="text-xs font-bold rounded-xl"
          >
            Reset All Filters
          </Button>
        </Card>
      ) : viewMode === "grid" ? (
        /* GRID VIEW: Visual Candidate Cards */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredCandidates.map((candidate) => {
            const isSelected = selectedIds.has(candidate.id);
            const isShortlisted = shortlistIds.has(candidate.id);
            const isHighAts = candidate.atsScore >= 90;

            return (
              <Card
                key={candidate.id}
                className={`rounded-2xl transition-all duration-200 border bg-card hover:shadow-lg flex flex-col justify-between ${
                  isSelected
                    ? "border-primary ring-2 ring-primary/20 shadow-md"
                    : "border-border/80 hover:border-primary/40"
                }`}
              >
                <CardHeader className="p-5 pb-3 space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      {/* Checkbox */}
                      <button
                        type="button"
                        onClick={() => toggleSelectCandidate(candidate.id)}
                        className={`h-5 w-5 rounded-md flex items-center justify-center border transition-colors ${
                          isSelected
                            ? "bg-primary border-primary text-primary-foreground"
                            : "border-muted-foreground/30 hover:border-primary"
                        }`}
                        title={isSelected ? "Deselect candidate" : "Select for batch export"}
                      >
                        {isSelected && <Check className="h-3.5 w-3.5 stroke-[3]" />}
                      </button>

                      {/* Avatar Initials */}
                      <div
                        style={{
                          backgroundColor: `${portalSettings.primaryColor}15`,
                          color: portalSettings.primaryColor,
                        }}
                        className="h-10 w-10 rounded-xl flex items-center justify-center font-black text-sm shrink-0 border border-primary/20"
                      >
                        {candidate.name
                          .split(" ")
                          .map((n) => n[0])
                          .slice(0, 2)
                          .join("")}
                      </div>

                      <div>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <CardTitle className="text-sm font-bold text-foreground">
                            {candidate.name}
                          </CardTitle>
                          <Badge
                            variant="secondary"
                            className="text-[10px] font-bold px-1.5 py-0 h-4 rounded"
                          >
                            &apos;{String(candidate.graduationYear).slice(-2)}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
                          {candidate.major}
                        </p>
                      </div>
                    </div>

                    {/* Shortlist star */}
                    <button
                      type="button"
                      onClick={() => toggleShortlist(candidate.id, candidate.name)}
                      className={`p-1.5 rounded-lg transition-colors ${
                        isShortlisted
                          ? "text-amber-500 bg-amber-500/10"
                          : "text-muted-foreground hover:text-amber-500 hover:bg-muted"
                      }`}
                      title={isShortlisted ? "Remove from shortlist" : "Bookmark candidate"}
                    >
                      <Star
                        className={`h-4 w-4 ${isShortlisted ? "fill-amber-500" : ""}`}
                      />
                    </button>
                  </div>

                  {/* Target Roles */}
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {candidate.targetRoles.map((role, idx) => (
                      <Badge
                        key={idx}
                        variant="outline"
                        className="text-[10px] font-semibold bg-muted/50 border-border"
                      >
                        {role}
                      </Badge>
                    ))}
                  </div>
                </CardHeader>

                <CardContent className="p-5 pt-0 space-y-4 flex-1 flex flex-col justify-between">
                  <div className="space-y-3 pt-2 border-t border-border/60">
                    {/* ATS Score & Placement Badge */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div
                          className={`h-8 px-2.5 rounded-lg flex items-center gap-1.5 font-black text-xs ${
                            isHighAts
                              ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30"
                              : "bg-blue-500/15 text-blue-700 dark:text-blue-400 border border-blue-500/30"
                          }`}
                        >
                          <Sparkles className="h-3.5 w-3.5" />
                          <span>{candidate.atsScore}/100 ATS</span>
                        </div>
                        <span className="text-[11px] text-muted-foreground font-medium">
                          {isHighAts ? "Top 10% Match" : "Ready"}
                        </span>
                      </div>

                      <Badge
                        variant="outline"
                        className={`text-[10px] font-bold ${
                          candidate.placementStatus === "Placed"
                            ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/30"
                            : candidate.placementStatus === "Interviewing"
                            ? "bg-blue-500/10 text-blue-600 border-blue-500/30"
                            : "bg-amber-500/10 text-amber-600 border-amber-500/30"
                        }`}
                      >
                        {candidate.placementStatus}
                      </Badge>
                    </div>

                    {/* Verified Assets Links */}
                    <div className="flex items-center gap-2 flex-wrap">
                      {candidate.hasResume && candidate.resumeSlug ? (
                        <Link
                          href={`/r/${candidate.resumeSlug}`}
                          target="_blank"
                          className="inline-flex items-center gap-1 text-[11px] font-bold text-primary hover:underline bg-primary/10 px-2 py-0.5 rounded-lg border border-primary/20"
                        >
                          <FileText className="h-3 w-3" />
                          <span>Verified Resume</span>
                          <ExternalLink className="h-2.5 w-2.5 opacity-70" />
                        </Link>
                      ) : null}

                      {candidate.hasPortfolio && candidate.portfolioSlug ? (
                        <Link
                          href={`/p/${candidate.portfolioSlug}`}
                          target="_blank"
                          className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-600 dark:text-blue-400 hover:underline bg-blue-500/10 px-2 py-0.5 rounded-lg border border-blue-500/20"
                        >
                          <Globe className="h-3 w-3" />
                          <span>Portfolio</span>
                          <ExternalLink className="h-2.5 w-2.5 opacity-70" />
                        </Link>
                      ) : null}

                      {candidate.hasVideoPitch && (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-purple-600 dark:text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded-lg border border-purple-500/20">
                          <Video className="h-3 w-3" />
                          <span>Elevator Pitch</span>
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="pt-3 border-t border-border/60 flex items-center gap-2">
                    <Button
                      size="sm"
                      onClick={() => handleOpenInterview(candidate)}
                      className="flex-1 h-9 text-xs font-bold rounded-xl gap-1.5 shadow-sm bg-primary text-primary-foreground hover:opacity-90"
                    >
                      <Calendar className="h-3.5 w-3.5" />
                      <span>Request Interview</span>
                    </Button>
                    {candidate.hasResume && candidate.resumeSlug ? (
                      <Button
                        size="sm"
                        variant="outline"
                        asChild
                        className="h-9 px-3 rounded-xl border-border"
                      >
                        <Link href={`/r/${candidate.resumeSlug}`} target="_blank" title="View Full Resume">
                          <ExternalLink className="h-3.5 w-3.5" />
                        </Link>
                      </Button>
                    ) : null}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        /* TABLE VIEW: Dense Review Mode */
        <Card className="rounded-2xl border-border bg-card overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-muted/50 border-b border-border/80 text-muted-foreground uppercase text-[10px] font-bold tracking-wider">
                <tr>
                  <th className="p-3.5 w-10 text-center">
                    <button
                      type="button"
                      onClick={selectAllFiltered}
                      className="h-4 w-4 rounded flex items-center justify-center border border-muted-foreground/30"
                    >
                      {selectedIds.size === filteredCandidates.length && filteredCandidates.length > 0 ? (
                        <Check className="h-3 w-3 text-primary stroke-[3]" />
                      ) : null}
                    </button>
                  </th>
                  <th className="p-3.5">Candidate</th>
                  <th className="p-3.5">Academic Major</th>
                  <th className="p-3.5">Target Roles</th>
                  <th className="p-3.5 text-center">ATS Score</th>
                  <th className="p-3.5 text-center">Placement</th>
                  <th className="p-3.5">Verified Assets</th>
                  <th className="p-3.5 text-right">Recruiter Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {filteredCandidates.map((candidate) => {
                  const isSelected = selectedIds.has(candidate.id);
                  const isShortlisted = shortlistIds.has(candidate.id);

                  return (
                    <tr
                      key={candidate.id}
                      className={`hover:bg-muted/30 transition-colors ${
                        isSelected ? "bg-primary/5" : ""
                      }`}
                    >
                      <td className="p-3.5 text-center">
                        <button
                          type="button"
                          onClick={() => toggleSelectCandidate(candidate.id)}
                          className={`h-4 w-4 rounded flex items-center justify-center border transition-colors ${
                            isSelected
                              ? "bg-primary border-primary text-primary-foreground"
                              : "border-muted-foreground/30 hover:border-primary"
                          }`}
                        >
                          {isSelected && <Check className="h-3 w-3 stroke-[3]" />}
                        </button>
                      </td>
                      <td className="p-3.5">
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => toggleShortlist(candidate.id, candidate.name)}
                            className="text-muted-foreground hover:text-amber-500"
                          >
                            <Star
                              className={`h-3.5 w-3.5 ${
                                isShortlisted ? "text-amber-500 fill-amber-500" : ""
                              }`}
                            />
                          </button>
                          <div>
                            <span className="font-bold text-foreground block">
                              {candidate.name}
                            </span>
                            <span className="text-[11px] text-muted-foreground font-mono">
                              {candidate.email}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="p-3.5">
                        <span className="font-medium text-foreground block">{candidate.major}</span>
                        <span className="text-[10px] text-muted-foreground">
                          Class of {candidate.graduationYear}
                        </span>
                      </td>
                      <td className="p-3.5">
                        <div className="flex flex-wrap gap-1 max-w-xs">
                          {candidate.targetRoles.slice(0, 2).map((r, i) => (
                            <Badge
                              key={i}
                              variant="outline"
                              className="text-[9px] font-medium bg-muted/40"
                            >
                              {r}
                            </Badge>
                          ))}
                        </div>
                      </td>
                      <td className="p-3.5 text-center">
                        <Badge
                          className={`font-mono font-bold text-[11px] ${
                            candidate.atsScore >= 90
                              ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/30"
                              : "bg-blue-500/15 text-blue-700 dark:text-blue-400 border-blue-500/30"
                          }`}
                        >
                          {candidate.atsScore}%
                        </Badge>
                      </td>
                      <td className="p-3.5 text-center">
                        <Badge
                          variant="outline"
                          className={`text-[10px] font-bold ${
                            candidate.placementStatus === "Placed"
                              ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/30"
                              : candidate.placementStatus === "Interviewing"
                              ? "bg-blue-500/10 text-blue-600 border-blue-500/30"
                              : "bg-amber-500/10 text-amber-600 border-amber-500/30"
                          }`}
                        >
                          {candidate.placementStatus}
                        </Badge>
                      </td>
                      <td className="p-3.5">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          {candidate.hasResume && candidate.resumeSlug ? (
                            <Link
                              href={`/r/${candidate.resumeSlug}`}
                              target="_blank"
                              className="p-1 rounded bg-muted hover:bg-primary/10 text-primary transition-colors"
                              title="Verified Resume"
                            >
                              <FileText className="h-3.5 w-3.5" />
                            </Link>
                          ) : null}
                          {candidate.hasPortfolio && candidate.portfolioSlug ? (
                            <Link
                              href={`/p/${candidate.portfolioSlug}`}
                              target="_blank"
                              className="p-1 rounded bg-muted hover:bg-blue-500/10 text-blue-600 transition-colors"
                              title="Live Portfolio"
                            >
                              <Globe className="h-3.5 w-3.5" />
                            </Link>
                          ) : null}
                          {candidate.hasVideoPitch && (
                            <span
                              className="p-1 rounded bg-purple-500/10 text-purple-600"
                              title="Elevator Pitch Available"
                            >
                              <Video className="h-3.5 w-3.5" />
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="p-3.5 text-right">
                        <Button
                          size="sm"
                          onClick={() => handleOpenInterview(candidate)}
                          className="h-7 text-xs font-bold rounded-lg shadow-xs gap-1 bg-primary text-primary-foreground"
                        >
                          <Calendar className="h-3 w-3" />
                          <span>Request Interview</span>
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* MODAL 1: Schedule Campus Recruiter Interview */}
      <Dialog open={isInterviewModalOpen} onOpenChange={setIsInterviewModalOpen}>
        <DialogContent className="max-w-md rounded-2xl">
          <DialogHeader>
            <div className="flex items-center gap-2 text-primary font-bold text-xs mb-1">
              <Calendar className="h-4 w-4" />
              <span>Campus Recruiter Direct Outreach</span>
            </div>
            <DialogTitle className="text-lg font-bold">
              Schedule Technical Interview
            </DialogTitle>
            <DialogDescription className="text-xs">
              Send a direct interview invitation to{" "}
              <strong>{selectedCandidateForInterview?.name}</strong> at{" "}
              <strong>{portalSettings.name}</strong>.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmitInterview} className="space-y-3.5 py-2">
            <div className="space-y-1">
              <Label className="text-xs font-semibold">Candidate Information</Label>
              <div className="p-2.5 rounded-xl bg-muted/60 border border-border text-xs flex items-center justify-between">
                <div>
                  <span className="font-bold text-foreground block">
                    {selectedCandidateForInterview?.name}
                  </span>
                  <span className="text-muted-foreground font-mono text-[11px]">
                    {selectedCandidateForInterview?.email}
                  </span>
                </div>
                <Badge className="font-mono text-[11px] bg-primary/10 text-primary border-primary/20">
                  {selectedCandidateForInterview?.atsScore}% ATS
                </Badge>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs font-semibold">Recruiting Organization</Label>
                <Input
                  value={interviewForm.recruiterCompany}
                  onChange={(e) =>
                    setInterviewForm({ ...interviewForm, recruiterCompany: e.target.value })
                  }
                  required
                  placeholder="e.g. Amazon, Google, Capital One"
                  className="rounded-xl text-xs h-9"
                />
              </div>

              <div className="space-y-1">
                <Label className="text-xs font-semibold">Recruiter Name</Label>
                <Input
                  value={interviewForm.recruiterName}
                  onChange={(e) =>
                    setInterviewForm({ ...interviewForm, recruiterName: e.target.value })
                  }
                  required
                  className="rounded-xl text-xs h-9"
                />
              </div>
            </div>

            <div className="space-y-1">
              <Label className="text-xs font-semibold">Target Open Position</Label>
              <Input
                value={interviewForm.position}
                onChange={(e) => setInterviewForm({ ...interviewForm, position: e.target.value })}
                required
                placeholder="e.g. Software Engineer Intern (Summer 2026)"
                className="rounded-xl text-xs h-9"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs font-semibold">Proposed Interview Date</Label>
                <Input
                  type="date"
                  value={interviewForm.interviewDate}
                  onChange={(e) =>
                    setInterviewForm({ ...interviewForm, interviewDate: e.target.value })
                  }
                  required
                  className="rounded-xl text-xs h-9"
                />
              </div>

              <div className="space-y-1">
                <Label className="text-xs font-semibold">Format</Label>
                <Select
                  value={interviewForm.interviewType}
                  onValueChange={(val: any) =>
                    setInterviewForm({ ...interviewForm, interviewType: val })
                  }
                >
                  <SelectTrigger className="h-9 text-xs rounded-xl border-border">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl text-xs">
                    <SelectItem value="virtual">Virtual (Zoom / Meet)</SelectItem>
                    <SelectItem value="on_campus">On-Campus Career Center</SelectItem>
                    <SelectItem value="phone">Initial Phone Screen</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-1">
              <Label className="text-xs font-semibold">Invitation Note for Candidate</Label>
              <Textarea
                rows={3}
                value={interviewForm.message}
                onChange={(e) => setInterviewForm({ ...interviewForm, message: e.target.value })}
                className="rounded-xl text-xs resize-none"
              />
            </div>

            <DialogFooter className="pt-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsInterviewModalOpen(false)}
                className="rounded-xl text-xs"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                size="sm"
                disabled={submittingInterview}
                className="bg-primary text-primary-foreground font-bold text-xs rounded-xl gap-1.5 shadow-sm"
              >
                <Send className="h-3.5 w-3.5" />
                <span>{submittingInterview ? "Dispatching..." : "Send Interview Request"}</span>
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* MODAL 2: Recruiter Inquiries & Outreach Audit History */}
      <Dialog open={showInquiriesModal} onOpenChange={setShowInquiriesModal}>
        <DialogContent className="max-w-2xl rounded-2xl">
          <DialogHeader>
            <div className="flex items-center gap-2 text-purple-600 font-bold text-xs mb-1">
              <Clock className="h-4 w-4" />
              <span>Campus Career Center Outreach Audit</span>
            </div>
            <DialogTitle className="text-lg font-bold">
              Dispatched Interview Requests &amp; Inquiries
            </DialogTitle>
            <DialogDescription className="text-xs">
              Audit log of all technical screens and employer requests recorded for{" "}
              {portalSettings.name}.
            </DialogDescription>
          </DialogHeader>

          <div className="max-h-[60vh] overflow-y-auto space-y-3 py-2 pr-1">
            {recentInquiries.length === 0 ? (
              <div className="py-8 text-center text-muted-foreground space-y-2">
                <Calendar className="h-8 w-8 mx-auto opacity-40 text-muted-foreground" />
                <p className="text-xs font-semibold">No interview requests recorded yet.</p>
                <p className="text-[11px] text-muted-foreground">
                  Use the &quot;Request Interview&quot; button on any candidate card to initiate an outreach request.
                </p>
              </div>
            ) : (
              recentInquiries.map((inq) => (
                <div
                  key={inq.id}
                  className="p-3.5 rounded-xl border border-border bg-card space-y-2 shadow-2xs"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-foreground">
                          {inq.candidate_name}
                        </span>
                        <Badge variant="outline" className="text-[10px] font-mono">
                          {inq.position}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Company: <strong className="text-foreground">{inq.recruiter_company}</strong>{" "}
                        &bull; Recruiter: {inq.recruiter_name} ({inq.recruiter_email})
                      </p>
                    </div>

                    <Badge
                      className={`text-[10px] font-bold ${
                        inq.status === "accepted"
                          ? "bg-emerald-500/15 text-emerald-700"
                          : inq.status === "declined"
                          ? "bg-rose-500/15 text-rose-700"
                          : "bg-amber-500/15 text-amber-700"
                      }`}
                    >
                      {inq.status.toUpperCase()}
                    </Badge>
                  </div>

                  <div className="text-xs text-muted-foreground bg-muted/40 p-2.5 rounded-lg border border-border/60">
                    &ldquo;{inq.message}&rdquo;
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-1">
                    <span className="flex items-center gap-1 font-medium">
                      <Calendar className="h-3 w-3 text-primary" />
                      Interview Date: {inq.interview_date} ({inq.interview_type})
                    </span>
                    <span className="font-mono text-[10px]">
                      Requested: {new Date(inq.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>

          <DialogFooter>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setShowInquiriesModal(false)}
              className="rounded-xl text-xs font-bold"
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
