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
import { Loader2, Sparkles, ChevronLeft } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

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
        <div className="mx-auto max-w-3xl space-y-6">
            <Button variant="ghost" asChild className="mb-2">
                <Link href="/dashboard/cover-letters">
                    <ChevronLeft className="mr-2 h-4 w-4" />
                    Back to list
                </Link>
            </Button>

            <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tight">New Cover Letter</h1>
                <p className="text-muted-foreground">
                    Tailor your cover letter to a specific job using your resume data.
                </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Job Details</CardTitle>
                        <CardDescription>
                            Information about the position you're applying for.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid gap-4 sm:grid-cols-2">
                            <div className="space-y-2">
                                <Label>Select Base Resume</Label>
                                <Select value={selectedResumeId} onValueChange={setSelectedResumeId}>
                                    <SelectTrigger className="min-h-[44px]">
                                        <SelectValue placeholder="Select a resume" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {resumes.map((resume) => (
                                            <SelectItem key={resume.id} value={resume.id}>
                                                {resume.title}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label>Writing Tone</Label>
                                <Select value={tone} onValueChange={setTone}>
                                    <SelectTrigger className="min-h-[44px]">
                                        <SelectValue placeholder="Select tone" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="professional">Professional</SelectItem>
                                        <SelectItem value="enthusiastic">Enthusiastic</SelectItem>
                                        <SelectItem value="concise">Concise</SelectItem>
                                        <SelectItem value="creative">Creative</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="grid gap-4 sm:grid-cols-2">
                            <div className="space-y-2">
                                <Label htmlFor="jobTitle">Job Title</Label>
                                <Input
                                    id="jobTitle"
                                    value={formData.jobTitle}
                                    onChange={(e) => setFormData({ ...formData, jobTitle: e.target.value })}
                                    placeholder="e.g. Senior Frontend Engineer"
                                    className="min-h-[44px]"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="companyName">Company Name</Label>
                                <Input
                                    id="companyName"
                                    value={formData.companyName}
                                    onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                                    placeholder="e.g. Acme Corp"
                                    className="min-h-[44px]"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="recipientName">Hiring Manager Name (Optional)</Label>
                            <Input
                                id="recipientName"
                                value={formData.recipientName}
                                onChange={(e) => setFormData({ ...formData, recipientName: e.target.value })}
                                placeholder="e.g. Jane Smith"
                                className="min-h-[44px]"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="jobDescription">Job Description</Label>
                            <Textarea
                                id="jobDescription"
                                value={formData.jobDescription}
                                onChange={(e) => setFormData({ ...formData, jobDescription: e.target.value })}
                                placeholder="Paste the job description here..."
                                className="min-h-[200px]"
                                required
                            />
                        </div>
                    </CardContent>
                </Card>

                <Button type="submit" className="w-full min-h-[44px] gap-2" disabled={loading}>
                    {loading ? (
                        <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Generating Cover Letter...
                        </>
                    ) : (
                        <>
                            <Sparkles className="h-4 w-4" />
                            Generate with AI
                        </>
                    )}
                </Button>
            </form>
        </div>
    );
}
