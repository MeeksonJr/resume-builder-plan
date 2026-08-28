"use client";

import { useState, useEffect } from "react";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    TrendingUp,
    AlertCircle,
    CheckCircle2,
    Zap,
    Loader2,
    BarChart3,
    Target,
    Sparkles,
    FileText,
    Pencil,
    Save,
    History,
    Pin,
    Trash2,
    Search,
    Unlock,
    Info,
    ShieldCheck
} from "lucide-react";
import { toast } from "sonner";
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from "recharts";
import { TailoringResults } from "./tailoring-results";
import { useResumeStore } from "@/lib/stores/resume-store";
import { createClient } from "@/lib/supabase/client";
import { formatDistanceToNow } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface OptimizeContentProps {
    resumes: { id: string; title: string }[];
    targetRole: string | null;
}

export function OptimizeContent({ resumes, targetRole }: OptimizeContentProps) {
    const { fetchResume, saveAllChanges, saveVersion, setProfile, addSkill } = useResumeStore();
    const [selectedResume, setSelectedResume] = useState(resumes[0]?.id || "");
    const [isLoading, setIsLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [activeTab, setActiveTab] = useState("analyze");

    // General Score tab states
    const [analysis, setAnalysis] = useState<any | null>(null);

    // Job Tailoring tab states
    const [jobDescription, setJobDescription] = useState("");
    const [tailoringAnalysis, setTailoringAnalysis] = useState<any | null>(null);

    // ATS Match Analyzer states
    const [atsTargetRole, setAtsTargetRole] = useState(targetRole || "");
    const [atsJobDescription, setAtsJobDescription] = useState("");
    const [atsResult, setAtsResult] = useState<any | null>(null);
    const [savedAtsHistory, setSavedAtsHistory] = useState<any[]>([]);
    const [showAtsHistory, setShowAtsHistory] = useState(false);
    const [historySearch, setHistorySearch] = useState("");
    const [filterPinned, setFilterPinned] = useState(false);

    // Profile subscription state
    const [profileData, setProfileData] = useState<any>(null);

    useEffect(() => {
        loadProfile();
        loadAtsHistory();
    }, []);

    const loadProfile = async () => {
        try {
            const supabase = createClient();
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const { data } = await supabase
                .from("profiles")
                .select("is_pro, subscription_status")
                .eq("id", user.id)
                .single();

            setProfileData(data);
        } catch (error) {
            console.error("Error loading profile:", error);
        }
    };

    const loadAtsHistory = async () => {
        try {
            const supabase = createClient();
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const { data, error } = await supabase
                .from("saved_ats_analyses")
                .select("*")
                .eq("user_id", user.id)
                .order("created_at", { ascending: false });

            if (error) throw error;
            setSavedAtsHistory(data || []);
        } catch (error) {
            console.error("Error loading ATS history:", error);
        }
    };

    const isProUser = profileData?.is_pro === true ||
                      profileData?.subscription_status === "active" ||
                      profileData?.subscription_status === "trialing";

    const fetchFullResumeData = async (resumeId: string) => {
        const supabase = createClient();
        const [
            { data: personalInfo },
            { data: workExperiences },
            { data: education },
            { data: skills },
            { data: projects },
            { data: certifications },
            { data: languages },
        ] = await Promise.all([
            supabase.from("personal_info").select("*").eq("resume_id", resumeId).maybeSingle(),
            supabase.from("work_experiences").select("*").eq("resume_id", resumeId).order("sort_order"),
            supabase.from("education").select("*").eq("resume_id", resumeId).order("sort_order"),
            supabase.from("skills").select("*").eq("resume_id", resumeId).order("sort_order"),
            supabase.from("projects").select("*").eq("resume_id", resumeId).order("sort_order"),
            supabase.from("certifications").select("*").eq("resume_id", resumeId).order("sort_order"),
            supabase.from("languages").select("*").eq("resume_id", resumeId).order("sort_order"),
        ]);

        return {
            personalInfo: {
                fullName: personalInfo?.full_name || undefined,
                email: personalInfo?.email || undefined,
                phone: personalInfo?.phone || undefined,
                location: personalInfo?.location || undefined,
                linkedin: personalInfo?.linkedin || undefined,
                website: personalInfo?.website || undefined,
                github: personalInfo?.github || undefined,
                summary: personalInfo?.summary || undefined,
            },
            workExperience: (workExperiences || []).map(exp => ({
                company: exp.company || "",
                position: exp.position || "",
                location: exp.location || undefined,
                startDate: exp.start_date || undefined,
                endDate: exp.end_date || undefined,
                current: exp.is_current || false,
                description: exp.description || "",
            })),
            education: (education || []).map(edu => ({
                institution: edu.institution || "",
                degree: edu.degree || undefined,
                field: edu.field_of_study || undefined,
                location: edu.location || undefined,
                startDate: edu.start_date || undefined,
                endDate: edu.end_date || undefined,
            })),
            skills: (skills || []).map(s => ({
                items: s.skills || [],
                category: s.name || "Skills",
            })),
            projects: (projects || []).map(p => ({
                name: p.name || "",
                description: p.description || "",
                technologies: p.technologies || [],
                url: p.url || undefined,
            })),
            certifications: (certifications || []).map(c => ({
                name: c.name || "",
                issuer: c.issuer || "",
                date: c.date || undefined,
                url: c.url || undefined,
            })),
            languages: (languages || []).map(l => ({
                language: l.language || "",
                proficiency: l.proficiency || "",
            })),
        };
    };

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

            if (!response.ok) {
                const errData = await response.json();
                if (response.status === 429 && errData.error === "LIMIT_EXCEEDED") {
                    throw new Error(errData.message);
                }
                throw new Error("Optimization failed");
            }

            const data = await response.json();
            setAnalysis(data);
            toast.success("Resume analysis complete!");
        } catch (error: any) {
            console.error(error);
            toast.error(error.message || "Failed to analyze resume");
        } finally {
            setIsLoading(false);
        }
    };

    const runTailoring = async () => {
        if (!selectedResume) {
            toast.error("Please select a resume");
            return;
        }
        if (!jobDescription.trim()) {
            toast.error("Please enter a job description");
            return;
        }

        setIsLoading(true);
        try {
            const response = await fetch("/api/ai/optimize/tailor", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ resumeId: selectedResume, jobDescription }),
            });

            if (!response.ok) {
                const errData = await response.json();
                if (response.status === 429 && errData.error === "LIMIT_EXCEEDED") {
                    throw new Error(errData.message);
                }
                throw new Error("Tailoring failed");
            }

            const data = await response.json();
            setTailoringAnalysis(data);
            toast.success("Tailoring suggestions generated!");
        } catch (error: any) {
            console.error(error);
            toast.error(error.message || "Failed to generate tailoring insights");
        } finally {
            setIsLoading(false);
        }
    };

    const runAtsCheck = async () => {
        if (!selectedResume) {
            toast.error("Please select a resume to check");
            return;
        }

        setIsLoading(true);
        try {
            const resumeData = await fetchFullResumeData(selectedResume);
            const response = await fetch("/api/ai/ats-score", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    resumeData,
                    jobDescription: atsJobDescription.trim() || undefined
                })
            });

            if (!response.ok) {
                const errData = await response.json();
                if (response.status === 429 && errData.error === "LIMIT_EXCEEDED") {
                    throw new Error(errData.message);
                }
                throw new Error("ATS scoring failed");
            }

            const data = await response.json();
            setAtsResult(data);
            toast.success("ATS scan complete!");
        } catch (error: any) {
            console.error(error);
            toast.error(error.message || "Failed to calculate ATS score");
        } finally {
            setIsLoading(false);
        }
    };

    const saveAtsAnalysis = async () => {
        if (!atsResult) return;

        setIsSaving(true);
        try {
            const supabase = createClient();
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error("Not authenticated");

            // Direct check for free tier limit (maximum 1 saved item)
            if (!isProUser && savedAtsHistory.length >= 1) {
                toast.error("Free plan limit reached. Free users can only save 1 ATS Report. Please upgrade to Pro or delete your existing saved item.", {
                    duration: 6000,
                });
                setIsSaving(false);
                return;
            }

            const { data, error } = await supabase
                .from("saved_ats_analyses")
                .insert({
                    user_id: user.id,
                    resume_id: selectedResume || null,
                    target_role: atsTargetRole.trim() || null,
                    job_description: atsJobDescription.trim() || null,
                    score: atsResult.score,
                    breakdown: atsResult.breakdown,
                    missing_keywords: atsResult.missingKeywords,
                    overall_feedback: atsResult.overallFeedback,
                })
                .select()
                .single();

            if (error) throw error;

            setAtsResult({ ...atsResult, id: data.id });
            await loadAtsHistory();
            toast.success("ATS report saved successfully!");
        } catch (error: any) {
            console.error(error);
            toast.error(error.message || "Failed to save ATS report");
        } finally {
            setIsSaving(false);
        }
    };

    const toggleAtsPin = async (id: string, currentPinned: boolean) => {
        try {
            const supabase = createClient();
            const { error } = await supabase
                .from("saved_ats_analyses")
                .update({ is_pinned: !currentPinned })
                .eq("id", id);

            if (error) throw error;

            setSavedAtsHistory((prev: any[]) =>
                prev.map(item => item.id === id ? { ...item, is_pinned: !currentPinned } : item)
            );

            if (atsResult?.id === id) {
                setAtsResult((prev: any) => prev ? { ...prev, is_pinned: !currentPinned } : null);
            }

            toast.success(currentPinned ? "Unpinned from history" : "Pinned to top of history");
        } catch (error: any) {
            console.error(error);
            toast.error("Failed to pin item");
        }
    };

    const deleteAtsHistoryItem = async (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        try {
            const supabase = createClient();
            const { error } = await supabase
                .from("saved_ats_analyses")
                .delete()
                .eq("id", id);

            if (error) throw error;

            setSavedAtsHistory((prev: any[]) => prev.filter(item => item.id !== id));
            if (atsResult?.id === id) {
                setAtsResult((prev: any) => prev ? { ...prev, id: undefined } : null);
            }
            toast.success("Report deleted from history");
        } catch (error: any) {
            console.error(error);
            toast.error("Failed to delete report");
        }
    };

    const loadAtsFromHistory = (item: any) => {
        setAtsResult({
            id: item.id,
            score: item.score,
            breakdown: item.breakdown || [],
            missingKeywords: item.missing_keywords || [],
            overallFeedback: item.overall_feedback || "",
            is_pinned: item.is_pinned
        });
        setAtsTargetRole(item.target_role || "");
        setAtsJobDescription(item.job_description || "");
        if (item.resume_id) {
            setSelectedResume(item.resume_id);
        }
        setShowAtsHistory(false);
        toast.info("Loaded saved ATS report");
    };

    const handleApplyTailoring = async () => {
        if (!tailoringAnalysis || !selectedResume) return;

        setIsLoading(true);
        try {
            await fetchResume(selectedResume);

            if (tailoringAnalysis.improvedSummary) {
                const currentState = useResumeStore.getState();
                if (currentState.profile) {
                    setProfile({ ...currentState.profile, summary: tailoringAnalysis.improvedSummary });
                }
            }

            if (tailoringAnalysis.keywordsToAdd && tailoringAnalysis.keywordsToAdd.length > 0) {
                const currentState = useResumeStore.getState();
                const existingSkillNames = new Set(currentState.skills.map(s => s.name.toLowerCase()));
                
                tailoringAnalysis.keywordsToAdd.forEach((keyword: string) => {
                    if (!existingSkillNames.has(keyword.toLowerCase())) {
                        addSkill({
                            name: keyword,
                            category: "Tailored Additions",
                            proficiency_level: 3
                        });
                    }
                });
            }

            await saveVersion(
                "Tailored Version",
                `Auto-tailored for job application. Updated summary and skills.`
            );

            await saveAllChanges();
            toast.success("Tailored version saved!");
        } catch (error) {
            console.error(error);
            toast.error("Failed to apply changes");
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

    const filteredAtsHistory = savedAtsHistory.filter(item => {
        const matchesSearch = item.target_role?.toLowerCase().includes(historySearch.toLowerCase()) ||
                              item.job_description?.toLowerCase().includes(historySearch.toLowerCase());
        const matchesPinned = filterPinned ? item.is_pinned : true;
        return matchesSearch && matchesPinned;
    });

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
            {/* Limit Warning Callout */}
            {!isProUser && (
                <div className="flex items-center justify-between border border-amber-200 bg-amber-50/50 p-4 rounded-none">
                    <div className="flex gap-2.5 items-start">
                        <AlertCircle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
                        <div>
                            <p className="text-xs font-bold text-amber-800">Free Account Limits</p>
                            <p className="text-[11px] text-amber-700 mt-0.5">
                                Free users can run 2 ATS scans per day and save 1 report in history. Upgrade to Pro for unlimited scans, saves, and keyword tailoring!
                            </p>
                        </div>
                    </div>
                    <Button asChild size="sm" className="rounded-none bg-[#102b2b] text-[#d8f36b] hover:bg-[#0d8274] font-bold text-xs shrink-0 ml-4 h-8">
                        <a href="/pricing">Upgrade <Unlock className="h-3 w-3 ml-1" /></a>
                    </Button>
                </div>
            )}

            <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
                <Select value={selectedResume} onValueChange={setSelectedResume}>
                    <SelectTrigger className="w-full sm:w-[350px]">
                        <SelectValue placeholder="Select a resume to optimize" />
                    </SelectTrigger>
                    <SelectContent>
                        {resumes.map((resume) => (
                            <SelectItem key={resume.id} value={resume.id}>
                                {resume.title}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full space-y-6">
                <TabsList className="flex flex-wrap h-auto w-full gap-2 border-b border-[#102b2b]/15 bg-transparent p-0 pb-3">
                    <TabsTrigger value="analyze" className="h-10 shrink-0 gap-2 rounded-full border border-[#102b2b]/15 bg-white px-4 text-xs sm:text-sm font-bold text-[#102b2b]/65 transition-all data-[state=active]:border-transparent data-[state=active]:bg-[#102b2b] data-[state=active]:text-[#d8f36b] hover:bg-[#102b2b]/5 shadow-sm">
                        General Score
                    </TabsTrigger>
                    <TabsTrigger value="ats-score" className="h-10 shrink-0 gap-2 rounded-full border border-[#102b2b]/15 bg-white px-4 text-xs sm:text-sm font-bold text-[#102b2b]/65 transition-all data-[state=active]:border-transparent data-[state=active]:bg-[#102b2b] data-[state=active]:text-[#d8f36b] hover:bg-[#102b2b]/5 shadow-sm">
                        ATS Match Analyzer
                    </TabsTrigger>
                    <TabsTrigger value="tailor" className="h-10 shrink-0 gap-2 rounded-full border border-[#102b2b]/15 bg-white px-4 text-xs sm:text-sm font-bold text-[#102b2b]/65 transition-all data-[state=active]:border-transparent data-[state=active]:bg-[#102b2b] data-[state=active]:text-[#d8f36b] hover:bg-[#102b2b]/5 shadow-sm">
                        Job Tailoring
                    </TabsTrigger>
                </TabsList>

                {/* Tab: General Score */}
                <TabsContent value="analyze" className="space-y-6 mt-0">
                    <div className="flex justify-start">
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
                </TabsContent>

                {/* Tab: ATS Match Analyzer */}
                <TabsContent value="ats-score" className="space-y-6 mt-0">
                    {/* Action Panel */}
                    <div className="flex flex-wrap items-center justify-between gap-3 border border-[#102b2b]/15 bg-[#f4f7f2] p-4">
                        <div className="flex items-center gap-3">
                            <Button
                                onClick={() => setShowAtsHistory(!showAtsHistory)}
                                variant="outline"
                                className={cn(
                                    "h-11 gap-2 rounded-none border-[#102b2b]/25 font-bold text-[#102b2b]",
                                    showAtsHistory && "bg-[#102b2b] text-white hover:bg-[#102b2b]"
                                )}
                            >
                                <History className="h-4 w-4" />
                                History ({savedAtsHistory.length})
                            </Button>

                            {atsResult && !atsResult.id && (
                                <Button 
                                    onClick={saveAtsAnalysis} 
                                    disabled={isSaving} 
                                    className="h-11 gap-2 rounded-none bg-[#0d8274] text-white hover:bg-[#102b2b] font-bold shadow-none"
                                >
                                    {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                                    Save Scan Report
                                </Button>
                            )}

                            {atsResult?.id && (
                                <div className="flex items-center gap-2">
                                    <Badge variant="secondary" className="h-10 gap-2 rounded-none border border-[#0d8274]/20 bg-[#0d8274]/10 px-4 font-bold text-[#0d8274]">
                                        <CheckCircle2 className="h-4 w-4" />
                                        Report Saved
                                    </Badge>
                                    <Button
                                        size="icon"
                                        variant="outline"
                                        onClick={() => toggleAtsPin(atsResult.id!, atsResult.is_pinned || false)}
                                        className="h-10 w-10 border-[#102b2b]/15 rounded-none text-[#102b2b]/70 hover:text-[#102b2b]"
                                    >
                                        <Pin className={cn("h-4 w-4", atsResult.is_pinned && "fill-[#0d8274] text-[#0d8274]")} />
                                    </Button>
                                </div>
                            )}
                        </div>

                        {atsResult && (
                            <Button
                                variant="ghost"
                                onClick={() => setAtsResult(null)}
                                className="h-11 text-xs font-bold text-[#102b2b]/60 hover:text-[#102b2b] hover:bg-transparent"
                            >
                                Clear Results
                            </Button>
                        )}
                    </div>

                    {/* History Drawer */}
                    <AnimatePresence>
                        {showAtsHistory && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: "auto" }}
                                exit={{ opacity: 0, height: 0 }}
                                className="overflow-hidden border border-[#102b2b]/15 bg-white p-5 space-y-4"
                            >
                                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#102b2b]/10 pb-4">
                                    <h3 className="text-sm font-bold text-[#102b2b] uppercase tracking-wider flex items-center gap-2">
                                        <History className="h-4 w-4 text-[#0d8274]" />
                                        ATS Scan History
                                    </h3>
                                    <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
                                        <div className="relative flex-1 sm:flex-initial">
                                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                                            <Input
                                                value={historySearch}
                                                onChange={(e) => setHistorySearch(e.target.value)}
                                                placeholder="Search by role..."
                                                className="h-9 w-full sm:w-60 pl-9 rounded-none border-[#102b2b]/15 text-xs bg-white"
                                            />
                                        </div>
                                        <Button
                                            size="sm"
                                            variant={filterPinned ? "secondary" : "outline"}
                                            onClick={() => setFilterPinned(!filterPinned)}
                                            className="h-9 gap-1.5 rounded-none border-[#102b2b]/15 text-xs font-bold text-[#102b2b]"
                                        >
                                            <Pin className={cn("h-3.5 w-3.5", filterPinned && "fill-[#0d8274] text-[#0d8274]")} />
                                            {filterPinned ? "Pinned Only" : "All Saved"}
                                        </Button>
                                    </div>
                                </div>

                                {filteredAtsHistory.length === 0 ? (
                                    <div className="text-center py-10 text-xs text-muted-foreground italic border border-dashed border-[#102b2b]/10">
                                        No saved reports found.
                                    </div>
                                ) : (
                                    <div className="grid gap-3 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                                        {filteredAtsHistory.map((item) => (
                                            <div
                                                key={item.id}
                                                onClick={() => loadAtsFromHistory(item)}
                                                className={cn(
                                                    "group border p-4 bg-[#fcfdfe] hover:bg-[#e9eee8]/35 transition-all duration-200 cursor-pointer relative flex flex-col justify-between min-h-[140px]",
                                                    atsResult?.id === item.id ? "border-[#0d8274] bg-[#e9eee8]/10" : "border-[#102b2b]/10"
                                                )}
                                            >
                                                <div className="space-y-1.5">
                                                    <div className="flex items-start justify-between">
                                                        <span className="font-heading font-black text-xs text-[#102b2b] block truncate pr-8">
                                                            {item.target_role || "ATS Scan Report"}
                                                        </span>
                                                        <div className="flex items-center gap-1.5 absolute right-3 top-3">
                                                            <Button
                                                                size="icon"
                                                                variant="ghost"
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    toggleAtsPin(item.id, item.is_pinned);
                                                                }}
                                                                className="h-7 w-7 opacity-50 hover:opacity-100 rounded-none hover:bg-transparent"
                                                            >
                                                                <Pin className={cn("h-3.5 w-3.5", item.is_pinned && "fill-[#0d8274] text-[#0d8274] opacity-100")} />
                                                            </Button>
                                                            <Button
                                                                size="icon"
                                                                variant="ghost"
                                                                onClick={(e) => deleteAtsHistoryItem(item.id, e)}
                                                                className="h-7 w-7 text-red-600 hover:text-red-700 opacity-50 hover:opacity-100 rounded-none hover:bg-transparent"
                                                            >
                                                                <Trash2 className="h-3.5 w-3.5" />
                                                            </Button>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-1.5">
                                                        <Badge className="bg-[#102b2b] text-[#d8f36b] text-[9px] rounded-none px-1.5 py-0.5">
                                                            Score: {item.score}/100
                                                        </Badge>
                                                    </div>
                                                </div>
                                                <div className="flex items-end justify-between border-t border-[#102b2b]/5 pt-3 mt-4">
                                                    <span className="text-[9px] text-muted-foreground font-bold">
                                                        {formatDistanceToNow(new Date(item.created_at), { addSuffix: true })}
                                                    </span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Inputs Card */}
                    <Card className="border border-[#102b2b]/15 bg-white shadow-none rounded-none">
                        <CardHeader>
                            <CardTitle className="text-xl font-heading font-black flex items-center gap-2">
                                <ShieldCheck className="h-5 w-5 text-[#0d8274]" />
                                ATS Compatibility Check
                            </CardTitle>
                            <CardDescription>
                                Match your resume formatting, keywords, and headers against job descriptions or target industry benchmarks.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-3">
                                <Label htmlFor="ats-target-role" className="text-sm font-bold">Target Job Title (Optional)</Label>
                                <Input
                                    id="ats-target-role"
                                    value={atsTargetRole}
                                    onChange={(e) => setAtsTargetRole(e.target.value)}
                                    placeholder="e.g. Lead React Developer"
                                    className="h-11 rounded-none border-[#102b2b]/15 bg-white text-[#102b2b]"
                                />
                            </div>

                            <div className="space-y-3">
                                <Label htmlFor="ats-jd-input" className="text-sm font-bold">Paste Target Job Description (Highly Recommended)</Label>
                                <Textarea
                                    id="ats-jd-input"
                                    value={atsJobDescription}
                                    onChange={(e) => setAtsJobDescription(e.target.value)}
                                    placeholder="Paste job posting details here to test keyword densities and specific ATS matches..."
                                    className="min-h-[160px] rounded-none border-[#102b2b]/15 bg-white text-[#102b2b]"
                                />
                            </div>

                            <Button
                                onClick={runAtsCheck}
                                disabled={isLoading || !selectedResume}
                                className="rounded-none bg-[#102b2b] text-[#d8f36b] hover:bg-[#0d8274] h-11 px-6 font-bold w-full md:w-auto"
                            >
                                {isLoading ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Running ATS Diagnostic...
                                    </>
                                ) : (
                                    <>
                                        <Sparkles className="mr-2 h-4 w-4" />
                                        Scan Resume Compatibility
                                    </>
                                )}
                            </Button>
                        </CardContent>
                    </Card>

                    {/* Results Render */}
                    <AnimatePresence mode="wait">
                        {atsResult && (
                            <motion.div
                                initial={{ opacity: 0, y: 15 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -15 }}
                                className="grid gap-6 md:grid-cols-3"
                            >
                                <Card className="border border-[#102b2b]/15 bg-white shadow-none rounded-none md:col-span-1 flex flex-col items-center justify-center p-8 text-center">
                                    <span className="text-xs font-black uppercase tracking-wider text-muted-foreground mb-4">
                                        ATS Score
                                    </span>

                                    {/* SVG Circular Gauge */}
                                    <div className="relative h-36 w-36 mb-4">
                                        <svg className="h-full w-full -rotate-90" viewBox="0 0 36 36">
                                            <path
                                                className="stroke-gray-100 fill-none"
                                                strokeWidth="3.2"
                                                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                            />
                                            <motion.path
                                                className={cn("fill-none transition-all duration-1000", atsResult.score >= 80 ? "stroke-green-600" : atsResult.score >= 50 ? "stroke-yellow-600" : "stroke-red-600")}
                                                strokeWidth="3.2"
                                                strokeDasharray={`${atsResult.score}, 100`}
                                                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                                initial={{ strokeDasharray: "0, 100" }}
                                                animate={{ strokeDasharray: `${atsResult.score}, 100` }}
                                                transition={{ duration: 1.2, ease: "easeOut" }}
                                            />
                                        </svg>
                                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                                            <span className="text-4xl font-heading font-black text-[#102b2b]">
                                                {atsResult.score}
                                            </span>
                                            <span className="text-[9px] uppercase tracking-wider font-bold text-muted-foreground">Match Rating</span>
                                        </div>
                                    </div>

                                    <Badge variant="outline" className={cn("rounded-none font-bold text-[10px] px-3.5 py-1.5 border-none", atsResult.score >= 80 ? "bg-green-100 text-green-800" : atsResult.score >= 50 ? "bg-yellow-100 text-yellow-800" : "bg-red-100 text-red-800")}>
                                        {atsResult.score >= 80 ? "ATS Ready" : atsResult.score >= 60 ? "Average Match" : "Optimization Required"}
                                    </Badge>
                                    
                                    <p className="text-[11px] text-muted-foreground leading-normal mt-4 max-w-[200px]">
                                        {atsResult.overallFeedback}
                                    </p>
                                </Card>

                                {/* breakdown and suggestions */}
                                <Card className="border border-[#102b2b]/15 bg-white shadow-none rounded-none md:col-span-2">
                                    <CardHeader className="pb-2">
                                        <CardTitle className="text-md font-bold">Optimization Diagnosis</CardTitle>
                                        <CardDescription>Target area reviews and recommendations</CardDescription>
                                    </CardHeader>
                                    <CardContent className="p-0">
                                        <div className="divide-y divide-[#102b2b]/10">
                                            {atsResult.breakdown?.map((item: any, idx: number) => (
                                                <div key={idx} className="p-5 flex items-start gap-4 hover:bg-[#e9eee8]/10 transition-colors">
                                                    <div className={cn(
                                                        "h-9 w-9 shrink-0 flex items-center justify-center font-mono font-bold text-sm",
                                                        item.score >= 80 ? "bg-green-100 text-green-800" :
                                                        item.score >= 50 ? "bg-yellow-100 text-yellow-800" :
                                                        "bg-red-100 text-red-800"
                                                    )}>
                                                        {item.score}
                                                    </div>
                                                    <div className="space-y-2 flex-1 min-w-0">
                                                        <div className="flex items-center justify-between gap-2">
                                                            <h4 className="font-bold text-xs uppercase tracking-wider text-[#102b2b]">{item.category}</h4>
                                                            {item.score < 80 && (
                                                                <Badge className="bg-[#102b2b] text-[#d8f36b] text-[8px] rounded-none px-1.5 py-0.5">
                                                                    Fix Required
                                                                </Badge>
                                                            )}
                                                        </div>
                                                        <ul className="space-y-1.5 pt-1">
                                                            {item.feedback?.map((f: string, fidx: number) => (
                                                                <li key={fidx} className="text-xs text-[#102b2b]/70 flex items-start gap-2 leading-relaxed">
                                                                    <CheckCircle2 className="h-3.5 w-3.5 text-[#0d8274] shrink-0 mt-0.5" />
                                                                    {f}
                                                                </li>
                                                            ))}
                                                        </ul>
                                                    </div>
                                                </div>
                                            ))}
                                            
                                            {atsResult.missingKeywords?.length > 0 && (
                                                <div className="p-5 bg-[#f4f7f2]/50 space-y-3">
                                                    <h4 className="text-xs font-bold uppercase tracking-wider text-[#102b2b] flex items-center gap-1.5">
                                                        <Info className="h-3.5 w-3.5 text-[#0d8274]" />
                                                        Missing Industry Keywords
                                                    </h4>
                                                    <div className="flex flex-wrap gap-1.5">
                                                        {atsResult.missingKeywords.map((kw: string, kidx: number) => (
                                                            <Badge key={kidx} variant="outline" className="bg-white border-[#102b2b]/15 text-[#102b2b] font-bold text-[10px] rounded-none px-2.5 py-1">
                                                                +{kw}
                                                            </Badge>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </TabsContent>

                {/* Tab: Job Tailoring */}
                <TabsContent value="tailor" className="space-y-6 mt-0">
                    <Card className="border border-[#102b2b]/15 bg-white shadow-none rounded-none">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Pencil className="h-5 w-5 text-[#0d8274]" />
                                Job Description
                            </CardTitle>
                            <CardDescription>
                                Paste the job description you want to apply for. AI will analyze it and optimize your resume.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <Textarea
                                placeholder="Paste job description here..."
                                className="min-h-[200px] rounded-none border-[#102b2b]/15 bg-white text-[#102b2b]"
                                value={jobDescription}
                                onChange={(e) => setJobDescription(e.target.value)}
                            />
                            <div className="flex justify-end">
                                <Button onClick={runTailoring} disabled={isLoading} className="gap-2">
                                    {isLoading ? (
                                        <>
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                            Tailoring...
                                        </>
                                    ) : (
                                        <>
                                            <Sparkles className="h-4 w-4" />
                                            Tailor My Resume
                                        </>
                                    )}
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    {tailoringAnalysis && (
                        <TailoringResults
                            results={tailoringAnalysis}
                            onApply={handleApplyTailoring}
                            isApplying={isLoading}
                        />
                    )}
                </TabsContent>
            </Tabs>
        </div>
    );
}
