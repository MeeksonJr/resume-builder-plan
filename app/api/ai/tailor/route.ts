import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { generateObject } from "ai";
import { z } from "zod";
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { checkRateLimit } from "@/lib/security/rate-limit";

// Schema for the AI output
const tailoringSchema = z.object({
    score: z.number().describe("A score from 0 to 100 indicating how well the resume matches the job description."),
    analysis: z.string().describe("A brief summary of the fit analysis."),
    missingKeywords: z.array(z.string()).describe("List of important keywords found in the JD but missing from the resume."),
    suggestions: z.array(z.object({
        section: z.string().describe("The section of the resume to improve (e.g., 'Summary', 'Experience')."),
        original: z.string().describe("The original text or concept."),
        improved: z.string().describe("The suggested improvement or rewrite."),
        reason: z.string().describe("Why this change helps (e.g., 'Matches keyword X', 'Impact driven').")
    })).describe("Specific improvements to make.")
});

const google = createGoogleGenerativeAI({
    apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY,
});

export async function POST(req: Request) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        // Check plan-wise daily rate limits
        const { allowed, isPro } = await checkRateLimit("ai_tailor");
        if (!allowed) {
            return new NextResponse(
                JSON.stringify({ 
                    error: "LIMIT_EXCEEDED", 
                    message: isPro 
                        ? "You have reached your daily limit for resume tailoring." 
                        : "Resume tailoring is a Pro feature. Please upgrade to Pro to unlock unlimited tailoring." 
                }), 
                { status: 429, headers: { "Content-Type": "application/json" } }
            );
        }

        const { resume, jobDescription, jobTitle, company } = await req.json();

        if (!resume || !jobDescription) {
            return new NextResponse("Missing resume or job description", { status: 400 });
        }

        const prompt = `
      You are an expert ATS (Applicant Tracking System) optimizer and Career Coach.
      
      TARGET JOB:
      Title: ${jobTitle}
      Company: ${company}
      Description:
      ${jobDescription}

      RESUME CONTENT:
      ${JSON.stringify(resume)}

      TASK:
      Analyze the resume against the job description.
      1. Calculate a match score (0-100).
      2. Identify critical missing hard skills and soft skills (keywords).
      3. Suggest specific rewrites to align the resume language with the job description.
      
      Focus on:
      - Quantifiable achievements.
      - Matching terminology (e.g. if JD says "React.js" and resume says "React", that's fine, but if missing entirely, flag it).
      - Seniority alignment.
    `;

        const result = await generateObject({
            model: google("gemini-2.5-flash"),
            schema: tailoringSchema,
            prompt: prompt,
        });

        return NextResponse.json(result.object);

    } catch (error: any) {
        console.error("Tailoring Error:", error);
        return new NextResponse(error.message || "Internal Server Error", { status: 500 });
    }
}
