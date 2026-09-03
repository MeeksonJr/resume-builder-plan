"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

import { Label } from "@/components/ui/label";
import {
    ChevronLeft,
    ChevronRight,
    ArrowLeft,
    CheckCircle2,
    Volume2,
    VolumeX,
    Mic,
    Sparkles,
    Target,
    Lightbulb
} from "lucide-react";
import { toast } from "sonner";
import { AnswerRecorder } from "@/components/interview/answer-recorder";
import { EvaluationDisplay } from "@/components/interview/evaluation-display";
import { AnswerHistory } from "@/components/interview/answer-history";
import { AnswerComparison } from "@/components/interview/answer-comparison";
import { InterviewResults } from "@/components/interview/interview-results";
import { useSpeechSynthesis } from "@/lib/hooks/use-speech-synthesis";

interface PracticeInterfaceProps {
    session: any;
    questions: any[];
    initialAnswers?: any[];
}

export function PracticeInterface({ session, questions, initialAnswers = [] }: PracticeInterfaceProps) {
    const router = useRouter();
    const [currentIndex, setCurrentIndex] = useState(0);
    const [currentAnswerId, setCurrentAnswerId] = useState<string | null>(null);
    const [answeredQuestions, setAnsweredQuestions] = useState<Set<number>>(new Set());
    const [answers, setAnswers] = useState<any[]>(initialAnswers);
    // If session is completed and we have answers, show results immediately
    const isSessionCompleted = !!session.completed_at;

    const [comparisonData, setComparisonData] = useState<{ a1: any, a2: any } | null>(null);
    const [initialAnswerText, setInitialAnswerText] = useState("");

    const currentQuestion = questions[currentIndex];
    const progress = ((currentIndex + 1) / questions.length) * 100;
    const answeredCount = answeredQuestions.size;

    // Text-to-Speech Hook
    const { speak, stop, isSpeaking, isSupported: isTTSSupported } = useSpeechSynthesis();

    // Stop speaking when component unmounts
    useEffect(() => {
        return () => stop();
    }, [stop]);


    // Fetch answers on mount ONLY if not provided initially
    useEffect(() => {
        if (initialAnswers.length > 0 || isSessionCompleted) return;

        const fetchAnswers = async () => {
            try {
                const response = await fetch(`/api/interview/answers?sessionId=${session.id}`);
                if (response.ok) {
                    const data = await response.json();
                    setAnswers(data.answers || []);

                    // Mark questions as answered if they have answers
                    const answeredIndices = new Set<number>();
                    questions.forEach((q, index) => {
                        if (data.answers.some((a: any) => a.question_id === q.id)) {
                            answeredIndices.add(index);
                        }
                    });
                    setAnsweredQuestions(answeredIndices);
                }
            } catch (error) {
                console.error("Failed to fetch answers:", error);
            }
        };

        fetchAnswers();
    }, [session.id, questions, initialAnswers.length, isSessionCompleted]);

    // Handle answer submission
    const handleAnswerSubmitted = (answerId: string) => {
        stop(); // Stop speaking if submitting
        setCurrentAnswerId(answerId);
        setAnsweredQuestions(prev => new Set(prev).add(currentIndex));
        toast.success("Answer submitted successfully!");

        // Refresh answers (optimistic update would be better but simple refetch is fine)
        fetch(`/api/interview/answers?sessionId=${session.id}`)
            .then(res => res.json())
            .then(data => {
                if (data.answers) setAnswers(data.answers);
            });
    };

    const handleNext = () => {
        stop();
        if (currentIndex < questions.length - 1) {
            setCurrentIndex(currentIndex + 1);
            setCurrentAnswerId(null);
            setComparisonData(null);
            setInitialAnswerText("");
        }
    };

    const handlePrevious = () => {
        stop();
        if (currentIndex > 0) {
            setCurrentIndex(currentIndex - 1);
            setCurrentAnswerId(null);
            setComparisonData(null);
            setInitialAnswerText("");
        }
    };

    const handleReadQuestion = () => {
        if (isSpeaking) {
            stop();
        } else {
            speak(currentQuestion.question_text);
        }
    };

    // Filter answers for current question
    const currentQuestionAnswers = answers.filter(a => a.question_id === currentQuestion.id);

    const getQuestionTypeColor = (type: string) => {
        switch (type) {
            case "behavioral":
                return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300";
            case "technical":
                return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300";
            case "situational":
                return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
            default:
                return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300";
        }
    };

    if (!currentQuestion || isSessionCompleted) {
        // Enriched answers logic...
        const enrichedAnswers = answers.map(answer => {
            const question = questions.find(q => q.id === answer.question_id);
            return {
                ...answer,
                question_text: question?.question_text || "Unknown Question",
                question_type: question?.question_type || "General"
            };
        });

        return <InterviewResults session={session} answers={enrichedAnswers} />;
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <Button
                    variant="ghost"
                    onClick={() => router.push("/dashboard/interview-prep")}
                    className="gap-2 rounded-none text-[#102b2b] hover:bg-[#102b2b]/10"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Exit Session
                </Button>

                <div className="flex items-center gap-6">
                    {/* Voice Mode Toggle */}
                    <div className="text-sm text-muted-foreground hidden md:block">
                        <span className="font-medium">{session.target_role}</span> •{" "}
                        <span className="capitalize">{session.difficulty}</span>
                    </div>
                </div>
            </div>

            {/* Progress */}
            <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">
                        Question {currentIndex + 1} of {questions.length}
                    </span>
                    <span className="text-muted-foreground">
                        {answeredCount} answered
                    </span>
                </div>
                <Progress value={progress} className="h-2 rounded-none bg-[#102b2b]/10" />
            </div>

            {/* Question Card */}
            <Card className="border-[#102b2b]/15 bg-[#f4f7f1] shadow-none">
                <CardHeader>
                    <div className="flex items-start justify-between">
                        <div className="space-y-2 flex-1">
                            <div className="flex items-center gap-3">
                                <Badge className={getQuestionTypeColor(currentQuestion.question_type)}>
                                    {currentQuestion.question_type}
                                </Badge>
                                {answeredQuestions.has(currentIndex) && (
                                    <Badge variant="outline" className="gap-1">
                                        <CheckCircle2 className="h-3 w-3" />
                                        Answered
                                    </Badge>
                                )}

                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className={`h-9 w-9 rounded-none p-0 ${isSpeaking ? "animate-pulse text-[#0d8274]" : "text-[#102b2b]/55"}`}
                                    onClick={handleReadQuestion}
                                    title="Read question aloud"
                                    aria-label="Read question aloud"
                                >
                                    {isSpeaking ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
                                </Button>
                            </div>
                            <CardTitle className="text-xl leading-relaxed font-bold text-[#102b2b]">
                                {currentQuestion.question_text}
                            </CardTitle>

                            {/* Target Competencies */}
                            {currentQuestion.expected_competencies && currentQuestion.expected_competencies.length > 0 && (
                                <div className="flex flex-wrap items-center gap-1.5 pt-1">
                                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                                        <Target className="w-3 h-3 text-[#0d8274]" />
                                        Target Competencies:
                                    </span>
                                    {currentQuestion.expected_competencies.map((comp: string, idx: number) => (
                                        <Badge key={idx} variant="outline" className="rounded-none text-[10px] border-[#102b2b]/15 bg-white text-[#102b2b] font-medium py-0">
                                            {comp}
                                        </Badge>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="space-y-6">
                    {/* AI STAR Coaching Tip */}
                    {currentQuestion.star_tip && (
                        <div className="border border-[#0d8274]/25 bg-[#0d8274]/5 p-3.5 space-y-1.5">
                            <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#0d8274]">
                                <Sparkles className="w-3.5 h-3.5" />
                                <span>AI STAR Answering Framework Tip</span>
                            </div>
                            <p className="text-xs text-[#102b2b]/85 leading-relaxed">
                                {currentQuestion.star_tip}
                            </p>
                        </div>
                    )}
                    {/* Answer History specific to current question */}
                    {currentQuestionAnswers.length > 0 && (
                        <div className="mb-6">
                            <AnswerHistory
                                answers={currentQuestionAnswers}
                                currentAnswerId={currentAnswerId}
                                onSelectAnswer={(a) => {
                                    setCurrentAnswerId(a.id);
                                    setComparisonData(null);
                                }}
                                onCompare={(a1, a2) => {
                                    setComparisonData({ a1, a2 });
                                    setCurrentAnswerId(null);
                                }}
                                onImprove={(text) => {
                                    setInitialAnswerText(text);
                                    setCurrentAnswerId(null);
                                    setComparisonData(null);
                                }}
                            />
                        </div>
                    )}

                    {comparisonData ? (
                        <AnswerComparison
                            answer1={comparisonData.a1}
                            answer2={comparisonData.a2}
                            onClose={() => setComparisonData(null)}
                        />
                    ) : !currentAnswerId ? (
                        <div className="space-y-4">
                            <div className="flex items-start justify-between border border-[#0d8274]/20 bg-[#0d8274]/10 p-4">
                                <p className="text-sm text-[#102b2b]">
                                    <strong>Tip:</strong> Consider using the STAR framework (Situation, Task, Action, Result) for behavioral questions.
                                </p>
                            </div>

                            <AnswerRecorder
                                questionId={currentQuestion.id}
                                sessionId={session.id}
                                onAnswerSubmitted={handleAnswerSubmitted}
                                initialValue={initialAnswerText}
                            />
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <EvaluationDisplay
                                answerId={currentAnswerId}
                                autoEvaluate={true}
                            />

                            <Button
                                variant="outline"
                                onClick={() => {
                                    setCurrentAnswerId(null);
                                    setInitialAnswerText("");
                                }}
                                className="w-full rounded-none border-[#102b2b]/25"
                            >
                                Try Different Answer
                            </Button>
                        </div>
                    )}

                    {/* Navigation */}
                    <div className="flex items-center justify-between pt-4 border-t">
                        <Button
                            variant="outline"
                            onClick={handlePrevious}
                            disabled={currentIndex === 0}
                            className="gap-2"
                        >
                            <ChevronLeft className="h-4 w-4" />
                            Previous
                        </Button>
                        <Button
                            variant="outline"
                            onClick={handleNext}
                            disabled={currentIndex === questions.length - 1}
                            className="gap-2"
                        >
                            Next
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
