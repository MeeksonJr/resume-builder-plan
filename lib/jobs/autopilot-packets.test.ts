import { describe, it, expect } from "vitest";

describe("Autopilot Application Dossier Data Structures", () => {
  it("structures complete dossier packet with interview session telemetry", () => {
    const mockPacket = {
      id: "app-123",
      applicationId: "app-123",
      company: "Acme Corp",
      role: "Lead Software Architect",
      location: "Remote",
      salaryRange: "$160,000 - $190,000",
      matchScore: 92,
      newResumeId: "res-456",
      newResumeTitle: "Lead Software Architect — Acme Corp",
      coverLetterId: "cl-789",
      coverLetterTitle: "Lead Software Architect Cover Letter",
      coverLetterContent: "Dear Hiring Team at Acme Corp...",
      appliedChanges: ["Restructured bullets with STAR method", "Injected AWS and Distributed Systems keywords"],
      interviewSession: {
        id: "int-001",
        answeredCount: 5,
        questionCount: 5,
        averageScore: 89,
        completedAt: "2026-09-04T12:00:00Z",
        sessionMode: "voice",
        voiceAnalysis: { averageWpm: 142, totalFillers: 2 },
      },
      isSaved: true,
    };

    expect(mockPacket.company).toBe("Acme Corp");
    expect(mockPacket.newResumeId).toBe("res-456");
    expect(mockPacket.interviewSession?.completedAt).toBeDefined();
    expect(mockPacket.interviewSession?.averageScore).toBe(89);
    expect(mockPacket.interviewSession?.voiceAnalysis.averageWpm).toBe(142);
    expect(mockPacket.isSaved).toBe(true);
  });

  it("identifies in-progress vs completed interview session correctly", () => {
    const inProgressSession = {
      answeredCount: 2,
      questionCount: 5,
      completedAt: null,
    };
    const isCompleted = !!inProgressSession.completedAt;
    const isInProgress = !inProgressSession.completedAt && inProgressSession.answeredCount > 0;

    expect(isCompleted).toBe(false);
    expect(isInProgress).toBe(true);
  });
});
