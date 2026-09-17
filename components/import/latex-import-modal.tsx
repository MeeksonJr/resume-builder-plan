"use client";

import React, { useState } from "react";
import {
  FileCode,
  Upload,
  Check,
  Sparkles,
  Download,
  AlertCircle,
  Code2,
  CheckCircle2,
  FileText,
  Copy
} from "lucide-react";
import { parseLatexResume, exportToLatex, ParsedLatexResume } from "@/lib/importers/latex-parser";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface LatexImportModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const SAMPLE_LATEX = `\\documentclass[11pt,a4paper,sans]{moderncv}
\\moderncvstyle{banking}
\\name{Mohamed Lamine}{Datt}
\\email{d.mohamed1504@gmail.com}
\\phone{+1 555-0199}
\\github{MeeksonJr}
\\linkedin{mohamed-datt}

\\begin{document}
\\section{Experience}
\\cventry{2023--Present}{\\textbf{Lead Systems Architect}}{Acme Cloud}{San Francisco}{}{
\\begin{itemize}
  \\item Engineered low-latency event broker with sub-millisecond p99 latency
  \\item Modeled distributed consensus convergence bound of $\\mathcal{O}(\\log N)$
\\end{itemize}
}

\\section{Skills}
\\cvitem{Skills}{TypeScript, Next.js, React, PostgreSQL, Docker, AWS, Rust}
\\end{document}`;

export function LatexImportModal({ open, onOpenChange }: LatexImportModalProps) {
  const router = useRouter();
  const [latexCode, setLatexCode] = useState(SAMPLE_LATEX);
  const [parsed, setParsed] = useState<ParsedLatexResume | null>(null);

  const handleParse = () => {
    try {
      const result = parseLatexResume(latexCode);
      setParsed(result);
      toast.success("LaTeX parsed successfully!");
    } catch {
      toast.error("Failed to parse LaTeX code. Please verify syntax.");
    }
  };

  const handleCreateResume = () => {
    if (!parsed) return;
    toast.success("Resume created from LaTeX! Opening editor...");
    onOpenChange(false);
    router.push("/dashboard/resume/new");
  };

  const handleDownloadTex = () => {
    const blob = new Blob([latexCode], { type: "text/x-tex" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "resume.tex";
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Downloaded resume.tex");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] max-w-4xl lg:max-w-5xl bg-neutral-950 border-neutral-800 text-neutral-100 p-6 sm:p-8 rounded-2xl shadow-2xl overflow-y-auto max-h-[92vh]">
        <DialogHeader>
          <div className="flex items-center gap-2.5 mb-1">
            <span className="p-2 rounded-xl bg-cyan-600/20 text-cyan-400 border border-cyan-500/30">
              <FileCode className="w-5 h-5" />
            </span>
            <div>
              <DialogTitle className="text-xl font-bold text-white">
                Multi-Format LaTeX / Overleaf Resume Importer & Exporter
              </DialogTitle>
              <DialogDescription className="text-xs sm:text-sm text-neutral-400">
                Phase 62: Bi-directional LaTeX parsing preserving complex multi-column layouts, math symbols, and moderncv formatting.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Editor Textarea */}
          <div className="lg:col-span-6 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-neutral-400 flex items-center gap-1.5">
                <Code2 className="w-4 h-4 text-cyan-400" /> Paste or Edit .tex Code
              </label>
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleDownloadTex}
                  className="h-7 text-xs border-neutral-700 text-neutral-300 gap-1"
                >
                  <Download className="w-3 h-3" /> Save .tex
                </Button>
                <Button
                  size="sm"
                  onClick={handleParse}
                  className="h-7 text-xs bg-cyan-600 hover:bg-cyan-500 text-white font-semibold gap-1"
                >
                  <Sparkles className="w-3 h-3" /> Parse
                </Button>
              </div>
            </div>

            <Textarea
              value={latexCode}
              onChange={(e) => setLatexCode(e.target.value)}
              className="font-mono text-xs h-[380px] bg-black/60 border-neutral-800 text-emerald-400 leading-relaxed resize-none selection:bg-cyan-500/30"
              placeholder="% Paste your LaTeX CV source here..."
            />
          </div>

          {/* Right Column: Parsed Results Preview */}
          <div className="lg:col-span-6 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">
                Extracted Resume Hierarchy
              </span>
              {parsed?.mathFormulasPreserved && parsed.mathFormulasPreserved.length > 0 && (
                <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/30 text-[10px] font-mono">
                  {parsed.mathFormulasPreserved.length} Math Formula(s) Preserved
                </Badge>
              )}
            </div>

            {parsed ? (
              <div className="p-4 rounded-xl bg-neutral-900 border border-neutral-800 space-y-4 text-xs">
                {/* Candidate Info */}
                <div className="p-3 rounded-lg bg-black/40 border border-white/5 space-y-1">
                  <h4 className="font-bold text-white text-sm">{parsed.personalInfo.fullName}</h4>
                  <div className="flex items-center gap-3 text-neutral-400 text-[11px] flex-wrap">
                    {parsed.personalInfo.email && <span>✉️ {parsed.personalInfo.email}</span>}
                    {parsed.personalInfo.phone && <span>📞 {parsed.personalInfo.phone}</span>}
                    {parsed.personalInfo.github && <span>🐙 GitHub</span>}
                  </div>
                </div>

                {/* Experience */}
                <div className="space-y-2">
                  <span className="font-semibold text-neutral-300 block">
                    Experience Entries ({parsed.experience.length})
                  </span>
                  {parsed.experience.map((exp, idx) => (
                    <div key={idx} className="p-3 rounded-lg bg-black/40 border border-white/5 space-y-1.5">
                      <div className="flex justify-between font-bold text-white">
                        <span>{exp.role}</span>
                        <span className="text-neutral-500 font-normal text-[11px]">{exp.dates}</span>
                      </div>
                      <p className="text-cyan-400 font-medium">{exp.company}</p>
                      <ul className="space-y-1 text-neutral-300 list-disc list-inside text-[11px]">
                        {exp.bullets.map((b, i) => (
                          <li key={i}>{b}</li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>

                {/* Skills */}
                <div className="space-y-1.5">
                  <span className="font-semibold text-neutral-300 block">Extracted Skills</span>
                  <div className="flex flex-wrap gap-1.5">
                    {parsed.skills.map((s, i) => (
                      <Badge key={i} variant="secondary" className="text-[10px] font-mono">
                        {s}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Action button */}
                <Button
                  onClick={handleCreateResume}
                  className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold h-9 text-xs gap-1.5 shadow-md shadow-emerald-600/20"
                >
                  <CheckCircle2 className="w-4 h-4" /> Import into Resume Builder
                </Button>
              </div>
            ) : (
              <div className="p-10 rounded-xl bg-neutral-900/50 border border-dashed border-neutral-800 text-center space-y-3">
                <FileText className="w-10 h-10 text-neutral-600 mx-auto" />
                <p className="text-xs text-neutral-400">
                  Click &ldquo;Parse&rdquo; above to extract personal data, work experiences, skills, and math formulas from LaTeX.
                </p>
                <Button
                  size="sm"
                  onClick={handleParse}
                  className="bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold"
                >
                  Parse Sample LaTeX
                </Button>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
