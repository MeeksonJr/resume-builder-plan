"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Loader2, RotateCw } from "lucide-react";
import Link from "next/link";

interface VoiceInterviewResultsProps {
    session: any;
}

export function VoiceInterviewResults({ session }: VoiceInterviewResultsProps) {
    const transcript = session.transcript || [];
    const [analysis, setAnalysis] = useState<any>(session.voice_analysis);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!analysis && transcript.length > 0) {
            fetchAnalysis();
        }
    }, [session.id]);

    const fetchAnalysis = async () => {
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 60000); // 60s timeout

            const res = await fetch("/api/interview/analysis", {
                method: "POST",
                body: JSON.stringify({ sessionId: session.id }),
                signal: controller.signal,
            });
            clearTimeout(timeoutId);

            if (!res.ok) throw new Error("Analysis failed");
            const data = await res.json();
            setAnalysis(data);
        } catch (e: any) {
            if (e.name === 'AbortError') {
                setError("Analysis timed out. The session might be too long.");
            } else {
                setError("Failed to generate analysis. Please try refreshing.");
            }
        }
    };

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center h-64 space-y-4">
                <p className="text-red-500 font-medium">{error}</p>
                <Button onClick={() => { setError(null); fetchAnalysis(); }} variant="outline">
                    <RotateCw className="w-4 h-4 mr-2" />
                    Retry Analysis
                </Button>
            </div>
        );
    }

    if (!analysis) {
        if (transcript.length === 0) {
            return (
                <div className="flex flex-col items-center justify-center p-12 space-y-4 border rounded-lg bg-muted/50">
                    <p className="text-muted-foreground">No audio transcript was recorded for this session.</p>
                    <Button asChild variant="secondary">
                        <Link href="/dashboard/interview-prep">Back to Dashboard</Link>
                    </Button>
                </div>
            );
        }

        return (
            <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4">
                <Loader2 className="h-12 w-12 animate-spin text-blue-500" />
                <h2 className="text-xl font-semibold">Analyzing Interview Session...</h2>
                <p className="text-muted-foreground text-center max-w-md">
                    We are processing the transcript and audio patterns to generate detailed feedback. This may take a moment.
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                    <CardHeader>
                        <CardTitle>Overall Score</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-4xl font-bold text-blue-600">{analysis.overallScore}/10</div>
                    </CardContent>
                </Card>
                <Card className="col-span-2">
                    <CardHeader>
                        <CardTitle>Executive Summary</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-muted-foreground">{analysis.summary}</p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Strengths</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ul className="space-y-2">
                            {(analysis.strengths || []).map((s: string, i: number) => (
                                <li key={i} className="flex items-start gap-2">
                                    <Badge className="bg-green-100 text-green-800 hover:bg-green-100 border-none shrink-0">
                                        ✓
                                    </Badge>
                                    <span>{s}</span>
                                </li>
                            ))}
                        </ul>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Areas for Improvement</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ul className="space-y-2">
                            {(analysis.weaknesses || []).map((w: string, i: number) => (
                                <li key={i} className="flex items-start gap-2">
                                    <Badge className="bg-red-100 text-red-800 hover:bg-red-100 border-none shrink-0">
                                        !
                                    </Badge>
                                    <span>{w}</span>
                                </li>
                            ))}
                        </ul>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Transcript</CardTitle>
                </CardHeader>
                <CardContent>
                    <ScrollArea className="h-[400px] w-full rounded-md border p-4">
                        <div className="space-y-4">
                            {transcript.map((msg: any, i: number) => (
                                <div key={i} className={`flex flex-col ${msg.role === 'ai' ? 'items-start' : 'items-end'}`}>
                                    <div className={`
                                        rounded-lg px-4 py-2 max-w-[80%]
                                        ${msg.role === 'ai'
                                            ? 'bg-muted text-foreground'
                                            : 'bg-blue-600 text-white'}
                                    `}>
                                        <p className="text-sm">{msg.text}</p>
                                    </div>
                                    <span className="text-xs text-muted-foreground mt-1">
                                        {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </ScrollArea>
                </CardContent>
            </Card>
        </div>
    );
}
