"use client";

import { Check, Type } from "lucide-react";
import { useResumeStore } from "@/lib/stores/resume-store";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

const FONT_FAMILIES = [
    { name: "Inter", value: "Inter", type: "Sans-Serif", sample: "Aa Modern" },
    { name: "Roboto", value: "Roboto", type: "Sans-Serif", sample: "Aa Clean" },
    { name: "Outfit", value: "Outfit", type: "Sans-Serif", sample: "Aa Contemporary" },
    { name: "Open Sans", value: "Open Sans", type: "Sans-Serif", sample: "Aa Neutral" },
    { name: "Merriweather", value: "Merriweather", type: "Serif", sample: "Aa Editorial" },
    { name: "Playfair", value: "Playfair Display", type: "Serif", sample: "Aa Elegance" },
    { name: "Lora", value: "Lora", type: "Serif", sample: "Aa Classic" },
    { name: "Source Code", value: "Source Code Pro", type: "Monospace", sample: "Aa Terminal" },
];

export function FontPicker() {
    const { visualConfig, updateVisualConfig } = useResumeStore();
    const currentFont = visualConfig?.fontFamily || "Inter";

    return (
        <div className="space-y-3">
            <div className="flex items-center justify-between">
                <Label className="text-xs font-bold text-[#52716a] uppercase tracking-wider flex items-center gap-2">
                    <Type className="h-4 w-4 text-[#0d8274]" />
                    Typography
                </Label>
                <span className="text-[11px] font-mono font-bold text-[#102b2b] bg-[#d8f36b]/40 px-2 py-0.5 rounded-none">
                    {currentFont}
                </span>
            </div>

            {/* 2-Column Responsive Compact Font Cards */}
            <div className="grid grid-cols-2 gap-2">
                {FONT_FAMILIES.map((font) => {
                    const isSelected = currentFont === font.value;
                    return (
                        <button
                            key={font.value}
                            type="button"
                            onClick={() => updateVisualConfig({ fontFamily: font.value })}
                            className={cn(
                                "group text-left p-2.5 rounded-none border border-[#102b2b]/15 bg-white/70 hover:bg-white transition-all relative flex flex-col justify-between gap-1",
                                isSelected && "border-2 border-[#102b2b] bg-[#d8f36b]/20 shadow-xs"
                            )}
                        >
                            <div className="flex items-center justify-between w-full">
                                <span
                                    className="text-sm font-bold text-[#102b2b] truncate"
                                    style={{ fontFamily: font.value }}
                                >
                                    {font.name}
                                </span>
                                {isSelected && (
                                    <Check className="h-3.5 w-3.5 text-[#102b2b] shrink-0" />
                                )}
                            </div>
                            <div className="flex items-center justify-between w-full">
                                <span
                                    className="text-xs text-[#52716a] opacity-80"
                                    style={{ fontFamily: font.value }}
                                >
                                    {font.sample}
                                </span>
                                <span className="text-[8.5px] uppercase font-bold text-[#52716a]/70 tracking-wider">
                                    {font.type}
                                </span>
                            </div>
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
