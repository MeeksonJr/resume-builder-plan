"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Loader2, Target, TrendingUp, TrendingDown, AlertTriangle, CheckCircle2, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface JobMatchResult {
    overallScore: number;
    breakdown: {
        skillsMatch: { score: number; matched: string[]; missing: string[] };
        experienceMatch: { score: number; feedback: string };
        educationMatch: { score: number; feedback: string };
        keywordMatch: { score: number; found: string[]; missing: string[] };
    };
    recommendations: string[];
    strongPoints: string[];
    dealBreakers: string[];
}

interface JobMatchCardProps {
    resumeData: any;
    onApplyRecommendation?: (recommendation: string) => void;
}

export function JobMatchCard({ resumeData, onApplyRecommendation }: JobMatchCardProps) {
    const [jobPosting, setJobPosting] = useState("");
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<JobMatchResult | null>(null);
    const [error, setError] = useState<string | null>(null);

    const handleAnalyze = async () => {
        if (!jobPosting.trim() || jobPosting.length < 50) {
            setError("Please enter a job posting (at least 50 characters)");
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const response = await fetch("/api/ai/job-match", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ resumeData, jobPosting }),
            });

            if (!response.ok) {
                throw new Error("Failed to analyze match");
            }

            const data = await response.json();
            setResult(data);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const getScoreColor = (score: number) => {
        if (score >= 80) return "text-green-600";
        if (score >= 60) return "text-yellow-600";
        return "text-red-600";
    };

    const getScoreBg = (score: number) => {
        if (score >= 80) return "bg-green-100";
        if (score >= 60) return "bg-yellow-100";
        return "bg-red-100";
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5 text-blue-500" />
                    Job Match Score
                </CardTitle>
                <CardDescription>
                    Analyze how well your resume matches a job posting
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                {!result ? (
                    <>
                        <Textarea
                            placeholder="Paste the job description here..."
                            value={jobPosting}
                            onChange={(e) => setJobPosting(e.target.value)}
                            className="min-h-[150px]"
                        />
                        {error && <p className="text-sm text-red-500">{error}</p>}
                        <Button
                            onClick={handleAnalyze}
                            disabled={loading || jobPosting.length < 50}
                            className="w-full gap-2"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    Analyzing...
                                </>
                            ) : (
                                <>
                                    <Target className="h-4 w-4" />
                                    Calculate Match Score
                                </>
                            )}
                        </Button>
                    </>
                ) : (
                    <div className="space-y-6">
                        {/* Overall Score */}
                        <div className="text-center">
                            <div
                                className={cn(
                                    "inline-flex items-center justify-center w-24 h-24 rounded-full",
                                    getScoreBg(result.overallScore)
                                )}
                            >
                                <span className={cn("text-3xl font-bold", getScoreColor(result.overallScore))}>
                                    {result.overallScore}%
                                </span>
                            </div>
                            <p className="mt-2 text-sm text-muted-foreground">
                                {result.overallScore >= 80
                                    ? "Excellent match!"
                                    : result.overallScore >= 60
                                        ? "Good match with room for improvement"
                                        : "Needs significant improvements"}
                            </p>
                        </div>

                        {/* Breakdown */}
                        <div className="space-y-3">
                            <h4 className="font-medium text-sm">Score Breakdown</h4>

                            {/* Skills */}
                            <div className="space-y-1">
                                <div className="flex justify-between text-sm">
                                    <span>Skills Match</span>
                                    <span className={getScoreColor(result.breakdown.skillsMatch.score)}>
                                        {result.breakdown.skillsMatch.score}%
                                    </span>
                                </div>
                                <Progress value={result.breakdown.skillsMatch.score} className="h-2" />
                                <div className="flex flex-wrap gap-1 mt-1">
                                    {result.breakdown.skillsMatch.matched.slice(0, 5).map((skill, i) => (
                                        <Badge key={i} variant="secondary" className="text-xs bg-green-100 text-green-800">
                                            ✓ {skill}
                                        </Badge>
                                    ))}
                                    {result.breakdown.skillsMatch.missing.slice(0, 3).map((skill, i) => (
                                        <Badge key={i} variant="outline" className="text-xs text-red-600 border-red-300">
                                            ✗ {skill}
                                        </Badge>
                                    ))}
                                </div>
                            </div>

                            {/* Experience */}
                            <div className="space-y-1">
                                <div className="flex justify-between text-sm">
                                    <span>Experience Match</span>
                                    <span className={getScoreColor(result.breakdown.experienceMatch.score)}>
                                        {result.breakdown.experienceMatch.score}%
                                    </span>
                                </div>
                                <Progress value={result.breakdown.experienceMatch.score} className="h-2" />
                                <p className="text-xs text-muted-foreground">{result.breakdown.experienceMatch.feedback}</p>
                            </div>

                            {/* Education */}
                            <div className="space-y-1">
                                <div className="flex justify-between text-sm">
                                    <span>Education Match</span>
                                    <span className={getScoreColor(result.breakdown.educationMatch.score)}>
                                        {result.breakdown.educationMatch.score}%
                                    </span>
                                </div>
                                <Progress value={result.breakdown.educationMatch.score} className="h-2" />
                                <p className="text-xs text-muted-foreground">{result.breakdown.educationMatch.feedback}</p>
                            </div>

                            {/* Keywords */}
                            <div className="space-y-1">
                                <div className="flex justify-between text-sm">
                                    <span>Keyword Match</span>
                                    <span className={getScoreColor(result.breakdown.keywordMatch.score)}>
                                        {result.breakdown.keywordMatch.score}%
                                    </span>
                                </div>
                                <Progress value={result.breakdown.keywordMatch.score} className="h-2" />
                            </div>
                        </div>

                        {/* Strong Points */}
                        {result.strongPoints.length > 0 && (
                            <div>
                                <h4 className="font-medium text-sm flex items-center gap-2 mb-2">
                                    <TrendingUp className="h-4 w-4 text-green-500" />
                                    Strong Points
                                </h4>
                                <ul className="space-y-1">
                                    {result.strongPoints.map((point, i) => (
                                        <li key={i} className="text-sm flex items-start gap-2">
                                            <CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0 mt-0.5" />
                                            {point}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {/* Deal Breakers */}
                        {result.dealBreakers.length > 0 && (
                            <div>
                                <h4 className="font-medium text-sm flex items-center gap-2 mb-2">
                                    <AlertTriangle className="h-4 w-4 text-red-500" />
                                    Potential Deal Breakers
                                </h4>
                                <ul className="space-y-1">
                                    {result.dealBreakers.map((item, i) => (
                                        <li key={i} className="text-sm flex items-start gap-2">
                                            <XCircle className="h-4 w-4 text-red-500 flex-shrink-0 mt-0.5" />
                                            {item}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {/* Recommendations */}
                        {result.recommendations.length > 0 && (
                            <div>
                                <h4 className="font-medium text-sm flex items-center gap-2 mb-2">
                                    <TrendingDown className="h-4 w-4 text-blue-500" />
                                    Recommendations
                                </h4>
                                <ul className="space-y-2">
                                    {result.recommendations.map((rec, i) => (
                                        <li key={i} className="text-sm bg-blue-50 p-2 rounded-md">
                                            {rec}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        <Button
                            variant="outline"
                            onClick={() => setResult(null)}
                            className="w-full"
                        >
                            Analyze Another Job
                        </Button>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
