"use client";

import React, { useState } from "react";
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
  Zap,
  CheckCircle2,
  Clock,
  Loader2,
  FileText,
  Building2,
  ExternalLink,
  ShieldCheck,
  Copy,
  Check,
  Globe,
} from "lucide-react";
import {
  detectJobPortal,
  generateDispatchSteps,
  generateAutofillBookmarklet,
  executeApplicationDispatch,
  CandidateProfile,
  DispatchStep,
  JobPortalType,
} from "@/lib/jobs/auto-apply-dispatcher";
import { toast } from "sonner";

interface AutoApplyDispatcherDialogProps {
  application: {
    id: string;
    company: string;
    role: string;
    url?: string;
    location?: string;
    resume?: { title: string };
  };
  onUpdateStatus?: (id: string, status: string) => void;
  triggerClassName?: string;
}

const DEFAULT_CANDIDATE: CandidateProfile = {
  fullName: "Alex Morgan",
  email: "alex.morgan@example.com",
  phone: "+1 (555) 019-2831",
  location: "San Francisco, CA",
  linkedinUrl: "https://linkedin.com/in/alex-morgan",
  portfolioUrl: "https://alexmorgan.dev",
  yearsOfExperience: 6,
  workAuthorization: "us_citizen",
  salaryExpectation: "$165,000",
};

const PORTAL_NAMES: Record<JobPortalType, string> = {
  linkedin: "LinkedIn Easy Apply",
  indeed: "Indeed Apply",
  greenhouse: "Greenhouse ATS",
  lever: "Lever Applications",
  workday: "Workday Portal",
  ashby: "Ashby ATS",
  generic: "Standard Job Portal",
};

