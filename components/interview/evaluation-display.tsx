"use client";

import { useState, useEffect } from "react";
import {
    CheckCircle2,
    XCircle,
    TrendingUp,
    Award,
    Loader2,
    AlertCircle,
} from "lucide-react";

interface Feedback {
    id: string;
    score: number;
    strengths: string[];
    weaknesses: string[];
    improvements: string[];
    overall_feedback: string;
}

interface EvaluationDisplayProps {
    answerId: string;
    autoEvaluate?: boolean;
}

export function EvaluationDisplay({
    answerId,
    autoEvaluate = true,
}: EvaluationDisplayProps) {
    const [feedback, setFeedback] = useState<Feedback | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchEvaluation = async () => {
        setIsLoading(true);
        setError(null);

        try {
            const response = await fetch(
                `/api/interview/answers/${answerId}/evaluate`,
                {
                    method: "POST",
                }
            );

            if (!response.ok) {
                throw new Error("Failed to evaluate answer");
            }

            const data = await response.json();
            setFeedback(data.feedback);
        } catch (err) {
            console.error("Error fetching evaluation:", err);
            setError("Failed to evaluate your answer. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (autoEvaluate && answerId) {
            fetchEvaluation();
        }
    }, [answerId, autoEvaluate]);

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center py-12 px-4 bg-gray-50 rounded-lg border border-gray-200">
                <Loader2 className="w-12 h-12 text-blue-600 animate-spin mb-4" />
                <p className="text-gray-600 font-medium">Evaluating your answer...</p>
                <p className="text-sm text-gray-500 mt-1">
                    This may take a few moments
                </p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center py-12 px-4 bg-red-50 rounded-lg border border-red-200">
                <AlertCircle className="w-12 h-12 text-red-600 mb-4" />
                <p className="text-red-700 font-medium">{error}</p>
                <button
                    onClick={fetchEvaluation}
                    className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                    Try Again
                </button>
            </div>
        );
    }

    if (!feedback) {
        return (
            <div className="flex flex-col items-center justify-center py-12 px-4 bg-gray-50 rounded-lg border border-gray-200">
                <Award className="w-12 h-12 text-gray-400 mb-4" />
                <p className="text-gray-600 font-medium">
                    Submit an answer to get feedback
                </p>
                <button
                    onClick={fetchEvaluation}
                    className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                    Evaluate Answer
                </button>
            </div>
        );
    }

    const getScoreColor = (score: number) => {
        if (score >= 8) return "text-green-600 bg-green-100 border-green-300";
        if (score >= 6) return "text-yellow-600 bg-yellow-100 border-yellow-300";
        return "text-red-600 bg-red-100 border-red-300";
    };

    const getScoreLabel = (score: number) => {
        if (score >= 9) return "Excellent";
        if (score >= 7) return "Good";
        if (score >= 5) return "Fair";
        return "Needs Improvement";
    };

    return (
        <div className="space-y-6">
            {/* Score Card */}
            <div
                className={`flex items-center justify-between p-6 rounded-lg border-2 ${getScoreColor(
                    feedback.score
                )}`}
            >
                <div>
                    <p className="text-sm font-medium opacity-80 mb-1">Your Score</p>
                    <p className="text-3xl font-bold">{feedback.score}/10</p>
                    <p className="text-sm font-medium mt-1">
                        {getScoreLabel(feedback.score)}
                    </p>
                </div>
                <Award className="w-16 h-16 opacity-50" />
            </div>

            {/* Overall Feedback */}
            <div className="p-6 bg-blue-50 rounded-lg border border-blue-200">
                <h3 className="text-lg font-semibold text-blue-900 mb-3">
                    Overall Feedback
                </h3>
                <p className="text-blue-800 leading-relaxed">{feedback.overall_feedback}</p>
            </div>

            {/* Strengths */}
            {feedback.strengths && feedback.strengths.length > 0 && (
                <div className="p-6 bg-green-50 rounded-lg border border-green-200">
                    <div className="flex items-center gap-2 mb-4">
                        <CheckCircle2 className="w-5 h-5 text-green-600" />
                        <h3 className="text-lg font-semibold text-green-900">Strengths</h3>
                    </div>
                    <ul className="space-y-2">
                        {feedback.strengths.map((strength, index) => (
                            <li key={index} className="flex items-start gap-2 text-green-800">
                                <span className="text-green-600 mt-1">•</span>
                                <span>{strength}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            {/* Weaknesses */}
            {feedback.weaknesses && feedback.weaknesses.length > 0 && (
                <div className="p-6 bg-orange-50 rounded-lg border border-orange-200">
                    <div className="flex items-center gap-2 mb-4">
                        <XCircle className="w-5 h-5 text-orange-600" />
                        <h3 className="text-lg font-semibold text-orange-900">
                            Areas for Improvement
                        </h3>
                    </div>
                    <ul className="space-y-2">
                        {feedback.weaknesses.map((weakness, index) => (
                            <li key={index} className="flex items-start gap-2 text-orange-800">
                                <span className="text-orange-600 mt-1">•</span>
                                <span>{weakness}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            {/* Improvements */}
            {feedback.improvements && feedback.improvements.length > 0 && (
                <div className="p-6 bg-purple-50 rounded-lg border border-purple-200">
                    <div className="flex items-center gap-2 mb-4">
                        <TrendingUp className="w-5 h-5 text-purple-600" />
                        <h3 className="text-lg font-semibold text-purple-900">
                            Actionable Suggestions
                        </h3>
                    </div>
                    <ul className="space-y-3">
                        {feedback.improvements.map((improvement, index) => (
                            <li
                                key={index}
                                className="flex items-start gap-3 text-purple-800"
                            >
                                <span className="flex-shrink-0 w-6 h-6 bg-purple-200 rounded-full flex items-center justify-center text-purple-700 text-sm font-semibold">
                                    {index + 1}
                                </span>
                                <span>{improvement}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
}
