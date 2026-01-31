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

    const handleGenerate = async () => {
        setIsLoading(true);
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