export function AutoApplyDispatcherDialog({
  application,
  onUpdateStatus,
  triggerClassName = "",
}: AutoApplyDispatcherDialogProps) {
  const [open, setOpen] = useState(false);
  const [isExecuting, setIsExecuting] = useState(false);
  const [completedVerificationId, setCompletedVerificationId] = useState<string | null>(null);
  const [copiedBookmarklet, setCopiedBookmarklet] = useState(false);

  const portal = detectJobPortal(application.url);
  const [steps, setSteps] = useState<DispatchStep[]>(() =>
    generateDispatchSteps(portal, DEFAULT_CANDIDATE, application.resume?.title)
  );

  const handleRunDispatch = async () => {
    setIsExecuting(true);
    setCompletedVerificationId(null);

    try {
      const result = await executeApplicationDispatch(
        application.id,
        portal,
        DEFAULT_CANDIDATE,
        (currentStep) => {
          setSteps((prev) =>
            prev.map((s) => (s.stepIndex === currentStep.stepIndex ? currentStep : s))
          );
        }
      );

      setCompletedVerificationId(result.verificationId);
      toast.success(`Dispatched via ${PORTAL_NAMES[portal]}! ID: ${result.verificationId}`);
      if (onUpdateStatus) {
        onUpdateStatus(application.id, "Applied");
      }
    } catch {
      toast.error("Dispatch encountered a validation error");
    } finally {
      setIsExecuting(false);
    }
  };

  const handleCopyBookmarklet = async () => {
    const bookmarklet = generateAutofillBookmarklet(DEFAULT_CANDIDATE);
    try {
      await navigator.clipboard.writeText(bookmarklet);
      setCopiedBookmarklet(true);
      toast.success("1-Click Autofill bookmarklet script copied!");
      setTimeout(() => setCopiedBookmarklet(false), 2000);
    } catch {
      toast.error("Failed to copy bookmarklet");
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className={`h-7 px-2 text-[10px] font-bold uppercase tracking-wider gap-1 border-primary/20 bg-primary/10 text-primary hover:bg-primary/20 rounded-md ${triggerClassName}`}
          title="Auto-Apply Application Dispatcher"
        >
          <Zap className="h-3 w-3" />
          <span>Auto-Apply</span>
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-md bg-[#fdfcf9] border-[#102b2b]/15 text-[#102b2b]">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600">
              <Zap className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle className="text-base font-bold text-[#102b2b] flex items-center gap-2">
                <span>Application Dispatcher</span>
                <span className="text-[10px] font-bold bg-[#102b2b] text-white px-2 py-0.5 rounded">
                  {PORTAL_NAMES[portal]}
                </span>
              </DialogTitle>
              <DialogDescription className="text-xs text-[#52716a]">
                Multi-step autonomous form fill & document submission
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          {/* Target Job Header Card */}
          <div className="bg-[#f8f4ec] p-3 rounded-lg border border-[#102b2b]/10 flex items-center justify-between text-xs">
            <div className="space-y-0.5 min-w-0">
              <span className="text-[10px] font-bold text-[#52716a] uppercase tracking-wider">
                Target Role
              </span>
              <h5 className="font-bold text-[#102b2b] truncate">{application.role}</h5>
              <p className="text-[11px] text-[#52716a]">{application.company}</p>
            </div>
            {application.url && (
              <a
                href={application.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-[11px] text-[#0d8274] font-semibold hover:underline"
              >
                <span>Job Link</span>
                <ExternalLink className="h-3 w-3" />
              </a>
            )}
          </div>

          {/* 5-Step Pipeline Progress Indicator */}
          <div className="space-y-2">
            <span className="text-xs font-bold text-[#102b2b] block">
              Automated Dispatch Pipeline
            </span>
            <div className="space-y-1.5 rounded-lg border border-[#102b2b]/10 bg-white p-2.5">
              {steps.map((step) => (
                <div
                  key={step.stepIndex}
                  className="flex items-start gap-2.5 text-xs p-1.5 rounded transition-colors"
                >
                  <div className="mt-0.5 shrink-0">
                    {step.status === "completed" ? (
                      <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                    ) : step.status === "executing" ? (
                      <Loader2 className="h-4 w-4 text-amber-500 animate-spin" />
                    ) : (
                      <Clock className="h-4 w-4 text-neutral-300" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <span
                      className={`font-semibold block ${
                        step.status === "completed"
                          ? "text-emerald-900"
                          : step.status === "executing"
                          ? "text-amber-800"
                          : "text-neutral-500"
                      }`}
                    >
                      {step.stepIndex}. {step.name}
                    </span>
                    <span className="text-[11px] text-[#52716a] truncate block">
                      {step.description}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Completed Verification ID Pill */}
          {completedVerificationId && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-xs space-y-1 text-emerald-800">
              <span className="font-bold flex items-center gap-1.5">
                <ShieldCheck className="h-4 w-4 text-emerald-600" />
                Dispatch Certified & Logged
              </span>
              <p className="font-mono text-[11px] text-emerald-700">
                Verification Token: {completedVerificationId}
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-between pt-2 border-t border-[#102b2b]/10 gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleCopyBookmarklet}
              className="text-xs gap-1.5 h-8 border-neutral-300"
              title="Copy javascript autofill snippet to paste into recruiter page"
            >
              {copiedBookmarklet ? (
                <Check className="h-3.5 w-3.5 text-emerald-600" />
              ) : (
                <Copy className="h-3.5 w-3.5" />
              )}
              <span className="hidden sm:inline">Autofill Script</span>
            </Button>

            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setOpen(false)}
                className="text-xs h-8"
              >
                Close
              </Button>
              <Button
                type="button"
                size="sm"
                onClick={handleRunDispatch}
                disabled={isExecuting}
                className="gap-1.5 bg-[#102b2b] hover:bg-[#0d8274] text-white font-bold text-xs h-8"
              >
                {isExecuting ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Zap className="h-3.5 w-3.5 text-[#d8f36b]" />
                )}
                <span>{isExecuting ? "Dispatching..." : "Execute Auto-Apply"}</span>
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
