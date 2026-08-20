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

    useEffect(() => {
        checkSubscription();
    }, [checkSubscription]);

    useEffect(() => {
        async function fetchResumes() {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

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
        }
        fetchResumes();
    }, [supabase]);

    if (!isSubLoading && !isPro) {
        return (
            <div className="mx-auto max-w-4xl py-8 text-[#102b2b]">
                <Button asChild variant="ghost" className="mb-8 rounded-none">
                    <Link href="/dashboard/cover-letters">
                        <ChevronLeft className="mr-2 h-4 w-4" />
                        Back
                    </Link>
                </Button>
                <Card className="relative overflow-hidden rounded-none border-[#102b2b]/15 bg-[#102b2b] text-[#e9eee8] shadow-none">
                    <div className="absolute right-0 top-0 p-3">
                        <div className="border border-[#d8f36b]/40 bg-[#d8f36b]/15 px-3 py-1 text-xs font-bold uppercase text-[#d8f36b]">
                            Premium
                        </div>
                    </div>
                    <CardHeader className="text-center pt-16 pb-8">
                        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center border border-[#d8f36b]/40 bg-[#d8f36b] text-[#102b2b]">
                            <Sparkles className="h-8 w-8" />
                        </div>
                        <CardTitle className="text-3xl font-black uppercase tracking-tight">AI Cover Letters</CardTitle>
                        <CardDescription className="mx-auto mt-2 max-w-lg text-lg text-[#e9eee8]/70">
                            Generate tailored, professional cover letters in seconds using advanced AI analysis of your resume and the job description.
                        </CardDescription>
                    </CardHeader>
                    <CardFooter className="flex justify-center pb-16">
                        <Button
                            size="lg"
                            className="h-12 rounded-none bg-[#d8f36b] px-8 text-lg font-bold text-[#102b2b] hover:bg-white"
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
            className="mx-auto max-w-4xl space-y-7 text-[#102b2b]"
        >
            <div className="flex items-center justify-between">
                <Button variant="ghost" asChild className="rounded-none px-3">
                    <Link href="/dashboard/cover-letters">
                        <ChevronLeft className="mr-2 h-4 w-4 group-hover:-translate-x-1 transition-transform" />
                        <span className="text-xs font-bold uppercase tracking-widest text-[#102b2b]/60">All Letters</span>
                    </Link>
                </Button>
            </div>

            <div className="space-y-2 px-1">
                <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#0d8274]">Applications / Writing</p>
                <h1 className="mt-2 flex items-center gap-3 text-4xl font-black tracking-tight">
                    Tailored Letter
                    <div className="h-2 w-2 bg-[#0d8274]" />
                </h1>
                <p className="max-w-2xl text-[#102b2b]/65">
                    Our AI engineers a professional narrative by synthesizing your resume with specific job requirements.
                </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
                <Card className="overflow-hidden rounded-none border-[#102b2b]/15 bg-white/55 shadow-none">
                    <div className="flex h-20 items-center border-b border-[#102b2b]/10 bg-[#e9eee8] px-5 sm:px-8">
                        <div className="flex items-center gap-4">
                            <div className="border border-[#0d8274]/20 bg-[#d8f36b]/50 p-3">
                                <Sparkles className="h-6 w-6 text-[#0d8274]" />
                            </div>
                            <div>
                                <h2 className="text-xl font-black tracking-tight">AI generation engine</h2>
                                <p className="text-xs font-bold uppercase tracking-widest text-[#102b2b]/55">Configure your targeting parameters</p>
                            </div>
                        </div>
                    </div>

                    <CardContent className="space-y-8 p-5 sm:p-8">
                        <div className="grid gap-8 md:grid-cols-2">
                            <div className="space-y-3">
                                <Label className="ml-1 text-[10px] font-bold uppercase tracking-[0.2em] text-[#102b2b]/55">Context</Label>
                                <Select value={selectedResumeId} onValueChange={setSelectedResumeId}>
                                    <SelectTrigger className="h-12 rounded-none border-[#102b2b]/15 bg-[#e9eee8] font-bold">
                                        <div className="flex items-center gap-2">
                                            <Briefcase className="h-4 w-4 text-[#0d8274]" />
                                            <SelectValue placeholder="Select a resume" />
                                        </div>
                                    </SelectTrigger>
                                    <SelectContent className="bg-slate-900 border-primary/10 rounded-2xl">
                                        {resumes.map((resume) => (
                                            <SelectItem key={resume.id} value={resume.id} className="focus:bg-primary/10 rounded-xl py-3 font-bold">
                                                {resume.title}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-3">
                                <Label className="ml-1 text-[10px] font-bold uppercase tracking-[0.2em] text-[#102b2b]/55">Aesthetics & Tone</Label>
                                <Select value={tone} onValueChange={setTone}>
                                    <SelectTrigger className="h-12 rounded-none border-[#102b2b]/15 bg-[#e9eee8] font-bold">
                                        <div className="flex items-center gap-2 text-[#0d8274]">
                                            <Brain className="h-4 w-4" />
                                            <SelectValue placeholder="Select tone" />
                                        </div>
                                    </SelectTrigger>
                                    <SelectContent className="bg-slate-900 border-primary/10 rounded-2xl">
                                        <SelectItem value="professional" className="focus:bg-primary/10 rounded-xl py-3 font-bold">Professional (Standard)</SelectItem>
                                        <SelectItem value="enthusiastic" className="focus:bg-primary/10 rounded-xl py-3 font-bold">Enthusiastic (Hyped)</SelectItem>
                                        <SelectItem value="concise" className="focus:bg-primary/10 rounded-xl py-3 font-bold">Concise (Direct)</SelectItem>
                                        <SelectItem value="creative" className="focus:bg-primary/10 rounded-xl py-3 font-bold">Creative (Storytelling)</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="grid gap-8 md:grid-cols-2">
                            <div className="space-y-3">
                                <Label htmlFor="jobTitle" className="ml-1 text-[10px] font-bold uppercase tracking-[0.2em] text-[#102b2b]/55">Target Role</Label>
                                <div className="relative group">
                                    <Input
                                        id="jobTitle"
                                        value={formData.jobTitle}
                                        onChange={(e) => setFormData({ ...formData, jobTitle: e.target.value })}
                                        placeholder="Senior Frontend Engineer"
                                        className="h-12 rounded-none border-[#102b2b]/15 bg-[#e9eee8] pl-4 font-bold placeholder:text-[#102b2b]/35"
                                    />
                                </div>
                            </div>
                            <div className="space-y-3">
                                <Label htmlFor="companyName" className="ml-1 text-[10px] font-bold uppercase tracking-[0.2em] text-[#102b2b]/55">Hiring Entity</Label>
                                <div className="relative group">
                                    <Input
                                        id="companyName"
                                        value={formData.companyName}
                                        onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                                        placeholder="SpaceX"
                                        className="h-12 rounded-none border-[#102b2b]/15 bg-[#e9eee8] pl-4 font-bold placeholder:text-[#102b2b]/35"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <Label htmlFor="recipientName" className="ml-1 text-[10px] font-bold uppercase tracking-[0.2em] text-[#102b2b]/55">Hiring Lead (Optional)</Label>
                            <Input
                                id="recipientName"
                                value={formData.recipientName}
                                onChange={(e) => setFormData({ ...formData, recipientName: e.target.value })}
                                placeholder="Ms. Elena Vance"
                                className="h-12 rounded-none border-[#102b2b]/15 bg-[#e9eee8] pl-4 font-bold placeholder:text-[#102b2b]/35"
                            />
                        </div>

                        <div className="space-y-3 border-t border-[#102b2b]/10 pt-7">
                            <Label htmlFor="jobDescription" className="ml-1 flex items-center justify-between text-[10px] font-bold uppercase tracking-[0.2em] text-[#102b2b]/55">
                                Job Description
                                <span className="text-[#0d8274]">REQUIRED</span>
                            </Label>
                            <Textarea
                                id="jobDescription"
                                value={formData.jobDescription}
                                onChange={(e) => setFormData({ ...formData, jobDescription: e.target.value })}
                                placeholder="Paste the requirement text here. Our AI will extract keywords and align your narrative..."
                                className="min-h-[220px] resize-none rounded-none border-[#102b2b]/15 bg-[#e9eee8] p-4 leading-relaxed text-[#102b2b]/75 placeholder:text-[#102b2b]/35 sm:p-6"
                                required
                            />
                        </div>
                    </CardContent>

                    <div className="px-5 pb-6 sm:px-8 sm:pb-8">
                        <Button
                            type="submit"
                            disabled={loading || !formData.jobDescription}
                            className="relative h-12 w-full overflow-hidden rounded-none bg-[#102b2b] text-sm font-bold uppercase tracking-widest text-[#d8f36b] hover:bg-[#0d8274]"
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
