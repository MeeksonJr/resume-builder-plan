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
                <Label className="text-xs font-bold text-[#52716a] uppercase tracking-wider flex items-center gap-2">
                    <Palette className="h-4 w-4 text-[#0d8274]" />
                    Color Theme
                </Label>
                <div className="w-6 h-6 rounded-none border border-[#102b2b]/20 shadow-sm" style={{ backgroundColor: currentColor }} />
            </div>

            <div className="flex flex-wrap gap-2.5">
                {ACCENT_COLORS.map((color) => (
                    <button
                        key={color.value}
                        onClick={() => updateVisualConfig({ accentColor: color.value })}
                        title={color.name}
                        className={cn(
                            "h-9 w-9 rounded-none border border-[#102b2b]/20 shadow-sm transition-all hover:scale-105 flex items-center justify-center relative",
                            currentColor === color.value && "ring-2 ring-[#102b2b] ring-offset-2 ring-offset-[#f8f4ec] font-bold"
                        )}
                        style={{ backgroundColor: color.value }}
                    >
                        {currentColor === color.value && (
                            <Check className="h-4 w-4 text-white drop-shadow-md" />
                        )}
                    </button>
                ))}
            </div>

            <div className="pt-2 space-y-1.5">
                <Label className="text-[10px] font-bold text-[#52716a] uppercase tracking-wider block">Custom Hex Code</Label>
                <div className="flex gap-2">
                    <div className="relative flex-1">
                        <div className="absolute left-2.5 top-3 w-4 h-4 rounded-none border border-[#102b2b]/30 shadow-xs" style={{ backgroundColor: currentColor }} />
                        <Input
                            value={currentColor}
                            onChange={(e) => updateVisualConfig({ accentColor: e.target.value })}
                            className="pl-9 h-10 rounded-none border-[#102b2b]/15 bg-white/80 font-mono text-sm uppercase focus-visible:ring-[#102b2b]"
                            maxLength={7}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
