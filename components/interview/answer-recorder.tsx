"use client";

import { useState, useRef, useEffect } from "react";
import { Mic, MicOff, Send, Loader2, AlertCircle } from "lucide-react";
import { useSpeechRecognition } from "@/lib/hooks/use-speech-recognition";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface AnswerRecorderProps {
    questionId: string;
    sessionId: string;
    onAnswerSubmitted?: (answerId: string) => void;
    disabled?: boolean;
    initialValue?: string;
    autoStart?: boolean; // Prop to auto-start listening (for Voice Mode)
}

export function AnswerRecorder({
    questionId,
    sessionId,
    onAnswerSubmitted,
    disabled = false,
    initialValue = "",
    autoStart = false
}: AnswerRecorderProps) {
    const [answer, setAnswer] = useState(initialValue);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [startTime, setStartTime] = useState<number | null>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    // Use our custom hook
    const {
        isListening,
        transcript,
        interimTranscript,
        startListening,
        stopListening,
        resetTranscript,
        isSupported,
        error: micError
    } = useSpeechRecognition();

    useEffect(() => {
        setAnswer(initialValue);
    }, [initialValue]);

    // Auto-start if requested and supported
    useEffect(() => {
        if (autoStart && isSupported && !isListening && !disabled) {
            handleStartRecording();
        }
    }, [autoStart, isSupported, questionId]); // Restart when questionId changes if autoStart is true

    // Update answer when transcript changes
    useEffect(() => {
        if (transcript) {
            setAnswer(prev => {
                // simple logic to append: if prev ends with space, just add. else add space.
                // But we also need to respect manual edits. 
                // A better approach for a simple recorder is to just append new segments.
                // However, continuous listening often clears transcript or keeps it growing.
                // Our hook generally accumulates 'transcript'.
                // If we want to allow mixing typing and speaking, it's tricky.
                // Let's assume 'transcript' grows from empty each session, 
                // but we want to append it to whatever was typed BEFORE listening started?
                // Actually, the hook provided accumulates `transcript`. 
                // Let's just use the transcript as the source of truth WHILE listening? 
                // No, user might type.

                // Strategy: When listening starts, we remember the "base" text.
                // Then we setAnswer(base + transcript).
                // But if user types while listening, it gets messy.
                // Simple version: Just append new transcript chunks.
                // The hook provided accumulates. 
                // Let's try this: 
                // 1. Capture text before start (in handleStart) -> `baseText`.
                // 2. setAnswer(baseText + (baseText ? ' ' : '') + transcript)

                return prev;
            });
        }
    }, [transcript]);

    // Refined strategy for mixing typing + speech
    // We'll use a ref to store the text present when recording started
    const baseTextRef = useRef("");

    useEffect(() => {
        if (isListening) {
            // When transcript updates, update the answer
            setAnswer(baseTextRef.current + (baseTextRef.current && transcript ? ' ' : '') + transcript);
        }
    }, [transcript, isListening]);


    const handleStartRecording = () => {
        if (!isSupported) {
            alert("Speech recognition is not supported in this browser.");
            return;
        }
        baseTextRef.current = answer; // Snapshot current text
        resetTranscript(); // Clear previous session's transcript
        startListening();
        setStartTime(Date.now());
    };

    const handleStopRecording = () => {
        stopListening();
        // Start time remains set to calculate total duration up to this point? 
        // Or we just rely on total duration at submit. 
        // Simplification: We only track duration if they continuously record. 
        // If they toggle, we might lose precision but that's fine for MVP.
    };

    const handleSubmit = async () => {
        if (!answer.trim()) return;

        if (isListening) {
            stopListening();
        }

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
                    answerDuration: duration || 0, // Default to 0 if manual typing
                }),
            });

            if (!response.ok) {
                throw new Error("Failed to submit answer");
            }

            const data = await response.json();

            // Clear the answer and reset state
            setAnswer("");
            setStartTime(null);
            resetTranscript();

            if (onAnswerSubmitted && data.answer?.id) {
                onAnswerSubmitted(data.answer.id);
            }
        } catch (error) {
            console.error("Error submitting answer:", error);
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
    }, [answer, interimTranscript]);

    return (
        <div className="space-y-4">
            {micError && (
                <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{micError}</AlertDescription>
                </Alert>
            )}

            <div className="relative">
                <textarea
                    ref={textareaRef}
                    value={isListening ? answer + (interimTranscript ? ' ' + interimTranscript : '') : answer}
                    onChange={(e) => {
                        setAnswer(e.target.value);
                        // If they type while listening, update baseTextRef so transcript appends correctly?
                        // Or just stop listening?
                        // For simplicity, do NOT update baseTextRef, just let them type. 
                        // But if they type, the next transcript update will overwrite their typing if we strictly use baseTextRef + transcript.
                        // Best UX: Stop listening if they type? Or just let them type and it updates 'answer'. 
                        if (isListening) {
                            // If typing occurs, we update baseText to be current value MINUS transcript? 
                            // Too complex. Let's just update baseText to current value and reset transcript to avoid duplication?
                            // Or imply that typing pauses sync.
                            // Let's keep it simple: Typing doesn't stop listening, but might get overwritten.
                            // Actually, let's update baseTextRef so invalidation doesn't happen.
                            baseTextRef.current = e.target.value.replace(transcript, '').trim();
                        }
                    }}
                    onKeyDown={handleKeyDown}
                    placeholder="Type your answer here... (Ctrl+Enter to submit)"
                    disabled={disabled || isSubmitting}
                    className="min-h-[150px] max-h-[400px] w-full resize-none border border-[#102b2b]/20 bg-white px-4 py-3 text-[#102b2b] focus:border-[#0d8274] focus:ring-2 focus:ring-[#0d8274]/30 disabled:cursor-not-allowed disabled:opacity-50"
                    rows={6}
                />

                {isListening && (
                    <div className="absolute right-3 top-3 flex items-center gap-2 border border-rose-300 bg-rose-50 px-3 py-1 animate-in fade-in">
                        <div className="h-2 w-2 animate-pulse bg-rose-500" />
                        <span className="text-sm font-medium text-red-700">Listening...</span>
                    </div>
                )}
            </div>

            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <button
                        type="button"
                        onClick={isListening ? handleStopRecording : handleStartRecording}
                        disabled={disabled || isSubmitting || !isSupported}
                        className={`flex items-center gap-2 border px-4 py-2 font-medium transition-colors ${isListening
                            ? "border-rose-200 bg-rose-100 text-rose-700 hover:bg-rose-200"
                            : "border-[#102b2b]/15 bg-[#102b2b]/5 text-[#102b2b] hover:bg-[#102b2b]/10"
                            } disabled:opacity-50 disabled:cursor-not-allowed`}
                        title={!isSupported ? "Speech recognition not supported in this browser" : isListening ? "Stop Recording" : "Start Recording"}
                    >
                        {isListening ? (
                            <>
                                <MicOff className="w-4 h-4" />
                                Stop Recording
                            </>
                        ) : (
                            <>
                                <Mic className="w-4 h-4" />
                                {answer ? "Resume Recording" : "Start Recording"}
                            </>
                        )}
                    </button>

                    {isListening && (
                        <div className="text-sm text-gray-500 animate-pulse">
                            {interimTranscript ? "Processing..." : "Speak now..."}
                        </div>
                    )}
                </div>

                <Button
                    type="button"
                    onClick={handleSubmit}
                    disabled={!answer.trim() || disabled || isSubmitting}
                    className="gap-2 rounded-none bg-[#d8f36b] text-[#102b2b] hover:bg-[#c8e95a]"
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
                </Button>
            </div>

            <p className="text-xs text-muted-foreground">
                {isSupported ? "Tip: You can type or speak your answer. Press Ctrl+Enter to submit." : "Note: Voice recording is not supported in this browser. Please type your answer."}
            </p>
        </div>
    );
}
