import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Calendar, Building2, MapPin, DollarSign, Link as LinkIcon, ArrowLeft, Trash2 } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";

interface ApplicationDetailsPageProps {
    params: Promise<{ id: string }>;
}

export default async function ApplicationDetailsPage({ params }: ApplicationDetailsPageProps) {
    const { id } = await params;
    const supabase = await createClient();

    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        redirect("/auth/login");
    }

    const { data: application } = await supabase
        .from("applications")
        .select("*, resumes(title), cover_letters(title)")
        .eq("id", id)
        .eq("user_id", user.id)
        .single();

    if (!application) {
        notFound();
    }

    return (
        <div className="space-y-6 text-[#102b2b]">
            <div className="flex flex-col gap-4 border-b border-[#102b2b]/15 pb-5 sm:flex-row sm:items-center">
                <Link href="/dashboard/tracker" aria-label="Back to job tracker">
                    <Button variant="outline" size="icon" className="rounded-none border-[#102b2b]/20">
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                </Link>
                <div>
                    <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#0d8274]">Application record</p>
                    <h1 className="mt-1 text-3xl font-black tracking-tight">{application.role}</h1>
                    <div className="mt-1 flex items-center gap-2 text-sm text-[#102b2b]/65">
                        <Building2 className="h-4 w-4" />
                        <span className="font-medium">{application.company}</span>
                    </div>
                </div>
                <div className="flex items-center gap-2 sm:ml-auto">
                    <Badge className="rounded-none capitalize" variant={
                        application.status === 'offered' ? 'default' :
                            application.status === 'rejected' ? 'destructive' :
                                'secondary'
                    }>
                        {application.status}
                    </Badge>
                    <Button variant="destructive" size="icon" aria-label="Delete application" className="h-9 w-9 rounded-none">
                        <Trash2 className="h-4 w-4" />
                    </Button>
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
                {/* Main Details */}
                <div className="md:col-span-2 space-y-6">
                    <Card className="rounded-none border-[#102b2b]/15 bg-white/55 shadow-none">
                        <CardHeader>
                            <CardTitle>Job Details</CardTitle>
                        </CardHeader>
                        <CardContent className="grid gap-5 md:grid-cols-2">
                            <div className="space-y-1">
                                <label className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#102b2b]/55">Salary Range</label>
                                <div className="flex items-center gap-2">
                                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                                    <span>{application.salary_range || "Not specified"}</span>
                                </div>
                            </div>
                            <div className="space-y-1">
                                <label className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#102b2b]/55">Location</label>
                                <div className="flex items-center gap-2">
                                    <MapPin className="h-4 w-4 text-muted-foreground" />
                                    <span>{application.location || "Remote / Not specified"}</span>
                                </div>
                            </div>
                            <div className="space-y-1 col-span-2">
                                <label className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#102b2b]/55">Job URL</label>
                                <div className="flex items-center gap-2">
                                    <LinkIcon className="h-4 w-4 text-muted-foreground" />
                                    {application.url ? (
                                        <a href={application.url} target="_blank" rel="noreferrer" className="block w-full truncate text-[#0d8274] hover:underline">
                                            {application.url}
                                        </a>
                                    ) : (
                                        <span className="text-muted-foreground">No link saved</span>
                                    )}
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="rounded-none border-[#102b2b]/15 bg-white/55 shadow-none">
                        <CardHeader>
                            <CardTitle className="text-lg">Notes</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="whitespace-pre-wrap text-sm leading-6 text-[#102b2b]/70">
                                {application.notes || "No notes added yet."}
                            </p>
                        </CardContent>
                    </Card>
                </div>

                {/* Sidebar / Metadata */}
                <div className="space-y-6">
                    <Card className="rounded-none border-[#102b2b]/15 bg-white/55 shadow-none">
                        <CardHeader>
                            <CardTitle className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#102b2b]/55">Timeline</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center gap-3">
                                <div className="flex h-8 w-8 items-center justify-center border border-[#0d8274]/20 bg-[#d8f36b]/45 text-[#0d8274]">
                                    <Calendar className="h-4 w-4" />
                                </div>
                                <div>
                                    <p className="text-xs text-muted-foreground">Applied On</p>
                                    <p className="text-sm font-medium">
                                        {format(new Date(application.applied_at), "MMM d, yyyy")}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="flex h-8 w-8 items-center justify-center border border-[#102b2b]/10 bg-[#e9eee8] text-[#102b2b]/55">
                                    <Calendar className="h-4 w-4" />
                                </div>
                                <div>
                                    <p className="text-xs text-muted-foreground">Last Updated</p>
                                    <p className="text-sm font-medium">
                                        {format(new Date(application.updated_at), "MMM d, yyyy")}
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="rounded-none border-[#102b2b]/15 bg-white/55 shadow-none">
                        <CardHeader>
                            <CardTitle className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#102b2b]/55">Linked Assets</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-1">
                                <p className="text-xs font-medium text-muted-foreground">Resume Used</p>
                                {application.resumes ? (
                                    <Link href={`/dashboard/resume/${application.resume_id}/edit`} className="text-sm text-[#0d8274] hover:underline">
                                        {application.resumes.title}
                                    </Link>
                                ) : (
                                    <span className="text-sm text-muted-foreground italic">None linked</span>
                                )}
                            </div>
                            <div className="space-y-1">
                                <p className="text-xs font-medium text-muted-foreground">Cover Letter Used</p>
                                {application.cover_letters ? (
                                    <Link href={`/dashboard/cover-letters/${application.cover_letter_id}`} className="text-sm text-[#0d8274] hover:underline">
                                        {application.cover_letters.title}
                                    </Link>
                                ) : (
                                    <span className="text-sm text-muted-foreground italic">None linked</span>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
