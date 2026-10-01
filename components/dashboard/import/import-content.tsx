"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Linkedin,
  Github,
  FileJson,
  Loader2,
  Sparkles,
  Plus,
  AlertCircle,
  Terminal,
  UserSquare2,
  CheckCircle2,
  AlertTriangle,
  Link2,
  ExternalLink,
  ArrowRight,
  ShieldCheck,
  Eye,
  Briefcase,
  GraduationCap,
  Award,
  Brain,
  Clock,
  User,
  FolderGit2,
  Download,
  Upload,
  RefreshCw,
  FileText,
  Layers,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose
} from "@/components/ui/dialog";
import { validateLinkedInUrl } from "@/lib/scrapers/linkedin-scraper";
import { cn } from "@/lib/utils";
import { useUserMemoryStore } from "@/lib/stores/user-memory-store";
import { calculateMemoryCompleteness } from "@/lib/types/user-memory";

interface ImportContentProps {
  resumes: any[];
}

export function ImportContent({ resumes }: ImportContentProps) {
  const [activeTab, setActiveTab] = useState("linkedin");
  const [linkedinMode, setLinkedinMode] = useState<"url" | "text">("url");
  const [loading, setLoading] = useState(false);
  const [linkedinUrl, setLinkedinUrl] = useState("");
  const [linkedinData, setLinkedinData] = useState("");
  const [githubUsername, setGithubUsername] = useState("");
  const [selectedResumeId, setSelectedResumeId] = useState("");
  const [errorModalOpen, setErrorModalOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState<{ title: string; description: string } | null>(null);

  // User Memory synchronization states
  const [syncToMemory, setSyncToMemory] = useState(true);
  const [creatingMemoryResume, setCreatingMemoryResume] = useState(false);
  const [selectedMemorySourceResumeId, setSelectedMemorySourceResumeId] = useState("");
  const [isHarvesting, setIsHarvesting] = useState(false);

  const { memory, importFromResumeData, fetchFromServer } = useUserMemoryStore();
  const { score: completenessScore } = calculateMemoryCompleteness(memory);

  // Phase 41: Extraction Verification Preview Modal State
  const [previewModalOpen, setPreviewModalOpen] = useState(false);
  const [extractedPreview, setExtractedPreview] = useState<{
    source: string;
    confidenceScore: number;
    resumeData: any;
  } | null>(null);

  const supabase = createClient();
  const router = useRouter();

  const urlValidation = validateLinkedInUrl(linkedinUrl);

  const handleError = (error: any, context: string) => {
    let title = "Import Failed";
    let description = error.message || "An unexpected error occurred.";

    if (description.includes("insufficient_quota") || description.includes("429")) {
      title = "Usage Limit Exceeded";
      description = "You have exceeded your AI usage quota for the current billing cycle. Please check back later or upgrade your plan.";
    } else if (description.includes("500")) {
      title = "Service Unavailable";
      description = "The AI service is currently experiencing issues. Please try again later.";
    } else if (description.includes("GitHub user not found")) {
      title = "User Not Found";
      description = "We could not find a GitHub user with that username. Please check the spelling.";
    }

    setErrorMessage({ title, description });
    setErrorModalOpen(true);
    toast.error(`${context}: ${title}`);
  };

  /**
   * Phase 41: Execute URL or Text LinkedIn Import
   */
  const handleLinkedinImport = async (previewOnly: boolean = false) => {
    if (linkedinMode === "url" && !linkedinUrl) {
      toast.error("Please provide a valid LinkedIn profile URL or handle");
      return;
    }
    if (linkedinMode === "text" && !linkedinData) {
      toast.error("Please paste your LinkedIn profile text");
      return;
    }

    setLoading(true);
    try {
      const payload = linkedinMode === "url"
        ? { profileUrl: linkedinUrl, previewOnly }
        : { linkedinText: linkedinData, previewOnly };

      const response = await fetch("/api/ai/import/linkedin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Server error: ${response.status}`);
      }

      const data = await response.json();

      if (previewOnly && data.preview) {
        setExtractedPreview(data);
        setPreviewModalOpen(true);
        toast.success("Profile parsed successfully! Review below before creating resume.");
      } else if (data.resumeId) {
        setPreviewModalOpen(false);
        if (syncToMemory && data.resumeData) {
          importFromResumeData(data.resumeData, "LinkedIn Import");
        }
        toast.success("Resume imported successfully from LinkedIn!");
        router.push(`/dashboard/resume/${data.resumeId}`);
      }
    } catch (error: any) {
      handleError(error, "LinkedIn Import");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateResumeFromMemory = async () => {
    setCreatingMemoryResume(true);
    try {
      const res = await fetch("/api/user-memory/create-resume", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          memory,
          title: `${memory.basics?.full_name || "Candidate"} Resume (From Memory)`,
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Failed to generate resume");
      }

      const data = await res.json();
      toast.success("Resume created successfully from your Career Memory!");
      router.push(`/dashboard/resume/${data.resumeId}`);
    } catch (e: any) {
      toast.error(e.message || "Failed to create resume from memory");
    } finally {
      setCreatingMemoryResume(false);
    }
  };

  const handleHarvestResumeIntoMemory = async () => {
    if (!selectedMemorySourceResumeId) {
      toast.error("Please select a resume to harvest");
      return;
    }

    setIsHarvesting(true);
    try {
      const res = await fetch(`/api/resume/${selectedMemorySourceResumeId}?format=full`);
      if (!res.ok) throw new Error("Could not fetch resume details");
      const fullResumeData = await res.json();

      importFromResumeData(fullResumeData, `Harvested from ${fullResumeData.resume?.title || fullResumeData.title || "Resume"}`);
      toast.success("Career Memory successfully updated from selected resume!");
    } catch (e: any) {
      toast.error(e.message || "Harvest failed");
    } finally {
      setIsHarvesting(false);
    }
  };

  const handleGithubImport = async () => {
    if (!githubUsername || !selectedResumeId) {
      toast.error("Please provide GitHub username and select a resume");
      return;
    }
    setLoading(true);
    try {
      const response = await fetch("/api/ai/import/github", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: githubUsername,
          resumeId: selectedResumeId
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Server error: ${response.status}`);
      }

      const result = await response.json();

      toast.success(result.message || "GitHub projects successfully added!");
      router.push(`/dashboard/resume/${selectedResumeId}`);
    } catch (error: any) {
      handleError(error, "GitHub Import");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Tabs defaultValue="linkedin" value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="bg-muted/80 border border-border p-1.5 h-13 rounded-2xl grid grid-cols-3 max-w-[540px] shadow-xs">
          <TabsTrigger
            value="linkedin"
            className="rounded-xl data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-xs font-bold uppercase tracking-wider text-xs gap-2 text-muted-foreground transition-all hover:text-foreground cursor-pointer"
          >
            <Linkedin className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            LinkedIn
          </TabsTrigger>
          <TabsTrigger
            value="github"
            className="rounded-xl data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-xs font-bold uppercase tracking-wider text-xs gap-2 text-muted-foreground transition-all hover:text-foreground cursor-pointer"
          >
            <Github className="h-4 w-4 text-foreground" />
            GitHub
          </TabsTrigger>
          <TabsTrigger
            value="memory"
            className="rounded-xl data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-xs font-bold uppercase tracking-wider text-xs gap-2 text-muted-foreground transition-all hover:text-foreground cursor-pointer"
          >
            <Brain className="h-4 w-4 text-primary" />
            Career Memory
          </TabsTrigger>
        </TabsList>

        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            transition={{ duration: 0.3 }}
          >
            <TabsContent value="linkedin" className="m-0">
              <Card className="bg-card text-card-foreground border border-border rounded-2xl md:rounded-3xl overflow-hidden shadow-xs">
                <div className="min-h-[5.5rem] bg-gradient-to-r from-blue-500/10 via-muted/30 to-transparent border-b border-border flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 sm:px-8">
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-2xl bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 shrink-0">
                      <Linkedin className="h-6 w-6" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h2 className="text-xl font-black uppercase tracking-tight text-foreground">LinkedIn Synthesizer</h2>
                        <Badge variant="outline" className="text-[10px] font-bold border-blue-500/30 text-blue-600 dark:text-blue-400 bg-blue-500/10">
                          Verified Parser
                        </Badge>
                      </div>
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mt-0.5">
                        Instant profile URL extraction or raw text ingestion
                      </p>
                    </div>
                  </div>

                  {/* Mode Switcher */}
                  <div className="flex items-center bg-muted/80 p-1.5 rounded-xl border border-border shrink-0 shadow-xs">
                    <button
                      type="button"
                      onClick={() => setLinkedinMode("url")}
                      className={cn(
                        "h-8 px-3 text-xs font-bold rounded-lg gap-1.5 flex items-center transition-all cursor-pointer",
                        linkedinMode === "url"
                          ? "bg-background text-foreground shadow-xs font-black"
                          : "text-muted-foreground hover:text-foreground"
                      )}
                    >
                      <Link2 className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
                      Direct Profile URL
                    </button>
                    <button
                      type="button"
                      onClick={() => setLinkedinMode("text")}
                      className={cn(
                        "h-8 px-3 text-xs font-bold rounded-lg gap-1.5 flex items-center transition-all cursor-pointer",
                        linkedinMode === "text"
                          ? "bg-background text-foreground shadow-xs font-black"
                          : "text-muted-foreground hover:text-foreground"
                      )}
                    >
                      <Terminal className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
                      Paste Text
                    </button>
                  </div>
                </div>

                <CardContent className="p-6 sm:p-8 space-y-6">
                  {linkedinMode === "url" ? (
                    <div className="space-y-6">
                      <div className="space-y-2.5">
                        <div className="flex items-center justify-between">
                          <Label className="text-xs font-bold text-foreground flex items-center gap-1.5">
                            Public LinkedIn Profile URL or Handle
                          </Label>
                          {urlValidation.isValid && (
                            <Badge className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-[10px] font-bold gap-1">
                              <CheckCircle2 className="h-3 w-3" /> Valid: @{urlValidation.username}
                            </Badge>
                          )}
                        </div>
                        <div className="relative group">
                          <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center gap-2 pointer-events-none text-muted-foreground">
                            <Linkedin className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                          </div>
                          <Input
                            placeholder="https://www.linkedin.com/in/username or username slug"
                            className="h-14 pl-12 pr-4 bg-background text-foreground border border-input rounded-xl font-medium text-sm focus-visible:ring-2 focus-visible:ring-primary placeholder:text-muted-foreground/60 transition-all shadow-xs"
                            value={linkedinUrl}
                            onChange={(e) => setLinkedinUrl(e.target.value)}
                          />
                        </div>
                      </div>

                      {/* Quick Sample Profiles Chips */}
                      <div className="space-y-2.5">
                        <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                          Try Instant Demo Profiles:
                        </span>
                        <div className="flex flex-wrap gap-2">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => setLinkedinUrl("https://www.linkedin.com/in/alex-morgan-tech")}
                            className="h-8 rounded-lg text-xs bg-background text-foreground border-border hover:bg-muted hover:text-foreground gap-1.5 font-medium transition-all shadow-xs"
                          >
                            <Sparkles className="h-3 w-3 text-blue-600 dark:text-blue-400" />
                            Alex Morgan (Full Stack Staff Eng)
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => setLinkedinUrl("https://www.linkedin.com/in/sarah-chen-dev")}
                            className="h-8 rounded-lg text-xs bg-background text-foreground border-border hover:bg-muted hover:text-foreground gap-1.5 font-medium transition-all shadow-xs"
                          >
                            <Sparkles className="h-3 w-3 text-purple-600 dark:text-purple-400" />
                            Sarah Chen (AI & ML Specialist)
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => setLinkedinUrl("https://www.linkedin.com/in/jordan-taylor-product")}
                            className="h-8 rounded-lg text-xs bg-background text-foreground border-border hover:bg-muted hover:text-foreground gap-1.5 font-medium transition-all shadow-xs"
                          >
                            <Sparkles className="h-3 w-3 text-emerald-600 dark:text-emerald-400" />
                            Jordan Taylor (Principal PM)
                          </Button>
                        </div>
                      </div>

                      <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-start gap-3">
                        <ShieldCheck className="h-5 w-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
                        <div className="text-xs leading-relaxed">
                          <p className="font-bold text-blue-900 dark:text-blue-200">Real-Time Extraction Engine</p>
                          <p className="text-muted-foreground mt-0.5">
                            Our engine queries real-time scrapers, parses public meta attributes, and structures work histories, verified skills, and academic credentials into your resume.
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2.5 p-3 rounded-xl border border-primary/20 bg-primary/5">
                        <input
                          type="checkbox"
                          id="syncToMemoryUrl"
                          checked={syncToMemory}
                          onChange={(e) => setSyncToMemory(e.target.checked)}
                          className="h-4 w-4 rounded accent-primary cursor-pointer"
                        />
                        <Label htmlFor="syncToMemoryUrl" className="text-xs font-semibold text-foreground cursor-pointer flex items-center gap-1.5">
                          <Brain className="h-3.5 w-3.5 text-primary" />
                          Automatically sync extracted candidate profile into Career Memory
                        </Label>
                      </div>

                      {/* Action Buttons */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => handleLinkedinImport(true)}
                          disabled={loading || !linkedinUrl}
                          className="h-12 rounded-xl font-bold uppercase tracking-wider text-xs border-border bg-background hover:bg-muted text-foreground gap-2 transition-all shadow-xs"
                        >
                          <Eye className="h-4 w-4 text-primary" />
                          Preview &amp; Verify Extraction
                        </Button>
                        <Button
                          type="button"
                          onClick={() => handleLinkedinImport(false)}
                          disabled={loading || !linkedinUrl}
                          className="h-12 rounded-xl font-bold uppercase tracking-widest text-xs relative group overflow-hidden shadow-sm bg-blue-600 text-white hover:bg-blue-700 gap-2 transition-all"
                        >
                          {loading ? (
                            <>
                              <Loader2 className="h-4 w-4 animate-spin" />
                              <span>Parsing Profile...</span>
                            </>
                          ) : (
                            <>
                              <Sparkles className="h-4 w-4" />
                              <span>Direct Import to Resume</span>
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  ) : (
                    /* Text Paste Mode */
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <Label className="text-xs font-bold text-foreground">
                          Profile Data Corpus (Pasted Text / PDF Text)
                        </Label>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 gap-1.5 h-8 font-semibold"
                          onClick={() =>
                            setLinkedinData(
                              `Alex Rivera\nSenior Full-Stack Cloud Architect | Distributed Systems & AI Platforms\nGreater Seattle Area | alex.rivera@example.com | linkedin.com/in/alexrivera-cloud\n\nSummary:\nHigh-impact software engineering leader with 8+ years architecting fault-tolerant cloud services, high-throughput microservices, and AI workflow pipelines. Specializes in TypeScript, Next.js, Go, Kubernetes, and PostgreSQL.\n\nExperience:\nStaff Software Engineer | Veloce Cloud Systems | 2022 - Present | Seattle, WA\n- Architected distributed data ingestion engine processing 1.2M events/sec with sub-50ms p99 latency.\n- Spearheaded team migration to Kubernetes and automated CI/CD canary deployments across 4 regions.\n- Mentored 12 junior and mid-level engineers across backend and infrastructure guilds.\n\nSenior Software Engineer | DataForge Analytics | 2019 - 2022 | San Francisco, CA\n- Built real-time analytics streaming pipelines using Apache Kafka, PostgreSQL, and Node.js.\n- Reduced cloud infrastructure compute expenditure by 34% through proactive autoscaling policies.\n\nEducation:\nUniversity of Washington | B.S. in Computer Science | 2015 - 2019\n\nSkills:\nLanguages: TypeScript, Go, Python, SQL, JavaScript\nCloud & Infrastructure: AWS, Kubernetes, Docker, Terraform, CI/CD\nDatabases & Storage: PostgreSQL, Redis, DynamoDB`
                            )
                          }
                        >
                          <Sparkles className="h-3.5 w-3.5" />
                          Load Sample Profile
                        </Button>
                      </div>
                      <Textarea
                        placeholder="Paste your LinkedIn profile text or PDF export content here..."
                        className="min-h-[260px] bg-background text-foreground border border-input rounded-xl p-4 font-normal text-sm focus-visible:ring-2 focus-visible:ring-primary placeholder:text-muted-foreground/60 resize-none transition-all leading-relaxed shadow-xs"
                        value={linkedinData}
                        onChange={(e) => setLinkedinData(e.target.value)}
                      />

                      <div className="flex items-center gap-2.5 p-3 rounded-xl border border-primary/20 bg-primary/5">
                        <input
                          type="checkbox"
                          id="syncToMemoryText"
                          checked={syncToMemory}
                          onChange={(e) => setSyncToMemory(e.target.checked)}
                          className="h-4 w-4 rounded accent-primary cursor-pointer"
                        />
                        <Label htmlFor="syncToMemoryText" className="text-xs font-semibold text-foreground cursor-pointer flex items-center gap-1.5">
                          <Brain className="h-3.5 w-3.5 text-primary" />
                          Automatically sync extracted candidate profile into Career Memory
                        </Label>
                      </div>
                      <Button
                        onClick={() => handleLinkedinImport(false)}
                        disabled={loading || !linkedinData}
                        className="w-full h-12 rounded-xl font-bold uppercase tracking-widest text-xs relative group overflow-hidden shadow-sm bg-blue-600 text-white hover:bg-blue-700 transition-all"
                      >
                        <div className="relative flex items-center justify-center gap-2">
                          {loading ? (
                            <>
                              <Loader2 className="h-4 w-4 animate-spin" />
                              <span>Parsing Network Data...</span>
                            </>
                          ) : (
                            <>
                              <Sparkles className="h-4 w-4" />
                              <span>Execute Text Import</span>
                            </>
                          )}
                        </div>
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="github" className="m-0">
              <Card className="bg-card text-card-foreground border border-border rounded-2xl md:rounded-3xl overflow-hidden shadow-xs">
                <div className="min-h-[5.5rem] bg-gradient-to-r from-muted/50 via-muted/20 to-transparent border-b border-border flex items-center px-6 sm:px-8">
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-2xl bg-muted text-foreground border border-border shrink-0 shadow-xs">
                      <Github className="h-6 w-6" />
                    </div>
                    <div>
                      <h2 className="text-xl font-black uppercase tracking-tight text-foreground">GitHub Ingestor</h2>
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mt-0.5">
                        Import your top repositories
                      </p>
                    </div>
                  </div>
                </div>
                <CardContent className="p-6 sm:p-8 space-y-8">
                  <div className="grid gap-6 md:grid-cols-2">
                    <div className="space-y-2.5">
                      <Label className="text-xs font-bold text-foreground">
                        GitHub Username
                      </Label>
                      <div className="relative group">
                        <Terminal className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          placeholder="e.g. facebook"
                          className="h-12 bg-background text-foreground border border-input rounded-xl pl-11 font-medium text-sm focus-visible:ring-2 focus-visible:ring-primary placeholder:text-muted-foreground/60 transition-all shadow-xs"
                          value={githubUsername}
                          onChange={(e) => setGithubUsername(e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="space-y-2.5">
                      <Label className="text-xs font-bold text-foreground">
                        Target Resume
                      </Label>
                      <Select value={selectedResumeId} onValueChange={setSelectedResumeId}>
                        <SelectTrigger className="h-12 bg-background text-foreground border border-input rounded-xl font-medium text-sm transition-all focus-visible:ring-2 focus-visible:ring-primary shadow-xs">
                          <div className="flex items-center gap-2">
                            <UserSquare2 className="h-4 w-4 text-primary" />
                            <SelectValue placeholder="Select target resume" />
                          </div>
                        </SelectTrigger>
                        <SelectContent className="bg-popover text-popover-foreground border border-border rounded-xl shadow-md">
                          {resumes.map((r) => (
                            <SelectItem key={r.id} value={r.id} className="font-semibold text-xs py-2.5 focus:bg-accent focus:text-accent-foreground rounded-lg cursor-pointer">
                              {r.title || "Untitled Resume"}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <Button
                    onClick={handleGithubImport}
                    disabled={loading || !githubUsername || !selectedResumeId}
                    className="w-full h-12 rounded-xl font-bold uppercase tracking-widest text-xs relative group overflow-hidden shadow-sm bg-primary text-primary-foreground hover:bg-primary/90 transition-all"
                  >
                    <div className="relative flex items-center justify-center gap-2">
                      {loading ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          <span>Ingesting Repositories...</span>
                        </>
                      ) : (
                        <>
                          <Plus className="h-4 w-4" />
                          <span>Append Projects to Resume</span>
                        </>
                      )}
                    </div>
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            {/* TAB 3: CAREER MEMORY INGESTION & SYNTHESIZER */}
            <TabsContent value="memory" className="m-0">
              <Card className="bg-card text-card-foreground border border-border rounded-2xl md:rounded-3xl overflow-hidden shadow-xs">
                <div className="min-h-[5.5rem] bg-gradient-to-r from-primary/15 via-muted/30 to-transparent border-b border-border flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 sm:px-8">
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-2xl bg-primary/10 text-primary border border-primary/20 shrink-0">
                      <Brain className="h-6 w-6" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h2 className="text-xl font-black uppercase tracking-tight text-foreground">Career Memory Synthesizer</h2>
                        <Badge variant="outline" className="text-[10px] font-bold border-primary/30 text-primary bg-primary/10">
                          Universal Knowledge Core
                        </Badge>
                      </div>
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mt-0.5">
                        One-click ingestion from your unified career memory into resumes, portfolios, and job applications
                      </p>
                    </div>
                  </div>

                  <Button
                    onClick={() => router.push("/dashboard/memory")}
                    variant="outline"
                    className="rounded-xl border-primary/30 hover:border-primary text-xs font-bold gap-1.5 shrink-0 cursor-pointer"
                  >
                    <ExternalLink className="h-3.5 w-3.5 text-primary" />
                    Open Full Memory Hub
                  </Button>
                </div>

                <CardContent className="p-6 sm:p-8 space-y-6">
                  {/* Candidate Overview Card */}
                  <div className="p-6 rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/5 via-card to-card space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex items-center gap-4">
                        <div className="h-14 w-14 rounded-2xl bg-primary/15 border border-primary/30 flex items-center justify-center text-primary font-black text-2xl shrink-0">
                          {memory.basics?.full_name?.charAt(0) || "U"}
                        </div>
                        <div>
                          <h3 className="text-lg font-bold text-foreground">
                            {memory.basics?.full_name || "Anonymous Candidate"}
                          </h3>
                          <p className="text-xs font-semibold text-primary">
                            {memory.basics?.headline || "Professional Career Profile"}
                          </p>
                          <p className="text-[11px] text-muted-foreground mt-0.5">
                            {memory.basics?.location || "Location not set"} • {memory.basics?.email || "No email"}
                          </p>
                        </div>
                      </div>

                      {/* Completeness Badge */}
                      <div className="p-3 rounded-xl bg-card border border-border/80 text-right sm:text-right shrink-0">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Memory Score</p>
                        <p className="text-xl font-black text-primary font-mono">{completenessScore}%</p>
                      </div>
                    </div>

                    {/* Quick Metric Pills */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-2">
                      <div className="p-3 rounded-xl bg-background/80 border border-border/60 text-center">
                        <p className="text-xs font-bold text-foreground">{memory.experiences?.length || 0}</p>
                        <p className="text-[10px] text-muted-foreground uppercase font-bold">Roles</p>
                      </div>
                      <div className="p-3 rounded-xl bg-background/80 border border-border/60 text-center">
                        <p className="text-xs font-bold text-foreground">{memory.skills?.length || 0}</p>
                        <p className="text-[10px] text-muted-foreground uppercase font-bold">Skills</p>
                      </div>
                      <div className="p-3 rounded-xl bg-background/80 border border-border/60 text-center">
                        <p className="text-xs font-bold text-foreground">{memory.projects?.length || 0}</p>
                        <p className="text-[10px] text-muted-foreground uppercase font-bold">Projects</p>
                      </div>
                      <div className="p-3 rounded-xl bg-background/80 border border-border/60 text-center">
                        <p className="text-xs font-bold text-foreground">{memory.education?.length || 0}</p>
                        <p className="text-[10px] text-muted-foreground uppercase font-bold">Degrees</p>
                      </div>
                    </div>
                  </div>

                  {/* Primary Synthesize Actions */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                    <div className="p-5 rounded-2xl border border-border/80 bg-card/60 space-y-3 flex flex-col justify-between">
                      <div>
                        <h4 className="text-sm font-bold text-foreground flex items-center gap-2">
                          <FileText className="h-4 w-4 text-primary" />
                          Synthesize Resume from Memory
                        </h4>
                        <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                          Instant one-click builder that compiles all your stored career history, education, verified skills, and projects into an ATS-formatted resume.
                        </p>
                      </div>
                      <Button
                        onClick={handleCreateResumeFromMemory}
                        disabled={creatingMemoryResume}
                        className="w-full h-11 rounded-xl font-bold uppercase tracking-wider text-xs bg-primary text-primary-foreground hover:bg-primary/90 gap-2 shadow-sm cursor-pointer"
                      >
                        {creatingMemoryResume ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            <span>Building Resume...</span>
                          </>
                        ) : (
                          <>
                            <Sparkles className="h-4 w-4" />
                            <span>Build Resume from Memory</span>
                          </>
                        )}
                      </Button>
                    </div>

                    <div className="p-5 rounded-2xl border border-border/80 bg-card/60 space-y-3 flex flex-col justify-between">
                      <div>
                        <h4 className="text-sm font-bold text-foreground flex items-center gap-2">
                          <Layers className="h-4 w-4 text-primary" />
                          Harvest Existing Resume into Memory
                        </h4>
                        <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                          Extract contacts, jobs, skills, and projects from any existing resume in your workspace to enrich your permanent Memory.
                        </p>
                      </div>
                      <div className="space-y-2">
                        <Select value={selectedMemorySourceResumeId} onValueChange={setSelectedMemorySourceResumeId}>
                          <SelectTrigger className="h-11 bg-background text-foreground border border-input rounded-xl font-medium text-xs">
                            <SelectValue placeholder="Select resume to harvest..." />
                          </SelectTrigger>
                          <SelectContent>
                            {resumes.map((r) => (
                              <SelectItem key={r.id} value={r.id} className="text-xs">
                                {r.title || "Untitled Resume"}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Button
                          onClick={handleHarvestResumeIntoMemory}
                          disabled={isHarvesting || !selectedMemorySourceResumeId}
                          variant="outline"
                          className="w-full h-10 rounded-xl font-bold text-xs gap-1.5 cursor-pointer"
                        >
                          {isHarvesting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                          Extract into Memory
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </motion.div>
        </AnimatePresence>
      </Tabs>

      {/* Phase 41: Verification & Extraction Preview Dialog */}
      <Dialog open={previewModalOpen} onOpenChange={setPreviewModalOpen}>
        <DialogContent className="max-w-2xl bg-card text-card-foreground border border-border rounded-2xl p-6 sm:p-8 shadow-xl">
          <DialogHeader className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
                  <Linkedin className="h-5 w-5" />
                </div>
                <DialogTitle className="text-lg font-black tracking-tight text-foreground">
                  Extracted LinkedIn Profile Preview
                </DialogTitle>
              </div>
              {extractedPreview && (
                <Badge className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-xs font-bold gap-1">
                  <ShieldCheck className="h-3.5 w-3.5" />
                  {extractedPreview.confidenceScore}% Confidence
                </Badge>
              )}
            </div>
            <DialogDescription className="text-xs text-muted-foreground">
              Verify the extracted candidate data below. Click &quot;Confirm &amp; Build Resume&quot; to populate your new ResumeForge project.
            </DialogDescription>
          </DialogHeader>

          {extractedPreview?.resumeData && (
            <div className="space-y-5 py-4 max-h-[60vh] overflow-y-auto pr-2">
              {/* Candidate Info Card */}
              <div className="p-4 rounded-xl bg-muted/40 border border-border space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-base text-foreground">
                    {extractedPreview.resumeData.personalInfo?.fullName || "Candidate"}
                  </h3>
                  <span className="text-xs text-muted-foreground">
                    {extractedPreview.resumeData.personalInfo?.location}
                  </span>
                </div>
                {extractedPreview.resumeData.personalInfo?.summary && (
                  <p className="text-xs text-muted-foreground leading-relaxed italic">
                    &quot;{extractedPreview.resumeData.personalInfo.summary}&quot;
                  </p>
                )}
              </div>

              {/* Work Experience */}
              <div className="space-y-2">
                <div className="flex items-center gap-1.5 text-xs font-bold text-foreground uppercase tracking-wider">
                  <Briefcase className="h-3.5 w-3.5 text-primary" />
                  <span>Work Experience ({extractedPreview.resumeData.workExperience?.length || 0})</span>
                </div>
                <div className="space-y-2">
                  {extractedPreview.resumeData.workExperience?.map((exp: any, i: number) => (
                    <div key={i} className="p-3 rounded-lg bg-muted/30 border border-border text-xs flex items-center justify-between">
                      <div>
                        <p className="font-bold text-foreground">{exp.position}</p>
                        <p className="text-muted-foreground">{exp.company}</p>
                      </div>
                      <Badge variant="outline" className="text-[10px] text-muted-foreground">
                        {exp.startDate} – {exp.endDate || "Present"}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>

              {/* Education */}
              {extractedPreview.resumeData.education?.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-foreground uppercase tracking-wider">
                    <GraduationCap className="h-3.5 w-3.5 text-primary" />
                    <span>Education ({extractedPreview.resumeData.education.length})</span>
                  </div>
                  <div className="space-y-2">
                    {extractedPreview.resumeData.education.map((edu: any, i: number) => (
                      <div key={i} className="p-3 rounded-lg bg-muted/30 border border-border text-xs flex items-center justify-between">
                        <div>
                          <p className="font-bold text-foreground">{edu.institution}</p>
                          <p className="text-muted-foreground">{edu.degree} {edu.field ? `in ${edu.field}` : ""}</p>
                        </div>
                        <Badge variant="outline" className="text-[10px] text-muted-foreground">
                          {edu.startDate} – {edu.endDate}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Skills Tags */}
              {extractedPreview.resumeData.skills?.[0]?.items?.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-foreground uppercase tracking-wider">
                    <Award className="h-3.5 w-3.5 text-primary" />
                    <span>Identified Skills ({extractedPreview.resumeData.skills[0].items.length})</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {extractedPreview.resumeData.skills[0].items.slice(0, 16).map((skill: string, i: number) => (
                      <Badge key={i} variant="secondary" className="text-[11px] font-medium bg-primary/10 text-primary border-primary/20">
                        {skill}
                      </Badge>
                    ))}
                    {extractedPreview.resumeData.skills[0].items.length > 16 && (
                      <Badge variant="outline" className="text-[10px] text-muted-foreground">
                        +{extractedPreview.resumeData.skills[0].items.length - 16} more
                      </Badge>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          <DialogFooter className="gap-2 sm:gap-0 pt-3 border-t border-border">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setPreviewModalOpen(false)}
              className="rounded-xl font-bold text-xs"
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={() => handleLinkedinImport(false)}
              disabled={loading}
              className="rounded-xl font-bold uppercase tracking-wider text-xs bg-blue-600 text-white hover:bg-blue-700 gap-2 shadow-sm"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Creating Resume...
                </>
              ) : (
                <>
                  <span>Confirm &amp; Build Resume</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Error Dialog */}
      <Dialog open={errorModalOpen} onOpenChange={setErrorModalOpen}>
        <DialogContent className="max-w-md bg-card text-card-foreground border border-destructive/20 rounded-2xl p-6 sm:p-8 shadow-xl">
          <DialogHeader className="space-y-4">
            <div className="h-12 w-12 rounded-xl bg-destructive/10 border border-destructive/20 flex items-center justify-center text-destructive">
              <AlertTriangle className="h-6 w-6" />
            </div>
            <div>
              <DialogTitle className="text-xl font-black tracking-tight text-foreground">{errorMessage?.title}</DialogTitle>
              <DialogDescription className="text-sm font-medium text-muted-foreground mt-2 leading-relaxed">
                {errorMessage?.description}
              </DialogDescription>
            </div>
          </DialogHeader>
          <DialogFooter className="mt-6">
            <Button
              onClick={() => setErrorModalOpen(false)}
              className="w-full h-11 rounded-xl font-bold uppercase tracking-wider text-xs bg-primary text-primary-foreground hover:bg-primary/90"
            >
              Acknowledge
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
