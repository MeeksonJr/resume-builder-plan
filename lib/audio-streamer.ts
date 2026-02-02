export class AudioStreamer {
    audioContext: AudioContext | null = null;
    workletNode: AudioWorkletNode | null = null;
    mediaStream: MediaStream | null = null;
    isPlaying: boolean = false;
    onDataAvailable: (data: ArrayBuffer) => void;

    // Queue functionality for smooth playback
    startedAt = 0;

    constructor(onDataAvailable: (data: ArrayBuffer) => void) {
        this.onDataAvailable = onDataAvailable;
    }

    async start() {
        if (typeof window === 'undefined') return;

        // Initialize Audio Context
        this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)({
            sampleRate: 16000, // Try to request 16k to match Gemini default
        });

        // Fallback: If 16k is not supported, the browser will ignore it and use default.
        console.log(`[AudioStreamer] AudioContext started with sampleRate: ${this.audioContext.sampleRate}`);

        // Add the Worklet
        try {
            await this.audioContext.audioWorklet.addModule('/audio-worklet-processor.js');
        } catch (e) {
            console.error("Failed to load audio worklet", e);
            return;
        }

        // Get Microphone Access
        this.mediaStream = await navigator.mediaDevices.getUserMedia({
            audio: {
                channelCount: 1,
                sampleRate: 16000
            }
        });

        const source = this.audioContext.createMediaStreamSource(this.mediaStream);
        this.workletNode = new AudioWorkletNode(this.audioContext, 'pcm-processor');

        this.workletNode.port.onmessage = (event) => {
            // Buffer from worklet is Int16Array
            // But postMessage sends it as generic JS object/array?
            // Actually it sends the typed array.
            // We need to send ArrayBuffer to Gemini.
            const int16Data = event.data; // Int16Array
            this.onDataAvailable(int16Data.buffer);
        };

        source.connect(this.workletNode);
        this.workletNode.connect(this.audioContext.destination); // Keep graph alive? Or disconnect?
        // Usually connecting to destination is needed to prevent GC, even if we assume output is muted.
        // But if PCMProcessor doesn't output audio to 'output' channel, we are safe from feedback loop.

        this.isPlaying = true;
    }

    async stop() {
        this.isPlaying = false;
        if (this.mediaStream) {
            this.mediaStream.getTracks().forEach(track => track.stop());
            this.mediaStream = null;
        }
        if (this.workletNode) {
            this.workletNode.disconnect();
            this.workletNode = null;
        }
        if (this.audioContext) {
            await this.audioContext.close();
            this.audioContext = null;
        }
    }

    // Play incoming PCM 24k Audio
    play(chunk: ArrayBuffer) {
        if (!this.audioContext || this.audioContext.state === 'closed') return;

        // chunk is Int16 Le 24kHz Mono
        const int16Array = new Int16Array(chunk);
        const float32Array = new Float32Array(int16Array.length);

        // Convert Int16 -> Float32
        for (let i = 0; i < int16Array.length; i++) {
            float32Array[i] = int16Array[i] / 32768;
        }

        // Create Buffer
        // Gemini sends 24000 Hz.
        const audioBuffer = this.audioContext.createBuffer(1, float32Array.length, 24000);
        audioBuffer.getChannelData(0).set(float32Array);

        // Schedule
        const source = this.audioContext.createBufferSource();
        source.buffer = audioBuffer;
        source.connect(this.audioContext.destination);

        // Basic scheduling to prevent gaps but minimize latency
        const now = this.audioContext.currentTime;
        // Schedule next start time. If queue is empty (fell behind), start "now".
        // If queue is ahead, append to it.
        const performAt = Math.max(now, this.startedAt);

        source.start(performAt);

        // Update when this chunk finishes
        this.startedAt = performAt + audioBuffer.duration;
    }
}
