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
import { Switch } from "@/components/ui/switch";
import { Plus, Trash2, GripVertical, CalendarIcon, Sparkles, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
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
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { useState } from "react";

export function WorkExperienceForm() {
    const { workExperiences, addWorkExperience, updateWorkExperience, removeWorkExperience } = useResumeStore();
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
                    type: "description",
                }),
            });

            if (!response.ok) throw new Error("Failed to improve description");

            const { improved } = await response.json();
            updateWorkExperience(id, { description: improved });
            toast.success("Description improved!");
        } catch {
            toast.error("Failed to improve description");
        } finally {
            setImprovingId(null);
        }
    };

    const handleAdd = () => {
        addWorkExperience({
            company: "",
            position: "",
            location: "",
            start_date: "",
            end_date: "",
            is_current: false,
            description: "",
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
            const oldIndex = workExperiences.findIndex((item) => item.id === active.id);
            const newIndex = workExperiences.findIndex((item) => item.id === over.id);

            const newItems = arrayMove(workExperiences, oldIndex, newIndex);

            // Update display_order based on new index
            const updatedItems = newItems.map((item, index) => ({
                ...item,
                display_order: index,
            }));

            // We need to update the whole list in the store
            // Since useResumeStore provides setWorkExperiences, we use that.
            // Note: Update logic needs to be careful not to trigger save immediately if we want to batch, 
            // but setWorkExperiences sets hasChanges=true which is fine.
            useResumeStore.getState().setWorkExperiences(updatedItems);
        }
    }

    return (
        <Card className="rounded-none border-[#102b2b]/15 bg-[#f8f4ec] shadow-[4px_4px_0_rgba(16,43,43,0.06)]">
            <CardHeader className="bg-[#e9eee8] border-b border-[#102b2b]/10 py-4">
                <CardTitle className="text-sm font-black uppercase tracking-tight text-[#102b2b]">Work Experience</CardTitle>
                <CardDescription className="text-xs text-[#52716a] font-semibold mt-1">
                    Add your professional experience starting with the most recent
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
                            items={workExperiences}
                            strategy={verticalListSortingStrategy}
                        >
                            {workExperiences.map((exp, index) => (
                                <SortableAccordionItem key={exp.id} id={exp.id} value={exp.id} className="border border-[#102b2b]/10 rounded-none px-4 bg-white/80 shadow-sm">
                                    <div className="flex items-center py-2.5">
                                        <SortableDragHandle className="mr-2 text-[#52716a]" />
                                        <AccordionTrigger className="flex-1 hover:no-underline py-1">
                                            <div className="text-left">
                                                <div className="font-bold text-sm text-[#102b2b]">
                                                    {exp.company || "New Position"}
                                                </div>
                                                <div className="text-xs text-[#52716a] font-medium">
                                                    {exp.position || "Title"}
                                                </div>
                                            </div>
                                        </AccordionTrigger>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => removeWorkExperience(exp.id)}
                                            className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/5 rounded-none"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                    <AccordionContent className="pt-4 pb-4 space-y-4">
                                        <div className="grid gap-4 sm:grid-cols-2">
                                            <div className="space-y-2">
                                                <Label htmlFor={`company-${exp.id}`}>Company Name</Label>
                                                <Input
                                                    id={`company-${exp.id}`}
                                                    value={exp.company}
                                                    onChange={(e) =>
                                                        updateWorkExperience(exp.id, { company: e.target.value })
                                                    }
                                                    placeholder="e.g. Acme Corp"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor={`position-${exp.id}`}>Position Title</Label>
                                                <Input
                                                    id={`position-${exp.id}`}
                                                    value={exp.position}
                                                    onChange={(e) =>
                                                        updateWorkExperience(exp.id, { position: e.target.value })
                                                    }
                                                    placeholder="e.g. Senior Developer"
                                                />
                                            </div>
                                        </div>

                                        <div className="grid gap-4 sm:grid-cols-2">
                                            <div className="space-y-2">
                                                <Label htmlFor={`start-date-${exp.id}`}>Start Date</Label>
                                                <Input
                                                    id={`start-date-${exp.id}`}
                                                    type="month"
                                                    value={exp.start_date || ""}
                                                    onChange={(e) =>
                                                        updateWorkExperience(exp.id, { start_date: e.target.value })
                                                    }
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor={`end-date-${exp.id}`}>End Date</Label>
                                                <div className="space-y-2">
                                                    <Input
                                                        id={`end-date-${exp.id}`}
                                                        type="month"
                                                        value={exp.end_date || ""}
                                                        disabled={exp.is_current}
                                                        onChange={(e) =>
                                                            updateWorkExperience(exp.id, { end_date: e.target.value })
                                                        }
                                                    />
                                                    <div className="flex items-center space-x-2">
                                                        <Switch
                                                            id={`is-current-${exp.id}`}
                                                            checked={exp.is_current}
                                                            onCheckedChange={(checked) =>
                                                                updateWorkExperience(exp.id, {
                                                                    is_current: checked,
                                                                    end_date: checked ? null : exp.end_date,
                                                                })
                                                            }
                                                        />
                                                        <Label htmlFor={`is-current-${exp.id}`}>I currently work here</Label>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor={`location-${exp.id}`}>Location</Label>
                                            <Input
                                                id={`location-${exp.id}`}
                                                value={exp.location || ""}
                                                onChange={(e) =>
                                                    updateWorkExperience(exp.id, { location: e.target.value })
                                                }
                                                placeholder="e.g. San Francisco, CA"
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <div className="flex items-center justify-between">
                                                <Label>Description</Label>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleImproveDescription(exp.id, exp.description || "")}
                                                    disabled={improvingId === exp.id || !exp.description}
                                                    className="h-8 gap-1 text-xs"
                                                >
                                                    {improvingId === exp.id ? (
                                                        <Loader2 className="h-3 w-3 animate-spin" />
                                                    ) : (
                                                        <Sparkles className="h-3 w-3" />
                                                    )}
                                                    Improve with AI
                                                </Button>
                                            </div>
                                            <RichTextEditor
                                                content={exp.description || ""}
                                                onChange={(content) =>
                                                    updateWorkExperience(exp.id, { description: content })
                                                }
                                                placeholder="Describe your responsibilities and achievements..."
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
                    Add Position
                </Button>
            </CardContent>
        </Card >
    );
}
