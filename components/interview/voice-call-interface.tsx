"use client";

import { useState, useEffect } from "react";
import { useVoiceSession, VoiceSessionState } from "@/lib/hooks/use-voice-session";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Mic, MicOff, Volume2, X } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

interface VoiceCallInterfaceProps {
    session: any;
    questions: any[];
    onComplete: () => void;
}

export function VoiceCallInterface({ session, questions, onComplete }: VoiceCallInterfaceProps) {
    const [messages, setMessages] = useState<{ role: 'ai' | 'user', text: string }[]>([]);

    const handleAnswerSubmitted = async (questionId: string, answer: string) => {
        // Add to local chat history for display
        setMessages(prev => [...prev, { role: 'user', text: answer }]);

        // Submit to API
        await fetch("/api/interview/answers", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                sessionId: session.id,
                questionId,
                answer,
            }),
        });
    };

    const {
        state,
        currentIndex,
        currentQuestion,
        startSession,
        submitAnswer,
        transcript,
        isSpeaking,
        isListening
    } = useVoiceSession({
        questions,
        voiceId: session.interviewer_voice,
        onAnswerSubmitted: handleAnswerSubmitted,
        onComplete
    });

    // Auto-scroll logic or simply show latest
    // ...

    return (
        <div className="fixed inset-0 bg-background z-50 flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b">
                <div className="flex items-center gap-2">
                    <span className="font-semibold text-lg">Simulated Call</span>
                    <span className="text-muted-foreground">• {session.target_role}</span>
                </div>
                <Button variant="ghost" size="icon" onClick={onComplete}>
                    <X className="w-5 h-5" />
                </Button>
            </div>

            {/* Main Stage */}
            <div className="flex-1 flex flex-col items-center justify-center p-8 space-y-8 relative overflow-hidden">

                {/* Background Decor */}
                <div className="absolute inset-0 bg-gradient-to-b from-blue-50/50 to-transparent dark:from-blue-950/20 pointer-events-none" />

                {/* AI Avatar */}
                <div className="relative z-10">
                    <div className={cn(
                        "w-48 h-48 rounded-full flex items-center justify-center bg-muted border-4 transition-all duration-300",
                        isSpeaking ? "border-primary shadow-[0_0_30px_rgba(37,99,235,0.3)] scale-105" : "border-border",
                        "shadow-xl"
                    )}>
                        <Avatar className="w-44 h-44">
                            <AvatarImage src="/ai-avatar-placeholder.png" alt="AI Interviewer" />
                            <AvatarFallback className="text-4xl">AI</AvatarFallback>
                        </Avatar>

                        {/* Audio Wave Animation (Simulated) */}
                        {isSpeaking && (
                            <div className="absolute inset-0 rounded-full animate-ping bg-blue-500/20" />
                        )}
                    </div>
                    <div className="mt-4 text-center">
                        <p className="font-semibold text-lg">AI Interviewer</p>
                        <p className="text-sm text-muted-foreground">
                            {state === 'intro' ? 'Introducing...' :
                                state === 'speaking' ? 'Asking Question...' :
                                    state === 'listening' ? 'Listening...' :
                                        state === 'processing' ? 'Processing...' : 'Idle'}
                        </p>
                    </div>
                </div>

                {/* Captions / Transcript Area */}
                <div className="max-w-2xl w-full space-y-4 z-10 min-h-[100px] flex flex-col justify-end">
                    {state === 'intro' || state === 'speaking' ? (
                        <div className="bg-muted p-4 rounded-xl rounded-tl-none border">
                            <p className="text-lg">
                                {state === 'intro' ? "Hello! Let's start the interview." : currentQuestion?.question_text}
                            </p>
                        </div>
                    ) : null}

                    {(state === 'listening' || state === 'processing') && (
                        <div className="bg-primary/10 p-4 rounded-xl rounded-tr-none border border-primary/20 ml-auto max-w-[80%]">
                            <p className="text-lg">
                                {transcript || <span className="text-muted-foreground italic">Listening...</span>}
                            </p>
                        </div>
                    )}
                </div>
            </div>

            {/* Controls */}
            <div className="p-8 border-t bg-card/50 backdrop-blur-sm">
                <div className="max-w-2xl mx-auto flex flex-col items-center gap-4">

                    {state === 'idle' && (
                        <Button size="lg" className="w-full text-lg h-12" onClick={startSession}>
                            Start Interview Call
                        </Button>
                    )}

                    {state === 'listening' && (
                        <Button
                            size="lg"
                            variant="destructive"
                            className="w-full text-lg h-12"
                            onClick={submitAnswer}
                        >
                            <MicOff className="mr-2 w-5 h-5" />
                            Finish Answer
                        </Button>
                    )}

                    {state === 'speaking' && (
                        <div className="text-sm text-muted-foreground animate-pulse">
                            AI is speaking...
                        </div>
                    )}

                    {/* Progress */}
                    <div className="w-full flex items-center gap-2 mt-2">
                        <span className="text-xs text-muted-foreground w-12 text-right">
                            {currentIndex + 1} / {questions.length}
                        </span>
                        <Progress value={((currentIndex) / questions.length) * 100} className="h-2" />
                    </div>
                </div>
            </div>
        </div>
    );
}
