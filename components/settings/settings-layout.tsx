"use client"

import * as React from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { User, Palette, Shield, Settings as SettingsIcon, Database, Target } from "lucide-react"

interface SettingsLayoutProps {
    children?: React.ReactNode
    defaultTab?: string
}

export function SettingsLayout({ children, defaultTab = "general" }: SettingsLayoutProps) {
    return (
        <div className="space-y-7">
            <div className="border-b border-border pb-6">
                <p className="mb-2 text-xs font-bold uppercase tracking-[0.18em] text-primary">Account workspace</p>
                <h1 className="text-3xl font-heading font-black tracking-tight text-foreground sm:text-4xl">
                    Settings
                </h1>
                <p className="mt-2 max-w-2xl text-sm text-muted-foreground sm:text-base">
                    Manage your account settings and personalize your experience.
                </p>
            </div>

            <Tabs defaultValue={defaultTab} className="space-y-7">
                <TabsList aria-label="Settings sections" className="h-auto w-full justify-start gap-0 overflow-x-auto border-b border-border bg-transparent p-0">
                    <TabsTrigger value="general" className="min-h-11 shrink-0 gap-2 rounded-none border-b-2 border-transparent px-3 text-xs font-bold uppercase tracking-wide text-muted-foreground transition-colors hover:text-foreground data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-foreground sm:px-4">
                        <SettingsIcon className="h-4 w-4" />
                        <span className="hidden sm:inline">General</span>
                    </TabsTrigger>
                    <TabsTrigger value="profile" className="min-h-11 shrink-0 gap-2 rounded-none border-b-2 border-transparent px-3 text-xs font-bold uppercase tracking-wide text-muted-foreground transition-colors hover:text-foreground data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-foreground sm:px-4">
                        <User className="h-4 w-4" />
                        <span className="hidden sm:inline">Profile</span>
                    </TabsTrigger>
                    <TabsTrigger value="career" className="min-h-11 shrink-0 gap-2 rounded-none border-b-2 border-transparent px-3 text-xs font-bold uppercase tracking-wide text-muted-foreground transition-colors hover:text-foreground data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-foreground sm:px-4">
                        <Target className="h-4 w-4" />
                        <span className="hidden sm:inline">Career</span>
                    </TabsTrigger>
                    <TabsTrigger value="appearance" className="min-h-11 shrink-0 gap-2 rounded-none border-b-2 border-transparent px-3 text-xs font-bold uppercase tracking-wide text-muted-foreground transition-colors hover:text-foreground data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-foreground sm:px-4">
                        <Palette className="h-4 w-4" />
                        <span className="hidden sm:inline">Appearance</span>
                    </TabsTrigger>
                    <TabsTrigger value="security" className="min-h-11 shrink-0 gap-2 rounded-none border-b-2 border-transparent px-3 text-xs font-bold uppercase tracking-wide text-muted-foreground transition-colors hover:text-foreground data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-foreground sm:px-4">
                        <Shield className="h-4 w-4" />
                        <span className="hidden sm:inline">Security</span>
                    </TabsTrigger>
                    <TabsTrigger value="data" className="min-h-11 shrink-0 gap-2 rounded-none border-b-2 border-transparent px-3 text-xs font-bold uppercase tracking-wide text-muted-foreground transition-colors hover:text-foreground data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-foreground sm:px-4">
                        <Database className="h-4 w-4" />
                        <span className="hidden sm:inline">Data</span>
                    </TabsTrigger>
                </TabsList>

                {children}
            </Tabs>
        </div>
    )
}

interface SettingsTabProps {
    value: string
    title: string
    description: string
    children: React.ReactNode
}

export function SettingsTab({ value, title, description, children }: SettingsTabProps) {
    return (
        <TabsContent value={value} className="space-y-5">
            <div className="max-w-2xl">
                <h2 className="text-xl font-heading font-black tracking-tight text-foreground">{title}</h2>
                <p className="text-sm text-muted-foreground">{description}</p>
            </div>
            <div className="border border-border bg-card p-4 shadow-[4px_4px_0_rgba(16,43,43,0.06)] sm:p-6">
                {children}
            </div>
        </TabsContent>
    )
}
