import { describe, it, expect } from "vitest";
import {
  getUserPlanTier,
  checkPlanLimit,
  PLAN_LIMITS,
} from "@/lib/security/plan-gates";

describe("Plan Gates & Quota System (Phase 45)", () => {
  describe("getUserPlanTier", () => {
    it("should return 'free' when profile is null or undefined", () => {
      expect(getUserPlanTier(null)).toBe("free");
      expect(getUserPlanTier(undefined)).toBe("free");
    });

    it("should return 'free' for profiles without pro flag or active subscription", () => {
      expect(getUserPlanTier({ is_pro: false, subscription_status: null })).toBe("free");
      expect(getUserPlanTier({ is_pro: false, subscription_status: "canceled" })).toBe("free");
      expect(getUserPlanTier({ is_pro: false, subscription_status: "past_due" })).toBe("free");
    });

    it("should return 'pro' when is_pro is explicitly true", () => {
      expect(getUserPlanTier({ is_pro: true, subscription_status: null })).toBe("pro");
    });

    it("should return 'pro' when subscription_status is active or trialing", () => {
      expect(getUserPlanTier({ is_pro: false, subscription_status: "active" })).toBe("pro");
      expect(getUserPlanTier({ is_pro: false, subscription_status: "trialing" })).toBe("pro");
    });
  });

  describe("PLAN_LIMITS Entitlement Contract", () => {
    it("enforces Free tier boundaries", () => {
      const free = PLAN_LIMITS.free;
      expect(free.maxResumes).toBe(1);
      expect(free.maxCoverLetters).toBe(1);
      expect(free.voiceInterviewAllowed).toBe(false);
      expect(free.maxInterviewSessions).toBe(3);
      expect(free.publicPortfolioAllowed).toBe(false);
      expect(free.customSlugAllowed).toBe(false);
      expect(free.autonomousSwarmAllowed).toBe(false);
      expect(free.maxSwarmTasks).toBe(1);
      expect(free.dailyCareerCoachLimit).toBe(1);
      expect(free.dailySalaryQueriesLimit).toBe(1);
    });

    it("enforces Pro tier unlimited entitlements", () => {
      const pro = PLAN_LIMITS.pro;
      expect(pro.maxResumes).toBe(Infinity);
      expect(pro.maxCoverLetters).toBe(Infinity);
      expect(pro.voiceInterviewAllowed).toBe(true);
      expect(pro.maxInterviewSessions).toBe(Infinity);
      expect(pro.publicPortfolioAllowed).toBe(true);
      expect(pro.customSlugAllowed).toBe(true);
      expect(pro.autonomousSwarmAllowed).toBe(true);
      expect(pro.maxSwarmTasks).toBe(Infinity);
      expect(pro.dailyCareerCoachLimit).toBe(Infinity);
      expect(pro.dailySalaryQueriesLimit).toBe(Infinity);
    });
  });

  describe("checkPlanLimit", () => {
    it("allows Free user when below resume limit and blocks at limit", () => {
      const check0 = checkPlanLimit("free", "maxResumes", 0);
      expect(check0.allowed).toBe(true);
      expect(check0.upgradeRequired).toBe(false);
      expect(check0.remaining).toBe(1);

      const check1 = checkPlanLimit("free", "maxResumes", 1);
      expect(check1.allowed).toBe(false);
      expect(check1.upgradeRequired).toBe(true);
      expect(check1.remaining).toBe(0);
    });

    it("allows Pro user unlimited resumes regardless of current count", () => {
      const checkPro = checkPlanLimit("pro", "maxResumes", 42);
      expect(checkPro.allowed).toBe(true);
      expect(checkPro.upgradeRequired).toBe(false);
    });

    it("correctly handles boolean feature gates", () => {
      const voiceFree = checkPlanLimit("free", "voiceInterviewAllowed");
      expect(voiceFree.allowed).toBe(false);
      expect(voiceFree.upgradeRequired).toBe(true);

      const voicePro = checkPlanLimit("pro", "voiceInterviewAllowed");
      expect(voicePro.allowed).toBe(true);
      expect(voicePro.upgradeRequired).toBe(false);

      const publicFree = checkPlanLimit("free", "publicPortfolioAllowed");
      expect(publicFree.allowed).toBe(false);
      expect(publicFree.upgradeRequired).toBe(true);

      const publicPro = checkPlanLimit("pro", "publicPortfolioAllowed");
      expect(publicPro.allowed).toBe(true);
      expect(publicPro.upgradeRequired).toBe(false);
    });
  });
});
