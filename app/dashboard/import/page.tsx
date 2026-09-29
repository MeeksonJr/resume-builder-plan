"use client";

import { createClient } from "@/lib/supabase/client";
import { ImportContent } from "@/components/dashboard/import/import-content";
import { useEffect, useState } from "react";
import { Sparkles, Import, ShieldCheck } from "lucide-react";
import { motion } from "framer-motion";

export default function ImportPage() {
    const supabase = createClient();
    const [resumes, setResumes] = useState<any[]>([]);

    useEffect(() => {
        async function fetchResumes() {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const { data } = await supabase
                .from("resumes")
                .select("id, title")
                .eq("user_id", user.id)
                .is("is_archived", false)
                .order("updated_at", { ascending: false });

            if (data) setResumes(data);
        }
        fetchResumes();
    }, [supabase]);

    return (
        <div className="space-y-8">
            <div className="flex flex-col justify-between gap-5 border-b border-border/80 px-1 pb-7 md:flex-row md:items-end">
                <div className="space-y-1">
                    <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary">Resume intake</p>
                    <h1 className="flex items-center gap-3 text-4xl font-black tracking-tight text-foreground md:text-5xl">
                        Smart import
                        <Import className="h-6 w-6 text-primary" aria-hidden="true" />
                    </h1>
                    <p className="flex items-center gap-2 text-sm text-muted-foreground sm:text-base">
                        <span className="h-2 w-2 rounded-full bg-primary" />
                        Quickly ingest your professional data from LinkedIn, GitHub, and more.
                    </p>
                </div>

                <div className="flex items-center gap-3 border border-border bg-card px-4 py-2 rounded-xl shadow-xs">
                    <ShieldCheck className="h-4 w-4 text-primary" aria-hidden="true" />
                    <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Secure ingestion</span>
                </div>
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <ImportContent resumes={resumes} />
            </motion.div>
        </div>
    );
}
