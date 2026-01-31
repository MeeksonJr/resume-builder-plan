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
} from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { SaveVersionDialog } from "@/components/dashboard/resume/save-version-dialog";
import { VersionHistory } from "@/components/dashboard/resume/version-history";
import { PersonalInfoForm } from "@/components/editor/sections/personal-info-form";
import { WorkExperienceForm } from "@/components/editor/sections/work-experience-form";
import { EducationForm } from "@/components/editor/sections/education-form";
import { SkillsForm } from "@/components/editor/sections/skills-form";
import { ProjectsForm } from "@/components/editor/sections/projects-form";
import { CertificationsForm } from "@/components/editor/sections/certifications-form";
import { LanguagesForm } from "@/components/editor/sections/languages-form";
import { ResumePreview } from "@/components/editor/resume-preview";
import { AIAssistant } from "@/components/editor/ai-assistant";
import { ShareDialog } from "@/components/editor/share-dialog";

// import { VersionHistory } from "@/components/editor/version-history"; // Removed generic import
import { SectionReorder } from "@/components/editor/section-reorder";
import { useResumeStore } from "@/lib/stores/resume-store";
import { useEffect } from "react";
import { toast } from "sonner";
import { VisualCustomizer } from "@/components/editor/visual-customizer";
import { exportToDocx } from "@/lib/export/docx-export";

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
    setIsPublic,
    setSlug,
    setSectionOrder,
    setVisualConfig,
    template,
    hasChanges,
    saveAllChanges,
    setLanguage,
    setIsRtl,
  } = useResumeStore();

  // Initialize store with data
  useEffect(() => {
    setResumeId(resume.id);
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

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await saveAllChanges();
      toast.success("Resume saved successfully");
    } catch {
      toast.error("Failed to save resume");
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

      await exportToDocx({
        profile: store.profile,
        workExperiences: store.workExperiences,
        education: store.education,
        skills: store.skills,
        projects: store.projects,
        certifications: store.certifications,
        languages: store.languages,
        sectionOrder: store.sectionOrder,
      });
      toast.success("Word document generated", { id: loadingToast });
    } catch (error) {
      console.error(error);
      toast.error("Failed to generate Word document", { id: loadingToast });
    }
  };

  return (
    <div className="flex h-[calc(100vh-64px)] flex-col">
      {/* Editor Header */}
      <div className="flex items-center justify-between border-b border-border bg-background px-4 py-3">
        <div className="flex items-center gap-4">
          <Button asChild variant="ghost" size="icon" className="min-h-[44px] min-w-[44px]">
            <Link href="/dashboard">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div>
            <h1 className="text-lg font-semibold">{resume.title}</h1>
            <p className="text-xs text-muted-foreground">
              {hasChanges ? "Unsaved changes" : "All changes saved"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <VisualCustomizer />
          <SectionReorder />
          <Button
            variant="ghost"
            size="sm"
            className="hidden min-h-[44px] gap-2 bg-transparent text-muted-foreground hover:text-foreground sm:flex"
            onClick={() => setShowVersionDialog(true)}
            title="Create Checkpoint"
          >
            <GitCommit className="h-4 w-4" />
          </Button>

          <Sheet open={showHistory} onOpenChange={setShowHistory}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="hidden min-h-[44px] gap-2 bg-transparent text-muted-foreground hover:text-foreground sm:flex"
                title="Version History"
              >
                <History className="h-4 w-4" />
              </Button>
            </SheetTrigger>
            <SheetContent>
              <SheetHeader>
                <SheetTitle>Version History</SheetTitle>
              </SheetHeader>
              <div className="mt-4 h-[calc(100vh-100px)]">
                <VersionHistory />
              </div>
            </SheetContent>
          </Sheet>

          <ShareDialog />
          <Button
            variant="outline"
            size="sm"
            className="hidden min-h-[44px] gap-2 bg-transparent sm:flex"
            onClick={() => setShowAI(!showAI)}
          >
            <Sparkles className="h-4 w-4" />
            AI Assistant
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="hidden min-h-[44px] gap-2 bg-transparent md:flex"
            onClick={() => setShowPreview(!showPreview)}
          >
            {showPreview ? (
              <>
                <EyeOff className="h-4 w-4" />
                Hide Preview
              </>
            ) : (
              <>
                <Eye className="h-4 w-4" />
                Show Preview
              </>
            )}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleSave}
            disabled={isSaving || !hasChanges}
            className="min-h-[44px] gap-2 bg-transparent"
          >
            <Save className="h-4 w-4" />
            <span className="hidden sm:inline">Save</span>
          </Button>
          <select
            className="h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
            value={template}
            onChange={(e) => setTemplate(e.target.value)}
          >
            <option value="modern">Modern</option>
            <option value="minimal">Minimal</option>
            <option value="classic">Classic</option>
          </select>
          <Button
            size="sm"
            onClick={handleDownloadPDF}
            className="min-h-[44px] gap-2"
          >
            <Download className="h-4 w-4" />
            <span className="hidden lg:inline text-xs">PDF</span>
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={handleDownloadWord}
            className="min-h-[44px] gap-2 bg-transparent"
          >
            <FileDown className="h-4 w-4" />
            <span className="hidden lg:inline text-xs">Word</span>
          </Button>
        </div>
      </div>

      {/* Main Editor Area */}
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
            <TabsContent value="preview" className="flex-1 overflow-hidden">
              <div className="h-full overflow-y-auto bg-muted/30 p-4">
                <ResumePreview />
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* Desktop: Resizable panels */}
        <div className="hidden h-full md:block">
          <ResizablePanelGroup direction="horizontal">
            <ResizablePanel defaultSize={showPreview ? 50 : 100} minSize={30}>
              <div className="h-full overflow-y-auto p-4">
                <EditorForm activeTab={activeTab} setActiveTab={setActiveTab} />
              </div>
            </ResizablePanel>
            {showPreview && (
              <>
                <ResizableHandle withHandle />
                <ResizablePanel defaultSize={50} minSize={30}>
                  <div className="h-full overflow-y-auto bg-muted/30 p-4">
                    <ResumePreview />
                  </div>
                </ResizablePanel>
              </>
            )}
          </ResizablePanelGroup>
        </div>
      </div>

      {/* AI Assistant Drawer */}
      {showAI && (
        <AIAssistant onClose={() => setShowAI(false)} />
      )}

      {/* Hidden Print Preview */}
      <div className="hidden">
        <ResumePreview ref={printRef} />
      </div>

      <SaveVersionDialog
        open={showVersionDialog}
        onOpenChange={setShowVersionDialog}
      />
    </div>
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

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab}>
      <TabsList className="mb-4 flex h-auto flex-wrap justify-start gap-1">
        <TabsTrigger value="personal" className="min-h-[44px]">
          Personal
        </TabsTrigger>
        {sectionOrder.map((sectionId) => (
          <TabsTrigger key={sectionId} value={sectionId} className="min-h-[44px] capitalize">
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
