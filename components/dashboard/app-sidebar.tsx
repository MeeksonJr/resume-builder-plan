"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import {
    Briefcase,
    ChevronRight,
    FileText,
    LayoutDashboard,
    Settings,
    User,
    LogOut,
    Sparkles,
    TrendingUp,
    Brain,
    Globe,
    ChevronsUpDown,
    Plus,
    Search,
} from "lucide-react"

import { createClient } from "@/lib/supabase/client"
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarMenuSub,
    SidebarMenuSubButton,
    SidebarMenuSubItem,
    SidebarRail,
} from "@/components/ui/sidebar"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"

interface AppSidebarProps {
    user: any
    profile: any
}

const navItems = [
    {
        title: "Dashboard",
        href: "/dashboard",
        icon: LayoutDashboard,
    },
    {
        title: "Resumes",
        href: "/dashboard",
        icon: FileText,
        items: [
            { title: "All Resumes", href: "/dashboard" },
            { title: "Create New", href: "/dashboard/resume/new" },
            { title: "Smart Import", href: "/dashboard/import" },
        ],
    },
    {
        title: "Applications",
        href: "/dashboard/tracker",
        icon: Briefcase,
        items: [
            { title: "Job Tracker", href: "/dashboard/tracker" },
            { title: "Cover Letters", href: "/dashboard/cover-letters" },
        ],
    },
    {
        title: "AI Power-ups",
        href: "/dashboard/career-coach",
        icon: Sparkles,
        items: [
            { title: "Career Coach", href: "/dashboard/career-coach", icon: Sparkles },
            { title: "Resume Optimizer", href: "/dashboard/optimize", icon: TrendingUp },
            { title: "Interview Prep", href: "/dashboard/interview-prep", icon: Brain },
        ],
    },
    {
        title: "Showcase",
        href: "/dashboard/portfolio",
        icon: Globe,
        items: [
            { title: "My Portfolio", href: "/dashboard/portfolio" },
            { title: "Discovery", href: "/portfolios" },
        ],
    },
]

