"use client"

import * as React from "react"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { AvatarUpload } from "@/components/settings/avatar-upload"
import { RefreshCw, CheckCircle2, Phone, Linkedin, Github, Globe, MapPin, Sparkles, Loader2 } from "lucide-react"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

interface ProfileSettingsProps {
    profile: any
    user: any
}

export function ProfileSettings({ profile, user }: ProfileSettingsProps) {
    const router = useRouter()
    const [loading, setLoading] = React.useState(false)
    const [syncingAll, setSyncingAll] = React.useState(false)

    const initialContact = profile?.settings?.contact || {}

    const [formData, setFormData] = React.useState({
        full_name: profile?.full_name || "",
        bio: profile?.bio || "",
        location: profile?.location || "",
        website_url: profile?.website_url || "",
        phone: initialContact.phone || profile?.phone || "",
        linkedin_url: initialContact.linkedin || profile?.linkedin_url || "",
        github_url: initialContact.github || profile?.github_url || "",
    })

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData(prev => ({
            ...prev,
            [e.target.name]: e.target.value
        }))
    }

    const handleSave = async () => {
        setLoading(true)
        try {
            const res = await fetch("/api/profile/sync", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    action: "update_profile",
                    contactData: {
                        full_name: formData.full_name,
                        email: user?.email,
                        bio: formData.bio,
                        location: formData.location,
                        website: formData.website_url,
                        phone: formData.phone,
                        linkedin: formData.linkedin_url,
                        github: formData.github_url,
                    },
                }),
            })

            const json = await res.json()
            if (!res.ok) throw new Error(json.error || "Failed to update profile")

            toast.success("Profile & contact defaults updated successfully")
            router.refresh()
        } catch (error: any) {
            toast.error(error.message || "Failed to update profile")
        } finally {
            setLoading(false)
        }
    }

    const handleBroadcastSync = async () => {
        setSyncingAll(true)
        try {
            const res = await fetch("/api/profile/sync", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    action: "broadcast_to_resumes",
                    contactData: {
                        full_name: formData.full_name,
                        email: user?.email,
                        bio: formData.bio,
                        summary: formData.bio,
                        location: formData.location,
                        website: formData.website_url,
                        phone: formData.phone,
                        linkedin: formData.linkedin_url,
                        github: formData.github_url,
                    },
                }),
            })

            const json = await res.json()
            if (!res.ok) throw new Error(json.error || "Failed to broadcast sync to resumes")

            toast.success(`Synced contact details across ${json.updatedCount ?? 0} resume(s)!`)
            router.refresh()
        } catch (error: any) {
            toast.error(error.message || "Failed to broadcast sync")
        } finally {
            setSyncingAll(false)
        }
    }

    return (
        <div className="space-y-8">
            <AvatarUpload profile={profile} />

            <div className="space-y-6">
                <div className="space-y-2">
                    <Label htmlFor="full_name" className="text-xs font-bold uppercase tracking-wider text-[#52716a]">
                        Full Name
                    </Label>
                    <Input
                        id="full_name"
                        name="full_name"
                        value={formData.full_name}
                        onChange={handleChange}
                        placeholder="John Doe"
                        className="h-11 rounded-none border-input bg-background font-medium"
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="email" className="text-xs font-bold uppercase tracking-wider text-[#52716a]">
                        Email Address
                    </Label>
                    <Input
                        id="email"
                        type="email"
                        value={user?.email || ""}
                        disabled
                        className="h-11 rounded-none border-input bg-muted/50 font-medium"
                    />
                    <p className="text-xs text-muted-foreground">
                        Authentication email. Contact support to change your account email.
                    </p>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                        <Label htmlFor="phone" className="text-xs font-bold uppercase tracking-wider text-[#52716a] flex items-center gap-1.5">
                            <Phone className="h-3.5 w-3.5 text-[#0d8274]" />
                            Phone Number
                        </Label>
                        <Input
                            id="phone"
                            name="phone"
                            value={formData.phone}
                            onChange={handleChange}
                            placeholder="+1 (555) 019-2834"
                            className="h-11 rounded-none border-input bg-background"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="location" className="text-xs font-bold uppercase tracking-wider text-[#52716a] flex items-center gap-1.5">
                            <MapPin className="h-3.5 w-3.5 text-[#0d8274]" />
                            Location
                        </Label>
                        <Input
                            id="location"
                            name="location"
                            value={formData.location}
                            onChange={handleChange}
                            placeholder="San Francisco, CA"
                            className="h-11 rounded-none border-input bg-background"
                        />
                    </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-3">
                    <div className="space-y-2">
                        <Label htmlFor="linkedin_url" className="text-xs font-bold uppercase tracking-wider text-[#52716a] flex items-center gap-1.5">
                            <Linkedin className="h-3.5 w-3.5 text-[#0d8274]" />
                            LinkedIn URL
                        </Label>
                        <Input
                            id="linkedin_url"
                            name="linkedin_url"
                            value={formData.linkedin_url}
                            onChange={handleChange}
                            placeholder="linkedin.com/in/johndoe"
                            className="h-11 rounded-none border-input bg-background text-xs"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="github_url" className="text-xs font-bold uppercase tracking-wider text-[#52716a] flex items-center gap-1.5">
                            <Github className="h-3.5 w-3.5 text-[#0d8274]" />
                            GitHub URL
                        </Label>
                        <Input
                            id="github_url"
                            name="github_url"
                            value={formData.github_url}
                            onChange={handleChange}
                            placeholder="github.com/johndoe"
                            className="h-11 rounded-none border-input bg-background text-xs"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="website_url" className="text-xs font-bold uppercase tracking-wider text-[#52716a] flex items-center gap-1.5">
                            <Globe className="h-3.5 w-3.5 text-[#0d8274]" />
                            Website / Portfolio
                        </Label>
                        <Input
                            id="website_url"
                            name="website_url"
                            type="url"
                            value={formData.website_url}
                            onChange={handleChange}
                            placeholder="https://johndoe.dev"
                            className="h-11 rounded-none border-input bg-background text-xs"
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="bio" className="text-xs font-bold uppercase tracking-wider text-[#52716a]">
                        Professional Bio / Summary
                    </Label>
                    <Textarea
                        id="bio"
                        name="bio"
                        value={formData.bio}
                        onChange={handleChange}
                        placeholder="Brief summary of your professional background, core expertise, and career goals..."
                        rows={4}
                        className="rounded-none border-input bg-background resize-none"
                    />
                    <p className="text-xs text-muted-foreground">
                        Default summary used for portfolio previews and seeding new resumes.
                    </p>
                </div>
            </div>

            {/* Profile Action Bar */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 pt-4 border-t border-border">
                <Button
                    onClick={handleSave}
                    disabled={loading}
                    className="min-h-11 rounded-none bg-[#102b2b] font-black text-[#f8f4ec] hover:bg-[#1a3d3d] px-8"
                >
                    {loading ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Saving...
                        </>
                    ) : (
                        "Save Profile Changes"
                    )}
                </Button>

                {/* Broadcast Sync to All Resumes */}
                <AlertDialog>
                    <AlertDialogTrigger asChild>
                        <Button
                            variant="outline"
                            disabled={syncingAll}
                            className="min-h-11 rounded-none border-[#102b2b]/20 bg-[#f8f4ec] text-[#102b2b] hover:bg-[#d8f36b]/40 font-bold gap-2"
                        >
                            {syncingAll ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                                <RefreshCw className="h-4 w-4 text-[#0d8274]" />
                            )}
                            Sync Contact Info to All Resumes
                        </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent className="rounded-none border-[#102b2b]/20">
                        <AlertDialogHeader>
                            <AlertDialogTitle className="text-lg font-black uppercase tracking-tight text-[#102b2b] flex items-center gap-2">
                                <Sparkles className="h-4 w-4 text-[#0d8274]" />
                                Broadcast Sync to All Resumes
                            </AlertDialogTitle>
                            <AlertDialogDescription className="text-sm text-[#52716a] leading-relaxed pt-2">
                                This will update the contact details (Name, Email, Phone, Location, LinkedIn, GitHub, Website) across <strong>every active resume</strong> in your workspace with your current profile settings.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter className="pt-4">
                            <AlertDialogCancel className="rounded-none border-[#102b2b]/20">
                                Cancel
                            </AlertDialogCancel>
                            <AlertDialogAction
                                onClick={handleBroadcastSync}
                                className="rounded-none bg-[#102b2b] text-[#f8f4ec] hover:bg-[#1a3d3d] font-bold"
                            >
                                Confirm Broadcast
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </div>
        </div>
    )
}
