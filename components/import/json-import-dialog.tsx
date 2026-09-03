"use client";

import { useState, useCallback, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Upload,
  FileJson,
  ClipboardPaste,
  Loader2,
  CheckCircle2,
  AlertCircle,
  User,
  Briefcase,
  GraduationCap,
  Wrench,
  FolderGit,
  Award,
  Languages,
  ArrowRight,
} from "lucide-react";
import { parseJSONResume, ParsedResumeData } from "@/lib/export/json-import";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

interface JsonImportDialogProps {
  children: React.ReactNode;
  /** Called with the parsed resume data when user confirms import */
  onImport: (data: ParsedResumeData) => void;
}

type ImportStep = "select" | "preview" | "done";

export function JsonImportDialog({ children, onImport }: JsonImportDialogProps) {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<ImportStep>("select");
  const [activeTab, setActiveTab] = useState<"file" | "paste">("file");
  const [pasteContent, setPasteContent] = useState("");
  const [parsedData, setParsedData] = useState<ParsedResumeData | null>(null);
  const [parseError, setParseError] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [fileName, setFileName] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [summary, setSummary] = useState<{
    hasProfile: boolean;
    workCount: number;
    educationCount: number;
    skillCount: number;
    projectCount: number;
    certificationCount: number;
    languageCount: number;
  } | null>(null);

  const resetState = useCallback(() => {
    setStep("select");
    setActiveTab("file");
    setPasteContent("");
    setParsedData(null);
    setParseError(null);
    setIsDragOver(false);
    setFileName("");
    setSummary(null);
  }, []);

  const handleParse = useCallback((input: string, source: string) => {
    setParseError(null);
    const result = parseJSONResume(input);

    if (!result.success || !result.data) {
      setParseError(result.error || "Failed to parse the JSON file.");
      toast.error("Import failed", { description: result.error });
      return;
    }

    setParsedData(result.data);
    setSummary(result.summary || null);
    setStep("preview");
    toast.success(`Parsed from ${source}`, {
      description: `Found ${result.summary?.workCount || 0} roles, ${result.summary?.skillCount || 0} skills`,
    });
  }, []);

  const handleFileSelect = useCallback(
    (file: File) => {
      if (!file.name.endsWith(".json")) {
        setParseError("Please upload a .json file.");
        toast.error("Invalid file type", { description: "Only .json files are accepted." });
        return;
      }

      setFileName(file.name);
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target?.result as string;
        handleParse(text, file.name);
      };
      reader.onerror = () => {
        setParseError("Failed to read file.");
        toast.error("File read error");
      };
      reader.readAsText(file);
    },
    [handleParse]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragOver(false);
      const file = e.dataTransfer.files?.[0];
      if (file) handleFileSelect(file);
    },
    [handleFileSelect]
  );

  const handlePasteSubmit = useCallback(() => {
    if (!pasteContent.trim()) {
      setParseError("Please paste valid JSON content.");
      return;
    }
    handleParse(pasteContent.trim(), "pasted content");
  }, [pasteContent, handleParse]);

  const handleConfirmImport = useCallback(() => {
    if (!parsedData) return;
    onImport(parsedData);
    setStep("done");
    toast.success("Resume imported successfully!");
    // Auto close after brief delay
    setTimeout(() => {
      setOpen(false);
      resetState();
    }, 1200);
  }, [parsedData, onImport, resetState]);

  const statItems = summary
    ? [
        { icon: User, label: "Profile", count: summary.hasProfile ? 1 : 0, color: "#0d8274" },
        { icon: Briefcase, label: "Work Experience", count: summary.workCount, color: "#0d8274" },
        { icon: GraduationCap, label: "Education", count: summary.educationCount, color: "#0d8274" },
        { icon: Wrench, label: "Skills", count: summary.skillCount, color: "#0d8274" },
        { icon: FolderGit, label: "Projects", count: summary.projectCount, color: "#0d8274" },
        { icon: Award, label: "Certifications", count: summary.certificationCount, color: "#0d8274" },
        { icon: Languages, label: "Languages", count: summary.languageCount, color: "#0d8274" },
      ]
    : [];

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        setOpen(v);
        if (!v) resetState();
      }}
    >
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-lg rounded-none border-[#102b2b]/15 bg-[#f8f4ec] p-0 overflow-hidden">
        {/* Header */}
        <div className="bg-[#102b2b] px-6 py-5 text-[#f8f4ec]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-lg font-black uppercase tracking-tight text-white">
              <FileJson className="h-5 w-5 text-[#d8f36b]" />
              Import JSON Resume
            </DialogTitle>
            <DialogDescription className="text-sm text-[#a6c0b8]">
              {step === "select" && "Upload a JSON Resume file or paste JSON content to populate your resume instantly."}
              {step === "preview" && "Review what we found — then confirm to import all data into your editor."}
              {step === "done" && "Your resume data has been imported successfully!"}
            </DialogDescription>
          </DialogHeader>
        </div>

        <div className="px-6 pb-6 pt-4">
          <AnimatePresence mode="wait">
            {/* Step 1: Select Source */}
            {step === "select" && (
              <motion.div
                key="select"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                <Tabs
                  value={activeTab}
                  onValueChange={(v) => setActiveTab(v as "file" | "paste")}
                  className="space-y-4"
                >
                  <TabsList className="grid w-full grid-cols-2 rounded-none bg-[#e9eee8] h-11">
                    <TabsTrigger
                      value="file"
                      className="rounded-none data-[state=active]:bg-[#102b2b] data-[state=active]:text-[#f8f4ec] text-xs font-bold uppercase tracking-widest gap-2"
                    >
                      <Upload className="h-3.5 w-3.5" />
                      Upload File
                    </TabsTrigger>
                    <TabsTrigger
                      value="paste"
                      className="rounded-none data-[state=active]:bg-[#102b2b] data-[state=active]:text-[#f8f4ec] text-xs font-bold uppercase tracking-widest gap-2"
                    >
                      <ClipboardPaste className="h-3.5 w-3.5" />
                      Paste JSON
                    </TabsTrigger>
                  </TabsList>

                  {/* File Upload Tab */}
                  <TabsContent value="file" className="space-y-3 m-0">
                    <div
                      className={`
                        relative flex flex-col items-center justify-center border-2 border-dashed px-6 py-10 text-center
                        transition-all cursor-pointer
                        ${
                          isDragOver
                            ? "border-[#0d8274] bg-[#0d8274]/10"
                            : "border-[#102b2b]/20 bg-[#e9eee8]/50 hover:border-[#0d8274]/50 hover:bg-[#e9eee8]"
                        }
                      `}
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onDrop={handleDrop}
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept=".json"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleFileSelect(file);
                        }}
                      />
                      <div className="p-3 bg-[#102b2b]/10 mb-3">
                        <FileJson className="h-8 w-8 text-[#0d8274]" />
                      </div>
                      <p className="text-sm font-bold text-[#102b2b]">
                        {isDragOver ? "Drop your file here" : "Drag & drop a .json file"}
                      </p>
                      <p className="mt-1 text-xs text-[#102b2b]/55">
                        or click to browse • Supports{" "}
                        <a
                          href="https://jsonresume.org/schema/"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[#0d8274] underline"
                          onClick={(e) => e.stopPropagation()}
                        >
                          JSON Resume
                        </a>{" "}
                        standard
                      </p>
                      {fileName && (
                        <p className="mt-2 text-xs font-semibold text-[#0d8274]">
                          Selected: {fileName}
                        </p>
                      )}
                    </div>
                  </TabsContent>

                  {/* Paste JSON Tab */}
                  <TabsContent value="paste" className="space-y-3 m-0">
                    <Textarea
                      placeholder={'{\n  "basics": {\n    "name": "Jane Smith",\n    "email": "jane@example.com"\n  },\n  "work": [...],\n  "skills": [...]\n}'}
                      className="min-h-[180px] rounded-none border-[#102b2b]/15 bg-[#e9eee8]/50 font-mono text-xs text-[#102b2b] placeholder:text-[#102b2b]/30 focus:ring-[#0d8274]"
                      value={pasteContent}
                      onChange={(e) => {
                        setPasteContent(e.target.value);
                        setParseError(null);
                      }}
                    />
                    <Button
                      onClick={handlePasteSubmit}
                      disabled={!pasteContent.trim()}
                      className="w-full h-11 rounded-none bg-[#102b2b] text-[#f8f4ec] font-bold uppercase tracking-widest text-xs hover:bg-[#1a3f3f]"
                    >
                      <ArrowRight className="mr-2 h-4 w-4" />
                      Parse JSON
                    </Button>
                  </TabsContent>
                </Tabs>

                {/* Error display */}
                {parseError && (
                  <motion.div
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-3 flex items-start gap-2 border border-red-200 bg-red-50 p-3"
                  >
                    <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-500" />
                    <p className="text-xs text-red-700">{parseError}</p>
                  </motion.div>
                )}
              </motion.div>
            )}

            {/* Step 2: Preview parsed data */}
            {step === "preview" && parsedData && (
              <motion.div
                key="preview"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="space-y-4"
              >
                {/* Candidate name & quick stats */}
                {parsedData.profile.full_name && (
                  <div className="flex items-center gap-3 border-b border-[#102b2b]/10 pb-3">
                    <div className="flex h-10 w-10 items-center justify-center bg-[#102b2b] text-[#d8f36b] font-black text-sm">
                      {parsedData.profile.full_name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")
                        .slice(0, 2)
                        .toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-[#102b2b]">{parsedData.profile.full_name}</p>
                      <p className="text-xs text-[#102b2b]/55">
                        {parsedData.profile.email || parsedData.profile.location || "Resume import preview"}
                      </p>
                    </div>
                  </div>
                )}

                {/* Section counts */}
                <div className="grid grid-cols-2 gap-2">
                  {statItems
                    .filter((s) => s.count > 0)
                    .map((stat) => {
                      const Icon = stat.icon;
                      return (
                        <div
                          key={stat.label}
                          className="flex items-center gap-2.5 border border-[#102b2b]/10 bg-[#e9eee8]/60 px-3 py-2.5"
                        >
                          <Icon className="h-4 w-4 text-[#0d8274]" />
                          <div>
                            <p className="text-xs font-bold text-[#102b2b]">{stat.count}</p>
                            <p className="text-[10px] uppercase tracking-wider text-[#102b2b]/50">{stat.label}</p>
                          </div>
                        </div>
                      );
                    })}
                </div>

                {/* Summary if present */}
                {parsedData.profile.summary && (
                  <div className="border border-[#102b2b]/10 bg-[#e9eee8]/40 p-3">
                    <p className="mb-1 text-[10px] font-bold uppercase tracking-widest text-[#52716a]">Summary</p>
                    <p className="text-xs leading-relaxed text-[#102b2b]/75 line-clamp-3">
                      {parsedData.profile.summary.replace(/<[^>]*>?/gm, "")}
                    </p>
                  </div>
                )}

                {/* Action buttons */}
                <div className="flex gap-2 pt-1">
                  <Button
                    variant="outline"
                    className="flex-1 h-11 rounded-none border-[#102b2b]/15 font-bold uppercase tracking-widest text-xs text-[#102b2b] hover:bg-[#e9eee8]"
                    onClick={() => {
                      setStep("select");
                      setParsedData(null);
                      setSummary(null);
                    }}
                  >
                    Back
                  </Button>
                  <Button
                    className="flex-1 h-11 rounded-none bg-[#d8f36b] text-[#102b2b] font-bold uppercase tracking-widest text-xs hover:bg-[#c9e95c]"
                    onClick={handleConfirmImport}
                  >
                    <CheckCircle2 className="mr-2 h-4 w-4" />
                    Import Data
                  </Button>
                </div>
              </motion.div>
            )}

            {/* Step 3: Done */}
            {step === "done" && (
              <motion.div
                key="done"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
                className="flex flex-col items-center py-8 text-center"
              >
                <div className="mb-4 flex h-16 w-16 items-center justify-center bg-[#0d8274]/15">
                  <CheckCircle2 className="h-8 w-8 text-[#0d8274]" />
                </div>
                <h3 className="text-lg font-black uppercase tracking-tight text-[#102b2b]">Import Complete</h3>
                <p className="mt-1 text-sm text-[#102b2b]/55">All sections have been populated in the editor.</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </DialogContent>
    </Dialog>
  );
}
