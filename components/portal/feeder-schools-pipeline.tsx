"use client";

import React, { useState } from "react";
import { FeederHighSchool } from "@/lib/university/collegiate-intel-service";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  School,
  Search,
  ExternalLink,
  Star,
  Users,
  GraduationCap,
  Sparkles,
  Phone,
  MapPin,
  CheckCircle2,
  ShieldCheck,
  TrendingUp,
} from "lucide-react";

interface FeederSchoolsPipelineProps {
  schools: FeederHighSchool[];
  collegeName: string;
  cityName: string;
}

export function FeederSchoolsPipeline({
  schools,
  collegeName,
  cityName,
}: FeederSchoolsPipelineProps) {
  const [search, setSearch] = useState("");
  const [cityFilter, setCityFilter] = useState("All");

  const cities = ["All", ...Array.from(new Set(schools.map((s) => s.city)))];

  const filtered = schools.filter((s) => {
    const matchesSearch =
      s.schoolName.toLowerCase().includes(search.toLowerCase()) ||
      s.city.toLowerCase().includes(search.toLowerCase()) ||
      (s.notes && s.notes.toLowerCase().includes(search.toLowerCase()));

    const matchesCity = cityFilter === "All" || s.city === cityFilter;
    return matchesSearch && matchesCity;
  });

  const totalStudents = schools.reduce((acc, s) => acc + (s.studentCount || 0), 0);

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="relative overflow-hidden rounded-2xl border border-border bg-gradient-to-r from-card via-card to-emerald-500/5 p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
              <School className="h-3.5 w-3.5" />
              <span>SchoolDigger K-12 Regional Pipeline</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-foreground">
              Regional Feeder High Schools & Dual-Enrollment
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Real-time regional high school demographics, state rankings, and dual-enrollment academies feeding students into **{collegeName}**. Credits earned in high school articulate directly into college credit tracks.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div className="rounded-xl border border-border bg-card/60 p-4 text-center">
              <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400">{schools.length}</p>
              <p className="text-xs text-muted-foreground font-medium">Partner High Schools</p>
            </div>
            <div className="rounded-xl border border-border bg-card/60 p-4 text-center">
              <p className="text-2xl font-black text-foreground">{totalStudents.toLocaleString()}</p>
              <p className="text-xs text-muted-foreground font-medium">Student Pipeline</p>
            </div>
            <div className="rounded-xl border border-border bg-card/60 p-4 text-center col-span-2 sm:col-span-1">
              <p className="text-2xl font-black text-foreground">100%</p>
              <p className="text-xs text-muted-foreground font-medium">Dual Credit Articulation</p>
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
            placeholder={`Search feeder schools across ${cityName || "region"}...`}
            className="pl-10 h-11 rounded-xl border-input bg-background"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          {cities.map((c) => (
            <Button
              key={c}
              variant={cityFilter === c ? "default" : "outline"}
              size="sm"
              onClick={() => setCityFilter(c)}
              className="h-9 rounded-xl whitespace-nowrap text-xs font-semibold"
            >
              {c}
            </Button>
          ))}
        </div>
      </div>

      {/* School Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {filtered.map((school) => {
          const stars = school.rankStars || 4;
          return (
            <Card
              key={school.schoolId}
              className="group flex flex-col justify-between overflow-hidden rounded-2xl border-border bg-card transition-all duration-200 hover:border-emerald-500/40 hover:shadow-md"
            >
              <CardHeader className="p-5 pb-3 space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-1.5 text-amber-500 text-xs font-bold">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`h-4 w-4 ${
                          i < stars ? "fill-amber-400 text-amber-500" : "text-muted-foreground/30"
                        }`}
                      />
                    ))}
                    <span className="ml-1 text-foreground font-semibold">{stars}/5 Stars</span>
                  </div>

                  <Badge variant="outline" className="border-emerald-500/20 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[11px] font-semibold rounded-lg">
                    Dual Enrollment Partner
                  </Badge>
                </div>

                <div>
                  <CardTitle className="text-lg font-bold leading-snug tracking-tight text-foreground group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                    {school.schoolName}
                  </CardTitle>
                  <p className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                    <MapPin className="h-3 w-3" />
                    <span>{school.city}, {school.state}</span>
                    <span>•</span>
                    <span className="font-medium text-foreground/80">State Rank #{school.rank || "—"} of {school.rankOf || "320"}</span>
                  </p>
                </div>
              </CardHeader>

              <CardContent className="p-5 pt-0 space-y-4 flex-1 flex flex-col justify-between">
                <div className="grid grid-cols-2 gap-2 text-xs py-2 px-3 rounded-xl bg-muted/40 border border-border/60">
                  <div>
                    <span className="text-muted-foreground block text-[10px] uppercase font-bold tracking-wider">Enrolled Students</span>
                    <span className="font-bold text-foreground text-sm">{school.studentCount?.toLocaleString() || "1,200"}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block text-[10px] uppercase font-bold tracking-wider">Student/Teacher Ratio</span>
                    <span className="font-bold text-foreground text-sm">{school.pupilTeacherRatio || 15}:1</span>
                  </div>
                </div>

                <p className="text-xs text-muted-foreground leading-relaxed">
                  {school.notes || `Direct articulation pipeline feeding graduates into ${collegeName} degree programs.`}
                </p>

                <div className="pt-3 border-t border-border/60 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Phone className="h-3 w-3" />
                    <span>{school.phone}</span>
                  </div>

                  <Button
                    asChild
                    variant="outline"
                    size="sm"
                    className="h-8 rounded-xl border-border text-xs font-semibold gap-1.5 hover:bg-muted"
                  >
                    <a href={school.url} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="h-3.5 w-3.5 text-emerald-600" />
                      SchoolDigger Profile
                    </a>
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}

        {filtered.length === 0 && (
          <div className="col-span-full py-16 text-center rounded-2xl border border-dashed border-border p-8">
            <School className="mx-auto h-12 w-12 text-muted-foreground/60 mb-3" />
            <h3 className="text-lg font-bold">No feeder schools found</h3>
            <p className="text-sm text-muted-foreground max-w-md mx-auto mt-1">
              Try adjusting your search criteria or selecting &ldquo;All&rdquo; cities.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
