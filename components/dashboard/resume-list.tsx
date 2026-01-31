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
import { Badge } from "@/components/ui/badge";
import {
  FileText,
  MoreVertical,
  Edit,
  Download,
  Copy,
  Trash2,
  Plus,
  Upload,
  Star,
  Pencil,
  Eye
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
import { Archive, FileDown } from "lucide-react";
import { exportToDocx } from "@/lib/export/docx-export";

interface Resume {
  id: string;
  title: string;
  template_id: string | null;
  is_primary: boolean;
  view_count: number;
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
    // Since we have RLS, this only updates user's resumes
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
      // 1. Duplicate the main resume record
      const { data: newResume, error: resumeError } = await supabase
        .from("resumes")
        .insert({
          user_id: user.id,
          title: `${resume.title} (Copy)`,
          template_id: resume.template_id,
          is_primary: false,
          is_public: false, // Default to private
        })
        .select()
        .single();

      if (resumeError || !newResume) throw new Error("Failed to create resume copy");

      // 2. Define tables to copy
      const tables = [
        "personal_info",
        "work_experiences",
        "education",
        "skills",
        "projects",
        "certifications",
        "languages",
      ];

      // 3. Process each table
      for (const table of tables) {
        // Fetch data from source
        const { data: sourceData, error: fetchError } = await supabase
          .from(table)
          .select("*")
          .eq(table === "personal_info" ? "resume_id" : "resume_id", resume.id); // For consistency

        if (fetchError) {
          console.error(`Error fetching from ${table}:`, fetchError);
          continue; // Move to next table
        }

        if (sourceData && sourceData.length > 0) {
          // Prepare data for insertion (remove id and updated_at, set new resume_id)
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
      // 1. Fetch all data for this specific resume
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
        supabase.from("profiles").select("*").single(), // User's profile
        supabase.from("work_experiences").select("*").eq("resume_id", resume.id).order("sort_order"),
        supabase.from("education").select("*").eq("resume_id", resume.id).order("sort_order"),
        supabase.from("skills").select("*").eq("resume_id", resume.id).order("sort_order"),
        supabase.from("projects").select("*").eq("resume_id", resume.id).order("sort_order"),
        supabase.from("certifications").select("*").eq("resume_id", resume.id).order("sort_order"),
        supabase.from("languages").select("*").eq("resume_id", resume.id).order("sort_order"),
        supabase.from("personal_info").select("*").eq("resume_id", resume.id).single(),
      ]);

      // Merge profile with resume-specific personal info
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
    <div className="space-y-6">
      {/* Action buttons */}
      <div className="flex flex-wrap gap-3">
        <Button asChild className="min-h-[44px] gap-2">
          <Link href="/dashboard/resume/new">
            <Plus className="h-4 w-4" />
            Create New
          </Link>
        </Button>
        <Button asChild variant="outline" className="min-h-[44px] gap-2 bg-transparent">
          <Link href="/dashboard/upload">
            <Upload className="h-4 w-4" />
            Upload PDF
          </Link>
        </Button>
      </div>

      {/* Resume grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {resumes.map((resume) => (
          <Card
            key={resume.id}
            className="group transition-all hover:border-primary/30 hover:shadow-md"
          >
            <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <FileText className="h-5 w-5 text-primary" />
                </div>
                <div className="min-w-0 flex-1">
                  <CardTitle className="truncate text-base">
                    {resume.title}
                  </CardTitle>
                  {resume.is_primary && (
                    <Badge variant="secondary" className="mt-1 text-xs">
                      Primary
                    </Badge>
                  )}
                </div>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 opacity-0 transition-opacity group-hover:opacity-100"
                  >
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem asChild>
                    <Link href={`/dashboard/resume/${resume.id}`}>
                      <Edit className="mr-2 h-4 w-4" />
                      Edit
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleDownloadWord(resume)}>
                    <FileDown className="mr-2 h-4 w-4" />
                    Download Word
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => startRename(resume)}>
                    <Pencil className="mr-2 h-4 w-4" />
                    Rename
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleSetPrimary(resume.id, resume.is_primary)}>
                    <Star className="mr-2 h-4 w-4" />
                    Set as Primary
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => {
                    setArchiveId(resume.id);
                    setIsArchiveDialogOpen(true);
                  }}>
                    <Archive className="mr-2 h-4 w-4" />
                    Archive
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="text-destructive focus:text-destructive"
                    onClick={() => {
                      setDeleteId(resume.id);
                      setIsDeleteDialogOpen(true);
                    }}
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between mt-1">
                <p className="text-xs text-muted-foreground">
                  Updated{" "}
                  {formatDistanceToNow(new Date(resume.updated_at), {
                    addSuffix: true,
                  })}
                </p>
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Eye className="h-3 w-3" />
                  <span>{resume.view_count || 0}</span>
                </div>
              </div>
              <Button
                asChild
                variant="ghost"
                size="sm"
                className="mt-3 w-full min-h-[44px]"
              >
                <Link href={`/dashboard/resume/${resume.id}`}>
                  Open Editor
                </Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>


      <Dialog open={!!renameId} onOpenChange={(open) => !open && setRenameId(null)}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Rename Resume</DialogTitle>
            <DialogDescription>
              Enter a new name for your resume.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Name
              </Label>
              <Input
                id="name"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                className="col-span-3"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRenameId(null)}>Cancel</Button>
            <Button onClick={handleRename} disabled={isRenaming}>
              {isRenaming ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete your
              resume and all associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={isArchiveDialogOpen} onOpenChange={setIsArchiveDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Archive Resume?</AlertDialogTitle>
            <AlertDialogDescription>
              This will hide the resume from your main dashboard.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleArchive}>
              Archive
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div >
  );
}
