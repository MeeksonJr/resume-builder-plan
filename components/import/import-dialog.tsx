"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload, Link as LinkIcon, FileText, Loader2, Linkedin } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export function ImportDialog({ children }: { children: React.ReactNode }) {
    const [isOpen, setIsOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [url, setUrl] = useState("");
    const router = useRouter();

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (file.type !== "application/pdf") {
            toast.error("Please upload a PDF file.");
            return;
        }

        setIsLoading(true);
        const formData = new FormData();
        formData.append("file", file);

        try {
            const response = await fetch("/api/import/pdf", {
                method: "POST",
                body: formData,
            });

            if (!response.ok) throw new Error("Failed to parse PDF");

            const data = await response.json();
            toast.success("Resume imported successfully!");
            setIsOpen(false);

            // Redirect to the new resume editor
            if (data.id) {
                router.push(`/dashboard/resume/${data.id}`);
            }
        } catch (error) {
            console.error(error);
            toast.error("Failed to import resume. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleUrlImport = async () => {
        if (!url) return;
        setIsLoading(true);

        try {
            const response = await fetch("/api/import/url", {
                method: "POST",
                body: JSON.stringify({ url }),
            });

            if (!response.ok) throw new Error("Failed to import from URL");

            const data = await response.json();
            toast.success("Profile imported successfully!");
            setIsOpen(false);
            if (data.id) {
                router.push(`/dashboard/resume/${data.id}`);
            }
        } catch (error) {
            console.error(error);
            toast.error("Failed to import profile.");
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>{children}</DialogTrigger>
            <DialogContent className="w-[95vw] max-w-xl sm:max-w-xl p-6 md:p-8">
                <DialogHeader>
                    <DialogTitle>Import Resume</DialogTitle>
                    <DialogDescription>
                        Start by importing data from LinkedIn or an existing resume.
                    </DialogDescription>
                </DialogHeader>
                <Tabs defaultValue="pdf" className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="pdf">
                            <FileText className="h-4 w-4 mr-2" />
                            Upload PDF
                        </TabsTrigger>
                        <TabsTrigger value="url">
                            <LinkIcon className="h-4 w-4 mr-2" />
                            LinkedIn URL
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="pdf" className="space-y-4 py-4">
                        <div className="grid w-full items-center gap-1.5">
                            <Label htmlFor="pdf-upload">LinkedIn PDF Export</Label>
                            <div className="flex items-center justify-center w-full">
                                <label
                                    htmlFor="pdf-upload"
                                    className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-muted/50 hover:bg-muted border-muted-foreground/25"
                                >
                                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                        {isLoading ? (
                                            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                                        ) : (
                                            <>
                                                <Upload className="w-8 h-8 mb-3 text-muted-foreground" />
                                                <p className="text-sm text-muted-foreground">
                                                    <span className="font-semibold">Click to upload</span> or drag and drop
                                                </p>
                                                <p className="text-xs text-muted-foreground">PDF (MAX. 5MB)</p>
                                            </>
                                        )}
                                    </div>
                                    <Input
                                        id="pdf-upload"
                                        type="file"
                                        accept="application/pdf"
                                        className="hidden"
                                        onChange={handleFileUpload}
                                        disabled={isLoading}
                                    />
                                </label>
                            </div>
                        </div>
                        <p className="text-xs text-muted-foreground text-center">
                            Go to LinkedIn Profile {">"} More {">"} Save to PDF
                        </p>
                    </TabsContent>

                    <TabsContent value="url" className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="linkedin-url">Public Profile URL</Label>
                            <div className="flex gap-2">
                                <Input
                                    id="linkedin-url"
                                    placeholder="https://linkedin.com/in/username"
                                    value={url}
                                    onChange={(e) => setUrl(e.target.value)}
                                    disabled={isLoading}
                                />
                            </div>
                            <p className="text-[10px] text-muted-foreground">
                                Note: This uses AI to scrape public data. For best results, ensure your profile is public.
                            </p>
                        </div>
                        <Button className="w-full" onClick={handleUrlImport} disabled={isLoading || !url}>
                            {isLoading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Importing...
                                </>
                            ) : (
                                <>
                                    <Linkedin className="mr-2 h-4 w-4" />
                                    Import from LinkedIn
                                </>
                            )}
                        </Button>
                    </TabsContent>
                </Tabs>
            </DialogContent>
        </Dialog>
    );
}
