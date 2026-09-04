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
import { Sparkles, Loader2, RefreshCw, UploadCloud, CheckCircle2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export function PersonalInfoForm() {
  const { profile, updateProfile, resumeId } = useResumeStore();
  const [isImproving, setIsImproving] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isPushing, setIsPushing] = useState(false);

  // Pull global profile defaults into this specific resume
  const handleSyncFromProfile = async () => {
    setIsSyncing(true);
    try {
      const res = await fetch("/api/profile/sync");
      if (!res.ok) throw new Error("Could not fetch profile settings");
      const data = await res.json();
      const contact = data.contact;

      if (!contact) throw new Error("No profile contact data found");

      updateProfile({
        full_name: contact.full_name || profile?.full_name || "",
        email: contact.email || profile?.email || "",
        phone: contact.phone || profile?.phone || "",
        location: contact.location || profile?.location || "",
        linkedin_url: contact.linkedin || profile?.linkedin_url || "",
        website_url: contact.website || profile?.website_url || "",
        github_url: contact.github || profile?.github_url || "",
        summary: contact.summary || profile?.summary || "",
      });

      toast.success("Synchronized contact info from account defaults!");
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Failed to sync from profile settings");
    } finally {
      setIsSyncing(false);
    }
  };

  // Push this resume's contact info back as the global account default
  const handleSaveAsDefault = async () => {
    if (!profile) return;
    setIsPushing(true);
    try {
      const res = await fetch("/api/profile/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "push_from_resume",
          resumeId,
          contactData: {
            full_name: profile.full_name,
            email: profile.email,
            phone: profile.phone,
            location: profile.location,
            linkedin: profile.linkedin_url,
            website: profile.website_url,
            github: profile.github_url,
            summary: profile.summary,
          },
        }),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to save as default");

      toast.success("Saved contact info as your global account default!");
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Failed to save profile defaults");
    } finally {
      setIsPushing(false);
    }
  };

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
    <Card className="rounded-none border-[#102b2b]/15 bg-[#f8f4ec] shadow-[4px_4px_0_rgba(16,43,43,0.06)]">
      <CardHeader className="bg-[#e9eee8] border-b border-[#102b2b]/10 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 space-y-0">
        <div>
          <CardTitle className="text-sm font-black uppercase tracking-tight text-[#102b2b]">
            Personal Information
          </CardTitle>
          <CardDescription className="text-xs text-[#52716a] font-semibold mt-1">
            Your contact details and professional summary
          </CardDescription>
        </div>
        <div className="flex items-center gap-2">
          {/* Pull from Profile */}
          <Button
            variant="outline"
            size="sm"
            onClick={handleSyncFromProfile}
            disabled={isSyncing}
            className="gap-1.5 h-9 rounded-none border-[#102b2b]/20 bg-white/80 hover:bg-white text-[#102b2b] text-xs font-bold transition-all shadow-sm"
            title="Import contact defaults from Account Settings"
          >
            {isSyncing ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <RefreshCw className="h-3.5 w-3.5 text-[#0d8274]" />
            )}
            Pull Profile
          </Button>

          {/* Push to Profile as Default */}
          <Button
            variant="outline"
            size="sm"
            onClick={handleSaveAsDefault}
            disabled={isPushing}
            className="gap-1.5 h-9 rounded-none border-[#102b2b]/20 bg-white/80 hover:bg-[#d8f36b]/40 text-[#102b2b] text-xs font-bold transition-all shadow-sm"
            title="Save this resume's contact info as global account defaults"
          >
            {isPushing ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <UploadCloud className="h-3.5 w-3.5 text-[#102b2b]" />
            )}
            Save as Default
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-5 p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="fullName" className="text-[10px] font-bold text-[#52716a] uppercase tracking-wider">
              Full Name
            </Label>
            <Input
              id="fullName"
              value={profile.full_name || ""}
              onChange={(e) => updateProfile({ full_name: e.target.value })}
              placeholder="John Doe"
              className="h-10 rounded-none border-[#102b2b]/15 bg-white/80 focus-visible:ring-[#102b2b]"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="email" className="text-[10px] font-bold text-[#52716a] uppercase tracking-wider">
              Email
            </Label>
            <Input
              id="email"
              type="email"
              value={profile.email || ""}
              onChange={(e) => updateProfile({ email: e.target.value })}
              placeholder="john@example.com"
              className="h-10 rounded-none border-[#102b2b]/15 bg-white/80 focus-visible:ring-[#102b2b]"
            />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="phone" className="text-[10px] font-bold text-[#52716a] uppercase tracking-wider">
              Phone
            </Label>
            <Input
              id="phone"
              value={profile.phone || ""}
              onChange={(e) => updateProfile({ phone: e.target.value })}
              placeholder="+1 (555) 123-4567"
              className="h-10 rounded-none border-[#102b2b]/15 bg-white/80 focus-visible:ring-[#102b2b]"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="location" className="text-[10px] font-bold text-[#52716a] uppercase tracking-wider">
              Location
            </Label>
            <Input
              id="location"
              value={profile.location || ""}
              onChange={(e) => updateProfile({ location: e.target.value })}
              placeholder="San Francisco, CA"
              className="h-10 rounded-none border-[#102b2b]/15 bg-white/80 focus-visible:ring-[#102b2b]"
            />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="linkedin" className="text-[10px] font-bold text-[#52716a] uppercase tracking-wider">
              LinkedIn URL
            </Label>
            <Input
              id="linkedin"
              value={profile.linkedin_url || ""}
              onChange={(e) => updateProfile({ linkedin_url: e.target.value })}
              placeholder="linkedin.com/in/johndoe"
              className="h-10 rounded-none border-[#102b2b]/15 bg-white/80 focus-visible:ring-[#102b2b]"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="website" className="text-[10px] font-bold text-[#52716a] uppercase tracking-wider">
              Website
            </Label>
            <Input
              id="website"
              value={profile.website_url || ""}
              onChange={(e) => updateProfile({ website_url: e.target.value })}
              placeholder="johndoe.com"
              className="h-10 rounded-none border-[#102b2b]/15 bg-white/80 focus-visible:ring-[#102b2b]"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="github" className="text-[10px] font-bold text-[#52716a] uppercase tracking-wider">
            GitHub URL
          </Label>
          <Input
            id="github"
            value={profile.github_url || ""}
            onChange={(e) => updateProfile({ github_url: e.target.value })}
            placeholder="github.com/johndoe"
            className="h-10 rounded-none border-[#102b2b]/15 bg-white/80 focus-visible:ring-[#102b2b]"
          />
        </div>

        <div className="space-y-2 pt-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="summary" className="text-[10px] font-bold text-[#52716a] uppercase tracking-wider">
              Professional Summary
            </Label>
            <Button
              variant="outline"
              size="sm"
              onClick={handleImproveSummary}
              disabled={isImproving || !profile.summary}
              className="h-8 gap-1.5 rounded-none border-[#102b2b]/15 bg-white/80 hover:bg-[#d8f36b]/30 text-[#102b2b] text-xs font-bold"
            >
              {isImproving ? (
                <Loader2 className="h-3 w-3 animate-spin" />
              ) : (
                <Sparkles className="h-3 w-3 text-indigo-600" />
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
