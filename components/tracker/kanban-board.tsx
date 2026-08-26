"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Plus, MoreHorizontal, DollarSign, Calendar, ExternalLink, Briefcase, FileText, GraduationCap, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
    Card,
    CardContent,
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
    cover_letter_id: string | null;
    linked_opportunities: string[] | null;
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
    const [selectedApp, setSelectedApp] = useState<Application | null>(null);
    const [isEditOpen, setIsEditOpen] = useState(false);

    // Cover Letters & Scholarships context state
    const [coverLetters, setCoverLetters] = useState<any[]>([]);
    const [shortlist, setShortlist] = useState<any[]>([]);

    // Form State (New Job)
    const [company, setCompany] = useState("");
    const [role, setRole] = useState("");
    const [status, setStatus] = useState("applied");
    const [salaryRange, setSalaryRange] = useState("");
    const [location, setLocation] = useState("");
    const [url, setUrl] = useState("");
    const [notes, setNotes] = useState("");
    const [coverLetterId, setCoverLetterId] = useState<string>("none");
    const [selectedOpps, setSelectedOpps] = useState<string[]>([]);

    // Form State (Edit Job)
    const [editCompany, setEditCompany] = useState("");
    const [editRole, setEditRole] = useState("");
    const [editStatus, setEditStatus] = useState("applied");
    const [editSalaryRange, setEditSalaryRange] = useState("");
    const [editLocation, setEditLocation] = useState("");
    const [editUrl, setEditUrl] = useState("");
    const [editNotes, setEditNotes] = useState("");
    const [editCoverLetterId, setEditCoverLetterId] = useState<string>("none");
    const [editSelectedOpps, setEditSelectedOpps] = useState<string[]>([]);

    const supabase = createClient();

    const fetchRelatedData = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        // Fetch cover letters
        const { data: cl } = await supabase
            .from("cover_letters")
            .select("id, title")
            .eq("user_id", user.id);
        if (cl) setCoverLetters(cl);

        // Fetch saved scholarships/grants
        const { data: uo } = await supabase
            .from("user_funding_opportunities")
            .select("opportunity_id")
            .eq("user_id", user.id)
            .in("status", ["saved", "applying", "applied"]);
            
        if (uo && uo.length > 0) {
            const oppIds = uo.map(x => x.opportunity_id);
            const { data: fo } = await supabase
                .from("funding_opportunities")
                .select("id, title, provider, kind")
                .in("id", oppIds);
            if (fo) setShortlist(fo);
        }
    };

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
        fetchRelatedData();
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
            salary_range: salaryRange || null,
            location: location || null,
            url: url || null,
            notes: notes || null,
            cover_letter_id: coverLetterId === "none" ? null : coverLetterId,
            linked_opportunities: selectedOpps,
        });

        if (error) {
            toast.error("Failed to add job: " + error.message);
        } else {
            toast.success("Job added successfully");
            setCompany("");
            setRole("");
            setStatus("applied");
            setSalaryRange("");
            setLocation("");
            setUrl("");
            setNotes("");
            setCoverLetterId("none");
            setSelectedOpps([]);
            setIsDialogOpen(false);
            fetchApplications();
        }
    };

    const handleOpenEdit = (app: Application) => {
        setSelectedApp(app);
        setEditCompany(app.company);
        setEditRole(app.role);
        setEditStatus(app.status);
        setEditSalaryRange(app.salary_range || "");
        setEditLocation(app.location || "");
        setEditUrl(app.url || "");
        setEditNotes(app.notes || "");
        setEditCoverLetterId(app.cover_letter_id || "none");
        setEditSelectedOpps(app.linked_opportunities || []);
        setIsEditOpen(true);
    };

    const handleUpdateJob = async () => {
        if (!selectedApp) return;

        const { error } = await supabase
            .from("applications")
            .update({
                company: editCompany,
                role: editRole,
                status: editStatus,
                salary_range: editSalaryRange || null,
                location: editLocation || null,
                url: editUrl || null,
                notes: editNotes || null,
                cover_letter_id: editCoverLetterId === "none" ? null : editCoverLetterId,
                linked_opportunities: editSelectedOpps,
            })
            .eq("id", selectedApp.id);

        if (error) {
            toast.error("Failed to update job: " + error.message);
        } else {
            toast.success("Job updated successfully");
            setIsEditOpen(false);
            fetchApplications();
        }
    };

    const handleDeleteJob = async () => {
        if (!selectedApp) return;

        const confirmDelete = window.confirm("Are you sure you want to delete this job application?");
        if (!confirmDelete) return;

        const { error } = await supabase
            .from("applications")
            .delete()
            .eq("id", selectedApp.id);

        if (error) {
            toast.error("Failed to delete job: " + error.message);
        } else {
            toast.success("Job deleted successfully");
            setIsEditOpen(false);
            fetchApplications();
        }
    };

    const handleStatusUpdate = async (id: string, newStatus: any) => {
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

    const handleToggleOpp = (id: string, isEdit: boolean) => {
        if (isEdit) {
            setEditSelectedOpps(prev => 
                prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
            );
        } else {
            setSelectedOpps(prev => 
                prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
            );
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
                    <DialogContent className="max-w-md max-h-[85vh] overflow-y-auto rounded-none border-[#102b2b]/15 bg-[#f8f4ec]">
                        <DialogHeader>
                            <DialogTitle className="font-heading font-black text-xl uppercase text-[#102b2b]">Track New Application</DialogTitle>
                            <DialogDescription className="text-xs text-[#52716a]">Add details about a job and link your career materials.</DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-3 text-xs text-[#102b2b]">
                            <div className="grid gap-4 sm:grid-cols-2">
                                <div className="space-y-1.5">
                                    <Label htmlFor="application-company" className="font-bold">Company *</Label>
                                    <Input id="application-company" value={company} onChange={e => setCompany(e.target.value)} placeholder="Google" className="rounded-none h-10 border-[#102b2b]/15 bg-white" />
                                </div>
                                <div className="space-y-1.5">
                                    <Label htmlFor="application-role" className="font-bold">Role *</Label>
                                    <Input id="application-role" value={role} onChange={e => setRole(e.target.value)} placeholder="Software Engineer" className="rounded-none h-10 border-[#102b2b]/15 bg-white" />
                                </div>
                            </div>
                            <div className="grid gap-4 sm:grid-cols-2">
                                <div className="space-y-1.5">
                                    <Label htmlFor="application-salary" className="font-bold">Salary Range (Optional)</Label>
                                    <Input id="application-salary" value={salaryRange} onChange={e => setSalaryRange(e.target.value)} placeholder="e.g. $100k - $120k" className="rounded-none h-10 border-[#102b2b]/15 bg-white" />
                                </div>
                                <div className="space-y-1.5">
                                    <Label htmlFor="application-location" className="font-bold">Location (Optional)</Label>
                                    <Input id="application-location" value={location} onChange={e => setLocation(e.target.value)} placeholder="e.g. New York, Remote" className="rounded-none h-10 border-[#102b2b]/15 bg-white" />
                                </div>
                            </div>
                            <div className="space-y-1.5">
                                <Label className="font-bold">Status</Label>
                                <Select value={status} onValueChange={setStatus}>
                                    <SelectTrigger className="rounded-none h-10 border-[#102b2b]/15 bg-white">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent className="rounded-none">
                                        {COLUMNS.map(col => (
                                            <SelectItem key={col.id} value={col.id}>{col.label}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-1.5">
                                <Label htmlFor="application-url" className="font-bold">Job Link URL (Optional)</Label>
                                <Input id="application-url" value={url} onChange={e => setUrl(e.target.value)} placeholder="https://linkedin.com/jobs/..." className="rounded-none h-10 border-[#102b2b]/15 bg-white" />
                            </div>

                            {/* Linked Cover Letter */}
                            <div className="space-y-1.5 border-t border-[#102b2b]/10 pt-3">
                                <Label className="font-bold text-xs text-[#0d8274] flex items-center gap-1.5">
                                    <FileText className="w-3.5 h-3.5" />
                                    Link AI Cover Letter
                                </Label>
                                <Select value={coverLetterId} onValueChange={setCoverLetterId}>
                                    <SelectTrigger className="rounded-none h-10 border-[#102b2b]/15 bg-white">
                                        <SelectValue placeholder="Select a document" />
                                    </SelectTrigger>
                                    <SelectContent className="rounded-none">
                                        <SelectItem value="none">None (No document linked)</SelectItem>
                                        {coverLetters.map(cl => (
                                            <SelectItem key={cl.id} value={cl.id}>{cl.title}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Linked Scholarships/Grants */}
                            <div className="space-y-2 border-t border-[#102b2b]/10 pt-3">
                                <Label className="font-bold text-xs text-[#0d8274] flex items-center gap-1.5">
                                    <GraduationCap className="w-3.5 h-3.5" />
                                    Link Shortlisted Aid Opportunities
                                </Label>
                                {shortlist.length === 0 ? (
                                    <p className="text-[10px] text-muted-foreground italic">No saved scholarships or grants found in your shortlist.</p>
                                ) : (
                                    <div className="p-2.5 bg-white border border-[#102b2b]/15 space-y-1.5 max-h-[120px] overflow-y-auto">
                                        {shortlist.map(opp => (
                                            <label key={opp.id} className="flex items-center gap-2 cursor-pointer hover:bg-muted/50 p-1">
                                                <input 
                                                    type="checkbox"
                                                    checked={selectedOpps.includes(opp.id)}
                                                    onChange={() => handleToggleOpp(opp.id, false)}
                                                    className="rounded-none border-[#102b2b]/30 accent-[#0d8274]"
                                                />
                                                <span className="truncate" title={opp.title}>{opp.title}</span>
                                            </label>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <div className="space-y-1.5">
                                <Label htmlFor="application-notes" className="font-bold">Notes</Label>
                                <Textarea id="application-notes" value={notes} onChange={e => setNotes(e.target.value)} placeholder="Add application details, keywords, or referral info..." className="rounded-none border-[#102b2b]/15 bg-white min-h-[70px]" />
                            </div>
                            <Button onClick={handleAddJob} className="w-full h-11 rounded-none bg-[#102b2b] text-[#d8f36b] hover:bg-[#0d8274] font-bold">Track Application</Button>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>

            {/* Kanban Columns */}
            <div className="flex-1 overflow-x-auto pb-2">
                <div className="grid h-full min-w-[1024px] grid-cols-4 gap-4 text-[#102b2b]">
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
                                        <Card 
                                            key={app.id} 
                                            onClick={() => handleOpenEdit(app)}
                                            className="group cursor-pointer rounded-none border-[#102b2b]/15 bg-[#f8faf5] shadow-none transition-colors hover:border-[#0d8274]"
                                        >
                                            <CardContent className="p-3.5 space-y-3">
                                                <div className="flex justify-between items-start">
                                                    <div>
                                                        <h3 className="font-bold text-sm leading-tight group-hover:text-[#0d8274] transition-colors">{app.role}</h3>
                                                        <p className="text-xs text-muted-foreground font-semibold mt-1">{app.company}</p>
                                                    </div>
                                                    <div onClick={e => e.stopPropagation()}>
                                                        <Select defaultValue={app.status} onValueChange={(v) => handleStatusUpdate(app.id, v)}>
                                                            <SelectTrigger className="h-6 w-6 p-0 border-none bg-transparent shadow-none focus:ring-0 opacity-0 group-hover:opacity-100 transition-opacity">
                                                                <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
                                                            </SelectTrigger>
                                                            <SelectContent className="rounded-none">
                                                                {COLUMNS.map(c => (
                                                                    <SelectItem key={c.id} value={c.id}>{c.label}</SelectItem>
                                                                ))}
                                                            </SelectContent>
                                                        </Select>
                                                    </div>
                                                </div>

                                                {/* Attached Artifact Badges */}
                                                {(app.cover_letter_id || (app.linked_opportunities && app.linked_opportunities.length > 0)) && (
                                                    <div className="flex flex-wrap gap-1.5 pt-1.5 border-t border-[#102b2b]/5">
                                                        {app.cover_letter_id && (
                                                            <Link 
                                                                href={`/dashboard/cover-letters/${app.cover_letter_id}`}
                                                                onClick={(e: any) => e.stopPropagation()}
                                                            >
                                                                <Badge className="rounded-none bg-[#e9eee8] border border-[#102b2b]/10 hover:border-[#0d8274] hover:bg-[#dbe8df] text-[#102b2b] text-[9px] px-1.5 py-0.5 flex items-center gap-1">
                                                                    <FileText className="w-2.5 h-2.5 text-[#0d8274]" />
                                                                    Doc linked
                                                                </Badge>
                                                            </Link>
                                                        )}
                                                        {app.linked_opportunities && app.linked_opportunities.map((oppId, i) => (
                                                            <Badge key={i} className="rounded-none bg-[#d8f36b]/40 border border-[#102b2b]/10 text-[#102b2b] text-[9px] px-1.5 py-0.5 flex items-center gap-1 font-semibold">
                                                                <GraduationCap className="w-2.5 h-2.5 text-[#0d8274]" />
                                                                Aid attached
                                                            </Badge>
                                                        ))}
                                                    </div>
                                                )}

                                                <div className="flex flex-wrap gap-2 text-[10px] text-muted-foreground pt-1.5">
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
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>
                             </ScrollArea>
                        </div>
                    ))}
                </div>
            </div>

            {/* Card Edit/Details Dialog */}
            <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
                <DialogContent className="max-w-md max-h-[85vh] overflow-y-auto rounded-none border-[#102b2b]/15 bg-[#f8f4ec]">
                    <DialogHeader>
                        <DialogTitle className="font-heading font-black text-xl uppercase text-[#102b2b]">Edit Card Details</DialogTitle>
                        <DialogDescription className="text-xs text-[#52716a]">Review status, attached documents, and scholarship linkages.</DialogDescription>
                    </DialogHeader>
                    {selectedApp && (
                        <div className="grid gap-4 py-3 text-xs text-[#102b2b]">
                            <div className="grid gap-4 sm:grid-cols-2">
                                <div className="space-y-1.5">
                                    <Label htmlFor="edit-company" className="font-bold">Company *</Label>
                                    <Input id="edit-company" value={editCompany} onChange={e => setEditCompany(e.target.value)} className="rounded-none h-10 border-[#102b2b]/15 bg-white" />
                                </div>
                                <div className="space-y-1.5">
                                    <Label htmlFor="edit-role" className="font-bold">Role *</Label>
                                    <Input id="edit-role" value={editRole} onChange={e => setEditRole(e.target.value)} className="rounded-none h-10 border-[#102b2b]/15 bg-white" />
                                </div>
                            </div>
                            <div className="grid gap-4 sm:grid-cols-2">
                                <div className="space-y-1.5">
                                    <Label htmlFor="edit-salary" className="font-bold">Salary Range</Label>
                                    <Input id="edit-salary" value={editSalaryRange} onChange={e => setEditSalaryRange(e.target.value)} className="rounded-none h-10 border-[#102b2b]/15 bg-white" />
                                </div>
                                <div className="space-y-1.5">
                                    <Label htmlFor="edit-location" className="font-bold">Location</Label>
                                    <Input id="edit-location" value={editLocation} onChange={e => setEditLocation(e.target.value)} className="rounded-none h-10 border-[#102b2b]/15 bg-white" />
                                </div>
                            </div>
                            <div className="space-y-1.5">
                                <Label className="font-bold">Status</Label>
                                <Select value={editStatus} onValueChange={(v: any) => setEditStatus(v)}>
                                    <SelectTrigger className="rounded-none h-10 border-[#102b2b]/15 bg-white">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent className="rounded-none">
                                        {COLUMNS.map(col => (
                                            <SelectItem key={col.id} value={col.id}>{col.label}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-1.5">
                                <Label htmlFor="edit-url" className="font-bold">Job Link URL</Label>
                                <Input id="edit-url" value={editUrl} onChange={e => setEditUrl(e.target.value)} className="rounded-none h-10 border-[#102b2b]/15 bg-white" />
                            </div>

                            {/* Linked Cover Letter in Edit */}
                            <div className="space-y-1.5 border-t border-[#102b2b]/10 pt-3">
                                <Label className="font-bold text-xs text-[#0d8274] flex items-center gap-1.5">
                                    <FileText className="w-3.5 h-3.5" />
                                    Link AI Cover Letter
                                </Label>
                                <Select value={editCoverLetterId} onValueChange={setEditCoverLetterId}>
                                    <SelectTrigger className="rounded-none h-10 border-[#102b2b]/15 bg-white">
                                        <SelectValue placeholder="Select a document" />
                                    </SelectTrigger>
                                    <SelectContent className="rounded-none">
                                        <SelectItem value="none">None (No document linked)</SelectItem>
                                        {coverLetters.map(cl => (
                                            <SelectItem key={cl.id} value={cl.id}>{cl.title}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Linked Scholarships/Grants in Edit */}
                            <div className="space-y-2 border-t border-[#102b2b]/10 pt-3">
                                <Label className="font-bold text-xs text-[#0d8274] flex items-center gap-1.5">
                                    <GraduationCap className="w-3.5 h-3.5" />
                                    Link Shortlisted Aid Opportunities
                                </Label>
                                {shortlist.length === 0 ? (
                                    <p className="text-[10px] text-muted-foreground italic">No saved scholarships or grants found in your shortlist.</p>
                                ) : (
                                    <div className="p-2.5 bg-white border border-[#102b2b]/15 space-y-1.5 max-h-[120px] overflow-y-auto">
                                        {shortlist.map(opp => (
                                            <label key={opp.id} className="flex items-center gap-2 cursor-pointer hover:bg-muted/50 p-1">
                                                <input 
                                                    type="checkbox"
                                                    checked={editSelectedOpps.includes(opp.id)}
                                                    onChange={() => handleToggleOpp(opp.id, true)}
                                                    className="rounded-none border-[#102b2b]/30 accent-[#0d8274]"
                                                />
                                                <span className="truncate" title={opp.title}>{opp.title}</span>
                                            </label>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <div className="space-y-1.5">
                                <Label htmlFor="edit-notes" className="font-bold">Notes</Label>
                                <Textarea id="edit-notes" value={editNotes} onChange={e => setEditNotes(e.target.value)} className="rounded-none border-[#102b2b]/15 bg-white min-h-[70px]" />
                            </div>

                            <div className="flex gap-3 pt-2">
                                <Button onClick={handleDeleteJob} variant="outline" className="flex-1 h-11 rounded-none border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 font-bold gap-2">
                                    <Trash2 className="w-4 h-4" />
                                    Delete Card
                                </Button>
                                <Button onClick={handleUpdateJob} className="flex-1 h-11 rounded-none bg-[#102b2b] text-[#d8f36b] hover:bg-[#0d8274] font-bold">
                                    Save Changes
                                </Button>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}
