"use client";

import * as React from "react";
import { 
  GitBranch, 
  CheckCircle2, 
  ArrowRight, 
  GraduationCap, 
  Award, 
  BookOpen, 
  FileText,
  Building2
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export interface TransferAgreement {
  targetUniversity: string;
  targetSlug: string;
  minGpa: number;
  eligibleAssociateDegrees: string[];
  guaranteedAdmission: boolean;
  applicationDeadline: string;
  transferCreditsMax: number;
  featuredMajors: string[];
}

interface TransferPathwayExplorerProps {
  originCollegeName?: string;
}

export function TransferPathwayExplorer({
  originCollegeName = "VCCS Community College",
}: TransferPathwayExplorerProps) {
  const [selectedTarget, setSelectedTarget] = React.useState<string>("all");

  const pathways: TransferAgreement[] = [
    {
      targetUniversity: "Old Dominion University",
      targetSlug: "old-dominion-university",
      minGpa: 2.5,
      eligibleAssociateDegrees: ["A.S. Computer Science", "A.S. Engineering", "A.S. Business Administration"],
      guaranteedAdmission: true,
      applicationDeadline: "March 15 (Fall) / October 15 (Spring)",
      transferCreditsMax: 60,
      featuredMajors: ["Cybersecurity", "Computer Science", "Mechanical Eng", "Nursing"],
    },
    {
      targetUniversity: "Virginia Tech",
      targetSlug: "virginia-tech",
      minGpa: 3.2,
      eligibleAssociateDegrees: ["A.S. Engineering (GAA)", "A.S. Science"],
      guaranteedAdmission: true,
      applicationDeadline: "March 1 (Fall)",
      transferCreditsMax: 60,
      featuredMajors: ["Computer Engineering", "Aerospace Eng", "Data Analytics"],
    },
    {
      targetUniversity: "University of Virginia",
      targetSlug: "university-of-virginia",
      minGpa: 3.4,
      eligibleAssociateDegrees: ["A.A. Liberal Arts", "A.S. Science (GAA)"],
      guaranteedAdmission: true,
      applicationDeadline: "March 1 (Fall)",
      transferCreditsMax: 60,
      featuredMajors: ["Economics", "Computer Science (BA/BS)", "Biomedical Sciences"],
    },
    {
      targetUniversity: "George Mason University",
      targetSlug: "george-mason-university",
      minGpa: 2.85,
      eligibleAssociateDegrees: ["ADVANCE Pathway", "A.S. Information Technology"],
      guaranteedAdmission: true,
      applicationDeadline: "Rolling Admissions",
      transferCreditsMax: 64,
      featuredMajors: ["Cloud Computing", "Software Engineering", "Cyber Analytics"],
    },
  ];

  const filtered = selectedTarget === "all" 
    ? pathways 
    : pathways.filter((p) => p.targetSlug === selectedTarget);

  return (
    <div className="space-y-6">
      <div className="border-b border-border/80 pb-4">
        <div className="flex items-center gap-2 text-xs font-bold text-primary bg-primary/10 px-3 py-1 rounded-full w-fit mb-2">
          <GitBranch className="h-3.5 w-3.5" />
          <span>Virginia Guaranteed Admissions Agreement (GAA)</span>
        </div>
        <h2 className="text-xl sm:text-2xl font-black text-foreground">
          {originCollegeName} &bull; 4-Year University Transfer Pathways
        </h2>
        <p className="text-xs text-muted-foreground mt-1 max-w-2xl">
          Complete your Associate degree with a qualifying GPA and transition directly into top Virginia 
          research universities with 100% accepted credits and tailored junior-year career tracks.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {filtered.map((item) => (
          <Card key={item.targetSlug} className="rounded-2xl border border-border/80 bg-card p-5 space-y-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <Badge className="bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30 text-[10px] font-bold mb-2">
                  Guaranteed Transfer Agreement
                </Badge>
                <CardTitle className="text-base sm:text-lg font-bold text-foreground">
                  {item.targetUniversity}
                </CardTitle>
              </div>
              <div className="text-right">
                <span className="text-[10px] uppercase font-bold text-muted-foreground block">Min GPA</span>
                <span className="text-lg font-mono font-black text-primary">{item.minGpa.toFixed(1)}+</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs py-2 bg-muted/40 rounded-xl px-3 border border-border/50">
              <div>
                <span className="text-[10px] uppercase font-bold text-muted-foreground block">Max Credits</span>
                <span className="font-bold text-foreground">{item.transferCreditsMax} Semester Hrs</span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-muted-foreground block">Priority Deadline</span>
                <span className="font-bold text-foreground truncate block">{item.applicationDeadline}</span>
              </div>
            </div>

            <div>
              <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider block mb-1">
                Approved Associate Degree Programs
              </span>
              <div className="flex flex-wrap gap-1.5">
                {item.eligibleAssociateDegrees.map((deg) => (
                  <span key={deg} className="text-[11px] font-medium bg-muted text-foreground px-2 py-0.5 rounded-md">
                    {deg}
                  </span>
                ))}
              </div>
            </div>

            <div className="pt-2 flex items-center justify-between border-t border-border/60">
              <span className="text-xs text-muted-foreground">
                Top Majors: {item.featuredMajors.slice(0, 2).join(", ")}
              </span>
              <Button 
                size="sm" 
                className="h-8 text-xs font-bold bg-[#102b2b] text-[#d8f36b] hover:bg-[#164743] rounded-xl gap-1"
              >
                <span>View Articulation Guide</span>
                <ArrowRight className="h-3 w-3" />
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
