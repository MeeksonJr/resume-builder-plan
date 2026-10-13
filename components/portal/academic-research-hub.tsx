"use client";

import React, { useState } from "react";
import { ResearchPublication } from "@/lib/university/collegiate-intel-service";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  BookOpen,
  Search,
  ExternalLink,
  Award,
  Sparkles,
  Users,
  Calendar,
  Layers,
  GraduationCap,
  MessageSquare,
  FileText,
  Building,
} from "lucide-react";
import { toast } from "sonner";

interface AcademicResearchHubProps {
  publications: ResearchPublication[];
  schoolName: string;
  isStaffOrAdmin?: boolean;
  onNavigateToFaculty?: (facultyName: string) => void;
}

export function AcademicResearchHub({
  publications,
  schoolName,
  isStaffOrAdmin = false,
  onNavigateToFaculty,
}: AcademicResearchHubProps) {
  const [search, setSearch] = useState("");
  const [selectedField, setSelectedField] = useState("All");

  const fields = ["All", ...Array.from(new Set(publications.map((p) => p.field)))];

  const filtered = publications.filter((p) => {
    const matchesSearch =
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.snippet.toLowerCase().includes(search.toLowerCase()) ||
      p.authors.some((a) => a.toLowerCase().includes(search.toLowerCase())) ||
      (p.facultyLead && p.facultyLead.toLowerCase().includes(search.toLowerCase()));

    const matchesField = selectedField === "All" || p.field === selectedField;
    return matchesSearch && matchesField;
  });

  const totalCitations = publications.reduce((acc, p) => acc + p.citations, 0);

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-2xl border border-border bg-gradient-to-r from-card via-card to-primary/5 p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Google Scholar Research Index</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-foreground">
              Academic & Research Publications
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Explore scholarly papers, faculty labs, and peer-reviewed studies published by **{schoolName}** faculty and researchers. Ideal for undergraduate research capstones, citations, and finding faculty recommendation mentors.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div className="rounded-xl border border-border bg-card/60 p-4 text-center">
              <p className="text-2xl font-black text-primary">{publications.length}</p>
              <p className="text-xs text-muted-foreground font-medium">Indexed Papers</p>
            </div>
            <div className="rounded-xl border border-border bg-card/60 p-4 text-center">
              <p className="text-2xl font-black text-foreground">{totalCitations}</p>
              <p className="text-xs text-muted-foreground font-medium">Total Citations</p>
            </div>
            <div className="rounded-xl border border-border bg-card/60 p-4 text-center col-span-2 sm:col-span-1">
              <p className="text-2xl font-black text-foreground">{fields.length - 1}</p>
              <p className="text-xs text-muted-foreground font-medium">Active Domains</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search papers by keyword, faculty author, or research field..."
            className="pl-10 h-11 rounded-xl border-input bg-background"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          {fields.map((f) => (
            <Button
              key={f}
              variant={selectedField === f ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedField(f)}
              className="h-9 rounded-xl whitespace-nowrap text-xs font-semibold"
            >
              {f}
            </Button>
          ))}
        </div>
      </div>

      {/* Publications Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {filtered.map((pub) => (
          <Card
            key={pub.id}
            className="group flex flex-col justify-between overflow-hidden rounded-2xl border-border bg-card transition-all duration-200 hover:border-primary/50 hover:shadow-md"
          >
            <CardHeader className="p-5 pb-3 space-y-3">
              <div className="flex items-start justify-between gap-3">
                <Badge variant="outline" className="border-primary/20 bg-primary/10 text-primary font-semibold text-[11px] rounded-lg">
                  {pub.field}
                </Badge>
                <a
                  href={`https://scholar.google.com/scholar?q=${encodeURIComponent(pub.title)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary font-medium transition-colors"
                >
                  <Award className="h-3.5 w-3.5 text-amber-500" />
                  <span>{pub.citations} Citations &bull; Google Scholar</span>
                  <ExternalLink className="h-2.5 w-2.5 opacity-60" />
                </a>
              </div>

              <div>
                <CardTitle className="text-base sm:text-lg font-bold leading-snug tracking-tight text-foreground group-hover:text-primary transition-colors">
                  {pub.title}
                </CardTitle>
                <p className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                  <Calendar className="h-3 w-3" />
                  <span>{pub.year}</span>
                  <span>•</span>
                  <span className="font-medium text-foreground/80 truncate">{pub.journal || "Google Scholar"}</span>
                </p>
              </div>
            </CardHeader>

            <CardContent className="p-5 pt-0 space-y-4 flex-1 flex flex-col justify-between">
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed line-clamp-3">
                {pub.snippet}
              </p>

              <div className="space-y-3 pt-3 border-t border-border/60">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground font-medium">Faculty Lead:</span>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-foreground truncate max-w-[170px]">
                      {pub.facultyLead || pub.authors[0]}
                    </span>
                    {onNavigateToFaculty && (
                      <button
                        type="button"
                        onClick={() => onNavigateToFaculty(pub.facultyLead || pub.authors[0])}
                        className="text-[11px] font-bold text-primary hover:underline cursor-pointer inline-flex items-center gap-0.5"
                      >
                        <span>Faculty Card</span>
                        <span>&rarr;</span>
                      </button>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <Button
                    asChild
                    variant="outline"
                    size="sm"
                    className="flex-1 h-9 rounded-xl border-border text-xs font-semibold gap-1.5 hover:bg-muted"
                  >
                    <a href={pub.url} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="h-3.5 w-3.5 text-primary" />
                      Read Publication
                    </a>
                  </Button>

                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => {
                      toast.success(
                        `Drafted connection note to ${pub.facultyLead || pub.authors[0]} regarding "${pub.title.slice(0, 30)}..."!`
                      );
                    }}
                    className="h-9 rounded-xl text-xs font-semibold gap-1.5"
                  >
                    <MessageSquare className="h-3.5 w-3.5" />
                    Connect
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {filtered.length === 0 && (
          <div className="col-span-full py-16 text-center rounded-2xl border border-dashed border-border p-8">
            <BookOpen className="mx-auto h-12 w-12 text-muted-foreground/60 mb-3" />
            <h3 className="text-lg font-bold">No matching publications found</h3>
            <p className="text-sm text-muted-foreground max-w-md mx-auto mt-1">
              Try adjusting your search query or selecting a different research domain above.
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSearch("");
                setSelectedField("All");
              }}
              className="mt-4 rounded-xl"
            >
              Reset Filters
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
