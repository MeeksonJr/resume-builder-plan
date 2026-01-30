import React from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical } from "lucide-react";
import { cn } from "@/lib/utils";

interface SortableItemProps {
    id: string;
    children: React.ReactNode;
    className?: string;
}

export function SortableItem({ id, children, className }: SortableItemProps) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        zIndex: isDragging ? 10 : 1,
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            className={cn(className, isDragging ? "opacity-50" : "")}
        >
            <div className="flex h-full items-center gap-2">
                <div {...attributes} {...listeners} className="cursor-grab touch-none shrink-0 self-center p-1">
                    <GripVertical className="h-4 w-4 text-muted-foreground" />
                </div>
                <div className="flex-1 w-full min-w-0">
                    {children}
                </div>
            </div>
        </div>
    );
}
