import { describe, it, expect } from "vitest";
import {
  calculateCareerReadinessScore,
  computePipelineMetrics,
  aggregateVoiceTelemetry,
  summarizeEngagement,
} from "./career-intelligence";

describe("Career Intelligence Analytics Engine", () => {
  describe("calculateCareerReadinessScore", () => {
    it("calculates accurate composite score with typical inputs", () => {
      // 80*0.3 (24) + 80*0.25 (20) + min(100, 5*10)*0.2 (10) + 70*0.15 (10.5) + min(100, 10*5)*0.2 (5)
      // = 24 + 20 + 10 + 10.5 + 5 = 69.5 -> 70
      const score = calculateCareerReadinessScore({
        bestAtsScore: 80,
        avgInterviewScore: 80,
        pipelineTotal: 5,
        latestSkillsMatch: 70,
        totalViews: 10,
      });

      expect(score).toBe(70);
    });

    it("caps pipeline and engagement contributions at 100", () => {
      const perfectScore = calculateCareerReadinessScore({
        bestAtsScore: 100,
        avgInterviewScore: 100,
        pipelineTotal: 50, // 50 * 10 = 500, capped at 100
        latestSkillsMatch: 100,
        totalViews: 100, // 100 * 5 = 500, capped at 100
      });

      expect(perfectScore).toBe(100);
    });

    it("returns 0 when all inputs are 0 or empty", () => {
      const zeroScore = calculateCareerReadinessScore({
        bestAtsScore: 0,
        avgInterviewScore: 0,
        pipelineTotal: 0,
        latestSkillsMatch: 0,
        totalViews: 0,
      });

      expect(zeroScore).toBe(0);
    });
  });

  describe("computePipelineMetrics", () => {
    it("aggregates status breakdown and computes conversion rate", () => {
      const applications = [
        { status: "applied" },
        { status: "applied" },
        { status: "interviewing" },
        { status: "offered" },
        { status: "rejected" },
      ];

      const result = computePipelineMetrics(applications);

      expect(result.pipeline.applied).toBe(2);
      expect(result.pipeline.interviewing).toBe(1);
      expect(result.pipeline.offered).toBe(1);
      expect(result.pipeline.rejected).toBe(1);
      expect(result.pipeline.total).toBe(5);
      // 1 / 5 = 20%
      expect(result.conversionRate).toBe(20);
    });

    it("handles empty application array safely", () => {
      const result = computePipelineMetrics([]);

      expect(result.pipeline.total).toBe(0);
      expect(result.conversionRate).toBe(0);
    });
  });

  describe("aggregateVoiceTelemetry", () => {
    it("computes average WPM and total fillers for voice sessions only", () => {
      const sessions = [
        {
          session_mode: "voice",
          voice_analysis: { averageWpm: 140, totalFillers: 3 },
        },
        {
          session_mode: "voice",
          voice_analysis: { averageWpm: 160, totalFillers: 5 },
        },
        {
          session_mode: "text", // should be ignored
          voice_analysis: { averageWpm: 200, totalFillers: 10 },
        },
        {
          session_mode: "voice", // missing analysis
          voice_analysis: null,
        },
      ];

      const result = aggregateVoiceTelemetry(sessions);

      expect(result.sessionCount).toBe(2);
      expect(result.avgWpm).toBe(150); // (140 + 160) / 2
      expect(result.totalFillers).toBe(8); // 3 + 5
    });

    it("handles empty voice telemetry gracefully", () => {
      const result = aggregateVoiceTelemetry([]);

      expect(result.sessionCount).toBe(0);
      expect(result.avgWpm).toBe(0);
      expect(result.totalFillers).toBe(0);
    });
  });

  describe("summarizeEngagement", () => {
    it("accurately sums resume views and counts event types", () => {
      const resumes = [
        { view_count: 15 },
        { view_count: 25 },
        { view_count: null },
      ];
      const events = [
        { event_type: "view" },
        { event_type: "view" },
        { event_type: "download" },
        { event_type: "download" },
        { event_type: "download" },
      ];

      const result = summarizeEngagement(resumes, events);

      expect(result.totalViews).toBe(40);
      expect(result.totalDownloads).toBe(3);
      expect(result.totalViewEvents).toBe(2);
    });
  });
});
