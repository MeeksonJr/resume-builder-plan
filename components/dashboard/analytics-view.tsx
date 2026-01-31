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
        <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Views</CardTitle>
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{totalViews}</div>
                        <p className="text-xs text-muted-foreground mt-1">Across all public resumes</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Downloads</CardTitle>
                        <Download className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{totalDownloads}</div>
                        <p className="text-xs text-muted-foreground mt-1">PDF & Word exports</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Most Viewed</CardTitle>
                        <Eye className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold truncate">{mostViewed?.title || "N/A"}</div>
                        <p className="text-xs text-muted-foreground mt-1">
                            {mostViewed ? `${mostViewed.view_count} views` : "None yet"}
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Last Activity</CardTitle>
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {lastActive?.last_viewed_at
                                ? formatDistanceToNow(new Date(lastActive.last_viewed_at), { addSuffix: true })
                                : "No activity"}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1 text-ellipsis overflow-hidden">
                            {lastActive ? `Resume: ${lastActive.title}` : "Shared links will track views"}
                        </p>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="text-base font-semibold flex items-center gap-2">
                        <BarChart3 className="h-5 w-5 text-primary" />
                        Performance Trends
                    </CardTitle>
                    <CardDescription>Views and downloads over the last 7 days</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="h-[200px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={chartData}>
                                <defs>
                                    <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                                    </linearGradient>
                                    <linearGradient id="colorDownloads" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="hsl(var(--secondary))" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="hsl(var(--secondary))" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--muted))" />
                                <XAxis
                                    dataKey="date"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
                                />
                                <YAxis
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
                                />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: 'hsl(var(--background))',
                                        border: '1px solid hsl(var(--border))',
                                        borderRadius: '8px'
                                    }}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="views"
                                    stroke="hsl(var(--primary))"
                                    fillOpacity={1}
                                    fill="url(#colorViews)"
                                />
                                <Area
                                    type="monotone"
                                    dataKey="downloads"
                                    stroke="hsl(var(--secondary))"
                                    fillOpacity={1}
                                    fill="url(#colorDownloads)"
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </CardContent>
            </Card>

            {/* AI Insights Section */}
            <div className="grid gap-4 md:grid-cols-3">
                <Card className="md:col-span-2 overflow-hidden border-2 border-primary/10 relative">
                    <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                        <Sparkles className="h-24 w-24" />
                    </div>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Badge variant="secondary" className="gap-1 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider">
                                    <BrainCircuit className="h-3 w-3 text-primary" />
                                    AI Career Coach
                                </Badge>
                                <CardTitle className="text-lg font-bold">Performance Insights</CardTitle>
                            </div>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={fetchInsights}
                                disabled={isLoadingInsights}
                                className="h-8 text-xs gap-1"
                            >
                                <TrendingUp className="h-3 w-3" />
                                Refresh Analysis
                            </Button>
                        </div>
                        <CardDescription>AI-powered suggestions to boost your resume visibility</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {isLoadingInsights ? (
                            <div className="space-y-3 py-4">
                                <div className="h-4 bg-muted rounded animate-pulse w-3/4" />
                                <div className="h-4 bg-muted rounded animate-pulse w-1/2" />
                                <div className="h-4 bg-muted rounded animate-pulse w-2/3" />
                            </div>
                        ) : insights ? (
                            <>
                                <div className="bg-primary/5 p-4 rounded-xl border border-primary/10">
                                    <h4 className="text-sm font-bold flex items-center gap-2 mb-2">
                                        <ArrowUpRight className="h-4 w-4 text-primary" />
                                        Performance Verdict
                                    </h4>
                                    <p className="text-sm text-muted-foreground italic leading-relaxed">
                                        "{insights.performanceVerdict}"
                                    </p>
                                </div>
                                <div className="space-y-3">
                                    <h4 className="text-xs font-bold uppercase text-muted-foreground tracking-wider">Strategic Recommendations</h4>
                                    <ul className="space-y-2">
                                        {insights.insights.map((insight: string, idx: number) => (
                                            <li key={idx} className="flex items-start gap-2 text-sm">
                                                <div className="h-5 w-5 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                                                    <span className="text-[10px] font-bold text-primary">{idx + 1}</span>
                                                </div>
                                                <span className="leading-relaxed">{insight}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </>
                        ) : (
                            <div className="py-8 text-center text-muted-foreground text-sm flex flex-col items-center gap-2">
                                <Sparkles className="h-8 w-8 opacity-20" />
                                <p>Click "Refresh Analysis" to generate insights.</p>
                            </div>
                        )}
                    </CardContent>
                </Card>

                <Card className="bg-muted/30">
                    <CardHeader>
                        <CardTitle className="text-sm font-bold flex items-center gap-2">
                            <Sparkles className="h-4 w-4 text-primary" />
                            Keyword Suggestions
                        </CardTitle>
                        <CardDescription className="text-xs">Trending in your industry</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {isLoadingInsights ? (
                            <div className="flex flex-wrap gap-2">
                                {[1, 2, 3, 4, 5, 6].map(i => (
                                    <div key={i} className="h-6 w-16 bg-muted rounded-full animate-pulse" />
                                ))}
                            </div>
                        ) : insights ? (
                            <div className="flex flex-wrap gap-2">
                                {insights.keywordSuggestions.map((kw: string, idx: number) => (
                                    <Badge key={idx} variant="outline" className="bg-background hover:bg-primary/5 transition-colors cursor-default border-primary/20">
                                        {kw}
                                    </Badge>
                                ))}
                            </div>
                        ) : (
                            <p className="text-xs text-muted-foreground">Insights required.</p>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
