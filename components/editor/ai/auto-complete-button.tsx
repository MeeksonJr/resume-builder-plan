"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Loader2, Wand2, Check, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface AutoCompleteResult {
    generatedContent: any;
    confidence: number;
    notes: string[];
}

interface AutoCompleteButtonProps {
    sectionType: "summary" | "experience" | "education" | "project" | "skills";
    existingData: any;
    partialSectionData?: any;
    onApply: (content: any) => void;
    variant?: "default" | "ghost" | "outline";
    size?: "default" | "sm" | "icon";
}

export function AutoCompleteButton({
    sectionType,
    existingData,
    partialSectionData,
    onApply,
    variant = "ghost",
    size = "icon",
}: AutoCompleteButtonProps) {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<AutoCompleteResult | null>(null);
    const [error, setError] = useState<string | null>(null);

    const handleGenerate = async () => {
        setLoading(true);
        setError(null);

        try {
            const response = await fetch("/api/ai/auto-complete", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    sectionType,
                    existingData,
                    partialSectionData,
                }),
            });

            if (!response.ok) {
                throw new Error("Failed to generate content");
            }

            const data = await response.json();
            setResult(data);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleApply = () => {
        if (result) {
            onApply(result.generatedContent);
            setOpen(false);
            setResult(null);
        }
    };

    const getConfidenceColor = (confidence: number) => {
        if (confidence >= 80) return "bg-green-100 text-green-800";
        if (confidence >= 60) return "bg-yellow-100 text-yellow-800";
        return "bg-red-100 text-red-800";
    };

    const getSectionLabel = () => {
        const labels: Record<string, string> = {
            summary: "Professional Summary",
            experience: "Work Experience",
            education: "Education",
            project: "Project",
            skills: "Skills",
        };
        return labels[sectionType] || sectionType;
    };

    const renderContent = (content: any) => {
        if (sectionType === "summary") {
            return <p className="text-sm">{content.summary}</p>;
        }

        if (sectionType === "skills") {
            return (
                <div className="space-y-2">
                    {content.suggestedSkills?.map((category: any, i: number) => (
                        <div key={i}>
                            <p className="text-sm font-medium">{category.category}</p>
                            <div className="flex flex-wrap gap-1 mt-1">
                                {category.items.map((skill: string, j: number) => (
                                    <Badge key={j} variant="secondary">
                                        {skill}
                                    </Badge>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            );
        }

        return (
            <div className="space-y-2">
                {content.description && (
                    <p className="text-sm">{content.description}</p>
                )}
                {content.highlights && content.highlights.length > 0 && (
                    <ul className="space-y-1">
                        {content.highlights.map((h: string, i: number) => (
                            <li key={i} className="text-sm flex items-start gap-2">
                                <span className="text-muted-foreground">•</span>
                                {h}
                            </li>
                        ))}
                    </ul>
                )}
                {content.technologies && content.technologies.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                        {content.technologies.map((tech: string, i: number) => (
                            <Badge key={i} variant="outline">
                                {tech}
                            </Badge>
                        ))}
                    </div>
                )}
            </div>
        );
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button
                    variant={variant}
                    size={size}
                    className={cn(
                        size === "icon" && "h-8 w-8",
                        "text-purple-600 hover:text-purple-700 hover:bg-purple-50"
                    )}
                    title={`Auto-complete ${getSectionLabel()}`}
                >
                    <Wand2 className="h-4 w-4" />
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Wand2 className="h-5 w-5 text-purple-500" />
                        Auto-Complete {getSectionLabel()}
                    </DialogTitle>
                    <DialogDescription>
                        AI will generate content based on your existing resume data.
                    </DialogDescription>
                </DialogHeader>

                <div className="py-4">
                    {!result && !loading && !error && (
                        <div className="text-center py-8">
                            <Wand2 className="h-12 w-12 text-purple-200 mx-auto mb-4" />
                            <p className="text-sm text-muted-foreground mb-4">
                                Click generate to let AI create content for this section
                            </p>
                            <Button onClick={handleGenerate} className="gap-2">
                                <Wand2 className="h-4 w-4" />
                                Generate Content
                            </Button>
                        </div>
                    )}

                    {loading && (
                        <div className="text-center py-8">
                            <Loader2 className="h-8 w-8 animate-spin text-purple-500 mx-auto mb-4" />
                            <p className="text-sm text-muted-foreground">
                                Generating content...
                            </p>
                        </div>
                    )}

                    {error && (
                        <div className="text-center py-8">
                            <AlertCircle className="h-8 w-8 text-red-500 mx-auto mb-4" />
                            <p className="text-sm text-red-500 mb-4">{error}</p>
                            <Button onClick={handleGenerate} variant="outline">
                                Try Again
                            </Button>
                        </div>
                    )}

                    {result && (
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium">Generated Content</span>
                                <Badge className={getConfidenceColor(result.confidence)}>
                                    {result.confidence}% confidence
                                </Badge>
                            </div>

                            <div className="bg-muted/50 p-4 rounded-lg">
                                {renderContent(result.generatedContent)}
                            </div>

                            {result.notes.length > 0 && (
                                <div className="space-y-1">
                                    <p className="text-xs font-medium text-muted-foreground">Notes:</p>
                                    <ul className="text-xs text-muted-foreground space-y-0.5">
                                        {result.notes.map((note, i) => (
                                            <li key={i}>• {note}</li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {result && (
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setResult(null)}>
                            Regenerate
                        </Button>
                        <Button onClick={handleApply} className="gap-2">
                            <Check className="h-4 w-4" />
                            Apply Content
                        </Button>
                    </DialogFooter>
                )}
            </DialogContent>
        </Dialog>
    );
}
