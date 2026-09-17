"use client";

import React, { useState } from "react";
import {
  SANDBOXED_CHALLENGES,
  SandboxedChallenge,
  SandboxedExecutionResult,
  CryptographicSkillBadge,
  executeSandboxedChallenge,
  verifyCryptographicSkillBadge,
} from "@/lib/assessment/skill-sandbox-engine";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import {
  Code2,
  Play,
  CheckCircle2,
  XCircle,
  Award,
  Sparkles,
  Clock,
  Layers,
  ExternalLink,
  ShieldCheck,
  RotateCcw,
  Terminal,
  Check,
  Cpu,
  Copy,
} from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

export function SkillAssessmentView() {
  const [challenges] = useState<SandboxedChallenge[]>(SANDBOXED_CHALLENGES);
  const [selectedChallenge, setSelectedChallenge] = useState<SandboxedChallenge>(SANDBOXED_CHALLENGES[0]);
  const [userCode, setUserCode] = useState<string>(selectedChallenge.starterCode);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [isRunning, setIsRunning] = useState(false);
  const [result, setResult] = useState<SandboxedExecutionResult | null>(null);
  const [activeTab, setActiveTab] = useState<"editor" | "badges">("editor");
  const [issuedBadges, setIssuedBadges] = useState<CryptographicSkillBadge[]>([]);
  const [selectedBadgeForModal, setSelectedBadgeForModal] = useState<CryptographicSkillBadge | null>(null);
  const [isBadgeModalOpen, setIsBadgeModalOpen] = useState(false);

  const categories = [
    "All",
    "Software Engineering",
    "Distributed Systems",
    "Data & Business Intelligence",
    "Product Management & Strategy",
    "Financial Modeling & Accounting",
    "Healthcare & Clinical Nursing",
    "Digital Marketing & Growth",
  ];

  const filteredChallenges = challenges.filter((c) => {
    const matchesCategory = selectedCategory === "All" || c.category === selectedCategory;
    const matchesSearch =
      !searchQuery.trim() ||
      c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.careerField.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleSelectChallenge = (c: SandboxedChallenge) => {
    setSelectedChallenge(c);
    setUserCode(c.starterCode);
    setResult(null);
  };

  const handleRunExecution = async () => {
    setIsRunning(true);
    setResult(null);

    try {
      const executionResult = await executeSandboxedChallenge(selectedChallenge, userCode, "Verified Developer");
      setResult(executionResult);

      if (executionResult.badge) {
        setIssuedBadges((prev) => [
          executionResult.badge!,
          ...prev.filter((b) => b.challengeId !== selectedChallenge.id),
        ]);
        setSelectedBadgeForModal(executionResult.badge);
        setIsBadgeModalOpen(true);
        toast.success(`Passed 100%! Cryptographic skill badge issued!`);
      } else {
        toast.error(`Tests incomplete (${executionResult.passedTests}/${executionResult.totalTests} passed)`);
      }
    } catch (err: any) {
      toast.error(`Execution error: ${err.message}`);
    } finally {
      setIsRunning(false);
    }
  };

  const handleReset = () => {
    setUserCode(selectedChallenge.starterCode);
    setResult(null);
    toast.info("Reset challenge to initial starter code");
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="rounded-2xl border border-border/80 bg-card p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold shadow-md">
            <Cpu className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl font-bold text-foreground">Skill Verification Coding Sandbox</h1>
              <Badge className="bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30 text-[10px] font-mono">
                EIP-712 VERIFIABLE
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              Execute live algorithms and distributed systems challenges directly in your browser. Passing code generates cryptographically signed badges for your public portfolio.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant={activeTab === "editor" ? "default" : "outline"}
            onClick={() => setActiveTab("editor")}
            className="text-xs h-9 rounded-xl font-semibold"
          >
            <Code2 className="w-3.5 h-3.5 mr-1.5" /> Challenges
          </Button>
          <Button
            size="sm"
            variant={activeTab === "badges" ? "default" : "outline"}
            onClick={() => setActiveTab("badges")}
            className="text-xs h-9 rounded-xl font-semibold"
          >
            <Award className="w-3.5 h-3.5 mr-1.5 text-amber-500" />
            Verified Badges ({issuedBadges.length})
          </Button>
        </div>
      </div>

      {activeTab === "editor" ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Challenge Selector (4 cols) */}
          <div className="lg:col-span-4 space-y-4">
            <div className="space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground px-1">
                Explore Skills & Disciplines ({filteredChallenges.length})
              </span>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by skill, title, or field..."
                className="w-full h-8 px-3 text-xs rounded-lg border border-border bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
              <div className="flex flex-wrap gap-1 pt-1">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setSelectedCategory(cat)}
                    className={`text-[10px] font-medium px-2 py-0.5 rounded-full transition-colors ${
                      selectedCategory === cat
                        ? "bg-emerald-600 text-white font-bold shadow-xs"
                        : "bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2.5 max-h-[600px] overflow-y-auto pr-1">
              {filteredChallenges.length === 0 ? (
                <div className="p-6 text-center text-xs text-muted-foreground border rounded-xl border-dashed">
                  No skill challenges matching "{searchQuery}" in {selectedCategory}.
                </div>
              ) : (
                filteredChallenges.map((c) => {
                  const isSelected = selectedChallenge.id === c.id;
                  const isCompleted = issuedBadges.some((b) => b.challengeId === c.id);

                  return (
                    <div
                      key={c.id}
                      onClick={() => handleSelectChallenge(c)}
                      className={`p-4 rounded-2xl border transition-all cursor-pointer space-y-2 ${
                        isSelected
                          ? "bg-emerald-500/10 border-emerald-500/40 text-foreground shadow-sm ring-1 ring-emerald-500/20"
                          : "bg-card border-border/80 text-muted-foreground hover:bg-muted/20 hover:text-foreground"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <Badge variant="outline" className="text-[10px] font-mono">
                          {c.category}
                        </Badge>
                        <div className="flex items-center gap-1.5">
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              c.difficulty === "Medium"
                                ? "bg-blue-500/15 text-blue-600"
                                : c.difficulty === "Hard"
                                ? "bg-amber-500/15 text-amber-600"
                                : "bg-purple-500/15 text-purple-600"
                            }`}
                          >
                            {c.difficulty}
                          </span>
                          {isCompleted && <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
                        </div>
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-foreground leading-snug">{c.title}</h4>
                        <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold block mt-0.5">
                          {c.careerField}
                        </span>
                        <p className="text-xs text-muted-foreground line-clamp-2 mt-1">{c.description}</p>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Right Editor & Test Runner (8 cols) */}
          <div className="lg:col-span-8 space-y-4">
            <div className="rounded-2xl border border-border/80 bg-card overflow-hidden shadow-sm">
              {/* Header Bar */}
              <div className="px-5 py-3.5 border-b border-border/80 bg-muted/30 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Code2 className="w-4 h-4 text-emerald-600" />
                  <span className="text-xs font-bold text-foreground font-mono">solution.ts</span>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={handleReset}
                    className="h-8 text-xs text-muted-foreground hover:text-foreground"
                  >
                    <RotateCcw className="w-3.5 h-3.5 mr-1" /> Reset
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleRunExecution}
                    disabled={isRunning}
                    className="h-8 text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl gap-1.5 shadow-sm"
                  >
                    <Play className="w-3.5 h-3.5" />
                    {isRunning ? "Executing In Sandbox..." : "Run Tests & Verify"}
                  </Button>
                </div>
              </div>

              {/* Code Area */}
              <textarea
                value={userCode}
                onChange={(e) => setUserCode(e.target.value)}
                rows={16}
                spellCheck={false}
                className="w-full p-5 bg-[#090e17] text-emerald-400 font-mono text-xs leading-relaxed border-0 focus:outline-none focus:ring-0 resize-y"
              />

              {/* Sandbox Test Execution Results */}
              {result && (
                <div className="border-t border-border/80 p-5 bg-muted/10 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Terminal className="w-4 h-4 text-muted-foreground" />
                      <span className="text-xs font-bold uppercase tracking-wider text-foreground">
                        Sandbox Test Output
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-xs font-mono">
                      <span className="text-muted-foreground">{result.runtimeMs}ms</span>
                      <Badge
                        className={`text-xs font-bold ${
                          result.passed ? "bg-emerald-600 text-white" : "bg-amber-600 text-white"
                        }`}
                      >
                        {result.passedTests} / {result.totalTests} Passed ({result.score}%)
                      </Badge>
                    </div>
                  </div>

                  <div className="space-y-2">
                    {result.testDetails.map((t) => (
                      <div
                        key={t.id}
                        className={`p-3 rounded-xl border flex items-center justify-between text-xs ${
                          t.passed
                            ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-700 dark:text-emerald-300"
                            : "bg-rose-500/10 border-rose-500/30 text-rose-700 dark:text-rose-300"
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          {t.passed ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                          ) : (
                            <XCircle className="w-4 h-4 text-rose-600 shrink-0" />
                          )}
                          <span>{t.description}</span>
                        </div>
                        <span className="font-mono text-[10px] uppercase font-bold">
                          {t.passed ? "PASSED" : t.error || "FAILED"}
                        </span>
                      </div>
                    ))}
                  </div>

                  {result.badge && (
                    <div className="p-4 rounded-xl border border-emerald-500/30 bg-emerald-500/10 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Award className="w-5 h-5 text-amber-500" />
                        <div>
                          <p className="text-xs font-bold text-foreground">Cryptographic Skill Badge Earned!</p>
                          <p className="text-[11px] text-muted-foreground font-mono">
                            Signature: {result.badge.signatureHash.slice(0, 18)}...
                          </p>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        onClick={() => {
                          setSelectedBadgeForModal(result.badge!);
                          setIsBadgeModalOpen(true);
                        }}
                        className="text-xs h-8 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl"
                      >
                        View Verifiable Badge
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        /* Badges Showcase Tab */
        <div className="space-y-4">
          {issuedBadges.length === 0 ? (
            <div className="text-center py-16 border border-dashed border-border rounded-2xl p-8 space-y-3">
              <Award className="w-12 h-12 text-muted-foreground mx-auto" />
              <h3 className="text-base font-bold text-foreground">No Verified Badges Yet</h3>
              <p className="text-xs text-muted-foreground max-w-md mx-auto">
                Complete any of the active coding challenges with a 100% test score to generate cryptographically signed, verifiable skill badges for your portfolio.
              </p>
              <Button
                size="sm"
                onClick={() => setActiveTab("editor")}
                className="text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl"
              >
                Start Challenge
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {issuedBadges.map((badge) => (
                <Card
                  key={badge.badgeId}
                  className="rounded-2xl border-emerald-500/30 bg-card p-5 space-y-4 shadow-sm"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="h-10 w-10 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center font-bold">
                        <Award className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-foreground">{badge.challengeTitle}</h4>
                        <p className="text-[11px] text-muted-foreground">{badge.difficulty} Level</p>
                      </div>
                    </div>
                    <Badge className="bg-emerald-600 text-white border-none text-[10px] font-mono">
                      100% PASS
                    </Badge>
                  </div>

                  <div className="p-3 rounded-xl bg-muted/20 text-[11px] font-mono space-y-1">
                    <p className="text-muted-foreground text-[10px] uppercase">Cryptographic Signature</p>
                    <p className="text-foreground truncate">{badge.signatureHash}</p>
                    <p className="text-[10px] text-emerald-600 font-semibold flex items-center gap-1 pt-1">
                      <ShieldCheck className="w-3 h-3" /> Non-tamperable verification
                    </p>
                  </div>

                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      navigator.clipboard.writeText(badge.explorerUrl);
                      toast.success("Verification link copied to clipboard!");
                    }}
                    className="w-full text-xs h-8 rounded-xl font-semibold gap-1.5"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    Copy Credential Link
                  </Button>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Verifiable Badge Modal */}
      {selectedBadgeForModal && (
        <Dialog open={isBadgeModalOpen} onOpenChange={setIsBadgeModalOpen}>
          <DialogContent className="max-w-md rounded-2xl border-border bg-card p-6 shadow-2xl space-y-5">
            <DialogHeader className="text-center">
              <div className="h-16 w-16 mx-auto rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-500 shadow-inner mb-2">
                <Award className="w-8 h-8" />
              </div>
              <DialogTitle className="text-lg font-black text-foreground">
                Cryptographically Verified Skill Badge
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                Issued for deterministic in-browser unit test execution.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-3 p-4 rounded-xl border border-border/80 bg-muted/20 text-xs">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Challenge</span>
                <span className="font-bold text-foreground">{selectedBadgeForModal.challengeTitle}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Difficulty</span>
                <span className="font-semibold text-foreground">{selectedBadgeForModal.difficulty}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Test Score</span>
                <span className="font-bold text-emerald-600">{selectedBadgeForModal.score}% Perfect</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Execution Latency</span>
                <span className="font-mono text-foreground">{selectedBadgeForModal.executionTimeMs}ms</span>
              </div>
              <div className="pt-2 border-t border-border/60 space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  HMAC-SHA256 Signature
                </span>
                <p className="font-mono text-[10px] break-all bg-card p-2 rounded-lg border border-border text-foreground">
                  {selectedBadgeForModal.signatureHash}
                </p>
              </div>
            </div>

            <DialogFooter className="pt-2 flex flex-col sm:flex-row gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsBadgeModalOpen(false)}
                className="flex-1 rounded-xl text-xs"
              >
                Close
              </Button>
              <a
                href={selectedBadgeForModal.explorerUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1"
              >
                <Button
                  size="sm"
                  className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl gap-1.5"
                >
                  <ExternalLink className="w-3.5 h-3.5" /> View Certificate
                </Button>
              </a>
              <Button
                size="sm"
                variant="secondary"
                onClick={() => {
                  navigator.clipboard.writeText(selectedBadgeForModal.explorerUrl);
                  toast.success("Verifiable badge URL copied to clipboard!");
                }}
                className="flex-1 text-xs font-semibold rounded-xl"
              >
                <Copy className="w-3.5 h-3.5 mr-1" /> Copy Link
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
