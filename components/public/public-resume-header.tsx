"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { PublicDownloadButton } from "@/components/dashboard/public-download-button";
import {
    Share2,
    Printer,
    Check,
    ZoomIn,
    ZoomOut,
    Maximize2,
    RotateCcw,
    ShieldCheck,
    FileText,
    ArrowLeft,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface PublicResumeHeaderProps {
    resume: any;
    candidateName: string;
    resumeCode: string;
    activeScale: number;
    isFitMode: boolean;
    onZoomIn: () => void;
    onZoomOut: () => void;
    onSetFit: () => void;
    onSet100: () => void;
}

export function PublicResumeHeader({
    resume,
    candidateName,
    resumeCode,
    activeScale,
    isFitMode,
    onZoomIn,
    onZoomOut,
    onSetFit,
    onSet100,
}: PublicResumeHeaderProps) {
    const [copied, setCopied] = useState(false);

    const handleCopyLink = async () => {
        try {
            await navigator.clipboard.writeText(window.location.href);
            setCopied(true);
            toast.success("Public link copied to clipboard!");
            setTimeout(() => setCopied(false), 2500);
        } catch {
            toast.error("Failed to copy link");
        }
    };

    const handlePrint = () => {
        window.print();
    };

    return (
        <header className="sticky top-0 z-40 border-b border-neutral-200/80 bg-white/95 backdrop-blur-md shadow-xs print:hidden">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex flex-wrap items-center justify-between gap-3">
                {/* Left: Branding & Candidate identity */}
                <div className="flex items-center gap-3 min-w-0">
                    <Link
                        href="/"
                        className="flex items-center gap-2 group shrink-0"
                        title="ResumeForge Home"
                    >
                        <div className="h-8 w-8 rounded-none bg-[#102b2b] text-[#f8f4ec] flex items-center justify-center font-bold text-sm shadow-xs group-hover:bg-[#102b2b]/90 transition-colors">
                            RF
                        </div>
                    </Link>

                    <div className="h-5 w-px bg-neutral-200 shrink-0 hidden sm:block" />

                    <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                            <h1 className="font-bold text-sm sm:text-base text-neutral-900 truncate">
                                {candidateName}
                            </h1>
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 shrink-0">
                                <ShieldCheck className="h-3 w-3 text-emerald-600" />
                                Verified Resume
                            </span>
                        </div>
                        <p className="text-xs text-neutral-500 truncate">
                            {resume.title} · Updated {new Date(resume.updated_at).toLocaleDateString()}
                        </p>
                    </div>
                </div>

                {/* Right: Actions & Zoom Controls */}
                <div className="flex items-center gap-2 shrink-0">
                    {/* Zoom Toolbar for viewing on any screen size */}
                    <div className="hidden md:flex items-center gap-1 bg-neutral-100/80 border border-neutral-200/80 p-0.5 text-xs">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={onZoomOut}
                            disabled={activeScale <= 0.4}
                            className="h-6 w-6 rounded-none text-neutral-700 hover:bg-white"
                            title="Zoom out"
                        >
                            <ZoomOut className="h-3.5 w-3.5" />
                        </Button>
                        <span className="min-w-[40px] text-center font-mono font-bold text-neutral-800 text-[11px]">
                            {Math.round(activeScale * 100)}%
                        </span>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={onZoomIn}
                            disabled={activeScale >= 1.4}
                            className="h-6 w-6 rounded-none text-neutral-700 hover:bg-white"
                            title="Zoom in"
                        >
                            <ZoomIn className="h-3.5 w-3.5" />
                        </Button>
                        <div className="h-3.5 w-px bg-neutral-300 mx-0.5" />
                        <Button
                            variant={isFitMode ? "default" : "ghost"}
                            size="sm"
                            onClick={onSetFit}
                            className={cn(
                                "h-6 px-2 text-[10px] font-bold rounded-none gap-1",
                                isFitMode
                                    ? "bg-[#102b2b] text-white hover:bg-[#102b2b]"
                                    : "text-neutral-700 hover:bg-white"
                            )}
                            title="Fit width"
                        >
                            <Maximize2 className="h-3 w-3" />
                            <span>Fit</span>
                        </Button>
                        <Button
                            variant={!isFitMode && activeScale === 1 ? "default" : "ghost"}
                            size="sm"
                            onClick={onSet100}
                            className={cn(
                                "h-6 px-2 text-[10px] font-bold rounded-none gap-1",
                                !isFitMode && activeScale === 1
                                    ? "bg-[#102b2b] text-white hover:bg-[#102b2b]"
                                    : "text-neutral-700 hover:bg-white"
                            )}
                            title="100% scale"
                        >
                            <RotateCcw className="h-3 w-3" />
                            <span>100%</span>
                        </Button>
                    </div>

                    {/* Print Button */}
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={handlePrint}
                        className="h-8 px-2.5 text-xs gap-1.5 border-neutral-300 hover:bg-neutral-100 rounded-none hidden sm:inline-flex"
                        title="Print or Save as PDF"
                    >
                        <Printer className="h-3.5 w-3.5" />
                        <span>Print</span>
                    </Button>

                    {/* Share / Copy Link Button */}
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={handleCopyLink}
                        className="h-8 px-2.5 text-xs gap-1.5 border-neutral-300 hover:bg-neutral-100 rounded-none"
                        title="Copy public link"
                    >
                        {copied ? (
                            <Check className="h-3.5 w-3.5 text-emerald-600" />
                        ) : (
                            <Share2 className="h-3.5 w-3.5" />
                        )}
                        <span>{copied ? "Copied" : "Share"}</span>
                    </Button>

                    {/* Download PDF Button */}
                    <PublicDownloadButton
                        user={resume.user}
                        resumeId={resume.id}
                        title={resume.title}
                        resumeCode={resumeCode}
                    />
                </div>
            </div>
        </header>
    );
}
