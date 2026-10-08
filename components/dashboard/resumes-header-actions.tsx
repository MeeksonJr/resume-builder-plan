"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Sparkles, Lock, ArrowRight } from "lucide-react";
import Link from "next/link";
import { ImportResumeButton } from "@/components/dashboard/import-resume-button";
import { UpgradeModal } from "@/components/ui/upgrade-modal";

interface ResumesHeaderActionsProps {
  canCreate: boolean;
  isPro: boolean;
  totalCount: number;
}

export function ResumesHeaderActions({
  canCreate,
  isPro,
  totalCount,
}: ResumesHeaderActionsProps) {
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  return (
    <>
      <div className="flex items-center gap-3 shrink-0 flex-wrap">
        <ImportResumeButton
          canImport={canCreate}
          onLimitReached={() => setShowUpgradeModal(true)}
        />

        {canCreate ? (
          <Button
            asChild
            className="min-h-11 rounded-xl bg-primary px-5 font-bold text-primary-foreground shadow-sm hover:opacity-90 transition-all"
          >
            <Link href="/dashboard/resume/new">
              <Plus className="mr-2 h-4 w-4" />
              Create New Resume
            </Link>
          </Button>
        ) : (
          <Button
            onClick={() => setShowUpgradeModal(true)}
            className="min-h-11 rounded-xl bg-primary px-5 font-bold text-primary-foreground shadow-sm hover:opacity-90 transition-all flex items-center gap-2"
          >
            <Lock className="h-4 w-4" />
            <span>Create New Resume</span>
            <span className="text-[10px] bg-background text-foreground px-1.5 py-0.5 rounded font-black uppercase tracking-wider ml-1">
              Pro
            </span>
          </Button>
        )}
      </div>

      <UpgradeModal
        open={showUpgradeModal}
        onOpenChange={setShowUpgradeModal}
        title="Resume Limit Reached"
        description="Free plans include 1 master resume. Upgrade to ResumeForge Pro for unlimited tailored resumes, automatic ATS targeting, and recruiter microsites."
        featureName="Unlimited Resumes"
      />
    </>
  );
}

export function ResumesPlanBanner({
  isPro,
  totalCount,
}: {
  isPro: boolean;
  totalCount: number;
}) {
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  if (isPro) return null;

  return (
    <>
      <div className="rounded-2xl border border-border bg-card p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
            <Lock className="w-4 h-4 text-primary" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-black uppercase tracking-wider text-foreground">
                Free Plan Quota
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-muted text-muted-foreground border border-border">
                {totalCount} / 1 Resume Used
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              Upgrade to Pro for unlimited resumes, deep job tailoring, and AI generation.
            </p>
          </div>
        </div>

        <Button
          onClick={() => setShowUpgradeModal(true)}
          size="sm"
          className="rounded-xl bg-primary text-primary-foreground font-bold text-xs shrink-0 flex items-center gap-1.5 shadow-sm"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Unlock Unlimited</span>
          <ArrowRight className="w-3 h-3" />
        </Button>
      </div>

      <UpgradeModal
        open={showUpgradeModal}
        onOpenChange={setShowUpgradeModal}
        title="Unlock Unlimited Resumes"
        description="Free accounts are limited to 1 resume. Upgrade to Pro for unlimited resumes, cover letters, and dedicated job microsites."
        featureName="Unlimited Resumes"
      />
    </>
  );
}
