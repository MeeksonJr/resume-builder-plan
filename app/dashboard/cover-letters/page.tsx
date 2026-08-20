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
        <div className="space-y-7 text-[#102b2b]">
            <div className="flex flex-col gap-4 border-b border-[#102b2b]/15 pb-5 sm:flex-row sm:items-end sm:justify-between">
                <div className="space-y-1">
                    <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#0d8274]">Applications / Writing</p>
                    <h1 className="text-3xl font-black tracking-tight md:text-4xl">
                        Cover Letters
                    </h1>
                    <p className="flex items-center gap-2 text-sm text-[#102b2b]/65">
                        <span className="h-1.5 w-1.5 bg-[#0d8274]" />
                        Generate and manage your tailored cover letters
                    </p>
                </div>
                <Button asChild className="h-10 rounded-none bg-[#102b2b] px-4 font-bold text-[#d8f36b] hover:bg-[#0d8274]">
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
                        <Card className="flex min-h-[360px] flex-col items-center justify-center rounded-none border-dashed border-[#102b2b]/20 bg-white/40 text-center shadow-none">
                            <CardContent className="space-y-6 pt-6 flex flex-col items-center">
                                <div className="flex h-16 w-16 items-center justify-center border border-[#0d8274]/20 bg-[#d8f36b]/45">
                                    <Mail className="h-8 w-8 text-[#0d8274]" />
                                </div>
                                <div className="space-y-2">
                                    <h3 className="text-xl font-black tracking-tight">No cover letters yet</h3>
                                    <p className="max-w-sm text-sm text-[#102b2b]/65">
                                        Generate your first tailored cover letter using one of your resumes to stand out.
                                    </p>
                                </div>
                                <Button asChild variant="outline" className="h-10 rounded-none border-[#102b2b]/20 font-bold hover:bg-[#d8f36b]/35">
                                    <Link href="/dashboard/cover-letters/new">
                                        Create First Letter
                                    </Link>
                                </Button>
                            </CardContent>
                        </Card>
                    </motion.div>
                ) : (
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {coverLetters.map((cl, i) => (
                            <motion.div
                                key={cl.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.05 }}
                            >
                                <Card className="group flex h-full flex-col overflow-hidden rounded-none border-[#102b2b]/15 bg-white/55 shadow-none transition-colors hover:border-[#0d8274]">
                                    <CardHeader className="pb-4">
                                        <div className="flex items-start justify-between gap-4">
                                            <div className="space-y-2 flex-1">
                                                <div className="flex items-center gap-2">
                                                    <Badge variant="outline" className="h-5 rounded-none border-[#0d8274]/25 bg-[#d8f36b]/35 py-0 text-[9px] font-bold uppercase tracking-widest text-[#102b2b]">
                                                        Tailored
                                                    </Badge>
                                                    <span className="text-[10px] text-muted-foreground font-black uppercase tracking-widest flex items-center gap-1.5 opacity-60">
                                                        <Clock className="h-3 w-3" />
                                                        {format(new Date(cl.created_at), "MMM d")}
                                                    </span>
                                                </div>
                                                <CardTitle className="line-clamp-1 text-lg font-black tracking-tight group-hover:text-[#0d8274]">
                                                    {cl.title}
                                                </CardTitle>
                                                <CardDescription className="flex items-center gap-1.5 font-bold text-muted-foreground/80 text-[11px] uppercase tracking-wider">
                                                    <div className="border border-[#102b2b]/10 bg-[#e9eee8] p-1">
                                                        <FileText className="h-3 w-3 text-[#0d8274]" />
                                                    </div>
                                                    {(cl.resumes as any)?.title || "General"}
                                                </CardDescription>
                                            </div>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="flex flex-col flex-1 gap-6">
                                        <p className="line-clamp-3 text-sm leading-relaxed text-[#102b2b]/65">
                                            "{cl.content.replace(/<[^>]*>/g, '').slice(0, 150)}..."
                                        </p>

                                        <div className="mt-auto flex items-center justify-between pt-4 border-t border-primary/5">
                                            <div className="flex flex-col gap-0.5">
                                                <p className="text-[9px] font-bold uppercase tracking-widest text-[#102b2b]/50">Target</p>
                                                <p className="text-[12px] font-black tracking-tight">
                                                    {cl.company_name || "Enterprise"}
                                                </p>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    aria-label={`Delete ${cl.title}`}
                                                    className="h-10 w-10 rounded-none text-destructive hover:bg-red-50"
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        e.stopPropagation();
                                                        handleDelete(cl.id);
                                                    }}
                                                >
                                                    <Trash2 className="h-4.5 w-4.5" />
                                                </Button>
                                                <Button asChild variant="outline" size="sm" className="h-10 rounded-none border-[#102b2b]/15 bg-[#e9eee8] px-4 text-[10px] font-bold uppercase tracking-widest text-[#102b2b] hover:bg-[#d8f36b]/45">
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
