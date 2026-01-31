"use client"

import * as React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
    Eye,
    Download,
    Mail,
    TrendingUp,
    Users,
    Globe,
    Calendar,
    BarChart3,
} from "lucide-react"
import {
    LineChart,
    Line,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Cell,
} from "recharts"

interface PortfolioAnalyticsProps {
    portfolioId: string
    analytics?: {
        totalViews: number
        resumeDownloads: number
        contactSubmissions: number
        viewsData: Array<{ date: string; views: number }>
        referrers: Array<{ source: string; count: number }>
        locations: Array<{ country: string; count: number }>
    }
}

export function PortfolioAnalytics({ portfolioId, analytics }: PortfolioAnalyticsProps) {
    // Mock data for demonstration - replace with real data from your analytics
    const mockAnalytics = analytics || {
        totalViews: 1248,
        resumeDownloads: 42,
        contactSubmissions: 18,
        viewsData: [
            { date: "Jan 25", views: 45 },
            { date: "Jan 26", views: 52 },
            { date: "Jan 27", views: 48 },
            { date: "Jan 28", views: 61 },
            { date: "Jan 29", views: 55 },
            { date: "Jan 30", views: 68 },
            { date: "Jan 31", views: 72 },
        ],
        referrers: [
            { source: "LinkedIn", count: 428 },
            { source: "Twitter", count: 312 },
            { source: "Direct", count: 248 },
            { source: "Google", count: 186 },
            { source: "Other", count: 74 },
        ],
        locations: [
            { country: "United States", count: 524 },
            { country: "United Kingdom", count: 286 },
            { country: "Canada", count: 198 },
            { country: "Germany", count: 142 },
            { country: "Other", count: 98 },
        ],
    }

    const statCards = [
        {
            title: "Total Views",
            value: mockAnalytics.totalViews.toLocaleString(),
            icon: Eye,
            change: "+12.5%",
            positive: true,
            color: "text-blue-600",
            bgColor: "bg-blue-500/10",
        },
        {
            title: "Resume Downloads",
            value: mockAnalytics.resumeDownloads.toLocaleString(),
            icon: Download,
            change: "+8.2%",
            positive: true,
            color: "text-green-600",
            bgColor: "bg-green-500/10",
        },
        {
            title: "Contact Inquiries",
            value: mockAnalytics.contactSubmissions.toLocaleString(),
            icon: Mail,
            change: "+24.1%",
            positive: true,
            color: "text-purple-600",
            bgColor: "bg-purple-500/10",
        },
        {
            title: "Engagement Rate",
            value: "3.4%",
            icon: TrendingUp,
            change: "+1.2%",
            positive: true,
            color: "text-orange-600",
            bgColor: "bg-orange-500/10",
        },
    ]

    const COLORS = ["hsl(var(--primary))", "hsl(221, 83%, 53%)", "hsl(262, 83%, 58%)", "hsl(173, 80%, 40%)", "hsl(350, 89%, 60%)"]

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="space-y-2">
                <h2 className="text-2xl font-heading font-black">Portfolio Analytics</h2>
                <p className="text-sm text-muted-foreground">
                    Track your portfolio's performance and visitor engagement
                </p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {statCards.map((stat) => (
                    <Card key={stat.title} className="glass-card">
                        <CardContent className="p-6">
                            <div className="flex items-start justify-between">
                                <div className="space-y-2">
                                    <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                                    <p className="text-3xl font-heading font-black">{stat.value}</p>
                                    <div className="flex items-center gap-1">
                                        <Badge
                                            variant="secondary"
                                            className={stat.positive ? "bg-green-500/10 text-green-600" : "bg-red-500/10 text-red-600"}
                                        >
                                            {stat.change}
                                        </Badge>
                                        <span className="text-xs text-muted-foreground">vs last week</span>
                                    </div>
                                </div>
                                <div className={`rounded-xl p-3 ${stat.bgColor}`}>
                                    <stat.icon className={`h-6 w-6 ${stat.color}`} />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Views Over Time Chart */}
            <Card className="glass-card">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <BarChart3 className="h-5 w-5 text-primary" />
                        Views Over Time
                    </CardTitle>
                    <CardDescription>Last 7 days of portfolio views</CardDescription>
                </CardHeader>
                <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={mockAnalytics.viewsData}>
                            <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                            <XAxis
                                dataKey="date"
                                tick={{ fontSize: 12 }}
                                stroke="hsl(var(--muted-foreground))"
                            />
                            <YAxis
                                tick={{ fontSize: 12 }}
                                stroke="hsl(var(--muted-foreground))"
                            />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: "hsl(var(--card))",
                                    border: "1px solid hsl(var(--border))",
                                    borderRadius: "8px",
                                }}
                            />
                            <Line
                                type="monotone"
                                dataKey="views"
                                stroke="hsl(var(--primary))"
                                strokeWidth={3}
                                dot={{ fill: "hsl(var(--primary))", strokeWidth: 2, r: 4 }}
                                activeDot={{ r: 6 }}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>

            {/* Referrers and Locations Grid */}
            <div className="grid md:grid-cols-2 gap-6">
                {/* Top Referrers */}
                <Card className="glass-card">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Users className="h-5 w-5 text-primary" />
                            Top Referrers
                        </CardTitle>
                        <CardDescription>Where your visitors come from</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={250}>
                            <BarChart data={mockAnalytics.referrers} layout="vertical">
                                <XAxis type="number" tick={{ fontSize: 12 }} />
                                <YAxis
                                    dataKey="source"
                                    type="category"
                                    tick={{ fontSize: 12 }}
                                    width={80}
                                />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: "hsl(var(--card))",
                                        border: "1px solid hsl(var(--border))",
                                        borderRadius: "8px",
                                    }}
                                />
                                <Bar dataKey="count" radius={[0, 8, 8, 0]}>
                                    {mockAnalytics.referrers.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                {/* Geographic Distribution */}
                <Card className="glass-card">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Globe className="h-5 w-5 text-primary" />
                            Geographic Distribution
                        </CardTitle>
                        <CardDescription>Views by country</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {mockAnalytics.locations.map((location, index) => {
                                const percentage = ((location.count / mockAnalytics.totalViews) * 100).toFixed(1)
                                return (
                                    <div key={location.country} className="space-y-2">
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="font-medium">{location.country}</span>
                                            <span className="text-muted-foreground">
                                                {location.count} ({percentage}%)
                                            </span>
                                        </div>
                                        <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                                            <div
                                                className="h-full rounded-full transition-all"
                                                style={{
                                                    width: `${percentage}%`,
                                                    backgroundColor: COLORS[index % COLORS.length],
                                                }}
                                            />
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Quick Insights */}
            <Card className="glass-card bg-primary/5 border-primary/20">
                <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                        <div className="rounded-full bg-primary/10 p-3">
                            <TrendingUp className="h-6 w-6 text-primary" />
                        </div>
                        <div className="space-y-1">
                            <h3 className="font-heading font-black">Portfolio Performance</h3>
                            <p className="text-sm text-muted-foreground leading-relaxed">
                                Your portfolio is performing well! You're getting consistent views and engagement.
                                Consider updating your projects or adding new testimonials to keep momentum going.
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
