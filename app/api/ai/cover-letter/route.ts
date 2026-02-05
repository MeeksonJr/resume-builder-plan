import { google } from "@ai-sdk/google";
import { generateText } from "ai";
import { z } from "zod";

export const maxDuration = 60;

const requestSchema = z.object({
    resume: z.any(),
    jobDescription: z.string(),
    jobTitle: z.string(),
    company: z.string(),
    tone: z.enum(["professional", "enthusiastic", "confident", "casual"]).default("professional"),
});

export async function POST(req: Request) {
    try {
        const json = await req.json();
        const { resume, jobDescription, jobTitle, company, tone } = requestSchema.parse(json);

        // Extract relevant resume data to reduce token usage
        const resumeContext = {
            fullName: resume.personalInfo?.full_name || resume.profile?.full_name,
            skills: resume.skills?.map((s: any) => s.name).join(", "),
            experience: resume.workExperiences?.map((w: any) => `${w.position} at ${w.company}: ${w.description}`).join("; "),
            summary: resume.personalInfo?.summary || resume.profile?.summary,
        };

        const prompt = `
    You are an expert career coach and professional copywriter.
    Write a compelling cover letter for the position of "${jobTitle}" at "${company}".
    
    JOB DESCRIPTION:
    ${jobDescription}

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

        return Response.json({ content: text });
    } catch (error) {
        console.error("Cover Letter Generation Error:", error);
        return Response.json({ error: "Failed to generate cover letter" }, { status: 500 });
    }
}
