"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
    CardFooter,
} from "@/components/ui/card";
import { Loader2, Sparkles, ChevronLeft, Brain, Briefcase, User, GraduationCap } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { useSubscriptionStore } from "@/lib/stores/subscription-store";

export default function NewCoverLetterPage() {
    const router = useRouter();
    const supabase = createClient();
    const [loading, setLoading] = useState(false);
    const [resumes, setResumes] = useState<any[]>([]);
    const [selectedResumeId, setSelectedResumeId] = useState<string>("");
    const [tone, setTone] = useState<string>("professional");
    const [formData, setFormData] = useState({
        jobTitle: "",
        companyName: "",
        recipientName: "",
        jobDescription: "",
    });

    const { isPro, isLoading: isSubLoading, checkSubscription } = useSubscriptionStore();
    const [existingCount, setExistingCount] = useState<number | null>(null);

    useEffect(() => {
        checkSubscription();
    }, [checkSubscription]);

    useEffect(() => {
        async function fetchInitialData() {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            // Fetch resumes
            const { data } = await supabase
                .from("resumes")
                .select("id, title")
                .eq("user_id", user.id)
                .eq("is_archived", false)
                .order("updated_at", { ascending: false });

            if (data) {
                setResumes(data);
                if (data.length > 0) setSelectedResumeId(data[0].id);
            }

            // Fetch existing cover letters count for plan check
            const { count } = await supabase
                .from("cover_letters")
                .select("*", { count: "exact", head: true })
                .eq("user_id", user.id);

            setExistingCount(count || 0);
        }
        fetchInitialData();
    }, [supabase]);

    if (!isSubLoading && !isPro && existingCount !== null && existingCount >= 1) {
        return (
            <div className="mx-auto max-w-4xl py-8 text-foreground min-w-0 max-w-full overflow-hidden">
                <Button asChild variant="ghost" className="mb-8 rounded-xl">
                    <Link href="/dashboard/cover-letters">
                        <ChevronLeft className="mr-2 h-4 w-4" />
                        Back
                    </Link>
                </Button>
                <Card className="relative overflow-hidden rounded-2xl border-border bg-card text-card-foreground shadow-sm">
                    <div className="absolute right-0 top-0 p-4">
                        <div className="rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                            Pro Feature
                        </div>
                    </div>
                    <CardHeader className="text-center pt-16 pb-8">
                        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl border border-primary/20 bg-primary/10 text-primary">
                            <Sparkles className="h-8 w-8" />
                        </div>
                        <CardTitle className="text-3xl font-bold tracking-tight">AI Cover Letters</CardTitle>
                        <CardDescription className="mx-auto mt-2 max-w-lg text-base text-muted-foreground">
                            Generate tailored, professional cover letters in seconds using advanced AI analysis of your resume and the job description.
                        </CardDescription>
                    </CardHeader>
                    <CardFooter className="flex justify-center pb-16">
                        <Button
                            size="lg"
                            className="h-12 rounded-xl bg-primary px-8 text-base font-semibold text-primary-foreground hover:bg-primary/90"
                            onClick={() => router.push('/dashboard/subscription')}
                        >
                            Upgrade to Pro
                        </Button>
                    </CardFooter>
                </Card>
            </div>
        )
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedResumeId || !formData.jobDescription) {
            toast.error("Please select a resume and provide a job description");
            return;
        }

        setLoading(true);
        try {
            const response = await fetch("/api/ai/cover-letter", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    resumeId: selectedResumeId,
                    tone,
                    ...formData,
                }),
            });

            if (!response.ok) throw new Error("Failed to generate cover letter");

            const coverLetter = await response.json();
            toast.success("Cover letter generated!");
            router.push(`/dashboard/cover-letters/${coverLetter.id}`);
        } catch (error) {
            console.error(error);
            toast.error("Failed to generate cover letter");
        } finally {
            setLoading(false);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mx-auto max-w-4xl min-w-0 max-w-full overflow-hidden space-y-7 text-foreground"
        >
            <div className="flex items-center justify-between">
                <Button variant="ghost" asChild className="rounded-xl px-3 hover:bg-muted">
                    <Link href="/dashboard/cover-letters">
                        <ChevronLeft className="mr-2 h-4 w-4 group-hover:-translate-x-1 transition-transform" />
                        <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">All Letters</span>
                    </Link>
                </Button>
            </div>

            <div className="space-y-2 px-1">
                <p className="text-xs font-semibold uppercase tracking-wider text-primary">Applications / Writing</p>
                <h1 className="mt-2 flex items-center gap-3 text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
                    Tailored Letter
                    <div className="h-2.5 w-2.5 rounded-full bg-primary" />
                </h1>
                <p className="max-w-2xl text-sm sm:text-base text-muted-foreground">
                    Our AI engineers a professional narrative by synthesizing your resume with specific job requirements.
                </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
                <Card className="overflow-hidden rounded-2xl border-border bg-card shadow-sm">
                    <div className="flex h-20 items-center border-b border-border bg-muted/40 px-5 sm:px-8">
                        <div className="flex items-center gap-4">
                            <div className="rounded-xl border border-primary/20 bg-primary/10 p-3">
                                <Sparkles className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                                <h2 className="text-lg sm:text-xl font-bold tracking-tight text-foreground">AI generation engine</h2>
                                <p className="text-xs font-medium text-muted-foreground">Configure your targeting parameters</p>
                            </div>
                        </div>
                    </div>

                    <CardContent className="space-y-8 p-5 sm:p-8">
                        <div className="grid gap-8 md:grid-cols-2">
                            <div className="space-y-3">
                                <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Context</Label>
                                <Select value={selectedResumeId} onValueChange={setSelectedResumeId}>
                                    <SelectTrigger className="h-11 rounded-xl border-input bg-background font-medium text-foreground hover:bg-accent/40">
                                        <div className="flex items-center gap-2">
                                            <Briefcase className="h-4 w-4 text-primary" />
                                            <SelectValue placeholder="Select a resume" />
                                        </div>
                                    </SelectTrigger>
                                    <SelectContent className="bg-popover border-border rounded-xl text-popover-foreground">
                                        {resumes.map((resume) => (
                                            <SelectItem key={resume.id} value={resume.id} className="focus:bg-accent rounded-lg py-2.5 font-medium">
                                                {resume.title}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-3">
                                <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Aesthetics & Tone</Label>
                                <Select value={tone} onValueChange={setTone}>
                                    <SelectTrigger className="h-11 rounded-xl border-input bg-background font-medium text-foreground hover:bg-accent/40">
                                        <div className="flex items-center gap-2 text-primary">
                                            <Brain className="h-4 w-4" />
                                            <SelectValue placeholder="Select tone" />
                                        </div>
                                    </SelectTrigger>
                                    <SelectContent className="bg-popover border-border rounded-xl text-popover-foreground">
                                        <SelectItem value="professional" className="focus:bg-accent rounded-lg py-2.5 font-medium">Professional (Standard)</SelectItem>
                                        <SelectItem value="enthusiastic" className="focus:bg-accent rounded-lg py-2.5 font-medium">Enthusiastic (Hyped)</SelectItem>
                                        <SelectItem value="concise" className="focus:bg-accent rounded-lg py-2.5 font-medium">Concise (Direct)</SelectItem>
                                        <SelectItem value="creative" className="focus:bg-accent rounded-lg py-2.5 font-medium">Creative (Storytelling)</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="grid gap-8 md:grid-cols-2">
                            <div className="space-y-3">
                                <Label htmlFor="jobTitle" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Target Role</Label>
                                <div className="relative group">
                                    <Input
                                        id="jobTitle"
                                        value={formData.jobTitle}
                                        onChange={(e) => setFormData({ ...formData, jobTitle: e.target.value })}
                                        placeholder="Senior Frontend Engineer"
                                        className="h-11 rounded-xl border-input bg-background font-medium text-foreground placeholder:text-muted-foreground"
                                    />
                                </div>
                            </div>
                            <div className="space-y-3">
                                <Label htmlFor="companyName" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Hiring Entity</Label>
                                <div className="relative group">
                                    <Input
                                        id="companyName"
                                        value={formData.companyName}
                                        onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                                        placeholder="SpaceX"
                                        className="h-11 rounded-xl border-input bg-background font-medium text-foreground placeholder:text-muted-foreground"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <Label htmlFor="recipientName" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Hiring Lead (Optional)</Label>
                            <Input
                                id="recipientName"
                                value={formData.recipientName}
                                onChange={(e) => setFormData({ ...formData, recipientName: e.target.value })}
                                placeholder="Ms. Elena Vance"
                                className="h-11 rounded-xl border-input bg-background font-medium text-foreground placeholder:text-muted-foreground"
                            />
                        </div>

                        <div className="space-y-3 border-t border-border/80 pt-7">
                            <Label htmlFor="jobDescription" className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                <span>Job Description</span>
                                <span className="text-primary text-[11px] font-bold">REQUIRED</span>
                            </Label>
                            <Textarea
                                id="jobDescription"
                                value={formData.jobDescription}
                                onChange={(e) => setFormData({ ...formData, jobDescription: e.target.value })}
                                placeholder="Paste the requirement text here. Our AI will extract keywords and align your narrative..."
                                className="min-h-[220px] resize-none rounded-xl border-input bg-background p-4 leading-relaxed text-foreground placeholder:text-muted-foreground sm:p-5"
                                required
                            />
                        </div>
                    </CardContent>

                    <div className="px-5 pb-6 sm:px-8 sm:pb-8">
                        <Button
                            type="submit"
                            disabled={loading || !formData.jobDescription}
                            className="relative h-12 w-full overflow-hidden rounded-xl bg-primary text-sm font-semibold tracking-wide text-primary-foreground hover:bg-primary/90 shadow-sm"
                        >
                            <div className="relative flex items-center justify-center gap-3">
                                {loading ? (
                                    <>
                                        <Loader2 className="h-5 w-5 animate-spin" />
                                        <span>Generating letter...</span>
                                    </>
                                ) : (
                                    <>
                                        <Sparkles className="h-5 w-5" />
                                        <span>Generate cover letter</span>
                                    </>
                                )}
                            </div>
                        </Button>
                    </div>
                </Card>
            </form>
        </motion.div>
    );
}
