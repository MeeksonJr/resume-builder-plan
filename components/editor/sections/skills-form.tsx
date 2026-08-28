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
import { Plus, X, Trash2, GripVertical } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragEndEvent,
} from "@dnd-kit/core";
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { SortableItem } from "../sortable-item";

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

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    function handleDragEnd(event: DragEndEvent) {
        const { active, over } = event;

        if (over && active.id !== over.id) {
            const oldIndex = skills.findIndex((item) => item.id === active.id);
            const newIndex = skills.findIndex((item) => item.id === over.id);

            const newItems = arrayMove(skills, oldIndex, newIndex);

            const updatedItems = newItems.map((item, index) => ({
                ...item,
                display_order: index,
            }));

            useResumeStore.getState().setSkills(updatedItems);
        }
    }

    return (
        <Card className="rounded-none border-[#102b2b]/15 bg-[#f8f4ec] shadow-[4px_4px_0_rgba(16,43,43,0.06)]">
            <CardHeader className="bg-[#e9eee8] border-b border-[#102b2b]/10 py-4">
                <CardTitle className="text-sm font-black uppercase tracking-tight text-[#102b2b]">Skills</CardTitle>
                <CardDescription className="text-xs text-[#52716a] font-semibold mt-1">
                    Highlight your key competencies, tools, and technologies
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 p-5">
                {skills.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 p-3 bg-white/60 border border-[#102b2b]/10">
                        {skills.map((skill) => (
                            <Badge key={skill.id} variant="secondary" className="px-2.5 py-0.5 rounded-none bg-[#102b2b]/5 text-[#102b2b] border border-[#102b2b]/10 text-xs font-semibold gap-1">
                                {skill.name || "Untitled"}
                                <span className="text-[10px] text-[#52716a]">
                                    ({PROFICIENCY_LEVELS.find(l => String(skill.proficiency_level) === l.value)?.label || "Intermediate"})
                                </span>
                            </Badge>
                        ))}
                    </div>
                )}

                <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragEnd={handleDragEnd}
                >
                    <div className="space-y-3">
                        <SortableContext items={skills} strategy={verticalListSortingStrategy}>
                            {skills.map((skill) => (
                                <SortableItem key={skill.id} id={skill.id} className="w-full">
                                    <div className="flex items-center gap-3 rounded-none border border-[#102b2b]/10 bg-white p-3 hover:bg-white transition-colors shadow-sm text-[#102b2b] w-full">
                                        <div className="cursor-grab active:cursor-grabbing p-1">
                                            <GripVertical className="h-4 w-4 text-[#52716a]" />
                                        </div>
                                        
                                        <div className="flex-1 min-w-0">
                                            <Label className="text-[10px] font-bold text-[#52716a] uppercase">Skill Name</Label>
                                            <Input
                                                value={skill.name}
                                                onChange={(e) => updateSkill(skill.id, { name: e.target.value })}
                                                className="h-9 mt-1 rounded-none border-[#102b2b]/15 bg-[#f8f4ec]/30 focus-visible:ring-[#102b2b]"
                                            />
                                        </div>

                                        <div className="w-36 shrink-0">
                                            <Label className="text-[10px] font-bold text-[#52716a] uppercase">Proficiency</Label>
                                            <Select
                                                value={String(skill.proficiency_level)}
                                                onValueChange={(val) => updateSkill(skill.id, { proficiency_level: parseInt(val) })}
                                            >
                                                <SelectTrigger className="h-9 mt-1 rounded-none border-[#102b2b]/15 bg-[#f8f4ec]/30">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent className="bg-[#f8f4ec] border-[#102b2b]/15">
                                                    {PROFICIENCY_LEVELS.map((level) => (
                                                        <SelectItem key={level.value} value={level.value} className="hover:bg-[#102b2b]/5 cursor-pointer">
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
                                            className="h-9 w-9 mt-5 text-muted-foreground hover:text-destructive hover:bg-destructive/5 rounded-none shrink-0"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </SortableItem>
                            ))}
                        </SortableContext>
                    </div>
                </DndContext>

                <Button onClick={handleAdd} className="w-full h-10 rounded-none bg-[#102b2b] hover:bg-[#0d8274] text-white font-bold">
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
