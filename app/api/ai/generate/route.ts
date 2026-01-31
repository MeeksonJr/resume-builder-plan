import { generateFullResume } from "@/lib/ai";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { checkRateLimit } from "@/lib/security/rate-limit";

const requestSchema = z.object({
    role: z.string().min(1),
    experienceLevel: z.string().min(1),
    skills: z.array(z.string()),
    achievements: z.string().min(1),
    workHistory: z.string().optional(),
    education: z.string().optional(),
    projects: z.string().optional(),
    languages: z.string().optional(),
    hobbies: z.string().optional(),
    additionalInfo: z.string().optional(),
});

export async function POST(req: NextRequest) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        const data = requestSchema.parse(body);

        // Rate Limit Check
        const { allowed } = await checkRateLimit("ai_generate");
        if (!allowed) {
            return NextResponse.json({
                error: "Daily AI generation limit reached. Please try again tomorrow."
            }, { status: 429 });
        }

        const resumeData = await generateFullResume(data);

        return NextResponse.json({ resumeData });
    } catch (error) {
        console.error("AI Generation Error:", error);

        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { error: "Invalid request parameters", details: error.errors },
                { status: 400 }
            );
        }

        return NextResponse.json(
            {
                error: "Failed to generate resume",
                details: error instanceof Error ? error.message : String(error),
            },
            { status: 500 }
        );
    }
}
