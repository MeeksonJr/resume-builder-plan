"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import dynamic from "next/dynamic";

const TrafficChart = dynamic(() => import("@/components/analytics/charts").then(mod => mod.TrafficChart), {
    loading: () => <div className="h-[300px] w-full flex items-center justify-center bg-muted/20 animate-pulse rounded-none">Loading Traffic Chart...</div>
});

const DeviceChart = dynamic(() => import("@/components/analytics/charts").then(mod => mod.DeviceChart), {
    loading: () => <div className="h-[200px] w-full flex items-center justify-center bg-muted/20 animate-pulse rounded-none">Loading Device Chart...</div>
});

import {
    ArrowLeft,
    Download,
    Eye,
    Globe,
    Calendar,
    MousePointer2,
    Zap,
    CheckCircle2,
    AlertCircle,
    Info,
    ShieldCheck,
    Search,
    Lock as LockIcon,
    ExternalLink,
    Edit3,
    TrendingUp,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { useSubscriptionStore } from "@/lib/stores/subscription-store";
import { format, subDays, startOfDay, differenceInHours } from "date-fns";

const COLORS = ['#102b2b', '#0d8274', '#d8f36b', '#f59e0b', '#6366f1'];

export default function ResumeAnalyticsPage() {
    const { id } = useParams();
    const router = useRouter();
    const { isPro, isLoading: isSubLoading, checkSubscription } = useSubscriptionStore();

    useEffect(() => {
        checkSubscription();
    }, [checkSubscription]);

    const [resume, setResume] = useState<any>(null);
    const [events, setEvents] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [atsData, setAtsData] = useState<any>(null);
    const [loadingATS, setLoadingATS] = useState(false);
    const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

    const fetchATSScore = useCallback(async (resumeId: string, force: boolean = false) => {
        if (!isPro && !isSubLoading) {
            return;
        }

        setLoadingATS(true);
        const supabase = createClient();
        try {
            if (!force) {
                const { data: cache } = await supabase
                    .from("resume_ats_cache")
                    .select("*")
                    .eq("resume_id", resumeId)
                    .order("created_at", { ascending: false })
                    .limit(1)
                    .maybeSingle();

                if (cache) {
                    const hoursSinceUpdate = differenceInHours(new Date(), new Date(cache.created_at));
                    if (hoursSinceUpdate < 24) {
                        setAtsData(cache.analysis_data);
                        setLastUpdated(new Date(cache.created_at));
                        setLoadingATS(false);
                        return;
                    }
                }
            }

            const [
                { data: profile },
                { data: workExperiences },
                { data: education },
                { data: skills },
                { data: projects },
                { data: certifications },
                { data: languages },
                { data: currentResume }
            ] = await Promise.all([
                supabase.from("personal_info").select("*").eq("resume_id", resumeId).maybeSingle(),
                supabase.from("work_experiences").select("*").eq("resume_id", resumeId),
                supabase.from("education").select("*").eq("resume_id", resumeId),
                supabase.from("skills").select("*").eq("resume_id", resumeId),
                supabase.from("projects").select("*").eq("resume_id", resumeId),
                supabase.from("certifications").select("*").eq("resume_id", resumeId),
                supabase.from("languages").select("*").eq("resume_id", resumeId),
                supabase.from("resumes").select("title").eq("id", resumeId).maybeSingle(),
            ]);

            const fullResumeData = {
                title: currentResume?.title,
                profile,
                workExperiences,
                education,
                skills,
                projects,
                certifications,
                languages
            };

            const response = await fetch("/api/ai/ats-score", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ resumeData: fullResumeData })
            });

            if (!response.ok) throw new Error("Failed to analyze resume");

            const data = await response.json();
            setAtsData(data);
            setLastUpdated(new Date());

            await supabase
                .from("resume_ats_cache")
                .insert({
                    resume_id: resumeId,
                    analysis_data: data,
                    created_at: new Date().toISOString()
                });

        } catch (error) {
            console.error("ATS Calculation error:", error);
            toast.error("Failed to run ATS scoring");
        } finally {
            setLoadingATS(false);
        }
    }, [isPro, isSubLoading]);

    useEffect(() => {
        if (!id) return;

        async function fetchData() {
            setLoading(true);
            const supabase = createClient();

            const { data: resumeData } = await supabase
                .from("resumes")
                .select("*")
                .eq("id", id)
                .maybeSingle();

            if (!resumeData) {
                setLoading(false);
                return;
            }

            setResume(resumeData);

            const [{ data: views }, { data: downloads }] = await Promise.all([
                supabase
                    .from("resume_views")
                    .select("*")
                    .eq("resume_id", id)
                    .order("created_at", { ascending: false }),
                supabase
                    .from("resume_downloads")
                    .select("*")
                    .eq("resume_id", id)
                    .order("created_at", { ascending: false })
            ]);

            const mappedViews = (views || []).map(v => ({ ...v, event_type: 'view' }));
            const mappedDownloads = (downloads || []).map(d => ({ ...d, event_type: 'download' }));

            setEvents([...mappedViews, ...mappedDownloads]);
            setLoading(false);

            fetchATSScore(id as string);
        }

        fetchData();
    }, [id, fetchATSScore]);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] gap-3">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#102b2b]"></div>
                <p className="text-xs font-bold uppercase tracking-wider text-neutral-500">Loading Resume Analytics...</p>
            </div>
        );
    }

    const last30Days = Array.from({ length: 30 }, (_, i) => {
        const date = subDays(new Date(), 29 - i);
        return {
            date: format(date, "MMM dd"),
            views: 0,
            downloads: 0,
            fullDate: startOfDay(date)
        };
    });

    events.forEach(event => {
        const eventDate = startOfDay(new Date(event.created_at));
        const dayMatch = last30Days.find(day => day.fullDate.getTime() === eventDate.getTime());
        if (dayMatch) {
            if (event.event_type === 'view') dayMatch.views++;
            if (event.event_type === 'download') dayMatch.downloads++;
        }
    });

    const deviceData = Object.entries(
        events.reduce((acc: Record<string, number>, event) => {
            const device = event.device || 'Desktop';
            acc[device] = (acc[device] || 0) + 1;
            return acc;
        }, {})
    ).map(([name, value]) => ({ name, value: value as number }));

    const totalViews = events.filter(e => e.event_type === 'view').length;
    const totalDownloads = events.filter(e => e.event_type === 'download').length;
    const engagementRate = totalViews > 0 ? Math.round((totalDownloads / totalViews) * 100) : 0;

    return (
        <div className="mx-auto max-w-7xl space-y-8 px-2 sm:px-4 py-4">
            {/* Editorial Breadcrumb & Header */}
            <div className="border-b border-[#102b2b]/15 pb-6">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-neutral-500 mb-3">
                    <Link href="/dashboard/resumes" className="hover:text-[#0d8274] transition-colors">
                        Resumes
                    </Link>
                    <span>/</span>
                    <span className="text-[#102b2b] truncate max-w-[200px]">{resume?.title || "Resume"}</span>
                    <span>/</span>
                    <span className="text-[#0d8274]">Analytics</span>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <Button
                            variant="outline"
                            size="icon"
                            onClick={() => router.push(`/dashboard/resumes`)}
                            className="h-9 w-9 rounded-none border-neutral-300 hover:bg-neutral-100 shrink-0"
                            title="Back to Resumes"
                        >
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                        <div>
                            <h1 className="text-2xl sm:text-3xl font-black text-[#102b2b] tracking-tight">
                                {resume?.title || "Untitled Resume"} Performance
                            </h1>
                            <p className="text-xs text-neutral-500 font-medium mt-0.5">
                                Real-time engagement telemetry, device metrics, and ATS scan results
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0 flex-wrap">
                        {resume?.is_public && resume?.slug && (
                            <Button
                                variant="outline"
                                size="sm"
                                asChild
                                className="h-9 rounded-none border-neutral-300 gap-1.5 text-xs font-bold"
                            >
                                <Link href={`/r/${resume.slug}`} target="_blank">
                                    <ExternalLink className="h-3.5 w-3.5" />
                                    Public View
                                </Link>
                            </Button>
                        )}
                        <Button
                            size="sm"
                            asChild
                            className="h-9 rounded-none bg-[#102b2b] text-white hover:bg-[#164743] gap-1.5 text-xs font-bold"
                        >
                            <Link href={`/dashboard/resume/${id}`}>
                                <Edit3 className="h-3.5 w-3.5 text-[#d8f36b]" />
                                Edit Resume
                            </Link>
                        </Button>
                        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-neutral-100 border border-neutral-200 text-xs font-bold text-neutral-700">
                            <Calendar className="h-3.5 w-3.5 text-[#0d8274]" />
                            <span>Last 30 Days</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* KPI Summary Cards */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 min-w-0">
                <Card className="rounded-none border border-[#102b2b]/15 bg-[#f9faf6] p-4 shadow-xs min-w-0 overflow-hidden">
                    <CardHeader className="flex flex-row items-center justify-between p-0 pb-2">
                        <span className="text-xs font-bold uppercase tracking-wider text-neutral-500">Total Views</span>
                        <div className="h-7 w-7 rounded-none bg-[#102b2b] text-white flex items-center justify-center shrink-0">
                            <Eye className="h-3.5 w-3.5 text-[#d8f36b]" />
                        </div>
                    </CardHeader>
                    <CardContent className="p-0 pt-1">
                        <div className="text-3xl font-black text-[#102b2b] truncate">{totalViews}</div>
                        <p className="text-xs text-neutral-500 font-medium mt-1 truncate">Unique page visits</p>
                    </CardContent>
                </Card>

                <Card className="rounded-none border border-[#102b2b]/15 bg-[#f9faf6] p-4 shadow-xs min-w-0 overflow-hidden">
                    <CardHeader className="flex flex-row items-center justify-between p-0 pb-2">
                        <span className="text-xs font-bold uppercase tracking-wider text-neutral-500">PDF Downloads</span>
                        <div className="h-7 w-7 rounded-none bg-[#0d8274] text-white flex items-center justify-center shrink-0">
                            <Download className="h-3.5 w-3.5 text-white" />
                        </div>
                    </CardHeader>
                    <CardContent className="p-0 pt-1">
                        <div className="text-3xl font-black text-[#102b2b] truncate">{totalDownloads}</div>
                        <p className="text-xs text-neutral-500 font-medium mt-1 truncate">Saved or printed copies</p>
                    </CardContent>
                </Card>

                <Card className="rounded-none border border-[#102b2b]/15 bg-[#f9faf6] p-4 shadow-xs min-w-0 overflow-hidden">
                    <CardHeader className="flex flex-row items-center justify-between p-0 pb-2">
                        <span className="text-xs font-bold uppercase tracking-wider text-neutral-500">Conversion Rate</span>
                        <div className="h-7 w-7 rounded-none bg-neutral-800 text-white flex items-center justify-center shrink-0">
                            <MousePointer2 className="h-3.5 w-3.5 text-[#d8f36b]" />
                        </div>
                    </CardHeader>
                    <CardContent className="p-0 pt-1">
                        <div className="text-3xl font-black text-[#102b2b] truncate">{engagementRate}%</div>
                        <p className="text-xs text-neutral-500 font-medium mt-1 truncate">Views converted to download</p>
                    </CardContent>
                </Card>

                <Card className="rounded-none border border-[#102b2b]/15 bg-[#f9faf6] p-4 shadow-xs min-w-0 overflow-hidden">
                    <CardHeader className="flex flex-row items-center justify-between p-0 pb-2">
                        <span className="text-xs font-bold uppercase tracking-wider text-neutral-500">Link Status</span>
                        <div className={cn(
                            "h-7 w-7 rounded-none text-white flex items-center justify-center shrink-0",
                            resume?.is_public ? "bg-emerald-700" : "bg-neutral-600"
                        )}>
                            {resume?.is_public ? (
                                <Globe className="h-3.5 w-3.5 text-emerald-200" />
                            ) : (
                                <LockIcon className="h-3.5 w-3.5 text-neutral-200" />
                            )}
                        </div>
                    </CardHeader>
                    <CardContent className="p-0 pt-1">
                        <div className={cn(
                            "text-xl font-black flex items-center gap-1.5 truncate",
                            resume?.is_public ? "text-emerald-700" : "text-neutral-700"
                        )}>
                            {resume?.is_public ? (
                                <>
                                    <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                                    <span className="truncate">Public Active</span>
                                </>
                            ) : (
                                <span className="truncate">Private Only</span>
                            )}
                        </div>
                        <p className="text-xs text-neutral-500 font-medium mt-1 truncate">
                            {resume?.is_public ? "Accessible via direct link" : "Only accessible in editor"}
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Charts Grid */}
            <div className="grid gap-6 md:grid-cols-7 min-w-0">
                <Card className="md:col-span-4 rounded-none border border-[#102b2b]/15 bg-white p-5 sm:p-6 shadow-xs min-w-0 overflow-hidden">
                    <CardHeader className="p-0 pb-4">
                        <div className="flex items-center justify-between flex-wrap gap-2">
                            <div>
                                <CardTitle className="text-base font-black uppercase text-[#102b2b] tracking-tight">
                                    Traffic Over Time
                                </CardTitle>
                                <CardDescription className="text-xs text-neutral-500">
                                    Daily impressions and downloads over the last 30 days
                                </CardDescription>
                            </div>
                            <div className="flex items-center gap-3 text-xs font-semibold shrink-0">
                                <span className="flex items-center gap-1.5 text-neutral-700">
                                    <span className="h-2.5 w-2.5 bg-[#102b2b] inline-block" /> Views
                                </span>
                                <span className="flex items-center gap-1.5 text-neutral-700">
                                    <span className="h-2.5 w-2.5 bg-[#0d8274] inline-block" /> Downloads
                                </span>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="p-0 pt-2 min-w-0">
                        <TrafficChart data={last30Days} />
                    </CardContent>
                </Card>

                <Card className="md:col-span-3 rounded-none border border-[#102b2b]/15 bg-white p-5 sm:p-6 shadow-xs min-w-0 overflow-hidden">
                    <CardHeader className="p-0 pb-4">
                        <CardTitle className="text-base font-black uppercase text-[#102b2b] tracking-tight">
                            Device Distribution
                        </CardTitle>
                        <CardDescription className="text-xs text-neutral-500">
                            Client hardware breakdown from recruiters & visitors
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="p-0 pt-2 flex flex-col items-center min-w-0">
                        <DeviceChart data={deviceData} />
                        <div className="grid grid-cols-2 gap-2 mt-4 w-full min-w-0">
                            {deviceData.map((device, idx) => (
                                <div key={idx} className="flex items-center justify-between p-2 rounded-none bg-neutral-50 border border-neutral-200 text-xs min-w-0">
                                    <div className="flex items-center gap-1.5 truncate min-w-0">
                                        <div className="h-2 w-2 shrink-0" style={{ backgroundColor: COLORS[idx % COLORS.length] }} />
                                        <span className="font-bold text-neutral-800 truncate">{device.name}</span>
                                    </div>
                                    <span className="font-mono text-neutral-500 ml-1 shrink-0">{device.value}</span>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* ATS & Optimization Section */}
            <div className="grid gap-6 md:grid-cols-3 min-w-0">
                {/* ATS Score Meter */}
                <Card className="md:col-span-1 rounded-none border border-[#102b2b]/15 bg-white p-6 shadow-xs flex flex-col justify-between min-w-0 overflow-hidden">
                    <div>
                        <div className="flex items-center justify-between border-b border-neutral-100 pb-3 mb-6">
                            <div className="flex items-center gap-2">
                                <ShieldCheck className="h-5 w-5 text-[#0d8274]" />
                                <h3 className="font-black text-sm uppercase tracking-wider text-[#102b2b]">
                                    ATS Benchmark
                                </h3>
                            </div>
                            {atsData && (
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="h-7 text-xs font-bold gap-1 rounded-none border-neutral-300 hover:bg-neutral-100"
                                    onClick={() => fetchATSScore(id as string, true)}
                                    disabled={loadingATS}
                                >
                                    <Zap className={cn("h-3 w-3", loadingATS ? "text-neutral-400 animate-spin" : "text-amber-500")} />
                                    {loadingATS ? "Scanning..." : "Re-Scan"}
                                </Button>
                            )}
                        </div>

                        {loadingATS ? (
                            <div className="py-12 flex flex-col items-center gap-3">
                                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#102b2b]"></div>
                                <p className="text-xs font-bold uppercase tracking-wider text-neutral-500 animate-pulse">
                                    Analyzing Resume Structure...
                                </p>
                            </div>
                        ) : atsData ? (
                            <div className="flex flex-col items-center text-center space-y-4">
                                <div className="relative h-36 w-36 flex items-center justify-center">
                                    <svg className="h-full w-full -rotate-90">
                                        <circle
                                            cx="72"
                                            cy="72"
                                            r="60"
                                            fill="transparent"
                                            stroke="#e5e7eb"
                                            strokeWidth="10"
                                        />
                                        <circle
                                            cx="72"
                                            cy="72"
                                            r="60"
                                            fill="transparent"
                                            stroke="#0d8274"
                                            strokeWidth="10"
                                            strokeDasharray={377}
                                            strokeDashoffset={377 - (377 * (atsData.score || 0)) / 100}
                                            strokeLinecap="square"
                                            className="transition-all duration-1000 ease-out"
                                        />
                                    </svg>
                                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                                        <span className="text-4xl font-black text-[#102b2b]">{atsData.score}</span>
                                        <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-400">
                                            OUT OF 100
                                        </span>
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <span className={cn(
                                        "inline-block px-2.5 py-0.5 text-xs font-black uppercase tracking-wider rounded-none",
                                        atsData.score >= 80 ? "bg-emerald-50 text-emerald-700 border border-emerald-300" :
                                            atsData.score >= 60 ? "bg-amber-50 text-amber-700 border border-amber-300" :
                                                "bg-rose-50 text-rose-700 border border-rose-300"
                                    )}>
                                        {atsData.score >= 80 ? "ATS Optimized" : atsData.score >= 60 ? "Good Potential" : "Needs Revision"}
                                    </span>
                                    <p className="text-xs text-neutral-600 leading-relaxed max-w-[260px] mx-auto">
                                        {atsData.overallFeedback}
                                    </p>
                                </div>
                            </div>
                        ) : (
                            <div className="py-8 text-center space-y-3">
                                <AlertCircle className="h-10 w-10 text-neutral-400 mx-auto" />
                                <p className="text-xs font-medium text-neutral-500">No ATS analysis cached.</p>
                                <Button
                                    onClick={() => fetchATSScore(id as string)}
                                    size="sm"
                                    className="rounded-none bg-[#102b2b] text-white hover:bg-[#164743] font-bold text-xs"
                                >
                                    Run Scan
                                </Button>
                            </div>
                        )}
                    </div>

                    {lastUpdated && (
                        <p className="text-[10px] text-neutral-400 font-mono text-center pt-4 border-t border-neutral-100">
                            Last scanned {format(lastUpdated, "MMM d, h:mm a")}
                        </p>
                    )}
                </Card>

                {/* AI Optimizations & Breakdown */}
                <Card className="md:col-span-2 rounded-none border border-[#102b2b]/15 bg-white p-6 shadow-xs min-w-0 overflow-hidden">
                    <div className="border-b border-neutral-100 pb-3 mb-4 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Zap className="h-5 w-5 text-amber-500" />
                            <h3 className="font-black text-sm uppercase tracking-wider text-[#102b2b]">
                                Actionable Optimizations
                            </h3>
                        </div>
                        <span className="text-xs text-neutral-400 font-medium">Targeted suggestions</span>
                    </div>

                    {loadingATS ? (
                        <div className="py-8 space-y-3">
                            {[1, 2, 3].map(i => (
                                <div key={i} className="h-14 bg-neutral-100 animate-pulse rounded-none" />
                            ))}
                        </div>
                    ) : atsData?.breakdown ? (
                        <div className="divide-y divide-neutral-100">
                            {atsData.breakdown.map((item: any, idx: number) => (
                                <div key={idx} className="py-3.5 first:pt-0 last:pb-0 flex items-start gap-3">
                                    <div className={cn(
                                        "h-8 w-8 shrink-0 flex items-center justify-center font-black text-xs",
                                        item.score >= 80 ? "bg-emerald-50 text-emerald-700 border border-emerald-200" :
                                            item.score >= 50 ? "bg-amber-50 text-amber-700 border border-amber-200" :
                                                "bg-rose-50 text-rose-700 border border-rose-200"
                                    )}>
                                        {item.score}
                                    </div>
                                    <div className="flex-1 min-w-0 space-y-1">
                                        <div className="flex items-center justify-between gap-2">
                                            <h4 className="font-bold text-xs uppercase tracking-tight text-neutral-900">
                                                {item.category}
                                            </h4>
                                            {item.score < 80 && (
                                                <span className="text-[10px] font-bold bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded-none">
                                                    Action Required
                                                </span>
                                            )}
                                        </div>
                                        <ul className="space-y-1">
                                            {item.feedback?.map((f: string, fidx: number) => (
                                                <li key={fidx} className="text-xs text-neutral-600 flex items-start gap-1.5 leading-snug">
                                                    <CheckCircle2 className={cn(
                                                        "h-3.5 w-3.5 shrink-0 mt-0.5",
                                                        item.score >= 80 ? "text-emerald-600" : "text-neutral-400"
                                                    )} />
                                                    <span>{f}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                            ))}

                            {atsData.missingKeywords?.length > 0 && (
                                <div className="pt-4 mt-2">
                                    <div className="flex items-center gap-1.5 mb-2">
                                        <Info className="h-3.5 w-3.5 text-[#0d8274]" />
                                        <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-700">
                                            Suggested Industry Keywords
                                        </h4>
                                    </div>
                                    <div className="flex flex-wrap gap-1.5">
                                        {atsData.missingKeywords.map((kw: string, kidx: number) => (
                                            <span
                                                key={kidx}
                                                className="inline-flex items-center px-2 py-0.5 text-xs font-semibold bg-neutral-50 text-neutral-800 border border-neutral-200"
                                            >
                                                +{kw}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="py-12 text-center text-neutral-400">
                            <Search className="h-8 w-8 mx-auto mb-2 opacity-50" />
                            <p className="text-xs font-medium">Scan your resume to view prioritized optimizations.</p>
                        </div>
                    )}
                </Card>
            </div>
        </div>
    );
}
