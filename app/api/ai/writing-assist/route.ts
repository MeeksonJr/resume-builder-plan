import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getWritingSuggestions } from "@/lib/ai";

export async function POST(request: NextRequest) {
    try {
        const supabase = await createClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await request.json();
        const { partialText, section, fieldName, resumeData } = body;

        if (!partialText || partialText.length < 3) {
            return NextResponse.json(
                { error: "Text must be at least 3 characters" },
                { status: 400 }
            );
        }

        if (!section) {
            return NextResponse.json(
                { error: "Section is required" },
                { status: 400 }
            );
        }

        const result = await getWritingSuggestions(partialText, {
            section,
            fieldName,
            resumeData,
        });

        return NextResponse.json(result);
    } catch (error: any) {
        console.error("[API] Writing assist error:", error);
        return NextResponse.json(
            { error: error.message || "Failed to get writing suggestions" },
            { status: 500 }
        );
    }
}
