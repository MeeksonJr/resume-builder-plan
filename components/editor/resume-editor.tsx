"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { useReactToPrint } from "react-to-print";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import {
  ArrowLeft,
  Download,
  Eye,
  EyeOff,
  Save,
  Sparkles,
  Settings,
  FileDown,
  History,
  GitCommit,
  Target,
  User,
  Briefcase,
  GraduationCap,
  FolderGit,
  Wrench,
  Award,
  Languages,
  Clock,
  ChevronRight,
  Pencil,
  Check,
  X,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { SaveVersionDialog } from "@/components/dashboard/resume/save-version-dialog";
import { PersonalInfoForm } from "@/components/editor/sections/personal-info-form";
import { WorkExperienceForm } from "@/components/editor/sections/work-experience-form";
import { EducationForm } from "@/components/editor/sections/education-form";
import { SkillsForm } from "@/components/editor/sections/skills-form";
import { ProjectsForm } from "@/components/editor/sections/projects-form";
import { CertificationsForm } from "@/components/editor/sections/certifications-form";
import { LanguagesForm } from "@/components/editor/sections/languages-form";
import { ResumePreview } from "@/components/editor/resume-preview";
import { ResumePreviewPanel } from "@/components/editor/resume-preview-panel";
import { ShareDialog } from "@/components/editor/share-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { FileJson, FileText, FileCode, Printer, ChevronDown, Loader2, Upload } from "lucide-react";
import { exportToJSON } from "@/lib/export/json-export";
import { exportToTxt } from "@/lib/export/txt-export";
import { JsonImportDialog } from "@/components/import/json-import-dialog";
import type { ParsedResumeData } from "@/lib/export/json-import";

// import { VersionHistory } from "@/components/editor/version-history"; // Removed generic import
import { SectionReorder } from "@/components/editor/section-reorder";
import { useResumeStore } from "@/lib/stores/resume-store";
import { useEffect } from "react";
import { toast } from "sonner";
import { VisualCustomizer } from "@/components/editor/visual-customizer";
import { JobInputDialog } from "@/components/tailoring/job-input-dialog";
import { ResumeStrengthMeter } from "./resume-strength-meter";
import { OptimizationPanel } from "@/components/tailoring/optimization-panel";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import dynamic from "next/dynamic";
import { motion, AnimatePresence } from "framer-motion";

const CoverLetterGenerator = dynamic(() => import("@/components/cover-letter/generator-panel").then(mod => mod.CoverLetterGenerator), {
    loading: () => <div className="h-full flex items-center justify-center min-h-[300px]"><Loader2 className="animate-spin h-8 w-8 text-primary" /></div>
});

const AIAssistant = dynamic(() => import("@/components/editor/ai-assistant").then(mod => mod.AIAssistant), {
    loading: () => <div className="h-full flex items-center justify-center min-h-[300px]"><Loader2 className="animate-spin h-8 w-8 text-primary" /></div>
});

const VersionHistory = dynamic(() => import("@/components/dashboard/resume/version-history").then(mod => mod.VersionHistory), {
    loading: () => <div className="h-full flex items-center justify-center min-h-[200px]"><Loader2 className="animate-spin h-6 w-6 text-primary" /></div>
});

interface Resume {
  id: string;
  title: string;
  template_id: string | null;
  is_primary: boolean;
  slug: string | null;
  is_public: boolean;
  section_order: string[] | null;
  visual_config: any | null;
  language: string | null;
  is_rtl: boolean | null;
}

interface Profile {
  id: string;
  full_name: string | null;
  email: string | null;
  phone: string | null;
  location: string | null;
  linkedin_url: string | null;
  website_url: string | null;
  github_url: string | null;
  summary: string | null;
}

interface WorkExperience {
  id: string;
  company: string;
  position: string;
  location: string | null;
  start_date: string | null;
  end_date: string | null;
  is_current: boolean;
  description: string | null;
  highlights: string[];
  sort_order: number;
}

interface Education {
  id: string;
  institution: string;
  degree: string | null;
  field_of_study: string | null;
  location: string | null;
  start_date: string | null;
  end_date: string | null;
  gpa: string | null;
  highlights: string[];
  sort_order: number;
}

