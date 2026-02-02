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
        <div className="space-y-10">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 px-1">
                <div className="space-y-1">
                    <h1 className="text-3xl font-black uppercase tracking-tight md:text-4xl text-white flex items-center gap-3">
                        Smart Import
                        <div className="h-6 w-[2px] bg-primary/20 -rotate-12" />
                        <Import className="h-6 w-6 text-primary/40" />
                    </h1>
                    <p className="text-muted-foreground/80 font-bold flex items-center gap-2">
                        <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                        Quickly ingest your professional data from LinkedIn, GitHub, and more.
                    </p>
                </div>

                <div className="flex items-center gap-3 px-4 py-2 rounded-2xl bg-primary/5 border border-primary/10 shadow-inner">
                    <ShieldCheck className="h-4 w-4 text-emerald-500" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">Secure Ingestion</span>
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
