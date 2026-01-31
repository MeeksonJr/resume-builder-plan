"use client"

import * as React from "react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Check } from "lucide-react"
import { cn } from "@/lib/utils"

const templates = [
    {
        id: "modern",
        name: "Modern",
        description: "Glassmorphism design with vibrant gradients",
        color: "from-blue-500 to-purple-600",
        preview: "/templates/modern-preview.png",
        tags: ["Tech", "Creative"],
    },
    {
        id: "minimal",
        name: "Minimal",
        description: "Clean typography-focused design",
        color: "from-slate-700 to-slate-900",
        preview: "/templates/minimal-preview.png",
        tags: ["Professional", "Simple"],
    },
    {
        id: "corporate",
        name: "Corporate",
        description: "Professional business-oriented layout",
        color: "from-blue-600 to-blue-800",
        preview: "/templates/corporate-preview.png",
        tags: ["Business", "Formal"],
    },
    {
        id: "creative",
        name: "Creative",
        description: "Bold colors and playful design",
        color: "from-pink-500 to-orange-500",
        preview: "/templates/creative-preview.png",
        tags: ["Artistic", "Bold"],
    },
]

interface TemplateSelectorProps {
    selected: string
    onSelect: (templateId: string) => void
}

export function TemplateSelector({ selected, onSelect }: TemplateSelectorProps) {
    return (
        <div className="space-y-4">
            <div>
                <h3 className="text-lg font-heading font-black">Choose Your Template</h3>
                <p className="text-sm text-muted-foreground">
                    Select a design that matches your style. You can switch templates anytime.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {templates.map((template) => (
                    <Card
                        key={template.id}
                        className={cn(
                            "cursor-pointer border-2 transition-all hover:shadow-lg",
                            selected === template.id
                                ? "border-primary bg-primary/5"
                                : "border-transparent hover:border-primary/50"
                        )}
                        onClick={() => onSelect(template.id)}
                    >
                        <div className="p-4 space-y-3">
                            {/* Template Preview */}
                            <div className="relative aspect-video rounded-lg overflow-hidden bg-muted">
                                <div
                                    className={cn(
                                        "absolute inset-0 bg-gradient-to-br opacity-20",
                                        template.color
                                    )}
                                />
                                {/* Simple preview pattern */}
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <div className="space-y-2 w-3/4">
                                        <div className={cn("h-3 rounded bg-gradient-to-r", template.color)} />
                                        <div className="h-2 rounded bg-muted-foreground/20 w-2/3" />
                                        <div className="h-2 rounded bg-muted-foreground/10 w-1/2" />
                                    </div>
                                </div>

                                {/* Selected indicator */}
                                {selected === template.id && (
                                    <div className="absolute top-2 right-2 bg-primary rounded-full p-1">
                                        <Check className="h-3 w-3 text-primary-foreground" />
                                    </div>
                                )}
                            </div>

                            {/* Template Info */}
                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <h4 className="font-heading font-black text-sm">{template.name}</h4>
                                    {selected === template.id && (
                                        <Badge variant="default" className="text-xs">Active</Badge>
                                    )}
                                </div>
                                <p className="text-xs text-muted-foreground line-clamp-2">
                                    {template.description}
                                </p>
                                <div className="flex flex-wrap gap-1">
                                    {template.tags.map((tag) => (
                                        <Badge
                                            key={tag}
                                            variant="secondary"
                                            className="text-[10px] px-1.5 py-0.5"
                                        >
                                            {tag}
                                        </Badge>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </Card>
                ))}
            </div>
        </div>
    )
}
