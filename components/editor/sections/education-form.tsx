"use client";

import { useResumeStore } from "@/lib/stores/resume-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import dynamic from "next/dynamic";
const RichTextEditor = dynamic(() => import("../rich-text-editor").then(mod => mod.RichTextEditor), {
    ssr: false,
    loading: () => <div className="h-[150px] w-full animate-pulse rounded-md bg-muted/50" />
});
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

export function EducationForm() {
    const { education, addEducation, updateEducation, removeEducation } = useResumeStore();
    const [improvingId, setImprovingId] = useState<string | null>(null);

    const handleImproveHighlights = async (id: string, text: string) => {
        if (!text) {
            toast.error("Please write some highlights first");
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
                }),
            });

            if (!response.ok) throw new Error("Failed to improve highlights");

            const { improved } = await response.json();
            updateEducation(id, { highlights: [improved] }); // For now, handle as single block or split if needed
            toast.success("Highlights improved!");
        } catch {
            toast.error("Failed to improve highlights");
        } finally {
            setImprovingId(null);
        }
    };

    const handleAdd = () => {
        addEducation({
            institution: "",
            degree: "",
            field_of_study: "",
            location: "",
            start_date: "",
            end_date: "",
            gpa: "",
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
            const oldIndex = education.findIndex((item) => item.id === active.id);
            const newIndex = education.findIndex((item) => item.id === over.id);

            const newItems = arrayMove(education, oldIndex, newIndex);

            // Update display_order based on new index
            const updatedItems = newItems.map((item, index) => ({
                ...item,
                display_order: index,
            }));

            useResumeStore.getState().setEducation(updatedItems);
        }
    }

    return (
        <Card className="rounded-none border-[#102b2b]/15 bg-[#f8f4ec] shadow-[4px_4px_0_rgba(16,43,43,0.06)]">
            <CardHeader className="bg-[#e9eee8] border-b border-[#102b2b]/10 py-4">
                <CardTitle className="text-sm font-black uppercase tracking-tight text-[#102b2b]">Education</CardTitle>
                <CardDescription className="text-xs text-[#52716a] font-semibold mt-1">
                    Add your educational background
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
                            items={education}
                            strategy={verticalListSortingStrategy}
                        >
                            {education.map((edu, index) => (
                                <SortableAccordionItem key={edu.id} id={edu.id} value={edu.id} className="border border-[#102b2b]/10 rounded-none px-4 bg-white/80 shadow-sm">
                                    <div className="flex items-center py-2.5">
                                        <SortableDragHandle className="mr-2 text-[#52716a]" />
                                        <AccordionTrigger className="flex-1 hover:no-underline py-1">
                                            <div className="text-left">
                                                <div className="font-bold text-sm text-[#102b2b]">
                                                    {edu.institution || "New Education"}
                                                </div>
                                                <div className="text-xs text-[#52716a] font-medium">
                                                    {edu.degree || "Degree"}
                                                </div>
                                            </div>
                                        </AccordionTrigger>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => removeEducation(edu.id)}
                                            className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/5 rounded-none"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                    <AccordionContent className="pt-4 pb-4 space-y-4">
                                        <div className="grid gap-4 sm:grid-cols-2">
                                            <div className="space-y-2">
                                                <Label htmlFor={`institution-${edu.id}`}>Institution</Label>
                                                <Input
                                                    id={`institution-${edu.id}`}
                                                    value={edu.institution}
                                                    onChange={(e) =>
                                                        updateEducation(edu.id, { institution: e.target.value })
                                                    }
                                                    placeholder="e.g. University of California"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor={`location-${edu.id}`}>Location</Label>
                                                <Input
                                                    id={`location-${edu.id}`}
                                                    value={edu.location || ""}
                                                    onChange={(e) =>
                                                        updateEducation(edu.id, { location: e.target.value })
                                                    }
                                                    placeholder="e.g. Berkeley, CA"
                                                />
                                            </div>
                                        </div>

                                        <div className="grid gap-4 sm:grid-cols-2">
                                            <div className="space-y-2">
                                                <Label htmlFor={`degree-${edu.id}`}>Degree</Label>
                                                <Input
                                                    id={`degree-${edu.id}`}
                                                    value={edu.degree || ""}
                                                    onChange={(e) =>
                                                        updateEducation(edu.id, { degree: e.target.value })
                                                    }
                                                    placeholder="e.g. Bachelor of Science"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor={`field-of-study-${edu.id}`}>Field of Study</Label>
                                                <Input
                                                    id={`field-of-study-${edu.id}`}
                                                    value={edu.field_of_study || ""}
                                                    onChange={(e) =>
                                                        updateEducation(edu.id, { field_of_study: e.target.value })
                                                    }
                                                    placeholder="e.g. Computer Science"
                                                />
                                            </div>
                                        </div>

                                        <div className="grid gap-4 sm:grid-cols-2">
                                            <div className="space-y-2">
                                                <Label htmlFor={`start-date-${edu.id}`}>Start Date</Label>
                                                <Input
                                                    id={`start-date-${edu.id}`}
                                                    type="month"
                                                    value={edu.start_date || ""}
                                                    onChange={(e) =>
                                                        updateEducation(edu.id, { start_date: e.target.value })
                                                    }
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor={`end-date-${edu.id}`}>End Date</Label>
                                                <Input
                                                    id={`end-date-${edu.id}`}
                                                    type="month"
                                                    value={edu.end_date || ""}
                                                    onChange={(e) =>
                                                        updateEducation(edu.id, { end_date: e.target.value })
                                                    }
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor={`gpa-${edu.id}`}>GPA</Label>
                                            <Input
                                                id={`gpa-${edu.id}`}
                                                value={edu.gpa || ""}
                                                onChange={(e) =>
                                                    updateEducation(edu.id, { gpa: e.target.value })
                                                }
                                                placeholder="e.g. 3.8"
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <div className="flex items-center justify-between">
                                                <Label>Highlights / Achievements</Label>
                                                <div className="flex items-center gap-2">
                                                    <CanvasSuggestions
                                                        onImport={(formattedText) => {
                                                            const currentText = edu.highlights?.join("\n") || "";
                                                            const newText = currentText
                                                                ? `${currentText}\n${formattedText}`
                                                                : formattedText;
                                                            updateEducation(edu.id, { highlights: [newText] });
                                                        }}
                                                    />
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        type="button"
                                                        onClick={() => handleImproveHighlights(edu.id, edu.highlights?.join("\n") || "")}
                                                        disabled={improvingId === edu.id || !edu.highlights?.length}
                                                        className="h-8 gap-1 text-xs"
                                                    >
                                                        {improvingId === edu.id ? (
                                                            <Loader2 className="h-3 w-3 animate-spin" />
                                                        ) : (
                                                            <Sparkles className="h-3 w-3" />
                                                        )}
                                                        Improve with AI
                                                    </Button>
                                                </div>
                                            </div>
                                            <RichTextEditor
                                                content={edu.highlights?.join("\n") || ""}
                                                onChange={(content) =>
                                                    updateEducation(edu.id, { highlights: [content] })
                                                }
                                                placeholder="Relevant coursework, honors, or activities..."
                                            />
                                        </div>
                                    </AccordionContent>
                                </SortableAccordionItem>
                            ))}
                        </SortableContext>
                    </Accordion>
                </DndContext>

                <Button onClick={handleAdd} className="w-full h-10 rounded-none bg-[#102b2b] hover:bg-[#0d8274] text-white font-bold">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Education
                </Button>
            </CardContent>
        </Card>
    );
}
