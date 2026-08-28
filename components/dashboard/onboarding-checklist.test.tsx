import { describe, it, expect, vi } from "vitest";
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
  it("renders onboarding checklist when steps are incomplete", () => {
    render(<OnboardingChecklist resumeCount={0} isPro={false} />);
    expect(screen.getByText("Set up your workspace")).toBeDefined();
    expect(screen.getByText("Create your first resume")).toBeDefined();
    expect(screen.getByText("Unlock Pro features")).toBeDefined();
    expect(screen.getByText("0/2 Steps")).toBeDefined();
  });

  it("calculates partial progress correctly", () => {
    render(<OnboardingChecklist resumeCount={1} isPro={false} />);
    expect(screen.getByText("Set up your workspace")).toBeDefined();
    expect(screen.getByText("1/2 Steps")).toBeDefined();
  });

  it("returns null if all steps are completed", () => {
    const { container } = render(<OnboardingChecklist resumeCount={1} isPro={true} />);
    expect(container.firstChild).toBeNull();
  });

  it("can be dismissed by clicking close button", () => {
    render(<OnboardingChecklist resumeCount={0} isPro={false} />);
    const closeButton = screen.getByText("Dismiss");
    fireEvent.click(closeButton);
    expect(screen.queryByText("Set up your workspace")).toBeNull();
  });
});
