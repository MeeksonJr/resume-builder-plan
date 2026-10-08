import { describe, it, expect } from "vitest";
import {
  validateGitHubInput,
  synthesizeProjectBullets,
  ingestGitHubProject,
  DEMO_GITHUB_PROJECTS,
} from "./github-importer";

describe("GitHub Project Ingestion Engine", () => {
  describe("validateGitHubInput", () => {
    it("should correctly identify full repo URLs", () => {
      const res = validateGitHubInput("https://github.com/facebook/react");
      expect(res.type).toBe("repo");
      if (res.type === "repo") {
        expect(res.owner).toBe("facebook");
        expect(res.repo).toBe("react");
        expect(res.cleanUrl).toBe("https://github.com/facebook/react");
      }
    });

    it("should correctly identify short repo paths like owner/repo", () => {
      const res = validateGitHubInput("torvalds/linux");
      expect(res.type).toBe("repo");
      if (res.type === "repo") {
        expect(res.owner).toBe("torvalds");
        expect(res.repo).toBe("linux");
      }
    });

    it("should correctly identify user profile URLs", () => {
      const res = validateGitHubInput("https://github.com/octocat");
      expect(res.type).toBe("user");
      if (res.type === "user") {
        expect(res.username).toBe("octocat");
      }
    });

    it("should correctly identify raw usernames", () => {
      const res = validateGitHubInput("developer-alpha");
      expect(res.type).toBe("user");
      if (res.type === "user") {
        expect(res.username).toBe("developer-alpha");
      }
    });

    it("should mark empty or malformed strings as invalid", () => {
      expect(validateGitHubInput("").type).toBe("invalid");
      expect(validateGitHubInput("https://gitlab.com/invalid/url").type).toBe("invalid");
    });
  });

  describe("synthesizeProjectBullets", () => {
    it("should synthesize quantifiable STAR bullet points from repository metadata", () => {
      const bullets = synthesizeProjectBullets({
        name: "Distributed-Task-Queue",
        description: "High-throughput Redis-backed asynchronous worker swarm.",
        language: "Go",
        topics: ["redis", "distributed-systems", "microservices"],
        stars: 120,
      });

      expect(bullets.technologies).toContain("Go");
      expect(bullets.technologies).toContain("distributed systems");
      expect(bullets.highlights.length).toBe(3);
      expect(bullets.highlights[0]).toContain("Distributed-Task-Queue");
      expect(bullets.highlights[1]).toContain("120+ GitHub stars");
    });
  });

  describe("DEMO_GITHUB_PROJECTS", () => {
    it("should contain Virginia Tech and ODU verified demonstration projects", () => {
      const robotics = DEMO_GITHUB_PROJECTS["autonomous-systems"];
      expect(robotics).toBeDefined();
      expect(robotics.length).toBeGreaterThan(0);
      expect(robotics[0].primaryLanguage).toBe("C++");
      expect(robotics[0].highlights.length).toBeGreaterThanOrEqual(3);

      const web = DEMO_GITHUB_PROJECTS["fullstack-web"];
      expect(web).toBeDefined();
      expect(web[0].primaryLanguage).toBe("TypeScript");
    });
  });

  describe("ingestGitHubProject", () => {
    it("should gracefully extract or synthesize project when given a repo input", async () => {
      const result = await ingestGitHubProject("sample-org/distributed-raft");
      expect(result.success).toBe(true);
      expect(result.projects.length).toBe(1);
      expect(result.projects[0].name).toBe("distributed-raft");
      expect(result.projects[0].highlights.length).toBe(3);
    });

    it("should return demo fallback projects when matching keywords are supplied", async () => {
      const result = await ingestGitHubProject("robotics-slam-demo");
      expect(result.success).toBe(true);
      expect(result.sourceType).toBe("demo_fallback");
      expect(result.projects[0].name).toBe("Autonomous-Rover-SLAM");
    });
  });
});
