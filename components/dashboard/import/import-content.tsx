"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
    Linkedin,
    Github,
    FileJson,
    Loader2,
    Upload,
    CheckCircle2,
    Star,
    GitFork,
    Code
} from "lucide-react";
import { toast } from "sonner";

interface ImportContentProps {
    resumes: { id: string; title: string }[];
}

export function ImportContent({ resumes }: ImportContentProps) {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);

    // LinkedIn state
    const [linkedinText, setLinkedinText] = useState("");

    // GitHub state
    const [githubUsername, setGithubUsername] = useState("");
    const [githubRepos, setGithubRepos] = useState<any[]>([]);
    const [selectedResume, setSelectedResume] = useState(resumes[0]?.id || "");
    const [isLoadingRepos, setIsLoadingRepos] = useState(false);

    const handleLinkedInImport = async () => {
        if (!linkedinText.trim()) {
            toast.error("Please paste your LinkedIn profile text");
            return;
        }

        setIsLoading(true);
        try {
            const response = await fetch("/api/ai/import/linkedin", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ linkedinText }),
            });

            if (!response.ok) throw new Error("Import failed");

            const data = await response.json();
            toast.success("LinkedIn profile imported successfully!");
            router.push(`/dashboard/resume/${data.resumeId}/edit`);
        } catch (error) {
            console.error(error);
            toast.error("Failed to import LinkedIn profile");
        } finally {
            setIsLoading(false);
        }
    };

    const fetchGitHubRepos = async () => {
        if (!githubUsername.trim()) {
            toast.error("Please enter a GitHub username");
            return;
        }

        setIsLoadingRepos(true);
        try {
            const response = await fetch(`/api/github/repos?username=${githubUsername}`);
            if (!response.ok) throw new Error("Failed to fetch repos");

            const repos = await response.json();
            setGithubRepos(repos);
            toast.success(`Found ${repos.length} repositories`);
        } catch (error) {
            console.error(error);
            toast.error("Failed to fetch GitHub repositories");
        } finally {
            setIsLoadingRepos(false);
        }
    };

    const importGitHubProject = async (repo: any) => {
        if (!selectedResume) {
            toast.error("Please select a resume first");
            return;
        }

        setIsLoading(true);
        try {
            const response = await fetch("/api/ai/import/github", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    resumeId: selectedResume,
                    repoFullName: repo.fullName,
                    repoName: repo.name,
                    repoDescription: repo.description,
                    repoLanguage: repo.language,
                    repoUrl: repo.url,
                }),
            });

            if (!response.ok) throw new Error("Import failed");

            toast.success(`${repo.name} added to your resume!`);
            router.push(`/dashboard/resume/${selectedResume}/edit#projects`);
        } catch (error) {
            console.error(error);
            toast.error("Failed to import GitHub project");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Tabs defaultValue="linkedin" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="linkedin" className="gap-2">
                    <Linkedin className="h-4 w-4" />
                    LinkedIn
                </TabsTrigger>
                <TabsTrigger value="github" className="gap-2">
                    <Github className="h-4 w-4" />
                    GitHub
                </TabsTrigger>
                <TabsTrigger value="json" className="gap-2">
                    <FileJson className="h-4 w-4" />
                    JSON Resume
                </TabsTrigger>
            </TabsList>

            <TabsContent value="linkedin" className="mt-6 space-y-4">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Linkedin className="h-5 w-5 text-blue-600" />
                            Import from LinkedIn
                        </CardTitle>
                        <CardDescription>
                            Paste your LinkedIn profile text or upload a PDF export to create a new resume instantly.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label>LinkedIn Profile Text</Label>
                            <Textarea
                                placeholder="Copy your LinkedIn profile text and paste it here..."
                                className="min-h-[300px] font-mono text-xs"
                                value={linkedinText}
                                onChange={(e) => setLinkedinText(e.target.value)}
                            />
                            <p className="text-xs text-muted-foreground">
                                💡 Tip: Go to your LinkedIn profile, select all text (Ctrl+A), and paste here.
                            </p>
                        </div>
                        <Button
                            onClick={handleLinkedInImport}
                            disabled={isLoading || !linkedinText.trim()}
                            className="w-full gap-2"
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    Importing...
                                </>
                            ) : (
                                <>
                                    <Upload className="h-4 w-4" />
                                    Import LinkedIn Profile
                                </>
                            )}
                        </Button>
                    </CardContent>
                </Card>
            </TabsContent>

            <TabsContent value="github" className="mt-6 space-y-4">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Github className="h-5 w-5" />
                            Import from GitHub
                        </CardTitle>
                        <CardDescription>
                            Add your best GitHub projects to your resume with AI-generated descriptions.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label>GitHub Username</Label>
                                <div className="flex gap-2">
                                    <Input
                                        placeholder="octocat"
                                        value={githubUsername}
                                        onChange={(e) => setGithubUsername(e.target.value)}
                                    />
                                    <Button
                                        onClick={fetchGitHubRepos}
                                        disabled={isLoadingRepos}
                                        variant="secondary"
                                    >
                                        {isLoadingRepos ? (
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                        ) : (
                                            "Fetch Repos"
                                        )}
                                    </Button>
                                </div>
                            </div>

                            {resumes.length > 0 && (
                                <div className="space-y-2">
                                    <Label>Add projects to:</Label>
                                    <Select value={selectedResume} onValueChange={setSelectedResume}>
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {resumes.map((resume) => (
                                                <SelectItem key={resume.id} value={resume.id}>
                                                    {resume.title}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            )}
                        </div>

                        {githubRepos.length > 0 && (
                            <div className="space-y-3">
                                <h3 className="text-sm font-semibold">Your Repositories</h3>
                                <div className="grid gap-3 max-h-[500px] overflow-y-auto">
                                    {githubRepos.map((repo) => (
                                        <Card key={repo.id} className="p-4">
                                            <div className="flex items-start justify-between gap-4">
                                                <div className="space-y-2 flex-1">
                                                    <div className="flex items-center gap-2">
                                                        <h4 className="font-semibold text-sm">{repo.name}</h4>
                                                        {repo.language && (
                                                            <Badge variant="outline" className="text-xs">
                                                                <Code className="h-3 w-3 mr-1" />
                                                                {repo.language}
                                                            </Badge>
                                                        )}
                                                    </div>
                                                    <p className="text-xs text-muted-foreground line-clamp-2">
                                                        {repo.description || "No description"}
                                                    </p>
                                                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                                                        <span className="flex items-center gap-1">
                                                            <Star className="h-3 w-3" />
                                                            {repo.stars}
                                                        </span>
                                                        <span className="flex items-center gap-1">
                                                            <GitFork className="h-3 w-3" />
                                                            {repo.forks}
                                                        </span>
                                                    </div>
                                                </div>
                                                <Button
                                                    size="sm"
                                                    onClick={() => importGitHubProject(repo)}
                                                    disabled={isLoading}
                                                    className="shrink-0"
                                                >
                                                    {isLoading ? (
                                                        <Loader2 className="h-4 w-4 animate-spin" />
                                                    ) : (
                                                        <>
                                                            <CheckCircle2 className="h-4 w-4 mr-1" />
                                                            Add
                                                        </>
                                                    )}
                                                </Button>
                                            </div>
                                        </Card>
                                    ))}
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </TabsContent>

            <TabsContent value="json" className="mt-6 space-y-4">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <FileJson className="h-5 w-5 text-orange-600" />
                            JSON Resume Import
                        </CardTitle>
                        <CardDescription>
                            Import from the JSON Resume standard format or export your current resume.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="p-6 border-2 border-dashed rounded-lg text-center space-y-2">
                            <FileJson className="h-12 w-12 mx-auto text-muted-foreground" />
                            <p className="text-sm font-medium">Coming Soon</p>
                            <p className="text-xs text-muted-foreground">
                                Support for JSON Resume import/export will be available in the next update.
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </TabsContent>
        </Tabs>
    );
}
