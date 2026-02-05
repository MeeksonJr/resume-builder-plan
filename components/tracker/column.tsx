"use client";

import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { Application, ApplicationCard } from "./application-card";
import { cn } from "@/lib/utils";

interface ColumnProps {
    id: string;
    title: string;
    applications: Application[];
}

export function Column({ id, title, applications }: ColumnProps) {
    const { setNodeRef } = useDroppable({
        id: id,
    });

    return (
        <div
            ref={setNodeRef}
            className="flex h-full w-80 flex-col rounded-lg bg-muted/50 border border-border/50"
        >
            <div className="p-4 font-semibold text-sm uppercase tracking-wider text-muted-foreground flex justify-between items-center">
                {title}
                <span className="bg-background px-2 py-0.5 rounded-full text-xs border border-border">
                    {applications.length}
                </span>
            </div>
            <div className="flex-1 space-y-3 p-3 overflow-y-auto">
                <SortableContext items={applications.map((app) => app.id)} strategy={verticalListSortingStrategy}>
                    {applications.map((app) => (
                        <ApplicationCard key={app.id} application={app} />
                    ))}
                </SortableContext>
            </div>
        </div>
    );
}
