"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { 
    Plus, 
    MoreHorizontal, 
    DollarSign, 
    Calendar, 
    ExternalLink, 
    Briefcase, 
    FileText, 
    GraduationCap, 
    Trash2,
    Clock,
    Flag,
    BookOpen,
    Sparkles,
    CheckCircle2,
    Mail
} from "lucide-react";
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
    salary_target?: string | null;
    location: string | null;
    url: string | null;
    notes: string | null;
    applied_at: string;
    interview_date?: string | null;
    priority?: 'low' | 'medium' | 'high' | null;
    resume_id?: string | null;
    cover_letter_id: string | null;
    linked_opportunities: string[] | null;
    linked_canvas_courses?: string[] | null;
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

    // Linked Resources State
    const [resumes, setResumes] = useState<{ id: string; title: string }[]>([]);
    const [coverLetters, setCoverLetters] = useState<any[]>([]);
    const [shortlist, setShortlist] = useState<any[]>([]);
    const [canvasCourses, setCanvasCourses] = useState<{ id: string; name: string; course_code: string }[]>([]);

    // Form State (New Job)
    const [company, setCompany] = useState("");
    const [role, setRole] = useState("");
    const [status, setStatus] = useState("applied");
    const [priority, setPriority] = useState<"low" | "medium" | "high">("medium");
    const [salaryRange, setSalaryRange] = useState("");
    const [salaryTarget, setSalaryTarget] = useState("");
    const [interviewDate, setInterviewDate] = useState("");
    const [location, setLocation] = useState("");
    const [url, setUrl] = useState("");
    const [notes, setNotes] = useState("");
    const [resumeId, setResumeId] = useState<string>("none");
    const [coverLetterId, setCoverLetterId] = useState<string>("none");
    const [selectedOpps, setSelectedOpps] = useState<string[]>([]);
    const [selectedCanvasCourses, setSelectedCanvasCourses] = useState<string[]>([]);

    // Form State (Edit Job)
    const [editCompany, setEditCompany] = useState("");
    const [editRole, setEditRole] = useState("");
    const [editStatus, setEditStatus] = useState("applied");
    const [editPriority, setEditPriority] = useState<"low" | "medium" | "high">("medium");
    const [editSalaryRange, setEditSalaryRange] = useState("");
    const [editSalaryTarget, setEditSalaryTarget] = useState("");
    const [editInterviewDate, setEditInterviewDate] = useState("");
    const [editLocation, setEditLocation] = useState("");
    const [editUrl, setEditUrl] = useState("");
    const [editNotes, setEditNotes] = useState("");
    const [editResumeId, setEditResumeId] = useState<string>("none");
    const [editCoverLetterId, setEditCoverLetterId] = useState<string>("none");
    const [editSelectedOpps, setEditSelectedOpps] = useState<string[]>([]);
    const [editSelectedCanvasCourses, setEditSelectedCanvasCourses] = useState<string[]>([]);

    const supabase = createClient();

    const fetchRelatedData = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        // 1. Fetch resumes
        const { data: userResumes } = await supabase
            .from("resumes")
            .select("id, title")
            .eq("user_id", user.id)
            .order("updated_at", { ascending: false });
        if (userResumes) setResumes(userResumes);

        // 2. Fetch cover letters
        const { data: cl } = await supabase
            .from("cover_letters")
            .select("id, title")
            .eq("user_id", user.id);
        if (cl) setCoverLetters(cl);

        // 3. Fetch Canvas courses
        const { data: courses } = await supabase
            .from("canvas_courses")
            .select("id, name, course_code")
            .eq("user_id", user.id);
        if (courses) setCanvasCourses(courses);

        // 4. Fetch saved scholarships/grants
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
            priority,
            salary_range: salaryRange || null,
            salary_target: salaryTarget || null,
            interview_date: interviewDate ? new Date(interviewDate).toISOString() : null,
            location: location || null,
            url: url || null,
            notes: notes || null,
            resume_id: resumeId === "none" ? null : resumeId,
            cover_letter_id: coverLetterId === "none" ? null : coverLetterId,
            linked_opportunities: selectedOpps,
            linked_canvas_courses: selectedCanvasCourses,
        });

        if (error) {
            toast.error("Failed to add job: " + error.message);
        } else {
            toast.success("Job added successfully");
            setCompany("");
            setRole("");
            setStatus("applied");
            setPriority("medium");
            setSalaryRange("");
            setSalaryTarget("");
            setInterviewDate("");
            setLocation("");
            setUrl("");
            setNotes("");
            setResumeId("none");
            setCoverLetterId("none");
            setSelectedOpps([]);
            setSelectedCanvasCourses([]);
            setIsDialogOpen(false);
            fetchApplications();
        }
    };

    const handleOpenEdit = (app: Application) => {
        setSelectedApp(app);
        setEditCompany(app.company);
        setEditRole(app.role);
        setEditStatus(app.status);
        setEditPriority(app.priority || "medium");
        setEditSalaryRange(app.salary_range || "");
        setEditSalaryTarget(app.salary_target || "");
        setEditInterviewDate(app.interview_date ? app.interview_date.substring(0, 10) : "");
        setEditLocation(app.location || "");
        setEditUrl(app.url || "");
        setEditNotes(app.notes || "");
        setEditResumeId(app.resume_id || "none");
        setEditCoverLetterId(app.cover_letter_id || "none");
        setEditSelectedOpps(app.linked_opportunities || []);
        setEditSelectedCanvasCourses(app.linked_canvas_courses || []);
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
                priority: editPriority,
                salary_range: editSalaryRange || null,
                salary_target: editSalaryTarget || null,
                interview_date: editInterviewDate ? new Date(editInterviewDate).toISOString() : null,
                location: editLocation || null,
                url: editUrl || null,
                notes: editNotes || null,
                resume_id: editResumeId === "none" ? null : editResumeId,
                cover_letter_id: editCoverLetterId === "none" ? null : editCoverLetterId,
                linked_opportunities: editSelectedOpps,
                linked_canvas_courses: editSelectedCanvasCourses,
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

    const handleToggleCanvasCourse = (courseCode: string, isEdit: boolean) => {
        if (isEdit) {
            setEditSelectedCanvasCourses(prev =>
                prev.includes(courseCode) ? prev.filter(x => x !== courseCode) : [...prev, courseCode]
            );
        } else {
            setSelectedCanvasCourses(prev =>
                prev.includes(courseCode) ? prev.filter(x => x !== courseCode) : [...prev, courseCode]
            );
        }
    };

    // Helper: Map resume ID to Title
    const getResumeTitle = (id?: string | null) => {
        if (!id) return null;
        return resumes.find(r => r.id === id)?.title || "Resume Attached";
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
                    <DialogContent className="w-[96vw] max-w-5xl sm:max-w-5xl h-[90vh] max-h-[880px] flex flex-col p-0 overflow-hidden rounded-none border-[#102b2b]/20 bg-[#f8f4ec] shadow-2xl">
                        <DialogHeader className="sr-only">
                            <DialogTitle>Track New Application</DialogTitle>
                            <DialogDescription>Add a new job application and link your career materials.</DialogDescription>
                        </DialogHeader>

                        {/* Top Command Header */}
                        <div className="flex items-center justify-between px-6 py-4 border-b border-[#102b2b]/15 bg-[#102b2b] text-[#f8f4ec] shrink-0">
                            <div className="space-y-0.5">
                                <div className="flex items-center gap-2">
                                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#d8f36b]">Application Pipeline</span>
                                    <Badge className="rounded-none bg-[#d8f36b]/15 text-[#d8f36b] border-[#d8f36b]/30 text-[10px] uppercase font-black">New Card</Badge>
                                </div>
                                <h2 className="text-xl font-black uppercase tracking-tight text-white mt-0.5">
                                    {role ? `${role}${company ? ` — ${company}` : ''}` : "Track New Application"}
                                </h2>
                                <p className="text-xs text-[#a6c0b8]">
                                    Add opportunity parameters, target compensation, and link your tailored resumes and coursework.
                                </p>
                            </div>
                            <div className="flex items-center gap-3 pr-6">
                                <Badge variant="outline" className="rounded-none border-[#d8f36b]/40 text-[#d8f36b] bg-[#d8f36b]/10 text-xs font-bold uppercase tracking-wider px-3 py-1">
                                    {COLUMNS.find(c => c.id === status)?.label || status}
                                </Badge>
                            </div>
                        </div>

                        {/* Modal Body */}
                        <div className="flex-1 overflow-y-auto p-6 md:p-8 custom-scrollbar">
                            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 text-xs text-[#102b2b]">
                                {/* Left Column: 7 cols - Opportunity Details */}
                                <div className="lg:col-span-7 space-y-6">
                                    <div className="border border-[#102b2b]/15 bg-white p-5 shadow-xs space-y-4">
                                        <div className="flex items-center justify-between border-b border-[#102b2b]/10 pb-2.5">
                                            <h4 className="font-heading font-black text-xs uppercase tracking-wider text-[#0d8274] flex items-center gap-2">
                                                <Briefcase className="w-3.5 h-3.5" />
                                                Opportunity Parameters
                                            </h4>
                                            <span className="text-[10px] text-muted-foreground font-medium">Fields with * required</span>
                                        </div>

                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            <div className="space-y-1.5">
                                                <Label htmlFor="application-company" className="font-bold">Company *</Label>
                                                <Input id="application-company" value={company} onChange={e => setCompany(e.target.value)} placeholder="e.g. Google, Stripe" className="rounded-none h-10 border-[#102b2b]/15 bg-white" />
                                            </div>
                                            <div className="space-y-1.5">
                                                <Label htmlFor="application-role" className="font-bold">Role *</Label>
                                                <Input id="application-role" value={role} onChange={e => setRole(e.target.value)} placeholder="e.g. Software Engineer" className="rounded-none h-10 border-[#102b2b]/15 bg-white" />
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            <div className="space-y-1.5">
                                                <Label className="font-bold">Status Column</Label>
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
                                                <Label htmlFor="application-priority" className="font-bold">Priority</Label>
                                                <Select value={priority} onValueChange={(v: any) => setPriority(v)}>
                                                    <SelectTrigger id="application-priority" className="rounded-none h-10 border-[#102b2b]/15 bg-white">
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent className="rounded-none">
                                                        <SelectItem value="low">Low Priority</SelectItem>
                                                        <SelectItem value="medium">Medium Priority</SelectItem>
                                                        <SelectItem value="high">🔥 High Priority</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            <div className="space-y-1.5">
                                                <Label htmlFor="application-salary" className="font-bold">Salary Range / Target</Label>
                                                <Input id="application-salary" value={salaryRange} onChange={e => setSalaryRange(e.target.value)} placeholder="e.g. $120k - $150k" className="rounded-none h-10 border-[#102b2b]/15 bg-white" />
                                            </div>
                                            <div className="space-y-1.5">
                                                <Label htmlFor="application-location" className="font-bold">Location</Label>
                                                <Input id="application-location" value={location} onChange={e => setLocation(e.target.value)} placeholder="e.g. Remote, San Francisco" className="rounded-none h-10 border-[#102b2b]/15 bg-white" />
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            <div className="space-y-1.5">
                                                <Label htmlFor="application-interview" className="font-bold">Next Interview Date</Label>
                                                <Input id="application-interview" type="date" value={interviewDate} onChange={e => setInterviewDate(e.target.value)} className="rounded-none h-10 border-[#102b2b]/15 bg-white" />
                                            </div>
                                            <div className="space-y-1.5">
                                                <Label htmlFor="application-url" className="font-bold">Job Link URL</Label>
                                                <Input id="application-url" value={url} onChange={e => setUrl(e.target.value)} placeholder="https://company.com/careers/..." className="rounded-none h-10 border-[#102b2b]/15 bg-white" />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Notes Card */}
                                    <div className="border border-[#102b2b]/15 bg-white p-5 shadow-xs space-y-2.5">
                                        <div className="flex items-center justify-between border-b border-[#102b2b]/10 pb-2">
                                            <Label htmlFor="application-notes" className="font-heading font-black text-xs uppercase tracking-wider text-[#0d8274]">
                                                Initial Notes & Referral Context
                                            </Label>
                                            <span className="text-[10px] text-muted-foreground">Contacts, job source, requirements</span>
                                        </div>
                                        <Textarea
                                            id="application-notes"
                                            value={notes}
                                            onChange={e => setNotes(e.target.value)}
                                            placeholder="Add interview notes, recruiter contacts, or referral details..."
                                            className="rounded-none border-[#102b2b]/15 bg-white min-h-[120px] font-sans text-xs leading-relaxed"
                                        />
                                    </div>
                                </div>

                                {/* Right Column: 5 cols - Connected Career Materials */}
                                <div className="lg:col-span-5 space-y-6">
                                    <div className="border border-[#102b2b]/15 bg-white p-5 shadow-xs space-y-4">
                                        <div className="flex items-center justify-between border-b border-[#102b2b]/10 pb-2.5">
                                            <h4 className="font-heading font-black text-xs uppercase tracking-wider text-[#0d8274] flex items-center gap-2">
                                                <FileText className="w-3.5 h-3.5" />
                                                Link Career Documents
                                            </h4>
                                            <span className="text-[10px] text-muted-foreground font-medium">Attach to card</span>
                                        </div>

                                        {/* Linked Resume */}
                                        <div className="space-y-1.5">
                                            <Label className="font-bold text-xs text-[#102b2b] flex items-center gap-1.5">
                                                Candidate Resume
                                            </Label>
                                            <Select value={resumeId} onValueChange={setResumeId}>
                                                <SelectTrigger className="rounded-none h-10 border-[#102b2b]/15 bg-white">
                                                    <SelectValue placeholder="Select a resume" />
                                                </SelectTrigger>
                                                <SelectContent className="rounded-none">
                                                    <SelectItem value="none">None (No specific resume linked)</SelectItem>
                                                    {resumes.map(r => (
                                                        <SelectItem key={r.id} value={r.id}>{r.title}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        {/* Linked Cover Letter */}
                                        <div className="space-y-1.5">
                                            <Label className="font-bold text-xs text-[#102b2b] flex items-center gap-1.5">
                                                AI Cover Letter
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
                                    </div>

                                    {/* Linked Canvas LMS Coursework */}
                                    {canvasCourses.length > 0 && (
                                        <div className="border border-[#102b2b]/15 bg-white p-5 shadow-xs space-y-3">
                                            <div className="flex items-center justify-between border-b border-[#102b2b]/10 pb-2">
                                                <Label className="font-bold text-xs text-[#0d8274] flex items-center gap-1.5">
                                                    <BookOpen className="w-3.5 h-3.5" />
                                                    Attach Synced Canvas Coursework
                                                </Label>
                                                <Badge variant="outline" className="rounded-none border-[#0d8274]/30 text-[#0d8274] text-[10px] font-bold">
                                                    {selectedCanvasCourses.length} selected
                                                </Badge>
                                            </div>
                                            <div className="p-2.5 bg-[#fbfdf9] border border-[#102b2b]/15 space-y-2 max-h-[160px] overflow-y-auto custom-scrollbar">
                                                {canvasCourses.map(course => (
                                                    <label key={course.id} className="flex items-center gap-2.5 cursor-pointer hover:bg-muted/50 p-1.5 transition-colors">
                                                        <input 
                                                            type="checkbox"
                                                            checked={selectedCanvasCourses.includes(course.course_code || course.name)}
                                                            onChange={() => handleToggleCanvasCourse(course.course_code || course.name, false)}
                                                            className="rounded-none border-[#102b2b]/30 accent-[#0d8274]"
                                                        />
                                                        <span className="truncate font-medium text-xs" title={course.name}>
                                                            <span className="font-bold text-[#0d8274]">{course.course_code}</span>: {course.name}
                                                        </span>
                                                    </label>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Linked Scholarships/Grants */}
                                    {shortlist.length > 0 && (
                                        <div className="border border-[#102b2b]/15 bg-white p-5 shadow-xs space-y-3">
                                            <div className="flex items-center justify-between border-b border-[#102b2b]/10 pb-2">
                                                <Label className="font-bold text-xs text-[#0d8274] flex items-center gap-1.5">
                                                    <GraduationCap className="w-3.5 h-3.5" />
                                                    Link Shortlisted Aid Opportunities
                                                </Label>
                                                <Badge variant="outline" className="rounded-none border-[#0d8274]/30 text-[#0d8274] text-[10px] font-bold">
                                                    {selectedOpps.length} selected
                                                </Badge>
                                            </div>
                                            <div className="p-2.5 bg-[#fbfdf9] border border-[#102b2b]/15 space-y-2 max-h-[160px] overflow-y-auto custom-scrollbar">
                                                {shortlist.map(opp => (
                                                    <label key={opp.id} className="flex items-center gap-2.5 cursor-pointer hover:bg-muted/50 p-1.5 transition-colors">
                                                        <input 
                                                            type="checkbox"
                                                            checked={selectedOpps.includes(opp.id)}
                                                            onChange={() => handleToggleOpp(opp.id, false)}
                                                            className="rounded-none border-[#102b2b]/30 accent-[#0d8274]"
                                                        />
                                                        <span className="truncate text-xs font-medium" title={opp.title}>{opp.title}</span>
                                                    </label>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Fixed Footer Actions */}
                        <div className="flex items-center justify-between px-6 md:px-8 py-4 border-t border-[#102b2b]/15 bg-white shrink-0">
                            <span className="text-xs text-muted-foreground font-medium">
                                Link relevant resumes & coursework for full dossier synchronization.
                            </span>
                            <div className="flex items-center gap-3">
                                <Button
                                    variant="outline"
                                    onClick={() => setIsDialogOpen(false)}
                                    className="h-11 rounded-none border-[#102b2b]/20 text-[#102b2b] hover:bg-muted font-bold px-6"
                                >
                                    Cancel
                                </Button>
                                <Button
                                    onClick={handleAddJob}
                                    className="h-11 rounded-none bg-[#102b2b] text-[#d8f36b] hover:bg-[#0d8274] font-bold px-8"
                                >
                                    Track Application
                                </Button>
                            </div>
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
                                                    <div className="space-y-1">
                                                        <div className="flex items-center gap-1.5">
                                                            <h3 className="font-bold text-sm leading-tight group-hover:text-[#0d8274] transition-colors">{app.role}</h3>
                                                            {app.priority === "high" && (
                                                                <span className="text-[9px] font-bold px-1.5 py-0.2 bg-red-100 text-red-700 border border-red-200">
                                                                    High
                                                                </span>
                                                            )}
                                                        </div>
                                                        <p className="text-xs text-muted-foreground font-semibold">{app.company}</p>
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

                                                {/* Interview Milestone Date Pill */}
                                                {app.interview_date && (
                                                    <div className="flex items-center gap-1.5 p-1.5 bg-amber-50 border border-amber-200 text-amber-800 text-[10px] font-bold">
                                                        <Clock className="w-3 h-3 text-amber-600" />
                                                        <span>Interview: {format(new Date(app.interview_date), "MMM d, yyyy")}</span>
                                                    </div>
                                                )}

                                                {/* Attached Artifact Badges */}
                                                {(app.resume_id || app.cover_letter_id || (app.linked_opportunities && app.linked_opportunities.length > 0) || (app.linked_canvas_courses && app.linked_canvas_courses.length > 0)) && (
                                                    <div className="flex flex-wrap gap-1.5 pt-1.5 border-t border-[#102b2b]/5">
                                                        {/* Linked Resume */}
                                                        {app.resume_id && (
                                                            <Link 
                                                                href={`/dashboard/resume/${app.resume_id}`}
                                                                onClick={(e: any) => e.stopPropagation()}
                                                            >
                                                                <Badge className="rounded-none bg-[#102b2b] text-[#d8f36b] hover:bg-[#0d8274] hover:text-white text-[9px] px-1.5 py-0.5 flex items-center gap-1">
                                                                    <FileText className="w-2.5 h-2.5 text-[#d8f36b]" />
                                                                    <span className="max-w-[110px] truncate">{getResumeTitle(app.resume_id)}</span>
                                                                    <ExternalLink className="w-2 h-2 ml-0.5 opacity-60" />
                                                                </Badge>
                                                            </Link>
                                                        )}

                                                        {/* Linked Cover Letter */}
                                                        {app.cover_letter_id && (
                                                            <Link 
                                                                href={`/dashboard/cover-letters/${app.cover_letter_id}`}
                                                                onClick={(e: any) => e.stopPropagation()}
                                                            >
                                                                <Badge className="rounded-none bg-[#e9eee8] border border-[#102b2b]/15 hover:border-[#0d8274] hover:bg-[#dbe8df] text-[#102b2b] text-[9px] px-1.5 py-0.5 flex items-center gap-1 font-semibold">
                                                                    <Mail className="w-2.5 h-2.5 text-[#0d8274]" />
                                                                    Cover Letter
                                                                    <ExternalLink className="w-2 h-2 ml-0.5 opacity-60" />
                                                                </Badge>
                                                            </Link>
                                                        )}

                                                        {/* Linked Canvas Courses */}
                                                        {app.linked_canvas_courses && app.linked_canvas_courses.map((code, i) => (
                                                            <Link
                                                                key={`canvas-${i}`}
                                                                href="/dashboard/canvas"
                                                                onClick={(e: any) => e.stopPropagation()}
                                                            >
                                                                <Badge className="rounded-none bg-emerald-50 border border-emerald-300 text-emerald-800 text-[9px] px-1.5 py-0.5 flex items-center gap-1 font-semibold hover:bg-emerald-100">
                                                                    <BookOpen className="w-2.5 h-2.5 text-emerald-600" />
                                                                    {code}
                                                                </Badge>
                                                            </Link>
                                                        ))}

                                                        {/* Linked Aid Opportunities */}
                                                        {app.linked_opportunities && app.linked_opportunities.map((oppId, i) => (
                                                            <Badge key={i} className="rounded-none bg-[#d8f36b]/40 border border-[#102b2b]/10 text-[#102b2b] text-[9px] px-1.5 py-0.5 flex items-center gap-1 font-semibold">
                                                                <GraduationCap className="w-2.5 h-2.5 text-[#0d8274]" />
                                                                Aid attached
                                                            </Badge>
                                                        ))}
                                                    </div>
                                                )}

                                                <div className="flex flex-wrap items-center justify-between gap-2 text-[10px] text-muted-foreground pt-1.5">
                                                    <div className="flex items-center gap-1.5">
                                                        <span className="flex items-center gap-1 border border-[#102b2b]/10 bg-[#e9eee8] px-1.5 py-0.5">
                                                            <Calendar className="h-3 w-3" />
                                                            {format(new Date(app.applied_at), "MMM d")}
                                                        </span>
                                                        {app.salary_range && (
                                                            <Link
                                                                href={`/dashboard/salary?role=${encodeURIComponent(app.role)}&company=${encodeURIComponent(app.company)}`}
                                                                onClick={e => e.stopPropagation()}
                                                                title="Benchmark Salary & Negotiation Strategy"
                                                                className="flex items-center gap-1 border border-[#0d8274]/20 bg-[#d8f36b]/45 px-1.5 py-0.5 text-[#102b2b] hover:bg-[#d8f36b] transition-colors font-medium"
                                                            >
                                                                <DollarSign className="h-3 w-3 text-[#0d8274]" />
                                                                {app.salary_range}
                                                            </Link>
                                                        )}
                                                        {app.salary_target && !app.salary_range && (
                                                            <Link
                                                                href={`/dashboard/salary?role=${encodeURIComponent(app.role)}&company=${encodeURIComponent(app.company)}`}
                                                                onClick={e => e.stopPropagation()}
                                                                title="Benchmark Salary & Negotiation Strategy"
                                                                className="flex items-center gap-1 border border-[#0d8274]/30 bg-[#0d8274]/10 px-1.5 py-0.5 text-[#0d8274] font-bold hover:bg-[#0d8274]/20 transition-colors"
                                                            >
                                                                <DollarSign className="h-3 w-3" />
                                                                Target: {app.salary_target}
                                                            </Link>
                                                        )}
                                                    </div>

                                                    {/* External Job Link icon */}
                                                    {app.url && (
                                                        <a 
                                                            href={app.url} 
                                                            target="_blank" 
                                                            rel="noopener noreferrer"
                                                            onClick={e => e.stopPropagation()}
                                                            className="p-1 hover:text-[#0d8274] transition-colors"
                                                            title="Open posting link"
                                                        >
                                                            <ExternalLink className="w-3.5 h-3.5" />
                                                        </a>
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
                <DialogContent className="w-[96vw] max-w-5xl sm:max-w-5xl h-[90vh] max-h-[880px] flex flex-col p-0 overflow-hidden rounded-none border-[#102b2b]/20 bg-[#f8f4ec] shadow-2xl">
                    <DialogHeader className="sr-only">
                        <DialogTitle>Edit Application Details</DialogTitle>
                        <DialogDescription>Review and modify tracked job status, documents, and coursework.</DialogDescription>
                    </DialogHeader>

                    {/* Top Command Header */}
                    <div className="flex items-center justify-between px-6 py-4 border-b border-[#102b2b]/15 bg-[#102b2b] text-[#f8f4ec] shrink-0">
                        <div className="space-y-0.5">
                            <div className="flex items-center gap-2">
                                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#d8f36b]">Job Tracker Dossier</span>
                                {selectedApp?.priority === "high" && (
                                    <Badge className="rounded-none bg-red-500/20 text-red-300 border-red-500/30 text-[10px] uppercase font-black">🔥 High Priority</Badge>
                                )}
                            </div>
                            <h2 className="text-xl font-black uppercase tracking-tight text-white mt-0.5">
                                {editRole ? `${editRole} — ${editCompany}` : "Edit Application Details"}
                            </h2>
                            <p className="text-xs text-[#a6c0b8]">
                                Manage pipeline status, linked career documents, synced coursework, and interview notes.
                            </p>
                        </div>
                        <div className="flex items-center gap-3 pr-6">
                            <Badge variant="outline" className="rounded-none border-[#d8f36b]/40 text-[#d8f36b] bg-[#d8f36b]/10 text-xs font-bold uppercase tracking-wider px-3 py-1">
                                {COLUMNS.find(c => c.id === editStatus)?.label || editStatus}
                            </Badge>
                        </div>
                    </div>

                    {selectedApp && (
                        <div className="flex-1 overflow-y-auto p-6 md:p-8 custom-scrollbar">
                            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 text-xs text-[#102b2b]">
                                {/* Left Column: 7 cols - Core Application & Opportunity Details */}
                                <div className="lg:col-span-7 space-y-6">
                                    <div className="border border-[#102b2b]/15 bg-white p-5 shadow-xs space-y-4">
                                        <div className="flex items-center justify-between border-b border-[#102b2b]/10 pb-2.5">
                                            <h4 className="font-heading font-black text-xs uppercase tracking-wider text-[#0d8274] flex items-center gap-2">
                                                <Briefcase className="w-3.5 h-3.5" />
                                                Opportunity Parameters
                                            </h4>
                                            <span className="text-[10px] text-muted-foreground font-medium">Core application data</span>
                                        </div>

                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            <div className="space-y-1.5">
                                                <Label htmlFor="edit-company" className="font-bold">Company *</Label>
                                                <Input id="edit-company" value={editCompany} onChange={e => setEditCompany(e.target.value)} className="rounded-none h-10 border-[#102b2b]/15 bg-white" />
                                            </div>
                                            <div className="space-y-1.5">
                                                <Label htmlFor="edit-role" className="font-bold">Role *</Label>
                                                <Input id="edit-role" value={editRole} onChange={e => setEditRole(e.target.value)} className="rounded-none h-10 border-[#102b2b]/15 bg-white" />
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            <div className="space-y-1.5">
                                                <Label className="font-bold">Status Column</Label>
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
                                                <Label htmlFor="edit-priority" className="font-bold">Priority</Label>
                                                <Select value={editPriority} onValueChange={(v: any) => setEditPriority(v)}>
                                                    <SelectTrigger id="edit-priority" className="rounded-none h-10 border-[#102b2b]/15 bg-white">
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent className="rounded-none">
                                                        <SelectItem value="low">Low Priority</SelectItem>
                                                        <SelectItem value="medium">Medium Priority</SelectItem>
                                                        <SelectItem value="high">🔥 High Priority</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            <div className="space-y-1.5">
                                                <Label htmlFor="edit-salary" className="font-bold">Salary Range / Target</Label>
                                                <Input id="edit-salary" value={editSalaryRange} onChange={e => setEditSalaryRange(e.target.value)} placeholder="e.g. $120k - $150k" className="rounded-none h-10 border-[#102b2b]/15 bg-white" />
                                            </div>
                                            <div className="space-y-1.5">
                                                <Label htmlFor="edit-location" className="font-bold">Location</Label>
                                                <Input id="edit-location" value={editLocation} onChange={e => setEditLocation(e.target.value)} placeholder="e.g. Remote, San Francisco" className="rounded-none h-10 border-[#102b2b]/15 bg-white" />
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            <div className="space-y-1.5">
                                                <Label htmlFor="edit-interview" className="font-bold">Next Interview Date</Label>
                                                <Input id="edit-interview" type="date" value={editInterviewDate} onChange={e => setEditInterviewDate(e.target.value)} className="rounded-none h-10 border-[#102b2b]/15 bg-white" />
                                            </div>
                                            <div className="space-y-1.5">
                                                <div className="flex items-center justify-between">
                                                    <Label htmlFor="edit-url" className="font-bold">Job Link URL</Label>
                                                    {editUrl && (
                                                        <a href={editUrl} target="_blank" rel="noopener noreferrer" className="text-[10px] text-[#0d8274] hover:underline flex items-center gap-1 font-semibold">
                                                            Visit Link <ExternalLink className="w-2.5 h-2.5" />
                                                        </a>
                                                    )}
                                                </div>
                                                <Input id="edit-url" value={editUrl} onChange={e => setEditUrl(e.target.value)} placeholder="https://..." className="rounded-none h-10 border-[#102b2b]/15 bg-white" />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Notes Card */}
                                    <div className="border border-[#102b2b]/15 bg-white p-5 shadow-xs space-y-2.5">
                                        <div className="flex items-center justify-between border-b border-[#102b2b]/10 pb-2">
                                            <Label htmlFor="edit-notes" className="font-heading font-black text-xs uppercase tracking-wider text-[#0d8274]">
                                                Application Notes & Interview Diary
                                            </Label>
                                            <span className="text-[10px] text-muted-foreground">Contacts, questions, feedback</span>
                                        </div>
                                        <Textarea
                                            id="edit-notes"
                                            value={editNotes}
                                            onChange={e => setEditNotes(e.target.value)}
                                            placeholder="Add recruiter contacts, referral info, interview takeaways, or follow-up notes..."
                                            className="rounded-none border-[#102b2b]/15 bg-white min-h-[120px] font-sans text-xs leading-relaxed"
                                        />
                                    </div>
                                </div>

                                {/* Right Column: 5 cols - Connected Career Materials & Synergies */}
                                <div className="lg:col-span-5 space-y-6">
                                    <div className="border border-[#102b2b]/15 bg-white p-5 shadow-xs space-y-4">
                                        <div className="flex items-center justify-between border-b border-[#102b2b]/10 pb-2.5">
                                            <h4 className="font-heading font-black text-xs uppercase tracking-wider text-[#0d8274] flex items-center gap-2">
                                                <FileText className="w-3.5 h-3.5" />
                                                Linked Career Documents
                                            </h4>
                                            <span className="text-[10px] text-muted-foreground font-medium">Tailored packet</span>
                                        </div>

                                        {/* Linked Resume in Edit */}
                                        <div className="space-y-1.5">
                                            <div className="flex items-center justify-between">
                                                <Label className="font-bold text-xs text-[#102b2b] flex items-center gap-1.5">
                                                    Link Candidate Resume
                                                </Label>
                                                {editResumeId && editResumeId !== "none" && (
                                                    <Link href={`/dashboard/resume/${editResumeId}`} target="_blank" className="text-[10px] text-[#0d8274] hover:underline flex items-center gap-1 font-semibold">
                                                        View Resume <ExternalLink className="w-2.5 h-2.5" />
                                                    </Link>
                                                )}
                                            </div>
                                            <Select value={editResumeId} onValueChange={setEditResumeId}>
                                                <SelectTrigger className="rounded-none h-10 border-[#102b2b]/15 bg-white">
                                                    <SelectValue placeholder="Select a resume" />
                                                </SelectTrigger>
                                                <SelectContent className="rounded-none">
                                                    <SelectItem value="none">None (No specific resume linked)</SelectItem>
                                                    {resumes.map(r => (
                                                        <SelectItem key={r.id} value={r.id}>{r.title}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        {/* Linked Cover Letter in Edit */}
                                        <div className="space-y-1.5">
                                            <div className="flex items-center justify-between">
                                                <Label className="font-bold text-xs text-[#102b2b] flex items-center gap-1.5">
                                                    Link AI Cover Letter
                                                </Label>
                                                {editCoverLetterId && editCoverLetterId !== "none" && (
                                                    <Link href={`/dashboard/cover-letters`} target="_blank" className="text-[10px] text-[#0d8274] hover:underline flex items-center gap-1 font-semibold">
                                                        View Letter <ExternalLink className="w-2.5 h-2.5" />
                                                    </Link>
                                                )}
                                            </div>
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
                                    </div>

                                    {/* Linked Canvas Courses in Edit */}
                                    {canvasCourses.length > 0 && (
                                        <div className="border border-[#102b2b]/15 bg-white p-5 shadow-xs space-y-3">
                                            <div className="flex items-center justify-between border-b border-[#102b2b]/10 pb-2">
                                                <Label className="font-bold text-xs text-[#0d8274] flex items-center gap-1.5">
                                                    <BookOpen className="w-3.5 h-3.5" />
                                                    Attach Synced Canvas Coursework
                                                </Label>
                                                <Badge variant="outline" className="rounded-none border-[#0d8274]/30 text-[#0d8274] text-[10px] font-bold">
                                                    {editSelectedCanvasCourses.length} selected
                                                </Badge>
                                            </div>
                                            <div className="p-2.5 bg-[#fbfdf9] border border-[#102b2b]/15 space-y-2 max-h-[160px] overflow-y-auto custom-scrollbar">
                                                {canvasCourses.map(course => (
                                                    <label key={course.id} className="flex items-center gap-2.5 cursor-pointer hover:bg-muted/50 p-1.5 transition-colors">
                                                        <input 
                                                            type="checkbox"
                                                            checked={editSelectedCanvasCourses.includes(course.course_code || course.name)}
                                                            onChange={() => handleToggleCanvasCourse(course.course_code || course.name, true)}
                                                            className="rounded-none border-[#102b2b]/30 accent-[#0d8274]"
                                                        />
                                                        <span className="truncate font-medium text-xs" title={course.name}>
                                                            <span className="font-bold text-[#0d8274]">{course.course_code}</span>: {course.name}
                                                        </span>
                                                    </label>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Linked Scholarships/Grants in Edit */}
                                    {shortlist.length > 0 && (
                                        <div className="border border-[#102b2b]/15 bg-white p-5 shadow-xs space-y-3">
                                            <div className="flex items-center justify-between border-b border-[#102b2b]/10 pb-2">
                                                <Label className="font-bold text-xs text-[#0d8274] flex items-center gap-1.5">
                                                    <GraduationCap className="w-3.5 h-3.5" />
                                                    Link Shortlisted Aid Opportunities
                                                </Label>
                                                <Badge variant="outline" className="rounded-none border-[#0d8274]/30 text-[#0d8274] text-[10px] font-bold">
                                                    {editSelectedOpps.length} selected
                                                </Badge>
                                            </div>
                                            <div className="p-2.5 bg-[#fbfdf9] border border-[#102b2b]/15 space-y-2 max-h-[160px] overflow-y-auto custom-scrollbar">
                                                {shortlist.map(opp => (
                                                    <label key={opp.id} className="flex items-center gap-2.5 cursor-pointer hover:bg-muted/50 p-1.5 transition-colors">
                                                        <input 
                                                            type="checkbox"
                                                            checked={editSelectedOpps.includes(opp.id)}
                                                            onChange={() => handleToggleOpp(opp.id, true)}
                                                            className="rounded-none border-[#102b2b]/30 accent-[#0d8274]"
                                                        />
                                                        <span className="truncate text-xs font-medium" title={opp.title}>{opp.title}</span>
                                                    </label>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Fixed Footer Actions */}
                    <div className="flex items-center justify-between px-6 md:px-8 py-4 border-t border-[#102b2b]/15 bg-white shrink-0">
                        <Button
                            onClick={handleDeleteJob}
                            variant="outline"
                            className="h-11 rounded-none border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 font-bold gap-2 px-5"
                        >
                            <Trash2 className="w-4 h-4" />
                            Delete Card
                        </Button>
                        <div className="flex items-center gap-3">
                            <Button
                                variant="outline"
                                onClick={() => setIsEditOpen(false)}
                                className="h-11 rounded-none border-[#102b2b]/20 text-[#102b2b] hover:bg-muted font-bold px-6"
                            >
                                Cancel
                            </Button>
                            <Button
                                onClick={handleUpdateJob}
                                className="h-11 rounded-none bg-[#102b2b] text-[#d8f36b] hover:bg-[#0d8274] font-bold px-8"
                            >
                                Save Changes
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
