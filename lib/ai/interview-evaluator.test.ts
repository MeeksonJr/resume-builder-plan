import { describe, it, expect, vi, beforeEach } from "vitest";
import { evaluateInterviewAnswer, AnswerContext } from "./interview-evaluator";

// Mock Groq SDK
const mockCreate = vi.fn();
vi.mock("groq-sdk", () => {
  return {
    default: class MockGroq {
      chat = {
        completions: {
          create: mockCreate,
        },
      };
    },
  };
});

describe("Interview Evaluator Engine", () => {
  beforeEach(() => {
    mockCreate.mockReset();
  });

  const sampleContext: AnswerContext = {
    question: "Tell me about a time you resolved a major production outage.",
    questionType: "Behavioral",
    difficulty: "Advanced",
    answer:
      "When our payment processing API went down due to connection pool exhaustion during Black Friday, I was the on-call engineer. I identified the saturated database connections, rolled out a hotfix to enable connection queuing, and restored 100% availability within 12 minutes.",
  };

  it("should successfully evaluate an answer and sanitize output correctly", async () => {
    mockCreate.mockResolvedValue({
      choices: [
        {
          message: {
            content: JSON.stringify({
              score: 9,
              scores: {
                situation: 90,
                task: 85,
                action: 95,
                result: 92,
              },
              starBreakdown: {
                situation: "Black Friday payment outage due to connection pool exhaustion",
                task: "Acted as on-call engineer to restore service",
                action: "Diagnosed DB connections and deployed queuing hotfix",
                result: "Restored availability within 12 minutes",
              },
              strengths: [
                "Clear quantifiable impact (12 min recovery)",
                "Precise technical root-cause explanation",
                "Strong ownership under pressure",
                "Extra fourth strength that should be trimmed",
              ],
              weaknesses: ["Could mention preventative steps taken afterward"],
              improvements: ["Add follow-up post-mortem details", "Discuss load test improvements"],
              overallFeedback: "Outstanding STAR structure and concise communication.",
            }),
          },
        },
      ],
    });

    const result = await evaluateInterviewAnswer(sampleContext);

    expect(result.score).toBe(9);
    expect(result.scores.action).toBe(95);
    expect(result.starBreakdown.result).toBe("Restored availability within 12 minutes");
    expect(result.strengths.length).toBe(3); // Sliced to top 3
    expect(result.improvements.length).toBe(2);
    expect(result.overallFeedback).toContain("Outstanding STAR structure");
  });

  it("should clamp scores between 1 and 10 and fallback missing fields", async () => {
    mockCreate.mockResolvedValue({
      choices: [
        {
          message: {
            content: JSON.stringify({
              score: 99, // Should be clamped to 10
              scores: {},
              starBreakdown: {},
              strengths: null,
              weaknesses: null,
              improvements: null,
              overallFeedback: null,
            }),
          },
        },
      ],
    });

    const result = await evaluateInterviewAnswer(sampleContext);

    expect(result.score).toBe(10);
    expect(result.scores.situation).toBe(0);
    expect(result.starBreakdown.situation).toBe("Not identified");
    expect(result.strengths).toEqual([]);
    expect(result.weaknesses).toEqual([]);
    expect(result.improvements).toEqual([]);
    expect(result.overallFeedback).toBe("");
  });

  it("should throw an error when API returns empty content or fails", async () => {
    mockCreate.mockResolvedValue({
      choices: [],
    });

    await expect(evaluateInterviewAnswer(sampleContext)).rejects.toThrow(
      "Failed to evaluate interview answer"
    );
  });
});
