"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { TrackerBoard } from "@/components/dashboard/tracker/tracker-board";
import { AddApplicationDialog } from "@/components/dashboard/tracker/add-application-dialog";
import { Button } from "@/components/ui/button";
import { Plus, LayoutGrid, List } from "lucide-react";
import { toast } from "sonner";

export default function TrackerPage() {
    const [applications, setApplications] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const supabase = createClient();

    const fetchApplications = async () => {
        setIsLoading(true);
        try {
            const { data, error } = await supabase
                .from("applications")
                .select(`
                    *,
                    resume:resumes(title),
                    cover_letter:cover_letters(title)
                `)
                .order("created_at", { ascending: false });

            if (error) throw error;
            setApplications(data || []);
        } catch (error: any) {
            console.error("Error fetching applications:", error.message);
            toast.error("Failed to load applications");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchApplications();
    }, []);

    const handleUpdateStatus = async (id: string, newStatus: string) => {
        try {
            const { error } = await supabase
                .from("applications")
                .update({ status: newStatus })
                .eq("id", id);

            if (error) throw error;

            setApplications(prev => prev.map(app =>
                app.id === id ? { ...app, status: newStatus } : app
            ));

            toast.success(`Updated status to ${newStatus}`);
        } catch (error: any) {
            console.error("Error updating status:", error.message);
            toast.error("Failed to update status");
        }
    };

    return (
        <div className="p-6 space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Job Tracker</h1>
                    <p className="text-muted-foreground">Manage your job applications and move them through the pipeline.</p>
                </div>
                <AddApplicationDialog onSave={fetchApplications}>
                    <Button className="gap-2">
                        <Plus className="h-4 w-4" />
                        Add Application
                    </Button>
                </AddApplicationDialog>
            </div>

            {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 animate-pulse">
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="h-[500px] bg-muted rounded-xl" />
                    ))}
                </div>
            ) : (
                <TrackerBoard
                    applications={applications}
                    onUpdateStatus={handleUpdateStatus}
                />
            )}
        </div>
    );
}