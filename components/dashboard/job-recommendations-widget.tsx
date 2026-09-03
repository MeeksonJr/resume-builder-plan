"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Briefcase, 
  Target, 
  Plus, 
  Sparkles, 
  ArrowUpRight, 
  Loader2, 
  ChevronDown, 
  ChevronUp, 
  Check,
  Building,
  MapPin,
  DollarSign
} from "lucide-react";
import { toast } from "sonner";

interface JobMatch {
  id: string;
  company: string;
  role: string;
  location: string;
  salary_range: string;
  match_score: number;
  matching_skills: string[];
  missing_skills: string[];
  url: string;
  description: string;
}

export function JobRecommendationsWidget() {
  const [jobs, setJobs] = useState<JobMatch[]>([]);
  const [targetRole, setTargetRole] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [expandedJob, setExpandedJob] = useState<string | null>(null);
  const [trackedJobs, setTrackedJobs] = useState<string[]>([]);
  const [trackingId, setTrackingId] = useState<string | null>(null);

  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        const response = await fetch("/api/jobs/recommendations");
        if (!response.ok) throw new Error("Failed to load jobs");
        const data = await response.json();
        setJobs(data.jobs || []);
        setTargetRole(data.targetRole || "");
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchRecommendations();
  }, []);

  const handleAddToTracker = async (job: JobMatch) => {
    setTrackingId(job.id);
    try {
      const response = await fetch("/api/tracker/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          company: job.company,
          role: job.role,
          url: job.url,
          location: job.location,
          salary_range: job.salary_range,
        }),
      });

      if (!response.ok) throw new Error("Failed to add to tracker");
      setTrackedJobs((prev) => [...prev, job.id]);
      toast.success(`Successfully added ${job.role} at ${job.company} to your Job Tracker!`);
    } catch (error) {
      console.error(error);
      toast.error("Could not add job to tracker");
    } finally {
      setTrackingId(null);
    }
  };

  const toggleExpand = (id: string) => {
    setExpandedJob((prev) => (prev === id ? null : id));
  };

  if (isLoading) {
    return (
      <Card className="rounded-none border-[#102b2b]/15 bg-[#f8f4ec] shadow-[4px_4px_0_rgba(16,43,43,0.06)] overflow-hidden">
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-[#0d8274]" />
        </CardContent>
      </Card>
    );
  }

  if (jobs.length === 0) {
    return null;
  }

  return (
    <Card className="rounded-none border-[#102b2b]/15 bg-[#f8f4ec] shadow-[4px_4px_0_rgba(16,43,43,0.06)] overflow-hidden">
      <CardHeader className="pb-3 border-b border-[#102b2b]/10 bg-[#e9eee8] flex flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center bg-[#d8f36b] text-[#102b2b] shrink-0">
            <Target className="h-5 w-5" />
          </div>
          <div>
            <CardTitle className="text-sm font-black tracking-tight uppercase">Job Recommendations</CardTitle>
            <CardDescription className="text-xs text-[#52716a]">Curated matches for: {targetRole}</CardDescription>
          </div>
        </div>

        <Button asChild size="sm" variant="ghost" className="text-xs font-bold text-[#0d8274] hover:text-[#102b2b] gap-1 p-0 h-auto">
          <Link href="/dashboard/jobs">
            View All ({jobs.length}) <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </Button>
      </CardHeader>

      <CardContent className="p-4 space-y-4">
        <div className="space-y-3">
          {jobs.map((job) => {
            const isExpanded = expandedJob === job.id;
            const isTracked = trackedJobs.includes(job.id);
            const isTracking = trackingId === job.id;

            return (
              <div 
                key={job.id} 
                className="border border-[#102b2b]/10 bg-white/60 p-3 hover:bg-white transition-colors"
              >
                {/* Job Core Details */}
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-1">
                    <h3 className="text-sm font-bold leading-tight text-[#102b2b]">{job.role}</h3>
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-[#52716a]">
                      <span className="flex items-center gap-1">
                        <Building className="h-3.5 w-3.5" /> {job.company}
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3.5 w-3.5" /> {job.location}
                      </span>
                      {job.salary_range && (
                        <span className="flex items-center gap-0.5">
                          <DollarSign className="h-3.5 w-3.5 text-emerald-600" /> {job.salary_range}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-1.5 shrink-0">
                    <Badge 
                      className={`font-black text-[10px] uppercase border-none px-2 py-0.5 ${
                        job.match_score >= 85 
                          ? "bg-emerald-500/10 text-emerald-700" 
                          : "bg-indigo-500/10 text-indigo-700"
                      }`}
                    >
                      {job.match_score}% Match
                    </Badge>
                    
                    <button 
                      onClick={() => toggleExpand(job.id)}
                      className="text-[#52716a] hover:text-[#102b2b] p-0.5"
                    >
                      {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                {/* Collapsible Skills Gaps & Description */}
                {isExpanded && (
                  <div className="mt-3 pt-3 border-t border-[#102b2b]/10 space-y-3">
                    <p className="text-xs text-[#52716a] leading-relaxed">{job.description}</p>
                    
                    <div className="space-y-1.5">
                      <p className="text-[10px] font-bold text-muted-foreground uppercase">Skills Breakdown</p>
                      <div className="flex flex-wrap gap-1.5">
                        {job.matching_skills.map((skill) => (
                          <Badge 
                            key={skill} 
                            variant="outline" 
                            className="bg-emerald-50 text-emerald-700 border-emerald-200 text-[9px] font-bold py-0"
                          >
                            ✓ {skill}
                          </Badge>
                        ))}
                        {job.missing_skills.map((skill) => (
                          <Badge 
                            key={skill} 
                            variant="outline" 
                            className="bg-amber-50 text-amber-700 border-amber-200 text-[9px] font-bold py-0"
                          >
                            + {skill}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 pt-1">
                      {isTracked ? (
                        <Button 
                          disabled 
                          size="sm" 
                          variant="outline"
                          className="h-8 rounded-none border-emerald-300 text-emerald-700 bg-emerald-50 text-xs font-semibold gap-1"
                        >
                          <Check className="h-3 w-3" /> Tracked
                        </Button>
                      ) : (
                        <Button 
                          onClick={() => handleAddToTracker(job)}
                          disabled={isTracking}
                          size="sm" 
                          variant="outline"
                          className="h-8 rounded-none border-[#102b2b]/20 text-xs font-semibold text-[#102b2b] hover:bg-[#102b2b]/5 gap-1"
                        >
                          {isTracking ? (
                            <Loader2 className="h-3 w-3 animate-spin" />
                          ) : (
                            <Plus className="h-3 w-3" />
                          )}
                          Track
                        </Button>
                      )}

                      <Button 
                        asChild
                        size="sm" 
                        className="h-8 rounded-none bg-[#102b2b] text-white hover:bg-[#0d8274] text-xs font-bold gap-1"
                      >
                        <Link href={`/dashboard/optimize?role=${encodeURIComponent(job.role)}&company=${encodeURIComponent(job.company)}`}>
                          <Sparkles className="h-3 w-3 text-[#d8f36b]" /> Tailor Resume
                        </Link>
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
