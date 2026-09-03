"use client";

import React, { useState } from "react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
    MoreHorizontal,
    Eye,
    ExternalLink,
    Pencil,
    Clock,
    FileText,
    Lock,
    BarChart3,
    ArrowUpRight,
    Copy,
    Check,
} from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    RenameResumeAction,
    DuplicateResumeAction,
    AnalyticsLinkAction,
    DeleteResumeAction,
} from "@/components/dashboard/resume-actions";
import { toast } from "sonner";

const TEMPLATE_ACCENTS: Record<string, { bg: string; text: string; bar: string; border: string }> = {
    modern: { bg: "bg-blue-50 dark:bg-blue-950/40", text: "text-blue-700 dark:text-blue-400", bar: "bg-blue-600", border: "border-blue-200" },
    minimal: { bg: "bg-slate-100 dark:bg-slate-900", text: "text-slate-800 dark:text-slate-300", bar: "bg-slate-700", border: "border-slate-300" },
    classic: { bg: "bg-amber-50 dark:bg-amber-950/40", text: "text-amber-800 dark:text-amber-400", bar: "bg-amber-700", border: "border-amber-200" },
    compact: { bg: "bg-zinc-100 dark:bg-zinc-900", text: "text-zinc-800 dark:text-zinc-300", bar: "bg-zinc-600", border: "border-zinc-300" },
    technical: { bg: "bg-teal-50 dark:bg-teal-950/40", text: "text-teal-800 dark:text-teal-400", bar: "bg-teal-600", border: "border-teal-200" },
    executive: { bg: "bg-indigo-50 dark:bg-indigo-950/40", text: "text-indigo-800 dark:text-indigo-400", bar: "bg-indigo-700", border: "border-indigo-200" },
    creative: { bg: "bg-purple-50 dark:bg-purple-950/40", text: "text-purple-800 dark:text-purple-400", bar: "bg-purple-600", border: "border-purple-200" },
    elegant: { bg: "bg-rose-50 dark:bg-rose-950/40", text: "text-rose-800 dark:text-rose-400", bar: "bg-rose-700", border: "border-rose-200" },
};

interface ResumeLibraryCardProps {
    resume: {
        id: string;
        title: string | null;
        updated_at: string;
        created_at: string;
        template_id?: string | null;
        template?: string | null;
        is_public?: boolean | null;
        slug?: string | null;
        visual_config?: any;
    };
}

