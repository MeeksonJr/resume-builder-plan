import { describe, it, expect } from "vitest";
import { analyzeInterviewSpeech } from "../interview/speech-feedback";
import { generateColdOutreachSequence } from "../outreach/email-generator";
import { createApplicationBundle } from "../export/application-bundle";
import { generateICalendarEvent } from "../calendar/follow-up-calendar";
import { parseApplicationEmail } from "../jobs/email-status-parser";

describe("Career Applications & Workflow Automation Suite (Phase 5)", () => {
  it("analyzes speech pacing, filler words, and STAR compliance", () => {
    const transcript =
      "Um, so in my previous project, when our database hit peak load, I needed to improve query times. Basically, I created indexed views which reduced latency by 35%.";
    const res = analyzeInterviewSpeech(transcript, 30);

    expect(res.wordsPerMinute).toBeGreaterThan(0);
    expect(res.fillerWordCount).toBeGreaterThanOrEqual(2);
    expect(res.starComplianceScore).toBeGreaterThan(60);
    expect(res.actionableTips.length).toBeGreaterThan(0);
  });

  it("generates structured 3-step cold outreach drip sequence", () => {
    const sequence = generateColdOutreachSequence({
      candidateName: "Jordan Vance",
      candidateUniversity: "Old Dominion University",
      recipientName: "Marcus Vance",
      recipientCompany: "Dominion Energy",
      recipientTitle: "Talent Acquisition Lead",
      targetRole: "Cloud Engineer",
      keySkillOrProject: "AWS Serverless Pipeline",
    });

    expect(sequence).toHaveLength(3);
    expect(sequence[0].sendDay).toBe("Day 1");
    expect(sequence[0].body).toContain("Old Dominion University");
    expect(sequence[1].sendDay).toBe("Day 4");
    expect(sequence[2].sendDay).toBe("Day 9");
  });

  it("creates complete multi-document application dossiers with verification seal", () => {
    const bundle = createApplicationBundle({
      candidateName: "Elena Rostova",
      candidateEmail: "elena@vt.edu",
      targetCompany: "Amazon AWS",
      targetRole: "Solutions Architect",
      resumeContent: "# Elena Rostova - Resume",
      coverLetterContent: "# Cover Letter",
      campusSlug: "virginia-tech",
    });

    expect(bundle.documents).toHaveLength(3);
    expect(bundle.documents.map((d) => d.documentType)).toContain("Resume");
    expect(bundle.documents.map((d) => d.documentType)).toContain("Cover Letter");
    expect(bundle.documents.map((d) => d.documentType)).toContain("Campus Verification Manifest");
  });

  it("generates compliant iCalendar .ics format with alarms", () => {
    const ics = generateICalendarEvent({
      title: "Technical Interview with Capital One",
      description: "Panel round with Lead Cloud Architect",
      location: "Google Meet",
      startDate: new Date("2026-10-15T14:00:00Z"),
      durationMinutes: 45,
    });

    expect(ics).toContain("BEGIN:VCALENDAR");
    expect(ics).toContain("SUMMARY:Technical Interview with Capital One");
    expect(ics).toContain("BEGIN:VALARM");
    expect(ics).toContain("END:VCALENDAR");
  });

  it("parses inbound ATS emails and detects interview vs rejection signals", () => {
    const interviewEmail = parseApplicationEmail(
      "Invitation to interview with Dominion Energy for Software Engineer",
      "We were impressed with your application and would like to schedule your interview with our team."
    );
    expect(interviewEmail.detectedStatus).toBe("Interview Scheduled");
    expect(interviewEmail.confidenceScore).toBeGreaterThanOrEqual(90);

    const oaEmail = parseApplicationEmail(
      "Coding assessment from Capital One",
      "Please complete the online assessment on HackerRank within 48 hours."
    );
    expect(oaEmail.detectedStatus).toBe("Online Assessment (OA)");

    const rejectionEmail = parseApplicationEmail(
      "Update regarding your application with Northrop Grumman",
      "Unfortunately, we are not moving forward with your candidacy at this time."
    );
    expect(rejectionEmail.detectedStatus).toBe("Rejected");
  });
});
