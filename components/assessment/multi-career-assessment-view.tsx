"use client";

import React, { useState, useEffect } from "react";
import {
  CURATED_CAREER_TRACKS,
  CareerAssessmentTrack,
  ExperienceLevel,
  AssessmentSubmission,
  AssessmentEvaluationResult,
  MultiCareerBadge,
} from "@/lib/assessment/multi-career-engine";
import {
  SANDBOXED_CHALLENGES,
  SandboxedChallenge,
  SandboxedExecutionResult,
  CryptographicSkillBadge,
  executeSandboxedChallenge,
  getBadgeVerificationUrl,
} from "@/lib/assessment/skill-sandbox-engine";
import { QuickPracticeDrill } from "@/components/assessment/quick-practice-drill";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import {
  Briefcase,
  Sparkles,
  Award,
  ShieldCheck,
  CheckCircle2,
  Clock,
  ArrowRight,
  Code2,
  Play,
  RotateCcw,
  Check,
  Copy,
  ExternalLink,
  ChevronRight,
  AlertCircle,
  HelpCircle,
  Lightbulb,
  Search,
  PlusCircle,
  Stethoscope,
  Target,
  TrendingUp,
  DollarSign,
  Users,
  Palette,
  Truck,
  Server,
  Share2,
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

const DISCIPLINE_ICONS: Record<string, React.ElementType> = {
  "Healthcare & Medicine": Stethoscope,
  "Product & Strategy": Target,
  "Marketing & Sales": TrendingUp,
  "Finance & Accounting": DollarSign,
  "People & Talent": Users,
  "Design & Creative": Palette,
  "Operations & Logistics": Truck,
  "Software & Technology": Server,
  "Specialized Career": Briefcase,
};

export function MultiCareerAssessmentView() {
  // Navigation & Mode
  const [activeTab, setActiveTab] = useState<"careers" | "coding" | "badges">("careers");
  const [selectedTrack, setSelectedTrack] = useState<CareerAssessmentTrack>(CURATED_CAREER_TRACKS[0]);
  const [selectedDiscipline, setSelectedDiscipline] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState("");

  // Candidate Assessment State
  const [candidateName, setCandidateName] = useState("Alex Johnson");
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({});
  const [caseStudyAnswer, setCaseStudyAnswer] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [evaluationResult, setEvaluationResult] = useState<AssessmentEvaluationResult | null>(null);

  // Custom Role Generator State
  const [customRoleInput, setCustomRoleInput] = useState("");
  const [customLevel, setCustomLevel] = useState<ExperienceLevel>("Senior Specialist");
  const [isGeneratingCustom, setIsGeneratingCustom] = useState(false);
  const [availableTracks, setAvailableTracks] = useState<CareerAssessmentTrack[]>(CURATED_CAREER_TRACKS);

  // Verified Badges State (saved in localStorage)
  const [savedCareerBadges, setSavedCareerBadges] = useState<MultiCareerBadge[]>([]);
  const [savedCodeBadges, setSavedCodeBadges] = useState<CryptographicSkillBadge[]>([]);
  const [activeModalBadge, setActiveModalBadge] = useState<MultiCareerBadge | null>(null);
  const [isBadgeModalOpen, setIsBadgeModalOpen] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  // Coding Sandbox State (for developers)
  const [selectedCodingChallenge, setSelectedCodingChallenge] = useState<SandboxedChallenge>(SANDBOXED_CHALLENGES[0]);
  const [userCode, setUserCode] = useState<string>(selectedCodingChallenge.starterCode);
  const [isCodeRunning, setIsCodeRunning] = useState(false);
  const [codeResult, setCodeResult] = useState<SandboxedExecutionResult | null>(null);

  // Load saved badges from localStorage
  useEffect(() => {
    try {
      const storedCareer = localStorage.getItem("resumeforge_career_badges");
      if (storedCareer) setSavedCareerBadges(JSON.parse(storedCareer));

      const storedCode = localStorage.getItem("resumeforge_code_badges");
      if (storedCode) setSavedCodeBadges(JSON.parse(storedCode));
    } catch (e) {
      console.error("Failed to load badges from storage:", e);
    }
  }, []);

  const saveCareerBadge = (badge: MultiCareerBadge) => {
    setSavedCareerBadges((prev) => {
      const next = [badge, ...prev.filter((b) => b.badgeId !== badge.badgeId)];
      try {
        localStorage.setItem("resumeforge_career_badges", JSON.stringify(next));
      } catch (e) {}
      return next;
    });
  };

  const saveCodeBadge = (badge: CryptographicSkillBadge) => {
    setSavedCodeBadges((prev) => {
      const next = [badge, ...prev.filter((b) => b.badgeId !== badge.badgeId)];
      try {
        localStorage.setItem("resumeforge_code_badges", JSON.stringify(next));
      } catch (e) {}
      return next;
    });
  };

  // Filter Tracks
  const disciplines = [
    "All",
    "Healthcare & Medicine",
    "Product & Strategy",
    "Marketing & Sales",
    "Finance & Accounting",
    "People & Talent",
    "Design & Creative",
    "Operations & Logistics",
    "Software & Technology",
  ];

  const filteredTracks = availableTracks.filter((t) => {
    const matchesDiscipline = selectedDiscipline === "All" || t.category === selectedDiscipline;
    const matchesSearch =
      !searchQuery.trim() ||
      t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.careerField.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.overview.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesDiscipline && matchesSearch;
  });

  const handleSelectTrack = (track: CareerAssessmentTrack) => {
    setSelectedTrack(track);
    setSelectedAnswers({});
    setCaseStudyAnswer("");
    setEvaluationResult(null);
  };

  // Generate Custom Role Assessment
  const handleGenerateCustomAssessment = async () => {
    if (!customRoleInput.trim()) {
      toast.error("Please enter a career title or skill domain.");
      return;
    }

    setIsGeneratingCustom(true);
    try {
      const res = await fetch("/api/ai/assessment/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          careerTitle: customRoleInput.trim(),
          experienceLevel: customLevel,
        }),
      });

      const data = await res.json();
      if (data.track) {
        setAvailableTracks((prev) => [data.track, ...prev]);
        setSelectedTrack(data.track);
        setSelectedAnswers({});
        setCaseStudyAnswer("");
        setEvaluationResult(null);
        toast.success(`Generated personalized assessment for ${data.track.careerField}!`);
      } else {
        throw new Error(data.error || "Generation failed");
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to generate assessment. Please try again.");
    } finally {
      setIsGeneratingCustom(false);
    }
  };

  // Submit and Evaluate Multi-Career Assessment
  const handleSubmitAssessment = async () => {
    // Validate that situational answers are selected
    const totalQuestions = selectedTrack.situationalQuestions.length;
    const answeredCount = Object.keys(selectedAnswers).length;

    if (answeredCount < totalQuestions) {
      toast.warning(`Please answer all ${totalQuestions} situational judgment dilemmas before submitting.`);
      return;
    }

    if (!caseStudyAnswer.trim() || caseStudyAnswer.trim().length < 40) {
      toast.warning("Please provide a more detailed strategic response to the applied case study challenge.");
      return;
    }

    setIsSubmitting(true);
    try {
      const submission: AssessmentSubmission = {
        candidateName,
        trackId: selectedTrack.id,
        selectedAnswers,
        caseStudyAnswer,
        timeSpentSeconds: 600,
      };

      const res = await fetch("/api/ai/assessment/evaluate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          track: selectedTrack,
          submission,
        }),
      });

      const result: AssessmentEvaluationResult = await res.json();
      setEvaluationResult(result);

      if (result.passed && result.badge) {
        saveCareerBadge(result.badge);
        setActiveModalBadge(result.badge);
        setIsBadgeModalOpen(true);
        toast.success(`Assessment Passed (${result.overallScore}%)! Cryptographic Skill Badge issued!`);
      } else {
        toast.info(`Assessment Evaluated: Score ${result.overallScore}%. Review feedback below.`);
      }
    } catch (err: any) {
      toast.error(err.message || "Evaluation failed. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Run Coding Sandbox Challenge
  const handleRunCode = async () => {
    setIsCodeRunning(true);
    setCodeResult(null);
    try {
      const result = await executeSandboxedChallenge(selectedCodingChallenge, userCode, candidateName);
      setCodeResult(result);

      if (result.badge) {
        saveCodeBadge(result.badge);
        toast.success(`Passed 100%! Cryptographic code badge issued!`);
      } else {
        toast.error(`Tests incomplete (${result.passedTests}/${result.totalTests} passed)`);
      }
    } catch (err: any) {
      toast.error(`Execution error: ${err.message}`);
    } finally {
      setIsCodeRunning(false);
    }
  };

  const copyBadgeVerificationLink = (badge: MultiCareerBadge | CryptographicSkillBadge) => {
    const url = badge.explorerUrl || getBadgeVerificationUrl(badge.signatureHash);
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    toast.success("Verification link copied to clipboard!");
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const totalBadgesCount = savedCareerBadges.length + savedCodeBadges.length;

  return (
    <div className="space-y-6 min-w-0 max-w-full overflow-hidden">
      {/* Top Banner / Mode Switcher */}
      <div className="rounded-2xl border border-border/80 bg-card p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 rounded-xl bg-primary text-primary-foreground flex items-center justify-center font-bold shadow-md">
            <Briefcase className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl font-bold text-foreground">Cross-Disciplinary Skill Verification</h1>
              <Badge variant="outline" className="border-primary/40 text-primary bg-primary/10 text-[10px] font-mono font-semibold">
                EIP-712 / W3C VERIFIABLE
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              Verify competencies across any career or skill—Healthcare, Product, Marketing, Finance, HR, Design, or custom roles. Earn tamper-proof credentials.
            </p>
          </div>
        </div>

        {/* Tab Controls */}
        <div className="flex items-center gap-2 flex-wrap">
          <Button
            size="sm"
            variant={activeTab === "careers" ? "default" : "outline"}
            onClick={() => setActiveTab("careers")}
            className="text-xs h-9 rounded-xl font-semibold gap-1.5"
          >
            <Briefcase className="w-3.5 h-3.5" /> All Careers & Skills
          </Button>
          <Button
            size="sm"
            variant={activeTab === "coding" ? "default" : "outline"}
            onClick={() => setActiveTab("coding")}
            className="text-xs h-9 rounded-xl font-semibold gap-1.5"
          >
            <Code2 className="w-3.5 h-3.5" /> Live Code Sandbox
          </Button>
          <Button
            size="sm"
            variant={activeTab === "badges" ? "default" : "outline"}
            onClick={() => setActiveTab("badges")}
            className="text-xs h-9 rounded-xl font-semibold gap-1.5"
          >
            <Award className="w-3.5 h-3.5 text-amber-500" />
            Verified Badges ({totalBadgesCount})
          </Button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* MODE 1: ALL CAREERS & SKILLS ASSESSMENT                                  */}
      {/* ========================================================================= */}
      {activeTab === "careers" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start min-w-0">
          {/* Left Column: Role Selector & Custom Role Generator (4 cols) */}
          <div className="lg:col-span-4 space-y-4">
            {/* Custom Role AI Generator Box */}
            <div className="rounded-2xl border border-primary/30 bg-primary/5 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-foreground flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-primary" /> Assess Any Career or Skill
                </span>
                <span className="text-[10px] text-muted-foreground font-medium">AI Dynamic</span>
              </div>
              <p className="text-xs text-muted-foreground">
                Enter your role to generate a customized assessment with real-world dilemmas.
              </p>

              <div className="space-y-2">
                <input
                  type="text"
                  value={customRoleInput}
                  onChange={(e) => setCustomRoleInput(e.target.value)}
                  placeholder="e.g. Civil Engineer, Growth Lead, Nurse, Chef..."
                  className="w-full h-9 px-3 text-xs rounded-xl border border-border bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                />

                <div className="grid grid-cols-2 gap-2">
                  <select
                    value={customLevel}
                    onChange={(e) => setCustomLevel(e.target.value as ExperienceLevel)}
                    className="h-8 px-2 text-xs rounded-lg border border-border bg-card text-foreground focus:outline-none"
                  >
                    <option value="Entry Level">Entry Level</option>
                    <option value="Mid Level">Mid Level</option>
                    <option value="Senior Specialist">Senior Specialist</option>
                    <option value="Executive / Director">Executive / Director</option>
                  </select>

                  <Button
                    size="sm"
                    disabled={isGeneratingCustom}
                    onClick={handleGenerateCustomAssessment}
                    className="h-8 text-xs font-semibold rounded-lg gap-1.5 w-full"
                  >
                    {isGeneratingCustom ? (
                      <>
                        <RotateCcw className="w-3.5 h-3.5 animate-spin" /> Generating...
                      </>
                    ) : (
                      <>
                        <PlusCircle className="w-3.5 h-3.5" /> Generate
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>

            {/* Explore Disciplines */}
            <div className="space-y-2">
              <div className="flex items-center justify-between px-1">
                <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Curated Assessment Tracks ({filteredTracks.length})
                </span>
              </div>

              {/* Search */}
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-muted-foreground" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by career, title, or skill..."
                  className="w-full h-8 pl-8 pr-3 text-xs rounded-lg border border-border bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              {/* Discipline Filter Chips */}
              <div className="flex flex-wrap gap-1 pt-1">
                {disciplines.map((d) => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => setSelectedDiscipline(d)}
                    className={`text-[10px] font-medium px-2 py-0.5 rounded-full transition-colors ${
                      selectedDiscipline === d
                        ? "bg-primary text-primary-foreground font-bold shadow-xs"
                        : "bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground"
                    }`}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </div>

            {/* Track Cards List */}
            <div className="space-y-2.5 max-h-[600px] overflow-y-auto pr-1">
              {filteredTracks.length === 0 ? (
                <div className="p-6 text-center text-xs text-muted-foreground border rounded-xl border-dashed">
                  No assessments found matching "{searchQuery}". Try using the AI generator above!
                </div>
              ) : (
                filteredTracks.map((track) => {
                  const isSelected = selectedTrack.id === track.id;
                  const Icon = DISCIPLINE_ICONS[track.category] || Briefcase;
                  const isCompleted = savedCareerBadges.some((b) => b.trackTitle === track.title);

                  return (
                    <div
                      key={track.id}
                      onClick={() => handleSelectTrack(track)}
                      className={`p-4 rounded-2xl border transition-all cursor-pointer space-y-2 ${
                        isSelected
                          ? "bg-primary/10 border-primary/40 text-foreground shadow-sm ring-1 ring-primary/20"
                          : "bg-card border-border/80 text-muted-foreground hover:bg-muted/40 hover:text-foreground"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <Badge variant="outline" className="text-[10px] font-mono gap-1 border-border">
                          <Icon className="w-3 h-3 text-primary" /> {track.careerField}
                        </Badge>
                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                            {track.experienceLevel}
                          </span>
                          {isCompleted && <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />}
                        </div>
                      </div>

                      <div>
                        <h4 className="text-sm font-bold text-foreground leading-snug">{track.title}</h4>
                        <p className="text-xs text-muted-foreground line-clamp-2 mt-1">{track.overview}</p>
                      </div>

                      <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-1 border-t border-border/60">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" /> {track.timeLimitMinutes} mins
                        </span>
                        <span className="font-medium text-primary flex items-center gap-0.5">
                          {track.situationalQuestions.length} Dilemmas + 1 Case Study <ChevronRight className="w-3 h-3" />
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Right Column: Assessment Interface (8 cols) */}
          <div className="lg:col-span-8 space-y-6">
            {/* Active Track Header */}
            <div className="rounded-2xl border border-border/80 bg-card p-6 shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/70 pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <Badge className="bg-primary/15 text-primary border-primary/30 text-[10px] font-semibold">
                      {selectedTrack.category}
                    </Badge>
                    <Badge variant="outline" className="text-[10px] text-muted-foreground">
                      {selectedTrack.experienceLevel}
                    </Badge>
                  </div>
                  <h2 className="text-xl font-black text-foreground tracking-tight mt-1">{selectedTrack.title}</h2>
                  <p className="text-xs text-muted-foreground mt-1">{selectedTrack.overview}</p>
                </div>

                <div className="flex items-center gap-2">
                  <div className="text-right sm:border-l sm:border-border sm:pl-4">
                    <span className="text-[11px] text-muted-foreground block">Candidate Name</span>
                    <input
                      type="text"
                      value={candidateName}
                      onChange={(e) => setCandidateName(e.target.value)}
                      placeholder="Your full name"
                      className="h-8 px-2 text-xs font-semibold rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-primary w-36"
                    />
                  </div>
                </div>
              </div>

              {/* Tested Competencies */}
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-2">
                  Target Competencies Verified:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {selectedTrack.keyCompetencies.map((comp) => (
                    <span
                      key={comp}
                      className="text-xs font-medium px-2.5 py-1 rounded-xl bg-muted/60 border border-border/70 text-foreground"
                    >
                      ✓ {comp}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Quick Practice Drill (powered by cached RapidAPI questions) */}
            <QuickPracticeDrill
              careerField={selectedTrack.careerField}
              difficulty={
                selectedTrack.experienceLevel === "Entry Level" ? "junior"
                : selectedTrack.experienceLevel === "Mid Level" ? "mid"
                : selectedTrack.experienceLevel === "Executive / Director" ? "executive"
                : "senior"
              }
              numQuestions={5}
            />

            {/* PART 1: Situational Judgment Dilemmas */}
            <div className="rounded-2xl border border-border/80 bg-card p-6 shadow-sm space-y-6">
              <div className="flex items-center justify-between border-b border-border/70 pb-3">
                <div className="flex items-center gap-2">
                  <span className="h-6 w-6 rounded-full bg-primary/15 text-primary text-xs font-bold flex items-center justify-center">
                    1
                  </span>
                  <h3 className="text-base font-bold text-foreground">Situational Judgment & Decision Dilemmas</h3>
                </div>
                <span className="text-xs text-muted-foreground font-mono">
                  {Object.keys(selectedAnswers).length} / {selectedTrack.situationalQuestions.length} answered
                </span>
              </div>

              <div className="space-y-6">
                {selectedTrack.situationalQuestions.map((q, qIndex) => (
                  <div key={q.id} className="p-4 rounded-xl border border-border/80 bg-muted/20 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-primary flex items-center gap-1.5">
                        <HelpCircle className="w-3.5 h-3.5" /> Scenario #{qIndex + 1}: {q.competency}
                      </span>
                    </div>

                    <p className="text-xs text-foreground/90 font-medium leading-relaxed bg-background/80 p-3 rounded-lg border border-border/60">
                      "{q.scenario}"
                    </p>

                    <h4 className="text-xs font-bold text-foreground">{q.question}</h4>

                    <div className="space-y-2 pt-1">
                      {q.options.map((opt) => {
                        const isChosen = selectedAnswers[q.id] === opt.id;
                        return (
                          <div
                            key={opt.id}
                            onClick={() => setSelectedAnswers((prev) => ({ ...prev, [q.id]: opt.id }))}
                            className={`p-3 rounded-xl border transition-all cursor-pointer flex items-start gap-3 ${
                              isChosen
                                ? "bg-primary/10 border-primary text-foreground ring-1 ring-primary/30"
                                : "bg-card border-border/70 text-muted-foreground hover:bg-muted/40 hover:text-foreground"
                            }`}
                          >
                            <div
                              className={`h-4 w-4 rounded-full border mt-0.5 flex items-center justify-center shrink-0 ${
                                isChosen ? "border-primary bg-primary text-primary-foreground" : "border-muted-foreground"
                              }`}
                            >
                              {isChosen && <div className="h-1.5 w-1.5 rounded-full bg-current" />}
                            </div>
                            <span className="text-xs leading-relaxed font-normal">{opt.text}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* PART 2: Applied Real-World Case Study */}
            <div className="rounded-2xl border border-border/80 bg-card p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-border/70 pb-3">
                <div className="flex items-center gap-2">
                  <span className="h-6 w-6 rounded-full bg-primary/15 text-primary text-xs font-bold flex items-center justify-center">
                    2
                  </span>
                  <h3 className="text-base font-bold text-foreground">Applied Real-World Case Study Challenge</h3>
                </div>
                <Badge variant="outline" className="text-[10px] text-muted-foreground">
                  Written Strategy Challenge
                </Badge>
              </div>

              <div className="p-4 rounded-xl border border-border/80 bg-muted/20 space-y-3">
                <h4 className="text-sm font-bold text-foreground">{selectedTrack.caseStudy.title}</h4>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {selectedTrack.caseStudy.context}
                </p>

                <div className="p-3.5 rounded-xl bg-primary/5 border border-primary/20 space-y-1.5">
                  <span className="text-xs font-bold text-primary flex items-center gap-1.5">
                    <Target className="w-3.5 h-3.5" /> Assessment Directive & Prompt:
                  </span>
                  <p className="text-xs font-medium text-foreground leading-relaxed">
                    {selectedTrack.caseStudy.prompt}
                  </p>
                </div>

                {/* Rubric Points */}
                <div className="space-y-1.5 pt-1">
                  <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block">
                    Scoring Rubric:
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    {selectedTrack.caseStudy.rubric.map((r, idx) => (
                      <div key={idx} className="p-2.5 rounded-lg border border-border/60 bg-card text-xs space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-foreground text-[11px]">{r.criterion}</span>
                          <span className="text-primary font-mono font-bold text-[10px]">{r.points} pts</span>
                        </div>
                        <p className="text-[10px] text-muted-foreground leading-snug">{r.description}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Candidate Strategy Response Field */}
                <div className="space-y-2 pt-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-foreground">
                      Your Strategic Response & Implementation Roadmap:
                    </label>
                    <span className="text-[11px] text-muted-foreground">
                      {caseStudyAnswer.trim().split(/\s+/).filter(Boolean).length} words
                    </span>
                  </div>

                  <textarea
                    rows={6}
                    value={caseStudyAnswer}
                    onChange={(e) => setCaseStudyAnswer(e.target.value)}
                    placeholder="Structure your proposal clearly: 1) Diagnostic discovery, 2) Phased execution plan & stakeholder management, 3) Key performance indicators (KPIs) and risk controls..."
                    className="w-full p-3.5 text-xs rounded-xl border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary leading-relaxed font-sans"
                  />
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex items-center justify-between pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSelectedAnswers({});
                    setCaseStudyAnswer("");
                    setEvaluationResult(null);
                    toast.info("Cleared assessment draft.");
                  }}
                  className="text-xs"
                >
                  <RotateCcw className="w-3.5 h-3.5 mr-1" /> Reset Draft
                </Button>

                <Button
                  size="default"
                  disabled={isSubmitting}
                  onClick={handleSubmitAssessment}
                  className="rounded-xl font-bold px-6 shadow-md gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <RotateCcw className="w-4 h-4 animate-spin" /> Evaluating Competencies...
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="w-4 h-4" /> Submit Assessment & Verify
                    </>
                  )}
                </Button>
              </div>
            </div>

            {/* Evaluation Results Box (Appears after submission) */}
            {evaluationResult && (
              <div className="rounded-2xl border border-border/80 bg-card p-6 shadow-md space-y-5 animate-in fade-in slide-in-from-bottom-2">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/70 pb-4">
                  <div className="flex items-center gap-3">
                    <div
                      className={`h-12 w-12 rounded-2xl flex items-center justify-center font-black text-lg ${
                        evaluationResult.passed
                          ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30"
                          : "bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30"
                      }`}
                    >
                      {evaluationResult.overallScore}%
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-foreground">
                        {evaluationResult.passed ? "Assessment Passed & Verified!" : "Assessment Completed"}
                      </h3>
                      <span className="text-xs font-semibold text-primary block mt-0.5">
                        Proficiency Tier: {evaluationResult.performanceTier}
                      </span>
                    </div>
                  </div>

                  {evaluationResult.badge && (
                    <Button
                      size="sm"
                      onClick={() => {
                        setActiveModalBadge(evaluationResult.badge!);
                        setIsBadgeModalOpen(true);
                      }}
                      className="gap-1.5 rounded-xl font-bold bg-emerald-600 hover:bg-emerald-700 text-white"
                    >
                      <Award className="w-4 h-4" /> View Verifiable Badge
                    </Button>
                  )}
                </div>

                {/* Score Breakdown */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="p-3 rounded-xl border border-border/70 bg-muted/30">
                    <span className="text-[10px] text-muted-foreground block">Situational Judgment</span>
                    <span className="text-base font-bold text-foreground mt-0.5 block">
                      {evaluationResult.situationalScore}%
                    </span>
                  </div>
                  <div className="p-3 rounded-xl border border-border/70 bg-muted/30">
                    <span className="text-[10px] text-muted-foreground block">Applied Case Study</span>
                    <span className="text-base font-bold text-foreground mt-0.5 block">
                      {evaluationResult.caseStudyScore}%
                    </span>
                  </div>
                  <div className="p-3 rounded-xl border border-border/70 bg-muted/30">
                    <span className="text-[10px] text-muted-foreground block">Passing Threshold</span>
                    <span className="text-base font-bold text-foreground mt-0.5 block">70% Required</span>
                  </div>
                  <div className="p-3 rounded-xl border border-border/70 bg-muted/30">
                    <span className="text-[10px] text-muted-foreground block">Verification Seal</span>
                    <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 mt-1 block">
                      {evaluationResult.passed ? "EIP-712 Signed" : "Unverified"}
                    </span>
                  </div>
                </div>

                {/* Competency Breakdown Bars */}
                <div className="space-y-2">
                  <span className="text-xs font-bold text-foreground block">Competency Assessment Breakdown:</span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {evaluationResult.competencyBreakdown.map((c) => (
                      <div key={c.name} className="p-3 rounded-xl border border-border/60 bg-background space-y-1.5">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-medium text-foreground">{c.name}</span>
                          <span className="font-bold text-primary font-mono">{c.score}%</span>
                        </div>
                        <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
                          <div
                            className="h-full rounded-full bg-primary transition-all duration-500"
                            style={{ width: `${c.score}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Qualitative Feedback */}
                <div className="p-4 rounded-xl border border-border/70 bg-muted/20 space-y-3">
                  <h4 className="text-xs font-bold text-foreground flex items-center gap-1.5">
                    <Lightbulb className="w-3.5 h-3.5 text-primary" /> Examiner Feedback & Case Study Critique:
                  </h4>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {evaluationResult.feedback.caseStudyCritique}
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                    <div className="space-y-1">
                      <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 block">
                        Demonstrated Strengths:
                      </span>
                      <ul className="text-xs text-muted-foreground space-y-1 list-disc pl-4">
                        {evaluationResult.feedback.strengths.map((s, idx) => (
                          <li key={idx}>{s}</li>
                        ))}
                      </ul>
                    </div>

                    <div className="space-y-1">
                      <span className="text-[11px] font-bold text-amber-600 dark:text-amber-400 block">
                        Recommended Growth Areas:
                      </span>
                      <ul className="text-xs text-muted-foreground space-y-1 list-disc pl-4">
                        {evaluationResult.feedback.growthAreas.map((g, idx) => (
                          <li key={idx}>{g}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODE 2: LIVE CODE SANDBOX (FOR SOFTWARE ENGINEERS & DEVELOPERS)          */}
      {/* ========================================================================= */}
      {activeTab === "coding" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Coding Challenge Selector (4 cols) */}
          <div className="lg:col-span-4 space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground px-1 block">
              Algorithms & Distributed Systems ({SANDBOXED_CHALLENGES.length})
            </span>

            <div className="space-y-2.5 max-h-[600px] overflow-y-auto pr-1">
              {SANDBOXED_CHALLENGES.map((c) => {
                const isSelected = selectedCodingChallenge.id === c.id;
                const isCompleted = savedCodeBadges.some((b) => b.challengeId === c.id);

                return (
                  <div
                    key={c.id}
                    onClick={() => {
                      setSelectedCodingChallenge(c);
                      setUserCode(c.starterCode);
                      setCodeResult(null);
                    }}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer space-y-2 ${
                      isSelected
                        ? "bg-primary/10 border-primary/40 text-foreground shadow-sm ring-1 ring-primary/20"
                        : "bg-card border-border/80 text-muted-foreground hover:bg-muted/40 hover:text-foreground"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <Badge variant="outline" className="text-[10px] font-mono">
                        {c.category}
                      </Badge>
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                          {c.difficulty}
                        </span>
                        {isCompleted && <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />}
                      </div>
                    </div>

                    <div>
                      <h4 className="text-sm font-bold text-foreground leading-snug">{c.title}</h4>
                      <p className="text-xs text-muted-foreground line-clamp-2 mt-1">{c.description}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Coding Runner & Editor (8 cols) */}
          <div className="lg:col-span-8 space-y-4">
            <div className="rounded-2xl border border-border/80 bg-card overflow-hidden shadow-sm">
              <div className="px-5 py-3.5 border-b border-border/80 bg-muted/30 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Code2 className="w-4 h-4 text-primary" />
                  <span className="text-xs font-bold text-foreground font-mono">solution.ts</span>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      setUserCode(selectedCodingChallenge.starterCode);
                      setCodeResult(null);
                      toast.info("Reset code to initial template");
                    }}
                    className="h-8 text-xs text-muted-foreground hover:text-foreground"
                  >
                    <RotateCcw className="w-3.5 h-3.5 mr-1" /> Reset
                  </Button>
                  <Button
                    size="sm"
                    disabled={isCodeRunning}
                    onClick={handleRunCode}
                    className="h-8 text-xs font-bold rounded-xl gap-1.5"
                  >
                    {isCodeRunning ? (
                      <RotateCcw className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Play className="w-3.5 h-3.5 fill-current" />
                    )}
                    Run Tests & Verify
                  </Button>
                </div>
              </div>

              {/* Code Textarea */}
              <div className="relative">
                <textarea
                  rows={14}
                  value={userCode}
                  onChange={(e) => setUserCode(e.target.value)}
                  className="w-full p-4 font-mono text-xs bg-slate-950 text-slate-100 dark:bg-slate-950 focus:outline-none resize-y leading-relaxed"
                  spellCheck={false}
                />
              </div>

              {/* Execution Console Results */}
              {codeResult && (
                <div className="border-t border-border/80 p-4 bg-muted/20 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-foreground">
                      Execution Result: {codeResult.passedTests} / {codeResult.totalTests} tests passed ({codeResult.runtimeMs}ms)
                    </span>
                    <Badge
                      className={
                        codeResult.passed
                          ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                          : "bg-red-500/15 text-red-600 dark:text-red-400"
                      }
                    >
                      {codeResult.passed ? "100% Passed" : "Incomplete"}
                    </Badge>
                  </div>

                  <div className="space-y-1.5">
                    {codeResult.testDetails.map((t) => (
                      <div
                        key={t.id}
                        className="flex items-center justify-between p-2 rounded-lg bg-card border border-border/70 text-xs"
                      >
                        <span className="text-muted-foreground">{t.description}</span>
                        <span
                          className={`font-bold font-mono text-[10px] ${
                            t.passed ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400"
                          }`}
                        >
                          {t.passed ? "PASSED" : "FAILED"}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODE 3: MY VERIFIED BADGES GALLERY                                       */}
      {/* ========================================================================= */}
      {activeTab === "badges" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-foreground">My Verified Skill Credentials</h2>
              <p className="text-xs text-muted-foreground">
                All earned badges are signed deterministically with HMAC-SHA256 and can be shared with recruiters.
              </p>
            </div>
          </div>

          {totalBadgesCount === 0 ? (
            <div className="p-12 text-center rounded-3xl border border-dashed border-border/80 bg-card space-y-3">
              <Award className="w-10 h-10 text-muted-foreground mx-auto stroke-1" />
              <h3 className="text-sm font-bold text-foreground">No Verified Badges Yet</h3>
              <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                Complete a career assessment or solve a coding challenge above with 70%+ score to earn your first cryptographic badge.
              </p>
              <Button size="sm" onClick={() => setActiveTab("careers")} className="mt-2 text-xs">
                Take an Assessment
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Career Badges */}
              {savedCareerBadges.map((badge) => (
                <div
                  key={badge.badgeId}
                  className="rounded-2xl border border-border/80 bg-card p-5 shadow-sm space-y-3 relative overflow-hidden"
                >
                  <div className="flex items-center justify-between">
                    <Badge variant="outline" className="text-[10px] font-mono border-primary/30 text-primary">
                      {badge.careerField}
                    </Badge>
                    <div className="flex items-center gap-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                      <ShieldCheck className="w-3.5 h-3.5" /> Verified {badge.overallScore}%
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-bold text-foreground line-clamp-1">{badge.trackTitle}</h4>
                    <span className="text-[11px] text-muted-foreground block mt-0.5">
                      Awarded to {badge.candidateName} • {badge.performanceTier}
                    </span>
                  </div>

                  <div className="p-2 rounded-lg bg-muted/40 font-mono text-[10px] text-muted-foreground truncate select-all">
                    Hash: {badge.signatureHash}
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-border/60">
                    <span className="text-[10px] text-muted-foreground">
                      {new Date(badge.issuedAt).toLocaleDateString()}
                    </span>

                    <div className="flex items-center gap-1.5">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => copyBadgeVerificationLink(badge)}
                        className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground"
                      >
                        <Copy className="w-3 h-3 mr-1" /> Copy Link
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setActiveModalBadge(badge);
                          setIsBadgeModalOpen(true);
                        }}
                        className="h-7 px-2 text-xs font-semibold"
                      >
                        <ExternalLink className="w-3 h-3 mr-1" /> View
                      </Button>
                    </div>
                  </div>
                </div>
              ))}

              {/* Code Badges */}
              {savedCodeBadges.map((badge) => (
                <div
                  key={badge.badgeId}
                  className="rounded-2xl border border-border/80 bg-card p-5 shadow-sm space-y-3 relative overflow-hidden"
                >
                  <div className="flex items-center justify-between">
                    <Badge variant="outline" className="text-[10px] font-mono border-blue-500/30 text-blue-600">
                      Algorithms & Code
                    </Badge>
                    <div className="flex items-center gap-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                      <ShieldCheck className="w-3.5 h-3.5" /> 100% Passed
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-bold text-foreground line-clamp-1">{badge.challengeTitle}</h4>
                    <span className="text-[11px] text-muted-foreground block mt-0.5">
                      {badge.difficulty} Level • {badge.executionTimeMs}ms Runtime
                    </span>
                  </div>

                  <div className="p-2 rounded-lg bg-muted/40 font-mono text-[10px] text-muted-foreground truncate select-all">
                    Hash: {badge.signatureHash}
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-border/60">
                    <span className="text-[10px] text-muted-foreground">
                      {new Date(badge.issuedAt).toLocaleDateString()}
                    </span>

                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => copyBadgeVerificationLink(badge)}
                      className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground"
                    >
                      <Copy className="w-3 h-3 mr-1" /> Copy Link
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* VERIFIABLE BADGE MODAL                                                   */}
      {/* ========================================================================= */}
      <Dialog open={isBadgeModalOpen} onOpenChange={setIsBadgeModalOpen}>
        <DialogContent className="max-w-lg rounded-3xl p-6 bg-card border-border text-foreground">
          {activeModalBadge && (
            <div className="space-y-6">
              <DialogHeader>
                <div className="flex items-center justify-between">
                  <Badge variant="outline" className="text-[10px] font-mono text-primary border-primary/40">
                    EIP-712 / W3C VERIFIABLE CREDENTIAL
                  </Badge>
                  <span className="text-xs text-muted-foreground font-mono">ResumeForge Root</span>
                </div>
                <DialogTitle className="text-xl font-black text-foreground pt-2">
                  {activeModalBadge.trackTitle}
                </DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground">
                  Official cryptographic certification of competency in {activeModalBadge.careerField}.
                </DialogDescription>
              </DialogHeader>

              {/* Badge Certificate Box */}
              <div className="rounded-2xl border border-primary/30 bg-primary/5 p-5 space-y-4 text-center">
                <div className="h-16 w-16 rounded-2xl bg-primary text-primary-foreground mx-auto flex items-center justify-center font-black text-2xl shadow-md">
                  <Award className="w-8 h-8" />
                </div>

                <div>
                  <span className="text-xs text-muted-foreground uppercase tracking-widest font-semibold">Conferred To</span>
                  <h3 className="text-lg font-black text-foreground">{activeModalBadge.candidateName}</h3>
                  <span className="text-xs font-semibold text-primary block mt-0.5">
                    {activeModalBadge.performanceTier} ({activeModalBadge.overallScore}%)
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-left pt-2 border-t border-primary/20">
                  <div className="text-xs">
                    <span className="text-[10px] text-muted-foreground block">Career Domain:</span>
                    <span className="font-semibold text-foreground">{activeModalBadge.careerField}</span>
                  </div>
                  <div className="text-xs">
                    <span className="text-[10px] text-muted-foreground block">Experience Level:</span>
                    <span className="font-semibold text-foreground">{activeModalBadge.experienceLevel}</span>
                  </div>
                </div>

                {/* Cryptographic Hash */}
                <div className="text-left pt-2 space-y-1">
                  <span className="text-[10px] font-bold text-muted-foreground flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3 text-primary" /> Signature Hash (HMAC-SHA256):
                  </span>
                  <div className="p-2 rounded-lg bg-background border border-border font-mono text-[10px] text-muted-foreground select-all break-all">
                    {activeModalBadge.signatureHash}
                  </div>
                </div>
              </div>

              {/* Actions */}
              <DialogFooter className="flex flex-col sm:flex-row gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => copyBadgeVerificationLink(activeModalBadge)}
                  className="w-full text-xs font-semibold rounded-xl"
                >
                  {copiedLink ? <Check className="w-3.5 h-3.5 mr-1" /> : <Copy className="w-3.5 h-3.5 mr-1" />}
                  {copiedLink ? "Link Copied!" : "Copy Verification Link"}
                </Button>

                <a
                  href={`/verify/badge/${activeModalBadge.signatureHash}?name=${encodeURIComponent(
                    activeModalBadge.candidateName
                  )}&title=${encodeURIComponent(activeModalBadge.trackTitle)}&field=${encodeURIComponent(
                    activeModalBadge.careerField
                  )}&level=${encodeURIComponent(activeModalBadge.experienceLevel)}&score=${
                    activeModalBadge.overallScore
                  }&tier=${encodeURIComponent(activeModalBadge.performanceTier)}&date=${encodeURIComponent(
                    activeModalBadge.issuedAt
                  )}`}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full sm:w-auto"
                >
                  <Button size="sm" className="w-full text-xs font-bold rounded-xl gap-1">
                    <ExternalLink className="w-3.5 h-3.5" /> Open Public Registry
                  </Button>
                </a>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
