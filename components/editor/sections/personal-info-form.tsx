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
import { Sparkles, Loader2, RefreshCw } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";

export function PersonalInfoForm() {
  const { profile, updateProfile } = useResumeStore();
  const [isImproving, setIsImproving] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  const handleSyncFromProfile = async () => {
    setIsSyncing(true);
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error("You must be logged in to sync profile settings");
        return;
      }
      
      const { data: dbProfile, error } = await supabase
        .from("profiles")
        .select("full_name, email, bio")
        .eq("id", user.id)
        .single();
        
      if (error || !dbProfile) throw new Error("Could not find user profile settings");

      updateProfile({
        full_name: dbProfile.full_name || profile?.full_name || "",
        email: dbProfile.email || profile?.email || "",
        summary: dbProfile.bio || profile?.summary || "",
      });

      toast.success("Synced basic info from your account settings!");
    } catch (err) {
      console.error(err);
      toast.error("Failed to sync from profile settings");
    } finally {
      setIsSyncing(false);
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
          <CardTitle className="text-sm font-black uppercase tracking-tight text-[#102b2b]">Personal Information</CardTitle>
          <CardDescription className="text-xs text-[#52716a] font-semibold mt-1">
            Your basic contact details and professional summary
          </CardDescription>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleSyncFromProfile}
          disabled={isSyncing}
          className="gap-1.5 h-9 rounded-none border-[#102b2b]/20 bg-white/80 hover:bg-white text-[#102b2b] text-xs font-bold transition-all shadow-sm"
        >
          {isSyncing ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <RefreshCw className="h-3.5 w-3.5 text-[#0d8274]" />
          )}
          Sync Profile
        </Button>
      </CardHeader>
      <CardContent className="space-y-5 p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="fullName" className="text-[10px] font-bold text-[#52716a] uppercase tracking-wider">Full Name</Label>
            <Input
              id="fullName"
              value={profile.full_name || ""}
              onChange={(e) => updateProfile({ full_name: e.target.value })}
              placeholder="John Doe"
              className="h-10 rounded-none border-[#102b2b]/15 bg-white/80 focus-visible:ring-[#102b2b]"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="email" className="text-[10px] font-bold text-[#52716a] uppercase tracking-wider">Email</Label>
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
            <Label htmlFor="phone" className="text-[10px] font-bold text-[#52716a] uppercase tracking-wider">Phone</Label>
            <Input
              id="phone"
              value={profile.phone || ""}
              onChange={(e) => updateProfile({ phone: e.target.value })}
              placeholder="+1 (555) 123-4567"
              className="h-10 rounded-none border-[#102b2b]/15 bg-white/80 focus-visible:ring-[#102b2b]"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="location" className="text-[10px] font-bold text-[#52716a] uppercase tracking-wider">Location</Label>
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
            <Label htmlFor="linkedin" className="text-[10px] font-bold text-[#52716a] uppercase tracking-wider">LinkedIn URL</Label>
            <Input
              id="linkedin"
              value={profile.linkedin_url || ""}
              onChange={(e) => updateProfile({ linkedin_url: e.target.value })}
              placeholder="linkedin.com/in/johndoe"
              className="h-10 rounded-none border-[#102b2b]/15 bg-white/80 focus-visible:ring-[#102b2b]"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="website" className="text-[10px] font-bold text-[#52716a] uppercase tracking-wider">Website</Label>
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
          <Label htmlFor="github" className="text-[10px] font-bold text-[#52716a] uppercase tracking-wider">GitHub URL</Label>
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
            <Label htmlFor="summary" className="text-[10px] font-bold text-[#52716a] uppercase tracking-wider">Professional Summary</Label>
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
