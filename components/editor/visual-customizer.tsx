"use client";

import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Palette, Check } from "lucide-react";
import { useResumeStore, VisualConfig } from "@/lib/stores/resume-store";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

const ACCENT_COLORS = [
    { name: "Standard Blue", value: "#0070f3" },
    { name: "Modern Slate", value: "#0f172a" },
    { name: "Professional Teal", value: "#0d9488" },
    { name: "Elegant Burgundy", value: "#991b1b" },
    { name: "Royal Purple", value: "#7c3aed" },
    { name: "Forest Green", value: "#166534" },
    { name: "Sophisticated Gold", value: "#854d0e" },
];

const FONT_FAMILIES = [
    { name: "Inter (Sans)", value: "Inter" },
    { name: "Roboto (Sans)", value: "Roboto" },
    { name: "Merriweather (Serif)", value: "Merriweather" },
    { name: "Playfair Display (Serif)", value: "Playfair Display" },
    { name: "Source Code Pro (Mono)", value: "Source Code Pro" },
];

const FONT_SIZES: { name: string; value: VisualConfig["fontSize"] }[] = [
    { name: "Small", value: "small" },
    { name: "Standard", value: "standard" },
    { name: "Large", value: "large" },
];

const LINE_HEIGHTS: { name: string; value: VisualConfig["lineHeight"] }[] = [
    { name: "Tight", value: "tight" },
    { name: "Standard", value: "standard" },
    { name: "Relaxed", value: "relaxed" },
];

export function VisualCustomizer() {
    const { visualConfig, updateVisualConfig } = useResumeStore();

    return (
        <Sheet>
            <SheetTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2 bg-transparent">
                    <Palette className="h-4 w-4" />
                    <span className="hidden sm:inline">Style</span>
                </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] sm:w-[400px]">
                <SheetHeader>
                    <SheetTitle>Customize Style</SheetTitle>
                    <SheetDescription>
                        Change the look and feel of your resume. Changes are reflected in real-time.
                    </SheetDescription>
                </SheetHeader>
                <div className="mt-8 space-y-8">
                    {/* Accent Color */}
                    <div className="space-y-4">
                        <Label className="text-sm font-semibold">Accent Color</Label>
                        <div className="flex flex-wrap gap-3">
                            {ACCENT_COLORS.map((color) => (
                                <button
                                    key={color.value}
                                    title={color.name}
                                    onClick={() => updateVisualConfig({ accentColor: color.value })}
                                    className={cn(
                                        "h-8 w-8 rounded-full border border-border shadow-sm transition-transform hover:scale-110 flex items-center justify-center",
                                        visualConfig.accentColor === color.value && "ring-2 ring-primary ring-offset-2"
                                    )}
                                    style={{ backgroundColor: color.value }}
                                >
                                    {visualConfig.accentColor === color.value && (
                                        <Check className="h-4 w-4 text-white drop-shadow-md" />
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Font Family */}
                    <div className="space-y-4">
                        <Label className="text-sm font-semibold">Font Family</Label>
                        <div className="grid grid-cols-1 gap-2">
                            {FONT_FAMILIES.map((font) => (
                                <Button
                                    key={font.value}
                                    variant={visualConfig.fontFamily === font.value ? "secondary" : "outline"}
                                    className="justify-start font-normal"
                                    style={{ fontFamily: font.value }}
                                    onClick={() => updateVisualConfig({ fontFamily: font.value })}
                                >
                                    {font.name}
                                    {visualConfig.fontFamily === font.value && <Check className="ml-auto h-4 w-4" />}
                                </Button>
                            ))}
                        </div>
                    </div>

                    {/* Font Size */}
                    <div className="space-y-4">
                        <Label className="text-sm font-semibold">Font Size</Label>
                        <div className="flex gap-2">
                            {FONT_SIZES.map((size) => (
                                <Button
                                    key={size.value}
                                    variant={visualConfig.fontSize === size.value ? "secondary" : "outline"}
                                    size="sm"
                                    className="flex-1"
                                    onClick={() => updateVisualConfig({ fontSize: size.value })}
                                >
                                    {size.name}
                                </Button>
                            ))}
                        </div>
                    </div>

                    {/* Line Height */}
                    <div className="space-y-4">
                        <Label className="text-sm font-semibold">Line Height</Label>
                        <div className="flex gap-2">
                            {LINE_HEIGHTS.map((height) => (
                                <Button
                                    key={height.value}
                                    variant={visualConfig.lineHeight === height.value ? "secondary" : "outline"}
                                    size="sm"
                                    className="flex-1"
                                    onClick={() => updateVisualConfig({ lineHeight: height.value })}
                                >
                                    {height.name}
                                </Button>
                            ))}
                        </div>
                    </div>
                </div>
            </SheetContent>
        </Sheet>
    );
}
