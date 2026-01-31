"use client"

import * as React from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card } from "@/components/ui/card"
import { User, Palette, Shield, Settings as SettingsIcon, Database } from "lucide-react"

interface SettingsLayoutProps {
    children?: React.ReactNode
    defaultTab?: string
}

export function SettingsLayout({ children, defaultTab = "general" }: SettingsLayoutProps) {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-heading font-black tracking-tight gradient-text">
                    Settings
                </h1>
                <p className="mt-2 text-muted-foreground">
                    Manage your account settings and personalize your experience.
                </p>
            </div>

            <Tabs defaultValue={defaultTab} className="space-y-6">
                <TabsList className="glass-border bg-muted/30 p-1">
                    <TabsTrigger value="general" className="gap-2 rounded-lg data-[state=active]:bg-primary/10 data-[state=active]:text-primary">
                        <SettingsIcon className="h-4 w-4" />
                        <span className="hidden sm:inline">General</span>
                    </TabsTrigger>
                    <TabsTrigger value="profile" className="gap-2 rounded-lg data-[state=active]:bg-primary/10 data-[state=active]:text-primary">
                        <User className="h-4 w-4" />
                        <span className="hidden sm:inline">Profile</span>
                    </TabsTrigger>
                    <TabsTrigger value="appearance" className="gap-2 rounded-lg data-[state=active]:bg-primary/10 data-[state=active]:text-primary">
                        <Palette className="h-4 w-4" />
                        <span className="hidden sm:inline">Appearance</span>
                    </TabsTrigger>
                    <TabsTrigger value="security" className="gap-2 rounded-lg data-[state=active]:bg-primary/10 data-[state=active]:text-primary">
                        <Shield className="h-4 w-4" />
                        <span className="hidden sm:inline">Security</span>
                    </TabsTrigger>
                    <TabsTrigger value="data" className="gap-2 rounded-lg data-[state=active]:bg-primary/10 data-[state=active]:text-primary">
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
        <TabsContent value={value} className="space-y-4">
            <div>
                <h2 className="text-xl font-heading font-black tracking-tight">{title}</h2>
                <p className="text-sm text-muted-foreground">{description}</p>
            </div>
            <Card className="glass-card p-6">
                {children}
            </Card>
        </TabsContent>
    )
}
