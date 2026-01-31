"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { X, ArrowRight } from "lucide-react";
import {
    Radar,
    RadarChart,
    PolarGrid,
    PolarAngleAxis,
    PolarRadiusAxis,
    ResponsiveContainer,
    Legend,
} from "recharts";
import { format } from "date-fns";

interface ScoredAnswer {
    id: string;
    answer: string;
    feedback: {
        score: number;
        scores?: {
            situation: number;
            task: number;
            action: number;
            result: number;
        };
        star_breakdown?: {
            situation: string;
            task: string;
            action: string;
            result: string;
        };
    };
    created_at: string;
}

interface AnswerComparisonProps {
    answer1: ScoredAnswer;
    answer2: ScoredAnswer;
    onClose: () => void;
}

export function AnswerComparison({ answer1, answer2, onClose }: AnswerComparisonProps) {
    // Sort by date (older first) for "Before" vs "After" comparison
    const [older, newer] = new Date(answer1.created_at) < new Date(answer2.created_at)
        ? [answer1, answer2]
        : [answer2, answer1];

    const chartData = [
        {
            subject: "Situation",
            A: older.feedback.scores?.situation || 0,
            B: newer.feedback.scores?.situation || 0,
            fullMark: 100,
        },
        {
            subject: "Task",
            A: older.feedback.scores?.task || 0,
            B: newer.feedback.scores?.task || 0,
            fullMark: 100,
        },
        {
            subject: "Action",
            A: older.feedback.scores?.action || 0,
            B: newer.feedback.scores?.action || 0,
            fullMark: 100,
        },
        {
            subject: "Result",
            A: older.feedback.scores?.result || 0,
            B: newer.feedback.scores?.result || 0,
            fullMark: 100,
        },
    ];

    const scoreDiff = newer.feedback.score - older.feedback.score;

    return (
        <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">Answer Comparison</h2>
                    <p className="text-muted-foreground">
                        Comparing attempt from {format(new Date(older.created_at), "MMM d, h:mm a")} vs{" "}
                        {format(new Date(newer.created_at), "MMM d, h:mm a")}
                    </p>
                </div>
                <Button variant="ghost" size="icon" onClick={onClose}>
                    <X className="h-5 w-5" />
                </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Chart Section */}
                <Card className="lg:col-span-1">
                    <CardHeader>
                        <CardTitle>Score Improvement</CardTitle>
                        <CardDescription>
                            Overall Score:{" "}
                            <span className={scoreDiff > 0 ? "text-green-600" : "text-red-600"}>
                                {scoreDiff > 0 ? "+" : ""}
                                {scoreDiff} points
                            </span>
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[300px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <RadarChart cx="50%" cy="50%" outerRadius="80%" data={chartData}>
                                    <PolarGrid stroke="hsl(var(--muted-foreground))" opacity={0.2} />
                                    <PolarAngleAxis
                                        dataKey="subject"
                                        tick={{ fill: "hsl(var(--foreground))", fontSize: 12 }}
                                    />
                                    <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                                    <Radar
                                        name="Previous"
                                        dataKey="A"
                                        stroke="hsl(var(--muted-foreground))"
                                        fill="hsl(var(--muted-foreground))"
                                        fillOpacity={0.3}
                                    />
                                    <Radar
                                        name="Current"
                                        dataKey="B"
                                        stroke="hsl(var(--primary))"
                                        fill="hsl(var(--primary))"
                                        fillOpacity={0.5}
                                    />
                                    <Legend />
                                </RadarChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="mt-4 space-y-2">
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-muted-foreground">Previous Score</span>
                                <span className="font-mono font-bold">{older.feedback.score}/10</span>
                            </div>
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-primary font-medium">Current Score</span>
                                <span className="font-mono font-bold text-primary">{newer.feedback.score}/10</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Content Comparison Section */}
                <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Card className="h-full flex flex-col bg-muted/20 border-muted">
                        <CardHeader className="pb-3">
                            <div className="flex justify-between items-center">
                                <Badge variant="outline" className="bg-background">Previous Attempt</Badge>
                                <span className="text-xs text-muted-foreground">
                                    {format(new Date(older.created_at), "MMM d, h:mm a")}
                                </span>
                            </div>
                        </CardHeader>
                        <CardContent className="flex-1 flex flex-col gap-4">
                            <ScrollArea className="h-[200px] rounded-md border bg-background p-4 text-sm text-muted-foreground">
                                {older.answer}
                            </ScrollArea>
                            {older.feedback.star_breakdown && (
                                <div className="space-y-3">
                                    <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Feedback Highlights</h4>
                                    <div className="text-xs space-y-2">
                                        <p><span className="font-medium text-foreground">Situation:</span> {older.feedback.star_breakdown.situation}</p>
                                        <p><span className="font-medium text-foreground">Result:</span> {older.feedback.star_breakdown.result}</p>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    <Card className="h-full flex flex-col border-primary/20 bg-primary/5">
                        <CardHeader className="pb-3">
                            <div className="flex justify-between items-center">
                                <Badge className="bg-primary hover:bg-primary/90">Current Attempt</Badge>
                                <span className="text-xs text-primary font-medium">
                                    {format(new Date(newer.created_at), "MMM d, h:mm a")}
                                </span>
                            </div>
                        </CardHeader>
                        <CardContent className="flex-1 flex flex-col gap-4">
                            <ScrollArea className="h-[200px] rounded-md border border-primary/10 bg-background p-4 text-sm">
                                {newer.answer}
                            </ScrollArea>
                            {newer.feedback.star_breakdown && (
                                <div className="space-y-3">
                                    <h4 className="text-xs font-semibold uppercase tracking-wider text-primary">Feedback Highlights</h4>
                                    <div className="text-xs space-y-2">
                                        <p><span className="font-medium text-foreground">Situation:</span> {newer.feedback.star_breakdown.situation}</p>
                                        <p><span className="font-medium text-foreground">Result:</span> {newer.feedback.star_breakdown.result}</p>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
