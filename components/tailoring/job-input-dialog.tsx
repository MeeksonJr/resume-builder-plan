"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Sparkles, Loader2, Target } from "lucide-react";
import { toast } from "sonner";

interface JobInputDialogProps {
    children?: React.ReactNode;
    onResumeTailor: (jobDescription: string, jobTitle: string, company: string) => Promise<void>;
    isLoading: boolean;
}

export function JobInputDialog({ children, onResumeTailor, isLoading }: JobInputDialogProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [jobTitle, setJobTitle] = useState("");
    const [company, setCompany] = useState("");
    const [jobDescription, setJobDescription] = useState("");

    const handleAnalyze = async () => {
        if (!jobDescription || !jobTitle) {
            toast.error("Please provide at least a Job Title and Description.");
            return;
        }

        await onResumeTailor(jobDescription, jobTitle, company);
        setIsOpen(false);
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                {children || (
                    <Button variant="outline" className="gap-2">
                        <Target className="h-4 w-4" />
                        Target Job
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Target a Specific Job</DialogTitle>
                    <DialogDescription>
                        Paste the job description below. Our AI will analyze your resume and suggest specific improvements to increase your match score.
                    </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="job-title">Job Title</Label>
                            <Input
                                id="job-title"
                                placeholder="e.g. Senior React Developer"
                                value={jobTitle}
                                onChange={(e) => setJobTitle(e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="company">Company</Label>
                            <Input
                                id="company"
                                placeholder="e.g. Acme Corp"
                                value={company}
                                onChange={(e) => setCompany(e.target.value)}
                            />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="jd">Job Description</Label>
                        <Textarea
                            id="jd"
                            placeholder="Paste the full job description here..."
                            className="min-h-[200px] text-sm"
                            value={jobDescription}
                            onChange={(e) => setJobDescription(e.target.value)}
                        />
                    </div>
                </div>
                <div className="flex justify-end gap-3">
                    <Button variant="outline" onClick={() => setIsOpen(false)}>
                        Cancel
                    </Button>
                    <Button onClick={handleAnalyze} disabled={isLoading || !jobDescription}>
                        {isLoading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Analyzing...
                            </>
                        ) : (
                            <>
                                <Sparkles className="mr-2 h-4 w-4" />
                                Analyze Match
                            </>
                        )}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
