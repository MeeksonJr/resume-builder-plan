import { executeRapidApiRequest } from "./client-cache";

export interface GeneratedInterviewQuestion {
  id: string;
  category: "Technical" | "Behavioral" | "Situational" | "System Design";
  question: string;
  suggestedAnswerFramework: string; // STAR method hints
  evaluationCriteria: string[];
  difficulty: "Junior" | "Mid" | "Senior";
}

export async function generateInterviewQuestions(params: {
  role: string;
  industry?: string;
  seniority?: "Junior" | "Mid" | "Senior";
}): Promise<GeneratedInterviewQuestion[]> {
  const role = params.role || "Software Engineer";
  const seniority = params.seniority || "Junior";

  const fallbackQuestions: GeneratedInterviewQuestion[] = [
    {
      id: "iq-1",
      category: "Technical",
      question: `Describe a time you encountered a severe performance bottleneck or memory leak in a ${role} project. How did you diagnose and resolve it?`,
      suggestedAnswerFramework: "STAR: Situation (app slowed down), Task (identify leak), Action (profiled heap snapshots, fixed listener cleanup), Result (CPU dropped 40%).",
      evaluationCriteria: ["Root cause analysis", "Profiling tooling mastery", "Measurable performance impact"],
      difficulty: seniority,
    },
    {
      id: "iq-2",
      category: "Behavioral",
      question: "How do you navigate ambiguous specifications when a product manager or stakeholder asks for a fast feature turnaround?",
      suggestedAnswerFramework: "Highlight proactive communication, creating an architectural spike, identifying trade-offs, and setting expectations.",
      evaluationCriteria: ["Stakeholder communication", "Pragmatism vs perfectionism", "Empathy"],
      difficulty: seniority,
    },
    {
      id: "iq-3",
      category: "Situational",
      question: "If a production release caused intermittent 500 errors during peak campus registration, what is your immediate protocol?",
      suggestedAnswerFramework: "1. Incident triage & rollback. 2. Log correlation with Sentry/Datadog. 3. Hotfix in isolated branch. 4. Post-mortem RCA.",
      evaluationCriteria: ["Incident composure", "Rollback-first mentality", "Blameless post-mortem culture"],
      difficulty: seniority,
    },
    {
      id: "iq-4",
      category: "System Design",
      question: `How would you architect a high-throughput webhook processing engine for incoming ${role} status events?`,
      suggestedAnswerFramework: "Discuss message broker (BullMQ / SQS), idempotent key handling, exponential backoff retries, and dead letter queues.",
      evaluationCriteria: ["Scalability", "Idempotency", "Fault tolerance"],
      difficulty: seniority,
    },
  ];

  const result = await executeRapidApiRequest<{ questions: any[] }>({
    endpoint: "interview-questions",
    url: "https://generate-job-interview-questions-ai-quick-assess.p.rapidapi.com/generate",
    host: "generate-job-interview-questions-ai-quick-assess.p.rapidapi.com",
    params: {
      role,
      level: seniority.toLowerCase(),
    },
    ttlSeconds: 86400,
    fallbackGenerator: () => ({ questions: fallbackQuestions }),
  });

  if (result.source !== "fallback" && Array.isArray(result.data?.questions) && result.data.questions.length > 0) {
    return result.data.questions.map((q: any, i: number) => ({
      id: `iq-gen-${i}`,
      category: q.category || "Technical",
      question: q.question || fallbackQuestions[i % fallbackQuestions.length].question,
      suggestedAnswerFramework: q.answer_tips || fallbackQuestions[i % fallbackQuestions.length].suggestedAnswerFramework,
      evaluationCriteria: q.criteria || fallbackQuestions[i % fallbackQuestions.length].evaluationCriteria,
      difficulty: seniority,
    }));
  }

  return fallbackQuestions;
}
