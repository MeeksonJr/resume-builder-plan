"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
    ChevronLeft,
    ChevronRight,
    ArrowLeft,
    CheckCircle2,
} from "lucide-react";
import { toast } from "sonner";
import { AnswerRecorder } from "@/components/interview/answer-recorder";
import { EvaluationDisplay } from "@/components/interview/evaluation-display";

interface PracticeInterfaceProps {
    session: any;
    questions: any[];
}

export function PracticeInterface({ session, questions }: PracticeInterfaceProps) {
    const router = useRouter();
    const [currentIndex, setCurrentIndex] = useState(0);
    const [currentAnswerId, setCurrentAnswerId] = useState<string | null>(null);
    const [answeredQuestions, setAnsweredQuestions] = useState<Set<number>>(new Set());

    const currentQuestion = questions[currentIndex];
    const progress = ((currentIndex + 1) / questions.length) * 100;
    const answeredCount = answeredQuestions.size;

    const handleAnswerSubmitted = (answerId: string) => {
        setCurrentAnswerId(answerId);
        setAnsweredQuestions(prev => new Set(prev).add(currentIndex));
        toast.success("Answer submitted successfully!");
    };

    const handleNext = () => {
        if (currentIndex < questions.length - 1) {
            setCurrentIndex(currentIndex + 1);
            setCurrentAnswerId(null);
        }
    };

    const handlePrevious = () => {
        if (currentIndex > 0) {
            setCurrentIndex(currentIndex - 1);
            setCurrentAnswerId(null);
        }
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
                    {!currentAnswerId ? (
                        <div className="space-y-4">
                            <div className="p-4 bg-blue-50 dark:bg-blue-950 rounded-lg border border-blue-200 dark:border-blue-800">
                                <p className="text-sm text-blue-800 dark:text-blue-200">
                                    <strong>Tip:</strong> Consider using the STAR framework (Situation, Task, Action, Result) for behavioral questions.
                                </p>
                            </div>

                            <AnswerRecorder
                                questionId={currentQuestion.id}
                                sessionId={session.id}
                                onAnswerSubmitted={handleAnswerSubmitted}
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
                                onClick={() => setCurrentAnswerId(null)}
                                className="w-full"
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
