"use client";

import { AlignJustify, MoveHorizontal, MoveVertical, Type } from "lucide-react";
import { useResumeStore } from "@/lib/stores/resume-store";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

export function LayoutControls() {
    const { visualConfig, updateVisualConfig } = useResumeStore();

    return (
        <div className="space-y-6">
            {/* Font Size */}
            <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                    <Label className="text-xs font-bold text-[#52716a] uppercase tracking-wider flex items-center gap-2">
                        <Type className="h-4 w-4 text-[#0d8274]" />
                        Font Size
                    </Label>
                    <span className="text-xs font-mono font-bold text-[#102b2b] bg-[#d8f36b]/40 px-2 py-0.5 rounded-none capitalize">{visualConfig?.fontSize || "standard"}</span>
                </div>
                <Tabs
                    value={visualConfig?.fontSize || "standard"}
                    onValueChange={(v) => updateVisualConfig({ fontSize: v as any })}
                    className="w-full"
                >
                    <TabsList className="grid w-full grid-cols-3 rounded-none bg-white/70 border border-[#102b2b]/15 p-1">
                        <TabsTrigger value="small" className="rounded-none text-xs font-bold text-[#52716a] data-[state=active]:bg-[#102b2b] data-[state=active]:text-white">Small</TabsTrigger>
                        <TabsTrigger value="standard" className="rounded-none text-xs font-bold text-[#52716a] data-[state=active]:bg-[#102b2b] data-[state=active]:text-white">Standard</TabsTrigger>
                        <TabsTrigger value="large" className="rounded-none text-xs font-bold text-[#52716a] data-[state=active]:bg-[#102b2b] data-[state=active]:text-white">Large</TabsTrigger>
                    </TabsList>
                </Tabs>
            </div>

            {/* Line Height */}
            <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                    <Label className="text-xs font-bold text-[#52716a] uppercase tracking-wider flex items-center gap-2">
                        <MoveVertical className="h-4 w-4 text-[#0d8274]" />
                        Line Height
                    </Label>
                    <span className="text-xs font-mono font-bold text-[#102b2b] bg-[#d8f36b]/40 px-2 py-0.5 rounded-none capitalize">{visualConfig?.lineHeight || "standard"}</span>
                </div>
                <Tabs
                    value={visualConfig?.lineHeight || "standard"}
                    onValueChange={(v) => updateVisualConfig({ lineHeight: v as any })}
                    className="w-full"
                >
                    <TabsList className="grid w-full grid-cols-3 rounded-none bg-white/70 border border-[#102b2b]/15 p-1">
                        <TabsTrigger value="tight" className="rounded-none text-xs font-bold text-[#52716a] data-[state=active]:bg-[#102b2b] data-[state=active]:text-white">Tight</TabsTrigger>
                        <TabsTrigger value="standard" className="rounded-none text-xs font-bold text-[#52716a] data-[state=active]:bg-[#102b2b] data-[state=active]:text-white">Standard</TabsTrigger>
                        <TabsTrigger value="relaxed" className="rounded-none text-xs font-bold text-[#52716a] data-[state=active]:bg-[#102b2b] data-[state=active]:text-white">Relaxed</TabsTrigger>
                    </TabsList>
                </Tabs>
            </div>

            {/* Margins */}
            <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                    <Label className="text-xs font-bold text-[#52716a] uppercase tracking-wider flex items-center gap-2">
                        <MoveHorizontal className="h-4 w-4 text-[#0d8274]" />
                        Page Margins
                    </Label>
                    <span className="text-xs font-mono font-bold text-[#102b2b] bg-[#d8f36b]/40 px-2 py-0.5 rounded-none">
                        {visualConfig?.nav_style === "vertical" ? "Compact" : (visualConfig?.nav_style === "horizontal" ? "Wide" : "Standard")}
                    </span>
                </div>
                <Tabs
                    value={visualConfig?.nav_style || "standard"}
                    onValueChange={(v) => updateVisualConfig({ nav_style: v as any })}
                    className="w-full"
                >
                    <TabsList className="grid w-full grid-cols-3 rounded-none bg-white/70 border border-[#102b2b]/15 p-1">
                        <TabsTrigger value="vertical" className="rounded-none text-xs font-bold text-[#52716a] data-[state=active]:bg-[#102b2b] data-[state=active]:text-white">Compact</TabsTrigger>
                        <TabsTrigger value="standard" className="rounded-none text-xs font-bold text-[#52716a] data-[state=active]:bg-[#102b2b] data-[state=active]:text-white">Normal</TabsTrigger>
                        <TabsTrigger value="horizontal" className="rounded-none text-xs font-bold text-[#52716a] data-[state=active]:bg-[#102b2b] data-[state=active]:text-white">Wide</TabsTrigger>
                    </TabsList>
                </Tabs>
            </div>
        </div>
    );
}
