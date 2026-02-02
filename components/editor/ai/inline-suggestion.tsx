"use client";

import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { Loader2, Sparkles, Check, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface InlineSuggestionProps {
    partialText: string;
    section: "summary" | "experience" | "education" | "project" | "skill";
    fieldName?: string;
    resumeData?: any;
    onAccept: (text: string) => void;
    onDismiss: () => void;
    isOpen: boolean;
    triggerRef?: React.RefObject<HTMLElement>;
}

interface SuggestionResult {
    suggestions: string[];
    completions: string[];
    improvements: string[];
}

export function InlineSuggestion({
    partialText,
    section,
    fieldName,
    resumeData,
    onAccept,
    onDismiss,
    isOpen,
}: InlineSuggestionProps) {
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<SuggestionResult | null>(null);
    const [error, setError] = useState<string | null>(null);

    const fetchSuggestions = useCallback(async () => {
        if (partialText.length < 3) return;

        setLoading(true);
        setError(null);

        try {
            const response = await fetch("/api/ai/writing-assist", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    partialText,
                    section,
                    fieldName,
                    resumeData,
                }),
            });

            if (!response.ok) {
                throw new Error("Failed to get suggestions");
            }

            const data = await response.json();
            setResult(data);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [partialText, section, fieldName, resumeData]);

    const handleAccept = (suggestion: string) => {
        // If it's a completion, use it directly
        if (suggestion.includes(partialText)) {
            onAccept(suggestion);
        } else {
            // Otherwise append to partial text
            onAccept(partialText + " " + suggestion);
        }
    };

    if (!isOpen) return null;

    return (
        <Popover open={isOpen} onOpenChange={(open) => !open && onDismiss()}>
            <PopoverTrigger asChild>
                <span className="invisible" />
            </PopoverTrigger>
            <PopoverContent
                className="w-96 p-0"
                align="start"
                side="bottom"
                sideOffset={5}
            >
                <div className="p-3 space-y-3">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Sparkles className="h-4 w-4 text-purple-500" />
                            <span className="text-sm font-medium">AI Suggestions</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6"
                                onClick={fetchSuggestions}
                                disabled={loading}
                            >
                                {loading ? (
                                    <Loader2 className="h-3 w-3 animate-spin" />
                                ) : (
                                    <Sparkles className="h-3 w-3" />
                                )}
                            </Button>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6"
                                onClick={onDismiss}
                            >
                                <X className="h-3 w-3" />
                            </Button>
                        </div>
                    </div>

                    {error && (
                        <p className="text-xs text-red-500">{error}</p>
                    )}

                    {!result && !loading && !error && (
                        <div className="text-center py-4">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={fetchSuggestions}
                                className="gap-2"
                            >
                                <Sparkles className="h-4 w-4" />
                                Get AI Suggestions
                            </Button>
                            <p className="text-xs text-muted-foreground mt-2">
                                Press to see writing suggestions
                            </p>
                        </div>
                    )}

                    {result && (
                        <div className="space-y-3">
                            {/* Quick completions */}
                            {result.suggestions.length > 0 && (
                                <div>
                                    <p className="text-xs font-medium text-muted-foreground mb-1">
                                        Continue with...
                                    </p>
                                    <div className="flex flex-wrap gap-1">
                                        {result.suggestions.map((suggestion, i) => (
                                            <Badge
                                                key={i}
                                                variant="secondary"
                                                className="cursor-pointer hover:bg-purple-100 hover:text-purple-800 transition-colors"
                                                onClick={() => handleAccept(suggestion)}
                                            >
                                                {suggestion}
                                            </Badge>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Full completions */}
                            {result.completions.length > 0 && (
                                <div>
                                    <p className="text-xs font-medium text-muted-foreground mb-1">
                                        Complete sentence
                                    </p>
                                    <div className="space-y-1">
                                        {result.completions.map((completion, i) => (
                                            <div
                                                key={i}
                                                className={cn(
                                                    "text-sm p-2 rounded-md bg-muted/50 cursor-pointer",
                                                    "hover:bg-purple-50 hover:border-purple-200 border border-transparent",
                                                    "transition-colors flex items-start gap-2"
                                                )}
                                                onClick={() => onAccept(completion)}
                                            >
                                                <Check className="h-4 w-4 text-green-500 flex-shrink-0 mt-0.5" />
                                                <span>{completion}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Improvements */}
                            {result.improvements.length > 0 && (
                                <div>
                                    <p className="text-xs font-medium text-muted-foreground mb-1">
                                        Stronger verbs
                                    </p>
                                    <div className="flex flex-wrap gap-1">
                                        {result.improvements.map((improvement, i) => (
                                            <Badge
                                                key={i}
                                                variant="outline"
                                                className="cursor-pointer hover:bg-green-50 hover:text-green-700 hover:border-green-300 transition-colors"
                                                onClick={() => handleAccept(improvement)}
                                            >
                                                {improvement}
                                            </Badge>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    <div className="pt-2 border-t text-xs text-muted-foreground">
                        <kbd className="px-1 py-0.5 bg-muted rounded text-[10px]">Tab</kbd>{" "}
                        to accept •{" "}
                        <kbd className="px-1 py-0.5 bg-muted rounded text-[10px]">Esc</kbd>{" "}
                        to dismiss
                    </div>
                </div>
            </PopoverContent>
        </Popover>
    );
}

// Custom hook for debounced writing suggestions
export function useWritingSuggestions(debounceMs: number = 1000) {
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [lastText, setLastText] = useState("");

    const triggerSuggestions = useCallback(
        (text: string) => {
            if (text.length >= 10 && text !== lastText) {
                setLastText(text);
                setShowSuggestions(true);
            }
        },
        [lastText]
    );

    const dismissSuggestions = useCallback(() => {
        setShowSuggestions(false);
    }, []);

    return {
        showSuggestions,
        triggerSuggestions,
        dismissSuggestions,
        lastText,
    };
}
