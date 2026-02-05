"use client";

import { useState } from "react";
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
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2, Sparkles, Wand2, Save, Download } from "lucide-react";
import { toast } from "sonner";
import { useResumeStore } from "@/lib/stores/resume-store";
import { createClient } from "@/lib/supabase/client";

export function CoverLetterGenerator() {
    const {
        profile, workExperiences, skills, education, projects,
        resumeId
    } = useResumeStore();

    const [jobTitle, setJobTitle] = useState("");
    const [company, setCompany] = useState("");
    const [jobDescription, setJobDescription] = useState("");
    const [tone, setTone] = useState("professional");

    const [isGenerating, setIsGenerating] = useState(false);
    const [generatedContent, setGeneratedContent] = useState("");

    const handleGenerate = async () => {
        if (!jobTitle || !company) {
            toast.error("Please enter Job Title and Company");
            return;
        }

        setIsGenerating(true);
        try {
            const response = await fetch("/api/ai/cover-letter", {
                method: "POST",
                body: JSON.stringify({
                    resume: {
                        personalInfo: profile,
                        workExperiences,
                        skills,
                        education,
                        projects
                    },
                    jobTitle,
                    company,
                    jobDescription,
                    tone
                })
            });

            if (!response.ok) throw new Error("Generation failed");

            const data = await response.json();
            setGeneratedContent(data.content);
            toast.success("Cover Letter generated!");
        } catch (error) {
            console.error(error);
            toast.error("Failed to generate cover letter");
        } finally {
            setIsGenerating(false);
        }
    };

    const handleSave = async () => {
        if (!generatedContent) return;

        try {
            const supabase = createClient();
            const { data: { user } } = await supabase.auth.getUser();

            if (!user) {
                toast.error("You must be logged in to save");
                return;
            }

            const { error } = await supabase.from("cover_letters").insert({
                user_id: user.id,
                resume_id: resumeId,
                title: `${jobTitle} at ${company}`,
                content: generatedContent,
                company_name: company,
                job_title: jobTitle,
            });

            if (error) throw error;
            toast.success("Saved to database");
        } catch (error) {
            console.error(error);
            toast.error("Failed to save");
        }
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-full p-4">
            {/* Input Column */}
            <div className="space-y-4 flex flex-col h-full overflow-y-auto pr-2">
                <div>
                    <h2 className="text-xl font-bold flex items-center gap-2">
                        <Wand2 className="h-5 w-5 text-primary" />
                        Generator
                    </h2>
                    <p className="text-sm text-muted-foreground">AI will write a tailored letter based heavily on your resume.</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label>Job Title</Label>
                        <Input
                            placeholder="Software Engineer"
                            value={jobTitle}
                            onChange={(e) => setJobTitle(e.target.value)}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label>Company</Label>
                        <Input
                            placeholder="Acme Corp"
                            value={company}
                            onChange={(e) => setCompany(e.target.value)}
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <Label>Job Description (Optional)</Label>
                    <Textarea
                        placeholder="Paste the JD here for better tailoring..."
                        className="h-32 resize-none"
                        value={jobDescription}
                        onChange={(e) => setJobDescription(e.target.value)}
                    />
                </div>

                <div className="space-y-2">
                    <Label>Tone</Label>
                    <Select value={tone} onValueChange={setTone}>
                        <SelectTrigger>
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="professional">Professional (Standard)</SelectItem>
                            <SelectItem value="enthusiastic">Enthusiastic (Startup)</SelectItem>
                            <SelectItem value="confident">Confident (Executive)</SelectItem>
                            <SelectItem value="casual">Casual (Modern)</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <Button
                    onClick={handleGenerate}
                    disabled={isGenerating}
                    className="w-full gap-2"
                >
                    {isGenerating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                    Generate Cover Letter
                </Button>
            </div>

            {/* Output Column */}
            <div className="flex flex-col h-full border rounded-lg bg-card shadow-sm">
                <div className="p-4 border-b bg-muted/30 flex justify-between items-center">
                    <span className="font-semibold text-sm">Preview</span>
                    <div className="flex gap-2">
                        <Button size="sm" variant="outline" onClick={handleSave} disabled={!generatedContent}>
                            <Save className="h-4 w-4 mr-2" />
                            Save
                        </Button>
                    </div>
                </div>
                <div className="flex-1 p-4 overflow-hidden">
                    <Textarea
                        className="w-full h-full min-h-[400px] resize-none border-0 focus-visible:ring-0 p-0 font-serif leading-relaxed text-base"
                        value={generatedContent}
                        onChange={(e) => setGeneratedContent(e.target.value)}
                        placeholder="Your cover letter will appear here..."
                    />
                </div>
            </div>
        </div>
    );
}
