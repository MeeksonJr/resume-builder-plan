import { calculateATSScore, ResumeData } from "@/lib/ai";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const requestSchema = z.object({
    resumeData: z.record(z.any()),
    jobDescription: z.string().optional(),
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

        const { allowed, remaining, isPro } = await checkRateLimit("ai_ats");
        if (!allowed) {
            return NextResponse.json({
                error: "LIMIT_EXCEEDED",
                message: isPro 
                    ? "You have reached your daily limit for ATS Scoring." 
                    : "Free users can only run 2 ATS Scoring checks per day. Please upgrade to Pro for unlimited access."
            }, { status: 429 });
        }

        const result = await calculateATSScore(resumeData as unknown as ResumeData, jobDescription);

        return NextResponse.json({ ...result, remaining });
    } catch (error) {
        console.error("ATS Score Error:", error);

        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { error: "Invalid request parameters", details: error.errors },
                { status: 400 }
            );
        }

        return NextResponse.json(
            { error: "Failed to calculate ATS score" },
            { status: 500 }
        );
    }
}
