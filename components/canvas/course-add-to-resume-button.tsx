"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Zap } from "lucide-react";
import {
  ConvertToResumeDialog,
  CanvasCourseForConversion,
} from "./convert-to-resume-dialog";

interface CourseAddToResumeButtonProps {
  course: CanvasCourseForConversion;
  resumes: { id: string; title: string }[];
}

export function CourseAddToResumeButton({
  course,
  resumes,
}: CourseAddToResumeButtonProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Button
        onClick={() => setIsOpen(true)}
        className="h-10 rounded-none bg-[#102b2b] text-[#d8f36b] hover:bg-[#0d8274] font-bold text-xs gap-1.5 shadow-sm"
      >
        <Zap className="h-3.5 w-3.5" />
        ⚡ Add Course to Resume
      </Button>

      <ConvertToResumeDialog
        course={course}
        resumes={resumes}
        isOpen={isOpen}
        onOpenChange={setIsOpen}
      />
    </>
  );
}
