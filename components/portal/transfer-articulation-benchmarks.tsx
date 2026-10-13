"use client";

import React, { useState } from "react";
import { TransferBenchmarkPartner, CollegeDetailRecord } from "@/lib/university/collegiate-intel-service";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  GraduationCap,
  Building2,
  ExternalLink,
  CheckCircle2,
  MapPin,
  DollarSign,
  TrendingUp,
  Award,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Search,
} from "lucide-react";

interface TransferArticulationBenchmarksProps {
  currentCollege: CollegeDetailRecord;
  partners: TransferBenchmarkPartner[];
  collegeName: string;
}

export function TransferArticulationBenchmarks({
  currentCollege,
  partners,
  collegeName,
}: TransferArticulationBenchmarksProps) {
  const [search, setSearch] = useState("");

  const filtered = partners.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.shortName.toLowerCase().includes(search.toLowerCase()) ||
      p.location.toLowerCase().includes(search.toLowerCase()) ||
      p.articulationNotes.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Current College Benchmark Profile Card */}
      <div className="rounded-2xl border border-border bg-card p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-border">
          <div className="space-y-2 max-w-xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
              <Building2 className="h-3.5 w-3.5" />
              <span>Colleges & Universities API Institutional Profile</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-foreground">
              {currentCollege.name}
            </h2>
            <p className="text-sm text-muted-foreground flex items-center gap-2">
              <MapPin className="h-4 w-4 text-primary" />
              <span>{currentCollege.fullAddress || `${currentCollege.city}, ${currentCollege.state} ${currentCollege.zipCode}`}</span>
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
            <div className="rounded-xl border border-border bg-muted/30 p-3">
              <p className="text-xs text-muted-foreground font-medium">Type</p>
              <p className="text-sm sm:text-base font-bold capitalize text-foreground">
                {currentCollege.schoolTypeByYears}-Year {currentCollege.schoolTypeByDesignation}
              </p>
            </div>
            <div className="rounded-xl border border-border bg-muted/30 p-3">
              <p className="text-xs text-muted-foreground font-medium">Setting</p>
              <p className="text-sm sm:text-base font-bold capitalize text-foreground">
                {currentCollege.schoolSetting || "Suburban"}
              </p>
            </div>
            <div className="rounded-xl border border-border bg-muted/30 p-3">
              <p className="text-xs text-muted-foreground font-medium">Size</p>
              <p className="text-sm sm:text-base font-bold capitalize text-foreground">
                {currentCollege.schoolSize || "Large"} Campus
              </p>
            </div>
            <div className="rounded-xl border border-border bg-muted/30 p-3">
              <p className="text-xs text-muted-foreground font-medium">AP Credits</p>
              <p className="text-sm sm:text-base font-bold text-emerald-600 dark:text-emerald-400">
                {currentCollege.apCreditAwarded ? "Accepted" : "Review"}
              </p>
            </div>
          </div>
        </div>

        {/* Campus Photos Gallery */}
        {currentCollege.photos && currentCollege.photos.length > 0 && (
          <div className="pt-6">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Campus Visual Showcase & Satellite Telemetry
              </p>
              <a
                href={currentCollege.website}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-semibold text-primary hover:underline flex items-center gap-1"
              >
                Official Website <ExternalLink className="h-3 w-3" />
              </a>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
              {currentCollege.photos.slice(0, 6).map((imgUrl, i) => (
                <div
                  key={i}
                  className="group relative h-24 overflow-hidden rounded-xl border border-border bg-muted shadow-inner"
                >
                  <img
                    src={imgUrl}
                    alt={`${currentCollege.name} campus view ${i + 1}`}
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
                    loading="lazy"
                  />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Transfer Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-xl font-bold tracking-tight text-foreground">
            Guaranteed Admission & Transfer Articulation Destinations
          </h3>
          <p className="text-xs text-muted-foreground">
            Virginia 4-year research institutions with signed GAA transfer agreements.
          </p>
        </div>

        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search transfer universities..."
            className="pl-10 h-10 rounded-xl border-input bg-background text-xs"
          />
        </div>
      </div>

      {/* Transfer Partner Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filtered.map((tp) => (
          <Card
            key={tp.slug}
            className="group flex flex-col justify-between overflow-hidden rounded-2xl border-border bg-card transition-all duration-200 hover:border-primary/50 hover:shadow-md"
          >
            <CardHeader className="p-5 pb-3 space-y-3">
              <div className="flex items-start justify-between gap-3">
                <Badge variant="outline" className="border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold text-[10px] rounded-lg">
                  {tp.guaranteedAdmissionAgreement ? "Guaranteed GAA Agreement" : "Co-Enrollment"}
                </Badge>
                <span className="text-xs font-semibold text-muted-foreground">{tp.location}</span>
              </div>

              <div>
                <CardTitle className="text-lg font-bold leading-snug tracking-tight text-foreground group-hover:text-primary transition-colors">
                  {tp.name}
                </CardTitle>
                <CardDescription className="text-xs mt-1 text-muted-foreground font-medium">
                  {tp.type} • {tp.setting}
                </CardDescription>
              </div>
            </CardHeader>

            <CardContent className="p-5 pt-0 space-y-4 flex-1 flex flex-col justify-between">
              <div className="grid grid-cols-2 gap-2 text-xs py-2 px-3 rounded-xl bg-muted/40 border border-border/60">
                <div>
                  <span className="text-muted-foreground block text-[10px] uppercase font-bold tracking-wider">Acceptance Rate</span>
                  <span className="font-bold text-foreground text-sm">{tp.acceptanceRate}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block text-[10px] uppercase font-bold tracking-wider">Avg Net Price</span>
                  <span className="font-bold text-foreground text-sm">{tp.avgNetPrice}</span>
                </div>
              </div>

              <div className="space-y-1.5">
                <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                  <ShieldCheck className="h-3.5 w-3.5 text-primary" />
                  Articulation Policy:
                </span>
                <p className="text-xs text-muted-foreground leading-relaxed line-clamp-3">
                  {tp.articulationNotes}
                </p>
              </div>

              <div className="pt-3 border-t border-border/60">
                <Button
                  asChild
                  variant="outline"
                  size="sm"
                  className="w-full h-9 rounded-xl border-border text-xs font-semibold gap-1.5 hover:bg-muted"
                >
                  <a href={tp.website} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="h-3.5 w-3.5 text-primary" />
                    Visit {tp.shortName} Transfer Guide
                  </a>
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
