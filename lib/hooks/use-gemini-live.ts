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
    const [transcript, setTranscript] = useState<{ role: 'user' | 'ai', text: string, timestamp: Date }[]>([]);

    // Reconnection State
    const userDisconnectedRef = useRef(false);
    const connectionParamsRef = useRef<{ apiKey: string; instruction: string } | null>(null);
    const resumptionTokenRef = useRef<string | null>(null);

    // 1. Disconnect Logic (Defined first to be available for connect/useEffect)
    const disconnect = useCallback(() => {
        userDisconnectedRef.current = true;
        resumptionTokenRef.current = null;
        connectionParamsRef.current = null;

        if (sessionRef.current) {
            try { sessionRef.current.close(); } catch (e) { }
            sessionRef.current = null;
        }

        audioStreamerRef.current?.stop();
        setIsMicOn(false);
        setState('disconnected');
    }, []);

    // 2. Send Audio Helper
    const sendAudioToGemini = (buffer: ArrayBuffer) => {
        if (!sessionRef.current || state !== 'connected') return;
        const base64 = arrayBufferToBase64(buffer);
        try {
            sessionRef.current.sendRealtimeInput({
                audio: { data: base64, mimeType: "audio/pcm;rate=24000" }
            });
        } catch (e) {
            // Ignore send errors if we are closing
        }
    };

    // 3. Connect Logic
    const connect = async (apiKey: string, systemInstruction: string, resumeHandle?: string) => {
        if (!apiKey) {
            toast.error("Missing Gemini API Key");
            return;
        }

        connectionParamsRef.current = { apiKey, instruction: systemInstruction };
        userDisconnectedRef.current = false;

        try {
            setState('connecting');
            const client = new GoogleGenAI({ apiKey });

            await audioStreamerRef.current?.start();
            setIsMicOn(true);

            const config: any = {
                responseModalities: [Modality.AUDIO, Modality.TEXT],
                systemInstruction: { parts: [{ text: systemInstruction }] },
            };

            if (resumeHandle) {
                config.sessionResumption = { handle: resumeHandle };
            }

            const session = await client.live.connect({
                model: "gemini-2.0-flash",
                config,
                callbacks: {
                    onopen: () => {
                        console.log("Gemini Live Connected");
                        setState('connected');
                    },
                    onmessage: (msg: any) => {
                        if (msg.serverContent?.modelTurn) {
                            msg.serverContent.modelTurn.parts.forEach((part: any) => {
                                if (part.inlineData?.data) {
                                    audioStreamerRef.current?.play(base64ToArrayBuffer(part.inlineData.data));
                                }
                                if (part.text) {
                                    setTranscript(prev => [...prev, { role: 'ai', text: part.text, timestamp: new Date() }]);
                                }
                            });
                        }

                        const resumptionUpdate = msg.sessionResumptionUpdate || msg.serverContent?.sessionResumptionUpdate;
                        if (resumptionUpdate?.sessionResumptionConfig?.handle) {
                            resumptionTokenRef.current = resumptionUpdate.sessionResumptionConfig.handle;
                        }
                    },
                    onclose: (e: any) => {
                        console.log("Gemini Live Closed", e);
                        if (userDisconnectedRef.current) {
                            setState('disconnected');
                            props?.onDisconnect?.();
                            return;
                        }

                        // Handle expired/invalid session
                        const isRecoverable = e.code === 1007 || e.code === 1000 || e.code === 1006;

                        if (e.code === 1007 || e.code === 1000) {
                            toast.error("Session dropped (Invalid Config/Expiry). Reconnecting...");
                            resumptionTokenRef.current = null;
                        } else if (e.code === 1008) {
                            // 1008 is Policy Violation or Resource Not Found - FATAL
                            toast.error("Connection failed: Model not found or unavailable.");
                            disconnect();
                            return;
                        }

                        if (isRecoverable) {
                            setTimeout(() => {
                                if (!userDisconnectedRef.current) {
                                    connect(
                                        connectionParamsRef.current!.apiKey,
                                        connectionParamsRef.current!.instruction,
                                        resumptionTokenRef.current || undefined
                                    );
                                }
                            }, 2000);
                        } else {
                            toast.error(`Connection closed unexpectedly (Code: ${e.code})`);
                            disconnect();
                        }
                    },
                    onerror: (e: any) => {
                        console.error("Gemini Live Error", e);
                        setState('error');
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

    // 4. Effect to Initialize AudioStreamer
    useEffect(() => {
        audioStreamerRef.current = new AudioStreamer((data) => {
            sendAudioToGemini(data);

            // Visualizer
            const int16 = new Int16Array(data);
            let sum = 0;
            for (let i = 0; i < int16.length; i += 10) sum += Math.abs(int16[i]);
            setVolume(Math.min(100, (sum / (int16.length / 10) / 32768) * 500));
        });

        // Cleanup on unmount
        return () => disconnect();
    }, []); // Empty dependency array is fine here as we use refs/stable functions

    return {
        state,
        connect,
        disconnect,
        isMicOn,
        volume,
        transcript,
        streamer: audioStreamerRef.current,
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
