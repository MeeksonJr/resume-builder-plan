"use client"

import * as React from "react"
import Link from "next/link"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
    MapPin,
    ExternalLink,
    Eye,
    Briefcase,
    TrendingUp,
} from "lucide-react"
import { cn } from "@/lib/utils"

interface PortfolioCardProps {
    portfolio: any
    featured?: boolean
}

export function PortfolioCard({ portfolio, featured = false }: PortfolioCardProps) {
    const displayName = portfolio.full_name || portfolio.profiles?.full_name || "Professional"
    const initials = displayName
        .split(" ")
        .map((n: string) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)

    const skills = portfolio.skills || []
    const displayedSkills = skills.slice(0, 4)
    const remainingSkills = Math.max(0, skills.length - 4)

    return (
        <Card
            className={cn(
                "group relative overflow-hidden rounded-none border-[#102b2b]/15 bg-[#f5f7f2] shadow-none transition-colors duration-200 hover:border-[#0d8274] hover:shadow-[5px_5px_0_#d8f36b]",
                featured && "border-2 border-[#0d8274] shadow-[5px_5px_0_#d8f36b]"
            )}
        >
            {/* Featured Badge */}
            {featured && (
                <div className="absolute right-3 top-3 z-10">
                    <Badge className="rounded-none border-none bg-[#d8f36b] text-[#102b2b] shadow-none">
                        <TrendingUp className="h-3 w-3 mr-1" />
                        Featured
                    </Badge>
                </div>
            )}

            {/* Header with gradient & avatar */}
            <CardHeader className="relative p-0">
                <div className="h-24 border-b border-[#102b2b]/10 bg-[#102b2b] transition-colors group-hover:bg-[#0d8274]" />
                <div className="absolute bottom-0 left-6 translate-y-1/2">
                    <Avatar className="h-16 w-16 rounded-none border-4 border-[#f5f7f2] shadow-none">
                        {portfolio.avatar_url && (
                            <AvatarImage src={portfolio.avatar_url} alt={displayName} />
                        )}
                        <AvatarFallback className="rounded-none bg-[#d8f36b] text-lg font-black text-[#102b2b]">
                            {initials}
                        </AvatarFallback>
                    </Avatar>
                </div>
            </CardHeader>

            {/* Content */}
            <CardContent className="pt-10 pb-4 px-6 space-y-4">
                {/* Name & Status */}
                <div className="space-y-2">
                    <div className="flex items-start justify-between gap-2">
                        <h3 className="line-clamp-1 text-xl font-heading font-black tracking-[-0.02em] text-[#102b2b] transition-colors group-hover:text-[#0d8274]">
                            {displayName}
                        </h3>
                        {portfolio.open_to_work && (
                            <Badge
                                variant="secondary"
                                className="shrink-0 whitespace-nowrap rounded-none border-[#0d8274]/25 bg-[#0d8274]/10 text-[#0d8274] hover:bg-[#0d8274]/15"
                            >
                                Available
                            </Badge>
                        )}
                    </div>

                    {portfolio.tagline && (
                        <p className="text-sm font-medium text-muted-foreground line-clamp-1">
                            {portfolio.tagline}
                        </p>
                    )}

                    {/* Location */}
                    {(portfolio.location || portfolio.profiles?.location) && (
                        <div className="flex items-center gap-1.5 text-xs text-[#102b2b]/55">
                            <MapPin className="h-3 w-3" />
                            <span>{portfolio.location || portfolio.profiles?.location}</span>
                        </div>
                    )}
                </div>

                {/* Bio */}
                {portfolio.bio && (
                    <p className="line-clamp-2 text-sm leading-relaxed text-[#102b2b]/65">
                        {portfolio.bio}
                    </p>
                )}

                {/* Skills */}
                {displayedSkills.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                        {displayedSkills.map((skill: string, i: number) => (
                            <Badge
                                key={i}
                                variant="outline"
                                className="rounded-none border-[#102b2b]/15 bg-transparent text-xs font-medium text-[#102b2b]/70 hover:bg-[#d8f36b]/35"
                            >
                                {skill}
                            </Badge>
                        ))}
                        {remainingSkills > 0 && (
                            <Badge
                                variant="outline"
                                className="rounded-none border-[#102b2b]/10 bg-[#102b2b]/5 text-xs font-medium text-[#102b2b]/55"
                            >
                                +{remainingSkills}
                            </Badge>
                        )}
                    </div>
                )}

                {/* Stats */}
                <div className="flex items-center gap-4 border-t border-[#102b2b]/10 pt-3 text-xs text-[#102b2b]/55">
                    {portfolio.view_count !== undefined && portfolio.view_count > 0 && (
                        <div className="flex items-center gap-1">
                            <Eye className="h-3 w-3" />
                            <span className="font-medium">{portfolio.view_count.toLocaleString()}</span>
                        </div>
                    )}
                    {portfolio.project_count !== undefined && portfolio.project_count > 0 && (
                        <div className="flex items-center gap-1">
                            <Briefcase className="h-3 w-3" />
                            <span className="font-medium">{portfolio.project_count} projects</span>
                        </div>
                    )}
                </div>
            </CardContent>

            {/* Footer */}
            <CardFooter className="p-6 pt-0">
                <Button
                    className="h-10 w-full gap-2 rounded-none bg-[#102b2b] font-bold text-[#d8f36b] transition-colors hover:bg-[#0d8274]"
                    asChild
                >
                    <Link href={`/p/${portfolio.slug}`}>
                        View Portfolio
                        <ExternalLink className="h-3.5 w-3.5" />
                    </Link>
                </Button>
            </CardFooter>

            {/* Hover Effect Border */}
            <div className="pointer-events-none absolute inset-0 border-2 border-transparent transition-colors group-hover:border-[#0d8274]/30" />
        </Card>
    )
}
