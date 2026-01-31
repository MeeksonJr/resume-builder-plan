import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { PracticeInterface } from "@/components/interview";

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

    return (
        <div className="container max-w-4xl mx-auto p-6">
            <PracticeInterface session={session} questions={questions || []} />
        </div>
    );
}
