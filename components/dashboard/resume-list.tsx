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
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface Resume {
  id: string;
  title: string;
  template_id: string | null;
  is_primary: boolean;
  created_at: string;
  updated_at: string;
}

interface ResumeListProps {
  resumes: Resume[];
}

export function ResumeList({ resumes }: ResumeListProps) {
  const router = useRouter();

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Are you sure you want to delete "${title}"?`)) return;

    const supabase = createClient();
    const { error } = await supabase.from("resumes").delete().eq("id", id);

    if (error) {
      toast.error("Failed to delete resume");
      return;
    }

    toast.success("Resume deleted");
    router.refresh();
  };

  const handleDuplicate = async (resume: Resume) => {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    const { data, error } = await supabase
      .from("resumes")
      .insert({
        user_id: user.id,
        title: `${resume.title} (Copy)`,
        template_id: resume.template_id,
        is_primary: false,
      })
      .select()
      .single();

    if (error) {
      toast.error("Failed to duplicate resume");
      return;
    }

    toast.success("Resume duplicated");
    router.refresh();
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
                  <DropdownMenuItem>
                    <Download className="mr-2 h-4 w-4" />
                    Download PDF
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleDuplicate(resume)}>
                    <Copy className="mr-2 h-4 w-4" />
                    Duplicate
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="text-destructive focus:text-destructive"
                    onClick={() => handleDelete(resume.id, resume.title)}
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">
                Updated{" "}
                {formatDistanceToNow(new Date(resume.updated_at), {
                  addSuffix: true,
                })}
              </p>
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
    </div>
  );
}
