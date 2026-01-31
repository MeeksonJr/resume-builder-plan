"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
    CheckCircle2,
    XCircle,
    AlertCircle,
    TrendingUp,
    Lightbulb,
    RotateCcw,
    ChevronDown,
    ChevronUp,
} from "lucide-react";
import { useState } from "react";

interface AnswerFeedbackProps {
    feedback: {
        overallScore: number;
        scores: {
            clarity: number;
            relevance: number;
            depth: number;
            starCompleteness: number;
        };
        strengths: string[];
        improvements: string[];
        starAnalysis: {
            situation: "present" | "missing" | "unclear" | "n/a";
            task: "present" | "missing" | "unclear" | "n/a";
            action: "present" | "missing" | "unclear" | "n/a";
            result: "present" | "missing" | "unclear" | "n/a";
        };
        suggestedAnswer: string;
    };
    answer: string;
    onTryAgain: () => void;
}

export function AnswerFeedback({ feedback, answer, onTryAgain }: AnswerFeedbackProps) {
    const [showSuggested, setShowSuggested] = useState(false);

    const getScoreColor = (score: number) => {
        if (score >= 80) return "text-green-600 dark:text-green-400";
        if (score >= 60) return "text-yellow-600 dark:text-yellow-400";
        return "text-red-600 dark:text-red-400";
    };

    const getScoreBgColor = (score: number) => {
        if (score >= 80) return "bg-green-100 dark:bg-green-900";
        if (score >= 60) return "bg-yellow-100 dark:bg-yellow-900";
        return "bg-red-100 dark:bg-red-900";
    };

    const getSTARIcon = (status: string) => {
        switch (status) {
            case "present":
                return <CheckCircle2 className="h-4 w-4 text-green-600" />;
            case "unclear":
                return <AlertCircle className="h-4 w-4 text-yellow-600" />;
            case "missing":
                return <XCircle className="h-4 w-4 text-red-600" />;
            default:
                return <div className="h-4 w-4 rounded-full bg-gray-300" />;
        }
    };

    const getSTARBadge = (status: string) => {
        switch (status) {
            case "present":
                return <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">Complete</Badge>;
            case "unclear":
                return <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300">Unclear</Badge>;
            case "missing":
                return <Badge className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300">Missing</Badge>;
            default:
                return <Badge variant="outline">N/A</Badge>;
        }
    };

    return (
        <div className="space-y-6">
            {/* Overall Score */}
            <div className={`rounded-lg p-6 text-center ${getScoreBgColor(feedback.overallScore)}`}>
                <div className={`text-5xl font-bold mb-2 ${getScoreColor(feedback.overallScore)}`}>
                    {Math.round(feedback.overallScore)}
                </div>
                <div className="text-sm font-medium text-muted-foreground">Overall Score</div>
            </div>

            {/* Score Breakdown */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg">Score Breakdown</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    {Object.entries(feedback.scores).map(([key, value]) => (
                        <div key={key} className="space-y-2">
                            <div className="flex items-center justify-between text-sm">
                                <span className="font-medium capitalize">
                                    {key.replace(/([A-Z])/g, " $1").trim()}
                                </span>
                                <span className={`font-bold ${getScoreColor(value)}`}>
                                    {Math.round(value)}
                                </span>
                            </div>
                            <Progress value={value} className="h-2" />
                        </div>
                    ))}
                </CardContent>
            </Card>

            {/* STAR Analysis */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg">STAR Framework Analysis</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-2 gap-4">
                        {Object.entries(feedback.starAnalysis).map(([key, status]) => (
                            <div key={key} className="flex items-center justify-between p-3 rounded-lg border">
                                <div className="flex items-center gap-2">
                                    {getSTARIcon(status)}
                                    <span className="font-medium capitalize">{key}</span>
                                </div>
                                {getSTARBadge(status)}
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* Strengths */}
            {feedback.strengths.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                            <TrendingUp className="h-5 w-5 text-green-600" />
                            Strengths
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ul className="space-y-2">
                            {feedback.strengths.map((strength, index) => (
                                <li key={index} className="flex items-start gap-2">
                                    <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                                    <span className="text-sm">{strength}</span>
                                </li>
                            ))}
                        </ul>
                    </CardContent>
                </Card>
            )}

            {/* Improvements */}
            {feedback.improvements.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                            <Lightbulb className="h-5 w-5 text-yellow-600" />
                            Areas to Improve
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ul className="space-y-2">
                            {feedback.improvements.map((improvement, index) => (
                                <li key={index} className="flex items-start gap-2">
                                    <AlertCircle className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                                    <span className="text-sm">{improvement}</span>
                                </li>
                            ))}
                        </ul>
                    </CardContent>
                </Card>
            )}

            {/* Suggested Answer */}
            {feedback.suggestedAnswer && (
                <Card>
                    <CardHeader>
                        <button
                            onClick={() => setShowSuggested(!showSuggested)}
                            className="w-full flex items-center justify-between hover:opacity-80 transition-opacity"
                        >
                            <CardTitle className="text-lg">Example Answer</CardTitle>
                            {showSuggested ? (
                                <ChevronUp className="h-5 w-5" />
                            ) : (
                                <ChevronDown className="h-5 w-5" />
                            )}
                        </button>
                    </CardHeader>
                    {showSuggested && (
                        <CardContent>
                            <div className="p-4 bg-muted rounded-lg text-sm leading-relaxed">
                                {feedback.suggestedAnswer}
                            </div>
                        </CardContent>
                    )}
                </Card>
            )}

            {/* Actions */}
            <div className="flex gap-2">
                <Button onClick={onTryAgain} variant="outline" className="gap-2">
                    <RotateCcw className="h-4 w-4" />
                    Try Again
                </Button>
            </div>
        </div>
    );
}
