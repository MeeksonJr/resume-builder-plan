"use client";

import React from "react";
import { CanvasBlock } from "./visual-portfolio-builder-studio-client";
import {
  ShieldCheck,
  Video,
  ExternalLink,
  Mail,
  MapPin,
  Briefcase,
  Code2,
  FolderGit2,
  CheckCircle2,
  Award,
  GraduationCap,
  Phone,
  Globe,
  Linkedin,
  Github,
  Play
} from "lucide-react";
import { cn } from "@/lib/utils";

interface CanvasPortfolioRendererProps {
  blocks: CanvasBlock[];
  profile?: any;
  portfolio?: any;
  className?: string;
}

function getBlockContainerStyle(backgroundStyle?: string) {
  switch (backgroundStyle) {
    case "glass":
      return "border border-white/20 dark:border-white/10 bg-white/70 dark:bg-card/40 backdrop-blur-2xl shadow-xl shadow-black/5 dark:shadow-black/40 ring-1 ring-black/5 dark:ring-white/10";
    case "gradient":
      return "border border-emerald-500/30 bg-gradient-to-br from-card via-card/80 to-emerald-500/10 shadow-lg shadow-emerald-500/5";
    case "mesh":
      return "border border-cyan-500/30 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-cyan-500/15 via-card/90 to-card/50 backdrop-blur-md shadow-xl";
    case "clean":
    default:
      return "border border-border/70 bg-card/60 backdrop-blur-xs shadow-xs";
  }
}

