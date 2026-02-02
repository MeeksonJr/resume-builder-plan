import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { autoCompleteSection } from "@/lib/ai";

export async function POST(request: NextRequest) {
    try {
        const supabase = await createClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await request.json();
        const { sectionType, existingData, partialSectionData } = body;

        const validSections = ["summary", "experience", "education", "project", "skills"];
        if (!sectionType || !validSections.includes(sectionType)) {
            return NextResponse.json(
                { error: "Valid section type is required (summary, experience, education, project, skills)" },
                { status: 400 }
            );
        }

        const result = await autoCompleteSection(
            sectionType,
            existingData || {},
            partialSectionData
        );

        return NextResponse.json(result);
    } catch (error: any) {
        console.error("[API] Auto-complete error:", error);
        return NextResponse.json(
            { error: error.message || "Failed to auto-complete section" },
            { status: 500 }
        );
    }
}
