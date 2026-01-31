"use client";

import { TrackerColumn } from "@/components/dashboard/tracker/tracker-column";

const COLUMNS = [
    { title: "Applied", status: "applied", color: "bg-blue-500" },
    { title: "Interviewing", status: "interviewing", color: "bg-yellow-500" },
    { title: "Offered", status: "offered", color: "bg-green-500" },
    { title: "Rejected / Archived", status: "archived", color: "bg-gray-500" },
];

interface TrackerBoardProps {
    applications: any[];
    onUpdateStatus: (id: string, status: string) => void;
}

export function TrackerBoard({ applications, onUpdateStatus }: TrackerBoardProps) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 overflow-x-auto pb-4">
            {COLUMNS.map((col) => (
                <TrackerColumn
                    key={col.status}
                    title={col.title}
                    status={col.status}
                    color={col.color}
                    applications={applications.filter(app =>
                        app.status === col.status ||
                        (col.status === 'archived' && app.status === 'rejected')
                    )}
                    onUpdateStatus={onUpdateStatus}
                />
            ))}
        </div>
    );
}