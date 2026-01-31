"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Eye, TrendingUp, Calendar, Download, BarChart3 } from "lucide-react";
import { formatDistanceToNow, format, startOfDay, eachDayOfInterval, subDays } from "date-fns";
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
        </div>
    );
}
