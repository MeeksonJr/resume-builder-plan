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
            <div className="space-y-4 rounded-lg border border-primary/10 bg-primary/5 p-6">
                <div className="flex items-center gap-3">
                    <div className="rounded-full bg-primary/10 p-2">
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
                            className="glass-border"
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
                            className="glass-border"
                        />
                    </div>

                    <Button
                        onClick={handlePasswordChange}
                        disabled={loading || !passwords.new || !passwords.confirm}
                        className="w-full sm:w-auto bg-gradient-to-br from-primary to-primary/80 font-black"
                    >
                        {loading ? "Updating..." : "Update Password"}
                    </Button>
                </div>
            </div>

            {/* 2FA */}
            <Card className="border-primary/10 bg-primary/5 p-6">
                <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3">
                        <div className="rounded-full bg-primary/10 p-2 mt-1">
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
                    <Button variant="outline" size="sm" disabled>
                        Enable 2FA
                    </Button>
                </div>
            </Card>

            {/* Active Sessions */}
            <Card className="border-primary/10 bg-muted/30 p-6">
                <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3">
                        <div className="rounded-full bg-muted p-2 mt-1">
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
                    <Button variant="outline" size="sm" disabled>
                        View Sessions
                    </Button>
                </div>
            </Card>
        </div>
    )
}
