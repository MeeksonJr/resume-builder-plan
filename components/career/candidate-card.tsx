"use client";

import * as React from "react";
import { GraduationCap, ShieldCheck, Mail, ArrowRight, ExternalLink, Award } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export interface CollegiateCandidate {
  id: string;
  headline: string;
  universityName: string;
  major: string;
  gradYear: number;
  topSkills: string[];
  atsScore: number;
  availability: "Immediately" | "Summer 2026" | "Fall 2026";
  targetRoles: string[];
}

interface CandidateCardProps {
  candidate: CollegiateCandidate;
  onContact?: (candidateId: string) => void;
}

export function CandidateCard({ candidate, onContact }: CandidateCardProps) {
  return (
    <Card className="rounded-2xl border border-border/80 bg-card p-5 space-y-4 hover:shadow-lg transition-all flex flex-col justify-between">
      <div className="space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-1.5">
              <Badge className="bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30 text-[10px] font-bold flex items-center gap-1">
                <ShieldCheck className="h-3 w-3 text-emerald-500" />
                Verified Student
              </Badge>
              <Badge variant="outline" className="text-[10px] font-mono">
                {candidate.availability}
              </Badge>
            </div>
            <CardTitle className="text-base font-bold text-foreground mt-2 leading-snug">
              {candidate.headline}
            </CardTitle>
          </div>

          <div className="text-right">
            <span className="text-[10px] uppercase font-bold text-muted-foreground block">ATS Score</span>
            <span className="text-base font-mono font-black text-primary">{candidate.atsScore}/100</span>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <GraduationCap className="h-3.5 w-3.5 text-primary" />
          <span>{candidate.universityName} &bull; {candidate.major} &apos;{candidate.gradYear.toString().slice(-2)}</span>
        </div>

        <div>
          <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider block mb-1">
            Core Verified Stack
          </span>
          <div className="flex flex-wrap gap-1">
            {candidate.topSkills.map((s) => (
              <span key={s} className="text-[11px] font-mono bg-muted text-foreground px-2 py-0.5 rounded-md">
                {s}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="pt-3 border-t border-border/60 flex items-center justify-between gap-2">
        <span className="text-[11px] text-muted-foreground truncate">
          Targets: {candidate.targetRoles.slice(0, 2).join(", ")}
        </span>
        <Button
          size="sm"
          onClick={() => onContact?.(candidate.id)}
          className="h-8 text-xs font-bold bg-[#102b2b] text-[#d8f36b] hover:bg-[#164743] rounded-xl gap-1.5 shadow-xs cursor-pointer shrink-0"
        >
          <Mail className="h-3 w-3" />
          <span>Invite to Interview</span>
        </Button>
      </div>
    </Card>
  );
}
