"use client";

import { useState, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Camera, Loader2, User } from "lucide-react";
import { toast } from "sonner";

interface AvatarUploadProps {
    uid: string;
    url: string | null;
    onUpload: (url: string) => void;
}

export function AvatarUpload({ uid, url, onUpload }: AvatarUploadProps) {
    const supabase = createClient();
    const [uploading, setUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        try {
            setUploading(true);

            if (!event.target.files || event.target.files.length === 0) {
                throw new Error("You must select an image to upload.");
            }

            const file = event.target.files[0];
            const fileExt = file.name.split(".").pop();
            const filePath = `${uid}/avatar.${fileExt}`;

            // 1. Upload the file to Supabase Storage
            const { error: uploadError } = await supabase.storage
                .from("avatars")
                .upload(filePath, file, { upsert: true });

            if (uploadError) throw uploadError;

            // 2. Get the public URL
            const { data: { publicUrl } } = supabase.storage
                .from("avatars")
                .getPublicUrl(filePath);

            onUpload(publicUrl);
            toast.success("Avatar updated successfully!");
        } catch (error: any) {
            toast.error(error.message);
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="flex flex-col items-center gap-4">
            <div className="relative group">
                <Avatar className="h-24 w-24 border-2 border-border shadow-sm">
                    <AvatarImage src={url || ""} alt="Avatar" />
                    <AvatarFallback className="bg-muted">
                        <User className="h-12 w-12 text-muted-foreground" />
                    </AvatarFallback>
                </Avatar>
                <div
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                >
                    {uploading ? (
                        <Loader2 className="h-6 w-6 animate-spin text-white" />
                    ) : (
                        <Camera className="h-6 w-6 text-white" />
                    )}
                </div>
            </div>
            <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/*"
                onChange={handleUpload}
                disabled={uploading}
            />
            <Button
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
            >
                Change Photo
            </Button>
        </div>
    );
}
