"use client";

import React from "react"

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useSubscriptionStore } from "@/lib/stores/subscription-store";
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
import { ImportDialog } from "@/components/import/import-dialog";

export default function NewResumePage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Subscription & Limit Check
  const { isPro, isLoading: isSubLoading, checkSubscription } = useSubscriptionStore();
  const [resumeCount, setResumeCount] = useState<number | null>(null);

  useEffect(() => {
    checkSubscription();
  }, [checkSubscription]);

  useEffect(() => {
    async function checkLimit() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { count } = await supabase
        .from("resumes")
        .select("*", { count: 'exact', head: true })
        .eq("user_id", user.id);

      setResumeCount(count || 0);
    }
    checkLimit();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();

    // Feature Gate
    if (!isPro && (resumeCount || 0) >= 1) {
      toast.error("Free plan is limited to 1 resume. Upgrade to create more!");
      router.push("/dashboard/subscription");
      return;
    }

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

    // Fetch profile for default settings
    const { data: profile } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    const { data: resume, error: insertError } = await supabase
      .from("resumes")
      .insert({
        user_id: user.id,
        title: title.trim(),
        template_id: profile?.settings?.defaultTemplate || "modern",
      })
      .select()
      .single();

    if (insertError) {
      setError(insertError.message);
      setIsLoading(false);
      return;
    }

    // Auto-populate personal_info from profile
    if (profile) {
      await supabase.from("personal_info").upsert({
        resume_id: resume.id,
        full_name: profile.full_name,
        email: profile.email,
        phone: profile.phone,
        location: profile.location,
        linkedin: profile.linkedin_url,
        github: profile.github_url,
        website: profile.website_url,
      }, { onConflict: 'resume_id' });
    }

    toast.success("Resume created!");
    router.push(`/dashboard/resume/${resume.id}`);
  };

  // Limit Reached UI
  if (!isSubLoading && !isPro && resumeCount !== null && resumeCount >= 1) {
    return (
      <div className="mx-auto max-w-3xl space-y-7">
        <Button asChild variant="ghost" size="icon">
          <Link href="/dashboard"><ArrowLeft className="h-5 w-5" /></Link>
        </Button>
        <Card className="relative overflow-hidden rounded-none border-[#102b2b]/20 bg-[#f5f7f1] shadow-none">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent pointer-events-none" />
          <CardHeader className="text-center pb-2">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-none bg-[#d8f36b]">
              <Sparkles className="h-6 w-6 text-[#102b2b]" aria-hidden="true" />
            </div>
            <CardTitle className="text-2xl font-black uppercase">Limit Reached</CardTitle>
            <CardDescription className="text-lg">
              You've reached the limit of 1 resume on the Free plan.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-muted-foreground">
              Upgrade to Pro to create <strong>unlimited resumes</strong>, access premium templates, and use AI power-ups.
            </p>
          </CardContent>
          <CardFooter className="flex justify-center pb-8">
            <Button size="lg" className="h-12 rounded-none bg-[#d8f36b] px-8 text-base font-bold text-[#102b2b] hover:bg-[#c9e95c]" onClick={() => router.push('/dashboard/subscription')}>
              Upgrade to Pro
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-7">
      <div className="flex items-center gap-4">
        <Button asChild variant="ghost" size="icon" aria-label="Back to dashboard" className="min-h-[44px] min-w-[44px] rounded-none text-[#102b2b] hover:bg-[#d8f36b]">
          <Link href="/dashboard">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-black tracking-[-0.04em] text-[#102b2b] sm:text-4xl">Create new resume</h1>
          <p className="text-[#102b2b]/65">
            Start fresh or import from an existing resume
          </p>
        </div>
      </div>

      {/* Create from scratch */}
      <Card className="rounded-none border-[#102b2b]/15 bg-[#f5f7f1] shadow-none">
        <CardHeader>
          <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-none bg-[#d8f36b]">
                <FileText className="h-5 w-5 text-[#102b2b]" aria-hidden="true" />
            </div>
            <div>
              <CardTitle className="text-lg font-bold text-[#102b2b]">Start from scratch</CardTitle>
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
              <p className="text-xs text-[#102b2b]/55">
                This is for your reference only. Recruiters won&apos;t see this.
              </p>
            </div>
          </CardContent>
          <CardFooter>
            <Button
              type="submit"
              disabled={isLoading}
              className="min-h-[44px] gap-2 rounded-none bg-[#d8f36b] text-[#102b2b] hover:bg-[#c9e95c]"
            >
              {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
              Create Resume
            </Button>
          </CardFooter>
        </form>
      </Card>

      {/* Other options */}
      <div className="grid gap-4 sm:grid-cols-2">
        <Card className="rounded-none border-[#102b2b]/15 bg-[#f5f7f1] shadow-none transition-colors hover:border-[#0d8274]">
          <CardHeader>
            <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-none bg-[#0d8274]/10">
                  <Upload className="h-5 w-5 text-[#0d8274]" aria-hidden="true" />
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
            <ImportDialog>
              <Button variant="outline" className="min-h-[44px] w-full bg-transparent">
                Import / Upload
              </Button>
            </ImportDialog>
          </CardFooter>
        </Card>

        <Card className="rounded-none border-[#102b2b]/15 bg-[#f5f7f1] shadow-none transition-colors hover:border-[#0d8274]">
          <CardHeader>
            <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-none bg-[#d8f36b]">
                  <Sparkles className="h-5 w-5 text-[#102b2b]" aria-hidden="true" />
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