export function AppSidebar({ user, profile: initialProfile }: AppSidebarProps) {
    const pathname = usePathname()
    const router = useRouter()
    const [profile, setProfile] = React.useState(initialProfile)

    // Fetch fresh profile data on mount and set up listener
    React.useEffect(() => {
        const supabase = createClient()

        // Fetch fresh profile data
        const fetchProfile = async () => {
            const { data } = await supabase
                .from("profiles")
                .select("*")
                .eq("id", user.id)
                .single()

            if (data) {
                setProfile(data)
            }
        }

        fetchProfile()

        // Subscribe to profile changes
        const channel = supabase
            .channel(`profile-${user.id}`)
            .on(
                "postgres_changes",
                {
                    event: "*",
                    schema: "public",
                    table: "profiles",
                    filter: `id=eq.${user.id}`,
                },
                (payload) => {
                    if (payload.new) {
                        setProfile(payload.new)
                    }
                }
            )
            .subscribe()

        return () => {
            supabase.removeChannel(channel)
        }
    }, [user.id])

    const displayName = profile?.full_name || user?.user_metadata?.full_name || "User"
    const initials = displayName
        .split(" ")
        .map((n: string) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)

    const handleSignOut = async () => {
        const supabase = createClient()
        await supabase.auth.signOut()
        router.push("/")
        router.refresh()
    }

    return (
        <Sidebar collapsible="icon" className="glass-border border-r bg-background/60 backdrop-blur-xl">
            <SidebarHeader className="h-16 flex items-center justify-center px-4">
                <Link href="/dashboard" className="flex items-center gap-3 w-full group-data-[collapsible=icon]:justify-center">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary/60 shadow-lg shadow-primary/20 transition-all group-hover:scale-110">
                        <FileText className="h-5 w-5 text-primary-foreground" />
                    </div>
                    <div className="flex flex-col gap-0.5 leading-none group-data-[collapsible=icon]:hidden">
                        <span className="text-lg font-heading font-black tracking-tight gradient-text">
                            ResumeForge
                        </span>
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60">
                            Professional
                        </span>
                    </div>
                </Link>
            </SidebarHeader>

            <SidebarContent className="px-3 py-4">
                <SidebarMenu>
                    {navItems.map((item) => {
                        const isActive = pathname === item.href || (item.items?.some(sub => pathname === sub.href))

                        return (
                            <SidebarMenuItem key={item.title}>
                                {item.items ? (
                                    <SidebarMenuButton
                                        tooltip={item.title}
                                        className={cn(
                                            "h-11 rounded-xl transition-all duration-300 hover:bg-primary/5 text-muted-foreground hover:text-foreground",
                                            isActive && "bg-primary/5 text-primary hover:text-primary"
                                        )}
                                    >
                                        <item.icon className={cn("h-5 w-5", isActive && "text-primary")} />
                                        <span className="font-bold tracking-tight">{item.title}</span>
                                        <ChevronRight className="ml-auto h-4 w-4 opacity-50 group-data-[state=open]/menu-item:rotate-90" />
                                    </SidebarMenuButton>
                                ) : (
                                    <SidebarMenuButton
                                        asChild
                                        tooltip={item.title}
                                        className={cn(
                                            "h-11 rounded-xl transition-all duration-300 hover:bg-primary/5 text-muted-foreground hover:text-foreground",
                                            isActive && "bg-primary/5 text-primary hover:text-primary"
                                        )}
                                    >
                                        <Link href={item.href}>
                                            <item.icon className={cn("h-5 w-5", isActive && "text-primary")} />
                                            <span className="font-bold tracking-tight">{item.title}</span>
                                        </Link>
                                    </SidebarMenuButton>
                                )}

                                {item.items && (
                                    <SidebarMenuSub>
                                        {item.items.map((subItem) => (
                                            <SidebarMenuSubItem key={subItem.title}>
                                                <SidebarMenuSubButton
                                                    asChild
                                                    isActive={pathname === subItem.href}
                                                    className="rounded-lg h-9 font-medium"
                                                >
                                                    <Link href={subItem.href}>{subItem.title}</Link>
                                                </SidebarMenuSubButton>
                                            </SidebarMenuSubItem>
                                        ))}
                                    </SidebarMenuSub>
                                )}
                            </SidebarMenuItem>
                        )
                    })}
                </SidebarMenu>
            </SidebarContent>

            <SidebarFooter className="p-3 border-t border-primary/5">
                <SidebarMenu>
                    <SidebarMenuItem>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <SidebarMenuButton
                                    size="lg"
                                    className="h-14 rounded-2xl hover:bg-primary/5 data-[state=open]:bg-primary/5 transition-all"
                                >
                                    <Avatar className="h-9 w-9 border-2 border-primary/10">
                                        {profile?.avatar_url && (
                                            <AvatarImage src={profile.avatar_url} alt={displayName} />
                                        )}
                                        <AvatarFallback className="bg-primary/10 text-primary font-black text-xs">
                                            {initials}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="flex flex-col gap-0.5 text-left leading-none group-data-[collapsible=icon]:hidden">
                                        <span className="text-sm font-black tracking-tight truncate max-w-[120px]">
                                            {displayName}
                                        </span>
                                        <span className="text-[10px] font-bold text-muted-foreground truncate max-w-[120px]">
                                            {user?.email}
                                        </span>
                                    </div>
                                    <ChevronsUpDown className="ml-auto h-4 w-4 opacity-50 group-data-[collapsible=icon]:hidden" />
                                </SidebarMenuButton>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent
                                align="start"
                                side="right"
                                className="w-64 glass glass-border rounded-2xl p-2 shadow-2xl animate-in fade-in slide-in-from-left-2 duration-300"
                            >
                                <DropdownMenuLabel className="font-normal px-2 py-3">
                                    <div className="flex flex-col gap-1">
                                        <p className="text-sm font-black leading-none">{displayName}</p>
                                        <p className="text-xs font-medium text-muted-foreground">{user?.email}</p>
                                    </div>
                                </DropdownMenuLabel>
                                <DropdownMenuSeparator className="bg-primary/10" />
                                <DropdownMenuItem asChild className="rounded-xl h-11 cursor-pointer">
                                    <Link href="/dashboard/settings">
                                        <Settings className="mr-3 h-4.5 w-4.5 opacity-70" />
                                        <span className="font-bold">Settings</span>
                                    </Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem asChild className="rounded-xl h-11 cursor-pointer">
                                    <Link href="/dashboard/profile">
                                        <User className="mr-3 h-4.5 w-4.5 opacity-70" />
                                        <span className="font-bold">Profile</span>
                                    </Link>
                                </DropdownMenuItem>
                                <DropdownMenuSeparator className="bg-primary/10" />
                                <DropdownMenuItem
                                    className="rounded-xl h-11 cursor-pointer text-destructive focus:text-destructive focus:bg-destructive/10"
                                    onClick={handleSignOut}
                                >
                                    <LogOut className="mr-3 h-4.5 w-4.5" />
                                    <span className="font-black">SIGN OUT</span>
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarFooter>
            <SidebarRail />
        </Sidebar>
    )
}
