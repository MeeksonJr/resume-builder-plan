"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { AlertCircle, RotateCw } from "lucide-react";

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        // Log the error to an error reporting service
        console.error(error);
    }, [error]);

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-background text-foreground p-4">
            <div className="space-y-6 text-center max-w-md p-8 rounded-xl border border-border bg-card shadow-lg">
                <div className="flex justify-center">
                    <div className="p-4 rounded-full bg-destructive/10 text-destructive">
                        <AlertCircle className="h-8 w-8" />
                    </div>
                </div>

                <div className="space-y-2">
                    <h2 className="text-2xl font-bold tracking-tight">Something went wrong!</h2>
                    <p className="text-muted-foreground text-sm">
                        We apologize for the inconvenience. An unexpected error has occurred.
                    </p>
                    {process.env.NODE_ENV === "development" && (
                        <div className="mt-4 p-4 bg-muted rounded-lg text-left text-xs font-mono overflow-auto max-h-32">
                            {error.message}
                        </div>
                    )}
                </div>

                <Button onClick={reset} size="lg" className="w-full">
                    <RotateCw className="mr-2 h-4 w-4" />
                    Try Again
                </Button>
            </div>
        </div>
    );
}
