import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { PracticeInterface } from "@/components/interview";
import { VoiceCallInterface } from "@/components/interview/voice-call-interface";
import { VoiceInterviewResults } from "@/components/interview/voice-interview-results";

export default async function PracticeSessionPage({
    params,
}: {
    params: Promise<{ sessionId: string }>;
}) {
    const { sessionId } = await params;
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        redirect("/auth/login");
    }

    // Fetch session with questions
    const { data: session, error: sessionError } = await supabase
        .from("interview_sessions")
        .select("*")
        .eq("id", sessionId)
        .eq("user_id", user.id)
        .single();

    if (sessionError || !session) {
        redirect("/dashboard/interview-prep");
    }

    const { data: questions } = await supabase
        .from("interview_questions")
        .select("*")
        .eq("session_id", sessionId)
        .order("sort_order");

    // Server Action to mark session complete
    async function finishSession(transcript: any[] = []) {
        "use server";
        const sb = await createClient();
        await sb
            .from("interview_sessions")
            .update({
                completed_at: new Date().toISOString(),
                transcript: transcript
            })
            .eq("id", sessionId);

        redirect(`/dashboard/interview-prep/${sessionId}?finished=true`);
    }

    // Voice Mode Handling
    if (session.session_mode === 'voice') {
        if (!session.completed_at) {
            return (
                <VoiceCallInterface
                    session={session}
                    questions={questions || []}
                    onComplete={finishSession}
                />
            );
        }

        // Show Results for Voice Session
        return (
            <div className="container max-w-4xl mx-auto p-6">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold tracking-tight">Interview Results</h1>
                    <p className="text-muted-foreground mt-2">
                        Here is the analysis of your simulated voice interview.
                    </p>
                </div>
                <VoiceInterviewResults session={session} />
            </div>
        );
    }

    // If session is completed (TEXT mode), fetch answers server-side for immediate results display
    let initialAnswers = [];
    if (session.completed_at) {
        const { data: answers } = await supabase
            .from("interview_answers")
            .select(`
                *,
                interview_questions (
                    id,
                    question_text,
                    question_type
                ),
                interview_feedback (
                    id,
                    score,
                    strengths,
                    weaknesses,
                    improvements,
                    overall_feedback,
                    star_breakdown,
                    star_scores
                )
            `)
            .eq("session_id", sessionId)
            .eq("user_id", user.id)
            .order("created_at", { ascending: true });

        initialAnswers = (answers || []).map((answer: any) => ({
            ...answer,
            feedback: Array.isArray(answer.interview_feedback)
                ? answer.interview_feedback[0] || {}
                : answer.interview_feedback || {}
        }));
    }


    return (
        <div className="container max-w-4xl mx-auto p-6">
            <PracticeInterface
                session={session}
                questions={questions || []}
                initialAnswers={initialAnswers}
            />
        </div>
    );
}
