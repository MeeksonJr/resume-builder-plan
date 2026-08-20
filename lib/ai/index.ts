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
  apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY || process.env.GEMINI_API_KEY,
});

const openai = createOpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Resume data schema for extraction
export const resumeDataSchema = z.object({
  personalInfo: z.object({
    fullName: z.string().optional(),
    // Simplified schema for AI robustness - validated strictly in UI/DB if needed
    email: z.string().optional().describe("Email address if available"),
    phone: z.string().optional().describe("Phone number if available"),
    address: z.string().optional(),
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
  hobbies: z.array(z.string()).optional(),
});

export type ResumeData = z.infer<typeof resumeDataSchema>;

// AI model fallback chain
async function withFallback<T>(
  operation: (model: ReturnType<typeof groq | typeof google | typeof openai>) => Promise<T>
): Promise<T> {
  // Check if any keys are available and non-empty
  const hasKeys =
    (process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY.length > 0) ||
    (process.env.GOOGLE_GENERATIVE_AI_API_KEY && process.env.GOOGLE_GENERATIVE_AI_API_KEY.length > 0) ||
    (process.env.GROQ_API_KEY && process.env.GROQ_API_KEY.length > 0) ||
    (process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY.length > 0);

  if (!hasKeys) {
    console.warn("[AI] No valid API keys found.");
    throw new Error("NO_API_KEYS");
  }

  const models = [
    { provider: google, model: "gemini-2.5-flash", name: "Gemini" },
    { provider: groq, model: "llama-3.3-70b-versatile", name: "Groq" },
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

// Generate a full resume from onboarding data
export async function generateFullResume(data: {
  role: string;
  experienceLevel: string;
  workHistory?: string;
  education?: string;
  projects?: string;
  skills: string[];
  achievements: string;
  languages?: string;
  hobbies?: string;
  additionalInfo?: string;
}): Promise<ResumeData> {
  const result = await withFallback(async (model) => {
    return generateObject({
      model,
      schema: resumeDataSchema,
      prompt: `Create a comprehensive, professional, and highly detailed full resume based on the following onboarding information for a ${data.role} (${data.experienceLevel} level).
      
      User-Provided Information:
      - Work History: ${data.workHistory || "Not specified - generate realistic placeholders"}
      - Education: ${data.education || "Not specified - generate realistic placeholders"}
      - Projects: ${data.projects || "Not specified - generate realistic placeholders"}
      - Skills: ${data.skills.join(", ") || "Provide industry-standard skills for this role"}
      - Key Achievements: ${data.achievements || "Flesh out based on role expectations"}
      - Languages: ${data.languages || "English"}
      - Hobbies: ${data.hobbies || "Not specified"}
      - Additional Context: ${data.additionalInfo || "None"}
      
      CRITICAL INSTRUCTIONS:
      1. FULL COMPLETION: You MUST populate ALL sections: Personal Info, Summary, Work Experience (2-4 entries), Education (1-2 entries), Skills, Projects, and Languages.
      2. EDUCATION IS MANDATORY: Even if the user provided no education details, you MUST generate at least one realistic Education entry (e.g., "Bachelor of Science" relevant to the role). DO NOT LEAVE EDUCATION EMPTY.
      3. INTELLIGENT HALLUCINATION: If the user provided sparse info, use your knowledge of the ${data.role} role to create realistic, high-quality placeholders.
      4. SMART PLACEHOLDERS: Use professional placeholders like "[Insert Company Name]" or "[YYYY] - [Present]" only when absolutely necessary. Prefer realistic data.
      4. IMPACTFUL CONTENT: Write bullet points using the STAR method (Situation, Task, Action, Result). Use strong action verbs and quantify achievements (e.g., "Increased efficiency by 20%").
      5. PROFESSIONAL TONE: Ensure the language is sophisticated and tailored to the ${data.role} market.
      6. SKILLS: Categorize skills logically (e.g., Technical, Professional, Tools).
      
      The goal is to give the user a 90% complete resume that looks amazing, which they can then fine-tune.`,
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
    if (error.message === "NO_API_KEYS" || error.message.includes("All AI providers failed") || error.message.includes("insufficient_quota") || error.message.includes("429")) {
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
        prompt: `Analyze the performance of these resumes and provide strategic career insights.
        
        Resumes:
        ${JSON.stringify(resumes.map(r => ({ title: r.title, views: r.view_count, last_viewed: r.last_viewed_at })), null, 2)}
        
        Recent Activity (Views/Downloads):
        ${JSON.stringify(recentEvents.slice(0, 20), null, 2)}
        
        Instructions:
        1. insights: Provide 4 concise, actionable tips based on the data.
        2. keywordSuggestions: Provide 5-8 short, high-impact industry keywords (e.g., "React", "Cloud Native", "DevOps"). 
           - DO NOT include descriptions or long sentences. 
           - Each keyword MUST be 1-3 words maximum.
        3. performanceVerdict: Provide a single, impactful summary of the current resume performance.`,
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

/**
 * Generate personalized interview questions based on resume and target role
 */
export async function generateInterviewQuestions(
  resumeData: ResumeData,
  targetRole: string,
  difficulty: "junior" | "mid" | "senior"
): Promise<{
  questions: {
    type: "behavioral" | "technical" | "situational";
    question: string;
  }[];
}> {
  try {
    const result = await withFallback(async (model) => {
      return generateObject({
        model,
        schema: z.object({
          questions: z.array(z.object({
            type: z.enum(["behavioral", "technical", "situational"]),
            question: z.string(),
          })),
        }),
        prompt: `You are an expert technical interviewer. Generate 12 personalized interview questions for a ${targetRole} position at the ${difficulty} level.

        Candidate's Resume:
        ${JSON.stringify(resumeData, null, 2)}
        
        Target Role: ${targetRole}
        Experience Level: ${difficulty}
        
        Generate questions across three categories:
        
        1. **Behavioral Questions (30%)** - Focus on past experiences
           - Ask about specific projects/roles mentioned in their resume
           - Use "Tell me about a time when..." format
           - Focus on teamwork, leadership, conflict resolution
           ${difficulty === "senior" ? "- Include questions about mentoring and strategic decision-making" : ""}
        
        2. **Technical Questions (40%)** - Role-specific knowledge
           - Reference technologies and skills from their resume
           - Adjust complexity based on experience level
           ${difficulty === "junior" ? "- Focus on fundamentals and core concepts" : ""}
           ${difficulty === "mid" ? "- Include system design and best practices" : ""}
           ${difficulty === "senior" ? "- Include architecture decisions and scaling challenges" : ""}
        
        3. **Situational Questions (30%)** - Hypothetical scenarios
           - Present realistic challenges for the target role
           - Test problem-solving and decision-making
           - Align with the candidate's experience level
        
        Important:
        - Make questions specific to their background (e.g., "I see you worked on [project], tell me about...")
        - Ensure difficulty matches the ${difficulty} level
        - Mix easy, medium, and hard questions
        - Questions should be concise but clear
        - Total: 12 questions`,
      });
    });

    return result.object;
  } catch (error: any) {
    console.warn("[AI] Interview question generation failed:", error.message);
    if (error.message === "NO_API_KEYS" || error.message.includes("All AI providers failed")) {
      // Return mock questions as fallback
      return {
        questions: [
          { type: "behavioral", question: "[MOCK] Tell me about a time when you faced a significant technical challenge. How did you approach it?" },
          { type: "technical", question: "[MOCK] How would you design a scalable system for handling 1 million concurrent users?" },
          { type: "situational", question: "[MOCK] If you discovered a critical bug in production just before a major release, what would you do?" },
          { type: "behavioral", question: "[MOCK] Describe a situation where you had to work with a difficult team member. How did you handle it?" },
          { type: "technical", question: "[MOCK] Explain the difference between synchronous and asynchronous programming. When would you use each?" },
          { type: "situational", question: "[MOCK] How would you prioritize tasks if you had three urgent deadlines on the same day?" },
          { type: "behavioral", question: "[MOCK] Tell me about a project you're most proud of. What was your role and what did you achieve?" },
          { type: "technical", question: "[MOCK] What strategies do you use to ensure code quality and maintainability?" },
          { type: "situational", question: "[MOCK] If a stakeholder requested a feature that you believed would negatively impact the product, how would you handle it?" },
          { type: "behavioral", question: "[MOCK] Describe a time when you had to learn a new technology quickly. How did you approach it?" },
          { type: "technical", question: "[MOCK] How do you approach debugging a complex issue in a large codebase?" },
          { type: "situational", question: "[MOCK] If you joined a team with poor documentation and no onboarding process, what would be your first steps?" },
        ],
      };
    }
    throw error;
  }
}

/**
 * Evaluate interview answer using STAR framework
 */
export async function evaluateInterviewAnswer(
  question: string,
  answer: string,
  questionType: "behavioral" | "technical" | "situational"
): Promise<{
  overallScore: number;
  scores: {
    clarity: number;
    relevance: number;
    depth: number;
    starCompleteness: number;
  };
  strengths: string[];
  improvements: string[];
  starAnalysis: {
    situation: "present" | "missing" | "unclear" | "n/a";
    task: "present" | "missing" | "unclear" | "n/a";
    action: "present" | "missing" | "unclear" | "n/a";
    result: "present" | "missing" | "unclear" | "n/a";
  };
  suggestedAnswer: string;
}> {
  try {
    const result = await withFallback(async (model) => {
      return generateObject({
        model,
        schema: z.object({
          overallScore: z.number().min(0).max(100),
          scores: z.object({
            clarity: z.number().min(0).max(100),
            relevance: z.number().min(0).max(100),
            depth: z.number().min(0).max(100),
            starCompleteness: z.number().min(0).max(100),
          }),
          strengths: z.array(z.string()).max(5),
          improvements: z.array(z.string()).max(5),
          starAnalysis: z.object({
            situation: z.enum(["present", "missing", "unclear", "n/a"]),
            task: z.enum(["present", "missing", "unclear", "n/a"]),
            action: z.enum(["present", "missing", "unclear", "n/a"]),
            result: z.enum(["present", "missing", "unclear", "n/a"]),
          }),
          suggestedAnswer: z.string(),
        }),
        prompt: `You are an expert interview coach. Evaluate this interview answer using the STAR framework and provide constructive feedback.

        Question Type: ${questionType}
        Question: ${question}
        
        Candidate's Answer:
        ${answer}
        
        Evaluation Criteria:
        
        1. **Clarity (0-100)**: Is the answer well-structured and easy to understand?
           - Clear introduction and conclusion
           - Logical flow of information
           - No rambling or tangents
        
        2. **Relevance (0-100)**: Does the answer directly address the question?
           - Stays on topic
           - Provides appropriate examples
           - Doesn't include unnecessary information
        
        3. **Depth (0-100)**: How thorough and detailed is the response?
           - Sufficient detail without being excessive
           - Demonstrates deep understanding
           - Provides context and nuance
        
        4. **STAR Completeness (0-100)**: For behavioral questions, how well does it follow STAR?
           ${questionType === "behavioral" ? `
           - **Situation**: Sets up the context clearly
           - **Task**: Explains what needed to be done
           - **Action**: Describes specific actions taken
           - **Result**: Shares measurable outcomes
           ` : "- For non-behavioral questions, evaluate how well they structure their response"}
        
        Analyze the answer:
        - Calculate scores for each criterion (0-100)
        - Overall score is weighted average: 25% clarity, 25% relevance, 25% depth, 25% STAR
        - List 2-4 specific strengths (what they did well)
        - List 2-4 specific improvements (actionable suggestions)
        - For STAR analysis, mark each component as:
          * "present": Clearly included and well-articulated
          * "unclear": Mentioned but vague or incomplete
          * "missing": Not addressed at all
          * "n/a": Not applicable for this question type
        - Provide a suggested answer showing how to improve (keep it concise, 150-200 words)
        
        Be constructive and encouraging in feedback while being honest about areas for improvement.`,
      });
    });

    return result.object;
  } catch (error: any) {
    console.warn("[AI] Interview answer evaluation failed:", error.message);
    if (error.message === "NO_API_KEYS" || error.message.includes("All AI providers failed")) {
      // Return mock evaluation as fallback
      return {
        overallScore: 65,
        scores: {
          clarity: 70,
          relevance: 75,
          depth: 50,
          starCompleteness: 65,
        },
        strengths: [
          "[MOCK] You provided a relevant example from your experience",
          "[MOCK] Your answer was well-structured and easy to follow",
        ],
        improvements: [
          "[MOCK] Include more specific metrics or outcomes (e.g., '20% improvement')",
          "[MOCK] Strengthen the 'Result' section with quantifiable achievements",
          "[MOCK] Add more detail about the specific actions you took",
        ],
        starAnalysis: {
          situation: "present",
          task: "unclear",
          action: "present",
          result: "unclear",
        },
        suggestedAnswer: "[MOCK] A stronger answer would be: 'When I was working on the e-commerce platform (Situation), we needed to reduce page load times by 50% (Task). I implemented lazy loading for images, optimized our database queries, and set up CDN caching (Action). As a result, page load time decreased from 4.2s to 1.8s, leading to a 23% increase in conversion rate (Result).'",
      };
    }
    throw error;
  }
}

// ============================================================================
// PHASE 35: AI POWER-UPS ENHANCEMENT
// ============================================================================

/**
 * Get real-time writing suggestions while typing
 */
export async function getWritingSuggestions(
  partialText: string,
  context: {
    section: "summary" | "experience" | "education" | "project" | "skill";
    fieldName?: string;
    resumeData?: Partial<ResumeData>;
  }
): Promise<{
  suggestions: string[];
  completions: string[];
  improvements: string[];
}> {
  try {
    const result = await withFallback(async (model) => {
      return generateObject({
        model,
        schema: z.object({
          suggestions: z.array(z.string()).max(3).describe("Short inline suggestions to complete the current sentence"),
          completions: z.array(z.string()).max(2).describe("Full sentence completions based on context"),
          improvements: z.array(z.string()).max(2).describe("Alternative phrasings that are more impactful"),
        }),
        prompt: `You are a professional resume writing assistant. Provide real-time writing suggestions.

Current text being typed: "${partialText}"
Section: ${context.section}
${context.fieldName ? `Field: ${context.fieldName}` : ""}
${context.resumeData ? `Resume context: ${JSON.stringify(context.resumeData, null, 2)}` : ""}

Provide:
1. Short suggestions (3-5 words) to complete the current thought
2. Full sentence completions that sound professional
3. Alternative phrasings that are more impactful and action-oriented

Keep suggestions concise and immediately usable. Focus on:
- Strong action verbs
- Quantifiable achievements
- Professional tone
- ATS-friendly language`,
      });
    });

    return result.object;
  } catch (error: any) {
    console.warn("[AI] Writing suggestions failed:", error.message);
    if (error.message === "NO_API_KEYS" || error.message.includes("All AI providers failed")) {
      return {
        suggestions: ["led the development of", "implemented a solution that", "improved efficiency by"],
        completions: [`${partialText} resulting in significant improvements to team productivity.`],
        improvements: ["Spearheaded", "Orchestrated", "Drove"],
      };
    }
    throw error;
  }
}

/**
 * Calculate job match score with detailed breakdown
 */
export async function calculateJobMatchScore(
  resumeData: ResumeData,
  jobPosting: string
): Promise<{
  overallScore: number;
  breakdown: {
    skillsMatch: { score: number; matched: string[]; missing: string[] };
    experienceMatch: { score: number; feedback: string };
    educationMatch: { score: number; feedback: string };
    keywordMatch: { score: number; found: string[]; missing: string[] };
  };
  recommendations: string[];
  strongPoints: string[];
  dealBreakers: string[];
}> {
  try {
    const result = await withFallback(async (model) => {
      return generateObject({
        model,
        schema: z.object({
          overallScore: z.number().min(0).max(100),
          breakdown: z.object({
            skillsMatch: z.object({
              score: z.number().min(0).max(100),
              matched: z.array(z.string()),
              missing: z.array(z.string()),
            }),
            experienceMatch: z.object({
              score: z.number().min(0).max(100),
              feedback: z.string(),
            }),
            educationMatch: z.object({
              score: z.number().min(0).max(100),
              feedback: z.string(),
            }),
            keywordMatch: z.object({
              score: z.number().min(0).max(100),
              found: z.array(z.string()),
              missing: z.array(z.string()),
            }),
          }),
          recommendations: z.array(z.string()).max(5),
          strongPoints: z.array(z.string()).max(3),
          dealBreakers: z.array(z.string()).max(3),
        }),
        prompt: `You are an expert HR recruiter and ATS specialist. Analyze how well this resume matches the job posting.

Resume:
${JSON.stringify(resumeData, null, 2)}

Job Posting:
${jobPosting}

Provide a detailed match analysis:

1. **Overall Score (0-100)**: How likely is this candidate to pass initial screening?

2. **Skills Match**: 
   - Score the technical and soft skills alignment
   - List matched skills found in both resume and job
   - List critical missing skills from the job requirements

3. **Experience Match**:
   - Score based on years, seniority level, and relevance
   - Provide specific feedback

4. **Education Match**:
   - Score based on degree requirements
   - Provide specific feedback

5. **Keyword Match**:
   - Score ATS keyword optimization
   - List found and missing keywords

6. **Recommendations**: Top 5 actionable improvements to increase match score

7. **Strong Points**: What makes this candidate stand out

8. **Deal Breakers**: Any critical gaps that could disqualify the candidate

Be specific and actionable in your analysis.`,
      });
    });

    return result.object;
  } catch (error: any) {
    console.warn("[AI] Job match scoring failed:", error.message);
    if (error.message === "NO_API_KEYS" || error.message.includes("All AI providers failed")) {
      return {
        overallScore: 65,
        breakdown: {
          skillsMatch: { score: 70, matched: ["JavaScript", "React"], missing: ["TypeScript", "AWS"] },
          experienceMatch: { score: 60, feedback: "[MOCK] Experience level appears to be slightly below requirements." },
          educationMatch: { score: 80, feedback: "[MOCK] Education requirements are met." },
          keywordMatch: { score: 55, found: ["development", "team"], missing: ["agile", "scrum", "CI/CD"] },
        },
        recommendations: ["[MOCK] Add TypeScript to your skills", "[MOCK] Include more metrics in achievements"],
        strongPoints: ["[MOCK] Strong React experience", "[MOCK] Good project portfolio"],
        dealBreakers: ["[MOCK] Missing required cloud experience"],
      };
    }
    throw error;
  }
}

/**
 * Auto-complete an incomplete resume section
 */
export async function autoCompleteSection(
  sectionType: "summary" | "experience" | "education" | "project" | "skills",
  existingData: Partial<ResumeData>,
  partialSectionData?: any
): Promise<{
  generatedContent: any;
  confidence: number;
  notes: string[];
}> {
  try {
    const sectionSchemas = {
      summary: z.object({
        generatedContent: z.object({
          summary: z.string(),
        }),
        confidence: z.number().min(0).max(100),
        notes: z.array(z.string()),
      }),
      experience: z.object({
        generatedContent: z.object({
          position: z.string().optional(),
          company: z.string().optional(),
          description: z.string(),
          highlights: z.array(z.string()),
        }),
        confidence: z.number().min(0).max(100),
        notes: z.array(z.string()),
      }),
      education: z.object({
        generatedContent: z.object({
          degree: z.string().optional(),
          field: z.string().optional(),
          highlights: z.array(z.string()),
        }),
        confidence: z.number().min(0).max(100),
        notes: z.array(z.string()),
      }),
      project: z.object({
        generatedContent: z.object({
          description: z.string(),
          highlights: z.array(z.string()),
          technologies: z.array(z.string()),
        }),
        confidence: z.number().min(0).max(100),
        notes: z.array(z.string()),
      }),
      skills: z.object({
        generatedContent: z.object({
          suggestedSkills: z.array(z.object({
            category: z.string(),
            items: z.array(z.string()),
          })),
        }),
        confidence: z.number().min(0).max(100),
        notes: z.array(z.string()),
      }),
    };

    const result = await withFallback(async (model) => {
      return generateObject({
        model,
        schema: sectionSchemas[sectionType] as any,
        prompt: `You are a professional resume writer. Auto-complete the missing parts of this ${sectionType} section.

Existing Resume Data:
${JSON.stringify(existingData, null, 2)}

${partialSectionData ? `Partial Section Data to Complete:\n${JSON.stringify(partialSectionData, null, 2)}` : "Generate content from scratch based on the resume context."}

Section Type: ${sectionType}

Instructions:
- Generate professional, compelling content that fits the candidate's background
- Use strong action verbs and quantifiable achievements where appropriate
- Keep the tone consistent with the existing resume
- For skills, suggest relevant skills based on their experience
- Provide a confidence score (0-100) for how certain you are about the generated content
- Include notes about any assumptions made or suggestions for improvement

Be specific and make the content immediately usable.`,
      });
    });

    return result.object as any;
  } catch (error: any) {
    console.warn("[AI] Section auto-complete failed:", error.message);
    if (error.message === "NO_API_KEYS" || error.message.includes("All AI providers failed")) {
      return {
        generatedContent: sectionType === "summary"
          ? { summary: "[MOCK] Results-driven professional with 5+ years of experience..." }
          : sectionType === "skills"
            ? { suggestedSkills: [{ category: "Technical", items: ["JavaScript", "React", "Node.js"] }] }
            : { description: "[MOCK] Generated description...", highlights: ["[MOCK] Achievement 1", "[MOCK] Achievement 2"] },
        confidence: 60,
        notes: ["[MOCK] This is placeholder content. Configure AI providers for real suggestions."],
      };
    }
    throw error;
  }
}

/**
 * Bulk optimize entire resume at once
 */
export async function bulkOptimizeResume(
  resumeData: ResumeData,
  options: {
    targetRole?: string;
    jobDescription?: string;
    focusAreas?: ("impact" | "keywords" | "clarity" | "ats" | "brevity")[];
  } = {}
): Promise<{
  optimizedResume: ResumeData;
  changes: {
    section: string;
    original: string;
    optimized: string;
    reason: string;
  }[];
  overallImprovements: string[];
  scoreImprovement: { before: number; after: number };
}> {
  try {
    const result = await withFallback(async (model) => {
      return generateObject({
        model,
        schema: z.object({
          optimizedResume: resumeDataSchema,
          changes: z.array(z.object({
            section: z.string(),
            original: z.string(),
            optimized: z.string(),
            reason: z.string(),
          })),
          overallImprovements: z.array(z.string()).max(5),
          scoreImprovement: z.object({
            before: z.number().min(0).max(100),
            after: z.number().min(0).max(100),
          }),
        }),
        prompt: `You are a senior resume optimization expert. Perform a comprehensive optimization of this entire resume.

Current Resume:
${JSON.stringify(resumeData, null, 2)}

${options.targetRole ? `Target Role: ${options.targetRole}` : ""}
${options.jobDescription ? `Job Description:\n${options.jobDescription}` : ""}
Focus Areas: ${options.focusAreas?.join(", ") || "all aspects"}

Optimization Guidelines:

1. **Impact Enhancement**:
   - Replace weak verbs with strong action verbs
   - Add quantifiable metrics where possible
   - Focus on achievements over responsibilities

2. **Keyword Optimization**:
   - Add industry-relevant keywords
   - Optimize for ATS systems
   - Include technical and soft skills

3. **Clarity Improvements**:
   - Remove filler words and jargon
   - Make sentences more concise
   - Improve readability

4. **ATS Compatibility**:
   - Use standard section headings
   - Remove special characters that confuse parsers
   - Optimize formatting

5. **Brevity**:
   - Trim verbose descriptions
   - Keep bullet points under 2 lines
   - Remove redundant information

Provide:
- The fully optimized resume
- A list of specific changes made with reasons
- Summary of overall improvements
- Estimated score improvement`,
      });
    });

    return result.object;
  } catch (error: any) {
    console.warn("[AI] Bulk optimization failed:", error.message);
    if (error.message === "NO_API_KEYS" || error.message.includes("All AI providers failed")) {
      return {
        optimizedResume: resumeData,
        changes: [
          {
            section: "summary",
            original: resumeData.personalInfo?.summary || "",
            optimized: "[MOCK] Optimized summary would appear here",
            reason: "[MOCK] Added stronger action verbs and metrics",
          },
        ],
        overallImprovements: [
          "[MOCK] Added 5 quantifiable achievements",
          "[MOCK] Improved keyword density by 30%",
          "[MOCK] Reduced word count by 15%",
        ],
        scoreImprovement: { before: 65, after: 82 },
      };
    }
    throw error;
  }
}

/**
 * Adjust the tone of resume content
 */
export async function adjustTone(
  content: string | ResumeData,
  targetTone: "professional" | "casual" | "technical" | "creative" | "executive" | "entry-level",
  scope: "full" | "summary" | "experience" | "selected"
): Promise<{
  adjustedContent: string | ResumeData;
  toneAnalysis: {
    originalTone: string;
    targetTone: string;
    changes: string[];
  };
}> {
  const toneDescriptions = {
    professional: "Formal, polished, corporate-appropriate language with focus on achievements",
    casual: "Friendly, approachable while maintaining professionalism",
    technical: "Detailed, specification-focused, emphasizing technologies and methodologies",
    creative: "Dynamic, unique phrasing that showcases personality and innovation",
    executive: "Strategic, leadership-focused, emphasizing vision and business impact",
    "entry-level": "Enthusiastic, potential-focused, highlighting learning and growth",
  };

  try {
    const isFullResume = typeof content !== "string";

    const result = await withFallback(async (model) => {
      if (isFullResume) {
        return generateObject({
          model,
          schema: z.object({
            adjustedContent: resumeDataSchema,
            toneAnalysis: z.object({
              originalTone: z.string(),
              targetTone: z.string(),
              changes: z.array(z.string()),
            }),
          }),
          prompt: `You are an expert resume writer. Adjust the tone of this entire resume.

Current Resume:
${JSON.stringify(content, null, 2)}

Target Tone: ${targetTone}
Tone Description: ${toneDescriptions[targetTone]}
Scope: ${scope}

Instructions:
- Rewrite content to match the target tone
- Maintain all factual information
- Keep the same structure and sections
- Adjust vocabulary, sentence structure, and emphasis
- Don't fabricate new achievements or skills

Provide the adjusted resume and analysis of changes made.`,
        });
      } else {
        return generateObject({
          model,
          schema: z.object({
            adjustedContent: z.string(),
            toneAnalysis: z.object({
              originalTone: z.string(),
              targetTone: z.string(),
              changes: z.array(z.string()),
            }),
          }),
          prompt: `You are an expert resume writer. Adjust the tone of this text.

Original Text:
${content}

Target Tone: ${targetTone}
Tone Description: ${toneDescriptions[targetTone]}

Instructions:
- Rewrite the text to match the target tone
- Maintain the core message and facts
- Adjust vocabulary and sentence structure appropriately

Provide the adjusted text and analysis.`,
        });
      }
    });

    return result.object;
  } catch (error: any) {
    console.warn("[AI] Tone adjustment failed:", error.message);
    if (error.message === "NO_API_KEYS" || error.message.includes("All AI providers failed")) {
      return {
        adjustedContent: content,
        toneAnalysis: {
          originalTone: "[MOCK] Professional",
          targetTone: targetTone,
          changes: ["[MOCK] Would adjust vocabulary", "[MOCK] Would modify sentence structure"],
        },
      };
    }
    throw error;
  }
}

/**
 * Customize resume for a specific industry
 */
export async function customizeForIndustry(
  resumeData: ResumeData,
  targetIndustry: string,
  options?: {
    subIndustry?: string;
    companySize?: "startup" | "mid" | "enterprise";
    role?: string;
  }
): Promise<{
  customizedResume: ResumeData;
  industryKeywords: string[];
  formattingTips: string[];
  industryInsights: {
    trends: string[];
    valuedSkills: string[];
    commonMistakes: string[];
  };
  changes: {
    section: string;
    change: string;
    reason: string;
  }[];
}> {
  try {
    const result = await withFallback(async (model) => {
      return generateObject({
        model,
        schema: z.object({
          customizedResume: resumeDataSchema,
          industryKeywords: z.array(z.string()).max(20),
          formattingTips: z.array(z.string()).max(5),
          industryInsights: z.object({
            trends: z.array(z.string()).max(3),
            valuedSkills: z.array(z.string()).max(10),
            commonMistakes: z.array(z.string()).max(10),
          }),
          changes: z.array(z.object({
            section: z.string(),
            change: z.string(),
            reason: z.string(),
          })),
        }),
        prompt: `You are an industry-specific resume customization expert. Adapt this resume for the ${targetIndustry} industry.

Current Resume:
${JSON.stringify(resumeData, null, 2)}

Target Industry: ${targetIndustry}
${options?.subIndustry ? `Sub-industry: ${options.subIndustry}` : ""}
${options?.companySize ? `Target Company Size: ${options.companySize}` : ""}
${options?.role ? `Target Role: ${options.role}` : ""}

Customization Tasks:

1. **Vocabulary Adjustment**:
   - Replace generic terms with industry-specific terminology
   - Use jargon appropriately for the target audience
   - Adjust technical depth based on typical readers

2. **Keyword Optimization**:
   - Add critical industry keywords
   - Include relevant certifications and tools
   - Optimize for industry-specific ATS systems

3. **Achievement Reframing**:
   - Highlight achievements most relevant to this industry
   - Adjust metrics to resonate with industry priorities
   - Emphasize transferable skills appropriately

4. **Format Suggestions**:
   - Recommend industry-appropriate formatting
   - Suggest section ordering for maximum impact
   - Note any industry-specific conventions

5. **Industry Insights**:
   - Current hiring trends in ${targetIndustry}
   - Most valued skills for this industry
   - Common resume mistakes for this industry

Provide the customized resume and detailed insights.`,
      });
    });

    return result.object;
  } catch (error: any) {
    console.warn("[AI] Industry customization failed:", error.message);
    if (error.message === "NO_API_KEYS" || error.message.includes("All AI providers failed")) {
      return {
        customizedResume: resumeData,
        industryKeywords: ["[MOCK] " + targetIndustry, "[MOCK] Industry term 1", "[MOCK] Industry term 2"],
        formattingTips: ["[MOCK] Use industry-standard sections", "[MOCK] Highlight relevant certifications"],
        industryInsights: {
          trends: ["[MOCK] Digital transformation is key", "[MOCK] Remote work emphasis"],
          valuedSkills: ["[MOCK] Communication", "[MOCK] Technical Skills", "[MOCK] Leadership"],
          commonMistakes: ["[MOCK] Using generic language", "[MOCK] Missing industry keywords"],
        },
        changes: [
          {
            section: "summary",
            change: "[MOCK] Would add industry-specific terminology",
            reason: "[MOCK] Better alignment with industry expectations",
          },
        ],
      };
    }
    throw error;
  }
}

// Generate a suggested answer for an interview question
export async function generateSuggestedAnswer(
  question: string,
  questionType: string,
  targetRole: string,
  context?: string
): Promise<string> {
  try {
    const result = await withFallback(async (model) => {
      return generateText({
        model,
        prompt: `You are an expert interview coach. Generate a high-quality, "ideal" answer for the following interview question.
        
        Question: ${question}
        Question Type: ${questionType}
        Target Role: ${targetRole}
        ${context ? `Context/Key Points to Include: ${context}` : ""}
        
        Instructions:
        - Use the STAR method (Situation, Task, Action, Result) if it is a behavioral question.
        - Be specific, professional, and concise (approx. 150-200 words).
        - Focus on highlighting relevant skills for a ${targetRole}.
        - Do not use placeholders like "[Your Name]". Write it as if you are a strong candidate speaking.
        
        Provide ONLY the suggested answer text.`,
      });
    });

    return result.text.trim();
  } catch (error: any) {
    console.warn("[AI] Suggested answer generation failed:", error.message);
    if (error.message === "NO_API_KEYS" || error.message.includes("All AI providers failed")) {
      return "[MOCK] Ideally, you should structure your answer using the STAR method. Start with a relevant situation, describe the task, explain your specific actions, and end with the positive result. For this question, focus on your problem-solving skills.";
    }
    throw error;
  }
}

