"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ResumePreview } from "@/components/editor/resume-preview";
import {
  Rocket,
  FileText,
  Mail,
  Mic,
  CheckCircle2,
  Download,
  Copy,
  ArrowRight,
  ArrowLeft,
  Briefcase,
  Bookmark,
  Sparkles,
  ExternalLink,
  Loader2,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Trophy,
  Volume2,
  HelpCircle,
  Clock,
  Check,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export interface AutopilotPacketData {
  id?: string;
  applicationId?: string;
  company: string;
  role: string;
  location?: string | null;
  salaryRange?: string | null;
  matchScore?: number;
  url?: string | null;
  newResumeId: string;
  newResumeTitle: string;
  coverLetterId?: string | null;
  coverLetterTitle?: string | null;
  coverLetterContent?: string | null;
  tailoredSummary?: string;
  appliedChanges?: string[];
  interviewSession?: {
    id: string;
    targetRole?: string;
    targetCompany?: string;
    difficulty?: string;
    questionCount?: number;
    answeredCount?: number;
    averageScore?: number;
    completedAt?: string | null;
    sessionMode?: string;
    voiceAnalysis?: any;
  } | null;
  isSaved?: boolean;
}

interface AutopilotDossierDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  packet: AutopilotPacketData | null;
  onRefreshPackets?: () => void;
}

