"use client"

import * as React from "react"
import { Label } from "@/components/ui/label"
import { Card } from "@/components/ui/card"
import { Moon, Sun, Monitor, Check } from "lucide-react"
import { useTheme } from "next-themes"
import { toast } from "sonner"

const themes = [
    { id: "slate", name: "Modern Slate", primary: "215 25% 27%" },
    { id: "teal", name: "Professional Teal", primary: "173 80% 40%" },
    { id: "rose", name: "Creative Rose", primary: "350 89% 60%" },
    { id: "violet", name: "Tech Violet", primary: "262 83% 58%" },
]

export function AppearanceSettings() {
    const { theme, setTheme, systemTheme } = useTheme()
    const [mounted, setMounted] = React.useState(false)
    const [selectedTheme, setSelectedTheme] = React.useState("slate")
    const [density, setDensity] = React.useState<"balanced" | "compact">("balanced")

    React.useEffect(() => {
        setMounted(true)
        // Get current theme from localStorage or default to slate
        const savedTheme = localStorage.getItem("color-theme") || "slate"
        setSelectedTheme(savedTheme)

        const savedDensity = (localStorage.getItem("ui-density") as "balanced" | "compact") || "balanced"
        setDensity(savedDensity)

        // Apply theme and density on mount
        const root = document.documentElement
        themes.forEach(t => root.classList.remove(`theme-${t.id}`))
        root.classList.add(`theme-${savedTheme}`)
        root.setAttribute("data-density", savedDensity)

        const activeThemeObj = themes.find(t => t.id === savedTheme)
        if (activeThemeObj) {
            root.style.setProperty("--primary", activeThemeObj.primary)
            root.style.setProperty("--ring", activeThemeObj.primary)
        }
    }, [])

    const handleThemeChange = (themeId: string) => {
        setSelectedTheme(themeId)
        const root = document.documentElement

        // Remove all theme classes
        themes.forEach(t => root.classList.remove(`theme-${t.id}`))

        // Add new theme class
        root.classList.add(`theme-${themeId}`)

        // Set CSS variables directly
        const targetTheme = themes.find(t => t.id === themeId)
        if (targetTheme) {
            root.style.setProperty("--primary", targetTheme.primary)
            root.style.setProperty("--ring", targetTheme.primary)
        }

        // Save to localStorage
        localStorage.setItem("color-theme", themeId)
        toast.success(`Accent color updated to ${targetTheme?.name || themeId}`)
    }

    const handleDensityChange = (newDensity: "balanced" | "compact") => {
        setDensity(newDensity)
        document.documentElement.setAttribute("data-density", newDensity)
        localStorage.setItem("ui-density", newDensity)
        toast.success(`Density set to ${newDensity === "balanced" ? "Balanced (Default)" : "Compact (Pro View)"}`)
    }

    const currentTheme = theme === "system" ? systemTheme : theme

    if (!mounted) {
        return <div className="h-64 animate-pulse bg-muted/20 rounded-lg" />
    }

    return (
        <div className="space-y-8">
            {/* Theme Mode */}
            <div className="space-y-4">
                <div>
                    <Label className="text-base font-heading font-black">Theme Mode</Label>
                    <p className="text-sm text-muted-foreground">
                        Choose how ResumeForge looks for you.
                    </p>
                </div>

                <div className="grid grid-cols-3 gap-4">
                    <Card
                        className={`cursor-pointer border-2 p-4 transition-all hover:shadow-lg ${currentTheme === "light"
                                ? "border-primary bg-primary/5"
                                : "border-transparent hover:border-primary/50"
                            }`}
                        onClick={() => setTheme("light")}
                    >
                        <div className="flex flex-col items-center gap-2 text-center">
                            <div className="rounded-full bg-gradient-to-br from-amber-400 to-yellow-500 p-3">
                                <Sun className="h-5 w-5 text-white" />
                            </div>
                            <span className="font-bold text-sm">Light</span>
                            {currentTheme === "light" && <Check className="h-4 w-4 text-primary" />}
                        </div>
                    </Card>

                    <Card
                        className={`cursor-pointer border-2 p-4 transition-all hover:shadow-lg ${currentTheme === "dark"
                                ? "border-primary bg-primary/5"
                                : "border-transparent hover:border-primary/50"
                            }`}
                        onClick={() => setTheme("dark")}
                    >
                        <div className="flex flex-col items-center gap-2 text-center">
                            <div className="rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 p-3">
                                <Moon className="h-5 w-5 text-white" />
                            </div>
                            <span className="font-bold text-sm">Dark</span>
                            {currentTheme === "dark" && <Check className="h-4 w-4 text-primary" />}
                        </div>
                    </Card>

                    <Card
                        className={`cursor-pointer border-2 p-4 transition-all hover:shadow-lg ${theme === "system"
                                ? "border-primary bg-primary/5"
                                : "border-transparent hover:border-primary/50"
                            }`}
                        onClick={() => setTheme("system")}
                    >
                        <div className="flex flex-col items-center gap-2 text-center">
                            <div className="rounded-full bg-gradient-to-br from-slate-400 to-slate-600 p-3">
                                <Monitor className="h-5 w-5 text-white" />
                            </div>
                            <span className="font-bold text-sm">System</span>
                            {theme === "system" && <Check className="h-4 w-4 text-primary" />}
                        </div>
                    </Card>
                </div>
            </div>

            {/* Color Theme */}
            <div className="space-y-4">
                <div>
                    <Label className="text-base font-heading font-black">Accent Color</Label>
                    <p className="text-sm text-muted-foreground">
                        Choose your preferred color scheme.
                    </p>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                    {themes.map((t) => (
                        <Card
                            key={t.id}
                            className={`cursor-pointer border-2 p-4 transition-all hover:shadow-lg ${selectedTheme === t.id
                                    ? "border-primary bg-primary/5"
                                    : "border-transparent hover:border-primary/50"
                                }`}
                            onClick={() => handleThemeChange(t.id)}
                        >
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div
                                        className="h-10 w-10 rounded-full border-2 border-white/20 shadow-lg"
                                        style={{ backgroundColor: `hsl(${t.primary})` }}
                                    />
                                    <span className="font-bold">{t.name}</span>
                                </div>
                                {selectedTheme === t.id && (
                                    <Check className="h-5 w-5 text-primary" />
                                )}
                            </div>
                        </Card>
                    ))}
                </div>
            </div>

            {/* UI Density Preference */}
            <div className="space-y-4 pt-4 border-t border-border">
                <div>
                    <Label className="text-base font-heading font-black">Interface Density</Label>
                    <p className="text-sm text-muted-foreground">
                        Adjust information density for the resume editor and dashboard widgets.
                    </p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <Card
                        className={`cursor-pointer border-2 p-4 transition-all ${
                            density === "balanced"
                                ? "border-primary bg-primary/5"
                                : "border-border hover:border-primary/50"
                        }`}
                        onClick={() => handleDensityChange("balanced")}
                    >
                        <div className="space-y-1">
                            <div className="flex items-center justify-between">
                                <span className="font-bold text-sm">Balanced</span>
                                {density === "balanced" && <Check className="h-4 w-4 text-primary" />}
                            </div>
                            <p className="text-xs text-muted-foreground">
                                Optimal padding and spacing for high-resolution displays.
                            </p>
                        </div>
                    </Card>

                    <Card
                        className={`cursor-pointer border-2 p-4 transition-all ${
                            density === "compact"
                                ? "border-primary bg-primary/5"
                                : "border-border hover:border-primary/50"
                        }`}
                        onClick={() => handleDensityChange("compact")}
                    >
                        <div className="space-y-1">
                            <div className="flex items-center justify-between">
                                <span className="font-bold text-sm">Compact</span>
                                {density === "compact" && <Check className="h-4 w-4 text-primary" />}
                            </div>
                            <p className="text-xs text-muted-foreground">
                                High-density layout displaying more resume sections simultaneously.
                            </p>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    )
}
