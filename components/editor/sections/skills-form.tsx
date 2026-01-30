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
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Plus, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const PROFICIENCY_LEVELS = [
    { value: "0", label: "Beginner" },
    { value: "1", label: "Intermediate" },
    { value: "2", label: "Advanced" },
    { value: "3", label: "Expert" },
];

export function SkillsForm() {
    const { skills, addSkill, removeSkill, updateSkill } = useResumeStore();

    const handleAdd = () => {
        addSkill({
            name: "New Skill",
            category: "",
            proficiency_level: 1, // Intermediate default
        });
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Skills</CardTitle>
                <CardDescription>
                    HIGHLIGHT your key competencies and technologies
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="flex flex-wrap gap-2">
                    {skills.map((skill) => (
                        <Badge key={skill.id} variant="secondary" className="px-3 py-1 gap-2">
                            <input
                                className="bg-transparent border-none outline-none w-24 text-sm font-medium"
                                value={skill.name}
                                onChange={(e) => updateSkill(skill.id, { name: e.target.value })}
                            />
                            <button
                                onClick={() => removeSkill(skill.id)}
                                className="hover:text-destructive transition-colors"
                            >
                                <X className="h-3 w-3" />
                            </button>
                        </Badge>
                    ))}
                </div>

                <div className="space-y-4 pt-4 border-t">
                    <div className="grid gap-4 sm:grid-cols-2">
                        {skills.map((skill) => (
                            <div key={skill.id} className="flex gap-2 items-center p-2 border rounded-md">
                                <div className="flex-1 space-y-2">
                                    <Label className="text-xs">Skill Name</Label>
                                    <Input
                                        value={skill.name}
                                        onChange={(e) => updateSkill(skill.id, { name: e.target.value })}
                                        className="h-8"
                                    />
                                </div>
                                <div className="flex-1 space-y-2">
                                    <Label className="text-xs">Level</Label>
                                    <Select
                                        value={String(skill.proficiency_level)}
                                        onValueChange={(val) => updateSkill(skill.id, { proficiency_level: parseInt(val) })}
                                    >
                                        <SelectTrigger className="h-8">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {PROFICIENCY_LEVELS.map((level) => (
                                                <SelectItem key={level.value} value={level.value}>
                                                    {level.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => removeSkill(skill.id)}
                                    className="h-8 w-8 mt-5 text-destructive hover:text-destructive/90"
                                >
                                    <Trash2Icon className="h-4 w-4" />
                                </Button>
                            </div>
                        ))}
                    </div>
                </div>

                <Button onClick={handleAdd} className="w-full">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Skill
                </Button>
            </CardContent>
        </Card>
    );
}

function Trash2Icon(props: React.SVGProps<SVGSVGElement>) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M3 6h18" />
            <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
            <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
            <line x1="10" x2="10" y1="11" y2="17" />
            <line x1="14" x2="14" y1="11" y2="17" />
        </svg>
    )
}
