"use client"

import * as React from "react"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { Lock, Shield, Smartphone } from "lucide-react"
import { toast } from "sonner"
import { createClient } from "@/lib/supabase/client"

export function SecuritySettings() {
    const [loading, setLoading] = React.useState(false)
    const [passwords, setPasswords] = React.useState({
        current: "",
        new: "",
        confirm: "",
    })

    const handlePasswordChange = async () => {
        if (passwords.new !== passwords.confirm) {
            toast.error("New passwords don't match")
            return
        }

        if (passwords.new.length < 8) {
            toast.error("Password must be at least 8 characters")
            return
        }

        setLoading(true)

        try {
            const supabase = createClient()

            const { error } = await supabase.auth.updateUser({
                password: passwords.new,
            })

            if (error) throw error

            toast.success("Password updated successfully")
            setPasswords({ current: "", new: "", confirm: "" })
        } catch (error: any) {
            toast.error(error.message || "Failed to update password")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="space-y-6">
            {/* Password Change */}
            <div className="space-y-4 border border-border bg-muted/30 p-4 sm:p-6">
                <div className="flex items-center gap-3">
                        <div className="bg-primary/15 p-2">
                        <Lock className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                        <h3 className="font-heading font-black text-sm">Change Password</h3>
                        <p className="text-xs text-muted-foreground">
                            Update your password to keep your account secure.
                        </p>
                    </div>
                </div>

                <div className="space-y-3">
                    <div className="space-y-2">
                        <Label htmlFor="new-password">New Password</Label>
                        <Input
                            id="new-password"
                            type="password"
                            value={passwords.new}
                            onChange={(e) => setPasswords(prev => ({ ...prev, new: e.target.value }))}
                            placeholder="Enter new password"
                            className="h-11 rounded-none border-input bg-background"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="confirm-password">Confirm New Password</Label>
                        <Input
                            id="confirm-password"
                            type="password"
                            value={passwords.confirm}
                            onChange={(e) => setPasswords(prev => ({ ...prev, confirm: e.target.value }))}
                            placeholder="Confirm new password"
                            className="h-11 rounded-none border-input bg-background"
                        />
                    </div>

                    <Button
                        onClick={handlePasswordChange}
                        disabled={loading || !passwords.new || !passwords.confirm}
                        className="min-h-11 w-full rounded-none bg-primary font-black text-primary-foreground hover:bg-primary/90 sm:w-auto"
                    >
                        {loading ? "Updating..." : "Update Password"}
                    </Button>
                </div>
            </div>

            {/* 2FA */}
            <Card className="rounded-none border-border bg-card p-4 shadow-none sm:p-6">
                <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3">
                        <div className="mt-1 bg-primary/15 p-2">
                            <Smartphone className="h-5 w-5 text-primary" />
                        </div>
                        <div className="space-y-1">
                            <div className="flex items-center gap-2">
                                <h3 className="font-heading font-black text-sm">Two-Factor Authentication</h3>
                                <Badge variant="secondary" className="text-xs">Coming Soon</Badge>
                            </div>
                            <p className="text-xs text-muted-foreground">
                                Add an extra layer of security to your account with 2FA.
                            </p>
                        </div>
                    </div>
                    <Button variant="outline" size="sm" disabled className="min-h-11 rounded-none">
                        Enable 2FA
                    </Button>
                </div>
            </Card>

            {/* Active Sessions */}
            <Card className="rounded-none border-border bg-muted/30 p-4 shadow-none sm:p-6">
                <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3">
                        <div className="mt-1 bg-muted p-2">
                            <Shield className="h-5 w-5" />
                        </div>
                        <div className="space-y-1">
                            <div className="flex items-center gap-2">
                                <h3 className="font-heading font-black text-sm">Active Sessions</h3>
                                <Badge variant="secondary" className="text-xs">Coming Soon</Badge>
                            </div>
                            <p className="text-xs text-muted-foreground">
                                Manage devices and locations where you're currently signed in.
                            </p>
                        </div>
                    </div>
                    <Button variant="outline" size="sm" disabled className="min-h-11 rounded-none">
                        View Sessions
                    </Button>
                </div>
            </Card>
        </div>
    )
}
