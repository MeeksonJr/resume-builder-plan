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
        <Card>
            <CardHeader>
                <CardTitle>Education</CardTitle>
                <CardDescription>
                    Add your educational background
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragEnd={handleDragEnd}
                >
                    <Accordion type="single" collapsible className="w-full space-y-4">
                        <SortableContext
                            items={education}
                            strategy={verticalListSortingStrategy}
                        >
                            {education.map((edu, index) => (
                                <SortableAccordionItem key={edu.id} id={edu.id} value={edu.id} className="border rounded-lg px-4 bg-white">
                                    <div className="flex items-center py-2">
                                        <SortableDragHandle className="mr-2" />
                                        <AccordionTrigger className="flex-1 hover:no-underline py-2">
                                            <div className="text-left">
                                                <div className="font-semibold">
                                                    {edu.institution || "New Education"}
                                                </div>
                                                <div className="text-sm text-muted-foreground">
                                                    {edu.degree || "Degree"}
                                                </div>
                                            </div>
                                        </AccordionTrigger>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => removeEducation(edu.id)}
                                            className="text-destructive hover:text-destructive/90"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                    <AccordionContent className="pt-4 pb-4 space-y-4">
                                        <div className="grid gap-4 sm:grid-cols-2">
                                            <div className="space-y-2">
                                                <Label>Institution</Label>
                                                <Input
                                                    value={edu.institution}
                                                    onChange={(e) =>
                                                        updateEducation(edu.id, { institution: e.target.value })
                                                    }
                                                    placeholder="e.g. University of California"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label>Location</Label>
                                                <Input
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
                                                <Label>Degree</Label>
                                                <Input
                                                    value={edu.degree || ""}
                                                    onChange={(e) =>
                                                        updateEducation(edu.id, { degree: e.target.value })
                                                    }
                                                    placeholder="e.g. Bachelor of Science"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label>Field of Study</Label>
                                                <Input
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
                                                <Label>Start Date</Label>
                                                <Input
                                                    type="month"
                                                    value={edu.start_date || ""}
                                                    onChange={(e) =>
                                                        updateEducation(edu.id, { start_date: e.target.value })
                                                    }
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label>End Date</Label>
                                                <Input
                                                    type="month"
                                                    value={edu.end_date || ""}
                                                    onChange={(e) =>
                                                        updateEducation(edu.id, { end_date: e.target.value })
                                                    }
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <Label>GPA</Label>
                                            <Input
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
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
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

                <Button onClick={handleAdd} className="w-full">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Education
                </Button>
            </CardContent>
        </Card>
    );
}
