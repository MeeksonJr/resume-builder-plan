"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
    BrainCircuit,
    Target,
    ArrowRight,
    CheckCircle2,
    TrendingUp,
    AlertCircle,
    Loader2,
    Sparkles,
    BookOpen,
    Save,
    History,
    RefreshCw
} from "lucide-react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { formatDistanceToNow } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { UpgradeModal } from "@/components/ui/upgrade-modal";

interface CareerCoachContentProps {
    profile: any;
    resumes: any[];
}

interface CareerAnalysis {
    id?: string;
    match_percentage: number;
    strengths: string[];
    gaps: string[];
    roadmap: { timeframe: string; action: string; description: string }[];
    project_ideas: { title: string; difficulty: string; description: string; focus_area: string }[];
    market_trend: string;
    hiring_tip: string;
    created_at?: string;
}

export function CareerCoachContent({ profile, resumes }: CareerCoachContentProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [showUpgradeModal, setShowUpgradeModal] = useState(false);
    const [analysis, setAnalysis] = useState<CareerAnalysis | null>(null);
    const [savedAnalyses, setSavedAnalyses] = useState<CareerAnalysis[]>([]);
    const [selectedResumeId, setSelectedResumeId] = useState(resumes[0]?.id || "");

    // Load saved analyses on mount
    useEffect(() => {
        loadSavedAnalyses();
    }, []);

    const loadSavedAnalyses = async () => {
        const supabase = createClient();
        const { data } = await supabase
            .from("career_analyses")
            .select("*")
            .order("created_at", { ascending: false })
            .limit(5);

        if (data && data.length > 0) {
            setSavedAnalyses(data);
            // Set the most recent as current if no analysis is loaded
            if (!analysis) {
                setAnalysis(data[0]);
            }
        }
    };

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

            if (!response.ok) {
                const errData = await response.json().catch(() => null);
                if (response.status === 429 || errData?.error === "LIMIT_EXCEEDED") {
                    setShowUpgradeModal(true);
                    toast.error(errData?.message || "Daily limit reached for AI Career Coach.");
                    return;
                }
                throw new Error(errData?.message || "Failed to run analysis");
            }

            const data = await response.json();
            setAnalysis(data);
            toast.success("Career analysis complete!");
        } catch (error: any) {
            console.error(error);
            toast.error(error.message || "Failed to analyze career path.");
        } finally {
            setIsLoading(false);
        }
    };

    const saveAnalysis = async () => {
        if (!analysis) return;

        setIsSaving(true);
        try {
            const supabase = createClient();
            const { data: { user } } = await supabase.auth.getUser();

            if (!user) throw new Error("Not authenticated");

            const { data, error } = await supabase
                .from("career_analyses")
                .insert({
                    user_id: user.id,
                    target_role: profile.target_role,
                    target_industry: profile.target_industry,
                    match_percentage: analysis.match_percentage,
                    strengths: analysis.strengths,
                    gaps: analysis.gaps,
                    roadmap: analysis.roadmap,
                    project_ideas: analysis.project_ideas,
                    market_trend: analysis.market_trend,
                    hiring_tip: analysis.hiring_tip,
                })
                .select()
                .single();

            if (error) throw error;

            setAnalysis({ ...analysis, id: data.id, created_at: data.created_at });
            await loadSavedAnalyses();
            toast.success("Analysis saved!");
        } catch (error: any) {
            console.error(error);
            toast.error(error.message || "Failed to save analysis");
        } finally {
            setIsSaving(false);
        }
    };

    if (!profile.target_role) {
        return (
            <Card className="border-dashed border-2 border-border bg-card/60 py-16 flex flex-col items-center justify-center text-center shadow-xs rounded-2xl">
                <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl border border-primary/20 bg-primary/10">
                    <Target className="h-8 w-8 text-primary" />
                </div>
                <h2 className="mb-3 text-2xl font-bold tracking-tight text-foreground">Set your direction</h2>
                <p className="mb-8 max-w-md font-medium text-muted-foreground text-sm">
                    Add a target role in your preferences so the coach can build a personalized roadmap.
                </p>
                <Button asChild size="lg" className="rounded-xl px-8 font-bold shadow-xs">
                    <a href="/dashboard/settings">Go to My Preferences</a>
                </Button>
            </Card>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Action Bar */}
            <div className="flex flex-wrap items-center gap-3 border border-border bg-card/80 backdrop-blur-xs p-4 rounded-xl shadow-xs">
                <Button onClick={runAnalysis} disabled={isLoading} className="h-11 gap-2 rounded-lg font-bold shadow-xs">
                    {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4 group-hover:rotate-180 transition-transform duration-500" />}
                    {analysis ? "Run New Analysis" : "Start Analysis"}
                </Button>
                {analysis && !analysis.id && (
                    <Button onClick={saveAnalysis} disabled={isSaving} variant="outline" className="h-11 gap-2 rounded-lg font-bold border-border">
                        {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                        Save Results
                    </Button>
                )}
                {analysis?.id && (
                    <Badge variant="secondary" className="h-10 gap-2 rounded-lg border border-primary/20 bg-primary/10 px-4 font-bold text-primary">
                        <CheckCircle2 className="h-4 w-4" />
                        Analysis Saved
                    </Badge>
                )}
            </div>

            {/* Saved Analyses Quick Access */}
            {savedAnalyses.length > 0 && (
                <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-hide">
                    <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-2 shrink-0 ml-1">
                        <History className="h-3.5 w-3.5" />
                        History
                    </span>
                    {savedAnalyses.slice(0, 5).map((saved) => (
                        <Button
                            key={saved.id}
                            variant={analysis?.id === saved.id ? "default" : "outline"}
                            size="sm"
                            onClick={() => setAnalysis(saved)}
                            className={cn(
                                "h-9 shrink-0 rounded-lg px-3.5 font-semibold transition-all border-border text-xs",
                                analysis?.id === saved.id ? "bg-primary text-primary-foreground shadow-xs" : "hover:bg-muted"
                            )}
                        >
                            {saved.match_percentage}% • {formatDistanceToNow(new Date(saved.created_at!), { addSuffix: true })}
                        </Button>
                    ))}
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <Card className="relative col-span-1 overflow-hidden border-border bg-card text-card-foreground shadow-xs rounded-2xl lg:col-span-2">
                    {/* Subtle Gradient Glow */}
                    <div className="absolute -top-24 -right-24 w-64 h-64 bg-primary/10 rounded-full blur-[80px] pointer-events-none" />

                    <CardHeader className="relative pb-4">
                        <CardTitle className="flex items-center gap-3 text-2xl font-bold tracking-tight text-foreground">
                            <div className="rounded-xl border border-primary/20 bg-primary/10 p-2.5">
                                <Target className="h-6 w-6 text-primary" />
                            </div>
                            {profile.target_role}
                        </CardTitle>
                        <CardDescription className="font-medium text-sm text-muted-foreground pt-1">
                            Comparing your experience in {profile.target_industry || "your industry"} against market requirements.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-8 relative">
                        {analysis ? (
                            <motion.div
                                initial={{ opacity: 0, y: 15 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="space-y-8"
                            >
                                <div className="space-y-3 p-5 rounded-xl border border-border/80 bg-muted/30">
                                    <div className="flex justify-between items-end">
                                        <div>
                                            <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">Career Match Velocity</p>
                                            <p className="text-4xl sm:text-5xl font-extrabold tracking-tight text-primary">
                                                {analysis.match_percentage}%
                                            </p>
                                        </div>
                                        <TrendingUp className="h-10 w-10 text-primary/30" />
                                    </div>
                                    <div className="h-3 w-full overflow-hidden rounded-full border border-border/60 bg-muted">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${analysis.match_percentage}%` }}
                                            transition={{ duration: 1.2, ease: "easeOut" }}
                                            className="h-full bg-primary rounded-full"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-3 p-4 rounded-xl border border-emerald-500/20 bg-emerald-500/5">
                                        <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 flex items-center gap-2">
                                            <div className="h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)]" />
                                            Core Strengths
                                        </h3>
                                        <div className="flex flex-wrap gap-2">
                                            {analysis.strengths.map((s: string, i: number) => (
                                                <Badge
                                                    key={i}
                                                    variant="secondary"
                                                    className="bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20 px-3 py-1 rounded-lg text-xs font-semibold"
                                                >
                                                    {s}
                                                </Badge>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="space-y-3 p-4 rounded-xl border border-amber-500/20 bg-amber-500/5">
                                        <h3 className="text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 flex items-center gap-2">
                                            <div className="h-2 w-2 rounded-full bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.6)]" />
                                            Critical Skill Gaps
                                        </h3>
                                        <div className="flex flex-wrap gap-2">
                                            {analysis.gaps.map((g: string, i: number) => (
                                                <Badge
                                                    key={i}
                                                    variant="secondary"
                                                    className="bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/20 px-3 py-1 rounded-lg text-xs font-semibold"
                                                >
                                                    {g}
                                                </Badge>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        ) : (
                            <div className="py-16 flex flex-col items-center justify-center text-center space-y-6">
                                <div className="relative">
                                    <div className="absolute inset-0 bg-primary/20 blur-2xl rounded-full" />
                                    <div className="relative h-18 w-18 rounded-2xl bg-card border border-border flex items-center justify-center shadow-xs">
                                        <BrainCircuit className="h-9 w-9 text-primary" />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <h3 className="text-xl font-bold tracking-tight text-foreground">Ready to Analyze?</h3>
                                    <p className="text-muted-foreground max-w-sm text-sm">
                                        Our AI will perform a deep gap analysis between your primary resume and your target role.
                                    </p>
                                </div>
                                <Button onClick={runAnalysis} disabled={isLoading} size="lg" className="rounded-xl font-bold px-8 h-12 shadow-xs">
                                    {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4 mr-2" />}
                                    Generate Path Analysis
                                </Button>
                            </div>
                        )}
                    </CardContent>
                </Card>

                <Card className="relative overflow-hidden border-border bg-card text-card-foreground shadow-xs rounded-2xl">
                    <CardHeader className="border-b border-border/60 pb-4">
                        <CardTitle className="text-sm font-bold uppercase tracking-wider flex items-center gap-2.5 text-primary">
                            <BookOpen className="h-4 w-4" />
                            Next Steps Roadmap
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-6 relative">
                        {analysis ? (
                            <ScrollArea className="h-[380px] pr-4">
                                <div className="space-y-6">
                                    <AnimatePresence>
                                        {analysis.roadmap.map((step: any, i: number) => (
                                             <motion.div
                                                key={i}
                                                initial={{ opacity: 0, x: -15 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: i * 0.08 }}
                                                className="relative pl-7 pb-6 border-l-2 border-primary/20 last:border-0 last:pb-0"
                                            >
                                                <div className="absolute left-[-7px] top-0 h-3.5 w-3.5 rounded-full bg-background border-2 border-primary shadow-xs" />
                                                <div className="bg-muted/40 rounded-xl p-3.5 border border-border/70 hover:bg-muted/70 transition-colors group">
                                                    <p className="text-[10px] font-bold text-primary uppercase tracking-wider mb-1">
                                                        {step.timeframe}
                                                    </p>
                                                    <h4 className="text-xs font-bold text-foreground mb-1.5 leading-snug">{step.action}</h4>
                                                    <p className="text-[11px] text-muted-foreground leading-relaxed">{step.description}</p>
                                                </div>
                                            </motion.div>
                                        ))}
                                    </AnimatePresence>
                                </div>
                            </ScrollArea>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-28 text-center text-muted-foreground/60">
                                <TrendingUp className="h-10 w-10 mb-3 opacity-40" />
                                <p className="text-xs font-semibold uppercase tracking-wider">Awaiting Analysis</p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {analysis && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <Card className="border border-border bg-card text-card-foreground shadow-xs rounded-2xl">
                        <CardHeader className="pb-3">
                            <CardTitle className="text-lg font-bold tracking-tight flex items-center gap-2 text-foreground">
                                <Sparkles className="h-5 w-5 text-primary" />
                                Project Suggestions
                            </CardTitle>
                            <CardDescription className="text-xs text-muted-foreground">
                                Actionable projects to bridge your skill gaps.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <ScrollArea className="h-[300px] pr-3">
                                <div className="space-y-3">
                                    {analysis.project_ideas.map((p: any, i: number) => (
                                        <div
                                            key={i}
                                            className="p-4 rounded-xl border border-border/70 bg-muted/40 space-y-2 hover:bg-muted/70 group transition-all"
                                        >
                                            <div className="flex items-center justify-between gap-3">
                                                <h4 className="font-bold text-sm text-foreground group-hover:text-primary transition-colors">
                                                    {p.title}
                                                </h4>
                                                <Badge variant="outline" className="text-[10px] border-border bg-background text-foreground px-2 py-0.5 font-semibold">
                                                    {p.difficulty}
                                                </Badge>
                                            </div>
                                            <p className="text-xs text-muted-foreground leading-relaxed">{p.description}</p>
                                            <div className="flex items-center gap-2 pt-1">
                                                <Badge className="bg-primary/10 text-primary border border-primary/20 text-[10px] font-semibold rounded-md">
                                                    {p.focus_area}
                                                </Badge>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </ScrollArea>
                        </CardContent>
                    </Card>

                    <Card className="border border-border bg-card text-card-foreground shadow-xs rounded-2xl">
                        <CardHeader className="pb-3">
                            <CardTitle className="text-lg font-bold tracking-tight flex items-center gap-2 text-foreground">
                                <TrendingUp className="h-5 w-5 text-primary" />
                                Market Insights
                            </CardTitle>
                            <CardDescription className="text-xs text-muted-foreground">
                                What employers look for in {profile.target_role} roles.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="p-4 rounded-xl border border-border/70 bg-muted/40 flex items-start gap-3.5 hover:bg-muted/70 transition-all">
                                <div className="p-2.5 rounded-lg bg-primary/10 text-primary shrink-0 mt-0.5">
                                    <TrendingUp className="h-5 w-5 text-primary" />
                                </div>
                                <div className="space-y-1">
                                    <h4 className="text-xs font-bold uppercase tracking-wider text-primary">Industry Trend</h4>
                                    <p className="text-xs sm:text-sm font-medium text-foreground leading-relaxed">{analysis.market_trend}</p>
                                </div>
                            </div>
                            <div className="p-4 rounded-xl border border-border/70 bg-muted/40 flex items-start gap-3.5 hover:bg-muted/70 transition-all">
                                <div className="p-2.5 rounded-lg bg-primary/10 text-primary shrink-0 mt-0.5">
                                    <ArrowRight className="h-5 w-5 text-primary" />
                                </div>
                                <div className="space-y-1">
                                    <h4 className="text-xs font-bold uppercase tracking-wider text-primary">Hiring Strategy</h4>
                                    <p className="text-xs sm:text-sm font-medium text-foreground leading-relaxed">{analysis.hiring_tip}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}

            <UpgradeModal
                open={showUpgradeModal}
                onOpenChange={setShowUpgradeModal}
                title="Career Coach Limit Reached"
                description="Free users can run 1 Career Coach Roadmap per day. Upgrade to Pro for unlimited AI roadmaps, customized STAR skills audits, and continuous hiring insights."
                featureName="Unlimited Career Coach"
            />
        </div>
    );
}
