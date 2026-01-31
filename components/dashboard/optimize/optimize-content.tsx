"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
    TrendingUp,
    AlertCircle,
    CheckCircle2,
    Zap,
    Loader2,
    BarChart3,
    Target,
    Sparkles
} from "lucide-react";
import { toast } from "sonner";
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from "recharts";

interface OptimizeContentProps {
    resumes: { id: string; title: string }[];
    targetRole: string | null;
}

export function OptimizeContent({ resumes, targetRole }: OptimizeContentProps) {
    const [selectedResume, setSelectedResume] = useState(resumes[0]?.id || "");
    const [isLoading, setIsLoading] = useState(false);
    const [analysis, setAnalysis] = useState<any | null>(null);

    const runOptimization = async () => {
        if (!selectedResume) {
            toast.error("Please select a resume to analyze");
            return;
        }

        setIsLoading(true);
        try {
            const response = await fetch("/api/ai/optimize/score", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ resumeId: selectedResume }),
            });

            if (!response.ok) throw new Error("Optimization failed");

            const data = await response.json();
            setAnalysis(data);
            toast.success("Resume analysis complete!");
        } catch (error) {
            console.error(error);
            toast.error("Failed to analyze resume");
        } finally {
            setIsLoading(false);
        }
    };

    const getScoreColor = (score: number) => {
        if (score >= 71) return "text-green-600";
        if (score >= 41) return "text-yellow-600";
        return "text-red-600";
    };

    const getScoreLabel = (score: number) => {
        if (score >= 71) return "Excellent";
        if (score >= 41) return "Good";
        return "Needs Work";
    };

    const radarData = analysis ? [
        { subject: "Content", value: analysis.scores.contentQuality, fullMark: 100 },
        { subject: "Keywords", value: analysis.scores.keywordOptimization, fullMark: 100 },
        { subject: "ATS", value: analysis.scores.atsCompatibility, fullMark: 100 },
        { subject: "Complete", value: analysis.scores.completeness, fullMark: 100 },
        { subject: "Impact", value: analysis.scores.impactLanguage, fullMark: 100 },
        { subject: "Metrics", value: analysis.scores.quantification, fullMark: 100 },
    ] : [];

    if (resumes.length === 0) {
        return (
            <Card className="border-dashed border-2 py-12 flex flex-col items-center justify-center text-center">
                <BarChart3 className="h-12 w-12 text-muted-foreground/50 mb-4" />
                <h2 className="text-xl font-bold mb-2">No Resumes Yet</h2>
                <p className="text-muted-foreground max-w-md mb-6">
                    Create your first resume to start receiving AI-powered optimization insights.
                </p>
                <Button asChild>
                    <a href="/dashboard/resume/new">Create Resume</a>
                </Button>
            </Card>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row gap-4">
                <Select value={selectedResume} onValueChange={setSelectedResume}>
                    <SelectTrigger className="w-full sm:w-[350px]">
                        <SelectValue placeholder="Select a resume" />
                    </SelectTrigger>
                    <SelectContent>
                        {resumes.map((resume) => (
                            <SelectItem key={resume.id} value={resume.id}>
                                {resume.title}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                <Button onClick={runOptimization} disabled={isLoading} className="gap-2">
                    {isLoading ? (
                        <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Analyzing...
                        </>
                    ) : (
                        <>
                            <Sparkles className="h-4 w-4" />
                            Analyze Resume
                        </>
                    )}
                </Button>
            </div>

            {!targetRole && (
                <Card className="border-yellow-200 bg-yellow-50 dark:bg-yellow-950/20">
                    <CardContent className="pt-6">
                        <div className="flex items-start gap-3">
                            <AlertCircle className="h-5 w-5 text-yellow-600 shrink-0 mt-0.5" />
                            <div className="space-y-1">
                                <p className="text-sm font-medium">Set your target role for better insights</p>
                                <p className="text-xs text-muted-foreground">
                                    Add your target role in{" "}
                                    <a href="/dashboard/settings" className="underline font-medium">
                                        Settings
                                    </a>{" "}
                                    to get role-specific optimization recommendations.
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}

            {analysis && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 space-y-6">
                        <Card>
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <CardTitle>Overall Resume Score</CardTitle>
                                        <CardDescription>Based on 6 optimization dimensions</CardDescription>
                                    </div>
                                    <div className="text-right">
                                        <div className={`text-5xl font-black ${getScoreColor(analysis.overallScore)}`}>
                                            {analysis.overallScore}
                                        </div>
                                        <p className="text-sm text-muted-foreground">{getScoreLabel(analysis.overallScore)}</p>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="h-[300px]">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <RadarChart data={radarData}>
                                            <PolarGrid />
                                            <PolarAngleAxis dataKey="subject" />
                                            <PolarRadiusAxis angle={90} domain={[0, 100]} />
                                            <Radar
                                                name="Score"
                                                dataKey="value"
                                                stroke="hsl(var(--primary))"
                                                fill="hsl(var(--primary))"
                                                fillOpacity={0.6}
                                            />
                                        </RadarChart>
                                    </ResponsiveContainer>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    {Object.entries(analysis.scores).map(([key, value]) => {
                                        const scoreValue = value as number;
                                        return (
                                            <div key={key} className="space-y-2">
                                                <div className="flex justify-between text-sm">
                                                    <span className="font-medium capitalize">
                                                        {key.replace(/([A-Z])/g, " $1").trim()}
                                                    </span>
                                                    <span className={getScoreColor(scoreValue)}>{scoreValue}</span>
                                                </div>
                                                <Progress value={scoreValue} className="h-2" />
                                            </div>
                                        );
                                    })}
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Target className="h-5 w-5 text-primary" />
                                    Improvement Suggestions
                                </CardTitle>
                                <CardDescription>Prioritized recommendations to boost your score</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                {analysis.suggestions.map((suggestion: any, i: number) => (
                                    <div key={i} className="p-4 rounded-lg border bg-card/50">
                                        <div className="flex items-start gap-3">
                                            <Badge
                                                variant={
                                                    suggestion.priority === "high"
                                                        ? "destructive"
                                                        : suggestion.priority === "medium"
                                                            ? "default"
                                                            : "secondary"
                                                }
                                                className="mt-0.5"
                                            >
                                                {suggestion.priority}
                                            </Badge>
                                            <div className="flex-1 space-y-1">
                                                <div className="flex items-center gap-2">
                                                    <h4 className="font-semibold text-sm">{suggestion.title}</h4>
                                                    <Badge variant="outline" className="text-xs">
                                                        {suggestion.category}
                                                    </Badge>
                                                </div>
                                                <p className="text-xs text-muted-foreground">{suggestion.description}</p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </CardContent>
                        </Card>
                    </div>

                    <div className="space-y-6">
                        <Card className="bg-green-50 dark:bg-green-950/20 border-green-200">
                            <CardHeader>
                                <CardTitle className="text-lg flex items-center gap-2">
                                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                                    Current Strengths
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-2">
                                {analysis.strengths.map((strength: string, i: number) => (
                                    <div key={i} className="flex items-start gap-2">
                                        <CheckCircle2 className="h-4 w-4 text-green-600 shrink-0 mt-0.5" />
                                        <p className="text-sm">{strength}</p>
                                    </div>
                                ))}
                            </CardContent>
                        </Card>

                        <Card className="bg-primary/5 border-primary/20">
                            <CardHeader>
                                <CardTitle className="text-lg flex items-center gap-2">
                                    <Zap className="h-5 w-5 text-primary" />
                                    Quick Wins
                                </CardTitle>
                                <CardDescription>Easy changes with high impact</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                {analysis.quickWins.map((win: string, i: number) => (
                                    <div key={i} className="p-3 rounded-lg border bg-background">
                                        <p className="text-sm font-medium">{win}</p>
                                    </div>
                                ))}
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg flex items-center gap-2">
                                    <TrendingUp className="h-5 w-5 text-primary" />
                                    Next Steps
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <Button variant="outline" className="w-full justify-start" asChild>
                                    <a href={`/dashboard/resume/${selectedResume}/edit`}>
                                        Edit Resume
                                    </a>
                                </Button>
                                <Button variant="outline" className="w-full justify-start" asChild>
                                    <a href="/dashboard/career-coach">
                                        Career Coach
                                    </a>
                                </Button>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            )}

            {!analysis && !isLoading && (
                <Card className="border-dashed border-2 py-12 flex flex-col items-center justify-center text-center">
                    <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                        <BarChart3 className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="text-lg font-semibold mb-2">Ready to Optimize?</h3>
                    <p className="text-sm text-muted-foreground max-w-xs mb-6">
                        Run an AI analysis to get a comprehensive score and actionable recommendations.
                    </p>
                </Card>
            )}
        </div>
    );
}
