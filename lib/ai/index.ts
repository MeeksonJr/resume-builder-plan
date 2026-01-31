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
  try {
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
  } catch (error: any) {
    console.warn("[AI] Tailoring failed:", error.message);
    if (error.message === "NO_API_KEYS" || error.message.includes("All AI providers failed")) {
      return {
        suggestions: [
          "[MOCK] Add more metrics to your work experience",
          "[MOCK] Highlight your leadership skills",
          "[MOCK] Rephrase your summary to match the job title"
        ],
        keywordsToAdd: ["React", "TypeScript", "Team Leadership", "Agile"],
        improvedSummary: "[MOCK] A highly experienced professional with a proven track record in software engineering. Skilled in React, TypeScript, and leading high-performing teams to deliver scalable solutions."
      };
    }
    throw error;
  }
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

// Calculate ATS score and provide feedback
export async function calculateATSScore(
  resumeData: ResumeData,
  jobDescription?: string
): Promise<{
  score: number;
  breakdown: {
    category: string;
    score: number;
    feedback: string[];
  }[];
  missingKeywords: string[];
  overallFeedback: string;
}> {
  try {
    const result = await withFallback(async (model) => {
      return generateObject({
        model,
        schema: z.object({
          score: z.number().min(0).max(100).describe("Overall ATS score out of 100"),
          breakdown: z.array(z.object({
            category: z.string().describe("Category name (e.g., Content, Formatting, Keywords)"),
            score: z.number().min(0).max(100),
            feedback: z.array(z.string()).describe("Specific feedback points for this category"),
          })).describe("Breakdown of the score by category"),
          missingKeywords: z.array(z.string()).describe("Important keywords missing from the resume"),
          overallFeedback: z.string().describe("Summary of the ATS analysis"),
        }),
        prompt: `Analyze this resume for ATS (Applicant Tracking System) compatibility${jobDescription ? " against the provided job description" : ""}.
  
  Resume Data:
  ${JSON.stringify(resumeData, null, 2)}
  
  ${jobDescription ? `Job Description:\n${jobDescription}\n` : ""}
  
  Provide a score from 0 to 100 based on:
  1. Content relevance and quality
  2. Keyword matching (if job description provided, otherwise general industry keywords)
  3. Formatting (infer from data structure - e.g., clear sections)
  4. Completeness (contact info, standard sections)
  
  Be critical but constructive.`,
      });
    });

    return result.object;
  } catch (error: any) {
    console.warn("[AI] ATS scoring failed:", error.message);
    if (error.message === "NO_API_KEYS" || error.message.includes("All AI providers failed")) {
      return {
        score: 75,
        breakdown: [
          { category: "Content", score: 80, feedback: ["[MOCK] Good action verbs", "[MOCK] Quantify more results"] },
          { category: "Keywords", score: 70, feedback: ["[MOCK] Missing some technical terms"] },
          { category: "Completeness", score: 90, feedback: ["[MOCK] All sections present"] }
        ],
        missingKeywords: ["React", "TypeScript", "Next.js"],
        overallFeedback: "[MOCK] Good resume but could be more targeted."
      };
    }
    throw error;
  }
}
// Analyze keywords for side-by-side comparison
export async function analyzeKeywords(
  resumeData: ResumeData,
  jobDescription: string
): Promise<{
  found: string[];
  missing: string[];
  relevance: number;
}> {
  try {
    const result = await withFallback(async (model) => {
      return generateObject({
        model,
        schema: z.object({
          found: z.array(z.string()).describe("Important keywords from the job description that ARE present in the resume"),
          missing: z.array(z.string()).describe("Important keywords from the job description that ARE NOT present in the resume"),
          relevance: z.number().min(0).max(100).describe("Percentage of essential keywords found"),
        }),
        prompt: `Compare the following resume against the job description to identify keyword matches and gaps.
  
  Resume Data:
  ${JSON.stringify(resumeData, null, 2)}
  
  Job Description:
  ${jobDescription}
  
  Identify technical skills, tools, and industry-specific keywords. Be precise.`,
      });
    });

    return result.object;
  } catch (error: any) {
    console.warn("[AI] Keyword analysis failed:", error.message);
    if (error.message === "NO_API_KEYS" || error.message.includes("All AI providers failed")) {
      return {
        found: ["React", "JavaScript", "Project Management"],
        missing: ["TypeScript", "Next.js", "AWS"],
        relevance: 50
      };
    }
    throw error;
  }
}

// Generate a cover letter
export async function generateCoverLetter(
  resumeData: ResumeData,
  jobDescription: string,
  recipientInfo?: { name?: string; company?: string; title?: string }
): Promise<string> {
  try {
    const result = await withFallback(async (model) => {
      return generateText({
        model,
        prompt: `Write a highly professional, tailored cover letter based on the following resume and job description.
  
  Resume:
  ${JSON.stringify(resumeData, null, 2)}
  
  Job Description:
  ${jobDescription}
  
  ${recipientInfo ? `Recipient: ${recipientInfo.name || "Hiring Manager"}\nCompany: ${recipientInfo.company || ""}\nRole Title: ${recipientInfo.title || ""}` : ""}
  
  Guidelines:
  - Strong opening that highlights interest in the role.
  - 3 main paragraphs focusing on key achievements that match the job requirements.
  - Professional tone throughout.
  - Do not use placeholders like [Your Name] if the information is in the resume; use the actual data.
  - Length: 300-400 words.
  
  Provide only the cover letter content.`,
      });
    });

    return result.text.trim();
  } catch (error: any) {
    console.warn("[AI] Cover letter generation failed:", error.message);
    if (error.message === "NO_API_KEYS" || error.message.includes("All AI providers failed")) {
      return `[MOCK] Dear Hiring Manager,

I am writing to express my strong interest in the position... [This is a mock response because no API keys were configured or providers failed]`;
    }
    throw error;
  }
}
