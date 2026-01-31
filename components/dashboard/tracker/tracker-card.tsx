"use client";

import { InterviewPrepDialog } from "@/components/dashboard/tracker/interview-prep-dialog";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Building2,
    MapPin,
    Calendar,
    Link as LinkIcon,
    MoreVertical,
    FileText,
    ArrowRight
} from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { format } from "date-fns";

interface TrackerCardProps {
    application: any;
    onUpdateStatus: (id: string, status: string) => void;
}

export function TrackerCard({ application, onUpdateStatus }: TrackerCardProps) {
    return (
        <Card className="shadow-sm hover:shadow-md transition-shadow group">
            <CardHeader className="p-4 pb-2">
                <div className="flex justify-between items-start">
                    <div className="space-y-1">
                        <h4 className="font-bold leading-none project-title group-hover:text-primary transition-colors">
                            {application.role}
                        </h4>
                        <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                            <Building2 className="h-3 w-3" />
                            <span>{application.company}</span>
                        </div>
                    </div>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                                <MoreVertical className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Move to</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => onUpdateStatus(application.id, 'applied')}>
                                Applied
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => onUpdateStatus(application.id, 'interviewing')}>
                                Interviewing
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => onUpdateStatus(application.id, 'offered')}>
                                Offered
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => onUpdateStatus(application.id, 'rejected')}>
                                Rejected
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => onUpdateStatus(application.id, 'archived')}>
                                Archived
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            {application.url && (
                                <DropdownMenuItem asChild>
                                    <a href={application.url} target="_blank" rel="noopener noreferrer" className="cursor-pointer">
                                        View Job Post
                                    </a>
                                </DropdownMenuItem>
                            )}
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </CardHeader>

            <CardContent className="p-4 pt-2 space-y-3">
                <div className="flex flex-wrap gap-2 text-[11px]">
                    {application.location && (
                        <div className="flex items-center gap-1 text-muted-foreground">
                            <MapPin className="h-3 w-3" />
                            <span>{application.location}</span>
                        </div>
                    )}
                    <div className="flex items-center gap-1 text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        <span>{format(new Date(application.applied_at), 'MMM d, yyyy')}</span>
                    </div>
                </div>

                {(application.resume || application.cover_letter) && (
                    <div className="flex flex-wrap gap-2 border-t pt-3">
                        {application.resume && (
                            <Badge variant="outline" className="text-[10px] gap-1 font-normal bg-blue-50/50">
                                <FileText className="h-3 w-3 text-blue-500" />
                                {application.resume.title}
                            </Badge>
                        )}
                        {application.cover_letter && (
                            <Badge variant="outline" className="text-[10px] gap-1 font-normal bg-purple-50/50">
                                <FileText className="h-3 w-3 text-purple-500" />
                                {application.cover_letter.title}
                            </Badge>
                        )}
                    </div>
                )}
            </CardContent>

            <CardFooter className="p-4 pt-0">
                <InterviewPrepDialog application={application}>
                    <Button variant="outline" size="sm" className="w-full text-xs gap-1 py-1 h-8 opacity-0 group-hover:opacity-100 transition-opacity">
                        Preparation Assistant
                        <ArrowRight className="h-3 w-3" />
                    </Button>
                </InterviewPrepDialog>
            </CardFooter>
        </Card>
    );
}