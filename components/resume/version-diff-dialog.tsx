"use client";

import React, { useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  GitCompare,
  TrendingUp,
  PlusCircle,
  MinusCircle,
  CheckCircle2,
  Clock,
  RotateCcw,
  Sparkles,
  ArrowRight,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { getVersionDiff, ResumeSnapshot } from "@/lib/version-diff";

interface VersionWithMetrics {
  id: string;
  version_number: number;
  title: string;
  change_summary?: string;
  created_at: string;
  snapshot_data?: ResumeSnapshot;
  version_metrics?: {
    applications_sent: number;
    interviews_received: number;
    offers_received: number;
  }[];
}

interface VersionDiffDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  versionA: VersionWithMetrics | null; // e.g. current or older
  versionB: VersionWithMetrics | null; // e.g. compared version
  onRestore?: (versionId: string, versionNumber: number) => void;
}

export function VersionDiffDialog({
  open,
  onOpenChange,
  versionA,
  versionB,
  onRestore,
}: VersionDiffDialogProps) {
  if (!versionA || !versionB) return null;

  // Compute metrics
  const metricsA = versionA.version_metrics?.[0] || {
    applications_sent: 0,
    interviews_received: 0,
    offers_received: 0,
  };
  const metricsB = versionB.version_metrics?.[0] || {
    applications_sent: 0,
    interviews_received: 0,
    offers_received: 0,
  };

  const rateA =
    metricsA.applications_sent > 0
      ? Math.round((metricsA.interviews_received / metricsA.applications_sent) * 100)
      : 0;
  const rateB =
    metricsB.applications_sent > 0
      ? Math.round((metricsB.interviews_received / metricsB.applications_sent) * 100)
      : 0;

  const rateDelta = rateB - rateA;

  // Compute structured diffs between snapshot data
  const snapA: ResumeSnapshot = versionA.snapshot_data || {
    personalInfo: {},
    workExperiences: [],
    education: [],
    skills: [],
    projects: [],
    certifications: [],
    languages: [],
  };

  const snapB: ResumeSnapshot = versionB.snapshot_data || {
    personalInfo: {},
    workExperiences: [],
    education: [],
    skills: [],
    projects: [],
    certifications: [],
    languages: [],
  };

  const diffs = useMemo(() => getVersionDiff(snapA, snapB), [snapA, snapB]);

  // Skill comparison
  const skillsA = new Set(
    (snapA.skills || []).map((s: any) => (s.name || "").trim()).filter(Boolean)
  );
  const skillsB = new Set(
    (snapB.skills || []).map((s: any) => (s.name || "").trim()).filter(Boolean)
  );

  const addedSkills: string[] = [];
  const removedSkills: string[] = [];
  const commonSkills: string[] = [];

  skillsB.forEach((s) => {
    if (!skillsA.has(s)) addedSkills.push(s);
    else commonSkills.push(s);
  });

  skillsA.forEach((s) => {
    if (!skillsB.has(s)) removedSkills.push(s);
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[85vh] overflow-y-auto p-6 md:p-8 rounded-2xl">
        <DialogHeader className="space-y-2 border-b pb-4">
          <div className="flex items-center gap-2">
            <GitCompare className="h-6 w-6 text-primary" />
            <DialogTitle className="text-2xl font-black tracking-tight">
              Resume A/B Version Comparison
            </DialogTitle>
          </div>
          <DialogDescription>
            Inspect performance delta and content differences between Version{" "}
            {versionA.version_number} and Version {versionB.version_number}.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 pt-4">
          {/* Header Metadata Comparison */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="border-primary/20 bg-muted/30">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <Badge variant="outline" className="font-bold">
                    Base: Version {versionA.version_number}
                  </Badge>
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {formatDistanceToNow(new Date(versionA.created_at), { addSuffix: true })}
                  </span>
                </div>
                <CardTitle className="text-base font-bold mt-1">
                  {versionA.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="text-xs text-muted-foreground">
                {versionA.change_summary || "Baseline snapshot"}
              </CardContent>
            </Card>

            <Card className="border-primary bg-primary/5">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <Badge className="font-bold bg-primary text-primary-foreground">
                    Variant: Version {versionB.version_number}
                  </Badge>
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {formatDistanceToNow(new Date(versionB.created_at), { addSuffix: true })}
                  </span>
                </div>
                <CardTitle className="text-base font-bold mt-1">
                  {versionB.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="text-xs text-muted-foreground flex items-center justify-between">
                <span>{versionB.change_summary || "Variant snapshot"}</span>
                {onRestore && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-8 gap-1 text-xs"
                    onClick={() => {
                      onRestore(versionB.id, versionB.version_number);
                      onOpenChange(false);
                    }}
                  >
                    <RotateCcw className="h-3.5 w-3.5" />
                    Restore V{versionB.version_number}
                  </Button>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Performance Telemetry A/B Metric Cards */}
          {(metricsA.applications_sent > 0 || metricsB.applications_sent > 0) && (
            <Card className="border-border/60">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-primary" />
                  <CardTitle className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
                    Conversion Performance Comparison
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
                  <div className="p-3 bg-muted/40 rounded-xl space-y-1">
                    <p className="text-[11px] font-bold text-muted-foreground">APPLICATIONS</p>
                    <div className="flex items-center justify-center gap-2">
                      <span className="text-lg font-bold">{metricsA.applications_sent}</span>
                      <ArrowRight className="h-3 w-3 text-muted-foreground" />
                      <span className="text-lg font-black text-primary">
                        {metricsB.applications_sent}
                      </span>
                    </div>
                  </div>

                  <div className="p-3 bg-muted/40 rounded-xl space-y-1">
                    <p className="text-[11px] font-bold text-muted-foreground">INTERVIEWS</p>
                    <div className="flex items-center justify-center gap-2">
                      <span className="text-lg font-bold">{metricsA.interviews_received}</span>
                      <ArrowRight className="h-3 w-3 text-muted-foreground" />
                      <span className="text-lg font-black text-blue-600">
                        {metricsB.interviews_received}
                      </span>
                    </div>
                  </div>

                  <div className="p-3 bg-muted/40 rounded-xl space-y-1">
                    <p className="text-[11px] font-bold text-muted-foreground">OFFERS</p>
                    <div className="flex items-center justify-center gap-2">
                      <span className="text-lg font-bold">{metricsA.offers_received}</span>
                      <ArrowRight className="h-3 w-3 text-muted-foreground" />
                      <span className="text-lg font-black text-green-600">
                        {metricsB.offers_received}
                      </span>
                    </div>
                  </div>

                  <div className="p-3 bg-muted/40 rounded-xl space-y-1">
                    <p className="text-[11px] font-bold text-muted-foreground">SUCCESS RATE</p>
                    <div className="flex items-center justify-center gap-2">
                      <span className="text-lg font-bold">{rateA}%</span>
                      <ArrowRight className="h-3 w-3 text-muted-foreground" />
                      <span
                        className={`text-lg font-black ${
                          rateDelta >= 0 ? "text-green-600" : "text-amber-600"
                        }`}
                      >
                        {rateB}%
                      </span>
                    </div>
                    {rateDelta !== 0 && (
                      <p
                        className={`text-[10px] font-black ${
                          rateDelta > 0 ? "text-green-600" : "text-amber-600"
                        }`}
                      >
                        {rateDelta > 0 ? `+${rateDelta}% increase` : `${rateDelta}% drop`}
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Section: Skills Diff */}
          <Card className="border-border/60">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-primary" />
                <CardTitle className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
                  Skills Variation Diff
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {addedSkills.length === 0 &&
              removedSkills.length === 0 &&
              commonSkills.length === 0 ? (
                <p className="text-xs text-muted-foreground">No skill entries found in these snapshots.</p>
              ) : (
                <div className="space-y-3">
                  {addedSkills.length > 0 && (
                    <div className="space-y-1">
                      <p className="text-xs font-bold text-green-600 flex items-center gap-1.5">
                        <PlusCircle className="h-3.5 w-3.5" /> Added in V{versionB.version_number} (
                        {addedSkills.length})
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {addedSkills.map((s) => (
                          <Badge
                            key={s}
                            variant="secondary"
                            className="bg-green-500/10 text-green-700 dark:text-green-400 border border-green-500/20 font-semibold"
                          >
                            + {s}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {removedSkills.length > 0 && (
                    <div className="space-y-1">
                      <p className="text-xs font-bold text-destructive flex items-center gap-1.5">
                        <MinusCircle className="h-3.5 w-3.5" /> Removed from V{versionA.version_number} (
                        {removedSkills.length})
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {removedSkills.map((s) => (
                          <Badge
                            key={s}
                            variant="secondary"
                            className="bg-destructive/10 text-destructive border border-destructive/20 line-through font-semibold"
                          >
                            - {s}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {commonSkills.length > 0 && (
                    <div className="space-y-1 pt-1">
                      <p className="text-xs font-bold text-muted-foreground flex items-center gap-1.5">
                        <CheckCircle2 className="h-3.5 w-3.5" /> Retained Skills ({commonSkills.length})
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {commonSkills.map((s) => (
                          <Badge key={s} variant="outline" className="text-xs font-normal">
                            {s}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Section: Structured Changes List */}
          <Card className="border-border/60">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
                Section-Level Structural Updates
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {diffs.length === 0 ? (
                <p className="text-xs text-muted-foreground">
                  No structural differences detected between these two version snapshots.
                </p>
              ) : (
                diffs.map((diff, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-xl border bg-muted/20 space-y-2 text-xs"
                  >
                    <p className="font-bold text-primary flex items-center gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                      {diff.section}
                    </p>
                    <div className="space-y-1 pl-3.5 border-l-2 border-primary/20">
                      {diff.changes.map((c, cIdx) => (
                        <div key={cIdx} className="text-muted-foreground flex flex-wrap gap-1.5">
                          <span
                            className={`font-semibold uppercase tracking-wider text-[10px] px-1 rounded ${
                              c.type === "added"
                                ? "bg-green-500/20 text-green-700 dark:text-green-300"
                                : c.type === "removed"
                                ? "bg-red-500/20 text-red-700 dark:text-red-300"
                                : "bg-blue-500/20 text-blue-700 dark:text-blue-300"
                            }`}
                          >
                            {c.type}
                          </span>
                          <span className="font-bold text-foreground">{c.field}:</span>
                          {c.oldValue && (
                            <span className="line-through text-muted-foreground/70">
                              {typeof c.oldValue === "string" && c.oldValue.length > 80
                                ? `${c.oldValue.slice(0, 80)}...`
                                : c.oldValue}
                            </span>
                          )}
                          {c.oldValue && c.newValue && <span>→</span>}
                          {c.newValue && (
                            <span className="font-medium text-foreground">
                              {typeof c.newValue === "string" && c.newValue.length > 80
                                ? `${c.newValue.slice(0, 80)}...`
                                : c.newValue}
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}
