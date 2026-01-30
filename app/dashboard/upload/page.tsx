"use client";

import React from "react"

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import {
  ArrowLeft,
  Upload,
  FileText,
  Loader2,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import { toast } from "sonner";

type UploadStatus = "idle" | "uploading" | "processing" | "success" | "error";

export default function UploadPage() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<UploadStatus>("idle");
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && droppedFile.type === "application/pdf") {
      setFile(droppedFile);
      setError(null);
    } else {
      setError("Please upload a PDF file");
    }
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile && selectedFile.type === "application/pdf") {
      setFile(selectedFile);
      setError(null);
    } else {
      setError("Please upload a PDF file");
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setStatus("uploading");
    setProgress(20);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      setProgress(40);
      setStatus("processing");

      const response = await fetch("/api/resume/parse", {
        method: "POST",
        body: formData,
      });

      setProgress(80);

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to process resume");
      }

      const data = await response.json();

      setProgress(100);
      setStatus("success");

      toast.success("Resume uploaded and processed!");

      // Redirect to the new resume editor
      setTimeout(() => {
        router.push(`/dashboard/resume/${data.resumeId}`);
      }, 1500);
    } catch (err) {
      setStatus("error");
      setError(err instanceof Error ? err.message : "An error occurred");
    }
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="flex items-center gap-4">
        <Button asChild variant="ghost" size="icon" className="min-h-[44px] min-w-[44px]">
          <Link href="/dashboard">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Upload Resume</h1>
          <p className="text-muted-foreground">
            Upload your existing resume to extract data
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Upload PDF Resume</CardTitle>
          <CardDescription>
            Our AI will automatically extract your information including work
            experience, education, skills, and more.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {status === "success" ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
                <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="text-lg font-semibold">Upload Complete!</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Your resume has been processed. Redirecting to editor...
              </p>
            </div>
          ) : (
            <>
              {/* Drop zone */}
              <div
                className={`relative rounded-lg border-2 border-dashed p-8 text-center transition-colors ${
                  isDragging
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-primary/50"
                }`}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
              >
                <input
                  type="file"
                  accept=".pdf"
                  onChange={handleFileSelect}
                  className="absolute inset-0 cursor-pointer opacity-0"
                  disabled={status !== "idle"}
                />
                <div className="flex flex-col items-center">
                  {file ? (
                    <>
                      <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                        <FileText className="h-6 w-6 text-primary" />
                      </div>
                      <p className="font-medium">{file.name}</p>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {(file.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </>
                  ) : (
                    <>
                      <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-lg bg-muted">
                        <Upload className="h-6 w-6 text-muted-foreground" />
                      </div>
                      <p className="font-medium">
                        Drop your PDF here or click to browse
                      </p>
                      <p className="mt-1 text-sm text-muted-foreground">
                        Maximum file size: 10MB
                      </p>
                    </>
                  )}
                </div>
              </div>

              {/* Progress */}
              {status !== "idle" && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>
                      {status === "uploading"
                        ? "Uploading..."
                        : status === "processing"
                          ? "Processing with AI..."
                          : "Error"}
                    </span>
                    <span>{progress}%</span>
                  </div>
                  <Progress value={progress} />
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3">
                <Button
                  onClick={handleUpload}
                  disabled={!file || status !== "idle"}
                  className="min-h-[44px] flex-1 gap-2"
                >
                  {status === "uploading" || status === "processing" ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Upload className="h-4 w-4" />
                      Upload & Extract
                    </>
                  )}
                </Button>
                {file && status === "idle" && (
                  <Button
                    variant="outline"
                    onClick={() => setFile(null)}
                    className="min-h-[44px]"
                  >
                    Clear
                  </Button>
                )}
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Info */}
      <Card className="bg-muted/30">
        <CardContent className="pt-6">
          <h3 className="font-semibold">What happens after upload?</h3>
          <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
            <li className="flex items-start gap-2">
              <span className="mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs text-primary">
                1
              </span>
              <span>
                Your PDF is securely uploaded and text is extracted
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs text-primary">
                2
              </span>
              <span>
                AI analyzes the content to identify sections and details
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs text-primary">
                3
              </span>
              <span>
                Data is structured and saved to your resume profile
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs text-primary">
                4
              </span>
              <span>
                You can review, edit, and enhance the extracted information
              </span>
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
