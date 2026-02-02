"use client";

import { TrackerCard } from "@/components/dashboard/tracker/tracker-card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { MoreHorizontal, Plus } from "lucide-react";

interface TrackerColumnProps {
    title: string;
    status: string;
    color: string;
    applications: any[];
    onUpdateStatus: (id: string, status: string) => void;
}

export function TrackerColumn({ title, status, color, applications, onUpdateStatus }: TrackerColumnProps) {
    return (
        <div className="flex flex-col gap-6 h-full min-h-[700px]">
            <div className="flex items-center justify-between px-2">
                <div className="flex items-center gap-3">
                    <div className={cn("h-2.5 w-2.5 rounded-full shadow-[0_0_10px_rgba(var(--primary),0.3)]", color)} />
                    <h3 className="font-black uppercase tracking-widest text-[11px] text-white/90">{title}</h3>
                    <div className="px-1.5 py-0.5 rounded-md bg-white/5 border border-white/5 text-[9px] font-black text-muted-foreground/60">
                        {applications.length}
                    </div>
                </div>
                <button className="text-white/20 hover:text-white transition-colors p-1">
                    <MoreHorizontal className="h-4 w-4" />
                </button>
            </div>

            <div className="flex-1 flex flex-col gap-4 bg-slate-950/20 backdrop-blur-md p-4 rounded-[32px] border border-primary/5 shadow-inner">
                <AnimatePresence mode="popLayout" initial={false}>
                    {applications.map((app, i) => (
                        <motion.div
                            key={app.id}
                            layout
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                        >
                            <TrackerCard
                                application={app}
                                onUpdateStatus={onUpdateStatus}
                            />
                        </motion.div>
                    ))}
                </AnimatePresence>

                {applications.length === 0 && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex-1 flex flex-col items-center justify-center py-10 text-muted-foreground/40 text-[10px] font-black uppercase tracking-[0.2em] border-2 border-dashed border-primary/5 rounded-[24px]"
                    >
                        <span>Empty Stage</span>
                    </motion.div>
                )}
            </div>
        </div>
    );
}