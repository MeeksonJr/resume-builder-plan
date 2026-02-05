"use client";

import { useState } from "react";
import {
    DndContext,
    DragOverlay,
    useSensors,
    useSensor,
    PointerSensor,
    defaultDropAnimationSideEffects,
    DragEndEvent,
    DragStartEvent,
    DragOverEvent,
    closestCorners,
} from "@dnd-kit/core";
import { SortableContext, arrayMove, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { ApplicationCard, Application } from "@/components/tracker/application-card";
import { Column } from "@/components/tracker/column";

const defaultCols = [
    { id: "applied", title: "Applied" },
    { id: "interviewing", title: "Interviewing" },
    { id: "offered", title: "Offer" },
    { id: "rejected", title: "Rejected" },
];

export function KanbanBoard({ initialApplications }: { initialApplications: Application[] }) {
    const [applications, setApplications] = useState<Application[]>(initialApplications);
    const [activeId, setActiveId] = useState<string | null>(null);
    const supabase = createClient();

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8,
            },
        })
    );

    function handleDragStart(event: DragStartEvent) {
        setActiveId(event.active.id as string);
    }

    function handleDragOver(event: DragOverEvent) {
        const { active, over } = event;
        if (!over) return;

        const activeId = active.id;
        const overId = over.id;

        const isActiveTask = applications.find((app) => app.id === activeId);
        if (!isActiveTask) return;

        // Dropping over a column (changing status)
        if (defaultCols.some((col) => col.id === overId)) {
            if (isActiveTask.status !== overId) {
                setApplications((items) => {
                    const newItems = items.map((item) => {
                        if (item.id === activeId) {
                            return { ...item, status: overId as Application['status'] };
                        }
                        return item;
                    });
                    return newItems;
                });
            }
        }
    }

    async function handleDragEnd(event: DragEndEvent) {
        const { active, over } = event;
        setActiveId(null);

        if (!over) return;

        const activeId = active.id as string;
        const overId = over.id as string;

        const application = applications.find((app) => app.id === activeId);
        if (!application) return;

        // Check if dropped into a column directly
        let newStatus = application.status;
        if (defaultCols.some((col) => col.id === overId)) {
            newStatus = overId as Application['status'];
        } else {
            // Dropped over another item
            const overApplication = applications.find(app => app.id === overId);
            if (overApplication) {
                newStatus = overApplication.status;
            }
        }

        if (application.status !== newStatus) {
            // Optimistic update was mostly done in DragOver, but ensure consistency
            setApplications(prev => prev.map(app =>
                app.id === activeId ? { ...app, status: newStatus } : app
            ));

            // Sync to DB
            const { error } = await supabase
                .from("applications")
                .update({ status: newStatus, updated_at: new Date().toISOString() })
                .eq("id", activeId);

            if (error) {
                toast.error("Failed to update status");
                // Revert (simplified)
                setApplications(initialApplications);
            } else {
                toast.success("Status updated");
            }
        }
    }

    return (
        <DndContext
            sensors={sensors}
            collisionDetection={closestCorners}
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDragEnd={handleDragEnd}
        >
            <div className="flex h-full gap-4 overflow-x-auto p-4 pb-8">
                {defaultCols.map((col) => (
                    <Column
                        key={col.id}
                        id={col.id}
                        title={col.title}
                        applications={applications.filter((app) => app.status === col.id)}
                    />
                ))}
            </div>
            <DragOverlay>
                {activeId ? (
                    <ApplicationCard application={applications.find(app => app.id === activeId)!} />
                ) : null}
            </DragOverlay>
        </DndContext>
    );
}
