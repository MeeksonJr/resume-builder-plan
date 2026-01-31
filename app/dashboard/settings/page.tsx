import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { SettingsLayout, SettingsTab } from "@/components/settings/settings-layout"
import { GeneralSettings } from "@/components/settings/general-settings"
import { ProfileSettings } from "@/components/settings/profile-settings"
import { AppearanceSettings } from "@/components/settings/appearance-settings"
import { SecuritySettings } from "@/components/settings/security-settings"
import { DataSettings } from "@/components/settings/data-settings"

export const metadata = {
    title: "Settings | ResumeForge",
    description: "Manage your account settings and preferences",
}

export default async function SettingsPage() {
    const supabase = await createClient()
    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
        redirect("/auth/login")
    }

    const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single()

    if (!profile) {
        redirect("/dashboard")
    }

    return (
        <SettingsLayout>
            <SettingsTab
                value="general"
                title="General Settings"
                description="Manage your language, timezone, and notification preferences."
            >
                <GeneralSettings profile={profile} />
            </SettingsTab>

            <SettingsTab
                value="profile"
                title="Profile Information"
                description="Update your personal information and avatar."
            >
                <ProfileSettings profile={profile} user={user} />
            </SettingsTab>

            <SettingsTab
                value="appearance"
                title="Appearance"
                description="Customize how ResumeForge looks for you."
            >
                <AppearanceSettings />
            </SettingsTab>

            <SettingsTab
                value="security"
                title="Security & Privacy"
                description="Manage your password and security settings."
            >
                <SecuritySettings />
            </SettingsTab>

            <SettingsTab
                value="data"
                title="Data & Privacy"
                description="Export your data or delete your account."
            >
                <DataSettings userId={user.id} />
            </SettingsTab>
        </SettingsLayout>
    )
}
