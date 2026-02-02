"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
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
    Play,
    Mic,
    MessageSquare,
    Volume2,
    Sparkles
} from "lucide-react";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import { useSpeechSynthesis } from "@/lib/hooks/use-speech-synthesis";
import { cn } from "@/lib/utils";

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
        sessionMode: "text",
        interviewerVoice: "",
    });

    const { voices, speak, isSpeaking } = useSpeechSynthesis();

    const handleCreateSession = async () => {
        if (!form.targetRole) {
            toast.error("Please enter a target role");
            return;
        }

        if (form.sessionMode === "voice" && !form.interviewerVoice) {
            toast.error("Please select an interviewer voice");
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
        if (score >= 80) return "text-emerald-500";
        if (score >= 60) return "text-amber-500";
        return "text-rose-500";
    };

    const stats = {
        totalSessions: sessions.length,
        averageScore: sessions.length > 0
            ? Math.round(sessions.reduce((sum, s) => sum + (s.average_score || 0), 0) / sessions.length)
            : 0,
        completedSessions: sessions.filter(s => s.completed_at).length,
    };

    return (
        <div className="space-y-10">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                    { label: "Total Sessions", val: stats.totalSessions, sub: `${stats.completedSessions} completed`, icon: Brain, color: "primary" },
                    { label: "Average Score", val: stats.averageScore, sub: "Out of 100", icon: Target, color: "emerald", isScore: true },
                    {
                        label: "Improvement",
                        val: sessions.length >= 2 ? `+${Math.round((sessions[0]?.average_score || 0) - (sessions[sessions.length - 1]?.average_score || 0))}` : "N/A",
                        sub: "Since first session",
                        icon: TrendingUp,
                        color: "blue"
                    },
                ].map((stat, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                    >
                        <Card className="bg-slate-950/40 border-primary/5 shadow-xl backdrop-blur-md overflow-hidden group h-full">
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <div className={cn("p-2 rounded-xl bg-opacity-10 shadow-inner",
                                        stat.color === "primary" ? "bg-primary text-primary" :
                                            stat.color === "emerald" ? "bg-emerald-500 text-emerald-500" : "bg-blue-500 text-blue-500"
                                    )}>
                                        <stat.icon className="h-5 w-5" />
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-xs font-black uppercase tracking-widest text-muted-foreground/60">{stat.label}</p>
                                    <p className={cn("text-3xl font-black tracking-tight", stat.isScore && getScoreColor(stats.averageScore))}>
                                        {stat.val}
                                    </p>
                                    <p className="text-[10px] font-bold text-muted-foreground/80 flex items-center gap-1 pt-1">
                                        {stat.sub}
                                    </p>
                                </div>
                            </CardContent>
                            <div className={cn("h-1 w-full opacity-30",
                                stat.color === "primary" ? "bg-primary" :
                                    stat.color === "emerald" ? "bg-emerald-500" : "bg-blue-500"
                            )} />
                        </Card>
                    </motion.div>
                ))}
            </div>

            {/* Main Section */}
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-black uppercase tracking-tight flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-primary/10">
                            <Clock className="h-4 w-4 text-primary" />
                        </div>
                        Recent Rounds
                    </h2>
                    <Dialog open={open} onOpenChange={setOpen}>
                        <DialogTrigger asChild>
                            <Button className="h-11 gap-2 rounded-2xl font-black bg-primary text-white hover:shadow-lg transition-all shadow-primary/20">
                                <Plus className="h-4 w-4" />
                                New Session
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[550px] bg-slate-950/95 border-primary/10 shadow-3xl backdrop-blur-2xl p-0 overflow-hidden rounded-3xl">
                            <div className="relative h-24 bg-gradient-to-br from-primary/20 via-primary/5 to-transparent border-b border-primary/5 flex items-center px-8">
                                <div>
                                    <DialogTitle className="text-2xl font-black uppercase tracking-tight">Practice Session</DialogTitle>
                                    <DialogDescription className="font-bold text-muted-foreground/80">Customize your AI-powered interview experience.</DialogDescription>
                                </div>
                                <Brain className="absolute right-8 top-1/2 -translate-y-1/2 h-12 w-12 text-primary/10" />
                            </div>
                            <div className="p-8 space-y-8">
                                <div className="space-y-2">
                                    <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground/60">Session Mode</Label>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div
                                            className={cn(
                                                "p-5 border-2 rounded-2xl cursor-pointer transition-all duration-300",
                                                form.sessionMode === 'text'
                                                    ? "border-primary bg-primary/10 shadow-[0_0_15px_rgba(var(--primary),0.1)] ring-1 ring-primary/20"
                                                    : "border-primary/5 bg-slate-900/40 hover:border-primary/30"
                                            )}
                                            onClick={() => setForm({ ...form, sessionMode: 'text' })}
                                        >
                                            <div className="flex items-center gap-2 mb-2">
                                                <MessageSquare className="h-5 w-5 text-primary" />
                                                <span className="font-black uppercase tracking-tight text-sm">Standard</span>
                                            </div>
                                            <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">Text-based analysis</p>
                                        </div>
                                        <div
                                            className={cn(
                                                "p-5 border-2 rounded-2xl cursor-pointer transition-all duration-300",
                                                form.sessionMode === 'voice'
                                                    ? "border-primary bg-primary/10 shadow-[0_0_15px_rgba(var(--primary),0.1)] ring-1 ring-primary/20"
                                                    : "border-primary/5 bg-slate-900/40 hover:border-primary/30"
                                            )}
                                            onClick={() => setForm({ ...form, sessionMode: 'voice' })}
                                        >
                                            <div className="flex items-center gap-2 mb-2">
                                                <Mic className="h-5 w-5 text-primary" />
                                                <span className="font-black uppercase tracking-tight text-sm">Simulated</span>
                                            </div>
                                            <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">Immersive voice</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <Label htmlFor="target-role" className="text-xs font-black uppercase tracking-widest text-muted-foreground/60">Target Role *</Label>
                                        <Input
                                            id="target-role"
                                            placeholder="Software Engineer"
                                            className="h-12 rounded-xl bg-slate-900/40 border-primary/10 focus:ring-primary shadow-inner font-bold"
                                            value={form.targetRole}
                                            onChange={(e) => setForm({ ...form, targetRole: e.target.value })}
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="difficulty" className="text-xs font-black uppercase tracking-widest text-muted-foreground/60">Experience Level</Label>
                                        <Select
                                            value={form.difficulty}
                                            onValueChange={(v) => setForm({ ...form, difficulty: v })}
                                        >
                                            <SelectTrigger className="h-12 rounded-xl bg-slate-900/40 border-primary/10 font-bold">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent className="bg-slate-950 border-primary/10 rounded-xl">
                                                <SelectItem value="junior">Junior (0-2 years)</SelectItem>
                                                <SelectItem value="mid">Mid-Level (2-5 years)</SelectItem>
                                                <SelectItem value="senior">Senior (5+ years)</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                {form.sessionMode === 'voice' && (
                                    <div className="space-y-2">
                                        <Label htmlFor="voice" className="text-xs font-black uppercase tracking-widest text-muted-foreground/60">Interviewer Voice</Label>
                                        <div className="flex items-center gap-2">
                                            <Select
                                                value={form.interviewerVoice}
                                                onValueChange={(v) => setForm({ ...form, interviewerVoice: v })}
                                            >
                                                <SelectTrigger className="h-12 rounded-xl bg-slate-900/40 border-primary/10 flex-1 font-bold">
                                                    <SelectValue placeholder="Select a voice" />
                                                </SelectTrigger>
                                                <SelectContent className="bg-slate-950 border-primary/10 rounded-xl">
                                                    {voices.filter(v => v.lang.startsWith('en')).map((voice) => (
                                                        <SelectItem key={voice.name} value={voice.name}>
                                                            {voice.name}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <Button
                                                variant="outline"
                                                size="icon"
                                                className="h-12 w-12 rounded-xl border-primary/10 hover:bg-primary/10"
                                                type="button"
                                                onClick={() => {
                                                    if (form.interviewerVoice) {
                                                        const voice = voices.find(v => v.name === form.interviewerVoice);
                                                        const u = new SpeechSynthesisUtterance("Hello, I will be your interviewer.");
                                                        if (voice) u.voice = voice;
                                                        window.speechSynthesis.speak(u);
                                                    }
                                                }}
                                                disabled={!form.interviewerVoice}
                                            >
                                                <Volume2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                )}

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-4">
                                    {resumes.length > 0 && (
                                        <div className="space-y-2">
                                            <Label htmlFor="resume" className="text-xs font-black uppercase tracking-widest text-muted-foreground/60">Context (Optional)</Label>
                                            <Select
                                                value={form.resumeId}
                                                onValueChange={(v) => setForm({ ...form, resumeId: v })}
                                            >
                                                <SelectTrigger className="h-12 rounded-xl bg-slate-900/40 border-primary/10 font-bold">
                                                    <SelectValue placeholder="Select a resume" />
                                                </SelectTrigger>
                                                <SelectContent className="bg-slate-950 border-primary/10 rounded-xl">
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
                                        <Label htmlFor="count" className="text-xs font-black uppercase tracking-widest text-muted-foreground/60">Length</Label>
                                        <Select
                                            value={form.questionCount.toString()}
                                            onValueChange={(v) => setForm({ ...form, questionCount: parseInt(v) })}
                                        >
                                            <SelectTrigger className="h-12 rounded-xl bg-slate-900/40 border-primary/10 font-bold">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent className="bg-slate-950 border-primary/10 rounded-xl">
                                                <SelectItem value="5">5 questions (Quick)</SelectItem>
                                                <SelectItem value="10">10 questions (Standard)</SelectItem>
                                                <SelectItem value="12">12 questions (Full)</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                <Button onClick={handleCreateSession} disabled={isCreating} className="h-14 rounded-2xl w-full gap-3 font-black uppercase tracking-widest shadow-xl shadow-primary/20 text-md">
                                    {isCreating ? (
                                        <>
                                            <Loader2 className="h-5 w-5 animate-spin" />
                                            Calibrating AI...
                                        </>
                                    ) : (
                                        <>
                                            <Sparkles className="h-5 w-5" />
                                            Initialize Session
                                        </>
                                    )}
                                </Button>
                            </div>
                        </DialogContent>
                    </Dialog>
                </div>

                {sessions.length === 0 ? (
                    <Card className="bg-slate-950/40 border-dashed border-2 border-primary/10 py-24 flex flex-col items-center justify-center text-center rounded-3xl backdrop-blur-md">
                        <div className="h-20 w-20 bg-primary/5 rounded-3xl flex items-center justify-center mb-6">
                            <Brain className="h-10 w-10 text-primary/30" />
                        </div>
                        <h3 className="text-xl font-black uppercase tracking-tight mb-2">Ready to Level Up?</h3>
                        <p className="text-sm text-muted-foreground max-w-sm mx-auto font-medium">
                            Start your first interview practice session to receive premium feedback and master your technical communication.
                        </p>
                    </Card>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        <AnimatePresence mode="popLayout">
                            {sessions.map((session, i) => (
                                <motion.div
                                    key={session.id}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: i * 0.05 }}
                                >
                                    <Card
                                        className="bg-slate-950/40 border-primary/5 hover:bg-slate-900/60 transition-all duration-300 cursor-pointer rounded-2xl group shadow-lg overflow-hidden h-full"
                                        onClick={() => router.push(`/dashboard/interview-prep/${session.id}`)}
                                    >
                                        <CardHeader className="pb-4">
                                            <div className="flex items-start justify-between">
                                                <div className="space-y-1.5">
                                                    <div className="flex items-center gap-2">
                                                        <Badge variant="outline" className="text-[9px] font-black uppercase tracking-widest py-0 h-4 border-primary/20 bg-primary/5 text-primary">
                                                            Round #{sessions.length - i}
                                                        </Badge>
                                                        <span className="text-xs text-muted-foreground font-black uppercase tracking-widest flex items-center gap-1.5 opacity-60">
                                                            <Clock className="h-3 w-3" />
                                                            {formatDistanceToNow(new Date(session.created_at), { addSuffix: true })}
                                                        </span>
                                                    </div>
                                                    <CardTitle className="text-lg font-black uppercase tracking-tight group-hover:text-primary transition-colors">
                                                        {session.target_role}
                                                    </CardTitle>
                                                </div>
                                                <Badge className={cn("rounded-lg font-black uppercase tracking-tighter",
                                                    session.difficulty === "senior" ? "bg-rose-500/10 text-rose-500 border-rose-500/20" :
                                                        session.difficulty === "mid" ? "bg-amber-500/10 text-amber-500 border-amber-500/20" :
                                                            "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                                                )}>
                                                    {session.difficulty}
                                                </Badge>
                                            </div>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="flex items-center justify-between pt-4 border-t border-primary/5">
                                                <div className="flex items-center gap-4">
                                                    <div className="space-y-0.5">
                                                        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-60">Progress</p>
                                                        <p className="text-sm font-black tracking-tight">{session.answered_count} / {session.question_count}</p>
                                                    </div>
                                                    {session.average_score > 0 && (
                                                        <div className="space-y-0.5 border-l border-primary/5 pl-4">
                                                            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-60">Avg Score</p>
                                                            <p className={cn("text-sm font-black tracking-tight", getScoreColor(session.average_score))}>
                                                                {Math.round(session.average_score)}
                                                            </p>
                                                        </div>
                                                    )}
                                                </div>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="h-10 w-10 rounded-xl bg-primary/5 hover:bg-primary/20 text-primary transition-all p-0"
                                                >
                                                    {session.completed_at ? <TrendingUp className="h-4.5 w-4.5" /> : <Play className="h-4.5 w-4.5" />}
                                                </Button>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                )}
            </div>
        </div>
    );
}