interface Skill {
  id: string;
  name: string;
  category: string | null;
  proficiency_level: number | null;
  sort_order: number;
}

interface Project {
  id: string;
  name: string;
  description: string | null;
  technologies: string[];
  url: string | null;
  highlights: string[];
  sort_order: number;
}

interface Certification {
  id: string;
  name: string;
  issuer: string | null;
  issue_date: string | null;
  expiry_date: string | null;
  credential_id: string | null;
  credential_url: string | null;
  sort_order: number;
}

interface Language {
  id: string;
  language: string;
  proficiency: string;
  sort_order: number;
}

interface ResumeEditorProps {
  resume: Resume;
  profile: Profile | null;
  workExperiences: WorkExperience[];
  education: Education[];
  skills: Skill[];
  projects: Project[];
  certifications: Certification[];
  languages: Language[];
}

export function ResumeEditor({
  resume,
  profile,
  workExperiences,
  education,
  skills,
  projects,
  certifications,
  languages,
}: ResumeEditorProps) {
  const [showPreview, setShowPreview] = useState(true);
  const [showAI, setShowAI] = useState(false);
  const [activeTab, setActiveTab] = useState("personal");
  const [isSaving, setIsSaving] = useState(false);
  const [showVersionDialog, setShowVersionDialog] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [showCoverLetter, setShowCoverLetter] = useState(false);

  // Tailoring State
  // Tailoring state handling is merged below

  const [isTailoring, setIsTailoring] = useState(false);
  // Removed local tailoringResult state
  const [isOptimizationPanelOpen, setIsOptimizationPanelOpen] = useState(false);

  const {
    setResumeId,
    setProfile,
    setWorkExperiences,
    setEducation,
    setSkills,
    setProjects,
    setCertifications,
    setLanguages,
    setTemplate,
    setTitle,
    updateResumeTitle,
    title: storeTitle,
    setIsPublic,
    setSlug,
    setSectionOrder,
    setVisualConfig,
    template,
    hasChanges,
    saveAllChanges,
    setLanguage,
    setIsRtl,
    tailoringResult,
    setTailoringResult,
    setTargetJob,
    updateProfile
  } = useResumeStore();

  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [titleInput, setTitleInput] = useState(resume.title || "Untitled Resume");
  const titleInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (storeTitle) {
      setTitleInput(storeTitle);
    }
  }, [storeTitle]);

  const handleSaveTitle = async () => {
    const trimmed = titleInput.trim();
    if (trimmed && trimmed !== storeTitle) {
      setTitle(trimmed);
      try {
        await updateResumeTitle(trimmed);
        toast.success("Resume renamed");
      } catch (err) {
        toast.error("Failed to rename resume");
      }
    } else {
      setTitleInput(storeTitle || resume.title || "Untitled Resume");
    }
    setIsEditingTitle(false);
  };

  // Prevent outer dashboard main from creating outer scrollbars while editor is active
  useEffect(() => {
    const main = document.querySelector("main.flex-1") as HTMLElement | null;
    if (main) {
      const originalOverflow = main.style.overflow;
      main.style.overflow = "hidden";
      return () => {
        main.style.overflow = originalOverflow;
      };
    }
  }, []);

  // Initialize store with data
  useEffect(() => {
    setResumeId(resume.id);
    setTitle(resume.title || "Untitled Resume");
    setTemplate(resume.template_id || "modern");
    setIsPublic(resume.is_public || false);
    setSlug(resume.slug || "");
    if (resume.section_order) setSectionOrder(resume.section_order);
    if (resume.visual_config) setVisualConfig(resume.visual_config);
    if (resume.language) setLanguage(resume.language);
    setIsRtl(resume.is_rtl || false);
    if (profile) setProfile(profile);

    const trimDate = (dateStr: any) => {
      if (!dateStr || typeof dateStr !== "string") return "";
      return dateStr.substring(0, 7); // YYYY-MM
    };

    // Map DB sort_order to store display_order and align column names
    setWorkExperiences(workExperiences.map(i => ({
      ...i,
      display_order: i.sort_order,
      start_date: trimDate(i.start_date),
      end_date: trimDate(i.end_date)
    })));

    setEducation(education.map((i: any) => ({
      ...i,
      display_order: i.sort_order,
      // Map DB 'achievements' to store 'highlights'
      highlights: i.highlights || i.achievements || [],
      start_date: trimDate(i.start_date),
      end_date: trimDate(i.end_date)
    })));

    setSkills(skills.map(i => ({ ...i, display_order: i.sort_order })));
    setProjects(projects.map(i => ({ ...i, display_order: i.sort_order })));

    setCertifications(certifications.map(i => ({
      ...i,
      display_order: i.sort_order,
      issue_date: trimDate(i.issue_date),
      expiry_date: trimDate(i.expiry_date)
    })));

    setLanguages(languages.map((i: any) => ({
      ...i,
      // Map DB 'name' to store 'language'
      language: i.language || i.name || "",
      display_order: i.sort_order
    })));
  }, [
    resume.id,
    profile,
    workExperiences,
    education,
    skills,
    projects,
    certifications,
    languages,
    setResumeId,
    setProfile,
    setWorkExperiences,
    setEducation,
    setSkills,
    setProjects,
    setCertifications,
    setLanguages,
    setTemplate,
    setIsPublic,
    setSlug,
    resume.template_id,
    resume.is_public,
    resume.slug,
  ]);

  const handleTailor = async (jobDescription: string, jobTitle: string, company: string) => {
    setIsTailoring(true);
    try {
      const response = await fetch("/api/ai/tailor", {
        method: "POST",
        body: JSON.stringify({
          resume: {
            personalInfo: useResumeStore.getState().profile,
            workExperiences: useResumeStore.getState().workExperiences,
            education: useResumeStore.getState().education,
            skills: useResumeStore.getState().skills,
            projects: useResumeStore.getState().projects
          },
          jobDescription,
          jobTitle,
          company
        })
      });

      if (!response.ok) throw new Error("Analysis failed");

      const result = await response.json();
      setTailoringResult(result);
      setTargetJob({ title: jobTitle, company, description: jobDescription });
      setIsOptimizationPanelOpen(true);
      setIsOptimizationPanelOpen(true);
      toast.success("Analysis complete!");
    } catch (error) {
      console.error(error);
      toast.error("Failed to analyze fit.");
    } finally {
      setIsTailoring(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await saveAllChanges();
      toast.success("Resume saved successfully");
    } catch (err: any) {
      console.error("Failed to save resume:", err);
      toast.error(err?.message || "Failed to save resume");
    } finally {
      setIsSaving(false);
    }
  };

  const printRef = useRef<HTMLDivElement>(null);

  const handleDownloadPDF = useReactToPrint({
    contentRef: printRef,
    documentTitle: `${resume.title || "Resume"}`,
    onBeforePrint: async () => {
      const supabase = createClient();
      await supabase.rpc("record_resume_event", {
        resume_id_param: resume.id,
        event_type_param: "download",
      });
    },
    onAfterPrint: () => toast.success("Download started"),
  });

  const handleDownloadWord = async () => {
    const store = useResumeStore.getState();
    const loadingToast = toast.loading("Generating Word document...");
    try {
      const supabase = createClient();
      await supabase.rpc("record_resume_event", {
        resume_id_param: resume.id,
        event_type_param: "download",
      });

      // Dynamically import docx export helper to keep main editor bundle slim
      const { exportToDocx } = await import("@/lib/export/docx-export");

      await exportToDocx({
        profile: store.profile,
        workExperiences: store.workExperiences,
        education: store.education,
        skills: store.skills,
        projects: store.projects,
        certifications: store.certifications,
        languages: store.languages,
        sectionOrder: store.sectionOrder,
      }, store.visualConfig?.accentColor || "#000000");
      toast.success("Word document generated", { id: loadingToast });
    } catch (error) {
      console.error(error);
      toast.error("Failed to generate Word document", { id: loadingToast });
    }
  };

  const handleDownloadJSON = async () => {
    const store = useResumeStore.getState();
    const loadingToast = toast.loading("Generating JSON file...");
    try {
      exportToJSON({
        profile: store.profile,
        workExperiences: store.workExperiences,
        education: store.education,
        skills: store.skills,
        projects: store.projects,
        certifications: store.certifications,
        languages: store.languages,
      });
      toast.success("JSON exported", { id: loadingToast });
    } catch (error) {
      console.error(error);
      toast.error("Failed to export JSON", { id: loadingToast });
    }
  };

  const handleDownloadTxt = async () => {
    const store = useResumeStore.getState();
    const loadingToast = toast.loading("Generating Text file...");
    try {
      exportToTxt({
        profile: store.profile,
        workExperiences: store.workExperiences,
        education: store.education,
        skills: store.skills,
        projects: store.projects,
        certifications: store.certifications,
        languages: store.languages,
        sectionOrder: store.sectionOrder,
      });
      toast.success("Text file exported", { id: loadingToast });
    } catch (error) {
      console.error(error);
      toast.error("Failed to export Text file", { id: loadingToast });
    }
  };

  const handleJSONImport = (data: ParsedResumeData) => {
    const store = useResumeStore.getState();
    const currentProfile = store.profile || {} as any;
    // Merge imported data into the store
    if (data.profile) {
      setProfile({
        ...currentProfile,
        full_name: data.profile.full_name || currentProfile.full_name || "",
        email: data.profile.email || currentProfile.email || "",
        phone: data.profile.phone || currentProfile.phone || "",
        location: data.profile.location || currentProfile.location || "",
        linkedin_url: data.profile.linkedin_url || currentProfile.linkedin_url || "",
        github_url: data.profile.github_url || currentProfile.github_url || "",
        website_url: data.profile.website_url || currentProfile.website_url || "",
        summary: data.profile.summary || currentProfile.summary || "",
      } as any);
    }
    if (data.workExperiences.length > 0) {
      setWorkExperiences(data.workExperiences.map((w, i) => ({ ...w, id: `temp-work-${i}-${Date.now()}`, sort_order: i, display_order: i })) as any);
    }
    if (data.education.length > 0) {
      setEducation(data.education.map((e, i) => ({ ...e, id: `temp-edu-${i}-${Date.now()}`, sort_order: i, display_order: i })) as any);
    }
    if (data.skills.length > 0) {
      setSkills(data.skills.map((s, i) => ({ ...s, id: `temp-skill-${i}-${Date.now()}`, sort_order: i, display_order: i })) as any);
    }
    if (data.projects.length > 0) {
      setProjects(data.projects.map((p, i) => ({ ...p, id: `temp-proj-${i}-${Date.now()}`, sort_order: i, display_order: i })) as any);
    }
    if (data.certifications.length > 0) {
      setCertifications(data.certifications.map((c, i) => ({ ...c, id: `temp-cert-${i}-${Date.now()}`, sort_order: i, display_order: i })) as any);
    }
    if (data.languages.length > 0) {
      setLanguages(data.languages.map((l, i) => ({ ...l, id: `temp-lang-${i}-${Date.now()}`, name: l.name, language: l.name, sort_order: i, display_order: i })) as any);
    }
  };

  return (
    <div className="-my-4 -mx-1 sm:-mx-2 md:-mx-4 lg:-mx-5 flex h-[calc(100vh-6.5rem)] flex-col overflow-hidden border border-[#102b2b]/15 bg-white shadow-md rounded-none">
      {/* Editor Header */}
      <div className="flex items-center justify-between border-b border-border bg-[#102b2b] text-[#f8f4ec] px-6 py-4 shadow-sm">
        <div className="flex items-center gap-3 sm:gap-4">
          <Button asChild variant="ghost" size="icon" className="h-10 w-10 text-[#a6c0b8] hover:text-[#d8f36b] hover:bg-[#164743] rounded-none">
            <Link href="/dashboard/resumes">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div className="min-w-0">
            {isEditingTitle ? (
              <div className="flex items-center gap-1.5">
                <Input
                  ref={titleInputRef}
                  value={titleInput}
                  onChange={(e) => setTitleInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleSaveTitle();
                    if (e.key === "Escape") {
                      setTitleInput(storeTitle || resume.title || "Untitled Resume");
                      setIsEditingTitle(false);
                    }
                  }}
                  autoFocus
                  className="h-8 max-w-[240px] sm:max-w-[340px] bg-[#164743] border-[#256f68] text-white text-sm font-bold focus-visible:ring-1 focus-visible:ring-[#d8f36b] rounded-none"
                />
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={handleSaveTitle}
                  className="h-8 w-8 text-[#d8f36b] hover:bg-[#164743] rounded-none shrink-0"
                  title="Save title"
                >
                  <Check className="h-4 w-4" />
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => {
                    setTitleInput(storeTitle || resume.title || "Untitled Resume");
                    setIsEditingTitle(false);
                  }}
                  className="h-8 w-8 text-[#a6c0b8] hover:bg-[#164743] rounded-none shrink-0"
                  title="Cancel"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <div
                onClick={() => setIsEditingTitle(true)}
                className="group flex items-center gap-2 cursor-pointer py-0.5 rounded-none"
                title="Click to rename resume"
              >
                <h1 className="text-lg font-black uppercase tracking-tight text-white group-hover:text-[#d8f36b] transition-colors truncate max-w-[240px] sm:max-w-[360px]">
                  {storeTitle || resume.title || "Untitled Resume"}
                </h1>
                <Pencil className="h-3.5 w-3.5 text-[#a6c0b8] opacity-60 group-hover:opacity-100 group-hover:text-[#d8f36b] transition-all shrink-0" />
              </div>
            )}
            <div className="flex items-center gap-2 mt-0.5">
              <span className={`inline-block h-2 w-2 rounded-full ${hasChanges ? "bg-amber-400 animate-pulse" : "bg-emerald-400"}`} />
              <p className="text-xs text-[#a6c0b8] font-semibold">
                {hasChanges ? "Unsaved changes" : "All changes saved"}
              </p>
            </div>
          </div>
          <div className="ml-1 sm:ml-3">
            <ResumeStrengthMeter onNavigateTab={setActiveTab} />
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Design & Layout tools */}
          <div className="flex items-center gap-1 border-r border-white/10 pr-3">
            <VisualCustomizer />
            <SectionReorder />
          </div>

          {/* AI Toolkit */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="h-10 gap-2 border-[#d8f36b]/30 bg-[#d8f36b]/10 text-[#d8f36b] hover:bg-[#d8f36b]/20 hover:text-white rounded-none">
                <Sparkles className="h-4 w-4" />
                <span className="hidden lg:inline">AI Suite</span>
                <ChevronDown className="h-3 w-3 opacity-70" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 bg-[#f8f4ec] border-[#102b2b]/15 text-[#102b2b]">
              <DropdownMenuLabel className="text-xs font-bold uppercase tracking-wider text-[#52716a]">AI Writing Suite</DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-[#102b2b]/10" />
              
              <DropdownMenuItem onClick={() => setShowAI(!showAI)} className="gap-2.5 cursor-pointer font-semibold hover:bg-[#102b2b]/5">
                <Sparkles className="h-4 w-4 text-indigo-600" />
                <span>AI Writing Assistant</span>
              </DropdownMenuItem>

              <Dialog open={showCoverLetter} onOpenChange={setShowCoverLetter}>
                <DialogTrigger asChild>
                  <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="gap-2.5 cursor-pointer font-semibold hover:bg-[#102b2b]/5">
                    <FileText className="h-4 w-4 text-indigo-600" />
                    <span>AI Cover Letter</span>
                  </DropdownMenuItem>
                </DialogTrigger>
                <DialogContent className="max-w-5xl h-[80vh] flex flex-col p-0 rounded-none">
                  <CoverLetterGenerator />
                </DialogContent>
              </Dialog>

              <DropdownMenuSeparator className="bg-[#102b2b]/10" />
              <DropdownMenuLabel className="text-xs font-bold uppercase tracking-wider text-[#52716a]">ATS Optimization</DropdownMenuLabel>

              {tailoringResult ? (
                <DropdownMenuItem onClick={() => setIsOptimizationPanelOpen(true)} className="gap-2.5 cursor-pointer font-semibold text-emerald-700 hover:bg-emerald-50">
                  <Sparkles className="h-4 w-4 text-emerald-600" />
                  <span>View Match ({tailoringResult.score}%)</span>
                </DropdownMenuItem>
              ) : (
                <JobInputDialog onResumeTailor={handleTailor} isLoading={isTailoring}>
                  <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="gap-2.5 cursor-pointer font-semibold hover:bg-[#102b2b]/5">
                    <Target className="h-4 w-4 text-indigo-600" />
                    <span>Target Job Scan</span>
                  </DropdownMenuItem>
                </JobInputDialog>
              )}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Versions Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="h-10 gap-2 border-white/20 bg-transparent text-[#f8f4ec] hover:bg-white/10 hover:text-white rounded-none">
                <History className="h-4 w-4 text-[#a6c0b8]" />
                <span className="hidden md:inline">Checkpoints</span>
                <ChevronDown className="h-3 w-3 opacity-50" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 bg-[#f8f4ec] border-[#102b2b]/15 text-[#102b2b]">
              <DropdownMenuLabel className="text-xs font-bold uppercase tracking-wider text-[#52716a]">Version Control</DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-[#102b2b]/10" />
              <DropdownMenuItem onClick={() => setShowVersionDialog(true)} className="gap-2.5 cursor-pointer font-semibold hover:bg-[#102b2b]/5">
                <GitCommit className="h-4 w-4 text-[#0d8274]" />
                <span>Create Checkpoint</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setShowHistory(true)} className="gap-2.5 cursor-pointer font-semibold hover:bg-[#102b2b]/5">
                <Clock className="h-4 w-4 text-[#0d8274]" />
                <span>Restore Snapshot</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Sheet open={showHistory} onOpenChange={setShowHistory}>
            <SheetContent className="w-[300px] sm:w-[400px] overflow-y-auto">
              <SheetHeader>
                <SheetTitle>Version Checkpoints</SheetTitle>
              </SheetHeader>
              <div className="mt-4 h-[calc(100vh-100px)]">
                <VersionHistory />
              </div>
            </SheetContent>
          </Sheet>

          {/* Share Link */}
          <ShareDialog />

          {/* Preview Toggle */}
          <Button
            variant="outline"
            size="sm"
            className="hidden h-10 gap-2 border-white/20 bg-transparent text-[#f8f4ec] hover:bg-white/10 hover:text-white rounded-none md:flex"
            onClick={() => setShowPreview(!showPreview)}
          >
            {showPreview ? (
              <>
                <EyeOff className="h-4 w-4 text-[#a6c0b8]" />
                <span className="hidden lg:inline">Hide Preview</span>
              </>
            ) : (
              <>
                <Eye className="h-4 w-4 text-[#a6c0b8]" />
                <span className="hidden lg:inline">Show Preview</span>
              </>
            )}
          </Button>

          {/* Save Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={handleSave}
            disabled={isSaving || !hasChanges}
            className="h-10 gap-2 border-white/20 bg-transparent text-[#f8f4ec] hover:bg-white/10 hover:text-white rounded-none"
          >
            <Save className="h-4 w-4 text-[#a6c0b8]" />
            <span className="hidden sm:inline">Save</span>
          </Button>

          {/* Template Select Dropdown */}
          <select
            className="hidden sm:inline-flex h-10 rounded-none border border-white/20 bg-transparent text-[#f8f4ec] px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#d8f36b] disabled:cursor-not-allowed disabled:opacity-50 [&>option]:bg-[#102b2b] [&>option]:text-[#f8f4ec]"
            value={template}
            onChange={(e) => setTemplate(e.target.value)}
          >
            <option value="modern">Modern Clean</option>
            <option value="classic">Ivy League Classic</option>
            <option value="minimal">Minimalist Nordic</option>
            <option value="creative">Creative Studio</option>
            <option value="executive">Executive Leadership</option>
            <option value="technical">Technical Developer</option>
            <option value="compact">High-Density Compact</option>
            <option value="elegant">Editorial Elegance</option>
          </select>

          {/* Export Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="sm" className="h-10 gap-2 bg-[#d8f36b] text-[#102b2b] hover:bg-[#e5ff8b] rounded-none font-bold">
                <Download className="h-4 w-4" />
                <span>Export</span>
                <ChevronDown className="h-3 w-3 opacity-60" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-52 bg-[#f8f4ec] border-[#102b2b]/15 text-[#102b2b]">
              <DropdownMenuLabel className="text-xs font-bold uppercase tracking-wider text-[#52716a]">Export formats</DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-[#102b2b]/10" />
              <DropdownMenuItem onClick={handleDownloadPDF} className="gap-2.5 cursor-pointer font-semibold hover:bg-[#102b2b]/5">
                <Printer className="h-4 w-4 text-[#0d8274]" />
                <span>PDF Document</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleDownloadWord} className="gap-2.5 cursor-pointer font-semibold hover:bg-[#102b2b]/5">
                <FileDown className="h-4 w-4 text-[#0d8274]" />
                <span>Word (.docx)</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleDownloadTxt} className="gap-2.5 cursor-pointer font-semibold hover:bg-[#102b2b]/5">
                <FileText className="h-4 w-4 text-[#0d8274]" />
                <span>Plain Text (.txt)</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleDownloadJSON} className="gap-2.5 cursor-pointer font-semibold hover:bg-[#102b2b]/5">
                <FileCode className="h-4 w-4 text-[#0d8274]" />
                <span>JSON Standard</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-[#102b2b]/10" />
              <DropdownMenuLabel className="text-xs font-bold uppercase tracking-wider text-[#52716a]">Import</DropdownMenuLabel>
              <JsonImportDialog onImport={handleJSONImport}>
                <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="gap-2.5 cursor-pointer font-semibold hover:bg-[#102b2b]/5">
                  <Upload className="h-4 w-4 text-[#0d8274]" />
                  <span>Import JSON Resume</span>
                </DropdownMenuItem>
              </JsonImportDialog>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Main Editor Area */}
      <div className="flex flex-1 overflow-hidden">
        <div className="flex-1 overflow-hidden">
          {/* Mobile: Tabs for switching between editor and preview */}
          <div className="flex h-full flex-col md:hidden">
            <Tabs
              defaultValue="edit"
              className="flex h-full flex-col"
            >
              <TabsList className="mx-4 mt-4 grid w-auto grid-cols-2">
                <TabsTrigger value="edit" className="min-h-[44px]">
                  Edit
                </TabsTrigger>
                <TabsTrigger value="preview" className="min-h-[44px]">
                  Preview
                </TabsTrigger>
              </TabsList>
              <TabsContent value="edit" className="flex-1 overflow-hidden">
                <div className="h-full overflow-y-auto p-4">
                  <EditorForm activeTab={activeTab} setActiveTab={setActiveTab} />
                </div>
              </TabsContent>
              <TabsContent value="preview" className="flex-1 overflow-hidden h-full m-0 p-0">
                <ResumePreviewPanel />
              </TabsContent>
            </Tabs>
          </div>

          {/* Desktop: Resizable panels */}
          <div className="hidden h-full md:block">
            <ResizablePanelGroup direction="horizontal" id="resume-editor-panel-group">
              <ResizablePanel defaultSize={showPreview ? 50 : 100} minSize={30} id="editor-panel">
                <div className="h-full overflow-y-auto p-4">
                  <EditorForm activeTab={activeTab} setActiveTab={setActiveTab} />
                </div>
              </ResizablePanel>
              {showPreview && (
                <>
                  <ResizableHandle withHandle />
                  <ResizablePanel defaultSize={50} minSize={30} id="preview-panel">
                    <ResumePreviewPanel />
                  </ResizablePanel>
                </>
              )}
            </ResizablePanelGroup>
          </div>
        </div>

        {/* AI Assistant Sidebar (Desktop) */}
        <AnimatePresence>
          {showAI && (
            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 400, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.2, ease: "easeInOut" }}
              className="hidden border-l border-[#102b2b]/15 md:block overflow-hidden bg-background h-full shrink-0"
            >
              <AIAssistant onClose={() => setShowAI(false)} />
            </motion.div>
          )}
        </AnimatePresence>

        {/* AI Assistant Overlay (Mobile) */}
        <AnimatePresence>
          {showAI && (
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ duration: 0.2, ease: "easeInOut" }}
              className="fixed inset-0 z-50 bg-background md:hidden"
            >
              <AIAssistant onClose={() => setShowAI(false)} />
            </motion.div>
          )}
        </AnimatePresence>

        <OptimizationPanel
          isOpen={isOptimizationPanelOpen}
          onClose={() => setIsOptimizationPanelOpen(false)}
          result={tailoringResult}
        />
      </div>

      {/* Hidden Print Preview - Positioned off-screen to ensure react-to-print captures it */}
      <div style={{ position: "absolute", left: "-10000px", top: 0 }}>
        <ResumePreview ref={printRef} />
      </div>

      <SaveVersionDialog
        open={showVersionDialog}
        onOpenChange={setShowVersionDialog}
      />
    </div >
  );
}

