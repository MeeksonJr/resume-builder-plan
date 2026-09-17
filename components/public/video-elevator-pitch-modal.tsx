"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Video,
  Play,
  Pause,
  RotateCcw,
  Sparkles,
  Award,
  Zap,
  Clock,
  Mic,
  FileText,
  Volume2,
  VolumeX,
} from "lucide-react";
import {
  VideoPitchData,
  DEMO_PITCHES,
  formatPitchDuration,
  calculatePitchMetrics,
} from "@/lib/video/video-pitch";
import { toast } from "sonner";

interface VideoElevatorPitchModalProps {
  candidateName: string;
  roleTitle?: string;
  summaryText?: string;
  pitchData?: VideoPitchData;
  triggerClassName?: string;
}

export function VideoElevatorPitchModal({
  candidateName,
  roleTitle = "Software Engineer",
  summaryText = "",
  pitchData = DEMO_PITCHES.default,
  triggerClassName = "",
}: VideoElevatorPitchModalProps) {
  const [open, setOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"watch" | "transcript" | "scorecard" | "record">("watch");
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [recordCountdown, setRecordCountdown] = useState(60);

  const videoRef = useRef<HTMLVideoElement>(null);
  const recordTimerRef = useRef<any>(null);

  // Sync video time
  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  };

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play().catch(() => {});
      setIsPlaying(true);
    }
  };

  const handleRestart = () => {
    if (!videoRef.current) return;
    videoRef.current.currentTime = 0;
    videoRef.current.play().catch(() => {});
    setIsPlaying(true);
  };

  // Recording simulation
  const startRecording = () => {
    setIsRecording(true);
    setRecordCountdown(60);
    toast.info("Recording started. Teleprompter active!");

    recordTimerRef.current = setInterval(() => {
      setRecordCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(recordTimerRef.current);
          setIsRecording(false);
          toast.success("60-second pitch captured & analyzed by AI!");
          setActiveTab("scorecard");
          return 60;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const stopRecording = () => {
    if (recordTimerRef.current) clearInterval(recordTimerRef.current);
    setIsRecording(false);
    toast.success("Pitch saved and transcribed with AI!");
    setActiveTab("scorecard");
  };

  useEffect(() => {
    return () => {
      if (recordTimerRef.current) clearInterval(recordTimerRef.current);
    };
  }, []);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className={`h-8 px-2.5 text-xs gap-1.5 border-[#0d8274]/40 bg-[#0d8274]/5 hover:bg-[#0d8274]/15 text-[#0d8274] font-bold rounded-none ${triggerClassName}`}
          title="Watch 60-Second Video Elevator Pitch"
        >
          <Video className="h-3.5 w-3.5 text-[#0d8274] animate-pulse" />
          <span>60s Pitch</span>
          <span className="hidden md:inline-block px-1 py-0.2 rounded bg-[#0d8274] text-white text-[9px] font-mono">
            {formatPitchDuration(pitchData.durationSeconds)}
          </span>
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-2xl bg-[#fdfcf9] border-[#102b2b]/15 text-[#102b2b] p-0 overflow-hidden">
        <DialogHeader className="p-4 pb-2 border-b border-[#102b2b]/10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#0d8274] text-white">
                <Video className="h-4 w-4" />
              </div>
              <div>
                <DialogTitle className="text-sm font-bold text-[#102b2b] flex items-center gap-2">
                  <span>{candidateName} — 60s Elevator Pitch</span>
                  <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                    Verified Pitch
                  </span>
                </DialogTitle>
                <DialogDescription className="text-xs text-[#52716a]">
                  Candidate introduction & communication delivery scorecard
                </DialogDescription>
              </div>
            </div>
          </div>

          {/* Navigation Tabs */}
          <Tabs value={activeTab} onValueChange={(val: any) => setActiveTab(val)} className="w-full mt-3">
            <TabsList className="grid grid-cols-4 bg-[#f0eee6] h-8 p-0.5 rounded-none text-xs">
              <TabsTrigger value="watch" className="text-xs font-semibold">
                Watch Video
              </TabsTrigger>
              <TabsTrigger value="transcript" className="text-xs font-semibold">
                AI Transcript
              </TabsTrigger>
              <TabsTrigger value="scorecard" className="text-xs font-semibold flex items-center gap-1">
                <Sparkles className="h-3 w-3 text-[#0d8274]" /> Scorecard
              </TabsTrigger>
              <TabsTrigger value="record" className="text-xs font-semibold">
                Record New
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </DialogHeader>

        {/* Tab 1: Video Player */}
        {activeTab === "watch" && (
          <div className="p-4 space-y-3">
            <div className="relative aspect-video w-full rounded-xl overflow-hidden bg-black shadow-lg">
              <video
                ref={videoRef}
                src={pitchData.videoUrl}
                className="h-full w-full object-cover"
                onTimeUpdate={handleTimeUpdate}
                onEnded={() => setIsPlaying(false)}
                muted={isMuted}
                playsInline
              />

              {/* Subtitles Overlay */}
              <div className="absolute bottom-12 inset-x-4 text-center pointer-events-none">
                <span className="bg-black/80 text-white text-xs px-3 py-1.5 rounded-md backdrop-blur-xs font-medium">
                  {pitchData.transcript.slice(0, 110)}...
                </span>
              </div>

              {/* Custom Player Controls */}
              <div className="absolute bottom-2 inset-x-2 flex items-center justify-between bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-lg text-white text-xs">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={togglePlay}
                    className="hover:text-[#d8f36b] transition-colors"
                  >
                    {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                  </button>
                  <button
                    type="button"
                    onClick={handleRestart}
                    className="hover:text-[#d8f36b] transition-colors"
                  >
                    <RotateCcw className="h-3.5 w-3.5" />
                  </button>
                  <span className="font-mono text-[11px] opacity-80">
                    {formatPitchDuration(currentTime)} / {formatPitchDuration(pitchData.durationSeconds)}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsMuted(!isMuted)}
                    className="hover:text-[#d8f36b] transition-colors"
                  >
                    {isMuted ? <VolumeX className="h-3.5 w-3.5" /> : <Volume2 className="h-3.5 w-3.5" />}
                  </button>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#d8f36b]">
                    1080p HD
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Candidate Snapshot */}
            <div className="flex items-center justify-between bg-[#f8f4ec] p-3 rounded-lg border border-[#102b2b]/10 text-xs">
              <div>
                <span className="font-bold text-[#102b2b] block">{candidateName}</span>
                <span className="text-[#52716a] text-[11px]">{roleTitle}</span>
              </div>
              <Button
                size="sm"
                className="bg-[#102b2b] text-white hover:bg-[#0d8274] font-bold text-xs h-7 rounded-none"
                onClick={() => {
                  toast.success("Recruiter contact invitation initiated!");
                }}
              >
                Connect with Candidate
              </Button>
            </div>
          </div>
        )}

        {/* Tab 2: Transcript */}
        {activeTab === "transcript" && (
          <div className="p-4 space-y-3">
            <div className="flex items-center justify-between text-xs text-[#52716a]">
              <span className="font-semibold">AI Generated Word-for-Word Transcript</span>
              <span className="font-mono text-[10px] bg-[#f0eee6] px-2 py-0.5 rounded">
                100% Accuracy
              </span>
            </div>
            <div className="p-3.5 rounded-lg border border-[#102b2b]/15 bg-white text-xs leading-relaxed text-[#102b2b]">
              "{pitchData.transcript}"
            </div>
            <div className="flex flex-wrap items-center gap-1.5 pt-1">
              <span className="text-[10px] font-bold uppercase text-[#52716a]">Mentioned Highlights:</span>
              {pitchData.scorecard.keyThemes.map((kw) => (
                <span
                  key={kw}
                  className="px-2 py-0.5 text-[10px] font-mono font-bold bg-[#0d8274]/10 text-[#0d8274] border border-[#0d8274]/20 rounded"
                >
                  #{kw}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Tab 3: Delivery Scorecard */}
        {activeTab === "scorecard" && (
          <div className="p-4 space-y-4">
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-[#f8f4ec] border border-[#102b2b]/10 p-3 rounded-xl text-center">
                <div className="flex items-center justify-center gap-1 text-[#0d8274] mb-1">
                  <Award className="h-4 w-4" />
                  <span className="text-xs font-bold uppercase">Clarity</span>
                </div>
                <div className="text-2xl font-black text-[#102b2b]">
                  {pitchData.scorecard.clarityScore}
                  <span className="text-xs text-[#52716a]">/100</span>
                </div>
                <span className="text-[10px] text-emerald-700 font-bold">Top 5% Presenter</span>
              </div>

              <div className="bg-[#f8f4ec] border border-[#102b2b]/10 p-3 rounded-xl text-center">
                <div className="flex items-center justify-center gap-1 text-[#0d8274] mb-1">
                  <Clock className="h-4 w-4" />
                  <span className="text-xs font-bold uppercase">Pacing</span>
                </div>
                <div className="text-2xl font-black text-[#102b2b]">
                  {pitchData.scorecard.pacingWpm}
                  <span className="text-xs text-[#52716a]"> wpm</span>
                </div>
                <span className="text-[10px] text-[#52716a]">Target: 130–160 wpm</span>
              </div>

              <div className="bg-[#f8f4ec] border border-[#102b2b]/10 p-3 rounded-xl text-center">
                <div className="flex items-center justify-center gap-1 text-[#0d8274] mb-1">
                  <Zap className="h-4 w-4" />
                  <span className="text-xs font-bold uppercase">Energy</span>
                </div>
                <div className="text-xl font-black text-[#102b2b] mt-1">
                  {pitchData.scorecard.energyLevel}
                </div>
                <span className="text-[10px] text-[#0d8274] font-bold">Charismatic Delivery</span>
              </div>
            </div>

            <div className="p-3 bg-[#0d8274]/5 border border-[#0d8274]/20 rounded-lg text-xs space-y-1">
              <span className="font-bold text-[#0d8274] flex items-center gap-1">
                <Sparkles className="h-3.5 w-3.5" /> AI Coach Feedback
              </span>
              <p className="text-[#52716a] text-[11px] leading-relaxed">
                Clear articulation, zero filler words, and strong quantifiable achievements (35% latency reduction, $180k cost reduction). Pacing is optimal for senior executive screening.
              </p>
            </div>
          </div>
        )}

        {/* Tab 4: Record New */}
        {activeTab === "record" && (
          <div className="p-4 space-y-3">
            <div className="relative aspect-video w-full rounded-xl overflow-hidden bg-neutral-900 border border-neutral-800 flex flex-col items-center justify-center text-white">
              {isRecording ? (
                <>
                  <div className="absolute top-3 left-3 flex items-center gap-2 bg-rose-600 px-2.5 py-1 rounded-full text-xs font-bold animate-pulse">
                    <div className="h-2 w-2 rounded-full bg-white" />
                    REC 0:{recordCountdown < 10 ? `0${recordCountdown}` : recordCountdown}
                  </div>

                  {/* Teleprompter Display */}
                  <div className="max-w-md p-4 text-center bg-black/70 backdrop-blur-xs rounded-xl border border-white/10 m-4">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#d8f36b] block mb-1">
                      Teleprompter Prompt
                    </span>
                    <p className="text-xs leading-relaxed text-neutral-200">
                      {summaryText ||
                        "Hi, I'm a passionate engineer with a background in building scalable systems. In my previous role, I achieved..."}
                    </p>
                  </div>
                </>
              ) : (
                <div className="text-center p-6 space-y-2">
                  <div className="h-12 w-12 rounded-full bg-white/10 flex items-center justify-center mx-auto text-[#d8f36b]">
                    <Mic className="h-6 w-6" />
                  </div>
                  <h4 className="text-sm font-bold">Ready to record your 60-second pitch</h4>
                  <p className="text-xs text-neutral-400 max-w-xs mx-auto">
                    Look directly at the camera, state your strongest achievement, and speak naturally.
                  </p>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between pt-2">
              <span className="text-[11px] text-[#52716a]">
                {isRecording ? "Speak clearly into your microphone" : "Max duration: 60 seconds"}
              </span>
              {isRecording ? (
                <Button
                  size="sm"
                  onClick={stopRecording}
                  className="bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs"
                >
                  Stop Recording
                </Button>
              ) : (
                <Button
                  size="sm"
                  onClick={startRecording}
                  className="bg-[#0d8274] hover:bg-[#0a665b] text-white font-bold text-xs"
                >
                  Start 60s Recording
                </Button>
              )}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
