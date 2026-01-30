"use client";

import React from "react"

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ArrowLeft, Loader2, FileText, Upload, Sparkles } from "lucide-react";
import { toast } from "sonner";

export default function NewResumePage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    if (!title.trim()) {
      setError("Please enter a title for your resume");
      setIsLoading(false);
      return;
    }

    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setError("You must be logged in to create a resume");
      setIsLoading(false);
      return;
    }

    const { data, error: insertError } = await supabase
      .from("resumes")
      .insert({
        user_id: user.id,
        title: title.trim(),
      })
      .select()
      .single();

    if (insertError) {
      setError(insertError.message);
      setIsLoading(false);
      return;
    }

    toast.success("Resume created!");
    router.push(`/dashboard/resume/${data.id}`);
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
          <h1 className="text-2xl font-bold tracking-tight">Create New Resume</h1>
          <p className="text-muted-foreground">
            Start fresh or import from an existing resume
          </p>
        </div>
      </div>

      {/* Create from scratch */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <FileText className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-lg">Start from Scratch</CardTitle>
              <CardDescription>
                Create a new blank resume and fill in your details
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <form onSubmit={handleCreate}>
          <CardContent className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <div className="space-y-2">
              <Label htmlFor="title">Resume Title</Label>
              <Input
                id="title"
                placeholder="e.g., Software Engineer Resume, Marketing Manager 2024"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                disabled={isLoading}
                className="min-h-[44px]"
              />
              <p className="text-xs text-muted-foreground">
                This is for your reference only. Recruiters won&apos;t see this.
              </p>
            </div>
          </CardContent>
          <CardFooter>
            <Button
              type="submit"
              disabled={isLoading}
              className="min-h-[44px] gap-2"
            >
              {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
              Create Resume
            </Button>
          </CardFooter>
        </form>
      </Card>

      {/* Other options */}
      <div className="grid gap-4 sm:grid-cols-2">
        <Card className="transition-all hover:border-primary/30 hover:shadow-md">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/20">
                <Upload className="h-5 w-5 text-accent-foreground" />
              </div>
              <div>
                <CardTitle className="text-lg">Upload PDF</CardTitle>
                <CardDescription>
                  Import from an existing resume
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Upload your existing PDF resume and our AI will extract all your
              information automatically.
            </p>
          </CardContent>
          <CardFooter>
            <Button asChild variant="outline" className="min-h-[44px] w-full bg-transparent">
              <Link href="/dashboard/upload">Upload Resume</Link>
            </Button>
          </CardFooter>
        </Card>

        <Card className="transition-all hover:border-primary/30 hover:shadow-md">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <Sparkles className="h-5 w-5 text-primary" />
              </div>
              <div>
                <CardTitle className="text-lg">AI Assistant</CardTitle>
                <CardDescription>
                  Let AI help you build
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Answer a few questions and let our AI create a professional resume
              tailored to your experience.
            </p>
          </CardContent>
          <CardFooter>
            <Button asChild variant="outline" className="min-h-[44px] w-full bg-transparent">
              <Link href="/dashboard/resume/new/ai">Start with AI</Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
