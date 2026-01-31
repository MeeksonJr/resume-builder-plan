"use client"

import * as React from "react"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { toast } from "sonner"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"

interface GeneralSettingsProps {
    profile: any
}

export function GeneralSettings({ profile }: GeneralSettingsProps) {
    const router = useRouter()
    const [loading, setLoading] = React.useState(false)
    const [emailNotifications, setEmailNotifications] = React.useState(
        profile?.email_notifications ?? true
    )
    const [timezone, setTimezone] = React.useState(profile?.timezone ?? "America/New_York")
    const [language, setLanguage] = React.useState(profile?.language ?? "en")

    const handleSave = async () => {
        setLoading(true)
        try {
            const supabase = createClient()

            const { error } = await supabase
                .from("profiles")
                .update({
                    email_notifications: emailNotifications,
                    timezone,
                    language,
                })
                .eq("id", profile.id)

            if (error) throw error

            toast.success("Settings saved successfully")
            router.refresh()
        } catch (error: any) {
            toast.error(error.message || "Failed to save settings")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="space-y-6">
            <div className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="language">Language</Label>
                    <Select value={language} onValueChange={setLanguage}>
                        <SelectTrigger id="language" className="glass-border">
                            <SelectValue placeholder="Select language" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="en">English</SelectItem>
                            <SelectItem value="es">Español (Coming Soon)</SelectItem>
                            <SelectItem value="fr">Français (Coming Soon)</SelectItem>
                        </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground">
                        Choose your preferred language for the interface.
                    </p>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="timezone">Timezone</Label>
                    <Select value={timezone} onValueChange={setTimezone}>
                        <SelectTrigger id="timezone" className="glass-border">
                            <SelectValue placeholder="Select timezone" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="America/New_York">Eastern Time (ET)</SelectItem>
                            <SelectItem value="America/Chicago">Central Time (CT)</SelectItem>
                            <SelectItem value="America/Denver">Mountain Time (MT)</SelectItem>
                            <SelectItem value="America/Los_Angeles">Pacific Time (PT)</SelectItem>
                            <SelectItem value="Europe/London">London (GMT)</SelectItem>
                            <SelectItem value="Europe/Paris">Paris (CET)</SelectItem>
                            <SelectItem value="Asia/Tokyo">Tokyo (JST)</SelectItem>
                        </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground">
                        Used for scheduling and time-based features.
                    </p>
                </div>

                <div className="flex items-center justify-between rounded-lg border border-primary/10 bg-primary/5 p-4">
                    <div className="space-y-0.5">
                        <Label htmlFor="email-notifications" className="font-bold">
                            Email Notifications
                        </Label>
                        <p className="text-xs text-muted-foreground">
                            Receive updates about your resumes and applications.
                        </p>
                    </div>
                    <Switch
                        id="email-notifications"
                        checked={emailNotifications}
                        onCheckedChange={setEmailNotifications}
                    />
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
