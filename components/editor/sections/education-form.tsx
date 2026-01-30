"use client";

import { useResumeStore } from "@/lib/stores/resume-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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

export function EducationForm() {
    const { education, addEducation, updateEducation, removeEducation } = useResumeStore();

    const handleAdd = () => {
        addEducation({
            institution: "",
            degree: "",
            field_of_study: "",
            location: "",
            start_date: "",
            end_date: "",
            gpa: "",
            highlights: [],
        });
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Education</CardTitle>
                <CardDescription>
                    Add your educational background
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <Accordion type="single" collapsible className="w-full space-y-4">
                    {education.map((edu, index) => (
                        <AccordionItem key={edu.id} value={edu.id} className="border rounded-lg px-4">
                            <div className="flex items-center py-2">
                                <GripVertical className="h-4 w-4 text-muted-foreground mr-2 cursor-grab" />
                                <AccordionTrigger className="flex-1 hover:no-underline py-2">
                                    <div className="text-left">
                                        <div className="font-semibold">
                                            {edu.institution || "New Education"}
                                        </div>
                                        <div className="text-sm text-muted-foreground">
                                            {edu.degree || "Degree"}
                                        </div>
                                    </div>
                                </AccordionTrigger>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => removeEducation(edu.id)}
                                    className="text-destructive hover:text-destructive/90"
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>
                            <AccordionContent className="pt-4 pb-4 space-y-4">
                                <div className="grid gap-4 sm:grid-cols-2">
                                    <div className="space-y-2">
                                        <Label>Institution</Label>
                                        <Input
                                            value={edu.institution}
                                            onChange={(e) =>
                                                updateEducation(edu.id, { institution: e.target.value })
                                            }
                                            placeholder="e.g. University of California"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Location</Label>
                                        <Input
                                            value={edu.location || ""}
                                            onChange={(e) =>
                                                updateEducation(edu.id, { location: e.target.value })
                                            }
                                            placeholder="e.g. Berkeley, CA"
                                        />
                                    </div>
                                </div>

                                <div className="grid gap-4 sm:grid-cols-2">
                                    <div className="space-y-2">
                                        <Label>Degree</Label>
                                        <Input
                                            value={edu.degree || ""}
                                            onChange={(e) =>
                                                updateEducation(edu.id, { degree: e.target.value })
                                            }
                                            placeholder="e.g. Bachelor of Science"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Field of Study</Label>
                                        <Input
                                            value={edu.field_of_study || ""}
                                            onChange={(e) =>
                                                updateEducation(edu.id, { field_of_study: e.target.value })
                                            }
                                            placeholder="e.g. Computer Science"
                                        />
                                    </div>
                                </div>

                                <div className="grid gap-4 sm:grid-cols-2">
                                    <div className="space-y-2">
                                        <Label>Start Date</Label>
                                        <Input
                                            type="month"
                                            value={edu.start_date || ""}
                                            onChange={(e) =>
                                                updateEducation(edu.id, { start_date: e.target.value })
                                            }
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>End Date</Label>
                                        <Input
                                            type="month"
                                            value={edu.end_date || ""}
                                            onChange={(e) =>
                                                updateEducation(edu.id, { end_date: e.target.value })
                                            }
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label>GPA</Label>
                                    <Input
                                        value={edu.gpa || ""}
                                        onChange={(e) =>
                                            updateEducation(edu.id, { gpa: e.target.value })
                                        }
                                        placeholder="e.g. 3.8"
                                    />
                                </div>
                            </AccordionContent>
                        </AccordionItem>
                    ))}
                </Accordion>

                <Button onClick={handleAdd} className="w-full">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Education
                </Button>
            </CardContent>
        </Card>
    );
}
