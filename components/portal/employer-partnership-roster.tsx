"use client";

import * as React from "react";
import { Building2, Award, Briefcase, ExternalLink, ShieldCheck } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export interface CorporatePartner {
  name: string;
  tier: "Founding Partner" | "Premier Corporate Sponsor" | "Collegiate Affiliate";
  hq: string;
  industry: string;
  activeVirginiaHires: number;
  priorityRecruitingMajors: string[];
  careersUrl: string;
}

interface EmployerPartnershipRosterProps {
  campusName: string;
}

export function EmployerPartnershipRoster({ campusName }: EmployerPartnershipRosterProps) {
  const partners: CorporatePartner[] = [
    {
      name: "Dominion Energy",
      tier: "Founding Partner",
      hq: "Richmond, VA",
      industry: "Clean Energy, Cloud Engineering & Grid Systems",
      activeVirginiaHires: 185,
      priorityRecruitingMajors: ["Computer Science", "Electrical Engineering", "Cybersecurity"],
      careersUrl: "https://careers.dominionenergy.com",
    },
    {
      name: "Huntington Ingalls Industries",
      tier: "Premier Corporate Sponsor",
      hq: "Newport News, VA",
      industry: "Defense & Advanced Marine Architecture",
      activeVirginiaHires: 320,
      priorityRecruitingMajors: ["Mechanical Eng", "Software Systems", "Data Science"],
      careersUrl: "https://huntingtoningalls.com/careers",
    },
    {
      name: "Capital One",
      tier: "Premier Corporate Sponsor",
      hq: "McLean, VA",
      industry: "Financial Technology, AI & Cloud Platforms",
      activeVirginiaHires: 410,
      priorityRecruitingMajors: ["Computer Science", "Business Analytics", "Mathematics"],
      careersUrl: "https://www.capitalonecareers.com",
    },
    {
      name: "Sentara Healthcare",
      tier: "Collegiate Affiliate",
      hq: "Norfolk, VA",
      industry: "Health Informatics & Clinical Engineering",
      activeVirginiaHires: 140,
      priorityRecruitingMajors: ["Nursing", "Health Informatics", "Biomedical Eng"],
      careersUrl: "https://www.sentaracareers.com",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="border-b border-border/80 pb-4">
        <h2 className="text-xl sm:text-2xl font-black text-foreground">
          {campusName} &bull; Corporate Employer Partnerships
        </h2>
        <p className="text-xs text-muted-foreground mt-1 max-w-2xl">
          Verified industry sponsors with direct on-campus recruiting pipelines, interview scheduling rooms, 
          and sponsored capstone project funding.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {partners.map((p) => (
          <Card key={p.name} className="rounded-2xl border border-border/80 bg-card p-5 space-y-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <Badge className={`text-[10px] font-bold mb-2 ${
                  p.tier === "Founding Partner" 
                    ? "bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30"
                    : "bg-primary/10 text-primary border-primary/20"
                }`}>
                  {p.tier}
                </Badge>
                <CardTitle className="text-base sm:text-lg font-bold text-foreground">
                  {p.name}
                </CardTitle>
                <p className="text-xs text-muted-foreground mt-0.5">{p.industry}</p>
              </div>

              <div className="text-right">
                <span className="text-[10px] uppercase font-bold text-muted-foreground block">Alumni Placed</span>
                <span className="text-base font-mono font-bold text-emerald-600">{p.activeVirginiaHires}+</span>
              </div>
            </div>

            <div>
              <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider block mb-1">
                Priority Campus Majors
              </span>
              <div className="flex flex-wrap gap-1.5">
                {p.priorityRecruitingMajors.map((m) => (
                  <span key={m} className="text-[11px] font-medium bg-muted text-foreground px-2 py-0.5 rounded-md">
                    {m}
                  </span>
                ))}
              </div>
            </div>

            <div className="pt-2 flex items-center justify-between border-t border-border/60">
              <span className="text-xs text-muted-foreground">HQ: {p.hq}</span>
              <a href={p.careersUrl} target="_blank" rel="noreferrer">
                <Button size="sm" variant="outline" className="h-8 text-xs font-bold rounded-xl gap-1.5">
                  <span>Explore Jobs</span>
                  <ExternalLink className="h-3 w-3" />
                </Button>
              </a>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
