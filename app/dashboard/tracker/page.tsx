"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { KanbanBoard } from "@/components/tracker/kanban-board";
import { AddApplicationDialog } from "@/components/dashboard/tracker/add-application-dialog";
import { Button } from "@/components/ui/button";
import { Plus, LayoutGrid, List, Briefcase, Workflow, Activity } from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

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
        <div className="space-y-10">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 px-1">
                <div className="space-y-1">
                    <h1 className="text-3xl font-black uppercase tracking-tight md:text-4xl text-white flex items-center gap-3">
                        Job Tracker
                        <div className="h-6 w-[2px] bg-primary/20 rotate-12" />
                        <Activity className="h-6 w-6 text-primary/40" />
                    </h1>
                    <p className="text-muted-foreground/80 font-bold flex items-center gap-2">
                        <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                        Manage your job applications and move them through the pipeline.
                    </p>
                </div>
                <AddApplicationDialog onSave={fetchApplications}>
                    <Button className="h-12 px-6 rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-primary/20 hover:scale-[1.02] transition-all gap-2">
                        <Plus className="h-5 w-5" />
                        Add Application
                    </Button>
                </AddApplicationDialog>
            </div>

            <AnimatePresence mode="wait">
                {isLoading ? (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
                    >
                        {[1, 2, 3, 4].map((i) => (
                            <div key={i} className="h-[600px] bg-slate-950/20 backdrop-blur-md rounded-[32px] border border-primary/5 animate-pulse" />
                        ))}
                    </motion.div>
                ) : (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.4 }}
                    >
                        <KanbanBoard initialApplications={applications} />
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}