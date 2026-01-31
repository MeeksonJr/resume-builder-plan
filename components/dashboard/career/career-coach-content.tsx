"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
    BrainCircuit,
    Target,
    ArrowRight,
    CheckCircle2,
    TrendingUp,
    AlertCircle,
    Loader2,
    Sparkles,
    BookOpen
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface CareerCoachContentProps {
    profile: any;
    resumes: any[];
}

export function CareerCoachContent({ profile, resumes }: CareerCoachContentProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [analysis, setAnalysis] = useState<any | null>(null);
    const [selectedResumeId, setSelectedResumeId] = useState(resumes[0]?.id || "");

    const runAnalysis = async () => {
        if (!profile.target_role) {
            toast.error("Please set a Target Role in Settings first.");
            return;
        }

        setIsLoading(true);
        try {
            const response = await fetch("/api/ai/career-path", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    resumeId: selectedResumeId,
                    targetRole: profile.target_role,
                    targetIndustry: profile.target_industry,
                    careerGoals: profile.career_goals
                }),
            });

            if (!response.ok) throw new Error("Failed to run analysis");

            const data = await response.json();
            setAnalysis(data);
            toast.success("Career analysis complete!");
        } catch (error: any) {
            console.error(error);
            toast.error("Failed to analyze career path.");
        } finally {
            setIsLoading(false);
        }
    };

    if (!profile.target_role) {
        return (
            <Card className="border-dashed border-2 py-12 flex flex-col items-center justify-center text-center">
                <Target className="h-12 w-12 text-muted-foreground/50 mb-4" />
                <h2 className="text-xl font-bold mb-2">Define Your North Star</h2>
                <p className="text-muted-foreground max-w-md mb-6">
                    To provide a personalized career roadmap, we need to know where you're headed. Set your target role and goals in settings.
                </p>
                <Button asChild>
                    <a href="/dashboard/settings">Go to My Preferences</a>
                </Button>
            </Card>
        );
    }

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="col-span-1 md:col-span-2">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Target className="h-5 w-5 text-primary" />
                            Current Goal: {profile.target_role}
                        </CardTitle>
                        <CardDescription>
                            Comparing your experience in {profile.target_industry || "your industry"} against market requirements.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {analysis ? (
                            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
                                <div className="space-y-2">
                                    <div className="flex justify-between items-end mb-2">
                                        <div>
                                            <p className="text-sm font-medium text-muted-foreground">Skill Match</p>
                                            <p className="text-3xl font-black text-primary">{analysis.match_percentage}%</p>
                                        </div>
                                        <TrendingUp className="h-8 w-8 text-primary/20" />
                                    </div>
                                    <Progress value={analysis.match_percentage} className="h-3" />
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                    <div className="space-y-4">
                                        <h3 className="text-sm font-bold uppercase tracking-wider text-green-600 flex items-center gap-2">
                                            <CheckCircle2 className="h-4 w-4" />
                                            Core Strengths
                                        </h3>
                                        <div className="flex flex-wrap gap-2">
                                            {analysis.strengths.map((s: string, i: number) => (
                                                <Badge key={i} variant="secondary" className="bg-green-500/10 text-green-700 hover:bg-green-500/20 border-green-200">
                                                    {s}
                                                </Badge>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="space-y-4">
                                        <h3 className="text-sm font-bold uppercase tracking-wider text-orange-600 flex items-center gap-2">
                                            <AlertCircle className="h-4 w-4" />
                                            Critical Skill Gaps
                                        </h3>
                                        <div className="flex flex-wrap gap-2">
                                            {analysis.gaps.map((g: string, i: number) => (
                                                <Badge key={i} variant="secondary" className="bg-orange-500/10 text-orange-700 hover:bg-orange-500/20 border-orange-200">
                                                    {g}
                                                </Badge>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="py-12 flex flex-col items-center justify-center text-center">
                                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                                    <BrainCircuit className="h-6 w-6 text-primary" />
                                </div>
                                <h3 className="text-lg font-semibold mb-2">Ready to Analyze?</h3>
                                <p className="text-sm text-muted-foreground max-w-xs mb-6">
                                    Our AI will perform a deep gap analysis between your primary resume and your target role.
                                </p>
                                <Button onClick={runAnalysis} disabled={isLoading} className="gap-2">
                                    {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                                    Start Gap Analysis
                                </Button>
                            </div>
                        )}
                    </CardContent>
                </Card>

                <Card className="bg-primary/5 border-primary/20">
                    <CardHeader>
                        <CardTitle className="text-sm flex items-center gap-2">
                            <BookOpen className="h-4 w-4 text-primary" />
                            Next Steps Roadmap
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {analysis ? (
                            <div className="space-y-4">
                                {analysis.roadmap.map((step: any, i: number) => (
                                    <div key={i} className="relative pl-6 pb-4 border-l border-primary/30 last:border-0 last:pb-0">
                                        <div className="absolute left-[-5px] top-1 h-2.5 w-2.5 rounded-full bg-primary" />
                                        <p className="text-xs font-bold text-primary uppercase">{step.timeframe}</p>
                                        <h4 className="text-sm font-bold">{step.action}</h4>
                                        <p className="text-xs text-muted-foreground mt-1">{step.description}</p>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-10 text-center opacity-50">
                                <p className="text-xs font-medium">Your step-by-step career roadmap will appear here.</p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {analysis && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Project Suggestions</CardTitle>
                            <CardDescription>Actionable projects to bridge your skill gaps.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {analysis.project_ideas.map((p: any, i: number) => (
                                <div key={i} className="p-4 rounded-xl border bg-card/50 space-y-2">
                                    <h4 className="font-bold flex items-center gap-2">
                                        {p.title}
                                        <Badge variant="outline" className="text-[10px]">{p.difficulty}</Badge>
                                    </h4>
                                    <p className="text-xs text-muted-foreground">{p.description}</p>
                                    <p className="text-[10px] font-medium text-primary">Key Focus: {p.focus_area}</p>
                                </div>
                            ))}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Market Insights</CardTitle>
                            <CardDescription>What companies are looking for in {profile.target_role} roles.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="p-4 rounded-xl border bg-accent/30 flex items-start gap-4">
                                <TrendingUp className="h-5 w-5 text-primary shrink-0 mt-1" />
                                <div className="space-y-1">
                                    <h4 className="text-sm font-bold">Industry Trend</h4>
                                    <p className="text-xs text-muted-foreground">{analysis.market_trend}</p>
                                </div>
                            </div>
                            <div className="p-4 rounded-xl border bg-accent/30 flex items-start gap-4">
                                <ArrowRight className="h-5 w-5 text-primary shrink-0 mt-1" />
                                <div className="space-y-1">
                                    <h4 className="text-sm font-bold">Hiring Tip</h4>
                                    <p className="text-xs text-muted-foreground">{analysis.hiring_tip}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    );
}
