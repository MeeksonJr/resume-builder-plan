import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { CareerCoachContent } from "@/components/dashboard/career/career-coach-content";

export default async function CareerCoachPage() {
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        redirect("/auth/login");
    }

    // Fetch profile for target role/industry
    const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

    if (!profile) {
        redirect("/dashboard");
    }

    // Fetch resumes to find primary or most recent
    const { data: resumes } = await supabase
        .from("resumes")
        .select("*")
        .eq("user_id", user.id)
        .order("updated_at", { ascending: false });

    return (
        <div className="min-h-full bg-[#e9eee8] px-4 py-6 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-7xl space-y-8">
            <div className="flex flex-col gap-5 border-b border-[#102b2b]/15 pb-6 md:flex-row md:items-end md:justify-between">
                <div>
                    <p className="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-[#0d8274]">Career intelligence</p>
                    <h1 className="text-3xl font-bold tracking-tight text-[#102b2b] sm:text-4xl">AI Career Coach</h1>
                    <p className="mt-2 max-w-2xl text-sm text-[#102b2b]/65 sm:text-base">Turn your target role into a practical roadmap with focused, evidence-based next steps.</p>
                </div>
            </div>

            <CareerCoachContent
                profile={profile}
                resumes={resumes || []}
            />
            </div>
        </div>
    );
}
