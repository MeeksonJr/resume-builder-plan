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
  Award
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
        toast.success("Resume imported successfully from LinkedIn!");
        router.push(`/dashboard/resume/${data.resumeId}`);
      }
    } catch (error: any) {
      handleError(error, "LinkedIn Import");
    } finally {
      setLoading(false);
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
      <Tabs defaultValue="linkedin" value={activeTab} onValueChange={setActiveTab} className="space-y-8">
        <TabsList className="bg-slate-950/40 backdrop-blur-md border border-primary/5 p-1 h-14 rounded-2xl grid grid-cols-2 max-w-[400px]">
          <TabsTrigger
            value="linkedin"
            className="rounded-xl data-[state=active]:bg-primary/20 data-[state=active]:text-primary font-black uppercase tracking-widest text-[10px] gap-2 transition-all"
          >
            <Linkedin className="h-4 w-4" />
            LinkedIn
          </TabsTrigger>
          <TabsTrigger
            value="github"
            className="rounded-xl data-[state=active]:bg-primary/20 data-[state=active]:text-primary font-black uppercase tracking-widest text-[10px] gap-2 transition-all"
          >
            <Github className="h-4 w-4" />
            GitHub
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
              <Card className="bg-slate-950/40 backdrop-blur-xl border-primary/5 rounded-[32px] overflow-hidden shadow-2xl">
                <div className="h-24 bg-gradient-to-br from-blue-600/10 via-slate-900 to-transparent border-b border-primary/5 flex items-center justify-between px-10">
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-2xl bg-blue-500/10 shadow-inner">
                      <Linkedin className="h-6 w-6 text-blue-400" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h2 className="text-xl font-black uppercase tracking-tight">LinkedIn Synthesizer</h2>
                        <Badge variant="outline" className="text-[10px] font-bold border-blue-500/30 text-blue-400 bg-blue-500/5">
                          Verified Parser
                        </Badge>
                      </div>
                      <p className="text-xs font-bold text-muted-foreground/60 uppercase tracking-widest">
                        Instant profile URL extraction or raw text ingestion
                      </p>
                    </div>
                  </div>

                  {/* Mode Switcher */}
                  <div className="flex items-center bg-slate-900/80 p-1 rounded-xl border border-primary/10">
                    <Button
                      type="button"
                      variant={linkedinMode === "url" ? "secondary" : "ghost"}
                      size="sm"
                      onClick={() => setLinkedinMode("url")}
                      className="h-8 text-xs font-bold rounded-lg gap-1.5"
                    >
                      <Link2 className="h-3.5 w-3.5" />
                      Direct Profile URL
                    </Button>
                    <Button
                      type="button"
                      variant={linkedinMode === "text" ? "secondary" : "ghost"}
                      size="sm"
                      onClick={() => setLinkedinMode("text")}
                      className="h-8 text-xs font-bold rounded-lg gap-1.5"
                    >
                      <Terminal className="h-3.5 w-3.5" />
                      Paste Text
                    </Button>
                  </div>
                </div>

                <CardContent className="p-10 space-y-8">
                  {linkedinMode === "url" ? (
                    <div className="space-y-6">
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/40 ml-1">
                            Public LinkedIn Profile URL or Handle
                          </Label>
                          {urlValidation.isValid && (
                            <Badge className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-bold gap-1">
                              <CheckCircle2 className="h-3 w-3" /> Valid: @{urlValidation.username}
                            </Badge>
                          )}
                        </div>
                        <div className="relative group">
                          <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center gap-2 pointer-events-none text-muted-foreground/40">
                            <Linkedin className="h-5 w-5 text-blue-400" />
                          </div>
                          <Input
                            placeholder="https://www.linkedin.com/in/username or username slug"
                            className="h-16 pl-12 pr-4 bg-slate-900/40 border-primary/10 rounded-2xl font-bold text-base focus:ring-blue-500/20 focus:border-blue-500/40 transition-all placeholder:text-muted-foreground/25"
                            value={linkedinUrl}
                            onChange={(e) => setLinkedinUrl(e.target.value)}
                          />
                        </div>
                      </div>

                      {/* Quick Sample Profiles Chips */}
                      <div className="space-y-2">
                        <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/50">
                          Try Instant Demo Profiles:
                        </span>
                        <div className="flex flex-wrap gap-2">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => setLinkedinUrl("https://www.linkedin.com/in/alex-morgan-tech")}
                            className="h-8 rounded-xl text-xs bg-slate-900/30 border-primary/10 hover:border-blue-500/40 hover:bg-blue-500/5 gap-1.5 font-medium"
                          >
                            <Sparkles className="h-3 w-3 text-blue-400" />
                            Alex Morgan (Full Stack Staff Eng)
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => setLinkedinUrl("https://www.linkedin.com/in/sarah-chen-dev")}
                            className="h-8 rounded-xl text-xs bg-slate-900/30 border-primary/10 hover:border-blue-500/40 hover:bg-blue-500/5 gap-1.5 font-medium"
                          >
                            <Sparkles className="h-3 w-3 text-purple-400" />
                            Sarah Chen (AI & ML Specialist)
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => setLinkedinUrl("https://www.linkedin.com/in/jordan-taylor-product")}
                            className="h-8 rounded-xl text-xs bg-slate-900/30 border-primary/10 hover:border-blue-500/40 hover:bg-blue-500/5 gap-1.5 font-medium"
                          >
                            <Sparkles className="h-3 w-3 text-emerald-400" />
                            Jordan Taylor (Principal PM)
                          </Button>
                        </div>
                      </div>

                      <div className="p-4 rounded-2xl bg-blue-500/5 border border-blue-500/10 flex items-start gap-3">
                        <ShieldCheck className="h-5 w-5 text-blue-400 shrink-0 mt-0.5" />
                        <div className="text-xs text-blue-400/90 leading-relaxed">
                          <p className="font-semibold text-blue-300">Real-Time Extraction Engine</p>
                          <p className="text-muted-foreground/80 mt-0.5">
                            Our engine queries real-time scrapers, parses public meta attributes, and structures work histories, verified skills, and academic credentials into your resume.
                          </p>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => handleLinkedinImport(true)}
                          disabled={loading || !linkedinUrl}
                          className="h-14 rounded-2xl font-bold uppercase tracking-wider text-xs border-primary/10 hover:bg-primary/5 gap-2"
                        >
                          <Eye className="h-4 w-4 text-primary" />
                          Preview & Verify Extraction
                        </Button>
                        <Button
                          type="button"
                          onClick={() => handleLinkedinImport(false)}
                          disabled={loading || !linkedinUrl}
                          className="h-14 rounded-2xl font-black uppercase tracking-widest text-xs relative group overflow-hidden shadow-2xl shadow-blue-500/20 bg-blue-600 hover:bg-blue-500 gap-2"
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
                        <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/40 ml-1">
                          Profile Data Corpus (Pasted Text / PDF Text)
                        </Label>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="text-xs text-blue-400 hover:text-blue-300 gap-1.5 h-7"
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
                        className="min-h-[260px] bg-slate-900/30 border-primary/10 rounded-2xl p-6 font-medium text-muted-foreground/80 focus:ring-primary/20 placeholder:text-muted-foreground/20 resize-none transition-all leading-relaxed"
                        value={linkedinData}
                        onChange={(e) => setLinkedinData(e.target.value)}
                      />
                      <Button
                        onClick={() => handleLinkedinImport(false)}
                        disabled={loading || !linkedinData}
                        className="w-full h-14 rounded-2xl font-black uppercase tracking-widest text-xs relative group overflow-hidden shadow-2xl shadow-blue-500/20 bg-blue-600 hover:bg-blue-500"
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
              <Card className="bg-slate-950/40 backdrop-blur-xl border-primary/5 rounded-[32px] overflow-hidden shadow-2xl">
                <div className="h-24 bg-gradient-to-br from-slate-400/10 via-slate-900 to-transparent border-b border-primary/5 flex items-center px-10">
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-2xl bg-white/5 shadow-inner border border-white/5">
                      <Github className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h2 className="text-xl font-black uppercase tracking-tight">GitHub Ingestor</h2>
                      <p className="text-xs font-bold text-muted-foreground/60 uppercase tracking-widest">
                        Import your top repositories
                      </p>
                    </div>
                  </div>
                </div>
                <CardContent className="p-10 space-y-10">
                  <div className="grid gap-10 md:grid-cols-2">
                    <div className="space-y-4">
                      <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/40 ml-1">
                        GitHub Username
                      </Label>
                      <div className="relative group">
                        <Terminal className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
                        <Input
                          placeholder="e.g. facebook"
                          className="h-14 bg-slate-900/50 border-primary/10 rounded-2xl pl-11 font-bold focus:ring-primary/20 transition-all"
                          value={githubUsername}
                          onChange={(e) => setGithubUsername(e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="space-y-4">
                      <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/40 ml-1">
                        Target Resume
                      </Label>
                      <Select value={selectedResumeId} onValueChange={setSelectedResumeId}>
                        <SelectTrigger className="h-14 bg-slate-900/50 border-primary/10 rounded-2xl font-bold transition-all focus:ring-primary/20">
                          <div className="flex items-center gap-2">
                            <UserSquare2 className="h-4 w-4 text-primary" />
                            <SelectValue placeholder="Select target resume" />
                          </div>
                        </SelectTrigger>
                        <SelectContent className="bg-slate-950 border-primary/10 rounded-2xl">
                          {resumes.map((r) => (
                            <SelectItem key={r.id} value={r.id} className="font-bold text-xs py-3 focus:bg-primary/10 rounded-xl">
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
                    className="w-full h-16 rounded-[20px] font-black uppercase tracking-widest text-sm relative group overflow-hidden shadow-2xl shadow-primary/20 bg-slate-900 border border-primary/10 hover:bg-slate-800"
                  >
                    <div className="relative flex items-center justify-center gap-3">
                      {loading ? (
                        <>
                          <Loader2 className="h-5 w-5 animate-spin" />
                          <span>Ingesting Repositories...</span>
                        </>
                      ) : (
                        <>
                          <Plus className="h-5 w-5 text-primary" />
                          <span>Append Projects to Resume</span>
                        </>
                      )}
                    </div>
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>
          </motion.div>
        </AnimatePresence>
      </Tabs>

      {/* Phase 41: Verification & Extraction Preview Dialog */}
      <Dialog open={previewModalOpen} onOpenChange={setPreviewModalOpen}>
        <DialogContent className="max-w-2xl bg-slate-950/95 border-primary/15 rounded-3xl p-8 backdrop-blur-2xl">
          <DialogHeader className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400">
                  <Linkedin className="h-5 w-5" />
                </div>
                <DialogTitle className="text-lg font-black tracking-tight">
                  Extracted LinkedIn Profile Preview
                </DialogTitle>
              </div>
              {extractedPreview && (
                <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 text-xs font-bold gap-1">
                  <ShieldCheck className="h-3.5 w-3.5" />
                  {extractedPreview.confidenceScore}% Confidence
                </Badge>
              )}
            </div>
            <DialogDescription className="text-xs text-muted-foreground/80">
              Verify the extracted candidate data below. Click &quot;Confirm &amp; Build Resume&quot; to populate your new ResumeForge project.
            </DialogDescription>
          </DialogHeader>

          {extractedPreview?.resumeData && (
            <div className="space-y-5 py-4 max-h-[60vh] overflow-y-auto pr-2">
              {/* Candidate Info Card */}
              <div className="p-4 rounded-2xl bg-slate-900/60 border border-primary/10 space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="font-black text-base text-foreground">
                    {extractedPreview.resumeData.personalInfo?.fullName || "Candidate"}
                  </h3>
                  <span className="text-xs text-muted-foreground/60">
                    {extractedPreview.resumeData.personalInfo?.location}
                  </span>
                </div>
                {extractedPreview.resumeData.personalInfo?.summary && (
                  <p className="text-xs text-muted-foreground/80 leading-relaxed italic">
                    &quot;{extractedPreview.resumeData.personalInfo.summary}&quot;
                  </p>
                )}
              </div>

              {/* Work Experience */}
              <div className="space-y-2">
                <div className="flex items-center gap-1.5 text-xs font-bold text-muted-foreground uppercase tracking-wider">
                  <Briefcase className="h-3.5 w-3.5 text-primary" />
                  <span>Work Experience ({extractedPreview.resumeData.workExperience?.length || 0})</span>
                </div>
                <div className="space-y-2">
                  {extractedPreview.resumeData.workExperience?.map((exp: any, i: number) => (
                    <div key={i} className="p-3 rounded-xl bg-slate-900/30 border border-primary/5 text-xs flex items-center justify-between">
                      <div>
                        <p className="font-bold text-foreground">{exp.position}</p>
                        <p className="text-muted-foreground/70">{exp.company}</p>
                      </div>
                      <Badge variant="outline" className="text-[10px] text-muted-foreground/60">
                        {exp.startDate} – {exp.endDate || "Present"}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>

              {/* Education */}
              {extractedPreview.resumeData.education?.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-muted-foreground uppercase tracking-wider">
                    <GraduationCap className="h-3.5 w-3.5 text-primary" />
                    <span>Education ({extractedPreview.resumeData.education.length})</span>
                  </div>
                  <div className="space-y-2">
                    {extractedPreview.resumeData.education.map((edu: any, i: number) => (
                      <div key={i} className="p-3 rounded-xl bg-slate-900/30 border border-primary/5 text-xs flex items-center justify-between">
                        <div>
                          <p className="font-bold text-foreground">{edu.institution}</p>
                          <p className="text-muted-foreground/70">{edu.degree} {edu.field ? `in ${edu.field}` : ""}</p>
                        </div>
                        <Badge variant="outline" className="text-[10px] text-muted-foreground/60">
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
                  <div className="flex items-center gap-1.5 text-xs font-bold text-muted-foreground uppercase tracking-wider">
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

          <DialogFooter className="gap-2 sm:gap-0 pt-2 border-t border-primary/10">
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
              className="rounded-xl font-black uppercase tracking-wider text-xs bg-blue-600 hover:bg-blue-500 gap-2 shadow-lg shadow-blue-500/20"
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
        <DialogContent className="max-w-md bg-slate-950/90 border-destructive/20 rounded-3xl p-8 backdrop-blur-2xl">
          <DialogHeader className="space-y-4">
            <div className="h-12 w-12 rounded-2xl bg-destructive/10 border border-destructive/20 flex items-center justify-center text-destructive">
              <AlertTriangle className="h-6 w-6" />
            </div>
            <div>
              <DialogTitle className="text-xl font-black tracking-tight">{errorMessage?.title}</DialogTitle>
              <DialogDescription className="text-sm font-medium text-muted-foreground/80 mt-2 leading-relaxed">
                {errorMessage?.description}
              </DialogDescription>
            </div>
          </DialogHeader>
          <DialogFooter className="mt-6">
            <Button
              onClick={() => setErrorModalOpen(false)}
              className="w-full h-12 rounded-2xl font-black uppercase tracking-widest text-xs bg-slate-900 border border-primary/10 hover:bg-slate-800"
            >
              Acknowledge
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
