"use client";

import { useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
    Loader2,
    Sparkles,
    MessageSquare,
    Target,
    CheckCircle2,
    ChevronRight,
    BrainCircuit,
    Lightbulb,
    Trophy,
    ArrowRight
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";
import { motion, AnimatePresence } from "framer-motion";

interface InterviewPrepDialogProps {
    children: React.ReactNode;
    application: any;
}

export function InterviewPrepDialog({ children, application }: InterviewPrepDialogProps) {
    const [open, setOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [questions, setQuestions] = useState<any[]>([]);
    const [practicingIdx, setPracticingIdx] = useState<number | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [answer, setAnswer] = useState("");
    const [feedback, setFeedback] = useState<any | null>(null);

    const handleGenerate = async () => {
        setIsLoading(true);
        setFeedback(null);
        setPracticingIdx(null);
        try {
            const response = await fetch("/api/ai/interview", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    resumeId: application.resume_id,
                    jobDescription: application.notes || `${application.role} at ${application.company}`,
                }),
            });

            if (!response.ok) throw new Error("Failed to generate questions");

            const data = await response.json();
            setQuestions(data.questions || []);
            toast.success("Interview questions generated!");
        } catch (error: any) {
            console.error(error);
            toast.error("Failed to generate questions. Please ensure you have a resume linked and a job description in notes.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubmitAnswer = async (question: string) => {
        if (!answer.trim()) {
            toast.error("Please provide an answer first");
            return;
        }

        setIsSubmitting(true);
        setFeedback(null);
        try {
            const response = await fetch("/api/ai/interview/feedback", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    resumeId: application.resume_id,
                    jobDescription: application.notes || `${application.role} at ${application.company}`,
                    question,
                    answer,
                }),
            });

            if (!response.ok) throw new Error("Failed to get feedback");

            const data = await response.json();
            setFeedback(data);
            toast.success("Feedback generated!");
        } catch (error: any) {
            console.error(error);
            toast.error("Failed to evaluate answer.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>{children}</DialogTrigger>
            <DialogContent className="sm:max-w-[750px] max-h-[90vh] overflow-y-auto bg-slate-950/95 border-primary/10 shadow-3xl backdrop-blur-2xl p-0 rounded-3xl custom-scrollbar">
                <div className="relative h-32 bg-gradient-to-br from-primary/20 via-primary/5 to-transparent border-b border-primary/5 flex items-center px-10">
                    <div className="relative z-10 space-y-1">
                        <div className="flex items-center gap-2 mb-1">
                            <Badge variant="outline" className="gap-1 px-2 py-0.5 text-[9px] font-black uppercase tracking-widest border-primary/20 bg-primary/5 text-primary">
                                <BrainCircuit className="h-3 w-3" />
                                Interactive Coach
                            </Badge>
                        </div>
                        <DialogTitle className="text-3xl font-black uppercase tracking-tight text-white line-clamp-1">Interview Synthesis</DialogTitle>
                        <DialogDescription className="font-bold text-muted-foreground/80 flex items-center gap-2 overflow-hidden truncate">
                            Custom calibration for <span className="text-primary truncate">{application.role}</span> @ <span className="text-primary truncate">{application.company}</span>
                        </DialogDescription>
                    </div>
                    <Sparkles className="absolute right-10 top-1/2 -translate-y-1/2 h-20 w-20 text-primary/5 animate-pulse" />
                </div>

                <div className="p-10">
                    {questions.length === 0 ? (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="flex flex-col items-center justify-center py-16 px-6 text-center border-2 border-dashed border-primary/10 rounded-[32px] bg-slate-950/40"
                        >
                            <div className="h-16 w-16 rounded-3xl bg-primary/10 flex items-center justify-center mb-6 shadow-inner">
                                <Sparkles className="h-8 w-8 text-primary" />
                            </div>
                            <h3 className="text-xl font-black uppercase tracking-tight mb-2">Initialize Prep Module</h3>
                            <p className="text-sm font-medium text-muted-foreground/60 max-w-sm mb-10 leading-relaxed italic">
                                Our AI constructs a dedicated training matrix by cross-referencing your resume against job specific requirements.
                            </p>
                            <Button
                                onClick={handleGenerate}
                                disabled={isLoading || !application.resume_id}
                                className="h-14 px-8 rounded-2xl font-black uppercase tracking-widest text-xs gap-3 shadow-xl shadow-primary/20 hover:scale-[1.02] transition-all"
                            >
                                {isLoading ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                    <Sparkles className="h-4 w-4" />
                                )}
                                Generate Practice Set
                            </Button>
                            {!application.resume_id && (
                                <div className="mt-6 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-destructive/80">
                                    <AlertCircle className="h-3.5 w-3.5" />
                                    Missing Linked Artifact (Resume)
                                </div>
                            )}
                        </motion.div>
                    ) : (
                        <div className="space-y-8">
                            <div className="grid grid-cols-3 gap-6">
                                {[
                                    { icon: Target, label: "Strategy", val: "STAR Method", color: "text-blue-400" },
                                    { icon: MessageSquare, label: "Focus", val: "Quantifiable Impact", color: "text-purple-400" },
                                    { icon: Trophy, label: "Goal", val: "Competency Win", color: "text-emerald-400" },
                                ].map((item, i) => (
                                    <Card key={i} className="bg-slate-900/40 border-primary/5 rounded-2xl overflow-hidden shadow-lg">
                                        <CardHeader className="p-4 pb-0">
                                            <CardTitle className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground/40 flex items-center gap-1.5">
                                                <item.icon className={cn("h-3 w-3", item.color)} />
                                                {item.label}
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent className="p-4 pt-1">
                                            <p className="text-[11px] font-black tracking-tight text-white/90">{item.val}</p>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>

                            <Accordion type="single" collapsible className="w-full space-y-4">
                                {questions.map((q, idx) => (
                                    <AccordionItem key={idx} value={`item-${idx}`} className="border border-primary/5 rounded-2xl px-6 mb-4 bg-slate-950/40 backdrop-blur-md shadow-xl hover:border-primary/20 transition-all overflow-hidden">
                                        <AccordionTrigger className="hover:no-underline py-6 group">
                                            <div className="flex flex-col items-start text-left gap-3 flex-1 min-w-0 pr-4">
                                                <Badge variant="outline" className="text-[8px] font-black uppercase tracking-widest text-primary border-primary/20 bg-primary/5 px-2">
                                                    {q.type}
                                                </Badge>
                                                <span className="text-sm font-black tracking-tight text-white/90 group-hover:text-primary transition-colors">{q.question}</span>
                                            </div>
                                        </AccordionTrigger>
                                        <AccordionContent className="pb-6 space-y-6">
                                            <div className="bg-primary/5 p-5 rounded-2xl border border-primary/5 relative overflow-hidden">
                                                <div className="absolute top-0 right-0 p-4 opacity-5">
                                                    <Lightbulb className="h-12 w-12 text-primary" />
                                                </div>
                                                <h4 className="text-[10px] font-black uppercase text-primary/60 mb-3 flex items-center gap-2">
                                                    <ChevronRight className="h-3 w-3" />
                                                    Guidance Matrix
                                                </h4>
                                                <p className="text-sm text-muted-foreground/80 leading-relaxed font-medium italic">
                                                    {q.star_guidance}
                                                </p>
                                            </div>

                                            <div className="space-y-4">
                                                <h4 className="text-[10px] font-black uppercase text-muted-foreground/40 mb-3 flex items-center gap-2">
                                                    <ChevronRight className="h-3 w-3" />
                                                    Resume Extraction Points
                                                </h4>
                                                <ul className="space-y-3">
                                                    {q.sample_answer_points.map((point: string, pIdx: number) => (
                                                        <li key={pIdx} className="flex items-start gap-3 text-sm font-medium text-white/70">
                                                            <div className="h-5 w-5 rounded-lg bg-emerald-500/10 flex items-center justify-center shrink-0 mt-0.5 border border-emerald-500/10">
                                                                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                                                            </div>
                                                            <span className="leading-snug">{point}</span>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>

                                            <div className="pt-6 border-t border-primary/5">
                                                <AnimatePresence mode="wait">
                                                    {practicingIdx === idx ? (
                                                        <motion.div
                                                            initial={{ opacity: 0, y: 10 }}
                                                            animate={{ opacity: 1, y: 0 }}
                                                            exit={{ opacity: 0, scale: 0.95 }}
                                                            className="space-y-6"
                                                        >
                                                            <div className="space-y-3">
                                                                <Label className="text-[10px] font-black uppercase tracking-widest text-primary/60">Live Response Construction</Label>
                                                                <Textarea
                                                                    className="w-full min-h-[150px] p-5 rounded-2xl border border-primary/10 bg-slate-900/30 text-sm font-medium focus:ring-2 focus:ring-primary/20 outline-none resize-none leading-relaxed transition-all"
                                                                    placeholder="Engage STAR methodology here. Situation, Task, Action, Result..."
                                                                    value={answer}
                                                                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setAnswer(e.target.value)}
                                                                />
                                                            </div>
                                                            <div className="flex gap-3">
                                                                <Button
                                                                    size="sm"
                                                                    onClick={() => handleSubmitAnswer(q.question)}
                                                                    disabled={isSubmitting || !answer.trim()}
                                                                    className="flex-1 h-12 rounded-xl font-black uppercase tracking-widest text-[10px] gap-2 shadow-lg shadow-primary/10"
                                                                >
                                                                    {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                                                                    Ingest & Analyze
                                                                </Button>
                                                                <Button
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    className="h-12 px-6 rounded-xl font-black uppercase tracking-widest text-[10px] text-muted-foreground hover:bg-slate-900"
                                                                    onClick={() => {
                                                                        setPracticingIdx(null);
                                                                        setAnswer("");
                                                                        setFeedback(null);
                                                                    }}
                                                                >
                                                                    Back
                                                                </Button>
                                                            </div>

                                                            {feedback && practicingIdx === idx && (
                                                                <motion.div
                                                                    initial={{ opacity: 0, scale: 0.98 }}
                                                                    animate={{ opacity: 1, scale: 1 }}
                                                                    className="mt-10 space-y-10 border-t border-primary/5 pt-10"
                                                                >
                                                                    <div className="flex flex-col md:flex-row items-center justify-between gap-6 bg-primary/5 p-8 rounded-3xl border border-primary/10 shadow-inner">
                                                                        <div className="space-y-1">
                                                                            <p className="text-[11px] font-black uppercase tracking-widest text-primary mb-2">Aggregate star Coefficient</p>
                                                                            <div className="flex items-baseline gap-2">
                                                                                <span className="text-5xl font-black text-primary drop-shadow-[0_0_10px_rgba(var(--primary),0.3)]">{feedback.score}</span>
                                                                                <span className="text-sm text-muted-foreground font-black uppercase tracking-widest">Confidence</span>
                                                                            </div>
                                                                        </div>
                                                                        <div className="relative h-24 w-24">
                                                                            <svg className="h-full w-full -rotate-90">
                                                                                <circle cx="48" cy="48" r="40" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-primary/10" />
                                                                                <circle cx="48" cy="48" r="40" stroke="currentColor" strokeWidth="8" fill="transparent" strokeDasharray={251} strokeDashoffset={251 - (251 * feedback.score) / 100} className="text-primary transition-all duration-1000 ease-out" />
                                                                            </svg>
                                                                            <div className="absolute inset-0 flex items-center justify-center font-black text-xs text-primary">
                                                                                {feedback.score}%
                                                                            </div>
                                                                        </div>
                                                                    </div>

                                                                    <div className="grid grid-cols-2 gap-4">
                                                                        {[
                                                                            { label: "Situation", key: "situation", icon: "S" },
                                                                            { label: "Task", key: "task", icon: "T" },
                                                                            { label: "Action", key: "action", icon: "A" },
                                                                            { label: "Result", key: "result", icon: "R" },
                                                                        ].map((item) => (
                                                                            <Card key={item.key} className="p-5 border-primary/5 bg-slate-900/30 rounded-2xl shadow-md border-t-0">
                                                                                <div className="flex justify-between items-center mb-3">
                                                                                    <div className="flex items-center gap-2">
                                                                                        <div className="h-5 w-5 rounded-md bg-primary/20 flex items-center justify-center text-[10px] font-black text-primary">{item.icon}</div>
                                                                                        <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/40">{item.label}</span>
                                                                                    </div>
                                                                                    <span className="text-xs font-black text-white/80">{feedback.scores[item.key]}%</span>
                                                                                </div>
                                                                                <p className="text-[11px] leading-relaxed text-muted-foreground/80 italic font-medium">
                                                                                    "{feedback.star_breakdown[item.key]}"
                                                                                </p>
                                                                            </Card>
                                                                        ))}
                                                                    </div>

                                                                    <div className="grid md:grid-cols-2 gap-8">
                                                                        <div className="space-y-4">
                                                                            <h5 className="text-[10px] font-black uppercase tracking-widest flex items-center gap-2 text-emerald-500">
                                                                                <CheckCircle2 className="h-3.5 w-3.5" />
                                                                                Tactical Strengths
                                                                            </h5>
                                                                            <ul className="space-y-3">
                                                                                {feedback.strengths.map((s: string, i: number) => (
                                                                                    <li key={i} className="text-[12px] flex items-start gap-3 font-medium text-white/70">
                                                                                        <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                                                                                        {s}
                                                                                    </li>
                                                                                ))}
                                                                            </ul>
                                                                        </div>
                                                                        <div className="space-y-4">
                                                                            <h5 className="text-[10px] font-black uppercase tracking-widest flex items-center gap-2 text-amber-500">
                                                                                <Target className="h-3.5 w-3.5" />
                                                                                Calibration Areas
                                                                            </h5>
                                                                            <ul className="space-y-3">
                                                                                {feedback.improvements.map((imp: string, i: number) => (
                                                                                    <li key={i} className="text-[12px] flex items-start gap-3 font-medium text-muted-foreground/60 italic">
                                                                                        <div className="h-1.5 w-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                                                                                        {imp}
                                                                                    </li>
                                                                                ))}
                                                                            </ul>
                                                                        </div>
                                                                    </div>
                                                                </motion.div>
                                                            )}
                                                        </motion.div>
                                                    ) : (
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            className="w-full h-14 rounded-2xl border-primary/10 bg-primary/5 hover:bg-primary/20 text-primary font-black uppercase tracking-widest text-[10px] gap-2 transition-all shadow-md group"
                                                            onClick={() => {
                                                                setPracticingIdx(idx);
                                                                setAnswer("");
                                                                setFeedback(null);
                                                            }}
                                                        >
                                                            <Sparkles className="h-4 w-4 transition-transform group-hover:rotate-12" />
                                                            Initialize Practice Simulation
                                                        </Button>
                                                    )}
                                                </AnimatePresence>
                                            </div>
                                        </AccordionContent>
                                    </AccordionItem>
                                ))}
                            </Accordion>

                            <Button
                                variant="ghost"
                                className="w-full h-12 rounded-2xl font-black uppercase tracking-widest text-[10px] text-muted-foreground hover:bg-slate-900 border border-primary/5 gap-2"
                                onClick={() => setQuestions([])}
                            >
                                <ArrowRight className="h-3 w-3" />
                                Recalibrate Selection
                            </Button>
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}

function AlertCircle(props: any) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <circle cx="12" cy="12" r="10" />
            <line x1="12" x2="12" y1="8" y2="12" />
            <line x1="12" x2="12.01" y1="16" y2="16" />
        </svg>
    )
}