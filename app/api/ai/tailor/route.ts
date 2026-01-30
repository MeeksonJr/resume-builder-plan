import { tailorForJob, ResumeData } from "@/lib/ai";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const requestSchema = z.object({
    resumeData: z.record(z.any()), // We trust the full schema validation to the AI function or validate lighter here
    jobDescription: z.string().min(1),
});

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { resumeData, jobDescription } = requestSchema.parse(body);

        const result = await tailorForJob(resumeData as unknown as ResumeData, jobDescription);

        return NextResponse.json(result);
    } catch (error) {
        console.error("AI Tailoring Error:", error);

        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { error: "Invalid request parameters", details: error.errors },
                { status: 400 }
            );
        }

        return NextResponse.json(
            { error: "Failed to tailor resume" },
            { status: 500 }
        );
    }
}
