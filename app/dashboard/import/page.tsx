import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { ImportContent } from "@/components/dashboard/import/import-content";

export default async function ImportPage() {
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        redirect("/auth/login");
    }

    // Fetch user's resumes for GitHub import target selection
    const { data: resumes } = await supabase
        .from("resumes")
        .select("id, title")
        .eq("user_id", user.id)
        .order("updated_at", { ascending: false });

    return (
        <div className="p-6 space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Smart Import</h1>
                    <p className="text-muted-foreground">
                        Quickly import your professional data from LinkedIn, GitHub, and other sources.
                    </p>
                </div>
            </div>

            <ImportContent resumes={resumes || []} />
        </div>
    );
}
