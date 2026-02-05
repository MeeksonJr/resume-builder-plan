"use client";

import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, CheckCircle2, Copy, Sparkles, ArrowRight } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface Suggestion {
    section: string;
    original: string;
    improved: string;
    reason: string;
}

interface TailoringResult {
    score: number;
    analysis: string;
    missingKeywords: string[];
    suggestions: Suggestion[];
}

interface OptimizationPanelProps {
    isOpen: boolean;
    onClose: () => void;
    result: TailoringResult | null;
}

export function OptimizationPanel({ isOpen, onClose, result }: OptimizationPanelProps) {
    if (!result) return null;

    const getScoreColor = (score: number) => {
        if (score >= 80) return "text-green-500";
        if (score >= 60) return "text-yellow-500";
        return "text-red-500";
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        toast.success("Copied to clipboard");
    };

    return (
        <Sheet open={isOpen} onOpenChange={onClose}>
            <SheetContent className="w-[400px] sm:w-[540px] overflow-y-auto">
                <SheetHeader>
                    <SheetTitle className="flex items-center gap-2">
                        <Sparkles className="h-5 w-5 text-primary" />
                        Tailoring Analysis
                    </SheetTitle>
                    <SheetDescription>
                        Optimized for your target job description.
                    </SheetDescription>
                </SheetHeader>

                <div className="space-y-8 py-6">
                    {/* Score Section */}
                    <div className="flex flex-col items-center justify-center space-y-4">
                        <div className="relative flex items-center justify-center">
                            <svg className="w-32 h-32 transform -rotate-90">
                                <circle
                                    className="text-muted/20"
                                    strokeWidth="8"
                                    stroke="currentColor"
                                    fill="transparent"
                                    r="58"
                                    cx="64"
                                    cy="64"
                                />
                                <circle
                                    className={getScoreColor(result.score)}
                                    strokeWidth="8"
                                    strokeDasharray={365}
                                    strokeDashoffset={365 - (365 * result.score) / 100}
                                    strokeLinecap="round"
                                    stroke="currentColor"
                                    fill="transparent"
                                    r="58"
                                    cx="64"
                                    cy="64"
                                />
                            </svg>
                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                                <span className={cn("text-3xl font-bold", getScoreColor(result.score))}>
                                    {result.score}%
                                </span>
                                <span className="text-xs text-muted-foreground uppercase tracking-wider">Match</span>
                            </div>
                        </div>
                        <p className="text-sm text-center text-muted-foreground px-4">
                            {result.analysis}
                        </p>
                    </div>

                    {/* Missing Keywords */}
                    {result.missingKeywords.length > 0 && (
                        <div className="space-y-3">
                            <h3 className="font-semibold flex items-center gap-2 text-sm uppercase tracking-wide text-muted-foreground">
                                <AlertCircle className="h-4 w-4" />
                                Missing Keywords
                            </h3>
                            <div className="flex flex-wrap gap-2">
                                {result.missingKeywords.map((keyword, i) => (
                                    <Badge key={i} variant="secondary" className="px-3 py-1 bg-red-500/10 text-red-500 hover:bg-red-500/20 border-red-500/20">
                                        {keyword}
                                    </Badge>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Suggestions */}
                    <div className="space-y-4">
                        <h3 className="font-semibold flex items-center gap-2 text-sm uppercase tracking-wide text-muted-foreground">
                            <CheckCircle2 className="h-4 w-4" />
                            Suggested Improvements
                        </h3>

                        <div className="space-y-4">
                            {result.suggestions.map((suggestion, i) => (
                                <Card key={i} className="bg-card/50">
                                    <CardHeader className="pb-2">
                                        <CardTitle className="text-sm font-medium text-muted-foreground">
                                            {suggestion.section}
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-3 text-sm">
                                        <div className="p-3 rounded-md bg-muted/50 text-muted-foreground">
                                            <span className="text-xs uppercase font-bold text-muted-foreground/50 block mb-1">Original</span>
                                            {suggestion.original}
                                        </div>
                                        <div className="flex items-center justify-center">
                                            <ArrowRight className="h-4 w-4 text-muted-foreground/50 rotate-90" />
                                        </div>
                                        <div className="p-3 rounded-md bg-green-500/10 text-green-700 dark:text-green-300 border border-green-500/20">
                                            <div className="flex justify-between items-start gap-2">
                                                <div>
                                                    <span className="text-xs uppercase font-bold text-green-500/70 block mb-1">Improved</span>
                                                    {suggestion.improved}
                                                </div>
                                                <Button size="icon" variant="ghost" className="h-6 w-6 shrink-0" onClick={() => copyToClipboard(suggestion.improved)}>
                                                    <Copy className="h-3 w-3" />
                                                </Button>
                                            </div>
                                        </div>
                                        <p className="text-xs text-muted-foreground italic">
                                            <span className="font-semibold text-primary">Why: </span>
                                            {suggestion.reason}
                                        </p>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </div>
                </div>
            </SheetContent>
        </Sheet>
    );
}
