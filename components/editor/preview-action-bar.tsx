"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Printer, Edit3, ShieldCheck, Share2, Globe2 } from "lucide-react";
import { toast } from "sonner";
import { MultilingualLocalizationDialog } from "@/components/resume/multilingual-localization-dialog";

interface PreviewActionBarProps {
  resumeId?: string;
  title: string;
  updatedAtText?: string;
}

export function PreviewActionBar({ resumeId, title, updatedAtText }: PreviewActionBarProps) {
  const [localizeOpen, setLocalizeOpen] = useState(false);
  const handlePrint = () => {
    if (typeof window !== "undefined") {
      window.print();
    }
  };

  const handleShare = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      toast.success("Preview link copied to clipboard!");
    }
  };

  return (
    <header className="sticky top-0 z-40 px-4 py-3 bg-black/85 backdrop-blur-md border-b border-white/10 flex items-center justify-between print:hidden">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" asChild className="text-neutral-300 hover:text-white gap-1.5">
          <Link href={resumeId ? `/dashboard/resume/${resumeId}` : "/dashboard"}>
            <ArrowLeft className="w-4 h-4" /> Back to Editor
          </Link>
        </Button>
        <div className="h-4 w-px bg-white/20 hidden sm:block" />
        <div>
          <h1 className="text-sm font-bold text-white flex items-center gap-2">
            {title}
            <span className="px-2 py-0.5 text-[10px] rounded-full bg-emerald-500/20 text-emerald-400 font-mono flex items-center gap-1">
              <ShieldCheck className="w-3 h-3" /> Ready for Print / ATS
            </span>
          </h1>
          {updatedAtText && (
            <p className="text-[11px] text-neutral-400 hidden sm:block">
              Updated {updatedAtText}
            </p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Button
          size="sm"
          variant="outline"
          onClick={handleShare}
          className="text-xs border-white/20 text-white bg-white/5 hover:bg-white/10"
        >
          <Share2 className="w-3.5 h-3.5 mr-1.5" /> Share
        </Button>

        {resumeId && (
          <Button size="sm" variant="outline" asChild className="text-xs border-white/20 text-white bg-white/5 hover:bg-white/10">
            <Link href={`/dashboard/resume/${resumeId}`}>
              <Edit3 className="w-3.5 h-3.5 mr-1.5" /> Edit Resume
            </Link>
          </Button>
        )}

        <Button
          size="sm"
          variant="outline"
          onClick={() => setLocalizeOpen(true)}
          className="text-xs border-emerald-500/30 text-emerald-300 bg-emerald-500/10 hover:bg-emerald-500/20"
        >
          <Globe2 className="w-3.5 h-3.5 mr-1.5" /> Localize (Lebenslauf/JIS)
        </Button>

        <Button
          size="sm"
          onClick={handlePrint}
          className="text-xs bg-emerald-600 hover:bg-emerald-500 text-white font-semibold shadow-md shadow-emerald-600/20"
        >
          <Printer className="w-3.5 h-3.5 mr-1.5" /> Print / Save PDF
        </Button>
      </div>

      <MultilingualLocalizationDialog
        open={localizeOpen}
        onOpenChange={setLocalizeOpen}
        resume={{ id: resumeId, title }}
      />
    </header>
  );
}
