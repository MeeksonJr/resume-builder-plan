import { describe, it, expect } from "vitest";
import {
  SAMPLE_ALUMNI_MENTORS,
  calculateAlumniMatchScore,
  bookMentorshipSession,
  updateSessionStatus,
} from "./mentorship-mesh";

describe("Phase 65 — Enterprise Alumni Mentorship & Career Sponsorship Mesh", () => {
  const mentor = SAMPLE_ALUMNI_MENTORS[0]; // Jason Chen at Google DeepMind

  it("calculates high match score for target company and matching track", () => {
    const score = calculateAlumniMatchScore(
      mentor,
      "Google",
      "Research Engineer",
      "Executive Referral Sponsorship"
    );

    // Baseline 65 + 25 (Google match) + 10 (Research Engineer match) + 10 (track match) + 5 (accepting mentees)
    // Capped at 100
    expect(score).toBe(100);
  });

  it("scores past companies higher than generic mentors", () => {
    const pastCompanyScore = calculateAlumniMatchScore(mentor, "Meta AI");
    const unrelatedCompanyScore = calculateAlumniMatchScore(mentor, "Unrelated Aerospace");

    expect(pastCompanyScore).toBeGreaterThan(unrelatedCompanyScore);
  });

  it("books a mentorship session and transitions status through state machine", () => {
    const session = bookMentorshipSession({
      mentorId: mentor.id,
      studentId: "student-101",
      studentName: "Maya Lin",
      studentEmail: "maya@cs.stanford.edu",
      track: "Executive Referral Sponsorship",
      targetRole: "Research Engineer",
      targetCompany: "Google DeepMind",
      timeSlot: "Thu 4:00 PM PST",
      customNotes: "Interested in discussing transformer attention mechanisms and referral requirements."
    });

    expect(session.status).toBe("requested");
    expect(session.meetingUrl).toContain("meet.google.com");

    const confirmed = updateSessionStatus(session, "confirmed");
    expect(confirmed.status).toBe("confirmed");

    const completed = updateSessionStatus(confirmed, "completed");
    expect(completed.status).toBe("completed");
  });
});
