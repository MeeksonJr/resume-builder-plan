"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import {
    Briefcase,
    FileText,
    LayoutDashboard,
    Settings,
    User,
    LogOut,
    Sparkles,
    Search,
    Plus,
    ArrowRight,
} from "lucide-react"

import {
    CommandDialog,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
    CommandSeparator,
    CommandShortcut,
} from "@/components/ui/command"

export function CommandMenu() {
    const [open, setOpen] = React.useState(false)
    const router = useRouter()

    React.useEffect(() => {
        const down = (e: KeyboardEvent) => {
            if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
                e.preventDefault()
                setOpen((open) => !open)
            }
        }

        document.addEventListener("keydown", down)
        return () => document.removeEventListener("keydown", down)
    }, [])

    const runCommand = React.useCallback((command: () => void) => {
        setOpen(false)
        command()
    }, [])

    return (
        <CommandDialog open={open} onOpenChange={setOpen}>
            <CommandInput placeholder="Type a command or search..." />
            <CommandList className="glass border-none">
                <CommandEmpty>No results found.</CommandEmpty>
                <CommandGroup heading="Suggestions">
                    <CommandItem
                        onSelect={() => runCommand(() => router.push("/dashboard"))}
                        className="rounded-lg"
                    >
                        <LayoutDashboard className="mr-2 h-4 w-4" />
                        <span>Dashboard</span>
                        <CommandShortcut>G D</CommandShortcut>
                    </CommandItem>
                    <CommandItem
                        onSelect={() => runCommand(() => router.push("/dashboard/resume/new"))}
                        className="rounded-lg"
                    >
                        <Plus className="mr-2 h-4 w-4" />
                        <span>New Resume</span>
                        <CommandShortcut>N R</CommandShortcut>
                    </CommandItem>
                    <CommandItem
                        onSelect={() => runCommand(() => router.push("/dashboard/tracker"))}
                        className="rounded-lg"
                    >
                        <Briefcase className="mr-2 h-4 w-4" />
                        <span>Job Tracker</span>
                        <CommandShortcut>G T</CommandShortcut>
                    </CommandItem>
                </CommandGroup>
                <CommandSeparator className="bg-primary/5" />
                <CommandGroup heading="AI Tools">
                    <CommandItem
                        onSelect={() => runCommand(() => router.push("/dashboard/career-coach"))}
                        className="rounded-lg"
                    >
                        <Sparkles className="mr-2 h-4 w-4" />
                        <span>Career Coach</span>
                    </CommandItem>
                    <CommandItem
                        onSelect={() => runCommand(() => router.push("/dashboard/optimize"))}
                        className="rounded-lg"
                    >
                        <ArrowRight className="mr-2 h-4 w-4" />
                        <span>Optimize Resume</span>
                    </CommandItem>
                </CommandGroup>
                <CommandSeparator className="bg-primary/5" />
                <CommandGroup heading="Settings">
                    <CommandItem
                        onSelect={() => runCommand(() => router.push("/dashboard/profile"))}
                        className="rounded-lg"
                    >
                        <User className="mr-2 h-4 w-4" />
                        <span>Profile</span>
                        <CommandShortcut>P</CommandShortcut>
                    </CommandItem>
                    <CommandItem
                        onSelect={() => runCommand(() => router.push("/dashboard/settings"))}
                        className="rounded-lg"
                    >
                        <Settings className="mr-2 h-4 w-4" />
                        <span>Settings</span>
                        <CommandShortcut>S</CommandShortcut>
                    </CommandItem>
                </CommandGroup>
            </CommandList>
        </CommandDialog>
    )
}
