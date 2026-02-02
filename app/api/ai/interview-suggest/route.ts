import { generateSuggestedAnswer } from "@/lib/ai";
import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
    try {
        const supabase = await createClient();
        const {
            data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { question, questionType, targetRole, context } = await request.json();

        if (!question || !targetRole) {
            return NextResponse.json(
                { error: "Missing required fields" },
                { status: 400 }
            );
        }

        const suggestedAnswer = await generateSuggestedAnswer(
            question,
            questionType || "General",
            targetRole,
            context
        );

        return NextResponse.json({ suggestedAnswer });
    } catch (error) {
        console.error("Error generating suggested answer:", error);
        return NextResponse.json(
            { error: "Failed to generate suggested answer" },
            { status: 500 }
        );
    }
}
