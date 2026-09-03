"use client";

import { useState } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChevronRight, Zap } from "lucide-react";
import {
  ConvertToResumeDialog,
  CanvasCourseForConversion,
} from "./convert-to-resume-dialog";

interface CanvasCoursesGridProps {
  courses: any[];
  grades: any[];
  assignments: any[];
  resumes: { id: string; title: string }[];
}

export function CanvasCoursesGrid({
  courses,
  grades,
  assignments,
  resumes,
}: CanvasCoursesGridProps) {
  const [selectedCourse, setSelectedCourse] = useState<CanvasCourseForConversion | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const gradesMap = new Map(grades?.map((g) => [g.canvas_course_id, g]) || []);

  const handleOpenConvert = (course: any, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const gradeInfo = gradesMap.get(course.canvas_course_id);
    const courseAssignments = assignments
      .filter((a) => a.canvas_course_id === course.canvas_course_id)
      .map((a) => a.name);

    setSelectedCourse({
      id: course.id,
      canvas_course_id: course.canvas_course_id,
      name: course.name,
      course_code: course.course_code || "Class",
      grade: gradeInfo?.current_grade || gradeInfo?.current_score ? `${gradeInfo?.current_grade || ""}${gradeInfo?.current_score ? ` (${gradeInfo.current_score}%)` : ""}` : null,
      assignments: courseAssignments,
    });
    setIsDialogOpen(true);
  };

  if (courses.length === 0) {
    return (
      <div className="text-center py-10 border border-dashed border-[#102b2b]/15 bg-[#f7faf5]">
        <p className="text-sm text-[#52716a] italic">
          No courses synced. Trigger a sync using the button above.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2">
        {courses.map((course) => {
          const gradeInfo = gradesMap.get(course.canvas_course_id);
          const courseAssignments = assignments.filter(
            (a) => a.canvas_course_id === course.canvas_course_id
          );

          return (
            <div
              key={course.id}
              className="p-5 border border-[#102b2b]/10 hover:border-[#0d8274] bg-[#f8faf5] hover:bg-white transition-all flex flex-col justify-between gap-4 group shadow-sm"
            >
              <div>
                <div className="flex justify-between items-start gap-2">
                  <Badge
                    variant="outline"
                    className="rounded-none border-[#102b2b]/15 text-[#52716a] text-[9px] uppercase tracking-wider font-bold"
                  >
                    {course.course_code || "Class"}
                  </Badge>
                  {gradeInfo && (
                    <Badge className="rounded-none bg-[#0d8274] text-white font-mono text-xs px-2 py-0.5">
                      Grade: {gradeInfo.current_grade || `${gradeInfo.current_score}%` || "Enrolled"}
                    </Badge>
                  )}
                </div>

                <h3 className="font-extrabold text-base text-[#102b2b] mt-3 group-hover:text-[#0d8274] transition-colors leading-tight line-clamp-2">
                  {course.name}
                </h3>
              </div>

              <div className="space-y-3 border-t border-[#102b2b]/5 pt-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[#52716a] font-medium">
                    {courseAssignments.length} assignments
                  </span>
                  <Link
                    href={`/dashboard/canvas/${course.canvas_course_id}`}
                    className="text-[#0d8274] font-bold flex items-center gap-1 hover:underline"
                  >
                    View Syllabus <ChevronRight className="w-4 h-4" />
                  </Link>
                </div>

                {/* 1-Click Convert to Resume Action */}
                <Button
                  type="button"
                  onClick={(e) => handleOpenConvert(course, e)}
                  className="w-full h-9 rounded-none bg-[#102b2b] text-[#d8f36b] hover:bg-[#0d8274] font-bold text-xs gap-1.5 shadow-none"
                >
                  <Zap className="h-3.5 w-3.5" />
                  ⚡ Add to Resume
                </Button>
              </div>
            </div>
          );
        })}
      </div>

      <ConvertToResumeDialog
        course={selectedCourse}
        resumes={resumes}
        isOpen={isDialogOpen}
        onOpenChange={setIsDialogOpen}
      />
    </>
  );
}