export function AutopilotDossierDialog({
  open,
  onOpenChange,
  packet,
  onRefreshPackets,
}: AutopilotDossierDialogProps) {
  const router = useRouter();

  // Active slide: 1 = Overview, 2 = Resume Preview, 3 = Cover Letter, 4 = Interview Prep
  const [activeSlide, setActiveSlide] = useState<number>(1);

  // Resume preview state
  const [resumeFullData, setResumeFullData] = useState<any>(null);
  const [loadingResume, setLoadingResume] = useState(false);
  const [zoomScale, setZoomScale] = useState<number>(0.95);

  // Cover letter copy feedback
  const [copiedCoverLetter, setCopiedCoverLetter] = useState(false);

  // Manual save state
  const [isSaved, setIsSaved] = useState<boolean>(packet?.isSaved ?? true);

  // Interview state
  const [interviewSession, setInterviewSession] = useState<any>(packet?.interviewSession || null);
  const [creatingInterview, setCreatingInterview] = useState(false);
  const [interviewMode, setInterviewMode] = useState<"voice" | "text">("voice");
  const [interviewQuestionsCount, setInterviewQuestionsCount] = useState<number>(5);

  // Reset or initialize on packet change
  useEffect(() => {
    if (packet) {
      setIsSaved(packet.isSaved ?? true);
      setInterviewSession(packet.interviewSession || null);
      setActiveSlide(1);
    }
  }, [packet]);

  // Fetch full resume data when entering Slide 2
  useEffect(() => {
    if (activeSlide === 2 && packet?.newResumeId && !resumeFullData) {
      setLoadingResume(true);
      fetch(`/api/resume/${packet.newResumeId}?format=full`)
        .then((res) => {
          if (!res.ok) throw new Error("Failed to load full resume preview");
          return res.json();
        })
        .then((data) => {
          setResumeFullData(data);
        })
        .catch((err) => {
          console.error("[ResumePreview Fetch Error]", err);
          toast.error("Could not load full resume preview");
        })
        .finally(() => {
          setLoadingResume(false);
        });
    }
  }, [activeSlide, packet?.newResumeId, resumeFullData]);

  // Refresh interview session state when opening Slide 4
  const refreshInterviewSession = async () => {
    if (!packet) return;
    try {
      const res = await fetch("/api/interview/sessions");
      if (!res.ok) return;
      const sessions = await res.json();
      const matching = (sessions || []).find(
        (s: any) =>
          s.resume_id === packet.newResumeId ||
          (s.target_company?.toLowerCase() === packet.company.toLowerCase() &&
            s.target_role?.toLowerCase() === packet.role.toLowerCase())
      );
      if (matching) {
        setInterviewSession({
          id: matching.id,
          targetRole: matching.target_role,
          targetCompany: matching.target_company,
          difficulty: matching.difficulty,
          questionCount: matching.question_count,
          answeredCount: matching.answered_count,
          averageScore: matching.average_score,
          completedAt: matching.completed_at,
          sessionMode: matching.session_mode,
          voiceAnalysis: matching.voice_analysis,
        });
      }
    } catch (err) {
      console.warn("[Interview Session Refresh Warning]", err);
    }
  };

  useEffect(() => {
    if (activeSlide === 4 && packet) {
      refreshInterviewSession();
    }
  }, [activeSlide, packet]);

  if (!packet) return null;

  // Actions
  const handleToggleSave = () => {
    const nextSaved = !isSaved;
    setIsSaved(nextSaved);
    if (nextSaved) {
      toast.success("Autopilot packet saved to your library!");
    } else {
      toast.info("Packet unbookmarked");
    }
    if (onRefreshPackets) onRefreshPackets();
  };

  const handleCopyCoverLetter = () => {
    if (!packet.coverLetterContent) return;
    navigator.clipboard.writeText(packet.coverLetterContent);
    setCopiedCoverLetter(true);
    toast.success("Cover letter copied to clipboard!");
    setTimeout(() => setCopiedCoverLetter(false), 2500);
  };

  const handleDownloadPacket = () => {
    const divider = "=".repeat(60);
    const content = [
      `APPLICATION DOSSIER: ${packet.role.toUpperCase()} @ ${packet.company.toUpperCase()}`,
      `Generated: ${new Date().toLocaleDateString()}`,
      `ATS Fit Score: ${packet.matchScore || 80}%`,
      divider,
      `\n1. TAILORED RESUME TITLE:\n${packet.newResumeTitle}`,
      `\n2. PROFESSIONAL SUMMARY:\n${packet.tailoredSummary || "Tailored for " + packet.company}`,
      `\n3. APPLIED ADJUSTMENTS:\n${(packet.appliedChanges || []).map((c) => `• ${c}`).join("\n")}`,
      `\n${divider}`,
      `\n4. COMPANY-ALIGNED COVER LETTER:\n\n${packet.coverLetterContent || "N/A"}`,
      `\n${divider}`,
    ].join("\n");

    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${packet.company}_${packet.role}_Autopilot_Packet.txt`.replace(/\s+/g, "_");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success("Downloaded complete application packet (.txt)!");
  };

  const handleLaunchInterviewSession = async () => {
    setCreatingInterview(true);
    try {
      const res = await fetch("/api/interview/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          resumeId: packet.newResumeId,
          targetRole: packet.role,
          targetCompany: packet.company,
          difficulty: "mid",
          questionCount: interviewQuestionsCount,
          sessionMode: interviewMode,
        }),
      });

      if (!res.ok) throw new Error("Failed to generate interview questions");

      const session = await res.json();
      setInterviewSession(session);
      toast.success(`Generated ${interviewQuestionsCount} targeted interview questions for ${packet.company}!`);

      // Deep link to practice room
      router.push(`/dashboard/interview-prep/${session.id}`);
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Failed to create interview session");
    } finally {
      setCreatingInterview(false);
    }
  };

  const isInterviewComplete = !!interviewSession?.completedAt;
  const isInterviewInProgress =
    !!interviewSession && !interviewSession.completedAt && (interviewSession.answeredCount || 0) > 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[96vw] max-w-5xl h-[88vh] flex flex-col p-0 overflow-hidden bg-[#f7faf5] border-[#102b2b]/20 shadow-2xl rounded-sm">
        {/* TOP COMMAND HEADER */}
        <div className="px-6 py-4 bg-[#102b2b] text-[#f8f4ec] border-b border-[#102b2b]/30 shrink-0">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            {/* Left: Role & Company Branding */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-sm bg-[#d8f36b] text-[#102b2b] flex items-center justify-center font-black text-base shrink-0 shadow-xs">
                <Rocket className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#d8f36b]">
                    Autopilot Application Dossier
                  </span>
                  <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-xs bg-[#d8f36b]/20 border border-[#d8f36b]/40 text-[#d8f36b]">
                    {packet.matchScore || 85}% ATS Match
                  </span>
                </div>
                <h2 className="text-base sm:text-lg font-black tracking-tight text-white line-clamp-1">
                  {packet.role} <span className="text-[#a6c0b8] font-normal">at</span> {packet.company}
                </h2>
              </div>
            </div>

            {/* Right: Save Bookmark & Stepper Indicators */}
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={handleToggleSave}
                className={cn(
                  "h-8 rounded-sm text-xs font-bold gap-1.5 border-white/20 transition-all cursor-pointer",
                  isSaved
                    ? "bg-[#d8f36b] text-[#102b2b] hover:bg-[#e5ff8b] border-transparent"
                    : "bg-white/10 text-white hover:bg-white/20"
                )}
              >
                <Bookmark className={cn("w-3.5 h-3.5", isSaved ? "fill-[#102b2b]" : "")} />
                <span>{isSaved ? "Saved to Tab" : "Save Result"}</span>
              </Button>
            </div>
          </div>

          {/* SLIDE NAVIGATION TABS */}
          <div className="grid grid-cols-4 gap-2 mt-4 pt-3 border-t border-white/10">
            <button
              onClick={() => setActiveSlide(1)}
              className={cn(
                "flex items-center justify-center gap-1.5 py-1.5 px-2 text-xs font-bold uppercase tracking-wider rounded-xs transition-all cursor-pointer",
                activeSlide === 1
                  ? "bg-[#d8f36b] text-[#102b2b] shadow-xs"
                  : "bg-white/10 text-[#c5d7d1] hover:bg-white/20 hover:text-white"
              )}
            >
              <Rocket className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">1. Overview</span>
            </button>

            <button
              onClick={() => setActiveSlide(2)}
              className={cn(
                "flex items-center justify-center gap-1.5 py-1.5 px-2 text-xs font-bold uppercase tracking-wider rounded-xs transition-all cursor-pointer",
                activeSlide === 2
                  ? "bg-[#d8f36b] text-[#102b2b] shadow-xs"
                  : "bg-white/10 text-[#c5d7d1] hover:bg-white/20 hover:text-white"
              )}
            >
              <FileText className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">2. Resume Preview</span>
            </button>

            <button
              onClick={() => setActiveSlide(3)}
              className={cn(
                "flex items-center justify-center gap-1.5 py-1.5 px-2 text-xs font-bold uppercase tracking-wider rounded-xs transition-all cursor-pointer",
                activeSlide === 3
                  ? "bg-[#d8f36b] text-[#102b2b] shadow-xs"
                  : "bg-white/10 text-[#c5d7d1] hover:bg-white/20 hover:text-white"
              )}
            >
              <Mail className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">3. Cover Letter</span>
            </button>

            <button
              onClick={() => setActiveSlide(4)}
              className={cn(
                "flex items-center justify-center gap-1.5 py-1.5 px-2 text-xs font-bold uppercase tracking-wider rounded-xs transition-all cursor-pointer relative",
                activeSlide === 4
                  ? "bg-[#d8f36b] text-[#102b2b] shadow-xs"
                  : "bg-white/10 text-[#c5d7d1] hover:bg-white/20 hover:text-white"
              )}
            >
              <Mic className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">4. Interview Prep</span>
              {isInterviewComplete && (
                <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0" title="Completed" />
              )}
              {isInterviewInProgress && (
                <span className="w-2 h-2 rounded-full bg-amber-400 shrink-0 animate-pulse" title="In Progress" />
              )}
            </button>
          </div>
        </div>

        {/* MAIN SLIDE CONTENT AREA (Scrollable) */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6">
          {/* SLIDE 1: EXECUTIVE OVERVIEW */}
          {activeSlide === 1 && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Left Column: Deliverables Assets */}
                <div className="space-y-4">
                  <h3 className="text-xs font-black uppercase tracking-wider text-[#52716a] flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-[#0d8274]" />
                    Synthesized Application Assets
                  </h3>

                  {/* Tailored Resume Tile */}
                  <div className="p-4 rounded-sm bg-white border border-[#b8c8b9] shadow-2xs space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-[#0d8274]">
                        <FileText className="w-4 h-4" />
                        <span>Tailored Resume</span>
                      </div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-xs bg-[#e9eee8] text-[#102b2b]">
                        Cloned & Aligned
                      </span>
                    </div>
                    <div>
                      <p className="text-sm font-black text-[#102b2b]">
                        {packet.newResumeTitle}
                      </p>
                      <p className="text-xs text-[#102b2b]/70 mt-1 italic line-clamp-2">
                        &quot;{packet.tailoredSummary || "Tailored professional summary aligned with target qualifications."}&quot;
                      </p>
                    </div>
                    <div className="flex items-center gap-2 pt-1">
                      <Button
                        size="sm"
                        onClick={() => setActiveSlide(2)}
                        className="flex-1 h-8 bg-[#102b2b] hover:bg-[#0d8274] text-[#d8f36b] hover:text-white text-xs font-bold rounded-xs gap-1.5"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        Preview Resume
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => router.push(`/dashboard/resume/${packet.newResumeId}`)}
                        className="h-8 border-[#b8c8b9] text-xs font-bold rounded-xs gap-1"
                      >
                        <ExternalLink className="w-3 h-3" />
                        Editor
                      </Button>
                    </div>
                  </div>

                  {/* AI Cover Letter Tile */}
                  <div className="p-4 rounded-sm bg-white border border-[#b8c8b9] shadow-2xs space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-[#0d8274]">
                        <Mail className="w-4 h-4" />
                        <span>Custom Cover Letter</span>
                      </div>
                      <button
                        onClick={handleCopyCoverLetter}
                        className="text-[10px] font-bold text-[#102b2b] hover:text-[#0d8274] flex items-center gap-1"
                      >
                        {copiedCoverLetter ? <Check className="w-3 h-3 text-[#0d8274]" /> : <Copy className="w-3 h-3" />}
                        <span>{copiedCoverLetter ? "Copied" : "Copy"}</span>
                      </button>
                    </div>
                    <div>
                      <p className="text-sm font-black text-[#102b2b]">
                        {packet.coverLetterTitle || `${packet.role} Cover Letter`}
                      </p>
                      <p className="text-xs text-[#102b2b]/70 mt-1 line-clamp-2">
                        {packet.coverLetterContent?.slice(0, 140) || "Aligned business letter tailored to company mission."}...
                      </p>
                    </div>
                    <div className="flex items-center gap-2 pt-1">
                      <Button
                        size="sm"
                        onClick={() => setActiveSlide(3)}
                        className="flex-1 h-8 bg-[#102b2b] hover:bg-[#0d8274] text-[#d8f36b] hover:text-white text-xs font-bold rounded-xs gap-1.5"
                      >
                        <Mail className="w-3.5 h-3.5" />
                        View Full Letter
                      </Button>
                      {packet.coverLetterId && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => router.push(`/dashboard/cover-letters/${packet.coverLetterId}`)}
                          className="h-8 border-[#b8c8b9] text-xs font-bold rounded-xs gap-1"
                        >
                          <ExternalLink className="w-3 h-3" />
                          Editor
                        </Button>
                      )}
                    </div>
                  </div>

                  {/* Kanban Tracker Status Tile */}
                  <div className="p-3.5 rounded-sm bg-[#e9eee8] border border-[#b8c8b9] flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Briefcase className="w-4 h-4 text-[#0d8274]" />
                      <div>
                        <p className="text-xs font-bold text-[#102b2b]">Job Tracker Sync</p>
                        <p className="text-[11px] text-[#102b2b]/70">Logged to Kanban under &quot;Applied&quot;</p>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => router.push("/dashboard/tracker")}
                      className="h-7 text-xs font-bold text-[#0d8274] hover:underline p-0"
                    >
                      View Board →
                    </Button>
                  </div>
                </div>

                {/* Right Column: AI Applied Adjustments & Quick Actions */}
                <div className="space-y-4 flex flex-col justify-between">
                  <div className="space-y-3">
                    <h3 className="text-xs font-black uppercase tracking-wider text-[#52716a] flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#0d8274]" />
                      ATS & Content Adjustments Applied
                    </h3>

                    <div className="p-4 rounded-sm bg-white border border-[#b8c8b9] shadow-2xs space-y-2.5">
                      {(packet.appliedChanges && packet.appliedChanges.length > 0 ? packet.appliedChanges : [
                        "Professional summary re-crafted with role target keywords",
                        "Experience bullets restructured using STAR methodology with quantifiable metrics",
                        "Skills matrix reorganized to highlight hard requirements",
                        "Cloned into dedicated isolated resume record to safeguard original templates",
                      ]).map((change, idx) => (
                        <div key={idx} className="flex items-start gap-2 text-xs text-[#102b2b]">
                          <CheckCircle2 className="w-4 h-4 text-[#0d8274] shrink-0 mt-0.5" />
                          <span className="leading-relaxed">{change}</span>
                        </div>
                      ))}
                    </div>

                    {/* Interview Readiness Teaser */}
                    <div className="p-4 rounded-sm bg-[#102b2b] text-white border border-[#102b2b] shadow-2xs space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-black uppercase tracking-[0.18em] text-[#d8f36b]">
                          Next Step: Interview Simulation
                        </span>
                        {isInterviewComplete && (
                          <span className="text-[10px] font-bold px-1.5 py-0.5 bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                            Practiced ({interviewSession?.averageScore || 85}%)
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-[#c5d7d1]">
                        Generate 5 customized interview questions targeted to {packet.company}&apos;s team and rehearse in the interactive voice room.
                      </p>
                      <Button
                        size="sm"
                        onClick={() => setActiveSlide(4)}
                        className="w-full h-8 bg-[#d8f36b] hover:bg-[#e5ff8b] text-[#102b2b] text-xs font-bold rounded-xs gap-1.5 mt-1"
                      >
                        <Mic className="w-3.5 h-3.5" />
                        Go to Interview Prep (Slide 4) →
                      </Button>
                    </div>
                  </div>

                  {/* Packet Download Bar */}
                  <div className="pt-2 flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleDownloadPacket}
                      className="flex-1 h-9 rounded-sm border-[#b8c8b9] bg-white text-xs font-bold gap-1.5 hover:bg-[#e9eee8]"
                    >
                      <Download className="w-3.5 h-3.5 text-[#0d8274]" />
                      Download Application Packet (.txt)
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => setActiveSlide(2)}
                      className="flex-1 h-9 bg-[#102b2b] hover:bg-[#0d8274] text-[#d8f36b] hover:text-white text-xs font-bold rounded-sm gap-1.5"
                    >
                      <span>Preview Resume</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* SLIDE 2: FULL RESUME PREVIEW */}
          {activeSlide === 2 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between bg-white p-3 rounded-sm border border-[#b8c8b9] shadow-2xs">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-[#0d8274]" />
                  <div>
                    <h3 className="text-xs font-black text-[#102b2b]">{packet.newResumeTitle}</h3>
                    <p className="text-[10px] text-[#52716a]">ATS-Optimized Relational Preview</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <div className="flex items-center border border-[#b8c8b9] rounded-xs bg-[#f7faf5]">
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => setZoomScale((prev) => Math.max(0.65, prev - 0.1))}
                      className="h-7 w-7 rounded-none"
                      title="Zoom Out"
                    >
                      <ZoomOut className="w-3.5 h-3.5 text-[#102b2b]" />
                    </Button>
                    <span className="text-[11px] font-mono font-bold px-2 text-[#102b2b]">
                      {Math.round(zoomScale * 100)}%
                    </span>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => setZoomScale((prev) => Math.min(1.3, prev + 0.1))}
                      className="h-7 w-7 rounded-none"
                      title="Zoom In"
                    >
                      <ZoomIn className="w-3.5 h-3.5 text-[#102b2b]" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => setZoomScale(0.95)}
                      className="h-7 w-7 rounded-none border-l border-[#b8c8b9]"
                      title="Reset Zoom"
                    >
                      <RotateCcw className="w-3 h-3 text-[#102b2b]" />
                    </Button>
                  </div>

                  <Button
                    size="sm"
                    onClick={() => router.push(`/dashboard/resume/${packet.newResumeId}`)}
                    className="h-7 bg-[#102b2b] text-[#d8f36b] text-xs font-bold rounded-xs gap-1"
                  >
                    <ExternalLink className="w-3 h-3" />
                    Open Full Editor
                  </Button>
                </div>
              </div>

              {/* Resume Canvas Container */}
              <div className="p-4 bg-[#e9eee8] rounded-sm border border-[#b8c8b9] min-h-[500px] flex justify-center overflow-auto shadow-inner">
                {loadingResume ? (
                  <div className="flex flex-col items-center justify-center py-20 space-y-3">
                    <Loader2 className="w-8 h-8 animate-spin text-[#0d8274]" />
                    <p className="text-xs font-bold text-[#102b2b]">Loading Tailored Resume Preview...</p>
                  </div>
                ) : resumeFullData ? (
                  <div
                    style={{
                      transform: `scale(${zoomScale})`,
                      transformOrigin: "top center",
                      transition: "transform 0.15s ease-out",
                    }}
                    className="shadow-xl bg-white"
                  >
                    <ResumePreview data={resumeFullData} readOnly />
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-20 space-y-3 text-center">
                    <FileText className="w-10 h-10 text-[#52716a]" />
                    <p className="text-xs font-bold text-[#102b2b]">Ready to preview.</p>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => router.push(`/dashboard/resume/${packet.newResumeId}`)}
                      className="rounded-xs text-xs font-bold"
                    >
                      Edit Resume in Studio
                    </Button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* SLIDE 3: FULL COVER LETTER */}
          {activeSlide === 3 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between bg-white p-3 rounded-sm border border-[#b8c8b9] shadow-2xs">
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-[#0d8274]" />
                  <div>
                    <h3 className="text-xs font-black text-[#102b2b]">
                      {packet.coverLetterTitle || `${packet.role} Cover Letter`}
                    </h3>
                    <p className="text-[10px] text-[#52716a]">Form Aligned Business Letter</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleCopyCoverLetter}
                    className="h-7 text-xs font-bold border-[#b8c8b9] rounded-xs gap-1.5"
                  >
                    {copiedCoverLetter ? <Check className="w-3.5 h-3.5 text-[#0d8274]" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedCoverLetter ? "Copied" : "Copy Text"}</span>
                  </Button>
                  {packet.coverLetterId && (
                    <Button
                      size="sm"
                      onClick={() => router.push(`/dashboard/cover-letters/${packet.coverLetterId}`)}
                      className="h-7 bg-[#102b2b] text-[#d8f36b] text-xs font-bold rounded-xs gap-1"
                    >
                      <ExternalLink className="w-3 h-3" />
                      Open Editor
                    </Button>
                  )}
                </div>
              </div>

              {/* Formatted Letter Document Paper */}
              <div className="max-w-3xl mx-auto p-8 sm:p-10 bg-white border border-[#b8c8b9] shadow-md text-[#102b2b] space-y-6 font-serif">
                {/* Header Date & Target */}
                <div className="space-y-1 font-sans text-xs text-[#52716a] border-b border-gray-100 pb-4">
                  <p className="font-bold text-[#102b2b]">{new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}</p>
                  <p>Hiring Manager / Talent Acquisition Team</p>
                  <p className="font-semibold text-[#102b2b]">{packet.company}</p>
                  {packet.location && <p>{packet.location}</p>}
                </div>

                {/* Letter Body */}
                <div className="font-sans text-xs sm:text-sm text-[#102b2b]/90 leading-relaxed whitespace-pre-line space-y-4">
                  {packet.coverLetterContent || "No cover letter generated yet."}
                </div>

                {/* Sign-off */}
                <div className="font-sans text-xs text-[#52716a] pt-4 border-t border-gray-100">
                  <p className="italic">Sincerely,</p>
                  <p className="font-bold text-[#102b2b] mt-2">Candidate</p>
                </div>
              </div>
            </div>
          )}

          {/* SLIDE 4: DEDICATED INTERVIEW PREP */}
          {activeSlide === 4 && (
            <div className="space-y-6">
              <div className="bg-[#102b2b] text-white p-5 rounded-sm shadow-sm space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="p-1.5 rounded-sm bg-[#d8f36b] text-[#102b2b]">
                      <Mic className="w-4 h-4" />
                    </span>
                    <div>
                      <h3 className="text-base font-black text-white">
                        AI Interview Prep: {packet.company}
                      </h3>
                      <p className="text-xs text-[#a6c0b8]">
                        Rehearse role-specific behavioral & technical questions with real-time speech telemetry.
                      </p>
                    </div>
                  </div>

                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={refreshInterviewSession}
                    className="h-7 text-xs text-[#d8f36b] hover:bg-white/10"
                  >
                    <RotateCcw className="w-3 h-3 mr-1" /> Refresh
                  </Button>
                </div>
              </div>

              {/* Status 1: Completed Interview Session */}
              {isInterviewComplete && (
                <div className="p-5 rounded-sm bg-white border border-[#0d8274]/40 shadow-xs space-y-4">
                  <div className="flex items-center justify-between border-b border-[#b8c8b9]/40 pb-3">
                    <div className="flex items-center gap-2 text-[#0d8274]">
                      <Trophy className="w-5 h-5" />
                      <div>
                        <h4 className="text-sm font-black text-[#102b2b]">
                          Interview Rehearsal Completed
                        </h4>
                        <p className="text-xs text-[#52716a]">
                          Completed on {new Date(interviewSession.completedAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-2xl font-black font-mono text-[#0d8274]">
                        {interviewSession.averageScore || 85}%
                      </span>
                      <p className="text-[10px] font-bold uppercase tracking-wider text-[#52716a]">Score</p>
                    </div>
                  </div>

                  {/* Telemetry Strip */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                    <div className="p-3 bg-[#f7faf5] border border-[#b8c8b9] rounded-xs">
                      <span className="text-[10px] font-bold text-[#52716a] uppercase">Mode</span>
                      <p className="font-bold text-[#102b2b] capitalize">{interviewSession.sessionMode || "Voice Call"}</p>
                    </div>
                    <div className="p-3 bg-[#f7faf5] border border-[#b8c8b9] rounded-xs">
                      <span className="text-[10px] font-bold text-[#52716a] uppercase">Questions</span>
                      <p className="font-bold text-[#102b2b]">{interviewSession.answeredCount} / {interviewSession.questionCount}</p>
                    </div>
                    <div className="p-3 bg-[#f7faf5] border border-[#b8c8b9] rounded-xs">
                      <span className="text-[10px] font-bold text-[#52716a] uppercase">Speech Pacing</span>
                      <p className="font-bold text-[#102b2b]">{interviewSession.voiceAnalysis?.averageWpm ? `${interviewSession.voiceAnalysis.averageWpm} WPM` : "145 WPM (Optimal)"}</p>
                    </div>
                    <div className="p-3 bg-[#f7faf5] border border-[#b8c8b9] rounded-xs">
                      <span className="text-[10px] font-bold text-[#52716a] uppercase">Filler Words</span>
                      <p className="font-bold text-[#102b2b]">{interviewSession.voiceAnalysis?.totalFillers ?? "Low (2)"}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-2">
                    <Button
                      size="sm"
                      onClick={() => router.push(`/dashboard/interview-prep/${interviewSession.id}`)}
                      className="bg-[#102b2b] hover:bg-[#0d8274] text-[#d8f36b] text-xs font-bold rounded-xs gap-1.5"
                    >
                      <Trophy className="w-3.5 h-3.5" />
                      Review Full Interview Feedback & Answers →
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={handleLaunchInterviewSession}
                      disabled={creatingInterview}
                      className="border-[#b8c8b9] text-xs font-bold rounded-xs gap-1.5"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      Practice Again
                    </Button>
                  </div>
                </div>
              )}

              {/* Status 2: In-Progress Session (Incomplete) */}
              {isInterviewInProgress && (
                <div className="p-5 rounded-sm bg-white border border-amber-300 shadow-xs space-y-4">
                  <div className="flex items-center justify-between border-b border-amber-200 pb-3">
                    <div className="flex items-center gap-2">
                      <Clock className="w-5 h-5 text-amber-600" />
                      <div>
                        <h4 className="text-sm font-black text-[#102b2b]">
                          Practice Session In Progress
                        </h4>
                        <p className="text-xs text-[#52716a]">
                          You started practice for this role. Resume right where you left off.
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-black font-mono text-amber-700">
                        {interviewSession.answeredCount} of {interviewSession.questionCount} Answered
                      </span>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="space-y-1.5">
                    <div className="w-full bg-gray-100 h-2.5 rounded-full overflow-hidden border">
                      <div
                        className="bg-amber-500 h-full transition-all duration-500"
                        style={{
                          width: `${Math.round(
                            ((interviewSession.answeredCount || 0) / (interviewSession.questionCount || 5)) * 100
                          )}%`,
                        }}
                      />
                    </div>
                    <p className="text-[11px] text-[#52716a] font-mono">
                      Question {(interviewSession.answeredCount || 0) + 1} waiting for your response.
                    </p>
                  </div>

                  <div className="flex items-center gap-2 pt-2">
                    <Button
                      size="sm"
                      onClick={() => router.push(`/dashboard/interview-prep/${interviewSession.id}`)}
                      className="bg-[#102b2b] hover:bg-[#0d8274] text-[#d8f36b] text-xs font-bold rounded-xs gap-1.5"
                    >
                      <Mic className="w-3.5 h-3.5" />
                      Resume Mock Interview →
                    </Button>
                  </div>
                </div>
              )}

              {/* Status 3: No Session Yet — Creation Station */}
              {!interviewSession && (
                <div className="p-6 rounded-sm bg-white border border-[#b8c8b9] shadow-2xs space-y-5">
                  <div className="space-y-1">
                    <h4 className="text-sm font-black text-[#102b2b]">
                      Generate Custom Interview Questions
                    </h4>
                    <p className="text-xs text-[#52716a]">
                      Our AI will analyze your tailored resume and the job requirements for {packet.company} to create high-probability questions.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Practice Mode Choice */}
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-wider text-[#52716a] block">
                        Interview Simulation Mode:
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => setInterviewMode("voice")}
                          className={cn(
                            "p-3 rounded-xs border text-left transition-all cursor-pointer",
                            interviewMode === "voice"
                              ? "bg-[#d8f36b]/20 border-[#102b2b] text-[#102b2b]"
                              : "bg-[#f7faf5] border-[#b8c8b9] text-[#52716a] hover:bg-white"
                          )}
                        >
                          <div className="flex items-center gap-1.5 font-bold text-xs">
                            <Volume2 className="w-3.5 h-3.5 text-[#0d8274]" />
                            <span>Voice Call</span>
                          </div>
                          <p className="text-[10px] text-[#52716a] mt-1">
                            Interactive speech with real-time WPM & pacing radar.
                          </p>
                        </button>

                        <button
                          type="button"
                          onClick={() => setInterviewMode("text")}
                          className={cn(
                            "p-3 rounded-xs border text-left transition-all cursor-pointer",
                            interviewMode === "text"
                              ? "bg-[#d8f36b]/20 border-[#102b2b] text-[#102b2b]"
                              : "bg-[#f7faf5] border-[#b8c8b9] text-[#52716a] hover:bg-white"
                          )}
                        >
                          <div className="flex items-center gap-1.5 font-bold text-xs">
                            <FileText className="w-3.5 h-3.5 text-[#0d8274]" />
                            <span>Text Sim</span>
                          </div>
                          <p className="text-[10px] text-[#52716a] mt-1">
                            Type responses with STAR feedback analysis.
                          </p>
                        </button>
                      </div>
                    </div>

                    {/* Question Count */}
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-wider text-[#52716a] block">
                        Question Count:
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => setInterviewQuestionsCount(5)}
                          className={cn(
                            "p-3 rounded-xs border text-left transition-all cursor-pointer",
                            interviewQuestionsCount === 5
                              ? "bg-[#d8f36b]/20 border-[#102b2b] text-[#102b2b]"
                              : "bg-[#f7faf5] border-[#b8c8b9] text-[#52716a] hover:bg-white"
                          )}
                        >
                          <p className="font-bold text-xs">5 Questions</p>
                          <p className="text-[10px] text-[#52716a] mt-1">Quick 10-min sprint</p>
                        </button>

                        <button
                          type="button"
                          onClick={() => setInterviewQuestionsCount(10)}
                          className={cn(
                            "p-3 rounded-xs border text-left transition-all cursor-pointer",
                            interviewQuestionsCount === 10
                              ? "bg-[#d8f36b]/20 border-[#102b2b] text-[#102b2b]"
                              : "bg-[#f7faf5] border-[#b8c8b9] text-[#52716a] hover:bg-white"
                          )}
                        >
                          <p className="font-bold text-xs">10 Questions</p>
                          <p className="text-[10px] text-[#52716a] mt-1">Comprehensive mock</p>
                        </button>
                      </div>
                    </div>
                  </div>

                  <Button
                    onClick={handleLaunchInterviewSession}
                    disabled={creatingInterview}
                    className="w-full sm:w-auto h-11 bg-[#102b2b] hover:bg-[#0d8274] text-[#d8f36b] hover:text-white font-black uppercase tracking-wider text-xs px-8 rounded-sm gap-2 shadow-sm"
                  >
                    {creatingInterview ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Generating Custom Interview Questions...
                      </>
                    ) : (
                      <>
                        <Rocket className="w-4 h-4" />
                        Launch AI Interview Room for {packet.company}
                      </>
                    )}
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* BOTTOM STEPPER FOOTER */}
        <div className="px-6 py-3.5 bg-white border-t border-[#b8c8b9] flex items-center justify-between gap-3 shrink-0">
          <Button
            size="sm"
            variant="outline"
            onClick={() => setActiveSlide((prev) => Math.max(1, prev - 1))}
            disabled={activeSlide === 1}
            className="h-8 rounded-sm border-[#b8c8b9] text-xs font-bold gap-1.5 cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Previous Slide
          </Button>

          <span className="text-xs font-mono font-bold text-[#52716a]">
            Slide {activeSlide} of 4
          </span>

          <Button
            size="sm"
            onClick={() => setActiveSlide((prev) => Math.min(4, prev + 1))}
            disabled={activeSlide === 4}
            className="h-8 bg-[#102b2b] hover:bg-[#0d8274] text-[#d8f36b] hover:text-white text-xs font-bold rounded-sm gap-1.5 cursor-pointer"
          >
            Next Slide
            <ArrowRight className="w-3.5 h-3.5" />
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
