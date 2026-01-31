"use client";

import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/dashboard/empty-state";
import { Mail, Plus, FileText, Trash2, ExternalLink, Loader2 } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";

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
        <div className="space-y-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
                        Cover Letters
                    </h1>
                    <p className="mt-1 text-muted-foreground">
                        Generate and manage your tailored cover letters
                    </p>
                </div>
                <Button asChild className="min-h-[44px]">
                    <Link href="/dashboard/cover-letters/new">
                        <Plus className="mr-2 h-4 w-4" />
                        New Cover Letter
                    </Link>
                </Button>
            </div>

            {!coverLetters || coverLetters.length === 0 ? (
                <Card className="flex min-h-[400px] flex-col items-center justify-center border-dashed text-center">
                    <CardContent className="space-y-4 pt-6">
                        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                            <Mail className="h-6 w-6 text-primary" />
                        </div>
                        <div className="space-y-2">
                            <h3 className="text-lg font-semibold">No cover letters yet</h3>
                            <p className="text-sm text-muted-foreground">
                                Generate your first tailored cover letter using one of your resumes.
                            </p>
                        </div>
                        <Button asChild variant="outline" className="min-h-[44px]">
                            <Link href="/dashboard/cover-letters/new">
                                Create First Cover Letter
                            </Link>
                        </Button>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {coverLetters.map((cl) => (
                        <Card key={cl.id} className="group overflow-hidden transition-all hover:border-primary/50">
                            <CardHeader className="pb-3">
                                <div className="flex items-start justify-between">
                                    <div className="space-y-1">
                                        <CardTitle className="line-clamp-1">{cl.title}</CardTitle>
                                        <CardDescription className="flex items-center gap-1">
                                            <FileText className="h-3 w-3" />
                                            Based on {(cl.resumes as any)?.title || "Deleted Resume"}
                                        </CardDescription>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    <p className="line-clamp-3 text-sm text-muted-foreground">
                                        {cl.content.replace(/<[^>]*>/g, '').slice(0, 150)}...
                                    </p>
                                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                                        <span>{format(new Date(cl.created_at), "MMM d, yyyy")}</span>
                                        <div className="flex items-center gap-2">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8 text-destructive opacity-0 transition-opacity group-hover:opacity-100"
                                                onClick={() => handleDelete(cl.id)}
                                                disabled={loading} // Disable button while deleting
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                            <Button asChild variant="outline" size="sm" className="h-8">
                                                <Link href={`/dashboard/cover-letters/${cl.id}`}>
                                                    View Details
                                                </Link>
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
