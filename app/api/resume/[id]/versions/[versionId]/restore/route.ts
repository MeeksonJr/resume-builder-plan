import { createClient } from "@/lib/supabase/server";
import { restoreResumeVersion } from "@/lib/version-control";
import { NextResponse } from "next/server";

export async function POST(
    req: Request,
    { params }: { params: Promise<{ id: string; versionId: string }> }
) {
    try {
        const { id, versionId } = await params;
        const supabase = await createClient();
        const {
            data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        // Verify resume ownership
        const { data: resume } = await supabase
            .from("resumes")
            .select("id")
            .eq("id", id)
            .eq("user_id", user.id)
            .single();

        if (!resume) {
            return new NextResponse("Resume not found", { status: 404 });
        }

        // Verify version belongs to this resume
        const { data: version } = await supabase
            .from("resume_versions")
            .select("id")
            .eq("id", versionId)
            .eq("resume_id", id)
            .single();

        if (!version) {
            return new NextResponse("Version not found", { status: 404 });
        }

        // Restore version
        const success = await restoreResumeVersion(id, versionId, user.id);

        if (!success) {
            return new NextResponse("Failed to restore version", { status: 500 });
        }

        return NextResponse.json({ message: "Version restored successfully" });
    } catch (error) {
        console.error("[VERSION_RESTORE_ERROR]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
