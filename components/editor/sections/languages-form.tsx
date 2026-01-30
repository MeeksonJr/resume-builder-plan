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
import { Plus, X, Trash2 } from "lucide-react";
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
    rectSortingStrategy,
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
        <Card>
            <CardHeader>
                <CardTitle>Languages</CardTitle>
                <CardDescription>
                    Languages you speak and your proficiency level
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="flex flex-wrap gap-2">
                    {languages.map((lang) => (
                        <Badge key={lang.id} variant="secondary" className="px-3 py-1 gap-2">
                            <input
                                className="bg-transparent border-none outline-none w-24 text-sm font-medium"
                                value={lang.language}
                                onChange={(e) => updateLanguage(lang.id, { language: e.target.value })}
                            />
                            <button
                                onClick={() => removeLanguage(lang.id)}
                                className="hover:text-destructive transition-colors"
                                aria-label={`Remove ${lang.language}`}
                            >
                                <X className="h-3 w-3" />
                            </button>
                        </Badge>
                    ))}
                </div>

                <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragEnd={handleDragEnd}
                >
                    <div className="space-y-4 pt-4 border-t">
                        <div className="grid gap-4 sm:grid-cols-2">
                            <SortableContext items={languages} strategy={rectSortingStrategy}>
                                {languages.map((lang) => (
                                    <SortableItem key={lang.id} id={lang.id} className="border rounded-md bg-white pr-2">
                                        <div className="flex gap-2 items-center p-2 pl-0">
                                            <div className="flex-1 space-y-2">
                                                <Label className="text-xs">Language</Label>
                                                <Input
                                                    value={lang.language}
                                                    onChange={(e) => updateLanguage(lang.id, { language: e.target.value })}
                                                    className="h-8"
                                                />
                                            </div>
                                            <div className="flex-1 space-y-2">
                                                <Label className="text-xs">Proficiency</Label>
                                                <Select
                                                    value={lang.proficiency}
                                                    onValueChange={(val) => updateLanguage(lang.id, { proficiency: val })}
                                                >
                                                    <SelectTrigger className="h-8">
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="Native or Bilingual">Native or Bilingual</SelectItem>
                                                        <SelectItem value="Full Professional">Full Professional</SelectItem>
                                                        <SelectItem value="Professional Working">Professional Working</SelectItem>
                                                        <SelectItem value="Limited Working">Limited Working</SelectItem>
                                                        <SelectItem value="Elementary">Elementary</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => removeLanguage(lang.id)}
                                                className="h-8 w-8 mt-5 text-destructive hover:text-destructive/90"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </SortableItem>
                                ))}
                            </SortableContext>
                        </div>
                    </div>
                </DndContext>

                <Button onClick={handleAdd} className="w-full">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Language
                </Button>
            </CardContent>
        </Card>
    );
}
