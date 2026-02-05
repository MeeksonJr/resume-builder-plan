"use client";

import { KanbanBoard } from "@/components/tracker/kanban-board";

export default function TrackerPage() {
    return (
        <div className="h-[calc(100vh-64px)] p-6">
            <KanbanBoard />
        </div>
    );
}