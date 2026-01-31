"use client";

import { TrackerCard } from "@/components/dashboard/tracker/tracker-card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface TrackerColumnProps {
    title: string;
    status: string;
    color: string;
    applications: any[];
    onUpdateStatus: (id: string, status: string) => void;
}

export function TrackerColumn({ title, status, color, applications, onUpdateStatus }: TrackerColumnProps) {
    return (
        <div className="flex flex-col gap-4 min-w-[280px]">
            <div className="flex items-center justify-between pb-2 border-b-2" style={{ borderBottomColor: color.replace('bg-', '') }}>
                <div className="flex items-center gap-2">
                    <div className={cn("h-2 w-2 rounded-full", color)} />
                    <h3 className="font-semibold">{title}</h3>
                </div>
                <Badge variant="secondary" className="rounded-full">
                    {applications.length}
                </Badge>
            </div>

            <div className="flex flex-col gap-3 min-h-[500px] bg-muted/30 p-2 rounded-xl">
                {applications.map((app) => (
                    <TrackerCard
                        key={app.id}
                        application={app}
                        onUpdateStatus={onUpdateStatus}
                    />
                ))}

                {applications.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-10 text-muted-foreground text-sm border-2 border-dashed rounded-lg">
                        <span>No applications</span>
                    </div>
                )}
            </div>
        </div>
    );
}