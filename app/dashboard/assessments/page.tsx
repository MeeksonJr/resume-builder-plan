import React from "react";
import { SkillAssessmentView } from "@/components/assessment/skill-assessment-view";

export const metadata = {
  title: "Candidate Skill Assessment Sandbox | ResumeAI Pro",
  description: "Test and verify your technical skills with live in-browser coding environments and earn cryptographic credentials.",
};

export default function AssessmentsPage() {
  return <SkillAssessmentView />;
}
