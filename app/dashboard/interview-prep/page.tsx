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
        <div className="min-h-full bg-[#e9eee8] px-4 py-6 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-7xl space-y-8">
            <div className="border-b border-[#102b2b]/15 pb-6">
                <p className="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-[#0d8274]">Practice lab</p>
                <h1 className="text-3xl font-bold tracking-tight text-[#102b2b] sm:text-4xl">Interview Preparation</h1>
                <p className="mt-2 max-w-2xl text-sm text-[#102b2b]/65 sm:text-base">
                    Rehearse the moments that matter, then use direct feedback to sharpen your next answer.
                </p>
            </div>

            <InterviewDashboard
                resumes={resumes || []}
                sessions={sessions || []}
                targetRole={profile?.target_role || null}
            />
            </div>
        </div>
    );
}