export function CanvasPortfolioRenderer({
  blocks,
  profile,
  portfolio,
  className = "",
}: CanvasPortfolioRendererProps) {
  const visibleBlocks = (blocks || []).filter((b) => b.visible !== false);

  if (visibleBlocks.length === 0) {
    return (
      <div className="p-12 text-center text-muted-foreground rounded-2xl border border-dashed border-border/50 bg-card/30">
        <p className="text-sm font-medium">No canvas sections currently active.</p>
      </div>
    );
  }

  return (
    <div className={cn("space-y-6 sm:space-y-8", className)}>
      {visibleBlocks.map((block) => {
        const containerClasses = cn(
          "relative p-6 sm:p-8 rounded-2xl transition-all duration-300",
          getBlockContainerStyle(block.backgroundStyle)
        );

        if (block.type === "hero") {
          const heroHeading = (block.title && block.title !== "Candidate Hero & Bio")
            ? block.title
            : (portfolio?.full_name || profile?.full_name || block.title);

          const tagline = block.content?.tagline || portfolio?.tagline || "Professional";
          const bio = block.content?.bio || portfolio?.bio || profile?.summary;
          const openToWork = block.content?.openToWork ?? portfolio?.open_to_work ?? true;

          return (
            <div key={block.id} className={containerClasses}>
              {block.content?.coverUrl && (
                <div
                  className="h-36 -mx-6 sm:-mx-8 -mt-6 sm:-mt-8 mb-6 rounded-t-2xl bg-cover bg-center border-b border-border/20"
                  style={{ backgroundImage: `url(${block.content.coverUrl})` }}
                />
              )}
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 text-center sm:text-left">
                {block.content?.avatarUrl ? (
                  <img
                    src={block.content.avatarUrl}
                    alt="Profile Avatar"
                    className="h-24 w-24 rounded-full object-cover border-2 border-emerald-500 shadow-md shrink-0 ring-4 ring-emerald-500/10"
                  />
                ) : (
                  <div className="h-24 w-24 rounded-full bg-emerald-500/15 border-2 border-emerald-500/30 flex items-center justify-center text-emerald-500 text-3xl font-black shrink-0 ring-4 ring-emerald-500/10">
                    {heroHeading.charAt(0).toUpperCase()}
                  </div>
                )}
                <div className="space-y-2 flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 justify-center sm:justify-start">
                    <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-foreground">
                      {heroHeading}
                    </h1>
                    {openToWork && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 shrink-0">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        Available for Work
                      </span>
                    )}
                  </div>
                  <p className="text-sm sm:text-base font-semibold text-emerald-600 dark:text-emerald-400">
                    {tagline}
                  </p>
                  {bio && (
                    <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed max-w-2xl">
                      {bio}
                    </p>
                  )}
                </div>
              </div>
            </div>
          );
        }

        if (block.type === "skills") {
          const skillsList = block.content?.skills || [
            "TypeScript", "Next.js", "React", "Node.js", "PostgreSQL",
            "Tailwind CSS", "Docker", "AWS", "GraphQL", "Python", "Redis"
          ];

          return (
            <div key={block.id} className={containerClasses}>
              <div className="mb-4">
                <div className="flex items-center gap-2">
                  <Code2 className="h-4 w-4 text-emerald-500 shrink-0" />
                  <h2 className="text-lg font-bold tracking-tight text-foreground">{block.title}</h2>
                </div>
                {block.subtitle && (
                  <p className="text-xs text-muted-foreground mt-0.5">{block.subtitle}</p>
                )}
              </div>
              <div className="flex flex-wrap gap-2 pt-1">
                {skillsList.map((sk: string, i: number) => (
                  <span
                    key={i}
                    className="px-3.5 py-1.5 rounded-full text-xs font-mono font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/25 hover:border-emerald-500/40 transition-colors shadow-2xs"
                  >
                    {sk}
                  </span>
                ))}
              </div>
            </div>
          );
        }

        if (block.type === "experience") {
          const experiences = block.content?.experiences || [];

          return (
            <div key={block.id} className={containerClasses}>
              <div className="mb-5">
                <div className="flex items-center gap-2">
                  <Briefcase className="h-4 w-4 text-emerald-500 shrink-0" />
                  <h2 className="text-lg font-bold tracking-tight text-foreground">{block.title}</h2>
                </div>
                {block.subtitle && (
                  <p className="text-xs text-muted-foreground mt-0.5">{block.subtitle}</p>
                )}
              </div>
              <div className="space-y-6 pt-1">
                {experiences.map((exp: any, i: number) => (
                  <div key={i} className="border-l-2 border-emerald-500/40 pl-4 sm:pl-5 space-y-1.5 relative">
                    <span className="absolute -left-[5px] top-1.5 h-2 w-2 rounded-full bg-emerald-500 ring-4 ring-background" />
                    <div className="flex justify-between items-baseline flex-wrap gap-2">
                      <span className="text-sm font-bold text-foreground">{exp.role}</span>
                      <span className="text-xs text-muted-foreground font-mono">{exp.period}</span>
                    </div>
                    <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">{exp.company}</p>
                    {exp.bullets && exp.bullets.length > 0 && (
                      <ul className="list-disc list-inside text-xs text-muted-foreground space-y-1 mt-2 leading-relaxed">
                        {exp.bullets.map((b: string, bi: number) => (
                          <li key={bi}>{b}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))}
              </div>
            </div>
          );
        }

        if (block.type === "projects") {
          const items = block.content?.items || [];

          return (
            <div key={block.id} className={containerClasses}>
              <div className="mb-5">
                <div className="flex items-center gap-2">
                  <FolderGit2 className="h-4 w-4 text-emerald-500 shrink-0" />
                  <h2 className="text-lg font-bold tracking-tight text-foreground">{block.title}</h2>
                </div>
                {block.subtitle && (
                  <p className="text-xs text-muted-foreground mt-0.5">{block.subtitle}</p>
                )}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                {items.map((proj: any, i: number) => (
                  <div
                    key={i}
                    className="p-5 rounded-xl border border-border/50 bg-background/50 hover:bg-background/80 transition-all space-y-3 shadow-2xs group"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="text-sm font-bold text-foreground group-hover:text-emerald-500 transition-colors">
                        {proj.name}
                      </h3>
                      {proj.link && (
                        <a
                          href={proj.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-muted-foreground hover:text-emerald-500 transition-colors"
                        >
                          <ExternalLink className="h-3.5 w-3.5" />
                        </a>
                      )}
                    </div>
                    {proj.desc && (
                      <p className="text-xs text-muted-foreground line-clamp-3 leading-relaxed">
                        {proj.desc}
                      </p>
                    )}
                    {proj.tags && proj.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {proj.tags.map((tag: string, ti: number) => (
                          <span
                            key={ti}
                            className="text-[10px] px-2 py-0.5 rounded-md font-mono bg-muted text-muted-foreground border border-border/40"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          );
        }

        if (block.type === "education") {
          const entries = block.content?.entries || [
            {
              institution: "Stanford University",
              degree: "B.S. in Computer Science",
              field: "Artificial Intelligence & Distributed Systems",
              period: "2018 - 2022",
              honors: "Dean's Honor List • Magna Cum Laude"
            }
          ];

          return (
            <div key={block.id} className={containerClasses}>
              <div className="mb-5">
                <div className="flex items-center gap-2">
                  <GraduationCap className="h-4 w-4 text-emerald-500 shrink-0" />
                  <h2 className="text-lg font-bold tracking-tight text-foreground">{block.title}</h2>
                </div>
                {block.subtitle && (
                  <p className="text-xs text-muted-foreground mt-0.5">{block.subtitle}</p>
                )}
              </div>
              <div className="space-y-4 pt-1">
                {entries.map((edu: any, i: number) => (
                  <div key={i} className="border-l-2 border-emerald-500/40 pl-4 sm:pl-5 space-y-1 relative">
                    <span className="absolute -left-[5px] top-1.5 h-2 w-2 rounded-full bg-emerald-500 ring-4 ring-background" />
                    <div className="flex justify-between items-baseline flex-wrap gap-2">
                      <span className="text-sm font-bold text-foreground">
                        {edu.degree || edu.institution}
                      </span>
                      <span className="text-xs text-muted-foreground font-mono">{edu.period}</span>
                    </div>
                    <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                      {edu.institution}{edu.field ? ` • ${edu.field}` : ""}
                    </p>
                    {edu.honors && (
                      <p className="text-xs text-muted-foreground leading-relaxed">{edu.honors}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          );
        }

        if (block.type === "video_pitch") {
          const videoUrl = block.content?.videoUrl;
          const highlights = block.content?.highlights || [
            "10+ Years Building High-Scale Distributed Systems",
            "Specialized in Next.js, TypeScript & Edge Computing",
            "Proven leadership scaling engineering teams from Seed to Series B"
          ];

          return (
            <div key={block.id} className={containerClasses}>
              <div className="mb-4">
                <h2 className="text-lg font-bold tracking-tight text-foreground flex items-center gap-2">
                  <Video className="h-4 w-4 text-emerald-500" />
                  {block.title}
                </h2>
                {block.subtitle && <p className="text-xs text-muted-foreground mt-0.5">{block.subtitle}</p>}
              </div>

              <div className="space-y-4">
                <div className="p-6 rounded-2xl border border-emerald-500/20 bg-emerald-500/5 flex flex-col sm:flex-row items-center gap-4">
                  <div className="h-14 w-14 rounded-2xl bg-emerald-500/20 flex items-center justify-center text-emerald-500 shrink-0 shadow-sm">
                    <Play className="h-6 w-6 fill-emerald-500" />
                  </div>
                  <div className="space-y-1 text-center sm:text-left flex-1 min-w-0">
                    <h4 className="text-sm font-bold text-foreground">
                      {block.content?.pitchTitle || "60-Second Video Elevator Pitch"}
                    </h4>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {block.content?.summary || "Watch my 60-second introduction highlighting key projects and delivery strengths."}
                    </p>
                  </div>
                  {videoUrl && (
                    <a
                      href={videoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-md transition-all shrink-0"
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                      Watch Video
                    </a>
                  )}
                </div>

                {highlights && highlights.length > 0 && (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
                    {highlights.map((h: string, hi: number) => (
                      <div key={hi} className="p-3 rounded-xl border border-border/40 bg-card/40 flex items-start gap-2">
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0 mt-0.5" />
                        <span className="text-xs text-foreground/80 leading-snug">{h}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        }

        if (block.type === "web3_badges") {
          const badges = block.content?.badges || [
            { name: "Verified Distributed Systems Engineer", issuer: "ResumeForge Protocol", date: "2026", verifyUrl: "https://resumeforge.io" },
            { name: "EIP-712 Cryptographically Signed Assessment", issuer: "Career Authority", date: "2026", verifyUrl: "https://resumeforge.io" }
          ];

          return (
            <div key={block.id} className={containerClasses}>
              <div className="mb-4">
                <h2 className="text-lg font-bold tracking-tight text-foreground flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-purple-500" />
                  {block.title}
                </h2>
                {block.subtitle && <p className="text-xs text-muted-foreground mt-0.5">{block.subtitle}</p>}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {badges.map((badge: any, i: number) => (
                  <div key={i} className="p-4 rounded-xl border border-purple-500/25 bg-purple-500/5 flex items-center justify-between gap-3 group">
                    <div className="flex items-center gap-3 min-w-0">
                      <Award className="h-5 w-5 text-purple-400 shrink-0" />
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-bold text-foreground truncate">{badge.name}</p>
                        <p className="text-[10px] text-muted-foreground">{badge.issuer} • {badge.date}</p>
                      </div>
                    </div>
                    {badge.verifyUrl && (
                      <a
                        href={badge.verifyUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-muted-foreground group-hover:text-purple-400 transition-colors p-1"
                        title="Verify Credential"
                      >
                        <ExternalLink className="h-3.5 w-3.5" />
                      </a>
                    )}
                  </div>
                ))}
              </div>
            </div>
          );
        }

        if (block.type === "contact") {
          const email = block.content?.email || portfolio?.user_id || "engineer@resumeforge.io";
          const location = block.content?.location || portfolio?.location || "San Francisco, CA / Remote";
          const phone = block.content?.phone || portfolio?.phone;
          const linkedin = block.content?.linkedin || portfolio?.linkedin_url;
          const github = block.content?.github || portfolio?.github_url;
          const website = block.content?.website || portfolio?.website_url;
          const note = block.content?.note;

          return (
            <div key={block.id} className={containerClasses}>
              <div className="mb-4">
                <h2 className="text-lg font-bold tracking-tight text-foreground">{block.title}</h2>
                {block.subtitle && <p className="text-xs text-muted-foreground mt-0.5">{block.subtitle}</p>}
              </div>
              {note && (
                <p className="text-xs text-muted-foreground mb-4 leading-relaxed">{note}</p>
              )}
              <div className="p-5 rounded-2xl border border-border/40 bg-card/30 flex flex-wrap gap-3 items-center">
                {email && (
                  <a
                    href={`mailto:${email}`}
                    className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/25 text-xs font-semibold hover:bg-emerald-500/20 transition-all shadow-2xs"
                  >
                    <Mail className="h-4 w-4" />
                    {email}
                  </a>
                )}
                {phone && (
                  <a
                    href={`tel:${phone}`}
                    className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/25 text-xs font-semibold hover:bg-blue-500/20 transition-all shadow-2xs"
                  >
                    <Phone className="h-4 w-4" />
                    {phone}
                  </a>
                )}
                {location && (
                  <span className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-muted/60 text-xs font-medium text-muted-foreground border border-border/40">
                    <MapPin className="h-4 w-4 text-emerald-500" />
                    {location}
                  </span>
                )}
                {linkedin && (
                  <a
                    href={linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-muted/60 text-xs font-medium text-foreground hover:text-emerald-500 border border-border/40 transition-colors"
                  >
                    <Linkedin className="h-3.5 w-3.5 text-blue-500" />
                    LinkedIn
                  </a>
                )}
                {github && (
                  <a
                    href={github}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-muted/60 text-xs font-medium text-foreground hover:text-emerald-500 border border-border/40 transition-colors"
                  >
                    <Github className="h-3.5 w-3.5" />
                    GitHub
                  </a>
                )}
                {website && (
                  <a
                    href={website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-muted/60 text-xs font-medium text-foreground hover:text-emerald-500 border border-border/40 transition-colors"
                  >
                    <Globe className="h-3.5 w-3.5 text-emerald-500" />
                    Website
                  </a>
                )}
              </div>
            </div>
          );
        }

        return null;
      })}
    </div>
  );
}
