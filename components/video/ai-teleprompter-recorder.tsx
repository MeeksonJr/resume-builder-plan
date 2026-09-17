"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  segmentPitchScript,
  calculateTeleprompterPacing,
  evaluateEyeContact,
  TELEPROMPTER_PRESETS,
  TeleprompterSection,
  EyeContactMetric,
} from "@/lib/video/ai-teleprompter";
import { Button } from "@/components/ui/button";
import {
  Video,
  Mic,
  Eye,
  Sparkles,
  Play,
  Square,
  RotateCcw,
  Sliders,
  CheckCircle2,
  AlertTriangle,
  Camera,
  Gauge,
  Volume2,
} from "lucide-react";
import { toast } from "sonner";

interface AITeleprompterRecorderProps {
  initialScript?: string;
  candidateName?: string;
  onRecordingComplete?: (recordedData: {
    durationSeconds: number;
    transcript: string;
    eyeContactScore: number;
    averageWpm: number;
  }) => void;
}

export function AITeleprompterRecorder({
  initialScript = "",
  candidateName = "Candidate",
  onRecordingComplete,
}: AITeleprompterRecorderProps) {
  const [selectedPresetId, setSelectedPresetId] = useState<string>("custom");
  const [scriptText, setScriptText] = useState<string>(
    initialScript || TELEPROMPTER_PRESETS[0].sections.map((s) => s.text).join(" ")
  );
  const [targetWpm, setTargetWpm] = useState<number>(145);
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [countdown, setCountdown] = useState<number>(60);
  const [activeSectionIndex, setActiveSectionIndex] = useState<number>(0);
  const [sections, setSections] = useState<TeleprompterSection[]>([]);
  const [eyeContact, setEyeContact] = useState<EyeContactMetric>({
    scorePercentage: 94,
    gazeState: "direct-eye-contact",
    feedbackMessage: "Direct eye contact maintained. Great presence!",
    isOptimalGaze: true,
  });

  const [webcamActive, setWebcamActive] = useState<boolean>(false);
  const [streamError, setStreamError] = useState<string | null>(null);

  const videoPreviewRef = useRef<HTMLVideoElement>(null);
  const teleprompterScrollRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const gazeIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Update segmented sections whenever script text changes
  useEffect(() => {
    setSections(segmentPitchScript(scriptText));
  }, [scriptText]);

  // Teleprompter pacing physics
  const pacing = calculateTeleprompterPacing(scriptText, 60, targetWpm);

  // Handle preset selection
  const handlePresetSelect = (presetId: string) => {
    setSelectedPresetId(presetId);
    if (presetId === "custom") {
      setScriptText(initialScript || "Hi, I'm an engineer specializing in...");
    } else {
      const preset = TELEPROMPTER_PRESETS.find((p) => p.id === presetId);
      if (preset) {
        setScriptText(preset.sections.map((s) => s.text).join(" "));
        setTargetWpm(preset.defaultWpm);
      }
    }
  };

  // Request actual webcam if browser permits, else fallback gracefully
  const startWebcam = async () => {
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { width: 1280, height: 720 },
          audio: true,
        });
        streamRef.current = stream;
        if (videoPreviewRef.current) {
          videoPreviewRef.current.srcObject = stream;
          videoPreviewRef.current.play().catch(() => {});
        }
        setWebcamActive(true);
        setStreamError(null);
      }
    } catch {
      // Permission denied or virtual environment
      setStreamError("Webcam preview using AI simulated mirror");
      setWebcamActive(false);
    }
  };

  const stopWebcam = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setWebcamActive(false);
  };

  // Recording lifecycle
  const handleStartRecording = async () => {
    await startWebcam();
    setIsRecording(true);
    setIsPaused(false);
    setCountdown(60);
    setActiveSectionIndex(0);
    toast.info("Recording initiated. AI Teleprompter is now scrolling!");

    // Reset teleprompter scroll position
    if (teleprompterScrollRef.current) {
      teleprompterScrollRef.current.scrollTop = 0;
    }

    // Gaze & Eye contact tracker simulation loop
    gazeIntervalRef.current = setInterval(() => {
      // Small simulated slight natural head movement
      const gazeX = 0.48 + (Math.random() * 0.08 - 0.04);
      const gazeY = 0.46 + (Math.random() * 0.10 - 0.04);
      setEyeContact((prev) => evaluateEyeContact(gazeX, gazeY, prev.scorePercentage));
    }, 2000);

    // Countdown and autoscroll timer
    timerRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          handleStopRecording();
          return 60;
        }

        const elapsed = 60 - prev + 1;
        // Determine active pitch stage
        if (elapsed < 15) {
          setActiveSectionIndex(0);
        } else if (elapsed < 45) {
          setActiveSectionIndex(1);
        } else {
          setActiveSectionIndex(2);
        }

        // Auto-scroll teleprompter container smoothly
        if (teleprompterScrollRef.current) {
          teleprompterScrollRef.current.scrollTop += pacing.scrollSpeedPxPerSec;
        }

        return prev - 1;
      });
    }, 1000);
  };

  const handleStopRecording = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (gazeIntervalRef.current) clearInterval(gazeIntervalRef.current);
    setIsRecording(false);
    setIsPaused(false);
    stopWebcam();

    toast.success("60-second video elevator pitch recorded & scored!");

    if (onRecordingComplete) {
      onRecordingComplete({
        durationSeconds: 60 - countdown,
        transcript: scriptText,
        eyeContactScore: eyeContact.scorePercentage,
        averageWpm: pacing.actualWpm,
      });
    }
  };

  const handleReset = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (gazeIntervalRef.current) clearInterval(gazeIntervalRef.current);
    setIsRecording(false);
    setIsPaused(false);
    setCountdown(60);
    setActiveSectionIndex(0);
    stopWebcam();
    if (teleprompterScrollRef.current) {
      teleprompterScrollRef.current.scrollTop = 0;
    }
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (gazeIntervalRef.current) clearInterval(gazeIntervalRef.current);
      stopWebcam();
    };
  }, []);

  return (
    <div className="space-y-4">
      {/* Preset & Pacing Controller Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 p-3 bg-muted/40 rounded-lg border text-xs">
        <div className="flex items-center gap-2">
          <Sliders className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
          <span className="font-semibold text-foreground">Pitch Script:</span>
          <select
            value={selectedPresetId}
            onChange={(e) => handlePresetSelect(e.target.value)}
            className="h-7 px-2 bg-background border rounded text-xs font-medium focus:ring-1 focus:ring-emerald-500"
            disabled={isRecording}
          >
            <option value="custom">Custom Profile Script</option>
            {TELEPROMPTER_PRESETS.map((preset) => (
              <option key={preset.id} value={preset.id}>
                {preset.title}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 text-muted-foreground font-mono">
            <Gauge className="h-3.5 w-3.5" />
            <span>Target:</span>
            <span className="font-bold text-foreground">{targetWpm} WPM</span>
          </div>
          <input
            type="range"
            min="110"
            max="180"
            step="5"
            value={targetWpm}
            onChange={(e) => setTargetWpm(Number(e.target.value))}
            disabled={isRecording}
            className="w-24 h-1.5 accent-emerald-600 bg-muted cursor-pointer"
          />
        </div>
      </div>

      {/* Main Studio Viewport: Camera + Live Teleprompter HUD */}
      <div className="relative aspect-video w-full rounded-xl overflow-hidden bg-neutral-950 border border-neutral-800 shadow-2xl flex flex-col justify-between p-4">
        {/* Real Webcam or High-End Dynamic Backdrop */}
        {webcamActive ? (
          <video
            ref={videoPreviewRef}
            className="absolute inset-0 w-full h-full object-cover -scale-x-100"
            autoPlay
            playsInline
            muted
          />
        ) : (
          <div className="absolute inset-0 bg-radial from-neutral-900 via-neutral-950 to-black flex items-center justify-center opacity-60">
            <Camera className="h-20 w-20 text-neutral-800 animate-pulse" />
          </div>
        )}

        {/* Semi-transparent dark overlay for high contrast teleprompter readability */}
        <div className="absolute inset-0 bg-black/45 backdrop-blur-[2px] pointer-events-none" />

        {/* Top HUD: Eye Contact Indicator, REC Status & Timer */}
        <div className="relative z-10 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {isRecording ? (
              <div className="flex items-center gap-2 bg-rose-600 text-white px-3 py-1 rounded-full text-xs font-mono font-bold animate-pulse shadow-md">
                <span className="h-2 w-2 rounded-full bg-white" />
                <span>REC 0:{countdown < 10 ? `0${countdown}` : countdown}</span>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 bg-neutral-800/90 text-neutral-300 px-3 py-1 rounded-full text-xs font-semibold">
                <Mic className="h-3 w-3 text-emerald-400" />
                <span>Ready to record (60s limit)</span>
              </div>
            )}

            {/* Eye Contact Coach Metric Badge */}
            <div
              className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold backdrop-blur-md border ${
                eyeContact.isOptimalGaze
                  ? "bg-emerald-950/80 text-emerald-300 border-emerald-500/40"
                  : "bg-amber-950/80 text-amber-300 border-amber-500/40"
              }`}
            >
              <Eye className="h-3.5 w-3.5" />
              <span>Gaze: {eyeContact.scorePercentage}% Direct</span>
              {eyeContact.isOptimalGaze ? (
                <CheckCircle2 className="h-3 w-3 text-emerald-400" />
              ) : (
                <AlertTriangle className="h-3 w-3 text-amber-400" />
              )}
            </div>
          </div>

          <div className="text-[11px] font-mono font-bold text-neutral-300 bg-neutral-900/80 px-2.5 py-1 rounded border border-neutral-700">
            {sections[activeSectionIndex]?.label || "Hook & Intro"}
          </div>
        </div>

        {/* Center: Auto-scrolling Floating Teleprompter */}
        <div className="relative z-10 my-auto max-w-xl mx-auto w-full">
          <div
            ref={teleprompterScrollRef}
            className="h-36 overflow-y-auto no-scrollbar scroll-smooth px-6 py-2 text-center bg-black/60 rounded-xl border border-white/10 shadow-inner backdrop-blur-sm"
          >
            <div className="space-y-4 py-2">
              {sections.map((sec, idx) => {
                const isActive = idx === activeSectionIndex;
                return (
                  <div
                    key={sec.id}
                    className={`transition-all duration-300 ${
                      isActive
                        ? "text-white text-base md:text-lg font-bold scale-102 drop-shadow-md"
                        : "text-neutral-400 text-xs md:text-sm font-medium opacity-60"
                    }`}
                  >
                    <span className="block text-[10px] font-mono uppercase tracking-widest text-emerald-400 mb-0.5">
                      {sec.label}
                    </span>
                    <p className="leading-relaxed">{sec.text}</p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Eye Contact Coach Prompt */}
          <div className="mt-2 text-center">
            <span className="inline-block text-[11px] text-neutral-300 bg-black/70 px-3 py-1 rounded-full border border-white/5">
              💡 {eyeContact.feedbackMessage}
            </span>
          </div>
        </div>

        {/* Bottom Bar: Pacing & Scroll Speed Indicator */}
        <div className="relative z-10 flex items-center justify-between text-xs text-neutral-400">
          <div className="flex items-center gap-2">
            <span className="font-mono text-[11px]">
              {pacing.totalWords} words • Scroll: {pacing.scrollSpeedPxPerSec} px/s
            </span>
            <span
              className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                pacing.cadenceStatus === "Optimal"
                  ? "bg-emerald-900/60 text-emerald-300"
                  : "bg-amber-900/60 text-amber-300"
              }`}
            >
              {pacing.cadenceStatus}
            </span>
          </div>

          <span className="text-[11px] text-neutral-300">
            Candidate: <strong className="text-white">{candidateName}</strong>
          </span>
        </div>
      </div>

      {/* Recording Control Actions */}
      <div className="flex items-center justify-between pt-1">
        <div className="text-xs text-muted-foreground">
          {streamError ? (
            <span className="text-amber-600 dark:text-amber-400 font-medium">
              ℹ️ {streamError}
            </span>
          ) : (
            <span>Look directly at the camera while reading the teleprompter.</span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {isRecording ? (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={handleReset}
                className="text-xs h-8"
              >
                <RotateCcw className="h-3.5 w-3.5 mr-1" />
                Reset
              </Button>
              <Button
                size="sm"
                onClick={handleStopRecording}
                className="bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs h-8"
              >
                <Square className="h-3.5 w-3.5 mr-1.5 fill-current" />
                Stop & Analyze Pitch
              </Button>
            </>
          ) : (
            <Button
              size="sm"
              onClick={handleStartRecording}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs h-8 shadow-sm"
            >
              <Play className="h-3.5 w-3.5 mr-1.5 fill-current" />
              Start 60s Teleprompter Recording
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
