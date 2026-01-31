"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
    ChevronLeft,
    ChevronRight,
    Send,
    Loader2,
    ArrowLeft,
    CheckCircle2,
} from "lucide-react";
import { toast } from "sonner";
import { AnswerFeedback } from "@/components/interview/answer-feedback";

interface PracticeInterfaceProps {
    session: any;
    questions: any[];
}

export function PracticeInterface({ session, questions }: PracticeInterfaceProps) {
    const router = useRouter();
    const [currentIndex, setCurrentIndex] = useState(0);
    const [answer, setAnswer] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [feedback, setFeedback] = useState<any>(null);

    const currentQuestion = questions[currentIndex];
    const progress = ((currentIndex + 1) / questions.length) * 100;
    const answeredCount = questions.filter(q => q.user_answer).length;

    const handleSubmitAnswer = async () => {
        if (!answer.trim()) {
            toast.error("Please write an answer before submitting");
            return;
        }

        if (answer.trim().length < 50) {
            toast.error("Your answer should be at least 50 characters");
            return;
        }

        setIsSubmitting(true);
        try {
            const response = await fetch(
                `/api/interview/questions/${currentQuestion.id}/evaluate`,
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ answer: answer.trim() }),
                }
            );

            if (!response.ok) throw new Error("Failed to evaluate answer");

            const feedbackData = await response.json();
            setFeedback(feedbackData);

            // Update the question in local state
            questions[currentIndex] = {
                ...currentQuestion,
                user_answer: answer.trim(),
                ai_feedback: feedbackData,
            };

            toast.success("Answer submitted successfully!");
        } catch (error) {
            console.error(error);
            toast.error("Failed to evaluate answer");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleNext = () => {
        if (currentIndex < questions.length - 1) {
            setCurrentIndex(currentIndex + 1);
            setAnswer(questions[currentIndex + 1]?.user_answer || "");
            setFeedback(questions[currentIndex + 1]?.ai_feedback || null);
        }
    };

    const handlePrevious = () => {
        if (currentIndex > 0) {
            setCurrentIndex(currentIndex - 1);
            setAnswer(questions[currentIndex - 1]?.user_answer || "");
            setFeedback(questions[currentIndex - 1]?.ai_feedback || null);
        }
    };

    const handleTryAgain = () => {
        setAnswer("");
        setFeedback(null);
    };

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

    if (!currentQuestion) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Session Complete!</CardTitle>
                    <CardDescription>
                        You've answered all {questions.length} questions.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center gap-2">
                        <CheckCircle2 className="h-5 w-5 text-green-600" />
                        <span className="font-medium">
                            {answeredCount} / {questions.length} questions answered
                        </span>
                    </div>
                    <div className="flex gap-2">
                        <Button onClick={() => router.push("/dashboard/interview-prep")}>
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Back to Dashboard
                        </Button>
                        <Button variant="outline" onClick={() => setCurrentIndex(0)}>
                            Review Answers
                        </Button>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <Button
                    variant="ghost"
                    onClick={() => router.push("/dashboard/interview-prep")}
                    className="gap-2"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Exit Session
                </Button>
                <div className="text-sm text-muted-foreground">
                    <span className="font-medium">{session.target_role}</span> •{" "}
                    <span className="capitalize">{session.difficulty}</span>
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
                <Progress value={progress} className="h-2" />
            </div>

            {/* Question Card */}
            <Card>
                <CardHeader>
                    <div className="flex items-start justify-between">
                        <div className="space-y-2 flex-1">
                            <div className="flex items-center gap-2">
                                <Badge className={getQuestionTypeColor(currentQuestion.question_type)}>
                                    {currentQuestion.question_type}
                                </Badge>
                                {currentQuestion.user_answer && (
                                    <Badge variant="outline" className="gap-1">
                                        <CheckCircle2 className="h-3 w-3" />
                                        Answered
                                    </Badge>
                                )}
                            </div>
                            <CardTitle className="text-xl leading-relaxed">
                                {currentQuestion.question_text}
                            </CardTitle>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="space-y-6">
                    {!feedback ? (
                        <>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Your Answer</label>
                                <Textarea
                                    value={answer}
                                    onChange={(e) => setAnswer(e.target.value)}
                                    placeholder="Type your answer here... Consider using the STAR framework (Situation, Task, Action, Result) for behavioral questions."
                                    className="min-h-[200px] resize-none"
                                    disabled={isSubmitting}
                                />
                                <div className="flex items-center justify-between text-xs text-muted-foreground">
                                    <span>{answer.length} characters</span>
                                    <span>Minimum 50 characters</span>
                                </div>
                            </div>

                            <Button
                                onClick={handleSubmitAnswer}
                                disabled={isSubmitting || answer.trim().length < 50}
                                className="w-full gap-2"
                            >
                                {isSubmitting ? (
                                    <>
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                        Evaluating Answer...
                                    </>
                                ) : (
                                    <>
                                        <Send className="h-4 w-4" />
                                        Submit Answer
                                    </>
                                )}
                            </Button>
                        </>
                    ) : (
                        <AnswerFeedback
                            feedback={feedback}
                            answer={answer}
                            onTryAgain={handleTryAgain}
                        />
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
