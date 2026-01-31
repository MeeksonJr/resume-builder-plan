import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { VersionTimeline } from "@/components/resume/version-timeline";

export default async function VersionsPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        redirect("/auth/login");
    }

    // Fetch resume
    const { data: resume } = await supabase
        .from("resumes")
        .select("id, title")
        .eq("id", id)
        .eq("user_id", user.id)
        .single();

    if (!resume) {
        redirect("/dashboard");
    }

    // Fetch all versions
    const { data: versions } = await supabase
        .from("resume_versions")
        .select(`
            *,
            version_metrics (
                applications_sent,
                interviews_received,
                offers_received
            )
        `)
        .eq("resume_id", id)
        .order("version_number", { ascending: false });

    return (
        <div className="p-6 space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Version History</h1>
                    <p className="text-muted-foreground">
                        {resume.title} - Track changes and restore previous versions
                    </p>
                </div>
            </div>

            <VersionTimeline resumeId={id} versions={versions || []} />
        </div>
    );
}
