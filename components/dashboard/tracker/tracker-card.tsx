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
    ArrowRight,
    ExternalLink,
    ChevronRight
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
import { cn } from "@/lib/utils";

interface TrackerCardProps {
    application: any;
    onUpdateStatus: (id: string, status: string) => void;
}

export function TrackerCard({ application, onUpdateStatus }: TrackerCardProps) {
    return (
        <Card className="bg-slate-900/40 border-primary/5 hover:bg-slate-900/60 transition-all duration-300 rounded-[22px] group shadow-lg overflow-hidden border-t-0 border-r-0 border-l-0">
            <div className="h-0.5 w-full bg-gradient-to-r from-transparent via-primary/20 to-transparent group-hover:via-primary/40 transition-all" />
            <CardHeader className="p-5 pb-2">
                <div className="flex justify-between items-start gap-3">
                    <div className="space-y-1.5 flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                            <div className="p-1 rounded-md bg-primary/10">
                                <Building2 className="h-3 w-3 text-primary" />
                            </div>
                            <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 truncate">
                                {application.company}
                            </span>
                        </div>
                        <h4 className="font-black text-sm text-white/90 leading-tight group-hover:text-primary transition-colors truncate">
                            {application.role}
                        </h4>
                    </div>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-xl hover:bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity">
                                <MoreVertical className="h-4 w-4 text-muted-foreground" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="bg-slate-950 border-primary/10 rounded-xl">
                            <DropdownMenuLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/40">Status Pipeline</DropdownMenuLabel>
                            <DropdownMenuSeparator className="bg-primary/5" />
                            <DropdownMenuItem onClick={() => onUpdateStatus(application.id, 'applied')} className="focus:bg-primary/10 font-bold text-xs uppercase tracking-tight">
                                Applied
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => onUpdateStatus(application.id, 'interviewing')} className="focus:bg-amber-500/10 font-bold text-xs uppercase tracking-tight">
                                Interviewing
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => onUpdateStatus(application.id, 'offered')} className="focus:bg-emerald-500/10 font-bold text-xs uppercase tracking-tight">
                                Offered
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => onUpdateStatus(application.id, 'rejected')} className="focus:bg-destructive/10 font-bold text-xs uppercase tracking-tight">
                                Rejected
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => onUpdateStatus(application.id, 'archived')} className="focus:bg-white/10 font-bold text-xs uppercase tracking-tight">
                                Archived
                            </DropdownMenuItem>
                            <DropdownMenuSeparator className="bg-primary/5" />
                            {application.url && (
                                <DropdownMenuItem asChild className="focus:bg-primary/10 font-bold text-xs uppercase tracking-tight">
                                    <a href={application.url} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between">
                                        External Post
                                        <ExternalLink className="h-3 w-3 opacity-60" />
                                    </a>
                                </DropdownMenuItem>
                            )}
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </CardHeader>

            <CardContent className="p-5 pt-2 space-y-4">
                <div className="flex flex-col gap-2">
                    <div className="flex items-center justify-between text-[11px] font-bold text-muted-foreground/60">
                        <div className="flex items-center gap-1.5">
                            <MapPin className="h-3 w-3" />
                            <span>{application.location || "Remote"}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <Calendar className="h-3 w-3" />
                            <span>{format(new Date(application.created_at), 'MMM d')}</span>
                        </div>
                    </div>
                </div>

                {(application.resume || application.cover_letter) && (
                    <div className="flex flex-col gap-2 pt-3 border-t border-primary/5">
                        <span className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground/40">Artifacts</span>
                        <div className="flex flex-wrap gap-2">
                            {application.resume && (
                                <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-blue-500/5 border border-blue-500/10 text-[10px] font-bold text-blue-400">
                                    <FileText className="h-3 w-3" />
                                    <span className="truncate max-w-[100px]">{application.resume.title}</span>
                                </div>
                            )}
                            {application.cover_letter && (
                                <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-purple-500/5 border border-purple-500/10 text-[10px] font-bold text-purple-400">
                                    <FileText className="h-3 w-3" />
                                    <span className="truncate max-w-[100px]">{application.cover_letter.title}</span>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </CardContent>

            <CardFooter className="p-3 bg-slate-900/20 group-hover:bg-primary/5 transition-colors">
                <InterviewPrepDialog application={application}>
                    <Button variant="ghost" size="sm" className="w-full text-[10px] font-black uppercase tracking-[0.2em] h-10 gap-2 opacity-60 group-hover:opacity-100 transition-all text-muted-foreground hover:text-primary">
                        Coach Assistant
                        <ChevronRight className="h-3 w-3 transition-transform group-hover:translate-x-1" />
                    </Button>
                </InterviewPrepDialog>
            </CardFooter>
        </Card>
    );
}