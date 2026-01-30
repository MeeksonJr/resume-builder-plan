"use client";

import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Sparkles, X } from "lucide-react";

interface AIAssistantProps {
    onClose: () => void;
}

export function AIAssistant({ onClose }: AIAssistantProps) {
    return (
        <Card className="h-full border-l rounded-none">
            <CardHeader>
                <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Sparkles className="h-5 w-5 text-purple-500" />
                        AI Assistant
                    </div>
                    <Button variant="ghost" size="icon" onClick={onClose}>
                        <X className="h-4 w-4" />
                    </Button>
                </CardTitle>
                <CardDescription>
                    Get intelligent suggestions to improve your resume
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="bg-muted p-4 rounded-lg text-sm">
                    <p>
                        👋 Hi! I can help you write better bullet points, generate a summary, or
                        tailor your resume for a specific job description.
                    </p>
                </div>

                <div className="space-y-2">
                    <Button variant="outline" className="w-full justify-start">
                        <Sparkles className="mr-2 h-4 w-4" />
                        Improve Bullet Points
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                        <Sparkles className="mr-2 h-4 w-4" />
                        Generate Summary
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                        <Sparkles className="mr-2 h-4 w-4" />
                        Tailor to Job Description
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}
