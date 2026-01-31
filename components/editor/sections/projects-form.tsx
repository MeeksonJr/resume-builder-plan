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
import { Plus, Trash2, GripVertical } from "lucide-react";
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

export function ProjectsForm() {
    const { projects, addProject, updateProject, removeProject } = useResumeStore();

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
        <Card>
            <CardHeader>
                <CardTitle>Projects</CardTitle>
                <CardDescription>
                    Showcase your personal or professional projects
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
                            items={projects}
                            strategy={verticalListSortingStrategy}
                        >
                            {projects.map((proj, index) => (
                                <SortableAccordionItem key={proj.id} id={proj.id} value={proj.id} className="border rounded-lg px-4 bg-white">
                                    <div className="flex items-center py-2">
                                        <SortableDragHandle className="mr-2" />
                                        <AccordionTrigger className="flex-1 hover:no-underline py-2">
                                            <div className="text-left">
                                                <div className="font-semibold">
                                                    {proj.name || "New Project"}
                                                </div>
                                            </div>
                                        </AccordionTrigger>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => removeProject(proj.id)}
                                            className="text-destructive hover:text-destructive/90"
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
                                            <Label>Description</Label>
                                            <RichTextEditor
                                                content={proj.description || ""}
                                                onChange={(content) =>
                                                    updateProject(proj.id, { description: content })
                                                }
                                                placeholder="Describe what you built..."
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
                    Add Project
                </Button>
            </CardContent>
        </Card>
    );
}
