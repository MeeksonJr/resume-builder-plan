import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { adjustTone } from "@/lib/ai";

export async function POST(request: NextRequest) {
    try {
        const supabase = await createClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await request.json();
        const { content, targetTone, scope } = body;

        if (!content) {
            return NextResponse.json(
                { error: "Content is required" },
                { status: 400 }
            );
        }

        const validTones = ["professional", "casual", "technical", "creative", "executive", "entry-level"];
        if (!targetTone || !validTones.includes(targetTone)) {
            return NextResponse.json(
                { error: "Valid target tone is required (professional, casual, technical, creative, executive, entry-level)" },
                { status: 400 }
            );
        }

        const validScopes = ["full", "summary", "experience", "selected"];
        const selectedScope = scope && validScopes.includes(scope) ? scope : "selected";

        const result = await adjustTone(content, targetTone, selectedScope);

        return NextResponse.json(result);
    } catch (error: any) {
        console.error("[API] Tone adjust error:", error);
        return NextResponse.json(
            { error: error.message || "Failed to adjust tone" },
            { status: 500 }
        );
    }
}
