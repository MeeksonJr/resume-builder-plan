"use client";

import { Check, Type } from "lucide-react";
import { useResumeStore } from "@/lib/stores/resume-store";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

const FONT_FAMILIES = [
    { name: "Inter", value: "Inter", type: "Sans-Serif" },
    { name: "Roboto", value: "Roboto", type: "Sans-Serif" },
    { name: "Merriweather", value: "Merriweather", type: "Serif" },
    { name: "Playfair", value: "Playfair Display", type: "Serif" },
    { name: "Open Sans", value: "Open Sans", type: "Sans-Serif" },
    { name: "Source Code", value: "Source Code Pro", type: "Monospace" },
];

export function FontPicker() {
    const { visualConfig, updateVisualConfig } = useResumeStore();
    const currentFont = visualConfig?.fontFamily || "Inter";

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <Label className="text-xs font-bold text-[#52716a] uppercase tracking-wider flex items-center gap-2">
                    <Type className="h-4 w-4 text-[#0d8274]" />
                    Typography
                </Label>
                <span className="text-xs font-mono font-bold text-[#102b2b] bg-[#d8f36b]/40 px-2 py-0.5 rounded-none">{currentFont}</span>
            </div>

            <div className="grid grid-cols-1 gap-2">
                {FONT_FAMILIES.map((font) => (
                    <Button
                        key={font.value}
                        variant="outline"
                        className={cn(
                            "justify-between font-normal h-auto py-3 px-4 transition-all rounded-none border border-[#102b2b]/15 bg-white/70 hover:bg-white text-[#102b2b]",
                            currentFont === font.value && "border-2 border-[#102b2b] bg-[#d8f36b]/20 shadow-sm font-bold"
                        )}
                        style={{ fontFamily: font.value }}
                        onClick={() => updateVisualConfig({ fontFamily: font.value })}
                    >
                        <div className="flex flex-col items-start gap-0.5">
                            <span className="text-sm font-bold">{font.name}</span>
                            <span className="text-[9px] text-[#52716a] uppercase tracking-widest font-semibold">{font.type}</span>
                        </div>
                        {currentFont === font.value && (
                            <Check className="h-4 w-4 text-[#102b2b]" />
                        )}
                    </Button>
                ))}
            </div>
        </div>
    );
}
