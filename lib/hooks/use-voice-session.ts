import { useState, useEffect, useCallback, useRef } from "react";
import { useSpeechSynthesis } from "@/lib/hooks/use-speech-synthesis";
import { useSpeechRecognition } from "@/lib/hooks/use-speech-recognition";
import { toast } from "sonner";

export type VoiceSessionState =
    | "idle"        // Initial state
    | "intro"       // AI is introducing itself
    | "speaking"    // AI is reading the question
    | "listening"   // User is speaking (recording)
    | "processing"  // Saving the answer
    | "completed";  // Session finished

interface UseVoiceSessionProps {
    questions: any[];
    voiceId?: string;
    onAnswerSubmitted: (questionId: string, answer: string) => Promise<void>;
    onComplete: () => void;
}

export function useVoiceSession({
    questions,
    voiceId,
    onAnswerSubmitted,
    onComplete
}: UseVoiceSessionProps) {
    const [state, setState] = useState<VoiceSessionState>("idle");
    const [currentIndex, setCurrentIndex] = useState(0);
    const [transcriptHistory, setTranscriptHistory] = useState<string[]>([]);

    // Hooks
    const {
        speak,
        stop: stopSpeaking,
        isSpeaking,
        voices,
        setSelectedVoice
    } = useSpeechSynthesis();

    const {
        startListening,
        stopListening,
        resetTranscript,
        transcript,
        isListening,
        isSupported: isReconSupported
    } = useSpeechRecognition();

    const currentQuestion = questions[currentIndex];
    const mounted = useRef(true);

    // Set voice preference on mount
    useEffect(() => {
        if (voiceId && voices.length > 0) {
            const voice = voices.find(v => v.name === voiceId) || voices.find(v => v.name.includes('Google US English'));
            if (voice) {
                setSelectedVoice(voice);
            }
        }
        return () => { mounted.current = false; stopSpeaking(); stopListening(); };
    }, [voiceId, voices, stopSpeaking, stopListening, setSelectedVoice]);

    // State Machine Driver
    useEffect(() => {
        if (!mounted.current) return;

        const handleIntroEnd = () => {
            console.log("Intro ended, switching to speaking");
            setState("speaking");
        };

        const handleQuestionEnd = () => {
            console.log("Question ended, switching to listening");
            setState("listening");
        };

        switch (state) {
            case "intro":
                speak("Hello! I'm your AI interviewer today. I'll be asking you a few questions. Let's get started.", {
                    onEnd: handleIntroEnd
                });
                break;

            case "speaking":
                if (currentQuestion) {
                    speak(currentQuestion.question_text, {
                        onEnd: handleQuestionEnd
                    });
                }
                break;

            case "listening":
                if (!isListening) {
                    resetTranscript();
                    startListening();
                }
                break;

            case "processing":
                stopListening();
                break;
        }
    }, [state]); // Effect driven by state transitions

    // Manual triggers
    const startSession = () => {
        setState("intro");
    };

    const submitAnswer = async () => {
        if (!transcript) {
            toast.error("I didn't hear anything. Please try again.");
            return;
        }

        setState("processing");
        try {
            await onAnswerSubmitted(currentQuestion.id, transcript);

            if (currentIndex < questions.length - 1) {
                setCurrentIndex(prev => prev + 1);
                setState("speaking"); // Move to next
            } else {
                setState("completed");
                onComplete();
            }
        } catch (error) {
            console.error(error);
            toast.error("Failed to save answer");
            setState("listening"); // Retry
        }
    };

    return {
        state,
        currentIndex,
        currentQuestion,
        startSession,
        submitAnswer,
        transcript,
        isSpeaking,
        isListening
    };
}
