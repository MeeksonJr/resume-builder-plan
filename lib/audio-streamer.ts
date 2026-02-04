export class AudioStreamer {
    audioContext: AudioContext | null = null;
    workletNode: AudioWorkletNode | null = null;
    mediaStream: MediaStream | null = null;
    isPlaying: boolean = false;
    onDataAvailable: (data: ArrayBuffer) => void;

    // Queue functionality for smooth playback
    startedAt = 0;
    analyser: AnalyserNode | null = null;
    gainNode: GainNode | null = null;

    constructor(onDataAvailable: (data: ArrayBuffer) => void) {
        this.onDataAvailable = onDataAvailable;
    }

    async start() {
        if (typeof window === 'undefined') return;

        // Initialize Audio Context
        this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)({
            sampleRate: 24000, // Upgrade to 24k for Gemini Native
        });

        console.log(`[AudioStreamer] AudioContext started with sampleRate: ${this.audioContext.sampleRate}`);

        // Setup Analyser & Master Gain
        this.analyser = this.audioContext.createAnalyser();
        this.analyser.fftSize = 256; // Good balance for visualizer
        this.analyser.smoothingTimeConstant = 0.5;

        this.gainNode = this.audioContext.createGain();
        this.gainNode.gain.value = 1.0;

        // Route: Analyser -> Gain -> Destination
        this.analyser.connect(this.gainNode);
        this.gainNode.connect(this.audioContext.destination);

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
            const int16Data = event.data; // Int16Array
            this.onDataAvailable(int16Data.buffer);
        };

        // Connect Mic -> Worklet -> Analyser (for visualization)
        // We do NOT want to hear ourselves/echo, but we want to see the waveform.
        // However, if we connect to Analyser, and Analyser is connected to Destination, we will hear it.
        // So we need a separate path or careful routing.

        // Solution: 
        // 1. Mic -> Worklet -> (processing for Gemini)
        // 2. Mic -> Analyser (Visual only) -> ... Wait, Analyser passes through.
        // Let's rely on the Worklet NOT outputting audio to its output port, or disconnecting it.
        // Actually, for the visualizer to work on INPUT, we need to feed Source -> Analyser.
        // But Source -> Analyser -> Destination = Echo.
        // So: Source -> Analyser -> Disconnect? No, Analyser works even if not connected to destination (pull-based? no).
        // Standard Web Audio: "A node will only process if it is connected to the destination (directly or indirectly)".
        // Exception: AnalyserNode. It CAN pick up data if just connected to, even if downstream is dead? 
        // Actually, usually you connect Source -> Analyser, and Analyser -> dest (if you want to hear).
        // If you don't want to hear, connect Source -> Analyser, and Analyser -> Gain(0) -> Destination?

        // Let's connect Mic Source to Analyser, but verify if we hear it.
        // For now, let's Visualise OUTPUT only (AI Voice) to ensure no echo, OR tricky routing.
        // Let's try: Source -> Worklet. (Data sent to Gemini).
        // For visualization: 
        // We will visualize AI Output mainly. 
        // If we want to visualize User Input, we can use the `volume` calculation we already have in `useGeminiLive`.
        // BUT, a real FFT waveform is nicer.

        // Let's just visualize AI Output for "Siri" mode for now to be safe on Echo.
        // Wait, the user wants "Real-time audio waveform visualizer" - usually implies both parties.
        // Let's stick to AI Output in Analyser for safety first. 
        // If user speaks, we can toggle a "Listening" animation based on the simpler volume metric.
        // OR: source.connect(worklet);

        source.connect(this.workletNode);
        // this.workletNode.connect(this.audioContext.destination); // REMOVED to prevent echo

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
        if (this.analyser) {
            this.analyser.disconnect();
            this.analyser = null;
        }
        if (this.gainNode) {
            this.gainNode.disconnect();
            this.gainNode = null;
        }
        if (this.audioContext) {
            await this.audioContext.close();
            this.audioContext = null;
        }
    }

    // Play incoming PCM 24k Audio
    play(chunk: ArrayBuffer) {
        if (!this.audioContext || this.audioContext.state === 'closed') return;

        const int16Array = new Int16Array(chunk);
        const float32Array = new Float32Array(int16Array.length);

        for (let i = 0; i < int16Array.length; i++) {
            float32Array[i] = int16Array[i] / 32768;
        }

        const audioBuffer = this.audioContext.createBuffer(1, float32Array.length, 24000);
        audioBuffer.getChannelData(0).set(float32Array);

        const source = this.audioContext.createBufferSource();
        source.buffer = audioBuffer;

        // Route AI Output: Source -> Analyser -> Gain -> Destination
        if (this.analyser) {
            source.connect(this.analyser);
        } else {
            source.connect(this.audioContext.destination);
        }

        const now = this.audioContext.currentTime;
        const performAt = Math.max(now, this.startedAt);

        source.start(performAt);

        this.startedAt = performAt + audioBuffer.duration;
    }

    getAnalyser() {
        return this.analyser;
    }
}
