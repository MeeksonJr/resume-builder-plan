"use client";

import { useResumeStore } from "@/lib/stores/resume-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import dynamic from "next/dynamic";

const RichTextEditor = dynamic(() => import("../rich-text-editor").then(mod => mod.RichTextEditor), {
    ssr: false,
    loading: () => <div className="h-[150px] w-full animate-pulse rounded-md bg-muted/50" />
});
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";
import { Plus, Trash2, GripVertical, Sparkles, Loader2 } from "lucide-react";
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragEndEvent,
} from "@dnd-kit/core";
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { SortableAccordionItem, SortableDragHandle } from "../sortable-accordion";
import { useState } from "react";
import { toast } from "sonner";
import { CanvasSuggestions } from "../canvas-suggestions";
import { ACTION_VERBS, METRIC_REGEX } from "@/lib/utils/resume-strength";

export function ProjectsForm() {
    const { projects, addProject, updateProject, removeProject } = useResumeStore();
    const [improvingId, setImprovingId] = useState<string | null>(null);

    const handleImproveDescription = async (id: string, text: string) => {
        if (!text) {
            toast.error("Please write a description first");
            return;
        }

        setImprovingId(id);
        try {
            const response = await fetch("/api/ai/improve", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    text,
                    type: "bullet",
                    context: "Rewrite this project overview and highlights into high-impact STAR resume bullet points (Situation, Task, Action, Result) showcasing engineering decisions, technical scope, and quantifiable results.",
                }),
            });

            if (!response.ok) throw new Error("Failed to improve description");

            const { improved } = await response.json();
            updateProject(id, { description: improved });
            toast.success("Polished project with STAR formula!");
        } catch {
            toast.error("Failed to improve description");
        } finally {
            setImprovingId(null);
        }
    };

    const handleAdd = () => {
        addProject({
            name: "",
            description: "",
            technologies: [],
            url: "",
            highlights: [],
        });
    };

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    function handleDragEnd(event: DragEndEvent) {
        const { active, over } = event;

        if (over && active.id !== over.id) {
            const oldIndex = projects.findIndex((item) => item.id === active.id);
            const newIndex = projects.findIndex((item) => item.id === over.id);

            const newItems = arrayMove(projects, oldIndex, newIndex);

            const updatedItems = newItems.map((item, index) => ({
                ...item,
                display_order: index,
            }));

            useResumeStore.getState().setProjects(updatedItems);
        }
    }

    return (
        <Card className="rounded-none border-[#102b2b]/15 bg-[#f8f4ec] shadow-[4px_4px_0_rgba(16,43,43,0.06)]">
            <CardHeader className="bg-[#e9eee8] border-b border-[#102b2b]/10 py-4">
                <CardTitle className="text-sm font-black uppercase tracking-tight text-[#102b2b]">Projects</CardTitle>
                <CardDescription className="text-xs text-[#52716a] font-semibold mt-1">
                    Showcase your personal or professional projects
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 p-5">
                <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragEnd={handleDragEnd}
                >
                    <Accordion type="single" collapsible className="w-full space-y-3">
                        <SortableContext
                            items={projects}
                            strategy={verticalListSortingStrategy}
                        >
                            {projects.map((proj, index) => (
                                <SortableAccordionItem key={proj.id} id={proj.id} value={proj.id} className="border border-[#102b2b]/10 rounded-none px-4 bg-white/80 shadow-sm">
                                    <div className="flex items-center py-2.5">
                                        <SortableDragHandle className="mr-2 text-[#52716a]" />
                                        <AccordionTrigger className="flex-1 hover:no-underline py-1">
                                            <div className="text-left">
                                                <div className="font-bold text-sm text-[#102b2b]">
                                                    {proj.name || "New Project"}
                                                </div>
                                            </div>
                                        </AccordionTrigger>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => removeProject(proj.id)}
                                            className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/5 rounded-none"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                    <AccordionContent className="pt-4 pb-4 space-y-4">
                                        <div className="space-y-2">
                                            <Label>Project Name</Label>
                                            <Input
                                                value={proj.name}
                                                onChange={(e) =>
                                                    updateProject(proj.id, { name: e.target.value })
                                                }
                                                placeholder="e.g. Resume Builder"
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label>Project URL</Label>
                                            <Input
                                                value={proj.url || ""}
                                                onChange={(e) =>
                                                    updateProject(proj.id, { url: e.target.value })
                                                }
                                                placeholder="e.g. https://github.com/..."
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label>Technologies (comma separated)</Label>
                                            <Input
                                                value={proj.technologies.join(", ")}
                                                onChange={(e) =>
                                                    updateProject(proj.id, {
                                                        technologies: e.target.value.split(",").map((s) => s.trim()).filter(Boolean),
                                                    })
                                                }
                                                placeholder="e.g. React, Node.js, TypeScript"
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <div className="flex items-center justify-between">
                                                <Label>Description</Label>
                                                <div className="flex items-center gap-2">
                                                    <CanvasSuggestions
                                                        onImport={(formattedText) => {
                                                            const currentText = proj.description || "";
                                                            const newText = currentText
                                                                ? `${currentText}\n${formattedText}`
                                                                : formattedText;
                                                            updateProject(proj.id, { description: newText });
                                                        }}
                                                    />
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        type="button"
                                                        onClick={() => handleImproveDescription(proj.id, proj.description || "")}
                                                        disabled={improvingId === proj.id || !proj.description}
                                                        className="h-8 gap-1.5 rounded-none border-[#102b2b]/20 bg-[#102b2b] text-[#d8f36b] hover:bg-[#0d8274] hover:text-white text-xs font-bold"
                                                    >
                                                        {improvingId === proj.id ? (
                                                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                                        ) : (
                                                            <Sparkles className="h-3.5 w-3.5" />
                                                        )}
                                                        ✨ Polish with STAR (AI)
                                                    </Button>
                                                </div>
                                            </div>
                                            <RichTextEditor
                                                content={proj.description || ""}
                                                onChange={(content) =>
                                                    updateProject(proj.id, { description: content })
                                                }
                                                placeholder="Describe what you built..."
                                            />
                                            {/* Live ATS Signals */}
                                            {(() => {
                                                const cleanText = (proj.description || "").replace(/<[^>]*>/g, " ");
                                                const detectedVerbs = ACTION_VERBS.filter(v => new RegExp(`\\b${v}\\b`, "i").test(cleanText));
                                                const hasMetric = METRIC_REGEX.test(cleanText);

                                                return (
                                                    <div className="flex flex-wrap items-center gap-2 pt-1">
                                                        <span className="text-[10px] font-bold uppercase tracking-wider text-[#52716a]">
                                                            Live Signals:
                                                        </span>
                                                        <span className={`inline-flex items-center gap-1 font-mono text-[10px] px-2 py-0.5 border ${
                                                            detectedVerbs.length >= 2
                                                                ? "border-[#0d8274]/30 bg-[#0d8274]/10 text-[#0d8274] font-bold"
                                                                : "border-[#102b2b]/15 bg-[#f8f4ec] text-[#52716a]"
                                                        }`}>
                                                            {detectedVerbs.length >= 2 ? "✓" : "•"} {detectedVerbs.length} Action Verbs
                                                            {detectedVerbs.length > 0 && ` (${detectedVerbs.slice(0, 2).join(", ")})`}
                                                        </span>
                                                        <span className={`inline-flex items-center gap-1 font-mono text-[10px] px-2 py-0.5 border ${
                                                            hasMetric
                                                                ? "border-[#0d8274]/30 bg-[#0d8274]/10 text-[#0d8274] font-bold"
                                                                : "border-amber-500/30 bg-amber-50 text-amber-800"
                                                        }`}>
                                                            {hasMetric ? "✓ Metric Quantified" : "⚠️ Add Metric (scale, speed, users)"}
                                                        </span>
                                                    </div>
                                                );
                                            })()}
                                        </div>
                                    </AccordionContent>
                                </SortableAccordionItem>
                            ))}
                        </SortableContext>
                    </Accordion>
                </DndContext>

                <Button onClick={handleAdd} className="w-full h-10 rounded-none bg-[#102b2b] hover:bg-[#0d8274] text-white font-bold">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Project
                </Button>
            </CardContent>
        </Card>
    );
}
