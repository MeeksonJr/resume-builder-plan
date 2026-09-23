"use client";

import React, { useState, useRef } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Eye,
  Smartphone,
  Tablet,
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
  GripVertical,
  MoveUp,
  MoveDown,
  Trash2,
  UploadCloud,
  Image as ImageIcon,
  Share2,
  Copy,
  Sliders,
  Maximize2,
  PanelLeft,
  PanelLeftClose,
  PanelRight,
  PanelRightClose,
  ZoomIn,
  ZoomOut,
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
  imageUrl?: string;
  content: Record<string, any>;
}

interface VisualPortfolioBuilderStudioClientProps {
  initialPortfolio: any;
  resumes: any[];
  projects: any[];
  profile: any;
}

export const DEFAULT_BLOCKS: CanvasBlock[] = [
  {
    id: "blk-hero-1",
    type: "hero",
    title: "Candidate Hero & Bio",
    visible: true,
    backgroundStyle: "gradient",
    content: {
      tagline: "Senior Fullstack Engineer & AI Systems Architect",
      bio: "Crafting mission-critical distributed systems, high-concurrency web applications, and intuitive AI-native developer experiences.",
      openToWork: true,
      avatarUrl: "",
      coverUrl: "",
    }
  },
  {
    id: "blk-skills-2",
    type: "skills",
    title: "Core Competencies & Tech Stack",
    subtitle: "Technologies leveraged across high-scale production systems",
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
          tags: ["Next.js", "TypeScript", "Tailwind", "Supabase"],
          screenshotUrl: ""
        },
        {
          name: "EdgeMesh Distributed Cache",
          desc: "High-performance consistent hashing cache ring running across edge Cloudflare Workers.",
          tags: ["Rust", "WASM", "WebSockets"],
          screenshotUrl: ""
        }
      ]
    }
  },
  {
    id: "blk-contact-5",
    type: "contact",
    title: "Let's Connect & Collaborate",
    subtitle: "Available for staff engineering roles & high-impact contracts",
    visible: true,
    backgroundStyle: "gradient",
    content: {
      email: "engineer@resumeforge.io",
      location: "San Francisco, CA / Remote"
    }
  }
];

