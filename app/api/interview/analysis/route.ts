import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import { google } from "@ai-sdk/google";
import { generateObject } from "ai";
import { z } from "zod";

const analysisSchema = z.object({
    overallScore: z.number().describe("Overall score out of 10 based on communication, content, and clarity"),
    summary: z.string().describe("Executive summary of the interview performance"),
    strengths: z.array(z.string()).describe("List of partial strengths"),
    weaknesses: z.array(z.string()).describe("List of areas for improvement"),
    recommendations: z.array(z.string()).describe("Actionable recommendations for next time")
});

export async function POST(req: NextRequest) {
    try {
        const { sessionId } = await req.json();
        const supabase = await createClient();

        // Fetch session
        const { data: session } = await supabase
            .from("interview_sessions")
            .select("*")
            .eq("id", sessionId)
            .single();

        if (!session || !session.transcript || session.transcript.length === 0) {
            return NextResponse.json({ error: "No transcript found" }, { status: 400 });
        }

        // If analysis already exists, return it
        if (session.voice_analysis) {
            return NextResponse.json(session.voice_analysis);
        }

        const transcriptText = session.transcript
            .map((t: any) => `${t.role.toUpperCase()}: ${t.text}`)
            .join("\n");

        const prompt = `
            You are an expert Interview Coach. Analyze the following interview transcript.
            Role: ${session.target_role}
            Level: ${session.difficulty}

            Transcript:
            ${transcriptText}

            Provide a comprehensive evaluation.
        `;

        const result = await generateObject({
            model: google("gemini-1.5-flash"),
            schema: analysisSchema,
            prompt: prompt,
        });

        const analysis = result.object;

        // Save to DB
        await supabase
            .from("interview_sessions")
            .update({ voice_analysis: analysis })
            .eq("id", sessionId);

        return NextResponse.json(analysis);

    } catch (error) {
        console.error("Analysis generation failed:", error);
        return NextResponse.json({ error: "Failed to generate analysis" }, { status: 500 });
    }
}
