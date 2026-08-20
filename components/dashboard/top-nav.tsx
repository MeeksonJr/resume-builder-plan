"use client"

import * as React from "react"
import { Search, Plus, Bell, Command, Sidebar as SidebarIcon, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Kbd } from "@/components/ui/kbd"
import { cn } from "@/lib/utils"

interface TopNavProps {
    isPro?: boolean;
}

export function TopNav({ isPro }: TopNavProps) {
    return (
        <header className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-2 border-b border-[#102b2b]/10 bg-[#f8f4ec]/85 px-4 backdrop-blur-xl transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
            <div className="flex items-center gap-2 px-4">
                <SidebarTrigger className="-ml-1" />
            </div>

            <div className="flex flex-1 items-center justify-between gap-4 md:gap-8">
                <div className="flex flex-1 items-center gap-4">
                    <Button
                        variant="outline"
                        className="hidden h-10 w-full max-w-[400px] justify-start gap-3 rounded-none border-[#102b2b]/10 bg-[#e9eee8] px-4 text-sm font-medium text-[#52716a] transition-all hover:border-[#0d8274]/40 hover:text-[#102b2b] md:flex"
                        onClick={() => {
                            // Trigger command menu
                            const event = new KeyboardEvent('keydown', {
                                key: 'k',
                                ctrlKey: true,
                                bubbles: true
                            });
                            document.dispatchEvent(event);
                        }}
                    >
                        <Search className="h-4 w-4" />
                            <span>Search your workspace...</span>
                            <Kbd className="pointer-events-none ml-auto select-none bg-white/60 px-1.5 py-0.5 text-[10px] font-black tracking-widest">
                            CTRL K
                        </Kbd>
                    </Button>

                    <Button
                        variant="ghost"
                        size="icon"
                        className="md:hidden h-10 w-10 text-muted-foreground"
                        onClick={() => {
                            const event = new KeyboardEvent('keydown', {
                                key: 'k',
                                ctrlKey: true,
                                bubbles: true
                            });
                            document.dispatchEvent(event);
                        }}
                    >
                        <Search className="h-5 w-5" />
                    </Button>
                </div>

                <div className="flex items-center gap-2">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-10 w-10 text-muted-foreground relative"
                    >
                        <Bell className="h-5 w-5" />
                        <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-primary border-2 border-background" />
                    </Button>

                    {!isPro && (
                        <Button
                            variant="outline"
                            className="hidden h-10 gap-2 rounded-none border-[#d8a84e]/30 bg-[#d8a84e]/10 text-[#9a6b16] hover:bg-[#d8a84e]/20 hover:text-[#7a5110] sm:flex"
                            onClick={() => window.location.href = '/dashboard/subscription'}
                        >
                            <Sparkles className="h-4 w-4" />
                            Upgrade
                        </Button>
                    )}

                    <div className="h-6 w-px bg-primary/10 mx-1 hidden sm:block" />

                    <Button
                        className="hidden h-10 gap-2 rounded-none bg-[#102b2b] text-xs font-semibold tracking-tight text-[#f8f4ec] shadow-lg shadow-[#102b2b]/15 hover:bg-[#164743] sm:flex"
                        onClick={() => window.location.href = '/dashboard/resume/new'}
                    >
                        <Plus className="h-4 w-4" />
                        New resume
                    </Button>
                </div>
            </div>
        </header>
    )
}
