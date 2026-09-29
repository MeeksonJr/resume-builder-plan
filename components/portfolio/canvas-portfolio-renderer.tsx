"use client";

import React from "react";
import {
  CanvasBlock,
  THEME_PALETTES,
  getStudioBlockContainerStyle,
  stripHtml
} from "./visual-portfolio-builder-studio-client";
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

export function CanvasPortfolioRenderer({
  blocks,
  profile,
  portfolio,
  className = "",
}: CanvasPortfolioRendererProps) {
  const visibleBlocks = (blocks || []).filter((b) => b.visible !== false);
  const activeThemeColor = portfolio?.theme_settings?.color || "emerald";
  const theme = THEME_PALETTES[activeThemeColor] || THEME_PALETTES.emerald;

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
          getStudioBlockContainerStyle(block.backgroundStyle, false, activeThemeColor)
        );

        if (block.type === "hero") {
          const heroHeading = (block.title && block.title !== "Candidate Hero & Bio")
            ? block.title
            : (portfolio?.full_name || profile?.full_name || block.title);

          const tagline = stripHtml(block.content?.tagline || portfolio?.tagline || "Professional");
          const bio = stripHtml(block.content?.bio || portfolio?.bio || profile?.summary);
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
                    className={cn(
                      "h-24 w-24 rounded-full object-cover border-2 shadow-md shrink-0 ring-4",
                      theme.accentBorder,
                      theme.ring
                    )}
                  />
                ) : (
                  <div
                    className={cn(
                      "h-24 w-24 rounded-full flex items-center justify-center text-3xl font-black shrink-0 ring-4 border-2",
                      theme.accentBg,
                      theme.accentBorder,
                      theme.accentText,
                      theme.ring
                    )}
                  >
                    {heroHeading.charAt(0).toUpperCase()}
                  </div>
                )}
                <div className="space-y-2 flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 justify-center sm:justify-start">
                    <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-foreground">
                      {heroHeading}
                    </h1>
                    {openToWork && (
                      <span
                        className={cn(
                          "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border shrink-0",
                          theme.accentBg,
                          theme.accentText,
                          theme.accentBorder
                        )}
                      >
                        <span className={cn("h-1.5 w-1.5 rounded-full animate-pulse", theme.accentText.replace("text-", "bg-"))} />
                        Available for Work
                      </span>
                    )}
                  </div>
                  <p className={cn("text-sm sm:text-base font-semibold", theme.accentText)}>
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
                  <Code2 className={cn("h-4 w-4 shrink-0", theme.accentText)} />
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
                    className={cn(
                      "px-3.5 py-1.5 rounded-full text-xs font-mono font-semibold border transition-colors shadow-2xs",
                      theme.accentBadge,
                      theme.accentBorderHover
                    )}
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
                  <Briefcase className={cn("h-4 w-4 shrink-0", theme.accentText)} />
                  <h2 className="text-lg font-bold tracking-tight text-foreground">{block.title}</h2>
                </div>
                {block.subtitle && (
                  <p className="text-xs text-muted-foreground mt-0.5">{block.subtitle}</p>
                )}
              </div>
              <div className="space-y-6 pt-1">
                {experiences.map((exp: any, i: number) => (
                  <div key={i} className={cn("border-l-2 pl-4 sm:pl-5 space-y-1.5 relative", theme.accentBorder)}>
                    <span className={cn("absolute -left-[5px] top-1.5 h-2 w-2 rounded-full ring-4 ring-background", theme.accentText.replace("text-", "bg-"))} />
                    <div className="flex justify-between items-baseline flex-wrap gap-2">
                      <span className="text-sm font-bold text-foreground">{stripHtml(exp.role)}</span>
                      <span className="text-xs text-muted-foreground font-mono">{exp.period}</span>
                    </div>
                    <p className={cn("text-xs font-semibold", theme.accentText)}>{stripHtml(exp.company)}</p>
                    {exp.bullets && exp.bullets.length > 0 && (
                      <ul className="list-disc list-inside text-xs text-muted-foreground space-y-1 mt-2 leading-relaxed">
                        {exp.bullets.map((b: string, bi: number) => (
                          <li key={bi}>{stripHtml(b)}</li>
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
                  <FolderGit2 className={cn("h-4 w-4 shrink-0", theme.accentText)} />
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
                    className={cn(
                      "p-5 rounded-xl border border-border/50 bg-background/50 hover:bg-background/80 transition-all space-y-3 shadow-2xs group",
                      theme.accentBorderHover
                    )}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="text-sm font-bold text-foreground transition-colors group-hover:text-primary">
                        {stripHtml(proj.name)}
                      </h3>
                      {proj.link && (
                        <a
                          href={proj.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-muted-foreground hover:text-foreground transition-colors"
                        >
                          <ExternalLink className="h-3.5 w-3.5" />
                        </a>
                      )}
                    </div>
                    {proj.desc && (
                      <p className="text-xs text-muted-foreground line-clamp-3 leading-relaxed">
                        {stripHtml(proj.desc)}
                      </p>
                    )}
                    {proj.tags && proj.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {proj.tags.map((tag: string, ti: number) => (
                          <span
                            key={ti}
                            className={cn(
                              "text-[10px] px-2.5 py-0.5 rounded-md font-mono border font-semibold shadow-2xs",
                              theme.accentBadge
                            )}
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
                  <GraduationCap className={cn("h-4 w-4 shrink-0", theme.accentText)} />
                  <h2 className="text-lg font-bold tracking-tight text-foreground">{block.title}</h2>
                </div>
                {block.subtitle && (
                  <p className="text-xs text-muted-foreground mt-0.5">{block.subtitle}</p>
                )}
              </div>
              <div className="space-y-4 pt-1">
                {entries.map((edu: any, i: number) => (
                  <div key={i} className={cn("border-l-2 pl-4 sm:pl-5 space-y-1 relative", theme.accentBorder)}>
                    <span className={cn("absolute -left-[5px] top-1.5 h-2 w-2 rounded-full ring-4 ring-background", theme.accentText.replace("text-", "bg-"))} />
                    <div className="flex justify-between items-baseline flex-wrap gap-2">
                      <span className="text-sm font-bold text-foreground">
                        {stripHtml(edu.degree || edu.institution)}
                      </span>
                      <span className="text-xs text-muted-foreground font-mono">{edu.period}</span>
                    </div>
                    <p className={cn("text-xs font-semibold", theme.accentText)}>
                      {stripHtml(edu.institution)}{edu.field ? ` • ${stripHtml(edu.field)}` : ""}
                    </p>
                    {edu.honors && (
                      <p className="text-xs text-muted-foreground leading-relaxed">{stripHtml(edu.honors)}</p>
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
                  <Video className={cn("h-4 w-4 shrink-0", theme.accentText)} />
                  {block.title}
                </h2>
                {block.subtitle && <p className="text-xs text-muted-foreground mt-0.5">{block.subtitle}</p>}
              </div>

              <div className="space-y-4">
                <div className={cn("p-6 rounded-2xl border flex flex-col sm:flex-row items-center gap-4", theme.accentBorder, theme.accentBg)}>
                  <div className={cn("h-14 w-14 rounded-2xl flex items-center justify-center shrink-0 shadow-sm", theme.accentBg, theme.accentText)}>
                    <Play className={cn("h-6 w-6", theme.accentText.replace("text-", "fill-"))} />
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
                      className={cn("inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-white text-xs font-semibold shadow-md transition-all shrink-0", theme.accentButton)}
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
                        <CheckCircle2 className={cn("h-3.5 w-3.5 shrink-0 mt-0.5", theme.accentText)} />
                        <span className="text-xs text-foreground/80 leading-snug">{stripHtml(h)}</span>
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
                  <ShieldCheck className={cn("h-4 w-4 shrink-0", theme.accentText)} />
                  {block.title}
                </h2>
                {block.subtitle && <p className="text-xs text-muted-foreground mt-0.5">{block.subtitle}</p>}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {badges.map((badge: any, i: number) => (
                  <div key={i} className={cn("p-4 rounded-xl border flex items-center justify-between gap-3 group transition-colors", theme.accentBorder, theme.accentBg)}>
                    <div className="flex items-center gap-3 min-w-0">
                      <Award className={cn("h-5 w-5 shrink-0", theme.accentTextLight)} />
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
                        className={cn("text-muted-foreground transition-colors p-1 hover:", theme.accentText)}
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
                <p className="text-xs text-muted-foreground mb-4 leading-relaxed">{stripHtml(note)}</p>
              )}
              <div className="p-5 rounded-2xl border border-border/40 bg-card/30 flex flex-wrap gap-3 items-center">
                {email && (
                  <a
                    href={`mailto:${email}`}
                    className={cn(
                      "inline-flex items-center gap-2 px-3.5 py-2 rounded-xl border text-xs font-semibold transition-all shadow-2xs",
                      theme.accentBadge,
                      theme.accentBorderHover
                    )}
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
                    <MapPin className={cn("h-4 w-4", theme.accentText)} />
                    {location}
                  </span>
                )}
                {linkedin && (
                  <a
                    href={linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-muted/60 text-xs font-medium text-foreground hover:text-blue-500 border border-border/40 transition-colors"
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
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-muted/60 text-xs font-medium text-foreground hover:text-purple-400 border border-border/40 transition-colors"
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
                    className={cn(
                      "inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-muted/60 text-xs font-medium text-foreground border border-border/40 transition-colors hover:",
                      theme.accentText
                    )}
                  >
                    <Globe className={cn("h-3.5 w-3.5", theme.accentText)} />
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
