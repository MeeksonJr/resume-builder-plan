"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sparkles, X, Loader2, Check, RefreshCw, Plus, ClipboardCopy, ArrowUpRight, ChevronDown, Target, Zap, Palette, Building2, Lock } from "lucide-react";
import { useResumeStore, WorkExperience } from "@/lib/stores/resume-store";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { JobMatchCard, BulkOptimizeDialog, ToneSelector, IndustrySelector } from "@/components/editor/ai";
import { useSubscriptionStore } from "@/lib/stores/subscription-store";
import { useRouter } from "next/navigation";

interface AIAssistantProps {
    onClose: () => void;
}

export function AIAssistant({ onClose }: AIAssistantProps) {
    const router = useRouter();
    const { isPro } = useSubscriptionStore();
    const [isLoading, setIsLoading] = useState(false);
    const [mode, setMode] = useState<"menu" | "tailor" | "results" | "improve" | "ats" | "keywords" | "job-match" | "tone" | "industry">("menu");
    const [jobDescription, setJobDescription] = useState("");
    const [textToImprove, setTextToImprove] = useState("");
    const [improvedText, setImprovedText] = useState("");
    const [tailoringResults, setTailoringResults] = useState<{
        suggestions: string[];
        keywordsToAdd: string[];
        improvedSummary: string;
    } | null>(null);
    const [keywordResults, setKeywordResults] = useState<{
        found: string[];
        missing: string[];
        relevance: number;
    } | null>(null);
    const [atsResults, setAtsResults] = useState<{
        score: number;
        breakdown: { category: string; score: number; feedback: string[] }[];
        missingKeywords: string[];
        overallFeedback: string;
    } | null>(null);

    const {
        profile,
        workExperiences,
        education,
        skills,
        projects,
        certifications,
        languages,
        updateProfile,
        addSkill,
        addWorkExperience,
        updateWorkExperience,
        addEducation,
        updateEducation,
        addProject,
        updateProject
    } = useResumeStore();

    const handleApplySkill = (skillName: string) => {
        const existingSkills = new Set(skills.map(s => s.name.toLowerCase()));
        if (!existingSkills.has(skillName.toLowerCase())) {
            addSkill({
                name: skillName,
                category: "Suggested",
                proficiency_level: 3
            });
            toast.success(`Added "${skillName}" to skills`);
        } else {
            toast.info(`"${skillName}" is already in your skills`);
        }
    };

    const handleApplyToExperience = (expId: string, text: string) => {
        const exp = workExperiences.find(w => w.id === expId);
        if (exp) {
            // Append as a new highlight or replace description? 
            // Let's offer a choice or default to appending to highlights if it's a short text
            const newHighlights = [...exp.highlights, text];
            updateWorkExperience(expId, { highlights: newHighlights });
            toast.success("Added to experience highlights");
        }
    };

    const handleReplaceSummary = (text: string) => {
        updateProfile({ summary: text });
        toast.success("Summary updated");
    };

    // Construct resume data object for API
    const getResumeData = () => ({
        personalInfo: {
            fullName: profile?.full_name || undefined,
            email: profile?.email || undefined,
            phone: profile?.phone || undefined,
            location: profile?.location || undefined,
            linkedin: profile?.linkedin_url || undefined,
            website: profile?.website_url || undefined,
            github: profile?.github_url || undefined,
            summary: profile?.summary || undefined,
        },
        workExperience: workExperiences.map(w => ({
            company: w.company,
            position: w.position,
            location: w.location || undefined,
            startDate: w.start_date || undefined,
            endDate: w.end_date || undefined,
            current: w.is_current,
            description: w.description || undefined,
            highlights: w.highlights
        })),
        education: education.map(e => ({
            institution: e.institution,
            degree: e.degree || undefined,
            field: e.field_of_study || undefined,
            location: e.location || undefined,
            startDate: e.start_date || undefined,
            endDate: e.end_date || undefined,
            gpa: e.gpa || undefined,
            highlights: e.highlights
        })),
        skills: skills.map(s => ({
            category: s.category || undefined,
            items: s.name.split(',').map(i => i.trim()) // Simplified for now, assuming name might be single skill
        })),
        projects: projects.map(p => ({
            name: p.name,
            description: p.description || undefined,
            technologies: p.technologies,
            url: p.url || undefined,
            highlights: p.highlights
        })),
        certifications: certifications.map(c => ({
            name: c.name,
            issuer: c.issuer || undefined,
            date: c.issue_date || undefined
        })),
        languages: languages.map(l => ({
            language: l.language,
            proficiency: l.proficiency
        }))
    });

    const handleGenerateSummary = async () => {
        setIsLoading(true);
        try {
            const resumeData = getResumeData();
            // Create a context string from experience
            const context = `Experience: ${resumeData.workExperience.map(w => `${w.position} at ${w.company}`).join(', ')}. Skills: ${skills.map(s => s.name).join(', ')}`;

            const response = await fetch("/api/ai/improve", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    text: profile?.summary || "Professional Summary", // Fallback if empty, AI will generate from context
                    type: "summary",
                    context
                })
            });

            if (!response.ok) throw new Error("Failed to generate summary");

            const { improved } = await response.json();
            updateProfile({ summary: improved });
            toast.success("Summary generated and updated!");
        } catch (error) {
            console.error(error);
            toast.error("Failed to generate summary");
        } finally {
            setIsLoading(false);
        }
    };

    const handleTailor = async () => {
        if (!jobDescription.trim()) {
            toast.error("Please enter a job description");
            return;
        }

        setIsLoading(true);
        try {
            const resumeData = getResumeData();
            const response = await fetch("/api/ai/tailor", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    resumeData,
                    jobDescription
                })
            });

            if (!response.ok) throw new Error("Failed to tailor resume");

            const result = await response.json();
            setTailoringResults(result);
            setMode("results");
        } catch (error) {
            console.error(error);
            toast.error("Failed to analyze resume");
        } finally {
            setIsLoading(false);
        }
    };

    const applyTailoring = () => {
        if (!tailoringResults) return;

        // Update summary
        if (tailoringResults.improvedSummary) {
            updateProfile({ summary: tailoringResults.improvedSummary });
        }

        // Add keywords as skills (simple implementation)
        if (tailoringResults.keywordsToAdd.length > 0) {
            // Check if skill already exists to avoid duplicates (basic check)
            const existingSkills = new Set(skills.map(s => s.name.toLowerCase()));
            tailoringResults.keywordsToAdd.forEach(keyword => {
                if (!existingSkills.has(keyword.toLowerCase())) {
                    addSkill({
                        name: keyword,
                        category: "Suggested",
                        proficiency_level: 3 // Default
                    });
                }
            });
        }

        toast.success("Applied suggestions to your resume!");
        onClose();
    };

    const handleImproveText = async () => {
        if (!textToImprove.trim()) return;

        setIsLoading(true);
        try {
            const response = await fetch("/api/ai/improve", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    text: textToImprove,
                    type: "description" // generic improvement
                })
            });

            if (!response.ok) throw new Error("Failed to improve text");

            const { improved } = await response.json();
            setImprovedText(improved);
        } catch (error) {
            console.error(error);
            toast.error("Failed to improve text");
        } finally {
            setIsLoading(false);
        }
    };

    const handleCheckATS = async () => {
        setIsLoading(true);
        try {
            const resumeData = getResumeData();
            const response = await fetch("/api/ai/ats-score", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    resumeData,
                    jobDescription: jobDescription.trim() || undefined
                })
            });

            if (!response.ok) throw new Error("Failed to calculate ATS score");

            const result = await response.json();
            setAtsResults(result);
        } catch (error) {
            console.error(error);
            toast.error("Failed to calculate ATS score");
        } finally {
            setIsLoading(false);
        }
    };

    const handleCheckKeywords = async () => {
        if (!jobDescription.trim()) {
            toast.error("Please enter a job description");
            return;
        }
        setIsLoading(true);
        try {
            const resumeData = getResumeData();
            const response = await fetch("/api/ai/keywords", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    resumeData,
                    jobDescription
                })
            });

            if (!response.ok) throw new Error("Failed to analyze keywords");

            const result = await response.json();
            setKeywordResults(result);
            setMode("keywords");
        } catch (error) {
            console.error(error);
            toast.error("Failed to analyze keywords");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Card className="h-full border-none rounded-none flex flex-col w-[400px] bg-[#f8f4ec] text-[#102b2b]">
            <CardHeader className="bg-[#e9eee8] border-b border-[#102b2b]/10 py-4">
                <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm font-black uppercase tracking-tight text-[#102b2b]">
                        <div className="flex h-7 w-7 items-center justify-center bg-[#d8f36b] text-[#102b2b]">
                            <Sparkles className="h-4 w-4" />
                        </div>
                        AI Copilot
                    </div>
                    <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8 text-[#52716a] hover:text-[#102b2b] hover:bg-[#102b2b]/5 rounded-none">
                        <X className="h-4 w-4" />
                    </Button>
                </CardTitle>
                <CardDescription className="text-xs text-[#52716a] font-semibold mt-1">
                    {mode === "menu" && "Intelligent suggestions to upgrade your resume"}
                    {mode === "tailor" && "Paste job details to tailor achievements"}
                    {mode === "results" && "Tailoring analysis results"}
                    {mode === "improve" && "Rewrite and polish resume bullet points"}
                    {mode === "keywords" && "ATS Keyword Optimizer"}
                    {mode === "job-match" && "Analyze compatibility with target job"}
                    {mode === "tone" && "Transform communication tone"}
                    {mode === "industry" && "Align vocabulary with specific industry"}
                </CardDescription>
            </CardHeader>
            <CardContent className="flex-1 overflow-hidden flex flex-col gap-4 p-5 bg-white/60">
                {mode === "menu" && (
                    <div className="space-y-4">
                        <div className="bg-muted p-4 rounded-lg text-sm">
                            <p>
                                👋 Hi! I can help you write better bullet points, generate a summary,
                                analyze your resume for ATS compatibility, or tailor it for a specific job.
                            </p>
                        </div>

                        <div className="space-y-2">
                            <Button
                                variant="outline"
                                className="w-full justify-start"
                                onClick={() => setMode("improve")}
                            >
                                <Sparkles className="mr-2 h-4 w-4" />
                                Improve Text
                            </Button>
                            <Button
                                variant="outline"
                                className="w-full justify-start"
                                onClick={handleGenerateSummary}
                                disabled={isLoading}
                            >
                                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
                                Generate Summary
                            </Button>
                            <Button
                                variant="outline"
                                className="w-full justify-start"
                                onClick={() => setMode("ats")}
                            >
                                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
                                Check ATS Score
                            </Button>
                            <Button
                                variant="outline"
                                className="w-full justify-start"
                                onClick={() => setMode("tailor")}
                            >
                                <Sparkles className="mr-2 h-4 w-4" />
                                Tailor to Job Description
                            </Button>
                            <Button
                                variant="outline"
                                className="w-full justify-start"
                                onClick={() => setMode("keywords")}
                            >
                                <Sparkles className="mr-2 h-4 w-4" />
                                Keyword Matcher
                            </Button>

                            {/* Phase 35: AI Power-ups */}
                            <div className="border-t pt-2 mt-2">
                                <p className="text-xs text-muted-foreground mb-2 font-medium">AI Power-ups</p>
                            </div>
                            <Button
                                variant="outline"
                                className="w-full justify-start relative group"
                                onClick={() => {
                                    if (!isPro) {
                                        toast.error("Upgrade to Pro to use Job Match Score!");
                                        router.push("/dashboard/subscription");
                                        return;
                                    }
                                    setMode("job-match");
                                }}
                            >
                                <Target className="mr-2 h-4 w-4 text-blue-500" />
                                <span>Job Match Score</span>
                                {!isPro && <Lock className="ml-auto h-3 w-3 text-muted-foreground opacity-70 group-hover:opacity-100" />}
                            </Button>
                            <Button
                                variant="outline"
                                className="w-full justify-start relative group"
                                onClick={() => {
                                    if (!isPro) {
                                        toast.error("Upgrade to Pro to use Tone Adjustment!");
                                        router.push("/dashboard/subscription");
                                        return;
                                    }
                                    setMode("tone");
                                }}
                            >
                                <Palette className="mr-2 h-4 w-4 text-purple-500" />
                                <span>Tone Adjustment</span>
                                {!isPro && <Lock className="ml-auto h-3 w-3 text-muted-foreground opacity-70 group-hover:opacity-100" />}
                            </Button>
                            <Button
                                variant="outline"
                                className="w-full justify-start relative group"
                                onClick={() => {
                                    if (!isPro) {
                                        toast.error("Upgrade to Pro to use Industry Customize!");
                                        router.push("/dashboard/subscription");
                                        return;
                                    }
                                    setMode("industry");
                                }}
                            >
                                <Building2 className="mr-2 h-4 w-4 text-green-500" />
                                <span>Industry Customize</span>
                                {!isPro && <Lock className="ml-auto h-3 w-3 text-muted-foreground opacity-70 group-hover:opacity-100" />}
                            </Button>
                        </div>
                    </div>
                )}

                {mode === "improve" && (
                    <div className="flex flex-col h-full gap-4">
                        <Textarea
                            placeholder="Paste text to improve here..."
                            className="flex-1 min-h-[150px]"
                            value={textToImprove}
                            onChange={(e) => setTextToImprove(e.target.value)}
                        />
                        {improvedText && (
                            <div className="bg-muted p-3 rounded-md relative group">
                                <h4 className="text-xs font-semibold mb-1 text-green-600 flex items-center gap-1">
                                    <Sparkles className="h-3 w-3" /> Improved Result
                                </h4>
                                <p className="text-sm">{improvedText}</p>
                                <Button
                                    size="sm"
                                    variant="ghost"
                                    className="absolute top-2 right-2 h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                                    onClick={() => {
                                        navigator.clipboard.writeText(improvedText);
                                        toast.success("Copied to clipboard");
                                    }}
                                >
                                    <ClipboardCopy className="h-3 w-3" />
                                </Button>
                                <div className="absolute top-2 right-10 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button size="sm" variant="ghost" className="h-6 px-2 text-xs gap-1">
                                                Apply <ChevronDown className="h-3 w-3" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuLabel>Apply to Section</DropdownMenuLabel>
                                            <DropdownMenuSeparator />
                                            <DropdownMenuItem onClick={() => handleReplaceSummary(improvedText)}>
                                                Replace Summary
                                            </DropdownMenuItem>
                                            <DropdownMenuSeparator />
                                            <DropdownMenuLabel className="text-[10px] uppercase text-muted-foreground">Work Experience</DropdownMenuLabel>
                                            {workExperiences.map(exp => (
                                                <DropdownMenuItem
                                                    key={exp.id}
                                                    onClick={() => handleApplyToExperience(exp.id, improvedText)}
                                                >
                                                    Add to {exp.company}
                                                </DropdownMenuItem>
                                            ))}
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>
                            </div>
                        )}
                        <div className="flex gap-2">
                            <Button variant="outline" onClick={() => { setMode("menu"); setImprovedText(""); }} className="flex-1">
                                Back
                            </Button>
                            <Button onClick={handleImproveText} disabled={isLoading || !textToImprove} className="flex-1">
                                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Improve"}
                            </Button>
                        </div>
                    </div>
                )}

                {mode === "tailor" && (
                    <div className="flex flex-col h-full gap-4">
                        <Textarea
                            placeholder="Paste job description here..."
                            className="flex-1 min-h-[200px]"
                            value={jobDescription}
                            onChange={(e) => setJobDescription(e.target.value)}
                        />
                        <div className="flex gap-2">
                            <Button variant="outline" onClick={() => setMode("menu")} className="flex-1">
                                Back
                            </Button>
                            <Button onClick={handleTailor} disabled={isLoading || !jobDescription} className="flex-1">
                                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Analyze"}
                            </Button>
                        </div>
                    </div>
                )}

                {mode === "keywords" && !keywordResults && (
                    <div className="flex flex-col h-full gap-4">
                        <div className="bg-muted p-4 rounded-lg text-sm">
                            <p>
                                Compare your resume against a job description to see which keywords you're missing.
                            </p>
                        </div>
                        <Textarea
                            placeholder="Paste job description here..."
                            className="flex-1 min-h-[200px]"
                            value={jobDescription}
                            onChange={(e) => setJobDescription(e.target.value)}
                        />
                        <div className="flex gap-2">
                            <Button variant="outline" onClick={() => setMode("menu")} className="flex-1">
                                Back
                            </Button>
                            <Button onClick={handleCheckKeywords} disabled={isLoading || !jobDescription} className="flex-1">
                                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Match Keywords"}
                            </Button>
                        </div>
                    </div>
                )}

                {mode === "keywords" && keywordResults && (
                    <div className="flex flex-col h-full gap-4 overflow-hidden">
                        <ScrollArea className="flex-1 pr-4">
                            <div className="space-y-6">
                                <div className="text-center py-4">
                                    <div className="text-3xl font-bold text-primary">{keywordResults.relevance}%</div>
                                    <p className="text-sm text-muted-foreground mt-1">Keyword Match Score</p>
                                </div>

                                <div>
                                    <h4 className="font-semibold mb-2 flex items-center gap-2">
                                        <Check className="h-4 w-4 text-green-500" />
                                        Found Keywords ({keywordResults.found.length})
                                    </h4>
                                    <div className="flex flex-wrap gap-2">
                                        {keywordResults.found.map((k, i) => (
                                            <span key={i} className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full dark:bg-green-900/30 dark:text-green-300">
                                                {k}
                                            </span>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <h4 className="font-semibold mb-2 flex items-center gap-2 text-red-600">
                                        <X className="h-4 w-4" />
                                        Missing Keywords ({keywordResults.missing.length})
                                    </h4>
                                    <div className="flex flex-wrap gap-2">
                                        {keywordResults.missing.map((k, i) => (
                                            <Badge
                                                key={i}
                                                variant="outline"
                                                className="pr-1 py-1 gap-1 border-red-200 bg-red-50 text-red-700 dark:bg-red-900/10 dark:text-red-400 group/badge"
                                            >
                                                {k}
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-4 w-4 p-0 hover:bg-red-200 dark:hover:bg-red-800 rounded-full"
                                                    onClick={() => handleApplySkill(k)}
                                                >
                                                    <Plus className="h-2 w-2" />
                                                </Button>
                                            </Badge>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </ScrollArea>
                        <div className="flex gap-2 pt-2 border-t">
                            <Button variant="outline" onClick={() => { setMode("menu"); setKeywordResults(null); }} className="flex-1">
                                Back to Menu
                            </Button>
                        </div>
                    </div>
                )}

                {mode === "ats" && !atsResults && (
                    <div className="flex flex-col h-full gap-4">
                        <div className="bg-muted p-4 rounded-lg text-sm">
                            <p>
                                Check how well your resume is optimized for Applicant Tracking Systems.
                                We'll analyze content, keywords, and formatting.
                            </p>
                        </div>
                        <Textarea
                            placeholder="Optional: Paste job description for targeted analysis..."
                            className="flex-1 min-h-[150px]"
                            value={jobDescription}
                            onChange={(e) => setJobDescription(e.target.value)}
                        />
                        <div className="flex gap-2">
                            <Button variant="outline" onClick={() => setMode("menu")} className="flex-1">
                                Back
                            </Button>
                            <Button onClick={handleCheckATS} disabled={isLoading} className="flex-1">
                                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Calculate Score"}
                            </Button>
                        </div>
                    </div>
                )}

                {mode === "ats" && atsResults && (
                    <div className="flex flex-col h-full gap-4 overflow-hidden">
                        <ScrollArea className="flex-1 pr-4">
                            <div className="space-y-6">
                                <div className="text-center py-4">
                                    <div className="inline-flex items-center justify-center w-24 h-24 rounded-full border-4 border-primary/20 relative">
                                        <div className="text-2xl font-bold">{atsResults.score}</div>
                                        <div className="text-xs text-muted-foreground absolute bottom-4">/100</div>
                                    </div>
                                    <h3 className="text-sm font-medium mt-2 text-muted-foreground">Overall Score</h3>
                                </div>

                                <div>
                                    <h4 className="font-semibold mb-2">Breakdown</h4>
                                    <div className="space-y-3">
                                        {atsResults.breakdown.map((item, i) => (
                                            <div key={i} className="text-sm">
                                                <div className="flex justify-between mb-1">
                                                    <span>{item.category}</span>
                                                    <span>{item.score}/100</span>
                                                </div>
                                                <div className="w-full bg-muted rounded-full h-2 mb-2">
                                                    <div
                                                        className="bg-primary h-2 rounded-full"
                                                        style={{ width: `${item.score}%` }}
                                                    />
                                                </div>
                                                <ul className="list-disc pl-4 text-xs text-muted-foreground">
                                                    {item.feedback.map((fb, j) => (
                                                        <li key={j}>{fb}</li>
                                                    ))}
                                                </ul>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <h4 className="font-semibold mb-2">Summary</h4>
                                    <p className="text-sm text-muted-foreground">{atsResults.overallFeedback}</p>
                                </div>

                                {atsResults.missingKeywords.length > 0 && (
                                    <div>
                                        <h4 className="font-semibold mb-2">Missing Keywords</h4>
                                        <div className="flex flex-wrap gap-2">
                                            {atsResults.missingKeywords.map((keyword, i) => (
                                                <Badge
                                                    key={i}
                                                    variant="outline"
                                                    className="pr-1 py-1 gap-1 border-red-200 bg-red-50 text-red-700 dark:bg-red-900/10 dark:text-red-400"
                                                >
                                                    {keyword}
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-4 w-4 p-0 hover:bg-red-200 dark:hover:bg-red-800 rounded-full"
                                                        onClick={() => handleApplySkill(keyword)}
                                                    >
                                                        <Plus className="h-2 w-2" />
                                                    </Button>
                                                </Badge>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </ScrollArea>
                        <div className="flex gap-2 pt-2 border-t">
                            <Button variant="outline" onClick={() => { setMode("menu"); setAtsResults(null); }} className="flex-1">
                                Back to Menu
                            </Button>
                        </div>
                    </div>
                )}

                {mode === "results" && tailoringResults && (
                    <div className="flex flex-col h-full gap-4 overflow-hidden">
                        <ScrollArea className="flex-1 pr-4">
                            <div className="space-y-6">
                                <div>
                                    <h4 className="font-semibold mb-2 flex items-center gap-2">
                                        <Check className="h-4 w-4 text-green-500" />
                                        Improved Summary
                                    </h4>
                                    <div className="text-sm bg-muted p-3 rounded-md relative group">
                                        {tailoringResults.improvedSummary}
                                        <Button
                                            size="sm"
                                            variant="ghost"
                                            className="absolute top-2 right-2 h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                                            onClick={() => handleReplaceSummary(tailoringResults!.improvedSummary)}
                                            title="Apply to Summary"
                                        >
                                            <Check className="h-3 w-3 text-green-600" />
                                        </Button>
                                    </div>
                                </div>

                                <div>
                                    <h4 className="font-semibold mb-2">Missing Keywords</h4>
                                    <div className="flex flex-wrap gap-2">
                                        {tailoringResults.keywordsToAdd.map((keyword, i) => (
                                            <Badge
                                                key={i}
                                                variant="outline"
                                                className="pr-1 py-1 gap-1 border-purple-200 bg-purple-50 text-purple-700 dark:bg-purple-900/10 dark:text-purple-400"
                                            >
                                                {keyword}
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-4 w-4 p-0 hover:bg-purple-200 dark:hover:bg-purple-800 rounded-full"
                                                    onClick={() => handleApplySkill(keyword)}
                                                >
                                                    <Plus className="h-2 w-2" />
                                                </Button>
                                            </Badge>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <h4 className="font-semibold mb-2">Suggestions</h4>
                                    <ul className="text-sm space-y-2 list-disc pl-4 text-muted-foreground">
                                        {tailoringResults.suggestions.map((suggestion, i) => (
                                            <li key={i}>{suggestion}</li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        </ScrollArea>
                        <div className="flex gap-2 pt-2 border-t">
                            <Button variant="outline" onClick={() => setMode("menu")} className="flex-1">
                                Back
                            </Button>
                            <Button onClick={applyTailoring} className="flex-1">
                                Apply Changes
                            </Button>
                        </div>
                    </div>
                )}

                {/* Phase 35: Job Match Mode */}
                {mode === "job-match" && (
                    <div className="flex flex-col h-full gap-4 overflow-hidden">
                        <ScrollArea className="flex-1">
                            <div className="pr-4">
                                <JobMatchCard
                                    resumeData={getResumeData()}
                                    onApplyRecommendation={(rec) => toast.info(rec)}
                                />
                            </div>
                        </ScrollArea>
                        <div className="pt-2 border-t">
                            <Button variant="outline" onClick={() => setMode("menu")} className="w-full">
                                Back to Menu
                            </Button>
                        </div>
                    </div>
                )}

                {/* Phase 35: Tone Adjustment Mode */}
                {mode === "tone" && (
                    <div className="flex flex-col h-full gap-4 overflow-hidden">
                        <ScrollArea className="flex-1">
                            <div className="pr-4">
                                <ToneSelector
                                    content={profile?.summary || ""}
                                    scope="selected"
                                    onApply={(content) => {
                                        if (typeof content === "string") {
                                            updateProfile({ summary: content });
                                            toast.success("Content updated with new tone");
                                        }
                                        setMode("menu");
                                    }}
                                />
                            </div>
                        </ScrollArea>
                        <div className="pt-2 border-t">
                            <Button variant="outline" onClick={() => setMode("menu")} className="w-full">
                                Back to Menu
                            </Button>
                        </div>
                    </div>
                )}

                {/* Phase 35: Industry Customization Mode */}
                {mode === "industry" && (
                    <div className="flex flex-col h-full gap-4 overflow-hidden">
                        <ScrollArea className="flex-1">
                            <div className="pr-4">
                                <IndustrySelector
                                    resumeData={getResumeData()}
                                    onApply={(customizedResume) => {
                                        // Apply the customized resume data
                                        let changesApplied = 0;
                                        const changeDetails: string[] = [];

                                        console.log("Applying customized resume:", customizedResume);

                                        // === SUMMARY ===
                                        if (customizedResume.personalInfo?.summary) {
                                            const newSummary = customizedResume.personalInfo.summary;
                                            const currentSummary = profile?.summary || "";
                                            if (newSummary !== currentSummary) {
                                                updateProfile({ summary: newSummary });
                                                changesApplied++;
                                                changeDetails.push("Summary");
                                            }
                                        }

                                        // === SKILLS ===
                                        // AI returns skills as [{category, items: string[]}]
                                        if (customizedResume.skills && Array.isArray(customizedResume.skills)) {
                                            const existingSkillNames = new Set(skills.map(s => s.name.toLowerCase()));
                                            let skillsAdded = 0;
                                            customizedResume.skills.forEach((skillGroup: any) => {
                                                const category = skillGroup.category || "Industry";
                                                const items = skillGroup.items || [];
                                                items.forEach((skillName: string) => {
                                                    if (skillName && !existingSkillNames.has(skillName.toLowerCase())) {
                                                        addSkill({
                                                            name: skillName,
                                                            category: category,
                                                            proficiency_level: 3
                                                        });
                                                        existingSkillNames.add(skillName.toLowerCase());
                                                        skillsAdded++;
                                                    }
                                                });
                                            });
                                            if (skillsAdded > 0) {
                                                changesApplied += skillsAdded;
                                                changeDetails.push(`${skillsAdded} skills`);
                                            }
                                        }

                                        // === WORK EXPERIENCE ===
                                        if (customizedResume.workExperience && Array.isArray(customizedResume.workExperience)) {
                                            let expChanges = 0;
                                            customizedResume.workExperience.forEach((exp: any, index: number) => {
                                                if (workExperiences[index]) {
                                                    // Update existing experience
                                                    const updates: any = {};
                                                    if (exp.highlights && Array.isArray(exp.highlights) && exp.highlights.length > 0) {
                                                        updates.highlights = exp.highlights;
                                                    }
                                                    if (exp.description && exp.description !== workExperiences[index].description) {
                                                        updates.description = exp.description;
                                                    }
                                                    if (Object.keys(updates).length > 0) {
                                                        updateWorkExperience(workExperiences[index].id, updates);
                                                        expChanges++;
                                                    }
                                                } else if (exp.company && exp.position) {
                                                    // Add new experience if it has required fields
                                                    addWorkExperience({
                                                        company: exp.company,
                                                        position: exp.position,
                                                        location: exp.location || null,
                                                        start_date: exp.startDate || null,
                                                        end_date: exp.endDate || null,
                                                        is_current: exp.isCurrent || false,
                                                        description: exp.description || null,
                                                        highlights: exp.highlights || []
                                                    });
                                                    expChanges++;
                                                }
                                            });
                                            if (expChanges > 0) {
                                                changesApplied += expChanges;
                                                changeDetails.push(`${expChanges} experience(s)`);
                                            }
                                        }

                                        // === EDUCATION ===
                                        if (customizedResume.education && Array.isArray(customizedResume.education)) {
                                            let eduChanges = 0;
                                            customizedResume.education.forEach((edu: any, index: number) => {
                                                if (education[index]) {
                                                    // Update existing education
                                                    const updates: any = {};
                                                    if (edu.highlights && Array.isArray(edu.highlights) && edu.highlights.length > 0) {
                                                        updates.highlights = edu.highlights;
                                                    }
                                                    if (Object.keys(updates).length > 0) {
                                                        updateEducation(education[index].id, updates);
                                                        eduChanges++;
                                                    }
                                                } else if (edu.institution) {
                                                    // Add new education if it has required fields
                                                    addEducation({
                                                        institution: edu.institution,
                                                        degree: edu.degree || null,
                                                        field_of_study: edu.fieldOfStudy || edu.field || null,
                                                        location: edu.location || null,
                                                        start_date: edu.startDate || null,
                                                        end_date: edu.endDate || null,
                                                        gpa: edu.gpa || null,
                                                        highlights: edu.highlights || []
                                                    });
                                                    eduChanges++;
                                                }
                                            });
                                            if (eduChanges > 0) {
                                                changesApplied += eduChanges;
                                                changeDetails.push(`${eduChanges} education(s)`);
                                            }
                                        }

                                        // === PROJECTS ===
                                        if (customizedResume.projects && Array.isArray(customizedResume.projects)) {
                                            let projChanges = 0;
                                            customizedResume.projects.forEach((proj: any, index: number) => {
                                                if (projects[index]) {
                                                    // Update existing project
                                                    const updates: any = {};
                                                    if (proj.highlights && Array.isArray(proj.highlights) && proj.highlights.length > 0) {
                                                        updates.highlights = proj.highlights;
                                                    }
                                                    if (proj.description && proj.description !== projects[index].description) {
                                                        updates.description = proj.description;
                                                    }
                                                    if (proj.technologies && Array.isArray(proj.technologies)) {
                                                        updates.technologies = proj.technologies;
                                                    }
                                                    if (Object.keys(updates).length > 0) {
                                                        updateProject(projects[index].id, updates);
                                                        projChanges++;
                                                    }
                                                } else if (proj.name || proj.title) {
                                                    // Add new project if it has required fields
                                                    addProject({
                                                        name: proj.name || proj.title,
                                                        description: proj.description || null,
                                                        technologies: proj.technologies || [],
                                                        url: proj.url || null,
                                                        highlights: proj.highlights || []
                                                    });
                                                    projChanges++;
                                                }
                                            });
                                            if (projChanges > 0) {
                                                changesApplied += projChanges;
                                                changeDetails.push(`${projChanges} project(s)`);
                                            }
                                        }

                                        console.log("Changes applied:", { changesApplied, changeDetails });

                                        if (changesApplied > 0) {
                                            toast.success(`Applied: ${changeDetails.join(", ")}`);
                                        } else {
                                            toast.info("No changes to apply - your resume already matches the AI suggestions.");
                                        }
                                        setMode("menu");
                                    }}
                                />
                            </div>
                        </ScrollArea>
                        <div className="pt-2 border-t">
                            <Button variant="outline" onClick={() => setMode("menu")} className="w-full">
                                Back to Menu
                            </Button>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
