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
    Code,
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
                "group relative overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1",
                featured && "border-2 border-primary shadow-lg"
            )}
        >
            {/* Featured Badge */}
            {featured && (
                <div className="absolute top-3 right-3 z-10">
                    <Badge className="bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-lg">
                        <TrendingUp className="h-3 w-3 mr-1" />
                        Featured
                    </Badge>
                </div>
            )}

            {/* Header with gradient & avatar */}
            <CardHeader className="relative p-0">
                <div className="h-24 bg-gradient-to-br from-primary/20 via-primary/10 to-primary/5 transition-all group-hover:from-primary/30 group-hover:via-primary/20 group-hover:to-primary/10" />
                <div className="absolute bottom-0 left-6 translate-y-1/2">
                    <Avatar className="h-16 w-16 border-4 border-background shadow-lg">
                        {portfolio.avatar_url && (
                            <AvatarImage src={portfolio.avatar_url} alt={displayName} />
                        )}
                        <AvatarFallback className="bg-primary/10 text-primary font-black text-lg">
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
                        <h3 className="text-xl font-heading font-black group-hover:text-primary transition-colors line-clamp-1">
                            {displayName}
                        </h3>
                        {portfolio.open_to_work && (
                            <Badge
                                variant="secondary"
                                className="bg-green-500/10 text-green-600 hover:bg-green-500/20 border-green-500/20 whitespace-nowrap shrink-0"
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
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                            <MapPin className="h-3 w-3" />
                            <span>{portfolio.location || portfolio.profiles?.location}</span>
                        </div>
                    )}
                </div>

                {/* Bio */}
                {portfolio.bio && (
                    <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
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
                                className="text-xs font-medium bg-primary/5 hover:bg-primary/10 transition-colors"
                            >
                                {skill}
                            </Badge>
                        ))}
                        {remainingSkills > 0 && (
                            <Badge
                                variant="outline"
                                className="text-xs font-medium bg-muted/50 text-muted-foreground"
                            >
                                +{remainingSkills}
                            </Badge>
                        )}
                    </div>
                )}

                {/* Stats */}
                <div className="flex items-center gap-4 text-xs text-muted-foreground pt-2">
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
                    className="w-full gap-2 rounded-xl h-10 font-bold bg-gradient-to-br from-primary to-primary/80 hover:shadow-lg transition-all"
                    asChild
                >
                    <Link href={`/p/${portfolio.slug}`}>
                        View Portfolio
                        <ExternalLink className="h-3.5 w-3.5" />
                    </Link>
                </Button>
            </CardFooter>

            {/* Hover Effect Border */}
            <div className="absolute inset-0 border-2 border-transparent group-hover:border-primary/20 rounded-lg pointer-events-none transition-colors" />
        </Card>
    )
}
