"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  GraduationCap,
  Sparkles,
  Zap,
  BookOpen,
  CheckCircle2,
  Loader2,
  ExternalLink,
  Plus,
  X,
} from "lucide-react";
import { toast } from "sonner";

export interface CanvasCourseForConversion {
  id: string;
  canvas_course_id: string;
  name: string;
  course_code: string;
  grade?: string | null;
  assignments?: string[];
}

interface ConvertToResumeDialogProps {
  course: CanvasCourseForConversion | null;
  resumes: { id: string; title: string }[];
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function ConvertToResumeDialog({
  course,
  resumes,
  isOpen,
  onOpenChange,
  onSuccess,
}: ConvertToResumeDialogProps) {
  const router = useRouter();

  const [selectedResumeId, setSelectedResumeId] = useState<string>(
    resumes[0]?.id || ""
  );
  const [conversionType, setConversionType] = useState<"project" | "coursework">(
    "project"
  );
  const [projectName, setProjectName] = useState(
    course ? `${course.name} Capstone` : ""
  );
  const [description, setDescription] = useState("");
  const [technologies, setTechnologies] = useState<string[]>([
    "TypeScript",
    "SQL",
    "Git",
  ]);
  const [newTechInput, setNewTechInput] = useState("");
  const [highlights, setHighlights] = useState<string[]>([
    "Architected end-to-end software platform demonstrating core principles taught throughout the course.",
    "Implemented modular service architecture and database models to process high-throughput application state.",
    "Collaborated on rigorous code reviews and system validation, maintaining production standards.",
  ]);

  const [generatingAi, setGeneratingAi] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Sync state if course changes
  const handleOpen = (open: boolean) => {
    if (open && course) {
      setProjectName(`${course.name} Capstone`);
      if (!selectedResumeId && resumes.length > 0) {
        setSelectedResumeId(resumes[0].id);
      }
    }
    onOpenChange(open);
  };

  const handleAiGenerateBullets = async () => {
    if (!course) return;
    try {
      setGeneratingAi(true);
      const res = await fetch("/api/canvas/generate-bullets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          courseName: course.name,
          courseCode: course.course_code,
          grade: course.grade,
          assignments: course.assignments || [],
        }),
      });

      if (!res.ok) throw new Error("Failed to generate AI bullets");
      const data = await res.json();

      if (data.name) setProjectName(data.name);
      if (data.description) setDescription(data.description);
      if (Array.isArray(data.technologies) && data.technologies.length > 0) {
        setTechnologies(data.technologies);
      }
      if (Array.isArray(data.highlights) && data.highlights.length > 0) {
        setHighlights(data.highlights);
      }

