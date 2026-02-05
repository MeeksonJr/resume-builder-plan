"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Plus, MoreHorizontal, Briefcase, DollarSign, MapPin, Calendar, ExternalLink } from "lucide-react";
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

        if (!error && data) setApplications(data);
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

    if (loading) return <div className="p-8 text-center text-muted-foreground">Loading board...</div>;

    return (
        <div className="h-full flex flex-col space-y-4">
            <div className="flex justify-between items-center px-4">
                <h2 className="text-2xl font-bold tracking-tight">Job Tracker</h2>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                        <Button className="gap-2">
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
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Company</Label>
                                    <Input value={company} onChange={e => setCompany(e.target.value)} placeholder="Google" />
                                </div>
                                <div className="space-y-2">
                                    <Label>Role</Label>
                                    <Input value={role} onChange={e => setRole(e.target.value)} placeholder="Senior Engineer" />
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
                                <Label>Job URL (Optional)</Label>
                                <Input value={url} onChange={e => setUrl(e.target.value)} placeholder="https://linkedin.com/jobs/..." />
                            </div>
                            <div className="space-y-2">
                                <Label>Notes</Label>
                                <Textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="Referral from..." />
                            </div>
                            <Button onClick={handleAddJob} className="w-full">Save Job</Button>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="flex-1 overflow-x-auto">
                <div className="flex gap-6 px-4 h-full min-w-[1024px]">
                    {COLUMNS.map(col => (
                        <div key={col.id} className="flex-1 min-w-[250px] flex flex-col bg-muted/30 rounded-lg p-3">
                            <div className={`flex items-center justify-between mb-3 px-2 py-1 rounded-md text-sm font-medium ${col.color}`}>
                                <span>{col.label}</span>
                                <Badge variant="secondary" className="bg-white/50">{applications.filter(a => a.status === col.id).length}</Badge>
                            </div>
                            <ScrollArea className="flex-1">
                                <div className="space-y-3 pr-2 pb-4">
                                    {applications.filter(a => a.status === col.id).map(app => (
                                        <Card key={app.id} className="bg-card hover:shadow-md transition-shadow border-muted cursor-pointer group">
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
                                                    <span className="flex items-center gap-1 bg-muted px-1.5 py-0.5 rounded">
                                                        <Calendar className="h-3 w-3" />
                                                        {format(new Date(app.applied_at), "MMM d")}
                                                    </span>
                                                    {app.salary_range && (
                                                        <span className="flex items-center gap-1 bg-green-50 text-green-700 px-1.5 py-0.5 rounded border border-green-100">
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
