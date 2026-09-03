import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { generateObject } from "ai";
import { z } from "zod";

const google = createGoogleGenerativeAI({
  apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY || process.env.GEMINI_API_KEY,
});

export const maxDuration = 60;

const negotiationOutputSchema = z.object({
  overallAssessment: z.string().describe("Executive assessment of current offer vs market standard."),
  recommendedCounterBase: z.number().describe("Recommended target base salary to counter with."),
  recommendedCounterBonus: z.number().optional().describe("Recommended target bonus or signing incentive."),
  scripts: z.array(
    z.object({
      type: z.enum(["collaborative", "competitive", "value_based"]),
      title: z.string(),
      strategySummary: z.string(),
      subjectLine: z.string(),
      emailBody: z.string(),
      keyTalkingPoints: z.array(z.string()),
    })
  ),
  tacticalAdvice: z.array(z.string()),
  nonSalaryLevers: z.array(
    z.object({
      lever: z.string(),
      description: z.string(),
      typicalValue: z.string(),
    })
  ),
});

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const {
      company,
      role,
      location = "Remote / US",
      currentOffer = { baseSalary: 120000, bonus: 0, equity: 0, signingBonus: 0 },
      targetSalary,
      resumeId,
    } = body;

    if (!company || !role || !currentOffer?.baseSalary) {
      return NextResponse.json(
        { error: "Missing required fields: company, role, and currentOffer.baseSalary are required." },
        { status: 400 }
      );
    }

    // Fetch candidate resume context if resumeId provided
    let candidateName = "Candidate";
    let candidateHighlights: string[] = [];
    let candidateSkills: string[] = [];

    if (resumeId) {
      const [
        { data: personalInfo },
        { data: experiences },
        { data: skillsData },
      ] = await Promise.all([
        supabase.from("personal_info").select("full_name").eq("resume_id", resumeId).maybeSingle(),
        supabase.from("work_experiences").select("position, company, description").eq("resume_id", resumeId).limit(3),
        supabase.from("skills").select("name, skills").eq("resume_id", resumeId).limit(5),
      ]);

      if (personalInfo?.full_name) candidateName = personalInfo.full_name;

      if (experiences && experiences.length > 0) {
        candidateHighlights = experiences.map(
          (e) => `${e.position} at ${e.company}: ${e.description?.replace(/<[^>]*>?/gm, "").slice(0, 120)}`
        );
      }

      (skillsData || []).forEach((s) => {
        if (Array.isArray(s.skills)) candidateSkills.push(...s.skills);
        else if (s.name) candidateSkills.push(s.name);
      });
    }

    const currentBase = Number(currentOffer.baseSalary);
    const targetBase = targetSalary ? Number(targetSalary) : Math.round(currentBase * 1.12);
    const currentBonus = Number(currentOffer.bonus || 0);
    const currentEquity = Number(currentOffer.equity || 0);
    const currentSigning = Number(currentOffer.signingBonus || 0);
    const totalComp = currentBase + currentBonus + currentEquity + currentSigning;

    const prompt = `You are a top-tier Silicon Valley executive compensation consultant and career strategist.
A job candidate has received a formal job offer and needs high-leverage, professional negotiation email scripts and counter-offer strategy.

OFFER SPECIFICS:
Company: ${company}
Role: ${role}
Location: ${location}
Current Base Salary: $${currentBase.toLocaleString()}
Current Annual Bonus: $${currentBonus.toLocaleString()}
Current Equity/Stock: $${currentEquity.toLocaleString()} / year
Current Signing Bonus: $${currentSigning.toLocaleString()}
Total Compensation: $${totalComp.toLocaleString()}
Target Base Salary: $${targetBase.toLocaleString()}

CANDIDATE CONTEXT:
Candidate Name: ${candidateName}
Notable Strengths & Skills: ${candidateSkills.slice(0, 8).join(", ") || "Technical architecture, system delivery, execution"}
Notable Career Highlights:
${candidateHighlights.slice(0, 2).map((h) => `- ${h}`).join("\n") || "- Delivered scalable high-impact technical initiatives."}

INSTRUCTIONS:
1. Provide an executive assessment of whether the offer has room for negotiation (usually 8-15% base + sign-on bonus).
2. Recommend a precise counter base salary (usually around 10-15% above offer) and optional sign-on or bonus incentive.
3. Generate EXACTLY 3 distinct counter-offer email scripts:
   - "collaborative": Warm, partnership-focused, enthusiastic about the team, asks politely if they can align on $${targetBase.toLocaleString()}.
   - "competitive": Professional, asserts strong market value, references ongoing market discussions or competitive opportunities.
   - "value_based": Anchors strictly on candidate's technical skills and quantified ROI/impact they will deliver to ${company}.
4. Provide 4 actionable tactical pointers for delivery.
5. Provide 4 non-salary negotiation levers (e.g., signing bonus, remote flexibility, accelerated equity vesting, learning stipend) with typical value.`;

    try {
      const result = await generateObject({
        model: google("gemini-2.5-flash"),
        schema: negotiationOutputSchema,
        prompt,
        temperature: 0.65,
      });

      return NextResponse.json({
        success: true,
        data: result.object,
      });
    } catch (aiErr: any) {
      console.warn("[NEGOTIATION_AI_FALLBACK]", aiErr.message);

      // Deterministic high-quality fallback strategy
      const counterBase = Math.round(currentBase * 1.10);
      const fallbackData = {
        overallAssessment: `The initial offer from ${company} of $${currentBase.toLocaleString()} provides a solid foundation. Given current market medians for ${role} in ${location}, there is typically 8%–14% flexibility in base salary alongside sign-on bonus or equity refreshers.`,
        recommendedCounterBase: counterBase,
        recommendedCounterBonus: Math.round(currentBase * 0.08),
        scripts: [
          {
            type: "collaborative" as const,
            title: "Collaborative Partnership Counter",
            strategySummary: "Expresses immense enthusiasm for the team and culture while framing the counter as aligning with market compensation standards.",
            subjectLine: `Regarding ${role} Offer - ${candidateName}`,
            emailBody: `Dear Hiring Team,\n\nThank you so much for extending the offer to join ${company} as ${role}! I have thoroughly enjoyed our conversations and am genuinely excited about the team's vision and upcoming initiatives.\n\nAfter carefully evaluating the compensation package and considering the responsibilities of the role alongside market data for ${location}, I would be thrilled to accept immediately if we could reach a base salary of $${counterBase.toLocaleString()}.\n\nI am confident I will make an immediate impact on your key deliverables, and I look forward to working together to find a package that works for both of us.\n\nWarm regards,\n${candidateName}`,
            keyTalkingPoints: [
              "Reiterate high enthusiasm for the specific company culture and team mission.",
              "Anchor on immediate acceptance if target number is met.",
              "Maintain collaborative warmth throughout the correspondence.",
            ],
          },
          {
            type: "competitive" as const,
            title: "Competitive Market Leverage Counter",
            strategySummary: "Professional and assertive, gently signaling competitive market interest and benchmark parity.",
            subjectLine: `${company} / ${role} - Compensation Discussion - ${candidateName}`,
            emailBody: `Dear Hiring Team,\n\nI want to thank you for offering me the ${role} position at ${company}. I am deeply impressed by your engineering standards and team velocity.\n\nI am currently wrapping up conversations with a few other organizations where compensation bands for this seniority level are hovering closer to $${targetBase.toLocaleString()}. Because ${company} is my clear top choice, I would love to see if we can close the gap to $${counterBase.toLocaleString()} base salary to make this decision easy.\n\nPlease let me know if we can schedule a quick brief sync to discuss.\n\nBest regards,\n${candidateName}`,
            keyTalkingPoints: [
              "Positions candidate as an in-demand professional with market options.",
              "States clearly that this company remains the top preference.",
              "Invites a quick phone sync to finalize details smoothly.",
            ],
          },
          {
            type: "value_based" as const,
            title: "Value & ROI-Driven Counter",
            strategySummary: "Focuses entirely on candidate's technical competencies, track record, and measurable ROI.",
            subjectLine: `${role} Offer Calibration - ${candidateName}`,
            emailBody: `Dear Hiring Team,\n\nThank you for the formal offer to join ${company}. I am excited about the prospect of taking ownership of ${role}.\n\nGiven my proven track record in ${candidateSkills.slice(0, 3).join(", ") || "architecting scalable systems"} and delivering mission-critical outcomes with minimal ramp-up time, I believe I can accelerate your roadmap significantly. To reflect this level of contribution and seniority, I am requesting a base salary of $${counterBase.toLocaleString()}.\n\nI am eager to dive in and contribute to the team's success.\n\nSincerely,\n${candidateName}`,
            keyTalkingPoints: [
              "Quantify past achievements to substantiate seniority.",
              "Emphasize zero ramp-up time and rapid project delivery.",
              "Frame compensation as an investment in high-impact execution.",
            ],
          },
        ],
        tacticalAdvice: [
          "Never negotiate over text or chat; use formal email or a scheduled phone conversation.",
          "Anchor on a specific number rather than an ambiguous range to prevent being offered the lowest bracket.",
          "If base salary is strictly capped, immediately pivot to a signing bonus or accelerated 6-month performance review.",
          "Express genuine excitement for the role in every interaction to maintain strong rapport.",
        ],
        nonSalaryLevers: [
          {
            lever: "Signing Bonus",
            description: "One-time cash incentive paid on first paycheck to bridge the compensation gap without altering team base salary bands.",
            typicalValue: "$10,000 – $25,000",
          },
          {
            lever: "Equity / Stock Grant Booster",
            description: "Additional RSU or stock option grant with standard 4-year vesting schedule.",
            typicalValue: "+15% – 25% grant",
          },
          {
            lever: "Remote Work & Home Office Stipend",
            description: "Annual stipend covering high-speed internet, ergonomic setup, and co-working allowance.",
            typicalValue: "$1,500 – $3,500 / yr",
          },
          {
            lever: "Accelerated Compensation Review",
            description: "Written commitment to an early 6-month performance and compensation review based on predefined milestones.",
            typicalValue: "Milestone-based",
          },
        ],
      };

      return NextResponse.json({
        success: true,
        data: fallbackData,
      });
    }
  } catch (error: any) {
    console.error("[NEGOTIATION_SCRIPTS_ERROR]", error);
    return NextResponse.json(
      { error: error.message || "Failed to generate negotiation scripts." },
      { status: 500 }
    );
  }
}
