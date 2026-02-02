"use client";

import { useState } from "react";
import { Copy, BarChart3, Trash2 } from "lucide-react";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface ResumeActionsProps {
    resumeId: string;
}

export function DuplicateResumeAction({ resumeId }: ResumeActionsProps) {
    const router = useRouter();
    const [isDuplicating, setIsDuplicating] = useState(false);

    const handleDuplicate = async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        setIsDuplicating(true);
        const loadingToast = toast.loading("Duplicating resume...");

        try {
            const response = await fetch(`/api/resumes/${resumeId}/duplicate`, {
                method: "POST",
            });

            if (!response.ok) throw new Error("Failed to duplicate");

            const data = await response.json();
            toast.success("Resume duplicated successfully", { id: loadingToast });
            router.refresh();
            router.push(`/dashboard/resume/${data.id}`);
        } catch (error) {
            toast.error("Failed to duplicate resume", { id: loadingToast });
        } finally {
            setIsDuplicating(false);
        }
    };

    return (
        <DropdownMenuItem onClick={handleDuplicate} disabled={isDuplicating}>
            <Copy className="mr-2 h-4 w-4" />
            {isDuplicating ? "Duplicating..." : "Duplicate"}
        </DropdownMenuItem>
    );
}

export function AnalyticsLinkAction({ resumeId }: ResumeActionsProps) {
    const router = useRouter();

    return (
        <DropdownMenuItem onClick={() => router.push(`/dashboard/resume/${resumeId}/analytics`)}>
            <BarChart3 className="mr-2 h-4 w-4" />
            Analytics
        </DropdownMenuItem>
    );
}
