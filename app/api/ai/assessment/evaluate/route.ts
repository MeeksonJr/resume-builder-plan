import { NextResponse } from "next/server";
import { withFallback } from "@/lib/ai/index";
import { generateText } from "ai";
import {
  CareerAssessmentTrack,
  AssessmentSubmission,
  evaluateAssessmentSubmission,
  AssessmentEvaluationResult
} from "@/lib/assessment/multi-career-engine";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { track, submission } = body as {
      track: CareerAssessmentTrack;
      submission: AssessmentSubmission;
    };

    if (!track || !submission) {
      return NextResponse.json({ error: "track and submission are required" }, { status: 400 });
    }

    // Baseline algorithmic evaluation & cryptographic badge generation
    const baseResult: AssessmentEvaluationResult = evaluateAssessmentSubmission(track, submission);

    // If candidate provided a meaningful case study response, enrich with AI qualitative review
    if (submission.caseStudyAnswer && submission.caseStudyAnswer.trim().length > 60) {
      try {
        const prompt = `You are an executive interviewer and career assessment examiner evaluating a candidate for the role of ${track.careerField} (${track.experienceLevel}).

Case Study Title: ${track.caseStudy.title}
Case Context: ${track.caseStudy.context}
Case Prompt: ${track.caseStudy.prompt}

Candidate's Submitted Response:
"""
${submission.caseStudyAnswer}
"""

Evaluate this response objectively against standard industry competencies.
Return ONLY a valid JSON object in this format:
{
  "caseScore": 85, // integer 0 to 100 based on depth, rigor, realism, and structure
  "critique": "A 2-3 sentence executive evaluation summarizing their solution quality.",
  "strengths": ["Strength 1", "Strength 2"],
  "growthAreas": ["Specific actionable growth recommendation 1", "Recommendation 2"]
}

Important: Return ONLY the JSON object.`;

        const aiResponse = await withFallback(async (model) => {
          return generateText({
            model,
            prompt,
            temperature: 0.2,
          });
        });

        const raw = aiResponse.text.trim();
        const jsonMatch = raw.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const aiEval = JSON.parse(jsonMatch[0]);
          if (typeof aiEval.caseScore === "number") {
            const aiCaseScore = Math.min(100, Math.max(20, Math.round(aiEval.caseScore)));
            const combinedOverall = Math.round((baseResult.situationalScore * 0.5) + (aiCaseScore * 0.5));
            baseResult.caseStudyScore = aiCaseScore;
            baseResult.overallScore = combinedOverall;
            baseResult.passed = combinedOverall >= 70;
            if (aiEval.critique) baseResult.feedback.caseStudyCritique = aiEval.critique;
            if (Array.isArray(aiEval.strengths) && aiEval.strengths.length > 0) {
              baseResult.feedback.strengths = aiEval.strengths;
            }
            if (Array.isArray(aiEval.growthAreas) && aiEval.growthAreas.length > 0) {
              baseResult.feedback.growthAreas = aiEval.growthAreas;
            }

            // Update badge score if badge exists
            if (baseResult.badge) {
              baseResult.badge.overallScore = combinedOverall;
              if (combinedOverall >= 92) baseResult.badge.performanceTier = "Distinguished Fellow";
              else if (combinedOverall >= 84) baseResult.badge.performanceTier = "Senior Master";
              else if (combinedOverall >= 70) baseResult.badge.performanceTier = "Certified Practitioner";
              else baseResult.badge.performanceTier = "Foundational Associate";
            }
          }
        }
      } catch (aiErr: any) {
        console.warn("[Assessment Evaluate AI fallback]:", aiErr?.message || aiErr);
      }
    }

    return NextResponse.json(baseResult);
  } catch (error: any) {
    console.error("[Assessment Evaluate Error]:", error);
    return NextResponse.json({ error: error.message || "Failed to evaluate assessment" }, { status: 500 });
  }
}
