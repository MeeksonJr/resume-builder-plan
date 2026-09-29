"use client";

import React, { useState, useRef } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Eye,
  EyeOff,
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
  ChevronDown,
  ChevronUp,
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
  Phone,
  Globe,
  Linkedin,
  Github,
  Play,
  CheckCircle2,
  Award,
  Edit3,
  X,
  Link2,
  Brain,
  Sun,
  Moon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { useUserMemoryStore } from "@/lib/stores/user-memory-store";
import { calculateMemoryCompleteness } from "@/lib/types/user-memory";
import { cn } from "@/lib/utils";

export function stripHtml(input?: string): string {
  if (!input) return "";
  return input
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/\s+/g, " ")
    .trim();
}

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
      ctaText: "Get in Touch",
      ctaLink: "#contact",
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
          location: "San Francisco, CA / Remote",
          bullets: [
            "Architected low-latency microservices handling 40M+ requests daily with 99.99% uptime.",
            "Spearheaded migration to Next.js App Router and Edge Functions, reducing TTFB by 42%."
          ]
        },
        {
          company: "Nexus AI Labs",
          role: "Senior Fullstack Developer",
          period: "2021 - 2023",
          location: "New York, NY / Hybrid",
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
          link: "https://resumeforge.io",
          screenshotUrl: ""
        },
        {
          name: "EdgeMesh Distributed Cache",
          desc: "High-performance consistent hashing cache ring running across edge Cloudflare Workers.",
          tags: ["Rust", "WASM", "WebSockets"],
          link: "https://github.com",
          screenshotUrl: ""
        }
      ]
    }
  },
  {
    id: "blk-edu-5",
    type: "education",
    title: "Education & Academic Honors",
    subtitle: "Formal foundations in computing and systems architecture",
    visible: true,
    backgroundStyle: "clean",
    content: {
      entries: [
        {
          institution: "University of California, Berkeley",
          degree: "B.S. in Computer Science",
          field: "Computer Science & Engineering",
          period: "2018 - 2022",
          honors: "Dean's Honors • Magna Cum Laude"
        }
      ]
    }
  },
  {
    id: "blk-contact-6",
    type: "contact",
    title: "Let's Connect & Collaborate",
    subtitle: "Available for staff engineering roles & high-impact contracts",
    visible: true,
    backgroundStyle: "gradient",
    content: {
      email: "engineer@resumeforge.io",
      phone: "+1 (555) 234-5678",
      location: "San Francisco, CA / Remote",
      linkedin: "https://linkedin.com",
      github: "https://github.com",
      website: "https://resumeforge.io",
      note: "Open for full-time engineering leadership roles and technical advisory."
    }
  }
];

export interface ThemePalette {
  id: string;
  label: string;
  primary: string;
  accentText: string;
  accentTextLight: string;
  accentBorder: string;
  accentBorderHover: string;
  accentBg: string;
  accentBgHover: string;
  accentBadge: string;
  accentButton: string;
  ring: string;
  glow: string;
  glassBorder: string;
  glassBg: string;
  gradient: string;
  mesh: string;
  cleanBorder: string;
}

export const THEME_PALETTES: Record<string, ThemePalette> = {
  emerald: {
    id: "emerald",
    label: "Emerald",
    primary: "emerald",
    accentText: "text-emerald-700 dark:text-emerald-400",
    accentTextLight: "text-emerald-600 dark:text-emerald-300",
    accentBorder: "border-emerald-500/40 dark:border-emerald-500/35",
    accentBorderHover: "hover:border-emerald-600 dark:hover:border-emerald-400/60",
    accentBg: "bg-emerald-500/10 dark:bg-emerald-500/15",
    accentBgHover: "hover:bg-emerald-500/20 dark:hover:bg-emerald-500/25",
    accentBadge: "bg-emerald-50 text-emerald-800 border-emerald-300 dark:bg-emerald-500/15 dark:text-emerald-300 dark:border-emerald-500/30",
    accentButton: "bg-emerald-600 hover:bg-emerald-500 text-white font-medium",
    ring: "ring-2 ring-emerald-500 dark:ring-emerald-400 border-emerald-500 dark:border-emerald-400 shadow-xl shadow-emerald-500/20",
    glow: "shadow-emerald-500/15",
    glassBorder: "border-emerald-500/30 dark:border-emerald-500/30",
    glassBg: "bg-white/80 dark:bg-emerald-950/20",
    gradient: "from-emerald-50/70 via-white to-teal-50/50 dark:from-emerald-950/60 dark:via-[#0e1726]/90 dark:to-teal-950/50",
    mesh: "from-emerald-100/60 via-slate-50 to-teal-50/40 dark:from-emerald-500/25 dark:via-[#0b1324]/90 dark:to-[#070b14]",
    cleanBorder: "border-slate-200/90 dark:border-emerald-500/20",
  },
  blue: {
    id: "blue",
    label: "Sapphire",
    primary: "blue",
    accentText: "text-blue-700 dark:text-blue-400",
    accentTextLight: "text-blue-600 dark:text-blue-300",
    accentBorder: "border-blue-500/40 dark:border-blue-500/35",
    accentBorderHover: "hover:border-blue-600 dark:hover:border-blue-400/60",
    accentBg: "bg-blue-500/10 dark:bg-blue-500/15",
    accentBgHover: "hover:bg-blue-500/20 dark:hover:bg-blue-500/25",
    accentBadge: "bg-blue-50 text-blue-800 border-blue-300 dark:bg-blue-500/15 dark:text-blue-300 dark:border-blue-500/30",
    accentButton: "bg-blue-600 hover:bg-blue-500 text-white font-medium",
    ring: "ring-2 ring-blue-500 dark:ring-blue-400 border-blue-500 dark:border-blue-400 shadow-xl shadow-blue-500/20",
    glow: "shadow-blue-500/15",
    glassBorder: "border-blue-500/30 dark:border-blue-500/30",
    glassBg: "bg-white/80 dark:bg-blue-950/20",
    gradient: "from-blue-50/70 via-white to-indigo-50/50 dark:from-blue-950/60 dark:via-[#0e1726]/90 dark:to-indigo-950/50",
    mesh: "from-blue-100/60 via-slate-50 to-indigo-50/40 dark:from-blue-500/25 dark:via-[#0b1324]/90 dark:to-[#070b14]",
    cleanBorder: "border-slate-200/90 dark:border-blue-500/20",
  },
  purple: {
    id: "purple",
    label: "Violet",
    primary: "purple",
    accentText: "text-purple-700 dark:text-purple-400",
    accentTextLight: "text-purple-600 dark:text-purple-300",
    accentBorder: "border-purple-500/40 dark:border-purple-500/35",
    accentBorderHover: "hover:border-purple-600 dark:hover:border-purple-400/60",
    accentBg: "bg-purple-500/10 dark:bg-purple-500/15",
    accentBgHover: "hover:bg-purple-500/20 dark:hover:bg-purple-500/25",
    accentBadge: "bg-purple-50 text-purple-800 border-purple-300 dark:bg-purple-500/15 dark:text-purple-300 dark:border-purple-500/30",
    accentButton: "bg-purple-600 hover:bg-purple-500 text-white font-medium",
    ring: "ring-2 ring-purple-500 dark:ring-purple-400 border-purple-500 dark:border-purple-400 shadow-xl shadow-purple-500/20",
    glow: "shadow-purple-500/15",
    glassBorder: "border-purple-500/30 dark:border-purple-500/30",
    glassBg: "bg-white/80 dark:bg-purple-950/20",
    gradient: "from-purple-50/70 via-white to-pink-50/50 dark:from-purple-950/60 dark:via-[#0e1726]/90 dark:to-pink-950/50",
    mesh: "from-purple-100/60 via-slate-50 to-pink-50/40 dark:from-purple-500/25 dark:via-[#0b1324]/90 dark:to-[#070b14]",
    cleanBorder: "border-slate-200/90 dark:border-purple-500/20",
  },
  rose: {
    id: "rose",
    label: "Ruby",
    primary: "rose",
    accentText: "text-rose-700 dark:text-rose-400",
    accentTextLight: "text-rose-600 dark:text-rose-300",
    accentBorder: "border-rose-500/40 dark:border-rose-500/35",
    accentBorderHover: "hover:border-rose-600 dark:hover:border-rose-400/60",
    accentBg: "bg-rose-500/10 dark:bg-rose-500/15",
    accentBgHover: "hover:bg-rose-500/20 dark:hover:bg-rose-500/25",
    accentBadge: "bg-rose-50 text-rose-800 border-rose-300 dark:bg-rose-500/15 dark:text-rose-300 dark:border-rose-500/30",
    accentButton: "bg-rose-600 hover:bg-rose-500 text-white font-medium",
    ring: "ring-2 ring-rose-500 dark:ring-rose-400 border-rose-500 dark:border-rose-400 shadow-xl shadow-rose-500/20",
    glow: "shadow-rose-500/15",
    glassBorder: "border-rose-500/30 dark:border-rose-500/30",
    glassBg: "bg-white/80 dark:bg-rose-950/20",
    gradient: "from-rose-50/70 via-white to-amber-50/50 dark:from-rose-950/60 dark:via-[#0e1726]/90 dark:to-amber-950/50",
    mesh: "from-rose-100/60 via-slate-50 to-amber-50/40 dark:from-rose-500/25 dark:via-[#0b1324]/90 dark:to-[#070b14]",
    cleanBorder: "border-slate-200/90 dark:border-rose-500/20",
  },
  amber: {
    id: "amber",
    label: "Amber",
    primary: "amber",
    accentText: "text-amber-800 dark:text-amber-400",
    accentTextLight: "text-amber-700 dark:text-amber-300",
    accentBorder: "border-amber-500/40 dark:border-amber-500/35",
    accentBorderHover: "hover:border-amber-600 dark:hover:border-amber-400/60",
    accentBg: "bg-amber-500/10 dark:bg-amber-500/15",
    accentBgHover: "hover:bg-amber-500/20 dark:hover:bg-amber-500/25",
    accentBadge: "bg-amber-50 text-amber-900 border-amber-300 dark:bg-amber-500/15 dark:text-amber-300 dark:border-amber-500/30",
    accentButton: "bg-amber-600 hover:bg-amber-500 text-white font-medium",
    ring: "ring-2 ring-amber-500 dark:ring-amber-400 border-amber-500 dark:border-amber-400 shadow-xl shadow-amber-500/20",
    glow: "shadow-amber-500/15",
    glassBorder: "border-amber-500/30 dark:border-amber-500/30",
    glassBg: "bg-white/80 dark:bg-amber-950/20",
    gradient: "from-amber-50/70 via-white to-orange-50/50 dark:from-amber-950/60 dark:via-[#0e1726]/90 dark:to-orange-950/50",
    mesh: "from-amber-100/60 via-slate-50 to-orange-50/40 dark:from-amber-500/25 dark:via-[#0b1324]/90 dark:to-[#070b14]",
    cleanBorder: "border-slate-200/90 dark:border-amber-500/20",
  },
  cyan: {
    id: "cyan",
    label: "Cyan",
    primary: "cyan",
    accentText: "text-cyan-700 dark:text-cyan-400",
    accentTextLight: "text-cyan-600 dark:text-cyan-300",
    accentBorder: "border-cyan-500/40 dark:border-cyan-500/35",
    accentBorderHover: "hover:border-cyan-600 dark:hover:border-cyan-400/60",
    accentBg: "bg-cyan-500/10 dark:bg-cyan-500/15",
    accentBgHover: "hover:bg-cyan-500/20 dark:hover:bg-cyan-500/25",
    accentBadge: "bg-cyan-50 text-cyan-800 border-cyan-300 dark:bg-cyan-500/15 dark:text-cyan-300 dark:border-cyan-500/30",
    accentButton: "bg-cyan-600 hover:bg-cyan-500 text-white font-medium",
    ring: "ring-2 ring-cyan-500 dark:ring-cyan-400 border-cyan-500 dark:border-cyan-400 shadow-xl shadow-cyan-500/20",
    glow: "shadow-cyan-500/15",
    glassBorder: "border-cyan-500/30 dark:border-cyan-500/30",
    glassBg: "bg-white/80 dark:bg-cyan-950/20",
    gradient: "from-cyan-50/70 via-white to-blue-50/50 dark:from-cyan-950/60 dark:via-[#0e1726]/90 dark:to-blue-950/50",
    mesh: "from-cyan-100/60 via-slate-50 to-blue-50/40 dark:from-cyan-500/25 dark:via-[#0b1324]/90 dark:to-[#070b14]",
    cleanBorder: "border-slate-200/90 dark:border-cyan-500/20",
  },
};

