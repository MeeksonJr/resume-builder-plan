import { useState, useEffect, useCallback, useRef } from "react";
import { countWords, calculateWpm, classifyPacing, detectFillerWords, FillerWordOccurrence } from "@/lib/interview/speech-analytics";

interface UseSpeechRecognitionProps {
  onSilenceTimeout?: () => void;
  silenceThresholdMs?: number;
}

export function useSpeechRecognition(props?: UseSpeechRecognitionProps) {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [interimTranscript, setInterimTranscript] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSupported, setIsSupported] = useState(false);

  // Telemetry states
  const [durationSeconds, setDurationSeconds] = useState(0);
  const [liveWpm, setLiveWpm] = useState(0);
  const [pacingRating, setPacingRating] = useState<"slow" | "optimal" | "fast">("optimal");
  const [fillerCount, setFillerCount] = useState(0);
  const [fillersDetected, setFillersDetected] = useState<FillerWordOccurrence[]>([]);

  const recognitionRef = useRef<any>(null);
  const silenceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const durationIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number | null>(null);
  const transcriptRef = useRef<string>("");

  useEffect(() => {
    transcriptRef.current = transcript;
  }, [transcript]);

  useEffect(() => {
    if (
      typeof window !== "undefined" &&
      ((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition)
    ) {
      setIsSupported(true);
    }
  }, []);

  // Update real-time metrics whenever transcript or duration updates
  const updateMetrics = useCallback((fullText: string, elapsedSecs: number) => {
    const words = countWords(fullText);
    const calculatedWpm = calculateWpm(words, elapsedSecs);
    setLiveWpm(calculatedWpm);

    const pacing = classifyPacing(calculatedWpm);
    setPacingRating(pacing.rating);

    const fillers = detectFillerWords(fullText);
    setFillerCount(fillers.totalFillers);
    setFillersDetected(fillers.breakdown);
  }, []);

  const resetSilenceTimer = useCallback(() => {
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
    }
    if (props?.onSilenceTimeout && props?.silenceThresholdMs) {
      silenceTimerRef.current = setTimeout(() => {
        if (transcriptRef.current.trim().length > 0) {
          props.onSilenceTimeout?.();
        }
      }, props.silenceThresholdMs);
    }
  }, [props]);

  const startListening = useCallback(() => {
    if (!isSupported) return;

    setError(null);
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();

    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-US";

    recognition.onstart = () => {
      setIsListening(true);
      startTimeRef.current = Date.now();

      // Start duration counter
      if (durationIntervalRef.current) clearInterval(durationIntervalRef.current);
      durationIntervalRef.current = setInterval(() => {
        if (startTimeRef.current) {
          const elapsed = Math.floor((Date.now() - startTimeRef.current) / 1000);
          setDurationSeconds(elapsed);
          updateMetrics(transcriptRef.current, elapsed);
        }
      }, 500);
    };

    recognition.onresult = (event: any) => {
      let finalChunk = "";
      let interim = "";

      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalChunk += event.results[i][0].transcript;
        } else {
          interim += event.results[i][0].transcript;
        }
      }

      if (finalChunk) {
        setTranscript((prev) => {
          const updated = prev ? `${prev} ${finalChunk.trim()}` : finalChunk.trim();
          const elapsed = startTimeRef.current
            ? Math.max(1, Math.floor((Date.now() - startTimeRef.current) / 1000))
            : 1;
          updateMetrics(updated, elapsed);
          return updated;
        });
      }

      setInterimTranscript(interim);
      resetSilenceTimer();
    };

    recognition.onerror = (event: any) => {
      if (event.error === "no-speech") {
        // Normal silence, don't surface as fatal error
        return;
      }
      console.error("[SpeechRecognition Error]", event.error);
      if (event.error === "not-allowed") {
        setError("Microphone permission denied. Please allow microphone access.");
      } else {
        setError(`Speech recognition error: ${event.error}`);
      }
    };

    recognition.onend = () => {
      // Clean up timer
      if (durationIntervalRef.current) {
        clearInterval(durationIntervalRef.current);
      }
    };

    try {
      recognition.start();
      recognitionRef.current = recognition;
    } catch (err) {
      console.error("[SpeechRecognition Start Failed]", err);
      setError("Failed to start voice recognition.");
    }
  }, [isSupported, updateMetrics, resetSilenceTimer]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {}
      recognitionRef.current = null;
    }
    if (durationIntervalRef.current) {
      clearInterval(durationIntervalRef.current);
    }
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
    }
    setIsListening(false);
  }, []);

  const resetTranscript = useCallback(() => {
    setTranscript("");
    setInterimTranscript("");
    setDurationSeconds(0);
    setLiveWpm(0);
    setFillerCount(0);
    setFillersDetected([]);
    startTimeRef.current = null;
  }, []);

  useEffect(() => {
    return () => {
      stopListening();
    };
  }, [stopListening]);

  return {
    isListening,
    transcript,
    interimTranscript,
    durationSeconds,
    liveWpm,
    pacingRating,
    fillerCount,
    fillersDetected,
    startListening,
    stopListening,
    resetTranscript,
    isSupported,
    error,
  };
}
