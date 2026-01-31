"use client";

import { useResumeStore } from "@/lib/stores/resume-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import dynamic from "next/dynamic";

const RichTextEditor = dynamic(() => import("../rich-text-editor").then(mod => mod.RichTextEditor), {
  ssr: false,
  loading: () => <div className="h-[150px] w-full animate-pulse rounded-md bg-muted/50" />
});
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Sparkles, Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export function PersonalInfoForm() {
  const { profile, updateProfile } = useResumeStore();
  const [isImproving, setIsImproving] = useState(false);

  const handleImproveSummary = async () => {
    if (!profile?.summary) {
      toast.error("Please write a summary first");
      return;
    }

    setIsImproving(true);
    try {
      const response = await fetch("/api/ai/improve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: profile.summary,
          type: "summary",
        }),
      });

      if (!response.ok) throw new Error("Failed to improve summary");

      const { improved } = await response.json();
      updateProfile({ summary: improved });
      toast.success("Summary improved!");
    } catch {
      toast.error("Failed to improve summary");
    } finally {
      setIsImproving(false);
    }
  };

  if (!profile) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Personal Information</CardTitle>
        <CardDescription>
          Your basic contact details and professional summary
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="fullName">Full Name</Label>
            <Input
              id="fullName"
              value={profile.full_name || ""}
              onChange={(e) => updateProfile({ full_name: e.target.value })}
              placeholder="John Doe"
              className="min-h-[44px]"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={profile.email || ""}
              onChange={(e) => updateProfile({ email: e.target.value })}
              placeholder="john@example.com"
              className="min-h-[44px]"
            />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="phone">Phone</Label>
            <Input
              id="phone"
              value={profile.phone || ""}
              onChange={(e) => updateProfile({ phone: e.target.value })}
              placeholder="+1 (555) 123-4567"
              className="min-h-[44px]"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="location">Location</Label>
            <Input
              id="location"
              value={profile.location || ""}
              onChange={(e) => updateProfile({ location: e.target.value })}
              placeholder="San Francisco, CA"
              className="min-h-[44px]"
            />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="linkedin">LinkedIn URL</Label>
            <Input
              id="linkedin"
              value={profile.linkedin_url || ""}
              onChange={(e) => updateProfile({ linkedin_url: e.target.value })}
              placeholder="linkedin.com/in/johndoe"
              className="min-h-[44px]"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="website">Website</Label>
            <Input
              id="website"
              value={profile.website_url || ""}
              onChange={(e) => updateProfile({ website_url: e.target.value })}
              placeholder="johndoe.com"
              className="min-h-[44px]"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="github">GitHub URL</Label>
          <Input
            id="github"
            value={profile.github_url || ""}
            onChange={(e) => updateProfile({ github_url: e.target.value })}
            placeholder="github.com/johndoe"
            className="min-h-[44px]"
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="summary">Professional Summary</Label>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleImproveSummary}
              disabled={isImproving || !profile.summary}
              className="min-h-[44px] gap-1 text-xs"
            >
              {isImproving ? (
                <Loader2 className="h-3 w-3 animate-spin" />
              ) : (
                <Sparkles className="h-3 w-3" />
              )}
              Improve with AI
            </Button>
          </div>
          <RichTextEditor
            content={profile.summary || ""}
            onChange={(content) => updateProfile({ summary: content })}
            placeholder="A brief 2-4 sentence summary of your professional background and career goals..."
          />
        </div>
      </CardContent>
    </Card>
  );
}
