"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Eye, TrendingUp, Calendar, Download, BarChart3, Sparkles, BrainCircuit, ArrowUpRight } from "lucide-react";
import { formatDistanceToNow, format, startOfDay, eachDayOfInterval, subDays } from "date-fns";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    AreaChart,
    Area
} from "recharts";

interface Resume {
    id: string;
    title: string;
    view_count: number;
    last_viewed_at: string | null;
}

interface ResumeEvent {
    id: string;
    event_type: string;
    created_at: string;
    browser: string | null;
    os: string | null;
    city: string | null;
    country: string | null;
}

interface AnalyticsViewProps {
    resumes: Resume[];
    events: ResumeEvent[];
}

export function AnalyticsView({ resumes, events }: AnalyticsViewProps) {
    const totalViews = resumes.reduce((sum, r) => sum + (r.view_count || 0), 0);
    const totalDownloads = events.filter(e => e.event_type === "download").length;

    const mostViewed = [...resumes].sort((a, b) => (b.view_count || 0) - (a.view_count || 0))[0];
    const lastActive = [...resumes]
        .filter(r => r.last_viewed_at)
        .sort((a, b) => new Date(b.last_viewed_at!).getTime() - new Date(a.last_viewed_at!).getTime())[0];

    const [insights, setInsights] = useState<any>(null);
    const [isLoadingInsights, setIsLoadingInsights] = useState(false);

    const fetchInsights = async () => {
        if (resumes.length === 0) return;
        setIsLoadingInsights(true);
        try {
            const response = await fetch("/api/ai/analytics-insights", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ resumes, events }),
            });
            if (!response.ok) throw new Error("Failed to fetch insights");
            const data = await response.json();
            setInsights(data);
        } catch (error) {
            console.error(error);
            toast.error("Failed to generate AI insights");
        } finally {
            setIsLoadingInsights(false);
        }
    };

    useEffect(() => {
        if (resumes.length > 0 && !insights) {
            fetchInsights();
        }
    }, [resumes.length]);

    // Prepare chart data for last 7 days
    const last7Days = eachDayOfInterval({
        start: startOfDay(subDays(new Date(), 6)),
        end: startOfDay(new Date()),
    });

    const chartData = last7Days.map(day => {
        const dateStr = format(day, "MMM dd");
        const dayEvents = events.filter(e =>
            format(new Date(e.created_at), "MMM dd") === dateStr
        );

        return {
            date: dateStr,
            views: dayEvents.filter(e => e.event_type === "view").length,
            downloads: dayEvents.filter(e => e.event_type === "download").length,
        };
    });

    return (
        <div className="space-y-8 px-4 md:px-0">
            <div className="grid gap-6 md:grid-cols-4">
                <Card className="glass-card bg-white/40 dark:bg-slate-950/40 border-none transition-all hover:scale-[1.02] duration-300">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-black uppercase tracking-widest text-primary/60">Total Views</CardTitle>
                        <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                            <TrendingUp className="h-4.5 w-4.5 text-primary" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-heading font-black tabular-nums">{totalViews}</div>
                        <p className="text-xs text-muted-foreground mt-2 font-medium">Global reach</p>
                    </CardContent>
                </Card>

                <Card className="glass-card bg-white/40 dark:bg-slate-950/40 border-none transition-all hover:scale-[1.02] duration-300">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-black uppercase tracking-widest text-primary/60">Success Rate</CardTitle>
                        <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                            <Download className="h-4.5 w-4.5 text-primary" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-heading font-black tabular-nums">{totalDownloads}</div>
                        <p className="text-xs text-muted-foreground mt-2 font-medium">Export performance</p>
                    </CardContent>
                </Card>

                <Card className="glass-card bg-white/40 dark:bg-slate-950/40 border-none transition-all hover:scale-[1.02] duration-300">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-black uppercase tracking-widest text-primary/60">Top Performer</CardTitle>
                        <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                            <Eye className="h-4.5 w-4.5 text-primary" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-heading font-black truncate max-w-full">
                            {mostViewed?.title ? mostViewed.title.split(' ')[0] : "N/A"}
                        </div>
                        <p className="text-xs text-muted-foreground mt-2 font-medium truncate">
                            {mostViewed ? `${mostViewed.view_count} unique views` : "Launching soon"}
                        </p>
                    </CardContent>
                </Card>

                <Card className="glass-card bg-white/40 dark:bg-slate-950/40 border-none transition-all hover:scale-[1.02] duration-300">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-black uppercase tracking-widest text-primary/60">Pulse</CardTitle>
                        <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                            <Calendar className="h-4.5 w-4.5 text-primary" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-heading font-black">
                            {lastActive?.last_viewed_at
                                ? formatDistanceToNow(new Date(lastActive.last_viewed_at), { addSuffix: false })
                                : "Static"}
                        </div>
                        <p className="text-xs text-muted-foreground mt-2 font-medium">Last interaction</p>
                    </CardContent>
                </Card>
            </div>

            <Card className="glass-card bg-white/50 dark:bg-slate-950/50 border-white/60 dark:border-white/5 shadow-2xl">
                <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className="text-xl font-heading font-black flex items-center gap-3">
                                <BarChart3 className="h-6 w-6 text-primary" />
                                Engagement Velocity
                            </CardTitle>
                            <CardDescription className="text-sm font-medium mt-1">Growth metrics for the past 7 days</CardDescription>
                        </div>
                        <Badge variant="outline" className="glass bg-primary/5 text-primary border-primary/20 font-bold px-3 py-1">
                            REAL-TIME
                        </Badge>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="h-[240px] w-full mt-6">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={chartData}>
                                <defs>
                                    <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.4} />
                                        <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                                    </linearGradient>
                                    <linearGradient id="colorDownloads" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.4} />
                                        <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--muted))" opacity={0.4} />
                                <XAxis
                                    dataKey="date"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))', fontWeight: 600 }}
                                    dy={10}
                                />
                                <YAxis
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))', fontWeight: 600 }}
                                />
                                <Tooltip
                                    cursor={{ stroke: 'hsl(var(--primary))', strokeWidth: 2, strokeDasharray: '5 5' }}
                                    contentStyle={{
                                        backgroundColor: 'rgba(255, 255, 255, 0.8)',
                                        backdropFilter: 'blur(12px)',
                                        border: '1px solid rgba(255, 255, 255, 0.3)',
                                        borderRadius: '16px',
                                        boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)',
                                        padding: '12px'
                                    }}
                                    itemStyle={{ fontWeight: 800, fontSize: '12px' }}
                                    labelStyle={{ fontWeight: 900, marginBottom: '4px', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.05em' }}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="views"
                                    stroke="hsl(var(--primary))"
                                    strokeWidth={4}
                                    fillOpacity={1}
                                    fill="url(#colorViews)"
                                    animationDuration={1500}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="downloads"
                                    stroke="#8b5cf6"
                                    strokeWidth={4}
                                    fillOpacity={1}
                                    fill="url(#colorDownloads)"
                                    animationDuration={1500}
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </CardContent>
            </Card>

            {/* AI Insights Section */}
            <div className="grid gap-6 md:grid-cols-3">
                <Card className="md:col-span-2 overflow-hidden glass-card bg-black/5 dark:bg-white/5 border-primary/20 relative rounded-3xl group">
                    <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none transition-transform duration-700 group-hover:scale-125 group-hover:rotate-12">
                        <BrainCircuit className="h-32 w-32 text-primary" />
                    </div>
                    <CardHeader className="relative">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <Badge className="gap-1.5 px-3 py-1 bg-primary text-primary-foreground font-black text-[10px] uppercase tracking-widest rounded-lg">
                                    <Sparkles className="h-3 w-3 animate-pulse" />
                                    Neural Optimizer
                                </Badge>
                                <CardTitle className="text-2xl font-heading font-black">AI Career Strategy</CardTitle>
                            </div>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={fetchInsights}
                                disabled={isLoadingInsights}
                                className="h-10 px-4 glass-border glass hover:bg-primary hover:text-primary-foreground font-bold transition-all rounded-xl shadow-lg active:scale-95"
                            >
                                <TrendingUp className="h-4 w-4 mr-2" />
                                Re-Analyze
                            </Button>
                        </div>
                        <CardDescription className="text-base font-medium mt-1">Machine-learning powered trajectory analysis</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6 relative">
                        {isLoadingInsights ? (
                            <div className="space-y-4 py-6">
                                <div className="h-6 bg-primary/10 rounded-xl animate-pulse w-full" />
                                <div className="h-20 bg-muted/20 rounded-xl animate-pulse w-full" />
                                <div className="h-6 bg-primary/5 rounded-xl animate-pulse w-3/4" />
                            </div>
                        ) : insights ? (
                            <>
                                <div className="bg-gradient-to-br from-primary/10 to-transparent p-6 rounded-2xl border border-white/40 dark:border-white/5 shadow-inner">
                                    <h4 className="text-xs font-black uppercase tracking-widest flex items-center gap-2 mb-3 text-primary/80">
                                        <ArrowUpRight className="h-4 w-4" />
                                        Performance Verdict
                                    </h4>
                                    <p className="text-lg text-foreground font-bold leading-relaxed tracking-tight">
                                        "{insights.performanceVerdict}"
                                    </p>
                                </div>
                                <div className="space-y-4">
                                    <h4 className="text-[10px] font-black uppercase text-muted-foreground tracking-[0.2em]">Strategic Roadmap</h4>
                                    <div className="grid gap-3 sm:grid-cols-2">
                                        {insights.insights.map((insight: string, idx: number) => (
                                            <div key={idx} className="flex items-start gap-4 p-4 rounded-2xl glass-border glass bg-white/20 dark:bg-black/20 hover:scale-[1.02] transition-transform">
                                                <div className="h-8 w-8 rounded-xl bg-primary text-primary-foreground flex items-center justify-center shrink-0 font-black text-sm shadow-lg shadow-primary/20">
                                                    {idx + 1}
                                                </div>
                                                <span className="text-sm font-semibold leading-relaxed tracking-tight">{insight}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </>
                        ) : (
                            <div className="py-12 text-center text-muted-foreground flex flex-col items-center gap-4">
                                <div className="h-20 w-20 rounded-[2rem] bg-primary/5 flex items-center justify-center animate-pulse">
                                    <Sparkles className="h-10 w-10 text-primary/40" />
                                </div>
                                <div className="space-y-1">
                                    <p className="font-bold text-lg">Analysis Pending</p>
                                    <p className="text-sm">Initiate the Neural Optimizer for career insights.</p>
                                </div>
                                <Button onClick={fetchInsights} className="mt-4 rounded-2xl font-black">BOOST VISIBILITY</Button>
                            </div>
                        )}
                    </CardContent>
                </Card>

                <Card className="glass-card bg-primary/5 border-primary/20 relative overflow-hidden rounded-3xl">
                    <div className="absolute -bottom-10 -left-10 opacity-5 pointer-events-none">
                        <Sparkles className="h-32 w-32 text-primary" />
                    </div>
                    <CardHeader>
                        <CardTitle className="text-lg font-heading font-black flex items-center gap-2">
                            <TrendingUp className="h-5 w-5 text-primary" />
                            Trend Engine
                        </CardTitle>
                        <CardDescription className="text-sm font-bold text-primary/60">High-impact keywords</CardDescription>
                    </CardHeader>
                    <CardContent className="relative">
                        {isLoadingInsights ? (
                            <div className="flex flex-wrap gap-2 pt-4">
                                {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
                                    <div key={i} className="h-8 w-20 bg-primary/10 rounded-full animate-pulse" />
                                ))}
                            </div>
                        ) : insights ? (
                            <div className="flex flex-wrap gap-2.5 pt-2">
                                {insights.keywordSuggestions.map((kw: string, idx: number) => (
                                    <Badge key={idx} variant="secondary" className="bg-white dark:bg-slate-900 border-none shadow-md hover:bg-primary hover:text-primary-foreground transition-all cursor-default font-bold px-4 py-2 rounded-xl text-xs tracking-tight">
                                        #{kw.toLowerCase().replace(/\s+/g, '')}
                                    </Badge>
                                ))}
                            </div>
                        ) : (
                            <div className="py-12 text-center opacity-40 grayscale">
                                <BrainCircuit className="h-12 w-12 mx-auto mb-2" />
                                <p className="text-xs font-black uppercase tracking-widest">Awaiting Neural Data</p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
