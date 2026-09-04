"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Mic,
  MicOff,
  PhoneOff,
  Volume2,
  Sparkles,
  AlertCircle,
  CheckCircle2,
  ChevronRight,
  RotateCcw,
  Loader2,
  Gauge,
  Activity,
  Sliders,
  Settings2,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useSpeechRecognition } from "@/lib/hooks/use-speech-recognition";
import { useSpeechSynthesis } from "@/lib/hooks/use-speech-synthesis";
import { SpeechMetrics, analyzeSpeech } from "@/lib/interview/speech-analytics";

interface VoiceCallInterfaceProps {
  session: any;
  questions: any[];
  onComplete: (transcript: any[]) => void;
}

type InterviewStage =
  | "ready" // Waiting to start
  | "ai-intro" // AI introducing the interview
  | "ai-question" // AI asking primary question
  | "user-answering" // Candidate answering primary question
  | "ai-thinking" // Generating dynamic follow-up
  | "ai-followup" // AI asking follow-up question
  | "user-followup" // Candidate answering follow-up question
  | "wrapping-up"; // Finishing session

interface QnATurn {
  questionId: string;
  questionText: string;
  userAnswer: string;
  userMetrics?: SpeechMetrics;
  followUpQuestion?: string;
  followUpAnswer?: string;
  followUpMetrics?: SpeechMetrics;
}

