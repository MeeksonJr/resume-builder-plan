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
            <div className="flex flex-col justify-between gap-5 border-b border-[#102b2b]/15 px-1 pb-7 md:flex-row md:items-end">
                <div className="space-y-1">
                    <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#0d8274]">Resume intake</p>
                    <h1 className="flex items-center gap-3 text-4xl font-black tracking-[-0.04em] text-[#102b2b] md:text-5xl">
                        Smart import
                        <Import className="h-6 w-6 text-[#0d8274]" aria-hidden="true" />
                    </h1>
                    <p className="flex items-center gap-2 text-sm text-[#102b2b]/65 sm:text-base">
                        <span className="h-1.5 w-1.5 bg-[#d8f36b]" />
                        Quickly ingest your professional data from LinkedIn, GitHub, and more.
                    </p>
                </div>

                <div className="flex items-center gap-3 border border-[#102b2b]/15 bg-[#f5f7f1] px-4 py-2">
                    <ShieldCheck className="h-4 w-4 text-[#0d8274]" aria-hidden="true" />
                    <span className="text-[10px] font-bold uppercase tracking-widest text-[#102b2b]/60">Secure ingestion</span>
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
