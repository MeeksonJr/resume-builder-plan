"use client";

import { KanbanBoard } from "@/components/tracker/kanban-board";

export default function TrackerPage() {
    return (
        <div className="min-h-[calc(100vh-64px)]">
            <KanbanBoard />
        </div>
    );
}