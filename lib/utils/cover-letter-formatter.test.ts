import { describe, it, expect } from "vitest";
import { formatCoverLetterText } from "./cover-letter-formatter";

describe("Cover Letter Formatter & Layout Normalizer", () => {
  it("formats unbroken single-clump cover letter into structured paragraphs with distinct salutation and closing", () => {
    const rawClump =
      "September 17, 2026 Dear Hiring Team at Enlighten, I am writing with immense enthusiasm to express my keen interest in the Summer 2027 Internship - DevOps Engineer position at Enlighten. " +
      "My background as a Full Stack Developer at PM Accelerator where I developed an application empowering users through AI-driven insights has provided me with a strong foundation in architecting software solutions. " +
      "Furthermore, I am confident that my technical communication skills and passion for edge systems make me an immediate contributor. " +
      "Thank you for considering my application. Sincerely, Mohamed Lamine Datt";

    const formatted = formatCoverLetterText(rawClump, "Mohamed Lamine Datt", "Enlighten");

    expect(formatted.salutation).toBe("Dear Hiring Team at Enlighten,");
    expect(formatted.paragraphs.length).toBeGreaterThanOrEqual(2);
    expect(formatted.signOff).toBe("Sincerely,");
    expect(formatted.signerName).toBe("Mohamed Lamine Datt");
    expect(formatted.html).toContain("<p class=");
    expect(formatted.html).toContain("Dear Hiring Team at Enlighten,");
  });

  it("handles empty or sparse input gracefully", () => {
    const formatted = formatCoverLetterText("", "Alex Morgan", "Google");
    expect(formatted.salutation).toBe("Dear Hiring Team at Google,");
    expect(formatted.paragraphs.length).toBe(1);
    expect(formatted.signerName).toBe("Alex Morgan");
  });
});
