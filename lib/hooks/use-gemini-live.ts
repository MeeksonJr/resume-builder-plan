import { useState, useRef, useEffect, useCallback } from 'react';
import { GoogleGenAI, Modality } from '@google/genai';
import { AudioStreamer } from '@/lib/audio-streamer';
import { toast } from 'sonner';

export type LiveState = 'disconnected' | 'connecting' | 'connected' | 'error';

interface UseGeminiLiveProps {
    onDisconnect?: () => void;
}

export function useGeminiLive(props?: UseGeminiLiveProps) {
    const [state, setState] = useState<LiveState>('disconnected');
    const [isMicOn, setIsMicOn] = useState(false);
    const audioStreamerRef = useRef<AudioStreamer | null>(null);
    const sessionRef = useRef<any>(null);
    const [volume, setVolume] = useState(0);

    // Initialize AudioStreamer
    useEffect(() => {
        audioStreamerRef.current = new AudioStreamer((data) => {
            // data is Int16 ArrayBuffer from mic
            sendAudioToGemini(data);

            // Calculate volume for visualizer
            const int16 = new Int16Array(data);
            let sum = 0;
            for (let i = 0; i < int16.length; i += 10) { // sparse sampling
                sum += Math.abs(int16[i]);
            }
            const avg = sum / (int16.length / 10);
            setVolume(Math.min(100, (avg / 32768) * 500)); // Amplify for visual
        });

        return () => {
            disconnect();
        };
    }, []);

    const sendAudioToGemini = (buffer: ArrayBuffer) => {
        if (!sessionRef.current) return;

        const base64 = arrayBufferToBase64(buffer);
        sessionRef.current.sendRealtimeInput({
            audio: {
                data: base64,
                mimeType: "audio/pcm;rate=16000"
            }
        });
    };

    const connect = async (apiKey: string, systemInstruction: string) => {
        if (!apiKey) {
            toast.error("Missing Gemini API Key");
            return;
        }

        try {
            setState('connecting');
            const client = new GoogleGenAI({ apiKey });

            // Start Audio
            await audioStreamerRef.current?.start();
            setIsMicOn(true);

            // Connect Live Session
            const session = await client.live.connect({
                model: "gemini-2.5-flash-native-audio-preview-12-2025", // Check model name flexibility
                config: {
                    responseModalities: [Modality.AUDIO],
                    systemInstruction: {
                        parts: [{ text: systemInstruction }]
                    },
                },
                callbacks: {
                    onopen: () => {
                        console.log("Gemini Live Connected");
                        setState('connected');
                    },
                    onmessage: (msg: any) => {
                        // Handle Audio
                        if (msg.serverContent && msg.serverContent.modelTurn) {
                            const parts = msg.serverContent.modelTurn.parts;
                            for (const part of parts) {
                                if (part.inlineData && part.inlineData.data) {
                                    // Base64 PCM -> ArrayBuffer
                                    const audioData = base64ToArrayBuffer(part.inlineData.data);
                                    audioStreamerRef.current?.play(audioData);
                                }
                            }
                        }
                    },
                    onclose: (e: any) => {
                        console.log("Gemini Live Closed", e);
                        setState('disconnected');
                        props?.onDisconnect?.();
                    },
                    onerror: (e: any) => {
                        console.error("Gemini Live Error", e);
                        toast.error("Gemini Live connection error");
                        disconnect();
                    }
                }
            });

            sessionRef.current = session;

        } catch (error) {
            console.error("Failed to connect", error);
            setState('error');
            disconnect();
        }
    };

    const disconnect = useCallback(() => {
        if (sessionRef.current) {
            // sessionRef.current.close(); // Method might not exist on all versions, check logic
            // The docs imply .close() exists
            try { sessionRef.current.close(); } catch (e) { }
            sessionRef.current = null;
        }

        audioStreamerRef.current?.stop();
        setIsMicOn(false);
        setState('disconnected');
    }, []);

    return {
        state,
        connect,
        disconnect,
        isMicOn,
        volume
    };
}

// Utils
function arrayBufferToBase64(buffer: ArrayBuffer) {
    let binary = '';
    const bytes = new Uint8Array(buffer);
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);
}

function base64ToArrayBuffer(base64: string) {
    const binaryString = window.atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes.buffer;
}
