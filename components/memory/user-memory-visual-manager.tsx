"use client";

import React, { useState, useEffect, useRef } from "react";
import { useUserMemoryStore } from "@/lib/stores/user-memory-store";
import {
  calculateMemoryCompleteness,
  MemoryExperience,
  MemoryEducation,
  MemorySkill,
  MemoryProject,
  MemoryCertification,
} from "@/lib/types/user-memory";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Brain,
  Sparkles,
  User,
  Share2,
  Briefcase,
  GraduationCap,
  Code2,
  FolderGit2,
  Award,
  Sliders,
  CheckCircle2,
  Plus,
  Pencil,
  Trash2,
  ExternalLink,
  Download,
  Upload,
  RefreshCw,
  FileText,
  Mail,
  Phone,
  MapPin,
  Globe,
  Linkedin,
  Github,
  Twitter,
  Youtube,
  Clock,
  Layers,
  FileJson,
  Check,
  AlertCircle,
  Copy,
  ChevronRight
} from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

interface UserMemoryVisualManagerProps {
  userResumes?: { id: string; title: string }[];
  onOpenStudio?: () => void;
}

export function UserMemoryVisualManager({ userResumes = [], onOpenStudio }: UserMemoryVisualManagerProps) {
  const router = useRouter();
  const {
    memory,
    isLoading,
    isSaving,
    lastSyncedAt,
    updateBasics,
    updateSocials,
    updatePreferences,
    addExperience,
    updateExperience,
    deleteExperience,
    addEducation,
    updateEducation,
    deleteEducation,
    addSkill,
    updateSkill,
    deleteSkill,
    addProject,
    updateProject,
    deleteProject,
    addCertification,
    updateCertification,
    deleteCertification,
    importFromResumeData,
    importFromJson,
    loadSampleMemory,
    clearMemory,
    fetchFromServer,
    saveToServer,
  } = useUserMemoryStore();

  const [activeTab, setActiveTab] = useState("identity");
  const [creatingResume, setCreatingResume] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Modals state
  const [basicsModalOpen, setBasicsModalOpen] = useState(false);
  const [socialsModalOpen, setSocialsModalOpen] = useState(false);
  const [expModalOpen, setExpModalOpen] = useState(false);
  const [editingExp, setEditingExp] = useState<MemoryExperience | null>(null);

  const [eduModalOpen, setEduModalOpen] = useState(false);
  const [editingEdu, setEditingEdu] = useState<MemoryEducation | null>(null);

  const [skillModalOpen, setSkillModalOpen] = useState(false);
  const [editingSkill, setEditingSkill] = useState<MemorySkill | null>(null);

  const [projectModalOpen, setProjectModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<MemoryProject | null>(null);

  const [certModalOpen, setCertModalOpen] = useState(false);
  const [editingCert, setEditingCert] = useState<MemoryCertification | null>(null);

  const [importResumeModalOpen, setImportResumeModalOpen] = useState(false);
  const [selectedResumeId, setSelectedResumeId] = useState("");
  const [isExtractingResume, setIsExtractingResume] = useState(false);

  // Forms state
  const [basicsForm, setBasicsForm] = useState(memory.basics);
  const [socialsForm, setSocialsForm] = useState(memory.socials);

  // Experience form
  const [expForm, setExpForm] = useState<Omit<MemoryExperience, "id">>({
    company: "",
    position: "",
    location: "",
    start_date: "",
    end_date: "",
    is_current: false,
    description: "",
    highlights: [],
  });
  const [expHighlightsText, setExpHighlightsText] = useState("");

  // Education form
  const [eduForm, setEduForm] = useState<Omit<MemoryEducation, "id">>({
    institution: "",
    degree: "",
    field_of_study: "",
    location: "",
    start_date: "",
    end_date: "",
    gpa: "",
    honors: "",
    highlights: [],
  });

  // Skill form
  const [skillForm, setSkillForm] = useState<Omit<MemorySkill, "id">>({
    name: "",
    category: "Languages",
    proficiency: 5,
  });

  // Project form
  const [projectForm, setProjectForm] = useState<Omit<MemoryProject, "id">>({
    name: "",
    description: "",
    technologies: [],
    url: "",
    github_url: "",
    highlights: [],
  });
  const [projTechText, setProjTechText] = useState("");

  // Certification form
  const [certForm, setCertForm] = useState<Omit<MemoryCertification, "id">>({
    name: "",
    issuer: "",
    issue_date: "",
    expiry_date: "",
    credential_id: "",
    credential_url: "",
  });

  useEffect(() => {
    fetchFromServer();
  }, [fetchFromServer]);

  useEffect(() => {
    setBasicsForm(memory.basics);
    setSocialsForm(memory.socials);
  }, [memory]);

  const { score: completenessScore, breakdown } = calculateMemoryCompleteness(memory);

  // Quick Action: Create Resume From Memory
  const handleCreateResumeFromMemory = async () => {
    setCreatingResume(true);
    try {
      const res = await fetch("/api/user-memory/create-resume", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          memory,
          title: `${memory.basics?.full_name || "My"} Resume (From Memory)`,
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
      setCreatingResume(false);
    }
  };

  // Quick Action: Ingest from an existing resume
  const handleExtractFromResume = async () => {
    if (!selectedResumeId) {
      toast.error("Please select a resume to extract");
      return;
    }

    setIsExtractingResume(true);
    try {
      const res = await fetch(`/api/resume/${selectedResumeId}?format=full`);
      if (!res.ok) throw new Error("Could not fetch resume details");
      const fullResumeData = await res.json();

      importFromResumeData(fullResumeData, `Imported from ${fullResumeData.resume?.title || fullResumeData.title || "Resume"}`);
      toast.success("User Memory successfully updated from selected resume!");
      setImportResumeModalOpen(false);
    } catch (e: any) {
      toast.error(e.message || "Extraction failed");
    } finally {
      setIsExtractingResume(false);
    }
  };

  // Export JSON file
  const handleExportJson = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(memory, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `career-memory-${(memory.basics?.full_name || "user").toLowerCase().replace(/\s+/g, "-")}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    toast.success("Career Memory exported as JSON file!");
  };

  // Import JSON file
  const handleJsonFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        importFromJson(parsed);
        toast.success("Career Memory imported successfully!");
      } catch (err) {
        toast.error("Invalid JSON file");
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  // Save Basics Form
  const handleSaveBasics = () => {
    updateBasics(basicsForm);
    setBasicsModalOpen(false);
    toast.success("Profile basics updated in Memory!");
  };

  // Save Socials Form
  const handleSaveSocials = () => {
    updateSocials(socialsForm);
    setSocialsModalOpen(false);
    toast.success("Social links updated in Memory!");
  };

  // Experience handlers
  const openAddExp = () => {
    setEditingExp(null);
    setExpForm({
      company: "",
      position: "",
      location: "",
      start_date: "",
      end_date: "",
      is_current: false,
      description: "",
      highlights: [],
    });
    setExpHighlightsText("");
    setExpModalOpen(true);
  };

  const openEditExp = (exp: MemoryExperience) => {
    setEditingExp(exp);
    setExpForm({
      company: exp.company,
      position: exp.position,
      location: exp.location || "",
      start_date: exp.start_date || "",
      end_date: exp.end_date || "",
      is_current: !!exp.is_current,
      description: exp.description || "",
      highlights: exp.highlights || [],
    });
    setExpHighlightsText((exp.highlights || []).join("\n"));
    setExpModalOpen(true);
  };

  const handleSaveExp = () => {
    if (!expForm.company || !expForm.position) {
      toast.error("Company and Position are required");
      return;
    }

    const highlights = expHighlightsText
      .split("\n")
      .map((s) => s.trim())
      .filter(Boolean);

    const payload = { ...expForm, highlights };

    if (editingExp) {
      updateExperience(editingExp.id, payload);
      toast.success("Experience updated!");
    } else {
      addExperience(payload);
      toast.success("New experience added to Memory!");
    }
    setExpModalOpen(false);
  };

  // Education handlers
  const openAddEdu = () => {
    setEditingEdu(null);
    setEduForm({
      institution: "",
      degree: "",
      field_of_study: "",
      location: "",
      start_date: "",
      end_date: "",
      gpa: "",
      honors: "",
      highlights: [],
    });
    setEduModalOpen(true);
  };

  const openEditEdu = (edu: MemoryEducation) => {
    setEditingEdu(edu);
    setEduForm({
      institution: edu.institution,
      degree: edu.degree,
      field_of_study: edu.field_of_study || "",
      location: edu.location || "",
      start_date: edu.start_date || "",
      end_date: edu.end_date || "",
      gpa: edu.gpa || "",
      honors: edu.honors || "",
      highlights: edu.highlights || [],
    });
    setEduModalOpen(true);
  };

  const handleSaveEdu = () => {
    if (!eduForm.institution || !eduForm.degree) {
      toast.error("Institution and Degree are required");
      return;
    }

    if (editingEdu) {
      updateEducation(editingEdu.id, eduForm);
      toast.success("Education updated!");
    } else {
      addEducation(eduForm);
      toast.success("New education added to Memory!");
    }
    setEduModalOpen(false);
  };

  // Skills handlers
  const openAddSkill = () => {
    setEditingSkill(null);
    setSkillForm({ name: "", category: "Languages", proficiency: 5 });
    setSkillModalOpen(true);
  };

  const openEditSkill = (sk: MemorySkill) => {
    setEditingSkill(sk);
    setSkillForm({ name: sk.name, category: sk.category, proficiency: sk.proficiency });
    setSkillModalOpen(true);
  };

  const handleSaveSkill = () => {
    if (!skillForm.name.trim()) {
      toast.error("Skill name is required");
      return;
    }

    if (editingSkill) {
      updateSkill(editingSkill.id, skillForm);
      toast.success("Skill updated!");
    } else {
      addSkill(skillForm);
      toast.success("Skill added to Memory!");
    }
    setSkillModalOpen(false);
  };

  // Projects handlers
  const openAddProject = () => {
    setEditingProject(null);
    setProjectForm({
      name: "",
      description: "",
      technologies: [],
      url: "",
      github_url: "",
      highlights: [],
    });
    setProjTechText("");
    setProjectModalOpen(true);
  };

  const openEditProject = (proj: MemoryProject) => {
    setEditingProject(proj);
    setProjectForm({
      name: proj.name,
      description: proj.description,
      technologies: proj.technologies || [],
      url: proj.url || "",
      github_url: proj.github_url || "",
      highlights: proj.highlights || [],
    });
    setProjTechText((proj.technologies || []).join(", "));
    setProjectModalOpen(true);
  };

  const handleSaveProject = () => {
    if (!projectForm.name.trim()) {
      toast.error("Project name is required");
      return;
    }

    const technologies = projTechText
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);

    const payload = { ...projectForm, technologies };

    if (editingProject) {
      updateProject(editingProject.id, payload);
      toast.success("Project updated!");
    } else {
      addProject(payload);
      toast.success("Project added to Memory!");
    }
    setProjectModalOpen(false);
  };

  // Certifications handlers
  const openAddCert = () => {
    setEditingCert(null);
    setCertForm({
      name: "",
      issuer: "",
      issue_date: "",
      expiry_date: "",
      credential_id: "",
      credential_url: "",
    });
    setCertModalOpen(true);
  };

  const openEditCert = (cert: MemoryCertification) => {
    setEditingCert(cert);
    setCertForm({
      name: cert.name,
      issuer: cert.issuer,
      issue_date: cert.issue_date,
      expiry_date: cert.expiry_date || "",
      credential_id: cert.credential_id || "",
      credential_url: cert.credential_url || "",
    });
    setCertModalOpen(true);
  };

  const handleSaveCert = () => {
    if (!certForm.name.trim()) {
      toast.error("Certification name is required");
      return;
    }

    if (editingCert) {
      updateCertification(editingCert.id, certForm);
      toast.success("Certification updated!");
    } else {
      addCertification(certForm);
      toast.success("Certification added to Memory!");
    }
    setCertModalOpen(false);
  };

  return (
    <div className="space-y-8">
      {/* Hidden File Input for JSON restore */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleJsonFileUpload}
        accept=".json"
        className="hidden"
      />

      {/* TOP HERO BANNER & MEMORY TELEMETRY */}
      <div className="relative overflow-hidden rounded-3xl border border-primary/20 bg-gradient-to-br from-card via-card/90 to-primary/10 p-6 sm:p-8 shadow-xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="flex items-start gap-4 sm:gap-5">
            <div className="relative shrink-0">
              <div className="h-16 w-16 sm:h-20 sm:w-20 rounded-2xl bg-primary/15 border-2 border-primary/40 flex items-center justify-center text-primary shadow-lg ring-4 ring-primary/10">
                <Brain className="h-8 w-8 sm:h-10 sm:w-10 animate-pulse" />
              </div>
              <span className="absolute -bottom-1 -right-1 flex h-4 w-4">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-4 w-4 bg-emerald-500 border-2 border-background"></span>
              </span>
            </div>

            <div className="space-y-1.5 min-w-0">
              <div className="flex flex-wrap items-center gap-2.5">
                <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-foreground">
                  {memory.basics?.full_name || "Your Career Memory"}
                </h2>
                <Badge className="bg-primary/20 text-primary border-primary/40 text-[11px] font-bold uppercase tracking-wider">
                  <Sparkles className="h-3 w-3 mr-1" /> Active Knowledge Core
                </Badge>
              </div>

              <p className="text-sm font-semibold text-primary/90">
                {memory.basics?.headline || "Professional Career Knowledge Base"}
              </p>

              <p className="text-xs text-muted-foreground flex flex-wrap items-center gap-3 pt-0.5">
                <span className="flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
                  {memory.basics?.location || "Location not set"}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                  Updated: {new Date(memory.last_updated).toLocaleDateString()}
                </span>
                {isSaving && (
                  <span className="text-primary flex items-center gap-1 text-[11px] font-semibold">
                    <RefreshCw className="h-3 w-3 animate-spin" /> Auto-syncing...
                  </span>
                )}
              </p>
            </div>
          </div>

          {/* Quick Actions Cluster */}
          <div className="flex flex-wrap items-center gap-2.5 lg:justify-end">
            <Button
              onClick={handleCreateResumeFromMemory}
              disabled={creatingResume}
              className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold shadow-md gap-2 rounded-xl h-11 px-5 cursor-pointer"
            >
              {creatingResume ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <FileText className="h-4 w-4" />
              )}
              Create Resume
            </Button>

            <Button
              variant="outline"
              onClick={() => {
                if (onOpenStudio) {
                  onOpenStudio();
                } else {
                  router.push("/dashboard/portfolio/studio");
                }
              }}
              className="border-primary/30 hover:border-primary/60 font-semibold gap-2 rounded-xl h-11 px-4 cursor-pointer"
            >
              <Globe className="h-4 w-4 text-primary" />
              Use in Portfolio
            </Button>

            <Button
              variant="outline"
              onClick={() => setImportResumeModalOpen(true)}
              className="border-border hover:border-foreground/40 font-semibold gap-2 rounded-xl h-11 px-4 cursor-pointer"
            >
              <Layers className="h-4 w-4 text-muted-foreground" />
              Sync from Resume
            </Button>

            <div className="flex items-center gap-1.5 bg-card/60 border border-border p-1 rounded-xl shadow-xs">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleExportJson}
                title="Export Memory JSON"
                className="h-9 w-9 p-0 rounded-lg text-muted-foreground hover:text-foreground"
              >
                <Download className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                title="Import Memory JSON"
                className="h-9 w-9 p-0 rounded-lg text-muted-foreground hover:text-foreground"
              >
                <Upload className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={fetchFromServer}
                title="Refresh Cloud Sync"
                className="h-9 w-9 p-0 rounded-lg text-muted-foreground hover:text-foreground"
              >
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Completeness Bar */}
        <div className="mt-6 pt-5 border-t border-border/40 grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
          <div className="md:col-span-1 space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-foreground flex items-center gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                Completeness
              </span>
              <span className="font-black text-primary font-mono">{completenessScore}%</span>
            </div>
            <div className="w-full bg-muted/80 rounded-full h-2 overflow-hidden border border-border/40">
              <div
                className="bg-gradient-to-r from-primary to-emerald-500 h-full rounded-full transition-all duration-500"
                style={{ width: `${completenessScore}%` }}
              />
            </div>
          </div>

          <div className="md:col-span-3 flex flex-wrap items-center gap-2 sm:gap-3 text-xs text-muted-foreground justify-start md:justify-end">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-card/80 border border-border">
              <Briefcase className="h-3.5 w-3.5 text-primary" />
              <strong>{memory.experiences?.length || 0}</strong> Roles
            </span>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-card/80 border border-border">
              <Code2 className="h-3.5 w-3.5 text-primary" />
              <strong>{memory.skills?.length || 0}</strong> Skills
            </span>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-card/80 border border-border">
              <FolderGit2 className="h-3.5 w-3.5 text-primary" />
              <strong>{memory.projects?.length || 0}</strong> Projects
            </span>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-card/80 border border-border">
              <GraduationCap className="h-3.5 w-3.5 text-primary" />
              <strong>{memory.education?.length || 0}</strong> Education
            </span>
          </div>
        </div>
      </div>

      {/* MAIN VISUAL TABS */}
      <Tabs defaultValue="identity" value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="bg-muted/80 border border-border p-1.5 h-auto rounded-2xl flex flex-wrap gap-1 shadow-xs">
          <TabsTrigger
            value="identity"
            className="rounded-xl data-[state=active]:bg-background data-[state=active]:text-foreground font-bold text-xs gap-1.5 py-2.5 px-3.5 cursor-pointer"
          >
            <User className="h-3.5 w-3.5 text-primary" />
            Identity & Socials
          </TabsTrigger>
          <TabsTrigger
            value="experience"
            className="rounded-xl data-[state=active]:bg-background data-[state=active]:text-foreground font-bold text-xs gap-1.5 py-2.5 px-3.5 cursor-pointer"
          >
            <Briefcase className="h-3.5 w-3.5 text-primary" />
            Work ({memory.experiences?.length || 0})
          </TabsTrigger>
          <TabsTrigger
            value="education"
            className="rounded-xl data-[state=active]:bg-background data-[state=active]:text-foreground font-bold text-xs gap-1.5 py-2.5 px-3.5 cursor-pointer"
          >
            <GraduationCap className="h-3.5 w-3.5 text-primary" />
            Education ({memory.education?.length || 0})
          </TabsTrigger>
          <TabsTrigger
            value="skills"
            className="rounded-xl data-[state=active]:bg-background data-[state=active]:text-foreground font-bold text-xs gap-1.5 py-2.5 px-3.5 cursor-pointer"
          >
            <Code2 className="h-3.5 w-3.5 text-primary" />
            Skills ({memory.skills?.length || 0})
          </TabsTrigger>
          <TabsTrigger
            value="projects"
            className="rounded-xl data-[state=active]:bg-background data-[state=active]:text-foreground font-bold text-xs gap-1.5 py-2.5 px-3.5 cursor-pointer"
          >
            <FolderGit2 className="h-3.5 w-3.5 text-primary" />
            Projects ({memory.projects?.length || 0})
          </TabsTrigger>
          <TabsTrigger
            value="certifications"
            className="rounded-xl data-[state=active]:bg-background data-[state=active]:text-foreground font-bold text-xs gap-1.5 py-2.5 px-3.5 cursor-pointer"
          >
            <Award className="h-3.5 w-3.5 text-primary" />
            Certifications ({memory.certifications?.length || 0})
          </TabsTrigger>
          <TabsTrigger
            value="preferences"
            className="rounded-xl data-[state=active]:bg-background data-[state=active]:text-foreground font-bold text-xs gap-1.5 py-2.5 px-3.5 cursor-pointer"
          >
            <Sliders className="h-3.5 w-3.5 text-primary" />
            Preferences
          </TabsTrigger>
          <TabsTrigger
            value="json"
            className="rounded-xl data-[state=active]:bg-background data-[state=active]:text-foreground font-bold text-xs gap-1.5 py-2.5 px-3.5 cursor-pointer"
          >
            <FileJson className="h-3.5 w-3.5 text-muted-foreground" />
            Raw Memory
          </TabsTrigger>
        </TabsList>

        {/* 1. IDENTITY & SOCIALS TAB */}
        <TabsContent value="identity" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Basics Card */}
            <Card className="lg:col-span-2 border border-border/80 bg-card rounded-2xl shadow-xs overflow-hidden">
              <CardHeader className="flex flex-row items-center justify-between pb-4 border-b border-border/50">
                <div>
                  <CardTitle className="text-lg font-bold flex items-center gap-2">
                    <User className="h-4 w-4 text-primary" />
                    Personal & Contact Basics
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Primary candidate profile injected into all resumes, portfolios, and form-fillers.
                  </CardDescription>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setBasicsForm(memory.basics);
                    setBasicsModalOpen(true);
                  }}
                  className="rounded-xl font-bold gap-1.5 cursor-pointer"
                >
                  <Pencil className="h-3.5 w-3.5" />
                  Edit Basics
                </Button>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl border border-border/60 bg-muted/30 space-y-1">
                    <Label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                      Full Name
                    </Label>
                    <p className="text-base font-bold text-foreground">
                      {memory.basics?.full_name || "—"}
                    </p>
                  </div>

                  <div className="p-4 rounded-xl border border-border/60 bg-muted/30 space-y-1">
                    <Label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                      Professional Headline
                    </Label>
                    <p className="text-base font-bold text-foreground">
                      {memory.basics?.headline || "—"}
                    </p>
                  </div>

                  <div className="p-4 rounded-xl border border-border/60 bg-muted/30 space-y-1">
                    <Label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                      <Mail className="h-3 w-3" /> Email Address
                    </Label>
                    <p className="text-sm font-semibold text-foreground">
                      {memory.basics?.email || "—"}
                    </p>
                  </div>

                  <div className="p-4 rounded-xl border border-border/60 bg-muted/30 space-y-1">
                    <Label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                      <Phone className="h-3 w-3" /> Phone Number
                    </Label>
                    <p className="text-sm font-semibold text-foreground">
                      {memory.basics?.phone || "—"}
                    </p>
                  </div>

                  <div className="sm:col-span-2 p-4 rounded-xl border border-border/60 bg-muted/30 space-y-1">
                    <Label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                      <MapPin className="h-3 w-3" /> Primary Location & Work Eligibility
                    </Label>
                    <p className="text-sm font-medium text-foreground">
                      {memory.basics?.location || "—"}
                    </p>
                  </div>

                  <div className="sm:col-span-2 p-4 rounded-xl border border-border/60 bg-muted/30 space-y-1.5">
                    <Label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                      Executive Bio / Summary
                    </Label>
                    <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                      {memory.basics?.bio || "No summary written yet. Click Edit to add a powerful executive bio."}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Social & Web Footprint Card */}
            <Card className="border border-border/80 bg-card rounded-2xl shadow-xs overflow-hidden">
              <CardHeader className="flex flex-row items-center justify-between pb-4 border-b border-border/50">
                <div>
                  <CardTitle className="text-lg font-bold flex items-center gap-2">
                    <Share2 className="h-4 w-4 text-primary" />
                    Web & Social Handles
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Verified profiles and links
                  </CardDescription>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setSocialsForm(memory.socials);
                    setSocialsModalOpen(true);
                  }}
                  className="rounded-xl font-bold gap-1.5 cursor-pointer"
                >
                  <Pencil className="h-3.5 w-3.5" />
                  Edit
                </Button>
              </CardHeader>
              <CardContent className="p-6 space-y-3">
                {memory.socials?.linkedin ? (
                  <a
                    href={memory.socials.linkedin.startsWith("http") ? memory.socials.linkedin : `https://${memory.socials.linkedin}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-3 rounded-xl border border-blue-500/25 bg-blue-500/5 hover:bg-blue-500/10 flex items-center justify-between transition-all group"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <Linkedin className="h-5 w-5 text-blue-600 dark:text-blue-400 shrink-0" />
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-foreground">LinkedIn</p>
                        <p className="text-[11px] text-muted-foreground truncate">{memory.socials.linkedin}</p>
                      </div>
                    </div>
                    <ExternalLink className="h-3.5 w-3.5 text-muted-foreground group-hover:text-blue-500 transition-colors shrink-0" />
                  </a>
                ) : (
                  <div className="p-3 rounded-xl border border-dashed border-border/60 text-xs text-muted-foreground flex items-center gap-2">
                    <Linkedin className="h-4 w-4 opacity-40" />
                    LinkedIn profile not connected
                  </div>
                )}

                {memory.socials?.github ? (
                  <a
                    href={memory.socials.github.startsWith("http") ? memory.socials.github : `https://${memory.socials.github}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-3 rounded-xl border border-foreground/20 bg-muted/40 hover:bg-muted/70 flex items-center justify-between transition-all group"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <Github className="h-5 w-5 text-foreground shrink-0" />
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-foreground">GitHub</p>
                        <p className="text-[11px] text-muted-foreground truncate">{memory.socials.github}</p>
                      </div>
                    </div>
                    <ExternalLink className="h-3.5 w-3.5 text-muted-foreground group-hover:text-foreground transition-colors shrink-0" />
                  </a>
                ) : (
                  <div className="p-3 rounded-xl border border-dashed border-border/60 text-xs text-muted-foreground flex items-center gap-2">
                    <Github className="h-4 w-4 opacity-40" />
                    GitHub profile not connected
                  </div>
                )}

                {memory.socials?.portfolio ? (
                  <a
                    href={memory.socials.portfolio.startsWith("http") ? memory.socials.portfolio : `https://${memory.socials.portfolio}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-3 rounded-xl border border-emerald-500/25 bg-emerald-500/5 hover:bg-emerald-500/10 flex items-center justify-between transition-all group"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <Globe className="h-5 w-5 text-emerald-500 shrink-0" />
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-foreground">Portfolio / Website</p>
                        <p className="text-[11px] text-muted-foreground truncate">{memory.socials.portfolio}</p>
                      </div>
                    </div>
                    <ExternalLink className="h-3.5 w-3.5 text-muted-foreground group-hover:text-emerald-500 transition-colors shrink-0" />
                  </a>
                ) : (
                  <div className="p-3 rounded-xl border border-dashed border-border/60 text-xs text-muted-foreground flex items-center gap-2">
                    <Globe className="h-4 w-4 opacity-40" />
                    Personal website not set
                  </div>
                )}

                {memory.socials?.twitter && (
                  <div className="p-3 rounded-xl border border-border bg-card/40 flex items-center justify-between">
                    <div className="flex items-center gap-3 min-w-0">
                      <Twitter className="h-4 w-4 text-sky-500 shrink-0" />
                      <p className="text-xs font-semibold text-foreground truncate">{memory.socials.twitter}</p>
                    </div>
                  </div>
                )}

                {memory.socials?.discord && (
                  <div className="p-3 rounded-xl border border-border bg-card/40 flex items-center justify-between">
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="text-xs font-black text-indigo-500 shrink-0 font-mono">#</span>
                      <p className="text-xs font-semibold text-foreground truncate">{memory.socials.discord}</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* 2. WORK EXPERIENCE TAB */}
        <TabsContent value="experience" className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-foreground">Professional Work Experience</h3>
              <p className="text-xs text-muted-foreground">
                Your full career timeline stored in memory for resume generation and tailored applications.
              </p>
            </div>
            <Button onClick={openAddExp} className="rounded-xl font-bold gap-2 cursor-pointer">
              <Plus className="h-4 w-4" /> Add Experience
            </Button>
          </div>

          {memory.experiences?.length === 0 ? (
            <div className="p-12 text-center rounded-2xl border border-dashed border-border/80 bg-muted/20 space-y-3">
              <Briefcase className="h-8 w-8 text-muted-foreground mx-auto opacity-50" />
              <p className="text-sm font-semibold text-foreground">No work experience in Memory yet</p>
              <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                Add your career roles manually or click "Sync from Resume" to automatically harvest your past jobs.
              </p>
              <Button onClick={openAddExp} variant="outline" size="sm" className="rounded-xl">
                Add First Role
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {memory.experiences.map((exp) => (
                <div
                  key={exp.id}
                  className="p-6 rounded-2xl border border-border/80 bg-card hover:border-primary/40 transition-all shadow-xs space-y-3 group relative"
                >
                  <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-base font-bold text-foreground">{exp.position}</h4>
                        {exp.is_current && (
                          <Badge className="bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 text-[10px] font-bold">
                            Current
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs font-semibold text-primary">{exp.company} {exp.location ? `• ${exp.location}` : ""}</p>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono text-muted-foreground">
                        {exp.start_date} – {exp.end_date || (exp.is_current ? "Present" : "")}
                      </span>
                      <div className="flex items-center gap-1 opacity-90 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => openEditExp(exp)}
                          className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            deleteExperience(exp.id);
                            toast.success("Role removed from memory");
                          }}
                          className="h-8 w-8 p-0 text-rose-500 hover:text-rose-600"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                  </div>

                  {exp.description && (
                    <p className="text-xs text-muted-foreground leading-relaxed">{exp.description}</p>
                  )}

                  {exp.highlights && exp.highlights.length > 0 && (
                    <ul className="list-disc list-inside text-xs text-foreground/85 space-y-1 pt-1 leading-relaxed">
                      {exp.highlights.map((h, i) => (
                        <li key={i}>{h}</li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          )}
        </TabsContent>

        {/* 3. EDUCATION TAB */}
        <TabsContent value="education" className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-foreground">Education & Degrees</h3>
              <p className="text-xs text-muted-foreground">
                Degrees, universities, honors, and academic achievements.
              </p>
            </div>
            <Button onClick={openAddEdu} className="rounded-xl font-bold gap-2 cursor-pointer">
              <Plus className="h-4 w-4" /> Add Education
            </Button>
          </div>

          {memory.education?.length === 0 ? (
            <div className="p-12 text-center rounded-2xl border border-dashed border-border/80 bg-muted/20 space-y-3">
              <GraduationCap className="h-8 w-8 text-muted-foreground mx-auto opacity-50" />
              <p className="text-sm font-semibold text-foreground">No academic records in Memory</p>
              <Button onClick={openAddEdu} variant="outline" size="sm" className="rounded-xl">
                Add Education
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {memory.education.map((edu) => (
                <div
                  key={edu.id}
                  className="p-5 rounded-2xl border border-border/80 bg-card hover:border-primary/40 transition-all shadow-xs space-y-2 group"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h4 className="text-sm font-bold text-foreground">{edu.degree}</h4>
                      <p className="text-xs font-semibold text-primary">{edu.institution}</p>
                    </div>
                    <div className="flex items-center gap-1 opacity-90 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => openEditEdu(edu)}
                        className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground"
                      >
                        <Pencil className="h-3 w-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          deleteEducation(edu.id);
                          toast.success("Education record removed");
                        }}
                        className="h-7 w-7 p-0 text-rose-500 hover:text-rose-600"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>

                  <p className="text-xs text-muted-foreground">
                    {edu.field_of_study} {edu.location ? `• ${edu.location}` : ""}
                  </p>

                  <div className="flex items-center justify-between text-[11px] font-mono text-muted-foreground pt-1">
                    <span>{edu.start_date} – {edu.end_date}</span>
                    {edu.gpa && <span className="font-semibold text-foreground">GPA: {edu.gpa}</span>}
                  </div>

                  {edu.honors && (
                    <p className="text-xs font-medium text-emerald-600 dark:text-emerald-400 pt-1">
                      {edu.honors}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </TabsContent>

        {/* 4. SKILLS TAB */}
        <TabsContent value="skills" className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-foreground">Skills & Technical Competencies</h3>
              <p className="text-xs text-muted-foreground">
                Categorized skill matrix with proficiency ratings stored for automatic ATS tailoring.
              </p>
            </div>
            <Button onClick={openAddSkill} className="rounded-xl font-bold gap-2 cursor-pointer">
              <Plus className="h-4 w-4" /> Add Skill
            </Button>
          </div>

          {memory.skills?.length === 0 ? (
            <div className="p-12 text-center rounded-2xl border border-dashed border-border/80 bg-muted/20 space-y-3">
              <Code2 className="h-8 w-8 text-muted-foreground mx-auto opacity-50" />
              <p className="text-sm font-semibold text-foreground">No skills defined in Memory</p>
              <Button onClick={openAddSkill} variant="outline" size="sm" className="rounded-xl">
                Add First Skill
              </Button>
            </div>
          ) : (
            <div className="p-6 rounded-2xl border border-border/80 bg-card shadow-xs space-y-6">
              <div className="flex flex-wrap gap-2.5">
                {memory.skills.map((skill) => (
                  <div
                    key={skill.id}
                    className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-primary/25 bg-primary/5 hover:bg-primary/10 transition-all text-xs group"
                  >
                    <span className="font-bold text-foreground">{skill.name}</span>
                    <span className="text-[10px] px-1.5 py-0.2 rounded-md bg-primary/15 text-primary font-mono font-bold">
                      {skill.category}
                    </span>
                    <div className="flex items-center gap-0.5 text-primary">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <span
                          key={i}
                          className={cn(
                            "h-1.5 w-1.5 rounded-full",
                            i < (skill.proficiency || 4) ? "bg-primary" : "bg-muted-foreground/30"
                          )}
                        />
                      ))}
                    </div>
                    <button
                      type="button"
                      onClick={() => openEditSkill(skill)}
                      className="opacity-0 group-hover:opacity-100 hover:text-primary transition-opacity"
                    >
                      <Pencil className="h-3 w-3" />
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        deleteSkill(skill.id);
                        toast.success("Skill removed");
                      }}
                      className="opacity-0 group-hover:opacity-100 hover:text-rose-500 transition-opacity"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </TabsContent>

        {/* 5. PROJECTS TAB */}
        <TabsContent value="projects" className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-foreground">Featured Projects & Deliverables</h3>
              <p className="text-xs text-muted-foreground">
                Open-source work, client platforms, and enterprise solutions stored with demo & repo links.
              </p>
            </div>
            <Button onClick={openAddProject} className="rounded-xl font-bold gap-2 cursor-pointer">
              <Plus className="h-4 w-4" /> Add Project
            </Button>
          </div>

          {memory.projects?.length === 0 ? (
            <div className="p-12 text-center rounded-2xl border border-dashed border-border/80 bg-muted/20 space-y-3">
              <FolderGit2 className="h-8 w-8 text-muted-foreground mx-auto opacity-50" />
              <p className="text-sm font-semibold text-foreground">No projects in Memory</p>
              <Button onClick={openAddProject} variant="outline" size="sm" className="rounded-xl">
                Add Project
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {memory.projects.map((proj) => (
                <div
                  key={proj.id}
                  className="p-5 rounded-2xl border border-border/80 bg-card hover:border-primary/40 transition-all shadow-xs space-y-3 group"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h4 className="text-base font-bold text-foreground">{proj.name}</h4>
                      <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed mt-0.5">
                        {proj.description}
                      </p>
                    </div>
                    <div className="flex items-center gap-1 opacity-90 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => openEditProject(proj)}
                        className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground"
                      >
                        <Pencil className="h-3 w-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          deleteProject(proj.id);
                          toast.success("Project removed");
                        }}
                        className="h-7 w-7 p-0 text-rose-500 hover:text-rose-600"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>

                  {proj.technologies && proj.technologies.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {proj.technologies.map((t, idx) => (
                        <span
                          key={idx}
                          className="text-[10px] px-2 py-0.5 rounded-md font-mono font-semibold bg-primary/10 text-primary border border-primary/20"
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="flex items-center gap-3 pt-2 text-xs">
                    {proj.url && (
                      <a
                        href={proj.url.startsWith("http") ? proj.url : `https://${proj.url}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-primary hover:underline font-semibold"
                      >
                        <ExternalLink className="h-3 w-3" /> Live Demo
                      </a>
                    )}
                    {proj.github_url && (
                      <a
                        href={proj.github_url.startsWith("http") ? proj.github_url : `https://${proj.github_url}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-muted-foreground hover:text-foreground font-semibold"
                      >
                        <Github className="h-3 w-3" /> Repository
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </TabsContent>

        {/* 6. CERTIFICATIONS TAB */}
        <TabsContent value="certifications" className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-foreground">Certifications & Licenses</h3>
              <p className="text-xs text-muted-foreground">
                Professional accreditation and cryptographic credentials.
              </p>
            </div>
            <Button onClick={openAddCert} className="rounded-xl font-bold gap-2 cursor-pointer">
              <Plus className="h-4 w-4" /> Add Certification
            </Button>
          </div>

          {memory.certifications?.length === 0 ? (
            <div className="p-12 text-center rounded-2xl border border-dashed border-border/80 bg-muted/20 space-y-3">
              <Award className="h-8 w-8 text-muted-foreground mx-auto opacity-50" />
              <p className="text-sm font-semibold text-foreground">No certifications in Memory</p>
              <Button onClick={openAddCert} variant="outline" size="sm" className="rounded-xl">
                Add Certification
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {memory.certifications.map((cert) => (
                <div
                  key={cert.id}
                  className="p-5 rounded-2xl border border-border/80 bg-card hover:border-primary/40 transition-all shadow-xs space-y-2 group"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h4 className="text-sm font-bold text-foreground">{cert.name}</h4>
                      <p className="text-xs font-semibold text-primary">{cert.issuer}</p>
                    </div>
                    <div className="flex items-center gap-1 opacity-90 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => openEditCert(cert)}
                        className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground"
                      >
                        <Pencil className="h-3 w-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          deleteCertification(cert.id);
                          toast.success("Certification removed");
                        }}
                        className="h-7 w-7 p-0 text-rose-500 hover:text-rose-600"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs text-muted-foreground font-mono pt-1">
                    <span>Issued: {cert.issue_date}</span>
                    {cert.expiry_date && <span>Expires: {cert.expiry_date}</span>}
                  </div>

                  {cert.credential_id && (
                    <p className="text-[11px] font-mono text-muted-foreground">
                      ID: {cert.credential_id}
                    </p>
                  )}

                  {cert.credential_url && (
                    <a
                      href={cert.credential_url.startsWith("http") ? cert.credential_url : `https://${cert.credential_url}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs text-primary hover:underline font-semibold pt-1"
                    >
                      <ExternalLink className="h-3 w-3" /> Verify Credential
                    </a>
                  )}
                </div>
              ))}
            </div>
          )}
        </TabsContent>

        {/* 7. CAREER PREFERENCES TAB */}
        <TabsContent value="preferences" className="space-y-6">
          <Card className="border border-border/80 bg-card rounded-2xl shadow-xs">
            <CardHeader>
              <CardTitle className="text-lg font-bold flex items-center gap-2">
                <Sliders className="h-4 w-4 text-primary" />
                Target Career & Work Preferences
              </CardTitle>
              <CardDescription className="text-xs">
                Injected into autonomous job dispatchers, swarm agents, and salary simulators.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-xs font-bold">Preferred Work Style</Label>
                  <select
                    className="w-full h-11 px-3 rounded-xl border border-input bg-background text-sm font-medium"
                    value={memory.preferences?.work_style || "remote"}
                    onChange={(e) =>
                      updatePreferences({ work_style: e.target.value as any })
                    }
                  >
                    <option value="remote">Fully Remote</option>
                    <option value="hybrid">Hybrid (1-2 days in office)</option>
                    <option value="onsite">On-site</option>
                    <option value="flexible">Flexible / Any</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <Label className="text-xs font-bold">Target Compensation (Annual)</Label>
                  <Input
                    placeholder="e.g. $160,000 - $200,000 USD"
                    value={memory.preferences?.target_salary || ""}
                    onChange={(e) => updatePreferences({ target_salary: e.target.value })}
                    className="h-11 rounded-xl"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-xs font-bold">Notice Period</Label>
                  <Input
                    placeholder="e.g. Immediate / 2 Weeks"
                    value={memory.preferences?.notice_period || ""}
                    onChange={(e) => updatePreferences({ notice_period: e.target.value })}
                    className="h-11 rounded-xl"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-xs font-bold">Target Roles (comma separated)</Label>
                  <Input
                    placeholder="Staff Engineer, Principal Architect"
                    value={(memory.preferences?.target_roles || []).join(", ")}
                    onChange={(e) =>
                      updatePreferences({
                        target_roles: e.target.value.split(",").map((s) => s.trim()).filter(Boolean),
                      })
                    }
                    className="h-11 rounded-xl"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 8. RAW JSON TAB */}
        <TabsContent value="json" className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-xs text-muted-foreground">
              Direct JSON representation of your Memory for backup, programmatic integration, or manual export.
            </p>
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  navigator.clipboard.writeText(JSON.stringify(memory, null, 2));
                  toast.success("JSON copied to clipboard!");
                }}
                className="rounded-xl gap-1.5"
              >
                <Copy className="h-3.5 w-3.5" /> Copy JSON
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={loadSampleMemory}
                className="rounded-xl text-xs gap-1.5"
              >
                <Sparkles className="h-3.5 w-3.5 text-primary" /> Load Sample Data
              </Button>
              <Button
                size="sm"
                variant="destructive"
                onClick={() => {
                  if (confirm("Are you sure you want to clear your Career Memory?")) {
                    clearMemory();
                    toast.success("Memory cleared");
                  }
                }}
                className="rounded-xl gap-1.5"
              >
                <Trash2 className="h-3.5 w-3.5" /> Clear Memory
              </Button>
            </div>
          </div>
          <div className="p-4 rounded-2xl bg-zinc-950 text-zinc-100 border border-zinc-800 font-mono text-xs max-h-[500px] overflow-auto">
            <pre>{JSON.stringify(memory, null, 2)}</pre>
          </div>
        </TabsContent>
      </Tabs>

      {/* DIALOG: EDIT BASICS */}
      <Dialog open={basicsModalOpen} onOpenChange={setBasicsModalOpen}>
        <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Profile Basics</DialogTitle>
            <DialogDescription>
              Update core identification details stored in your Career Memory.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-bold">Full Name</Label>
                <Input
                  value={basicsForm.full_name}
                  onChange={(e) => setBasicsForm({ ...basicsForm, full_name: e.target.value })}
                  placeholder="e.g. Alex Mercer"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-bold">Professional Headline</Label>
                <Input
                  value={basicsForm.headline}
                  onChange={(e) => setBasicsForm({ ...basicsForm, headline: e.target.value })}
                  placeholder="e.g. Senior Full-Stack Engineer"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-bold">Email</Label>
                <Input
                  value={basicsForm.email}
                  onChange={(e) => setBasicsForm({ ...basicsForm, email: e.target.value })}
                  placeholder="alex@example.com"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-bold">Phone</Label>
                <Input
                  value={basicsForm.phone}
                  onChange={(e) => setBasicsForm({ ...basicsForm, phone: e.target.value })}
                  placeholder="+1 (555) 000-0000"
                />
              </div>
              <div className="sm:col-span-2 space-y-1.5">
                <Label className="text-xs font-bold">Location</Label>
                <Input
                  value={basicsForm.location}
                  onChange={(e) => setBasicsForm({ ...basicsForm, location: e.target.value })}
                  placeholder="City, State / Remote"
                />
              </div>
              <div className="sm:col-span-2 space-y-1.5">
                <Label className="text-xs font-bold">Bio / Summary</Label>
                <Textarea
                  rows={4}
                  value={basicsForm.bio}
                  onChange={(e) => setBasicsForm({ ...basicsForm, bio: e.target.value })}
                  placeholder="Highlight your key achievements and core competencies..."
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setBasicsModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveBasics}>Save Basics</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* DIALOG: EDIT SOCIALS */}
      <Dialog open={socialsModalOpen} onOpenChange={setSocialsModalOpen}>
        <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Social & Web Links</DialogTitle>
            <DialogDescription>
              Connect your online footprint to your career memory.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-3">
            <div className="space-y-1.5">
              <Label className="text-xs font-bold flex items-center gap-1.5">
                <Linkedin className="h-3.5 w-3.5 text-blue-500" /> LinkedIn Profile
              </Label>
              <Input
                value={socialsForm.linkedin || ""}
                onChange={(e) => setSocialsForm({ ...socialsForm, linkedin: e.target.value })}
                placeholder="https://linkedin.com/in/username"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-bold flex items-center gap-1.5">
                <Github className="h-3.5 w-3.5" /> GitHub Profile
              </Label>
              <Input
                value={socialsForm.github || ""}
                onChange={(e) => setSocialsForm({ ...socialsForm, github: e.target.value })}
                placeholder="https://github.com/username"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-bold flex items-center gap-1.5">
                <Globe className="h-3.5 w-3.5 text-emerald-500" /> Portfolio / Website
              </Label>
              <Input
                value={socialsForm.portfolio || ""}
                onChange={(e) => setSocialsForm({ ...socialsForm, portfolio: e.target.value })}
                placeholder="https://mywebsite.com"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-bold flex items-center gap-1.5">
                <Twitter className="h-3.5 w-3.5 text-sky-500" /> Twitter / X
              </Label>
              <Input
                value={socialsForm.twitter || ""}
                onChange={(e) => setSocialsForm({ ...socialsForm, twitter: e.target.value })}
                placeholder="https://x.com/handle"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-bold">Discord Handle</Label>
              <Input
                value={socialsForm.discord || ""}
                onChange={(e) => setSocialsForm({ ...socialsForm, discord: e.target.value })}
                placeholder="username#0000"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSocialsModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveSocials}>Save Links</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* DIALOG: ADD/EDIT EXPERIENCE */}
      <Dialog open={expModalOpen} onOpenChange={setExpModalOpen}>
        <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingExp ? "Edit Experience" : "Add Work Experience"}</DialogTitle>
            <DialogDescription>
              Record role milestones and responsibilities in your career memory.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-bold">Position / Title *</Label>
                <Input
                  value={expForm.position}
                  onChange={(e) => setExpForm({ ...expForm, position: e.target.value })}
                  placeholder="e.g. Senior Software Engineer"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-bold">Company Name *</Label>
                <Input
                  value={expForm.company}
                  onChange={(e) => setExpForm({ ...expForm, company: e.target.value })}
                  placeholder="e.g. Acme Tech"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-bold">Start Date</Label>
                <Input
                  value={expForm.start_date}
                  onChange={(e) => setExpForm({ ...expForm, start_date: e.target.value })}
                  placeholder="e.g. 2022-01"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-bold">End Date</Label>
                <Input
                  value={expForm.end_date}
                  disabled={expForm.is_current}
                  onChange={(e) => setExpForm({ ...expForm, end_date: e.target.value })}
                  placeholder={expForm.is_current ? "Present" : "e.g. 2024-05"}
                />
              </div>
              <div className="sm:col-span-2 flex items-center gap-2">
                <input
                  type="checkbox"
                  id="is_current"
                  checked={expForm.is_current}
                  onChange={(e) => setExpForm({ ...expForm, is_current: e.target.checked })}
                  className="rounded"
                />
                <Label htmlFor="is_current" className="text-xs font-semibold cursor-pointer">
                  I currently work here
                </Label>
              </div>
              <div className="sm:col-span-2 space-y-1.5">
                <Label className="text-xs font-bold">Role Summary</Label>
                <Textarea
                  rows={2}
                  value={expForm.description}
                  onChange={(e) => setExpForm({ ...expForm, description: e.target.value })}
                  placeholder="Overview of scope and team responsibilities..."
                />
              </div>
              <div className="sm:col-span-2 space-y-1.5">
                <Label className="text-xs font-bold">Key Highlights & Bullet Points (one per line)</Label>
                <Textarea
                  rows={4}
                  value={expHighlightsText}
                  onChange={(e) => setExpHighlightsText(e.target.value)}
                  placeholder="• Architected microservices with 99.99% uptime&#10;• Reduced latency by 40%"
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setExpModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveExp}>Save Role</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* DIALOG: ADD/EDIT EDUCATION */}
      <Dialog open={eduModalOpen} onOpenChange={setEduModalOpen}>
        <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingEdu ? "Edit Education" : "Add Education"}</DialogTitle>
            <DialogDescription>
              Academic credential stored in your career memory.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5 sm:col-span-2">
                <Label className="text-xs font-bold">Institution / University *</Label>
                <Input
                  value={eduForm.institution}
                  onChange={(e) => setEduForm({ ...eduForm, institution: e.target.value })}
                  placeholder="e.g. Stanford University"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-bold">Degree *</Label>
                <Input
                  value={eduForm.degree}
                  onChange={(e) => setEduForm({ ...eduForm, degree: e.target.value })}
                  placeholder="e.g. B.S. in Computer Science"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-bold">Field of Study</Label>
                <Input
                  value={eduForm.field_of_study}
                  onChange={(e) => setEduForm({ ...eduForm, field_of_study: e.target.value })}
                  placeholder="e.g. Artificial Intelligence"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-bold">Graduation Year / Period</Label>
                <Input
                  value={eduForm.end_date}
                  onChange={(e) => setEduForm({ ...eduForm, end_date: e.target.value })}
                  placeholder="e.g. 2022"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-bold">GPA</Label>
                <Input
                  value={eduForm.gpa}
                  onChange={(e) => setEduForm({ ...eduForm, gpa: e.target.value })}
                  placeholder="e.g. 3.9 / 4.0"
                />
              </div>
              <div className="sm:col-span-2 space-y-1.5">
                <Label className="text-xs font-bold">Honors & Awards</Label>
                <Input
                  value={eduForm.honors}
                  onChange={(e) => setEduForm({ ...eduForm, honors: e.target.value })}
                  placeholder="e.g. Magna Cum Laude • Dean's List"
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEduModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveEdu}>Save Education</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* DIALOG: ADD/EDIT SKILL */}
      <Dialog open={skillModalOpen} onOpenChange={setSkillModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editingSkill ? "Edit Skill" : "Add Skill"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-3">
            <div className="space-y-1.5">
              <Label className="text-xs font-bold">Skill Name *</Label>
              <Input
                value={skillForm.name}
                onChange={(e) => setSkillForm({ ...skillForm, name: e.target.value })}
                placeholder="e.g. TypeScript / Docker"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-bold">Category</Label>
              <select
                className="w-full h-11 px-3 rounded-xl border border-input bg-background text-sm"
                value={skillForm.category}
                onChange={(e) => setSkillForm({ ...skillForm, category: e.target.value as any })}
              >
                <option value="Languages">Languages</option>
                <option value="Frameworks">Frameworks</option>
                <option value="Backend">Backend</option>
                <option value="Cloud & DevOps">Cloud & DevOps</option>
                <option value="Tools & Databases">Tools & Databases</option>
                <option value="Soft Skills">Soft Skills</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-bold">Proficiency (1-5)</Label>
              <div className="flex items-center gap-2 pt-1">
                {[1, 2, 3, 4, 5].map((lvl) => (
                  <button
                    key={lvl}
                    type="button"
                    onClick={() => setSkillForm({ ...skillForm, proficiency: lvl })}
                    className={cn(
                      "h-9 w-9 rounded-xl font-bold text-xs border transition-all cursor-pointer",
                      skillForm.proficiency === lvl
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-muted/60 text-muted-foreground hover:bg-muted"
                    )}
                  >
                    {lvl}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSkillModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveSkill}>Save Skill</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* DIALOG: ADD/EDIT PROJECT */}
      <Dialog open={projectModalOpen} onOpenChange={setProjectModalOpen}>
        <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingProject ? "Edit Project" : "Add Project"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-3">
            <div className="space-y-1.5">
              <Label className="text-xs font-bold">Project Name *</Label>
              <Input
                value={projectForm.name}
                onChange={(e) => setProjectForm({ ...projectForm, name: e.target.value })}
                placeholder="e.g. EduSphere AI Platform"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-bold">Description</Label>
              <Textarea
                rows={3}
                value={projectForm.description}
                onChange={(e) => setProjectForm({ ...projectForm, description: e.target.value })}
                placeholder="Describe problem solved, impact, and scale..."
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-bold">Tech Stack (comma separated)</Label>
              <Input
                value={projTechText}
                onChange={(e) => setProjTechText(e.target.value)}
                placeholder="Next.js, TypeScript, Supabase, TailwindCSS"
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-bold">Live Demo URL</Label>
                <Input
                  value={projectForm.url}
                  onChange={(e) => setProjectForm({ ...projectForm, url: e.target.value })}
                  placeholder="https://myproject.com"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-bold">GitHub Repository</Label>
                <Input
                  value={projectForm.github_url}
                  onChange={(e) => setProjectForm({ ...projectForm, github_url: e.target.value })}
                  placeholder="https://github.com/user/repo"
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setProjectModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveProject}>Save Project</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* DIALOG: ADD/EDIT CERTIFICATION */}
      <Dialog open={certModalOpen} onOpenChange={setCertModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editingCert ? "Edit Certification" : "Add Certification"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-3">
            <div className="space-y-1.5">
              <Label className="text-xs font-bold">Certification Name *</Label>
              <Input
                value={certForm.name}
                onChange={(e) => setCertForm({ ...certForm, name: e.target.value })}
                placeholder="e.g. AWS Solutions Architect"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-bold">Issuing Organization</Label>
              <Input
                value={certForm.issuer}
                onChange={(e) => setCertForm({ ...certForm, issuer: e.target.value })}
                placeholder="e.g. Amazon Web Services"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-bold">Issue Date</Label>
                <Input
                  value={certForm.issue_date}
                  onChange={(e) => setCertForm({ ...certForm, issue_date: e.target.value })}
                  placeholder="2024-05"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-bold">Expiry Date</Label>
                <Input
                  value={certForm.expiry_date}
                  onChange={(e) => setCertForm({ ...certForm, expiry_date: e.target.value })}
                  placeholder="2027-05"
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-bold">Credential URL</Label>
              <Input
                value={certForm.credential_url}
                onChange={(e) => setCertForm({ ...certForm, credential_url: e.target.value })}
                placeholder="https://verify.cert.com/id"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCertModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveCert}>Save Certification</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* DIALOG: SYNC / INGEST FROM RESUME */}
      <Dialog open={importResumeModalOpen} onOpenChange={setImportResumeModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Layers className="h-5 w-5 text-primary" />
              Harvest into Career Memory
            </DialogTitle>
            <DialogDescription>
              Select any existing resume to automatically parse and merge its contact details, roles, skills, and projects into your User Memory.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-3">
            {userResumes.length === 0 ? (
              <p className="text-xs text-muted-foreground p-3 border border-dashed rounded-xl">
                No saved resumes found. Create or upload a resume first to extract into memory.
              </p>
            ) : (
              <div className="space-y-2">
                <Label className="text-xs font-bold">Choose Source Resume</Label>
                <select
                  className="w-full h-11 px-3 rounded-xl border border-input bg-background text-sm font-medium"
                  value={selectedResumeId}
                  onChange={(e) => setSelectedResumeId(e.target.value)}
                >
                  <option value="">-- Select a resume --</option>
                  {userResumes.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.title}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setImportResumeModalOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleExtractFromResume}
              disabled={!selectedResumeId || isExtractingResume}
              className="gap-2"
            >
              {isExtractingResume && <RefreshCw className="h-4 w-4 animate-spin" />}
              Extract & Update Memory
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
