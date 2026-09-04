"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import {
  CheckCircle2,
  Loader2,
  RotateCw,
  TrendingUp,
  Activity,
  Gauge,
  Sparkles,
  Award,
  Volume2,
  Printer,
  ArrowRight,
  Target,
  Clock,
  ShieldCheck,
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface VoiceInterviewResultsProps {
  session: any;
}

export function VoiceInterviewResults({ session }: VoiceInterviewResultsProps) {
  const transcript = Array.isArray(session.transcript) ? session.transcript : [];
  const [analysis, setAnalysis] = useState<any>(session.voice_analysis);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(!session.voice_analysis && transcript.length > 0);

  useEffect(() => {
    if (!analysis && transcript.length > 0) {
      fetchAnalysis();
    }
  }, [session.id]);

  const fetchAnalysis = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch("/api/interview/analysis", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId: session.id }),
      });

      if (!res.ok) throw new Error("Analysis generation failed");
      const data = await res.json();
      setAnalysis(data);
    } catch (e: any) {
      setError(e.message || "Failed to generate analysis. Please try refreshing.");
    } finally {
      setLoading(false);
    }
  };

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center p-12 space-y-4 rounded-md border border-rose-200 bg-rose-50/50">
        <p className="font-semibold text-rose-800 text-sm">{error}</p>
        <Button
          onClick={fetchAnalysis}
          variant="outline"
          className="rounded-sm border-rose-300 text-rose-800 hover:bg-rose-100 text-xs font-bold gap-2"
        >
          <RotateCw className="w-3.5 h-3.5" />
          Retry Speech Analysis
        </Button>
      </div>
    );
  }

  if (loading || !analysis) {
    if (transcript.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center space-y-4 border border-dashed border-[#102b2b]/20 bg-[#f7faf5] p-12 rounded-md">
          <Volume2 className="w-10 h-10 text-[#0d8274]/50" />
          <p className="text-xs font-semibold text-[#102b2b]/70">No audio transcript recorded for this session.</p>
          <Button asChild className="rounded-sm bg-[#102b2b] text-[#d8f36b] hover:bg-[#0d8274] hover:text-white font-bold text-xs">
            <Link href="/dashboard/interview-prep">Back to Interview Prep</Link>
          </Button>
        </div>
      );
    }

    return (
      <div className="flex flex-col items-center justify-center min-h-[45vh] space-y-4 rounded-md border border-[#b8c8b9] bg-[#f7faf5] p-8 text-center">
        <Loader2 className="h-10 w-10 animate-spin text-[#0d8274]" />
        <h2 className="text-xl font-black text-[#102b2b]">Synthesizing Verbal Performance Report...</h2>
        <p className="max-w-md text-xs text-[#102b2b]/70">
          Analyzing pacing metrics, filler-word frequency, STAR method structure, and technical depth.
        </p>
      </div>
    );
  }

  // Normalize scores (handle both 0-10 and 0-100 schemas)
  const normalizedOverall =
    analysis.overallScore <= 10 ? Math.round(analysis.overallScore * 10) : analysis.overallScore;
  const pacingWpm = analysis.pacingAssessment?.wpm || 135;
  const pacingRating = analysis.pacingAssessment?.rating || "optimal";
  const fillerCount = analysis.fillerWordAssessment?.totalCount ?? 0;
  const fillerDensity = analysis.fillerWordAssessment?.densityPer100Words ?? 1.5;
  const starScore = analysis.starTechniqueScore ?? 80;

  return (
    <div className="space-y-6">
      {/* 4-KPI Metric Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
        {/* Overall Verbal Score */}
        <Card className="border-[#b8c8b9] bg-white rounded-md shadow-xs">
          <CardContent className="p-4 space-y-1">
            <div className="flex items-center justify-between text-xs font-bold text-[#0d8274] uppercase">
              <span>Overall Score</span>
              <Award className="w-4 h-4 text-[#0d8274]" />
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-3xl font-black font-mono text-[#102b2b]">{normalizedOverall}</span>
              <span className="text-xs font-bold text-[#102b2b]/60">/ 100</span>
            </div>
            <Badge
              className={cn(
                "text-[10px] font-bold px-2 py-0.5 rounded-sm border-none",
                normalizedOverall >= 85
                  ? "bg-[#d8f36b] text-[#102b2b]"
                  : normalizedOverall >= 70
                  ? "bg-emerald-100 text-emerald-900"
                  : "bg-amber-100 text-amber-900"
              )}
            >
              {normalizedOverall >= 85 ? "Strong Hire Ready" : normalizedOverall >= 70 ? "Competitive" : "Developing"}
            </Badge>
          </CardContent>
        </Card>

        {/* Cadence / WPM */}
        <Card className="border-[#b8c8b9] bg-white rounded-md shadow-xs">
          <CardContent className="p-4 space-y-1">
            <div className="flex items-center justify-between text-xs font-bold text-[#0d8274] uppercase">
              <span>Pacing & Speed</span>
              <Gauge className="w-4 h-4 text-[#0d8274]" />
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-3xl font-black font-mono text-[#102b2b]">{pacingWpm}</span>
              <span className="text-xs font-bold text-[#102b2b]/60">WPM</span>
            </div>
            <Badge
              className={cn(
                "text-[10px] font-bold px-2 py-0.5 rounded-sm border-none uppercase",
                pacingRating === "optimal"
                  ? "bg-emerald-100 text-emerald-900"
                  : pacingRating === "slow"
                  ? "bg-amber-100 text-amber-900"
                  : "bg-rose-100 text-rose-900"
              )}
            >
              {pacingRating === "optimal" ? "Ideal (110-160)" : pacingRating === "slow" ? "Deliberate" : "Rushing"}
            </Badge>
          </CardContent>
        </Card>

        {/* Filler Word Radar */}
        <Card className="border-[#b8c8b9] bg-white rounded-md shadow-xs">
          <CardContent className="p-4 space-y-1">
            <div className="flex items-center justify-between text-xs font-bold text-[#0d8274] uppercase">
              <span>Filler Words</span>
              <Sparkles className="w-4 h-4 text-amber-500" />
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-3xl font-black font-mono text-[#102b2b]">{fillerCount}</span>
              <span className="text-xs font-bold text-[#102b2b]/60">({fillerDensity}% density)</span>
            </div>
            <Badge
              className={cn(
                "text-[10px] font-bold px-2 py-0.5 rounded-sm border-none",
                fillerCount <= 3 ? "bg-emerald-100 text-emerald-900" : "bg-amber-100 text-amber-900"
              )}
            >
              {fillerCount <= 3 ? "Clean Delivery" : "Attention Needed"}
            </Badge>
          </CardContent>
        </Card>

        {/* STAR Completeness */}
        <Card className="border-[#b8c8b9] bg-white rounded-md shadow-xs">
          <CardContent className="p-4 space-y-1">
            <div className="flex items-center justify-between text-xs font-bold text-[#0d8274] uppercase">
              <span>STAR Alignment</span>
              <Target className="w-4 h-4 text-[#0d8274]" />
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-3xl font-black font-mono text-[#102b2b]">{starScore}</span>
              <span className="text-xs font-bold text-[#102b2b]/60">/ 100</span>
            </div>
            <Badge className="text-[10px] font-bold px-2 py-0.5 rounded-sm bg-[#e9eee8] text-[#102b2b] border-none">
              Structured
            </Badge>
          </CardContent>
        </Card>
      </div>

      {/* Executive Summary */}
      <Card className="border-[#b8c8b9] bg-white rounded-md shadow-xs">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-black text-[#102b2b] flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-[#0d8274]" />
            Executive Performance Summary
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-xs sm:text-sm text-[#102b2b]/85 leading-relaxed font-sans">
            {analysis.summary}
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-[#b8c8b9]/50 text-xs">
            <div className="p-3 rounded-sm bg-[#f7faf5] border border-[#b8c8b9]/60">
              <span className="font-bold text-[#0d8274] uppercase text-[10px] block mb-1">Pacing Coaching</span>
              <p className="text-[#102b2b]/80 text-xs">{analysis.pacingAssessment?.feedback || "Speech speed was balanced."}</p>
            </div>
            <div className="p-3 rounded-sm bg-[#f7faf5] border border-[#b8c8b9]/60">
              <span className="font-bold text-[#0d8274] uppercase text-[10px] block mb-1">Verbal Precision</span>
              <p className="text-[#102b2b]/80 text-xs">{analysis.fillerWordAssessment?.feedback || "Good control over filler words."}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Strengths & Improvement Areas */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Strengths */}
        <Card className="border-[#b8c8b9] bg-white rounded-md shadow-xs">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-black text-[#102b2b] flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              Verbal & Technical Strengths
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-xs text-[#102b2b]/85">
              {(analysis.strengths || []).map((s: string, i: number) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-600 mt-1.5 shrink-0" />
                  <span>{s}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        {/* Growth Areas & Drills */}
        <Card className="border-[#b8c8b9] bg-white rounded-md shadow-xs">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-black text-[#102b2b] flex items-center gap-1.5">
              <TrendingUp className="w-4 h-4 text-[#0d8274]" />
              Targeted Drills & Recommendations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-xs text-[#102b2b]/85">
              {(analysis.recommendations || analysis.weaknesses || []).map((w: string, i: number) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#0d8274] mt-1.5 shrink-0" />
                  <span>{w}</span>
                </li>
              ))}
            </ul>
            {analysis.actionableDrills && analysis.actionableDrills.length > 0 && (
              <div className="mt-3 pt-3 border-t border-[#b8c8b9]/40 space-y-1.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#0d8274] block">Recommended Practice Drill</span>
                {analysis.actionableDrills.map((drill: string, idx: number) => (
                  <p key={idx} className="text-xs text-[#102b2b]/80 bg-[#f7faf5] p-2 rounded-sm border border-[#b8c8b9]/40 italic">
                    &bull; {drill}
                  </p>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Full Transcript Viewer */}
      <Card className="border-[#b8c8b9] bg-white rounded-md shadow-xs">
        <CardHeader className="pb-3 flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-sm font-black text-[#102b2b]">Session Transcript & Follow-Up Log</CardTitle>
            <CardDescription className="text-xs text-[#102b2b]/60">
              Complete spoken dialogue with question turns and verbal follow-ups.
            </CardDescription>
          </div>
          <Badge variant="outline" className="border-[#b8c8b9] text-[10px] text-[#102b2b] font-bold">
            {transcript.length} Messages
          </Badge>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-80 w-full rounded-md border border-[#b8c8b9]/60 p-4 bg-[#f7faf5]">
            <div className="space-y-3">
              {transcript.map((msg: any, i: number) => {
                const isAi = msg.role === "ai";
                return (
                  <div key={i} className={`flex flex-col ${isAi ? "items-start" : "items-end"}`}>
                    <div
                      className={cn(
                        "rounded-sm px-3.5 py-2.5 max-w-[85%] text-xs leading-relaxed",
                        isAi
                          ? "bg-[#102b2b] text-[#e9eee8] border border-[#102b2b]"
                          : "bg-white text-[#102b2b] border border-[#b8c8b9] shadow-2xs"
                      )}
                    >
                      <div className="flex items-center gap-1.5 mb-1 font-bold text-[10px]">
                        {isAi ? (
                          <span className="text-[#d8f36b]">INTERVIEWER</span>
                        ) : (
                          <span className="text-[#0d8274]">YOU (CANDIDATE)</span>
                        )}
                      </div>
                      <p className="whitespace-pre-line">{msg.text}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Action Navigation Footer */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
        <Button
          variant="outline"
          onClick={() => window.print()}
          className="w-full sm:w-auto rounded-sm border-[#b8c8b9] text-xs font-bold gap-1.5 h-10 px-4"
        >
          <Printer className="w-3.5 h-3.5 text-[#0d8274]" />
          Print Performance Report
        </Button>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Button
            asChild
            variant="outline"
            className="flex-1 sm:flex-initial rounded-sm border-[#b8c8b9] text-xs font-bold h-10 px-4"
          >
            <Link href="/dashboard/tracker">View Job Tracker</Link>
          </Button>

          <Button
            asChild
            className="flex-1 sm:flex-initial rounded-sm bg-[#102b2b] hover:bg-[#0d8274] text-[#d8f36b] hover:text-white text-xs font-bold gap-1.5 h-10 px-5 shadow-xs"
          >
            <Link href="/dashboard/interview-prep">
              Practice Another Session
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
