import { google } from "@ai-sdk/google";
import { generateText } from "ai";
import { z } from "zod";

export const maxDuration = 60;

const requestSchema = z.object({
    resume: z.any(),
    jobDescription: z.string().optional().or(z.literal("")), // Allow empty or undefined
    jobTitle: z.string().min(1, "Job Title is required"),
    company: z.string().min(1, "Company Name is required"),
    tone: z.enum(["professional", "enthusiastic", "confident", "casual"]).default("professional"),
});

export async function POST(req: Request) {
    try {
        const json = await req.json();

        // 1. Validation Phase
        let parsedData;
        try {
            parsedData = requestSchema.parse(json);
        } catch (zodError) {
            return Response.json({ error: "Invalid Input", details: zodError }, { status: 400 });
        }

        const { resume, jobDescription, jobTitle, company, tone } = parsedData;

        // Extract relevant resume data to reduce token usage
        const resumeContext = {
            fullName: resume.personalInfo?.full_name || resume.profile?.full_name || "Applicant",
            skills: resume.skills?.map((s: any) => s.name).join(", ") || "",
            experience: resume.workExperiences?.map((w: any) => `${w.position} at ${w.company}: ${w.description}`).join("; ") || "",
            summary: resume.personalInfo?.summary || resume.profile?.summary || "",
        };

        const prompt = `
    You are an expert career coach and professional copywriter.
    Write a compelling cover letter for the position of "${jobTitle}" at "${company}".
    
    JOB DESCRIPTION:
    ${jobDescription || "No specific description provided. Focus on standard requirements for this role."}

    CANDIDATE CONTEXT:
    ${JSON.stringify(resumeContext)}

    TONE: ${tone}

    INSTRUCTIONS:
    - Format as a standard business letter.
    - Do not include placeholders like "[Your Name]" -> use the candidate's name from context.
    - Highlight 2-3 key achievements from the candidate's experience that match the job description.
    - Keep it under 400 words.
    - Return ONLY the body of the letter (no markdown code blocks).
    `;

        const { text } = await generateText({
            model: google("gemini-1.5-flash-latest"),
            prompt,
            temperature: 0.7,
        });

        if (!text) {
            throw new Error("Empty response from AI");
        }

        return Response.json({ content: text });
    } catch (error: any) {
        console.error("Cover Letter Generation Error:", error);
        // Return JSON error even for 500, so frontend can parse it
        return Response.json(
            { error: error.message || "Failed to generate cover letter" },
            { status: 500 }
        );
    }
}
