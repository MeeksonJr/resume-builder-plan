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
                <Label className="text-sm font-semibold flex items-center gap-2">
                    <Type className="h-4 w-4 text-muted-foreground" />
                    Typography
                </Label>
                <span className="text-xs text-muted-foreground">{currentFont}</span>
            </div>

            <div className="grid grid-cols-1 gap-2">
                {FONT_FAMILIES.map((font) => (
                    <Button
                        key={font.value}
                        variant="outline"
                        className={cn(
                            "justify-between font-normal h-auto py-3 px-4 transition-all",
                            currentFont === font.value && "border-primary bg-primary/5 ring-1 ring-primary"
                        )}
                        style={{ fontFamily: font.value }}
                        onClick={() => updateVisualConfig({ fontFamily: font.value })}
                    >
                        <div className="flex flex-col items-start gap-1">
                            <span className="text-base">{font.name}</span>
                            <span className="text-[10px] text-muted-foreground uppercase tracking-wider">{font.type}</span>
                        </div>
                        {currentFont === font.value && (
                            <Check className="h-4 w-4 text-primary" />
                        )}
                    </Button>
                ))}
            </div>
        </div>
    );
}
