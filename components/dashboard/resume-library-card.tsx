"use client";

import React, { useState } from "react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    MoreHorizontal,
    Eye,
    ExternalLink,
    Pencil,
    Clock,
    FileText,
    Globe,
    Lock,
    BarChart3,
    ArrowUpRight,
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

const TEMPLATE_ACCENTS: Record<string, { bg: string; text: string; bar: string }> = {
    modern: { bg: "bg-blue-50 dark:bg-blue-950/40", text: "text-blue-700 dark:text-blue-400", bar: "bg-blue-600" },
    minimal: { bg: "bg-slate-100 dark:bg-slate-900", text: "text-slate-800 dark:text-slate-300", bar: "bg-slate-700" },
    classic: { bg: "bg-amber-50 dark:bg-amber-950/40", text: "text-amber-800 dark:text-amber-400", bar: "bg-amber-700" },
    compact: { bg: "bg-zinc-100 dark:bg-zinc-900", text: "text-zinc-800 dark:text-zinc-300", bar: "bg-zinc-600" },
    technical: { bg: "bg-teal-50 dark:bg-teal-950/40", text: "text-teal-800 dark:text-teal-400", bar: "bg-teal-600" },
    executive: { bg: "bg-indigo-50 dark:bg-indigo-950/40", text: "text-indigo-800 dark:text-indigo-400", bar: "bg-indigo-700" },
    creative: { bg: "bg-purple-50 dark:bg-purple-950/40", text: "text-purple-800 dark:text-purple-400", bar: "bg-purple-600" },
    elegant: { bg: "bg-rose-50 dark:bg-rose-950/40", text: "text-rose-800 dark:text-rose-400", bar: "bg-rose-700" },
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
    const templateKey = resume.template_id || resume.template || "modern";
    const accent = TEMPLATE_ACCENTS[templateKey] || TEMPLATE_ACCENTS.modern;

    return (
        <Card className="group relative overflow-hidden rounded-none border border-[#102b2b]/15 bg-white shadow-xs transition-all duration-200 hover:shadow-md hover:border-[#0d8274] flex flex-col justify-between">
            {/* Top Accent Strip reflecting template theme */}
            <div className={`h-1.5 w-full ${accent.bar}`} />

            <div>
                <CardHeader className="p-4 pb-3">
                    <div className="flex items-start justify-between gap-2">
                        {/* Title & Renaming affordance */}
                        <div className="space-y-1 min-w-0 flex-1">
                            <div className="flex items-center gap-1.5 group/title">
                                <Link
                                    href={`/dashboard/resume/${resume.id}`}
                                    className="font-bold text-base text-[#102b2b] hover:text-[#0d8274] transition-colors line-clamp-2 leading-snug"
                                    title={title}
                                >
                                    {title}
                                </Link>
                            </div>

                            <div className="flex items-center gap-1.5 text-xs text-neutral-500">
                                <Clock className="h-3 w-3 shrink-0" />
                                <span>Updated {formatDistanceToNow(new Date(resume.updated_at), { addSuffix: true })}</span>
                            </div>
                        </div>

                        {/* Actions Menu */}
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    aria-label={`Actions for ${title}`}
                                    className="h-8 w-8 rounded-none text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900"
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

                                {/* Functioning Rename Action */}
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

                                {/* Functioning Delete Action */}
                                <DeleteResumeAction resumeId={resume.id} title={title} />
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </CardHeader>

                <CardContent className="px-4 pb-4 pt-0">
                    {/* Template & Status Badges */}
                    <div className="flex items-center gap-2 flex-wrap mb-4">
                        <span className={`inline-flex items-center px-2 py-0.5 text-[11px] font-bold uppercase tracking-wider rounded-none ${accent.bg} ${accent.text}`}>
                            {templateKey}
                        </span>

                        {resume.is_public && resume.slug ? (
                            <Link
                                href={`/r/${resume.slug}`}
                                target="_blank"
                                className="inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 transition-colors"
                            >
                                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                Public
                                <ArrowUpRight className="h-2.5 w-2.5 opacity-70" />
                            </Link>
                        ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-medium bg-neutral-100 text-neutral-600 border border-neutral-200">
                                <Lock className="h-2.5 w-2.5 opacity-60" />
                                Private
                            </span>
                        )}
                    </div>
                </CardContent>
            </div>

            {/* Quick action footer */}
            <div className="border-t border-neutral-100 bg-[#f9faf6] px-4 py-2 flex items-center justify-between">
                <Link
                    href={`/dashboard/resume/${resume.id}`}
                    className="text-xs font-bold text-[#102b2b] hover:text-[#0d8274] transition-colors inline-flex items-center gap-1"
                >
                    Edit Resume <span aria-hidden="true">&rarr;</span>
                </Link>

                <Link
                    href={`/dashboard/resume/${resume.id}/analytics`}
                    className="text-xs font-semibold text-neutral-500 hover:text-[#102b2b] transition-colors inline-flex items-center gap-1"
                    title="View analytics"
                >
                    <BarChart3 className="h-3.5 w-3.5" />
                    <span>Metrics</span>
                </Link>
            </div>
        </Card>
    );
}
