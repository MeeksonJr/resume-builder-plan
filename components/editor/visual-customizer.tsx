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
import { Palette, Languages, Loader2, Sparkles, RotateCcw, Sliders, Globe } from "lucide-react";
import { useResumeStore } from "@/lib/stores/resume-store";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ColorPicker } from "@/components/visual/color-picker";
import { FontPicker } from "@/components/visual/font-picker";
import { LayoutControls } from "@/components/visual/layout-controls";

export function VisualCustomizer() {
    const {
        language, setLanguage,
        is_rtl, setIsRtl,
        profile, workExperiences, education, skills, projects, certifications, languages: resumeLanguages,
        setProfile, setWorkExperiences, setEducation, setSkills, setProjects, setCertifications, setLanguages,
        updateVisualConfig,
    } = useResumeStore();

    const [isTranslating, setIsTranslating] = useState(false);
    const [activeTab, setActiveTab] = useState("style");

    const handleResetDefaults = () => {
        updateVisualConfig({
            accentColor: "#0f172a",
            fontFamily: "Inter",
            fontSize: "standard",
            lineHeight: "standard",
            margins: "standard",
            nav_style: "standard",
        });
        toast.success("Reset styles to default");
    };

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
                <Button
                    variant="outline"
                    size="sm"
                    className="h-10 gap-2 border-white/20 bg-transparent text-[#f8f4ec] hover:bg-white/10 hover:text-white rounded-none font-bold"
                >
                    <Palette className="h-4 w-4 text-[#a6c0b8]" />
                    <span className="hidden sm:inline">Customize Style</span>
                </Button>
            </SheetTrigger>
            <SheetContent
                side="right"
                className="w-full sm:max-w-md sm:w-[460px] overflow-y-auto bg-[#f8f4ec] border-l border-[#102b2b]/15 text-[#102b2b] rounded-none p-6"
            >
                {/* Header */}
                <SheetHeader className="border-b border-[#102b2b]/15 pb-4 space-y-1">
                    <div className="flex items-center justify-between">
                        <SheetTitle className="text-base font-black uppercase tracking-wider text-[#102b2b] flex items-center gap-2">
                            <Palette className="h-4 w-4 text-[#0d8274]" />
                            Customize Style
                        </SheetTitle>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleResetDefaults}
                            className="h-7 px-2 text-[11px] font-bold text-[#52716a] hover:text-[#102b2b] hover:bg-black/5 rounded-none gap-1"
                            title="Reset all styling options to defaults"
                        >
                            <RotateCcw className="h-3 w-3" />
                            Reset
                        </Button>
                    </div>
                    <SheetDescription className="text-xs text-[#52716a]">
                        Fine-tune typography, color palettes, spacing, and sizing in real-time.
                    </SheetDescription>
                </SheetHeader>

                {/* Segmented Mode Selector */}
                <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-5 w-full">
                    <TabsList className="grid w-full grid-cols-2 rounded-none bg-white/70 border border-[#102b2b]/15 p-1">
                        <TabsTrigger
                            value="style"
                            className="rounded-none text-xs font-bold text-[#52716a] data-[state=active]:bg-[#102b2b] data-[state=active]:text-white gap-1.5"
                        >
                            <Sliders className="h-3.5 w-3.5" />
                            Visual Styling
                        </TabsTrigger>
                        <TabsTrigger
                            value="locale"
                            className="rounded-none text-xs font-bold text-[#52716a] data-[state=active]:bg-[#102b2b] data-[state=active]:text-white gap-1.5"
                        >
                            <Globe className="h-3.5 w-3.5" />
                            Language & RTL
                        </TabsTrigger>
                    </TabsList>

                    {/* Tab 1: Visual Styling */}
                    <TabsContent value="style" className="mt-5 space-y-6 pb-8">
                        <ColorPicker />
                        <div className="h-px bg-[#102b2b]/10" />
                        <FontPicker />
                        <div className="h-px bg-[#102b2b]/10" />
                        <LayoutControls />
                    </TabsContent>

                    {/* Tab 2: Language & RTL */}
                    <TabsContent value="locale" className="mt-5 space-y-6 pb-8">
                        <div className="space-y-5 p-4 bg-white/70 border border-[#102b2b]/15 rounded-none">
                            <div className="space-y-2">
                                <Label className="text-xs font-bold text-[#52716a] uppercase tracking-wider">
                                    Target Language
                                </Label>
                                <Select value={language} onValueChange={setLanguage}>
                                    <SelectTrigger className="rounded-none border-[#102b2b]/20 bg-white">
                                        <SelectValue placeholder="Select Language" />
                                    </SelectTrigger>
                                    <SelectContent className="rounded-none">
                                        <SelectItem value="en">English (US/UK)</SelectItem>
                                        <SelectItem value="es">Spanish (Español)</SelectItem>
                                        <SelectItem value="fr">French (Français)</SelectItem>
                                        <SelectItem value="de">German (Deutsch)</SelectItem>
                                        <SelectItem value="ar">Arabic (العربية - RTL)</SelectItem>
                                        <SelectItem value="he">Hebrew (עברית - RTL)</SelectItem>
                                        <SelectItem value="zh">Chinese (中文)</SelectItem>
                                        <SelectItem value="ja">Japanese (日本語)</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="flex items-center justify-between pt-2 border-t border-[#102b2b]/10">
                                <div className="space-y-0.5">
                                    <Label className="text-xs font-bold text-[#102b2b]">
                                        Right-to-Left (RTL) Layout
                                    </Label>
                                    <p className="text-[11px] text-[#52716a]">
                                        Flips headers, alignment, and column flow
                                    </p>
                                </div>
                                <Switch checked={is_rtl} onCheckedChange={setIsRtl} />
                            </div>

                            <div className="pt-2">
                                <Button
                                    className="w-full gap-2 rounded-none bg-[#102b2b] text-[#f8f4ec] hover:bg-[#1a3d3d] font-bold"
                                    onClick={handleTranslate}
                                    disabled={isTranslating}
                                >
                                    {isTranslating ? (
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : (
                                        <Sparkles className="h-4 w-4 text-[#d8f36b]" />
                                    )}
                                    Translate All Content
                                </Button>
                                <p className="text-[10px] text-[#52716a] text-center mt-2">
                                    Uses AI to translate summary, experiences, and education into the target language.
                                </p>
                            </div>
                        </div>
                    </TabsContent>
                </Tabs>
            </SheetContent>
        </Sheet>
    );
}
