"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { GraduationCap, Loader2, RefreshCw, AlertCircle } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";

interface CanvasSuggestionsProps {
  onImport: (formattedText: string) => void;
}

export function CanvasSuggestions({ onImport }: CanvasSuggestionsProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [courses, setCourses] = useState<any[]>([]);
  const [grades, setGrades] = useState<any[]>([]);
  const [selectedCourses, setSelectedCourses] = useState<string[]>([]);
  const [isConfigured, setIsConfigured] = useState(true);

  useEffect(() => {
    if (!isOpen) return;

    const fetchCanvasData = async () => {
      setIsLoading(true);
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        // Check if Canvas URL is configured
        const { data: profile } = await supabase
          .from("profiles")
          .select("canvas_instance_url")
          .eq("id", user.id)
          .single();

        if (!profile?.canvas_instance_url) {
          setIsConfigured(false);
          setIsLoading(false);
          return;
        }

        setIsConfigured(true);

        // Fetch courses and grades in parallel
        const [coursesRes, gradesRes] = await Promise.all([
          supabase.from("canvas_courses").select("*").eq("user_id", user.id),
          supabase.from("canvas_grades").select("*").eq("user_id", user.id),
        ]);

        if (coursesRes.error) throw coursesRes.error;
        if (gradesRes.error) throw gradesRes.error;

        setCourses(coursesRes.data || []);
        setGrades(gradesRes.data || []);
      } catch (err) {
        console.error(err);
        toast.error("Failed to load Canvas integration details");
      } finally {
        setIsLoading(false);
      }
    };

    fetchCanvasData();
  }, [isOpen]);

  const toggleCourse = (courseId: string) => {
    setSelectedCourses((prev) =>
      prev.includes(courseId)
        ? prev.filter((id) => id !== courseId)
        : [...prev, courseId]
    );
  };

  const handleImportClick = () => {
    if (selectedCourses.length === 0) {
      toast.error("Please select at least one course");
      return;
    }

    const selectedDetails = courses.filter((c) =>
      selectedCourses.includes(c.canvas_course_id)
    );

    const formattedLines = selectedDetails.map((course) => {
      const grade = grades.find((g) => g.canvas_course_id === course.canvas_course_id);
      const gradeStr = grade?.current_grade ? `(Grade: ${grade.current_grade})` : "";
      const scoreStr = grade?.current_score ? `(Score: ${grade.current_score}%)` : "";
      const details = [gradeStr, scoreStr].filter(Boolean).join(" ");
      
      return `Completed coursework in ${course.name}${details ? ` ${details}` : ""}`;
    });

    onImport(formattedLines.join("\n"));
    setIsOpen(false);
    toast.success(`Imported ${selectedCourses.length} Canvas courses as achievements!`);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          type="button"
          className="h-8 gap-1 text-xs border-indigo-500/30 hover:border-indigo-500 bg-indigo-500/5 hover:bg-indigo-500/10 text-indigo-700 dark:text-indigo-400"
        >
          <GraduationCap className="h-3.5 w-3.5" />
          LMS Achievements
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <GraduationCap className="h-5 w-5 text-indigo-500" />
            Canvas LMS Recommendations
          </DialogTitle>
          <DialogDescription>
            Import synced academic highlights directly into your resume achievements.
          </DialogDescription>
        </DialogHeader>

        {!isConfigured ? (
          <div className="flex flex-col items-center justify-center p-6 text-center border border-dashed rounded-lg bg-muted/20">
            <AlertCircle className="h-8 w-8 text-amber-500 mb-2" />
            <h3 className="font-semibold text-sm">Canvas LMS Not Connected</h3>
            <p className="text-xs text-muted-foreground mt-1 max-w-[300px]">
              Connect your Canvas credentials in Settings &gt; Integrations to sync and import your academic achievements.
            </p>
          </div>
        ) : isLoading ? (
          <div className="flex items-center justify-center py-10">
            <Loader2 className="h-6 w-6 animate-spin text-indigo-500" />
          </div>
        ) : courses.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-6 text-center border border-dashed rounded-lg bg-muted/20">
            <GraduationCap className="h-8 w-8 text-muted-foreground mb-2" />
            <h3 className="font-semibold text-sm">No Synced Coursework Found</h3>
            <p className="text-xs text-muted-foreground mt-1 max-w-[300px]">
              Sync your coursework first from your main Dashboard workspace.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="max-h-[300px] overflow-y-auto space-y-2.5 pr-2">
              {courses.map((course) => {
                const grade = grades.find(
                  (g) => g.canvas_course_id === course.canvas_course_id
                );
                const score = grade?.current_score ? parseFloat(grade.current_score) : 0;
                const isTopPerformer = score >= 85 || grade?.current_grade === "A";

                return (
                  <div
                    key={course.canvas_course_id}
                    onClick={() => toggleCourse(course.canvas_course_id)}
                    className="flex items-start gap-3 p-3 rounded-lg border border-border hover:border-indigo-500/50 bg-background hover:bg-indigo-500/5 transition-colors cursor-pointer"
                  >
                    <Checkbox
                      checked={selectedCourses.includes(course.canvas_course_id)}
                      onCheckedChange={() => toggleCourse(course.canvas_course_id)}
                      onClick={(e) => e.stopPropagation()}
                      className="mt-0.5"
                    />
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-bold text-muted-foreground uppercase">
                          {course.course_code}
                        </span>
                        {isTopPerformer && (
                          <Badge
                            variant="secondary"
                            className="bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 border-none font-bold text-[10px]"
                          >
                            ⭐ Top Performer
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm font-semibold leading-tight">{course.name}</p>
                      {grade && (
                        <p className="text-xs text-muted-foreground">
                          Current Grade: <span className="font-semibold text-foreground">{grade.current_grade || "N/A"}</span>
                          {grade.current_score && ` (${grade.current_score}%)`}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t">
              <Button type="button" variant="outline" size="sm" onClick={() => setIsOpen(false)}>
                Cancel
              </Button>
              <Button
                type="button"
                size="sm"
                className="bg-indigo-600 hover:bg-indigo-700 text-white"
                onClick={handleImportClick}
              >
                Import Coursework
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
