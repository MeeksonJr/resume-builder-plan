"use client"

import * as React from "react"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { Target, Briefcase, TrendingUp } from "lucide-react"

interface CareerSettingsProps {
    profile: any
}

const INDUSTRIES = [
    "Technology",
    "Finance & Banking",
    "Healthcare",
    "Marketing & Advertising",
    "Consulting",
    "Education",
    "Manufacturing",
    "Retail & E-commerce",
    "Government",
    "Non-Profit",
    "Legal",
    "Real Estate",
    "Media & Entertainment",
    "Other",
]

const EXPERIENCE_LEVELS = [
    { value: "entry", label: "Entry Level (0-2 years)" },
    { value: "mid", label: "Mid Level (3-5 years)" },
    { value: "senior", label: "Senior Level (6-10 years)" },
    { value: "lead", label: "Lead/Manager (10+ years)" },
    { value: "executive", label: "Executive/Director" },
]

export function CareerSettings({ profile }: CareerSettingsProps) {
    const router = useRouter()
    const [loading, setLoading] = React.useState(false)

    // Get career settings from profile or settings JSONB
    const careerFromSettings = profile?.settings?.career || {}

    const [targetRole, setTargetRole] = React.useState(profile?.target_role ?? "")
    const [targetIndustry, setTargetIndustry] = React.useState(profile?.target_industry ?? "")
    const [experienceLevel, setExperienceLevel] = React.useState(careerFromSettings?.experience_level ?? "mid")
    const [careerGoals, setCareerGoals] = React.useState(profile?.career_goals ?? "")
    const [targetCompanies, setTargetCompanies] = React.useState(careerFromSettings?.target_companies ?? "")

    const handleSave = async () => {
        setLoading(true)
        try {
            const supabase = createClient()

            // Get current settings or create new object
            const currentSettings = profile?.settings || {}

            // Update with career data that doesn't have dedicated columns
            const newSettings = {
                ...currentSettings,
                career: {
                    experience_level: experienceLevel,
                    target_companies: targetCompanies,
                }
            }

            const { error } = await supabase
                .from("profiles")
                .update({
                    target_role: targetRole,
                    target_industry: targetIndustry,
                    career_goals: careerGoals,
                    settings: newSettings,
                })
                .eq("id", profile.id)

            if (error) throw error

            toast.success("Career preferences saved successfully")
            router.refresh()
        } catch (error: any) {
            toast.error(error.message || "Failed to save career preferences")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="space-y-6">
            <div className="space-y-4">
                {/* Target Role */}
                <div className="space-y-2">
                    <Label htmlFor="target-role" className="flex items-center gap-2">
                        <Target className="h-4 w-4 text-primary" />
                        Target Role
                    </Label>
                    <Input
                        id="target-role"
                        placeholder="e.g., Senior Software Engineer, Product Manager"
                        value={targetRole}
                        onChange={(e) => setTargetRole(e.target.value)}
                        className="h-11 rounded-none border-input bg-background"
                    />
                    <p className="text-xs text-muted-foreground">
                        The job title you&apos;re targeting for your next role.
                    </p>
                </div>

                {/* Target Industry */}
                <div className="space-y-2">
                    <Label htmlFor="target-industry" className="flex items-center gap-2">
                        <Briefcase className="h-4 w-4 text-primary" />
                        Target Industry
                    </Label>
                    <Select value={targetIndustry} onValueChange={setTargetIndustry}>
                        <SelectTrigger id="target-industry" className="h-11 rounded-none border-input bg-background">
                            <SelectValue placeholder="Select your target industry" />
                        </SelectTrigger>
                        <SelectContent>
                            {INDUSTRIES.map((industry) => (
                                <SelectItem key={industry} value={industry}>
                                    {industry}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground">
                        AI features will customize suggestions for this industry.
                    </p>
                </div>

                {/* Experience Level */}
                <div className="space-y-2">
                    <Label htmlFor="experience-level" className="flex items-center gap-2">
                        <TrendingUp className="h-4 w-4 text-primary" />
                        Experience Level
                    </Label>
                    <Select value={experienceLevel} onValueChange={setExperienceLevel}>
                        <SelectTrigger id="experience-level" className="h-11 rounded-none border-input bg-background">
                            <SelectValue placeholder="Select your experience level" />
                        </SelectTrigger>
                        <SelectContent>
                            {EXPERIENCE_LEVELS.map((level) => (
                                <SelectItem key={level.value} value={level.value}>
                                    {level.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                {/* Career Goals */}
                <div className="space-y-2">
                    <Label htmlFor="career-goals">Career Goals</Label>
                    <Textarea
                        id="career-goals"
                        placeholder="Describe your career goals and aspirations..."
                        value={careerGoals}
                        onChange={(e) => setCareerGoals(e.target.value)}
                        className="rounded-none border-input bg-background min-h-[100px]"
                    />
                    <p className="text-xs text-muted-foreground">
                        This helps Career Coach and AI features provide personalized advice.
                    </p>
                </div>

                {/* Target Companies */}
                <div className="space-y-2">
                    <Label htmlFor="target-companies">Target Companies (Optional)</Label>
                    <Textarea
                        id="target-companies"
                        placeholder="List companies you're interested in, separated by commas..."
                        value={targetCompanies}
                        onChange={(e) => setTargetCompanies(e.target.value)}
                        className="rounded-none border-input bg-background min-h-[80px]"
                    />
                    <p className="text-xs text-muted-foreground">
                        We&apos;ll tailor recommendations based on these companies.
                    </p>
                </div>
            </div>

            <Button
                onClick={handleSave}
                disabled={loading}
                className="min-h-11 w-full rounded-none bg-primary font-black text-primary-foreground hover:bg-primary/90 sm:w-auto"
            >
                {loading ? "Saving..." : "Save Career Preferences"}
            </Button>
        </div>
    )
}
