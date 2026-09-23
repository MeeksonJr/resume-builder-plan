"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Building2,
  Briefcase,
  GraduationCap,
  FileText,
  Mail,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  Download,
  Calendar,
  Sparkles,
  MapPin,
  FolderGit2,
  Award,
  ArrowRight,
  Code2,
  Copy,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface DedicatedJobPortfolioViewProps {
  portfolio: any;
  profile: any;
  application: any;
  tailoredResume: any;
  coverLetter: any;
  canvasCourses: Array<{ id: string; name: string; course_code?: string }>;
  slug: string;
}

export function DedicatedJobPortfolioView({
  portfolio,
  profile,
  application,
  tailoredResume,
  coverLetter,
  canvasCourses,
  slug,
}: DedicatedJobPortfolioViewProps) {
  const [activeTab, setActiveTab] = useState<"resume" | "cover_letter" | "coursework" | "projects">("resume");
  const [copiedLink, setCopiedLink] = useState(false);

  const dedicatedData = application?.dedicated_portfolio_data || {};
  const companyName = application?.company || "Hiring Team";
  const roleName = application?.role || "Target Role";
  const candidateName = portfolio?.full_name || profile?.full_name || tailoredResume?.personal_info?.full_name || "Candidate";

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      toast.success("Dedicated portfolio link copied to clipboard!");
      setTimeout(() => setCopiedLink(false), 2500);
    } catch {
      toast.error("Failed to copy link");
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-[#070b12] text-white selection:bg-emerald-500 selection:text-black">
      {/* Top Floating Header Dock */}
      <header className="fixed top-3 inset-x-0 z-50 px-3 sm:px-6 pointer-events-none print:hidden flex justify-center">
        <div className="pointer-events-auto w-full max-w-5xl rounded-full border border-white/10 bg-[#0d1422]/90 backdrop-blur-xl shadow-2xl px-4 sm:px-6 py-2.5 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <Link
              href={`/p/${slug}`}
              className="flex items-center gap-2 text-xs font-bold text-white hover:text-emerald-400 transition-colors shrink-0"
              title="View full portfolio"
            >
              <div className="h-7 w-7 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-bold text-xs">
                {candidateName.charAt(0).toUpperCase()}
              </div>
              <span className="truncate hidden sm:inline">{candidateName}</span>
            </Link>

            <span className="text-white/20 hidden sm:inline">•</span>

            <div className="flex items-center gap-1.5 truncate">
              <Badge className="bg-emerald-500/15 text-emerald-300 border-emerald-500/30 text-[10px] font-mono shrink-0">
                <Sparkles className="h-2.5 w-2.5 mr-1 text-emerald-400" />
                Tailored Dossier
              </Badge>
              <span className="text-xs text-white/60 truncate hidden md:inline">
                for {companyName}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Button
              size="sm"
              variant="outline"
              onClick={handleCopyLink}
              className="h-8 text-xs font-semibold rounded-full border-white/15 bg-white/5 hover:bg-white/10 text-white gap-1.5"
            >
              <Copy className="h-3 w-3" />
              <span className="hidden sm:inline">{copiedLink ? "Copied" : "Share Dossier"}</span>
            </Button>
            {portfolio?.booking_url && (
              <Button
                asChild
                size="sm"
                className="h-8 text-xs font-semibold rounded-full bg-emerald-600 hover:bg-emerald-500 text-white gap-1.5 shadow-sm"
              >
                <a href={portfolio.booking_url} target="_blank" rel="noopener noreferrer">
                  <Calendar className="h-3 w-3" />
                  <span className="hidden sm:inline">Schedule Interview</span>
                </a>
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 pt-24 pb-20 space-y-8">
        {/* Company-Targeted Hero Section */}
        <section className="relative p-6 sm:p-10 rounded-3xl border border-white/10 bg-gradient-to-br from-[#0d1424] via-[#090e18] to-[#0d1e18] shadow-2xl overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
            <Building2 className="h-48 w-48 text-emerald-400" />
          </div>

          <div className="relative z-10 space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-semibold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                <Building2 className="h-3.5 w-3.5 text-emerald-400" />
                Target Company: {companyName}
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-semibold bg-sky-500/15 text-sky-300 border border-sky-500/30">
                <Briefcase className="h-3.5 w-3.5 text-sky-400" />
                Target Role: {roleName}
              </span>
            </div>

            <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white">
              {dedicatedData?.greeting || `Hello ${companyName} Engineering Team`}
            </h1>

            <p className="text-sm sm:text-base text-white/80 leading-relaxed max-w-2xl">
              {dedicatedData?.custom_pitch ||
                `I have curated this dedicated career portfolio specifically to demonstrate how my technical foundations, verified academic coursework, and system architecture accomplishments align with ${companyName}'s current roadmap.`}
            </p>

            {/* Key Match Highlights */}
            {dedicatedData?.key_match_reasons && dedicatedData.key_match_reasons.length > 0 && (
              <div className="pt-2 grid grid-cols-1 sm:grid-cols-3 gap-3">
                {dedicatedData.key_match_reasons.map((reason: string, idx: number) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-2xl border border-white/10 bg-white/[0.03] space-y-1.5 backdrop-blur-sm"
                  >
                    <div className="flex items-center gap-1.5 text-emerald-400 text-xs font-bold">
                      <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
                      Pillar {idx + 1}
                    </div>
                    <p className="text-xs text-white/70 leading-relaxed">{reason}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Interactive Tabs Navigation */}
        <Tabs value={activeTab} onValueChange={(v: any) => setActiveTab(v)} className="space-y-6">
          <TabsList className="w-full grid grid-cols-2 sm:grid-cols-4 h-12 p-1 rounded-2xl bg-[#0d1422] border border-white/10 text-white/60">
            <TabsTrigger
              value="resume"
              className="rounded-xl text-xs font-bold data-[state=active]:bg-emerald-600 data-[state=active]:text-white transition-all gap-1.5"
            >
              <FileText className="h-3.5 w-3.5" />
              Tailored Resume
            </TabsTrigger>
            <TabsTrigger
              value="cover_letter"
              className="rounded-xl text-xs font-bold data-[state=active]:bg-emerald-600 data-[state=active]:text-white transition-all gap-1.5"
            >
              <Mail className="h-3.5 w-3.5" />
              Cover Letter
            </TabsTrigger>
            <TabsTrigger
              value="coursework"
              className="rounded-xl text-xs font-bold data-[state=active]:bg-emerald-600 data-[state=active]:text-white transition-all gap-1.5"
            >
              <GraduationCap className="h-3.5 w-3.5" />
              Canvas Proof ({canvasCourses.length})
            </TabsTrigger>
            <TabsTrigger
              value="projects"
              className="rounded-xl text-xs font-bold data-[state=active]:bg-emerald-600 data-[state=active]:text-white transition-all gap-1.5"
            >
              <FolderGit2 className="h-3.5 w-3.5" />
              Projects
            </TabsTrigger>
          </TabsList>

          {/* TAB 1: Tailored ATS Resume */}
          <TabsContent value="resume" className="space-y-6">
            <div className="p-6 sm:p-8 rounded-2xl border border-white/10 bg-[#0d1422] space-y-6 shadow-xl">
              <div className="flex items-center justify-between pb-4 border-b border-white/10 flex-wrap gap-2">
                <div>
                  <h2 className="text-xl font-black text-white">{tailoredResume?.title || `${roleName} Resume`}</h2>
                  <p className="text-xs text-emerald-400 font-mono">Synthesized & ATS-Optimized for {companyName}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handlePrint}
                    className="h-8 text-xs font-semibold rounded-lg border-white/15 bg-white/5 hover:bg-white/10 text-white gap-1.5"
                  >
                    <Download className="h-3.5 w-3.5" />
                    Print / PDF
                  </Button>
                </div>
              </div>

              {/* Professional Summary */}
              {tailoredResume?.personal_info?.summary && (
                <div className="space-y-2">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                    Professional Summary
                  </h3>
                  <p className="text-xs sm:text-sm text-white/80 leading-relaxed p-4 rounded-xl bg-white/[0.02] border border-white/5">
                    {tailoredResume.personal_info.summary}
                  </p>
                </div>
              )}

              {/* Skills Grid */}
              {tailoredResume?.skills && tailoredResume.skills.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                    Targeted Core Competencies
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {tailoredResume.skills.map((cat: any, i: number) => (
                      <div key={i} className="p-3.5 rounded-xl border border-white/5 bg-white/[0.02] space-y-2">
                        <p className="text-xs font-bold text-white">{cat.name || cat.category}</p>
                        <div className="flex flex-wrap gap-1.5">
                          {(cat.skills || []).map((sk: string, si: number) => (
                            <span
                              key={si}
                              className="text-[10px] px-2 py-0.5 rounded font-mono font-semibold bg-emerald-500/15 text-emerald-300 border border-emerald-500/25"
                            >
                              {sk}
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Work Experiences */}
              {tailoredResume?.work_experiences && tailoredResume.work_experiences.length > 0 && (
                <div className="space-y-4">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                    Targeted Work Experience
                  </h3>
                  <div className="space-y-5">
                    {tailoredResume.work_experiences.map((exp: any, i: number) => (
                      <div key={i} className="border-l-2 border-emerald-500/40 pl-4 space-y-1.5">
                        <div className="flex justify-between items-baseline flex-wrap gap-2">
                          <span className="text-sm font-bold text-white">{exp.position}</span>
                          <span className="text-xs text-white/40 font-mono">
                            {exp.start_date} – {exp.current ? "Present" : exp.end_date}
                          </span>
                        </div>
                        <p className="text-xs font-medium text-emerald-400">{exp.company}</p>
                        {exp.highlights && exp.highlights.length > 0 && (
                          <ul className="list-disc list-inside text-xs text-white/70 space-y-1 mt-1 leading-relaxed">
                            {exp.highlights.map((h: string, hi: number) => (
                              <li key={hi}>{h}</li>
                            ))}
                          </ul>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Education */}
              {tailoredResume?.education && tailoredResume.education.length > 0 && (
                <div className="space-y-3 pt-2">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                    Education & Credentials
                  </h3>
                  <div className="space-y-3">
                    {tailoredResume.education.map((edu: any, i: number) => (
                      <div key={i} className="p-3.5 rounded-xl border border-white/5 bg-white/[0.02] space-y-1">
                        <div className="flex justify-between items-baseline">
                          <span className="text-xs font-bold text-white">{edu.degree} in {edu.field_of_study}</span>
                          <span className="text-[11px] text-white/40 font-mono">{edu.start_date} – {edu.end_date}</span>
                        </div>
                        <p className="text-xs text-emerald-400">{edu.institution}</p>
                        {edu.achievements && edu.achievements.length > 0 && (
                          <div className="pt-1">
                            {edu.achievements.map((ach: string, ai: number) => (
                              <p key={ai} className="text-[11px] text-white/60">• {ach}</p>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </TabsContent>

          {/* TAB 2: Tailored Cover Letter */}
          <TabsContent value="cover_letter" className="space-y-6">
            <div className="p-6 sm:p-10 rounded-2xl border border-white/10 bg-[#0d1422] space-y-6 shadow-xl leading-relaxed">
              <div className="border-b border-white/10 pb-4 space-y-1">
                <h2 className="text-xl font-black text-white">{coverLetter?.title || `Cover Letter for ${companyName}`}</h2>
                <p className="text-xs text-emerald-400 font-mono">Addressed to: {coverLetter?.recipient_name || `Hiring Team at ${companyName}`}</p>
              </div>

              <div className="text-xs sm:text-sm text-white/80 whitespace-pre-line space-y-4 p-6 rounded-2xl bg-white/[0.02] border border-white/5 font-sans leading-relaxed">
                {coverLetter?.content || "Cover letter content being generated..."}
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    navigator.clipboard.writeText(coverLetter?.content || "");
                    toast.success("Cover letter copied to clipboard!");
                  }}
                  className="h-8 text-xs font-semibold rounded-lg border-white/15 bg-white/5 hover:bg-white/10 text-white gap-1.5"
                >
                  <Copy className="h-3 w-3" />
                  Copy Letter Text
                </Button>
              </div>
            </div>
          </TabsContent>

          {/* TAB 3: Canvas Coursework Proof */}
          <TabsContent value="coursework" className="space-y-6">
            <div className="p-6 sm:p-8 rounded-2xl border border-white/10 bg-[#0d1422] space-y-5 shadow-xl">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="h-5 w-5 text-emerald-400" />
                  <h2 className="text-lg font-bold text-white">Verified Canvas LMS Academic Coursework</h2>
                </div>
                <p className="text-xs text-white/50">
                  Direct academic synchronization validated via University Canvas LMS credentials.
                </p>
              </div>

              {canvasCourses.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  {canvasCourses.map((c, i) => (
                    <div
                      key={i}
                      className="p-4 rounded-xl border border-emerald-500/20 bg-emerald-500/5 flex items-start gap-3"
                    >
                      <GraduationCap className="h-5 w-5 text-emerald-400 shrink-0 mt-0.5" />
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-bold text-white">{c.name}</p>
                        {c.course_code && (
                          <p className="text-[11px] font-mono text-emerald-400 mt-0.5">Code: {c.course_code}</p>
                        )}
                        <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-300 mt-2">
                          <CheckCircle2 className="h-3 w-3 text-emerald-400" />
                          Authenticated University Course
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center rounded-xl bg-white/[0.02] border border-dashed border-white/10 text-xs text-white/50">
                  No Canvas LMS courses currently synced.
                </div>
              )}
            </div>
          </TabsContent>

          {/* TAB 4: Targeted Projects */}
          <TabsContent value="projects" className="space-y-6">
            <div className="p-6 sm:p-8 rounded-2xl border border-white/10 bg-[#0d1422] space-y-5 shadow-xl">
              <div className="space-y-1">
                <h2 className="text-lg font-bold text-white">Featured Projects Aligned With Role</h2>
                <p className="text-xs text-white/50">
                  Open source contributions, production services, and technical initiatives relevant to {companyName}.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {(tailoredResume?.projects || []).map((p: any, i: number) => (
                  <div
                    key={i}
                    className="p-5 rounded-xl border border-white/10 bg-white/[0.02] hover:bg-white/[0.04] transition-all space-y-2.5"
                  >
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-bold text-white">{p.name}</h3>
                      {p.url && (
                        <a
                          href={p.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-white/40 hover:text-emerald-400 transition-colors"
                        >
                          <ExternalLink className="h-3.5 w-3.5" />
                        </a>
                      )}
                    </div>
                    <p className="text-xs text-white/70 leading-relaxed">{p.description}</p>
                    {p.technologies && p.technologies.length > 0 && (
                      <div className="flex flex-wrap gap-1 pt-1">
                        {p.technologies.map((t: string, ti: number) => (
                          <span
                            key={ti}
                            className="text-[10px] px-2 py-0.5 rounded font-mono bg-white/10 text-white/80"
                          >
                            {t}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>
        </Tabs>

        {/* Footer Contact & Action Card */}
        <section className="p-6 sm:p-8 rounded-3xl border border-emerald-500/20 bg-gradient-to-r from-emerald-950/20 via-card/40 to-emerald-950/20 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="space-y-1 text-center sm:text-left">
            <h3 className="text-base font-bold text-white">Ready for the Next Step?</h3>
            <p className="text-xs text-white/60">
              Connect directly with {candidateName} regarding the {roleName} role.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {profile?.email && (
              <Button asChild size="sm" className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-full">
                <a href={`mailto:${profile.email}?subject=${encodeURIComponent(`Interview regarding ${roleName} at ${companyName}`)}`}>
                  <Mail className="h-3.5 w-3.5 mr-1.5" />
                  Email Candidate
                </a>
              </Button>
            )}
            <Button asChild variant="outline" size="sm" className="border-white/20 bg-white/5 hover:bg-white/10 text-white text-xs font-bold rounded-full">
              <Link href={`/p/${slug}`}>
                View Main Portfolio
                <ArrowRight className="h-3.5 w-3.5 ml-1.5" />
              </Link>
            </Button>
          </div>
        </section>
      </main>
    </div>
  );
}
