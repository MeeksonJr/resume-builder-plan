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
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Link href="/dashboard/tracker">
                    <Button variant="ghost" size="icon">
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                </Link>
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">{application.role}</h1>
                    <div className="flex items-center gap-2 text-muted-foreground">
                        <Building2 className="h-4 w-4" />
                        <span className="font-medium">{application.company}</span>
                    </div>
                </div>
                <div className="ml-auto flex items-center gap-2">
                    <Badge className="capitalize" variant={
                        application.status === 'offered' ? 'default' :
                            application.status === 'rejected' ? 'destructive' :
                                'secondary'
                    }>
                        {application.status}
                    </Badge>
                    <Button variant="destructive" size="icon" className="h-8 w-8">
                        <Trash2 className="h-4 w-4" />
                    </Button>
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
                {/* Main Details */}
                <div className="md:col-span-2 space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Job Details</CardTitle>
                        </CardHeader>
                        <CardContent className="grid gap-4 md:grid-cols-2">
                            <div className="space-y-1">
                                <label className="text-xs font-medium text-muted-foreground uppercase">Salary Range</label>
                                <div className="flex items-center gap-2">
                                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                                    <span>{application.salary_range || "Not specified"}</span>
                                </div>
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-medium text-muted-foreground uppercase">Location</label>
                                <div className="flex items-center gap-2">
                                    <MapPin className="h-4 w-4 text-muted-foreground" />
                                    <span>{application.location || "Remote / Not specified"}</span>
                                </div>
                            </div>
                            <div className="space-y-1 col-span-2">
                                <label className="text-xs font-medium text-muted-foreground uppercase">Job URL</label>
                                <div className="flex items-center gap-2">
                                    <LinkIcon className="h-4 w-4 text-muted-foreground" />
                                    {application.url ? (
                                        <a href={application.url} target="_blank" rel="noreferrer" className="text-primary hover:underline truncate block w-full">
                                            {application.url}
                                        </a>
                                    ) : (
                                        <span className="text-muted-foreground">No link saved</span>
                                    )}
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Notes</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="whitespace-pre-wrap text-sm text-muted-foreground">
                                {application.notes || "No notes added yet."}
                            </p>
                        </CardContent>
                    </Card>
                </div>

                {/* Sidebar / Metadata */}
                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-sm font-medium uppercase tracking-wider text-muted-foreground">Timeline</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center gap-3">
                                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
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
                                <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center text-muted-foreground">
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

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-sm font-medium uppercase tracking-wider text-muted-foreground">Linked Assets</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-1">
                                <p className="text-xs font-medium text-muted-foreground">Resume Used</p>
                                {application.resumes ? (
                                    <Link href={`/dashboard/resume/${application.resume_id}/edit`} className="text-sm text-primary hover:underline">
                                        {application.resumes.title}
                                    </Link>
                                ) : (
                                    <span className="text-sm text-muted-foreground italic">None linked</span>
                                )}
                            </div>
                            <div className="space-y-1">
                                <p className="text-xs font-medium text-muted-foreground">Cover Letter Used</p>
                                {application.cover_letters ? (
                                    <Link href={`/dashboard/cover-letters/${application.cover_letter_id}`} className="text-sm text-primary hover:underline">
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
