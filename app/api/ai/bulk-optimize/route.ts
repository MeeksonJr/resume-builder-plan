import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { bulkOptimizeResume } from "@/lib/ai";

export async function POST(request: NextRequest) {
    try {
        const supabase = await createClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await request.json();
        const { resumeData, targetRole, jobDescription, focusAreas } = body;

        if (!resumeData) {
            return NextResponse.json(
                { error: "Resume data is required" },
                { status: 400 }
            );
        }

        const result = await bulkOptimizeResume(resumeData, {
            targetRole,
            jobDescription,
            focusAreas,
        });

        return NextResponse.json(result);
    } catch (error: any) {
        console.error("[API] Bulk optimize error:", error);
        return NextResponse.json(
            { error: error.message || "Failed to optimize resume" },
            { status: 500 }
        );
    }
}
