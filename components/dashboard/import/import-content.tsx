"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Linkedin, Github, FileJson, Loader2, Sparkles, Plus, AlertCircle, Terminal, UserSquare2, CheckCircle2, AlertTriangle } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogClose
} from "@/components/ui/dialog";

interface ImportContentProps {
    resumes: any[];
}

export function ImportContent({ resumes }: ImportContentProps) {
    const [activeTab, setActiveTab] = useState("linkedin");
    const [loading, setLoading] = useState(false);
    const [linkedinData, setLinkedinData] = useState("");
    const [githubUsername, setGithubUsername] = useState("");
    const [selectedResumeId, setSelectedResumeId] = useState("");
    const [errorModalOpen, setErrorModalOpen] = useState(false);
    const [errorMessage, setErrorMessage] = useState<{ title: string; description: string } | null>(null);

    const supabase = createClient();
    const router = useRouter();

    const handleError = (error: any, context: string) => {
        let title = "Import Failed";
        let description = error.message || "An unexpected error occurred.";

        if (description.includes("insufficient_quota") || description.includes("429")) {
            title = "Usage Limit Exceeded";
            description = "You have exceeded your AI usage quota for the current billing cycle. Please check back later or upgrade your plan.";
        } else if (description.includes("500")) {
            title = "Service Unavailable";
            description = "The AI service is currently experiencing issues. Please try again later.";
        } else if (description.includes("GitHub user not found")) {
            title = "User Not Found";
            description = "We could not find a GitHub user with that username. Please check the spelling.";
        }

        setErrorMessage({ title, description });
        setErrorModalOpen(true);
        toast.error(`${context}: ${title}`);
    };

    const handleLinkedinImport = async () => {
        if (!linkedinData) return;
        setLoading(true);
        try {
            const response = await fetch("/api/ai/import/linkedin", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ linkedinText: linkedinData }),
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.error || `Server error: ${response.status}`);
            }

            const { resumeId } = await response.json();

            toast.success("Resume imported successfully!");
            router.push(`/editor/${resumeId}`);
        } catch (error: any) {
            handleError(error, "LinkedIn Import");
        } finally {
            setLoading(false);
        }
    };

    const handleGithubImport = async () => {
        if (!githubUsername || !selectedResumeId) {
            toast.error("Please provide GitHub username and select a resume");
            return;
        }
        setLoading(true);
        try {
            const response = await fetch("/api/ai/import/github", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    username: githubUsername,
                    resumeId: selectedResumeId
                }),
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.error || `Server error: ${response.status}`);
            }

            const result = await response.json();

            toast.success(result.message || "GitHub projects successfully added!");
            console.log("Redirecting to editor with ID:", selectedResumeId);
            router.push(`/editor/${selectedResumeId}`);
        } catch (error: any) {
            handleError(error, "GitHub Import");
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <Tabs defaultValue="linkedin" value={activeTab} onValueChange={setActiveTab} className="space-y-8">
                <TabsList className="bg-slate-950/40 backdrop-blur-md border border-primary/5 p-1 h-14 rounded-2xl grid grid-cols-2 max-w-[400px]">
                    <TabsTrigger value="linkedin" className="rounded-xl data-[state=active]:bg-primary/20 data-[state=active]:text-primary font-black uppercase tracking-widest text-[10px] gap-2 transition-all">
                        <Linkedin className="h-4 w-4" />
                        LinkedIn
                    </TabsTrigger>
                    <TabsTrigger value="github" className="rounded-xl data-[state=active]:bg-primary/20 data-[state=active]:text-primary font-black uppercase tracking-widest text-[10px] gap-2 transition-all">
                        <Github className="h-4 w-4" />
                        GitHub
                    </TabsTrigger>
                </TabsList>

                <AnimatePresence mode="wait">
                    <motion.div
                        key={activeTab}
                        initial={{ opacity: 0, x: 10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -10 }}
                        transition={{ duration: 0.3 }}
                    >
                        <TabsContent value="linkedin" className="m-0">
                            <Card className="bg-slate-950/40 backdrop-blur-xl border-primary/5 rounded-[32px] overflow-hidden shadow-2xl">
                                <div className="h-24 bg-gradient-to-br from-blue-600/10 via-slate-900 to-transparent border-b border-primary/5 flex items-center px-10">
                                    <div className="flex items-center gap-4">
                                        <div className="p-3 rounded-2xl bg-blue-500/10 shadow-inner">
                                            <Linkedin className="h-6 w-6 text-blue-400" />
                                        </div>
                                        <div>
                                            <h2 className="text-xl font-black uppercase tracking-tight">LinkedIn Synthesizer</h2>
                                            <p className="text-xs font-bold text-muted-foreground/60 uppercase tracking-widest">Construct a professional profile from social data</p>
                                        </div>
                                    </div>
                                </div>
                                <CardContent className="p-10 space-y-8">
                                    <div className="space-y-4">
                                        <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/40 ml-1">Profile Data Corpus</Label>
                                        <Textarea
                                            placeholder="Paste your LinkedIn profile text or PDF export content here..."
                                            className="min-h-[300px] bg-slate-900/30 border-primary/10 rounded-2xl p-6 font-medium text-muted-foreground/80 focus:ring-primary/20 placeholder:text-muted-foreground/20 resize-none transition-all leading-relaxed"
                                            value={linkedinData}
                                            onChange={(e) => setLinkedinData(e.target.value)}
                                        />
                                        <div className="flex items-start gap-3 p-4 rounded-2xl bg-blue-500/5 border border-blue-500/10">
                                            <AlertCircle className="h-5 w-5 text-blue-400 shrink-0 mt-0.5" />
                                            <p className="text-xs font-medium text-blue-400/80 leading-relaxed">
                                                For best results, go to your LinkedIn profile {"->"} More {"->"} Save to PDF. Open the PDF, copy all text, and paste it above. Our AI will automatically structure it into a premium resume.
                                            </p>
                                        </div>
                                    </div>

                                    <Button
                                        onClick={handleLinkedinImport}
                                        disabled={loading || !linkedinData}
                                        className="w-full h-16 rounded-[20px] font-black uppercase tracking-widest text-sm relative group overflow-hidden shadow-2xl shadow-blue-500/20 hover:scale-[1.01] active:scale-[0.99] transition-all bg-blue-600 hover:bg-blue-500"
                                    >
                                        <div className="relative flex items-center justify-center gap-3">
                                            {loading ? (
                                                <>
                                                    <Loader2 className="h-5 w-5 animate-spin" />
                                                    <span>Parsing Network Data...</span>
                                                </>
                                            ) : (
                                                <>
                                                    <Sparkles className="h-5 w-5" />
                                                    <span>Execute LinkedIn Import</span>
                                                </>
                                            )}
                                        </div>
                                    </Button>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="github" className="m-0">
                            <Card className="bg-slate-950/40 backdrop-blur-xl border-primary/5 rounded-[32px] overflow-hidden shadow-2xl">
                                <div className="h-24 bg-gradient-to-br from-slate-400/10 via-slate-900 to-transparent border-b border-primary/5 flex items-center px-10">
                                    <div className="flex items-center gap-4">
                                        <div className="p-3 rounded-2xl bg-white/5 shadow-inner border border-white/5">
                                            <Github className="h-6 w-6 text-white" />
                                        </div>
                                        <div>
                                            <h2 className="text-xl font-black uppercase tracking-tight">GitHub Ingestor</h2>
                                            <p className="text-xs font-bold text-muted-foreground/60 uppercase tracking-widest">Import your top repositories</p>
                                        </div>
                                    </div>
                                </div>
                                <CardContent className="p-10 space-y-10">
                                    <div className="grid gap-10 md:grid-cols-2">
                                        <div className="space-y-4">
                                            <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/40 ml-1">GitHub Username</Label>
                                            <div className="relative group">
                                                <Terminal className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
                                                <Input
                                                    placeholder="e.g. facebook"
                                                    className="h-14 bg-slate-900/50 border-primary/10 rounded-2xl pl-11 font-bold focus:ring-primary/20 transition-all"
                                                    value={githubUsername}
                                                    onChange={(e) => setGithubUsername(e.target.value)}
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-4">
                                            <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/40 ml-1">Target Resume</Label>
                                            <Select
                                                value={selectedResumeId}
                                                onValueChange={setSelectedResumeId}
                                            >
                                                <SelectTrigger className="h-14 bg-slate-900/50 border-primary/10 rounded-2xl font-bold transition-all focus:ring-primary/20">
                                                    <div className="flex items-center gap-2">
                                                        <UserSquare2 className="h-4 w-4 text-primary" />
                                                        <SelectValue placeholder="Select target resume" />
                                                    </div>
                                                </SelectTrigger>
                                                <SelectContent className="bg-slate-950 border-primary/10 rounded-2xl">
                                                    {resumes.map(r => (
                                                        <SelectItem key={r.id} value={r.id} className="font-bold text-xs py-3 focus:bg-primary/10 rounded-xl">
                                                            {r.title}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>

                                    <div className="p-6 rounded-[28px] bg-white/5 border border-white/5 space-y-4">
                                        <h4 className="text-[10px] font-black uppercase tracking-widest text-white/40 flex items-center gap-2">
                                            <CheckCircle2 className="h-3 w-3 text-emerald-500" />
                                            Automation Scope
                                        </h4>
                                        <ul className="grid grid-cols-2 gap-4 text-[11px] font-bold text-muted-foreground/60">
                                            <li className="flex items-center gap-2">
                                                <div className="h-1 w-1 rounded-full bg-primary" />
                                                Top 3 updated repositories
                                            </li>
                                            <li className="flex items-center gap-2">
                                                <div className="h-1 w-1 rounded-full bg-primary" />
                                                Deep code analysis
                                            </li>
                                            <li className="flex items-center gap-2">
                                                <div className="h-1 w-1 rounded-full bg-primary" />
                                                Tech stack identification
                                            </li>
                                            <li className="flex items-center gap-2">
                                                <div className="h-1 w-1 rounded-full bg-primary" />
                                                Impact bullet points
                                            </li>
                                        </ul>
                                    </div>

                                    <Button
                                        onClick={handleGithubImport}
                                        disabled={loading || !githubUsername || !selectedResumeId}
                                        className="w-full h-16 rounded-[20px] font-black uppercase tracking-widest text-sm relative group overflow-hidden shadow-2xl shadow-primary/10 hover:scale-[1.01] active:scale-[0.99] transition-all bg-white text-black hover:bg-slate-200"
                                    >
                                        <div className="relative flex items-center justify-center gap-3">
                                            {loading ? (
                                                <>
                                                    <Loader2 className="h-5 w-5 animate-spin" />
                                                    <span>Analyzing Repositories...</span>
                                                </>
                                            ) : (
                                                <>
                                                    <Github className="h-5 w-5" />
                                                    <span>Import Projects</span>
                                                </>
                                            )}
                                        </div>
                                    </Button>
                                </CardContent>
                            </Card>
                        </TabsContent>
                    </motion.div>
                </AnimatePresence>
            </Tabs>

            <Dialog open={errorModalOpen} onOpenChange={setErrorModalOpen}>
                <DialogContent className="sm:max-w-[425px] border-red-500/20 bg-slate-950">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-red-500">
                            <AlertTriangle className="h-5 w-5" />
                            {errorMessage?.title}
                        </DialogTitle>
                        <DialogDescription className="pt-2 text-slate-300 leading-relaxed">
                            {errorMessage?.description}
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setErrorModalOpen(false)} className="border-white/10 hover:bg-white/5">
                            Close
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}
