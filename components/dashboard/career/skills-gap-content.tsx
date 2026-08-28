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
    ArrowRight
} from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface SkillsGapContentProps {
    profile: any;
    resumes: any[];
}

interface SkillsGapAnalysis {
    matchScore: number;
    matchingSkills: string[];
    missingHardSkills: string[];
    missingSoftSkills: string[];
    recommendedCertifications: { name: string; provider: string; relevance: string }[];
    actionSteps: string[];
}

export function SkillsGapContent({ profile, resumes }: SkillsGapContentProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [analysis, setAnalysis] = useState<SkillsGapAnalysis | null>(null);
    const [selectedResumeId, setSelectedResumeId] = useState(resumes[0]?.id || "");
    const [targetRole, setTargetRole] = useState(profile?.target_role || "");
    const [checkedSteps, setCheckedSteps] = useState<Record<number, boolean>>({});

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

            if (!response.ok) throw new Error("Failed to run skills gap analysis");

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

    return (
        <div className="space-y-6">
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
