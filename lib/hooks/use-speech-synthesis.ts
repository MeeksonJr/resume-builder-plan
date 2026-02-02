import { useState, useEffect, useCallback } from 'react';

export function useSpeechSynthesis() {
    const [isSupported, setIsSupported] = useState(false);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
    const [selectedVoice, setSelectedVoice] = useState<SpeechSynthesisVoice | null>(null);

    useEffect(() => {
        if (typeof window !== 'undefined' && window.speechSynthesis) {
            setIsSupported(true);

            const loadVoices = () => {
                const availableVoices = window.speechSynthesis.getVoices();
                setVoices(availableVoices);

                // Try to find a good default English voice
                const defaultVoice = availableVoices.find(
                    v => v.name.includes('Google US English') ||
                        v.name.includes('Samantha') ||
                        (v.lang.startsWith('en') && v.default)
                );

                if (defaultVoice && !selectedVoice) {
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
            options?.onEnd?.(); // Fail gracefully-ish
            return;
        }

        // Cancel any current speaking
        window.speechSynthesis.cancel();

        const utterance = new SpeechSynthesisUtterance(text);

        if (selectedVoice) {
            utterance.voice = selectedVoice;
        }

        utterance.rate = options?.rate || 1.0;
        utterance.pitch = 1.0;

        utterance.onstart = () => {
            setIsSpeaking(true);
            options?.onStart?.();
        };

        utterance.onend = () => {
            setIsSpeaking(false);
            options?.onEnd?.();
        };

        utterance.onerror = (e) => {
            console.error("Speech synthesis error:", e);
            setIsSpeaking(false);
            // Treat error as completion so flow doesn't hang
            options?.onEnd?.();
        };

        window.speechSynthesis.speak(utterance);
    }, [isSupported, selectedVoice]);

    const stop = useCallback(() => {
        if (isSupported) {
            window.speechSynthesis.cancel();
            setIsSpeaking(false);
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
