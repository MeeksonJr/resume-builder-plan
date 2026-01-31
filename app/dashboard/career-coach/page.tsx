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
        <div className="p-6 space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">AI Career Coach</h1>
                    <p className="text-muted-foreground">Data-driven roadmap to reach your next professional milestone.</p>
                </div>
            </div>

            <CareerCoachContent
                profile={profile}
                resumes={resumes || []}
            />
        </div>
    );
}
