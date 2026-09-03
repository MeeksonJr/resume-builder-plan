"use client";

import React, { useState } from "react";
import { TemplateDefinition } from "@/lib/templates/template-registry";
import { PersonaData, DEFAULT_SAMPLE_PERSONA } from "@/lib/templates/sample-personas";
import { ResumePreview } from "@/components/editor/resume-preview";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, Eye, ShieldCheck, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

interface TemplateCardProps {
    template: TemplateDefinition;
    persona?: PersonaData;
    isSelected: boolean;
    onSelect: (template: TemplateDefinition) => void;
    onInspect: (template: TemplateDefinition) => void;
}

export function TemplateCard({
    template,
    persona = DEFAULT_SAMPLE_PERSONA,
    isSelected,
    onSelect,
    onInspect,
}: TemplateCardProps) {
    const [isHovered, setIsHovered] = useState(false);

    // Mock resume data object structured exactly like the real store
    const previewData = {
        resume: {
            template: template.id,
            visual_config: template.defaultVisualConfig,
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

    return (
        <div
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            className={cn(
                "group relative flex flex-col overflow-hidden border bg-white transition-all duration-300 rounded-none shadow-sm hover:shadow-xl",
                isSelected
                    ? "border-2 border-[#102b2b] ring-4 ring-[#d8f36b]/40"
                    : "border-[#102b2b]/15 hover:border-[#102b2b]/40"
            )}
        >
            {/* Top Bar / Header of Card */}
            <div className="flex items-center justify-between border-b border-[#102b2b]/10 bg-[#f8f4ec] px-4 py-2.5">
                <div className="flex items-center gap-2">
                    <span className="text-xs font-black uppercase tracking-tight text-[#102b2b]">
                        {template.name}
                    </span>
                    {template.badge && (
                        <Badge
                            variant="secondary"
                            className="rounded-none bg-[#d8f36b] text-[#102b2b] text-[9.5px] font-extrabold uppercase px-1.5 py-0 border-none shadow-none"
                        >
                            {template.badge}
                        </Badge>
                    )}
                </div>
                <div className="flex items-center gap-1.5 text-[#0d8274]">
                    <ShieldCheck className="h-3.5 w-3.5 shrink-0" />
                    <span className="text-[10px] font-mono font-bold">{template.atsScore}% ATS</span>
                </div>
            </div>

            {/* Scrollable Live Interactive Preview Box */}
            <div className="relative h-[480px] w-full overflow-hidden bg-gray-100 cursor-pointer" onClick={() => onInspect(template)}>
                {/* Scrollable viewport */}
                <div className="absolute inset-0 overflow-y-auto overflow-x-hidden scrollbar-thin scrollbar-thumb-[#102b2b]/20 hover:scrollbar-thumb-[#102b2b]/40">
                    <div className="flex justify-center p-3">
                        <div
                            className="origin-top scale-[0.46] sm:scale-[0.52] w-[800px] min-h-[1056px] shadow-lg pointer-events-none transition-transform duration-200 group-hover:scale-[0.48] sm:group-hover:scale-[0.54]"
                        >
                            <ResumePreview data={previewData} readOnly />
                        </div>
                    </div>
                </div>

                {/* Floating "Scrollable Preview" hint */}
                <div className="absolute top-2 right-2 pointer-events-none opacity-80 group-hover:opacity-100 transition-opacity">
                    <span className="bg-[#102b2b]/80 backdrop-blur-xs text-[#f8f4ec] text-[9.5px] font-mono px-2 py-0.5 rounded-none shadow-xs">
                        Scroll to view full page
                    </span>
                </div>

                {/* Action Hover Overlay */}
                <div
                    className={cn(
                        "absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-[#102b2b]/90 via-[#102b2b]/60 to-transparent flex items-center justify-center gap-3 transition-opacity duration-200",
                        isHovered || isSelected ? "opacity-100" : "opacity-0 pointer-events-none"
                    )}
                    onClick={(e) => e.stopPropagation()}
                >
                    <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => onInspect(template)}
                        className="rounded-none bg-white/95 text-[#102b2b] hover:bg-white text-xs font-bold gap-1.5 shadow-md h-9"
                    >
                        <Eye className="h-3.5 w-3.5" />
                        Inspect Fullscreen
                    </Button>
                    <Button
                        size="sm"
                        onClick={() => onSelect(template)}
                        className={cn(
                            "rounded-none text-xs font-bold gap-1.5 shadow-md h-9",
                            isSelected
                                ? "bg-[#d8f36b] text-[#102b2b] hover:bg-[#c9e95c]"
                                : "bg-[#102b2b] text-[#f8f4ec] hover:bg-[#1a3d3d]"
                        )}
                    >
                        {isSelected ? (
                            <>
                                <Check className="h-3.5 w-3.5" />
                                Selected
                            </>
                        ) : (
                            <>
                                <Sparkles className="h-3.5 w-3.5 text-[#d8f36b]" />
                                Use Template
                            </>
                        )}
                    </Button>
                </div>
            </div>

            {/* Bottom Details Footer */}
            <div className="flex flex-col gap-2 p-4 border-t border-[#102b2b]/10 bg-white">
                <p className="text-xs text-[#52716a] line-clamp-2 leading-relaxed">
                    {template.description}
                </p>
                <div className="flex flex-wrap gap-1 pt-1">
                    {template.recommendedFor.slice(0, 3).map((role) => (
                        <span
                            key={role}
                            className="text-[9.5px] font-semibold text-[#102b2b]/70 bg-[#f8f4ec] px-2 py-0.5 border border-[#102b2b]/10"
                        >
                            {role}
                        </span>
                    ))}
                </div>
            </div>
        </div>
    );
}
