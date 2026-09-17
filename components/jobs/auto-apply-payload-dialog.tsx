"use client";

import React, { useState, useMemo, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Copy,
  Check,
  Download,
  Bot,
  Zap,
  ShieldCheck,
  FileCode2,
  ExternalLink,
  Play,
  RotateCcw,
  Sparkles,
  Bookmark,
  Send,
  Sliders,
  CheckCircle2,
  Terminal,
} from "lucide-react";
import {
  generateAtsPayload,
  downloadJsonPayload,
  type AtsPlatform,
  type CandidatePreferences,
} from "@/lib/jobs/form-filler-payload";
import {
  generateAutofillBookmarklet,
  executeApplicationDispatch,
  detectJobPortal,
  type DispatchStep,
  type DispatchResult,
} from "@/lib/jobs/auto-apply-dispatcher";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";

const PREFS_STORAGE_KEY = "resumeforge_auto_apply_prefs";

interface AutoApplyPayloadDialogProps {
  resumeData: any;
  jobRole?: string;
  companyName?: string;
  jobUrl?: string;
  triggerButton?: React.ReactNode;
}

export function AutoApplyPayloadDialog({
  resumeData,
  jobRole,
  companyName,
  jobUrl,
  triggerButton,
}: AutoApplyPayloadDialogProps) {
  const [platform, setPlatform] = useState<AtsPlatform>("universal");
  const [workAuth, setWorkAuth] = useState<NonNullable<CandidatePreferences["workAuthorization"]>>("citizen");
  const [noticeWeeks, setNoticeWeeks] = useState<number>(2);
  const [desiredSalary, setDesiredSalary] = useState<string>("$150,000");
  const [copied, setCopied] = useState(false);
  const [copiedScript, setCopiedScript] = useState(false);
  const [activeTab, setActiveTab] = useState<string>("config");
  const [isSavingTracker, setIsSavingTracker] = useState(false);

  // Live Dispatch Simulation state
  const [isDispatching, setIsDispatching] = useState(false);
  const [dispatchResult, setDispatchResult] = useState<DispatchResult | null>(null);
  const [dispatchSteps, setDispatchSteps] = useState<DispatchStep[]>([]);
  const [dispatchLogs, setDispatchLogs] = useState<string[]>([]);

  // 1. Persistent preferences sync with localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(PREFS_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.workAuth) setWorkAuth(parsed.workAuth);
        if (parsed.noticeWeeks !== undefined) setNoticeWeeks(Number(parsed.noticeWeeks));
        if (parsed.desiredSalary) setDesiredSalary(parsed.desiredSalary);
        if (parsed.platform) setPlatform(parsed.platform);
      }
    } catch {
      // LocalStorage unavailable
    }
  }, []);

  const savePreferences = (overrides?: Partial<{
    workAuth: CandidatePreferences["workAuthorization"];
    noticeWeeks: number;
    desiredSalary: string;
    platform: AtsPlatform;
  }>) => {
    try {
      const dataToSave = {
        workAuth: overrides?.workAuth ?? workAuth,
        noticeWeeks: overrides?.noticeWeeks ?? noticeWeeks,
        desiredSalary: overrides?.desiredSalary ?? desiredSalary,
        platform: overrides?.platform ?? platform,
      };
      localStorage.setItem(PREFS_STORAGE_KEY, JSON.stringify(dataToSave));
    } catch {
      // Ignore storage errors
    }
  };

  // 2. Automatically detect platform if jobUrl is provided
  useEffect(() => {
    if (jobUrl) {
      const detected = detectJobPortal(jobUrl);
      if (detected === "greenhouse" || detected === "lever" || detected === "workday") {
        setPlatform(detected);
      }
    }
  }, [jobUrl]);

  const preferences: CandidatePreferences = useMemo(() => ({
    workAuthorization: workAuth,
    noticePeriodWeeks: noticeWeeks,
    desiredSalary: desiredSalary || undefined,
  }), [workAuth, noticeWeeks, desiredSalary]);

  const payload = useMemo(() => {
    return generateAtsPayload(resumeData, platform, preferences);
  }, [resumeData, platform, preferences]);

  const jsonString = useMemo(() => {
    return JSON.stringify(payload, null, 2);
  }, [payload]);

  // Extract candidate profile for bookmarklet and dispatcher
  const candidateProfile = useMemo(() => {
    const pInfo = resumeData?.personal_info || resumeData?.profile || {};
    const cInfo = resumeData?.contact_info || {};
    const fullName = pInfo.fullName || pInfo.full_name || cInfo.full_name || "Candidate";
    const email = pInfo.email || cInfo.email || "";
    const phone = pInfo.phone || cInfo.phone || "";
    const location = pInfo.location || cInfo.location || "";
    const linkedinUrl = pInfo.linkedin || "";
    const githubUrl = pInfo.github || "";
    const portfolioUrl = pInfo.website || pInfo.portfolio || "";
    const expCount = (resumeData?.work_experiences || resumeData?.experiences || []).length;

    let authMapped: "us_citizen" | "permanent_resident" | "visa_sponsor" | "other" = "us_citizen";
    if (workAuth === "permanent_resident") authMapped = "permanent_resident";
    else if (workAuth === "work_visa" || workAuth === "sponsorship_required") authMapped = "visa_sponsor";

    return {
      fullName,
      email,
      phone,
      location,
      linkedinUrl,
      githubUrl,
      portfolioUrl,
      yearsOfExperience: Math.max(expCount * 2, 2),
      workAuthorization: authMapped,
      salaryExpectation: desiredSalary,
    };
  }, [resumeData, workAuth, desiredSalary]);

  // 1-Click Bookmarklet javascript
  const bookmarkletCode = useMemo(() => {
    return generateAutofillBookmarklet(candidateProfile);
  }, [candidateProfile]);

  // Readiness Score Calculation
  const readiness = useMemo(() => {
    let score = 0;
    const checks: { label: string; passed: boolean }[] = [];

    const hasName = Boolean(candidateProfile.fullName && candidateProfile.fullName !== "Candidate");
    const hasEmail = Boolean(candidateProfile.email);
    const hasPhone = Boolean(candidateProfile.phone);
    const hasLocation = Boolean(candidateProfile.location);
    const hasExp = (resumeData?.work_experiences || resumeData?.experiences || []).length > 0;
    const hasSkills = (resumeData?.skills || []).length > 0;

    checks.push({ label: "Full Name", passed: hasName });
    checks.push({ label: "Email Address", passed: hasEmail });
    checks.push({ label: "Phone Number", passed: hasPhone });
    checks.push({ label: "Location", passed: hasLocation });
    checks.push({ label: "Work Experience", passed: hasExp });
    checks.push({ label: "Target Skills", passed: hasSkills });
    checks.push({ label: "Work Authorization", passed: Boolean(workAuth) });
    checks.push({ label: "Compensation Goal", passed: Boolean(desiredSalary) });

    const passedCount = checks.filter((c) => c.passed).length;
    score = Math.round((passedCount / checks.length) * 100);

    return { score, checks };
  }, [candidateProfile, resumeData, workAuth, desiredSalary]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(jsonString);
      setCopied(true);
      toast.success(`${platform.toUpperCase()} application payload copied to clipboard!`);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Failed to copy payload");
    }
  };

  const handleCopyScript = async () => {
    try {
      await navigator.clipboard.writeText(bookmarkletCode);
      setCopiedScript(true);
      toast.success("1-Click Autofill Bookmarklet code copied!");
      setTimeout(() => setCopiedScript(false), 2000);
    } catch {
      toast.error("Failed to copy script");
    }
  };

  const handleDownload = () => {
    const filename = `${companyName ? `${companyName}_` : ""}${platform}_autofill.json`.toLowerCase().replace(/\s+/g, "_");
    const success = downloadJsonPayload(payload, filename);
    if (success) {
      toast.success(`Exported ${filename}`);
    } else {
      toast.error("Export failed");
    }
  };

  // Run live application dispatch simulation
  const handleRunDispatch = async () => {
    setIsDispatching(true);
    setDispatchResult(null);
    setDispatchLogs([`[RUNNER] Initiating real-time form fill runner for ${platform.toUpperCase()}...`]);
    setDispatchSteps([]);

    try {
      const portalType = platform === "universal" ? "generic" : platform;
      const res = await executeApplicationDispatch(
        `APP-${Date.now()}`,
        portalType,
        candidateProfile,
        (step) => {
          setDispatchSteps((prev) => {
            const next = [...prev];
            const idx = next.findIndex((s) => s.stepIndex === step.stepIndex);
            if (idx >= 0) next[idx] = step;
            else next.push(step);
            return next;
          });
          setDispatchLogs((logs) => [
            ...logs,
            `[${step.status.toUpperCase()}] Step ${step.stepIndex}: ${step.name}`,
          ]);
        }
      );

      setDispatchResult(res);
      toast.success(`Form-fill simulation verified! Token: ${res.verificationId}`);
    } catch (err: any) {
      toast.error("Dispatch simulation encountered an error: " + err.message);
    } finally {
      setIsDispatching(false);
    }
  };

  // Save directly to Job Tracker Kanban
  const handleSaveToTracker = async () => {
    if (!companyName && !jobRole) {
      toast.error("Please ensure Job Role and Company Name are specified.");
      return;
    }

    setIsSavingTracker(true);
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (user) {
        await supabase.from("jobs").insert({
          user_id: user.id,
          title: jobRole || "Software Engineer",
          company: companyName || "Target Company",
          status: "applied",
          location: candidateProfile.location || "Remote",
          salary: desiredSalary,
          notes: `Autofilled via ${platform.toUpperCase()} payload generator on ${new Date().toLocaleDateString()}`,
        });
        toast.success(`Saved "${jobRole || "Application"}" to Job Tracker as Applied!`);
      } else {
        toast.info("Application logged locally! Log in to sync to cloud database.");
      }
    } catch (err: any) {
      toast.error("Could not save to tracker: " + err.message);
    } finally {
      setIsSavingTracker(false);
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        {triggerButton || (
          <Button
            variant="outline"
            size="sm"
            className="h-8 px-2.5 text-xs gap-1.5 border-neutral-300 hover:bg-neutral-100 rounded-lg shadow-sm"
            title="Export 1-Click Form-Fill Payload & Live Auto-Apply"
          >
            <Bot className="h-3.5 w-3.5 text-indigo-600" />
            <span>ATS Form-Fill Generator</span>
          </Button>
        )}
      </DialogTrigger>

      <DialogContent className="w-[96vw] max-w-4xl sm:max-w-3xl md:max-w-4xl max-h-[92vh] rounded-2xl border-neutral-800 p-0 overflow-hidden bg-white dark:bg-slate-950 flex flex-col shadow-2xl">
        {/* Modal Header */}
        <div className="bg-[#102b2b] text-[#f8f4ec] px-6 py-5 shrink-0 border-b border-white/10">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <span className="p-2 bg-[#d8f36b]/20 text-[#d8f36b] border border-[#d8f36b]/30 rounded-xl">
                <Zap className="h-5 w-5" />
              </span>
              <div>
                <DialogTitle className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
                  ATS Form-Fill Payload & Auto-Dispatcher
                  <Badge className="bg-[#d8f36b] text-[#102b2b] font-bold text-[10px] hover:bg-[#d8f36b]/90">
                    Phase 49 & 54
                  </Badge>
                </DialogTitle>
                <DialogDescription className="text-xs text-neutral-300 mt-0.5">
                  Universal application dossiers pre-mapped for Greenhouse, Lever, Workday, and Ashby.
                  {companyName && ` Tailored for ${jobRole || "role"} at ${companyName}.`}
                </DialogDescription>
              </div>
            </div>

            {/* Completeness Pill */}
            <div className="flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-xl border border-white/15 shrink-0">
              <Sparkles className="w-3.5 h-3.5 text-[#d8f36b]" />
              <div className="text-right">
                <div className="text-[10px] text-white/70 uppercase tracking-wider font-semibold">ATS Readiness</div>
                <div className="text-xs font-bold text-[#d8f36b]">{readiness.score}% Complete</div>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Body with Tabs */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid grid-cols-3 w-full max-w-md mx-auto mb-4 bg-neutral-100 dark:bg-slate-900 rounded-xl p-1">
              <TabsTrigger value="config" className="text-xs font-bold gap-1.5 rounded-lg">
                <Sliders className="w-3.5 h-3.5" />
                Config & Preferences
              </TabsTrigger>
              <TabsTrigger value="json" className="text-xs font-bold gap-1.5 rounded-lg">
                <FileCode2 className="w-3.5 h-3.5" />
                Live JSON Payload
              </TabsTrigger>
              <TabsTrigger value="dispatcher" className="text-xs font-bold gap-1.5 rounded-lg">
                <Play className="w-3.5 h-3.5 text-emerald-600" />
                Auto-Filler & Runner
              </TabsTrigger>
            </TabsList>

            {/* TAB 1: Config & Preferences */}
            <TabsContent value="config" className="space-y-5 mt-0">
              {/* Target ATS Platform Selector */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-neutral-800 dark:text-neutral-200">
                    Target ATS / Career Portal:
                  </label>
                  <span className="text-[11px] text-muted-foreground">Auto-adapts field schemas</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                  {(
                    [
                      { id: "universal", label: "Universal ATS" },
                      { id: "greenhouse", label: "Greenhouse" },
                      { id: "lever", label: "Lever" },
                      { id: "workday", label: "Workday" },
                      { id: "ashby", label: "Ashby" },
                    ] as const
                  ).map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => {
                        setPlatform(p.id);
                        savePreferences({ platform: p.id });
                      }}
                      className={`py-2 px-3 text-xs font-bold rounded-xl border transition-all ${
                        platform === p.id
                          ? "bg-[#102b2b] text-[#d8f36b] border-[#102b2b] shadow-sm ring-2 ring-[#d8f36b]/40"
                          : "bg-white dark:bg-slate-900 text-neutral-700 dark:text-neutral-300 border-neutral-200 dark:border-neutral-800 hover:bg-neutral-50"
                      }`}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Candidate Preferences Inputs */}
              <div className="p-4 bg-neutral-50 dark:bg-slate-900/60 rounded-2xl border border-neutral-200 dark:border-neutral-800 space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-neutral-200 dark:border-neutral-800">
                  <span className="text-xs font-bold text-neutral-800 dark:text-neutral-200 flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    Candidate Form-Fill Preferences (Auto-Saved)
                  </span>
                  <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Synced to LocalStorage
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div>
                    <label className="font-semibold text-neutral-700 dark:text-neutral-300 block mb-1">
                      Work Authorization
                    </label>
                    <Select
                      value={workAuth}
                      onValueChange={(val: any) => {
                        setWorkAuth(val);
                        savePreferences({ workAuth: val });
                      }}
                    >
                      <SelectTrigger className="h-9 text-xs bg-white dark:bg-slate-950 rounded-xl border-neutral-300 dark:border-neutral-700">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl">
                        <SelectItem value="citizen">US Citizen</SelectItem>
                        <SelectItem value="permanent_resident">Permanent Resident (GC)</SelectItem>
                        <SelectItem value="work_visa">Valid Work Visa (H-1B / TN / OPT)</SelectItem>
                        <SelectItem value="sponsorship_required">Requires Sponsorship</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="font-semibold text-neutral-700 dark:text-neutral-300 block mb-1">
                      Notice Period
                    </label>
                    <Select
                      value={String(noticeWeeks)}
                      onValueChange={(val) => {
                        const num = Number(val);
                        setNoticeWeeks(num);
                        savePreferences({ noticeWeeks: num });
                      }}
                    >
                      <SelectTrigger className="h-9 text-xs bg-white dark:bg-slate-950 rounded-xl border-neutral-300 dark:border-neutral-700">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl">
                        <SelectItem value="0">Immediate Availability</SelectItem>
                        <SelectItem value="2">2 Weeks Notice</SelectItem>
                        <SelectItem value="4">4 Weeks / 1 Month</SelectItem>
                        <SelectItem value="8">8 Weeks / 2 Months</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="font-semibold text-neutral-700 dark:text-neutral-300 block mb-1">
                      Desired Compensation
                    </label>
                    <Input
                      value={desiredSalary}
                      onChange={(e) => {
                        setDesiredSalary(e.target.value);
                        savePreferences({ desiredSalary: e.target.value });
                      }}
                      placeholder="$150,000"
                      className="h-9 text-xs bg-white dark:bg-slate-950 rounded-xl border-neutral-300 dark:border-neutral-700"
                    />
                  </div>
                </div>
              </div>

              {/* Real-time Field Mapping Checklist */}
              <div className="space-y-2">
                <div className="text-xs font-bold text-neutral-700 dark:text-neutral-300">
                  Synthesized Dossier Fields:
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {readiness.checks.map((c, i) => (
                    <div
                      key={i}
                      className={`flex items-center gap-2 p-2.5 rounded-xl border text-xs font-medium ${
                        c.passed
                          ? "bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300"
                          : "bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300"
                      }`}
                    >
                      {c.passed ? (
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      ) : (
                        <div className="w-3.5 h-3.5 rounded-full border border-amber-500 shrink-0" />
                      )}
                      <span className="truncate">{c.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>

            {/* TAB 2: Live ATS JSON Payload */}
            <TabsContent value="json" className="space-y-4 mt-0">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-neutral-700 dark:text-neutral-300 flex items-center gap-1.5">
                  <FileCode2 className="w-4 h-4 text-neutral-500" />
                  Live Schema Payload ({platform}.json):
                </span>
                <span className="text-[11px] text-neutral-400 font-mono">
                  {Math.round((jsonString.length / 1024) * 10) / 10} KB • UTF-8
                </span>
              </div>

              <pre className="h-64 p-4 bg-neutral-900 text-neutral-100 text-xs font-mono overflow-auto rounded-xl border border-neutral-800 leading-relaxed select-all">
                {jsonString}
              </pre>

              <div className="flex items-center justify-end gap-2 pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDownload}
                  className="h-9 text-xs font-bold rounded-xl border-neutral-300 gap-1.5"
                >
                  <Download className="h-3.5 w-3.5" />
                  Download .json
                </Button>
                <Button
                  size="sm"
                  onClick={handleCopy}
                  className="h-9 text-xs font-bold rounded-xl bg-[#102b2b] hover:bg-[#102b2b]/90 text-white gap-1.5"
                >
                  {copied ? <Check className="h-3.5 w-3.5 text-[#d8f36b]" /> : <Copy className="h-3.5 w-3.5" />}
                  {copied ? "Copied!" : "Copy Payload"}
                </Button>
              </div>
            </TabsContent>

            {/* TAB 3: 1-Click Real-Time Auto-Filler & Dispatcher */}
            <TabsContent value="dispatcher" className="space-y-5 mt-0">
              {/* Bookmarklet Section */}
              <div className="p-4 bg-gradient-to-br from-indigo-50/70 to-purple-50/70 dark:from-indigo-950/30 dark:to-purple-950/30 rounded-2xl border border-indigo-200 dark:border-indigo-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Bookmark className="w-4 h-4 text-indigo-600" />
                    <span className="text-xs font-bold text-indigo-950 dark:text-indigo-200">
                      1-Click Browser Autofill Bookmarklet
                    </span>
                  </div>
                  <Badge variant="outline" className="text-[10px] border-indigo-300 text-indigo-700 dark:text-indigo-300">
                    No Extension Needed
                  </Badge>
                </div>
                <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
                  Drag the button below to your browser bookmarks bar. When on any Greenhouse, Lever, Workday, or Ashby job page, click it to instantly autofill your contact details, resume links, and work authorization!
                </p>

                <div className="flex flex-wrap items-center gap-3 pt-1">
                  <a
                    href={bookmarkletCode}
                    onClick={(e) => {
                      if (!bookmarkletCode) e.preventDefault();
                    }}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-md cursor-grab active:cursor-grabbing transition-all"
                    title="Drag this button to your Bookmarks Toolbar"
                  >
                    <Bookmark className="w-3.5 h-3.5" />
                    ⚡ Drag to Bookmarks: "ResumeForge Autofill"
                  </a>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleCopyScript}
                    className="h-8 text-xs font-bold rounded-xl border-indigo-200 text-indigo-700 dark:text-indigo-300 gap-1.5 hover:bg-indigo-50"
                  >
                    {copiedScript ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    {copiedScript ? "Copied Script!" : "Copy JS Script"}
                  </Button>
                </div>
              </div>

              {/* Live Dispatch Simulation Runner */}
              <div className="p-4 bg-neutral-50 dark:bg-slate-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Terminal className="w-4 h-4 text-neutral-600 dark:text-neutral-400" />
                    <span className="text-xs font-bold text-neutral-800 dark:text-neutral-200">
                      Live Multi-Step Dispatch Engine (Phase 54)
                    </span>
                  </div>
                  <Button
                    size="sm"
                    disabled={isDispatching}
                    onClick={handleRunDispatch}
                    className="h-8 text-xs font-bold rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5"
                  >
                    {isDispatching ? <RotateCcw className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5" />}
                    {isDispatching ? "Executing Steps..." : "Run Dispatch Runner"}
                  </Button>
                </div>

                {/* Steps List */}
                {dispatchSteps.length > 0 && (
                  <div className="space-y-2 pt-1">
                    {dispatchSteps.map((step) => (
                      <div
                        key={step.stepIndex}
                        className={`flex items-center justify-between p-2.5 rounded-xl border text-xs transition-all ${
                          step.status === "completed"
                            ? "bg-emerald-50/60 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200"
                            : step.status === "executing"
                            ? "bg-blue-50 dark:bg-blue-950/30 border-blue-300 dark:border-blue-700 text-blue-900 dark:text-blue-200 animate-pulse"
                            : "bg-white dark:bg-slate-950 border-neutral-200 dark:border-neutral-800 text-neutral-500"
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span className="w-5 h-5 rounded-full flex items-center justify-center font-mono font-bold text-[10px] bg-neutral-200 dark:bg-neutral-800">
                            {step.stepIndex}
                          </span>
                          <span className="font-semibold">{step.name}</span>
                        </div>
                        <Badge
                          variant="outline"
                          className={`text-[10px] capitalize ${
                            step.status === "completed"
                              ? "border-emerald-400 text-emerald-700 dark:text-emerald-300"
                              : step.status === "executing"
                              ? "border-blue-400 text-blue-700 dark:text-blue-300"
                              : "border-neutral-300 text-neutral-400"
                          }`}
                        >
                          {step.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}

                {/* Live Console Output */}
                {dispatchLogs.length > 0 && (
                  <div className="p-3 bg-neutral-950 text-neutral-300 font-mono text-[11px] rounded-xl max-h-32 overflow-y-auto space-y-1">
                    {dispatchLogs.map((log, i) => (
                      <div key={i} className="leading-tight">{log}</div>
                    ))}
                    {dispatchResult && (
                      <div className="text-[#d8f36b] font-bold pt-1 border-t border-white/10">
                        ✓ VERIFIED: {dispatchResult.verificationId} ({dispatchResult.timestamp})
                      </div>
                    )}
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* Modal Footer Actions */}
        <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-4 border-t border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-slate-900/50 shrink-0">
          <div className="flex items-center gap-2 text-xs text-neutral-500">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Compatible with Simplify, Teal, & ResumeForge Live Autofill</span>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={isSavingTracker}
              onClick={handleSaveToTracker}
              className="h-9 text-xs font-bold rounded-xl border-neutral-300 dark:border-neutral-700 gap-1.5"
            >
              <Send className="h-3.5 w-3.5 text-blue-600" />
              {isSavingTracker ? "Saving..." : "Save to Job Tracker"}
            </Button>

            <Button
              size="sm"
              onClick={handleCopy}
              className="h-9 text-xs font-bold rounded-xl bg-[#102b2b] hover:bg-[#102b2b]/90 text-white gap-1.5"
            >
              {copied ? <Check className="h-3.5 w-3.5 text-[#d8f36b]" /> : <Copy className="h-3.5 w-3.5" />}
              {copied ? "Copied!" : "Copy Formatted Payload"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
