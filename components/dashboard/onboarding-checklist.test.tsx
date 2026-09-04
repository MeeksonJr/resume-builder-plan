import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { OnboardingChecklist } from "./onboarding-checklist";
import React from "react";

// Mock framer-motion since it uses layout animations that can throw in jsdom
vi.mock("framer-motion", () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
}));

describe("OnboardingChecklist component", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("renders Career Launchpad with initial milestones", () => {
    render(<OnboardingChecklist resumeCount={0} isPro={false} />);
    expect(screen.getByText("Career Launchpad & Milestones")).toBeDefined();
    expect(screen.getByText("Novice Explorer")).toBeDefined();
    expect(screen.getByText("Document Architect")).toBeDefined();
    expect(screen.getByText("0 of 6 Badges Unlocked")).toBeDefined();
  });

  it("calculates progress and unlocked badges correctly", () => {
    render(
      <OnboardingChecklist
        resumeCount={1}
        applicationsCount={3}
        interviewsCount={1}
        isPro={false}
      />
    );
    expect(screen.getByText("Active Contender")).toBeDefined();
    expect(screen.getByText("3 of 6 Badges Unlocked")).toBeDefined();
  });

  it("toggles collapse state when clicking Collapse/Expand", () => {
    render(<OnboardingChecklist resumeCount={1} />);
    const toggleButton = screen.getByText(/Collapse/i);
    fireEvent.click(toggleButton);
    expect(screen.getByText(/Expand/i)).toBeDefined();
  });

  it("can be dismissed by clicking the close button", () => {
    render(<OnboardingChecklist resumeCount={0} isPro={false} />);
    const closeButton = screen.getByTitle("Dismiss Launchpad");
    fireEvent.click(closeButton);
    expect(screen.queryByText("Career Launchpad & Milestones")).toBeNull();
    expect(localStorage.getItem("career_launchpad_dismissed")).toBe("true");
  });
});
