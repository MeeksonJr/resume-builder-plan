"use client";

import { useState, useEffect, useRef } from "react";
import { useGeminiLive } from "@/lib/hooks/use-gemini-live";
import { Button } from "@/components/ui/button";
import { Mic, MicOff, PhoneOff, Video, AlertCircle, Loader2 } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { AudioVisualizer } from "./audio-visualizer";

interface VoiceCallInterfaceProps {
    session: any;
    questions: any[];
    onComplete: (transcript: any[]) => void;
}

export function VoiceCallInterface({ session, questions, onComplete }: VoiceCallInterfaceProps) {
    const { state, connect, disconnect, isMicOn, volume, transcript, streamer } = useGeminiLive({
        onDisconnect: () => {
            console.log("Disconnected");
        }
    });

    const [isStarted, setIsStarted] = useState(false);
    const [permissionError, setPermissionError] = useState(false);

    const handleStart = async () => {
        setPermissionError(false);
        const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
        if (!apiKey) {
            toast.error("Please set NEXT_PUBLIC_GEMINI_API_KEY in .env.local");
            return;
        }

        try {
            // Check mic permission first
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            stream.getTracks().forEach(t => t.stop()); // Release immediately, let AudioStreamer handle it

            const context = `
                You are an expert Technical Interviewer. You are conducting a video interview.
                Role: ${session.target_role || "Software Engineer"}
                Level: ${session.difficulty || "Mid-Level"}
                
                Your goal is to assess the candidate's skills and experience.
                Be professional but friendly. Do not be a robot. Act like a real human interviewer.
                
                Here is the list of questions you plan to ask.
                Questions:
                ${questions.map((q, i) => `${i + 1}. ${q.question_text}`).join("\n")}
                
                Start by introducing yourself briefly and asking the first question.
            `;

            connect(apiKey, context);
            setIsStarted(true);
        } catch (err) {
            console.error("Mic permission denied", err);
            setPermissionError(true);
            toast.error("Microphone access is required for voice interviews.");
        }
    };

    const handleEndCall = () => {
        disconnect();
        onComplete(transcript);
    };

    return (
        <div className="flex flex-col h-[calc(100vh-4rem)] bg-zinc-950 text-white overflow-hidden relative">
            {/* Main Video Area (Simulated) */}
            <div className="flex-1 flex flex-col items-center justify-center p-8 relative">

                {/* AI Avatar / Video Feed */}
                <div className="relative w-full max-w-4xl aspect-video bg-zinc-900 rounded-2xl overflow-hidden shadow-2xl border border-zinc-800 flex items-center justify-center">

                    {/* Status Indicators */}
                    <div className="absolute top-4 left-4 flex gap-2 z-20">
                        {state === 'connected' && (
                            <div className="bg-red-500/90 text-white text-xs px-2 py-1 rounded-md flex items-center gap-1.5 animate-pulse">
                                <div className="w-2 h-2 bg-white rounded-full" />
                                LIVE
                            </div>
                        )}
                        {state === 'connecting' && (
                            <div className="bg-amber-500/90 text-white text-xs px-2 py-1 rounded-md flex items-center gap-1.5">
                                <Loader2 className="w-3 h-3 animate-spin" />
                                CONNECTING...
                            </div>
                        )}
                        {state === 'error' && (
                            <div className="bg-rose-600 text-white text-xs px-2 py-1 rounded-md flex items-center gap-1.5">
                                <AlertCircle className="w-3 h-3" />
                                CONNECTION ERROR
                            </div>
                        )}
                    </div>

                    {/* AI Presence */}
                    <div className="flex flex-col items-center gap-8 w-full">
                        <div className={cn(
                            "relative transition-all duration-500",
                            state === 'connected' ? "scale-100" : "scale-90 opacity-70"
                        )}>
                            <div className={cn(
                                "absolute inset-0 bg-blue-500/20 rounded-full blur-3xl transition-all duration-300",
                                state === 'connected' && volume > 0 ? "opacity-100 scale-125" : "opacity-0 scale-100"
                            )} />
                            <Avatar className="h-40 w-40 md:h-56 md:w-56 border-4 border-zinc-800 shadow-2xl z-10">
                                <AvatarImage src="/ai-avatar.png" alt="AI Interviewer" />
                                <AvatarFallback className="text-5xl bg-gradient-to-br from-blue-600 to-indigo-700">AI</AvatarFallback>
                            </Avatar>
                        </div>

                        {/* Waveform Visualizer */}
                        <div className="h-32 w-full max-w-lg relative z-10 px-8">
                            {state === 'connected' && streamer ? (
                                <AudioVisualizer
                                    streamer={streamer}
                                    isListening={true}
                                    activeColor="#60a5fa" // blue-400
                                />
                            ) : (
                                <div className="h-full flex items-center justify-center text-zinc-600 text-sm font-medium tracking-widest uppercase">
                                    {isStarted ? "Initializing Audio..." : "Ready to Start"}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Controls Overlay */}
                <div className="absolute bottom-12 flex items-center gap-6 z-20">
                    {!isStarted || permissionError ? (
                        <Button
                            size="lg"
                            className={cn(
                                "h-16 px-8 rounded-full text-xl shadow-lg transition-all hover:scale-105",
                                permissionError ? "bg-rose-600 hover:bg-rose-700" : "bg-green-600 hover:bg-green-700 shadow-green-900/20"
                            )}
                            onClick={handleStart}
                        >
                            {permissionError ? (
                                <>
                                    <AlertCircle className="w-6 h-6 mr-3" />
                                    Retry Permission
                                </>
                            ) : (
                                <>
                                    <Video className="w-6 h-6 mr-3" />
                                    Start Interview
                                </>
                            )}
                        </Button>
                    ) : (
                        <>
                            <div className={cn(
                                "h-14 w-14 rounded-full flex items-center justify-center transition-colors shadow-lg",
                                isMicOn ? "bg-zinc-800 text-white ring-1 ring-white/10" : "bg-rose-500 text-white"
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

                {permissionError && (
                    <div className="absolute bottom-32 bg-rose-500/10 border border-rose-500/20 text-rose-200 px-4 py-2 rounded-lg text-sm max-w-md text-center backdrop-blur-md">
                        Please allow microphone access in your browser settings to continue.
                    </div>
                )}
            </div>
        </div>
    );
}
