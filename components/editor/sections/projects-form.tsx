"use client";

import { useResumeStore } from "@/lib/stores/resume-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";
import { Plus, Trash2, GripVertical } from "lucide-react";

export function ProjectsForm() {
    const { projects, addProject, updateProject, removeProject } = useResumeStore();

    const handleAdd = () => {
        addProject({
            name: "",
            description: "",
            technologies: [],
            url: "",
            highlights: [],
        });
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Projects</CardTitle>
                <CardDescription>
                    Showcase your personal or professional projects
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <Accordion type="single" collapsible className="w-full space-y-4">
                    {projects.map((proj, index) => (
                        <AccordionItem key={proj.id} value={proj.id} className="border rounded-lg px-4">
                            <div className="flex items-center py-2">
                                <GripVertical className="h-4 w-4 text-muted-foreground mr-2 cursor-grab" />
                                <AccordionTrigger className="flex-1 hover:no-underline py-2">
                                    <div className="text-left">
                                        <div className="font-semibold">
                                            {proj.name || "New Project"}
                                        </div>
                                    </div>
                                </AccordionTrigger>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => removeProject(proj.id)}
                                    className="text-destructive hover:text-destructive/90"
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>
                            <AccordionContent className="pt-4 pb-4 space-y-4">
                                <div className="space-y-2">
                                    <Label>Project Name</Label>
                                    <Input
                                        value={proj.name}
                                        onChange={(e) =>
                                            updateProject(proj.id, { name: e.target.value })
                                        }
                                        placeholder="e.g. Resume Builder"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label>Project URL</Label>
                                    <Input
                                        value={proj.url || ""}
                                        onChange={(e) =>
                                            updateProject(proj.id, { url: e.target.value })
                                        }
                                        placeholder="e.g. https://github.com/..."
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label>Technologies (comma separated)</Label>
                                    <Input
                                        value={proj.technologies.join(", ")}
                                        onChange={(e) =>
                                            updateProject(proj.id, {
                                                technologies: e.target.value.split(",").map((s) => s.trim()).filter(Boolean),
                                            })
                                        }
                                        placeholder="e.g. React, Node.js, TypeScript"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label>Description</Label>
                                    <Textarea
                                        value={proj.description || ""}
                                        onChange={(e) =>
                                            updateProject(proj.id, { description: e.target.value })
                                        }
                                        placeholder="Describe what you built..."
                                        className="min-h-[100px]"
                                    />
                                </div>
                            </AccordionContent>
                        </AccordionItem>
                    ))}
                </Accordion>

                <Button onClick={handleAdd} className="w-full">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Project
                </Button>
            </CardContent>
        </Card>
    );
}
