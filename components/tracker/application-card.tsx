"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Building2, Calendar, DollarSign } from "lucide-react";

export type Application = {
    id: string;
    company: string;
    role: string;
    status: "applied" | "interviewing" | "offered" | "rejected" | "archived";
    salary_range?: string;
    updated_at: string;
    url?: string;
};

interface ApplicationCardProps {
    application: Application;
}

export function ApplicationCard({ application }: ApplicationCardProps) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: application.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
    };

    return (
        <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
            <Card className="cursor-grab active:cursor-grabbing hover:shadow-md transition-shadow">
                <CardHeader className="p-4 pb-2">
                    <CardTitle className="text-sm font-bold line-clamp-1">
                        {application.role}
                    </CardTitle>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Building2 className="h-3 w-3" />
                        <span className="line-clamp-1">{application.company}</span>
                    </div>
                </CardHeader>
                <CardContent className="p-4 pt-2 space-y-2">
                    {application.salary_range && (
                        <Badge variant="outline" className="text-[10px] h-5 px-1.5 gap-1 bg-green-500/5 text-green-600 border-green-200">
                            <DollarSign className="h-2.5 w-2.5" />
                            {application.salary_range}
                        </Badge>
                    )}
                    <div className="flex items-center gap-1 text-[10px] text-muted-foreground pt-1">
                        <Calendar className="h-3 w-3" />
                        {new Date(application.updated_at).toLocaleDateString()}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
