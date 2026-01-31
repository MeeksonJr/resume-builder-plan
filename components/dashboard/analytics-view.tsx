"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Eye, TrendingUp, Calendar } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface Resume {
    id: string;
    title: string;
    view_count: number;
    last_viewed_at: string | null;
}

interface AnalyticsViewProps {
    resumes: Resume[];
}

export function AnalyticsView({ resumes }: AnalyticsViewProps) {
    const totalViews = resumes.reduce((sum, r) => sum + (r.view_count || 0), 0);
    const mostViewed = [...resumes].sort((a, b) => (b.view_count || 0) - (a.view_count || 0))[0];
    const lastActive = [...resumes]
        .filter(r => r.last_viewed_at)
        .sort((a, b) => new Date(b.last_viewed_at!).getTime() - new Date(a.last_viewed_at!).getTime())[0];

    return (
        <div className="grid gap-4 md:grid-cols-3">
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
    );
}
