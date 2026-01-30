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
import { Sparkles, X, Loader2, Check, RefreshCw } from "lucide-react";
import { useResumeStore } from "@/lib/stores/resume-store";
import { toast } from "sonner";

interface AIAssistantProps {
    onClose: () => void;
}

export function AIAssistant({ onClose }: AIAssistantProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [mode, setMode] = useState<"menu" | "tailor" | "results" | "improve">("menu");
    const [jobDescription, setJobDescription] = useState("");
    const [textToImprove, setTextToImprove] = useState("");
    const [improvedText, setImprovedText] = useState("");
    const [tailoringResults, setTailoringResults] = useState<{
        suggestions: string[];
        keywordsToAdd: string[];
        improvedSummary: string;
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
        addSkill
    } = useResumeStore();

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

    return (
        <Card className="h-full border-l rounded-none flex flex-col w-[400px]">
            <CardHeader>
                <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Sparkles className="h-5 w-5 text-purple-500" />
                        AI Assistant
                    </div>
                    <Button variant="ghost" size="icon" onClick={onClose}>
                        <X className="h-4 w-4" />
                    </Button>
                </CardTitle>
                <CardDescription>
                    {mode === "menu" && "Get intelligent suggestions to improve your resume"}
                    {mode === "tailor" && "Paste the job description to tailor your resume"}
                    {mode === "results" && "Analysis results"}
                    {mode === "improve" && "Improve any text for your resume"}
                </CardDescription>
            </CardHeader>
            <CardContent className="flex-1 overflow-hidden flex flex-col gap-4">
                {mode === "menu" && (
                    <div className="space-y-4">
                        <div className="bg-muted p-4 rounded-lg text-sm">
                            <p>
                                👋 Hi! I can help you write better bullet points, generate a summary, or
                                tailor your resume for a specific job description.
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
                                onClick={() => setMode("tailor")}
                            >
                                <Sparkles className="mr-2 h-4 w-4" />
                                Tailor to Job Description
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
                                    <Check className="h-3 w-3" />
                                </Button>
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

                {mode === "results" && tailoringResults && (
                    <div className="flex flex-col h-full gap-4 overflow-hidden">
                        <ScrollArea className="flex-1 pr-4">
                            <div className="space-y-6">
                                <div>
                                    <h4 className="font-semibold mb-2 flex items-center gap-2">
                                        <Check className="h-4 w-4 text-green-500" />
                                        Improved Summary
                                    </h4>
                                    <div className="text-sm bg-muted p-3 rounded-md">
                                        {tailoringResults.improvedSummary}
                                    </div>
                                </div>

                                <div>
                                    <h4 className="font-semibold mb-2">Missing Keywords</h4>
                                    <div className="flex flex-wrap gap-2">
                                        {tailoringResults.keywordsToAdd.map((keyword, i) => (
                                            <span key={i} className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full dark:bg-purple-900/30 dark:text-purple-300">
                                                {keyword}
                                            </span>
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
            </CardContent>
        </Card>
    );
}
