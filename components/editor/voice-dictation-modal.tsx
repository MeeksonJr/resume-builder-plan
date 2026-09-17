"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Mic, MicOff, Sparkles, Volume2, ArrowRight, Check, RefreshCw } from "lucide-react";
import {
  cleanSpokenTranscript,
  formatSpokenBulletPoint,
  VoiceTone,
  isSpeechRecognitionSupported,
} from "@/lib/ai/voice-dictation";
import { toast } from "sonner";

interface VoiceDictationModalProps {
  onInsertBullet: (bullet: string) => void;
  defaultTone?: VoiceTone;
  buttonLabel?: string;
  triggerClassName?: string;
}

const DEMO_SPOKEN_PHRASES = [
  "Um basically I managed the cloud migration to AWS and reduced latency by 35% across 8 services.",
  "I led a team of 6 engineers and we shipped the new payment gateway saving about 40k a month.",
  "I designed a real time streaming pipeline with Kafka handling over 2 million events per minute.",
];

export function VoiceDictationModal({
  onInsertBullet,
  defaultTone = "technical",
  buttonLabel = "Dictate with Voice",
  triggerClassName = "",
}: VoiceDictationModalProps) {
  const [open, setOpen] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [tone, setTone] = useState<VoiceTone>(defaultTone);
  const [formattedResult, setFormattedResult] = useState("");
  const [metrics, setMetrics] = useState<string[]>([]);
  const recognitionRef = useRef<any>(null);

  // Initialize SpeechRecognition if available
  useEffect(() => {
    if (typeof window === "undefined") return;

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (SpeechRecognition) {
      const rec = new SpeechRecognition();
      rec.continuous = true;
      rec.interimResults = true;
      rec.lang = "en-US";

      rec.onresult = (event: any) => {
        let currentText = "";
        for (let i = 0; i < event.results.length; i++) {
          currentText += event.results[i][0].transcript + " ";
        }
        setTranscript(currentText.trim());
      };

      rec.onerror = (err: any) => {
        console.warn("[Voice] SpeechRecognition error:", err);
        setIsListening(false);
      };

      rec.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = rec;
    }
  }, []);

  // Whenever transcript or tone changes, re-format into STAR bullet point
  useEffect(() => {
    if (!transcript) {
      setFormattedResult("");
      setMetrics([]);
      return;
    }
    const res = formatSpokenBulletPoint(transcript, tone);
    setFormattedResult(res.bulletPoint);
    setMetrics(res.metricsDetected);
  }, [transcript, tone]);

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    } else {
      setTranscript("");
      if (recognitionRef.current) {
        try {
          recognitionRef.current.start();
          setIsListening(true);
        } catch {
          // If browser mic is blocked or fails, use simulated voice sample
          simulateVoiceInput();
        }
      } else {
        simulateVoiceInput();
      }
    }
  };

  const simulateVoiceInput = () => {
    setIsListening(true);
    toast.info("Using simulated speech dictation demo");
    const sample =
      DEMO_SPOKEN_PHRASES[Math.floor(Math.random() * DEMO_SPOKEN_PHRASES.length)];

    let currentLength = 0;
    const interval = setInterval(() => {
      currentLength += 8;
      if (currentLength >= sample.length) {
        setTranscript(sample);
        setIsListening(false);
        clearInterval(interval);
      } else {
        setTranscript(sample.slice(0, currentLength));
      }
    }, 120);
  };

  const handleApply = () => {
    if (!formattedResult) {
      toast.error("No bullet point to insert. Speak or type a phrase first.");
      return;
    }
    onInsertBullet(formattedResult);
    toast.success("Voice bullet point added!");
    setOpen(false);
    setTranscript("");
    setFormattedResult("");
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className={`gap-1.5 border-[#102b2b]/15 hover:border-[#0d8274] text-xs font-semibold text-[#102b2b] hover:bg-[#0d8274]/5 ${triggerClassName}`}
        >
          <Mic className="h-3.5 w-3.5 text-[#0d8274]" />
          <span>{buttonLabel}</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md bg-[#fdfcf9] border-[#102b2b]/15 text-[#102b2b]">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#0d8274]/10 text-[#0d8274]">
              <Volume2 className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle className="text-base font-bold text-[#102b2b]">
                Voice-Driven AI Resume Editor
              </DialogTitle>
              <DialogDescription className="text-xs text-[#52716a]">
                Speak naturally. AI cleans filler words and converts speech into STAR bullet points.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          {/* Tone Selector */}
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-semibold text-[#52716a]">Refinement Tone:</span>
            <div className="flex rounded-lg border border-[#102b2b]/10 bg-white p-0.5 text-xs">
              {(["technical", "executive", "concise"] as VoiceTone[]).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setTone(t)}
                  className={`px-2.5 py-1 rounded-md capitalize font-medium transition-all ${
                    tone === t
                      ? "bg-[#102b2b] text-white shadow-xs"
                      : "text-[#52716a] hover:text-[#102b2b]"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* Mic Button & Waveform Animation */}
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-[#102b2b]/20 bg-[#f8f4ec] p-5 text-center">
            <button
              type="button"
              onClick={toggleListening}
              className={`relative flex h-16 w-16 items-center justify-center rounded-full transition-all ${
                isListening
                  ? "bg-rose-500 text-white ring-4 ring-rose-300 animate-pulse"
                  : "bg-[#0d8274] text-white hover:bg-[#0a665b] shadow-md"
              }`}
            >
              {isListening ? (
                <MicOff className="h-7 w-7 animate-bounce" />
              ) : (
                <Mic className="h-7 w-7" />
              )}
            </button>
            <span className="mt-3 text-xs font-bold text-[#102b2b]">
              {isListening ? "Listening... Speak your achievement" : "Click to Speak"}
            </span>
            <span className="text-[11px] text-[#52716a]">
              {isListening
                ? "Describe what you accomplished and metrics"
                : "Or click demo below to simulate speech"}
            </span>

            {/* Quick Demo Simulator button */}
            {!isListening && (
              <button
                type="button"
                onClick={simulateVoiceInput}
                className="mt-2 text-[11px] text-[#0d8274] hover:underline inline-flex items-center gap-1 font-semibold"
              >
                <RefreshCw className="h-3 w-3" /> Simulate spoken sample
              </button>
            )}
          </div>

          {/* Raw Transcript Area */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs font-semibold text-[#52716a]">
              <span>Raw Spoken Transcript:</span>
              {transcript && (
                <button
                  type="button"
                  onClick={() => setTranscript("")}
                  className="text-[10px] text-rose-600 hover:underline"
                >
                  Clear
                </button>
              )}
            </div>
            <textarea
              value={transcript}
              onChange={(e) => setTranscript(e.target.value)}
              placeholder="e.g. 'I managed the migration to Kubernetes and improved performance by 30%...'"
              rows={2}
              className="w-full rounded-lg border border-[#102b2b]/15 bg-white p-2.5 text-xs text-[#102b2b] placeholder:text-[#102b2b]/40 focus:border-[#0d8274] focus:outline-none"
            />
          </div>

          {/* AI Polished STAR Output Preview */}
          {formattedResult && (
            <div className="space-y-1.5 rounded-lg border border-[#0d8274]/30 bg-[#0d8274]/5 p-3">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1 text-xs font-bold text-[#0d8274]">
                  <Sparkles className="h-3.5 w-3.5" /> AI STAR Bullet Point
                </span>
                {metrics.length > 0 && (
                  <span className="text-[10px] font-bold bg-[#0d8274]/15 text-[#0d8274] px-1.5 py-0.5 rounded">
                    {metrics.length} metric{metrics.length > 1 ? "s" : ""} detected
                  </span>
                )}
              </div>
              <p className="text-xs font-medium text-[#102b2b] leading-relaxed">
                • {formattedResult}
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#102b2b]/10">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setOpen(false)}
              className="text-xs"
            >
              Cancel
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={handleApply}
              disabled={!formattedResult}
              className="gap-1.5 bg-[#0d8274] hover:bg-[#0a665b] text-white text-xs font-bold"
            >
              <Check className="h-3.5 w-3.5" />
              <span>Insert Bullet Point</span>
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
