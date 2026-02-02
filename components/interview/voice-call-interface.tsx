"use client";

import { useState, useEffect, useRef } from "react";
import { useGeminiLive } from "@/lib/hooks/use-gemini-live";
import { Button } from "@/components/ui/button";
import { Mic, MicOff, PhoneOff, Video } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface VoiceCallInterfaceProps {
    session: any;
    questions: any[];
    onComplete: () => void;
}

export function VoiceCallInterface({ session, questions, onComplete }: VoiceCallInterfaceProps) {
    const { state, connect, disconnect, isMicOn, volume } = useGeminiLive({
        onDisconnect: () => {
            console.log("Disconnected");
        }
    });

    const [isStarted, setIsStarted] = useState(false);

    const handleStart = () => {
        const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
        if (!apiKey) {
            toast.error("Please set NEXT_PUBLIC_GEMINI_API_KEY in .env.local");
            return;
        }

        const context = `
            You are an expert Technical Interviewer. You are conducting a video interview.
            Role: ${session.target_role || "Software Engineer"}
            Level: ${session.difficulty || "Mid-Level"}
            
            Your goal is to assess the candidate's skills and experience.
            Be professional but friendly. Do not be a robot. Act like a real human interviewer.
            
            Here is the list of questions you plan to ask, but feel free to ask follow-up questions if the candidate's answer is interesting or vague.
            Do not read the list all at once. Ask one question at a time. Wait for the candidate to answer before moving on.
            
            Questions:
            ${questions.map((q, i) => `${i + 1}. ${q.question_text}`).join("\n")}
            
            Start by introducing yourself briefly and asking the first question.
        `;

        connect(apiKey, context);
        setIsStarted(true);
    };

    const handleEndCall = () => {
        disconnect();
        onComplete();
    };

    return (
        <div className="flex flex-col h-[calc(100vh-4rem)] bg-zinc-950 text-white overflow-hidden relative">
            {/* Main Video Area (Simulated) */}
            <div className="flex-1 flex flex-col items-center justify-center p-8 relative">

                {/* AI Avatar / Video Feed */}
                <div className="relative w-full max-w-4xl aspect-video bg-zinc-900 rounded-2xl overflow-hidden shadow-2xl border border-zinc-800 flex items-center justify-center">

                    {/* Simulated Camera UI */}
                    <div className="absolute top-4 left-4 flex gap-2">
                        <div className="bg-red-500/90 text-white text-xs px-2 py-1 rounded-md flex items-center gap-1.5 animate-pulse">
                            <div className="w-2 h-2 bg-white rounded-full" />
                            LIVE
                        </div>
                    </div>

                    {/* AI Presence Visualization */}
                    <div className="flex flex-col items-center gap-8">
                        <div className={cn(
                            "relative transition-all duration-300",
                            state === 'connected' ? "scale-110" : "scale-100 opacity-50"
                        )}>
                            <div className={cn(
                                "absolute inset-0 bg-blue-500/20 rounded-full blur-3xl transition-all duration-100",
                                state === 'connected' && volume > 0 ? "opacity-100 scale-150" : "opacity-0 scale-100"
                            )} />
                            <Avatar className="h-48 w-48 border-4 border-zinc-800 shadow-xl z-10">
                                <AvatarImage src="/ai-avatar.png" alt="AI Interviewer" />
                                <AvatarFallback className="text-4xl bg-gradient-to-br from-blue-600 to-indigo-700">AI</AvatarFallback>
                            </Avatar>
                        </div>

                        <div className="h-8 flex items-center gap-1">
                            {state === 'connecting' && <span className="text-zinc-400 animate-pulse">Connecting...</span>}
                            {state === 'connected' && (
                                <>
                                    {[...Array(5)].map((_, i) => (
                                        <div
                                            key={i}
                                            className="w-1.5 bg-blue-500 rounded-full transition-all duration-75"
                                            style={{
                                                height: `${Math.max(8, volume * (1 + Math.sin(i * 10)))}px`,
                                                opacity: 0.8
                                            }}
                                        />
                                    ))}
                                </>
                            )}
                        </div>
                    </div>
                </div>

                {/* Controls Overlay */}
                <div className="absolute bottom-12 flex items-center gap-6 z-20">
                    {!isStarted ? (
                        <Button
                            size="lg"
                            className="h-16 px-8 rounded-full text-xl bg-green-600 hover:bg-green-700 shadow-lg shadow-green-900/20 transition-all hover:scale-105"
                            onClick={handleStart}
                        >
                            <Video className="w-6 h-6 mr-3" />
                            Start Call
                        </Button>
                    ) : (
                        <>
                            <div className={cn(
                                "h-14 w-14 rounded-full flex items-center justify-center transition-colors",
                                isMicOn ? "bg-zinc-800 text-white" : "bg-red-500 text-white"
                            )}>
                                {isMicOn ? <Mic className="w-6 h-6" /> : <MicOff className="w-6 h-6" />}
                            </div>

                            <Button
                                size="lg"
                                variant="destructive"
                                className="h-16 px-8 rounded-full text-lg shadow-lg"
                                onClick={handleEndCall}
                            >
                                <PhoneOff className="w-6 h-6 mr-3" />
                                End Interview
                            </Button>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
