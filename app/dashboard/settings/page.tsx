import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { SettingsLayout, SettingsTab } from "@/components/settings/settings-layout"
import { GeneralSettings } from "@/components/settings/general-settings"
import { ProfileSettings } from "@/components/settings/profile-settings"
import { AppearanceSettings } from "@/components/settings/appearance-settings"
import { SecuritySettings } from "@/components/settings/security-settings"
import { DataSettings } from "@/components/settings/data-settings"
import { CareerSettings } from "@/components/settings/career-settings"
import { CanvasSettings } from "@/components/settings/canvas-settings"
import { ApiSettings } from "@/components/settings/api-settings"

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
                value="career"
                title="Career Preferences"
                description="Set your target role, industry, and career goals for personalized AI assistance."
            >
                <CareerSettings profile={profile} />
            </SettingsTab>

            <SettingsTab
                value="canvas"
                title="Canvas LMS Integration"
                description="Connect your Canvas account to synchronize your courses, assignments, and grades."
            >
                <CanvasSettings profile={profile} />
            </SettingsTab>

            <SettingsTab
                value="api"
                title="Developer API Keys"
                description="Generate and manage API keys to programmatically query your resume records."
            >
                <ApiSettings />
            </SettingsTab>

            {/* 
            <SettingsTab
                value="appearance"
                title="Appearance"
                description="Customize how ResumeForge looks for you."
            >
                <AppearanceSettings />
            </SettingsTab> 
            */}

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