export function ResumeLibraryCard({ resume }: ResumeLibraryCardProps) {
    const [title, setTitle] = useState(resume.title || "Untitled Resume");
    const [copied, setCopied] = useState(false);
    const templateKey = resume.template_id || resume.template || "modern";
    const accent = TEMPLATE_ACCENTS[templateKey] || TEMPLATE_ACCENTS.modern;

    const handleCopyPublicLink = async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (!resume.slug) return;

        try {
            const url = `${window.location.origin}/r/${resume.slug}`;
            await navigator.clipboard.writeText(url);
            setCopied(true);
            toast.success("Public link copied to clipboard");
            setTimeout(() => setCopied(false), 2000);
        } catch {
            toast.error("Failed to copy link");
        }
    };

    return (
        <Card className="group relative overflow-hidden rounded-none border border-[#102b2b]/15 bg-white shadow-xs transition-all duration-200 hover:shadow-md hover:border-[#0d8274] flex flex-col justify-between min-w-0 w-full">
            {/* Top Accent Strip reflecting template theme */}
            <div className={`h-1.5 w-full ${accent.bar} shrink-0`} />

            <div className="min-w-0 flex-1">
                <CardHeader className="p-4 pb-3">
                    <div className="flex items-start justify-between gap-3 min-w-0">
                        {/* Title & Metadata */}
                        <div className="space-y-1 min-w-0 flex-1">
                            <div className="flex items-center gap-1.5 min-w-0">
                                <Link
                                    href={`/dashboard/resume/${resume.id}`}
                                    className="font-bold text-base text-[#102b2b] hover:text-[#0d8274] transition-colors truncate block max-w-full"
                                    title={title}
                                >
                                    {title}
                                </Link>
                            </div>

                            <div className="flex items-center gap-1.5 text-xs text-neutral-500 truncate">
                                <Clock className="h-3 w-3 shrink-0 text-neutral-400" />
                                <span className="truncate">
                                    Updated {formatDistanceToNow(new Date(resume.updated_at), { addSuffix: true })}
                                </span>
                            </div>
                        </div>

                        {/* Actions Dropdown Menu */}
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    aria-label={`Actions for ${title}`}
                                    className="h-8 w-8 rounded-none text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900 shrink-0"
                                >
                                    <MoreHorizontal className="h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-48 rounded-none border-neutral-200 shadow-lg">
                                <DropdownMenuItem asChild>
                                    <Link href={`/dashboard/resume/${resume.id}`}>
                                        <Eye className="mr-2 h-4 w-4" />
                                        Open Editor
                                    </Link>
                                </DropdownMenuItem>

                                {/* Rename Action with Dialog */}
                                <RenameResumeAction
                                    resumeId={resume.id}
                                    currentTitle={title}
                                    onRenamed={(newTitle) => setTitle(newTitle)}
                                />

                                <AnalyticsLinkAction resumeId={resume.id} />
                                <DuplicateResumeAction resumeId={resume.id} />

                                {resume.is_public && resume.slug && (
                                    <DropdownMenuItem asChild>
                                        <Link href={`/r/${resume.slug}`} target="_blank">
                                            <ExternalLink className="mr-2 h-4 w-4" />
                                            View Public Link
                                        </Link>
                                    </DropdownMenuItem>
                                )}

                                <DropdownMenuSeparator />

                                {/* Delete Action with Alert Dialog */}
                                <DeleteResumeAction resumeId={resume.id} title={title} />
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </CardHeader>

                <CardContent className="px-4 pb-3 pt-0">
                    {/* Template & Status Badges */}
                    <div className="flex items-center gap-2 flex-wrap min-w-0">
                        <span
                            className={`inline-flex items-center px-2 py-0.5 text-[11px] font-bold uppercase tracking-wider rounded-none ${accent.bg} ${accent.text} border ${accent.border}`}
                        >
                            {templateKey}
                        </span>

                        {resume.is_public && resume.slug ? (
                            <div className="inline-flex items-center gap-1">
                                <Link
                                    href={`/r/${resume.slug}`}
                                    target="_blank"
                                    className="inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 transition-colors shrink-0"
                                    title="View public resume page"
                                >
                                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                    Public
                                    <ArrowUpRight className="h-2.5 w-2.5 opacity-70" />
                                </Link>

                                <button
                                    type="button"
                                    onClick={handleCopyPublicLink}
                                    className="p-1 text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition-colors"
                                    title="Copy public link"
                                >
                                    {copied ? (
                                        <Check className="h-3 w-3 text-emerald-600" />
                                    ) : (
                                        <Copy className="h-3 w-3" />
                                    )}
                                </button>
                            </div>
                        ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-medium bg-neutral-100 text-neutral-600 border border-neutral-200">
                                <Lock className="h-2.5 w-2.5 opacity-60" />
                                Private
                            </span>
                        )}
                    </div>
                </CardContent>
            </div>

            {/* Quick Action Footer with guaranteed overflow containment */}
            <div className="border-t border-neutral-100 bg-[#f9faf6] px-4 py-2.5 flex items-center justify-between gap-2 min-w-0 shrink-0">
                <Link
                    href={`/dashboard/resume/${resume.id}`}
                    className="text-xs font-bold text-[#102b2b] hover:text-[#0d8274] transition-colors inline-flex items-center gap-1 truncate"
                >
                    Edit Resume <span aria-hidden="true">&rarr;</span>
                </Link>

                <div className="flex items-center gap-2 shrink-0">
                    <Link
                        href={`/dashboard/resume/${resume.id}/analytics`}
                        className="text-xs font-semibold text-neutral-600 hover:text-[#102b2b] transition-colors inline-flex items-center gap-1 bg-white border border-neutral-200 px-2 py-1 hover:bg-neutral-50"
                        title="View resume telemetry & performance"
                    >
                        <BarChart3 className="h-3.5 w-3.5 text-[#0d8274]" />
                        <span>Analytics</span>
                    </Link>
                </div>
            </div>
        </Card>
    );
}
