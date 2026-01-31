"use client"

import * as React from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Upload, X, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"

interface AvatarUploadProps {
    profile: any
}

export function AvatarUpload({ profile }: AvatarUploadProps) {
    const router = useRouter()
    const [uploading, setUploading] = React.useState(false)
    const [preview, setPreview] = React.useState<string | null>(profile?.avatar_url || null)
    const fileInputRef = React.useRef<HTMLInputElement>(null)

    const initials = profile?.full_name
        ?.split(" ")
        .map((n: string) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2) || "U"

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        // Validate file type
        if (!file.type.startsWith("image/")) {
            toast.error("Please upload an image file")
            return
        }

        // Validate file size (5MB max)
        if (file.size > 5 * 1024 * 1024) {
            toast.error("File size must be less than 5MB")
            return
        }

        setUploading(true)

        try {
            const supabase = createClient()

            // Delete old avatar if exists
            if (profile.avatar_url) {
                const oldPath = profile.avatar_url.split("/").pop()
                if (oldPath) {
                    await supabase.storage.from("avatars").remove([oldPath])
                }
            }

            // Upload new avatar
            const fileExt = file.name.split(".").pop()
            const fileName = `${profile.id}-${Date.now()}.${fileExt}`
            const filePath = fileName

            const { error: uploadError } = await supabase.storage
                .from("avatars")
                .upload(filePath, file, {
                    cacheControl: "3600",
                    upsert: false,
                })

            if (uploadError) throw uploadError

            // Get public URL
            const { data: { publicUrl } } = supabase.storage
                .from("avatars")
                .getPublicUrl(filePath)

            // Update profile
            const { error: updateError } = await supabase
                .from("profiles")
                .update({ avatar_url: publicUrl })
                .eq("id", profile.id)

            if (updateError) throw updateError

            setPreview(publicUrl)
            toast.success("Avatar updated successfully")
            router.refresh()
        } catch (error: any) {
            console.error("Upload error:", error)
            toast.error(error.message || "Failed to upload avatar")
        } finally {
            setUploading(false)
        }
    }

    const handleRemove = async () => {
        if (!profile.avatar_url) return

        setUploading(true)

        try {
            const supabase = createClient()

            // Delete from storage
            const oldPath = profile.avatar_url.split("/").pop()
            if (oldPath) {
                await supabase.storage.from("avatars").remove([oldPath])
            }

            // Update profile
            const { error } = await supabase
                .from("profiles")
                .update({ avatar_url: null })
                .eq("id", profile.id)

            if (error) throw error

            setPreview(null)
            toast.success("Avatar removed successfully")
            router.refresh()
        } catch (error: any) {
            toast.error(error.message || "Failed to remove avatar")
        } finally {
            setUploading(false)
        }
    }

    return (
        <div className="flex items-start gap-6 rounded-lg border border-primary/10 bg-primary/5 p-6">
            <Avatar className="h-24 w-24 border-4 border-primary/20">
                {preview && <AvatarImage src={preview} alt={profile?.full_name || "Avatar"} />}
                <AvatarFallback className="bg-primary/10 text-primary text-2xl font-black">
                    {initials}
                </AvatarFallback>
            </Avatar>

            <div className="flex-1 space-y-3">
                <div>
                    <h3 className="font-heading font-black text-sm">Profile Picture</h3>
                    <p className="text-xs text-muted-foreground">
                        JPG, PNG or GIF. Max size 5MB.
                    </p>
                </div>

                <div className="flex flex-wrap gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploading}
                        className="gap-2"
                    >
                        {uploading ? (
                            <>
                                <Loader2 className="h-4 w-4 animate-spin" />
                                Uploading...
                            </>
                        ) : (
                            <>
                                <Upload className="h-4 w-4" />
                                Upload New
                            </>
                        )}
                    </Button>

                    {preview && (
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleRemove}
                            disabled={uploading}
                            className="gap-2 text-destructive hover:text-destructive"
                        >
                            <X className="h-4 w-4" />
                            Remove
                        </Button>
                    )}
                </div>

                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                />
            </div>
        </div>
    )
}
