"use client";

import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  FileText,
  MoreVertical,
  Edit,
  Copy,
  Trash2,
  Plus,
  Upload,
  Star,
  Pencil,
  Eye,
  Archive,
  FileDown
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { exportToDocx } from "@/lib/export/docx-export";

interface Resume {
  id: string;
  title: string;
  template_id: string | null;
  is_primary: boolean;
  view_count: number;
  is_archived: boolean;
  created_at: string;
  updated_at: string;
}

interface ResumeListProps {
  resumes: Resume[];
}

export function ResumeList({ resumes }: ResumeListProps) {
  const router = useRouter();
  const [renameId, setRenameId] = useState<string | null>(null);
  const [newTitle, setNewTitle] = useState("");
  const [isRenaming, setIsRenaming] = useState(false);

  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const [archiveId, setArchiveId] = useState<string | null>(null);
  const [isArchiveDialogOpen, setIsArchiveDialogOpen] = useState(false);

  const handleSetPrimary = async (id: string, currentPrimary: boolean) => {
    if (currentPrimary) return;

    const supabase = createClient();

    // Unset all
    await supabase.from("resumes").update({ is_primary: false }).eq("is_primary", true);

    // Set new primary
    const { error } = await supabase.from("resumes").update({ is_primary: true }).eq("id", id);

    if (error) {
      toast.error("Failed to set primary resume");
      return;
    }

    toast.success("Primary resume updated");
    router.refresh();
  };

  const startRename = (resume: Resume) => {
    setRenameId(resume.id);
    setNewTitle(resume.title);
  };

  const handleRename = async () => {
    if (!renameId || !newTitle.trim()) return;

    setIsRenaming(true);
    const supabase = createClient();
    const { error } = await supabase
      .from("resumes")
      .update({ title: newTitle.trim(), updated_at: new Date().toISOString() })
      .eq("id", renameId);

    setIsRenaming(false);

    if (error) {
      toast.error("Failed to rename resume");
      return;
    }

    toast.success("Resume renamed");
    setRenameId(null);
    router.refresh();
  };

  const handleDelete = async () => {
    if (!deleteId) return;

    const supabase = createClient();
    const { error } = await supabase.from("resumes").delete().eq("id", deleteId);

    setIsDeleteDialogOpen(false);
    setDeleteId(null);

    if (error) {
      toast.error("Failed to delete resume");
      return;
    }

    toast.success("Resume deleted");
    router.refresh();
  };

  const handleArchive = async () => {
    if (!archiveId) return;

    const supabase = createClient();
    const { error } = await supabase
      .from("resumes")
      .update({ is_archived: true, updated_at: new Date().toISOString() })
      .eq("id", archiveId);

    setIsArchiveDialogOpen(false);
    setArchiveId(null);

    if (error) {
      toast.error("Failed to archive resume");
      return;
    }

    toast.success("Resume archived");
    router.refresh();
  };

  const handleDuplicate = async (resume: Resume) => {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    const loadingToast = toast.loading("Duplicating resume...");

    try {
      const { data: newResume, error: resumeError } = await supabase
        .from("resumes")
        .insert({
          user_id: user.id,
          title: `${resume.title} (Copy)`,
          template_id: resume.template_id,
          is_primary: false,
          is_public: false,
        })
        .select()
        .single();

      if (resumeError || !newResume) throw new Error("Failed to create resume copy");

      const tables = [
        "personal_info",
        "work_experiences",
        "education",
        "skills",
        "projects",
        "certifications",
        "languages",
      ];

      for (const table of tables) {
        const { data: sourceData, error: fetchError } = await supabase
          .from(table)
          .select("*")
          .eq("resume_id", resume.id);

        if (fetchError) {
          console.error(`Error fetching from ${table}:`, fetchError);
          continue;
        }

        if (sourceData && sourceData.length > 0) {
          const dataToInsert = sourceData.map((item: any) => {
            const { id, created_at, updated_at, ...rest } = item;
            return {
              ...rest,
              resume_id: newResume.id,
            };
          });

          const { error: insertError } = await supabase.from(table).insert(dataToInsert);
          if (insertError) {
            console.error(`Error inserting into ${table}:`, insertError);
          }
        }
      }

      toast.success("Resume duplicated successfully", { id: loadingToast });
      router.refresh();
    } catch (error) {
      console.error("Duplication failed:", error);
      toast.error("Failed to duplicate resume", { id: loadingToast });
    }
  };

  const handleDownloadWord = async (resume: Resume) => {
    const supabase = createClient();
    const loadingToast = toast.loading("Preparing Word document...");
    try {
      const [
        { data: profile },
        { data: workExperiences },
        { data: education },
        { data: skills },
        { data: projects },
        { data: certifications },
        { data: languages },
        { data: personalInfo },
      ] = await Promise.all([
        supabase.from("profiles").select("*").single(),
        supabase.from("work_experiences").select("*").eq("resume_id", resume.id).order("sort_order"),
        supabase.from("education").select("*").eq("resume_id", resume.id).order("sort_order"),
        supabase.from("skills").select("*").eq("resume_id", resume.id).order("sort_order"),
        supabase.from("projects").select("*").eq("resume_id", resume.id).order("sort_order"),
        supabase.from("certifications").select("*").eq("resume_id", resume.id).order("sort_order"),
        supabase.from("languages").select("*").eq("resume_id", resume.id).order("sort_order"),
        supabase.from("personal_info").select("*").eq("resume_id", resume.id).single(),
      ]);

      const mergedProfile = {
        ...profile,
        phone: personalInfo?.phone || profile?.phone,
        location: personalInfo?.location || profile?.location,
        linkedin_url: personalInfo?.linkedin || profile?.linkedin_url,
        website_url: personalInfo?.website || profile?.website_url,
        github_url: personalInfo?.github || profile?.github_url,
        summary: personalInfo?.summary || profile?.summary,
      };

      await exportToDocx({
        profile: mergedProfile,
        workExperiences: workExperiences || [],
        education: education || [],
        skills: skills || [],
        projects: projects || [],
        certifications: certifications || [],
        languages: languages || [],
        sectionOrder: (resume as any).section_order || ["experience", "education", "skills", "projects", "certifications", "languages"],
      });
      toast.success("Word document generated", { id: loadingToast });
    } catch (error) {
      console.error(error);
      toast.error("Failed to generate Word document", { id: loadingToast });
    }
  };

  return (
    <div className="space-y-8">
      {/* Action buttons with premium style */}
      <div className="flex flex-wrap gap-3 px-1 md:px-0">
        <Button asChild className="min-h-11 rounded-none bg-[#d8f36b] px-5 font-bold text-[#102b2b] shadow-none hover:bg-[#c9e95c]">
          <Link href="/dashboard/resume/new">
            <Plus className="h-6 w-6 transition-transform group-hover:rotate-90" />
            <span className="font-bold text-base tracking-tight">Create New Resume</span>
          </Link>
        </Button>
        <Button asChild variant="outline" className="min-h-11 rounded-none border-[#102b2b]/25 px-5 text-[#102b2b] shadow-none hover:bg-[#d8f36b]">
          <Link href="/dashboard/upload">
            <Upload className="h-6 w-6 text-primary transition-transform group-hover:-translate-y-0.5" />
            <span className="font-bold text-base text-primary/80 tracking-tight">Upload PDF</span>
          </Link>
        </Button>
      </div>

      <Tabs defaultValue="all" className="w-full">
        <div className="px-1 md:px-0">
          <TabsList className="mb-7 inline-flex h-11 gap-0 rounded-xl border border-border bg-muted/60 p-0">
            <TabsTrigger value="all" className="flex h-full items-center gap-2 rounded-lg px-5 font-bold text-muted-foreground transition-colors data-[state=active]:bg-card data-[state=active]:text-foreground">
              <FileText className="h-4.5 w-4.5" />
              Active Resumes
            </TabsTrigger>
            <TabsTrigger value="archived" className="flex h-full items-center gap-2 rounded-lg px-5 font-bold text-muted-foreground transition-colors data-[state=active]:bg-card data-[state=active]:text-foreground">
              <Archive className="h-4.5 w-4.5" />
              Archived
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="all" className="mt-0 focus-visible:outline-none">
          <div className="grid gap-5 px-1 md:px-0 sm:grid-cols-2 lg:grid-cols-3">
            {resumes.filter(r => !r.is_archived).length > 0 ? (
              resumes.filter(r => !r.is_archived).map((resume) => (
                <Card
                  key={resume.id}
                  className="group relative overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-all hover:border-primary/50 hover:shadow-md"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
                  <CardHeader className="relative flex flex-row items-start justify-between space-y-0 pb-4">
                    <div className="flex items-center gap-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary shrink-0">
                        <FileText className="h-6 w-6" aria-hidden="true" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <CardTitle className="line-clamp-2 break-words text-lg font-heading font-black tracking-tight leading-tight mb-2 text-foreground">
                          {resume.title}
                        </CardTitle>
                        {resume.is_primary && (
                          <Badge className="rounded-md bg-primary text-primary-foreground px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest">
                            PRIMARY
                          </Badge>
                        )}
                      </div>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          aria-label={`More actions for ${resume.title}`}
                          className="h-9 w-9 rounded-lg border border-border bg-transparent text-muted-foreground opacity-100 transition-colors hover:text-foreground hover:bg-muted"
                        >
                          <MoreVertical className="h-5 w-5" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-60 glass glass-border p-1.5 rounded-2xl shadow-2xl animate-in fade-in slide-in-from-top-2 duration-300">
                        <DropdownMenuItem asChild className="rounded-xl h-11 cursor-pointer">
                          <Link href={`/dashboard/resume/${resume.id}`}>
                            <Edit className="mr-3 h-4.5 w-4.5 opacity-70" />
                            <span className="font-bold">Edit Resume</span>
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDownloadWord(resume)} className="rounded-xl h-11 cursor-pointer">
                          <FileDown className="mr-3 h-4.5 w-4.5 opacity-70" />
                          <span className="font-bold">Download Word</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDuplicate(resume)} className="rounded-xl h-11 cursor-pointer">
                          <Copy className="mr-3 h-4.5 w-4.5 opacity-70" />
                          <span className="font-bold">Duplicate</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => startRename(resume)} className="rounded-xl h-11 cursor-pointer">
                          <Pencil className="mr-3 h-4.5 w-4.5 opacity-70" />
                          <span className="font-bold">Rename</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleSetPrimary(resume.id, resume.is_primary)} className="rounded-xl h-11 cursor-pointer text-primary bg-primary/5">
                          <Star className="mr-3 h-4.5 w-4.5 fill-current opacity-70" />
                          <span className="font-black">SET AS PRIMARY</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => {
                          setArchiveId(resume.id);
                          setIsArchiveDialogOpen(true);
                        }} className="rounded-xl h-11 cursor-pointer">
                          <Archive className="mr-3 h-4.5 w-4.5 opacity-70" />
                          <span className="font-bold">Archive</span>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator className="bg-primary/10 my-1.5" />
                        <DropdownMenuItem
                          className="rounded-xl h-11 cursor-pointer text-destructive focus:text-destructive focus:bg-destructive/10"
                          onClick={() => {
                            setDeleteId(resume.id);
                            setIsDeleteDialogOpen(true);
                          }}
                        >
                          <Trash2 className="mr-3 h-4.5 w-4.5" />
                          <span className="font-black">DELETE</span>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </CardHeader>
                  <CardContent className="relative pt-4">
                    <div className="flex items-center justify-between text-muted-foreground">
                      <p className="text-xs font-bold uppercase tracking-wider">
                        MODIFIED{" "}
                        {formatDistanceToNow(new Date(resume.updated_at), {
                          addSuffix: true,
                        })}
                      </p>
                      <div className="flex items-center gap-1.5 border border-border bg-muted/50 px-2.5 py-1 text-xs font-semibold text-muted-foreground rounded-lg">
                        <Eye className="h-3.5 w-3.5" aria-hidden="true" />
                        <span>{resume.view_count || 0} VIEWS</span>
                      </div>
                    </div>
                    <Button
                      asChild
                      variant="secondary"
                      size="sm"
                      className="mt-6 min-h-11 w-full rounded-xl border border-border bg-muted/40 text-foreground transition-all hover:bg-primary hover:text-primary-foreground group/btn"
                    >
                      <Link href={`/dashboard/resume/${resume.id}`} className="flex items-center justify-center gap-2">
                        <span className="font-black text-sm tracking-widest">OPEN EDITOR</span>
                        <Pencil className="h-4 w-4 transition-transform group-hover/btn:scale-125" />
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="col-span-full flex flex-col items-center justify-center border border-dashed border-border bg-card/60 py-16 px-4 text-center rounded-2xl">
                <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                  <FileText className="h-8 w-8" aria-hidden="true" />
                </div>
                <h3 className="text-2xl font-heading font-black tracking-tighter text-foreground">No active resumes</h3>
                <p className="max-w-[400px] mt-2 text-muted-foreground text-sm font-medium leading-relaxed">
                  Ready to stand out? Build an AI-powered resume in minutes and land your next role.
                </p>
                <Button asChild className="mt-6 min-h-11 rounded-xl bg-primary px-7 font-bold text-primary-foreground shadow-sm hover:opacity-90">
                  <Link href="/dashboard/resume/new" className="flex items-center">
                    <Plus className="h-5 w-5 mr-2 transition-transform group-hover:rotate-90" />
                    CREATE FIRST RESUME
                  </Link>
                </Button>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="archived" className="mt-0 focus-visible:outline-none">
          <div className="grid gap-5 px-1 md:px-0 sm:grid-cols-2 lg:grid-cols-3">
            {resumes.filter(r => r.is_archived).length > 0 ? (
              resumes.filter(r => r.is_archived).map((resume) => (
                <Card
                  key={resume.id}
                  className="group relative overflow-hidden rounded-2xl border-dashed border-border bg-muted/20 opacity-75 transition-opacity hover:opacity-100"
                >
                  <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
                    <div className="flex items-center gap-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-muted text-muted-foreground shadow-inner">
                        <Archive className="h-6 w-6" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <CardTitle className="truncate text-lg font-heading font-bold text-foreground">
                          {resume.title}
                        </CardTitle>
                      </div>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          aria-label={`More actions for archived resume ${resume.title}`}
                          className="h-9 w-9 rounded-lg border border-border bg-transparent text-muted-foreground opacity-100 hover:text-foreground hover:bg-muted"
                        >
                          <MoreVertical className="h-5 w-5" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-56 glass glass-border p-1.5 rounded-xl">
                        <DropdownMenuItem onClick={async () => {
                          const supabase = createClient();
                          await supabase.from("resumes").update({ is_archived: false }).eq("id", resume.id);
                          router.refresh();
                          toast.success("Resume restored");
                        }} className="rounded-lg cursor-pointer font-bold">
                          <Upload className="mr-3 h-4.5 w-4.5" />
                          Restore Resume
                        </DropdownMenuItem>
                        <DropdownMenuSeparator className="bg-border my-1" />
                        <DropdownMenuItem
                          className="rounded-lg cursor-pointer text-destructive focus:text-destructive font-black"
                          onClick={() => {
                            setDeleteId(resume.id);
                            setIsDeleteDialogOpen(true);
                          }}
                        >
                          <Trash2 className="mr-3 h-4.5 w-4.5" />
                          DELETE PERMANENTLY
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </CardHeader>
                  <CardContent className="pt-4">
                    <div className="flex items-center justify-between text-muted-foreground">
                      <p className="text-xs font-bold uppercase tracking-widest">
                        ARCHIVED{" "}
                        {formatDistanceToNow(new Date(resume.updated_at), {
                          addSuffix: true,
                        })}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="col-span-full flex flex-col items-center justify-center border border-dashed border-border bg-card/60 py-16 px-4 text-center rounded-2xl opacity-70">
                <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
                  <Archive className="h-8 w-8" aria-hidden="true" />
                </div>
                <h3 className="text-2xl font-heading font-black text-foreground tracking-tight">Empty Archive</h3>
                <p className="text-sm text-muted-foreground font-medium mt-2">Any resumes you archive will safely rest here.</p>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>

      <Dialog open={!!renameId} onOpenChange={(open) => !open && setRenameId(null)}>
        <DialogContent className="rounded-2xl border-border bg-card shadow-xl sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="text-2xl font-heading font-black text-foreground">Rename resume</DialogTitle>
            <DialogDescription className="font-medium text-muted-foreground">
              Give your resume a name that represents your ambition.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-6 py-4 font-heading">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                New Title
              </Label>
              <Input
                id="name"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                className="h-11 rounded-xl border-border bg-background px-4 text-base font-bold focus-visible:ring-primary"
              />
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="ghost" onClick={() => setRenameId(null)} className="h-10 rounded-xl px-5 font-bold">Cancel</Button>
            <Button onClick={handleRename} disabled={isRenaming} className="h-10 rounded-xl bg-primary px-7 font-bold text-primary-foreground shadow-sm">
              {isRenaming ? "Saving..." : "APPLY CHANGES"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent className="rounded-2xl border-destructive/25 bg-card shadow-xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-2xl font-heading font-black tracking-tight text-destructive">Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription className="text-sm font-medium leading-relaxed text-muted-foreground">
              This action is permanent and cannot be reversed. You will lose this resume and all the data within it forever.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-6 gap-2">
            <AlertDialogCancel className="h-10 rounded-xl border-border px-5 font-bold">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="h-10 rounded-xl bg-destructive px-8 font-bold text-destructive-foreground shadow-sm hover:bg-destructive/90"
            >
              CONFIRM DELETE
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={isArchiveDialogOpen} onOpenChange={setIsArchiveDialogOpen}>
        <AlertDialogContent className="rounded-2xl border-border bg-card shadow-xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="inline-flex items-center gap-3 text-2xl font-heading font-black tracking-tight text-foreground">
              <Archive className="h-7 w-7 text-primary" aria-hidden="true" />
              Archive resume?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-sm font-medium leading-relaxed text-muted-foreground">
              Archiving hides this resume from your main list. You can restore it anytime from the archive tab.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-6 gap-2">
            <AlertDialogCancel className="h-10 rounded-xl border-border px-5 font-bold">Keep active</AlertDialogCancel>
            <AlertDialogAction onClick={handleArchive} className="h-10 rounded-xl bg-primary px-8 font-bold text-primary-foreground shadow-sm">
              ARCHIVE NOW
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
