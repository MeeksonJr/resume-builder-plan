"use client";

import { Button } from "@/components/ui/button";
import { Download, Loader2 } from "lucide-react";
import { useState, useRef } from "react";
import { useReactToPrint } from "react-to-print";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";

interface PublicDownloadButtonProps {
    resumeId: string;
    title: string;
}

export function PublicDownloadButton({ resumeId, title }: PublicDownloadButtonProps) {
    const [isDownloading, setIsDownloading] = useState(false);
    const supabase = createClient();
    const contentRef = useRef<HTMLDivElement>(null);

    // We need a hidden ResumePreview to print from client side
    // But since we are already on the page where ResumePreview is visible,
    // we can try to target the existing one or just use a dedicated hidden one for reliability.

    const handleDownload = async () => {
        setIsDownloading(true);
        try {
            // Record download event
            const { error } = await supabase.rpc("record_resume_event", {
                resume_id_param: resumeId,
                event_type_param: "download",
            });
            if (error) console.error("Error recording download event:", error);

            // Trigger browser print
            window.print();
            toast.success("Download started");
        } catch (error) {
            console.error(error);
            toast.error("Failed to start download");
        } finally {
            setIsDownloading(false);
        }
    };

    return (
        <Button
            onClick={handleDownload}
            disabled={isDownloading}
            className="gap-2"
        >
            {isDownloading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
                <Download className="h-4 w-4" />
            )}
            Download PDF
        </Button>
    );
}