      toast.success("Generated tailored STAR bullets with AI!");
    } catch (err: any) {
      console.error(err);
      toast.error("Could not generate AI bullets. You can edit them manually.");
    } finally {
      setGeneratingAi(false);
    }
  };

  const handleAddTech = (e: React.KeyboardEvent | React.MouseEvent) => {
    if ("key" in e && e.key !== "Enter") return;
    if ("preventDefault" in e) e.preventDefault();
    const clean = newTechInput.trim().replace(/,/g, "");
    if (clean && !technologies.includes(clean)) {
      setTechnologies([...technologies, clean]);
      setNewTechInput("");
    }
  };

  const handleRemoveTech = (tech: string) => {
    setTechnologies(technologies.filter((t) => t !== tech));
  };

  const handleUpdateHighlight = (index: number, val: string) => {
    const updated = [...highlights];
    updated[index] = val;
    setHighlights(updated);
  };

  const handleAddHighlight = () => {
    if (highlights.length < 5) {
      setHighlights([...highlights, ""]);
    }
  };

  const handleRemoveHighlight = (index: number) => {
    setHighlights(highlights.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!course || !selectedResumeId) {
      toast.error("Please choose a target resume.");
      return;
    }

    try {
      setSubmitting(true);
      const res = await fetch("/api/canvas/convert-to-resume", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          resumeId: selectedResumeId,
          conversionType,
          courseName: course.name,
          courseCode: course.course_code,
          grade: course.grade,
          projectName,
          description,
          technologies,
          highlights: highlights.filter((h) => h.trim().length > 0),
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to convert coursework.");

      toast.success(data.message || "Coursework added to your resume!", {
        action: {
          label: "View Resume",
          onClick: () => router.push(`/dashboard/resume/${selectedResumeId}`),
        },
      });

      onOpenChange(false);
      if (onSuccess) onSuccess();
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Could not save to resume.");
    } finally {
      setSubmitting(false);
    }
  };

  if (!course) return null;

  return (
    <Dialog open={isOpen} onOpenChange={handleOpen}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto rounded-none border border-[#102b2b]/20 bg-[#f8f4ec] p-6 text-[#102b2b]">
        {/* Header */}
        <DialogHeader className="border-b border-[#102b2b]/15 pb-4 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-[#0d8274]">
              <GraduationCap className="h-4 w-4" />
              Canvas LMS Academic Pipeline
            </div>
            {course.grade && (
              <Badge className="rounded-none bg-[#0d8274] text-white font-mono text-xs px-2.5 py-0.5">
                Grade: {course.grade}
              </Badge>
            )}
          </div>
          <DialogTitle className="text-2xl font-heading font-black text-[#102b2b]">
            Convert Academic Coursework to Resume
          </DialogTitle>
          <DialogDescription className="text-sm text-[#102b2b]/70">
            Transform <strong className="text-[#102b2b]">{course.name}</strong> ({course.course_code}) into verified career proof on your resume.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 pt-2">
          {/* Target Resume Picker */}
          <div className="space-y-2">
            <Label className="text-xs font-black uppercase tracking-widest text-[#102b2b]/75">
              1. Select Destination Resume
            </Label>
            {resumes.length === 0 ? (
              <div className="border border-amber-600/30 bg-amber-50 p-3 text-xs text-amber-900">
                No resumes found. Please create a resume first in the Resumes tab.
              </div>
            ) : (
              <Select
                value={selectedResumeId}
                onValueChange={setSelectedResumeId}
              >
                <SelectTrigger className="h-11 rounded-none border-[#102b2b]/20 bg-white font-medium text-sm text-[#102b2b]">
                  <SelectValue placeholder="Choose a resume..." />
                </SelectTrigger>
                <SelectContent className="rounded-none border-[#102b2b]/20 bg-white">
                  {resumes.map((r) => (
                    <SelectItem key={r.id} value={r.id} className="cursor-pointer">
                      {r.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          {/* Mode Selector */}
          <div className="space-y-2">
            <Label className="text-xs font-black uppercase tracking-widest text-[#102b2b]/75">
              2. Choose Conversion Format
            </Label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setConversionType("project")}
                className={`p-4 text-left border transition-all flex flex-col justify-between ${
                  conversionType === "project"
                    ? "border-[#102b2b] bg-[#f4f7f1] shadow-sm"
                    : "border-[#102b2b]/15 bg-white hover:bg-[#fcfdfa]"
                }`}
              >
                <div className="flex items-center justify-between w-full">
                  <span className="font-heading font-black text-sm text-[#102b2b] flex items-center gap-1.5">
                    <Zap className="h-4 w-4 text-[#0d8274]" />
                    Technical Project
                  </span>
                  {conversionType === "project" && (
                    <CheckCircle2 className="h-4 w-4 text-[#0d8274]" />
                  )}
                </div>
                <p className="text-xs text-[#102b2b]/65 mt-2 leading-relaxed">
                  Adds as a standalone capstone entry in your Projects section with STAR bullet points and technologies.
                </p>
              </button>

              <button
                type="button"
                onClick={() => setConversionType("coursework")}
                className={`p-4 text-left border transition-all flex flex-col justify-between ${
                  conversionType === "coursework"
                    ? "border-[#102b2b] bg-[#f4f7f1] shadow-sm"
                    : "border-[#102b2b]/15 bg-white hover:bg-[#fcfdfa]"
                }`}
              >
                <div className="flex items-center justify-between w-full">
                  <span className="font-heading font-black text-sm text-[#102b2b] flex items-center gap-1.5">
                    <BookOpen className="h-4 w-4 text-[#0d8274]" />
                    Education Coursework
                  </span>
                  {conversionType === "coursework" && (
                    <CheckCircle2 className="h-4 w-4 text-[#0d8274]" />
                  )}
                </div>
                <p className="text-xs text-[#102b2b]/65 mt-2 leading-relaxed">
                  Appends as verified academic achievement with grade to your Education section.
                </p>
              </button>
            </div>
          </div>

          {/* Project Details Section */}
          {conversionType === "project" && (
            <div className="space-y-5 border-t border-[#102b2b]/15 pt-5">
              <div className="flex items-center justify-between gap-2">
                <Label className="text-xs font-black uppercase tracking-widest text-[#102b2b]/75">
                  3. Project Details & STAR Bullets
                </Label>
                <Button
                  type="button"
                  size="sm"
                  onClick={handleAiGenerateBullets}
                  disabled={generatingAi}
                  className="h-8 rounded-none bg-[#102b2b] text-[#d8f36b] hover:bg-[#0d8274] text-xs font-bold gap-1.5"
                >
                  {generatingAi ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Sparkles className="h-3.5 w-3.5" />
                  )}
                  {generatingAi ? "Generating..." : "✨ AI Generate Bullets"}
                </Button>
              </div>

              {/* Project Title */}
              <div className="space-y-1.5">
                <Label className="text-[11px] font-bold uppercase text-[#102b2b]/60">
                  Project Title
                </Label>
                <Input
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  placeholder="e.g. Distributed Database Engine Capstone"
                  className="h-10 rounded-none border-[#102b2b]/20 bg-white font-medium text-sm"
                />
              </div>

              {/* Overview / Description */}
              <div className="space-y-1.5">
                <Label className="text-[11px] font-bold uppercase text-[#102b2b]/60">
                  System Overview (Optional)
                </Label>
                <Textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="1-2 sentences summarizing architecture or purpose..."
                  rows={2}
                  className="rounded-none border-[#102b2b]/20 bg-white text-xs leading-relaxed"
                />
              </div>

              {/* Bullets List */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-[11px] font-bold uppercase text-[#102b2b]/60">
                    STAR Bullet Points (Situation, Task, Action, Result)
                  </Label>
                  {highlights.length < 5 && (
                    <button
                      type="button"
                      onClick={handleAddHighlight}
                      className="text-xs font-bold text-[#0d8274] hover:underline flex items-center gap-1"
                    >
                      <Plus className="h-3 w-3" /> Add Bullet
                    </button>
                  )}
                </div>

                <div className="space-y-2">
                  {highlights.map((bullet, idx) => (
                    <div key={idx} className="flex items-start gap-2">
                      <span className="text-xs font-mono font-bold text-[#102b2b]/40 mt-2.5 shrink-0">
                        {idx + 1}.
                      </span>
                      <Textarea
                        value={bullet}
                        onChange={(e) => handleUpdateHighlight(idx, e.target.value)}
                        rows={2}
                        className="rounded-none border-[#102b2b]/20 bg-white text-xs leading-relaxed flex-1"
                        placeholder="Action verb + Context + Quantifiable result..."
                      />
                      {highlights.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveHighlight(idx)}
                          className="p-1.5 text-[#102b2b]/40 hover:text-red-600 mt-1.5 shrink-0"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Technologies */}
              <div className="space-y-2">
                <Label className="text-[11px] font-bold uppercase text-[#102b2b]/60">
                  Technologies Used
                </Label>
                <div className="flex flex-wrap gap-1.5 p-2 border border-[#102b2b]/20 bg-white min-h-[44px] items-center">
                  {technologies.map((tech) => (
                    <Badge
                      key={tech}
                      variant="secondary"
                      className="rounded-none bg-[#f4f7f1] border border-[#102b2b]/15 text-xs text-[#102b2b] font-mono gap-1 py-1 px-2"
                    >
                      {tech}
                      <button
                        type="button"
                        onClick={() => handleRemoveTech(tech)}
                        className="text-[#102b2b]/50 hover:text-red-600"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                  <input
                    value={newTechInput}
                    onChange={(e) => setNewTechInput(e.target.value)}
                    onKeyDown={handleAddTech}
                    placeholder="Add tech (press Enter)..."
                    className="flex-1 min-w-[120px] text-xs font-mono bg-transparent outline-none px-1 text-[#102b2b]"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Coursework Preview Section */}
          {conversionType === "coursework" && (
            <div className="space-y-4 border-t border-[#102b2b]/15 pt-5">
              <Label className="text-xs font-black uppercase tracking-widest text-[#102b2b]/75">
                3. Coursework Entry Preview
              </Label>
              <div className="p-4 border border-[#102b2b]/15 bg-white space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#0d8274]">
                  Education Section · Academic Coursework
                </span>
                <p className="font-heading font-bold text-base text-[#102b2b]">
                  {course.name} ({course.course_code || "Course"})
                  {course.grade && (
                    <span className="text-[#0d8274]"> — Grade: {course.grade}</span>
                  )}
                </p>
                <p className="text-xs text-[#102b2b]/60 leading-relaxed">
                  This academic entry will be attached to your primary degree listing, certifying completion with verified coursework status.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="border-t border-[#102b2b]/15 pt-4 mt-6 flex items-center justify-between gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={submitting}
            className="h-11 rounded-none border-[#102b2b]/20 bg-white font-bold text-[#102b2b]"
          >
            Cancel
          </Button>

          <Button
            type="button"
            onClick={handleSubmit}
            disabled={submitting || resumes.length === 0}
            className="h-11 rounded-none bg-[#102b2b] text-[#d8f36b] hover:bg-[#0d8274] px-6 font-bold gap-2"
          >
            {submitting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Zap className="h-4 w-4" />
            )}
            {submitting ? "Saving to Resume..." : "Save to Resume"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
