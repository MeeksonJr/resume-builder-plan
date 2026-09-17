import { describe, it, expect } from "vitest";
import {
  parseLatexResume,
  exportToLatex
} from "./latex-parser";

describe("Phase 62: Multi-Format PDF/LaTeX Importer & Parser", () => {
  const sampleLatex = `
\\documentclass[11pt,a4paper,sans]{moderncv}
\\name{Ada}{Lovelace}
\\email{ada@analytical-engine.org}
\\phone{+44 20 7946 0919}
\\github{adalovelace}

\\begin{document}
\\section{Experience}
\\cventry{1842--1843}{\\textbf{Lead Algorithm Designer}}{Babbage Computing}{London}{}{
\\begin{itemize}
  \\item Authored the first published algorithm intended for an analytical engine
  \\item Derived Bernoulli numbers computation complexity of $\\mathcal{O}(n^2)$
\\end{itemize}
}

\\section{Skills}
\\cvitem{Skills}{Algorithms, Analytical Engine, Mathematics, Symbolic Computation}
\\end{document}
  `;

  it("parses name, contact info, and preserve mathematical expressions", () => {
    const parsed = parseLatexResume(sampleLatex);

    expect(parsed.personalInfo.fullName).toBe("Ada Lovelace");
    expect(parsed.personalInfo.email).toBe("ada@analytical-engine.org");
    expect(parsed.personalInfo.github).toContain("adalovelace");

    expect(parsed.experience.length).toBe(1);
    expect(parsed.experience[0].company).toBe("Babbage Computing");
    expect(parsed.experience[0].role).toBe("Lead Algorithm Designer");

    // Math formula preserved
    expect(parsed.mathFormulasPreserved).toContain("$\\mathcal{O}(n^2)$");
  });

  it("extracts clean skills array", () => {
    const parsed = parseLatexResume(sampleLatex);
    expect(parsed.skills).toContain("Algorithms");
    expect(parsed.skills).toContain("Mathematics");
  });

  it("exports structured resume to compilation-ready LaTeX document", () => {
    const tex = exportToLatex({
      fullName: "Mohamed Lamine Datt",
      email: "d.mohamed1504@gmail.com",
      experiences: [
        {
          company: "NextGen AI",
          role: "Staff Engineer",
          bullets: ["Built real-time audio sync engine"]
        }
      ],
      skills: ["TypeScript", "LaTeX", "Next.js"]
    });

    expect(tex).toContain("\\documentclass[11pt,a4paper,sans]{moderncv}");
    expect(tex).toContain("\\name{Mohamed}{Lamine Datt}");
    expect(tex).toContain("NextGen AI");
    expect(tex).toContain("Staff Engineer");
  });
});
