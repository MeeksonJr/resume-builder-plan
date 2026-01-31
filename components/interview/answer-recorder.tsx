"use client";

import { useState, useRef, useEffect } from "react";
import { Mic, MicOff, Send, Loader2 } from "lucide-react";

interface AnswerRecorderProps {
    questionId: string;
    sessionId: string;
    onAnswerSubmitted?: (answerId: string) => void;
    disabled?: boolean;
    initialValue?: string;
}

export function AnswerRecorder({
    questionId,
    sessionId,
    onAnswerSubmitted,
    disabled = false,
    initialValue = "",
}: AnswerRecorderProps) {
    const [answer, setAnswer] = useState(initialValue);
    const [isRecording, setIsRecording] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [startTime, setStartTime] = useState<number | null>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    useEffect(() => {
        setAnswer(initialValue);
    }, [initialValue]);

    const handleStartRecording = () => {
        setIsRecording(true);
        setStartTime(Date.now());
    };

    const handleStopRecording = () => {
        setIsRecording(false);
    };

    const handleSubmit = async () => {
        if (!answer.trim()) return;

        setIsSubmitting(true);
        try {
            const duration = startTime ? Math.floor((Date.now() - startTime) / 1000) : null;

            const response = await fetch("/api/interview/answers", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    questionId,
                    sessionId,
                    answerText: answer,
                    answerDuration: duration,
                }),
            });

            if (!response.ok) {
                throw new Error("Failed to submit answer");
            }

            const data = await response.json();

            // Clear the answer and reset state
            setAnswer("");
            setStartTime(null);

            if (onAnswerSubmitted && data.answer?.id) {
                onAnswerSubmitted(data.answer.id);
            }
        } catch (error) {
            console.error("Error submitting answer:", error);
            alert("Failed to submit answer. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
            e.preventDefault();
            handleSubmit();
        }
    };

    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = "auto";
            textareaRef.current.style.height = textareaRef.current.scrollHeight + "px";
        }
    }, [answer]);

    return (
        <div className="space-y-4">
            <div className="relative">
                <textarea
                    ref={textareaRef}
                    value={answer}
                    onChange={(e) => setAnswer(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Type your answer here... (Ctrl+Enter to submit)"
                    disabled={disabled || isSubmitting}
                    className="w-full min-h-[150px] max-h-[400px] px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none disabled:opacity-50 disabled:cursor-not-allowed"
                    rows={6}
                />

                {isRecording && (
                    <div className="absolute top-3 right-3 flex items-center gap-2 px-3 py-1 bg-red-100 border border-red-300 rounded-full">
                        <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                        <span className="text-sm font-medium text-red-700">Recording</span>
                    </div>
                )}
            </div>

            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <button
                        type="button"
                        onClick={isRecording ? handleStopRecording : handleStartRecording}
                        disabled={disabled || isSubmitting}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${isRecording
                            ? "bg-red-100 text-red-700 hover:bg-red-200"
                            : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                            } disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                        {isRecording ? (
                            <>
                                <MicOff className="w-4 h-4" />
                                Stop Timer
                            </>
                        ) : (
                            <>
                                <Mic className="w-4 h-4" />
                                Start Timer
                            </>
                        )}
                    </button>

                    {startTime && (
                        <div className="text-sm text-gray-600">
                            Time: {Math.floor((Date.now() - (startTime || 0)) / 1000)}s
                        </div>
                    )}
                </div>

                <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={!answer.trim() || disabled || isSubmitting}
                    className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isSubmitting ? (
                        <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Submitting...
                        </>
                    ) : (
                        <>
                            <Send className="w-4 h-4" />
                            Submit Answer
                        </>
                    )}
                </button>
            </div>

            <p className="text-xs text-gray-500">
                Tip: Use the timer to practice time management. Press Ctrl+Enter to quickly submit.
            </p>
        </div>
    );
}
