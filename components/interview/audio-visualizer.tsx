"use client";

import { useEffect, useRef } from "react";

interface AudioVisualizerProps {
    streamer: any; // AudioStreamer instance
    isListening: boolean;
    activeColor?: string;
    idleColor?: string;
}

export function AudioVisualizer({
    streamer,
    isListening,
    activeColor = "#3b82f6", // Blue-500
    idleColor = "#334155"   // Slate-700
}: AudioVisualizerProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const animationFrameRef = useRef<number | null>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        const render = () => {
            const width = canvas.width;
            const height = canvas.height;
            const centerY = height / 2;

            ctx.clearRect(0, 0, width, height);

            // If not connected/streaming, draw idle line
            if (!streamer || !streamer.getAnalyser()) {
                ctx.beginPath();
                ctx.moveTo(0, centerY);
                ctx.lineTo(width, centerY);
                ctx.strokeStyle = idleColor;
                ctx.lineWidth = 2;
                ctx.stroke();
                animationFrameRef.current = requestAnimationFrame(render);
                return;
            }

            const analyser = streamer.getAnalyser() as AnalyserNode;
            const bufferLength = analyser.frequencyBinCount;
            const dataArray = new Uint8Array(bufferLength);
            analyser.getByteFrequencyData(dataArray);

            ctx.lineWidth = 3;
            ctx.lineCap = "round";
            ctx.shadowBlur = 15;
            ctx.shadowColor = activeColor;
            ctx.strokeStyle = activeColor;

            // Mirror effect: Draw from center outwards
            // We'll use a subset of the frequency data (low-mids) for better visuals
            const relevantData = dataArray.slice(0, bufferLength / 2);
            const step = Math.ceil(relevantData.length / (width / 8));

            ctx.beginPath();

            // Go through points
            for (let x = 0; x < width; x += 4) {
                // Map x to frequency index
                const dataIndex = Math.floor((x / width) * relevantData.length);
                const value = relevantData[dataIndex] || 0;

                // Scale value to height
                // Normalize 0-255 to 0-1, then scale
                const normalized = value / 255;
                const amplitude = (height / 2) * 0.8;

                // Add some noise/jitter for "aliveness" if listening but silence
                const jitter = isListening && value === 0 ? Math.random() * 2 : 0;

                const yOffset = (normalized * amplitude) + jitter;

                // Draw symmetric/mirrored layout
                if (x === 0) {
                    ctx.moveTo(x, centerY - yOffset);
                } else {
                    // Smooth curve
                    // ctx.lineTo(x, centerY - yOffset);
                }
            }

            // Simpler approach: Bars or smoothed line? 
            // Let's do a symmetric waveform style (Siri style)
            // Center is Width/2

            ctx.beginPath();
            ctx.moveTo(0, centerY);

            for (let i = 0; i < width; i++) {
                // Get data relative to center distance
                const distFromCenter = Math.abs((width / 2) - i);
                const normalizeDist = 1 - (distFromCenter / (width / 2)); // 1 at center, 0 at edges

                // Pick frequency data based on position or just average?
                // Let's grab average volume for amplitude modulation of a sine wave for "Siri" look?
                // Or just map frequency to x.

                // Let's map frequency bin to X position
                const index = Math.floor((i / width) * (bufferLength / 1.5)); // Zoom in on lower freqs
                const value = dataArray[index] || 0;

                // Apply a window function (Hanning window-ish) to taper edges
                const window = Math.sin((i / width) * Math.PI);

                const h = (value / 255) * (height / 2) * window;

                // Smoothing
                const y = centerY - h; // Top half
                ctx.lineTo(i, y);
            }
            // Bottom half (mirror)
            for (let i = width - 1; i >= 0; i--) {
                const index = Math.floor((i / width) * (bufferLength / 1.5));
                const value = dataArray[index] || 0;
                const window = Math.sin((i / width) * Math.PI);
                const h = (value / 255) * (height / 2) * window;
                const y = centerY + h;
                ctx.lineTo(i, y);
            }

            ctx.stroke();

            animationFrameRef.current = requestAnimationFrame(render);
        };

        render();

        return () => {
            if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
        };
    }, [streamer, isListening, activeColor, idleColor]);

    return (
        <canvas
            ref={canvasRef}
            width={600}
            height={120}
            className="w-full h-full object-contain"
        />
    );
}
