"use client";

import * as React from "react";
import { 
  Building2, 
  Calendar, 
  DollarSign, 
  ArrowRight, 
  ArrowLeft, 
  CheckCircle2, 
  Clock, 
  ExternalLink,
  Plus
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export type ApplicationStage = "Saved" | "Applied" | "Screening" | "Interview" | "Offer" | "Archived";

export interface KanbanApplicationItem {
  id: string;
  company: string;
  role: string;
  stage: ApplicationStage;
  location: string;
  salary?: string;
  appliedDate: string;
  nextStepDeadline?: string;
  campusAffinity?: string;
}

const STAGES: ApplicationStage[] = ["Saved", "Applied", "Screening", "Interview", "Offer"];

interface ApplicationKanbanProps {
  initialApplications?: KanbanApplicationItem[];
  onStageChange?: (id: string, newStage: ApplicationStage) => void;
}

export function ApplicationKanban({
  initialApplications = [
    {
      id: "app-1",
      company: "Dominion Energy",
      role: "Cloud Infrastructure Intern",
      stage: "Interview",
      location: "Richmond, VA",
      salary: "$82,000/yr",
      appliedDate: "3 days ago",
      nextStepDeadline: "Technical Panel: Thursday 2:00 PM",
      campusAffinity: "ODU Campus Fair",
    },
    {
      id: "app-2",
      company: "Huntington Ingalls Industries",
      role: "Junior Software Developer",
      stage: "Screening",
      location: "Newport News, VA",
      salary: "$88,000/yr",
      appliedDate: "1 week ago",
      nextStepDeadline: "Recruiter Phone Screen: Tomorrow",
      campusAffinity: "Collegiate Pipeline",
    },
    {
      id: "app-3",
      company: "Capital One",
      role: "Associate Software Engineer",
      stage: "Applied",
      location: "McLean, VA",
      salary: "$105,000/yr",
      appliedDate: "Yesterday",
      campusAffinity: "Direct Dispatch",
    },
    {
      id: "app-4",
      company: "Amazon AWS",
      role: "Solutions Architect Graduate",
      stage: "Offer",
      location: "Arlington, VA",
      salary: "$124,000/yr",
      appliedDate: "2 weeks ago",
      nextStepDeadline: "Offer Acceptance Deadline: Oct 24",
      campusAffinity: "Alumni Referral",
    },
  ],
  onStageChange,
}: ApplicationKanbanProps) {
  const [applications, setApplications] = React.useState<KanbanApplicationItem[]>(initialApplications);

  const moveStage = (id: string, direction: -1 | 1) => {
    setApplications((prev) =>
      prev.map((app) => {
        if (app.id !== id) return app;
        const currentIdx = STAGES.indexOf(app.stage);
        const nextIdx = currentIdx + direction;
        if (nextIdx < 0 || nextIdx >= STAGES.length) return app;
        const newStage = STAGES[nextIdx];
        toast.info(`Moved ${app.company} to ${newStage}`);
        onStageChange?.(id, newStage);
        return { ...app, stage: newStage };
      })
    );
  };

  return (
    <div className="space-y-4">
      {/* ── Desktop & Mobile Responsive Grid ──────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 overflow-x-auto pb-4">
        {STAGES.map((stage) => {
          const items = applications.filter((a) => a.stage === stage);

          return (
            <div 
              key={stage} 
              className="bg-card/70 rounded-2xl border border-border/80 p-3 sm:p-4 flex flex-col min-w-[260px] md:min-w-0 shadow-2xs"
            >
              <div className="flex items-center justify-between pb-3 border-b border-border/60 mb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-foreground">
                  {stage}
                </span>
                <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                  {items.length}
                </span>
              </div>

              <div className="space-y-3 flex-1">
                {items.map((app) => (
                  <div
                    key={app.id}
                    className="p-3 bg-card rounded-xl border border-border shadow-xs space-y-2.5 transition hover:border-primary/50"
                  >
                    <div>
                      <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                        {app.company}
                      </span>
                      <h4 className="text-xs font-bold text-foreground mt-0.5 leading-snug">
                        {app.role}
                      </h4>
                    </div>

                    <div className="space-y-1 text-[11px] text-muted-foreground">
                      <p>{app.location} {app.salary && `&bull; ${app.salary}`}</p>
                      {app.campusAffinity && (
                        <Badge variant="outline" className="text-[9px] font-mono border-primary/20 bg-primary/5 text-primary">
                          {app.campusAffinity}
                        </Badge>
                      )}
                      {app.nextStepDeadline && (
                        <p className="text-primary font-bold text-[10px] mt-1">
                          &bull; {app.nextStepDeadline}
                        </p>
                      )}
                    </div>

                    {/* Move Controls */}
                    <div className="flex items-center justify-between pt-2 border-t border-border/50 text-xs">
                      <Button
                        size="icon"
                        variant="ghost"
                        disabled={STAGES.indexOf(app.stage) === 0}
                        onClick={() => moveStage(app.id, -1)}
                        className="h-6 w-6 text-muted-foreground hover:text-foreground"
                      >
                        <ArrowLeft className="h-3 w-3" />
                      </Button>
                      <span className="text-[10px] font-mono text-muted-foreground">Move</span>
                      <Button
                        size="icon"
                        variant="ghost"
                        disabled={STAGES.indexOf(app.stage) === STAGES.length - 1}
                        onClick={() => moveStage(app.id, 1)}
                        className="h-6 w-6 text-muted-foreground hover:text-foreground"
                      >
                        <ArrowRight className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                ))}

                {items.length === 0 && (
                  <div className="py-6 text-center text-[11px] text-muted-foreground border border-dashed border-border/60 rounded-xl">
                    No applications
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
