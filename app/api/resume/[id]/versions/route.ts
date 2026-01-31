import { createClient } from "@/lib/supabase/server";
import { saveResumeVersion } from "@/lib/version-control";
import { NextResponse } from "next/server";

export async function GET(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const supabase = await createClient();
        const {
            data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        // Fetch all versions for this resume
        const { data: versions, error } = await supabase
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
            .eq("created_by", user.id)
            .order("version_number", { ascending: false });

        if (error) throw error;

        return NextResponse.json(versions || []);
    } catch (error) {
        console.error("[VERSIONS_GET_ERROR]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}

export async function POST(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const supabase = await createClient();
        const {
            data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const { changeSummary } = await req.json();

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

        // Create version
        const versionId = await saveResumeVersion(id, user.id, changeSummary);

        if (!versionId) {
            return new NextResponse("Failed to create version", { status: 500 });
        }

        return NextResponse.json({ versionId, message: "Version created successfully" });
    } catch (error) {
        console.error("[VERSIONS_POST_ERROR]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
