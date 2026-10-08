"use client";

import * as React from "react";
import { CheckCircle2, ExternalLink, ShieldCheck, Plus, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export interface VerifiedSkillItem {
  name: string;
  category: "Languages" | "Frameworks" | "Cloud & DevOps" | "Data & Databases" | "Tools & Certifications";
  isVerified: boolean;
  credentialUrl?: string;
  issuingBody?: string;
}

interface SkillBadgeVerifierProps {
  skills: VerifiedSkillItem[];
  onAddSkill?: (skill: string) => void;
}

export function SkillBadgeVerifier({ skills, onAddSkill }: SkillBadgeVerifierProps) {
  const grouped = React.useMemo(() => {
    const map = new Map<string, VerifiedSkillItem[]>();
    skills.forEach((s) => {
      const list = map.get(s.category) || [];
      list.push(s);
      map.set(s.category, list);
    });
    return map;
  }, [skills]);

  return (
    <div className="space-y-4">
      {Array.from(grouped.entries()).map(([category, items]) => (
        <div key={category} className="space-y-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground block">
            {category} ({items.length})
          </span>
          <div className="flex flex-wrap gap-2">
            {items.map((skill) => (
              <div
                key={skill.name}
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-mono font-medium border transition-all ${
                  skill.isVerified
                    ? "bg-emerald-500/10 text-emerald-800 dark:text-emerald-300 border-emerald-500/30"
                    : "bg-muted/60 text-foreground border-border/80"
                }`}
              >
                {skill.isVerified ? (
                  <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
                ) : (
                  <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/60" />
                )}
                <span>{skill.name}</span>
                {skill.credentialUrl && (
                  <a
                    href={skill.credentialUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-primary hover:underline ml-0.5"
                    title={`View verification from ${skill.issuingBody || "credential authority"}`}
                  >
                    <ExternalLink className="h-2.5 w-2.5 inline" />
                  </a>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
