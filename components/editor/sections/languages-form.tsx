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

export function LanguagesForm() {
    const { languages, addLanguage, updateLanguage, removeLanguage } = useResumeStore();

    const handleAdd = () => {
        addLanguage({
            language: "New Language",
            proficiency: "Native or Bilingual",
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
            const oldIndex = languages.findIndex((item) => item.id === active.id);
            const newIndex = languages.findIndex((item) => item.id === over.id);

            const newItems = arrayMove(languages, oldIndex, newIndex);

            const updatedItems = newItems.map((item, index) => ({
                ...item,
                display_order: index,
            }));

            useResumeStore.getState().setLanguages(updatedItems);
        }
    }

    return (
        <Card className="rounded-none border-[#102b2b]/15 bg-[#f8f4ec] shadow-[4px_4px_0_rgba(16,43,43,0.06)]">
            <CardHeader className="bg-[#e9eee8] border-b border-[#102b2b]/10 py-4">
                <CardTitle className="text-sm font-black uppercase tracking-tight text-[#102b2b]">Languages</CardTitle>
                <CardDescription className="text-xs text-[#52716a] font-semibold mt-1">
                    Languages you speak and your proficiency level
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 p-5">
                {languages.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 p-3 bg-white/60 border border-[#102b2b]/10">
                        {languages.map((lang) => (
                            <Badge key={lang.id} variant="secondary" className="px-2.5 py-0.5 rounded-none bg-[#102b2b]/5 text-[#102b2b] border border-[#102b2b]/10 text-xs font-semibold gap-1">
                                {lang.language || "Untitled"}
                                <span className="text-[10px] text-[#52716a]">
                                    ({lang.proficiency})
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
                        <SortableContext items={languages} strategy={verticalListSortingStrategy}>
                            {languages.map((lang) => (
                                <SortableItem key={lang.id} id={lang.id} className="w-full">
                                    <div className="flex items-center gap-3 rounded-none border border-[#102b2b]/10 bg-white p-3 hover:bg-white transition-colors shadow-sm text-[#102b2b] w-full">
                                        <div className="cursor-grab active:cursor-grabbing p-1">
                                            <GripVertical className="h-4 w-4 text-[#52716a]" />
                                        </div>
                                        
                                        <div className="flex-1 min-w-0">
                                            <Label className="text-[10px] font-bold text-[#52716a] uppercase">Language</Label>
                                            <Input
                                                value={lang.language}
                                                onChange={(e) => updateLanguage(lang.id, { language: e.target.value })}
                                                className="h-9 mt-1 rounded-none border-[#102b2b]/15 bg-[#f8f4ec]/30 focus-visible:ring-[#102b2b]"
                                            />
                                        </div>

                                        <div className="w-48 shrink-0">
                                            <Label className="text-[10px] font-bold text-[#52716a] uppercase">Proficiency</Label>
                                            <Select
                                                value={lang.proficiency}
                                                onValueChange={(val) => updateLanguage(lang.id, { proficiency: val })}
                                            >
                                                <SelectTrigger className="h-9 mt-1 rounded-none border-[#102b2b]/15 bg-[#f8f4ec]/30">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent className="bg-[#f8f4ec] border-[#102b2b]/15">
                                                    <SelectItem value="Native or Bilingual" className="hover:bg-[#102b2b]/5 cursor-pointer">Native or Bilingual</SelectItem>
                                                    <SelectItem value="Full Professional" className="hover:bg-[#102b2b]/5 cursor-pointer">Full Professional</SelectItem>
                                                    <SelectItem value="Professional Working" className="hover:bg-[#102b2b]/5 cursor-pointer">Professional Working</SelectItem>
                                                    <SelectItem value="Limited Working" className="hover:bg-[#102b2b]/5 cursor-pointer">Limited Working</SelectItem>
                                                    <SelectItem value="Elementary" className="hover:bg-[#102b2b]/5 cursor-pointer">Elementary</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => removeLanguage(lang.id)}
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
                    Add Language
                </Button>
            </CardContent>
        </Card>
    );
}
