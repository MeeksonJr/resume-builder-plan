import { createGroq } from "@ai-sdk/groq";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { createOpenAI } from "@ai-sdk/openai";
import { generateObject, generateText } from "ai";
import { z } from "zod";

// Initialize AI providers with fallback chain: Groq -> Gemini -> OpenAI
const groq = createGroq({
  apiKey: process.env.GROQ_API_KEY,
});

const google = createGoogleGenerativeAI({
  apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY,
});

const openai = createOpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Resume data schema for extraction
export const resumeDataSchema = z.object({
  personalInfo: z.object({
    fullName: z.string().optional(),
    email: z.string().email().optional(),
    phone: z.string().optional(),
    location: z.string().optional(),
    linkedin: z.string().optional(),
    website: z.string().optional(),
    github: z.string().optional(),
    summary: z.string().optional(),
  }),
  workExperience: z.array(
    z.object({
      company: z.string(),
      position: z.string(),
      location: z.string().optional(),
      startDate: z.string().optional(),
      endDate: z.string().optional(),
      current: z.boolean().optional(),
      description: z.string().optional(),
      highlights: z.array(z.string()).optional(),
    })
  ),
  education: z.array(
    z.object({
      institution: z.string(),
      degree: z.string().optional(),
      field: z.string().optional(),
      location: z.string().optional(),
      startDate: z.string().optional(),
      endDate: z.string().optional(),
      gpa: z.string().optional(),
      highlights: z.array(z.string()).optional(),
    })
  ),
  skills: z.array(
    z.object({
      category: z.string().optional(),
      items: z.array(z.string()),
    })
  ),
  projects: z.array(
    z.object({
      name: z.string(),
      description: z.string().optional(),
      technologies: z.array(z.string()).optional(),
      url: z.string().optional(),
      highlights: z.array(z.string()).optional(),
    })
  ),
  certifications: z.array(
    z.object({
      name: z.string(),
      issuer: z.string().optional(),
      date: z.string().optional(),
      url: z.string().optional(),
    })
  ),
  languages: z.array(
    z.object({
      language: z.string(),
      proficiency: z.string().optional(),
    })
  ),
});

export type ResumeData = z.infer<typeof resumeDataSchema>;

// AI model fallback chain
async function withFallback<T>(
  operation: (model: ReturnType<typeof groq | typeof google | typeof openai>) => Promise<T>
): Promise<T> {
  // Check if any keys are available and non-empty
  const hasKeys =
    (process.env.GROQ_API_KEY && process.env.GROQ_API_KEY.length > 0) ||
    (process.env.GOOGLE_GENERATIVE_AI_API_KEY && process.env.GOOGLE_GENERATIVE_AI_API_KEY.length > 0) ||
    (process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY.length > 0);

  if (!hasKeys) {
    console.warn("[AI] No valid API keys found. Using mock response.");
    throw new Error("NO_API_KEYS");
  }

  const models = [
    { provider: groq, model: "llama-3.3-70b-versatile", name: "Groq" },
    { provider: google, model: "gemini-1.5-flash", name: "Gemini" },
    { provider: openai, model: "gpt-4o-mini", name: "OpenAI" },
  ];

  let lastError: Error | null = null;

  for (const { provider, model, name } of models) {
    try {
      console.log(`[AI] Trying ${name}...`);
      return await operation(provider(model));
    } catch (error) {
      console.error(`[AI] ${name} failed:`, error);
      lastError = error instanceof Error ? error : new Error(String(error));
    }
  }

  throw lastError || new Error("All AI providers failed");
}

// Parse resume text and extract structured data
export async function parseResumeText(text: string): Promise<ResumeData> {
  const result = await withFallback(async (model) => {
    return generateObject({
      model,
      schema: resumeDataSchema,
      prompt: `Extract structured resume data from the following text. Be thorough and extract all available information. If a field is not present, omit it or use an empty array for lists.

Resume Text:
${text}

Extract all personal information, work experience, education, skills, projects, certifications, and languages mentioned.`,
    });
  });

  return result.object;
}

// Improve a bullet point or description
export async function improveText(
  text: string,
  type: "bullet" | "summary" | "description",
  context?: string
): Promise<string> {
  const instructions = {
    bullet:
      "Improve this resume bullet point. Make it action-oriented, quantifiable where possible, and impactful. Keep it concise (1-2 lines).",
    summary:
      "Improve this professional summary. Make it compelling, highlight key strengths, and target the desired role. Keep it to 3-4 sentences.",
    description:
      "Improve this job or project description. Make it clear, professional, and highlight key responsibilities and achievements.",
  };

  try {
    const result = await withFallback(async (model) => {
      return generateText({
        model,
        prompt: `${instructions[type]}

${context ? `Context: ${context}\n\n` : ""}Original text: ${text}

Provide only the improved text, nothing else.`,
      });
    });
    return result.text.trim();
  } catch (error: any) {
    console.warn("[AI] Improvement failed:", error.message);
    if (error.message === "NO_API_KEYS" || error.message.includes("All AI providers failed")) {
      return `[MOCK AI] Improved: ${text}`;
    }
    throw error;
  }
}

// Generate content based on job description
export async function tailorForJob(
  resumeData: ResumeData,
  jobDescription: string
): Promise<{
  suggestions: string[];
  keywordsToAdd: string[];
  improvedSummary: string;
}> {
  const result = await withFallback(async (model) => {
    return generateObject({
      model,
      schema: z.object({
        suggestions: z.array(z.string()).describe("List of specific suggestions to improve the resume for this job"),
        keywordsToAdd: z.array(z.string()).describe("Important keywords from the job description to add to the resume"),
        improvedSummary: z.string().describe("An improved professional summary tailored for this specific job"),
      }),
      prompt: `Analyze this resume against the job description and provide tailoring suggestions.

Resume Data:
${JSON.stringify(resumeData, null, 2)}

Job Description:
${jobDescription}

Provide specific, actionable suggestions to improve this resume for the target job.`,
    });
  });

  return result.object;
}

// Generate skill suggestions based on job title
export async function suggestSkills(
  jobTitle: string,
  currentSkills: string[]
): Promise<string[]> {
  const result = await withFallback(async (model) => {
    return generateObject({
      model,
      schema: z.object({
        suggestedSkills: z.array(z.string()).describe("Relevant skills for this job title that are not already in the current skills list"),
      }),
      prompt: `Suggest relevant skills for a ${jobTitle} position.

Current skills: ${currentSkills.join(", ")}

Suggest 10-15 additional skills that would be valuable for this role and are not already listed. Focus on both technical and soft skills that are commonly sought after.`,
    });
  });

  return result.object.suggestedSkills;
}
