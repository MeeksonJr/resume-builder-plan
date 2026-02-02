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
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
    Loader2,
    Zap,
    Check,
    X,
    ChevronRight,
    TrendingUp,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface BulkOptimizeResult {
    optimizedResume: any;
    changes: {
        section: string;
        original: string;
        optimized: string;
        reason: string;
    }[];
    overallImprovements: string[];
    scoreImprovement: { before: number; after: number };
}

interface BulkOptimizeDialogProps {
    resumeData: any;
    onApply: (optimizedResume: any) => void;
}

type FocusArea = "impact" | "keywords" | "clarity" | "ats" | "brevity";

export function BulkOptimizeDialog({
    resumeData,
    onApply,
}: BulkOptimizeDialogProps) {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<BulkOptimizeResult | null>(null);
    const [error, setError] = useState<string | null>(null);

    // Configuration
    const [targetRole, setTargetRole] = useState("");
    const [jobDescription, setJobDescription] = useState("");
    const [focusAreas, setFocusAreas] = useState<FocusArea[]>(["impact", "keywords", "ats"]);

    // Review
    const [selectedChanges, setSelectedChanges] = useState<number[]>([]);

    const focusOptions: { id: FocusArea; label: string; description: string }[] = [
        { id: "impact", label: "Impact Enhancement", description: "Stronger verbs, quantifiable achievements" },
        { id: "keywords", label: "Keyword Optimization", description: "Industry-relevant keywords" },
        { id: "clarity", label: "Clarity", description: "Remove filler, improve readability" },
        { id: "ats", label: "ATS Compatibility", description: "Optimize for applicant tracking systems" },
        { id: "brevity", label: "Brevity", description: "Trim verbose content" },
    ];

    const toggleFocusArea = (area: FocusArea) => {
        setFocusAreas((prev) =>
            prev.includes(area) ? prev.filter((a) => a !== area) : [...prev, area]
        );
    };

    const handleOptimize = async () => {
        setLoading(true);
        setError(null);

        try {
            const response = await fetch("/api/ai/bulk-optimize", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    resumeData,
                    targetRole: targetRole || undefined,
                    jobDescription: jobDescription || undefined,
                    focusAreas,
                }),
            });

            if (!response.ok) {
                throw new Error("Failed to optimize resume");
            }

            const data = await response.json();
            setResult(data);
            // Select all changes by default
            setSelectedChanges(data.changes.map((_: any, i: number) => i));
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleApply = () => {
        if (result) {
            onApply(result.optimizedResume);
            setOpen(false);
            setResult(null);
        }
    };

    const toggleChange = (index: number) => {
        setSelectedChanges((prev) =>
            prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
        );
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" className="gap-2">
                    <Zap className="h-4 w-4 text-yellow-500" />
                    Bulk Optimize
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Zap className="h-5 w-5 text-yellow-500" />
                        Bulk Resume Optimization
                    </DialogTitle>
                    <DialogDescription>
                        Optimize your entire resume at once with AI-powered improvements.
                    </DialogDescription>
                </DialogHeader>

                <ScrollArea className="max-h-[60vh]">
                    <div className="py-4 space-y-6 pr-4">
                        {!result ? (
                            <>
                                {/* Target Role */}
                                <div className="space-y-2">
                                    <Label htmlFor="targetRole">Target Role (Optional)</Label>
                                    <Input
                                        id="targetRole"
                                        placeholder="e.g., Senior Software Engineer"
                                        value={targetRole}
                                        onChange={(e) => setTargetRole(e.target.value)}
                                    />
                                </div>

                                {/* Job Description */}
                                <div className="space-y-2">
                                    <Label htmlFor="jobDesc">Job Description (Optional)</Label>
                                    <Textarea
                                        id="jobDesc"
                                        placeholder="Paste a job description for targeted optimization..."
                                        value={jobDescription}
                                        onChange={(e) => setJobDescription(e.target.value)}
                                        className="min-h-[100px]"
                                    />
                                </div>

                                {/* Focus Areas */}
                                <div className="space-y-3">
                                    <Label>Focus Areas</Label>
                                    <div className="grid gap-2">
                                        {focusOptions.map((option) => (
                                            <div
                                                key={option.id}
                                                className={cn(
                                                    "flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors",
                                                    focusAreas.includes(option.id)
                                                        ? "bg-purple-50 border-purple-300"
                                                        : "hover:bg-muted/50"
                                                )}
                                                onClick={() => toggleFocusArea(option.id)}
                                            >
                                                <Checkbox
                                                    checked={focusAreas.includes(option.id)}
                                                    className="mt-0.5"
                                                />
                                                <div>
                                                    <p className="text-sm font-medium">{option.label}</p>
                                                    <p className="text-xs text-muted-foreground">
                                                        {option.description}
                                                    </p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {error && <p className="text-sm text-red-500">{error}</p>}
                            </>
                        ) : (
                            <div className="space-y-6">
                                {/* Score Improvement */}
                                <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-lg border border-green-200">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-sm font-medium">Estimated Score Improvement</span>
                                        <TrendingUp className="h-5 w-5 text-green-600" />
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <div className="text-center">
                                            <span className="text-2xl font-bold text-gray-500">
                                                {result.scoreImprovement.before}
                                            </span>
                                            <p className="text-xs text-muted-foreground">Before</p>
                                        </div>
                                        <ChevronRight className="h-5 w-5 text-gray-400" />
                                        <div className="text-center">
                                            <span className="text-2xl font-bold text-green-600">
                                                {result.scoreImprovement.after}
                                            </span>
                                            <p className="text-xs text-muted-foreground">After</p>
                                        </div>
                                        <div className="flex-1">
                                            <Progress
                                                value={result.scoreImprovement.after}
                                                className="h-3"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Overall Improvements */}
                                <div>
                                    <h4 className="font-medium text-sm mb-2">Key Improvements</h4>
                                    <div className="flex flex-wrap gap-2">
                                        {result.overallImprovements.map((imp, i) => (
                                            <Badge key={i} variant="secondary">
                                                {imp}
                                            </Badge>
                                        ))}
                                    </div>
                                </div>

                                {/* Changes List */}
                                <div>
                                    <div className="flex items-center justify-between mb-2">
                                        <h4 className="font-medium text-sm">
                                            Changes ({selectedChanges.length}/{result.changes.length} selected)
                                        </h4>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() =>
                                                setSelectedChanges(
                                                    selectedChanges.length === result.changes.length
                                                        ? []
                                                        : result.changes.map((_, i) => i)
                                                )
                                            }
                                        >
                                            {selectedChanges.length === result.changes.length
                                                ? "Deselect All"
                                                : "Select All"}
                                        </Button>
                                    </div>
                                    <div className="space-y-3">
                                        {result.changes.map((change, i) => (
                                            <div
                                                key={i}
                                                className={cn(
                                                    "p-3 rounded-lg border cursor-pointer transition-colors",
                                                    selectedChanges.includes(i)
                                                        ? "bg-green-50 border-green-200"
                                                        : "bg-muted/30"
                                                )}
                                                onClick={() => toggleChange(i)}
                                            >
                                                <div className="flex items-start gap-2">
                                                    <Checkbox
                                                        checked={selectedChanges.includes(i)}
                                                        className="mt-1"
                                                    />
                                                    <div className="flex-1 min-w-0">
                                                        <Badge variant="outline" className="mb-2">
                                                            {change.section}
                                                        </Badge>
                                                        <div className="grid gap-2 text-sm">
                                                            <div className="flex items-start gap-2">
                                                                <X className="h-4 w-4 text-red-500 flex-shrink-0" />
                                                                <span className="text-muted-foreground line-through">
                                                                    {change.original.slice(0, 100)}
                                                                    {change.original.length > 100 ? "..." : ""}
                                                                </span>
                                                            </div>
                                                            <div className="flex items-start gap-2">
                                                                <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
                                                                <span>
                                                                    {change.optimized.slice(0, 100)}
                                                                    {change.optimized.length > 100 ? "..." : ""}
                                                                </span>
                                                            </div>
                                                        </div>
                                                        <p className="text-xs text-muted-foreground mt-2">
                                                            {change.reason}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </ScrollArea>

                <DialogFooter>
                    {!result ? (
                        <Button
                            onClick={handleOptimize}
                            disabled={loading || focusAreas.length === 0}
                            className="gap-2"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    Optimizing...
                                </>
                            ) : (
                                <>
                                    <Zap className="h-4 w-4" />
                                    Optimize Resume
                                </>
                            )}
                        </Button>
                    ) : (
                        <>
                            <Button variant="outline" onClick={() => setResult(null)}>
                                Re-configure
                            </Button>
                            <Button
                                onClick={handleApply}
                                disabled={selectedChanges.length === 0}
                                className="gap-2"
                            >
                                <Check className="h-4 w-4" />
                                Apply {selectedChanges.length} Changes
                            </Button>
                        </>
                    )}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
