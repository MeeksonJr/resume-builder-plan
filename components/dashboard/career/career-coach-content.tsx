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
            <Card className="bg-slate-950/50 border-dashed border-2 border-primary/20 py-16 flex flex-col items-center justify-center text-center shadow-2xl backdrop-blur-xl">
                <div className="h-20 w-20 rounded-3xl bg-primary/10 flex items-center justify-center mb-6 animate-pulse">
                    <Target className="h-10 w-10 text-primary" />
                </div>
                <h2 className="text-2xl font-black mb-3 tracking-tight uppercase">Define Your North Star</h2>
                <p className="text-muted-foreground max-w-md mb-8 font-medium">
                    To provide a personalized career roadmap, we need to know where you're headed. Set your target role and goals in settings.
                </p>
                <Button asChild size="lg" className="rounded-2xl font-black px-8">
                    <a href="/dashboard/settings">Go to My Preferences</a>
                </Button>
            </Card>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            {/* Action Bar */}
            <div className="flex flex-wrap items-center gap-4 bg-slate-950/40 p-4 rounded-3xl border border-primary/5 backdrop-blur-md">
                <Button onClick={runAnalysis} disabled={isLoading} className="gap-2 rounded-2xl h-12 font-black px-6 shadow-lg shadow-primary/20">
                    {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4 group-hover:rotate-180 transition-transform duration-500" />}
                    {analysis ? "Run New Analysis" : "Start Analysis"}
                </Button>
                {analysis && !analysis.id && (
                    <Button onClick={saveAnalysis} disabled={isSaving} variant="outline" className="gap-2 rounded-2xl h-12 border-primary/20 font-bold hover:bg-primary/5">
                        {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                        Save Results
                    </Button>
                )}
                {analysis?.id && (
                    <Badge variant="secondary" className="gap-2 h-10 px-4 rounded-xl bg-emerald-500/10 text-emerald-500 border-none font-bold">
                        <CheckCircle2 className="h-4 w-4" />
                        Analysis Saved
                    </Badge>
                )}
            </div>

            {/* Saved Analyses Quick Access */}
            {savedAnalyses.length > 0 && (
                <div className="flex items-center gap-3 overflow-x-auto pb-4 scrollbar-hide">
                    <span className="text-xs font-black text-primary/60 uppercase tracking-widest flex items-center gap-2 shrink-0 ml-1">
                        <History className="h-3.5 w-3.5" />
                        History
                    </span>
                    {savedAnalyses.slice(0, 5).map((saved) => (
                        <Button
                            key={saved.id}
                            variant={analysis?.id === saved.id ? "secondary" : "ghost"}
                            size="sm"
                            onClick={() => setAnalysis(saved)}
                            className={cn(
                                "shrink-0 rounded-xl h-9 px-4 font-bold border-none transition-all",
                                analysis?.id === saved.id ? "bg-primary/20 text-primary" : "text-muted-foreground hover:bg-primary/5"
                            )}
                        >
                            {saved.match_percentage}% • {formatDistanceToNow(new Date(saved.created_at!), { addSuffix: true })}
                        </Button>
                    ))}
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <Card className="col-span-1 lg:col-span-2 bg-slate-950/40 border-primary/5 shadow-2xl backdrop-blur-xl group relative overflow-hidden">
                    {/* Subtle Gradient Glow */}
                    <div className="absolute -top-24 -right-24 w-64 h-64 bg-primary/5 rounded-full blur-[80px] group-hover:bg-primary/10 transition-colors duration-1000" />

                    <CardHeader className="relative">
                        <CardTitle className="text-2xl font-black tracking-tight flex items-center gap-3 uppercase">
                            <div className="p-2.5 rounded-xl bg-primary/10">
                                <Target className="h-6 w-6 text-primary" />
                            </div>
                            {profile.target_role}
                        </CardTitle>
                        <CardDescription className="font-medium text-base pt-1">
                            Comparing your experience in {profile.target_industry || "your industry"} against market requirements.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-8 relative">
                        {analysis ? (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="space-y-10"
                            >
                                <div className="space-y-4">
                                    <div className="flex justify-between items-end">
                                        <div>
                                            <p className="text-xs font-black uppercase tracking-widest text-primary/60 mb-1">Career Match Velocity</p>
                                            <p className="text-5xl font-black tracking-tighter text-primary drop-shadow-[0_0_15px_rgba(var(--primary),0.3)]">
                                                {analysis.match_percentage}%
                                            </p>
                                        </div>
                                        <TrendingUp className="h-12 w-12 text-primary/10" />
                                    </div>
                                    <div className="h-4 w-full bg-primary/10 rounded-full overflow-hidden p-1 border border-primary/10">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${analysis.match_percentage}%` }}
                                            transition={{ duration: 1.5, ease: "easeOut" }}
                                            className="h-full bg-gradient-to-r from-primary via-primary/80 to-primary rounded-full shadow-[0_0_10px_rgba(var(--primary),0.5)]"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="space-y-4">
                                        <h3 className="text-xs font-black uppercase tracking-widest text-emerald-500/80 flex items-center gap-2">
                                            <div className="h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                                            Core Strengths
                                        </h3>
                                        <div className="flex flex-wrap gap-2">
                                            {analysis.strengths.map((s: string, i: number) => (
                                                <Badge
                                                    key={i}
                                                    variant="secondary"
                                                    className="bg-emerald-500/5 text-emerald-600 dark:text-emerald-400 border border-emerald-500/10 px-4 py-1.5 rounded-xl font-bold transition-all hover:bg-emerald-500/10"
                                                >
                                                    {s}
                                                </Badge>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="space-y-4">
                                        <h3 className="text-xs font-black uppercase tracking-widest text-amber-500/80 flex items-center gap-2">
                                            <div className="h-2 w-2 rounded-full bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]" />
                                            Critical Skill Gaps
                                        </h3>
                                        <div className="flex flex-wrap gap-2">
                                            {analysis.gaps.map((g: string, i: number) => (
                                                <Badge
                                                    key={i}
                                                    variant="secondary"
                                                    className="bg-amber-500/5 text-amber-600 dark:text-amber-400 border border-amber-500/10 px-4 py-1.5 rounded-xl font-bold transition-all hover:bg-amber-500/10"
                                                >
                                                    {g}
                                                </Badge>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        ) : (
                            <div className="py-20 flex flex-col items-center justify-center text-center space-y-8">
                                <div className="relative">
                                    <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full" />
                                    <div className="relative h-20 w-20 rounded-3xl bg-slate-900 border border-primary/20 flex items-center justify-center shadow-inner">
                                        <BrainCircuit className="h-10 w-10 text-primary" />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <h3 className="text-2xl font-black uppercase tracking-tight">Ready to Analyze?</h3>
                                    <p className="text-muted-foreground max-w-sm font-medium">
                                        Our AI will perform a deep gap analysis between your primary resume and your target role.
                                    </p>
                                </div>
                                <Button onClick={runAnalysis} disabled={isLoading} size="lg" className="rounded-2xl font-black px-10 h-14 shadow-2xl shadow-primary/20">
                                    {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Sparkles className="h-5 w-5 mr-2" />}
                                    Generate Path Analysis
                                </Button>
                            </div>
                        )}
                    </CardContent>
                </Card>

                <Card className="bg-slate-950/40 border-primary/10 shadow-xl backdrop-blur-xl relative overflow-hidden">
                    <div className="absolute inset-0 bg-primary/[0.02] pointer-events-none" />
                    <CardHeader className="border-b border-primary/5 pb-4">
                        <CardTitle className="text-sm font-black uppercase tracking-widest flex items-center gap-3 text-primary">
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
                                                initial={{ opacity: 0, x: -20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: i * 0.1 }}
                                                className="relative pl-8 pb-8 border-l-2 border-primary/10 last:border-0 last:pb-0"
                                            >
                                                <div className="absolute left-[-9px] top-0 h-4 w-4 rounded-full bg-slate-950 border-2 border-primary shadow-[0_0_10px_rgba(var(--primary),0.5)]" />
                                                <div className="bg-primary/5 rounded-2xl p-4 border border-primary/5 hover:bg-primary/10 transition-colors group">
                                                    <p className="text-[10px] font-black text-primary uppercase tracking-widest mb-1 opacity-60 group-hover:opacity-100 transition-opacity">
                                                        {step.timeframe}
                                                    </p>
                                                    <h4 className="text-sm font-black uppercase tracking-tight mb-2 leading-snug">{step.action}</h4>
                                                    <p className="text-xs text-muted-foreground leading-relaxed font-medium">{step.description}</p>
                                                </div>
                                            </motion.div>
                                        ))}
                                    </AnimatePresence>
                                </div>
                            </ScrollArea>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-32 text-center opacity-30 grayscale">
                                <TrendingUp className="h-12 w-12 mb-4" />
                                <p className="text-xs font-black uppercase tracking-widest">Awaiting Analysis</p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {analysis && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <Card className="bg-slate-950/40 border-primary/5 shadow-xl backdrop-blur-md">
                        <CardHeader>
                            <CardTitle className="text-lg font-black uppercase tracking-tight flex items-center gap-2">
                                <Sparkles className="h-5 w-5 text-primary" />
                                Project Suggestions
                            </CardTitle>
                            <CardDescription className="font-medium">Actionable projects to bridge your skill gaps.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <ScrollArea className="h-[300px] pr-4">
                                <div className="space-y-4">
                                    {analysis.project_ideas.map((p: any, i: number) => (
                                        <motion.div
                                            key={i}
                                            whileHover={{ scale: 1.01 }}
                                            className="p-5 rounded-2xl border border-primary/5 bg-slate-900/50 space-y-3 hover:bg-slate-900 group transition-all"
                                        >
                                            <div className="flex items-center justify-between gap-4">
                                                <h4 className="font-black uppercase tracking-tight text-sm group-hover:text-primary transition-colors">
                                                    {p.title}
                                                </h4>
                                                <Badge variant="outline" className="text-[10px] bg-primary/5 border-primary/10 px-2 py-0 h-6 font-black uppercase">
                                                    {p.difficulty}
                                                </Badge>
                                            </div>
                                            <p className="text-xs text-muted-foreground leading-relaxed font-medium">{p.description}</p>
                                            <div className="flex items-center gap-2 pt-2">
                                                <Badge className="bg-primary/10 text-primary border-none text-[10px] font-black uppercase rounded-lg">
                                                    {p.focus_area}
                                                </Badge>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            </ScrollArea>
                        </CardContent>
                    </Card>

                    <Card className="bg-slate-950/40 border-primary/5 shadow-xl backdrop-blur-md">
                        <CardHeader>
                            <CardTitle className="text-lg font-black uppercase tracking-tight flex items-center gap-2">
                                <TrendingUp className="h-5 w-5 text-primary" />
                                Market Insights
                            </CardTitle>
                            <CardDescription className="font-medium">What companies are looking for in {profile.target_role} roles.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="p-6 rounded-2xl border border-primary/5 bg-slate-900/50 flex items-start gap-4 group hover:bg-slate-900 transition-all">
                                <div className="p-3 rounded-xl bg-primary/10 group-hover:scale-110 transition-transform">
                                    <TrendingUp className="h-5 w-5 text-primary" />
                                </div>
                                <div className="space-y-1">
                                    <h4 className="text-sm font-black uppercase tracking-widest text-primary/60">Industry Trend</h4>
                                    <p className="text-sm font-bold leading-relaxed">{analysis.market_trend}</p>
                                </div>
                            </div>
                            <div className="p-6 rounded-2xl border border-primary/5 bg-slate-900/50 flex items-start gap-4 group hover:bg-slate-900 transition-all">
                                <div className="p-3 rounded-xl bg-primary/10 group-hover:scale-110 transition-transform">
                                    <ArrowRight className="h-5 w-5 text-primary" />
                                </div>
                                <div className="space-y-1">
                                    <h4 className="text-sm font-black uppercase tracking-widest text-primary/60">Hiring Strategy</h4>
                                    <p className="text-sm font-bold leading-relaxed">{analysis.hiring_tip}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    );
}
