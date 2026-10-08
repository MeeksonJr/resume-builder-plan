"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Github,
  Sparkles,
  ExternalLink,
  Star,
  GitFork,
  CheckCircle2,
  Copy,
  Plus,
  Loader2,
  Code2,
  Check,
  Zap,
} from "lucide-react";
import { toast } from "sonner";
import { IngestedProject, GitHubIngestionResult } from "@/lib/scrapers/github-importer";

interface GitHubProjectImporterProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onProjectsImported?: (projects: IngestedProject[]) => void;
}

export function GitHubProjectImporter({
  open,
  onOpenChange,
  onProjectsImported,
}: GitHubProjectImporterProps) {
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<GitHubIngestionResult | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [addedIds, setAddedIds] = useState<Set<string>>(new Set());

  const handleIngest = async (presetInput?: string) => {
    const target = presetInput || input;
    if (!target || target.trim().length === 0) {
      toast.error("Please enter a GitHub repository URL or username");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/github/ingest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ input: target.trim(), maxRepos: 6 }),
      });

      const data: GitHubIngestionResult = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to ingest GitHub project");
      }

      setResult(data);
      toast.success(
        `Extracted ${data.projects.length} project${data.projects.length === 1 ? "" : "s"} with STAR bullet points! 🚀`
      );
    } catch (err: any) {
      toast.error(err.message || "Failed to import project");
    } finally {
      setLoading(false);
    }
  };

  const handleCopyBullets = (project: IngestedProject) => {
    const text = project.highlights.map((h) => `• ${h}`).join("\n");
    navigator.clipboard.writeText(text);
    setCopiedId(project.id);
    toast.success("STAR bullet points copied to clipboard!");
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleAddProject = (project: IngestedProject) => {
    setAddedIds((prev) => new Set(prev).add(project.id));
    if (onProjectsImported) {
      onProjectsImported([project]);
    }

    if (typeof window !== "undefined") {
      window.dispatchEvent(
        new CustomEvent("rf-projects-imported", { detail: { projects: [project] } })
      );
    }
    toast.success(`Added "${project.name}" to your resume projects!`);
  };

  const handleAddAll = () => {
    if (!result?.projects || result.projects.length === 0) return;
    const all = result.projects;
    setAddedIds(new Set(all.map((p) => p.id)));
    if (onProjectsImported) {
      onProjectsImported(all);
    }

    if (typeof window !== "undefined") {
      window.dispatchEvent(
        new CustomEvent("rf-projects-imported", { detail: { projects: all } })
      );
    }
    toast.success(`Added ${all.length} projects to your resume!`);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl w-[95vw] max-h-[88vh] overflow-y-auto p-0 border border-border bg-background shadow-2xl rounded-none">
        {/* Header */}
        <div className="bg-[#102b2b] text-[#fbf8f1] p-6 border-b border-[#102b2b]/30">
          <div className="flex items-center justify-between">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#d8f36b] text-[#102b2b] text-xs font-black uppercase tracking-widest">
              <Github className="h-3.5 w-3.5" />
              GitHub Project Ingestion
            </div>
            <span className="text-xs font-mono font-bold text-[#d8f36b] bg-white/10 px-3 py-1">
              STAR Bullet Synthesizer
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white mt-3">
            Import GitHub Repositories into Resume Projects
          </h2>
          <p className="text-xs text-white/80 mt-1 max-w-xl leading-relaxed">
            Paste any repository URL or developer profile handle. Our engine extracts tech stacks, architecture, and synthesizes quantifiable STAR bullet points for your resume and portfolio.
          </p>
        </div>

        {/* Input & Preset Controls */}
        <div className="p-6 space-y-6">
          <div className="space-y-3">
            <label className="text-xs font-bold text-foreground">
              GitHub Repository URL or Username
            </label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Github className="w-4 h-4 absolute left-3 top-3.5 text-muted-foreground" />
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleIngest()}
                  placeholder="e.g. facebook/react or https://github.com/torvalds or username"
                  className="pl-9 h-11 text-xs rounded-none border-border"
                />
              </div>
              <Button
                onClick={() => handleIngest()}
                disabled={loading}
                className="bg-[#102b2b] text-[#d8f36b] hover:bg-[#164743] font-bold rounded-none h-11 px-6 text-xs cursor-pointer"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" />
                    Extracting...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5 mr-1.5" />
                    Ingest Project
                  </>
                )}
              </Button>
            </div>

            {/* Quick Demonstration Presets */}
            <div className="flex flex-wrap items-center gap-2 pt-1 text-xs text-muted-foreground">
              <span>Quick Presets:</span>
              <button
                type="button"
                onClick={() => {
                  setInput("va-tech-robotics/autonomous-rover-slam");
                  handleIngest("va-tech-robotics/autonomous-rover-slam");
                }}
                className="text-[11px] px-2 py-0.5 border border-border bg-muted/40 hover:bg-muted text-foreground transition-all cursor-pointer font-medium"
              >
                🤖 VT Robotics SLAM (C++)
              </button>
              <button
                type="button"
                onClick={() => {
                  setInput("odu-cyber/zerotrust-sentinel-api");
                  handleIngest("odu-cyber/zerotrust-sentinel-api");
                }}
                className="text-[11px] px-2 py-0.5 border border-border bg-muted/40 hover:bg-muted text-foreground transition-all cursor-pointer font-medium"
              >
                🛡️ ODU Zero-Trust API (Go)
              </button>
              <button
                type="button"
                onClick={() => {
                  setInput("vccs-dev/collegiate-course-planner");
                  handleIngest("vccs-dev/collegiate-course-planner");
                }}
                className="text-[11px] px-2 py-0.5 border border-border bg-muted/40 hover:bg-muted text-foreground transition-all cursor-pointer font-medium"
              >
                🎓 VCCS Degree Auditor (React)
              </button>
            </div>
          </div>

          {/* Results Display */}
          {result && (
            <div className="space-y-4 pt-4 border-t border-border">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                    <Code2 className="w-4 h-4 text-[#0d8274]" />
                    Extracted Projects ({result.projects.length})
                  </h3>
                  <p className="text-[11px] text-muted-foreground">
                    Quantifiable STAR bullet points synthesized and ready for your resume.
                  </p>
                </div>
                {result.projects.length > 1 && (
                  <Button
                    size="sm"
                    onClick={handleAddAll}
                    className="bg-[#0d8274] hover:bg-[#095e54] text-white text-xs font-bold rounded-none"
                  >
                    <Plus className="w-3.5 h-3.5 mr-1" /> Add All to Resume
                  </Button>
                )}
              </div>

              <div className="space-y-4">
                {result.projects.map((proj) => {
                  const isAdded = addedIds.has(proj.id);
                  const isCopied = copiedId === proj.id;

                  return (
                    <div
                      key={proj.id}
                      className="p-4 bg-muted/40 border border-border rounded-none space-y-3 hover:border-foreground/30 transition-all"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border/60 pb-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="text-sm font-bold text-foreground">{proj.name}</h4>
                            <a
                              href={proj.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-[11px] text-muted-foreground hover:text-foreground inline-flex items-center gap-0.5"
                            >
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          </div>
                          <p className="text-xs text-muted-foreground mt-0.5">{proj.description}</p>
                        </div>
                        <div className="flex items-center gap-3 text-xs text-muted-foreground shrink-0">
                          {proj.stars > 0 && (
                            <span className="flex items-center gap-1 font-mono">
                              <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                              {proj.stars}
                            </span>
                          )}
                          {proj.forks > 0 && (
                            <span className="flex items-center gap-1 font-mono">
                              <GitFork className="w-3 h-3" />
                              {proj.forks}
                            </span>
                          )}
                          <Badge variant="outline" className="text-[10px] rounded-none">
                            {proj.primaryLanguage}
                          </Badge>
                        </div>
                      </div>

                      {/* Technologies Chips */}
                      <div className="flex flex-wrap gap-1">
                        {proj.technologies.map((t) => (
                          <span
                            key={t}
                            className="px-2 py-0.5 bg-background border border-border text-[10px] font-mono text-muted-foreground"
                          >
                            {t}
                          </span>
                        ))}
                      </div>

                      {/* STAR Bullet Points */}
                      <div className="space-y-1.5 pt-1">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                          Synthesized STAR Bullet Points:
                        </span>
                        <ul className="space-y-1 text-xs text-foreground/90 pl-3">
                          {proj.highlights.map((h, i) => (
                            <li key={i} className="list-disc leading-relaxed">
                              {h}
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center justify-end gap-2 pt-2 border-t border-border/40">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleCopyBullets(proj)}
                          className="h-8 text-xs rounded-none border-border"
                        >
                          {isCopied ? (
                            <>
                              <Check className="w-3 h-3 text-emerald-600 mr-1" />
                              Copied!
                            </>
                          ) : (
                            <>
                              <Copy className="w-3 h-3 mr-1" />
                              Copy Bullets
                            </>
                          )}
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => handleAddProject(proj)}
                          disabled={isAdded}
                          className={`h-8 text-xs rounded-none font-bold ${
                            isAdded
                              ? "bg-emerald-600/15 text-emerald-600 border border-emerald-500/20"
                              : "bg-[#102b2b] text-[#d8f36b] hover:bg-[#164743]"
                          }`}
                        >
                          {isAdded ? (
                            <>
                              <CheckCircle2 className="w-3 h-3 mr-1" />
                              Added to Resume
                            </>
                          ) : (
                            <>
                              <Plus className="w-3 h-3 mr-1" />
                              Add to Resume
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
