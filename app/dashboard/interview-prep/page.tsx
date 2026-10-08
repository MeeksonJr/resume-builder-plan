import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { InterviewDashboard } from "@/components/interview/interview-dashboard";
import { LiveMockInterviewRoom } from "@/components/interview/live-mock-interview-room";

export default async function InterviewPrepPage() {
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        redirect("/auth/login");
    }

    // Fetch user's resumes
    const { data: resumes } = await supabase
        .from("resumes")
        .select("id, title")
        .eq("user_id", user.id)
        .order("updated_at", { ascending: false });

    // Fetch user's profile for target role
    const { data: profile } = await supabase
        .from("profiles")
        .select("target_role")
        .eq("id", user.id)
        .single();

    // Fetch recent sessions
    const { data: sessions } = await supabase
        .from("interview_sessions")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(10);

    return (
        <div className="min-h-full px-4 py-6 sm:px-6 lg:px-8 text-foreground min-w-0 max-w-full overflow-hidden">
            <div className="mx-auto max-w-7xl space-y-8 min-w-0">
            <div className="border-b border-border pb-6">
                <p className="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-emerald-600 dark:text-emerald-400">Practice lab</p>
                <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">Interview Preparation</h1>
                <p className="mt-2 max-w-2xl text-sm text-muted-foreground sm:text-base">
                    Rehearse the moments that matter, then use direct feedback to sharpen your next answer.
                </p>
            </div>

            <LiveMockInterviewRoom />

            <InterviewDashboard
                resumes={resumes || []}
                sessions={sessions || []}
                targetRole={profile?.target_role || null}
            />
            </div>
        </div>
    );
}
