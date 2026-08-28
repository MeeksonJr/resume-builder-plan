"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
    BrainCircuit,
    CheckCircle2,
    Loader2,
    Sparkles,
    BookOpen,
    Trophy,
    AlertTriangle,
    Target,
    HelpCircle,
    ArrowRight,
    Save,
    History,
    Pin,
    Trash2,
    Search,
    Unlock,
    AlertCircle
} from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { formatDistanceToNow } from "date-fns";

interface SkillsGapContentProps {
    profile: any;
    resumes: any[];
}

interface SkillsGapAnalysis {
    id?: string;
    matchScore: number;
    matchingSkills: string[];
    missingHardSkills: string[];
    missingSoftSkills: string[];
    recommendedCertifications: { name: string; provider: string; relevance: string }[];
    actionSteps: string[];
    is_pinned?: boolean;
}

export function SkillsGapContent({ profile, resumes }: SkillsGapContentProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [analysis, setAnalysis] = useState<SkillsGapAnalysis | null>(null);
    const [selectedResumeId, setSelectedResumeId] = useState(resumes[0]?.id || "");
    const [targetRole, setTargetRole] = useState(profile?.target_role || "");
    const [checkedSteps, setCheckedSteps] = useState<Record<number, boolean>>({});

    // History and Filter States
    const [savedHistory, setSavedHistory] = useState<any[]>([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [filterPinned, setFilterPinned] = useState(false);
    const [sortBy, setSortBy] = useState<"newest" | "oldest">("newest");
    const [showHistoryPanel, setShowHistoryPanel] = useState(false);

    const isProUser = profile?.is_pro === true ||
                      profile?.subscription_status === "active" ||
                      profile?.subscription_status === "trialing";

    useEffect(() => {
        loadSavedHistory();
    }, []);

    const loadSavedHistory = async () => {
        try {
            const supabase = createClient();
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const { data, error } = await supabase
                .from("saved_skills_gaps")
                .select("*")
                .eq("user_id", user.id)
                .order("created_at", { ascending: false });

            if (error) throw error;
            setSavedHistory(data || []);
        } catch (error) {
            console.error("Error loading saved history:", error);
        }
    };

    const runAnalysis = async () => {
        if (!selectedResumeId) {
            toast.error("Please select a resume to analyze.");
            return;
        }
        if (!targetRole.trim()) {
            toast.error("Please enter a target role (e.g. Cloud Engineer).");
            return;
        }

        setIsLoading(true);
        setCheckedSteps({});
        try {
            const response = await fetch("/api/ai/career/skills-gap", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    resumeId: selectedResumeId,
                    targetRole: targetRole.trim()
                }),
            });

            if (!response.ok) {
                const errData = await response.json();
                if (response.status === 429 && errData.error === "LIMIT_EXCEEDED") {
                    throw new Error(errData.message);
                }
                throw new Error("Failed to run skills gap analysis");
            }

            const data = await response.json();
            setAnalysis(data);
            toast.success("Skills gap analysis complete!");
        } catch (error: any) {
            console.error(error);
            toast.error(error.message || "Failed to run analysis. Check your AI keys.");
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

            // Direct check for free tier limit (maximum 1 saved item)
            if (!isProUser && savedHistory.length >= 1) {
                toast.error("Free plan limit reached. Free users can only save 1 Skills Gap Audit. Please upgrade to Pro or delete your existing saved item.", {
                    duration: 6000,
                });
                setIsSaving(false);
                return;
            }

            const { data, error } = await supabase
                .from("saved_skills_gaps")
                .insert({
                    user_id: user.id,
                    resume_id: selectedResumeId || null,
                    target_role: targetRole.trim(),
                    match_score: analysis.matchScore,
                    matching_skills: analysis.matchingSkills,
                    missing_hard_skills: analysis.missingHardSkills,
                    missing_soft_skills: analysis.missingSoftSkills,
                    recommended_certifications: analysis.recommendedCertifications,
                    action_steps: analysis.actionSteps,
                })
                .select()
                .single();

            if (error) throw error;

            setAnalysis({ ...analysis, id: data.id });
            await loadSavedHistory();
            toast.success("Skills gap analysis saved successfully!");
        } catch (error: any) {
            console.error(error);
            toast.error(error.message || "Failed to save analysis");
        } finally {
            setIsSaving(false);
        }
    };

    const togglePin = async (id: string, currentPinned: boolean) => {
        try {
            const supabase = createClient();
            const { error } = await supabase
                .from("saved_skills_gaps")
                .update({ is_pinned: !currentPinned })
                .eq("id", id);

            if (error) throw error;
            
            setSavedHistory(prev =>
                prev.map(item => item.id === id ? { ...item, is_pinned: !currentPinned } : item)
            );
            
            if (analysis?.id === id) {
                setAnalysis(prev => prev ? { ...prev, is_pinned: !currentPinned } : null);
            }
            
            toast.success(currentPinned ? "Unpinned from history" : "Pinned to top of history");
        } catch (error: any) {
            console.error(error);
            toast.error("Failed to pin item");
        }
    };

    const deleteHistoryItem = async (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        try {
            const supabase = createClient();
            const { error } = await supabase
                .from("saved_skills_gaps")
                .delete()
                .eq("id", id);

            if (error) throw error;

            setSavedHistory(prev => prev.filter(item => item.id !== id));
            if (analysis?.id === id) {
                setAnalysis(prev => prev ? { ...prev, id: undefined } : null);
            }
            toast.success("Audit deleted from history");
        } catch (error: any) {
            console.error(error);
            toast.error("Failed to delete audit");
        }
    };

    const loadFromHistory = (item: any) => {
        setAnalysis({
            id: item.id,
            matchScore: item.match_score,
            matchingSkills: item.matching_skills || [],
            missingHardSkills: item.missing_hard_skills || [],
            missingSoftSkills: item.missing_soft_skills || [],
            recommendedCertifications: item.recommended_certifications || [],
            actionSteps: item.action_steps || [],
            is_pinned: item.is_pinned
        });
        setTargetRole(item.target_role);
        if (item.resume_id) {
            setSelectedResumeId(item.resume_id);
        }
        setCheckedSteps({});
        setShowHistoryPanel(false);
        toast.info(`Loaded saved skills gap audit for ${item.target_role}`);
    };

    const toggleStep = (index: number) => {
        setCheckedSteps(prev => ({
            ...prev,
            [index]: !prev[index]
        }));
    };

    const getScoreColor = (score: number) => {
        if (score >= 80) return "text-green-600 stroke-green-600";
        if (score >= 50) return "text-yellow-600 stroke-yellow-600";
        return "text-red-600 stroke-red-600";
    };

    // Filter and Sort History
    const filteredHistory = savedHistory
        .filter(item => {
            const matchesSearch = item.target_role.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesPinned = filterPinned ? item.is_pinned : true;
            return matchesSearch && matchesPinned;
        })
        .sort((a, b) => {
            if (a.is_pinned && !b.is_pinned) return -1;
            if (!a.is_pinned && b.is_pinned) return 1;
            
            const dateA = new Date(a.created_at).getTime();
            const dateB = new Date(b.created_at).getTime();
            return sortBy === "newest" ? dateB - dateA : dateA - dateB;
        });

    return (
        <div className="space-y-6">
            {/* Limit Warning/Upgrade Callout */}
            {!isProUser && (
                <div className="flex items-center justify-between border border-amber-200 bg-amber-50/50 p-4 rounded-none">
                    <div className="flex gap-2.5 items-start">
                        <AlertCircle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
                        <div>
                            <p className="text-xs font-bold text-amber-800">Free Account Limits</p>
                            <p className="text-[11px] text-amber-700 mt-0.5">
                                You can run 1 Skills Gap Audit per day and save 1 report in your history. Upgrade to Pro for unlimited audits and saves!
                            </p>
                        </div>
                    </div>
                    <Button asChild size="sm" className="rounded-none bg-[#102b2b] text-[#d8f36b] hover:bg-[#0d8274] font-bold text-xs shrink-0 ml-4 h-8">
                        <a href="/pricing">Upgrade <Unlock className="h-3 w-3 ml-1" /></a>
                    </Button>
                </div>
            )}

            {/* Actions Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 border border-[#102b2b]/15 bg-[#f4f7f2] p-4">
                <div className="flex items-center gap-3">
                    <Button
                        onClick={() => setShowHistoryPanel(!showHistoryPanel)}
                        variant="outline"
                        className={cn(
                            "h-11 gap-2 rounded-none border-[#102b2b]/25 font-bold text-[#102b2b]",
                            showHistoryPanel && "bg-[#102b2b] text-white hover:bg-[#102b2b]"
                        )}
                    >
                        <History className="h-4 w-4" />
                        History ({savedHistory.length})
                    </Button>
                    
                    {analysis && !analysis.id && (
                        <Button 
                            onClick={saveAnalysis} 
                            disabled={isSaving} 
                            className="h-11 gap-2 rounded-none bg-[#0d8274] text-white hover:bg-[#102b2b] font-bold shadow-none"
                        >
                            {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                            Save Audit Results
                        </Button>
                    )}

                    {analysis?.id && (
                        <div className="flex items-center gap-2">
                            <Badge variant="secondary" className="h-10 gap-2 rounded-none border border-[#0d8274]/20 bg-[#0d8274]/10 px-4 font-bold text-[#0d8274]">
                                <CheckCircle2 className="h-4 w-4" />
                                Saved to History
                            </Badge>
                            <Button
                                size="icon"
                                variant="outline"
                                onClick={() => togglePin(analysis.id!, analysis.is_pinned || false)}
                                className="h-10 w-10 border-[#102b2b]/15 rounded-none text-[#102b2b]/70 hover:text-[#102b2b]"
                            >
                                <Pin className={cn("h-4 w-4", analysis.is_pinned && "fill-[#0d8274] text-[#0d8274]")} />
                            </Button>
                        </div>
                    )}
                </div>

                {analysis && (
                    <Button
                        variant="ghost"
                        onClick={() => {
                            setAnalysis(null);
                        }}
                        className="h-11 text-xs font-bold text-[#102b2b]/60 hover:text-[#102b2b] hover:bg-transparent"
                    >
                        Clear Screen
                    </Button>
                )}
            </div>

            {/* History Panel */}
            <AnimatePresence>
                {showHistoryPanel && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden border border-[#102b2b]/15 bg-white p-5 space-y-4"
                    >
                        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#102b2b]/10 pb-4">
                            <h3 className="text-sm font-bold text-[#102b2b] uppercase tracking-wider flex items-center gap-2">
                                <History className="h-4 w-4 text-[#0d8274]" />
                                Skills Gap Audit History
                            </h3>
                            <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
                                {/* Search */}
                                <div className="relative flex-1 sm:flex-initial">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                                    <Input
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        placeholder="Search by role..."
                                        className="h-9 w-full sm:w-60 pl-9 rounded-none border-[#102b2b]/15 text-xs bg-white"
                                    />
                                </div>
                                {/* Filter Pin */}
                                <Button
                                    size="sm"
                                    variant={filterPinned ? "secondary" : "outline"}
                                    onClick={() => setFilterPinned(!filterPinned)}
                                    className="h-9 gap-1.5 rounded-none border-[#102b2b]/15 text-xs font-bold text-[#102b2b]"
                                >
                                    <Pin className={cn("h-3.5 w-3.5", filterPinned && "fill-[#0d8274] text-[#0d8274]")} />
                                    {filterPinned ? "Pinned Only" : "All Saved"}
                                </Button>
                                {/* Sort */}
                                <select
                                    value={sortBy}
                                    onChange={(e: any) => setSortBy(e.target.value)}
                                    className="h-9 px-2 text-xs font-bold border border-[#102b2b]/15 rounded-none bg-white text-[#102b2b]"
                                >
                                    <option value="newest">Newest First</option>
                                    <option value="oldest">Oldest First</option>
                                </select>
                            </div>
                        </div>

                        {filteredHistory.length === 0 ? (
                            <div className="text-center py-10 text-xs text-muted-foreground italic border border-dashed border-[#102b2b]/10">
                                {savedHistory.length === 0 ? "Your audit history is empty." : "No saved audits match your search criteria."}
                            </div>
                        ) : (
                            <div className="grid gap-3 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                                {filteredHistory.map((item) => (
                                    <div
                                        key={item.id}
                                        onClick={() => loadFromHistory(item)}
                                        className={cn(
                                            "group border p-4 bg-[#fcfdfe] hover:bg-[#e9eee8]/35 transition-all duration-200 cursor-pointer relative flex flex-col justify-between min-h-[140px]",
                                            analysis?.id === item.id ? "border-[#0d8274] bg-[#e9eee8]/10" : "border-[#102b2b]/10"
                                        )}
                                    >
                                        <div className="space-y-1.5">
                                            <div className="flex items-start justify-between">
                                                <span className="font-heading font-black text-xs text-[#102b2b] block truncate pr-8">
                                                    {item.target_role}
                                                </span>
                                                <div className="flex items-center gap-1.5 absolute right-3 top-3">
                                                    <Button
                                                        size="icon"
                                                        variant="ghost"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            togglePin(item.id, item.is_pinned);
                                                        }}
                                                        className="h-7 w-7 opacity-50 hover:opacity-100 rounded-none hover:bg-transparent"
                                                    >
                                                        <Pin className={cn("h-3.5 w-3.5", item.is_pinned && "fill-[#0d8274] text-[#0d8274] opacity-100")} />
                                                    </Button>
                                                    <Button
                                                        size="icon"
                                                        variant="ghost"
                                                        onClick={(e) => deleteHistoryItem(item.id, e)}
                                                        className="h-7 w-7 text-red-600 hover:text-red-700 opacity-50 hover:opacity-100 rounded-none hover:bg-transparent"
                                                    >
                                                        <Trash2 className="h-3.5 w-3.5" />
                                                    </Button>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-1.5">
                                                <Badge className="bg-[#102b2b] text-[#d8f36b] text-[9px] rounded-none px-1.5 py-0.5">
                                                    {item.match_score}% Match
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

            {/* Input Dashboard Form */}
            <Card className="border border-[#102b2b]/15 bg-white shadow-none rounded-none">
                <CardHeader className="pb-4">
                    <CardTitle className="text-xl font-heading font-black flex items-center gap-2">
                        <BrainCircuit className="h-5 w-5 text-[#0d8274]" />
                        Skills Gap Analyzer
                    </CardTitle>
                    <CardDescription>
                        Evaluate your current skills against industry standard requirements for your target career role.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2">
                        {/* Resume Selector */}
                        <div className="space-y-2">
                            <Label htmlFor="resume-select" className="text-sm font-bold">Select Resume</Label>
                            <select
                                id="resume-select"
                                value={selectedResumeId}
                                onChange={(e) => setSelectedResumeId(e.target.value)}
                                className="w-full h-11 px-3 border border-[#102b2b]/15 bg-white text-[#102b2b] text-sm focus:outline-none focus:ring-1 focus:ring-[#0d8274] transition-all rounded-none"
                            >
                                <option value="" disabled>Select a resume...</option>
                                {resumes.map((r) => (
                                    <option key={r.id} value={r.id}>
                                        {r.title}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Target Role Input */}
                        <div className="space-y-2">
                            <Label htmlFor="target-role-input" className="text-sm font-bold">Target Career Role</Label>
                            <Input
                                id="target-role-input"
                                value={targetRole}
                                onChange={(e) => setTargetRole(e.target.value)}
                                placeholder="e.g. Cloud Architect, React Developer, Product Manager"
                                className="h-11 rounded-none border-[#102b2b]/15 bg-white text-[#102b2b]"
                            />
                        </div>
                    </div>

                    <Button
                        onClick={runAnalysis}
                        disabled={isLoading || !selectedResumeId || !targetRole.trim()}
                        className="rounded-none bg-[#102b2b] text-[#d8f36b] hover:bg-[#0d8274] h-11 px-6 font-bold w-full md:w-auto"
                    >
                        {isLoading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Running AI Audit...
                            </>
                        ) : (
                            <>
                                <Sparkles className="mr-2 h-4 w-4" />
                                Analyze Skills Gap
                            </>
                        )}
                    </Button>
                </CardContent>
            </Card>

            {/* Results Render */}
            <AnimatePresence mode="wait">
                {analysis && (
                    <motion.div
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -15 }}
                        transition={{ duration: 0.3 }}
                        className="space-y-6"
                    >
                        {/* Summary Score Gauge and Stats */}
                        <div className="grid gap-6 md:grid-cols-3">
                            <Card className="border border-[#102b2b]/15 bg-white shadow-none rounded-none md:col-span-1 flex flex-col items-center justify-center p-6 text-center">
                                <span className="text-xs font-black uppercase tracking-wider text-muted-foreground mb-4">
                                    Role Compatibility
                                </span>
                                
                                {/* SVG Circular Gauge */}
                                <div className="relative h-32 w-32 mb-4">
                                    <svg className="h-full w-full -rotate-90" viewBox="0 0 36 36">
                                        {/* Background Path */}
                                        <path
                                            className="stroke-gray-100 fill-none"
                                            strokeWidth="3"
                                            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                        />
                                        {/* Colored Progress Path */}
                                        <motion.path
                                            className={cn("fill-none transition-all duration-1000", getScoreColor(analysis.matchScore).split(" ")[1])}
                                            strokeWidth="3.2"
                                            strokeDasharray={`${analysis.matchScore}, 100`}
                                            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                            initial={{ strokeDasharray: "0, 100" }}
                                            animate={{ strokeDasharray: `${analysis.matchScore}, 100` }}
                                            transition={{ duration: 1.2, ease: "easeOut" }}
                                        />
                                    </svg>
                                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                                        <span className={cn("text-3xl font-heading font-black", getScoreColor(analysis.matchScore).split(" ")[0])}>
                                            {analysis.matchScore}%
                                        </span>
                                        <span className="text-[9px] uppercase tracking-wider font-bold text-muted-foreground">Match Score</span>
                                    </div>
                                </div>

                                <p className="text-xs text-muted-foreground mt-2 max-w-[200px]">
                                    Based on standard requirements compiled for <strong>{targetRole}</strong>.
                                </p>
                            </Card>

                            {/* Skills Comparison */}
                            <Card className="border border-[#102b2b]/15 bg-white shadow-none rounded-none md:col-span-2">
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-md font-bold">Skills Comparison</CardTitle>
                                    <CardDescription>How your current profile compares to industry requirements</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    {/* Matching */}
                                    <div className="space-y-2">
                                        <h4 className="text-xs font-black uppercase text-green-700 tracking-wider flex items-center gap-1.5">
                                            <CheckCircle2 className="h-4 w-4" />
                                            Matching Skills ({analysis.matchingSkills.length})
                                        </h4>
                                        <div className="flex flex-wrap gap-1.5">
                                            {analysis.matchingSkills.length === 0 ? (
                                                <span className="text-xs text-muted-foreground italic">No matching skills identified. Run a detailed audit.</span>
                                            ) : (
                                                analysis.matchingSkills.map((s, idx) => (
                                                    <Badge key={idx} variant="outline" className="border-green-200 bg-green-50/50 text-green-800 rounded-none px-2.5 py-1 text-xs">
                                                        {s}
                                                    </Badge>
                                                ))
                                            )}
                                        </div>
                                    </div>

                                    {/* Gaps */}
                                    <div className="grid gap-4 sm:grid-cols-2 border-t border-[#102b2b]/10 pt-4">
                                        {/* Missing Hard Skills */}
                                        <div className="space-y-2">
                                            <h4 className="text-xs font-black uppercase text-red-700 tracking-wider flex items-center gap-1.5">
                                                <AlertTriangle className="h-4 w-4" />
                                                Missing Hard Skills ({analysis.missingHardSkills.length})
                                            </h4>
                                            <div className="flex flex-wrap gap-1.5">
                                                {analysis.missingHardSkills.length === 0 ? (
                                                    <span className="text-xs text-muted-foreground italic">None missing!</span>
                                                ) : (
                                                    analysis.missingHardSkills.map((s, idx) => (
                                                        <Badge key={idx} variant="outline" className="border-red-200 bg-red-50/50 text-red-800 rounded-none px-2.5 py-1 text-xs">
                                                            {s}
                                                        </Badge>
                                                    ))
                                                )}
                                            </div>
                                        </div>

                                        {/* Missing Soft Skills */}
                                        <div className="space-y-2">
                                            <h4 className="text-xs font-black uppercase text-amber-700 tracking-wider flex items-center gap-1.5">
                                                <AlertTriangle className="h-4 w-4" />
                                                Missing Soft Skills ({analysis.missingSoftSkills.length})
                                            </h4>
                                            <div className="flex flex-wrap gap-1.5">
                                                {analysis.missingSoftSkills.length === 0 ? (
                                                    <span className="text-xs text-muted-foreground italic">None missing!</span>
                                                ) : (
                                                    analysis.missingSoftSkills.map((s, idx) => (
                                                        <Badge key={idx} variant="outline" className="border-amber-200 bg-amber-50/50 text-amber-800 rounded-none px-2.5 py-1 text-xs">
                                                            {s}
                                                        </Badge>
                                                    ))
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Action Roadmap & Credentials */}
                        <div className="grid gap-6 md:grid-cols-2">
                            {/* Bridge the Gap Roadmap */}
                            <Card className="border border-[#102b2b]/15 bg-white shadow-none rounded-none">
                                <CardHeader>
                                    <CardTitle className="text-md font-bold flex items-center gap-2">
                                        <Target className="h-4 w-4 text-[#0d8274]" />
                                        Bridge the Gap Action Steps
                                    </CardTitle>
                                    <CardDescription>Interactive roadmap checklist of actions to complete</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-3">
                                        {analysis.actionSteps.map((step, idx) => (
                                            <div 
                                                key={idx} 
                                                onClick={() => toggleStep(idx)}
                                                className={cn(
                                                    "flex items-start gap-3 p-3 border border-[#102b2b]/10 bg-white hover:bg-[#e9eee8]/35 transition-all cursor-pointer select-none",
                                                    checkedSteps[idx] && "bg-[#d8f36b]/10 border-[#0d8274]/35 opacity-70"
                                                )}
                                            >
                                                <div className={cn(
                                                    "h-5 w-5 shrink-0 border border-[#102b2b]/20 flex items-center justify-center transition-all mt-0.5",
                                                    checkedSteps[idx] ? "bg-[#102b2b] border-[#102b2b] text-[#d8f36b]" : "bg-white"
                                                )}>
                                                    {checkedSteps[idx] && <CheckCircle2 className="h-4 w-4" />}
                                                </div>
                                                <span className={cn("text-xs leading-5 text-[#102b2b]", checkedSteps[idx] && "line-through text-[#102b2b]/50")}>
                                                    {step}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Recommended Certifications */}
                            <Card className="border border-[#102b2b]/15 bg-white shadow-none rounded-none">
                                <CardHeader>
                                    <CardTitle className="text-md font-bold flex items-center gap-2">
                                        <Trophy className="h-4 w-4 text-[#0d8274]" />
                                        Recommended Certifications
                                    </CardTitle>
                                    <CardDescription>Credentials that will significantly boost your profile relevance</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        {analysis.recommendedCertifications.length === 0 ? (
                                            <div className="text-xs text-muted-foreground italic p-4 text-center border border-dashed border-[#102b2b]/10">
                                                No certifications recommended at this time.
                                            </div>
                                        ) : (
                                            analysis.recommendedCertifications.map((cert, idx) => (
                                                <div key={idx} className="border border-[#102b2b]/10 p-3 bg-[#f5f7f2]/40 hover:bg-[#f5f7f2] transition-colors space-y-2">
                                                    <div className="flex items-center justify-between flex-wrap gap-1">
                                                        <span className="font-bold text-xs text-[#102b2b]">{cert.name}</span>
                                                        <Badge className="bg-[#102b2b] text-[#d8f36b] rounded-none text-[9px] font-black uppercase tracking-wider">
                                                            {cert.provider}
                                                        </Badge>
                                                    </div>
                                                    <p className="text-[11px] text-[#102b2b]/70 leading-relaxed">
                                                        {cert.relevance}
                                                    </p>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
