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
} from "@/components/ui/card";
import { Loader2, Sparkles, ChevronLeft, Brain, Briefcase, User, GraduationCap } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { motion } from "framer-motion";

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
            className="mx-auto max-w-4xl space-y-10"
        >
            <div className="flex items-center justify-between">
                <Button variant="ghost" asChild className="hover:bg-slate-900 rounded-xl px-4 transition-all group">
                    <Link href="/dashboard/cover-letters">
                        <ChevronLeft className="mr-2 h-4 w-4 group-hover:-translate-x-1 transition-transform" />
                        <span className="font-bold text-xs uppercase tracking-widest text-muted-foreground group-hover:text-white">All Letters</span>
                    </Link>
                </Button>
            </div>

            <div className="space-y-2 px-1">
                <h1 className="text-4xl font-black uppercase tracking-tight text-white flex items-center gap-3">
                    Tailored Letter
                    <div className="h-2 w-2 rounded-full bg-primary animate-pulse shadow-[0_0_10px_rgba(var(--primary),0.5)]" />
                </h1>
                <p className="text-muted-foreground/80 font-bold max-w-2xl">
                    Our AI engineers a professional narrative by synthesizing your resume with specific job requirements.
                </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
                <Card className="border-primary/5 bg-slate-950/60 backdrop-blur-2xl rounded-[32px] overflow-hidden shadow-2xl">
                    <div className="h-24 bg-gradient-to-br from-primary/10 via-slate-900 to-transparent border-b border-primary/5 flex items-center px-10">
                        <div className="flex items-center gap-4">
                            <div className="p-3 rounded-2xl bg-primary/10 shadow-inner">
                                <Sparkles className="h-6 w-6 text-primary" />
                            </div>
                            <div>
                                <h2 className="text-xl font-black uppercase tracking-tight">AI Generation Engine</h2>
                                <p className="text-xs font-bold text-muted-foreground/60 uppercase tracking-widest">Configure your targeting parameters</p>
                            </div>
                        </div>
                    </div>

                    <CardContent className="p-10 space-y-10">
                        <div className="grid gap-8 md:grid-cols-2">
                            <div className="space-y-3">
                                <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 ml-1">Context</Label>
                                <Select value={selectedResumeId} onValueChange={setSelectedResumeId}>
                                    <SelectTrigger className="h-14 bg-slate-900/50 border-primary/10 rounded-2xl focus:ring-primary/20 transition-all font-bold">
                                        <div className="flex items-center gap-2">
                                            <Briefcase className="h-4 w-4 text-primary" />
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
                                <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 ml-1">Aesthetics & Tone</Label>
                                <Select value={tone} onValueChange={setTone}>
                                    <SelectTrigger className="h-14 bg-slate-900/50 border-primary/10 rounded-2xl focus:ring-primary/20 transition-all font-bold">
                                        <div className="flex items-center gap-2 text-primary">
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
                                <Label htmlFor="jobTitle" className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 ml-1">Target Role</Label>
                                <div className="relative group">
                                    <Input
                                        id="jobTitle"
                                        value={formData.jobTitle}
                                        onChange={(e) => setFormData({ ...formData, jobTitle: e.target.value })}
                                        placeholder="Senior Frontend Engineer"
                                        className="h-14 bg-slate-900/50 border-primary/10 rounded-2xl focus:ring-primary/20 pl-4 font-bold placeholder:text-muted-foreground/30 transition-all group-hover:border-primary/20"
                                    />
                                </div>
                            </div>
                            <div className="space-y-3">
                                <Label htmlFor="companyName" className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 ml-1">Hiring Entity</Label>
                                <div className="relative group">
                                    <Input
                                        id="companyName"
                                        value={formData.companyName}
                                        onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                                        placeholder="SpaceX"
                                        className="h-14 bg-slate-900/50 border-primary/10 rounded-2xl focus:ring-primary/20 pl-4 font-bold placeholder:text-muted-foreground/30 transition-all group-hover:border-primary/20"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <Label htmlFor="recipientName" className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 ml-1">Hiring Lead (Optional)</Label>
                            <Input
                                id="recipientName"
                                value={formData.recipientName}
                                onChange={(e) => setFormData({ ...formData, recipientName: e.target.value })}
                                placeholder="Ms. Elena Vance"
                                className="h-14 bg-slate-900/50 border-primary/10 rounded-2xl focus:ring-primary/20 pl-4 font-bold placeholder:text-muted-foreground/30 transition-all"
                            />
                        </div>

                        <div className="space-y-3 border-t border-primary/5 pt-8">
                            <Label htmlFor="jobDescription" className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 ml-1 flex items-center justify-between">
                                Job Description
                                <span className="text-primary opacity-60">REQUIRED</span>
                            </Label>
                            <Textarea
                                id="jobDescription"
                                value={formData.jobDescription}
                                onChange={(e) => setFormData({ ...formData, jobDescription: e.target.value })}
                                placeholder="Paste the requirement text here. Our AI will extract keywords and align your narrative..."
                                className="min-h-[250px] bg-slate-900/30 border-primary/10 rounded-2xl p-6 font-medium text-muted-foreground/80 focus:ring-primary/20 placeholder:text-muted-foreground/20 resize-none transition-all leading-relaxed"
                                required
                            />
                        </div>
                    </CardContent>

                    <div className="px-10 pb-10">
                        <Button
                            type="submit"
                            disabled={loading || !formData.jobDescription}
                            className="w-full h-16 rounded-[20px] font-black uppercase tracking-widest text-sm relative group overflow-hidden shadow-2xl shadow-primary/20 hover:scale-[1.01] active:scale-[0.99] transition-all"
                        >
                            <div className="absolute inset-0 bg-gradient-to-r from-primary via-primary/80 to-primary opacity-100 group-hover:opacity-90 transition-opacity" />
                            <div className="relative flex items-center justify-center gap-3">
                                {loading ? (
                                    <>
                                        <Loader2 className="h-5 w-5 animate-spin" />
                                        <span>Engineering Narrative...</span>
                                    </>
                                ) : (
                                    <>
                                        <Sparkles className="h-5 w-5" />
                                        <span>Initialize Synthesis</span>
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
