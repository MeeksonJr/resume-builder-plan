import { describe, it, expect } from "vitest";
import {
  SUPPORTED_LOCALES,
  localizeTechnicalBullet,
  localizeResumeForMarket,
  TargetLocale,
} from "./multilingual-engine";

describe("Dynamic Resume Localization & Multilingual Translation Engine (Phase 68)", () => {
  it("provides correct section titles and compliance metadata for German Lebenslauf", () => {
    const de = SUPPORTED_LOCALES["de_DE"];
    expect(de.sectionTitles.experience).toBe("Berufserfahrung & Praxis");
    expect(de.sectionTitles.education).toBe("Ausbildung & Hochschulstudium");
    expect(de.standardName).toContain("Lebenslauf");
    expect(de.dateFormat).toBe("MM.YYYY");
  });

  it("provides correct JIS section titles for Japanese Shokumu Keirekisho", () => {
    const ja = SUPPORTED_LOCALES["ja_JP"];
    expect(ja.sectionTitles.experience).toBe("職務経歴");
    expect(ja.sectionTitles.summary).toBe("職務要約 (サマリー)");
    expect(ja.dateFormat).toBe("YYYY年MM月");
  });

  it("translates English technical action bullets into German and British idioms", () => {
    const bullet = "Architected high-throughput microservices and optimized query latency by 45%.";
    
    const german = localizeTechnicalBullet(bullet, "de_DE");
    expect(german).toContain("Konzipierte und implementierte");

    const british = localizeTechnicalBullet(bullet, "en_GB");
    expect(british).toContain("optimised");
    expect(british).not.toContain("optimized");

    const japanese = localizeTechnicalBullet(bullet, "ja_JP");
    expect(japanese).toContain("【実績】");
  });

  it("localizes complete resume model and certifies regional compliance", () => {
    const sampleResume = {
      title: "Senior Fullstack Engineer",
      summary: "Specialized in distributed cloud applications with optimized query pipelines.",
      skills: ["TypeScript", "Next.js", "Go"],
      experience: [
        {
          role: "Staff Architect",
          company: "Acme Cloud",
          period: "2023 - Present",
        }
      ],
    };

    const result = localizeResumeForMarket(sampleResume, "fr_FR");
    expect(result.standardDocumentTitle).toContain("Curriculum Vitae Européen");
    expect(result.localizedSections.find((s) => s.sectionKey === "experience")?.localizedTitle).toBe("Expérience Professionnelle");
    expect(result.regionalComplianceVerdict.length).toBe(3);
    expect(result.adaptedSummary).toContain("[Profil Ingénieur]");
  });
});