export function getStudioBlockContainerStyle(
  backgroundStyle: "clean" | "glass" | "gradient" | "mesh" = "clean",
  isSelected: boolean = false,
  colorScheme: string = "emerald",
  mode?: "dark" | "light"
) {
  const base = "relative p-6 sm:p-8 rounded-2xl transition-all duration-300 cursor-pointer";
  const scheme = THEME_PALETTES[colorScheme] || THEME_PALETTES.emerald;

  // Explicit Light Mode (e.g. previewing light mode in Studio)
  if (mode === "light") {
    let styleClasses = "";
    switch (backgroundStyle) {
      case "glass":
        styleClasses = `border ${scheme.glassBorder} bg-white/85 backdrop-blur-2xl shadow-lg shadow-slate-200/60 ring-1 ring-slate-900/5 text-slate-900`;
        break;
      case "gradient":
        styleClasses = `border ${scheme.accentBorder} bg-gradient-to-br ${scheme.gradient} shadow-lg shadow-slate-200/50 text-slate-900`;
        break;
      case "mesh":
        styleClasses = `border ${scheme.accentBorder} bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] ${scheme.mesh} backdrop-blur-md shadow-lg shadow-slate-200/50 text-slate-900`;
        break;
      case "clean":
      default:
        styleClasses = `border border-slate-200/90 bg-white shadow-sm backdrop-blur-xs hover:${scheme.accentBorder} text-slate-900`;
        break;
    }

    const selectionClasses = isSelected
      ? `${scheme.ring} z-10 scale-[1.002]`
      : "hover:border-slate-300";

    return `${base} ${styleClasses} ${selectionClasses}`;
  }

  // Explicit Dark Mode (e.g. previewing dark mode in Studio)
  if (mode === "dark") {
    let styleClasses = "";
    switch (backgroundStyle) {
      case "glass":
        styleClasses = `border ${scheme.glassBorder} ${scheme.glassBg} backdrop-blur-2xl shadow-xl shadow-black/50 ring-1 ring-white/10 text-white`;
        break;
      case "gradient":
        styleClasses = `border ${scheme.accentBorder} bg-gradient-to-br ${scheme.gradient} shadow-xl shadow-black/40 text-white`;
        break;
      case "mesh":
        styleClasses = `border ${scheme.accentBorder} bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] ${scheme.mesh} backdrop-blur-md shadow-2xl shadow-black/50 text-white`;
        break;
      case "clean":
      default:
        styleClasses = `border ${scheme.cleanBorder} bg-[#0b111e]/90 shadow-sm backdrop-blur-xs hover:${scheme.accentBorder} text-white`;
        break;
    }

    const selectionClasses = isSelected
      ? `${scheme.ring} z-10 scale-[1.002]`
      : "hover:border-white/30";

    return `${base} ${styleClasses} ${selectionClasses}`;
  }

  // Dual-mode Responsive (default for public page /p/[slug], automatically adapts to next-themes)
  let styleClasses = "";
  switch (backgroundStyle) {
    case "glass":
      styleClasses = `border ${scheme.glassBorder} bg-white/85 dark:bg-[#0e1726]/80 backdrop-blur-2xl shadow-lg dark:shadow-xl shadow-slate-200/60 dark:shadow-black/50 ring-1 ring-slate-900/5 dark:ring-white/10 text-slate-900 dark:text-white`;
      break;
    case "gradient":
      styleClasses = `border ${scheme.accentBorder} bg-gradient-to-br ${scheme.gradient} shadow-lg dark:shadow-xl shadow-slate-200/50 dark:shadow-black/40 text-slate-900 dark:text-white`;
      break;
    case "mesh":
      styleClasses = `border ${scheme.accentBorder} bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] ${scheme.mesh} backdrop-blur-md shadow-lg dark:shadow-2xl shadow-slate-200/50 dark:shadow-black/50 text-slate-900 dark:text-white`;
      break;
    case "clean":
    default:
      styleClasses = `border border-slate-200/90 dark:border-white/10 bg-white dark:bg-[#0b111e]/90 shadow-sm backdrop-blur-xs hover:${scheme.accentBorder} text-slate-900 dark:text-white`;
      break;
  }

  const selectionClasses = isSelected
    ? `${scheme.ring} z-10 scale-[1.002]`
    : "hover:border-slate-300 dark:hover:border-white/30";

  return `${base} ${styleClasses} ${selectionClasses}`;
}

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
  const [activeLeftTab, setActiveLeftTab] = useState<"blocks" | "theme" | "resume" | "media">("blocks");
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [isLeftOpen, setIsLeftOpen] = useState(true);
  const [isRightOpen, setIsRightOpen] = useState(true);
  const [zoomScale, setZoomScale] = useState<"100%" | "fit" | "85%">("100%");
  const [newSkillInput, setNewSkillInput] = useState("");
  
  // Visual Theme States
  const [activeThemeColor, setActiveThemeColor] = useState<string>(() => {
    return portfolio?.theme_settings?.color || "emerald";
  });
  const [activeTypography, setActiveTypography] = useState<"sans" | "serif" | "mono">(() => {
    return (portfolio?.theme_settings?.typography as any) || "sans";
  });
  const [canvasBgMode, setCanvasBgMode] = useState<"deep" | "midnight" | "slate" | "pure">("deep");
  const [previewThemeMode, setPreviewThemeMode] = useState<"dark" | "light">(() => {
    return portfolio?.theme_settings?.default_theme_mode === "light" ? "light" : "dark";
  });
  const [defaultPublicTheme, setDefaultPublicTheme] = useState<"dark" | "light" | "system">(() => {
    return (portfolio?.theme_settings?.default_theme_mode as any) || "system";
  });
  
  const { memory, fetchFromServer: fetchMemory } = useUserMemoryStore();
  const memoryCompleteness = calculateMemoryCompleteness(memory);

  React.useEffect(() => {
    fetchMemory();
  }, [fetchMemory]);

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

  // Block management
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

  const handleAddBlock = (
    type: CanvasBlock["type"],
    title: string,
    customContent?: Record<string, any>,
    preferredStyle?: CanvasBlock["backgroundStyle"]
  ) => {
    let defaultContent: Record<string, any> = {};
    switch (type) {
      case "hero":
        defaultContent = {
          tagline: "Staff Software Engineer & Technical Architect",
          bio: "Specializing in high-performance cloud architectures, fullstack distributed systems, and AI-powered interfaces.",
          openToWork: true,
          avatarUrl: "",
          coverUrl: "",
          ctaText: "Get in Touch",
          ctaLink: "#contact",
        };
        break;
      case "skills":
        defaultContent = {
          skills: ["TypeScript", "Next.js", "React", "Node.js", "PostgreSQL", "Tailwind CSS", "Docker", "AWS", "Python"]
        };
        break;
      case "experience":
        defaultContent = {
          experiences: [
            {
              company: "Tech Systems Inc.",
              role: "Senior Fullstack Engineer",
              period: "2023 - Present",
              location: "San Francisco, CA / Remote",
              bullets: [
                "Engineered high-scale microservices processing 20M+ operations daily with 99.99% availability.",
                "Spearheaded core platform modernization, reducing latency by 35%."
              ]
            }
          ]
        };
        break;
      case "projects":
        defaultContent = {
          items: [
            {
              name: "CloudScale Platform",
              desc: "Distributed workflow engine with live real-time metrics and edge execution.",
              tags: ["TypeScript", "Next.js", "Tailwind", "Supabase"],
              link: "https://github.com",
              screenshotUrl: ""
            }
          ]
        };
        break;
      case "education":
        defaultContent = {
          entries: [
            {
              institution: "University of California, Berkeley",
              degree: "B.S. in Computer Science",
              field: "Computer Science & Engineering",
              period: "2018 - 2022",
              honors: "Dean's Honors • Magna Cum Laude"
            }
          ]
        };
        break;
      case "video_pitch":
        defaultContent = {
          videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
          pitchTitle: "60-Second Career Pitch",
          summary: "Quick overview of my engineering background, core competencies, and recent high-impact architectural deliveries.",
          highlights: [
            "10+ Years Building High-Scale Distributed Systems",
            "Specialized in Next.js, TypeScript & Edge Computing",
            "Proven leadership scaling engineering teams"
          ]
        };
        break;
      case "web3_badges":
        defaultContent = {
          badges: [
            { name: "Verified Senior Fullstack Architect", issuer: "ResumeForge Protocol", date: "2026", verifyUrl: "https://resumeforge.io" },
            { name: "EIP-712 Cryptographic Signature", issuer: "Career Authority", date: "2026", verifyUrl: "https://resumeforge.io" }
          ]
        };
        break;
      case "contact":
        defaultContent = {
          email: "engineer@resumeforge.io",
          phone: "+1 (555) 234-5678",
          location: "San Francisco, CA / Remote",
          linkedin: "https://linkedin.com",
          github: "https://github.com",
          website: "https://resumeforge.io",
          note: "Available for full-time engineering leadership roles and technical advisory."
        };
        break;
    }

    const initialStyle: CanvasBlock["backgroundStyle"] =
      preferredStyle || (blocks.length > 0 ? blocks[0].backgroundStyle : "mesh");

    const newBlock: CanvasBlock = {
      id: `blk-${type}-${Date.now()}`,
      type,
      title,
      visible: true,
      backgroundStyle: initialStyle,
      content: customContent && Object.keys(customContent).length > 0 ? customContent : defaultContent
    };
    setBlocks(prev => [...prev, newBlock]);
    setSelectedBlockId(newBlock.id);
    toast.success(`Added ${title} to canvas`);
  };

  const handleApplyThemeStyleToAll = (style: CanvasBlock["backgroundStyle"]) => {
    setBlocks(prev => prev.map(b => ({ ...b, backgroundStyle: style })));
    toast.success(`Applied ${style} theme style to all blocks!`);
  };

  const handleImportResumeSection = (resume: any, section: "skills" | "experience" | "education" | "projects") => {
    const existingIndex = blocks.findIndex(b => b.type === section);
    const existingBlock = existingIndex >= 0 ? blocks[existingIndex] : null;
    const targetStyle: CanvasBlock["backgroundStyle"] = existingBlock?.backgroundStyle || (blocks.length > 0 ? blocks[0].backgroundStyle : "mesh");

    if (section === "skills") {
      const skillsList = resume.skills && resume.skills.length > 0
        ? resume.skills.map((s: any) => stripHtml(typeof s === "string" ? s : s.name || s)).filter(Boolean)
        : ["TypeScript", "Next.js", "React", "PostgreSQL", "Node.js", "Tailwind CSS"];
      const newTitle = `${resume.title || "Resume"} Skills`;
      const newContent = { skills: skillsList };

      if (existingBlock) {
        setBlocks(prev => prev.map((b, idx) => idx === existingIndex ? {
          ...b,
          title: newTitle,
          content: newContent,
          visible: true,
        } : b));
        setSelectedBlockId(existingBlock.id);
        toast.success(`Updated Skills block from "${resume.title}"`);
      } else {
        handleAddBlock("skills", newTitle, newContent, targetStyle);
        toast.success(`Imported skills from "${resume.title}"`);
      }
    } else if (section === "experience") {
      const experiences = (resume.work_experiences || []).map((w: any) => ({
        company: stripHtml(w.company) || "Tech Company",
        role: stripHtml(w.position) || "Software Engineer",
        period: `${w.start_date || "2022"} - ${w.is_current ? "Present" : w.end_date || "2024"}`,
        location: stripHtml(w.location) || "Remote",
        bullets: w.highlights && w.highlights.length > 0
          ? w.highlights.map((h: string) => stripHtml(h)).filter(Boolean)
          : (w.description ? [stripHtml(w.description)] : ["Architected key feature improvements."])
      }));
      const newTitle = `${resume.title || "Resume"} Experience`;
      const newContent = { experiences: experiences.length > 0 ? experiences : undefined };

      if (existingBlock) {
        setBlocks(prev => prev.map((b, idx) => idx === existingIndex ? {
          ...b,
          title: newTitle,
          content: newContent,
          visible: true,
        } : b));
        setSelectedBlockId(existingBlock.id);
        toast.success(`Updated Experience block from "${resume.title}"`);
      } else {
        handleAddBlock("experience", newTitle, newContent, targetStyle);
        toast.success(`Imported work timeline from "${resume.title}"`);
      }
    } else if (section === "education") {
      const eduEntries = (resume.education || []).map((e: any) => ({
        institution: stripHtml(e.institution) || "University",
        degree: stripHtml(e.degree) || "Bachelor's Degree",
        field: stripHtml(e.field_of_study) || "Computer Science",
        period: `${e.start_date || ""} - ${e.end_date || ""}`,
        honors: stripHtml(e.gpa ? `GPA: ${e.gpa}` : (e.honors || ""))
      }));
      const newTitle = `${resume.title || "Resume"} Education`;
      const newContent = { entries: eduEntries.length > 0 ? eduEntries : undefined };

      if (existingBlock) {
        setBlocks(prev => prev.map((b, idx) => idx === existingIndex ? {
          ...b,
          title: newTitle,
          content: newContent,
          visible: true,
        } : b));
        setSelectedBlockId(existingBlock.id);
        toast.success(`Updated Education block from "${resume.title}"`);
      } else {
        handleAddBlock("education", newTitle, newContent, targetStyle);
        toast.success(`Imported education from "${resume.title}"`);
      }
    } else if (section === "projects") {
      const projItems = (resume.projects || []).map((p: any) => ({
        name: stripHtml(p.name || p.title) || "Project",
        desc: stripHtml(p.description) || "Project overview and features.",
        tags: Array.isArray(p.technologies)
          ? p.technologies.map((t: string) => stripHtml(t)).filter(Boolean)
          : ["TypeScript", "React"],
        link: p.url || ""
      }));
      const newTitle = `${resume.title || "Resume"} Projects`;
      const newContent = { items: projItems.length > 0 ? projItems : undefined };

      if (existingBlock) {
        setBlocks(prev => prev.map((b, idx) => idx === existingIndex ? {
          ...b,
          title: newTitle,
          content: newContent,
          visible: true,
        } : b));
        setSelectedBlockId(existingBlock.id);
        toast.success(`Updated Projects block from "${resume.title}"`);
      } else {
        handleAddBlock("projects", newTitle, newContent, targetStyle);
        toast.success(`Imported projects from "${resume.title}"`);
      }
    }
  };

  const handleImportMemorySection = (section: "hero" | "skills" | "experience" | "education" | "projects" | "contact" | "all") => {
    const currentMemory = useUserMemoryStore.getState().memory;
    const targetStyle: CanvasBlock["backgroundStyle"] = blocks.length > 0 ? blocks[0].backgroundStyle : "mesh";

    if (section === "hero" || section === "all") {
      const heroIdx = blocks.findIndex(b => b.type === "hero");
      const heroContent = {
        tagline: currentMemory.basics.headline || "Senior Professional & Systems Architect",
        bio: currentMemory.basics.bio || currentMemory.basics.headline || "Passionate engineer delivering high-impact solutions.",
        openToWork: true,
        avatarUrl: currentMemory.basics.avatar_url || "",
        coverUrl: "",
        ctaText: "Get in Touch",
        ctaLink: "#contact",
      };

      if (heroIdx >= 0) {
        setBlocks(prev => prev.map((b, idx) => idx === heroIdx ? {
          ...b,
          content: { ...b.content, ...heroContent },
          visible: true,
        } : b));
      } else {
        handleAddBlock("hero", "Candidate Hero & Bio", heroContent, "gradient");
      }
      if (section === "hero") toast.success("Hero & Bio updated from Career Memory!");
    }

    if (section === "skills" || section === "all") {
      const skillsIdx = blocks.findIndex(b => b.type === "skills");
      const skillsList = currentMemory.skills && currentMemory.skills.length > 0
        ? currentMemory.skills.map(s => s.name)
        : ["TypeScript", "Next.js", "React", "PostgreSQL", "Node.js", "Tailwind CSS"];
      const newContent = { skills: skillsList };

      if (skillsIdx >= 0) {
        setBlocks(prev => prev.map((b, idx) => idx === skillsIdx ? {
          ...b,
          title: "Core Competencies & Stack",
          content: newContent,
          visible: true,
        } : b));
      } else {
        handleAddBlock("skills", "Core Competencies & Stack", newContent, "glass");
      }
      if (section === "skills") toast.success(`Imported ${skillsList.length} skills from Career Memory!`);
    }

    if (section === "experience" || section === "all") {
      const expIdx = blocks.findIndex(b => b.type === "experience");
      const experiences = (currentMemory.experiences || []).map(w => ({
        company: w.company || "Tech Company",
        role: w.position || "Software Engineer",
        period: `${w.start_date || "2022"} - ${w.is_current ? "Present" : w.end_date || "2024"}`,
        location: w.location || "Remote",
        bullets: w.highlights && w.highlights.length > 0
          ? w.highlights
          : (w.description ? [w.description] : ["Delivered core business features and architectures."])
      }));
      const newContent = { experiences: experiences.length > 0 ? experiences : undefined };

      if (expIdx >= 0) {
        setBlocks(prev => prev.map((b, idx) => idx === expIdx ? {
          ...b,
          title: "Professional Work Experience",
          content: newContent,
          visible: true,
        } : b));
      } else {
        handleAddBlock("experience", "Professional Work Experience", newContent, "clean");
      }
      if (section === "experience") toast.success(`Imported ${experiences.length} work positions from Career Memory!`);
    }

    if (section === "education" || section === "all") {
      const eduIdx = blocks.findIndex(b => b.type === "education");
      const eduEntries = (currentMemory.education || []).map(e => ({
        institution: e.institution || "University",
        degree: e.degree || "Bachelor's Degree",
        field: e.field_of_study || "Computer Science",
        period: `${e.start_date || ""} - ${e.end_date || ""}`,
        honors: e.gpa ? `GPA: ${e.gpa}` : ""
      }));
      const newContent = { entries: eduEntries.length > 0 ? eduEntries : undefined };

      if (eduIdx >= 0) {
        setBlocks(prev => prev.map((b, idx) => idx === eduIdx ? {
          ...b,
          title: "Education & Academic Honors",
          content: newContent,
          visible: true,
        } : b));
      } else {
        handleAddBlock("education", "Education & Academic Honors", newContent, "clean");
      }
      if (section === "education") toast.success(`Imported ${eduEntries.length} education records from Career Memory!`);
    }

    if (section === "projects" || section === "all") {
      const projIdx = blocks.findIndex(b => b.type === "projects");
      const projItems = (currentMemory.projects || []).map(p => ({
        name: p.name || "Project",
        desc: p.description || "Project overview and features.",
        tags: Array.isArray(p.technologies) && p.technologies.length > 0 ? p.technologies : ["TypeScript", "Next.js"],
        link: p.url || p.github_url || ""
      }));
      const newContent = { items: projItems.length > 0 ? projItems : undefined };

      if (projIdx >= 0) {
        setBlocks(prev => prev.map((b, idx) => idx === projIdx ? {
          ...b,
          title: "Featured Engineering Projects",
          content: newContent,
          visible: true,
        } : b));
      } else {
        handleAddBlock("projects", "Featured Engineering Projects", newContent, "mesh");
      }
      if (section === "projects") toast.success(`Imported ${projItems.length} projects from Career Memory!`);
    }

    if (section === "contact" || section === "all") {
      const contactIdx = blocks.findIndex(b => b.type === "contact");
      const contactContent = {
        email: currentMemory.basics.email || "",
        phone: currentMemory.basics.phone || "",
        location: currentMemory.basics.location || "",
        linkedin: currentMemory.socials.linkedin || "",
        github: currentMemory.socials.github || "",
        website: currentMemory.socials.portfolio || "",
        note: currentMemory.preferences.target_roles?.length
          ? `Seeking opportunities as ${currentMemory.preferences.target_roles.join(", ")}.`
          : "Open to discussions and collaboration."
      };

      if (contactIdx >= 0) {
        setBlocks(prev => prev.map((b, idx) => idx === contactIdx ? {
          ...b,
          content: { ...b.content, ...contactContent },
          visible: true,
        } : b));
      } else {
        handleAddBlock("contact", "Let's Connect & Collaborate", contactContent, "gradient");
      }
      if (section === "contact") toast.success("Contact details updated from Career Memory!");
    }

    if (section === "all") {
      toast.success("Synchronized all blocks from Career Memory!");
    }
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
              color: activeThemeColor,
              typography: activeTypography,
              active_layout: nextVal ? "canvas" : "template",
              default_theme_mode: defaultPublicTheme,
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
              color: activeThemeColor,
              typography: activeTypography,
              active_layout: isActiveLayout ? "canvas" : "template",
              default_theme_mode: defaultPublicTheme,
            },
            updated_at: new Date().toISOString()
          })
          .eq("id", portfolio.id);
        if (error) throw error;
      }
      if (typeof window !== "undefined") {
        localStorage.setItem("resumeforge_portfolio_active_layout", isActiveLayout ? "canvas" : "template");
      }
      toast.success("Portfolio canvas & theme saved live!");
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

      const fileExt = file.name.split(".").pop() || "png";
      const fileName = `portfolio-${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${fileExt}`;
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(fileName, file, { cacheControl: "3600", upsert: true });

      if (!uploadError && uploadData) {
        const { data: { publicUrl } } = supabase.storage.from("avatars").getPublicUrl(fileName);
        publicImageUrl = publicUrl;
      } else {
        publicImageUrl = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });
      }

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
        toast.success("Profile avatar updated!");
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
        toast.success("Hero cover background updated!");
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

  // Helper to update selected block content
  const updateSelectedBlockContent = (newContent: Record<string, any>) => {
    if (!selectedBlockId) return;
    setBlocks(prev => prev.map(b => b.id === selectedBlockId ? {
      ...b,
      content: { ...b.content, ...newContent }
    } : b));
  };

  const getCanvasBgClass = () => {
    if (previewThemeMode === "light") {
      switch (canvasBgMode) {
        case "midnight": return "bg-slate-200/90";
        case "slate": return "bg-zinc-200/90";
        case "pure": return "bg-white";
        case "deep":
        default: return "bg-slate-100";
      }
    }
    switch (canvasBgMode) {
      case "midnight": return "bg-[#090d16]";
      case "slate": return "bg-[#0f172a]";
      case "pure": return "bg-[#000000]";
      case "deep":
      default: return "bg-[#070b12]";
    }
  };

  const getTypographyClass = () => {
    switch (activeTypography) {
      case "serif": return "font-serif";
      case "mono": return "font-mono";
      case "sans":
      default: return "font-sans";
    }
  };

  return (
    <div className={`flex flex-col h-screen w-full max-w-full bg-[#090e17] text-white overflow-hidden select-none ${getTypographyClass()}`}>
      {/* Hidden file input */}
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
            <span className="hidden md:inline">{isLeftOpen ? "Hide Left" : "Show Left"}</span>
          </Button>

          <div className="h-4 w-[1px] bg-white/10 hidden sm:block" />
          <div className="hidden lg:flex items-center gap-2.5">
            <div className="h-7 w-7 rounded-lg bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Sparkles className="h-3.5 w-3.5" />
            </div>
            <div>
              <h1 className="text-xs font-bold tracking-tight text-white flex items-center gap-2">
                Visual Portfolio Studio
                {isActiveLayout ? (
                  <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/30 text-[9px] font-mono">
                    LIVE ACTIVE ON /P/
                  </Badge>
                ) : (
                  <Badge className="bg-white/10 text-white/50 border-white/15 text-[9px] font-mono">
                    DRAFT MODE
                  </Badge>
                )}
              </h1>
            </div>
          </div>
        </div>

        {/* Center: Device Viewport Switcher & Zoom */}
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

          {/* Theme Mode Toggle (Dark / Light Studio Preview) */}
          <div className="flex items-center bg-black/40 rounded-lg p-0.5 gap-0.5 border border-white/10">
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setPreviewThemeMode("dark")}
              className={`h-6 px-2 rounded text-[11px] font-semibold gap-1 transition-all ${
                previewThemeMode === "dark"
                  ? "bg-slate-800 text-blue-300 shadow-xs border border-blue-400/30"
                  : "text-white/50 hover:text-white"
              }`}
              title="Preview Dark Mode"
            >
              <Moon className="h-3 w-3" />
              <span className="hidden md:inline">Dark</span>
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setPreviewThemeMode("light")}
              className={`h-6 px-2 rounded text-[11px] font-semibold gap-1 transition-all ${
                previewThemeMode === "light"
                  ? "bg-white text-amber-600 shadow-xs border border-amber-300"
                  : "text-white/50 hover:text-white"
              }`}
              title="Preview Light Mode"
            >
              <Sun className="h-3 w-3" />
              <span className="hidden md:inline">Light</span>
            </Button>
          </div>

          <div className="h-3.5 w-[1px] bg-white/10 mx-0.5" />

          <Button
            size="sm"
            variant="ghost"
            onClick={() => setZoomScale(prev => prev === "100%" ? "fit" : prev === "fit" ? "85%" : "100%")}
            className="h-7 px-2 rounded-lg text-xs font-semibold gap-1 text-white/70 hover:text-white hover:bg-white/10"
            title="Zoom Scale / Fit screen"
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
            title="Toggle whether this canvas layout is displayed on your public /p/ URL"
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
            className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold gap-1.5 text-xs h-8 px-3.5 shadow-lg shadow-emerald-950/40"
          >
            <Save className="h-3.5 w-3.5" />
            <span>{isSaving ? "Saving..." : "Save Canvas"}</span>
          </Button>
        </div>
      </header>

      {/* Main Studio Body: 3-column Canvas workspace */}
      <div className="flex-1 flex overflow-hidden w-full max-w-full relative">
        {/* Left Column: Blocks Palette & Importer */}
        {isLeftOpen && (
          <aside className="w-72 xl:w-80 border-r border-white/10 bg-[#0c121e] flex flex-col shrink-0 z-20">
            <div className="p-2.5 border-b border-white/10 grid grid-cols-4 gap-1 bg-black/20 text-center">
              <button
                onClick={() => setActiveLeftTab("blocks")}
                className={`py-1.5 px-1 rounded-lg text-xs font-semibold transition-all ${
                  activeLeftTab === "blocks" ? "bg-white/15 text-white" : "text-white/50 hover:text-white"
                }`}
              >
                Blocks
              </button>
              <button
                onClick={() => setActiveLeftTab("theme")}
                className={`py-1.5 px-1 rounded-lg text-xs font-semibold transition-all ${
                  activeLeftTab === "theme" ? "bg-white/15 text-white" : "text-white/50 hover:text-white"
                }`}
              >
                Theme
              </button>
              <button
                onClick={() => setActiveLeftTab("resume")}
                className={`py-1.5 px-1 rounded-lg text-xs font-semibold transition-all ${
                  activeLeftTab === "resume" ? "bg-white/15 text-white" : "text-white/50 hover:text-white"
                }`}
              >
                Import
              </button>
              <button
                onClick={() => setActiveLeftTab("media")}
                className={`py-1.5 px-1 rounded-lg text-xs font-semibold transition-all ${
                  activeLeftTab === "media" ? "bg-white/15 text-white" : "text-white/50 hover:text-white"
                }`}
              >
                Assets
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {/* TAB 1: BLOCKS */}
              {activeLeftTab === "blocks" && (
                <>
                  <div className="space-y-2">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-white/40 px-1">
                      Canvas Sections ({blocks.length})
                    </span>
                    <div className="space-y-1.5">
                      {blocks.map((b, idx) => {
                        const isSelected = selectedBlockId === b.id;
                        const isHidden = b.visible === false;
                        const currentTheme = THEME_PALETTES[activeThemeColor] || THEME_PALETTES.emerald;

                        return (
                          <div
                            key={b.id}
                            onClick={() => setSelectedBlockId(b.id)}
                            className={`group flex items-center justify-between p-2.5 rounded-xl border transition-all cursor-pointer ${
                              isHidden ? "opacity-60 bg-black/40 border-dashed border-white/10" : ""
                            } ${
                              isSelected
                                ? `${currentTheme.accentBg} ${currentTheme.accentBorder} text-white shadow-sm ring-1 ring-white/20`
                                : "bg-white/[0.03] border-white/5 text-white/70 hover:bg-white/[0.06] hover:text-white"
                            }`}
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              <GripVertical className="h-4 w-4 text-white/30 shrink-0" />
                              <div className="truncate">
                                <p className={`text-xs font-semibold truncate ${isHidden ? "line-through text-white/50" : ""}`}>
                                  {b.title}
                                </p>
                                <div className="flex items-center gap-1.5 mt-0.5">
                                  <span className="text-[9px] text-white/40 uppercase font-mono">{b.type}</span>
                                  <span className="text-[9px] px-1.5 py-0.2 rounded bg-white/10 text-white/60 font-mono capitalize">
                                    {b.backgroundStyle}
                                  </span>
                                  {isHidden && (
                                    <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 font-mono">
                                      Hidden
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center gap-1 shrink-0 opacity-80 group-hover:opacity-100">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  const nextVis = b.visible === false;
                                  setBlocks(prev => prev.map(item => item.id === b.id ? { ...item, visible: nextVis } : item));
                                  toast.success(`"${b.title}" is now ${nextVis ? "visible" : "hidden"} on canvas`);
                                }}
                                className={`p-1 rounded transition-colors ${
                                  isHidden
                                    ? "text-amber-400 bg-amber-500/15 hover:bg-amber-500/25"
                                    : "text-white/50 hover:text-white hover:bg-white/10"
                                }`}
                                title={isHidden ? "Show block on canvas" : "Hide block from canvas"}
                              >
                                {isHidden ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleMoveBlock(idx, "up");
                                }}
                                disabled={idx === 0}
                                className="p-1 hover:bg-white/10 rounded disabled:opacity-20 text-white/60 hover:text-white"
                                title="Move section up"
                              >
                                <MoveUp className="h-3 w-3" />
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleMoveBlock(idx, "down");
                                }}
                                disabled={idx === blocks.length - 1}
                                className="p-1 hover:bg-white/10 rounded disabled:opacity-20 text-white/60 hover:text-white"
                                title="Move section down"
                              >
                                <MoveDown className="h-3 w-3" />
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteBlock(b.id);
                                }}
                                className="p-1 hover:bg-rose-500/20 text-white/40 hover:text-rose-400 rounded"
                                title="Delete section"
                              >
                                <Trash2 className="h-3 w-3" />
                              </button>
                            </div>
                          </div>
                        );
                      })}
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
                        onClick={() => handleAddBlock("skills", "Core Competencies & Stack")}
                        className="border-white/10 bg-white/[0.02] hover:bg-white/10 text-white/80 hover:text-white text-xs h-9 justify-start gap-2"
                      >
                        <Code2 className="h-3.5 w-3.5 text-cyan-400" />
                        Skills Cloud
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleAddBlock("projects", "Featured Projects")}
                        className="border-white/10 bg-white/[0.02] hover:bg-white/10 text-white/80 hover:text-white text-xs h-9 justify-start gap-2"
                      >
                        <FolderGit2 className="h-3.5 w-3.5 text-amber-400" />
                        Projects
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleAddBlock("experience", "Work Timeline")}
                        className="border-white/10 bg-white/[0.02] hover:bg-white/10 text-white/80 hover:text-white text-xs h-9 justify-start gap-2"
                      >
                        <Briefcase className="h-3.5 w-3.5 text-emerald-400" />
                        Experience
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleAddBlock("education", "Education & Degrees")}
                        className="border-white/10 bg-white/[0.02] hover:bg-white/10 text-white/80 hover:text-white text-xs h-9 justify-start gap-2"
                      >
                        <GraduationCap className="h-3.5 w-3.5 text-blue-400" />
                        Education
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleAddBlock("video_pitch", "Video Elevator Pitch")}
                        className="border-white/10 bg-white/[0.02] hover:bg-white/10 text-white/80 hover:text-white text-xs h-9 justify-start gap-2"
                      >
                        <Video className="h-3.5 w-3.5 text-rose-400" />
                        Video Pitch
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleAddBlock("web3_badges", "Verified Badges")}
                        className="border-white/10 bg-white/[0.02] hover:bg-white/10 text-white/80 hover:text-white text-xs h-9 justify-start gap-2"
                      >
                        <ShieldCheck className="h-3.5 w-3.5 text-purple-400" />
                        Badges
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleAddBlock("contact", "Get In Touch")}
                        className="border-white/10 bg-white/[0.02] hover:bg-white/10 text-white/80 hover:text-white text-xs h-9 justify-start gap-2 col-span-2"
                      >
                        <Mail className="h-3.5 w-3.5 text-indigo-400" />
                        Contact & Channels
                      </Button>
                    </div>
                  </div>
                </>
              )}

              {/* TAB 2: VISUAL THEME & STYLES */}
              {activeLeftTab === "theme" && (
                <div className="space-y-5">
                  <div className="space-y-2">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-white/60 px-1">
                      Accent Color Theme
                    </span>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { id: "emerald", label: "Emerald", color: "bg-emerald-500" },
                        { id: "blue", label: "Sapphire", color: "bg-blue-500" },
                        { id: "purple", label: "Violet", color: "bg-purple-500" },
                        { id: "rose", label: "Ruby", color: "bg-rose-500" },
                        { id: "amber", label: "Amber", color: "bg-amber-500" },
                        { id: "cyan", label: "Cyan", color: "bg-cyan-500" },
                      ].map((item) => (
                        <button
                          key={item.id}
                          onClick={() => {
                            setActiveThemeColor(item.id);
                            toast.success(`Theme accent set to ${item.label}`);
                          }}
                          className={`p-2 rounded-xl border text-xs font-semibold flex items-center gap-2 transition-all ${
                            activeThemeColor === item.id
                              ? "bg-white/15 border-white text-white shadow-md ring-1 ring-white/20"
                              : "bg-white/[0.03] border-white/10 text-white/60 hover:bg-white/[0.08] hover:text-white"
                          }`}
                        >
                          <span className={`h-3 w-3 rounded-full ${item.color} shadow`} />
                          <span className="text-[11px] truncate">{item.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2 pt-2 border-t border-white/10">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-white/60 px-1">
                      Apply Style To All Blocks
                    </span>
                    <p className="text-[11px] text-white/50 px-1">
                      Quickly re-theme every block on your canvas with one click.
                    </p>
                    <div className="grid grid-cols-2 gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleApplyThemeStyleToAll("clean")}
                        className="text-xs h-9 border-white/10 bg-white/[0.02] hover:bg-white/10 text-white justify-center font-semibold"
                      >
                        All Clean Minimal
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleApplyThemeStyleToAll("glass")}
                        className="text-xs h-9 border-white/10 bg-white/[0.02] hover:bg-white/10 text-white justify-center font-semibold"
                      >
                        All Frosted Glass
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleApplyThemeStyleToAll("gradient")}
                        className="text-xs h-9 border-white/10 bg-white/[0.02] hover:bg-white/10 text-white justify-center font-semibold"
                      >
                        All Gradients
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleApplyThemeStyleToAll("mesh")}
                        className="text-xs h-9 border-white/10 bg-white/[0.02] hover:bg-white/10 text-white justify-center font-semibold"
                      >
                        All Radial Mesh
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2 pt-2 border-t border-white/10">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-white/60 px-1">
                      Typography
                    </span>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { id: "sans", label: "Inter (Sans)" },
                        { id: "serif", label: "Playfair (Serif)" },
                        { id: "mono", label: "JetBrains (Mono)" },
                      ].map((t) => (
                        <button
                          key={t.id}
                          onClick={() => setActiveTypography(t.id as any)}
                          className={`p-2 rounded-xl border text-[11px] font-medium transition-all ${
                            activeTypography === t.id
                              ? "bg-emerald-500/20 border-emerald-500/50 text-emerald-300 ring-1 ring-emerald-500/30"
                              : "bg-white/[0.03] border-white/10 text-white/60 hover:text-white"
                          }`}
                        >
                          {t.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2 pt-2 border-t border-white/10">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-white/60 px-1">
                      Canvas Ambiance
                    </span>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { id: "deep", label: "Deep Space" },
                        { id: "midnight", label: "Midnight Blue" },
                        { id: "slate", label: "Cyber Slate" },
                        { id: "pure", label: "OLED Black" },
                      ].map((bg) => (
                        <button
                          key={bg.id}
                          onClick={() => setCanvasBgMode(bg.id as any)}
                          className={`p-2 rounded-xl border text-[11px] font-medium transition-all ${
                            canvasBgMode === bg.id
                              ? "bg-white/15 border-white text-white ring-1 ring-white/20"
                              : "bg-white/[0.03] border-white/10 text-white/60 hover:text-white"
                          }`}
                        >
                          {bg.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2 pt-2 border-t border-white/10">
                    <div className="flex items-center justify-between px-1">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-white/60">
                        Default Public Theme
                      </span>
                      <Badge variant="outline" className="text-[9px] font-mono border-white/15 text-emerald-400 capitalize">
                        {defaultPublicTheme}
                      </Badge>
                    </div>
                    <p className="text-[11px] text-white/50 px-1 leading-relaxed">
                      Determines how visitors first experience your portfolio at your public URL. Dark mode stays dark, while Light mode renders clean, high-contrast, perfectly readable cards.
                    </p>
                    <div className="grid grid-cols-3 gap-1.5">
                      {[
                        { id: "dark", label: "Dark First", icon: Moon },
                        { id: "light", label: "Light First", icon: Sun },
                        { id: "system", label: "Auto / System", icon: Monitor },
                      ].map((tm) => {
                        const Icon = tm.icon;
                        const isSelected = defaultPublicTheme === tm.id;
                        return (
                          <button
                            key={tm.id}
                            type="button"
                            onClick={() => {
                              setDefaultPublicTheme(tm.id as any);
                              if (tm.id === "dark" || tm.id === "light") {
                                setPreviewThemeMode(tm.id);
                              }
                              toast.success(`Default public theme set to ${tm.label}`);
                            }}
                            className={`p-2 rounded-xl border text-center transition-all flex flex-col items-center gap-1 ${
                              isSelected
                                ? "bg-emerald-500/20 border-emerald-500/50 text-emerald-300 ring-1 ring-emerald-500/30"
                                : "bg-white/[0.03] border-white/10 text-white/60 hover:text-white hover:bg-white/[0.06]"
                            }`}
                          >
                            <Icon className={`h-3.5 w-3.5 ${isSelected ? "text-emerald-400" : "text-white/60"}`} />
                            <span className="text-[11px] font-semibold">{tm.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: IMPORT DATA */}
              {activeLeftTab === "resume" && (
                <div className="space-y-4">
                  {/* Career Memory Section */}
                  <div className="p-3.5 rounded-xl border border-emerald-500/30 bg-gradient-to-b from-emerald-950/40 to-[#0e1726] space-y-3 shadow-md">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="h-7 w-7 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center">
                          <Brain className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-white">Career Memory</p>
                          <p className="text-[10px] text-emerald-300/80 font-mono">
                            {memoryCompleteness.score}% complete
                          </p>
                        </div>
                      </div>
                      <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/30 text-[9px] font-mono">
                        SYNCED
                      </Badge>
                    </div>

                    <div className="flex items-center gap-1.5 text-[10px] text-white/50 flex-wrap">
                      <span>{memory.experiences?.length || 0} jobs</span> •
                      <span>{memory.skills?.length || 0} skills</span> •
                      <span>{memory.projects?.length || 0} projects</span> •
                      <span>{memory.education?.length || 0} degrees</span>
                    </div>

                    <Button
                      size="sm"
                      onClick={() => handleImportMemorySection("all")}
                      className="w-full text-xs h-7 bg-emerald-600 hover:bg-emerald-500 text-white font-bold"
                    >
                      <Sparkles className="h-3 w-3 mr-1.5" />
                      Sync All Blocks from Memory
                    </Button>

                    <div className="grid grid-cols-2 gap-1.5 pt-2 border-t border-white/10">
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => handleImportMemorySection("hero")}
                        className="text-[11px] h-7 bg-white/10 text-white hover:bg-white/20 justify-start px-2"
                      >
                        + Hero & Bio
                      </Button>
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => handleImportMemorySection("skills")}
                        className="text-[11px] h-7 bg-white/10 text-white hover:bg-white/20 justify-start px-2"
                      >
                        + Skills ({memory.skills?.length || 0})
                      </Button>
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => handleImportMemorySection("experience")}
                        className="text-[11px] h-7 bg-white/10 text-white hover:bg-white/20 justify-start px-2"
                      >
                        + Work ({memory.experiences?.length || 0})
                      </Button>
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => handleImportMemorySection("projects")}
                        className="text-[11px] h-7 bg-white/10 text-white hover:bg-white/20 justify-start px-2"
                      >
                        + Projects ({memory.projects.length})
                      </Button>
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => handleImportMemorySection("education")}
                        className="text-[11px] h-7 bg-white/10 text-white hover:bg-white/20 justify-start px-2"
                      >
                        + Education ({memory.education.length})
                      </Button>
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => handleImportMemorySection("contact")}
                        className="text-[11px] h-7 bg-white/10 text-white hover:bg-white/20 justify-start px-2"
                      >
                        + Contact Info
                      </Button>
                    </div>

                    <div className="text-center pt-0.5">
                      <Link
                        href="/dashboard/memory"
                        className="text-[10px] text-emerald-400 hover:text-emerald-300 underline font-medium"
                      >
                        Manage & Edit Career Memory →
                      </Link>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-white/10 space-y-2">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-white/40 px-1">
                      From Saved Resumes ({resumes.length})
                    </span>
                    <p className="text-xs text-white/60">
                      Import parsed career milestones, skills, and projects directly from your verified resumes into canvas blocks.
                    </p>
                    {resumes.length === 0 ? (
                      <div className="p-4 rounded-xl border border-white/10 bg-white/[0.02] text-center text-xs text-white/40">
                        No parsed resumes found in your account yet.
                      </div>
                    ) : (
                    resumes.map(r => (
                      <div key={r.id} className="p-3.5 rounded-xl border border-white/10 bg-white/[0.02] space-y-2.5">
                        <div className="flex items-center justify-between">
                          <p className="text-xs font-bold text-white truncate">{r.title}</p>
                          <Badge variant="outline" className="text-[9px] font-mono border-white/15 text-white/50">
                            {r.skills?.length || 0} skills
                          </Badge>
                        </div>
                        <div className="grid grid-cols-2 gap-1.5">
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => handleImportResumeSection(r, "skills")}
                            className="text-[11px] h-7 bg-white/10 text-white hover:bg-white/20 justify-start px-2"
                          >
                            + Skills ({r.skills?.length || 0})
                          </Button>
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => handleImportResumeSection(r, "experience")}
                            className="text-[11px] h-7 bg-white/10 text-white hover:bg-white/20 justify-start px-2"
                          >
                            + Work ({r.work_experiences?.length || 0})
                          </Button>
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => handleImportResumeSection(r, "education")}
                            className="text-[11px] h-7 bg-white/10 text-white hover:bg-white/20 justify-start px-2"
                          >
                            + Education ({r.education?.length || 0})
                          </Button>
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => handleImportResumeSection(r, "projects")}
                            className="text-[11px] h-7 bg-white/10 text-white hover:bg-white/20 justify-start px-2"
                          >
                            + Projects ({r.projects?.length || 0})
                          </Button>
                        </div>
                      </div>
                    ))
                  )}
                  </div>
                </div>
              )}

              {/* TAB 4: ASSETS */}
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
                        disabled={isUploadingImage}
                        className="text-xs h-8 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold"
                      >
                        <User className="h-3.5 w-3.5 mr-1.5" />
                        Upload Avatar Photo
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => triggerFileUpload("cover")}
                        disabled={isUploadingImage}
                        className="text-xs h-8 border-white/15 text-white hover:bg-white/10 font-semibold"
                      >
                        <ImageIcon className="h-3.5 w-3.5 mr-1.5 text-cyan-400" />
                        Upload Cover Background
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
        <main className={`flex-1 min-w-0 ${getCanvasBgClass()} flex items-start justify-center p-4 lg:p-6 overflow-y-auto overflow-x-hidden relative`}>
          <div
            className={`transition-all duration-300 rounded-3xl border shadow-2xl flex flex-col overflow-hidden my-auto ${
              previewThemeMode === "light"
                ? "bg-white border-slate-200/90 shadow-slate-300/40 text-slate-900"
                : "bg-[#0d1422] border-white/15 shadow-2xl text-white"
            } ${
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
            <div className="p-6 sm:p-8 space-y-6">
              {blocks.filter(b => b.visible !== false).map((block) => {
                const isSelected = selectedBlockId === block.id;
                const isLight = previewThemeMode === "light";
                const containerStyle = getStudioBlockContainerStyle(
                  block.backgroundStyle,
                  isSelected,
                  activeThemeColor,
                  previewThemeMode
                );
                const theme = THEME_PALETTES[activeThemeColor] || THEME_PALETTES.emerald;

                const txtPrimary = isLight ? "text-slate-900" : "text-white";
                const txtSecondary = isLight ? "text-slate-600" : "text-white/70";
                const txtMuted = isLight ? "text-slate-500" : "text-white/50";
                const bdrSubtle = isLight ? "border-slate-200/90" : "border-white/10";
                const cardBgSubtle = isLight ? "border-slate-200/90 bg-slate-50/80 hover:bg-slate-100/80" : "border-white/10 bg-white/[0.03] hover:bg-white/[0.06]";
                const timelineRing = isLight ? "ring-white" : "ring-[#0d1422]";

                // HERO BLOCK
                if (block.type === "hero") {
                  return (
                    <div
                      key={block.id}
                      onClick={() => setSelectedBlockId(block.id)}
                      className={containerStyle}
                    >
                      {block.content?.coverUrl && (
                        <div
                          className={cn("h-36 -mx-6 sm:-mx-8 -mt-6 sm:-mt-8 mb-6 rounded-t-2xl bg-cover bg-center border-b", isLight ? "border-slate-200" : "border-white/10")}
                          style={{ backgroundImage: `url(${block.content.coverUrl})` }}
                        />
                      )}
                      <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 text-center sm:text-left">
                        <div className="relative group/avatar">
                          {block.content?.avatarUrl ? (
                            <img
                              src={block.content.avatarUrl}
                              alt="Profile Avatar"
                              className={cn("h-22 w-22 rounded-full object-cover border-2 shadow-md ring-4", isLight ? "ring-slate-100" : "ring-black/20", theme.accentBorder)}
                            />
                          ) : (
                            <div className={cn("h-22 w-22 rounded-full border-2 flex items-center justify-center text-2xl font-black shadow-md ring-4", isLight ? "ring-slate-100" : "ring-black/20", theme.accentBg, theme.accentBorder, theme.accentText)}>
                              {(block.title || profile?.full_name || "U").charAt(0).toUpperCase()}
                            </div>
                          )}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              triggerFileUpload("avatar");
                            }}
                            className={cn("absolute -bottom-1 -right-1 p-1.5 rounded-full text-white shadow-lg transition-transform hover:scale-105", theme.accentButton)}
                            title="Upload Avatar"
                          >
                            <UploadCloud className="h-3.5 w-3.5" />
                          </button>
                        </div>
                        <div className="space-y-1.5 flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2 justify-center sm:justify-start">
                            <h1 className={cn("text-2xl font-black tracking-tight", txtPrimary)}>{block.title}</h1>
                            {block.content?.openToWork && (
                              <span className={cn("inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border", theme.accentBadge)}>
                                <span className={cn("h-1.5 w-1.5 rounded-full animate-pulse", theme.accentText.replace("text-", "bg-"))} />
                                Available for Work
                              </span>
                            )}
                          </div>
                          <p className={cn("text-sm font-semibold", theme.accentText)}>
                            {block.content?.tagline || "Professional"}
                          </p>
                          <p className={cn("text-xs leading-relaxed max-w-xl", txtSecondary)}>
                            {stripHtml(block.content?.bio) || "Add your summary in the inspector on the right."}
                          </p>
                          {block.content?.ctaText && (
                            <div className="pt-2">
                              <span className={cn("inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold shadow", theme.accentButton)}>
                                {block.content.ctaText}
                                <ExternalLink className="h-3 w-3" />
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                }

                // SKILLS BLOCK
                if (block.type === "skills") {
                  const skillsList: string[] = block.content?.skills || ["TypeScript", "React", "Next.js"];

                  return (
                    <div
                      key={block.id}
                      onClick={() => setSelectedBlockId(block.id)}
                      className={containerStyle}
                    >
                      <div className="flex items-center justify-between gap-2 mb-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <Code2 className={cn("h-4 w-4 shrink-0", theme.accentText)} />
                            <h3 className={cn("text-base font-bold", txtPrimary)}>{block.title}</h3>
                          </div>
                          {block.subtitle && <p className={cn("text-xs mt-0.5", txtMuted)}>{block.subtitle}</p>}
                        </div>
                        <Badge variant="outline" className={cn("text-[10px] font-mono", theme.accentBorder, theme.accentTextLight)}>
                          {skillsList.length} skills
                        </Badge>
                      </div>

                      <div className="flex flex-wrap gap-2 mt-2">
                        {skillsList.map((sk: string, i: number) => (
                          <span
                            key={i}
                            className={cn(
                              "group/tag inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-mono font-semibold shadow-2xs transition-colors",
                              theme.accentBadge,
                              theme.accentBorderHover
                            )}
                          >
                            <span>{stripHtml(sk)}</span>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                const updated = skillsList.filter((_, idx) => idx !== i);
                                updateSelectedBlockContent({ skills: updated });
                              }}
                              className="opacity-0 group-hover/tag:opacity-100 hover:text-rose-400 transition-opacity ml-0.5"
                              title="Delete skill"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </span>
                        ))}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedBlockId(block.id);
                            setIsRightOpen(true);
                          }}
                          className={cn(
                            "inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-mono font-medium border border-dashed transition-colors",
                            isLight
                              ? "text-slate-500 border-slate-300 hover:text-slate-900"
                              : "text-white/50 border-white/20 hover:text-white",
                            theme.accentBorderHover,
                            `hover:${theme.accentTextLight}`
                          )}
                        >
                          <Plus className="h-3 w-3" />
                          <span>Add tag in Inspector</span>
                        </button>
                      </div>
                    </div>
                  );
                }

                // EXPERIENCE BLOCK
                if (block.type === "experience") {
                  const experiences = block.content?.experiences || [];

                  return (
                    <div
                      key={block.id}
                      onClick={() => setSelectedBlockId(block.id)}
                      className={containerStyle}
                    >
                      <div className="flex items-center justify-between gap-2 mb-4">
                        <div>
                          <div className="flex items-center gap-2">
                            <Briefcase className={cn("h-4 w-4 shrink-0", theme.accentText)} />
                            <h3 className={cn("text-base font-bold", txtPrimary)}>{block.title}</h3>
                          </div>
                          {block.subtitle && <p className={cn("text-xs mt-0.5", txtMuted)}>{block.subtitle}</p>}
                        </div>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedBlockId(block.id);
                            const updated = [
                              ...experiences,
                              {
                                company: "Company Name",
                                role: "Role Title",
                                period: "2023 - Present",
                                location: "Remote",
                                bullets: ["Describe your impact and achievements."]
                              }
                            ];
                            updateSelectedBlockContent({ experiences: updated });
                            toast.success("Added new experience entry");
                          }}
                          className={cn("text-[11px] h-7 px-2 border gap-1", theme.accentTextLight, theme.accentBorder, theme.accentBgHover)}
                        >
                          <Plus className="h-3 w-3" />
                          Add Role
                        </Button>
                      </div>

                      <div className="space-y-4 pt-1">
                        {experiences.length === 0 ? (
                          <div className={cn("p-4 rounded-xl border border-dashed text-center text-xs", isLight ? "border-slate-200 text-slate-500" : "border-white/10 text-white/40")}>
                            No work experiences yet. Click "+ Add Role" to get started.
                          </div>
                        ) : (
                          experiences.map((exp: any, i: number) => (
                            <div key={i} className={cn("border-l-2 pl-4 space-y-1 relative", theme.accentBorder)}>
                              <span className={cn("absolute -left-[5px] top-1.5 h-2 w-2 rounded-full ring-4", timelineRing, theme.accentText.replace("text-", "bg-"))} />
                              <div className="flex justify-between items-baseline flex-wrap gap-2">
                                <span className={cn("text-xs font-bold", txtPrimary)}>{stripHtml(exp.role)}</span>
                                <span className={cn("text-[11px] font-mono", txtMuted)}>{exp.period}</span>
                              </div>
                              <p className={cn("text-xs font-medium", theme.accentText)}>
                                {stripHtml(exp.company)}{exp.location ? ` • ${stripHtml(exp.location)}` : ""}
                              </p>
                              {exp.bullets && exp.bullets.length > 0 && (
                                <ul className={cn("list-disc list-inside text-xs space-y-1 mt-1.5 leading-relaxed", txtSecondary)}>
                                  {exp.bullets.map((b: string, bi: number) => (
                                    <li key={bi}>{stripHtml(b)}</li>
                                  ))}
                                </ul>
                              )}
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  );
                }

                // PROJECTS BLOCK
                if (block.type === "projects") {
                  const items = block.content?.items || [];

                  return (
                    <div
                      key={block.id}
                      onClick={() => setSelectedBlockId(block.id)}
                      className={containerStyle}
                    >
                      <div className="flex items-center justify-between gap-2 mb-4">
                        <div>
                          <div className="flex items-center gap-2">
                            <FolderGit2 className={cn("h-4 w-4 shrink-0", theme.accentText)} />
                            <h3 className={cn("text-base font-bold", txtPrimary)}>{block.title}</h3>
                          </div>
                          {block.subtitle && <p className={cn("text-xs mt-0.5", txtMuted)}>{block.subtitle}</p>}
                        </div>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedBlockId(block.id);
                            const updated = [
                              ...items,
                              {
                                name: "New Project",
                                desc: "Project description and key results delivered.",
                                tags: ["TypeScript", "React"],
                                link: "https://github.com"
                              }
                            ];
                            updateSelectedBlockContent({ items: updated });
                            toast.success("Added new project entry");
                          }}
                          className={cn("text-[11px] h-7 px-2 border gap-1", theme.accentTextLight, theme.accentBorder, theme.accentBgHover)}
                        >
                          <Plus className="h-3 w-3" />
                          Add Project
                        </Button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
                        {items.length === 0 ? (
                          <div className={cn("col-span-2 p-4 rounded-xl border border-dashed text-center text-xs", isLight ? "border-slate-200 text-slate-500" : "border-white/10 text-white/40")}>
                            No projects yet. Click "+ Add Project" to showcase work.
                          </div>
                        ) : (
                          items.map((proj: any, i: number) => (
                            <div key={i} className={cn("p-4 rounded-xl border space-y-2 group transition-all", cardBgSubtle, theme.accentBorderHover)}>
                              <div className="flex items-center justify-between gap-2">
                                <p className={cn("text-xs font-bold transition-colors", txtPrimary, `group-hover:${theme.accentTextLight}`)}>
                                  {stripHtml(proj.name)}
                                </p>
                                {proj.link && (
                                  <a
                                    href={proj.link}
                                    target="_blank"
                                    rel="noreferrer"
                                    onClick={e => e.stopPropagation()}
                                    className={cn("transition-colors", isLight ? "text-slate-400 hover:text-slate-900" : "text-white/40 hover:text-white", `hover:${theme.accentText}`)}
                                  >
                                    <ExternalLink className="h-3 w-3" />
                                  </a>
                                )}
                              </div>
                              <p className={cn("text-xs line-clamp-3 leading-relaxed", txtSecondary)}>{stripHtml(proj.desc)}</p>
                              {proj.tags && proj.tags.length > 0 && (
                                <div className="flex flex-wrap gap-1.5 pt-1">
                                  {proj.tags.map((tag: string, ti: number) => (
                                    <span key={ti} className={cn("text-[10px] px-2 py-0.5 rounded font-mono font-medium shadow-2xs", theme.accentBadge)}>
                                      {stripHtml(tag)}
                                    </span>
                                  ))}
                                </div>
                              )}
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  );
                }

                // EDUCATION BLOCK
                if (block.type === "education") {
                  const entries = block.content?.entries || [];

                  return (
                    <div
                      key={block.id}
                      onClick={() => setSelectedBlockId(block.id)}
                      className={containerStyle}
                    >
                      <div className="flex items-center justify-between gap-2 mb-4">
                        <div>
                          <div className="flex items-center gap-2">
                            <GraduationCap className={cn("h-4 w-4 shrink-0", theme.accentText)} />
                            <h3 className={cn("text-base font-bold", txtPrimary)}>{block.title}</h3>
                          </div>
                          {block.subtitle && <p className={cn("text-xs mt-0.5", txtMuted)}>{block.subtitle}</p>}
                        </div>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedBlockId(block.id);
                            const updated = [
                              ...entries,
                              {
                                institution: "University / Institution",
                                degree: "Degree / Certificate",
                                field: "Field of Study",
                                period: "2020 - 2024",
                                honors: "Honors or GPA"
                              }
                            ];
                            updateSelectedBlockContent({ entries: updated });
                            toast.success("Added education entry");
                          }}
                          className={cn("text-[11px] h-7 px-2 border gap-1", theme.accentTextLight, theme.accentBorder, theme.accentBgHover)}
                        >
                          <Plus className="h-3 w-3" />
                          Add Degree
                        </Button>
                      </div>

                      <div className="space-y-4 pt-1">
                        {entries.length === 0 ? (
                          <div className={cn("p-4 rounded-xl border border-dashed text-center text-xs", isLight ? "border-slate-200 text-slate-500" : "border-white/10 text-white/40")}>
                            No degrees added yet. Click "+ Add Degree" to specify education.
                          </div>
                        ) : (
                          entries.map((edu: any, i: number) => (
                            <div key={i} className={cn("border-l-2 pl-4 space-y-1 relative", theme.accentBorder)}>
                              <span className={cn("absolute -left-[5px] top-1.5 h-2 w-2 rounded-full ring-4", timelineRing, theme.accentText.replace("text-", "bg-"))} />
                              <div className="flex justify-between items-baseline flex-wrap gap-2">
                                <span className={cn("text-xs font-bold", txtPrimary)}>{stripHtml(edu.degree || edu.institution)}</span>
                                <span className={cn("text-[11px] font-mono", txtMuted)}>{edu.period}</span>
                              </div>
                              <p className={cn("text-xs font-medium", theme.accentText)}>
                                {stripHtml(edu.institution)}{edu.field ? ` • ${stripHtml(edu.field)}` : ""}
                              </p>
                              {edu.honors && (
                                <p className={cn("text-xs", txtSecondary)}>{stripHtml(edu.honors)}</p>
                              )}
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  );
                }

                // VIDEO PITCH BLOCK
                if (block.type === "video_pitch") {
                  const highlights = block.content?.highlights || [];
                  const videoUrl = block.content?.videoUrl;

                  return (
                    <div
                      key={block.id}
                      onClick={() => setSelectedBlockId(block.id)}
                      className={containerStyle}
                    >
                      <div className="flex items-center gap-2 mb-3">
                        <Video className={cn("h-4 w-4 shrink-0", theme.accentText)} />
                        <h3 className={cn("text-base font-bold", txtPrimary)}>{block.title}</h3>
                      </div>
                      {block.subtitle && <p className={cn("text-xs mb-3", txtMuted)}>{block.subtitle}</p>}

                      <div className={cn("p-5 rounded-xl border flex flex-col sm:flex-row items-center gap-4", theme.accentBorder, theme.accentBg)}>
                        <div className={cn("h-12 w-12 rounded-xl flex items-center justify-center shrink-0 shadow-sm", theme.accentBg, theme.accentText)}>
                          <Play className={cn("h-5 w-5 fill-current", theme.accentText)} />
                        </div>
                        <div className="space-y-1 text-center sm:text-left flex-1 min-w-0">
                          <h4 className={cn("text-xs font-bold", txtPrimary)}>
                            {stripHtml(block.content?.pitchTitle) || "60-Second Career Elevator Pitch"}
                          </h4>
                          <p className={cn("text-xs leading-relaxed", txtSecondary)}>
                            {stripHtml(block.content?.summary) || "Watch introduction highlighting core strengths and delivery results."}
                          </p>
                        </div>
                        {videoUrl && (
                          <span className={cn("text-[11px] px-2.5 py-1 rounded font-mono", theme.accentBadge)}>
                            Video Linked
                          </span>
                        )}
                      </div>

                      {highlights.length > 0 && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-3">
                          {highlights.map((h: string, hi: number) => (
                            <div key={hi} className={cn("p-2.5 rounded-lg border flex items-center gap-2", cardBgSubtle)}>
                              <CheckCircle2 className={cn("h-3 w-3 shrink-0", theme.accentText)} />
                              <span className={cn("text-xs", txtPrimary)}>{stripHtml(h)}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                }

                // WEB3 BADGES BLOCK
                if (block.type === "web3_badges") {
                  const badges = block.content?.badges || [];

                  return (
                    <div
                      key={block.id}
                      onClick={() => setSelectedBlockId(block.id)}
                      className={containerStyle}
                    >
                      <div className="flex items-center gap-2 mb-3">
                        <ShieldCheck className={cn("h-4 w-4 shrink-0", theme.accentText)} />
                        <h3 className={cn("text-base font-bold", txtPrimary)}>{block.title}</h3>
                      </div>
                      {block.subtitle && <p className={cn("text-xs mb-3", txtMuted)}>{block.subtitle}</p>}

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        {badges.map((badge: any, i: number) => (
                          <div key={i} className={cn("p-3.5 rounded-xl border flex items-center gap-3 transition-colors", theme.accentBorder, theme.accentBg, theme.accentBorderHover)}>
                            <Award className={cn("h-4 w-4 shrink-0", theme.accentText)} />
                            <div className="min-w-0 flex-1">
                              <p className={cn("text-xs font-bold truncate", txtPrimary)}>{stripHtml(badge.name)}</p>
                              <p className={cn("text-[10px]", txtMuted)}>{stripHtml(badge.issuer)} • {stripHtml(badge.date)}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                }

                // CONTACT BLOCK
                if (block.type === "contact") {
                  const email = block.content?.email || "engineer@resumeforge.io";
                  const phone = block.content?.phone;
                  const location = block.content?.location || "San Francisco, CA / Remote";
                  const linkedin = block.content?.linkedin;
                  const github = block.content?.github;
                  const website = block.content?.website;
                  const note = block.content?.note;

                  return (
                    <div
                      key={block.id}
                      onClick={() => setSelectedBlockId(block.id)}
                      className={containerStyle}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <Mail className={cn("h-4 w-4 shrink-0", theme.accentText)} />
                        <h3 className={cn("text-base font-bold", txtPrimary)}>{block.title}</h3>
                      </div>
                      {block.subtitle && <p className={cn("text-xs mb-3", txtMuted)}>{block.subtitle}</p>}
                      {note && <p className={cn("text-xs mb-3", txtSecondary)}>{stripHtml(note)}</p>}

                      <div className={cn("p-4 rounded-xl border flex flex-wrap gap-2.5 items-center", cardBgSubtle)}>
                        {email && (
                          <span className={cn("inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border", theme.accentBadge)}>
                            <Mail className="h-3.5 w-3.5" />
                            {stripHtml(email)}
                          </span>
                        )}
                        {phone && (
                          <span className={cn(
                            "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border",
                            isLight
                              ? "bg-blue-50 text-blue-700 border-blue-200"
                              : "bg-blue-500/15 text-blue-300 border-blue-500/30"
                          )}>
                            <Phone className="h-3.5 w-3.5" />
                            {stripHtml(phone)}
                          </span>
                        )}
                        {location && (
                          <span className={cn(
                            "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs",
                            isLight ? "bg-slate-200/80 text-slate-800" : "bg-white/10 text-white/70"
                          )}>
                            <Globe className={cn("h-3.5 w-3.5", theme.accentText)} />
                            {stripHtml(location)}
                          </span>
                        )}
                        {linkedin && (
                          <span className={cn(
                            "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs",
                            isLight ? "bg-slate-200/80 text-slate-800" : "bg-white/10 text-white/70"
                          )}>
                            <Linkedin className="h-3.5 w-3.5 text-blue-500" />
                            LinkedIn
                          </span>
                        )}
                        {github && (
                          <span className={cn(
                            "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs",
                            isLight ? "bg-slate-200/80 text-slate-800" : "bg-white/10 text-white/70"
                          )}>
                            <Github className="h-3.5 w-3.5" />
                            GitHub
                          </span>
                        )}
                        {website && (
                          <span className={cn(
                            "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs",
                            isLight ? "bg-slate-200/80 text-slate-800" : "bg-white/10 text-white/70"
                          )}>
                            <Globe className={cn("h-3.5 w-3.5", theme.accentText)} />
                            Website
                          </span>
                        )}
                      </div>
                    </div>
                  );
                }

                // Fallback Block
                return (
                  <div
                    key={block.id}
                    onClick={() => setSelectedBlockId(block.id)}
                    className={containerStyle}
                  >
                    <h3 className={cn("text-base font-bold", txtPrimary)}>{block.title}</h3>
                    {block.subtitle && <p className={cn("text-xs mb-2", txtMuted)}>{block.subtitle}</p>}
                    <div className={cn("p-4 rounded-lg border text-xs", isLight ? "bg-slate-100 border-slate-200 text-slate-600" : "bg-white/[0.02] border-white/5 text-white/60")}>
                      {String((block as any).type || "custom").toUpperCase()} block content
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </main>

        {/* Right Column: Deep Block Property Inspector */}
        {isRightOpen && (
          <aside className="w-80 xl:w-96 border-l border-white/10 bg-[#0c121e] p-5 flex flex-col shrink-0 overflow-y-auto space-y-5 z-20">
            {(() => {
              const currentTheme = THEME_PALETTES[activeThemeColor] || THEME_PALETTES.emerald;

              return (
                <>
                  <div className="flex items-center justify-between pb-3 border-b border-white/10">
                    <span className="text-xs font-bold uppercase tracking-wider text-white/80 flex items-center gap-2">
                      <Sliders className={cn("h-3.5 w-3.5", currentTheme.accentText)} />
                      Block Inspector
                    </span>
                    <Badge variant="outline" className={cn("text-[10px] font-mono border-white/20 uppercase", currentTheme.accentTextLight)}>
                      {selectedBlock?.type}
                    </Badge>
                  </div>

                  {selectedBlock ? (
                    <div className="space-y-5">
                      {/* BLOCK VISIBILITY TOGGLE */}
                      <div className="flex items-center justify-between p-3 rounded-xl border border-white/10 bg-white/[0.02]">
                        <div className="flex items-center gap-2.5">
                          {selectedBlock.visible !== false ? (
                            <Eye className={cn("h-4 w-4", currentTheme.accentText)} />
                          ) : (
                            <EyeOff className="h-4 w-4 text-amber-400" />
                          )}
                          <div>
                            <p className="text-xs font-semibold text-white">Block Visibility</p>
                            <p className="text-[10px] text-white/50">
                              {selectedBlock.visible !== false ? "Visible on public canvas" : "Hidden from public canvas"}
                            </p>
                          </div>
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            const nextVis = selectedBlock.visible === false;
                            setBlocks(prev => prev.map(b => b.id === selectedBlock.id ? { ...b, visible: nextVis } : b));
                            toast.success(nextVis ? `"${selectedBlock.title}" is now visible` : `"${selectedBlock.title}" hidden from canvas`);
                          }}
                          className={`text-xs h-7 px-3 font-semibold transition-all ${
                            selectedBlock.visible !== false
                              ? `${currentTheme.accentBadge} shadow-sm`
                              : "bg-amber-500/20 text-amber-300 border-amber-500/40 hover:bg-amber-500/30"
                          }`}
                        >
                          {selectedBlock.visible !== false ? "Visible" : "Hidden"}
                        </Button>
                      </div>

                      {/* SECTION 1: HEADER & SUBTITLE */}
                      <div className="space-y-3 p-3.5 rounded-xl border border-white/10 bg-white/[0.02]">
                        <span className="text-[11px] font-bold text-white/70 uppercase tracking-wider">
                          Header Details
                        </span>
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-semibold text-white/50 uppercase">Section Title</label>
                          <Input
                            value={selectedBlock.title}
                            onChange={(e) => {
                              const val = e.target.value;
                              setBlocks(prev => prev.map(b => b.id === selectedBlock.id ? { ...b, title: val } : b));
                            }}
                            className="bg-black/40 border-white/15 text-white text-xs h-9"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-semibold text-white/50 uppercase">Section Subtitle</label>
                          <Input
                            value={selectedBlock.subtitle || ""}
                            onChange={(e) => {
                              const val = e.target.value;
                              setBlocks(prev => prev.map(b => b.id === selectedBlock.id ? { ...b, subtitle: val } : b));
                            }}
                            placeholder="Optional section description..."
                            className="bg-black/40 border-white/15 text-white text-xs h-9"
                          />
                        </div>
                      </div>

                      {/* SECTION 2: VISUAL THEME STYLE */}
                      <div className="space-y-2 p-3.5 rounded-xl border border-white/10 bg-white/[0.02]">
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-bold text-white/70 uppercase tracking-wider">
                            Visual Theme Style
                          </span>
                          <span className={cn("text-[10px] font-mono capitalize", currentTheme.accentTextLight)}>
                            {selectedBlock.backgroundStyle}
                          </span>
                        </div>
                        <div className="grid grid-cols-2 gap-2 pt-1">
                          {(["clean", "glass", "gradient", "mesh"] as const).map((style) => (
                            <Button
                              key={style}
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setBlocks(prev => prev.map(b => b.id === selectedBlock.id ? { ...b, backgroundStyle: style } : b));
                                toast.success(`Set block theme style to "${style}"`);
                              }}
                              className={`text-xs h-8 capitalize font-semibold transition-all ${
                                selectedBlock.backgroundStyle === style
                                  ? `${currentTheme.accentBadge} ring-1 ring-white/20 shadow-md`
                                  : "border-white/10 bg-white/[0.02] text-white/70 hover:bg-white/10 hover:text-white"
                              }`}
                            >
                              {style}
                            </Button>
                          ))}
                        </div>
                      </div>

                {/* SECTION 3: SPECIFIC CONTENT EDITORS ACCORDING TO TYPE */}

                {/* HERO EDITOR */}
                {selectedBlock.type === "hero" && (
                  <div className="space-y-3.5 p-3.5 rounded-xl border border-white/10 bg-white/[0.02]">
                    <span className="text-[11px] font-bold text-white/70 uppercase tracking-wider">
                      Hero & Bio Content
                    </span>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-semibold text-white/50 uppercase">Tagline / Headline</label>
                      <Input
                        value={selectedBlock.content?.tagline || ""}
                        onChange={(e) => updateSelectedBlockContent({ tagline: e.target.value })}
                        placeholder="e.g. Senior Fullstack Engineer & Distributed Architect"
                        className="bg-black/40 border-white/15 text-white text-xs h-9"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-semibold text-white/50 uppercase">Bio / Summary</label>
                      <Textarea
                        rows={3}
                        value={selectedBlock.content?.bio || ""}
                        onChange={(e) => updateSelectedBlockContent({ bio: e.target.value })}
                        placeholder="Career summary and high-impact background..."
                        className="bg-black/40 border-white/15 text-white text-xs"
                      />
                    </div>
                    <div className="flex items-center justify-between p-2.5 rounded-lg border border-white/10 bg-black/20">
                      <span className="text-xs text-white/80 font-medium">Available for Work Badge</span>
                      <button
                        onClick={() => updateSelectedBlockContent({ openToWork: !selectedBlock.content?.openToWork })}
                        className={`px-3 py-1 rounded-full text-xs font-semibold transition-all ${
                          selectedBlock.content?.openToWork
                            ? "bg-emerald-500 text-black font-bold"
                            : "bg-white/10 text-white/50"
                        }`}
                      >
                        {selectedBlock.content?.openToWork ? "Enabled" : "Disabled"}
                      </button>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-1">
                        <label className="text-[10px] font-semibold text-white/50 uppercase">CTA Button Text</label>
                        <Input
                          value={selectedBlock.content?.ctaText || ""}
                          onChange={(e) => updateSelectedBlockContent({ ctaText: e.target.value })}
                          placeholder="e.g. Get in Touch"
                          className="bg-black/40 border-white/15 text-white text-xs h-8"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-semibold text-white/50 uppercase">CTA Link</label>
                        <Input
                          value={selectedBlock.content?.ctaLink || ""}
                          onChange={(e) => updateSelectedBlockContent({ ctaLink: e.target.value })}
                          placeholder="#contact or URL"
                          className="bg-black/40 border-white/15 text-white text-xs h-8"
                        />
                      </div>
                    </div>
                    <div className="pt-2 border-t border-white/10 flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => triggerFileUpload("avatar")}
                        className="flex-1 text-xs h-8 bg-emerald-600 hover:bg-emerald-500 text-white"
                      >
                        Upload Avatar
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => triggerFileUpload("cover")}
                        className="flex-1 text-xs h-8 border-white/15 text-white hover:bg-white/10"
                      >
                        Upload Cover
                      </Button>
                    </div>
                  </div>
                )}

                {/* SKILLS EDITOR */}
                {selectedBlock.type === "skills" && (
                  <div className="space-y-3.5 p-3.5 rounded-xl border border-white/10 bg-white/[0.02]">
                    <span className="text-[11px] font-bold text-white/70 uppercase tracking-wider">
                      Technical Skills Editor
                    </span>

                    {/* Quick Add Tag */}
                    <div className="flex gap-2">
                      <Input
                        value={newSkillInput}
                        onChange={(e) => setNewSkillInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && newSkillInput.trim()) {
                            e.preventDefault();
                            const current: string[] = selectedBlock.content?.skills || [];
                            if (!current.includes(newSkillInput.trim())) {
                              updateSelectedBlockContent({ skills: [...current, newSkillInput.trim()] });
                              setNewSkillInput("");
                            }
                          }
                        }}
                        placeholder="Add skill tag (press Enter)..."
                        className="bg-black/40 border-white/15 text-white text-xs h-8 flex-1"
                      />
                      <Button
                        size="sm"
                        onClick={() => {
                          if (newSkillInput.trim()) {
                            const current: string[] = selectedBlock.content?.skills || [];
                            if (!current.includes(newSkillInput.trim())) {
                              updateSelectedBlockContent({ skills: [...current, newSkillInput.trim()] });
                              setNewSkillInput("");
                            }
                          }
                        }}
                        className="text-xs h-8 bg-emerald-600 hover:bg-emerald-500 text-white px-3 font-semibold"
                      >
                        Add
                      </Button>
                    </div>

                    {/* Skill Tag Chips */}
                    <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto p-1 border border-white/5 rounded-lg bg-black/20">
                      {(selectedBlock.content?.skills || []).map((sk: string, i: number) => (
                        <span
                          key={i}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-mono bg-white/10 text-white/90"
                        >
                          {sk}
                          <button
                            onClick={() => {
                              const updated = (selectedBlock.content?.skills || []).filter((_: any, idx: number) => idx !== i);
                              updateSelectedBlockContent({ skills: updated });
                            }}
                            className="text-white/40 hover:text-rose-400"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </span>
                      ))}
                    </div>

                    {/* Bulk Comma-Separated Quick Editor */}
                    <div className="space-y-1">
                      <label className="text-[10px] font-semibold text-white/50 uppercase">
                        Quick Comma-Separated Edit
                      </label>
                      <Textarea
                        rows={3}
                        value={(selectedBlock.content?.skills || []).join(", ")}
                        onChange={(e) => {
                          const parsed = e.target.value
                            .split(",")
                            .map(s => s.trim())
                            .filter(Boolean);
                          updateSelectedBlockContent({ skills: parsed });
                        }}
                        placeholder="TypeScript, React, Next.js, Node.js..."
                        className="bg-black/40 border-white/15 text-white text-xs font-mono"
                      />
                    </div>
                  </div>
                )}

                {/* EXPERIENCE EDITOR */}
                {selectedBlock.type === "experience" && (
                  <div className="space-y-3.5 p-3.5 rounded-xl border border-white/10 bg-white/[0.02]">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-white/70 uppercase tracking-wider">
                        Work Experience Entries
                      </span>
                      <Button
                        size="sm"
                        onClick={() => {
                          const current = selectedBlock.content?.experiences || [];
                          const updated = [
                            ...current,
                            {
                              company: "New Company",
                              role: "Job Title",
                              period: "2023 - Present",
                              location: "San Francisco, CA",
                              bullets: ["Engineered scalable services and improved team delivery."]
                            }
                          ];
                          updateSelectedBlockContent({ experiences: updated });
                          toast.success("Added new role");
                        }}
                        className="text-[11px] h-7 px-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold gap-1"
                      >
                        <Plus className="h-3 w-3" />
                        Add Role
                      </Button>
                    </div>

                    <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
                      {(selectedBlock.content?.experiences || []).map((exp: any, expIdx: number) => (
                        <div key={expIdx} className="p-3 rounded-xl border border-white/10 bg-black/30 space-y-2.5">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-emerald-400">#{expIdx + 1} Role</span>
                            <button
                              onClick={() => {
                                const current = selectedBlock.content?.experiences || [];
                                const updated = current.filter((_: any, idx: number) => idx !== expIdx);
                                updateSelectedBlockContent({ experiences: updated });
                              }}
                              className="text-white/40 hover:text-rose-400 p-1"
                              title="Delete this role"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>

                          <div className="grid grid-cols-2 gap-2">
                            <div className="space-y-1">
                              <label className="text-[10px] text-white/50 uppercase">Company</label>
                              <Input
                                value={exp.company}
                                onChange={(e) => {
                                  const list = [...(selectedBlock.content?.experiences || [])];
                                  list[expIdx].company = e.target.value;
                                  updateSelectedBlockContent({ experiences: list });
                                }}
                                className="bg-black/50 border-white/15 text-white text-xs h-8"
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="text-[10px] text-white/50 uppercase">Role / Title</label>
                              <Input
                                value={exp.role}
                                onChange={(e) => {
                                  const list = [...(selectedBlock.content?.experiences || [])];
                                  list[expIdx].role = e.target.value;
                                  updateSelectedBlockContent({ experiences: list });
                                }}
                                className="bg-black/50 border-white/15 text-white text-xs h-8"
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-2">
                            <div className="space-y-1">
                              <label className="text-[10px] text-white/50 uppercase">Period</label>
                              <Input
                                value={exp.period}
                                onChange={(e) => {
                                  const list = [...(selectedBlock.content?.experiences || [])];
                                  list[expIdx].period = e.target.value;
                                  updateSelectedBlockContent({ experiences: list });
                                }}
                                className="bg-black/50 border-white/15 text-white text-xs h-8"
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="text-[10px] text-white/50 uppercase">Location</label>
                              <Input
                                value={exp.location || ""}
                                onChange={(e) => {
                                  const list = [...(selectedBlock.content?.experiences || [])];
                                  list[expIdx].location = e.target.value;
                                  updateSelectedBlockContent({ experiences: list });
                                }}
                                className="bg-black/50 border-white/15 text-white text-xs h-8"
                              />
                            </div>
                          </div>

                          {/* Bullet Points */}
                          <div className="space-y-1.5 pt-1 border-t border-white/10">
                            <div className="flex items-center justify-between">
                              <label className="text-[10px] text-white/50 uppercase font-semibold">
                                Bullet Achievements ({exp.bullets?.length || 0})
                              </label>
                              <button
                                onClick={() => {
                                  const list = [...(selectedBlock.content?.experiences || [])];
                                  list[expIdx].bullets = [...(list[expIdx].bullets || []), "New achievement bullet point."];
                                  updateSelectedBlockContent({ experiences: list });
                                }}
                                className="text-[10px] text-emerald-400 hover:text-emerald-300 font-semibold"
                              >
                                + Add Bullet
                              </button>
                            </div>
                            {(exp.bullets || []).map((b: string, bi: number) => (
                              <div key={bi} className="flex gap-1.5 items-start">
                                <Textarea
                                  rows={2}
                                  value={b}
                                  onChange={(e) => {
                                    const list = [...(selectedBlock.content?.experiences || [])];
                                    list[expIdx].bullets[bi] = e.target.value;
                                    updateSelectedBlockContent({ experiences: list });
                                  }}
                                  className="bg-black/50 border-white/15 text-white text-xs flex-1"
                                />
                                <button
                                  onClick={() => {
                                    const list = [...(selectedBlock.content?.experiences || [])];
                                    list[expIdx].bullets = list[expIdx].bullets.filter((_: any, idx: number) => idx !== bi);
                                    updateSelectedBlockContent({ experiences: list });
                                  }}
                                  className="text-white/40 hover:text-rose-400 p-1 mt-1"
                                >
                                  <X className="h-3 w-3" />
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* PROJECTS EDITOR */}
                {selectedBlock.type === "projects" && (
                  <div className="space-y-3.5 p-3.5 rounded-xl border border-white/10 bg-white/[0.02]">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-white/70 uppercase tracking-wider">
                        Projects Showcase
                      </span>
                      <Button
                        size="sm"
                        onClick={() => {
                          const current = selectedBlock.content?.items || [];
                          const updated = [
                            ...current,
                            {
                              name: "New Feature / Platform",
                              desc: "Project details, impact, and architectural components.",
                              tags: ["TypeScript", "Next.js"],
                              link: "https://github.com"
                            }
                          ];
                          updateSelectedBlockContent({ items: updated });
                          toast.success("Added new project");
                        }}
                        className="text-[11px] h-7 px-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold gap-1"
                      >
                        <Plus className="h-3 w-3" />
                        Add Project
                      </Button>
                    </div>

                    <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
                      {(selectedBlock.content?.items || []).map((proj: any, pIdx: number) => (
                        <div key={pIdx} className="p-3 rounded-xl border border-white/10 bg-black/30 space-y-2.5">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-emerald-400">#{pIdx + 1} Project</span>
                            <button
                              onClick={() => {
                                const current = selectedBlock.content?.items || [];
                                const updated = current.filter((_: any, idx: number) => idx !== pIdx);
                                updateSelectedBlockContent({ items: updated });
                              }}
                              className="text-white/40 hover:text-rose-400 p-1"
                              title="Delete project"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>

                          <div className="space-y-1">
                            <label className="text-[10px] text-white/50 uppercase">Project Name</label>
                            <Input
                              value={proj.name}
                              onChange={(e) => {
                                const list = [...(selectedBlock.content?.items || [])];
                                list[pIdx].name = e.target.value;
                                updateSelectedBlockContent({ items: list });
                              }}
                              className="bg-black/50 border-white/15 text-white text-xs h-8"
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="text-[10px] text-white/50 uppercase">Description</label>
                            <Textarea
                              rows={2}
                              value={proj.desc}
                              onChange={(e) => {
                                const list = [...(selectedBlock.content?.items || [])];
                                list[pIdx].desc = e.target.value;
                                updateSelectedBlockContent({ items: list });
                              }}
                              className="bg-black/50 border-white/15 text-white text-xs"
                            />
                          </div>

                          <div className="grid grid-cols-2 gap-2">
                            <div className="space-y-1">
                              <label className="text-[10px] text-white/50 uppercase">Project Link</label>
                              <Input
                                value={proj.link || ""}
                                onChange={(e) => {
                                  const list = [...(selectedBlock.content?.items || [])];
                                  list[pIdx].link = e.target.value;
                                  updateSelectedBlockContent({ items: list });
                                }}
                                placeholder="https://..."
                                className="bg-black/50 border-white/15 text-white text-xs h-8"
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="text-[10px] text-white/50 uppercase">Tags (comma-separated)</label>
                              <Input
                                value={(proj.tags || []).join(", ")}
                                onChange={(e) => {
                                  const list = [...(selectedBlock.content?.items || [])];
                                  list[pIdx].tags = e.target.value.split(",").map(t => t.trim()).filter(Boolean);
                                  updateSelectedBlockContent({ items: list });
                                }}
                                placeholder="Next.js, Supabase..."
                                className="bg-black/50 border-white/15 text-white text-xs h-8 font-mono"
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* EDUCATION EDITOR */}
                {selectedBlock.type === "education" && (
                  <div className="space-y-3.5 p-3.5 rounded-xl border border-white/10 bg-white/[0.02]">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-white/70 uppercase tracking-wider">
                        Education & Degrees
                      </span>
                      <Button
                        size="sm"
                        onClick={() => {
                          const current = selectedBlock.content?.entries || [];
                          const updated = [
                            ...current,
                            {
                              institution: "University Name",
                              degree: "B.S. in Computer Science",
                              field: "Software Engineering",
                              period: "2019 - 2023",
                              honors: "Magna Cum Laude"
                            }
                          ];
                          updateSelectedBlockContent({ entries: updated });
                          toast.success("Added education entry");
                        }}
                        className="text-[11px] h-7 px-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold gap-1"
                      >
                        <Plus className="h-3 w-3" />
                        Add Degree
                      </Button>
                    </div>

                    <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
                      {(selectedBlock.content?.entries || []).map((edu: any, eIdx: number) => (
                        <div key={eIdx} className="p-3 rounded-xl border border-white/10 bg-black/30 space-y-2.5">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-emerald-400">#{eIdx + 1} Degree</span>
                            <button
                              onClick={() => {
                                const current = selectedBlock.content?.entries || [];
                                const updated = current.filter((_: any, idx: number) => idx !== eIdx);
                                updateSelectedBlockContent({ entries: updated });
                              }}
                              className="text-white/40 hover:text-rose-400 p-1"
                              title="Delete degree"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>

                          <div className="space-y-1">
                            <label className="text-[10px] text-white/50 uppercase">Institution / University</label>
                            <Input
                              value={edu.institution}
                              onChange={(e) => {
                                const list = [...(selectedBlock.content?.entries || [])];
                                list[eIdx].institution = e.target.value;
                                updateSelectedBlockContent({ entries: list });
                              }}
                              className="bg-black/50 border-white/15 text-white text-xs h-8"
                            />
                          </div>

                          <div className="grid grid-cols-2 gap-2">
                            <div className="space-y-1">
                              <label className="text-[10px] text-white/50 uppercase">Degree</label>
                              <Input
                                value={edu.degree}
                                onChange={(e) => {
                                  const list = [...(selectedBlock.content?.entries || [])];
                                  list[eIdx].degree = e.target.value;
                                  updateSelectedBlockContent({ entries: list });
                                }}
                                className="bg-black/50 border-white/15 text-white text-xs h-8"
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="text-[10px] text-white/50 uppercase">Field of Study</label>
                              <Input
                                value={edu.field || ""}
                                onChange={(e) => {
                                  const list = [...(selectedBlock.content?.entries || [])];
                                  list[eIdx].field = e.target.value;
                                  updateSelectedBlockContent({ entries: list });
                                }}
                                className="bg-black/50 border-white/15 text-white text-xs h-8"
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-2">
                            <div className="space-y-1">
                              <label className="text-[10px] text-white/50 uppercase">Period / Year</label>
                              <Input
                                value={edu.period}
                                onChange={(e) => {
                                  const list = [...(selectedBlock.content?.entries || [])];
                                  list[eIdx].period = e.target.value;
                                  updateSelectedBlockContent({ entries: list });
                                }}
                                className="bg-black/50 border-white/15 text-white text-xs h-8"
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="text-[10px] text-white/50 uppercase">Honors / GPA</label>
                              <Input
                                value={edu.honors || ""}
                                onChange={(e) => {
                                  const list = [...(selectedBlock.content?.entries || [])];
                                  list[eIdx].honors = e.target.value;
                                  updateSelectedBlockContent({ entries: list });
                                }}
                                className="bg-black/50 border-white/15 text-white text-xs h-8"
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* VIDEO PITCH EDITOR */}
                {selectedBlock.type === "video_pitch" && (
                  <div className="space-y-3.5 p-3.5 rounded-xl border border-white/10 bg-white/[0.02]">
                    <span className="text-[11px] font-bold text-white/70 uppercase tracking-wider">
                      Video Pitch Settings
                    </span>
                    <div className="space-y-1">
                      <label className="text-[10px] text-white/50 uppercase">Video URL (YouTube, Loom, MP4)</label>
                      <Input
                        value={selectedBlock.content?.videoUrl || ""}
                        onChange={(e) => updateSelectedBlockContent({ videoUrl: e.target.value })}
                        placeholder="https://www.youtube.com/watch?v=..."
                        className="bg-black/50 border-white/15 text-white text-xs h-8"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] text-white/50 uppercase">Pitch Headline</label>
                      <Input
                        value={selectedBlock.content?.pitchTitle || ""}
                        onChange={(e) => updateSelectedBlockContent({ pitchTitle: e.target.value })}
                        placeholder="e.g. 60-Second Video Pitch"
                        className="bg-black/50 border-white/15 text-white text-xs h-8"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] text-white/50 uppercase">Summary Note</label>
                      <Textarea
                        rows={2}
                        value={selectedBlock.content?.summary || ""}
                        onChange={(e) => updateSelectedBlockContent({ summary: e.target.value })}
                        className="bg-black/50 border-white/15 text-white text-xs"
                      />
                    </div>
                  </div>
                )}

                {/* WEB3 BADGES / CREDENTIALS EDITOR */}
                {selectedBlock.type === "web3_badges" && (
                  <div className="space-y-3.5 p-3.5 rounded-xl border border-white/10 bg-white/[0.02]">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-white/70 uppercase tracking-wider">
                        Badges & Credentials
                      </span>
                      <Button
                        size="sm"
                        onClick={() => {
                          const current = selectedBlock.content?.badges || [];
                          const updated = [
                            ...current,
                            {
                              name: "Certified Solutions Architect",
                              issuer: "AWS / Cloud Authority",
                              date: "2026",
                              verifyUrl: "https://resumeforge.io"
                            }
                          ];
                          updateSelectedBlockContent({ badges: updated });
                          toast.success("Added credential");
                        }}
                        className="text-[11px] h-7 px-2.5 bg-purple-600 hover:bg-purple-500 text-white font-semibold gap-1"
                      >
                        <Plus className="h-3 w-3" />
                        Add Badge
                      </Button>
                    </div>

                    <div className="space-y-2.5 max-h-[350px] overflow-y-auto pr-1">
                      {(selectedBlock.content?.badges || []).map((badge: any, bIdx: number) => (
                        <div key={bIdx} className="p-3 rounded-xl border border-white/10 bg-black/30 space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-purple-400">Credential #{bIdx + 1}</span>
                            <button
                              onClick={() => {
                                const current = selectedBlock.content?.badges || [];
                                const updated = current.filter((_: any, idx: number) => idx !== bIdx);
                                updateSelectedBlockContent({ badges: updated });
                              }}
                              className="text-white/40 hover:text-rose-400 p-1"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                          <Input
                            value={badge.name}
                            onChange={(e) => {
                              const list = [...(selectedBlock.content?.badges || [])];
                              list[bIdx].name = e.target.value;
                              updateSelectedBlockContent({ badges: list });
                            }}
                            placeholder="Badge Title"
                            className="bg-black/50 border-white/15 text-white text-xs h-8"
                          />
                          <div className="grid grid-cols-2 gap-2">
                            <Input
                              value={badge.issuer}
                              onChange={(e) => {
                                const list = [...(selectedBlock.content?.badges || [])];
                                list[bIdx].issuer = e.target.value;
                                updateSelectedBlockContent({ badges: list });
                              }}
                              placeholder="Issuer"
                              className="bg-black/50 border-white/15 text-white text-xs h-8"
                            />
                            <Input
                              value={badge.date}
                              onChange={(e) => {
                                const list = [...(selectedBlock.content?.badges || [])];
                                list[bIdx].date = e.target.value;
                                updateSelectedBlockContent({ badges: list });
                              }}
                              placeholder="Date / Year"
                              className="bg-black/50 border-white/15 text-white text-xs h-8"
                            />
                          </div>
                          <Input
                            value={badge.verifyUrl || ""}
                            onChange={(e) => {
                              const list = [...(selectedBlock.content?.badges || [])];
                              list[bIdx].verifyUrl = e.target.value;
                              updateSelectedBlockContent({ badges: list });
                            }}
                            placeholder="Verification URL (optional)"
                            className="bg-black/50 border-white/15 text-white text-xs h-8"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* CONTACT EDITOR */}
                {selectedBlock.type === "contact" && (
                  <div className="space-y-3.5 p-3.5 rounded-xl border border-white/10 bg-white/[0.02]">
                    <span className="text-[11px] font-bold text-white/70 uppercase tracking-wider">
                      Contact Channels & Details
                    </span>
                    <div className="space-y-1">
                      <label className="text-[10px] text-white/50 uppercase">Email Address</label>
                      <Input
                        value={selectedBlock.content?.email || ""}
                        onChange={(e) => updateSelectedBlockContent({ email: e.target.value })}
                        placeholder="engineer@resumeforge.io"
                        className="bg-black/50 border-white/15 text-white text-xs h-8"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] text-white/50 uppercase">Phone Number</label>
                      <Input
                        value={selectedBlock.content?.phone || ""}
                        onChange={(e) => updateSelectedBlockContent({ phone: e.target.value })}
                        placeholder="+1 (555) 000-0000"
                        className="bg-black/50 border-white/15 text-white text-xs h-8"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] text-white/50 uppercase">Location / City</label>
                      <Input
                        value={selectedBlock.content?.location || ""}
                        onChange={(e) => updateSelectedBlockContent({ location: e.target.value })}
                        placeholder="San Francisco, CA / Remote"
                        className="bg-black/50 border-white/15 text-white text-xs h-8"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-1">
                        <label className="text-[10px] text-white/50 uppercase">LinkedIn URL</label>
                        <Input
                          value={selectedBlock.content?.linkedin || ""}
                          onChange={(e) => updateSelectedBlockContent({ linkedin: e.target.value })}
                          placeholder="https://linkedin.com/in/..."
                          className="bg-black/50 border-white/15 text-white text-xs h-8"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] text-white/50 uppercase">GitHub URL</label>
                        <Input
                          value={selectedBlock.content?.github || ""}
                          onChange={(e) => updateSelectedBlockContent({ github: e.target.value })}
                          placeholder="https://github.com/..."
                          className="bg-black/50 border-white/15 text-white text-xs h-8"
                        />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] text-white/50 uppercase">Portfolio / Website Link</label>
                      <Input
                        value={selectedBlock.content?.website || ""}
                        onChange={(e) => updateSelectedBlockContent({ website: e.target.value })}
                        placeholder="https://..."
                        className="bg-black/50 border-white/15 text-white text-xs h-8"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] text-white/50 uppercase">Availability Note</label>
                      <Textarea
                        rows={2}
                        value={selectedBlock.content?.note || ""}
                        onChange={(e) => updateSelectedBlockContent({ note: e.target.value })}
                        placeholder="Available for full-time roles & consulting..."
                        className="bg-black/50 border-white/15 text-white text-xs"
                      />
                    </div>
                  </div>
                )}

                {/* DELETE BLOCK BUTTON */}
                <div className="pt-2 border-t border-white/10">
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDeleteBlock(selectedBlock.id)}
                    className="w-full text-xs h-8 bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 border border-rose-500/30 font-semibold"
                  >
                    <Trash2 className="h-3.5 w-3.5 mr-1.5" />
                    Remove Block From Canvas
                  </Button>
                </div>
              </div>
            ) : (
              <p className="text-xs text-white/40">Select a block on the canvas to configure properties.</p>
            )}
                </>
              );
            })()}
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
