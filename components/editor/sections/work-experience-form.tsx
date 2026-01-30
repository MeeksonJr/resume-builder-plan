"use client";

import { useResumeStore } from "@/lib/stores/resume-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
import { Plus, Trash2, GripVertical, CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
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

export function WorkExperienceForm() {
    const { workExperiences, addWorkExperience, updateWorkExperience, removeWorkExperience } = useResumeStore();

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
        <Card>
            <CardHeader>
                <CardTitle>Work Experience</CardTitle>
                <CardDescription>
                    Add your professional experience starting with the most recent
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
                            items={workExperiences}
                            strategy={verticalListSortingStrategy}
                        >
                            {workExperiences.map((exp, index) => (
                                <SortableAccordionItem key={exp.id} id={exp.id} value={exp.id} className="border rounded-lg px-4 bg-white">
                                    <div className="flex items-center py-2">
                                        <SortableDragHandle className="mr-2" />
                                        <AccordionTrigger className="flex-1 hover:no-underline py-2">
                                            <div className="text-left">
                                                <div className="font-semibold">
                                                    {exp.company || "New Position"}
                                                </div>
                                                <div className="text-sm text-muted-foreground">
                                                    {exp.position || "Title"}
                                                </div>
                                            </div>
                                        </AccordionTrigger>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => removeWorkExperience(exp.id)}
                                            className="text-destructive hover:text-destructive/90"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                    <AccordionContent className="pt-4 pb-4 space-y-4">
                                        <div className="grid gap-4 sm:grid-cols-2">
                                            <div className="space-y-2">
                                                <Label>Company Name</Label>
                                                <Input
                                                    value={exp.company}
                                                    onChange={(e) =>
                                                        updateWorkExperience(exp.id, { company: e.target.value })
                                                    }
                                                    placeholder="e.g. Acme Corp"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label>Position Title</Label>
                                                <Input
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
                                                <Label>Start Date</Label>
                                                <Input
                                                    type="month"
                                                    value={exp.start_date || ""}
                                                    onChange={(e) =>
                                                        updateWorkExperience(exp.id, { start_date: e.target.value })
                                                    }
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label>End Date</Label>
                                                <div className="space-y-2">
                                                    <Input
                                                        type="month"
                                                        value={exp.end_date || ""}
                                                        disabled={exp.is_current}
                                                        onChange={(e) =>
                                                            updateWorkExperience(exp.id, { end_date: e.target.value })
                                                        }
                                                    />
                                                    <div className="flex items-center space-x-2">
                                                        <Switch
                                                            checked={exp.is_current}
                                                            onCheckedChange={(checked) =>
                                                                updateWorkExperience(exp.id, {
                                                                    is_current: checked,
                                                                    end_date: checked ? null : exp.end_date,
                                                                })
                                                            }
                                                        />
                                                        <Label>I currently work here</Label>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <Label>Location</Label>
                                            <Input
                                                value={exp.location || ""}
                                                onChange={(e) =>
                                                    updateWorkExperience(exp.id, { location: e.target.value })
                                                }
                                                placeholder="e.g. San Francisco, CA"
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label>Description</Label>
                                            <Textarea
                                                value={exp.description || ""}
                                                onChange={(e) =>
                                                    updateWorkExperience(exp.id, { description: e.target.value })
                                                }
                                                placeholder="Describe your responsibilities and achievements..."
                                                className="min-h-[100px]"
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
                    Add Position
                </Button>
            </CardContent>
        </Card >
    );
}
