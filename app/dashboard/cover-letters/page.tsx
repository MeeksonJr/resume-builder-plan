"use client";

import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Mail, Plus, FileText, Trash2, Loader2, Clock, Calendar, Lock, Sparkles, ArrowRight } from "lucide-react";
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
import { useSubscriptionStore } from "@/lib/stores/subscription-store";
import { UpgradeModal } from "@/components/ui/upgrade-modal";

export default function CoverLettersPage() {
    const supabase = createClient();
    const [loading, setLoading] = useState(true);
    const [coverLetters, setCoverLetters] = useState<any[]>([]);
    const [showUpgradeModal, setShowUpgradeModal] = useState(false);
    const { isPro, isLoading: isSubLoading, checkSubscription } = useSubscriptionStore();

    useEffect(() => {
        checkSubscription();
    }, [checkSubscription]);

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

    const canCreate = isPro || coverLetters.length < 1;

    return (
        <div className="space-y-7 text-foreground min-w-0 max-w-full overflow-hidden">
            {/* Free Tier Quota Banner */}
            {!isPro && (
                <div className="border border-border bg-card p-4 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-primary/10 border border-primary/20 rounded-lg flex items-center justify-center shrink-0">
                            <Lock className="w-4 h-4 text-primary" />
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <span className="text-xs font-bold uppercase tracking-wider text-foreground">
                                    Free Plan Quota
                                </span>
                                <span className="text-[10px] font-bold px-2 py-0.5 bg-muted border border-border rounded text-muted-foreground">
                                    {coverLetters.length} / 1 Trial Letter Used
                                </span>
                            </div>
                            <p className="text-xs text-muted-foreground mt-0.5">
                                Upgrade to Pro for unlimited tailored cover letters matching any job description.
                            </p>
                        </div>
                    </div>

                    <Button
                        onClick={() => setShowUpgradeModal(true)}
                        size="sm"
                        className="rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-xs shrink-0 flex items-center gap-1.5"
                    >
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Unlock Unlimited</span>
                        <ArrowRight className="w-3 h-3" />
                    </Button>
                </div>
            )}

            <div className="flex flex-col gap-4 border-b border-border pb-5 sm:flex-row sm:items-end sm:justify-between">
                <div className="space-y-1">
                    <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-primary">Applications / Writing</p>
                    <h1 className="text-3xl font-black tracking-tight md:text-4xl">
                        Cover Letters
                    </h1>
                    <p className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                        Generate and manage your tailored cover letters
                    </p>
                </div>

                {canCreate ? (
                    <Button asChild className="h-10 rounded-lg bg-primary px-4 font-bold text-primary-foreground hover:bg-primary/90">
                        <Link href="/dashboard/cover-letters/new">
                            <Plus className="mr-2 h-5 w-5" />
                            New Letter
                        </Link>
                    </Button>
                ) : (
                    <Button 
                        onClick={() => setShowUpgradeModal(true)}
                        className="h-10 rounded-lg bg-primary px-4 font-bold text-primary-foreground hover:bg-primary/90 flex items-center gap-1.5"
                    >
                        <Lock className="mr-1 h-4 w-4" />
                        New Letter
                        <span className="text-[9px] bg-primary-foreground text-primary px-1.5 py-0.2 rounded font-black uppercase tracking-wider ml-1">Pro</span>
                    </Button>
                )}
            </div>

            <UpgradeModal
                open={showUpgradeModal}
                onOpenChange={setShowUpgradeModal}
                title="Cover Letter Limit Reached"
                description="Free accounts include 1 trial cover letter. Upgrade to ResumeForge Pro for unlimited AI-written cover letters tailored to every job application."
                featureName="Unlimited Cover Letters"
            />

            <AnimatePresence mode="popLayout">
                {!coverLetters || coverLetters.length === 0 ? (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                    >
                        <Card className="flex min-h-[360px] flex-col items-center justify-center rounded-2xl border-dashed border-border bg-card/40 text-center shadow-none">
                            <CardContent className="space-y-6 pt-6 flex flex-col items-center">
                                <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-primary/20 bg-primary/10">
                                    <Mail className="h-8 w-8 text-primary" />
                                </div>
                                <div className="space-y-2">
                                    <h3 className="text-xl font-bold tracking-tight">No cover letters yet</h3>
                                    <p className="max-w-sm text-sm text-muted-foreground">
                                        Generate your first tailored cover letter using one of your resumes to stand out.
                                    </p>
                                </div>
                                <Button asChild variant="outline" className="h-10 rounded-lg border-border font-bold hover:bg-muted">
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
                                <Card className="group flex h-full flex-col overflow-hidden rounded-2xl border-border bg-card shadow-sm transition-colors hover:border-primary">
                                    <CardHeader className="pb-4">
                                        <div className="flex items-start justify-between gap-4">
                                            <div className="space-y-2 flex-1">
                                                <div className="flex items-center gap-2">
                                                    <Badge variant="outline" className="h-5 rounded border-primary/25 bg-primary/10 py-0 text-[9px] font-bold uppercase tracking-widest text-primary">
                                                        Tailored
                                                    </Badge>
                                                    <span className="text-[10px] text-muted-foreground font-black uppercase tracking-widest flex items-center gap-1.5 opacity-60">
                                                        <Clock className="h-3 w-3" />
                                                        {format(new Date(cl.created_at), "MMM d")}
                                                    </span>
                                                </div>
                                                <CardTitle className="line-clamp-1 text-lg font-bold tracking-tight group-hover:text-primary">
                                                    {cl.title}
                                                </CardTitle>
                                                <CardDescription className="flex items-center gap-1.5 font-bold text-muted-foreground/80 text-[11px] uppercase tracking-wider">
                                                    <div className="rounded border border-border bg-muted p-1">
                                                        <FileText className="h-3 w-3 text-primary" />
                                                    </div>
                                                    {(cl.resumes as any)?.title || "General"}
                                                </CardDescription>
                                            </div>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="flex flex-col flex-1 gap-6">
                                        <p className="line-clamp-3 text-sm leading-relaxed text-muted-foreground">
                                            "{cl.content.replace(/<[^>]*>/g, '').slice(0, 150)}..."
                                        </p>

                                        <div className="mt-auto flex items-center justify-between pt-4 border-t border-border">
                                            <div className="flex flex-col gap-0.5">
                                                <p className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground/60">Target</p>
                                                <p className="text-[12px] font-bold tracking-tight">
                                                    {cl.company_name || "Enterprise"}
                                                </p>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    aria-label={`Delete ${cl.title}`}
                                                    className="h-9 w-9 rounded-lg text-destructive hover:bg-destructive/10"
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        e.stopPropagation();
                                                        handleDelete(cl.id);
                                                    }}
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                                <Button asChild variant="outline" size="sm" className="h-9 rounded-lg border-border bg-muted px-4 text-[10px] font-bold uppercase tracking-widest text-foreground hover:bg-muted/80">
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
