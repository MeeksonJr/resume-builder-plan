import { useState, useEffect, useCallback, useRef } from 'react';

export function useSpeechSynthesis() {
    const [isSupported, setIsSupported] = useState(false);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
    const [selectedVoice, setSelectedVoice] = useState<SpeechSynthesisVoice | null>(null);
    const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null); // Prevent GC

    useEffect(() => {
        if (typeof window !== 'undefined' && window.speechSynthesis) {
            setIsSupported(true);

            const loadVoices = () => {
                const availableVoices = window.speechSynthesis.getVoices();
                console.log(`[SpeechSynthesis] Loaded ${availableVoices.length} voices`);
                setVoices(availableVoices);

                // Try to find a good default English voice
                const defaultVoice = availableVoices.find(
                    v => v.name.includes('Google US English') ||
                        v.name.includes('Samantha') ||
                        (v.lang.startsWith('en') && v.default)
                );

                if (defaultVoice && !selectedVoice) {
                    console.log(`[SpeechSynthesis] Selecting default voice: ${defaultVoice.name}`);
                    setSelectedVoice(defaultVoice);
                }
            };

            loadVoices();

            // Chrome loads voices asynchronously
            if (window.speechSynthesis.onvoiceschanged !== undefined) {
                window.speechSynthesis.onvoiceschanged = loadVoices;
            }
        }
    }, [selectedVoice]);

    const speak = useCallback((text: string, options?: { rate?: number, onEnd?: () => void, onStart?: () => void }) => {
        if (!isSupported) {
            console.warn("[SpeechSynthesis] Not supported or disabled");
            options?.onEnd?.(); // Fail gracefully
            return;
        }

        console.log(`[SpeechSynthesis] Speaking: "${text.substring(0, 50)}..."`);

        // Do NOT cancel - let the queue handle it. 
        // This prevents race conditions where canceling one utterance kills the queue for the next.
        // window.speechSynthesis.cancel(); 

        if (utteranceRef.current) {
            utteranceRef.current = null;
        }

        const utterance = new SpeechSynthesisUtterance(text);
        utteranceRef.current = utterance; // Keep reference alive to prevent GC

        if (selectedVoice) {
            console.log(`[SpeechSynthesis] Using voice: ${selectedVoice.name}`);
            utterance.voice = selectedVoice;
        } else {
            console.warn("[SpeechSynthesis] No specific voice selected, using default");
        }

        utterance.rate = options?.rate || 1.0;
        utterance.pitch = 1.0;

        // Safety timeout in case browser drops the event
        const estimatedDuration = (text.length / 5) * 1000; // Rough estimate
        const safetyTimeout = setTimeout(() => {
            if (isSpeaking) {
                console.warn("[SpeechSynthesis] Safety timeout triggered - forcing end");
                setIsSpeaking(false);
                options?.onEnd?.();
            }
        }, estimatedDuration + 5000); // 5s buffer

        utterance.onstart = () => {
            console.log("[SpeechSynthesis] Event: start");
            setIsSpeaking(true);
            options?.onStart?.();
        };

        utterance.onend = () => {
            console.log("[SpeechSynthesis] Event: end");
            clearTimeout(safetyTimeout);
            setIsSpeaking(false);
            options?.onEnd?.();
            utteranceRef.current = null;
        };

        utterance.onerror = (e) => {
            console.error("[SpeechSynthesis] Event: error", e);
            clearTimeout(safetyTimeout);
            setIsSpeaking(false);
            options?.onEnd?.(); // Treat error as completion so flow continues
            utteranceRef.current = null;
        };

        window.speechSynthesis.speak(utterance);
    }, [isSupported, selectedVoice, isSpeaking]);

    const stop = useCallback(() => {
        if (isSupported) {
            window.speechSynthesis.cancel();
            setIsSpeaking(false);
            utteranceRef.current = null;
        }
    }, [isSupported]);

    return {
        isSupported,
        isSpeaking,
        voices,
        selectedVoice,
        setSelectedVoice,
        speak,
        stop
    };
}
