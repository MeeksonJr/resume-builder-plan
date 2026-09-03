"use client";

import { MoveHorizontal, MoveVertical, Type } from "lucide-react";
import { useResumeStore } from "@/lib/stores/resume-store";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";

const FONT_SIZES: Array<"small" | "standard" | "large"> = ["small", "standard", "large"];
const FONT_SIZE_LABELS = {
    small: { title: "Small", detail: "12px body" },
    standard: { title: "Standard", detail: "14px body" },
    large: { title: "Large", detail: "16px body" },
};

const LINE_HEIGHTS: Array<"tight" | "standard" | "relaxed"> = ["tight", "standard", "relaxed"];
const LINE_HEIGHT_LABELS = {
    tight: { title: "Tight", detail: "1.25x line" },
    standard: { title: "Normal", detail: "1.5x line" },
    relaxed: { title: "Relaxed", detail: "1.75x line" },
};

const MARGIN_SIZES: Array<"compact" | "standard" | "wide"> = ["compact", "standard", "wide"];
const MARGIN_LABELS = {
    compact: { title: "Compact", detail: "Max content" },
    standard: { title: "Standard", detail: "Balanced" },
    wide: { title: "Wide", detail: "Spacious" },
};

export function LayoutControls() {
    const { visualConfig, updateVisualConfig } = useResumeStore();

    // Map string values to 0, 1, 2 indices for smooth sliders
    const currentFontSize = visualConfig?.fontSize || "standard";
    const fontSizeIndex = Math.max(0, FONT_SIZES.indexOf(currentFontSize));

    const currentLineHeight = visualConfig?.lineHeight || "standard";
    const lineHeightIndex = Math.max(0, LINE_HEIGHTS.indexOf(currentLineHeight));

    const currentMargin = (visualConfig?.margins || visualConfig?.nav_style || "standard") as "compact" | "standard" | "wide";
    const marginIndex = Math.max(0, MARGIN_SIZES.indexOf(currentMargin === ("vertical" as any) ? "compact" : currentMargin === ("horizontal" as any) ? "wide" : currentMargin));

    const handleFontSizeChange = (value: number[]) => {
        const index = value[0];
        if (FONT_SIZES[index]) {
            updateVisualConfig({ fontSize: FONT_SIZES[index] });
        }
    };

    const handleLineHeightChange = (value: number[]) => {
        const index = value[0];
        if (LINE_HEIGHTS[index]) {
            updateVisualConfig({ lineHeight: LINE_HEIGHTS[index] });
        }
    };

    const handleMarginChange = (value: number[]) => {
        const index = value[0];
        if (MARGIN_SIZES[index]) {
            updateVisualConfig({
                margins: MARGIN_SIZES[index],
                nav_style: (MARGIN_SIZES[index] === "compact" ? "vertical" : MARGIN_SIZES[index] === "wide" ? "horizontal" : "standard") as any,
            });
        }
    };

    return (
        <div className="space-y-6">
            {/* Font Size Slider Control */}
            <div className="space-y-3 p-3 bg-white/70 border border-[#102b2b]/15 rounded-none">
                <div className="flex items-center justify-between">
                    <Label className="text-xs font-bold text-[#52716a] uppercase tracking-wider flex items-center gap-1.5">
                        <Type className="h-3.5 w-3.5 text-[#0d8274]" />
                        Font Size
                    </Label>
                    <span className="text-xs font-mono font-bold text-[#102b2b] bg-[#d8f36b]/40 px-2 py-0.5 rounded-none">
                        {FONT_SIZE_LABELS[currentFontSize]?.title} ({FONT_SIZE_LABELS[currentFontSize]?.detail})
                    </span>
                </div>

                {/* Tactile Slider */}
                <div className="px-1 pt-1 pb-2">
                    <Slider
                        value={[fontSizeIndex]}
                        onValueChange={handleFontSizeChange}
                        min={0}
                        max={2}
                        step={1}
                        className="cursor-pointer"
                    />
                </div>

                {/* Step Indicators / Quick Preset Pills */}
                <div className="grid grid-cols-3 gap-1">
                    {FONT_SIZES.map((size, index) => {
                        const isSelected = currentFontSize === size;
                        return (
                            <button
                                key={size}
                                type="button"
                                onClick={() => handleFontSizeChange([index])}
                                className={cn(
                                    "py-1 text-[11px] font-semibold border transition-all text-center rounded-none",
                                    isSelected
                                        ? "bg-[#102b2b] text-white border-[#102b2b]"
                                        : "bg-transparent text-[#52716a] border-transparent hover:bg-black/5"
                                )}
                            >
                                {FONT_SIZE_LABELS[size].title}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Line Spacing / Line Height Slider Control */}
            <div className="space-y-3 p-3 bg-white/70 border border-[#102b2b]/15 rounded-none">
                <div className="flex items-center justify-between">
                    <Label className="text-xs font-bold text-[#52716a] uppercase tracking-wider flex items-center gap-1.5">
                        <MoveVertical className="h-3.5 w-3.5 text-[#0d8274]" />
                        Line Spacing
                    </Label>
                    <span className="text-xs font-mono font-bold text-[#102b2b] bg-[#d8f36b]/40 px-2 py-0.5 rounded-none">
                        {LINE_HEIGHT_LABELS[currentLineHeight]?.title} ({LINE_HEIGHT_LABELS[currentLineHeight]?.detail})
                    </span>
                </div>

                {/* Tactile Slider */}
                <div className="px-1 pt-1 pb-2">
                    <Slider
                        value={[lineHeightIndex]}
                        onValueChange={handleLineHeightChange}
                        min={0}
                        max={2}
                        step={1}
                        className="cursor-pointer"
                    />
                </div>

                {/* Step Indicators / Quick Preset Pills */}
                <div className="grid grid-cols-3 gap-1">
                    {LINE_HEIGHTS.map((height, index) => {
                        const isSelected = currentLineHeight === height;
                        return (
                            <button
                                key={height}
                                type="button"
                                onClick={() => handleLineHeightChange([index])}
                                className={cn(
                                    "py-1 text-[11px] font-semibold border transition-all text-center rounded-none",
                                    isSelected
                                        ? "bg-[#102b2b] text-white border-[#102b2b]"
                                        : "bg-transparent text-[#52716a] border-transparent hover:bg-black/5"
                                )}
                            >
                                {LINE_HEIGHT_LABELS[height].title}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Page Margins Slider Control */}
            <div className="space-y-3 p-3 bg-white/70 border border-[#102b2b]/15 rounded-none">
                <div className="flex items-center justify-between">
                    <Label className="text-xs font-bold text-[#52716a] uppercase tracking-wider flex items-center gap-1.5">
                        <MoveHorizontal className="h-3.5 w-3.5 text-[#0d8274]" />
                        Page Margins
                    </Label>
                    <span className="text-xs font-mono font-bold text-[#102b2b] bg-[#d8f36b]/40 px-2 py-0.5 rounded-none">
                        {MARGIN_LABELS[currentMargin]?.title || "Standard"}
                    </span>
                </div>

                {/* Tactile Slider */}
                <div className="px-1 pt-1 pb-2">
                    <Slider
                        value={[marginIndex]}
                        onValueChange={handleMarginChange}
                        min={0}
                        max={2}
                        step={1}
                        className="cursor-pointer"
                    />
                </div>

                {/* Step Indicators / Quick Preset Pills */}
                <div className="grid grid-cols-3 gap-1">
                    {MARGIN_SIZES.map((margin, index) => {
                        const isSelected = currentMargin === margin;
                        return (
                            <button
                                key={margin}
                                type="button"
                                onClick={() => handleMarginChange([index])}
                                className={cn(
                                    "py-1 text-[11px] font-semibold border transition-all text-center rounded-none",
                                    isSelected
                                        ? "bg-[#102b2b] text-white border-[#102b2b]"
                                        : "bg-transparent text-[#52716a] border-transparent hover:bg-black/5"
                                )}
                            >
                                {MARGIN_LABELS[margin].title}
                            </button>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
