"use client";

import { Check, Palette } from "lucide-react";
import { useResumeStore } from "@/lib/stores/resume-store";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";

const ACCENT_COLORS = [
    { name: "Blue", value: "#0070f3" },
    { name: "Slate", value: "#0f172a" },
    { name: "Teal", value: "#0d9488" },
    { name: "Rose", value: "#e11d48" },
    { name: "Violet", value: "#7c3aed" },
    { name: "Green", value: "#166534" },
    { name: "Gold", value: "#d97706" },
];

export function ColorPicker() {
    const { visualConfig, updateVisualConfig } = useResumeStore();
    const currentColor = visualConfig?.accentColor || "#0070f3";

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <Label className="text-sm font-semibold flex items-center gap-2">
                    <Palette className="h-4 w-4 text-muted-foreground" />
                    Color Theme
                </Label>
                <div className="w-6 h-6 rounded-full border border-border" style={{ backgroundColor: currentColor }} />
            </div>

            <div className="flex flex-wrap gap-3">
                {ACCENT_COLORS.map((color) => (
                    <button
                        key={color.value}
                        onClick={() => updateVisualConfig({ accentColor: color.value })}
                        title={color.name}
                        className={cn(
                            "h-8 w-8 rounded-full border border-border shadow-sm transition-transform hover:scale-110 flex items-center justify-center relative",
                            currentColor === color.value && "ring-2 ring-primary ring-offset-2"
                        )}
                        style={{ backgroundColor: color.value }}
                    >
                        {currentColor === color.value && (
                            <Check className="h-4 w-4 text-white drop-shadow-md" />
                        )}
                    </button>
                ))}
            </div>

            <div className="pt-2">
                <Label className="text-xs text-muted-foreground mb-2 block">Custom Hex Code</Label>
                <div className="flex gap-2">
                    <div className="relative flex-1">
                        <div className="absolute left-2 top-2.5 w-4 h-4 rounded-full border border-border" style={{ backgroundColor: currentColor }} />
                        <Input
                            value={currentColor}
                            onChange={(e) => updateVisualConfig({ accentColor: e.target.value })}
                            className="pl-8 font-mono text-sm"
                            maxLength={7}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
