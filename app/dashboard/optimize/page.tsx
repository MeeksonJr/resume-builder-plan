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
        <div className="min-h-full bg-[#e9eee8] px-4 py-6 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-7xl space-y-8">
            <div className="flex flex-col gap-5 border-b border-[#102b2b]/15 pb-6 md:flex-row md:items-end md:justify-between">
                <div>
                    <p className="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-[#0d8274]">Resume intelligence</p>
                    <h1 className="text-3xl font-bold tracking-tight text-[#102b2b] sm:text-4xl">Resume Optimizer</h1>
                    <p className="mt-2 max-w-2xl text-sm text-[#102b2b]/65 sm:text-base">
                        Find the highest-impact improvements for the role you want next.
                    </p>
                </div>
            </div>

            <OptimizeContent
                resumes={resumes || []}
                targetRole={profile?.target_role || null}
            />
            </div>
        </div>
    );
}
