import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { OptimizeContent } from "@/components/dashboard/optimize/optimize-content";

export default async function OptimizePage() {
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
        .select("id, title, updated_at")
        .eq("user_id", user.id)
        .order("updated_at", { ascending: false });

    // Get user profile for target role
    const { data: profile } = await supabase
        .from("profiles")
        .select("target_role, target_industry")
        .eq("id", user.id)
        .single();

    return (
        <div className="p-6 space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Resume Optimizer</h1>
                    <p className="text-muted-foreground">
                        Get AI-powered insights and actionable recommendations to perfect your resume.
                    </p>
                </div>
            </div>

            <OptimizeContent
                resumes={resumes || []}
                targetRole={profile?.target_role || null}
            />
        </div>
    );
}