export function VoiceCallInterface({ session, questions, onComplete }: VoiceCallInterfaceProps) {
  const [stage, setStage] = useState<InterviewStage>("ready");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [qnaHistory, setQnaHistory] = useState<QnATurn[]>([]);
  const [currentFollowUp, setCurrentFollowUp] = useState<string>("");
  const [currentTransition, setCurrentTransition] = useState<string>("");
  const [subtitle, setSubtitle] = useState<string>("Click 'Start Interview Room' to begin.");
  const [permissionGranted, setPermissionGranted] = useState(false);
  const [permissionError, setPermissionError] = useState(false);
  const [sessionDuration, setSessionDuration] = useState(0);
  const [savingResults, setSavingResults] = useState(false);

  // Audio Visualizer states
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const micStreamRef = useRef<MediaStream | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  // Voice synthesis & recognition hooks
  const { isSpeaking, speak, stop: stopSpeaking, voices, selectedVoice, setSelectedVoice } = useSpeechSynthesis();
  const {
    isListening,
    transcript,
    interimTranscript,
    durationSeconds: answerDuration,
    liveWpm,
    pacingRating,
    fillerCount,
    fillersDetected,
    startListening,
    stopListening,
    resetTranscript,
  } = useSpeechRecognition();

  const currentQuestion = questions[currentIndex];
  const targetRole = session.target_role || "Software Engineer";
  const targetCompany = session.target_company || "our team";
  const difficulty = session.difficulty || "Mid-Level";

  // Session elapsed timer
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (stage !== "ready" && stage !== "wrapping-up") {
      interval = setInterval(() => {
        setSessionDuration((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [stage]);

  // Format seconds into MM:SS
  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remaining = secs % 60;
    return `${mins.toString().padStart(2, "0")}:${remaining.toString().padStart(2, "0")}`;
  };

  // Setup Web Audio API Spectrum Analyser
  const initAudioAnalyser = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      micStreamRef.current = stream;

      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      const audioCtx = new AudioCtx();
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 64;
      analyser.smoothingTimeConstant = 0.8;

      const source = audioCtx.createMediaStreamSource(stream);
      source.connect(analyser);

      audioContextRef.current = audioCtx;
      analyserRef.current = analyser;
      setPermissionGranted(true);
      setPermissionError(false);
      drawWaveform();
      return true;
    } catch (err) {
      console.error("[Microphone Access Error]", err);
      setPermissionError(true);
      toast.error("Microphone access is required for voice interview.");
      return false;
    }
  };

  // Canvas waveform rendering
  const drawWaveform = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const render = () => {
      const width = canvas.width;
      const height = canvas.height;
      const centerY = height / 2;

      ctx.clearRect(0, 0, width, height);

      const analyser = analyserRef.current;
      if (analyser && isListening) {
        const bufferLength = analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);
        analyser.getByteFrequencyData(dataArray);

        const barWidth = (width / bufferLength) * 2;
        let x = 0;

        for (let i = 0; i < bufferLength; i++) {
          const barHeight = (dataArray[i] / 255) * height * 0.7;

          // Gradient bar styling
          ctx.fillStyle = "#d8f36b";
          ctx.fillRect(x, centerY - barHeight / 2, barWidth - 1, barHeight);

          x += barWidth;
        }
      } else {
        // Idle heartbeat line
        ctx.beginPath();
        ctx.moveTo(0, centerY);
        ctx.lineTo(width, centerY);
        ctx.strokeStyle = isSpeaking ? "#0d8274" : "rgba(233, 238, 232, 0.2)";
        ctx.lineWidth = isSpeaking ? 3 : 1.5;
        ctx.stroke();
      }

      animationFrameRef.current = requestAnimationFrame(render);
    };

    render();
  }, [isListening, isSpeaking]);

  // Clean up Web Audio on unmount
  useEffect(() => {
    return () => {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
      if (micStreamRef.current) {
        micStreamRef.current.getTracks().forEach((t) => t.stop());
      }
      if (audioContextRef.current && audioContextRef.current.state !== "closed") {
        audioContextRef.current.close().catch(() => {});
      }
      stopSpeaking();
      stopListening();
    };
  }, [stopSpeaking, stopListening]);

  // 1. Start Interview Session
  const handleStartInterview = async () => {
    const micOk = await initAudioAnalyser();
    if (!micOk) return;

    setStage("ai-intro");
    const introText = `Welcome to your simulated voice interview for the ${targetRole} position at ${targetCompany}. I'll ask you a few targeted questions, followed by natural follow-ups. Let's get started with your first question.`;
    setSubtitle(introText);

    speak(introText, {
      onEnd: () => {
        askPrimaryQuestion(0);
      },
    });
  };

  // 2. AI asks a primary question
  const askPrimaryQuestion = (index: number) => {
    const q = questions[index];
    if (!q) {
      handleCompleteInterview();
      return;
    }

    setStage("ai-question");
    resetTranscript();
    stopListening();

    const textToSpeak = `Question ${index + 1}: ${q.question_text}`;
    setSubtitle(textToSpeak);

    speak(textToSpeak, {
      onEnd: () => {
        setStage("user-answering");
        setSubtitle("Listening to your answer... Click 'Finish Answer' when done.");
        startListening();
      },
    });
  };

  // 3. User finishes primary answer -> request dynamic AI verbal follow-up
  const handleFinishPrimaryAnswer = async () => {
    stopListening();
    const finalAnswer = transcript.trim();

    if (!finalAnswer) {
      toast.error("I didn't capture your spoken answer. Please speak and try again.");
      startListening();
      return;
    }

    const metrics = analyzeSpeech(finalAnswer, Math.max(1, answerDuration));

    setStage("ai-thinking");
    setSubtitle("Interviewer is reflecting on your answer...");

    try {
      const res = await fetch("/api/interview/follow-up", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          questionId: currentQuestion.id,
          questionText: currentQuestion.question_text,
          userAnswer: finalAnswer,
          targetRole,
          difficulty,
          company: targetCompany,
        }),
      });

      const data = await res.json();
      const followUpQ = data.followUpQuestion || "Could you dive deeper into the specific results or metrics you achieved?";
      const transition = data.conversationalTransition || "Got it, thank you.";

      setCurrentFollowUp(followUpQ);
      setCurrentTransition(transition);

      // Transition to AI speaking follow-up
      setStage("ai-followup");
      const fullSpokenFollowUp = `${transition} ${followUpQ}`;
      setSubtitle(fullSpokenFollowUp);

      speak(fullSpokenFollowUp, {
        onEnd: () => {
          setStage("user-followup");
          resetTranscript();
          setSubtitle("Listening to your follow-up response... Click 'Submit & Next' when done.");
          startListening();
        },
      });

      // Save turn into history
      setQnaHistory((prev) => [
        ...prev,
        {
          questionId: currentQuestion.id,
          questionText: currentQuestion.question_text,
          userAnswer: finalAnswer,
          userMetrics: metrics,
          followUpQuestion: followUpQ,
        },
      ]);
    } catch (err) {
      console.error("[Follow-Up Error]", err);
      // Fallback: move to next question if follow up fails
      toast.error("Could not synthesize follow up; advancing to next question.");
      advanceToNextQuestion(finalAnswer, metrics);
    }
  };

  // 4. User finishes follow-up answer -> advance to next question
  const handleFinishFollowUpAnswer = () => {
    stopListening();
    const finalFollowUpAnswer = transcript.trim();
    const followUpMetrics = analyzeSpeech(finalFollowUpAnswer, Math.max(1, answerDuration));

    // Update history turn with follow up answer
    setQnaHistory((prev) =>
      prev.map((item, idx) =>
        idx === currentIndex
          ? {
              ...item,
              followUpAnswer: finalFollowUpAnswer || "Candidate provided brief clarification.",
              followUpMetrics,
            }
          : item
      )
    );

    advanceToNextQuestion();
  };

  const advanceToNextQuestion = (prevAnswer?: string, prevMetrics?: SpeechMetrics) => {
    resetTranscript();
    const nextIdx = currentIndex + 1;

    if (nextIdx < questions.length) {
      setCurrentIndex(nextIdx);
      askPrimaryQuestion(nextIdx);
    } else {
      handleCompleteInterview();
    }
  };

  // Repeat current question aloud
  const handleRepeatQuestion = () => {
    stopListening();
    stopSpeaking();
    if (stage === "user-answering" && currentQuestion) {
      speak(currentQuestion.question_text, {
        onEnd: () => {
          startListening();
        },
      });
    } else if (stage === "user-followup" && currentFollowUp) {
      speak(currentFollowUp, {
        onEnd: () => {
          startListening();
        },
      });
    }
  };

  // 5. Complete Interview & Send Telemetry to Server
  const handleCompleteInterview = async () => {
    setStage("wrapping-up");
    stopListening();
    stopSpeaking();
    setSavingResults(true);
    setSubtitle("Interview completed! Synthesizing your verbal communication report...");

    // Build structured transcript for DB and results
    const fullTranscript: Array<{ role: "ai" | "user"; text: string; timestamp: string }> = [];

    qnaHistory.forEach((turn, idx) => {
      fullTranscript.push({
        role: "ai",
        text: `Question ${idx + 1}: ${turn.questionText}`,
        timestamp: new Date().toISOString(),
      });
      fullTranscript.push({
        role: "user",
        text: turn.userAnswer,
        timestamp: new Date().toISOString(),
      });
      if (turn.followUpQuestion) {
        fullTranscript.push({
          role: "ai",
          text: `Follow-up: ${turn.followUpQuestion}`,
          timestamp: new Date().toISOString(),
        });
      }
      if (turn.followUpAnswer) {
        fullTranscript.push({
          role: "user",
          text: turn.followUpAnswer,
          timestamp: new Date().toISOString(),
        });
      }
    });

    // Calculate overall telemetry
    const allUserWords = qnaHistory.reduce(
      (sum, q) => sum + (q.userMetrics?.wordCount || 0) + (q.followUpMetrics?.wordCount || 0),
      0
    );
    const allUserDuration = qnaHistory.reduce(
      (sum, q) => sum + (q.userMetrics?.durationSeconds || 0) + (q.followUpMetrics?.durationSeconds || 0),
      0
    );
    const allFillers = qnaHistory.reduce(
      (sum, q) => sum + (q.userMetrics?.fillerCount || 0) + (q.followUpMetrics?.fillerCount || 0),
      0
    );

    const averageWpm = allUserDuration > 0 ? Math.round(allUserWords / (allUserDuration / 60)) : 130;

    try {
      // Trigger voice analysis endpoint
      await fetch("/api/interview/analysis", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId: session.id,
          telemetry: {
            averageWpm,
            totalFillers: allFillers,
            totalDurationSeconds: allUserDuration,
          },
        }),
      });
    } catch (e) {
      console.warn("[Voice Analysis Trigger Failed]", e);
    }

    // Call server action onComplete to finalize session
    onComplete(fullTranscript);
  };

  return (
    <div className="relative flex min-h-[calc(100vh-4.5rem)] flex-col overflow-hidden bg-[#0d2222] text-[#e9eee8] select-none">
      {/* Top Header Bar */}
      <header className="flex h-14 items-center justify-between border-b border-white/10 bg-[#102b2b]/90 px-4 sm:px-6 backdrop-blur-md z-30">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-[#d8f36b] animate-ping" />
            <span className="text-xs font-black uppercase tracking-widest text-[#d8f36b]">
              Interactive Voice Room
            </span>
          </div>
          <span className="text-white/30">|</span>
          <span className="text-xs font-bold text-white/80 line-clamp-1">
            {targetRole} &bull; <span className="text-[#0d8274] font-extrabold">{targetCompany}</span>
          </span>
          <Badge variant="outline" className="border-white/20 text-[10px] uppercase font-bold text-white/70">
            {difficulty}
          </Badge>
        </div>

        <div className="flex items-center gap-3">
          {/* Question Counter */}
          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-sm bg-white/5 border border-white/10 text-xs font-mono">
            <span className="text-white/50">QUESTION</span>
            <span className="font-bold text-[#d8f36b]">
              {Math.min(currentIndex + 1, questions.length)}
            </span>
            <span className="text-white/40">/ {questions.length}</span>
          </div>

          {/* Session Timer */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-sm bg-white/5 border border-white/10 text-xs font-mono text-white/90">
            <Activity className="w-3.5 h-3.5 text-[#0d8274]" />
            <span>{formatTime(sessionDuration)}</span>
          </div>
        </div>
      </header>

      {/* Main Studio Viewport */}
      <div className="flex-1 flex flex-col items-center justify-between p-4 sm:p-8 relative">
        {/* Stage Content Card */}
        <div className="w-full max-w-4xl flex-1 flex flex-col items-center justify-center relative my-auto">
          {/* AI Interviewer Avatar & Glow */}
          <div className="relative flex flex-col items-center justify-center mb-6">
            <div
              className={cn(
                "absolute -inset-8 rounded-full blur-3xl transition-all duration-500",
                isSpeaking
                  ? "bg-[#0d8274]/40 scale-125 opacity-100"
                  : stage === "user-answering" || stage === "user-followup"
                  ? "bg-[#d8f36b]/20 scale-110 opacity-70"
                  : "bg-white/5 scale-90 opacity-20"
              )}
            />

            <div className="relative z-10 flex flex-col items-center">
              <Avatar
                className={cn(
                  "h-32 w-32 sm:h-40 sm:w-40 border-4 transition-all duration-300 shadow-2xl",
                  isSpeaking
                    ? "border-[#d8f36b] ring-8 ring-[#0d8274]/30 scale-105"
                    : "border-white/20 scale-100"
                )}
              >
                <AvatarFallback className="bg-[#102b2b] text-4xl sm:text-5xl font-black text-[#d8f36b]">
                  AI
                </AvatarFallback>
              </Avatar>

              {/* Status Badge under Avatar */}
              <div className="mt-3 flex items-center gap-2">
                <span
                  className={cn(
                    "px-3 py-1 rounded-full text-xs font-extrabold tracking-wide uppercase shadow-sm border",
                    isSpeaking
                      ? "bg-[#d8f36b] text-[#102b2b] border-[#d8f36b] animate-pulse"
                      : stage === "user-answering" || stage === "user-followup"
                      ? "bg-[#0d8274] text-white border-[#0d8274]"
                      : stage === "ai-thinking"
                      ? "bg-amber-400 text-[#102b2b] border-amber-300"
                      : "bg-white/10 text-white/70 border-white/10"
                  )}
                >
                  {isSpeaking
                    ? "Interviewer Speaking"
                    : stage === "user-answering" || stage === "user-followup"
                    ? "Candidate Speaking"
                    : stage === "ai-thinking"
                    ? "Formulating Follow-up..."
                    : "Interviewer Ready"}
                </span>
              </div>
            </div>
          </div>

          {/* Real-time Telemetry HUD (Visible when user is answering) */}
          {(stage === "user-answering" || stage === "user-followup") && (
            <div className="w-full max-w-xl grid grid-cols-3 gap-2.5 mb-6 z-20">
              {/* WPM Speedometer */}
              <div className="p-3 rounded-md bg-[#102b2b]/90 border border-white/10 flex flex-col items-center justify-center">
                <div className="flex items-center gap-1 text-[11px] font-bold text-white/60 uppercase">
                  <Gauge className="w-3.5 h-3.5 text-[#d8f36b]" />
                  <span>Cadence</span>
                </div>
                <span className="text-xl font-black font-mono text-[#d8f36b] mt-0.5">
                  {liveWpm} <span className="text-[10px] text-white/60 font-sans">WPM</span>
                </span>
                <span
                  className={cn(
                    "text-[10px] font-bold uppercase mt-0.5",
                    pacingRating === "optimal"
                      ? "text-emerald-400"
                      : pacingRating === "slow"
                      ? "text-amber-400"
                      : "text-rose-400"
                  )}
                >
                  {pacingRating === "optimal" ? "Optimal" : pacingRating === "slow" ? "Slow" : "Fast"}
                </span>
              </div>

              {/* Filler Words Radar */}
              <div className="p-3 rounded-md bg-[#102b2b]/90 border border-white/10 flex flex-col items-center justify-center">
                <div className="flex items-center gap-1 text-[11px] font-bold text-white/60 uppercase">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  <span>Fillers</span>
                </div>
                <span
                  className={cn(
                    "text-xl font-black font-mono mt-0.5",
                    fillerCount === 0 ? "text-emerald-400" : fillerCount <= 2 ? "text-amber-400" : "text-rose-400"
                  )}
                >
                  {fillerCount}
                </span>
                <span className="text-[10px] text-white/60 font-medium truncate max-w-full">
                  {fillersDetected.length > 0
                    ? fillersDetected.map((f) => `${f.word}:${f.count}`).join(" ")
                    : "Clean speech"}
                </span>
              </div>

              {/* Answer Duration */}
              <div className="p-3 rounded-md bg-[#102b2b]/90 border border-white/10 flex flex-col items-center justify-center">
                <div className="flex items-center gap-1 text-[11px] font-bold text-white/60 uppercase">
                  <Activity className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Answer Time</span>
                </div>
                <span className="text-xl font-black font-mono text-cyan-300 mt-0.5">
                  {formatTime(answerDuration)}
                </span>
                <span className="text-[10px] text-white/60">
                  {answerDuration < 30 ? "Brief" : answerDuration < 120 ? "Target (1-2m)" : "Extended"}
                </span>
              </div>
            </div>
          )}

          {/* Waveform Canvas */}
          <div className="w-full max-w-lg h-14 relative flex items-center justify-center mb-6">
            <canvas
              ref={canvasRef}
              width={480}
              height={56}
              className="w-full h-full rounded-md bg-black/20 border border-white/10 shadow-inner"
            />
          </div>

          {/* Subtitles & Captions Bar */}
          <div className="w-full max-w-2xl min-h-[4.5rem] p-4 rounded-md bg-[#102b2b]/95 border border-white/15 backdrop-blur-md shadow-xl flex items-center justify-center text-center">
            <p className="text-xs sm:text-sm font-semibold text-white/90 leading-relaxed max-w-xl">
              {stage === "user-answering" || stage === "user-followup" ? (
                transcript || interimTranscript ? (
                  <span>
                    <span className="text-white font-bold">{transcript} </span>
                    <span className="text-[#d8f36b] italic">{interimTranscript}</span>
                  </span>
                ) : (
                  <span className="text-white/50 italic">Listening... Start speaking your answer aloud into the mic.</span>
                )
              ) : (
                subtitle
              )}
            </p>
          </div>
        </div>

        {/* Bottom Stage Controls Toolbar */}
        <div className="w-full max-w-3xl flex flex-col sm:flex-row items-center justify-between gap-4 py-4 px-6 rounded-lg bg-[#102b2b]/90 border border-white/10 shadow-2xl z-30">
          {stage === "ready" ? (
            <div className="flex items-center justify-between w-full">
              <div className="space-y-0.5">
                <p className="text-xs font-bold text-white">Microphone & Speech Check</p>
                <p className="text-[11px] text-white/60">Ready to simulate an interactive interview with AI audio.</p>
              </div>
              <Button
                size="lg"
                onClick={handleStartInterview}
                className="bg-[#d8f36b] hover:bg-[#c8e95a] text-[#102b2b] font-black rounded-sm gap-2 h-11 px-6 shadow-md"
              >
                <Mic className="w-4 h-4" />
                Start Voice Interview
              </Button>
            </div>
          ) : stage === "wrapping-up" ? (
            <div className="flex items-center justify-center w-full py-2 gap-2 text-sm font-bold text-[#d8f36b]">
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Wrapping up session & generating voice analysis...</span>
            </div>
          ) : (
            <>
              {/* Left Action Controls */}
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRepeatQuestion}
                  disabled={isSpeaking}
                  className="rounded-sm border-white/20 bg-white/5 text-white hover:bg-white/10 text-xs font-bold gap-1.5 h-9"
                  title="Re-listen to the question"
                >
                  <Volume2 className="w-3.5 h-3.5 text-[#d8f36b]" />
                  Repeat Question
                </Button>

                {/* Voice selection quick dropdown */}
                {voices.length > 0 && (
                  <select
                    value={selectedVoice?.name || ""}
                    onChange={(e) => {
                      const v = voices.find((item) => item.name === e.target.value);
                      if (v) setSelectedVoice(v);
                    }}
                    className="h-9 px-2.5 rounded-sm bg-white/5 border border-white/20 text-xs font-medium text-white/80 focus:ring-1 focus:ring-[#d8f36b]"
                    title="Change AI Interviewer Voice"
                  >
                    {voices.slice(0, 8).map((v) => (
                      <option key={v.name} value={v.name} className="bg-[#102b2b] text-white text-xs">
                        {v.name.replace(/Google|Microsoft/g, "").trim().slice(0, 20)}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              {/* Primary Interaction Buttons */}
              <div className="flex items-center gap-3">
                {stage === "user-answering" && (
                  <Button
                    size="sm"
                    onClick={handleFinishPrimaryAnswer}
                    disabled={!transcript.trim()}
                    className="bg-[#0d8274] hover:bg-[#0b6e62] text-[#d8f36b] hover:text-white font-black rounded-sm gap-1.5 h-10 px-5 shadow-sm"
                  >
                    <span>Finish Answer</span>
                    <Sparkles className="w-3.5 h-3.5" />
                  </Button>
                )}

                {stage === "user-followup" && (
                  <Button
                    size="sm"
                    onClick={handleFinishFollowUpAnswer}
                    disabled={!transcript.trim()}
                    className="bg-[#d8f36b] hover:bg-[#c8e95a] text-[#102b2b] font-black rounded-sm gap-1.5 h-10 px-5 shadow-sm"
                  >
                    <span>Submit & Next Question</span>
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                )}

                {(stage === "ai-question" || stage === "ai-followup" || stage === "ai-intro") && (
                  <div className="flex items-center gap-2 text-xs font-bold text-white/60">
                    <Volume2 className="w-4 h-4 text-[#d8f36b] animate-pulse" />
                    <span>Listening to Interviewer...</span>
                  </div>
                )}

                <Button
                  variant="destructive"
                  size="sm"
                  onClick={handleCompleteInterview}
                  disabled={savingResults}
                  className="rounded-sm bg-rose-600/90 hover:bg-rose-700 text-xs font-bold gap-1.5 h-9"
                  title="Exit and compile session feedback"
                >
                  <PhoneOff className="w-3.5 h-3.5" />
                  End Interview
                </Button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
