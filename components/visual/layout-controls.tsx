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
            <div className="space-y-3">
                <div className="flex items-center justify-between">
                    <Label className="text-sm font-semibold flex items-center gap-2">
                        <Type className="h-4 w-4 text-muted-foreground" />
                        Font Size
                    </Label>
                    <span className="text-xs text-muted-foreground capitalize">{visualConfig?.fontSize || "standard"}</span>
                </div>
                <Tabs
                    value={visualConfig?.fontSize || "standard"}
                    onValueChange={(v) => updateVisualConfig({ fontSize: v as any })}
                    className="w-full"
                >
                    <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="small">Small</TabsTrigger>
                        <TabsTrigger value="standard">Standard</TabsTrigger>
                        <TabsTrigger value="large">Large</TabsTrigger>
                    </TabsList>
                </Tabs>
            </div>

            {/* Line Height */}
            <div className="space-y-3">
                <div className="flex items-center justify-between">
                    <Label className="text-sm font-semibold flex items-center gap-2">
                        <MoveVertical className="h-4 w-4 text-muted-foreground" />
                        Line Height
                    </Label>
                    <span className="text-xs text-muted-foreground capitalize">{visualConfig?.lineHeight || "standard"}</span>
                </div>
                <Tabs
                    value={visualConfig?.lineHeight || "standard"}
                    onValueChange={(v) => updateVisualConfig({ lineHeight: v as any })}
                    className="w-full"
                >
                    <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="tight">Tight</TabsTrigger>
                        <TabsTrigger value="standard">Standard</TabsTrigger>
                        <TabsTrigger value="relaxed">Relaxed</TabsTrigger>
                    </TabsList>
                </Tabs>
            </div>

            {/* Margins (Slider) */}
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <Label className="text-sm font-semibold flex items-center gap-2">
                        <MoveHorizontal className="h-4 w-4 text-muted-foreground" />
                        Page Margins
                    </Label>
                    <span className="text-xs text-muted-foreground">
                        {visualConfig?.nav_style === "vertical" ? "Compact" : (visualConfig?.nav_style === "horizontal" ? "Wide" : "Standard")}
                    </span>
                </div>
                {/* Using nav_style property as a proxy for margins for now since store might not have margin field yet */}
                <Tabs
                    value={visualConfig?.nav_style || "standard"} // Using nav_style field as a placeholder for margin logic if needed, or we add a new field
                    onValueChange={(v) => updateVisualConfig({ nav_style: v as any })}
                    className="w-full"
                >
                    <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="vertical">Compact</TabsTrigger>
                        <TabsTrigger value="standard">Normal</TabsTrigger>
                        <TabsTrigger value="horizontal">Wide</TabsTrigger>
                    </TabsList>
                </Tabs>
            </div>
        </div>
    );
}
