import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { customizeForIndustry } from "@/lib/ai";

export async function POST(request: NextRequest) {
    try {
        const supabase = await createClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await request.json();
        const { resumeData, targetIndustry, subIndustry, companySize, role } = body;

        if (!resumeData) {
            return NextResponse.json(
                { error: "Resume data is required" },
                { status: 400 }
            );
        }

        if (!targetIndustry) {
            return NextResponse.json(
                { error: "Target industry is required" },
                { status: 400 }
            );
        }

        const result = await customizeForIndustry(resumeData, targetIndustry, {
            subIndustry,
            companySize,
            role,
        });

        return NextResponse.json(result);
    } catch (error: any) {
        console.error("[API] Industry customize error:", error);
        return NextResponse.json(
            { error: error.message || "Failed to customize for industry" },
            { status: 500 }
        );
    }
}
