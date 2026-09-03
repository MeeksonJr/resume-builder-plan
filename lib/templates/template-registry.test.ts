import { describe, it, expect } from "vitest";
import {
    TEMPLATE_REGISTRY,
    getTemplateById,
    getTemplatesByCategory,
} from "./template-registry";

describe("Template Registry", () => {
    it("registers all 8 core templates", () => {
        expect(TEMPLATE_REGISTRY.length).toBe(8);
        const ids = TEMPLATE_REGISTRY.map((t) => t.id);
        expect(ids).toContain("modern");
        expect(ids).toContain("classic");
        expect(ids).toContain("minimal");
        expect(ids).toContain("creative");
        expect(ids).toContain("executive");
        expect(ids).toContain("technical");
        expect(ids).toContain("compact");
        expect(ids).toContain("elegant");
    });

    it("ensures every template has required visual config and metadata", () => {
        for (const template of TEMPLATE_REGISTRY) {
            expect(template.name).toBeTruthy();
            expect(template.description).toBeTruthy();
            expect(template.atsScore).toBeGreaterThanOrEqual(90);
            expect(template.defaultVisualConfig.accentColor).toMatch(/^#[0-9a-fA-F]{6}$/);
            expect(template.defaultVisualConfig.fontFamily).toBeTruthy();
            expect(template.recommendedFor.length).toBeGreaterThan(0);
        }
    });

    it("retrieves template by ID with fallback to modern", () => {
        const executive = getTemplateById("executive");
        expect(executive.id).toBe("executive");
        expect(executive.name).toBe("Executive Leadership");

        const unknown = getTemplateById("non-existent-template");
        expect(unknown.id).toBe("modern");
    });

    it("filters templates by category properly", () => {
        const allTemplates = getTemplatesByCategory("all");
        expect(allTemplates.length).toBe(8);

        const techTemplates = getTemplatesByCategory("tech");
        expect(techTemplates.some((t) => t.id === "technical")).toBe(true);

        const executiveTemplates = getTemplatesByCategory("executive");
        expect(executiveTemplates.some((t) => t.id === "executive")).toBe(true);

        const atsTemplates = getTemplatesByCategory("ats");
        expect(atsTemplates.some((t) => t.id === "classic")).toBe(true);
        expect(atsTemplates.some((t) => t.id === "compact")).toBe(true);
    });
});
