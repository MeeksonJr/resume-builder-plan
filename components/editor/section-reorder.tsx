"use client";

import { useState, useEffect } from "react";
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
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { GripVertical, LayoutList } from "lucide-react";
import { useResumeStore } from "@/lib/stores/resume-store";
import { SortableItem } from "./sortable-item";

const SECTION_LABELS: Record<string, string> = {
    experience: "Work Experience",
    education: "Education",
    skills: "Skills",
    projects: "Projects",
    certifications: "Certifications",
    languages: "Languages",
};

export function SectionReorder() {
    const { sectionOrder, setSectionOrder } = useResumeStore();
    const [items, setItems] = useState<string[]>([]);
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        if (sectionOrder) {
            setItems(sectionOrder);
        }
    }, [sectionOrder]);

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    function handleDragEnd(event: DragEndEvent) {
        const { active, over } = event;

        if (over && active.id !== over.id) {
            const oldIndex = items.indexOf(active.id as string);
            const newIndex = items.indexOf(over.id as string);

            const newOrder = arrayMove(items, oldIndex, newIndex);
            setItems(newOrder);
            setSectionOrder(newOrder);
        }
    }

    return (
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2 bg-transparent">
                    <LayoutList className="h-4 w-4" />
                    <span className="hidden sm:inline">Sections</span>
                </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] sm:w-[400px]">
                <SheetHeader>
                    <SheetTitle>Reorder Sections</SheetTitle>
                    <SheetDescription>
                        Drag and drop sections to change their order in the editor and PDF.
                    </SheetDescription>
                </SheetHeader>
                <div className="mt-8">
                    <DndContext
                        sensors={sensors}
                        collisionDetection={closestCenter}
                        onDragEnd={handleDragEnd}
                    >
                        <SortableContext items={items} strategy={verticalListSortingStrategy}>
                            <div className="space-y-2">
                                {items.map((id) => (
                                    <SortableItem key={id} id={id} className="w-full">
                                        <div className="flex items-center gap-3 rounded-lg border bg-card p-4 shadow-sm w-full">
                                            <span className="font-medium">{SECTION_LABELS[id] || id}</span>
                                        </div>
                                    </SortableItem>
                                ))}
                            </div>
                        </SortableContext>
                    </DndContext>
                </div>
            </SheetContent>
        </Sheet>
    );
}
