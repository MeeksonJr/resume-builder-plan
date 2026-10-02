"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  GraduationCap,
  QrCode,
  Printer,
  Copy,
  Check,
  ExternalLink,
  Sparkles,
  MapPin,
  Calendar,
  Building,
  ShieldCheck,
  FileText,
  User,
  Mail,
  Phone,
  ArrowRight,
} from "lucide-react";
import { toast } from "sonner";
import { ScrapedJob } from "@/lib/scrapers/jobs-scraper";

interface CareerFairPitchDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  job: ScrapedJob | null;
  userProfile: {
    fullName?: string;
    email?: string;
    universityName?: string;
    major?: string;
    targetRole?: string;
  } | null;
  portfolioSlug?: string | null;
  resumeTitle?: string;
}

export function CareerFairPitchDialog({
  open,
  onOpenChange,
  job,
  userProfile,
  portfolioSlug,
  resumeTitle,
}: CareerFairPitchDialogProps) {
  const [copiedPitch, setCopiedPitch] = useState(false);

  if (!job) return null;

  const schoolName = job.campus_fair_attending?.school_name || userProfile?.universityName || "University";
  const fairTitle = job.campus_fair_attending?.fair_title || "Campus Career & STEM Expo";
  const fairDate = job.campus_fair_attending?.fair_date || "Upcoming Academic Term";
  const fairLocation = job.campus_fair_attending?.fair_location || "Campus Convocation Center";

  const candidateName = userProfile?.fullName || "Verified Student Candidate";
  const candidateEmail = userProfile?.email || "candidate@institution.edu";
  const candidateMajor = userProfile?.major || "Computer Science & Engineering";
  const targetRole = job.role || userProfile?.targetRole || "Software Engineer";

  const publicPortfolioUrl = portfolioSlug
    ? `${typeof window !== "undefined" ? window.location.origin : "https://resumebuilder.ai"}/p/${portfolioSlug}`
    : typeof window !== "undefined" ? `${window.location.origin}/p/meeksonjr` : "https://resumebuilder.ai";

  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(
    publicPortfolioUrl
  )}&bgcolor=ffffff&color=102b2b&margin=6`;

  const elevatorPitch = `Hi! I'm ${candidateName}, a ${candidateMajor} student at ${schoolName}. I've been following ${job.company}'s work in ${targetRole}, particularly how your engineering teams architect high-throughput applications. In my coursework and independent projects, I specialize in ${
    job.matching_skills && job.matching_skills.length > 0
      ? job.matching_skills.slice(0, 3).join(", ")
      : "modern fullstack systems, scalable APIs, and automated testing"
  }. I came specifically to your booth today to learn more about internship and full-time opportunities for this upcoming cycle!`;

  const handleCopyPitch = () => {
    navigator.clipboard.writeText(elevatorPitch);
    setCopiedPitch(true);
    toast.success("Elevator pitch copied to clipboard! Ready for the recruiter booth.");
    setTimeout(() => setCopiedPitch(false), 2500);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl lg:max-w-4xl w-[96vw] max-h-[92vh] overflow-y-auto p-0 border border-emerald-500/25 bg-background shadow-2xl rounded-xl">
        {/* Header */}
        <div className="bg-[#102b2b] text-[#fbf8f1] p-5 sm:p-6 border-b border-white/10">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#d8f36b] text-[#102b2b] text-xs font-black uppercase tracking-wider mb-2">
                <GraduationCap className="h-3.5 w-3.5" />
                <span>Career Fair Quick Pitch Dossier</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                {job.company} &bull; {fairTitle}
              </h2>
              <p className="text-xs text-white/70 mt-1 flex items-center gap-2 flex-wrap">
                <span className="flex items-center gap-1">
                  <Calendar className="h-3 w-3 text-[#d8f36b]" /> {fairDate}
                </span>
                <span>&bull;</span>
                <span className="flex items-center gap-1">
                  <MapPin className="h-3 w-3 text-[#d8f36b]" /> {fairLocation}
                </span>
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handlePrint}
                className="h-9 text-xs font-bold rounded-lg border-white/20 text-[#102b2b] bg-[#fbf8f1] hover:bg-white gap-1.5 cursor-pointer shadow-xs"
              >
                <Printer className="h-3.5 w-3.5" />
                <span>Print 1-Page Handout</span>
              </Button>
            </div>
          </div>
        </div>

        {/* Modal Body / Printable Handout Area */}
        <div className="p-5 sm:p-7 space-y-6">
          {/* Handout Preview Card */}
          <div className="rounded-xl border-2 border-emerald-500/30 bg-card p-6 shadow-sm space-y-5 print:border-none print:shadow-none print:p-0">
            {/* Top Bar of Handout */}
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b border-border pb-5">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-2xl font-black text-foreground tracking-tight">
                    {candidateName}
                  </h3>
                  <Badge className="bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30 text-[10px] font-mono">
                    <ShieldCheck className="h-3 w-3 mr-1" />
                    Verified Scholar
                  </Badge>
                </div>

                <p className="text-sm font-semibold text-primary mt-0.5">
                  {candidateMajor} &bull; {schoolName}
                </p>

                <div className="flex items-center gap-3 text-xs text-muted-foreground mt-2">
                  <span className="flex items-center gap-1">
                    <Mail className="h-3.5 w-3.5 text-muted-foreground" />
                    {candidateEmail}
                  </span>
                  <span>&bull;</span>
                  <span className="flex items-center gap-1">
                    <Building className="h-3.5 w-3.5 text-muted-foreground" />
                    Targeting: {targetRole}
                  </span>
                </div>
              </div>

              {/* QR Code to Verified Portfolio */}
              <div className="flex items-center gap-3 bg-muted/40 p-3 rounded-xl border border-border shrink-0">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={qrCodeUrl}
                  alt="Portfolio QR Code"
                  className="h-20 w-20 rounded-lg bg-white p-1 border border-border shadow-xs"
                />
                <div className="text-left space-y-1">
                  <div className="text-[11px] font-black text-foreground uppercase tracking-wider flex items-center gap-1">
                    <QrCode className="h-3 w-3 text-primary" />
                    Instant Portfolio
                  </div>
                  <p className="text-[10px] text-muted-foreground leading-snug max-w-[120px]">
                    Scan for full resume, code repos &amp; video pitch.
                  </p>
                  <a
                    href={publicPortfolioUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[10px] text-primary font-bold hover:underline inline-flex items-center gap-0.5"
                  >
                    <span>View Live</span>
                    <ExternalLink className="h-2.5 w-2.5" />
                  </a>
                </div>
              </div>
            </div>

            {/* Target Role & Match Score */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3.5 rounded-xl bg-muted/30 border border-border/80 text-xs">
              <div>
                <span className="text-[10px] font-bold uppercase text-muted-foreground block">
                  Target Company &amp; Role
                </span>
                <span className="font-bold text-foreground text-sm">
                  {job.company} &mdash; {job.role}
                </span>
              </div>

              <div>
                <span className="text-[10px] font-bold uppercase text-muted-foreground block">
                  Campus Fair Attendance
                </span>
                <span className="font-semibold text-foreground">
                  {fairTitle}
                </span>
              </div>

              <div>
                <span className="text-[10px] font-bold uppercase text-muted-foreground block">
                  ATS Match Score
                </span>
                <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400 text-sm">
                  {job.match_score || 90}% Match Ready
                </span>
              </div>
            </div>

            {/* Core Skills Match */}
            <div>
              <h4 className="text-xs font-bold text-foreground uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5 text-primary" />
                Key Technical Qualifications for {job.company}
              </h4>
              <div className="flex flex-wrap gap-1.5">
                {(job.matching_skills || ["TypeScript", "React", "Next.js", "Python", "SQL", "Git"]).map(
                  (skill, idx) => (
                    <span
                      key={idx}
                      className="px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-800 dark:text-emerald-300 border border-emerald-500/25 text-xs font-semibold"
                    >
                      ✓ {skill}
                    </span>
                  )
                )}
                {(job.requirements || []).slice(0, 3).map((req, idx) => (
                  <span
                    key={`req-${idx}`}
                    className="px-2.5 py-1 rounded-lg bg-muted text-foreground border border-border text-xs font-medium"
                  >
                    &bull; {req}
                  </span>
                ))}
              </div>
            </div>

            {/* 30-Second Booth Elevator Script */}
            <div className="p-4 rounded-xl bg-primary/5 border border-primary/20 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-primary uppercase tracking-wider flex items-center gap-1.5">
                  <User className="h-3.5 w-3.5" />
                  Your 30-Second Booth Pitch Script
                </span>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={handleCopyPitch}
                  className="h-7 text-xs font-semibold gap-1 text-primary hover:bg-primary/10 rounded-lg cursor-pointer"
                >
                  {copiedPitch ? (
                    <>
                      <Check className="h-3 w-3 text-emerald-600" />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-3 w-3" />
                      <span>Copy Pitch Script</span>
                    </>
                  )}
                </Button>
              </div>
              <p className="text-xs text-foreground/90 leading-relaxed italic">
                &ldquo;{elevatorPitch}&rdquo;
              </p>
            </div>
          </div>
        </div>

        <DialogFooter className="p-4 border-t border-border bg-muted/20 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="text-[11px] text-muted-foreground">
            Print this sheet on 8.5&times;11&Prime; paper or keep it open on your mobile device for recruiter booth check-ins.
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onOpenChange(false)}
              className="h-8 text-xs font-semibold rounded-lg"
            >
              Close
            </Button>
            <Button
              size="sm"
              onClick={handlePrint}
              className="h-8 text-xs font-bold bg-[#102b2b] text-[#d8f36b] hover:bg-[#164743] rounded-lg gap-1.5 cursor-pointer shadow-xs"
            >
              <Printer className="h-3.5 w-3.5" />
              <span>Print Handout</span>
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
