"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
    Brain,
    Plus,
    Clock,
    Target,
    TrendingUp,
    Loader2,
    CheckCircle2,
    Play
} from "lucide-react";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";

interface InterviewDashboardProps {
    resumes: { id: string; title: string }[];
    sessions: any[];
    targetRole: string | null;
}

export function InterviewDashboard({ resumes, sessions, targetRole }: InterviewDashboardProps) {
    const router = useRouter();
    const [open, setOpen] = useState(false);
    const [isCreating, setIsCreating] = useState(false);
    const [form, setForm] = useState({
        resumeId: resumes[0]?.id || "",
        targetRole: targetRole || "",
        difficulty: "mid",
        questionCount: 12,
    });

    const handleCreateSession = async () => {
        if (!form.targetRole) {
            toast.error("Please enter a target role");
            return;
        }

        setIsCreating(true);
        try {
            const response = await fetch("/api/interview/sessions", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(form),
            });

            if (!response.ok) throw new Error("Failed to create session");

            const { sessionId } = await response.json();
            toast.success("Interview session created!");
            router.push(`/dashboard/interview-prep/${sessionId}`);
        } catch (error) {
            console.error(error);
            toast.error("Failed to create session");
        } finally {
            setIsCreating(false);
        }
    };

    const getScoreColor = (score: number) => {
        if (score >= 80) return "text-green-600";
        if (score >= 60) return "text-yellow-600";
        return "text-red-600";
    };

    const stats = {
        totalSessions: sessions.length,
        averageScore: sessions.length > 0
            ? Math.round(sessions.reduce((sum, s) => sum + (s.average_score || 0), 0) / sessions.length)
            : 0,
        completedSessions: sessions.filter(s => s.completed_at).length,
    };

    return (
        <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Sessions</CardTitle>
                        <Brain className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.totalSessions}</div>
                        <p className="text-xs text-muted-foreground">
                            {stats.completedSessions} completed
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Average Score</CardTitle>
                        <Target className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className={`text-2xl font-bold ${getScoreColor(stats.averageScore)}`}>
                            {stats.averageScore}
                        </div>
                        <p className="text-xs text-muted-foreground">Out of 100</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Improvement</CardTitle>
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {sessions.length >= 2
                                ? `+${Math.round(sessions[0]?.average_score - sessions[sessions.length - 1]?.average_score || 0)}`
                                : "N/A"}
                        </div>
                        <p className="text-xs text-muted-foreground">Since first session</p>
                    </CardContent>
                </Card>
            </div>

            {/* New Session Dialog */}
            <Dialog open={open} onOpenChange={setOpen}>
                <DialogTrigger asChild>
                    <Button className="gap-2">
                        <Plus className="h-4 w-4" />
                        Start New Session
                    </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                        <DialogTitle>Create Interview Session</DialogTitle>
                        <DialogDescription>
                            Customize your practice session to match your target role and experience level.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="target-role">Target Role *</Label>
                            <Input
                                id="target-role"
                                placeholder="Software Engineer"
                                value={form.targetRole}
                                onChange={(e) => setForm({ ...form, targetRole: e.target.value })}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="difficulty">Experience Level</Label>
                            <Select
                                value={form.difficulty}
                                onValueChange={(v) => setForm({ ...form, difficulty: v })}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="junior">Junior (0-2 years)</SelectItem>
                                    <SelectItem value="mid">Mid-Level (2-5 years)</SelectItem>
                                    <SelectItem value="senior">Senior (5+ years)</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {resumes.length > 0 && (
                            <div className="space-y-2">
                                <Label htmlFor="resume">Base Questions On (Optional)</Label>
                                <Select
                                    value={form.resumeId}
                                    onValueChange={(v) => setForm({ ...form, resumeId: v })}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select a resume" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {resumes.map((resume) => (
                                            <SelectItem key={resume.id} value={resume.id}>
                                                {resume.title}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        )}

                        <div className="space-y-2">
                            <Label htmlFor="count">Number of Questions</Label>
                            <Select
                                value={form.questionCount.toString()}
                                onValueChange={(v) => setForm({ ...form, questionCount: parseInt(v) })}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="5">5 questions (~15 min)</SelectItem>
                                    <SelectItem value="10">10 questions (~30 min)</SelectItem>
                                    <SelectItem value="12">12 questions (~40 min)</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <Button onClick={handleCreateSession} disabled={isCreating} className="w-full gap-2">
                        {isCreating ? (
                            <>
                                <Loader2 className="h-4 w-4 animate-spin" />
                                Generating Questions...
                            </>
                        ) : (
                            <>
                                <Plus className="h-4 w-4" />
                                Create Session
                            </>
                        )}
                    </Button>
                </DialogContent>
            </Dialog>

            {/* Recent Sessions */}
            <div>
                <h2 className="text-lg font-semibold mb-4">Recent Sessions</h2>
                {sessions.length === 0 ? (
                    <Card className="border-dashed border-2 py-12 flex flex-col items-center justify-center text-center">
                        <Brain className="h-12 w-12 text-muted-foreground/50 mb-4" />
                        <h3 className="text-lg font-bold mb-2">No Sessions Yet</h3>
                        <p className="text-sm text-muted-foreground max-w-md mb-6">
                            Start your first interview practice session to receive personalized feedback and improve your skills.
                        </p>
                    </Card>
                ) : (
                    <div className="grid gap-4">
                        {sessions.map((session) => (
                            <Card key={session.id} className="hover:bg-accent/50 transition-colors cursor-pointer"
                                onClick={() => router.push(`/dashboard/interview-prep/${session.id}`)}>
                                <CardHeader>
                                    <div className="flex items-start justify-between">
                                        <div className="space-y-1">
                                            <CardTitle className="text-base">{session.target_role}</CardTitle>
                                            <CardDescription className="flex items-center gap-2">
                                                <Clock className="h-3 w-3" />
                                                {formatDistanceToNow(new Date(session.created_at), { addSuffix: true })}
                                            </CardDescription>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Badge variant={session.difficulty === "senior" ? "default" : session.difficulty === "mid" ? "secondary" : "outline"}>
                                                {session.difficulty}
                                            </Badge>
                                            {session.completed_at && (
                                                <Badge variant="default" className="gap-1">
                                                    <CheckCircle2 className="h-3 w-3" />
                                                    Completed
                                                </Badge>
                                            )}
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="flex items-center justify-between">
                                        <div className="text-sm text-muted-foreground">
                                            {session.answered_count} of {session.question_count} answered
                                        </div>
                                        <div className="flex items-center gap-4">
                                            {session.average_score > 0 && (
                                                <div className="text-right">
                                                    <div className={`text-lg font-bold ${getScoreColor(session.average_score)}`}>
                                                        {Math.round(session.average_score)}
                                                    </div>
                                                    <div className="text-xs text-muted-foreground">Avg Score</div>
                                                </div>
                                            )}
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="gap-2"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    router.push(`/dashboard/interview-prep/${session.id}`);
                                                }}
                                            >
                                                <Play className="h-4 w-4" />
                                                {session.completed_at ? "Review" : "Continue"}
                                            </Button>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
