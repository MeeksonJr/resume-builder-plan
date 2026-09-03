"use client";

import React, { useState } from "react";
import { TemplateDefinition } from "@/lib/templates/template-registry";
import { SAMPLE_PERSONAS, DEFAULT_SAMPLE_PERSONA, PersonaData } from "@/lib/templates/sample-personas";
import { ResumePreview } from "@/components/editor/resume-preview";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, ZoomIn, ZoomOut, ShieldCheck, Sparkles, UserCheck, Palette, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface TemplateInspectModalProps {
    template: TemplateDefinition | null;
    isOpen: boolean;
    onClose: () => void;
    onSelect: (template: TemplateDefinition, visualConfigOverrides?: any) => void;
}

const PREVIEW_COLORS = [
    { name: "Executive Navy", value: "#0f172a" },
    { name: "Royal Blue", value: "#1d4ed8" },
    { name: "Teal Emerald", value: "#0d9488" },
    { name: "Forest Green", value: "#166534" },
    { name: "Deep Burgundy", value: "#881337" },
    { name: "Royal Violet", value: "#7c3aed" },
];

export function TemplateInspectModal({
    template,
    isOpen,
    onClose,
    onSelect,
}: TemplateInspectModalProps) {
    if (!template) return null;

    const [selectedPersonaKey, setSelectedPersonaKey] = useState<string>("software_engineer");
    const [zoomLevel, setZoomLevel] = useState<number>(0.85);
    const [customColor, setCustomColor] = useState<string>(template.defaultVisualConfig.accentColor);

    const persona: PersonaData = SAMPLE_PERSONAS[selectedPersonaKey] || DEFAULT_SAMPLE_PERSONA;

    const previewData = {
        resume: {
            template: template.id,
            visual_config: {
                ...template.defaultVisualConfig,
                accentColor: customColor,
            },
            is_rtl: false,
            language: "en",
        },
        profile: persona.profile,
        personalInfo: persona.profile,
        workExperiences: persona.workExperiences,
        education: persona.education,
        skills: persona.skills,
        projects: persona.projects,
        certifications: persona.certifications,
        languages: persona.languages,
    };

    const handleZoomIn = () => setZoomLevel((z) => Math.min(1.25, parseFloat((z + 0.1).toFixed(2))));
    const handleZoomOut = () => setZoomLevel((z) => Math.max(0.5, parseFloat((z - 0.1).toFixed(2))));

    const handleConfirm = () => {
        onSelect(template, { accentColor: customColor });
        onClose();
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="max-w-6xl w-[95vw] h-[92vh] p-0 rounded-none bg-[#f5f7f1] border-[#102b2b]/20 flex flex-col overflow-hidden shadow-2xl">
                {/* Modal Top Bar */}
                <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#102b2b]/15 bg-[#102b2b] text-[#f8f4ec] px-6 py-3.5 shrink-0">
                    <div className="flex items-center gap-3">
                        <DialogTitle className="text-base font-black uppercase tracking-tight text-[#f8f4ec] flex items-center gap-2">
                            <span>{template.name}</span>
                            <Badge className="bg-[#d8f36b] text-[#102b2b] rounded-none text-[10px] font-black uppercase border-none">
                                {template.subtitle}
                            </Badge>
                        </DialogTitle>
                        <div className="hidden sm:flex items-center gap-1.5 text-[#d8f36b] text-xs font-mono">
                            <ShieldCheck className="h-4 w-4" />
                            <span>{template.atsScore}% ATS Ready</span>
                        </div>
                    </div>

                    {/* Quick Action Button */}
                    <div className="flex items-center gap-3">
                        <Button
                            onClick={handleConfirm}
                            className="rounded-none bg-[#d8f36b] text-[#102b2b] hover:bg-[#c9e95c] font-black uppercase text-xs tracking-wider gap-1.5 h-9 px-5 shadow-sm"
                        >
                            <Sparkles className="h-3.5 w-3.5" />
                            Use This Template
                        </Button>
                    </div>
                </div>

                {/* Sub-toolbar Controls: Persona Switcher, Color Swatches, Zoom */}
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#102b2b]/10 bg-white/90 px-6 py-2.5 shrink-0 text-xs">
                    {/* Persona Toggle */}
                    <div className="flex items-center gap-2">
                        <span className="font-bold uppercase text-[#52716a] text-[10px] tracking-wider flex items-center gap-1">
                            <UserCheck className="h-3.5 w-3.5 text-[#0d8274]" />
                            Sample Industry:
                        </span>
                        <div className="flex gap-1">
                            {Object.values(SAMPLE_PERSONAS).map((p) => (
                                <button
                                    key={p.id}
                                    type="button"
                                    onClick={() => setSelectedPersonaKey(p.id)}
                                    className={cn(
                                        "px-2.5 py-1 text-xs font-medium transition-all rounded-none border",
                                        selectedPersonaKey === p.id
                                            ? "bg-[#102b2b] text-white border-[#102b2b] font-bold"
                                            : "bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100"
                                    )}
                                >
                                    {p.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Color Swatches */}
                    <div className="flex items-center gap-2">
                        <span className="font-bold uppercase text-[#52716a] text-[10px] tracking-wider flex items-center gap-1">
                            <Palette className="h-3.5 w-3.5 text-[#0d8274]" />
                            Color Theme:
                        </span>
                        <div className="flex items-center gap-1.5">
                            {PREVIEW_COLORS.map((c) => (
                                <button
                                    key={c.value}
                                    type="button"
                                    title={c.name}
                                    onClick={() => setCustomColor(c.value)}
                                    className={cn(
                                        "h-6 w-6 rounded-none border border-black/20 transition-transform hover:scale-110 flex items-center justify-center",
                                        customColor === c.value && "ring-2 ring-[#102b2b] ring-offset-1 font-bold"
                                    )}
                                    style={{ backgroundColor: c.value }}
                                >
                                    {customColor === c.value && <Check className="h-3 w-3 text-white" />}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Zoom Controls */}
                    <div className="flex items-center gap-1.5 font-mono text-xs">
                        <Button
                            variant="outline"
                            size="icon"
                            onClick={handleZoomOut}
                            disabled={zoomLevel <= 0.5}
                            className="h-7 w-7 rounded-none border-gray-300"
                        >
                            <ZoomOut className="h-3.5 w-3.5" />
                        </Button>
                        <span className="min-w-[42px] text-center font-bold text-gray-700">
                            {Math.round(zoomLevel * 100)}%
                        </span>
                        <Button
                            variant="outline"
                            size="icon"
                            onClick={handleZoomIn}
                            disabled={zoomLevel >= 1.25}
                            className="h-7 w-7 rounded-none border-gray-300"
                        >
                            <ZoomIn className="h-3.5 w-3.5" />
                        </Button>
                    </div>
                </div>

                {/* Main Scrollable High-Res Document Preview Area */}
                <div className="relative grow overflow-y-auto overflow-x-auto bg-gray-200/80 p-8 flex justify-center">
                    <div
                        style={{
                            transform: `scale(${zoomLevel})`,
                            transformOrigin: "top center",
                            transition: "transform 0.15s ease-out",
                            width: "820px",
                        }}
                        className="bg-white shadow-2xl mb-12 border border-gray-300"
                    >
                        <ResumePreview data={previewData} readOnly />
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
