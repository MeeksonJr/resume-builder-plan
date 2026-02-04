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

    // Initialize AudioStreamer
    useEffect(() => {
        audioStreamerRef.current = new AudioStreamer((data) => {
            sendAudioToGemini(data);

            // Visualizer
            const int16 = new Int16Array(data);
            let sum = 0;
            for (let i = 0; i < int16.length; i += 10) sum += Math.abs(int16[i]);
            setVolume(Math.min(100, (sum / (int16.length / 10) / 32768) * 500));
        });

        return () => disconnect();
    }, []);

    const sendAudioToGemini = (buffer: ArrayBuffer) => {
        if (!sessionRef.current) return;
        const base64 = arrayBufferToBase64(buffer);
        try {
            sessionRef.current.sendRealtimeInput({
                audio: { data: base64, mimeType: "audio/pcm;rate=24000" }
            });
        } catch (e) {
            console.error("Failed to send audio", e);
        }
    };

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
                model: "gemini-2.0-flash-exp",
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

                        // Handle expired/invalid session (1007 sometimes implies bad args which means retrying same args fails)
                        if (e.code === 1007 || e.code === 1000) {
                            toast.error("Session dropped (Invalid Config/Expiry). Reconnecting...");
                            // Retry fresh without resume token if 1007
                            resumptionTokenRef.current = null;
                        }

                        setTimeout(() => {
                            if (!userDisconnectedRef.current) {
                                connect(
                                    connectionParamsRef.current!.apiKey,
                                    connectionParamsRef.current!.instruction,
                                    resumptionTokenRef.current || undefined
                                );
                            }
                        }, 2000);
                    },
                    onerror: (e: any) => {
                        console.error("Gemini Live Error", e);
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

    return {
        state,
        connect,
        disconnect,
        isMicOn,
        volume,
        transcript,
        streamer: audioStreamerRef.current, // Expose for visualizer
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
