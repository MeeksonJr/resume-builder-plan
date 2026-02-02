"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    BarChart,
    Bar,
    Cell,
    PieChart,
    Pie
} from "recharts";
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
    MousePointer2
} from "lucide-react";
import { format, subDays, startOfDay, isWithinInterval } from "date-fns";

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

export default function ResumeAnalyticsPage() {
    const { id } = useParams();
    const router = useRouter();
    const [resume, setResume] = useState<any>(null);
    const [events, setEvents] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

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
        }

        fetchData();
    }, [id]);

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
                        <div className="h-[300px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={last30Days}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--muted))" />
                                    <XAxis dataKey="date" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                                    <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value}`} />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: 'white', borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                                    />
                                    <Line type="monotone" dataKey="views" stroke="hsl(var(--primary))" strokeWidth={3} dot={false} />
                                    <Line type="monotone" dataKey="downloads" stroke="#10b981" strokeWidth={3} dot={false} />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>

                <Card className="md:col-span-3 bg-white dark:bg-slate-950 border-2 border-primary/5 shadow-xl">
                    <CardHeader>
                        <CardTitle className="text-lg font-black uppercase">Device Breakdown</CardTitle>
                        <CardDescription>Where your visitors are coming from</CardDescription>
                    </CardHeader>
                    <CardContent className="flex flex-col items-center">
                        <div className="h-[200px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={deviceData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={80}
                                        paddingAngle={5}
                                        dataKey="value"
                                    >
                                        {deviceData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
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

            <Card className="bg-white dark:bg-slate-950 border-2 border-primary/5 shadow-xl">
                <CardHeader>
                    <CardTitle className="text-lg font-black uppercase">Browser Performance</CardTitle>
                    <CardDescription>Browser distribution for your resume viewers</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="h-[200px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={browserData}>
                                <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                                <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                                <Tooltip cursor={{ fill: 'transparent' }} />
                                <Bar dataKey="value" radius={[4, 4, 0, 0]} barSize={40}>
                                    {browserData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
