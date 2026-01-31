import { analyzeKeywords, ResumeData } from "@/lib/ai";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const requestSchema = z.object({
    resumeData: z.record(z.any()),
    jobDescription: z.string(),
});

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { resumeData, jobDescription } = requestSchema.parse(body);

        const result = await analyzeKeywords(resumeData as unknown as ResumeData, jobDescription);

        return NextResponse.json(result);
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
