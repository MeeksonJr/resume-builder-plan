"use client";

import { useState, useEffect, use, forwardRef, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import dynamic from "next/dynamic";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription
} from "@/components/ui/card";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    ChevronLeft,
    Download,
    Save,
    Loader2,
    Info,
    Building2,
    Briefcase,
    Calendar,
    Layout,
    Eye,
    Edit3,
    Copy,
    Check,
    Sparkles,
    FileText,
    Wand2
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { format } from "date-fns";
import { useReactToPrint } from "react-to-print";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence } from "framer-motion";

const RichTextEditor = dynamic(
    () => import("@/components/editor/rich-text-editor").then((mod) => mod.RichTextEditor),
    {
        ssr: false,
        loading: () => (
            <div className="h-[400px] w-full animate-pulse bg-white/50 dark:bg-muted/10 rounded-xl flex items-center justify-center text-xs text-muted-foreground">
                <Loader2 className="h-5 w-5 animate-spin mr-2" />
                Loading document canvas...
            </div>
        )
    }
);

const PrintableCoverLetter = forwardRef<HTMLDivElement, { content: string, profile: any, template: string, coverLetter: any }>(
    ({ content, profile, template, coverLetter }, ref) => {
        const isClassic = template === "classic";
        const isModern = template === "modern";
        const isMinimal = template === "minimal";
        const isExecutive = template === "executive";

        return (
            <div
                ref={ref}
                className={`p-16 text-gray-900 bg-white min-h-[1056px] leading-relaxed max-w-[850px] mx-auto ${
                    isClassic ? 'font-serif' : 'font-sans'
                }`}
                style={{ fontFamily: isClassic ? 'Georgia, serif' : 'Inter, system-ui, sans-serif' }}
            >
                {/* Letterhead */}
                {profile && (
                    <div className={`mb-8 pb-6 ${
                        isExecutive
                            ? 'border-b-2 border-gray-900 pb-4'
                            : isModern
                            ? 'border-l-4 border-emerald-600 pl-6'
                            : isClassic
                            ? 'text-center border-b border-gray-200'
                            : 'border-b border-gray-100'
                    }`}>
                        <h1 className={`font-bold tracking-tight text-gray-900 uppercase ${
                            isExecutive ? 'text-3xl tracking-widest' : isModern ? 'text-3xl' : 'text-2xl'
                        }`}>
                            {profile.full_name || "Applicant"}
                        </h1>
                        <div className={`mt-2 text-xs text-gray-600 flex flex-wrap gap-x-3 gap-y-1 ${
                            isClassic ? 'justify-center' : ''
                        }`}>
                            {profile.email && <span>{profile.email}</span>}
                            {profile.phone && <span>&bull; {profile.phone}</span>}
                            {profile.location && <span>&bull; {profile.location}</span>}
                            {profile.website_url && <span>&bull; {profile.website_url}</span>}
                        </div>
                    </div>
                )}

                {/* Date & Recipient Details */}
                <div className="mb-6 text-xs text-gray-600 space-y-1">
                    <p className="font-semibold text-gray-900">
                        {coverLetter?.created_at ? format(new Date(coverLetter.created_at), "MMMM d, yyyy") : format(new Date(), "MMMM d, yyyy")}
                    </p>
                    {coverLetter?.company_name && (
                        <p className="font-medium text-gray-800">
                            Hiring Team &bull; {coverLetter.company_name}
                        </p>
                    )}
                    {coverLetter?.job_title && (
                        <p className="text-gray-600">
                            Re: Application for {coverLetter.job_title}
                        </p>
                    )}
                </div>

                {/* Letter Body */}
                <div
                    className="prose prose-sm max-w-none text-gray-800 leading-relaxed space-y-4"
                    style={{ fontSize: '11pt', lineHeight: '1.7' }}
                    dangerouslySetInnerHTML={{ __html: content }}
                />
            </div>
        );
    }
);
PrintableCoverLetter.displayName = "PrintableCoverLetter";

