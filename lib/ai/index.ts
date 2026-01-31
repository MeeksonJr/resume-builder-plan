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

// Translate resume data to a target language
export async function translateResume(
  resumeData: any,
  targetLanguage: string
): Promise<any> {
  try {
    const result = await withFallback(async (model) => {
      return generateText({
        model,
        prompt: `Translate the following resume data into ${targetLanguage}. 
        Maintain the exact structure and JSON format.
        Translate all text content (summaries, descriptions, highlights, titles, labels) into ${targetLanguage}.
        Do NOT translate proper names, company names, or technical terms/technologies unless there is a standard translation in ${targetLanguage}.
        Ensure the tone is professional and suitable for the local job market.

        Resume Data:
        ${JSON.stringify(resumeData, null, 2)}
        
        Provide ONLY the translated JSON object.`,
      });
    });

    const text = result.text.trim();
    // Use regex to extract JSON in case the AI wraps it in markdown
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    return JSON.parse(jsonMatch ? jsonMatch[0] : text);
  } catch (error: any) {
    console.warn("[AI] Translation failed:", error.message);
    if (error.message === "NO_API_KEYS" || error.message.includes("All AI providers failed")) {
      return { ...resumeData, _mock: true }; // Return original with mock flag if failed
    }
    throw error;
  }
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

// Generate interview questions based on resume and job description
export async function generateInterviewQuestions(
  resumeData: ResumeData,
  jobDescription: string
): Promise<{
  questions: {
    question: string;
    type: "behavioral" | "technical" | "situational";
    star_guidance: string;
    sample_answer_points: string[];
  }[];
}> {
  try {
    const result = await withFallback(async (model) => {
      return generateObject({
        model,
        schema: z.object({
          questions: z.array(
            z.object({
              question: z.string(),
              type: z.enum(["behavioral", "technical", "situational"]),
              star_guidance: z.string().describe("Specific points to highlight using the STAR method (Situation, Task, Action, Result)"),
              sample_answer_points: z.array(z.string()).describe("Key talking points for a strong answer based on the resume content"),
            })
          ).min(5).max(10),
        }),
        prompt: `Act as an expert interviewer. Based on the candidate's resume and the job description, generate 5-10 tailored interview questions.
        
        Resume:
        ${JSON.stringify(resumeData, null, 2)}
        
        Job Description:
        ${jobDescription}
        
        For each question, provide guidance on how to use the STAR method to answer it effectively, drawing from the specific experiences in the candidate's resume.`,
      });
    });

    return result.object;
  } catch (error: any) {
    console.warn("[AI] Interview prep failed:", error.message);
    if (error.message === "NO_API_KEYS" || error.message.includes("All AI providers failed")) {
      return {
        questions: [
          {
            question: "[MOCK] Tell me about a time you led a challenging project.",
            type: "behavioral",
            star_guidance: "Situation: Choose a project from your work experience. Task: What was the goal? Action: What did YOU do? Result: What was the impact?",
            sample_answer_points: ["Mention your React project", "Highlight your leadership role"],
          }
        ]
      };
    }
    throw error;
  }
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
  recipientInfo?: { name?: string; company?: string; title?: string },
  tone: "professional" | "enthusiastic" | "concise" | "creative" = "professional"
): Promise<string> {
  const toneInstructions = {
    professional: "Write in a balanced, highly professional, and standard corporate tone.",
    enthusiastic: "Write with high energy, showing great passion for the company and excitement about the role.",
    concise: "Keep it brief, punchy, and direct to the point while remaining professional.",
    creative: "Use a more narrative-driven approach, focusing on storytelling and personality.",
  };

  try {
    const result = await withFallback(async (model) => {
      return generateText({
        model,
        prompt: `Write a tailored cover letter based on the following resume and job description.
  
  Resume:
  ${JSON.stringify(resumeData, null, 2)}
  
  Job Description:
  ${jobDescription}
  
  ${recipientInfo ? `Recipient: ${recipientInfo.name || "Hiring Manager"}\nCompany: ${recipientInfo.company || ""}\nRole Title: ${recipientInfo.title || ""}` : ""}
  
  Tone/Style: ${toneInstructions[tone]}
  
  Guidelines:
  - Strong opening that highlights interest in the role.
  - 3 main paragraphs (or equivalent) focusing on key achievements that match the job requirements.
  - Professional tone appropriate for the selected style.
  - Do not use placeholders like [Your Name] if the information is in the resume; use the actual data.
  - Length: ${tone === "concise" ? "150-250" : "300-400"} words.
  
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

// Generate insights based on resume performance and content
export async function getAnalyticsInsights(
  resumes: any[],
  recentEvents: any[]
): Promise<{
  insights: string[];
  keywordSuggestions: string[];
  performanceVerdict: string;
}> {
  try {
    const result = await withFallback(async (model) => {
      return generateObject({
        model,
        schema: z.object({
          insights: z.array(z.string()).describe("Actionable tips based on view/download data"),
          keywordSuggestions: z.array(z.string()).describe("Keywords that could boost visibility"),
          performanceVerdict: z.string().describe("Summary of current resume performance"),
        }),
        prompt: `Analyze the performance of these resumes and provide insights.
        
        Resumes:
        ${JSON.stringify(resumes.map(r => ({ title: r.title, views: r.view_count, last_viewed: r.last_viewed_at })), null, 2)}
        
        Recent Activity (Views/Downloads):
        ${JSON.stringify(recentEvents.slice(0, 20), null, 2)}
        
        Provide professional advice on how to improve these resumes to get more views and downloads. Focus on keyword optimization and market trends.`,
      });
    });

    return result.object;
  } catch (error: any) {
    console.warn("[AI] Analytics insights failed:", error.message);
    if (error.message === "NO_API_KEYS" || error.message.includes("All AI providers failed")) {
      return {
        insights: ["[MOCK] Your 'Modern' resume is performing well. Try adding more specific technical keywords."],
        keywordSuggestions: ["React Native", "Cloud Architecture", "System Design"],
        performanceVerdict: "[MOCK] Solid engagement, but could improve conversion with better highlights.",
      };
    }
    throw error;
  }
}
// Evaluate an interview answer using the STAR method
export async function getInterviewFeedback(
  question: string,
  answer: string,
  resumeData: ResumeData,
  jobDescription: string
): Promise<{
  score: number;
  star_breakdown: {
    situation: string;
    task: string;
    action: string;
    result: string;
  };
  scores: {
    situation: number;
    task: number;
    action: number;
    result: number;
  };
  strengths: string[];
  improvements: string[];
  ideal_answer_points: string[];
}> {
  try {
    const result = await withFallback(async (model) => {
      return generateObject({
        model,
        schema: z.object({
          score: z.number().min(0).max(100),
          star_breakdown: z.object({
            situation: z.string().describe("Evaluation of how well the situation was described"),
            task: z.string().describe("Evaluation of how clearly the task/goal was stated"),
            action: z.string().describe("Evaluation of the specific actions taken by the candidate"),
            result: z.string().describe("Evaluation of the impact and results shared"),
          }),
          scores: z.object({
            situation: z.number().min(0).max(100),
            task: z.number().min(0).max(100),
            action: z.number().min(0).max(100),
            result: z.number().min(0).max(100),
          }),
          strengths: z.array(z.string()),
          improvements: z.array(z.string()),
          ideal_answer_points: z.array(z.string()).describe("What a 'perfect' answer would include from their resume for this question"),
        }),
        prompt: `Act as a senior hiring manager and interview coach. Evaluate the following interview response using the STAR method.
        
        Question: ${question}
        User's Answer: ${answer}
        
        Candidate's Resume:
        ${JSON.stringify(resumeData, null, 2)}
        
        Job Description:
        ${jobDescription}
        
        Be critical but constructive. Score each part of the STAR framework. If a part is missing (e.g. they didn't mention a result), give it a low score and explain why.`,
      });
    });

    return result.object;
  } catch (error: any) {
    console.warn("[AI] Interview feedback failed:", error.message);
    if (error.message === "NO_API_KEYS" || error.message.includes("All AI providers failed")) {
      return {
        score: 70,
        star_breakdown: {
          situation: "[MOCK] You set the scene well.",
          task: "[MOCK] Clear objective stated.",
          action: "[MOCK] Good actions, but could use more detail on 'how'.",
          result: "[MOCK] Result was missing or vague. Quantify it!",
        },
        scores: { situation: 85, task: 80, action: 65, result: 40 },
        strengths: ["Clear communication", "Relevant experience choice"],
        improvements: ["Quantify your results", "Focus more on YOUR specific actions"],
        ideal_answer_points: ["Mention the 20% increase in efficiency from your resume", "Detail the React refactor steps"],
      };
    }
    throw error;
  }
}

// Perform a career gap analysis and generate a roadmap
export async function analyzeCareerPath(
  resumeData: ResumeData,
  targetRole: string,
  targetIndustry: string,
  careerGoals: string
): Promise<{
  match_percentage: number;
  strengths: string[];
  gaps: string[];
  roadmap: { timeframe: string; action: string; description: string }[];
  project_ideas: { title: string; difficulty: "Beginner" | "Intermediate" | "Advanced"; description: string; focus_area: string }[];
  market_trend: string;
  hiring_tip: string;
}> {
  try {
    const result = await withFallback(async (model) => {
      return generateObject({
        model,
        schema: z.object({
          match_percentage: z.number().min(0).max(100),
          strengths: z.array(z.string()),
          gaps: z.array(z.string()),
          roadmap: z.array(z.object({
            timeframe: z.string(),
            action: z.string(),
            description: z.string(),
          })).length(3),
          project_ideas: z.array(z.object({
            title: z.string(),
            difficulty: z.enum(["Beginner", "Intermediate", "Advanced"]),
            description: z.string(),
            focus_area: z.string(),
          })).length(2),
          market_trend: z.string(),
          hiring_tip: z.string(),
        }),
        prompt: `Act as a veteran career strategist and recruiter. Analyze the candidate's resume against their target career goals.
        
        Resume:
        ${JSON.stringify(resumeData, null, 2)}
        
        Target Role: ${targetRole}
        Target Industry: ${targetIndustry}
        Long-term Career Goals: ${careerGoals}
        
        Your task is to:
        1. Calculate a 'Match Percentage' based on current qualifications vs market expectations for the target role.
        2. Identify specific strengths matching the target.
        3. Pinpoint critical gaps (missing skills, certifications, or experiences).
        4. Provide a 3-step roadmap (e.g. Next 3 months, 6 months, 1 year).
        5. Suggest 2 high-impact projects that would bridge the gaps.
        6. Provide a relevant market trend for this role and one specific hiring tip.`,
      });
    });

    return result.object;
  } catch (error: any) {
    console.warn("[AI] Career analysis failed:", error.message);
    if (error.message === "NO_API_KEYS" || error.message.includes("All AI providers failed")) {
      return {
        match_percentage: 65,
        strengths: ["[MOCK] Strong React background", "[MOCK] Experience in Fintech"],
        gaps: ["[MOCK] Missing direct Cloud experience", "[MOCK] Need for leadership projects"],
        roadmap: [
          { timeframe: "Next 3 Months", action: "AWS Cloud Practitioner", description: "Get certified to prove cloud foundational knowledge." },
          { timeframe: "6 Months", action: "Internal Leadership", description: "Take ownership of a cross-functional feature." },
          { timeframe: "1 Year", action: "Senior Role Move", description: "Leverage cloud and leadership wins for promotion." }
        ],
        project_ideas: [
          { title: "Serverless Dashboard", difficulty: "Intermediate", description: "Build a monitoring tool using AWS Lambda.", focus_area: "Cloud Architecture" },
          { title: "Team Mentorship Program", difficulty: "Advanced", description: "Design a formal process for onboarding junior devs.", focus_area: "Leadership" }
        ],
        market_trend: "[MOCK] Shift towards AI-augmented development across all tech stacks.",
        hiring_tip: "[MOCK] Focus on system design during your interviews to stand out for senior roles."
      };
    }
    throw error;
  }
}

// Parse LinkedIn profile data (from PDF or text paste)
export async function parseLinkedInData(linkedinText: string): Promise<ResumeData> {
  try {
    const result = await withFallback(async (model) => {
      return generateObject({
        model,
        schema: resumeDataSchema,
        prompt: `You are an expert at extracting structured data from LinkedIn profiles.
        
        Parse the following LinkedIn profile text and extract all relevant information into a structured resume format.
        
        LinkedIn Profile Text:
        ${linkedinText}
        
        Instructions:
        - Extract personal details from the header section (name, location, headline).
        - Parse the "About" or "Summary" section into the summary field.
        - Extract all work experiences with company names, titles, dates, and descriptions.
        - Parse education history including institutions, degrees, and dates.
        - Identify skills mentioned throughout the profile.
        - Extract projects if mentioned.
        - Parse certifications and languages.
        - For dates, use YYYY-MM-DD format when possible, or YYYY-MM if day is unknown.
        - If something is not found or mentioned, leave the field empty or use an empty array.
        
        Return a complete, valid resume data object.`,
      });
    });

    return result.object;
  } catch (error: any) {
    console.warn("[AI] LinkedIn parsing failed:", error.message);
    if (error.message === "NO_API_KEYS" || error.message.includes("All AI providers failed")) {
      return {
        personalInfo: {
          fullName: "[MOCK] LinkedIn User",
          email: "user@linkedin.com",
          location: "San Francisco, CA",
          linkedin: "linkedin.com/in/user",
          summary: "[MOCK] Extracted summary from LinkedIn. Experienced professional with 5+ years in tech.",
        },
        workExperience: [
          {
            company: "[MOCK] Tech Corp",
            position: "Senior Engineer",
            location: "San Francisco, CA",
            startDate: "2020-01",
            current: true,
            description: "Leading development of key features.",
          }
        ],
        education: [
          {
            institution: "[MOCK] University",
            degree: "Bachelor of Science",
            field: "Computer Science",
            startDate: "2015-09",
            endDate: "2019-06",
          }
        ],
        skills: [{ items: ["JavaScript", "React", "Node.js"], category: "Technical Skills" }],
        projects: [],
        certifications: [],
        languages: [],
      };
    }
    throw error;
  }
}

// Generate a professional project description from a GitHub repo
export async function generateProjectFromRepo(
  repoName: string,
  repoDescription: string | null,
  repoLanguage: string | null,
  readmeContent: string | null
): Promise<{
  name: string;
  description: string;
  technologies: string[];
  highlights: string[];
}> {
  try {
    const result = await withFallback(async (model) => {
      return generateObject({
        model,
        schema: z.object({
          name: z.string(),
          description: z.string(),
          technologies: z.array(z.string()),
          highlights: z.array(z.string()).length(3),
        }),
        prompt: `You are an expert at writing compelling project descriptions for resumes.
        
        Analyze this GitHub repository and create a professional resume entry:
        
        Repository Name: ${repoName}
        Description: ${repoDescription || "No description provided"}
        Primary Language: ${repoLanguage || "Not specified"}
        README Content (first 2000 chars):
        ${readmeContent ? readmeContent.substring(0, 2000) : "No README available"}
        
        Instructions:
        - Create a concise, professional project name (clean up the repo name if needed).
        - Write a 1-2 sentence description focusing on the project's purpose and impact.
        - List 3-5 key technologies used (infer from README and language).
        - Generate exactly 3 achievement-focused bullet points (start with action verbs, quantify if possible).
        - Make it sound professional and impressive for a resume.
        
        Return a structured project object.`,
      });
    });

    return result.object;
  } catch (error: any) {
    console.warn("[AI] GitHub project generation failed:", error.message);
    if (error.message === "NO_API_KEYS" || error.message.includes("All AI providers failed")) {
      return {
        name: repoName || "[MOCK] Project Name",
        description: "[MOCK] A full-stack application demonstrating modern web development practices.",
        technologies: [repoLanguage || "JavaScript", "React", "Node.js"],
        highlights: [
          "[MOCK] Built scalable backend API serving 10K+ requests daily",
          "[MOCK] Implemented responsive UI with 95+ Lighthouse performance score",
          "[MOCK] Integrated third-party APIs for enhanced functionality"
        ],
      };
    }
    throw error;
  }
}

// Comprehensive resume quality analysis and scoring
export async function analyzeResumeQuality(
  resumeData: ResumeData,
  targetRole?: string
): Promise<{
  overallScore: number;
  scores: {
    contentQuality: number;
    keywordOptimization: number;
    atsCompatibility: number;
    completeness: number;
    impactLanguage: number;
    quantification: number;
  };
  suggestions: {
    priority: "high" | "medium" | "low";
    category: string;
    title: string;
    description: string;
  }[];
  strengths: string[];
  quickWins: string[];
}> {
  try {
    const result = await withFallback(async (model) => {
      return generateObject({
        model,
        schema: z.object({
          overallScore: z.number().min(0).max(100),
          scores: z.object({
            contentQuality: z.number().min(0).max(100),
            keywordOptimization: z.number().min(0).max(100),
            atsCompatibility: z.number().min(0).max(100),
            completeness: z.number().min(0).max(100),
            impactLanguage: z.number().min(0).max(100),
            quantification: z.number().min(0).max(100),
          }),
          suggestions: z.array(z.object({
            priority: z.enum(["high", "medium", "low"]),
            category: z.string(),
            title: z.string(),
            description: z.string(),
          })),
          strengths: z.array(z.string()).max(5),
          quickWins: z.array(z.string()).max(3),
        }),
        prompt: `You are a professional resume optimization expert. Analyze this resume and provide comprehensive feedback.

        Resume Data:
        ${JSON.stringify(resumeData, null, 2)}
        
        Target Role: ${targetRole || "General Professional"}
        
        Your task is to score this resume across 6 dimensions (0-100):
        
        1. **Content Quality** (0-100):
           - Professional language and clarity
           - Relevance to target role
           - Career progression narrative
           - Free of clichés and filler words
        
        2. **Keyword Optimization** (0-100):
           - Industry-specific terminology
           - Technical skills mentioned
           - Role-relevant keywords
           - Alignment with job market trends
        
        3. **ATS Compatibility** (0-100):
           - Clear section headers
           - Standard date formats
           - Searchable skills and technologies
           - No graphics or tables that confuse parsers
        
        4. **Completeness** (0-100):
           - All relevant sections present
           - Sufficient detail in each section
           - Contact information complete
           - No obvious gaps
        
        5. **Impact Language** (0-100):
           - Strong action verbs
           - Achievement-focused (not duty-focused)
           - Leadership and ownership indicators
           - Professional tone
        
        6. **Quantification** (0-100):
           - Numbers and metrics present
           - Results-oriented statements
           - Scale/scope indicators
           - Measurable achievements
        
        Then provide:
        - Overall score (weighted average, emphasize content and impact)
        - 3-7 specific improvement suggestions (prioritized as high/medium/low)
        - 3-5 current strengths
        - Top 3 "quick wins" (easy changes with high impact)
        
        Be specific and actionable in your suggestions.`,
      });
    });

    return result.object;
  } catch (error: any) {
    console.warn("[AI] Resume quality analysis failed:", error.message);
    if (error.message === "NO_API_KEYS" || error.message.includes("All AI providers failed")) {
      return {
        overallScore: 68,
        scores: {
          contentQuality: 72,
          keywordOptimization: 65,
          atsCompatibility: 80,
          completeness: 60,
          impactLanguage: 58,
          quantification: 45,
        },
        suggestions: [
          {
            priority: "high",
            category: "Quantification",
            title: "Add metrics to achievements",
            description: "[MOCK] Your work experience lacks specific numbers. Add metrics like '20% increase', '50+ users', or 'reduced by 3 hours' to demonstrate impact."
          },
          {
            priority: "high",
            category: "Impact Language",
            title: "Replace weak verbs",
            description: "[MOCK] Replace phrases like 'responsible for' and 'worked on' with stronger action verbs like 'led', 'architected', or 'optimized'."
          },
          {
            priority: "medium",
            category: "Completeness",
            title: "Expand project descriptions",
            description: "[MOCK] Your projects section is thin. Add 2-3 bullet points per project highlighting technologies used and outcomes achieved."
          },
        ],
        strengths: [
          "[MOCK] Clear career progression",
          "[MOCK] Strong technical skills list",
          "[MOCK] Good ATS-friendly formatting",
        ],
        quickWins: [
          "[MOCK] Add your GitHub profile URL to contact info",
          "[MOCK] Quantify your top 3 achievements with specific metrics",
          "[MOCK] Add a professional summary at the top (2-3 sentences)",
        ],
      };
    }
    throw error;
  }
}
