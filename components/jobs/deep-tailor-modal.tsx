"use client";

import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Sparkles,
  Briefcase,
  Building2,
  GraduationCap,
  FileText,
  Mail,
  ExternalLink,
  CheckCircle2,
  Loader2,
  Lock,
  ArrowRight,
  Copy,
  FolderGit2,
} from "lucide-react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";

interface DeepTailorModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialRole?: string;
  initialCompany?: string;
  initialDescription?: string;
  initialSalary?: string;
  initialLocation?: string;
  initialUrl?: string;
  applicationId?: string;
  onSuccess?: (result: any) => void;
}

export function DeepTailorModal({
  open,
  onOpenChange,
  initialRole = "",
  initialCompany = "",
  initialDescription = "",
  initialSalary = "",
  initialLocation = "",
  initialUrl = "",
  applicationId,
  onSuccess,
}: DeepTailorModalProps) {
  const [role, setRole] = useState(initialRole);
  const [company, setCompany] = useState(initialCompany);
  const [description, setDescription] = useState(initialDescription);
  const [salary, setSalary] = useState(initialSalary);
  const [location, setLocation] = useState(initialLocation);
  const [url, setUrl] = useState(initialUrl);

  const [loadingContext, setLoadingContext] = useState(false);
  const [isTailoring, setIsTailoring] = useState(false);
  const [progressStep, setProgressStep] = useState<string>("");
  const [resultData, setResultData] = useState<any | null>(null);

  const [isPro, setIsPro] = useState(false);
  const [canvasCourseCount, setCanvasCourseCount] = useState(0);
  const [existingResumeCount, setExistingResumeCount] = useState(0);

  // Sync inputs on open
  useEffect(() => {
    if (open) {
      setRole(initialRole);
      setCompany(initialCompany);
      setDescription(initialDescription);
      setSalary(initialSalary);
      setLocation(initialLocation);
      setUrl(initialUrl);
      setResultData(null);
      checkUserStatus();
    }
  }, [open, initialRole, initialCompany, initialDescription, initialSalary, initialLocation, initialUrl]);

  const checkUserStatus = async () => {
    setLoadingContext(true);
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const [
        { data: profile },
        { count: coursesCount },
        { count: resumesCount }
      ] = await Promise.all([
        supabase.from("profiles").select("is_pro, subscription_status").eq("id", user.id).maybeSingle(),
        supabase.from("canvas_courses").select("*", { count: "exact", head: true }).eq("user_id", user.id),
        supabase.from("resumes").select("*", { count: "exact", head: true }).eq("user_id", user.id),
      ]);

      const proActive = profile?.is_pro === true ||
        profile?.subscription_status === "active" ||
        profile?.subscription_status === "trialing";

      setIsPro(proActive);
      setCanvasCourseCount(coursesCount || 0);
      setExistingResumeCount(resumesCount || 0);
    } catch (err) {
      console.error("Context fetch error:", err);
    } finally {
      setLoadingContext(false);
    }
  };

  const handleRunTailoring = async () => {
    if (!role.trim() || !company.trim()) {
      toast.error("Please enter both target role and company name");
      return;
    }

    setIsTailoring(true);
    setProgressStep("Harvesting career records, Canvas courses & past resumes...");

    try {
      const stepTimer1 = setTimeout(() => {
        setProgressStep("Synthesizing ATS-optimized resume from scratch (STAR bullets, metrics)...");
      }, 1200);

      const stepTimer2 = setTimeout(() => {
        setProgressStep("Drafting tailored 3-paragraph executive cover letter...");
      }, 2500);

      const stepTimer3 = setTimeout(() => {
        setProgressStep("Configuring dedicated job portfolio microsite...");
      }, 3800);

      const res = await fetch("/api/ai/deep-tailor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          role,
          company,
          description,
          salary_range: salary,
          location,
          url,
          applicationId,
        }),
      });

      clearTimeout(stepTimer1);
      clearTimeout(stepTimer2);
      clearTimeout(stepTimer3);

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Tailoring failed");
      }

      setResultData(data.data);
      toast.success(`🎉 Tailored career suite generated for ${company}!`);
      if (onSuccess) {
        onSuccess(data.data);
      }
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Failed to generate tailored package");
    } finally {
      setIsTailoring(false);
      setProgressStep("");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl bg-[#0c121e] border-white/10 text-white rounded-3xl p-6 sm:p-8 max-h-[90vh] overflow-y-auto shadow-2xl">
        <DialogHeader className="space-y-1.5 pb-4 border-b border-white/10">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Sparkles className="h-4 w-4" />
            </div>
            <div>
              <DialogTitle className="text-lg font-black text-white">
                Deep AI Job Tailoring & Cover Letter Suite
              </DialogTitle>
              <DialogDescription className="text-xs text-white/60">
                Creates a tailored resume from scratch, an executive cover letter, and a dedicated company microsite.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {!resultData ? (
          <div className="space-y-5 pt-3">
            {/* Career Context Harvester Pill Box */}
            <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/5 flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2 text-white/70">
                <GraduationCap className="h-4 w-4 text-emerald-400 shrink-0" />
                <span>
                  <strong>{canvasCourseCount}</strong> Verified Canvas Courses detected
                </span>
              </div>
              <div className="flex items-center gap-2 text-white/70">
                <FileText className="h-4 w-4 text-sky-400 shrink-0" />
                <span>
                  <strong>{existingResumeCount}</strong> Existing Resumes to harvest
                </span>
              </div>
              {isPro ? (
                <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/30 font-mono text-[10px]">
                  ✨ Pro: Microsite Included
                </Badge>
              ) : (
                <Badge variant="outline" className="border-amber-500/30 text-amber-400 text-[10px]">
                  Free: Upgrade for Microsite
                </Badge>
              )}
            </div>

            {/* Target Job Inputs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-bold uppercase text-white/70">Target Role *</Label>
                <Input
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  placeholder="e.g. Senior Fullstack Engineer"
                  className="bg-black/30 border-white/15 text-white text-xs h-10 rounded-xl"
                  disabled={isTailoring}
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-bold uppercase text-white/70">Target Company *</Label>
                <Input
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  placeholder="e.g. Stripe, Acme Corp"
                  className="bg-black/30 border-white/15 text-white text-xs h-10 rounded-xl"
                  disabled={isTailoring}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-bold uppercase text-white/70">Location</Label>
                <Input
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g. Remote / San Francisco, CA"
                  className="bg-black/30 border-white/15 text-white text-xs h-10 rounded-xl"
                  disabled={isTailoring}
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-bold uppercase text-white/70">Salary Range / Target</Label>
                <Input
                  value={salary}
                  onChange={(e) => setSalary(e.target.value)}
                  placeholder="e.g. $160,000 - $190,000"
                  className="bg-black/30 border-white/15 text-white text-xs h-10 rounded-xl"
                  disabled={isTailoring}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-bold uppercase text-white/70">
                Job Posting Requirements & Description
              </Label>
              <Textarea
                rows={5}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Paste the job description, key qualifications, and tech stack here..."
                className="bg-black/30 border-white/15 text-white text-xs rounded-xl leading-relaxed"
                disabled={isTailoring}
              />
            </div>

            {/* Action Bar */}
            <div className="pt-2 flex items-center justify-between gap-3 border-t border-white/10">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onOpenChange(false)}
                className="text-white/60 hover:text-white"
                disabled={isTailoring}
              >
                Cancel
              </Button>
              <Button
                onClick={handleRunTailoring}
                disabled={isTailoring || !role.trim() || !company.trim()}
                className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs h-10 px-5 rounded-xl gap-2 shadow-lg shadow-emerald-950/40"
              >
                {isTailoring ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Synthesizing...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4" />
                    <span>Generate Tailored Suite</span>
                  </>
                )}
              </Button>
            </div>

            {isTailoring && (
              <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-center space-y-1.5 animate-pulse">
                <p className="text-xs font-bold text-emerald-300">{progressStep}</p>
                <p className="text-[10px] text-white/50">
                  Harvesting all career milestones to ensure 0 missing sections.
                </p>
              </div>
            )}
          </div>
        ) : (
          /* RESULT SCREEN */
          <div className="space-y-6 pt-4">
            <div className="p-5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-center space-y-1">
              <div className="h-10 w-10 mx-auto rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400">
                <CheckCircle2 className="h-6 w-6" />
              </div>
              <h3 className="text-base font-bold text-white">Career Suite Ready for {company}!</h3>
              <p className="text-xs text-white/60">
                A customized resume, executive cover letter, and dedicated microsite have been created and linked to your job tracker.
              </p>
            </div>

            {/* Deliverables Cards */}
            <div className="space-y-3">
              {/* 1. Tailored Resume */}
              <div className="p-4 rounded-2xl border border-white/10 bg-white/[0.02] flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-sky-500/15 text-sky-400 flex items-center justify-center">
                    <FileText className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white">ATS-Optimized Tailored Resume</h4>
                    <p className="text-[11px] text-white/50">
                      With STAR bullets, quantifiable metrics & verified Canvas coursework
                    </p>
                  </div>
                </div>
                <Button asChild size="sm" className="bg-sky-600 hover:bg-sky-500 text-white text-xs h-8 rounded-lg gap-1.5">
                  <Link href={`/builder/${resultData.resumeId}`} target="_blank">
                    Open in Builder
                    <ExternalLink className="h-3 w-3" />
                  </Link>
                </Button>
              </div>

              {/* 2. Tailored Cover Letter */}
              <div className="p-4 rounded-2xl border border-white/10 bg-white/[0.02] flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-purple-500/15 text-purple-400 flex items-center justify-center">
                    <Mail className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white">Targeted Executive Cover Letter</h4>
                    <p className="text-[11px] text-white/50">
                      Addressed directly to {company} leadership & hiring team
                    </p>
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    navigator.clipboard.writeText(resultData.package?.coverLetter?.content || "");
                    toast.success("Cover letter text copied to clipboard!");
                  }}
                  className="border-white/15 bg-white/5 hover:bg-white/10 text-white text-xs h-8 rounded-lg gap-1.5"
                >
                  <Copy className="h-3 w-3" />
                  Copy Letter
                </Button>
              </div>

              {/* 3. Dedicated Job Portfolio Page */}
              <div className="p-4 rounded-2xl border border-white/10 bg-white/[0.02] flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center">
                    <Sparkles className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white flex items-center gap-2">
                      Dedicated Job Portfolio Page
                      {resultData.dedicatedPortfolioUrl && (
                        <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/30 text-[9px]">
                          LIVE
                        </Badge>
                      )}
                    </h4>
                    <p className="text-[11px] text-white/50">
                      Bespoke company microsite with greeting, resume preview & Canvas badges
                    </p>
                  </div>
                </div>

                {resultData.dedicatedPortfolioUrl ? (
                  <Button asChild size="sm" className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs h-8 rounded-lg gap-1.5">
                    <Link href={resultData.dedicatedPortfolioUrl} target="_blank">
                      View Page
                      <ExternalLink className="h-3 w-3" />
                    </Link>
                  </Button>
                ) : (
                  <Button asChild size="sm" variant="outline" className="border-amber-500/30 bg-amber-500/10 text-amber-300 text-xs h-8 rounded-lg gap-1.5">
                    <Link href="/dashboard/subscription">
                      <Lock className="h-3 w-3" />
                      Upgrade to Pro
                    </Link>
                  </Button>
                )}
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <Button
                onClick={() => onOpenChange(false)}
                className="bg-white/10 hover:bg-white/20 text-white text-xs h-9 rounded-xl px-5"
              >
                Done
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
