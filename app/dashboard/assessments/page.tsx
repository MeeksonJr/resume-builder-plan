import React from "react";
import { MultiCareerAssessmentView } from "@/components/assessment/multi-career-assessment-view";

export const metadata = {
  title: "Career & Skill Assessment Sandbox | ResumeForge",
  description: "Assess and verify real-world skills across any career or discipline—Healthcare, Product, Marketing, Finance, HR, Design, or Software—and earn cryptographic EIP-712 badges.",
};

export default function AssessmentsPage() {
  return <MultiCareerAssessmentView />;
}
