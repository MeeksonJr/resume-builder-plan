"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import dynamic from "next/dynamic";

const TrafficChart = dynamic(() => import("@/components/analytics/charts").then(mod => mod.TrafficChart), {
    loading: () => <div className="h-[300px] w-full flex items-center justify-center bg-muted/20 animate-pulse rounded-xl">Loading Chart...</div>
});

const DeviceChart = dynamic(() => import("@/components/analytics/charts").then(mod => mod.DeviceChart), {
    loading: () => <div className="h-[200px] w-full flex items-center justify-center bg-muted/20 animate-pulse rounded-xl">Loading...</div>
});
import {
    ArrowLeft,
    BarChart3,
    Download,
    Eye,
    Globe,
    Smartphone,
    Laptop,
    Chrome,
    Calendar,
    MousePointer2,
    Zap,
    CheckCircle2,
    AlertCircle,
    Info,
    TrendingDown,
    ShieldCheck,
    Search,
    Lock as LockIcon
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { useSubscriptionStore } from "@/lib/stores/subscription-store";
import { format, subDays, startOfDay, isWithinInterval, differenceInHours } from "date-fns";

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

export default function ResumeAnalyticsPage() {
    const { id } = useParams();
    const router = useRouter();
    const { isPro, isLoading: isSubLoading, checkSubscription } = useSubscriptionStore();

    // Check subscription on mount
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
        // Gate check
        if (!isPro && !isSubLoading) {
            toast.error("Upgrade to Pro to use AI Analytics!");
            router.push("/dashboard/subscription");
            return;
        }

        setLoadingATS(true);
        const supabase = createClient();
        try {
            // 1. Check Cache (if not forced)
            if (!force) {
                const { data: cache } = await supabase
                    .from("resume_ats_cache")
                    .select("*")
                    .eq("resume_id", resumeId)
                    .order("created_at", { ascending: false }) // Get latest
                    .limit(1)
                    .single();

                if (cache) {
                    const hoursSinceUpdate = differenceInHours(new Date(), new Date(cache.created_at));
                    if (hoursSinceUpdate < 24) {
                        console.log("Using cached ATS data");
                        setAtsData(cache.analysis_data);
                        setLastUpdated(new Date(cache.created_at));
                        setLoadingATS(false);
                        return;
                    }
                }
            }

            // 2. Fetch all resume parts (if no cache or stale/forced)
            const [
                { data: profile },
                { data: workExperiences },
                { data: education },
                { data: skills },
                { data: projects },
                { data: certifications },
                { data: languages },
            ] = await Promise.all([
                supabase.from("personal_info").select("*").eq("resume_id", resumeId).maybeSingle(),
                supabase.from("work_experiences").select("*").eq("resume_id", resumeId),
                supabase.from("education").select("*").eq("resume_id", resumeId),
                supabase.from("skills").select("*").eq("resume_id", resumeId),
                supabase.from("projects").select("*").eq("resume_id", resumeId),
                supabase.from("certifications").select("*").eq("resume_id", resumeId),
                supabase.from("languages").select("*").eq("resume_id", resumeId),
            ]);

            const resumeData = {
                profile,
                workExperiences: workExperiences || [],
                education: education || [],
                skills: skills || [],
                projects: projects || [],
                certifications: certifications || [],
                languages: languages || [],
            };

            const response = await fetch("/api/ai/ats-score", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ resumeData }),
            });

            if (!response.ok) throw new Error("ATS Scoring failed");
            const data = await response.json();

            // 3. Save to Cache
            const { error: cacheError } = await supabase.from("resume_ats_cache").insert({
                resume_id: resumeId,
                ats_score: data.score,
                analysis_data: data
            });

            if (cacheError) console.error("Failed to cache ATS data:", cacheError);

            setAtsData(data);
            setLastUpdated(new Date());

        } catch (err) {
            console.error("ATS Fetch Error:", err);
            toast.error("Failed to analyze resume");
        } finally {
            setLoadingATS(false);
        }
    }, []);

    useEffect(() => {
        async function fetchData() {
            const supabase = createClient();

            // Fetch resume details
            const { data: resumeData } = await supabase
                .from("resumes")
                .select("title")
                .eq("id", id)
                .single();

            setResume(resumeData);

            // Fetch events
            const { data: eventData } = await supabase
                .from("resume_events")
                .select("*")
                .eq("resume_id", id)
                .order("created_at", { ascending: true });

            setEvents(eventData || []);
            setLoading(false);

            // Fetch full resume data for ATS scoring
            fetchATSScore(id as string);
        }

        fetchData();
    }, [id, fetchATSScore]);

    if (loading) return (
        <div className="flex items-center justify-center min-h-[400px]">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
    );

    // Process Data for Charts
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

    // Device breakdown
    const deviceData = Object.entries(
        events.reduce((acc: Record<string, number>, event) => {
            const device = event.device || 'Unknown';
            acc[device] = (acc[device] || 0) + 1;
            return acc;
        }, {})
    ).map(([name, value]) => ({ name, value: value as number }));

    // Browser breakdown
    const browserData = Object.entries(
        events.reduce((acc: Record<string, number>, event) => {
            const browser = event.browser || 'Unknown';
            acc[browser] = (acc[browser] || 0) + 1;
            return acc;
        }, {})
    ).map(([name, value]) => ({ name, value: value as number }));

    const totalViews = events.filter(e => e.event_type === 'view').length;
    const totalDownloads = events.filter(e => e.event_type === 'download').length;

    return (
        <div className="space-y-8 p-6 lg:p-10">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={() => router.back()}>
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                    <div>
                        <h1 className="text-3xl font-black tracking-tight">{resume?.title} Analytics</h1>
                        <p className="text-muted-foreground font-medium">Detailed performance metrics for this resume</p>
                    </div>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-2xl border border-primary/20">
                    <Calendar className="h-4 w-4 text-primary" />
                    <span className="text-xs font-bold text-primary uppercase">Last 30 Days</span>
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                <Card className="bg-white dark:bg-slate-950 border-2 border-primary/5 shadow-xl hover:shadow-2xl transition-all">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-xs font-black uppercase text-primary/60">Total Views</CardTitle>
                        <Eye className="h-4 w-4 text-primary" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-black">{totalViews}</div>
                    </CardContent>
                </Card>
                <Card className="bg-white dark:bg-slate-950 border-2 border-primary/5 shadow-xl hover:shadow-2xl transition-all">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-xs font-black uppercase text-primary/60">Total Downloads</CardTitle>
                        <Download className="h-4 w-4 text-primary" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-black">{totalDownloads}</div>
                    </CardContent>
                </Card>
                <Card className="bg-white dark:bg-slate-950 border-2 border-primary/5 shadow-xl hover:shadow-2xl transition-all">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-xs font-black uppercase text-primary/60">Success Rate</CardTitle>
                        <MousePointer2 className="h-4 w-4 text-primary" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-black">
                            {totalViews > 0 ? Math.round((totalDownloads / totalViews) * 100) : 0}%
                        </div>
                    </CardContent>
                </Card>
                <Card className="bg-white dark:bg-slate-950 border-2 border-primary/5 shadow-xl hover:shadow-2xl transition-all">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-xs font-black uppercase text-primary/60">Status</CardTitle>
                        <Globe className="h-4 w-4 text-emerald-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-black text-emerald-500">Live</div>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-6 md:grid-cols-7">
                <Card className="md:col-span-4 bg-white dark:bg-slate-950 border-2 border-primary/5 shadow-xl">
                    <CardHeader>
                        <CardTitle className="text-lg font-black uppercase">Traffic Over Time</CardTitle>
                        <CardDescription>Daily views and downloads over the last 30 days</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <TrafficChart data={last30Days} />
                    </CardContent>
                </Card>

                <Card className="md:col-span-3 bg-white dark:bg-slate-950 border-2 border-primary/5 shadow-xl">
                    <CardHeader>
                        <CardTitle className="text-lg font-black uppercase">Device Breakdown</CardTitle>
                        <CardDescription>Where your visitors are coming from</CardDescription>
                    </CardHeader>
                    <CardContent className="flex flex-col items-center">
                        <DeviceChart data={deviceData} />
                        <div className="grid grid-cols-2 gap-4 mt-4 w-full">
                            {deviceData.map((device, idx) => (
                                <div key={idx} className="flex items-center gap-2 p-2 rounded-xl bg-muted/30">
                                    <div className="h-3 w-3 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }} />
                                    <span className="text-xs font-bold truncate">{device.name} ({device.value})</span>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                <Card className="lg:col-span-1 bg-white dark:bg-slate-950 border-2 border-primary/5 shadow-xl overflow-hidden">
                    <CardHeader className="border-b bg-primary/5 flex flex-row items-center justify-between">
                        <CardTitle className="text-lg font-black flex items-center gap-2">
                            <ShieldCheck className="h-5 w-5 text-primary" />
                            ATS COMPATIBILITY
                        </CardTitle>
                        {atsData && (
                            <div className="flex items-center gap-3">
                                {lastUpdated && (
                                    <span className="text-[10px] uppercase font-bold text-muted-foreground">
                                        Last Updated: {format(lastUpdated, "MMM d, h:mm a")}
                                    </span>
                                )}
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="h-7 text-xs font-bold gap-1"
                                    onClick={() => fetchATSScore(id as string, true)}
                                    disabled={loadingATS}
                                >
                                    {!isPro ? (
                                        <LockIcon className="h-3 w-3 text-muted-foreground" />
                                    ) : (
                                        <Zap className={cn("h-3 w-3", loadingATS ? "text-muted-foreground" : "text-amber-500")} />
                                    )}
                                    {loadingATS ? "Analyzing..." : "Re-Check"}
                                </Button>
                            </div>
                        )}
                    </CardHeader>
                    <CardContent className="p-8 flex flex-col items-center justify-center space-y-6">
                        {loadingATS ? (
                            <div className="py-12 flex flex-col items-center gap-4">
                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                                <p className="text-sm font-bold animate-pulse text-primary">SCANNING RESUME...</p>
                            </div>
                        ) : atsData ? (
                            <>
                                <div className="relative h-40 w-40 flex items-center justify-center">
                                    <svg className="h-full w-full -rotate-90">
                                        <circle
                                            cx="80"
                                            cy="80"
                                            r="70"
                                            fill="transparent"
                                            stroke="hsl(var(--muted))"
                                            strokeWidth="12"
                                            className="opacity-20"
                                        />
                                        <circle
                                            cx="80"
                                            cy="80"
                                            r="70"
                                            fill="transparent"
                                            stroke="hsl(var(--primary))"
                                            strokeWidth="12"
                                            strokeDasharray={440}
                                            strokeDashoffset={440 - (440 * atsData.score) / 100}
                                            strokeLinecap="round"
                                            className="transition-all duration-1000 ease-out"
                                        />
                                    </svg>
                                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                                        <span className="text-5xl font-black">{atsData.score}</span>
                                        <span className="text-xs font-bold uppercase text-muted-foreground mt-1">SCORE</span>
                                    </div>
                                </div>
                                <div className="text-center space-y-2">
                                    <p className="text-sm font-bold text-muted-foreground leading-snug">
                                        {atsData.overallFeedback}
                                    </p>
                                    <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 font-black">
                                        {atsData.score >= 80 ? "EXCELLENT" : atsData.score >= 60 ? "GOOD" : "NEEDS WORK"}
                                    </Badge>
                                </div>
                            </>
                        ) : (
                            <div className="py-12 text-center space-y-4">
                                <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto" />
                                <p className="text-sm font-medium text-muted-foreground">Could not calculate ATS score.</p>
                                <Button onClick={() => fetchATSScore(id as string)} variant="outline" size="sm" className="rounded-xl font-bold">
                                    Retry Scan
                                </Button>
                            </div>
                        )}
                    </CardContent>
                </Card>

                <Card className="lg:col-span-2 bg-white dark:bg-slate-950 border-2 border-primary/5 shadow-xl">
                    <CardHeader className="border-b bg-primary/5">
                        <CardTitle className="text-lg font-black flex items-center gap-2">
                            <Zap className="h-5 w-5 text-primary" />
                            CRITICAL OPTIMIZATIONS
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        {loadingATS ? (
                            <div className="p-12 space-y-4">
                                {[1, 2, 3].map(i => (
                                    <div key={i} className="h-16 bg-muted animate-pulse rounded-2xl" />
                                ))}
                            </div>
                        ) : atsData ? (
                            <div className="divide-y divide-primary/5">
                                {atsData.breakdown.map((item: any, idx: number) => (
                                    <div key={idx} className="p-5 flex items-start gap-4 hover:bg-primary/[0.02] transition-colors">
                                        <div className={cn(
                                            "h-10 w-10 shrink-0 rounded-xl flex items-center justify-center font-black",
                                            item.score >= 80 ? "bg-emerald-500/10 text-emerald-500" :
                                                item.score >= 50 ? "bg-amber-500/10 text-amber-500" :
                                                    "bg-rose-500/10 text-rose-500"
                                        )}>
                                            {item.score}
                                        </div>
                                        <div className="space-y-2 flex-1 min-w-0">
                                            <div className="flex items-center justify-between gap-2">
                                                <h4 className="font-black text-sm uppercase tracking-tight">{item.category}</h4>
                                                {item.score < 80 && (
                                                    <Badge variant="secondary" className="text-[10px] font-black tracking-tighter bg-amber-500/10 text-amber-600 border-none">
                                                        HIGH IMPACT
                                                    </Badge>
                                                )}
                                            </div>
                                            <ul className="space-y-1.5 pt-1">
                                                {item.feedback.map((f: string, fidx: number) => (
                                                    <li key={fidx} className="text-xs text-muted-foreground flex items-start gap-2 leading-relaxed">
                                                        <CheckCircle2 className={cn("h-3.5 w-3.5 shrink-0 mt-0.5", item.score >= 80 ? "text-emerald-500" : "text-muted-foreground/40")} />
                                                        {f}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    </div>
                                ))}
                                {atsData.missingKeywords.length > 0 && (
                                    <div className="p-5 bg-primary/[0.03]">
                                        <h4 className="text-xs font-black uppercase tracking-widest text-primary mb-3 flex items-center gap-2">
                                            <Info className="h-3.5 w-3.5" />
                                            Target Industry Keywords
                                        </h4>
                                        <div className="flex flex-wrap gap-2">
                                            {atsData.missingKeywords.map((kw: string, kidx: number) => (
                                                <Badge key={kidx} variant="outline" className="bg-white dark:bg-slate-900 border-primary/20 text-primary font-bold text-[10px] px-3 py-1 rounded-lg">
                                                    +{kw}
                                                </Badge>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="p-12 text-center opacity-40 grayscale py-32">
                                <Search className="h-12 w-12 mx-auto mb-4" />
                                <p className="font-bold">No Optimization Data</p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
