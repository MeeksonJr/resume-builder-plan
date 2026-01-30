import React from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { AccordionItem } from "@/components/ui/accordion";
import { GripVertical } from "lucide-react";
import { cn } from "@/lib/utils";

interface SortableAccordionItemProps extends React.ComponentPropsWithoutRef<typeof AccordionItem> {
    id: string;
    children: React.ReactNode;
}

export function SortableAccordionItem({ id, children, className, ...props }: SortableAccordionItemProps) {
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
        position: isDragging ? "relative" as const : undefined,
    };

    return (
        <AccelerometerContext.Provider value={{ attributes, listeners }}>
            <AccordionItem
                ref={setNodeRef}
                style={style}
                className={cn(isDragging ? "opacity-50" : "", className)}
                {...props}
            >
                {children}
            </AccordionItem>
        </AccelerometerContext.Provider>
    );
}

// Context to pass drag handle props down
const AccelerometerContext = React.createContext<{
    attributes: any;
    listeners: any;
}>({ attributes: {}, listeners: {} });

export function SortableDragHandle({ className }: { className?: string }) {
    const { attributes, listeners } = React.useContext(AccelerometerContext);
    return (
        <div {...attributes} {...listeners} className={cn("cursor-grab touch-none", className)}>
            <GripVertical className="h-4 w-4 text-muted-foreground" />
        </div>
    );
}
