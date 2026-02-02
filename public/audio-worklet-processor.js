class PCMProcessor extends AudioWorkletProcessor {
    constructor() {
        super();
        this.bufferSize = 4096;
        this.buffer = new Float32Array(this.bufferSize);
        this.offset = 0;
    }

    process(inputs, outputs, parameters) {
        const input = inputs[0];
        if (!input || !input.length) return true;

        const channelData = input[0]; // Mono

        // Simple buffer accumulation
        for (let i = 0; i < channelData.length; i++) {
            this.buffer[this.offset] = channelData[i];
            this.offset++;

            if (this.offset >= this.bufferSize) {
                this.flush();
            }
        }

        return true;
    }

    flush() {
        // Convert Float32 (-1.0 to 1.0) to Int16 (-32768 to 32767)
        const int16Buffer = new Int16Array(this.bufferSize);
        for (let i = 0; i < this.bufferSize; i++) {
            let s = Math.max(-1, Math.min(1, this.buffer[i]));
            int16Buffer[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
        }

        // Send to main thread
        this.port.postMessage(int16Buffer);

        // Reset
        this.offset = 0;
    }
}

registerProcessor('pcm-processor', PCMProcessor);
