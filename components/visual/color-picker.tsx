"use client";

import { Check, Palette, Pipette } from "lucide-react";
import { useResumeStore } from "@/lib/stores/resume-store";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { useRef } from "react";

const ACCENT_COLORS = [
    { name: "Executive Navy", value: "#0f172a" },
    { name: "Royal Blue", value: "#1d4ed8" },
    { name: "Modern Blue", value: "#0070f3" },
    { name: "Teal Emerald", value: "#0d9488" },
    { name: "Forest Green", value: "#166534" },
    { name: "Crimson Rose", value: "#e11d48" },
    { name: "Deep Burgundy", value: "#881337" },
    { name: "Royal Violet", value: "#7c3aed" },
    { name: "Amber Bronze", value: "#d97706" },
    { name: "Slate Charcoal", value: "#334155" },
    { name: "Earth Olive", value: "#3f6212" },
    { name: "Classic Noir", value: "#111827" },
];

export function ColorPicker() {
    const { visualConfig, updateVisualConfig } = useResumeStore();
    const currentColor = visualConfig?.accentColor || "#0070f3";
    const nativeInputRef = useRef<HTMLInputElement>(null);

    const handleHexChange = (hex: string) => {
        let cleanHex = hex.trim();
        if (!cleanHex.startsWith("#")) {
            cleanHex = `#${cleanHex}`;
        }
        updateVisualConfig({ accentColor: cleanHex });
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <Label className="text-xs font-bold text-[#52716a] uppercase tracking-wider flex items-center gap-2">
                    <Palette className="h-4 w-4 text-[#0d8274]" />
                    Color Palette
                </Label>
                <div className="flex items-center gap-2">
                    <span className="text-[11px] font-mono font-bold text-[#102b2b] bg-[#d8f36b]/40 px-2 py-0.5 rounded-none uppercase">
                        {currentColor}
                    </span>
                    <button
                        type="button"
                        onClick={() => nativeInputRef.current?.click()}
                        title="Pick custom color"
                        className="w-6 h-6 rounded-none border-2 border-[#102b2b]/30 shadow-xs transition-transform hover:scale-110 relative"
                        style={{ backgroundColor: currentColor }}
                    >
                        <input
                            ref={nativeInputRef}
                            type="color"
                            value={currentColor.startsWith("#") && currentColor.length === 7 ? currentColor : "#0070f3"}
                            onChange={(e) => updateVisualConfig({ accentColor: e.target.value })}
                            className="sr-only"
                        />
                    </button>
                </div>
            </div>

            {/* Presets Grid */}
            <div className="grid grid-cols-6 gap-2">
                {ACCENT_COLORS.map((color) => {
                    const isSelected = currentColor.toLowerCase() === color.value.toLowerCase();
                    return (
                        <button
                            key={color.value}
                            type="button"
                            onClick={() => updateVisualConfig({ accentColor: color.value })}
                            title={color.name}
                            className={cn(
                                "group relative h-9 w-full rounded-none border border-black/10 shadow-xs transition-all hover:scale-105 flex items-center justify-center",
                                isSelected && "ring-2 ring-[#102b2b] ring-offset-2 ring-offset-[#f8f4ec] z-10 font-bold"
                            )}
                            style={{ backgroundColor: color.value }}
                        >
                            {isSelected && (
                                <Check className="h-4 w-4 text-white drop-shadow-md" />
                            )}
                        </button>
                    );
                })}
            </div>

            {/* Custom Hex Code & Picker Input */}
            <div className="pt-1">
                <div className="flex items-center gap-2">
                    <button
                        type="button"
                        onClick={() => nativeInputRef.current?.click()}
                        className="flex items-center gap-1.5 h-10 px-3 bg-white/80 border border-[#102b2b]/15 text-xs font-semibold text-[#102b2b] hover:bg-white transition-colors"
                        title="Open native color wheel"
                    >
                        <Pipette className="h-3.5 w-3.5 text-[#0d8274]" />
                        <span>Pick</span>
                    </button>
                    <div className="relative flex-1">
                        <div
                            className="absolute left-2.5 top-3 w-4 h-4 rounded-none border border-black/20 shadow-xs pointer-events-none"
                            style={{ backgroundColor: currentColor }}
                        />
                        <Input
                            value={currentColor}
                            onChange={(e) => handleHexChange(e.target.value)}
                            placeholder="#0070F3"
                            className="pl-9 h-10 rounded-none border-[#102b2b]/15 bg-white/80 font-mono text-sm uppercase focus-visible:ring-[#102b2b]"
                            maxLength={7}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
