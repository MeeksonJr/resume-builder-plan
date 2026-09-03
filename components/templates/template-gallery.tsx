"use client";

import React, { useState, useMemo } from "react";
import {
    TEMPLATE_REGISTRY,
    TemplateDefinition,
    TemplateCategory,
} from "@/lib/templates/template-registry";
import { TemplateCard } from "@/components/templates/template-card";
import { TemplateInspectModal } from "@/components/templates/template-inspect-modal";
import { Input } from "@/components/ui/input";
import { Search, SlidersHorizontal, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

interface TemplateGalleryProps {
    selectedTemplateId: string;
    onSelectTemplate: (template: TemplateDefinition, visualConfigOverrides?: any) => void;
}

const CATEGORIES: { id: TemplateCategory; label: string }[] = [
    { id: "all", label: "All Templates" },
    { id: "ats", label: "100% ATS Safe" },
    { id: "tech", label: "Tech & Engineering" },
    { id: "executive", label: "Executive & Senior" },
    { id: "minimal", label: "Minimalist" },
    { id: "creative", label: "Creative & Design" },
];

export function TemplateGallery({
    selectedTemplateId,
    onSelectTemplate,
}: TemplateGalleryProps) {
    const [activeCategory, setActiveCategory] = useState<TemplateCategory>("all");
    const [searchQuery, setSearchQuery] = useState("");
    const [inspectedTemplate, setInspectedTemplate] = useState<TemplateDefinition | null>(null);

    const filteredTemplates = useMemo(() => {
        return TEMPLATE_REGISTRY.filter((t) => {
            // Category check
            const matchesCategory =
                activeCategory === "all" || t.category.includes(activeCategory);

            // Search check
            const query = searchQuery.toLowerCase().trim();
            const matchesSearch =
                !query ||
                t.name.toLowerCase().includes(query) ||
                t.subtitle.toLowerCase().includes(query) ||
                t.description.toLowerCase().includes(query) ||
                t.recommendedFor.some((r) => r.toLowerCase().includes(query));

            return matchesCategory && matchesSearch;
        });
    }, [activeCategory, searchQuery]);

    return (
        <div className="space-y-6">
            {/* Filter and Search Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#102b2b]/15 pb-4">
                {/* Category Pills */}
                <div className="flex flex-wrap gap-1.5">
                    {CATEGORIES.map((cat) => {
                        const isActive = activeCategory === cat.id;
                        return (
                            <button
                                key={cat.id}
                                type="button"
                                onClick={() => setActiveCategory(cat.id)}
                                className={cn(
                                    "px-3.5 py-1.5 text-xs font-bold transition-all rounded-none border",
                                    isActive
                                        ? "bg-[#102b2b] text-[#f8f4ec] border-[#102b2b] shadow-xs"
                                        : "bg-white/80 text-[#52716a] border-[#102b2b]/15 hover:bg-white hover:text-[#102b2b]"
                                )}
                            >
                                {cat.label}
                            </button>
                        );
                    })}
                </div>

                {/* Search Input */}
                <div className="relative w-full sm:w-64">
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-[#52716a]" />
                    <Input
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search templates or roles..."
                        className="pl-9 h-9 rounded-none border-[#102b2b]/15 bg-white/90 text-xs focus-visible:ring-[#102b2b]"
                    />
                </div>
            </div>

            {/* Template Cards Grid */}
            {filteredTemplates.length === 0 ? (
                <div className="text-center py-16 bg-white border border-[#102b2b]/15 p-8 rounded-none">
                    <SlidersHorizontal className="h-8 w-8 text-[#52716a] mx-auto mb-2 opacity-50" />
                    <p className="font-bold text-[#102b2b] text-base">No templates found</p>
                    <p className="text-xs text-[#52716a] mt-1">Try selecting a different category or clearing your search.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredTemplates.map((template) => (
                        <TemplateCard
                            key={template.id}
                            template={template}
                            isSelected={selectedTemplateId === template.id}
                            onSelect={onSelectTemplate}
                            onInspect={setInspectedTemplate}
                        />
                    ))}
                </div>
            )}

            {/* Inspect Modal */}
            <TemplateInspectModal
                template={inspectedTemplate}
                isOpen={!!inspectedTemplate}
                onClose={() => setInspectedTemplate(null)}
                onSelect={(tmpl, visualOverrides) => {
                    onSelectTemplate(tmpl, visualOverrides);
                    setInspectedTemplate(null);
                }}
            />
        </div>
    );
}
