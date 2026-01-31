import { analyzeKeywords, ResumeData } from "@/lib/ai";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const requestSchema = z.object({
    resumeData: z.record(z.any()),
    jobDescription: z.string(),
});

import { createClient } from "@/lib/supabase/server";
import { checkRateLimit } from "@/lib/security/rate-limit";

export async function POST(req: NextRequest) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        const { resumeData, jobDescription } = requestSchema.parse(body);

        const { allowed, remaining } = await checkRateLimit("ai_keywords");
        if (!allowed) {
            return NextResponse.json({
                error: "Daily AI limit reached. Please try again tomorrow."
            }, { status: 429 });
        }

        const result = await analyzeKeywords(resumeData as unknown as ResumeData, jobDescription);

        return NextResponse.json({ ...result, remaining });
    } catch (error) {
        console.error("Keyword Analysis Error:", error);

        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { error: "Invalid request parameters", details: error.errors },
                { status: 400 }
            );
        }

        return NextResponse.json(
            { error: "Failed to analyze keywords" },
            { status: 500 }
        );
    }
}
