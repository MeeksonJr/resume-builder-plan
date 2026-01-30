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
import { SortableAccordionItem, SortableDragHandle } from "../sortable-accordion";

export function CertificationsForm() {
    const { certifications, addCertification, updateCertification, removeCertification } = useResumeStore();

    const handleAdd = () => {
        addCertification({
            name: "",
            issuer: "",
            issue_date: "",
            expiry_date: "",
            credential_id: "",
            credential_url: "",
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
            const oldIndex = certifications.findIndex((item) => item.id === active.id);
            const newIndex = certifications.findIndex((item) => item.id === over.id);

            const newItems = arrayMove(certifications, oldIndex, newIndex);

            const updatedItems = newItems.map((item, index) => ({
                ...item,
                display_order: index,
            }));

            useResumeStore.getState().setCertifications(updatedItems);
        }
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Certifications</CardTitle>
                <CardDescription>
                    Add your licenses and certifications
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragEnd={handleDragEnd}
                >
                    <Accordion type="single" collapsible className="w-full space-y-4">
                        <SortableContext
                            items={certifications}
                            strategy={verticalListSortingStrategy}
                        >
                            {certifications.map((cert, index) => (
                                <SortableAccordionItem key={cert.id} id={cert.id} value={cert.id} className="border rounded-lg px-4 bg-white">
                                    <div className="flex items-center py-2">
                                        <SortableDragHandle className="mr-2" />
                                        <AccordionTrigger className="flex-1 hover:no-underline py-2">
                                            <div className="text-left">
                                                <div className="font-semibold">
                                                    {cert.name || "New Certification"}
                                                </div>
                                                <div className="text-sm text-muted-foreground">
                                                    {cert.issuer || "Issuing Organization"}
                                                </div>
                                            </div>
                                        </AccordionTrigger>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => removeCertification(cert.id)}
                                            className="text-destructive hover:text-destructive/90"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                    <AccordionContent className="pt-4 pb-4 space-y-4">
                                        <div className="grid gap-4 sm:grid-cols-2">
                                            <div className="space-y-2">
                                                <Label>Certification Name</Label>
                                                <Input
                                                    value={cert.name}
                                                    onChange={(e) =>
                                                        updateCertification(cert.id, { name: e.target.value })
                                                    }
                                                    placeholder="e.g. AWS Certified Solutions Architect"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label>Issuing Organization</Label>
                                                <Input
                                                    value={cert.issuer || ""}
                                                    onChange={(e) =>
                                                        updateCertification(cert.id, { issuer: e.target.value })
                                                    }
                                                    placeholder="e.g. Amazon Web Services"
                                                />
                                            </div>
                                        </div>

                                        <div className="grid gap-4 sm:grid-cols-2">
                                            <div className="space-y-2">
                                                <Label>Issue Date</Label>
                                                <Input
                                                    type="month"
                                                    value={cert.issue_date || ""}
                                                    onChange={(e) =>
                                                        updateCertification(cert.id, { issue_date: e.target.value })
                                                    }
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label>Expiration Date</Label>
                                                <Input
                                                    type="month"
                                                    value={cert.expiry_date || ""}
                                                    onChange={(e) =>
                                                        updateCertification(cert.id, { expiry_date: e.target.value })
                                                    }
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <Label>Credential ID</Label>
                                            <Input
                                                value={cert.credential_id || ""}
                                                onChange={(e) =>
                                                    updateCertification(cert.id, { credential_id: e.target.value })
                                                }
                                                placeholder="e.g. ABC-123-DEF"
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label>Credential URL</Label>
                                            <Input
                                                value={cert.credential_url || ""}
                                                onChange={(e) =>
                                                    updateCertification(cert.id, { credential_url: e.target.value })
                                                }
                                                placeholder="e.g. https://..."
                                            />
                                        </div>
                                    </AccordionContent>
                                </SortableAccordionItem>
                            ))}
                        </SortableContext>
                    </Accordion>
                </DndContext>

                <Button onClick={handleAdd} className="w-full">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Certification
                </Button>
            </CardContent>
        </Card>
    );
}
