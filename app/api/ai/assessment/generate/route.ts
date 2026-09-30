import { NextResponse } from "next/server";
import { withFallback } from "@/lib/ai/index";
import { generateText } from "ai";
import { generateDynamicCareerAssessment, CareerAssessmentTrack, ExperienceLevel } from "@/lib/assessment/multi-career-engine";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { careerTitle, experienceLevel = "Senior Specialist", customFocus } = body;

    if (!careerTitle || typeof careerTitle !== "string" || !careerTitle.trim()) {
      return NextResponse.json({ error: "careerTitle is required" }, { status: 400 });
    }

    const title = careerTitle.trim();
    const level = (experienceLevel || "Senior Specialist") as ExperienceLevel;

    try {
      const prompt = `You are a world-class professional career assessment architect and psychometrician.
Generate a rigorous, highly realistic, non-coding professional competency assessment for the role of: "${title}" at "${level}" level.
${customFocus ? `Special Focus / Industry domain: ${customFocus}` : ""}

Return ONLY a valid JSON object matching this exact TypeScript structure:
{
  "title": "${title} Professional Competency & Strategic Assessment",
  "category": "Specialized Career",
  "overview": "Detailed 2-sentence overview of what this assessment tests in ${title}.",
  "keyCompetencies": ["Competency 1", "Competency 2", "Competency 3", "Competency 4"],
  "situationalQuestions": [
    {
      "id": "q1",
      "competency": "Competency 1",
      "scenario": "A rich 2-3 sentence realistic dilemma in ${title} with high stakes, conflicting priorities, or urgency.",
      "question": "What is the best course of action?",
      "options": [
        {
          "id": "opt-1",
          "text": "The optimal, evidence-based, professional best-practice action.",
          "isCorrect": true,
          "scoreWeight": 1.0,
          "rationale": "Clear explanation of why this decision is optimal."
        },
        {
          "id": "opt-2",
          "text": "A plausible but suboptimal reactive choice.",
          "isCorrect": false,
          "scoreWeight": 0.2,
          "rationale": "Why this causes secondary issues."
        },
        {
          "id": "opt-3",
          "text": "A common mistake or premature escalation.",
          "isCorrect": false,
          "scoreWeight": 0.0,
          "rationale": "Why this fails standard practice."
        },
        {
          "id": "opt-4",
          "text": "A passive avoidance or superficial action.",
          "isCorrect": false,
          "scoreWeight": 0.1,
          "rationale": "Why this doesn't resolve the core dilemma."
        }
      ]
    },
    {
      "id": "q2",
      "competency": "Competency 2",
      "scenario": "A second challenging realistic operational dilemma in ${title}.",
      "question": "What is the most effective approach?",
      "options": [
        {
          "id": "opt-1",
          "text": "Optimal strategic intervention.",
          "isCorrect": true,
          "scoreWeight": 1.0,
          "rationale": "Explanation."
        },
        {
          "id": "opt-2",
          "text": "Suboptimal alternative.",
          "isCorrect": false,
          "scoreWeight": 0.2,
          "rationale": "Explanation."
        },
        {
          "id": "opt-3",
          "text": "Flawed shortcut.",
          "isCorrect": false,
          "scoreWeight": 0.0,
          "rationale": "Explanation."
        },
        {
          "id": "opt-4",
          "text": "Bureaucratic delay.",
          "isCorrect": false,
          "scoreWeight": 0.1,
          "rationale": "Explanation."
        }
      ]
    }
  ],
  "caseStudy": {
    "id": "cs-1",
    "title": "${title} Strategic Turnaround & Growth Initiative",
    "brief": "Brief description of the case study.",
    "context": "Rich 3-4 sentence organizational context with constraints, team dynamics, and targets.",
    "prompt": "Specific 3-part prompt asking the candidate for: 1) Diagnostic analysis, 2) Phased execution plan, 3) Metrics & risk controls.",
    "rubric": [
      { "criterion": "Strategic Analysis & Root Cause", "description": "Thorough breakdown of underlying issues.", "points": 35 },
      { "criterion": "Actionable Execution & Resource Planning", "description": "Practical phased roadmap with clear ownership.", "points": 35 },
      { "criterion": "Metrics, KPIs & Risk Mitigation", description: "Quantifiable indicators and contingency plans.", "points": 30 }
    ],
    "sampleGoodAnswerTips": [
      "Key recommendation tip 1",
      "Key recommendation tip 2",
      "Key recommendation tip 3"
    ]
  }
}

Important: Return ONLY JSON. No introductory words, no markdown backticks outside JSON.`;

      const aiResult = await withFallback(async (model) => {
        return generateText({
          model,
          prompt,
          temperature: 0.3,
        });
      });

      const raw = aiResult.text.trim();
      const jsonMatch = raw.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        const track: CareerAssessmentTrack = {
          id: `ai-${title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${Date.now().toString(36)}`,
          careerField: title,
          category: parsed.category || "Specialized Career",
          title: parsed.title || `${title} Competency Assessment`,
          iconName: "Briefcase",
          experienceLevel: level,
          timeLimitMinutes: 20,
          overview: parsed.overview,
          keyCompetencies: parsed.keyCompetencies || ["Domain Strategy", "Execution Excellence", "Risk Mitigation", "Stakeholder Communication"],
          situationalQuestions: parsed.situationalQuestions || [],
          caseStudy: parsed.caseStudy,
        };
        return NextResponse.json({ track, source: "ai" });
      }
    } catch (aiErr: any) {
      console.warn("[Assessment Generate AI Fallback]:", aiErr?.message || aiErr);
    }

    // High quality deterministic fallback
    const fallbackTrack = generateDynamicCareerAssessment(title, level);
    return NextResponse.json({ track: fallbackTrack, source: "deterministic" });
  } catch (error: any) {
    console.error("[Assessment Generate Error]:", error);
    return NextResponse.json({ error: error.message || "Failed to generate assessment" }, { status: 500 });
  }
}
