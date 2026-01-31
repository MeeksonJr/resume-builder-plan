"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { Loader2, Moon, Sun, Monitor } from "lucide-react";
import { AvatarUpload } from "./avatar-upload";

interface Profile {
    id: string;
    email: string | null;
    full_name: string | null;
    avatar_url: string | null;
    phone: string | null;
    location: string | null;
    linkedin_url: string | null;
    github_url: string | null;
    website_url: string | null;
    settings: any;
    target_role?: string | null;
    target_industry?: string | null;
    career_goals?: string | null;
}

interface SettingsFormProps {
    profile: Profile;
}

export function SettingsForm({ profile }: SettingsFormProps) {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        full_name: profile.full_name || "",
        avatar_url: profile.avatar_url || "",
        phone: profile.phone || "",
        location: profile.location || "",
        linkedin_url: profile.linkedin_url || "",
        github_url: profile.github_url || "",
        website_url: profile.website_url || "",
        default_template: profile.settings?.defaultTemplate || "modern",
        ai_tone: profile.settings?.aiTone || "professional",
        theme: profile.settings?.theme || "system",
        target_role: profile.target_role || profile.settings?.jobSearch?.targetRole || "",
        target_industry: profile.target_industry || profile.settings?.jobSearch?.industry || "",
        career_goals: profile.career_goals || "",
        salary: profile.settings?.jobSearch?.salaryExpectation || "",
    });

    const handleSave = async () => {
        setIsLoading(true);
        const supabase = createClient();

        try {
            const { error } = await supabase
                .from("profiles")
                .update({
                    full_name: formData.full_name,
                    avatar_url: formData.avatar_url,
                    phone: formData.phone,
                    location: formData.location,
                    linkedin_url: formData.linkedin_url,
                    github_url: formData.github_url,
                    website_url: formData.website_url,
                    settings: {
                        ...profile.settings,
                        defaultTemplate: formData.default_template,
                        aiTone: formData.ai_tone,
                        theme: formData.theme,
                    },
                    target_role: formData.target_role,
                    target_industry: formData.target_industry,
                    career_goals: formData.career_goals,
                })
                .eq("id", profile.id);

            if (error) throw error;

            toast.success("Settings updated successfully");
            router.refresh();
        } catch (error) {
            console.error(error);
            toast.error("Failed to update settings");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="grid gap-6">
            <Card>
                <CardHeader>
                    <CardTitle>Profile Information</CardTitle>
                    <CardDescription>
                        Your basic information used as defaults for new resumes.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="flex flex-col items-center sm:flex-row sm:items-start gap-8 border-b pb-6">
                        <AvatarUpload
                            uid={profile.id}
                            url={formData.avatar_url}
                            onUpload={(url) => setFormData({ ...formData, avatar_url: url })}
                        />
                        <div className="flex-1 space-y-1 text-center sm:text-left">
                            <h3 className="text-lg font-medium">Profile Picture</h3>
                            <p className="text-sm text-muted-foreground">
                                Upload a professional photo. This will be used in your dashboard and can be used in some resume templates.
                            </p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input id="email" value={profile.email || ""} disabled />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="full_name">Full Name</Label>
                            <Input
                                id="full_name"
                                value={formData.full_name}
                                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="phone">Phone</Label>
                            <Input
                                id="phone"
                                value={formData.phone}
                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="location">Location</Label>
                            <Input
                                id="location"
                                value={formData.location}
                                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                            />
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Job Search Preferences</CardTitle>
                    <CardDescription>
                        Help us tailor your experience based on your career goals.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                            <Label htmlFor="target_role">Target Job Role</Label>
                            <Input
                                id="target_role"
                                placeholder="e.g. Senior Software Engineer"
                                value={formData.target_role}
                                onChange={(e) => setFormData({ ...formData, target_role: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="target_industry">Preferred Industry</Label>
                            <Input
                                id="target_industry"
                                placeholder="e.g. FinTech, Healthcare"
                                value={formData.target_industry}
                                onChange={(e) => setFormData({ ...formData, target_industry: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="salary">Salary Expectation</Label>
                            <Input
                                id="salary"
                                placeholder="e.g. $120k - $150k"
                                value={formData.salary}
                                onChange={(e) => setFormData({ ...formData, salary: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="career_goals">Long-term Career Goals</Label>
                        <textarea
                            id="career_goals"
                            className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            placeholder="Describe where you want to be in 2-5 years. This helps our AI Career Coach plan your roadmap."
                            value={formData.career_goals}
                            onChange={(e) => setFormData({ ...formData, career_goals: e.target.value })}
                        />
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Links & Social</CardTitle>
                    <CardDescription>
                        Your professional profiles and websites.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                            <Label htmlFor="linkedin">LinkedIn URL</Label>
                            <Input
                                id="linkedin"
                                value={formData.linkedin_url}
                                onChange={(e) => setFormData({ ...formData, linkedin_url: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="github">GitHub URL</Label>
                            <Input
                                id="github"
                                value={formData.github_url}
                                onChange={(e) => setFormData({ ...formData, github_url: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="website">Portfolio/Website</Label>
                            <Input
                                id="website"
                                value={formData.website_url}
                                onChange={(e) => setFormData({ ...formData, website_url: e.target.value })}
                            />
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Preferences</CardTitle>
                    <CardDescription>
                        Customize your default experience.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                            <Label>Default Template</Label>
                            <Select
                                value={formData.default_template}
                                onValueChange={(val) => setFormData({ ...formData, default_template: val })}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="modern">Modern</SelectItem>
                                    <SelectItem value="minimal">Minimal</SelectItem>
                                    <SelectItem value="classic">Classic</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>AI Suggestion Tone</Label>
                            <Select
                                value={formData.ai_tone}
                                onValueChange={(val) => setFormData({ ...formData, ai_tone: val })}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="professional">Professional</SelectItem>
                                    <SelectItem value="confident">Confident</SelectItem>
                                    <SelectItem value="minimalist">Minimalist</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>Theme Preference</Label>
                            <Select
                                value={formData.theme}
                                onValueChange={(val) => setFormData({ ...formData, theme: val })}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="system">
                                        <div className="flex items-center gap-2">
                                            <Monitor className="h-4 w-4" />
                                            <span>System</span>
                                        </div>
                                    </SelectItem>
                                    <SelectItem value="light">
                                        <div className="flex items-center gap-2">
                                            <Sun className="h-4 w-4" />
                                            <span>Light</span>
                                        </div>
                                    </SelectItem>
                                    <SelectItem value="dark">
                                        <div className="flex items-center gap-2">
                                            <Moon className="h-4 w-4" />
                                            <span>Dark</span>
                                        </div>
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </CardContent>
                <CardFooter className="flex justify-end border-t px-6 py-4">
                    <Button onClick={handleSave} disabled={isLoading}>
                        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Save Changes
                    </Button>
                </CardFooter>
            </Card>

            <Card className="border-destructive/20 mt-6">
                <CardHeader>
                    <CardTitle className="text-destructive">Account Management</CardTitle>
                    <CardDescription>
                        Sensitive actions for your account.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="space-y-0.5">
                            <h4 className="text-sm font-medium">Delete Account</h4>
                            <p className="text-sm text-muted-foreground">
                                Permanently remove your account and all your data. This action is irreversible.
                            </p>
                        </div>
                        <Button
                            variant="destructive"
                            size="sm"
                            onClick={async () => {
                                if (confirm("Are you sure you want to delete your account? This will permanently delete all your resumes and data.")) {
                                    setIsLoading(true);
                                    const supabase = createClient();
                                    const { error } = await supabase.rpc('delete_user');
                                    if (error) {
                                        toast.error("Failed to delete account. Please contact support.");
                                    } else {
                                        await supabase.auth.signOut();
                                        router.push("/");
                                    }
                                    setIsLoading(false);
                                }
                            }}
                            disabled={isLoading}
                        >
                            Delete Account
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
