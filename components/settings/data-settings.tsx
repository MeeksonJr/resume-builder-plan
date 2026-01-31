"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
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
import { Download, Trash2, Upload, Database } from "lucide-react"
import { toast } from "sonner"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"

interface DataSettingsProps {
    userId: string
}

export function DataSettings({ userId }: DataSettingsProps) {
    const router = useRouter()
    const [exporting, setExporting] = React.useState(false)
    const [deleting, setDeleting] = React.useState(false)

    const handleExport = async () => {
        setExporting(true)

        try {
            const response = await fetch("/api/user/export", {
                method: "GET",
            })

            if (!response.ok) throw new Error("Export failed")

            const data = await response.json()

            // Create download
            const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" })
            const url = URL.createObjectURL(blob)
            const a = document.createElement("a")
            a.href = url
            a.download = `resumeforge-export-${new Date().toISOString().split("T")[0]}.json`
            document.body.appendChild(a)
            a.click()
            document.body.removeChild(a)
            URL.revokeObjectURL(url)

            toast.success("Data exported successfully")
        } catch (error: any) {
            toast.error(error.message || "Failed to export data")
        } finally {
            setExporting(false)
        }
    }

    const handleDeleteAccount = async () => {
        setDeleting(true)

        try {
            const supabase = createClient()

            // Delete user account
            const { error } = await supabase.rpc("delete_user_account")

            if (error) throw error

            await supabase.auth.signOut()
            toast.success("Account deleted successfully")
            router.push("/")
        } catch (error: any) {
            toast.error(error.message || "Failed to delete account")
            setDeleting(false)
        }
    }

    return (
        <div className="space-y-6">
            {/* Export Data */}
            <Card className="border-primary/10 bg-primary/5 p-6">
                <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3">
                        <div className="rounded-full bg-primary/10 p-2 mt-1">
                            <Download className="h-5 w-5 text-primary" />
                        </div>
                        <div className="space-y-1">
                            <h3 className="font-heading font-black text-sm">Export Your Data</h3>
                            <p className="text-xs text-muted-foreground max-w-md">
                                Download all your data including resumes, profile, applications, and events in JSON format.
                            </p>
                        </div>
                    </div>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={handleExport}
                        disabled={exporting}
                        className="shrink-0"
                    >
                        {exporting ? "Exporting..." : "Export Data"}
                    </Button>
                </div>
            </Card>

            {/* Import Data */}
            <Card className="border-muted bg-muted/30 p-6">
                <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3">
                        <div className="rounded-full bg-muted p-2 mt-1">
                            <Upload className="h-5 w-5" />
                        </div>
                        <div className="space-y-1">
                            <div className="flex items-center gap-2">
                                <h3 className="font-heading font-black text-sm">Import Data</h3>
                                <span className="text-[10px] font-black uppercase tracking-wider text-muted-foreground">
                                    Coming Soon
                                </span>
                            </div>
                            <p className="text-xs text-muted-foreground max-w-md">
                                Import your data from a previous export or migrate from other platforms.
                            </p>
                        </div>
                    </div>
                    <Button variant="outline" size="sm" disabled className="shrink-0">
                        Import Data
                    </Button>
                </div>
            </Card>

            {/* Storage Usage */}
            <Card className="border-muted bg-muted/30 p-6">
                <div className="flex items-start gap-3">
                    <div className="rounded-full bg-muted p-2 mt-1">
                        <Database className="h-5 w-5" />
                    </div>
                    <div className="space-y-1">
                        <h3 className="font-heading font-black text-sm">Storage Usage</h3>
                        <p className="text-xs text-muted-foreground">
                            You're using your personal storage for resumes and uploads.
                        </p>
                    </div>
                </div>
            </Card>

            {/* Delete Account */}
            <Card className="border-destructive/20 bg-destructive/5 p-6">
                <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3">
                        <div className="rounded-full bg-destructive/10 p-2 mt-1">
                            <Trash2 className="h-5 w-5 text-destructive" />
                        </div>
                        <div className="space-y-1">
                            <h3 className="font-heading font-black text-sm text-destructive">Delete Account</h3>
                            <p className="text-xs text-muted-foreground max-w-md">
                                Permanently delete your account and all associated data. This action cannot be undone.
                            </p>
                        </div>
                    </div>

                    <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <Button variant="destructive" size="sm" className="shrink-0">
                                Delete Account
                            </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent className="glass glass-border">
                            <AlertDialogHeader>
                                <AlertDialogTitle className="font-heading font-black">
                                    Are you absolutely sure?
                                </AlertDialogTitle>
                                <AlertDialogDescription>
                                    This action cannot be undone. This will permanently delete your account,
                                    all your resumes, applications, and data from our servers.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel className="rounded-xl">Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                    onClick={handleDeleteAccount}
                                    disabled={deleting}
                                    className="bg-destructive hover:bg-destructive/90 rounded-xl font-black"
                                >
                                    {deleting ? "Deleting..." : "Delete Account"}
                                </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                </div>
            </Card>
        </div>
    )
}
