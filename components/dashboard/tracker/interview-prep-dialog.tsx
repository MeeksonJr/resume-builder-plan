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
    BrainCircuit
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";

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
            <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <div className="flex items-center gap-2 mb-2">
                        <Badge variant="secondary" className="gap-1 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider">
                            <BrainCircuit className="h-3 w-3 text-primary" />
                            AI Assistant
                        </Badge>
                    </div>
                    <DialogTitle className="text-2xl font-bold">Interview Preparation</DialogTitle>
                    <DialogDescription>
                        Customized interview questions and guidance for <span className="font-semibold text-foreground">{application.role}</span> at <span className="font-semibold text-foreground">{application.company}</span>.
                    </DialogDescription>
                </DialogHeader>

                <div className="py-6 space-y-6">
                    {questions.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12 px-4 text-center border-2 border-dashed rounded-2xl bg-muted/20">
                            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                                <Sparkles className="h-6 w-6 text-primary" />
                            </div>
                            <h3 className="text-lg font-semibold mb-2">Ready to Prepare?</h3>
                            <p className="text-sm text-muted-foreground max-w-sm mb-6">
                                Our AI will analyze your resume against this job to predict likely interview questions and help you craft perfect answers.
                            </p>
                            <Button
                                onClick={handleGenerate}
                                disabled={isLoading || !application.resume_id}
                                className="gap-2"
                            >
                                {isLoading ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                    <Sparkles className="h-4 w-4" />
                                )}
                                Generate Interview Prep
                            </Button>
                            {!application.resume_id && (
                                <p className="text-xs text-red-500 mt-4">
                                    Please link a resume to this application first.
                                </p>
                            )}
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <div className="grid grid-cols-3 gap-4">
                                <Card>
                                    <CardHeader className="p-3 pb-1">
                                        <CardTitle className="text-[10px] uppercase text-muted-foreground flex items-center gap-1">
                                            <Target className="h-3 w-3" />
                                            Strategy
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="p-3 pt-0">
                                        <p className="text-xs font-medium">Use STAR Method</p>
                                    </CardContent>
                                </Card>
                                <Card>
                                    <CardHeader className="p-3 pb-1">
                                        <CardTitle className="text-[10px] uppercase text-muted-foreground flex items-center gap-1">
                                            <MessageSquare className="h-3 w-3" />
                                            Focus
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="p-3 pt-0">
                                        <p className="text-xs font-medium">Quantify Impact</p>
                                    </CardContent>
                                </Card>
                                <Card>
                                    <CardHeader className="p-3 pb-1">
                                        <CardTitle className="text-[10px] uppercase text-muted-foreground flex items-center gap-1">
                                            <CheckCircle2 className="h-3 w-3" />
                                            Goal
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="p-3 pt-0">
                                        <p className="text-xs font-medium">Show Competency</p>
                                    </CardContent>
                                </Card>
                            </div>

                            <Accordion type="single" collapsible className="w-full">
                                {questions.map((q, idx) => (
                                    <AccordionItem key={idx} value={`item-${idx}`} className="border rounded-lg px-4 mb-3 bg-card shadow-sm hover:border-primary/50 transition-colors">
                                        <AccordionTrigger className="hover:no-underline py-4">
                                            <div className="flex flex-col items-start text-left gap-2">
                                                <Badge variant="outline" className="text-[9px] uppercase font-bold text-primary border-primary/20">
                                                    {q.type}
                                                </Badge>
                                                <span className="text-sm font-semibold">{q.question}</span>
                                            </div>
                                        </AccordionTrigger>
                                        <AccordionContent className="pb-4 space-y-4">
                                            <div className="bg-muted/50 p-3 rounded-lg border">
                                                <h4 className="text-xs font-bold uppercase text-muted-foreground mb-2 flex items-center gap-1">
                                                    <ChevronRight className="h-3 w-3" />
                                                    STAR guidance
                                                </h4>
                                                <p className="text-sm text-muted-foreground leading-relaxed">
                                                    {q.star_guidance}
                                                </p>
                                            </div>

                                            <div>
                                                <h4 className="text-xs font-bold uppercase text-muted-foreground mb-2 flex items-center gap-1">
                                                    <ChevronRight className="h-3 w-3" />
                                                    Key Points from your resume
                                                </h4>
                                                <ul className="space-y-2">
                                                    {q.sample_answer_points.map((point: string, pIdx: number) => (
                                                        <li key={pIdx} className="flex items-start gap-2 text-sm">
                                                            <div className="h-4 w-4 rounded-full bg-green-500/10 flex items-center justify-center shrink-0 mt-0.5">
                                                                <CheckCircle2 className="h-3 w-3 text-green-600" />
                                                            </div>
                                                            <span>{point}</span>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>

                                            <div className="pt-4 border-t">
                                                {practicingIdx === idx ? (
                                                    <div className="space-y-4">
                                                        <div className="space-y-2">
                                                            <h4 className="text-sm font-bold">Your Mock Response</h4>
                                                            <textarea
                                                                className="w-full min-h-[120px] p-3 rounded-lg border bg-background text-sm focus:ring-2 focus:ring-primary outline-none"
                                                                placeholder="Type your answer here using the STAR method..."
                                                                value={answer}
                                                                onChange={(e) => setAnswer(e.target.value)}
                                                            />
                                                        </div>
                                                        <div className="flex gap-2">
                                                            <Button
                                                                size="sm"
                                                                onClick={() => handleSubmitAnswer(q.question)}
                                                                disabled={isSubmitting || !answer.trim()}
                                                                className="flex-1 gap-2"
                                                            >
                                                                {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                                                                Get AI Feedback
                                                            </Button>
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                onClick={() => {
                                                                    setPracticingIdx(null);
                                                                    setAnswer("");
                                                                    setFeedback(null);
                                                                }}
                                                            >
                                                                Cancel
                                                            </Button>
                                                        </div>

                                                        {feedback && practicingIdx === idx && (
                                                            <div className="mt-6 space-y-6 animate-in fade-in slide-in-from-top-4 duration-500">
                                                                <div className="flex items-center justify-between bg-primary/5 p-4 rounded-xl border border-primary/20">
                                                                    <div>
                                                                        <p className="text-xs font-bold uppercase text-primary mb-1">Overall STAR Score</p>
                                                                        <div className="flex items-baseline gap-2">
                                                                            <span className="text-3xl font-black text-primary">{feedback.score}</span>
                                                                            <span className="text-sm text-muted-foreground font-medium">/ 100</span>
                                                                        </div>
                                                                    </div>
                                                                    <div className="h-12 w-12 rounded-full border-4 border-primary/30 border-t-primary flex items-center justify-center font-bold text-lg">
                                                                        {feedback.score}%
                                                                    </div>
                                                                </div>

                                                                <div className="grid grid-cols-2 gap-3">
                                                                    {[
                                                                        { label: "Situation", key: "situation", variant: "blue" },
                                                                        { label: "Task", key: "task", variant: "purple" },
                                                                        { label: "Action", key: "action", variant: "green" },
                                                                        { label: "Result", key: "result", variant: "orange" },
                                                                    ].map((item) => (
                                                                        <Card key={item.key} className="p-3 border-none bg-muted/30">
                                                                            <div className="flex justify-between items-center mb-1">
                                                                                <span className="text-[10px] font-black uppercase text-muted-foreground">{item.label}</span>
                                                                                <span className="text-xs font-bold">{feedback.scores[item.key]}%</span>
                                                                            </div>
                                                                            <p className="text-[10px] leading-tight text-muted-foreground italic">
                                                                                {feedback.star_breakdown[item.key]}
                                                                            </p>
                                                                        </Card>
                                                                    ))}
                                                                </div>

                                                                <div className="space-y-4">
                                                                    <div className="space-y-2">
                                                                        <h5 className="text-xs font-bold uppercase flex items-center gap-1 text-green-600">
                                                                            <CheckCircle2 className="h-3 w-3" />
                                                                            Strengths
                                                                        </h5>
                                                                        <ul className="space-y-1">
                                                                            {feedback.strengths.map((s: string, i: number) => (
                                                                                <li key={i} className="text-sm flex items-start gap-2">
                                                                                    <div className="h-1.5 w-1.5 rounded-full bg-green-500 mt-1.5 shrink-0" />
                                                                                    {s}
                                                                                </li>
                                                                            ))}
                                                                        </ul>
                                                                    </div>
                                                                    <div className="space-y-2">
                                                                        <h5 className="text-xs font-bold uppercase flex items-center gap-1 text-orange-600">
                                                                            <Target className="h-3 w-3" />
                                                                            Areas for Improvement
                                                                        </h5>
                                                                        <ul className="space-y-1">
                                                                            {feedback.improvements.map((imp: string, i: number) => (
                                                                                <li key={i} className="text-sm flex items-start gap-2 text-muted-foreground">
                                                                                    <div className="h-1.5 w-1.5 rounded-full bg-orange-500 mt-1.5 shrink-0" />
                                                                                    {imp}
                                                                                </li>
                                                                            ))}
                                                                        </ul>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                ) : (
                                                    <Button
                                                        variant="secondary"
                                                        size="sm"
                                                        className="w-full gap-2"
                                                        onClick={() => {
                                                            setPracticingIdx(idx);
                                                            setAnswer("");
                                                            setFeedback(null);
                                                        }}
                                                    >
                                                        <Sparkles className="h-4 w-4" />
                                                        Practice this Answer
                                                    </Button>
                                                )}
                                            </div>
                                        </AccordionContent>
                                    </AccordionItem>
                                ))}
                            </Accordion>

                            <Button
                                variant="outline"
                                className="w-full gap-2 mt-4"
                                onClick={() => setQuestions([])}
                            >
                                <Sparkles className="h-4 w-4" />
                                Re-generate Questions
                            </Button>
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}