import Groq from "groq-sdk";

const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY,
});

export interface EvaluationResult {
    score: number; // 1-10
    strengths: string[];
    weaknesses: string[];
    improvements: string[];
    overallFeedback: string;
    scores: {
        situation: number; // 0-100
        task: number; // 0-100
        action: number; // 0-100
        result: number; // 0-100
    };
    starBreakdown: {
        situation: string;
        task: string;
        action: string;
        result: string;
    };
}

export interface AnswerContext {
    question: string;
    questionType: string;
    answer: string;
    difficulty: string;
}

export async function evaluateInterviewAnswer(
    context: AnswerContext
): Promise<EvaluationResult> {
    const prompt = `You are an expert interview coach evaluating a candidate's answer to an interview question.

Question Type: ${context.questionType}
Difficulty: ${context.difficulty}
Question: ${context.question}

Candidate's Answer: ${context.answer}

Please evaluate this answer using the STAR method (Situation, Task, Action, Result) and provide:
1. An overall score from 1-10 (1=poor, 10=excellent)
2. Detailed scores (0-100) for each STAR component:
   - Situation: Context and background
   - Task: Challenges and goals
   - Action: Specific steps taken (most important)
   - Result: Outcomes and learnings
3. A breakdown of the answer mapping it to the STAR framework (extract the relevant parts or note "Missing")
4. 2-3 key strengths
5. 2-3 main weaknesses
6. 3-4 actionable improvements
7. Overall feedback summary

Format your response as JSON with this structure:
{
  "score": <number 1-10>,
  "scores": {
    "situation": <number 0-100>,
    "task": <number 0-100>,
    "action": <number 0-100>,
    "result": <number 0-100>
  },
  "starBreakdown": {
    "situation": "Text from answer or critique...",
    "task": "...",
    "action": "...",
    "result": "..."
  },
  "strengths": ["...", "..."],
  "weaknesses": ["...", "..."],
  "improvements": ["...", "..."],
  "overallFeedback": "..."
}

IMPORTANT: Return ONLY valid JSON, no other text.`;

    try {
        const response = await groq.chat.completions.create({
            model: "llama-3.3-70b-versatile", // Fast and free model
            messages: [
                {
                    role: "system",
                    content: "You are an expert interview coach. Provide evaluations in valid JSON format only.",
                },
                {
                    role: "user",
                    content: prompt,
                },
            ],
            temperature: 0.7,
            max_tokens: 2048,
            response_format: { type: "json_object" }, // Ensures JSON response
        });

        const content = response.choices[0]?.message?.content;
        if (!content) {
            throw new Error("No response from Groq API");
        }

        // Parse the JSON response
        const evaluation = JSON.parse(content);

        // Validate and sanitize the response
        return {
            score: Math.max(1, Math.min(10, evaluation.score || 5)),
            scores: {
                situation: evaluation.scores?.situation || 0,
                task: evaluation.scores?.task || 0,
                action: evaluation.scores?.action || 0,
                result: evaluation.scores?.result || 0,
            },
            starBreakdown: {
                situation: evaluation.starBreakdown?.situation || "Not identified",
                task: evaluation.starBreakdown?.task || "Not identified",
                action: evaluation.starBreakdown?.action || "Not identified",
                result: evaluation.starBreakdown?.result || "Not identified",
            },
            strengths: Array.isArray(evaluation.strengths)
                ? evaluation.strengths.slice(0, 3)
                : [],
            weaknesses: Array.isArray(evaluation.weaknesses)
                ? evaluation.weaknesses.slice(0, 3)
                : [],
            improvements: Array.isArray(evaluation.improvements)
                ? evaluation.improvements.slice(0, 4)
                : [],
            overallFeedback: evaluation.overallFeedback || "",
        };
    } catch (error) {
        console.error("Error evaluating interview answer:", error);
        throw new Error("Failed to evaluate interview answer");
    }
}