function EditorForm({
  activeTab,
  setActiveTab,
}: {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}) {
  const { sectionOrder } = useResumeStore();

  const getTabIcon = (value: string) => {
    switch (value) {
      case "personal":
        return <User className="h-4 w-4 mr-2 text-indigo-500 group-data-[state=active]:text-white" />;
      case "experience":
        return <Briefcase className="h-4 w-4 mr-2 text-indigo-500 group-data-[state=active]:text-white" />;
      case "education":
        return <GraduationCap className="h-4 w-4 mr-2 text-indigo-500 group-data-[state=active]:text-white" />;
      case "projects":
        return <FolderGit className="h-4 w-4 mr-2 text-indigo-500 group-data-[state=active]:text-white" />;
      case "skills":
        return <Wrench className="h-4 w-4 mr-2 text-indigo-500 group-data-[state=active]:text-white" />;
      case "certifications":
        return <Award className="h-4 w-4 mr-2 text-indigo-500 group-data-[state=active]:text-white" />;
      case "languages":
        return <Languages className="h-4 w-4 mr-2 text-indigo-500 group-data-[state=active]:text-white" />;
      default:
        return null;
    }
  };

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab}>
      <TabsList className="mb-6 flex h-auto flex-wrap justify-start gap-1 bg-[#e9eee8] border border-[#102b2b]/10 p-1.5 rounded-none w-full">
        <TabsTrigger 
          value="personal" 
          className="group rounded-none text-xs font-bold text-[#52716a] hover:text-[#102b2b] hover:bg-white/50 transition-all px-4 py-2.5 flex items-center min-h-[40px] border-none data-[state=active]:bg-[#102b2b] data-[state=active]:text-[#f8f4ec] data-[state=active]:shadow-sm"
        >
          {getTabIcon("personal")}
          Personal
        </TabsTrigger>
        {sectionOrder.map((sectionId) => (
          <TabsTrigger 
            key={sectionId} 
            value={sectionId} 
            className="group rounded-none text-xs font-bold text-[#52716a] hover:text-[#102b2b] hover:bg-white/50 transition-all px-4 py-2.5 flex items-center min-h-[40px] border-none data-[state=active]:bg-[#102b2b] data-[state=active]:text-[#f8f4ec] data-[state=active]:shadow-sm capitalize"
          >
            {getTabIcon(sectionId)}
            {sectionId}
          </TabsTrigger>
        ))}
      </TabsList>

      <TabsContent value="personal" className="mt-0">
        <PersonalInfoForm />
      </TabsContent>
      <TabsContent value="experience" className="mt-0">
        <WorkExperienceForm />
      </TabsContent>
      <TabsContent value="education" className="mt-0">
        <EducationForm />
      </TabsContent>
      <TabsContent value="skills" className="mt-0">
        <SkillsForm />
      </TabsContent>
      <TabsContent value="projects" className="mt-0">
        <ProjectsForm />
      </TabsContent>
      <TabsContent value="certifications" className="mt-0">
        <CertificationsForm />
      </TabsContent>
      <TabsContent value="languages" className="mt-0">
        <LanguagesForm />
      </TabsContent>
    </Tabs>
  );
}
