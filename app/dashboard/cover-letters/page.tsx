"use client";

import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Mail, Plus, FileText, Trash2, Loader2, Clock, Calendar } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

export default function CoverLettersPage() {
    const supabase = createClient();
    const [loading, setLoading] = useState(true);
    const [coverLetters, setCoverLetters] = useState<any[]>([]);

    const fetchCoverLetters = async () => {
        setLoading(true);
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            setLoading(false);
            return;
        }

        const { data } = await supabase
            .from("cover_letters")
            .select("*, resumes(title)")
            .eq("user_id", user.id)
            .order("created_at", { ascending: false });

        if (data) setCoverLetters(data);
        setLoading(false);
    };

    useEffect(() => {
        fetchCoverLetters();
    }, []);

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this cover letter?")) return;

        try {
            const { error } = await supabase
                .from("cover_letters")
                .delete()
                .eq("id", id);

            if (error) throw error;
            toast.success("Cover letter deleted");
            setCoverLetters(coverLetters.filter(cl => cl.id !== id));
        } catch (error) {
            toast.error("Failed to delete cover letter");
        }
    };

    if (loading) {
        return (
            <div className="flex h-[400px] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="space-y-10">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between px-1">
                <div className="space-y-1">
                    <h1 className="text-3xl font-black uppercase tracking-tight md:text-4xl text-white">
                        Cover Letters
                    </h1>
                    <p className="text-muted-foreground/80 font-bold flex items-center gap-2">
                        <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                        Generate and manage your tailored cover letters
                    </p>
                </div>
                <Button asChild className="h-12 px-6 rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-primary/20 hover:scale-[1.02] transition-all">
                    <Link href="/dashboard/cover-letters/new">
                        <Plus className="mr-2 h-5 w-5" />
                        New Letter
                    </Link>
                </Button>
            </div>

            <AnimatePresence mode="popLayout">
                {!coverLetters || coverLetters.length === 0 ? (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                    >
                        <Card className="flex min-h-[400px] flex-col items-center justify-center border-dashed border-2 border-primary/10 text-center bg-slate-950/40 backdrop-blur-xl rounded-[32px]">
                            <CardContent className="space-y-6 pt-6 flex flex-col items-center">
                                <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-primary/5 shadow-inner">
                                    <Mail className="h-10 w-10 text-primary/40" />
                                </div>
                                <div className="space-y-2">
                                    <h3 className="text-xl font-black uppercase tracking-tight">No cover letters yet</h3>
                                    <p className="text-sm text-muted-foreground/80 max-w-sm font-medium">
                                        Generate your first tailored cover letter using one of your resumes to stand out.
                                    </p>
                                </div>
                                <Button asChild variant="outline" className="h-12 px-8 rounded-2xl border-primary/10 hover:bg-primary/5 font-black uppercase tracking-widest">
                                    <Link href="/dashboard/cover-letters/new">
                                        Create First Letter
                                    </Link>
                                </Button>
                            </CardContent>
                        </Card>
                    </motion.div>
                ) : (
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {coverLetters.map((cl, i) => (
                            <motion.div
                                key={cl.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.05 }}
                            >
                                <Card className="group overflow-hidden transition-all duration-300 border-primary/5 bg-slate-950/40 backdrop-blur-md rounded-3xl hover:bg-slate-900/60 hover:border-primary/20 shadow-xl h-full flex flex-col">
                                    <CardHeader className="pb-4">
                                        <div className="flex items-start justify-between gap-4">
                                            <div className="space-y-2 flex-1">
                                                <div className="flex items-center gap-2">
                                                    <Badge variant="outline" className="text-[9px] font-black uppercase tracking-widest py-0 h-4 border-primary/20 bg-primary/5 text-primary">
                                                        Tailored
                                                    </Badge>
                                                    <span className="text-[10px] text-muted-foreground font-black uppercase tracking-widest flex items-center gap-1.5 opacity-60">
                                                        <Clock className="h-3 w-3" />
                                                        {format(new Date(cl.created_at), "MMM d")}
                                                    </span>
                                                </div>
                                                <CardTitle className="text-lg font-black uppercase tracking-tight line-clamp-1 group-hover:text-primary transition-colors">
                                                    {cl.title}
                                                </CardTitle>
                                                <CardDescription className="flex items-center gap-1.5 font-bold text-muted-foreground/80 text-[11px] uppercase tracking-wider">
                                                    <div className="p-1 rounded-md bg-primary/10">
                                                        <FileText className="h-3 w-3 text-primary" />
                                                    </div>
                                                    {(cl.resumes as any)?.title || "General"}
                                                </CardDescription>
                                            </div>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="flex flex-col flex-1 gap-6">
                                        <p className="line-clamp-3 text-sm text-muted-foreground/60 leading-relaxed font-medium italic">
                                            "{cl.content.replace(/<[^>]*>/g, '').slice(0, 150)}..."
                                        </p>

                                        <div className="mt-auto flex items-center justify-between pt-4 border-t border-primary/5">
                                            <div className="flex flex-col gap-0.5">
                                                <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/60">Target</p>
                                                <p className="text-[12px] font-black tracking-tight text-white/90">
                                                    {cl.company_name || "Enterprise"}
                                                </p>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-10 w-10 rounded-xl text-destructive hover:bg-destructive/10 opacity-0 group-hover:opacity-100 transition-all duration-300"
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        e.stopPropagation();
                                                        handleDelete(cl.id);
                                                    }}
                                                >
                                                    <Trash2 className="h-4.5 w-4.5" />
                                                </Button>
                                                <Button asChild variant="outline" size="sm" className="h-10 px-4 rounded-xl border-primary/5 bg-primary/5 hover:bg-primary/20 text-primary font-black uppercase tracking-widest text-[10px] transition-all">
                                                    <Link href={`/dashboard/cover-letters/${cl.id}`}>
                                                        Open
                                                    </Link>
                                                </Button>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        ))}
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}

function Badge({ className, variant, ...props }: any) {
    return (
        <div className={cn("inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2", className)} {...props} />
    )
}
