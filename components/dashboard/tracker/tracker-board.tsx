"use client";

import { TrackerColumn } from "@/components/dashboard/tracker/tracker-column";
import { motion } from "framer-motion";

const COLUMNS = [
    { title: "Applied", status: "applied", color: "bg-blue-500", icon: "paper-plane" },
    { title: "Interviewing", status: "interviewing", color: "bg-amber-500", icon: "mic" },
    { title: "Offered", status: "offered", color: "bg-emerald-500", icon: "trophy" },
    { title: "Archived", status: "archived", color: "bg-slate-500", icon: "archive" },
];

interface TrackerBoardProps {
    applications: any[];
    onUpdateStatus: (id: string, status: string) => void;
}

export function TrackerBoard({ applications, onUpdateStatus }: TrackerBoardProps) {
    return (
        <div className="flex gap-6 overflow-x-auto pb-10 scrollbar-hide snap-x px-1">
            {COLUMNS.map((col, i) => (
                <motion.div
                    key={col.status}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1, duration: 0.5, ease: "easeOut" }}
                    className="flex-shrink-0 w-[320px] snap-start"
                >
                    <TrackerColumn
                        title={col.title}
                        status={col.status}
                        color={col.color}
                        applications={applications.filter(app =>
                            app.status === col.status ||
                            (col.status === 'archived' && app.status === 'rejected')
                        )}
                        onUpdateStatus={onUpdateStatus}
                    />
                </motion.div>
            ))}
        </div>
    );
}