"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Check, Copy, FileText, List, Sparkles, Tags } from "lucide-react";
import { toast } from "sonner";

interface TailoringResultsProps {
    results: {
        suggestions: string[];
        keywordsToAdd: string[];
        improvedSummary: string;
    };
    onApply: () => void;
    isApplying: boolean;
}

export function TailoringResults({ results, onApply, isApplying }: TailoringResultsProps) {
    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        toast.success("Copied to clipboard");
    };

    return (
        <div className="space-y-6">
            <Card className="border-primary/20 bg-primary/5">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Sparkles className="h-5 w-5 text-primary" />
                        Tailoring Analysis
                    </CardTitle>
                    <CardDescription>
                        AI-generated improvement for your specific job description.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
                        <div className="space-y-1">
                            <p className="font-medium text-sm">Recommended Actions:</p>
                            <div className="flex gap-2">
                                <Badge variant="outline" className="bg-background">
                                    {results.keywordsToAdd.length} Keywords found
                                </Badge>
                                <Badge variant="outline" className="bg-background">
                                    summary rewritten
                                </Badge>
                            </div>
                        </div>
                        <Button onClick={onApply} disabled={isApplying} className="w-full sm:w-auto">
                            {isApplying ? (
                                "Applying..."
                            ) : (
                                <>
                                    <Check className="mr-2 h-4 w-4" />
                                    Apply & Save Version
                                </>
                            )}
                        </Button>
                    </div>
                </CardContent>
            </Card>

            <Tabs defaultValue="summary" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="summary">Summary</TabsTrigger>
                    <TabsTrigger value="keywords">Keywords</TabsTrigger>
                    <TabsTrigger value="suggestions">Suggestions</TabsTrigger>
                </TabsList>

                <TabsContent value="summary" className="mt-4">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <FileText className="h-4 w-4 text-muted-foreground" />
                                    Improved Summary
                                </div>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => copyToClipboard(results.improvedSummary)}
                                >
                                    <Copy className="h-4 w-4" />
                                </Button>
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="p-4 bg-muted rounded-md text-sm leading-relaxed">
                                {results.improvedSummary}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="keywords" className="mt-4">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base flex items-center gap-2">
                                <Tags className="h-4 w-4 text-muted-foreground" />
                                Missing Keywords
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex flex-wrap gap-2">
                                {results.keywordsToAdd.map((keyword, i) => (
                                    <Badge key={i} variant="secondary">
                                        {keyword}
                                    </Badge>
                                ))}
                            </div>
                            <p className="text-xs text-muted-foreground mt-4">
                                These keywords from the job description were not found in your resume.
                                Applying changes will add them to your Skills section.
                            </p>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="suggestions" className="mt-4">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base flex items-center gap-2">
                                <List className="h-4 w-4 text-muted-foreground" />
                                Specific Suggestions
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ScrollArea className="h-[200px]">
                                <ul className="space-y-3">
                                    {results.suggestions.map((suggestion, i) => (
                                        <li key={i} className="flex gap-2 text-sm">
                                            <span className="text-primary font-bold">•</span>
                                            {suggestion}
                                        </li>
                                    ))}
                                </ul>
                            </ScrollArea>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