export function VisualPortfolioBuilderStudioClient({
  initialPortfolio,
  resumes,
  projects,
  profile
}: VisualPortfolioBuilderStudioClientProps) {
  const [portfolio, setPortfolio] = useState<any>(initialPortfolio);
  const [blocks, setBlocks] = useState<CanvasBlock[]>(() => {
    if (initialPortfolio?.custom_blocks && Array.isArray(initialPortfolio.custom_blocks) && initialPortfolio.custom_blocks.length > 0) {
      return initialPortfolio.custom_blocks;
    }
    return DEFAULT_BLOCKS;
  });
  const [selectedBlockId, setSelectedBlockId] = useState<string>(() => blocks[0]?.id || "blk-hero-1");
  const [deviceMode, setDeviceMode] = useState<"desktop" | "tablet" | "mobile">("desktop");
  const [isSaving, setIsSaving] = useState(false);
  const [activeLeftTab, setActiveLeftTab] = useState<"blocks" | "resume" | "media">("blocks");
  const [showShareModal, setShowShareModal] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [isLeftOpen, setIsLeftOpen] = useState(true);
  const [isRightOpen, setIsRightOpen] = useState(true);
  const [zoomScale, setZoomScale] = useState<"100%" | "fit" | "85%">("100%");
  const [isActiveLayout, setIsActiveLayout] = useState<boolean>(() => {
    if (portfolio?.active_layout) {
      return portfolio.active_layout === "canvas";
    }
    if (portfolio?.theme_settings?.active_layout) {
      return portfolio.theme_settings.active_layout === "canvas";
    }
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("resumeforge_portfolio_active_layout");
      if (saved) return saved === "canvas";
    }
    return true;
  });
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadTarget, setUploadTarget] = useState<"avatar" | "cover" | "block_image">("avatar");

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
      toast.error("Portfolio must retain at least one block");
      return;
    }
    setBlocks(prev => prev.filter(b => b.id !== id));
    if (selectedBlockId === id) {
      setSelectedBlockId(blocks.find(b => b.id !== id)?.id || "");
    }
    toast.success("Section removed");
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

  const handleToggleActiveLayout = async () => {
    const nextVal = !isActiveLayout;
    setIsActiveLayout(nextVal);
    if (typeof window !== "undefined") {
      localStorage.setItem("resumeforge_portfolio_active_layout", nextVal ? "canvas" : "template");
    }
    try {
      const supabase = createClient();
      if (portfolio?.id) {
        await supabase
          .from("portfolios")
          .update({
            active_layout: nextVal ? "canvas" : "template",
            theme_settings: {
              ...(portfolio?.theme_settings || {}),
              active_layout: nextVal ? "canvas" : "template",
            },
            updated_at: new Date().toISOString(),
          })
          .eq("id", portfolio.id);
      }
      toast.success(nextVal ? "Canvas Layout set as ACTIVE for public portfolio preview!" : "Standard Template set as active.");
    } catch (e) {
      console.error(e);
    }
  };

  const handleSaveCanvas = async () => {
    setIsSaving(true);
    try {
      const supabase = createClient();
      if (portfolio?.id) {
        const { error } = await supabase
          .from("portfolios")
          .update({
            custom_blocks: blocks,
            active_layout: isActiveLayout ? "canvas" : "template",
            theme_settings: {
              ...(portfolio?.theme_settings || {}),
              active_layout: isActiveLayout ? "canvas" : "template",
            },
            updated_at: new Date().toISOString()
          })
          .eq("id", portfolio.id);
        if (error) throw error;
      }
      if (typeof window !== "undefined") {
        localStorage.setItem("resumeforge_portfolio_active_layout", isActiveLayout ? "canvas" : "template");
      }
      toast.success("Portfolio canvas saved & updated live!");
    } catch (err: any) {
      console.error("Save canvas error:", err);
      toast.error(err.message || "Failed to save portfolio canvas");
    } finally {
      setIsSaving(false);
    }
  };

  const triggerFileUpload = (target: "avatar" | "cover" | "block_image") => {
    setUploadTarget(target);
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file (PNG, JPG, WebP, SVG)");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image file size must be less than 5MB");
      return;
    }

    setIsUploadingImage(true);
    try {
      const supabase = createClient();
      let publicImageUrl = "";

      // Try uploading to Supabase Storage "avatars" or "portfolio-assets"
      const fileExt = file.name.split(".").pop() || "png";
      const fileName = `portfolio-${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${fileExt}`;
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(fileName, file, { cacheControl: "3600", upsert: true });

      if (!uploadError && uploadData) {
        const { data: { publicUrl } } = supabase.storage.from("avatars").getPublicUrl(fileName);
        publicImageUrl = publicUrl;
      } else {
        // Fallback to client base64 Data URL for zero-friction local/offline support
        publicImageUrl = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });
      }

      // Apply image according to uploadTarget
      if (uploadTarget === "avatar") {
        setBlocks(prev => prev.map(b => {
          if (b.type === "hero") {
            return {
              ...b,
              content: { ...b.content, avatarUrl: publicImageUrl }
            };
          }
          return b;
        }));
        toast.success("Profile avatar uploaded!");
      } else if (uploadTarget === "cover") {
        setBlocks(prev => prev.map(b => {
          if (b.type === "hero") {
            return {
              ...b,
              content: { ...b.content, coverUrl: publicImageUrl }
            };
          }
          return b;
        }));
        toast.success("Hero cover background uploaded!");
      } else if (uploadTarget === "block_image" && selectedBlockId) {
        setBlocks(prev => prev.map(b => {
          if (b.id === selectedBlockId) {
            return {
              ...b,
              imageUrl: publicImageUrl
            };
          }
          return b;
        }));
        toast.success("Block asset updated!");
      }
    } catch (err: any) {
      console.error("Image upload failed:", err);
      toast.error(err.message || "Image upload failed");
    } finally {
      setIsUploadingImage(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const publicPortfolioUrl = typeof window !== "undefined"
    ? `${window.location.origin}/p/${portfolio?.slug || "me"}`
    : `/p/${portfolio?.slug || "me"}`;

  return (
    <div className="flex flex-col h-screen w-full max-w-full bg-[#090e17] text-white overflow-hidden select-none">
      {/* Hidden file input for drag/drop and picker uploads */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        className="hidden"
      />

      {/* Top Header Bar */}
      <header className="h-16 px-4 lg:px-6 border-b border-white/10 bg-[#0d1524] flex items-center justify-between shrink-0 z-30 gap-3">
        <div className="flex items-center gap-3">
          <Button asChild variant="ghost" size="sm" className="text-white/70 hover:text-white hover:bg-white/10 gap-2 font-medium">
            <Link href="/dashboard/portfolio">
              <ArrowLeft className="h-4 w-4" />
              <span className="hidden sm:inline">Exit Studio</span>
            </Link>
          </Button>

          {/* Left Sidebar Toggle Button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsLeftOpen(!isLeftOpen)}
            className={`h-8 px-2.5 text-xs font-semibold gap-1.5 border transition-all ${
              isLeftOpen
                ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/20"
                : "border-white/15 bg-white/5 text-white/70 hover:text-white hover:bg-white/10"
            }`}
            title={isLeftOpen ? "Collapse Blocks Sidebar" : "Expand Blocks Sidebar"}
          >
            {isLeftOpen ? <PanelLeftClose className="h-3.5 w-3.5" /> : <PanelLeft className="h-3.5 w-3.5" />}
            <span className="hidden md:inline">{isLeftOpen ? "Hide Blocks" : "Show Blocks"}</span>
          </Button>

          <div className="h-4 w-[1px] bg-white/10 hidden sm:block" />
          <div className="hidden lg:flex items-center gap-2.5">
            <div className="h-7 w-7 rounded-lg bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Sparkles className="h-3.5 w-3.5" />
            </div>
            <div>
              <h1 className="text-xs font-bold tracking-tight text-white flex items-center gap-2">
                Visual Canvas Studio
                {isActiveLayout ? (
                  <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/30 text-[9px] font-mono">
                    LIVE ACTIVE
                  </Badge>
                ) : (
                  <Badge className="bg-white/10 text-white/50 border-white/15 text-[9px] font-mono">
                    DRAFT
                  </Badge>
                )}
              </h1>
            </div>
          </div>
        </div>

        {/* Center: Device Viewport Switcher & Fit controls */}
        <div className="flex items-center bg-black/40 border border-white/10 rounded-xl p-1 gap-1">
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setDeviceMode("desktop")}
            className={`h-7 px-2.5 rounded-lg text-xs font-semibold gap-1.5 transition-all ${
              deviceMode === "desktop"
                ? "bg-white/15 text-white shadow-sm"
                : "text-white/50 hover:text-white hover:bg-white/5"
            }`}
          >
            <Monitor className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Desktop</span>
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setDeviceMode("tablet")}
            className={`h-7 px-2.5 rounded-lg text-xs font-semibold gap-1.5 transition-all ${
              deviceMode === "tablet"
                ? "bg-white/15 text-white shadow-sm"
                : "text-white/50 hover:text-white hover:bg-white/5"
            }`}
          >
            <Tablet className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Tablet</span>
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setDeviceMode("mobile")}
            className={`h-7 px-2.5 rounded-lg text-xs font-semibold gap-1.5 transition-all ${
              deviceMode === "mobile"
                ? "bg-white/15 text-white shadow-sm"
                : "text-white/50 hover:text-white hover:bg-white/5"
            }`}
          >
            <Smartphone className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Mobile</span>
          </Button>

          <div className="h-3.5 w-[1px] bg-white/10 mx-0.5" />

          <Button
            size="sm"
            variant="ghost"
            onClick={() => setZoomScale(prev => prev === "100%" ? "fit" : prev === "fit" ? "85%" : "100%")}
            className="h-7 px-2 rounded-lg text-xs font-semibold gap-1 text-white/70 hover:text-white hover:bg-white/10"
            title="Zoom scale / Fit screen"
          >
            <Maximize2 className="h-3 w-3 text-emerald-400" />
            <span className="text-[10px] font-mono">{zoomScale}</span>
          </Button>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2">
          {/* Right Inspector Toggle */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsRightOpen(!isRightOpen)}
            className={`h-8 px-2.5 text-xs font-semibold gap-1.5 border transition-all ${
              isRightOpen
                ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/20"
                : "border-white/15 bg-white/5 text-white/70 hover:text-white hover:bg-white/10"
            }`}
            title={isRightOpen ? "Collapse Inspector Sidebar" : "Expand Inspector Sidebar"}
          >
            {isRightOpen ? <PanelRightClose className="h-3.5 w-3.5" /> : <PanelRight className="h-3.5 w-3.5" />}
            <span className="hidden md:inline">{isRightOpen ? "Hide Inspector" : "Inspector"}</span>
          </Button>

          {/* Active Layout Switch */}
          <Button
            size="sm"
            onClick={handleToggleActiveLayout}
            className={`h-8 px-2.5 text-xs font-bold gap-1.5 transition-all border ${
              isActiveLayout
                ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40 hover:bg-emerald-500/30"
                : "bg-white/5 text-white/60 border-white/15 hover:bg-white/10"
            }`}
            title="Toggle whether this canvas layout or built-in templates are displayed on your public /p/ URL"
          >
            <Check className={`h-3.5 w-3.5 ${isActiveLayout ? "text-emerald-400" : "opacity-40"}`} />
            <span className="hidden sm:inline">{isActiveLayout ? "Active on /p/" : "Make Active"}</span>
          </Button>

          <Button
            variant="outline"
            size="sm"
            asChild
            className="border-white/15 bg-white/5 hover:bg-white/10 text-white gap-1.5 font-medium text-xs h-8 px-2.5 hidden sm:flex"
          >
            <a href={`/p/${portfolio?.slug || "preview"}`} target="_blank" rel="noreferrer">
              <Eye className="h-3.5 w-3.5 text-emerald-400" />
              <span>Preview</span>
            </a>
          </Button>

          <Button
            size="sm"
            onClick={handleSaveCanvas}
            disabled={isSaving}
            className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold gap-1.5 text-xs h-8 px-3 shadow-lg shadow-emerald-950/40"
          >
            <Save className="h-3.5 w-3.5" />
            <span>{isSaving ? "Saving..." : "Save"}</span>
          </Button>
        </div>
      </header>

      {/* Main Studio Body: 3-column Canvas workspace */}
      <div className="flex-1 flex overflow-hidden w-full max-w-full relative">
        {/* Left Column: Blocks Palette & Importer */}
        {isLeftOpen && (
          <aside className="w-72 xl:w-80 border-r border-white/10 bg-[#0c121e] flex flex-col shrink-0 z-20">
          <div className="p-3 border-b border-white/10 flex items-center gap-1.5 bg-black/20">
            <button
              onClick={() => setActiveLeftTab("blocks")}
              className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-semibold transition-all ${
                activeLeftTab === "blocks" ? "bg-white/15 text-white" : "text-white/50 hover:text-white"
              }`}
            >
              Blocks ({blocks.length})
            </button>
            <button
              onClick={() => setActiveLeftTab("resume")}
              className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-semibold transition-all ${
                activeLeftTab === "resume" ? "bg-white/15 text-white" : "text-white/50 hover:text-white"
              }`}
            >
              Import Data
            </button>
            <button
              onClick={() => setActiveLeftTab("media")}
              className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-semibold transition-all ${
                activeLeftTab === "media" ? "bg-white/15 text-white" : "text-white/50 hover:text-white"
              }`}
            >
              Assets
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {activeLeftTab === "blocks" && (
              <>
                <div className="space-y-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-white/40 px-1">
                    Canvas Sections
                  </span>
                  <div className="space-y-1.5">
                    {blocks.map((b, idx) => (
                      <div
                        key={b.id}
                        onClick={() => setSelectedBlockId(b.id)}
                        className={`group flex items-center justify-between p-2.5 rounded-xl border transition-all cursor-pointer ${
                          selectedBlockId === b.id
                            ? "bg-emerald-500/10 border-emerald-500/40 text-white shadow-sm"
                            : "bg-white/[0.03] border-white/5 text-white/70 hover:bg-white/[0.06] hover:text-white"
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <GripVertical className="h-4 w-4 text-white/30 shrink-0" />
                          <div className="truncate">
                            <p className="text-xs font-semibold truncate">{b.title}</p>
                            <span className="text-[10px] text-white/40 uppercase font-mono">{b.type}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-1 shrink-0 opacity-80 group-hover:opacity-100">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleMoveBlock(idx, "up");
                            }}
                            disabled={idx === 0}
                            className="p-1 hover:bg-white/10 rounded disabled:opacity-30 text-white/60 hover:text-white"
                          >
                            <MoveUp className="h-3 w-3" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleMoveBlock(idx, "down");
                            }}
                            disabled={idx === blocks.length - 1}
                            className="p-1 hover:bg-white/10 rounded disabled:opacity-30 text-white/60 hover:text-white"
                          >
                            <MoveDown className="h-3 w-3" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteBlock(b.id);
                            }}
                            className="p-1 hover:bg-rose-500/20 text-white/40 hover:text-rose-400 rounded"
                          >
                            <Trash2 className="h-3 w-3" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-2 space-y-2 border-t border-white/10">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-white/40 px-1">
                    Add New Block
                  </span>
                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleAddBlock("skills", "Technical Skills")}
                      className="border-white/10 bg-white/[0.02] hover:bg-white/10 text-white/80 hover:text-white text-xs h-10 justify-start gap-2"
                    >
                      <Code2 className="h-3.5 w-3.5 text-cyan-400" />
                      Skills Cloud
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleAddBlock("projects", "Project Showcase")}
                      className="border-white/10 bg-white/[0.02] hover:bg-white/10 text-white/80 hover:text-white text-xs h-10 justify-start gap-2"
                    >
                      <FolderGit2 className="h-3.5 w-3.5 text-amber-400" />
                      Projects
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleAddBlock("experience", "Work Timeline")}
                      className="border-white/10 bg-white/[0.02] hover:bg-white/10 text-white/80 hover:text-white text-xs h-10 justify-start gap-2"
                    >
                      <Briefcase className="h-3.5 w-3.5 text-emerald-400" />
                      Experience
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleAddBlock("video_pitch", "Video Elevator Pitch")}
                      className="border-white/10 bg-white/[0.02] hover:bg-white/10 text-white/80 hover:text-white text-xs h-10 justify-start gap-2"
                    >
                      <Video className="h-3.5 w-3.5 text-rose-400" />
                      Video Pitch
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleAddBlock("web3_badges", "Verified Badges")}
                      className="border-white/10 bg-white/[0.02] hover:bg-white/10 text-white/80 hover:text-white text-xs h-10 justify-start gap-2"
                    >
                      <ShieldCheck className="h-3.5 w-3.5 text-purple-400" />
                      Credentials
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleAddBlock("contact", "Contact Section")}
                      className="border-white/10 bg-white/[0.02] hover:bg-white/10 text-white/80 hover:text-white text-xs h-10 justify-start gap-2"
                    >
                      <Mail className="h-3.5 w-3.5 text-indigo-400" />
                      Contact
                    </Button>
                  </div>
                </div>
              </>
            )}

            {activeLeftTab === "resume" && (
              <div className="space-y-3">
                <p className="text-xs text-white/60">
                  Drop in pre-parsed content directly from your verified resumes.
                </p>
                {resumes.map(r => (
                  <div key={r.id} className="p-3 rounded-xl border border-white/10 bg-white/[0.02] space-y-2">
                    <p className="text-xs font-bold text-white truncate">{r.title}</p>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => {
                          handleAddBlock("skills", `${r.title} Skills`);
                          toast.success(`Imported skills from ${r.title}`);
                        }}
                        className="text-[11px] h-7 bg-white/10 text-white hover:bg-white/20"
                      >
                        + Skills
                      </Button>
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => {
                          handleAddBlock("experience", `${r.title} Experience`);
                          toast.success(`Imported timeline from ${r.title}`);
                        }}
                        className="text-[11px] h-7 bg-white/10 text-white hover:bg-white/20"
                      >
                        + Experience
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeLeftTab === "media" && (
              <div className="space-y-4">
                <div className="p-4 rounded-xl border border-dashed border-white/20 bg-white/[0.02] text-center space-y-3">
                  <div className="h-10 w-10 mx-auto rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                    <ImageIcon className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-white">Upload Media Assets</p>
                    <p className="text-[11px] text-white/50">Avatars, background headers, and project screenshots</p>
                  </div>
                  <div className="flex flex-col gap-2 pt-1">
                    <Button
                      size="sm"
                      onClick={() => triggerFileUpload("avatar")}
                      className="text-xs h-8 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold"
                    >
                      <User className="h-3.5 w-3.5 mr-1.5" />
                      Upload Avatar Photo
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => triggerFileUpload("cover")}
                      className="text-xs h-8 border-white/15 bg-white/5 hover:bg-white/10 text-white"
                    >
                      <UploadCloud className="h-3.5 w-3.5 mr-1.5 text-sky-400" />
                      Upload Cover Banner
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => triggerFileUpload("block_image")}
                      className="text-xs h-8 border-white/15 bg-white/5 hover:bg-white/10 text-white"
                    >
                      <ImageIcon className="h-3.5 w-3.5 mr-1.5 text-amber-400" />
                      Attach to Current Block
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </aside>
      )}

      {!isLeftOpen && (
        <button
          onClick={() => setIsLeftOpen(true)}
          className="absolute left-3 top-4 z-30 p-2 rounded-xl bg-[#0d1524] border border-white/20 text-emerald-400 hover:bg-white/15 shadow-xl transition-all"
          title="Open Blocks Sidebar"
        >
          <PanelLeft className="h-4 w-4" />
        </button>
      )}

      {/* Center Canvas Viewport */}
      <main className="flex-1 min-w-0 bg-[#070b12] flex items-center justify-center p-4 lg:p-6 overflow-y-auto overflow-x-hidden relative">
        <div
          className={`transition-all duration-300 rounded-2xl border border-white/15 shadow-2xl bg-[#0d1422] flex flex-col overflow-hidden my-auto ${
            deviceMode === "desktop"
              ? zoomScale === "fit"
                ? "w-full max-w-2xl min-h-[550px] scale-95 origin-top"
                : zoomScale === "85%"
                ? "w-full max-w-3xl min-h-[550px] scale-90 origin-top"
                : "w-full max-w-3xl xl:max-w-4xl min-h-[600px]"
              : deviceMode === "tablet"
              ? "w-[768px] max-w-full min-h-[600px]"
              : "w-[375px] max-w-full min-h-[600px]"
          }`}
        >
            {/* Canvas Inner Document */}
            <div className="p-8 space-y-8 divide-y divide-white/10">
              {blocks.map((block) => {
                const isSelected = selectedBlockId === block.id;

                if (block.type === "hero") {
                  return (
                    <div
                      key={block.id}
                      onClick={() => setSelectedBlockId(block.id)}
                      className={`relative p-8 rounded-2xl transition-all cursor-pointer border ${
                        isSelected ? "border-emerald-500 ring-2 ring-emerald-500/20 bg-emerald-950/10" : "border-white/5 bg-white/[0.02]"
                      }`}
                    >
                      {block.content?.coverUrl && (
                        <div
                          className="h-32 -mx-8 -mt-8 mb-6 rounded-t-2xl bg-cover bg-center border-b border-white/10"
                          style={{ backgroundImage: `url(${block.content.coverUrl})` }}
                        />
                      )}
                      <div className="flex items-center gap-5">
                        <div className="relative">
                          {block.content?.avatarUrl ? (
                            <img
                              src={block.content.avatarUrl}
                              alt="Profile"
                              className="h-20 w-20 rounded-full object-cover border-2 border-emerald-400 shadow-md"
                            />
                          ) : (
                            <div className="h-20 w-20 rounded-full bg-emerald-500/20 border-2 border-emerald-400/40 flex items-center justify-center text-emerald-400 text-xl font-bold">
                              {profile?.full_name?.charAt(0) || "U"}
                            </div>
                          )}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              triggerFileUpload("avatar");
                            }}
                            className="absolute -bottom-1 -right-1 p-1.5 rounded-full bg-emerald-600 text-white hover:bg-emerald-500 shadow"
                            title="Upload Avatar"
                          >
                            <UploadCloud className="h-3 w-3" />
                          </button>
                        </div>
                        <div>
                          <h2 className="text-xl font-black text-white">{block.title}</h2>
                          <p className="text-sm font-semibold text-emerald-400">{block.content?.tagline || "Professional"}</p>
                          <p className="text-xs text-white/60 mt-1 max-w-xl">{block.content?.bio}</p>
                        </div>
                      </div>
                    </div>
                  );
                }

                if (block.type === "skills") {
                  return (
                    <div
                      key={block.id}
                      onClick={() => setSelectedBlockId(block.id)}
                      className={`pt-6 p-6 rounded-xl transition-all cursor-pointer border ${
                        isSelected ? "border-emerald-500 ring-2 ring-emerald-500/20 bg-emerald-950/10" : "border-transparent hover:bg-white/[0.02]"
                      }`}
                    >
                      <h3 className="text-base font-bold text-white">{block.title}</h3>
                      {block.subtitle && <p className="text-xs text-white/50 mb-3">{block.subtitle}</p>}
                      <div className="flex flex-wrap gap-2 mt-3">
                        {(block.content?.skills || ["TypeScript", "React", "Next.js"]).map((sk: string, i: number) => (
                          <span
                            key={i}
                            className="px-3 py-1 rounded-full text-xs font-mono font-semibold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30"
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
                    <div
                      key={block.id}
                      onClick={() => setSelectedBlockId(block.id)}
                      className={`pt-6 p-6 rounded-xl transition-all cursor-pointer border ${
                        isSelected ? "border-emerald-500 ring-2 ring-emerald-500/20 bg-emerald-950/10" : "border-transparent hover:bg-white/[0.02]"
                      }`}
                    >
                      <h3 className="text-base font-bold text-white">{block.title}</h3>
                      {block.subtitle && <p className="text-xs text-white/50 mb-4">{block.subtitle}</p>}
                      <div className="space-y-4">
                        {(block.content?.experiences || []).map((exp: any, i: number) => (
                          <div key={i} className="border-l-2 border-emerald-500/40 pl-4 space-y-1">
                            <div className="flex justify-between items-baseline">
                              <span className="text-xs font-bold text-white">{exp.role}</span>
                              <span className="text-[11px] text-white/40 font-mono">{exp.period}</span>
                            </div>
                            <p className="text-xs font-medium text-emerald-400">{exp.company}</p>
                            <ul className="list-disc list-inside text-xs text-white/60 space-y-0.5 mt-1">
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
                    <div
                      key={block.id}
                      onClick={() => setSelectedBlockId(block.id)}
                      className={`pt-6 p-6 rounded-xl transition-all cursor-pointer border ${
                        isSelected ? "border-emerald-500 ring-2 ring-emerald-500/20 bg-emerald-950/10" : "border-transparent hover:bg-white/[0.02]"
                      }`}
                    >
                      <h3 className="text-base font-bold text-white">{block.title}</h3>
                      {block.subtitle && <p className="text-xs text-white/50 mb-4">{block.subtitle}</p>}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {(block.content?.items || []).map((proj: any, i: number) => (
                          <div key={i} className="p-4 rounded-xl border border-white/10 bg-white/[0.02] space-y-2">
                            <p className="text-xs font-bold text-white">{proj.name}</p>
                            <p className="text-xs text-white/60 line-clamp-2">{proj.desc}</p>
                            <div className="flex flex-wrap gap-1 pt-1">
                              {(proj.tags || []).map((tag: string, ti: number) => (
                                <span key={ti} className="text-[10px] px-2 py-0.5 rounded bg-white/10 text-white/70">
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

                return (
                  <div
                    key={block.id}
                    onClick={() => setSelectedBlockId(block.id)}
                    className={`pt-6 p-6 rounded-xl transition-all cursor-pointer border ${
                      isSelected ? "border-emerald-500 ring-2 ring-emerald-500/20 bg-emerald-950/10" : "border-transparent hover:bg-white/[0.02]"
                    }`}
                  >
                    <h3 className="text-base font-bold text-white">{block.title}</h3>
                    {block.subtitle && <p className="text-xs text-white/50 mb-2">{block.subtitle}</p>}
                    <div className="p-4 rounded-lg bg-white/[0.02] border border-white/5 text-xs text-white/60">
                      {block.type.toUpperCase()} block content
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </main>

        {/* Right Column: Block Property Inspector */}
        {isRightOpen && (
          <aside className="w-72 xl:w-80 border-l border-white/10 bg-[#0c121e] p-5 flex flex-col shrink-0 overflow-y-auto space-y-5 z-20">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <span className="text-xs font-bold uppercase tracking-wider text-white/80 flex items-center gap-2">
                <Sliders className="h-3.5 w-3.5 text-emerald-400" />
                Inspector
              </span>
              <Badge variant="outline" className="text-[10px] font-mono border-white/20 text-white/60">
                {selectedBlock?.type}
              </Badge>
            </div>

            {selectedBlock ? (
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-white/60 uppercase">Section Title</label>
                  <Input
                    value={selectedBlock.title}
                    onChange={(e) => {
                      const val = e.target.value;
                      setBlocks(prev => prev.map(b => b.id === selectedBlock.id ? { ...b, title: val } : b));
                    }}
                    className="bg-black/30 border-white/15 text-white text-xs h-9"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-white/60 uppercase">Subtitle</label>
                  <Input
                    value={selectedBlock.subtitle || ""}
                    onChange={(e) => {
                      const val = e.target.value;
                      setBlocks(prev => prev.map(b => b.id === selectedBlock.id ? { ...b, subtitle: val } : b));
                    }}
                    placeholder="Optional section description..."
                    className="bg-black/30 border-white/15 text-white text-xs h-9"
                  />
                </div>

                {selectedBlock.type === "hero" && (
                  <>
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-bold text-white/60 uppercase">Tagline</label>
                      <Input
                        value={selectedBlock.content?.tagline || ""}
                        onChange={(e) => {
                          const val = e.target.value;
                          setBlocks(prev => prev.map(b => b.id === selectedBlock.id ? {
                            ...b,
                            content: { ...b.content, tagline: val }
                          } : b));
                        }}
                        className="bg-black/30 border-white/15 text-white text-xs h-9"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-bold text-white/60 uppercase">Bio / Summary</label>
                      <Textarea
                        rows={3}
                        value={selectedBlock.content?.bio || ""}
                        onChange={(e) => {
                          const val = e.target.value;
                          setBlocks(prev => prev.map(b => b.id === selectedBlock.id ? {
                            ...b,
                            content: { ...b.content, bio: val }
                          } : b));
                        }}
                        className="bg-black/30 border-white/15 text-white text-xs"
                      />
                    </div>
                    <div className="p-3 rounded-xl border border-white/10 bg-white/[0.02] space-y-2">
                      <span className="text-[11px] font-bold text-white/80">Cover & Avatar Upload</span>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => triggerFileUpload("avatar")}
                          className="flex-1 text-xs h-8 bg-emerald-600 hover:bg-emerald-500 text-white"
                        >
                          Avatar
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => triggerFileUpload("cover")}
                          className="flex-1 text-xs h-8 border-white/15 text-white hover:bg-white/10"
                        >
                          Cover
                        </Button>
                      </div>
                    </div>
                  </>
                )}

                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-white/60 uppercase">Visual Theme Style</label>
                  <div className="grid grid-cols-2 gap-2">
                    {(["clean", "glass", "gradient", "mesh"] as const).map((style) => (
                      <Button
                        key={style}
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setBlocks(prev => prev.map(b => b.id === selectedBlock.id ? { ...b, backgroundStyle: style } : b));
                        }}
                        className={`text-xs h-8 capitalize ${
                          selectedBlock.backgroundStyle === style
                            ? "bg-emerald-500/20 border-emerald-500 text-emerald-300"
                            : "border-white/10 bg-white/[0.02] text-white/70 hover:bg-white/5"
                        }`}
                      >
                        {style}
                      </Button>
                    ))}
                  </div>
                </div>

                <div className="pt-4 border-t border-white/10">
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDeleteBlock(selectedBlock.id)}
                    className="w-full text-xs h-8 bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 border border-rose-500/30"
                  >
                    <Trash2 className="h-3.5 w-3.5 mr-1.5" />
                    Remove Block
                  </Button>
                </div>
              </div>
            ) : (
              <p className="text-xs text-white/40">Select a block on the canvas to configure properties.</p>
            )}
          </aside>
        )}

        {!isRightOpen && (
          <button
            onClick={() => setIsRightOpen(true)}
            className="absolute right-3 top-4 z-30 p-2 rounded-xl bg-[#0d1524] border border-white/20 text-emerald-400 hover:bg-white/15 shadow-xl transition-all"
            title="Open Block Inspector"
          >
            <PanelRight className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  );
}
