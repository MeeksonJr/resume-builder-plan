"use client";

import React, { useState } from "react";
import {
  Layers,
  MoveUp,
  MoveDown,
  Trash2,
  Copy,
  Eye,
  Smartphone,
  Monitor,
  Plus,
  Sparkles,
  Save,
  Check,
  User,
  Briefcase,
  Code2,
  GraduationCap,
  FolderGit2,
  Video,
  ShieldCheck,
  Mail,
  Palette,
  LayoutGrid,
  ChevronRight,
  ExternalLink,
  GripVertical
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";

export interface CanvasBlock {
  id: string;
  type: "hero" | "experience" | "skills" | "projects" | "education" | "video_pitch" | "web3_badges" | "contact";
  title: string;
  subtitle?: string;
  visible: boolean;
  backgroundStyle: "clean" | "glass" | "gradient" | "mesh";
  content: Record<string, any>;
}

interface VisualPortfolioBuilderProps {
  portfolio: any;
  resumes: any[];
  projects: any[];
  profile: any;
  onSave?: (blocks: CanvasBlock[]) => void;
}

const DEFAULT_BLOCKS: CanvasBlock[] = [
  {
    id: "blk-hero-1",
    type: "hero",
    title: "Candidate Hero & Bio",
    visible: true,
    backgroundStyle: "gradient",
    content: {
      tagline: "Senior Fullstack Engineer & AI Architect",
      bio: "Crafting mission-critical distributed systems, high-concurrency web applications, and intuitive AI-native developer experiences.",
      openToWork: true,
    }
  },
  {
    id: "blk-skills-2",
    type: "skills",
    title: "Core Competencies & Tech Stack",
    subtitle: "Technologies leveraged in production environments",
    visible: true,
    backgroundStyle: "glass",
    content: {
      skills: ["TypeScript", "Next.js", "React", "Node.js", "PostgreSQL", "Tailwind CSS", "Docker", "AWS", "GraphQL", "Python", "Redis"]
    }
  },
  {
    id: "blk-exp-3",
    type: "experience",
    title: "Professional Work Experience",
    subtitle: "Track record of delivering scalable solutions",
    visible: true,
    backgroundStyle: "clean",
    content: {
      experiences: [
        {
          company: "Acme Cloud Technologies",
          role: "Lead Systems Architect",
          period: "2023 - Present",
          bullets: [
            "Architected low-latency microservices handling 40M+ requests daily with 99.99% uptime.",
            "Spearheaded migration to Next.js App Router and Edge Functions, reducing TTFB by 42%."
          ]
        },
        {
          company: "Nexus AI Labs",
          role: "Senior Fullstack Developer",
          period: "2021 - 2023",
          bullets: [
            "Engineered real-time collaborative workspace using WebSockets and conflict-free replicated data types.",
            "Integrated Gemini Live and LLM agent pipelines for automated code refactoring."
          ]
        }
      ]
    }
  },
  {
    id: "blk-projects-4",
    type: "projects",
    title: "Featured Engineering Projects",
    subtitle: "Open source initiatives & enterprise apps",
    visible: true,
    backgroundStyle: "mesh",
    content: {
      items: [
        {
          name: "ResumeForge AI Suite",
          desc: "Full-lifecycle career platform with live cursor pair-editing, ATS autopilot, and verifiable W3C credentials.",
          tags: ["Next.js", "TypeScript", "Tailwind", "Supabase"]
        },
        {
          name: "EdgeMesh Distributed Cache",
          desc: "High-performance consistent hashing cache ring running across edge Cloudflare Workers.",
          tags: ["Rust", "WASM", "WebSockets"]
        }
      ]
    }
  },
  {
    id: "blk-video-5",
    type: "video_pitch",
    title: "60-Second Video Elevator Pitch",
    subtitle: "High-impact introduction & communication showcase",
    visible: true,
    backgroundStyle: "glass",
    content: {
      duration: "60s",
      summary: "Overview of key engineering achievements and architectural philosophy."
    }
  },
  {
    id: "blk-web3-6",
    type: "web3_badges",
    title: "Verifiable On-Chain Credentials",
    subtitle: "Polygon EIP-155:137 cryptographically verified achievements",
    visible: true,
    backgroundStyle: "clean",
    content: {
      network: "Polygon POS",
      issuer: "Stanford University / AWS Certified"
    }
  },
  {
    id: "blk-contact-7",
    type: "contact",
    title: "Let's Connect & Collaborate",
    subtitle: "Available for staff engineering roles & high-impact contracts",
    visible: true,
    backgroundStyle: "gradient",
    content: {
      email: "d.mohamed1504@gmail.com",
      location: "San Francisco, CA / Remote"
    }
  }
];

export function VisualPortfolioBuilder({
  portfolio,
  resumes,
  projects,
  profile,
  onSave
}: VisualPortfolioBuilderProps) {
  const [blocks, setBlocks] = useState<CanvasBlock[]>(DEFAULT_BLOCKS);
  const [selectedBlockId, setSelectedBlockId] = useState<string>(DEFAULT_BLOCKS[0].id);
  const [deviceMode, setDeviceMode] = useState<"desktop" | "mobile">("desktop");
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<"components" | "resume_data">("components");

  const selectedBlock = blocks.find(b => b.id === selectedBlockId);

  const handleMoveBlock = (index: number, direction: "up" | "down") => {
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= blocks.length) return;

    const newBlocks = [...blocks];
    const [moved] = newBlocks.splice(index, 1);
    newBlocks.splice(targetIndex, 0, moved);
    setBlocks(newBlocks);
  };

  const handleToggleVisibility = (id: string) => {
    setBlocks(prev => prev.map(b => b.id === id ? { ...b, visible: !b.visible } : b));
  };

  const handleDeleteBlock = (id: string) => {
    if (blocks.length <= 1) {
      toast.error("Portfolio must retain at least one active block");
      return;
    }
    setBlocks(prev => prev.filter(b => b.id !== id));
    if (selectedBlockId === id) {
      setSelectedBlockId(blocks.find(b => b.id !== id)?.id || "");
    }
    toast.success("Section removed from canvas");
  };

  const handleAddBlock = (type: CanvasBlock["type"], title: string) => {
    const newBlock: CanvasBlock = {
      id: `blk-${type}-${Date.now()}`,
      type,
      title,
      visible: true,
      backgroundStyle: "glass",
      content: {}
    };
    setBlocks(prev => [...prev, newBlock]);
    setSelectedBlockId(newBlock.id);
    toast.success(`Added ${title} to canvas`);
  };

  const handleImportResumeSection = (resume: any, section: "experience" | "skills" | "projects") => {
    if (section === "skills") {
      const skillsList = resume.skills?.map((s: any) => typeof s === "string" ? s : s.name) || ["TypeScript", "Next.js", "React"];
      handleAddBlock("skills", `${resume.title || "Resume"} Skills`);
      setBlocks(prev => prev.map(b => b.id === prev[prev.length - 1]?.id ? { ...b, content: { skills: skillsList } } : b));
      toast.success(`Imported skills from "${resume.title}"`);
    } else if (section === "experience") {
      handleAddBlock("experience", `${resume.title || "Resume"} Experience`);
      toast.success(`Imported work timeline from "${resume.title}"`);
    }
  };

  const handleSaveCanvas = async () => {
    setIsSaving(true);
    try {
      if (portfolio?.id) {
        const supabase = createClient();
        await supabase
          .from("portfolios")
          .update({
            custom_blocks: blocks,
            updated_at: new Date().toISOString()
          })
          .eq("id", portfolio.id);
      }
      if (onSave) onSave(blocks);
      toast.success("Visual portfolio layout published successfully!");
    } catch {
      toast.error("Failed to save layout to cloud");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] rounded-2xl border border-border/80 bg-background overflow-hidden shadow-2xl">
      {/* Top Visual Editor Control Bar */}
      <header className="h-14 px-4 bg-muted/30 border-b border-border/70 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-md bg-violet-600 text-white shadow-xs">
              <Sparkles className="w-4 h-4" />
            </span>
            <span className="text-sm font-bold text-foreground">
              Visual Canvas Editor (Canva / Scratch Style)
            </span>
          </div>
          <Badge variant="outline" className="text-[10px] font-mono hidden sm:inline-flex">
            {blocks.filter(b => b.visible).length} Active Sections
          </Badge>
        </div>

        {/* Center: Device Viewport Switcher */}
        <div className="flex items-center gap-1 p-1 rounded-lg bg-black/20 border border-border/60">
          <button
            onClick={() => setDeviceMode("desktop")}
            className={`px-2.5 py-1 rounded text-xs font-semibold flex items-center gap-1.5 transition ${
              deviceMode === "desktop" ? "bg-primary text-primary-foreground shadow-xs" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Monitor className="w-3.5 h-3.5" /> Desktop
          </button>
          <button
            onClick={() => setDeviceMode("mobile")}
            className={`px-2.5 py-1 rounded text-xs font-semibold flex items-center gap-1.5 transition ${
              deviceMode === "mobile" ? "bg-primary text-primary-foreground shadow-xs" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" /> Mobile
          </button>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2">
          {portfolio?.slug && (
            <Button size="sm" variant="ghost" asChild className="h-8 text-xs text-muted-foreground hover:text-foreground">
              <a href={`/p/${portfolio.slug}`} target="_blank" rel="noopener noreferrer">
                <Eye className="w-3.5 h-3.5 mr-1.5" /> Preview Live <ExternalLink className="w-2.5 h-2.5 ml-1 opacity-60" />
              </a>
            </Button>
          )}
          <Button
            size="sm"
            onClick={handleSaveCanvas}
            disabled={isSaving}
            className="h-8 text-xs bg-emerald-600 hover:bg-emerald-500 text-white font-semibold shadow-xs"
          >
            <Save className="w-3.5 h-3.5 mr-1.5" />
            {isSaving ? "Publishing..." : "Publish Layout"}
          </Button>
        </div>
      </header>

      {/* Main Studio 3-Pane Layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Pane: Scratch / Canva Component & Resume Asset Palette */}
        <aside className="w-72 sm:w-80 border-r border-border/70 bg-card/40 flex flex-col shrink-0">
          <div className="p-3 border-b border-border/60 flex items-center gap-2">
            <button
              onClick={() => setActiveTab("components")}
              className={`flex-1 py-1.5 text-xs font-bold rounded-md transition ${
                activeTab === "components" ? "bg-muted text-foreground" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Ready Blocks
            </button>
            <button
              onClick={() => setActiveTab("resume_data")}
              className={`flex-1 py-1.5 text-xs font-bold rounded-md transition ${
                activeTab === "resume_data" ? "bg-muted text-foreground" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              From Resumes ({resumes.length})
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-3 space-y-2">
            {activeTab === "components" ? (
              <>
                <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider px-1">
                  Drag / Click to Add
                </p>
                {[
                  { type: "hero", label: "Hero & Bio Intro", icon: User, desc: "Photo, titles, and call to action" },
                  { type: "experience", label: "Work Timeline", icon: Briefcase, desc: "Company roles and STAR bullet achievements" },
                  { type: "skills", label: "Skills Cloud", icon: Code2, desc: "Interactive categorized skill chips" },
                  { type: "projects", label: "Project Showcase", icon: FolderGit2, desc: "Grid cards with live GitHub & demo links" },
                  { type: "video_pitch", label: "Video Pitch Player", icon: Video, desc: "60-second video elevator pitch with AI transcripts" },
                  { type: "web3_badges", label: "Web3 Credentials", icon: ShieldCheck, desc: "Polygon-anchored cryptographic verified proofs" },
                  { type: "education", label: "Education & Degrees", icon: GraduationCap, desc: "University, GPA, and Canvas verified courses" },
                  { type: "contact", label: "Contact & Reach-Out", icon: Mail, desc: "Direct email contact form & social channels" },
                ].map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.type}
                      onClick={() => handleAddBlock(item.type as any, item.label)}
                      className="w-full p-2.5 rounded-xl border border-border/60 bg-card hover:bg-muted/50 hover:border-primary/40 text-left transition flex items-center justify-between group shadow-2xs"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="p-2 rounded-lg bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition">
                          <Icon className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-foreground truncate">{item.label}</p>
                          <p className="text-[10px] text-muted-foreground truncate">{item.desc}</p>
                        </div>
                      </div>
                      <Plus className="w-4 h-4 text-muted-foreground group-hover:text-primary shrink-0 ml-1" />
                    </button>
                  );
                })}
              </>
            ) : (
              <>
                <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider px-1">
                  Active Resume Assets
                </p>
                {resumes.length === 0 ? (
                  <div className="p-4 text-center text-xs text-muted-foreground">
                    No resumes found to import from.
                  </div>
                ) : (
                  resumes.map((r) => (
                    <div key={r.id} className="p-3 rounded-xl border border-border/60 bg-card space-y-2 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-foreground truncate">{r.title}</span>
                        <span className="text-[10px] text-muted-foreground font-mono">
                          {r.skills?.length || 0} skills
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-1.5 pt-1">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleImportResumeSection(r, "skills")}
                          className="h-7 text-[10px] gap-1"
                        >
                          <Plus className="w-3 h-3" /> Drop Skills
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleImportResumeSection(r, "experience")}
                          className="h-7 text-[10px] gap-1"
                        >
                          <Plus className="w-3 h-3" /> Drop Exp
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </>
            )}
          </div>
        </aside>

        {/* Center: Interactive Live Visual Canvas */}
        <main className="flex-1 bg-muted/10 overflow-y-auto p-4 sm:p-6 flex justify-center">
          <div className={`transition-all duration-300 w-full ${
            deviceMode === "mobile" 
              ? "max-w-[400px] bg-background border border-border/80 rounded-3xl p-4 shadow-2xl my-4 min-h-[600px]" 
              : "max-w-4xl space-y-4"
          }`}>
            {blocks.map((block, index) => {
              const isSelected = selectedBlockId === block.id;

              return (
                <div
                  key={block.id}
                  onClick={() => setSelectedBlockId(block.id)}
                  className={`relative p-5 rounded-2xl border transition-all cursor-pointer ${
                    !block.visible ? "opacity-40" : ""
                  } ${
                    isSelected 
                      ? "ring-2 ring-violet-500 border-violet-500/50 bg-card shadow-lg" 
                      : "border-border/60 bg-card/70 hover:border-border"
                  }`}
                >
                  {/* Block Header & Reordering Actions */}
                  <div className="flex items-center justify-between gap-2 mb-3 pb-2 border-b border-border/40">
                    <div className="flex items-center gap-2">
                      <GripVertical className="w-4 h-4 text-muted-foreground cursor-grab" />
                      <Badge variant="outline" className="text-[10px] uppercase font-mono">
                        {block.type}
                      </Badge>
                      <h4 className="text-sm font-bold text-foreground truncate">{block.title}</h4>
                    </div>

                    <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => handleMoveBlock(index, "up")}
                        disabled={index === 0}
                        className="p-1 rounded text-muted-foreground hover:text-foreground disabled:opacity-30"
                        title="Move Up"
                      >
                        <MoveUp className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleMoveBlock(index, "down")}
                        disabled={index === blocks.length - 1}
                        className="p-1 rounded text-muted-foreground hover:text-foreground disabled:opacity-30"
                        title="Move Down"
                      >
                        <MoveDown className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleToggleVisibility(block.id)}
                        className={`p-1 rounded ${block.visible ? "text-muted-foreground hover:text-foreground" : "text-amber-500"}`}
                        title={block.visible ? "Hide section" : "Show section"}
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteBlock(block.id)}
                        className="p-1 rounded text-muted-foreground hover:text-red-400"
                        title="Delete section"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Block Preview Representation */}
                  <div className="space-y-2">
                    {block.type === "hero" && (
                      <div className="space-y-2 text-left">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-full bg-violet-600/20 border border-violet-500/30 flex items-center justify-center font-bold text-violet-400 text-lg">
                            {(portfolio?.full_name || profile?.full_name || "M").charAt(0)}
                          </div>
                          <div>
                            <h3 className="text-base font-black text-foreground">
                              {portfolio?.full_name || profile?.full_name || "Mohamed Lamine Datt"}
                            </h3>
                            <p className="text-xs text-muted-foreground">
                              {block.content.tagline || "Senior Fullstack Engineer & AI Solutions Architect"}
                            </p>
                          </div>
                        </div>
                        <p className="text-xs text-muted-foreground/80 leading-relaxed pt-1">
                          {block.content.bio || portfolio?.bio || "Crafting high-performance distributed systems."}
                        </p>
                      </div>
                    )}

                    {block.type === "skills" && (
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {(block.content.skills || ["TypeScript", "Next.js", "React", "PostgreSQL", "Tailwind"]).map((s: string, i: number) => (
                          <Badge key={i} variant="secondary" className="text-[10px] font-semibold">
                            {s}
                          </Badge>
                        ))}
                      </div>
                    )}

                    {block.type === "experience" && (
                      <div className="space-y-2 text-xs text-left pt-1">
                        {(block.content.experiences || []).slice(0, 2).map((exp: any, idx: number) => (
                          <div key={idx} className="p-2.5 rounded-lg bg-black/20 border border-white/5 space-y-1">
                            <div className="flex justify-between font-bold text-foreground">
                              <span>{exp.role}</span>
                              <span className="text-[10px] text-muted-foreground font-normal">{exp.period}</span>
                            </div>
                            <p className="text-[11px] text-primary">{exp.company}</p>
                          </div>
                        ))}
                      </div>
                    )}

                    {block.type === "projects" && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-left pt-1">
                        {(block.content.items || []).slice(0, 2).map((proj: any, idx: number) => (
                          <div key={idx} className="p-2.5 rounded-lg bg-black/20 border border-white/5 space-y-1">
                            <span className="font-bold text-foreground block truncate">{proj.name}</span>
                            <p className="text-[10px] text-muted-foreground line-clamp-2">{proj.desc}</p>
                          </div>
                        ))}
                      </div>
                    )}

                    {block.type === "video_pitch" && (
                      <div className="p-3 rounded-lg bg-black/40 border border-violet-500/20 flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <Video className="w-4 h-4 text-violet-400" />
                          <span>60s Video Elevator Pitch Player</span>
                        </div>
                        <Badge className="bg-violet-500/20 text-violet-300 text-[10px]">Ready</Badge>
                      </div>
                    )}

                    {block.type === "web3_badges" && (
                      <div className="p-3 rounded-lg bg-black/40 border border-emerald-500/20 flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <ShieldCheck className="w-4 h-4 text-emerald-400" />
                          <span>W3C Polygon Cryptographic Proof</span>
                        </div>
                        <Badge className="bg-emerald-500/20 text-emerald-300 text-[10px]">Verified</Badge>
                      </div>
                    )}

                    {block.type === "contact" && (
                      <div className="p-3 rounded-lg bg-black/40 border border-white/5 flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <Mail className="w-4 h-4 text-blue-400" />
                          <span>Direct Messaging & In-App Contact Gateway</span>
                        </div>
                        <span className="text-[11px] text-muted-foreground">{block.content.email || "Active"}</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </main>

        {/* Right Pane: Block Inspector & Settings */}
        {selectedBlock && (
          <aside className="w-72 border-l border-border/70 bg-card/40 p-4 space-y-4 shrink-0 overflow-y-auto hidden lg:block">
            <div className="flex items-center justify-between border-b border-border/60 pb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Block Inspector
              </span>
              <Badge variant="outline" className="text-[10px] uppercase font-mono">
                {selectedBlock.type}
              </Badge>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-[11px] font-medium text-muted-foreground block mb-1">
                  Section Title
                </label>
                <Input
                  value={selectedBlock.title}
                  onChange={(e) => {
                    const val = e.target.value;
                    setBlocks(prev => prev.map(b => b.id === selectedBlock.id ? { ...b, title: val } : b));
                  }}
                  className="h-8 text-xs bg-black/30"
                />
              </div>

              <div>
                <label className="text-[11px] font-medium text-muted-foreground block mb-1">
                  Background Visual Style
                </label>
                <div className="grid grid-cols-2 gap-1.5 text-xs">
                  {(["clean", "glass", "gradient", "mesh"] as const).map((st) => (
                    <button
                      key={st}
                      onClick={() => {
                        setBlocks(prev => prev.map(b => b.id === selectedBlock.id ? { ...b, backgroundStyle: st } : b));
                      }}
                      className={`p-1.5 rounded-md border text-[11px] font-medium capitalize transition ${
                        selectedBlock.backgroundStyle === st
                          ? "bg-primary text-primary-foreground border-primary"
                          : "bg-muted/40 border-border/60 text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-2 border-t border-border/50">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleToggleVisibility(selectedBlock.id)}
                  className="w-full h-8 text-xs justify-start gap-2"
                >
                  <Eye className="w-3.5 h-3.5" />
                  {selectedBlock.visible ? "Hide from Live Portfolio" : "Show on Live Portfolio"}
                </Button>
              </div>
            </div>
          </aside>
        )}
      </div>
    </div>
  );
}
