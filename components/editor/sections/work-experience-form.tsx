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
import { Switch } from "@/components/ui/switch";
import { Plus, Trash2, GripVertical, CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";

export function WorkExperienceForm() {
    const { workExperiences, addWorkExperience, updateWorkExperience, removeWorkExperience } = useResumeStore();

    const handleAdd = () => {
        addWorkExperience({
            company: "",
            position: "",
            location: "",
            start_date: "",
            end_date: "",
            is_current: false,
            description: "",
            highlights: [],
        });
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Work Experience</CardTitle>
                <CardDescription>
                    Add your professional experience starting with the most recent
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <Accordion type="single" collapsible className="w-full space-y-4">
                    {workExperiences.map((exp, index) => (
                        <AccordionItem key={exp.id} value={exp.id} className="border rounded-lg px-4">
                            <div className="flex items-center py-2">
                                <GripVertical className="h-4 w-4 text-muted-foreground mr-2 cursor-grab" />
                                <AccordionTrigger className="flex-1 hover:no-underline py-2">
                                    <div className="text-left">
                                        <div className="font-semibold">
                                            {exp.company || "New Position"}
                                        </div>
                                        <div className="text-sm text-muted-foreground">
                                            {exp.position || "Title"}
                                        </div>
                                    </div>
                                </AccordionTrigger>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => removeWorkExperience(exp.id)}
                                    className="text-destructive hover:text-destructive/90"
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>
                            <AccordionContent className="pt-4 pb-4 space-y-4">
                                <div className="grid gap-4 sm:grid-cols-2">
                                    <div className="space-y-2">
                                        <Label>Company Name</Label>
                                        <Input
                                            value={exp.company}
                                            onChange={(e) =>
                                                updateWorkExperience(exp.id, { company: e.target.value })
                                            }
                                            placeholder="e.g. Acme Corp"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Position Title</Label>
                                        <Input
                                            value={exp.position}
                                            onChange={(e) =>
                                                updateWorkExperience(exp.id, { position: e.target.value })
                                            }
                                            placeholder="e.g. Senior Developer"
                                        />
                                    </div>
                                </div>

                                <div className="grid gap-4 sm:grid-cols-2">
                                    <div className="space-y-2">
                                        <Label>Start Date</Label>
                                        <Input
                                            type="month"
                                            value={exp.start_date || ""}
                                            onChange={(e) =>
                                                updateWorkExperience(exp.id, { start_date: e.target.value })
                                            }
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>End Date</Label>
                                        <div className="space-y-2">
                                            <Input
                                                type="month"
                                                value={exp.end_date || ""}
                                                disabled={exp.is_current}
                                                onChange={(e) =>
                                                    updateWorkExperience(exp.id, { end_date: e.target.value })
                                                }
                                            />
                                            <div className="flex items-center space-x-2">
                                                <Switch
                                                    checked={exp.is_current}
                                                    onCheckedChange={(checked) =>
                                                        updateWorkExperience(exp.id, {
                                                            is_current: checked,
                                                            end_date: checked ? null : exp.end_date,
                                                        })
                                                    }
                                                />
                                                <Label>I currently work here</Label>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label>Location</Label>
                                    <Input
                                        value={exp.location || ""}
                                        onChange={(e) =>
                                            updateWorkExperience(exp.id, { location: e.target.value })
                                        }
                                        placeholder="e.g. San Francisco, CA"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label>Description</Label>
                                    <Textarea
                                        value={exp.description || ""}
                                        onChange={(e) =>
                                            updateWorkExperience(exp.id, { description: e.target.value })
                                        }
                                        placeholder="Describe your responsibilities and achievements..."
                                        className="min-h-[100px]"
                                    />
                                </div>
                            </AccordionContent>
                        </AccordionItem>
                    ))}
                </Accordion>

                <Button onClick={handleAdd} className="w-full">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Position
                </Button>
            </CardContent>
        </Card>
    );
}
