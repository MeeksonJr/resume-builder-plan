"use client";

import * as React from "react";
import { 
  Building2, 
  Users, 
  Clock, 
  FileCheck, 
  ExternalLink, 
  Sparkles, 
  CheckCircle2, 
  Video,
  ArrowRight
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

export interface CareerFairBooth {
  id: string;
  employer: string;
  industry: string;
  queueCount: number;
  estimatedWaitMinutes: number;
  openRoles: string[];
  recruiterName: string;
  livePresentationActive: boolean;
  sponsorsOptH1B: boolean;
}

interface VirtualCareerFairProps {
  campusName: string;
  booths?: CareerFairBooth[];
  onDropResume?: (boothId: string) => void;
}

export function VirtualCareerFair({
  campusName,
  booths = [
    {
      id: "booth-1",
      employer: "Dominion Energy",
      industry: "Clean Energy & Grid Telemetry",
      queueCount: 3,
      estimatedWaitMinutes: 6,
      openRoles: ["Cloud Eng Intern", "Cybersecurity Analyst", "Electrical Eng"],
      recruiterName: "Elena Rostova",
      livePresentationActive: true,
      sponsorsOptH1B: true,
    },
    {
      id: "booth-2",
      employer: "Huntington Ingalls Industries (HII)",
      industry: "Defense, Naval Engineering & Software",
      queueCount: 7,
      estimatedWaitMinutes: 14,
      openRoles: ["Software Engineer 1", "Systems Modeler", "Data Analyst"],
      recruiterName: "Jason Miller",
      livePresentationActive: false,
      sponsorsOptH1B: false,
    },
    {
      id: "booth-3",
      employer: "Capital One",
      industry: "FinTech & Cloud Systems",
      queueCount: 5,
      estimatedWaitMinutes: 10,
      openRoles: ["Associate Software Engineer", "Product Manager", "Risk Analyst"],
      recruiterName: "Maya Lin",
      livePresentationActive: true,
      sponsorsOptH1B: true,
    },
  ],
  onDropResume,
}: VirtualCareerFairProps) {
  const [droppedBooths, setDroppedBooths] = React.useState<Set<string>>(new Set());

  const handleDrop = (booth: CareerFairBooth) => {
    setDroppedBooths((prev) => new Set(prev).add(booth.id));
    toast.success(`Verified resume packet submitted to ${booth.employer} recruiter booth!`);
    onDropResume?.(booth.id);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/80 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
              Live Campus Event
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-foreground mt-1">
            {campusName} Virtual Career Fair &bull; Employer Pavilions
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Connect directly with verified campus recruiters and drop your optimized resume.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-xs font-bold px-3 py-1 bg-muted/60">
            {booths.length} Employer Booths Live
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {booths.map((booth) => {
          const isDropped = droppedBooths.has(booth.id);

          return (
            <Card 
              key={booth.id} 
              className="rounded-2xl border border-border/80 bg-card hover:shadow-lg transition-all flex flex-col justify-between"
            >
              <CardHeader className="p-5 pb-3 space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <span className="text-[11px] font-mono text-muted-foreground font-bold uppercase tracking-wider">
                      {booth.industry}
                    </span>
                    <CardTitle className="text-lg font-bold text-foreground mt-0.5">
                      {booth.employer}
                    </CardTitle>
                  </div>
                  {booth.livePresentationActive && (
                    <Badge className="bg-red-500/15 text-red-600 dark:text-red-400 border-red-500/30 text-[10px] font-bold flex items-center gap-1">
                      <Video className="h-3 w-3" />
                      Live Stream
                    </Badge>
                  )}
                </div>

                <div className="flex items-center gap-3 text-xs text-muted-foreground py-1 border-y border-border/50">
                  <div className="flex items-center gap-1">
                    <Users className="h-3.5 w-3.5 text-primary" />
                    <span>{booth.queueCount} in queue</span>
                  </div>
                  <span>&bull;</span>
                  <div className="flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5 text-primary" />
                    <span>~{booth.estimatedWaitMinutes}m wait</span>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="p-5 pt-0 space-y-4">
                <div>
                  <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider block mb-1.5">
                    Actively Recruiting Roles
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {booth.openRoles.map((role) => (
                      <span 
                        key={role} 
                        className="text-[11px] font-medium bg-muted/80 text-foreground px-2 py-0.5 rounded-md"
                      >
                        {role}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="pt-2 flex items-center gap-2">
                  <Button
                    onClick={() => handleDrop(booth)}
                    disabled={isDropped}
                    className={`flex-1 h-9 text-xs font-bold rounded-xl gap-1.5 cursor-pointer shadow-xs ${
                      isDropped 
                        ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30"
                        : "bg-[#102b2b] text-[#d8f36b] hover:bg-[#164743]"
                    }`}
                  >
                    {isDropped ? (
                      <>
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        <span>Resume Submitted</span>
                      </>
                    ) : (
                      <>
                        <FileCheck className="h-3.5 w-3.5" />
                        <span>Drop My Resume</span>
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
