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

Please evaluate this answer and provide:
1. A score from 1-10 (where 1 is poor and 10 is excellent)
2. 2-3 key strengths of the answer
3. 2-3 main weaknesses or areas for improvement
4. 3-4 specific, actionable suggestions for improvement
5. Overall feedback summary (2-3 sentences)

Consider these evaluation criteria:
- Clarity and structure of the response
- Relevance to the question
- Depth of technical knowledge (if applicable)
- Use of specific examples or experiences
- Communication skills
- Problem-solving approach
- Completeness of the answer

Format your response as JSON with this structure:
{
  "score": <number>,
  "strengths": ["strength1", "strength2", "strength3"],
  "weaknesses": ["weakness1", "weakness2", "weakness3"],
  "improvements": ["improvement1", "improvement2", "improvement3", "improvement4"],
  "overallFeedback": "summary text"
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
