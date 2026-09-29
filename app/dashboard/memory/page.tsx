"use client";

import React, { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { UserMemoryVisualManager } from "@/components/memory/user-memory-visual-manager";
import { Brain, ShieldCheck } from "lucide-react";
import { motion } from "framer-motion";

export default function UserMemoryPage() {
  const supabase = createClient();
  const [resumes, setResumes] = useState<{ id: string; title: string }[]>([]);

  useEffect(() => {
    async function loadResumes() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from("resumes")
        .select("id, title")
        .eq("user_id", user.id)
        .is("is_archived", false)
        .order("updated_at", { ascending: false });

      if (data) setResumes(data);
    }
    loadResumes();
  }, [supabase]);

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col justify-between gap-5 border-b border-border/80 px-1 pb-7 md:flex-row md:items-end">
        <div className="space-y-1">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary">
            Universal Profile Memory
          </p>
          <h1 className="flex items-center gap-3 text-4xl font-black tracking-tight text-foreground md:text-5xl">
            Career Memory
            <Brain className="h-7 w-7 text-primary" aria-hidden="true" />
          </h1>
          <p className="flex items-center gap-2 text-sm text-muted-foreground sm:text-base">
            <span className="h-2 w-2 rounded-full bg-primary" />
            Your persistent professional profile. Injected automatically into resumes, portfolios, and job applications.
          </p>
        </div>

        <div className="flex items-center gap-3 border border-border bg-card px-4 py-2 rounded-xl shadow-xs">
          <ShieldCheck className="h-4 w-4 text-primary" aria-hidden="true" />
          <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
            Zero-Knowledge Ingestion
          </span>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <UserMemoryVisualManager userResumes={resumes} />
      </motion.div>
    </div>
  );
}
