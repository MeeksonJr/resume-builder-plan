import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { InterviewDashboard } from "@/components/interview/interview-dashboard";

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
        <div className="p-6 space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Interview Preparation</h1>
                <p className="text-muted-foreground">
                    Practice with AI-generated questions and get personalized feedback
                </p>
            </div>

            <InterviewDashboard
                resumes={resumes || []}
                sessions={sessions || []}
                targetRole={profile?.target_role || null}
            />
        </div>
    );
}
