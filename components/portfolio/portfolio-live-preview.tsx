"use client";

import { useMemo } from "react";
import { Monitor, Eye } from "lucide-react";
import {
  ModernTemplate,
  MinimalTemplate,
  CorporateTemplate,
  CreativeTemplate,
} from "@/components/portfolio/templates";

interface PortfolioLivePreviewProps {
  portfolio: any;
  resumes: any[];
  projects: any[];
  profile: any;
  testimonials: any[];
}

export function PortfolioLivePreview({
  portfolio,
  resumes,
  projects,
  profile,
  testimonials,
}: PortfolioLivePreviewProps) {
  const templateProps = useMemo(
    () => ({
      portfolio,
      resumes: resumes || [],
      projects: projects || [],
      profile: profile || {},
      testimonials: testimonials || [],
      accentColor: portfolio?.accent_color || "#3b82f6",
      layoutStyle: portfolio?.theme_settings?.style || "professional",
    }),
    [portfolio, resumes, projects, profile, testimonials]
  );

  const template = portfolio?.template || "modern";

  const TemplateComponent = useMemo(() => {
    switch (template) {
      case "minimal":
        return MinimalTemplate;
      case "corporate":
        return CorporateTemplate;
      case "creative":
        return CreativeTemplate;
      case "modern":
      default:
        return ModernTemplate;
    }
  }, [template]);

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-none border border-[#102b2b]/15 bg-[#0f1f1f]">
      {/* Browser chrome bar */}
      <div className="flex shrink-0 items-center gap-2 border-b border-white/10 bg-[#1a2e2e] px-4 py-3">
        <div className="flex items-center gap-1.5">
          <div className="h-2.5 w-2.5 rounded-full bg-red-500/70" />
          <div className="h-2.5 w-2.5 rounded-full bg-yellow-500/70" />
          <div className="h-2.5 w-2.5 rounded-full bg-green-500/70" />
        </div>
        <div className="mx-3 flex flex-1 items-center gap-2 rounded-sm bg-white/5 px-3 py-1.5">
          <Eye className="h-3 w-3 shrink-0 text-white/30" />
          <span className="truncate font-mono text-[10px] text-white/40">
            /p/{portfolio?.slug || "your-portfolio"}
          </span>
        </div>
        <div className="flex items-center gap-1 rounded-sm bg-[#d8f36b]/20 px-2 py-1">
          <Monitor className="h-3 w-3 text-[#d8f36b]" />
          <span className="text-[9px] font-black uppercase tracking-widest text-[#d8f36b]">
            Live
          </span>
        </div>
      </div>

      {/* Scaled preview viewport */}
      <div className="relative flex-1 overflow-hidden">
        <div
          className="absolute inset-0 origin-top-left overflow-y-auto"
          style={{
            width: "calc(100% / 0.45)",
            height: "calc(100% / 0.45)",
            transform: "scale(0.45)",
            transformOrigin: "top left",
          }}
        >
          <TemplateComponent {...templateProps} />
        </div>
        {/* Overlay to prevent interaction with the preview */}
        <div className="absolute inset-0 z-10 cursor-not-allowed" />
      </div>
    </div>
  );
}
