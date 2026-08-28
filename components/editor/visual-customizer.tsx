"use client";

import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Palette, Check, Languages, Loader2, Sparkles } from "lucide-react";
import { useResumeStore, VisualConfig } from "@/lib/stores/resume-store";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { toast } from "sonner";
import { Switch } from "@/components/ui/switch";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { ColorPicker } from "@/components/visual/color-picker";
import { FontPicker } from "@/components/visual/font-picker";
import { LayoutControls } from "@/components/visual/layout-controls";



export function VisualCustomizer() {
    const {
        language, setLanguage,
        is_rtl, setIsRtl,
        profile, workExperiences, education, skills, projects, certifications, languages: resumeLanguages,
        setProfile, setWorkExperiences, setEducation, setSkills, setProjects, setCertifications, setLanguages
    } = useResumeStore();

    const [isTranslating, setIsTranslating] = useState(false);

    const handleTranslate = async () => {
        if (isTranslating) return;

        setIsTranslating(true);
        const toastId = toast.loading(`Translating resume to ${language}...`);

        try {
            const resumeData = {
                profile,
                workExperiences,
                education,
                skills,
                projects,
                certifications,
                languages: resumeLanguages,
            };

            const response = await fetch("/api/ai/translate", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    data: resumeData,
                    targetLanguage: language,
                }),
            });

            if (!response.ok) throw new Error("Translation failed");

            const translated = await response.json();

            // Update store with translated data
            if (translated.profile) setProfile(translated.profile);
            if (translated.workExperiences) setWorkExperiences(translated.workExperiences);
            if (translated.education) setEducation(translated.education);
            if (translated.skills) setSkills(translated.skills);
            if (translated.projects) setProjects(translated.projects);
            if (translated.certifications) setCertifications(translated.certifications);
            if (translated.languages) setLanguages(translated.languages);

            // Auto-enable RTL for Arabic and Hebrew
            if (language === "ar" || language === "he") {
                setIsRtl(true);
            }

            toast.success("Resume translated successfully!", { id: toastId });
        } catch (error) {
            console.error(error);
            toast.error("Failed to translate resume. Please try again.", { id: toastId });
        } finally {
            setIsTranslating(false);
        }
    };
    return (
        <Sheet>
            <SheetTrigger asChild>
                <Button variant="outline" size="sm" className="h-10 gap-2 border-white/20 bg-transparent text-[#f8f4ec] hover:bg-white/10 hover:text-white rounded-none">
                    <Palette className="h-4 w-4 text-[#a6c0b8]" />
                    <span className="hidden sm:inline">Style</span>
                </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] sm:w-[400px] overflow-y-auto bg-[#f8f4ec] border-[#102b2b]/15 text-[#102b2b] rounded-none">
                <SheetHeader>
                    <SheetTitle className="text-lg font-black uppercase tracking-tight text-[#102b2b]">Customize Style</SheetTitle>
                    <SheetDescription className="text-xs text-[#52716a]">
                        Change the look and feel of your resume. Changes are reflected in real-time.
                    </SheetDescription>
                </SheetHeader>
                <div className="mt-8 space-y-8 pb-10">
                    <ColorPicker />
                    <div className="h-px bg-border" />
                    <FontPicker />
                    <div className="h-px bg-border" />
                    <LayoutControls />

                    <div className="h-px bg-border my-6" />

                    {/* Language & Localisation */}
                    <div className="space-y-6">
                        <Label className="text-base font-bold">Language & Localization</Label>

                        <div className="space-y-2">
                            <Label className="text-sm font-semibold">Resume Language</Label>
                            <Select value={language} onValueChange={setLanguage}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select Language" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="en">English</SelectItem>
                                    <SelectItem value="fr">French</SelectItem>
                                    <SelectItem value="de">German</SelectItem>
                                    <SelectItem value="es">Spanish</SelectItem>
                                    <SelectItem value="ar">Arabic (RTL)</SelectItem>
                                    <SelectItem value="he">Hebrew (RTL)</SelectItem>
                                    <SelectItem value="zh">Chinese</SelectItem>
                                    <SelectItem value="ja">Japanese</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                                <Label className="text-sm font-semibold">Right-to-Left (RTL)</Label>
                                <p className="text-xs text-muted-foreground">Flip layout for Arabic, Hebrew, etc.</p>
                            </div>
                            <Switch checked={is_rtl} onCheckedChange={setIsRtl} />
                        </div>

                        <Button
                            className="w-full gap-2"
                            variant="secondary"
                            onClick={handleTranslate}
                            disabled={isTranslating}
                        >
                            {isTranslating ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                                <Sparkles className="h-4 w-4" />
                            )}
                            Translate Entire Resume
                        </Button>
                        <p className="text-[10px] text-muted-foreground text-center">
                            Uses AI to translate all sections while preserving structure.
                        </p>
                    </div>
                </div>
            </SheetContent>
        </Sheet>
    );
}
