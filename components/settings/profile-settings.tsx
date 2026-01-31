"use client"

import * as React from "react"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { AvatarUpload } from "@/components/settings/avatar-upload"

interface ProfileSettingsProps {
    profile: any
    user: any
}

export function ProfileSettings({ profile, user }: ProfileSettingsProps) {
    const router = useRouter()
    const [loading, setLoading] = React.useState(false)
    const [formData, setFormData] = React.useState({
        full_name: profile?.full_name || "",
        bio: profile?.bio || "",
        location: profile?.location || "",
        website_url: profile?.website_url || "",
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
            const supabase = createClient()

            const { error } = await supabase
                .from("profiles")
                .update(formData)
                .eq("id", profile.id)

            if (error) throw error

            toast.success("Profile updated successfully")
            router.refresh()
        } catch (error: any) {
            toast.error(error.message || "Failed to update profile")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="space-y-6">
            <AvatarUpload profile={profile} />

            <div className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="full_name">Full Name</Label>
                    <Input
                        id="full_name"
                        name="full_name"
                        value={formData.full_name}
                        onChange={handleChange}
                        placeholder="John Doe"
                        className="glass-border"
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                        id="email"
                        type="email"
                        value={user?.email || ""}
                        disabled
                        className="glass-border bg-muted/50"
                    />
                    <p className="text-xs text-muted-foreground">
                        Contact support to change your email address.
                    </p>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="bio">Bio</Label>
                    <Textarea
                        id="bio"
                        name="bio"
                        value={formData.bio}
                        onChange={handleChange}
                        placeholder="Tell us about yourself..."
                        rows={4}
                        className="glass-border resize-none"
                    />
                    <p className="text-xs text-muted-foreground">
                        Brief description for your public profile.
                    </p>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                        <Label htmlFor="location">Location</Label>
                        <Input
                            id="location"
                            name="location"
                            value={formData.location}
                            onChange={handleChange}
                            placeholder="San Francisco, CA"
                            className="glass-border"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="website_url">Website</Label>
                        <Input
                            id="website_url"
                            name="website_url"
                            type="url"
                            value={formData.website_url}
                            onChange={handleChange}
                            placeholder="https://yourwebsite.com"
                            className="glass-border"
                        />
                    </div>
                </div>
            </div>

            <Button
                onClick={handleSave}
                disabled={loading}
                className="w-full sm:w-auto bg-gradient-to-br from-primary to-primary/80 font-black"
            >
                {loading ? "Saving..." : "Save Changes"}
            </Button>
        </div>
    )
}
