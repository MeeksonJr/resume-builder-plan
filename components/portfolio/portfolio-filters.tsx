"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { Search, SlidersHorizontal, X } from "lucide-react"
import { cn } from "@/lib/utils"

interface FilterState {
    search: string
    skills: string[]
    location: string
    sortBy: string
    openToWork: boolean
}

interface PortfolioFiltersProps {
    filters: FilterState
    onFiltersChange: (filters: FilterState) => void
    availableSkills?: string[]
}

export function PortfolioFilters({
    filters,
    onFiltersChange,
    availableSkills = [],
}: PortfolioFiltersProps) {
    const [isOpen, setIsOpen] = React.useState(false)

    const activeFilterCount = [
        filters.skills.length > 0,
        filters.location,
        filters.openToWork,
    ].filter(Boolean).length

    const clearFilters = () => {
        onFiltersChange({
            search: "",
            skills: [],
            location: "",
            sortBy: "recent",
            openToWork: false,
        })
    }

    const toggleSkill = (skill: string) => {
        const newSkills = filters.skills.includes(skill)
            ? filters.skills.filter((s) => s !== skill)
            : [...filters.skills, skill]
        onFiltersChange({ ...filters, skills: newSkills })
    }

    return (
        <div className="space-y-4">
            {/* Search and Sort Row */}
            <div className="flex flex-col sm:flex-row gap-3">
                {/* Search */}
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        value={filters.search}
                        onChange={(e) => onFiltersChange({ ...filters, search: e.target.value })}
                        placeholder="Search by name, role, or skills..."
                        className="pl-10 h-11 glass-border rounded-xl"
                    />
                </div>

                {/* Sort */}
                <Select
                    value={filters.sortBy}
                    onValueChange={(sortBy) => onFiltersChange({ ...filters, sortBy })}
                >
                    <SelectTrigger className="w-full sm:w-[180px] h-11 glass-border rounded-xl">
                        <SelectValue placeholder="Sort by" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="recent">Most Recent</SelectItem>
                        <SelectItem value="popular">Most Popular</SelectItem>
                        <SelectItem value="name">Name (A-Z)</SelectItem>
                    </SelectContent>
                </Select>

                {/* Filters Popover */}
                <Popover open={isOpen} onOpenChange={setIsOpen}>
                    <PopoverTrigger asChild>
                        <Button variant="outline" className="h-11 gap-2 glass-border rounded-xl relative">
                            <SlidersHorizontal className="h-4 w-4" />
                            Filters
                            {activeFilterCount > 0 && (
                                <Badge
                                    variant="default"
                                    className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
                                >
                                    {activeFilterCount}
                                </Badge>
                            )}
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-80 glass glass-border rounded-2xl" align="end">
                        <div className="space-y-6">
                            <div className="flex items-center justify-between">
                                <h3 className="font-heading font-black text-sm">Advanced Filters</h3>
                                {activeFilterCount > 0 && (
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={clearFilters}
                                        className="h-8 text-xs gap-1"
                                    >
                                        <X className="h-3 w-3" />
                                        Clear All
                                    </Button>
                                )}
                            </div>

                            {/* Location Filter */}
                            <div className="space-y-2">
                                <Label htmlFor="location" className="text-xs font-bold">
                                    Location
                                </Label>
                                <Input
                                    id="location"
                                    value={filters.location}
                                    onChange={(e) => onFiltersChange({ ...filters, location: e.target.value })}
                                    placeholder="e.g. San Francisco, Remote"
                                    className="glass-border rounded-lg h-9"
                                />
                            </div>

                            {/* Skills Filter */}
                            {availableSkills.length > 0 && (
                                <div className="space-y-2">
                                    <Label className="text-xs font-bold">Skills</Label>
                                    <div className="flex flex-wrap gap-1.5 max-h-40 overflow-y-auto">
                                        {availableSkills.slice(0, 20).map((skill) => (
                                            <Badge
                                                key={skill}
                                                variant={filters.skills.includes(skill) ? "default" : "outline"}
                                                className={cn(
                                                    "cursor-pointer transition-all hover:scale-105",
                                                    filters.skills.includes(skill)
                                                        ? "bg-primary text-primary-foreground"
                                                        : "hover:bg-primary/10"
                                                )}
                                                onClick={() => toggleSkill(skill)}
                                            >
                                                {skill}
                                            </Badge>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Open to Work Toggle */}
                            <div className="flex items-center justify-between p-3 rounded-lg border border-primary/10 bg-primary/5">
                                <div className="space-y-0.5">
                                    <Label className="text-xs font-bold cursor-pointer">
                                        Open to Work Only
                                    </Label>
                                    <p className="text-xs text-muted-foreground">
                                        Show only available candidates
                                    </p>
                                </div>
                                <Button
                                    variant={filters.openToWork ? "default" : "outline"}
                                    size="sm"
                                    onClick={() =>
                                        onFiltersChange({ ...filters, openToWork: !filters.openToWork })
                                    }
                                    className="h-8 rounded-lg"
                                >
                                    {filters.openToWork ? "On" : "Off"}
                                </Button>
                            </div>

                            <Button
                                onClick={() => setIsOpen(false)}
                                className="w-full rounded-lg bg-gradient-to-br from-primary to-primary/80 font-black"
                            >
                                Apply Filters
                            </Button>
                        </div>
                    </PopoverContent>
                </Popover>
            </div>

            {/* Active Filters Display */}
            {(filters.skills.length > 0 || filters.location || filters.openToWork) && (
                <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-bold text-muted-foreground">Active filters:</span>
                    {filters.location && (
                        <Badge
                            variant="secondary"
                            className="gap-1 rounded-lg cursor-pointer hover:bg-destructive/10"
                            onClick={() => onFiltersChange({ ...filters, location: "" })}
                        >
                            {filters.location}
                            <X className="h-3 w-3" />
                        </Badge>
                    )}
                    {filters.skills.map((skill) => (
                        <Badge
                            key={skill}
                            variant="secondary"
                            className="gap-1 rounded-lg cursor-pointer hover:bg-destructive/10"
                            onClick={() => toggleSkill(skill)}
                        >
                            {skill}
                            <X className="h-3 w-3" />
                        </Badge>
                    ))}
                    {filters.openToWork && (
                        <Badge
                            variant="secondary"
                            className="gap-1 rounded-lg cursor-pointer hover:bg-destructive/10"
                            onClick={() => onFiltersChange({ ...filters, openToWork: false })}
                        >
                            Open to Work
                            <X className="h-3 w-3" />
                        </Badge>
                    )}
                </div>
            )}
        </div>
    )
}