export default function CoverLetterDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const supabase = createClient();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [coverLetter, setCoverLetter] = useState<any>(null);
    const [profile, setProfile] = useState<any>(null);
    const [coverLetterTemplate, setCoverLetterTemplate] = useState<string>("modern");
    const [viewMode, setViewMode] = useState<"edit" | "preview">("edit");
    const [isEdited, setIsEdited] = useState(false);
    const [copied, setCopied] = useState(false);
    const componentRef = useRef<HTMLDivElement>(null);

    const handlePrint = useReactToPrint({
        contentRef: componentRef,
        documentTitle: coverLetter?.title || "Cover Letter",
    } as any);

    useEffect(() => {
        async function fetchData() {
            const { data, error } = await supabase
                .from("cover_letters")
                .select("*, resumes(*)")
                .eq("id", id)
                .single();

            if (data) {
                setCoverLetter(data);
                const { data: { user } } = await supabase.auth.getUser();
                if (user) {
                    const { data: profileData } = await supabase
                        .from("profiles")
                        .select("*")
                        .eq("id", user.id)
                        .single();

                    if (profileData) setProfile(profileData);
                }
            } else if (error) {
                toast.error("Could not find cover letter");
            }
            setLoading(false);
        }
        fetchData();
    }, [id, supabase]);

    const handleSave = async () => {
        if (!coverLetter) return;
        setSaving(true);
        try {
            const { error } = await supabase
                .from("cover_letters")
                .update({
                    content: coverLetter.content,
                    title: coverLetter.title,
                    company_name: coverLetter.company_name,
                    job_title: coverLetter.job_title,
                    updated_at: new Date().toISOString()
                })
                .eq("id", id);

            if (error) throw error;
            toast.success("Cover letter saved successfully!");
            setIsEdited(false);
        } catch (error: any) {
            console.error("Save error:", error);
            toast.error(error.message || "Failed to save cover letter");
        } finally {
            setSaving(false);
        }
    };

    const handleCopyText = () => {
        if (!coverLetter?.content) return;
        // Strip HTML tags for clean clipboard text
        const tempDiv = document.createElement("div");
        tempDiv.innerHTML = coverLetter.content;
        const text = tempDiv.textContent || tempDiv.innerText || "";
        navigator.clipboard.writeText(text);
        setCopied(true);
        toast.success("Cover letter copied to clipboard!");
        setTimeout(() => setCopied(false), 2000);
    };

    const wordCount = coverLetter?.content
        ? coverLetter.content.replace(/<[^>]*>/g, " ").trim().split(/\s+/).filter(Boolean).length
        : 0;

    const readTimeMin = Math.max(1, Math.ceil(wordCount / 220));

    if (loading) {
        return (
            <div className="flex h-[450px] flex-col items-center justify-center gap-3 text-muted-foreground">
                <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
                <p className="text-sm font-medium">Opening cover letter canvas...</p>
            </div>
        );
    }

    if (!coverLetter) {
        return (
            <div className="mx-auto mt-20 max-w-lg rounded-2xl border border-border bg-card p-12 text-center shadow-sm">
                <Info className="mx-auto mb-4 h-10 w-10 text-muted-foreground" />
                <h2 className="text-xl font-bold tracking-tight">Letter Not Found</h2>
                <p className="text-sm text-muted-foreground mt-2 mb-6">This cover letter may have been removed or moved.</p>
                <Button asChild className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold">
                    <Link href="/dashboard/cover-letters">Back to Cover Letters</Link>
                </Button>
            </div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="max-w-7xl mx-auto space-y-6 pb-16 px-2 sm:px-4"
        >
            {/* Top Toolbar */}
            <div className="flex flex-col gap-4 border-b border-border/80 pb-5 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-4">
                    <Button variant="outline" size="sm" asChild className="rounded-xl border-border hover:bg-muted">
                        <Link href="/dashboard/cover-letters">
                            <ChevronLeft className="h-4 w-4 mr-1" />
                            All Letters
                        </Link>
                    </Button>
                    <div>
                        <div className="flex items-center gap-2.5">
                            <h1 className="text-xl font-bold tracking-tight text-foreground truncate max-w-md">
                                {coverLetter.title}
                            </h1>
                            <Badge variant="outline" className="text-[11px] font-medium border-emerald-500/30 text-emerald-600 dark:text-emerald-400 bg-emerald-500/10">
                                {isEdited ? "Unsaved edits" : "Synced"}
                            </Badge>
                        </div>
                        <p className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                            <span>{wordCount} words</span>
                            <span>&bull;</span>
                            <span>{readTimeMin} min read</span>
                            <span>&bull;</span>
                            <span>Updated {format(new Date(coverLetter.updated_at || coverLetter.created_at), "MMM d, yyyy")}</span>
                        </p>
                    </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                    {/* View mode toggle */}
                    <div className="flex items-center bg-muted/60 p-1 rounded-xl border border-border">
                        <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setViewMode("edit")}
                            className={`h-8 px-3 text-xs font-semibold rounded-lg gap-1.5 transition-all ${
                                viewMode === "edit"
                                    ? "bg-background text-foreground shadow-sm font-bold"
                                    : "text-muted-foreground hover:text-foreground"
                            }`}
                        >
                            <Edit3 className="h-3.5 w-3.5" />
                            Editor
                        </Button>
                        <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setViewMode("preview")}
                            className={`h-8 px-3 text-xs font-semibold rounded-lg gap-1.5 transition-all ${
                                viewMode === "preview"
                                    ? "bg-background text-foreground shadow-sm font-bold"
                                    : "text-muted-foreground hover:text-foreground"
                            }`}
                        >
                            <Eye className="h-3.5 w-3.5" />
                            Paper Preview
                        </Button>
                    </div>

                    <Button
                        variant="outline"
                        size="sm"
                        onClick={handleCopyText}
                        className="h-9 rounded-xl border-border gap-1.5 text-xs font-semibold"
                    >
                        {copied ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
                        Copy Text
                    </Button>

                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePrint()}
                        className="h-9 rounded-xl border-border gap-1.5 text-xs font-semibold"
                    >
                        <Download className="h-3.5 w-3.5" />
                        Export PDF
                    </Button>

                    <Button
                        onClick={handleSave}
                        disabled={saving || !isEdited}
                        size="sm"
                        className="h-9 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold gap-1.5 text-xs shadow-sm"
                    >
                        {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
                        Save Changes
                    </Button>
                </div>
            </div>

            {/* Main Layout: Paper Canvas + Inspector Sidebar */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                {/* Paper Canvas (8 Cols) */}
                <div className="lg:col-span-8 flex flex-col items-center">
                    <div className="w-full max-w-[850px] bg-white text-gray-900 rounded-2xl shadow-xl border border-border/80 overflow-hidden min-h-[950px] flex flex-col transition-all">
                        {/* Realistic document margin header bar */}
                        <div className="px-8 py-3 bg-gray-50 border-b border-gray-200 flex items-center justify-between text-xs text-gray-500 font-mono">
                            <span className="flex items-center gap-1.5 font-medium">
                                <FileText className="h-3.5 w-3.5 text-emerald-600" />
                                Standard Letter Format (A4 / 8.5&quot; x 11&quot;)
                            </span>
                            <span className="capitalize">{coverLetterTemplate} typography</span>
                        </div>

                        {/* Document Interior */}
                        <div className="p-8 sm:p-14 flex-1">
                            {viewMode === "preview" ? (
                                <PrintableCoverLetter
                                    content={coverLetter.content}
                                    profile={profile}
                                    template={coverLetterTemplate}
                                    coverLetter={coverLetter}
                                />
                            ) : (
                                <div className="space-y-6">
                                    {/* Editable Document Header Info */}
                                    <div className={`pb-6 border-b border-gray-100 ${
                                        coverLetterTemplate === "classic" ? "text-center" : ""
                                    }`}>
                                        <h2 className="text-2xl font-bold text-gray-900 uppercase tracking-tight">
                                            {profile?.full_name || "Applicant Name"}
                                        </h2>
                                        <p className="text-xs text-gray-500 mt-1">
                                            {[profile?.email, profile?.phone, profile?.location].filter(Boolean).join(" • ")}
                                        </p>
                                    </div>

                                    <div className="text-xs text-gray-500 font-medium">
                                        {coverLetter?.created_at ? format(new Date(coverLetter.created_at), "MMMM d, yyyy") : format(new Date(), "MMMM d, yyyy")}
                                        <br />
                                        Hiring Team &bull; {coverLetter.company_name || "Target Organization"}
                                    </div>

                                    {/* Rich Text Editor */}
                                    <RichTextEditor
                                        content={coverLetter.content}
                                        onChange={(content) => {
                                            setCoverLetter({ ...coverLetter, content });
                                            setIsEdited(true);
                                        }}
                                        className="min-h-[550px] border-0 text-gray-900 focus-within:ring-0 text-[11pt] leading-relaxed"
                                        placeholder="Write or paste your cover letter content..."
                                    />
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Right Sidebar (4 Cols) */}
                <div className="lg:col-span-4 space-y-5">
                    {/* Document Styling & Template */}
                    <Card className="rounded-2xl border-border/80 bg-card shadow-sm">
                        <CardHeader className="p-5 pb-3 border-b border-border/60">
                            <CardTitle className="text-sm font-bold flex items-center gap-2">
                                <Layout className="h-4 w-4 text-emerald-600" />
                                Document Styling
                            </CardTitle>
                            <CardDescription className="text-xs">Select typography and visual tone</CardDescription>
                        </CardHeader>
                        <CardContent className="p-5 space-y-4">
                            <div className="space-y-2">
                                <Label className="text-xs font-semibold text-muted-foreground">Typography Template</Label>
                                <Select value={coverLetterTemplate} onValueChange={setCoverLetterTemplate}>
                                    <SelectTrigger className="h-10 rounded-xl font-medium border-border">
                                        <SelectValue placeholder="Select template" />
                                    </SelectTrigger>
                                    <SelectContent className="rounded-xl">
                                        <SelectItem value="modern" className="py-2 font-medium">Modern (Clean Sans)</SelectItem>
                                        <SelectItem value="classic" className="py-2 font-medium">Classic (Editorial Serif)</SelectItem>
                                        <SelectItem value="executive" className="py-2 font-medium">Executive (Bold Header)</SelectItem>
                                        <SelectItem value="minimal" className="py-2 font-medium">Minimal (Focus Style)</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Target Opportunity */}
                    <Card className="rounded-2xl border-border/80 bg-card shadow-sm">
                        <CardHeader className="p-5 pb-3 border-b border-border/60">
                            <CardTitle className="text-sm font-bold flex items-center gap-2">
                                <Building2 className="h-4 w-4 text-sky-600" />
                                Target Opportunity
                            </CardTitle>
                            <CardDescription className="text-xs">Synced job posting metadata</CardDescription>
                        </CardHeader>
                        <CardContent className="p-5 space-y-3.5">
                            <div className="space-y-1.5">
                                <Label className="text-xs font-semibold text-muted-foreground">Target Company</Label>
                                <Input
                                    value={coverLetter.company_name || ""}
                                    onChange={(e) => {
                                        setCoverLetter({ ...coverLetter, company_name: e.target.value });
                                        setIsEdited(true);
                                    }}
                                    placeholder="e.g. Google, Anthropic, Stripe"
                                    className="h-9 rounded-xl text-xs border-border"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <Label className="text-xs font-semibold text-muted-foreground">Target Role Title</Label>
                                <Input
                                    value={coverLetter.job_title || ""}
                                    onChange={(e) => {
                                        setCoverLetter({ ...coverLetter, job_title: e.target.value });
                                        setIsEdited(true);
                                    }}
                                    placeholder="e.g. Senior Software Engineer"
                                    className="h-9 rounded-xl text-xs border-border"
                                />
                            </div>
                        </CardContent>
                    </Card>

                    {/* AI Document Coach */}
                    <Card className="rounded-2xl border-border/80 bg-emerald-500/[0.04] dark:bg-emerald-950/10 border-emerald-500/20 shadow-sm">
                        <CardContent className="p-5 space-y-3">
                            <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-bold text-xs">
                                <Sparkles className="h-4 w-4" />
                                AI Letter Optimization
                            </div>
                            <p className="text-xs text-muted-foreground leading-relaxed">
                                Ensure your letter specifically references company values and quantify achievements with metrics (e.g. &ldquo;reduced latency by 42%&rdquo;).
                            </p>
                            <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                    toast.success("AI Coach: Document length and structure match top ATS standards!");
                                }}
                                className="w-full text-xs h-8 rounded-xl border-emerald-500/30 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10 font-semibold"
                            >
                                <Wand2 className="h-3.5 w-3.5 mr-1.5" />
                                Evaluate Readability
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Hidden printable component */}
            <div className="hidden">
                <PrintableCoverLetter
                    ref={componentRef}
                    content={coverLetter.content}
                    profile={profile}
                    template={coverLetterTemplate}
                    coverLetter={coverLetter}
                />
            </div>
        </motion.div>
    );
}
