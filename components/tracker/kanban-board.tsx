"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Plus, MoreHorizontal, DollarSign, Calendar, ExternalLink, Briefcase } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { format } from "date-fns";
import { toast } from "sonner";

interface Application {
    id: string;
    company: string;
    role: string;
    status: 'applied' | 'interviewing' | 'offered' | 'rejected' | 'archived';
    salary_range: string | null;
    location: string | null;
    url: string | null;
    notes: string | null;
    applied_at: string;
}

const COLUMNS = [
    { id: 'applied', label: 'Applied', color: 'bg-blue-500/10 text-blue-500' },
    { id: 'interviewing', label: 'Interviewing', color: 'bg-yellow-500/10 text-yellow-500' },
    { id: 'offered', label: 'Offer', color: 'bg-green-500/10 text-green-500' },
    { id: 'rejected', label: 'Rejected', color: 'bg-red-500/10 text-red-500' },
];

export function KanbanBoard() {
    const [applications, setApplications] = useState<Application[]>([]);
    const [loading, setLoading] = useState(true);
    const [loadError, setLoadError] = useState(false);
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    // Form State
    const [company, setCompany] = useState("");
    const [role, setRole] = useState("");
    const [status, setStatus] = useState("applied");
    const [url, setUrl] = useState("");
    const [notes, setNotes] = useState("");

    const supabase = createClient();

    const fetchApplications = async () => {
        const { data, error } = await supabase
            .from("applications")
            .select("*")
            .order("created_at", { ascending: false });

        if (!error && data) {
            setApplications(data);
            setLoadError(false);
        } else if (error) {
            setLoadError(true);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchApplications();
    }, []);

    const handleAddJob = async () => {
        if (!company || !role) {
            toast.error("Company and Role are required");
            return;
        }

        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { error } = await supabase.from("applications").insert({
            user_id: user.id,
            company,
            role,
            status,
            url: url || null,
            notes: notes || null,
        });

        if (error) {
            toast.error("Failed to add job");
        } else {
            toast.success("Job added");
            setCompany("");
            setRole("");
            setStatus("applied");
            setUrl("");
            setNotes("");
            setIsDialogOpen(false);
            fetchApplications();
        }
    };

    const handleStatusUpdate = async (id: string, newStatus: string) => {
        const { error } = await supabase
            .from("applications")
            .update({ status: newStatus })
            .eq("id", id);

        if (error) {
            toast.error("Failed to update status");
        } else {
            fetchApplications();
        }
    };

    if (loading) {
        return (
            <div className="space-y-6">
                <div className="border-b border-[#102b2b]/15 pb-5">
                    <div className="h-3 w-24 animate-pulse bg-[#102b2b]/10" />
                    <div className="mt-3 h-9 w-56 animate-pulse bg-[#102b2b]/10" />
                </div>
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                    {COLUMNS.map((column) => <div key={column.id} className="h-52 animate-pulse border border-[#102b2b]/10 bg-white/40" />)}
                </div>
            </div>
        );
    }

    if (loadError) {
        return (
            <div className="border border-red-900/20 bg-white p-8 text-center">
                <Briefcase className="mx-auto h-8 w-8 text-red-800/60" aria-hidden="true" />
                <h2 className="mt-4 text-lg font-bold text-[#102b2b]">Applications could not load</h2>
                <p className="mt-2 text-sm text-[#102b2b]/65">Refresh the board to try again.</p>
                <Button variant="outline" className="mt-5 border-[#102b2b]/20" onClick={fetchApplications}>Refresh board</Button>
            </div>
        );
    }

    return (
        <div className="flex min-h-[calc(100vh-128px)] flex-col gap-6">
            <div className="flex flex-col gap-4 border-b border-[#102b2b]/15 pb-5 sm:flex-row sm:items-end sm:justify-between">
                <div>
                    <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#0d8274]">Applications / Job tracker</p>
                    <h1 className="mt-2 text-3xl font-black tracking-tight text-[#102b2b]">Keep every opportunity moving.</h1>
                    <p className="mt-2 text-sm text-[#102b2b]/65">{applications.length} tracked {applications.length === 1 ? "application" : "applications"}</p>
                </div>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                        <Button className="h-10 gap-2 rounded-none bg-[#102b2b] px-4 text-[#d8f36b] hover:bg-[#0d8274]">
                            <Plus className="h-4 w-4" />
                            Add Job
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Track New Application</DialogTitle>
                            <DialogDescription>Add details about a job you've applied to.</DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="grid gap-4 sm:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="application-company">Company</Label>
                                    <Input id="application-company" value={company} onChange={e => setCompany(e.target.value)} placeholder="Google" />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="application-role">Role</Label>
                                    <Input id="application-role" value={role} onChange={e => setRole(e.target.value)} placeholder="Senior Engineer" />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label>Status</Label>
                                <Select value={status} onValueChange={setStatus}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {COLUMNS.map(col => (
                                            <SelectItem key={col.id} value={col.id}>{col.label}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="application-url">Job URL (Optional)</Label>
                                <Input id="application-url" value={url} onChange={e => setUrl(e.target.value)} placeholder="https://linkedin.com/jobs/..." />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="application-notes">Notes</Label>
                                <Textarea id="application-notes" value={notes} onChange={e => setNotes(e.target.value)} placeholder="Referral from..." />
                            </div>
                            <Button onClick={handleAddJob} className="w-full rounded-none bg-[#102b2b] text-[#d8f36b] hover:bg-[#0d8274]">Save Job</Button>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="flex-1 overflow-x-auto pb-2">
                <div className="grid h-full min-w-[1024px] grid-cols-4 gap-4">
                    {COLUMNS.map(col => (
                        <div key={col.id} className="flex min-w-[250px] flex-col border border-[#102b2b]/15 bg-white/35 p-3">
                            <div className={`mb-3 flex items-center justify-between border-b border-[#102b2b]/10 px-2 pb-3 text-sm font-bold ${col.color}`}>
                                <span>{col.label}</span>
                                <Badge variant="secondary" className="rounded-none border border-[#102b2b]/15 bg-transparent text-[#102b2b]">{applications.filter(a => a.status === col.id).length}</Badge>
                            </div>
                            <ScrollArea className="flex-1">
                                <div className="space-y-3 pr-2 pb-4">
                                    {applications.filter(a => a.status === col.id).length === 0 && (
                                        <p className="border border-dashed border-[#102b2b]/15 px-3 py-8 text-center text-xs text-[#102b2b]/55">No applications here</p>
                                    )}
                                    {applications.filter(a => a.status === col.id).map(app => (
                                        <Card key={app.id} className="group cursor-pointer rounded-none border-[#102b2b]/15 bg-[#f8faf5] shadow-none transition-colors hover:border-[#0d8274]">
                                            <CardContent className="p-3 space-y-2">
                                                <div className="flex justify-between items-start">
                                                    <div>
                                                        <h3 className="font-semibold text-sm leading-tight">{app.role}</h3>
                                                        <p className="text-xs text-muted-foreground font-medium mt-1">{app.company}</p>
                                                    </div>
                                                    <Select defaultValue={app.status} onValueChange={(v) => handleStatusUpdate(app.id, v)}>
                                                        <SelectTrigger className="h-6 w-6 p-0 border-none shadow-none focus:ring-0 opacity-0 group-hover:opacity-100 transition-opacity">
                                                            <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            {COLUMNS.map(c => (
                                                                <SelectItem key={c.id} value={c.id}>{c.label}</SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                </div>

                                                <div className="flex flex-wrap gap-2 text-[10px] text-muted-foreground pt-1">
                                                        <span className="flex items-center gap-1 border border-[#102b2b]/10 bg-[#e9eee8] px-1.5 py-0.5">
                                                        <Calendar className="h-3 w-3" />
                                                        {format(new Date(app.applied_at), "MMM d")}
                                                    </span>
                                                    {app.salary_range && (
                                                        <span className="flex items-center gap-1 border border-[#0d8274]/20 bg-[#d8f36b]/45 px-1.5 py-0.5 text-[#102b2b]">
                                                            <DollarSign className="h-3 w-3" />
                                                            {app.salary_range}
                                                        </span>
                                                    )}
                                                </div>

                                                {app.url && (
                                                    <a href={app.url} target="_blank" rel="noreferrer" className="text-xs text-primary hover:underline flex items-center gap-1 mt-2">
                                                        View Job <ExternalLink className="h-3 w-3" />
                                                    </a>
                                                )}
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>
                            </ScrollArea>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
