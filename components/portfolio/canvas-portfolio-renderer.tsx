"use client";

import React from "react";
import { CanvasBlock } from "./visual-portfolio-builder-studio-client";
import { ShieldCheck, Video, ExternalLink, Mail, MapPin } from "lucide-react";

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

  if (visibleBlocks.length === 0) {
    return (
      <div className="p-12 text-center text-muted-foreground">
        <p>No canvas blocks configured yet.</p>
      </div>
    );
  }

  return (
    <div className={`space-y-8 divide-y divide-border/20 ${className}`}>
      {visibleBlocks.map((block) => {
        if (block.type === "hero") {
          return (
            <div
              key={block.id}
              className="relative p-6 sm:p-8 rounded-2xl border border-border/40 bg-card/60 backdrop-blur-sm transition-all"
            >
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
                    alt="Profile"
                    className="h-24 w-24 rounded-full object-cover border-2 border-primary shadow-md shrink-0"
                  />
                ) : (
                  <div className="h-24 w-24 rounded-full bg-primary/20 border-2 border-primary/40 flex items-center justify-center text-primary text-2xl font-bold shrink-0">
                    {profile?.full_name?.charAt(0) || portfolio?.full_name?.charAt(0) || "U"}
                  </div>
                )}
                <div className="space-y-1.5 flex-1 min-w-0">
                  <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-foreground">
                    {portfolio?.full_name || profile?.full_name || block.title}
                  </h1>
                  <p className="text-sm sm:text-base font-semibold text-primary">
                    {block.content?.tagline || portfolio?.tagline || "Professional"}
                  </p>
                  <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed max-w-2xl">
                    {block.content?.bio || portfolio?.bio || profile?.summary}
                  </p>
                </div>
              </div>
            </div>
          );
        }

        if (block.type === "skills") {
          return (
            <div key={block.id} className="pt-8 space-y-4">
              <div>
                <h2 className="text-lg font-bold tracking-tight text-foreground">{block.title}</h2>
                {block.subtitle && <p className="text-xs text-muted-foreground">{block.subtitle}</p>}
              </div>
              <div className="flex flex-wrap gap-2">
                {(block.content?.skills || ["TypeScript", "React", "Next.js", "Node.js"]).map((sk: string, i: number) => (
                  <span
                    key={i}
                    className="px-3 py-1 rounded-full text-xs font-mono font-medium bg-primary/10 text-primary border border-primary/20"
                  >
                    {sk}
                  </span>
                ))}
              </div>
            </div>
          );
        }

        if (block.type === "experience") {
          return (
            <div key={block.id} className="pt-8 space-y-4">
              <div>
                <h2 className="text-lg font-bold tracking-tight text-foreground">{block.title}</h2>
                {block.subtitle && <p className="text-xs text-muted-foreground">{block.subtitle}</p>}
              </div>
              <div className="space-y-4">
                {(block.content?.experiences || []).map((exp: any, i: number) => (
                  <div key={i} className="border-l-2 border-primary/40 pl-4 space-y-1">
                    <div className="flex justify-between items-baseline flex-wrap gap-1">
                      <span className="text-sm font-bold text-foreground">{exp.role}</span>
                      <span className="text-xs text-muted-foreground font-mono">{exp.period}</span>
                    </div>
                    <p className="text-xs font-medium text-primary">{exp.company}</p>
                    <ul className="list-disc list-inside text-xs text-muted-foreground space-y-1 mt-1 leading-relaxed">
                      {(exp.bullets || []).map((b: string, bi: number) => (
                        <li key={bi}>{b}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          );
        }

        if (block.type === "projects") {
          return (
            <div key={block.id} className="pt-8 space-y-4">
              <div>
                <h2 className="text-lg font-bold tracking-tight text-foreground">{block.title}</h2>
                {block.subtitle && <p className="text-xs text-muted-foreground">{block.subtitle}</p>}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {(block.content?.items || []).map((proj: any, i: number) => (
                  <div key={i} className="p-4 rounded-xl border border-border/40 bg-card/40 space-y-2">
                    <h3 className="text-sm font-bold text-foreground">{proj.name}</h3>
                    <p className="text-xs text-muted-foreground line-clamp-3 leading-relaxed">{proj.desc}</p>
                    <div className="flex flex-wrap gap-1 pt-1">
                      {(proj.tags || []).map((tag: string, ti: number) => (
                        <span key={ti} className="text-[10px] px-2 py-0.5 rounded bg-muted text-muted-foreground">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        }

        if (block.type === "video_pitch") {
          return (
            <div key={block.id} className="pt-8 space-y-4">
              <div>
                <h2 className="text-lg font-bold tracking-tight text-foreground flex items-center gap-2">
                  <Video className="h-4 w-4 text-primary" />
                  {block.title}
                </h2>
                {block.subtitle && <p className="text-xs text-muted-foreground">{block.subtitle}</p>}
              </div>
              <div className="p-6 rounded-2xl border border-primary/20 bg-primary/5 flex flex-col sm:flex-row items-center gap-4">
                <div className="h-16 w-16 rounded-2xl bg-primary/20 flex items-center justify-center text-primary shrink-0">
                  <Video className="h-8 w-8" />
                </div>
                <div className="space-y-1 text-center sm:text-left flex-1 min-w-0">
                  <h4 className="text-sm font-bold text-foreground">
                    {block.content?.pitchTitle || "60-Second Video Elevator Pitch"}
                  </h4>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {block.content?.summary || "Watch my 60-second introduction highlighting key projects and delivery strengths."}
                  </p>
                </div>
              </div>
            </div>
          );
        }

        if (block.type === "web3_badges") {
          return (
            <div key={block.id} className="pt-8 space-y-4">
              <div>
                <h2 className="text-lg font-bold tracking-tight text-foreground flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-purple-500" />
                  {block.title}
                </h2>
                {block.subtitle && <p className="text-xs text-muted-foreground">{block.subtitle}</p>}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {(block.content?.badges || [
                  { name: "Verified Distributed Systems Engineer", issuer: "ResumeForge Protocol", date: "2026" },
                  { name: "EIP-712 Cryptographically Signed Assessment", issuer: "Career Authority", date: "2026" }
                ]).map((badge: any, i: number) => (
                  <div key={i} className="p-3.5 rounded-xl border border-purple-500/20 bg-purple-500/5 flex items-center gap-3">
                    <ShieldCheck className="h-5 w-5 text-purple-400 shrink-0" />
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-bold text-foreground truncate">{badge.name}</p>
                      <p className="text-[10px] text-muted-foreground">{badge.issuer} • {badge.date}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        }

        if (block.type === "contact") {
          return (
            <div key={block.id} className="pt-8 space-y-4">
              <div>
                <h2 className="text-lg font-bold tracking-tight text-foreground">{block.title}</h2>
                {block.subtitle && <p className="text-xs text-muted-foreground">{block.subtitle}</p>}
              </div>
              <div className="p-5 rounded-2xl border border-border/40 bg-card/40 flex flex-wrap gap-4 items-center">
                {block.content?.email && (
                  <a
                    href={`mailto:${block.content.email}`}
                    className="flex items-center gap-2 text-xs font-semibold text-primary hover:underline"
                  >
                    <Mail className="h-4 w-4" />
                    {block.content.email}
                  </a>
                )}
                {block.content?.location && (
                  <span className="flex items-center gap-2 text-xs text-muted-foreground">
                    <MapPin className="h-4 w-4" />
                    {block.content.location}
                  </span>
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
