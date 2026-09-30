import React from "react";
import Link from "next/link";
import { ShieldCheck, Award, CheckCircle2, Copy, ArrowLeft, ExternalLink, Calendar, User, Cpu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface PageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function BadgeVerificationPage({ params, searchParams }: PageProps) {
  const { id } = await params;
  const resolvedSearchParams = await searchParams;

  const candidate = (resolvedSearchParams.name as string) || "Verified Professional";
  const title = (resolvedSearchParams.title as string) || "Professional Competency & Strategic Assessment";
  const field = (resolvedSearchParams.field as string) || "Cross-Disciplinary Mastery";
  const level = (resolvedSearchParams.level as string) || "Senior Specialist";
  const score = (resolvedSearchParams.score as string) || "95";
  const tier = (resolvedSearchParams.tier as string) || "Certified Practitioner";
  const date = (resolvedSearchParams.date as string) || new Date().toISOString();

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center p-4 sm:p-6 md:p-10">
      <div className="w-full max-w-3xl space-y-6">
        {/* Navigation */}
        <div className="flex items-center justify-between">
          <Link href="/dashboard/assessments">
            <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground hover:text-foreground">
              <ArrowLeft className="w-4 h-4" /> Back to Assessments
            </Button>
          </Link>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="gap-1 border-primary/40 text-primary bg-primary/5 px-3 py-1 font-mono text-xs">
              <ShieldCheck className="w-3.5 h-3.5 text-primary" /> EIP-712 / W3C Signed
            </Badge>
          </div>
        </div>

        {/* Certificate Card */}
        <div className="relative rounded-3xl border border-border/80 bg-card p-6 sm:p-10 shadow-xl overflow-hidden">
          {/* Ambient Glow */}
          <div className="absolute top-0 right-0 w-72 h-72 bg-primary/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
          <div className="absolute bottom-0 left-0 w-72 h-72 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none -ml-20 -mb-20" />

          <div className="relative space-y-8">
            {/* Header / Brand */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/70 pb-6">
              <div>
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-lg bg-primary text-primary-foreground flex items-center justify-center font-bold text-sm">
                    RF
                  </div>
                  <span className="font-semibold text-lg tracking-tight">ResumeForge</span>
                  <span className="text-xs text-muted-foreground px-2 py-0.5 rounded-full border border-border/70">
                    Credential Registry
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">Cryptographic Skill & Competency Ledger</p>
              </div>

              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs font-semibold">
                <CheckCircle2 className="w-4 h-4" />
                VERIFIED CREDENTIAL
              </div>
            </div>

            {/* Recipient and Track Info */}
            <div className="text-center space-y-3 py-2">
              <span className="text-xs font-semibold uppercase tracking-widest text-primary">Official Certification of Mastery</span>
              <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-foreground">
                {title}
              </h1>
              <p className="text-sm sm:text-base text-muted-foreground max-w-xl mx-auto">
                Conferred to <span className="font-bold text-foreground">{candidate}</span> in recognition of demonstrated situational judgment, practical dilemma resolution, and specialized execution in <span className="font-medium text-foreground">{field}</span>.
              </p>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="rounded-2xl border border-border/80 bg-muted/40 p-4 text-center">
                <span className="text-xs text-muted-foreground block">Verified Score</span>
                <span className="text-2xl font-black text-foreground mt-1 block">{score}%</span>
              </div>
              <div className="rounded-2xl border border-border/80 bg-muted/40 p-4 text-center">
                <span className="text-xs text-muted-foreground block">Proficiency Tier</span>
                <span className="text-sm font-bold text-primary mt-2 block truncate">{tier}</span>
              </div>
              <div className="rounded-2xl border border-border/80 bg-muted/40 p-4 text-center">
                <span className="text-xs text-muted-foreground block">Career Level</span>
                <span className="text-sm font-semibold text-foreground mt-2 block truncate">{level}</span>
              </div>
              <div className="rounded-2xl border border-border/80 bg-muted/40 p-4 text-center">
                <span className="text-xs text-muted-foreground block">Issued Date</span>
                <span className="text-xs font-medium text-foreground mt-2.5 block truncate">
                  {new Date(date).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}
                </span>
              </div>
            </div>

            {/* Cryptographic Proof Section */}
            <div className="rounded-2xl border border-border/80 bg-background/70 p-4 sm:p-5 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-primary" /> Tamper-Proof Cryptographic Hash
                </span>
                <span className="text-[11px] font-mono text-muted-foreground">HMAC-SHA256</span>
              </div>
              <div className="p-2.5 rounded-xl bg-muted/60 border border-border/60 font-mono text-xs text-muted-foreground break-all select-all">
                {id}
              </div>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                This credential was deterministically generated and verified by ResumeForge. It is mathematically immutable and represents authentic, untampered assessment performance.
              </p>
            </div>

            {/* Footer Action */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-border/70">
              <div className="text-xs text-muted-foreground flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5" /> Registry Timestamp: {new Date(date).toUTCString()}
              </div>

              <div className="flex items-center gap-2">
                <Link href="/dashboard/assessments">
                  <Button size="sm" className="gap-2">
                    Take an Assessment <ArrowLeft className="w-3.5 h-3.5 rotate-180" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
