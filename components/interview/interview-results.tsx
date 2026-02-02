"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";
import {
    Radar,
    RadarChart,
    PolarGrid,
    PolarAngleAxis,
    PolarRadiusAxis,
    ResponsiveContainer,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    Cell,
} from "recharts";
import {
    CheckCircle2,
    XCircle,
    TrendingUp,
    Award,
    ArrowRight,
    Clock,
    Target,
    Brain,
} from "lucide-react";
import { format } from "date-fns";

interface ScoredAnswer {
    id: string;
    question_id: string;
    question_text: string;
    question_type: string;
    answer_text: string;
    feedback: {
        score: number;
        scores?: {
            situation: number;
            task: number;
            action: number;
            result: number;
        };
        strengths: string[];
        weaknesses: string[];
        improvements: string[];
        overall_feedback: string;
        star_breakdown?: {
            situation: string;
            task: string;
            action: string;
            result: string;
        };
    };
    created_at: string;
}

interface InterviewResultsProps {
    session: any;
    answers: ScoredAnswer[];
}

export function InterviewResults({ session, answers }: InterviewResultsProps) {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState("overview");

    // Calculate aggregate stats
    const totalScore = answers.reduce((sum, a) => sum + (a.feedback?.score || 0), 0);
    const averageScore = answers.length > 0 ? Math.round((totalScore / answers.length) * 10) / 10 : 0;

    // Calculate STAR averages
    const starTotals = answers.reduce(
        (acc, a) => {
            acc.situation += a.feedback?.scores?.situation || 0;
            acc.task += a.feedback?.scores?.task || 0;
            acc.action += a.feedback?.scores?.action || 0;
            acc.result += a.feedback?.scores?.result || 0;
            return acc;
        },
        { situation: 0, task: 0, action: 0, result: 0 }
    );

    const starData = [
        { subject: "Situation", A: Math.round(starTotals.situation / answers.length || 0), fullMark: 100 },
        { subject: "Task", A: Math.round(starTotals.task / answers.length || 0), fullMark: 100 },
        { subject: "Action", A: Math.round(starTotals.action / answers.length || 0), fullMark: 100 },
        { subject: "Result", A: Math.round(starTotals.result / answers.length || 0), fullMark: 100 },
    ];

    // Distribution Data (Score counts)
    const scoreDistribution = [
        { range: "Excellent (9-10)", count: answers.filter(a => (a.feedback?.score || 0) >= 9).length, color: "#16a34a" },
        { range: "Good (7-8)", count: answers.filter(a => (a.feedback?.score || 0) >= 7 && (a.feedback?.score || 0) < 9).length, color: "#ca8a04" },
        { range: "Fair (5-6)", count: answers.filter(a => (a.feedback?.score || 0) >= 5 && (a.feedback?.score || 0) < 7).length, color: "#eab308" },
        { range: "Needs Work (<5)", count: answers.filter(a => (a.feedback?.score || 0) < 5).length, color: "#dc2626" },
    ];

    // Aggregate Top Strengths & Weaknesses (simple frequency or just list top unique ones)
    // For simplicity, we'll take top 5 unique strengths from high-performing answers
    const allStrengths = Array.from(new Set(answers.flatMap(a => a.feedback?.strengths || []))).slice(0, 5);
    const allImprovements = Array.from(new Set(answers.flatMap(a => a.feedback?.improvements || []))).slice(0, 5);

    const [suggestedAnswers, setSuggestedAnswers] = useState<Record<string, string>>({});
    const [loadingSuggestion, setLoadingSuggestion] = useState<string | null>(null);

    const generateSuggestion = async (answerId: string, question: string, type: string) => {
        setLoadingSuggestion(answerId);
        try {
            const response = await fetch("/api/ai/interview-suggest", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    question,
                    questionType: type,
                    targetRole: session.target_role,
                }),
            });

            if (!response.ok) throw new Error("Failed to generate");

            const data = await response.json();
            setSuggestedAnswers(prev => ({ ...prev, [answerId]: data.suggestedAnswer }));
        } catch (error) {
            console.error("Error generating suggestion:", error);
        } finally {
            setLoadingSuggestion(null);
        }
    };

    const getScoreColor = (score: number) => {
        if (score >= 8) return "text-green-600";
        if (score >= 6) return "text-yellow-600";
        return "text-red-600";
    };

    const getScoreBadgeVariant = (score: number) => {
        if (score >= 8) return "default"; // green-ish usually or primary
        if (score >= 6) return "secondary"; // yellow-ish
        return "destructive";
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Session Results</h1>
                    <div className="flex items-center gap-2 text-muted-foreground mt-1">
                        <Badge variant="outline">{session.target_role}</Badge>
                        <span>•</span>
                        <span className="capitalize">{session.difficulty} Level</span>
                        <span>•</span>
                        <span>{format(new Date(session.created_at), "MMMM d, yyyy")}</span>
                    </div>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={() => router.push("/dashboard/interview-prep")}>
                        Back to Dashboard
                    </Button>
                    <Button onClick={() => router.push("/dashboard/interview-prep/new")}>
                        Practice Again
                    </Button>
                </div>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                <TabsList className="grid w-full md:w-[400px] grid-cols-2">
                    <TabsTrigger value="overview">Overview & Analytics</TabsTrigger>
                    <TabsTrigger value="details">Detailed Breakdown</TabsTrigger>
                </TabsList>

                {/* OVERVIEW TAB */}
                <TabsContent value="overview" className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* Overall Score Card */}
                        <Card className="col-span-1 md:col-span-3 lg:col-span-1">
                            <CardHeader>
                                <CardTitle>Overall Performance</CardTitle>
                                <CardDescription>Average score across {answers.length} questions</CardDescription>
                            </CardHeader>
                            <CardContent className="flex flex-col items-center justify-center pt-4 pb-8">
                                <div className="relative flex items-center justify-center w-40 h-40">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <RadarChart cx="50%" cy="50%" outerRadius="80%" data={starData}>
                                            <PolarGrid strokeOpacity={0.2} />
                                            <PolarAngleAxis dataKey="subject" tick={{ fontSize: 10 }} />
                                            <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                                            <Radar
                                                name="Average"
                                                dataKey="A"
                                                stroke="hsl(var(--primary))"
                                                fill="hsl(var(--primary))"
                                                fillOpacity={0.3}
                                            />
                                        </RadarChart>
                                    </ResponsiveContainer>
                                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                        <div className="text-center bg-background/80 backdrop-blur-sm p-2 rounded-full shadow-sm border">
                                            <span className={`text-4xl font-bold ${getScoreColor(averageScore)}`}>
                                                {averageScore}
                                            </span>
                                            <span className="text-xs text-muted-foreground block">/ 10</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="w-full mt-6 space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-muted-foreground">Highest Score</span>
                                        <span className="font-medium">{Math.max(...answers.map(a => a.feedback?.score || 0))} / 10</span>
                                    </div>
                                    <Separator />
                                    <div className="flex justify-between text-sm">
                                        <span className="text-muted-foreground">Completion</span>
                                        <span className="font-medium">{answers.length} / {session.question_count} Questions</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Key Strengths & Improvements */}
                        <Card className="col-span-1 md:col-span-2 lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-0 divide-y md:divide-y-0 md:divide-x">
                            <div className="p-6">
                                <div className="flex items-center gap-2 mb-4">
                                    <CheckCircle2 className="w-5 h-5 text-green-600" />
                                    <h3 className="font-semibold text-lg">Key Strengths</h3>
                                </div>
                                {allStrengths.length > 0 ? (
                                    <ul className="space-y-3">
                                        {allStrengths.map((s, i) => (
                                            <li key={i} className="flex gap-2 text-sm text-muted-foreground">
                                                <span className="text-green-600">•</span>
                                                {s}
                                            </li>
                                        ))}
                                    </ul>
                                ) : (
                                    <p className="text-sm text-muted-foreground italic">Keep practicing to identify key strengths.</p>
                                )}
                            </div>
                            <div className="p-6">
                                <div className="flex items-center gap-2 mb-4">
                                    <TrendingUp className="w-5 h-5 text-purple-600" />
                                    <h3 className="font-semibold text-lg">Focus Areas</h3>
                                </div>
                                {allImprovements.length > 0 ? (
                                    <ul className="space-y-3">
                                        {allImprovements.map((imp, i) => (
                                            <li key={i} className="flex gap-2 text-sm text-muted-foreground">
                                                <span className="text-purple-600">•</span>
                                                {imp}
                                            </li>
                                        ))}
                                    </ul>
                                ) : (
                                    <p className="text-sm text-muted-foreground italic">Great job! No major improvements needed.</p>
                                )}
                            </div>
                        </Card>

                        {/* Score Distribution Chart */}
                        <Card className="col-span-1 md:col-span-3">
                            <CardHeader>
                                <CardTitle>Score Distribution</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="h-[200px] w-full">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={scoreDistribution} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                                            <XAxis type="number" hide />
                                            <YAxis dataKey="range" type="category" width={120} tick={{ fontSize: 12 }} />
                                            <Tooltip
                                                cursor={{ fill: 'transparent' }}
                                                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                                            />
                                            <Bar dataKey="count" radius={[0, 4, 4, 0]} barSize={32}>
                                                {scoreDistribution.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                                ))}
                                            </Bar>
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                {/* DETAILS TAB */}
                <TabsContent value="details" className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Question Breakdown</CardTitle>
                            <CardDescription>Detailed review of each answer and AI feedback</CardDescription>
                        </CardHeader>
                        <CardContent className="p-0">
                            <Accordion type="single" collapsible className="w-full">
                                {answers.map((answer, index) => (
                                    <AccordionItem key={answer.id} value={answer.id} className="px-6">
                                        <AccordionTrigger className="hover:no-underline py-4">
                                            <div className="flex items-center justify-between w-full pr-4 text-left">
                                                <div className="flex flex-col gap-1">
                                                    <span className="font-medium text-base line-clamp-1">{index + 1}. {answer.question_text}</span>
                                                    <div className="flex gap-2 text-xs text-muted-foreground">
                                                        <Badge variant="outline" className="text-[10px] h-5">{answer.question_type}</Badge>
                                                        <span>•</span>
                                                        <span className="capitalize">Score: {answer.feedback?.score || 0}/10</span>
                                                    </div>
                                                </div>
                                                <Badge variant={getScoreBadgeVariant(answer.feedback?.score || 0)}>
                                                    {answer.feedback?.score || 0}/10
                                                </Badge>
                                            </div>
                                        </AccordionTrigger>
                                        <AccordionContent className="pb-6">
                                            <div className="space-y-6 pt-2">

                                                {/* Answer Section */}
                                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                                    <div className="space-y-3">
                                                        <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Your Answer</h4>
                                                        <div className="p-4 bg-muted/40 rounded-lg border text-sm leading-relaxed">
                                                            {answer.answer_text}
                                                        </div>
                                                    </div>
                                                    <div className="space-y-3">
                                                        <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">AI Feedback</h4>
                                                        <div className="p-4 bg-primary/5 rounded-lg border border-primary/10 text-sm leading-relaxed text-foreground">
                                                            {answer.feedback?.overall_feedback || "No feedback available."}
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* STAR Analysis for Behavioral Questions */}
                                                {answer.feedback?.star_breakdown && (
                                                    <div className="bg-muted/20 p-4 rounded-lg border">
                                                        <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
                                                            <Target className="w-4 h-4" />
                                                            STAR Analysis
                                                        </h4>
                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                                            <div>
                                                                <span className="font-semibold text-primary block mb-1">Situation</span>
                                                                <p className="text-muted-foreground">{answer.feedback.star_breakdown.situation}</p>
                                                            </div>
                                                            <div>
                                                                <span className="font-semibold text-primary block mb-1">Task</span>
                                                                <p className="text-muted-foreground">{answer.feedback.star_breakdown.task}</p>
                                                            </div>
                                                            <div>
                                                                <span className="font-semibold text-primary block mb-1">Action</span>
                                                                <p className="text-muted-foreground">{answer.feedback?.star_breakdown?.action}</p>
                                                            </div>
                                                            <div>
                                                                <span className="font-semibold text-primary block mb-1">Result</span>
                                                                <p className="text-muted-foreground">{answer.feedback?.star_breakdown?.result}</p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}

                                                {/* Actionable Improvements */}
                                                {answer.feedback?.improvements && answer.feedback?.improvements.length > 0 && (
                                                    <div>
                                                        <h4 className="text-sm font-semibold mb-2 text-purple-700 dark:text-purple-400">Recommended Improvements</h4>
                                                        <ul className="list-disc list-inside space-y-1 text-sm text-foreground/80">
                                                            {answer.feedback?.improvements.map((imp, i) => (
                                                                <li key={i}>{imp}</li>
                                                            ))}
                                                        </ul>
                                                    </div>
                                                )}

                                                <Separator />

                                                {/* Suggested Answer Section */}
                                                <div>
                                                    <div className="flex items-center justify-between mb-3">
                                                        <h4 className="text-sm font-semibold flex items-center gap-2">
                                                            <Brain className="w-4 h-4 text-blue-500" />
                                                            Suggested Answer
                                                        </h4>
                                                        {!suggestedAnswers[answer.id] && (
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                onClick={() => generateSuggestion(answer.id, answer.question_text, answer.question_type)}
                                                                disabled={loadingSuggestion === answer.id}
                                                            >
                                                                {loadingSuggestion === answer.id ? (
                                                                    <>Generating...</>
                                                                ) : (
                                                                    <>Generate via AI</>
                                                                )}
                                                            </Button>
                                                        )}
                                                    </div>

                                                    {suggestedAnswers[answer.id] && (
                                                        <div className="p-4 bg-blue-50 dark:bg-blue-950/30 rounded-lg border border-blue-100 dark:border-blue-900 text-sm leading-relaxed animate-in fade-in slide-in-from-top-2">
                                                            <p className="text-foreground/90">{suggestedAnswers[answer.id]}</p>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </AccordionContent>
                                    </AccordionItem>
                                ))}
                            </Accordion>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
