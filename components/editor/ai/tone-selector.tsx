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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Loader2, Palette, Check, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";

type ToneType = "professional" | "casual" | "technical" | "creative" | "executive" | "entry-level";

interface ToneResult {
    adjustedContent: string | any;
    toneAnalysis: {
        originalTone: string;
        targetTone: string;
        changes: string[];
    };
}

interface ToneSelectorProps {
    content: string | any;
    scope?: "full" | "summary" | "experience" | "selected";
    onApply: (content: string | any) => void;
}

export function ToneSelector({
    content,
    scope = "selected",
    onApply,
}: ToneSelectorProps) {
    const [selectedTone, setSelectedTone] = useState<ToneType>("professional");
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<ToneResult | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [previewText, setPreviewText] = useState("");

    const tones: { id: ToneType; name: string; description: string; emoji: string }[] = [
        {
            id: "professional",
            name: "Professional",
            description: "Formal, polished corporate tone",
            emoji: "👔",
        },
        {
            id: "casual",
            name: "Casual",
            description: "Friendly yet professional",
            emoji: "😊",
        },
        {
            id: "technical",
            name: "Technical",
            description: "Detailed, specification-focused",
            emoji: "⚙️",
        },
        {
            id: "creative",
            name: "Creative",
            description: "Dynamic, personality-driven",
            emoji: "🎨",
        },
        {
            id: "executive",
            name: "Executive",
            description: "Strategic, leadership-focused",
            emoji: "🎯",
        },
        {
            id: "entry-level",
            name: "Entry-Level",
            description: "Enthusiastic, growth-focused",
            emoji: "🌱",
        },
    ];

    const handleAdjustTone = async () => {
        const textToAdjust = previewText || content;
        if (!textToAdjust) {
            setError("No content to adjust");
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const response = await fetch("/api/ai/tone-adjust", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    content: textToAdjust,
                    targetTone: selectedTone,
                    scope,
                }),
            });

            if (!response.ok) {
                throw new Error("Failed to adjust tone");
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
            onApply(result.adjustedContent);
            setResult(null);
            setPreviewText("");
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Palette className="h-5 w-5 text-purple-500" />
                    Tone Adjustment
                </CardTitle>
                <CardDescription>
                    Change the writing style of your resume content
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                {/* Text Input for Selected Content */}
                {scope === "selected" && typeof content === "string" && (
                    <div className="space-y-2">
                        <Label>Text to adjust</Label>
                        <Textarea
                            placeholder="Paste or type text to adjust..."
                            value={previewText || (typeof content === "string" ? content : "")}
                            onChange={(e) => setPreviewText(e.target.value)}
                            className="min-h-[80px]"
                        />
                    </div>
                )}

                {/* Tone Selection */}
                <div className="space-y-3">
                    <Label>Select Tone</Label>
                    <RadioGroup
                        value={selectedTone}
                        onValueChange={(v) => setSelectedTone(v as ToneType)}
                        className="grid grid-cols-2 gap-2"
                    >
                        {tones.map((tone) => (
                            <div key={tone.id}>
                                <RadioGroupItem
                                    value={tone.id}
                                    id={tone.id}
                                    className="peer sr-only"
                                />
                                <Label
                                    htmlFor={tone.id}
                                    className={cn(
                                        "flex items-start gap-2 p-3 rounded-lg border cursor-pointer transition-colors",
                                        "peer-data-[state=checked]:bg-purple-50 peer-data-[state=checked]:border-purple-300",
                                        "hover:bg-muted/50"
                                    )}
                                >
                                    <span className="text-lg">{tone.emoji}</span>
                                    <div>
                                        <p className="text-sm font-medium">{tone.name}</p>
                                        <p className="text-xs text-muted-foreground">
                                            {tone.description}
                                        </p>
                                    </div>
                                </Label>
                            </div>
                        ))}
                    </RadioGroup>
                </div>

                {error && <p className="text-sm text-red-500">{error}</p>}

                {/* Result Preview */}
                {result && (
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <Label>Adjusted Result</Label>
                            <Badge variant="secondary">
                                {result.toneAnalysis.originalTone} → {result.toneAnalysis.targetTone}
                            </Badge>
                        </div>

                        <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                            <p className="text-sm">
                                {typeof result.adjustedContent === "string"
                                    ? result.adjustedContent
                                    : JSON.stringify(result.adjustedContent, null, 2).slice(0, 200) + "..."}
                            </p>
                        </div>

                        {result.toneAnalysis.changes.length > 0 && (
                            <div className="space-y-1">
                                <p className="text-xs font-medium text-muted-foreground">
                                    Changes made:
                                </p>
                                <ul className="text-xs text-muted-foreground space-y-0.5">
                                    {result.toneAnalysis.changes.map((change, i) => (
                                        <li key={i}>• {change}</li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        <div className="flex gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setResult(null)}
                                className="gap-1"
                            >
                                <RefreshCw className="h-3 w-3" />
                                Try Again
                            </Button>
                            <Button size="sm" onClick={handleApply} className="gap-1">
                                <Check className="h-3 w-3" />
                                Apply Changes
                            </Button>
                        </div>
                    </div>
                )}

                {!result && (
                    <Button
                        onClick={handleAdjustTone}
                        disabled={loading}
                        className="w-full gap-2"
                    >
                        {loading ? (
                            <>
                                <Loader2 className="h-4 w-4 animate-spin" />
                                Adjusting Tone...
                            </>
                        ) : (
                            <>
                                <Palette className="h-4 w-4" />
                                Adjust Tone
                            </>
                        )}
                    </Button>
                )}
            </CardContent>
        </Card>
    );
}
