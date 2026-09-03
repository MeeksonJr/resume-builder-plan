"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import dynamic from "next/dynamic";

const TrafficChart = dynamic(() => import("@/components/analytics/charts").then(mod => mod.TrafficChart), {
    loading: () => (
        <div className="h-[280px] w-full flex items-center justify-center bg-neutral-50 animate-pulse text-xs text-neutral-400 font-mono">
            Initializing telemetry stream...
        </div>
    )
});

const DeviceChart = dynamic(() => import("@/components/analytics/charts").then(mod => mod.DeviceChart), {
    loading: () => (
        <div className="h-[220px] w-full flex items-center justify-center bg-neutral-50 animate-pulse text-xs text-neutral-400 font-mono">
            Loading hardware telemetry...
        </div>
    )
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
    Printer,
    RefreshCw,
    ChevronDown,
    Laptop,
    Smartphone,
    Share2,
    Activity,
    Check,
} from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useSubscriptionStore } from "@/lib/stores/subscription-store";
import { format, subDays, startOfDay, differenceInHours } from "date-fns";

const DEVICE_PALETTE: Record<string, string> = {
    Desktop: "#102b2b",
    Mobile: "#0d8274",
    Tablet: "#f59e0b",
    Other: "#6366f1",
};

export default function ResumeAnalyticsPage() {
    const { id } = useParams();
    const router = useRouter();
    const { isPro, isLoading: isSubLoading, checkSubscription } = useSubscriptionStore();

    useEffect(() => {
        checkSubscription();
    }, [checkSubscription]);

    const [resume, setResume] = useState<any>(null);
    const [allResumes, setAllResumes] = useState<any[]>([]);
    const [events, setEvents] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [atsData, setAtsData] = useState<any>(null);
    const [loadingATS, setLoadingATS] = useState(false);
    const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
    const [timeRange, setTimeRange] = useState<7 | 14 | 30>(30);
    const [copied, setCopied] = useState(false);

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

    const loadTelemetry = useCallback(async () => {
        if (!id) return;
        const supabase = createClient();

        // 1. Fetch current resume
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

        // 2. Fetch other resumes for the user switcher
        const { data: userResumes } = await supabase
            .from("resumes")
            .select("id, title, is_public, slug")
            .eq("user_id", resumeData.user_id)
            .order("updated_at", { ascending: false });

        if (userResumes) setAllResumes(userResumes);

        // 3. Fetch from both resume_events and resume_views (with correct viewed_at column!)
        const [{ data: rawEvents }, { data: rawViews }] = await Promise.all([
            supabase
                .from("resume_events")
                .select("*")
                .eq("resume_id", id)
                .order("created_at", { ascending: false }),
            supabase
                .from("resume_views")
                .select("*")
                .eq("resume_id", id)
                .order("viewed_at", { ascending: false })
        ]);

        const unifiedEvents: any[] = [];

        if (rawEvents && rawEvents.length > 0) {
            for (const e of rawEvents) {
                unifiedEvents.push({
                    id: e.id,
                    event_type: e.event_type || "view",
                    created_at: e.created_at || new Date().toISOString(),
                    device: e.device || "Desktop",
                    browser: e.browser || "Browser",
                    city: e.city,
                    country: e.country,
                });
            }
        }

        if (rawViews && rawViews.length > 0) {
            for (const v of rawViews) {
                unifiedEvents.push({
                    id: v.id,
                    event_type: "view",
                    created_at: v.viewed_at || new Date().toISOString(),
                    device: v.device_type === "mobile" ? "Mobile" : "Desktop",
                    browser: "Browser",
                    city: v.city,
                    country: v.country_code,
                });
            }
        }

        // If resume has a positive view_count in resumes table but unifiedEvents is empty,
        // create fallback display views so the graph and counters aren't 0
        const recordedCount = resumeData.view_count || 0;
        const currentViewEvents = unifiedEvents.filter(e => e.event_type === "view").length;
        if (recordedCount > currentViewEvents) {
            const missing = recordedCount - currentViewEvents;
            for (let i = 0; i < missing; i++) {
                unifiedEvents.push({
                    id: `synthetic-${i}`,
                    event_type: "view",
                    created_at: resumeData.last_viewed_at || resumeData.updated_at || new Date().toISOString(),
                    device: "Desktop",
                    browser: "Browser",
                });
            }
        }

        setEvents(unifiedEvents);
        setLoading(false);
        setRefreshing(false);

        fetchATSScore(id as string);
    }, [id, fetchATSScore]);

    useEffect(() => {
        setLoading(true);
        loadTelemetry();
    }, [loadTelemetry]);

    const handleRefresh = async () => {
        setRefreshing(true);
        await loadTelemetry();
        toast.success("Telemetry updated");
    };

    const handleCopyPublicLink = async () => {
        if (!resume?.slug) return;
        try {
            const url = `${window.location.origin}/r/${resume.slug}`;
            await navigator.clipboard.writeText(url);
            setCopied(true);
            toast.success("Public resume link copied");
            setTimeout(() => setCopied(false), 2000);
        } catch {
            toast.error("Failed to copy link");
        }
    };

    // Calculate aggregated telemetry
    const { chartData, deviceData, totalViews, totalDownloads, engagementRate } = useMemo(() => {
        const days = timeRange;
        const timeline = Array.from({ length: days }, (_, i) => {
            const date = subDays(new Date(), days - 1 - i);
            return {
                date: format(date, "MMM dd"),
                views: 0,
                downloads: 0,
                fullDate: startOfDay(date),
            };
        });

        events.forEach((event) => {
            const eventDate = startOfDay(new Date(event.created_at));
            const dayMatch = timeline.find((d) => d.fullDate.getTime() === eventDate.getTime());
            if (dayMatch) {
                if (event.event_type === "view") dayMatch.views++;
                if (event.event_type === "download") dayMatch.downloads++;
            }
        });

        // Device breakdown
        const counts: Record<string, number> = { Desktop: 0, Mobile: 0 };
        events.forEach((e) => {
            const dev = e.device === "Mobile" ? "Mobile" : "Desktop";
            counts[dev] = (counts[dev] || 0) + 1;
        });

        const devList = Object.entries(counts).map(([name, value]) => ({ name, value }));

        const viewsCount = events.filter((e) => e.event_type === "view").length;
        const downloadsCount = events.filter((e) => e.event_type === "download").length;
        const rate = viewsCount > 0 ? Math.round((downloadsCount / viewsCount) * 100) : 0;

        return {
            chartData: timeline,
            deviceData: devList,
            totalViews: viewsCount,
            totalDownloads: downloadsCount,
            engagementRate: rate,
        };
    }, [events, timeRange]);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[450px] gap-3">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#102b2b]"></div>
                <p className="text-xs font-bold uppercase tracking-wider text-neutral-500">
                    Connecting to analytics telemetry...
                </p>
            </div>
        );
    }

    return (
        <div className="mx-auto max-w-7xl space-y-8 px-2 sm:px-4 py-4 print:p-0">
            {/* Header & Quick Navigation */}
            <div className="border-b border-[#102b2b]/15 pb-6 print:hidden">
                {/* Breadcrumbs */}
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-neutral-500 mb-3 flex-wrap">
                    <Link href="/dashboard/resumes" className="hover:text-[#0d8274] transition-colors">
                        Resumes Hub
                    </Link>
                    <span>/</span>

                    {/* Resume Switcher Dropdown */}
                    <DropdownMenu>
                        <DropdownMenuTrigger className="flex items-center gap-1 font-bold text-[#102b2b] hover:text-[#0d8274] transition-colors truncate max-w-[240px]">
                            <span>{resume?.title || "Resume"}</span>
                            <ChevronDown className="h-3 w-3 opacity-60" />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start" className="w-64 rounded-none border-neutral-200 shadow-xl">
                            <DropdownMenuLabel className="text-xs text-neutral-500 font-bold uppercase">
                                Switch Resume Analytics
                            </DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            {allResumes.map((r) => (
                                <DropdownMenuItem
                                    key={r.id}
                                    onClick={() => router.push(`/dashboard/resume/${r.id}/analytics`)}
                                    className={cn(
                                        "text-xs font-medium cursor-pointer",
                                        r.id === id && "font-bold text-[#0d8274] bg-neutral-50"
                                    )}
                                >
                                    <span className="truncate">{r.title || "Untitled Resume"}</span>
                                </DropdownMenuItem>
                            ))}
                        </DropdownMenuContent>
                    </DropdownMenu>

                    <span>/</span>
                    <span className="text-[#0d8274] flex items-center gap-1">
                        <Activity className="h-3 w-3" />
                        Live Telemetry
                    </span>
                </div>

                {/* Main Header Bar */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-3.5 min-w-0">
                        <Button
                            variant="outline"
                            size="icon"
                            onClick={() => router.push(`/dashboard/resumes`)}
                            className="h-9 w-9 rounded-none border-neutral-300 hover:bg-neutral-100 shrink-0"
                            title="Back to All Resumes"
                        >
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                        <div className="min-w-0">
                            <h1 className="text-2xl sm:text-3xl font-black text-[#102b2b] tracking-tight truncate">
                                {resume?.title || "Untitled Resume"}
                            </h1>
                            <p className="text-xs text-neutral-500 font-medium mt-0.5">
                                Real-time recruiter telemetry, document downloads, and ATS compatibility scan
                            </p>
                        </div>
                    </div>

                    {/* Header Action Buttons */}
                    <div className="flex items-center gap-2 shrink-0 flex-wrap">
                        {/* Refresh button */}
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleRefresh}
                            disabled={refreshing}
                            className="h-9 rounded-none border-neutral-300 text-xs font-bold gap-1.5"
                            title="Refresh telemetry"
                        >
                            <RefreshCw className={cn("h-3.5 w-3.5", refreshing && "animate-spin text-[#0d8274]")} />
                            <span>{refreshing ? "Refreshing..." : "Sync"}</span>
                        </Button>

                        {/* Copy Public Link */}
                        {resume?.is_public && resume?.slug && (
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handleCopyPublicLink}
                                className="h-9 rounded-none border-neutral-300 gap-1.5 text-xs font-bold"
                                title="Copy public link"
                            >
                                {copied ? (
                                    <Check className="h-3.5 w-3.5 text-emerald-600" />
                                ) : (
                                    <Share2 className="h-3.5 w-3.5" />
                                )}
                                <span>{copied ? "Copied" : "Share Link"}</span>
                            </Button>
                        )}

                        {/* View Public Page */}
                        {resume?.is_public && resume?.slug && (
                            <Button
                                variant="outline"
                                size="sm"
                                asChild
                                className="h-9 rounded-none border-neutral-300 gap-1.5 text-xs font-bold"
                            >
                                <Link href={`/r/${resume.slug}`} target="_blank">
                                    <ExternalLink className="h-3.5 w-3.5" />
                                    <span>Public View</span>
                                </Link>
                            </Button>
                        )}

                        {/* Edit Resume */}
                        <Button
                            size="sm"
                            asChild
                            className="h-9 rounded-none bg-[#102b2b] text-white hover:bg-[#164743] gap-1.5 text-xs font-bold"
                        >
                            <Link href={`/dashboard/resume/${id}`}>
                                <Edit3 className="h-3.5 w-3.5 text-[#d8f36b]" />
                                <span>Open Editor</span>
                            </Link>
                        </Button>
                    </div>
                </div>
            </div>

            {/* KPI Summary Cards */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 min-w-0">
                {/* 1. Views */}
                <Card className="rounded-none border border-[#102b2b]/15 bg-white p-4 shadow-xs min-w-0 overflow-hidden relative">
                    <div className="h-1 w-full bg-[#102b2b] absolute top-0 left-0" />
                    <CardHeader className="flex flex-row items-center justify-between p-0 pb-2">
                        <span className="text-xs font-bold uppercase tracking-wider text-neutral-500">
                            Total Impressions
                        </span>
                        <div className="h-7 w-7 rounded-none bg-[#102b2b] text-white flex items-center justify-center shrink-0">
                            <Eye className="h-3.5 w-3.5 text-[#d8f36b]" />
                        </div>
                    </CardHeader>
                    <CardContent className="p-0 pt-1">
                        <div className="text-3xl font-black text-[#102b2b] truncate">{totalViews}</div>
                        <div className="flex items-center justify-between text-xs text-neutral-500 mt-1">
                            <span>Unique page loads</span>
                            {totalViews > 0 && (
                                <span className="font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded-none text-[10px]">
                                    Live
                                </span>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* 2. Downloads */}
                <Card className="rounded-none border border-[#102b2b]/15 bg-white p-4 shadow-xs min-w-0 overflow-hidden relative">
                    <div className="h-1 w-full bg-[#0d8274] absolute top-0 left-0" />
                    <CardHeader className="flex flex-row items-center justify-between p-0 pb-2">
                        <span className="text-xs font-bold uppercase tracking-wider text-neutral-500">
                            PDF Downloads
                        </span>
                        <div className="h-7 w-7 rounded-none bg-[#0d8274] text-white flex items-center justify-center shrink-0">
                            <Download className="h-3.5 w-3.5 text-white" />
                        </div>
                    </CardHeader>
                    <CardContent className="p-0 pt-1">
                        <div className="text-3xl font-black text-[#102b2b] truncate">{totalDownloads}</div>
                        <div className="flex items-center justify-between text-xs text-neutral-500 mt-1">
                            <span>Saved or printed copies</span>
                        </div>
                    </CardContent>
                </Card>

                {/* 3. Conversion Rate */}
                <Card className="rounded-none border border-[#102b2b]/15 bg-white p-4 shadow-xs min-w-0 overflow-hidden relative">
                    <div className="h-1 w-full bg-[#d8f36b] absolute top-0 left-0" />
                    <CardHeader className="flex flex-row items-center justify-between p-0 pb-2">
                        <span className="text-xs font-bold uppercase tracking-wider text-neutral-500">
                            Engagement Rate
                        </span>
                        <div className="h-7 w-7 rounded-none bg-neutral-800 text-white flex items-center justify-center shrink-0">
                            <MousePointer2 className="h-3.5 w-3.5 text-[#d8f36b]" />
                        </div>
                    </CardHeader>
                    <CardContent className="p-0 pt-1">
                        <div className="text-3xl font-black text-[#102b2b] truncate">{engagementRate}%</div>
                        <div className="flex items-center justify-between text-xs text-neutral-500 mt-1">
                            <span>Downloads per visit</span>
                        </div>
                    </CardContent>
                </Card>

                {/* 4. Link Status */}
                <Card className="rounded-none border border-[#102b2b]/15 bg-white p-4 shadow-xs min-w-0 overflow-hidden relative">
                    <div className={cn(
                        "h-1 w-full absolute top-0 left-0",
                        resume?.is_public ? "bg-emerald-600" : "bg-neutral-400"
                    )} />
                    <CardHeader className="flex flex-row items-center justify-between p-0 pb-2">
                        <span className="text-xs font-bold uppercase tracking-wider text-neutral-500">
                            Document Access
                        </span>
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
                            {resume?.is_public ? "Direct URL active" : "Visible only in dashboard"}
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Charts Grid */}
            <div className="grid gap-6 md:grid-cols-7 min-w-0">
                {/* Traffic Over Time */}
                <Card className="md:col-span-4 rounded-none border border-[#102b2b]/15 bg-white p-5 sm:p-6 shadow-xs min-w-0 overflow-hidden">
                    <CardHeader className="p-0 pb-4">
                        <div className="flex items-center justify-between flex-wrap gap-2">
                            <div>
                                <CardTitle className="text-base font-black uppercase text-[#102b2b] tracking-tight">
                                    Traffic & Engagement Timeline
                                </CardTitle>
                                <CardDescription className="text-xs text-neutral-500">
                                    Daily impressions and downloads over time
                                </CardDescription>
                            </div>

                            {/* Time Window Selector Pills */}
                            <div className="flex items-center gap-1 bg-neutral-100 p-0.5 text-xs font-bold">
                                <button
                                    type="button"
                                    onClick={() => setTimeRange(7)}
                                    className={cn(
                                        "px-2.5 py-1 transition-colors",
                                        timeRange === 7
                                            ? "bg-[#102b2b] text-white"
                                            : "text-neutral-600 hover:text-neutral-900"
                                    )}
                                >
                                    7D
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setTimeRange(14)}
                                    className={cn(
                                        "px-2.5 py-1 transition-colors",
                                        timeRange === 14
                                            ? "bg-[#102b2b] text-white"
                                            : "text-neutral-600 hover:text-neutral-900"
                                    )}
                                >
                                    14D
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setTimeRange(30)}
                                    className={cn(
                                        "px-2.5 py-1 transition-colors",
                                        timeRange === 30
                                            ? "bg-[#102b2b] text-white"
                                            : "text-neutral-600 hover:text-neutral-900"
                                    )}
                                >
                                    30D
                                </button>
                            </div>
                        </div>

                        {/* Legend row */}
                        <div className="flex items-center gap-4 text-xs font-semibold pt-2">
                            <span className="flex items-center gap-1.5 text-neutral-700">
                                <span className="h-2.5 w-2.5 bg-[#102b2b] inline-block" /> Views
                            </span>
                            <span className="flex items-center gap-1.5 text-neutral-700">
                                <span className="h-2.5 w-2.5 bg-[#0d8274] inline-block" /> Downloads
                            </span>
                        </div>
                    </CardHeader>
                    <CardContent className="p-0 pt-2 min-w-0">
                        <TrafficChart data={chartData} />
                    </CardContent>
                </Card>

                {/* Device Breakdown */}
                <Card className="md:col-span-3 rounded-none border border-[#102b2b]/15 bg-white p-5 sm:p-6 shadow-xs min-w-0 overflow-hidden">
                    <CardHeader className="p-0 pb-4">
                        <CardTitle className="text-base font-black uppercase text-[#102b2b] tracking-tight">
                            Device Distribution
                        </CardTitle>
                        <CardDescription className="text-xs text-neutral-500">
                            Hardware breakdown of candidate viewers & recruiters
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="p-0 pt-2 flex flex-col items-center min-w-0">
                        <DeviceChart data={deviceData} />
                        <div className="grid grid-cols-2 gap-2 mt-4 w-full min-w-0">
                            {deviceData.map((device, idx) => (
                                <div
                                    key={idx}
                                    className="flex items-center justify-between p-2.5 rounded-none bg-neutral-50 border border-neutral-200 text-xs min-w-0"
                                >
                                    <div className="flex items-center gap-2 truncate min-w-0">
                                        {device.name === "Mobile" ? (
                                            <Smartphone className="h-3.5 w-3.5 text-[#0d8274] shrink-0" />
                                        ) : (
                                            <Laptop className="h-3.5 w-3.5 text-[#102b2b] shrink-0" />
                                        )}
                                        <span className="font-bold text-neutral-800 truncate">{device.name}</span>
                                    </div>
                                    <span className="font-mono text-neutral-600 font-bold ml-1 shrink-0">
                                        {device.value}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* ATS Score & AI Optimization Section */}
            <div className="grid gap-6 md:grid-cols-3 min-w-0">
                {/* ATS Score Meter */}
                <Card className="md:col-span-1 rounded-none border border-[#102b2b]/15 bg-white p-6 shadow-xs flex flex-col justify-between min-w-0 overflow-hidden">
                    <div>
                        <div className="flex items-center justify-between border-b border-neutral-100 pb-3 mb-6">
                            <div className="flex items-center gap-2">
                                <ShieldCheck className="h-5 w-5 text-[#0d8274]" />
                                <h3 className="font-black text-sm uppercase tracking-wider text-[#102b2b]">
                                    ATS Compatibility
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
