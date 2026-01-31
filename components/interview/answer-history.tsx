"use client";

import { format } from "date-fns";
import {
    History,
    ChevronDown,
    ChevronUp,
    Clock,
    Award,
    ArrowUpRight,
    ArrowDownRight,
    Minus
} from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";

interface AnswerHistoryProps {
    answers: any[];
    onSelectAnswer?: (answer: any) => void;
    currentAnswerId?: string | null;
}

export function AnswerHistory({
    answers,
    onSelectAnswer,
    currentAnswerId
}: AnswerHistoryProps) {
    const [isOpen, setIsOpen] = useState(false);

    if (!answers || answers.length === 0) return null;

    // Sort answers by date descending (newest first)
    const sortedAnswers = [...answers].sort(
        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );

    const getScoreColor = (score: number) => {
        if (score >= 8) return "text-green-600 bg-green-100 border-green-200";
        if (score >= 6) return "text-yellow-600 bg-yellow-100 border-yellow-200";
        return "text-red-600 bg-red-100 border-red-200";
    };

    const getScoreTrend = (current: any, index: number) => {
        if (index === sortedAnswers.length - 1) return null; // No previous answer

        const previous = sortedAnswers[index + 1];
        const currentScore = current.interview_feedback?.score || 0;
        const prevScore = previous.interview_feedback?.score || 0;

        if (currentScore > prevScore) return <ArrowUpRight className="w-4 h-4 text-green-500" />;
        if (currentScore < prevScore) return <ArrowDownRight className="w-4 h-4 text-red-500" />;
        return <Minus className="w-4 h-4 text-gray-400" />;
    };

    return (
        <div className="border rounded-lg bg-white dark:bg-gray-950 overflow-hidden">
            <Button
                variant="ghost"
                className="w-full flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-900"
                onClick={() => setIsOpen(!isOpen)}
            >
                <div className="flex items-center gap-2">
                    <History className="w-4 h-4 text-gray-500" />
                    <span className="font-medium">Answer History</span>
                    <Badge variant="secondary" className="ml-2">
                        {answers.length} {answers.length === 1 ? 'attempt' : 'attempts'}
                    </Badge>
                </div>
                {isOpen ? (
                    <ChevronUp className="w-4 h-4 text-gray-500" />
                ) : (
                    <ChevronDown className="w-4 h-4 text-gray-500" />
                )}
            </Button>

            {isOpen && (
                <div className="border-t bg-gray-50/50 dark:bg-gray-900/50">
                    <ScrollArea className="max-h-[300px]">
                        <div className="p-4 space-y-3">
                            {sortedAnswers.map((answer, index) => {
                                const feedback = answer.interview_feedback;
                                const isSelected = currentAnswerId === answer.id;

                                return (
                                    <div
                                        key={answer.id}
                                        onClick={() => onSelectAnswer?.(answer)}
                                        className={`
                      relative p-3 rounded-lg border transition-all cursor-pointer
                      ${isSelected
                                                ? "bg-blue-50 border-blue-200 ring-1 ring-blue-300 dark:bg-blue-900/20 dark:border-blue-800"
                                                : "bg-white border-gray-200 hover:border-gray-300 dark:bg-gray-950 dark:border-gray-800"
                                            }
                    `}
                                    >
                                        <div className="flex items-start justify-between mb-2">
                                            <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                                                <Clock className="w-3 h-3" />
                                                {format(new Date(answer.created_at), "MMM d, h:mm a")}
                                            </div>
                                            {feedback && (
                                                <div className={`flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full border ${getScoreColor(feedback.score)}`}>
                                                    <Award className="w-3 h-3" />
                                                    <span>{feedback.score}/10</span>
                                                    {getScoreTrend(answer, index)}
                                                </div>
                                            )}
                                        </div>

                                        <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-2">
                                            {answer.answer_text}
                                        </p>

                                        {answer.answer_duration && (
                                            <div className="mt-2 text-xs text-gray-500">
                                                {Math.floor(answer.answer_duration / 60)}m {answer.answer_duration % 60}s duration
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </ScrollArea>
                </div>
            )}
        </div>
    );
}
