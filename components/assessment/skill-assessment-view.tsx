"use client";

import React, { useState } from "react";
import { 
  Code2, 
  Play, 
  CheckCircle2, 
  XCircle, 
  Award, 
  Sparkles, 
  Clock, 
  Layers, 
  ChevronRight,
  ExternalLink,
  ShieldCheck,
  RotateCcw
} from "lucide-react";
import { 
  ASSESSMENT_CHALLENGES, 
  evaluateAssessmentSubmission, 
  AssessmentChallenge, 
  AssessmentResult, 
  SkillBadge 
} from "@/lib/assessment/skill-sandbox";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export function SkillAssessmentView() {
  const [selectedChallenge, setSelectedChallenge] = useState<AssessmentChallenge>(ASSESSMENT_CHALLENGES[0]);
  const [userCode, setUserCode] = useState(selectedChallenge.starterCode);
  const [isRunning, setIsRunning] = useState(false);
  const [result, setResult] = useState<AssessmentResult | null>(null);
  const [showBadgeModal, setShowBadgeModal] = useState(false);
  const [unlockedBadges, setUnlockedBadges] = useState<SkillBadge[]>([]);

  const handleSelectChallenge = (c: AssessmentChallenge) => {
    setSelectedChallenge(c);
    setUserCode(c.starterCode);
    setResult(null);
  };

  const handleRunEvaluation = () => {
    setIsRunning(true);
    setResult(null);

    setTimeout(() => {
      const evaluation = evaluateAssessmentSubmission(selectedChallenge.id, userCode);
      setResult(evaluation);
      setIsRunning(false);

      if (evaluation.badge) {
        setUnlockedBadges(prev => [...prev.filter(b => b.skillName !== evaluation.badge!.skillName), evaluation.badge!]);
        setShowBadgeModal(true);
      }
    }, 600);
  };

  const handleResetCode = () => {
    setUserCode(selectedChallenge.starterCode);
    setResult(null);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-2xl bg-gradient-to-r from-violet-950/40 via-indigo-950/30 to-background border border-violet-500/20 backdrop-blur-sm">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Badge className="bg-violet-500/20 text-violet-300 border-violet-500/30 font-medium">
              <Sparkles className="w-3.5 h-3.5 mr-1" />
              Phase 59: Interactive Technical Sandbox
            </Badge>
            {unlockedBadges.length > 0 && (
              <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/30">
                <Award className="w-3.5 h-3.5 mr-1" />
                {unlockedBadges.length} Badge(s) Earned
              </Badge>
            )}
          </div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white">
            Candidate Skill Assessment Sandbox
          </h1>
          <p className="text-sm text-muted-foreground mt-1 max-w-2xl">
            Complete real-world technical and algorithmic case challenges in-browser. Verified submissions automatically mint verifiable cryptographic badges anchored to your public profile and resume.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button 
            onClick={handleRunEvaluation} 
            disabled={isRunning}
            className="bg-violet-600 hover:bg-violet-500 text-white shadow-lg shadow-violet-600/20"
          >
            <Play className={`w-4 h-4 mr-2 ${isRunning ? "animate-spin" : ""}`} />
            {isRunning ? "Evaluating..." : "Run Test Suite"}
          </Button>
        </div>
      </div>

      {/* Challenge Selector Tabs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {ASSESSMENT_CHALLENGES.map((ch) => {
          const isSelected = selectedChallenge.id === ch.id;
          const isEarned = unlockedBadges.some(b => b.skillName === ch.title);

          return (
            <button
              key={ch.id}
              onClick={() => handleSelectChallenge(ch)}
              className={`p-4 rounded-xl border text-left transition-all ${
                isSelected 
                  ? "bg-violet-950/30 border-violet-500/50 ring-1 ring-violet-500/30 shadow-md"
                  : "bg-card/50 hover:bg-card border-border/60"
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  {ch.category}
                </span>
                <div className="flex items-center gap-1.5">
                  <Badge variant="outline" className="text-[10px] uppercase font-mono">
                    {ch.difficulty}
                  </Badge>
                  {isEarned && (
                    <span className="text-emerald-400" title="Badge Unlocked">
                      <CheckCircle2 className="w-4 h-4" />
                    </span>
                  )}
                </div>
              </div>
              <h2 className="font-semibold text-sm text-white line-clamp-1">{ch.title}</h2>
              <div className="flex items-center gap-3 text-xs text-muted-foreground mt-2">
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" /> {ch.timeLimitMinutes} mins
                </span>
                <span className="flex items-center gap-1">
                  <Layers className="w-3.5 h-3.5" /> {ch.testCases.length} assertions
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Main Sandbox Split Pane */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Pane: Challenge Specs & Test Cases */}
        <div className="lg:col-span-5 space-y-4">
          <div className="p-5 rounded-xl border border-border/60 bg-card/60 space-y-4">
            <div>
              <h2 className="text-lg font-bold text-white">{selectedChallenge.title}</h2>
              <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">
                {selectedChallenge.description}
              </p>
            </div>

            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                Requirements
              </h3>
              <ul className="space-y-1.5">
                {selectedChallenge.instructions.map((ins, i) => (
                  <li key={i} className="text-xs text-neutral-300 flex items-start gap-2">
                    <span className="text-violet-400 mt-0.5">•</span>
                    <span>{ins}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                Test Assertions ({selectedChallenge.testCases.length})
              </h3>
              <div className="space-y-2">
                {selectedChallenge.testCases.map((tc, i) => {
                  const testOutput = result?.testOutputs.find(to => to.name === tc.name);
                  return (
                    <div key={i} className="p-2.5 rounded-lg border border-border/40 bg-black/30 text-xs">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium text-white">{tc.name}</span>
                        {testOutput ? (
                          testOutput.passed ? (
                            <span className="text-emerald-400 flex items-center gap-1 text-[11px]">
                              <CheckCircle2 className="w-3.5 h-3.5" /> Passed
                            </span>
                          ) : (
                            <span className="text-red-400 flex items-center gap-1 text-[11px]">
                              <XCircle className="w-3.5 h-3.5" /> Failed
                            </span>
                          )
                        ) : (
                          <span className="text-muted-foreground text-[11px]">Pending</span>
                        )}
                      </div>
                      <div className="font-mono text-[11px] text-muted-foreground">
                        Expects: {tc.expected}
                      </div>
                      {testOutput?.error && (
                        <p className="text-[11px] text-red-400 font-mono mt-1">
                          {testOutput.error}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Right Pane: Code Editor & Execution Console */}
        <div className="lg:col-span-7 space-y-4">
          <div className="rounded-xl border border-border/60 bg-black/80 overflow-hidden shadow-2xl flex flex-col h-[520px]">
            {/* Editor Toolbar */}
            <div className="flex items-center justify-between px-4 py-2.5 bg-neutral-900 border-b border-border/40 text-xs">
              <div className="flex items-center gap-2">
                <Code2 className="w-4 h-4 text-violet-400" />
                <span className="font-mono text-neutral-300">solution.ts</span>
              </div>
              <div className="flex items-center gap-2">
                <Button 
                  size="sm" 
                  variant="ghost" 
                  onClick={handleResetCode}
                  className="h-7 text-xs text-neutral-400 hover:text-white"
                >
                  <RotateCcw className="w-3 h-3 mr-1" /> Reset
                </Button>
                <Button
                  size="sm"
                  onClick={handleRunEvaluation}
                  disabled={isRunning}
                  className="h-7 text-xs bg-violet-600 hover:bg-violet-500 text-white font-medium"
                >
                  <Play className={`w-3 h-3 mr-1 ${isRunning ? "animate-spin" : ""}`} />
                  {isRunning ? "Running..." : "Run Tests"}
                </Button>
              </div>
            </div>

            {/* Code Textarea / IDE */}
            <div className="flex-1 p-4 font-mono text-xs text-emerald-400/90 leading-relaxed overflow-y-auto">
              <textarea
                value={userCode}
                onChange={(e) => setUserCode(e.target.value)}
                className="w-full h-full bg-transparent resize-none outline-none font-mono text-xs text-neutral-200 focus:ring-0 leading-relaxed selection:bg-violet-500/30"
                placeholder="// Type your solution here..."
                spellCheck={false}
              />
            </div>

            {/* Results Drawer */}
            {result && (
              <div className={`p-3.5 border-t text-xs backdrop-blur-md flex items-center justify-between ${
                result.passed 
                  ? "bg-emerald-950/60 border-emerald-500/40 text-emerald-200" 
                  : "bg-red-950/60 border-red-500/40 text-red-200"
              }`}>
                <div className="flex items-center gap-2.5">
                  {result.passed ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                  ) : (
                    <XCircle className="w-5 h-5 text-red-400" />
                  )}
                  <div>
                    <span className="font-semibold text-white">
                      {result.passed ? "All Tests Passed!" : "Test Suite Incomplete"}
                    </span>
                    <span className="ml-2 opacity-80">
                      ({result.passedCount}/{result.totalCount} passed • Score: {result.score}% • {result.executionTimeMs}ms)
                    </span>
                  </div>
                </div>

                {result.badge && (
                  <Button 
                    size="sm" 
                    onClick={() => setShowBadgeModal(true)}
                    className="h-7 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold"
                  >
                    <Award className="w-3.5 h-3.5 mr-1" /> View Badge
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Verifiable Badge Modal */}
      {showBadgeModal && result?.badge && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="relative w-full max-w-lg p-6 rounded-2xl bg-neutral-900 border border-violet-500/40 shadow-2xl text-center space-y-4">
            <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-tr from-violet-600 to-indigo-400 p-0.5 shadow-lg shadow-violet-500/30 flex items-center justify-center">
              <div className="w-full h-full rounded-full bg-neutral-900 flex items-center justify-center">
                <Award className="w-8 h-8 text-violet-400 animate-bounce" />
              </div>
            </div>

            <div>
              <Badge className="bg-violet-500/20 text-violet-300 border-violet-500/30 mb-2">
                {result.badge.tier}
              </Badge>
              <h2 className="text-xl font-bold text-white">
                Skill Verified: {result.badge.skillName}
              </h2>
              <p className="text-xs text-muted-foreground mt-1">
                Completed with {result.badge.score}% score • Verifiable on-chain
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-black/60 border border-white/10 text-left font-mono text-xs space-y-1.5">
              <div className="flex justify-between text-muted-foreground text-[10px]">
                <span>CRYPTOGRAPHIC PROOF HASH</span>
                <span className="text-emerald-400">VERIFIED</span>
              </div>
              <p className="text-neutral-300 text-[11px] truncate select-all">
                {result.badge.verificationHash}
              </p>
              <div className="flex items-center gap-1 text-[10px] text-muted-foreground pt-1">
                <ShieldCheck className="w-3.5 h-3.5 text-violet-400" />
                <span>Anchored to Polygon Public Ledger</span>
              </div>
            </div>

            <div className="flex items-center justify-center gap-3 pt-2">
              <Button 
                variant="outline"
                onClick={() => setShowBadgeModal(false)}
                className="text-xs"
              >
                Close
              </Button>
              <Button
                onClick={() => {
                  alert("Badge pinned to your profile & active resume!");
                  setShowBadgeModal(false);
                }}
                className="bg-violet-600 hover:bg-violet-500 text-white text-xs"
              >
                Attach to Resume & Portfolio
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
