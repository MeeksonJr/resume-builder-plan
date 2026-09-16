import { describe, it, expect } from "vitest";
import {
    VANITY_PALETTES,
    VANITY_TEMPLATES,
    TYPOGRAPHY_OPTIONS,
    generateShareLinks,
} from "./vanity-settings";

describe("Vanity Settings & Share Hub Logic", () => {
    it("should define all standard curated color palettes with valid hex codes", () => {
        expect(VANITY_PALETTES.length).toBeGreaterThanOrEqual(6);
        for (const palette of VANITY_PALETTES) {
            expect(palette.id).toBeTruthy();
            expect(palette.name).toBeTruthy();
            expect(palette.hex).toMatch(/^#[0-9a-fA-F]{6}$/);
            expect(palette.borderClass).toBeTruthy();
            expect(palette.bgClass).toBeTruthy();
        }
    });

    it("should provide descriptors for all 4 supported portfolio templates", () => {
        expect(VANITY_TEMPLATES.map((t) => t.id)).toEqual([
            "modern",
            "minimal",
            "corporate",
            "creative",
        ]);
    });

    it("should configure standard typography scales", () => {
        const ids = TYPOGRAPHY_OPTIONS.map((t) => t.id);
        expect(ids).toContain("sans");
        expect(ids).toContain("serif");
        expect(ids).toContain("mono");
    });

    it("should generate comprehensive share links with encoded parameters and QR url", () => {
        const links = generateShareLinks("alex-turner", "Alex Turner", "https://my-domain.com");

        expect(links.fullUrl).toBe("https://my-domain.com/p/alex-turner");
        expect(links.linkedin).toContain(encodeURIComponent("https://my-domain.com/p/alex-turner"));
        expect(links.twitter).toContain(encodeURIComponent("https://my-domain.com/p/alex-turner"));
        expect(links.whatsapp).toContain(encodeURIComponent("https://my-domain.com/p/alex-turner"));
        expect(links.email).toContain("mailto:?subject=");
        expect(links.qrCodeUrl).toContain("https://api.qrserver.com/v1/create-qr-code");
        expect(links.qrCodeUrl).toContain(encodeURIComponent("https://my-domain.com/p/alex-turner"));
    });
});
