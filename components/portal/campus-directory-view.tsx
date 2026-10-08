"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { 
  VIRGINIA_INSTITUTIONS, 
  VirginiaInstitution 
} from "@/lib/university/virginia-institutions";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { 
  GraduationCap, 
  Search, 
  ExternalLink, 
  Building2, 
  BookOpen, 
  ShieldCheck, 
  ShieldAlert,
  Lock,
  Sparkles, 
  ArrowRight, 
  MapPin, 
  TrendingUp, 
  DollarSign, 
  Users,
  CheckCircle2,
  School
} from "lucide-react";
import { normalizeInstitutionSlug } from "@/lib/university/access-control";

interface CampusDirectoryViewProps {
  userSchoolSlug?: string | null;
  userSchoolName?: string | null;
  isVerified?: boolean;
  profileSettings?: Record<string, any> | null;
}

export const VIRGINIA_REGION_HUBS = [
  { id: "all", label: "All Virginia Regions" },
  { 
    id: "hampton_roads", 
    label: "Hampton Roads / Coastal", 
    keywords: ["hampton", "coastal", "norfolk", "virginia beach", "newport news", "portsmouth", "chesapeake", "suffolk", "historic triangle", "williamsburg"] 
  },
  { 
    id: "nova", 
    label: "Northern Virginia (NOVA / DC)", 
    keywords: ["northern", "nova", "fairfax", "arlington", "alexandria", "loudoun", "prince william", "metro", "rappahannock"] 
  },
  { 
    id: "central", 
    label: "Richmond / Central Virginia", 
    keywords: ["central", "richmond", "charlottesville", "petersburg", "farmville"] 
  },
  { 
    id: "valley", 
    label: "Shenandoah Valley / Blue Ridge", 
    keywords: ["valley", "shenandoah", "harrisonburg", "staunton", "waynesboro", "winchester", "blue ridge", "lord fairfax", "highlands"] 
  },
  { 
    id: "southwest", 
    label: "Southwest / New River Valley", 
    keywords: ["southwest", "new river", "blacksburg", "roanoke", "radford", "abingdon", "wise", "clinch", "mountain empire"] 
  },
  { 
    id: "southside", 
    label: "Southside / Piedmont", 
    keywords: ["southside", "piedmont", "danville", "martinsville", "lynchburg", "halifax", "patrick henry"] 
  },
];

export function CampusDirectoryView({ 
  userSchoolSlug, 
  userSchoolName, 
  isVerified,
  profileSettings 
}: CampusDirectoryViewProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedRegion, setSelectedRegion] = useState<string>("all");

  const categories = [
    { id: "all", label: "All Institutions (50)" },
    { id: "public_university", label: "4-Year Public Universities (15)" },
    { id: "vccs_community_college", label: "VCCS Community Colleges (23)" },
    { id: "private_university", label: "Private Universities (12)" },
  ];

  // Set of all normalized slugs verified for this user
  const verifiedSlugs = useMemo(() => {
    const set = new Set<string>();
    if (isVerified && userSchoolSlug) {
      set.add(normalizeInstitutionSlug(userSchoolSlug));
    }
    const settingsSchools = profileSettings?.verified_schools;
    if (Array.isArray(settingsSchools)) {
      for (const s of settingsSchools) {
        if (s?.slug) {
          set.add(normalizeInstitutionSlug(s.slug));
        }
      }
    }
    return set;
  }, [isVerified, userSchoolSlug, profileSettings]);

  const filteredInstitutions = useMemo(() => {
    return VIRGINIA_INSTITUTIONS.filter((inst) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        inst.name.toLowerCase().includes(q) ||
        inst.shortName.toLowerCase().includes(q) ||
        inst.domain.toLowerCase().includes(q) ||
        inst.location.toLowerCase().includes(q) ||
        inst.region.toLowerCase().includes(q) ||
        inst.topMajors.some((m) => m.toLowerCase().includes(q));

      const matchesCategory =
        selectedCategory === "all" || inst.category === selectedCategory;

      let matchesRegion = true;
      if (selectedRegion !== "all") {
        const hub = VIRGINIA_REGION_HUBS.find((h) => h.id === selectedRegion);
        if (hub && hub.keywords) {
          const haystack = `${inst.region} ${inst.location}`.toLowerCase();
          matchesRegion = hub.keywords.some((kw) => haystack.includes(kw.toLowerCase()));
        }
      }

      return matchesSearch && matchesCategory && matchesRegion;
    });
  }, [searchQuery, selectedCategory, selectedRegion]);

  return (
    <div className="space-y-8 max-w-7xl mx-auto py-2">
      {/* Verified Student Banner if applicable */}
      {isVerified && userSchoolSlug && (
        <div className="bg-[#102b2b] text-[#fbf8f1] rounded-2xl p-6 sm:p-7 shadow-xl border border-[#102b2b]/30 flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-xl bg-[#d8f36b] text-[#102b2b] flex items-center justify-center font-black">
              <GraduationCap className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#d8f36b]">
                  Verified Student Workspace
                </span>
                <span className="inline-flex items-center gap-1 text-[11px] font-bold bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-500/30">
                  <CheckCircle2 className="h-3 w-3" /> Active
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black mt-1 text-white">
                {userSchoolName || "Your University"} Portal
              </h2>
              <p className="text-xs text-white/75 mt-0.5">
                Your account is verified. Jump straight into cohort analytics, student directory, and campus recruiters.
              </p>
            </div>
          </div>
          <Link href={`/dashboard/portal/${userSchoolSlug}`}>
            <Button className="h-11 px-5 font-black bg-[#d8f36b] text-[#102b2b] hover:bg-[#cbf048] rounded-xl gap-2 cursor-pointer shadow-lg">
              Launch My Campus Portal
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      )}

      {/* Hero Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-border/80 pb-6">
        <div>
          <div className="inline-flex items-center gap-2 text-xs font-bold text-primary bg-primary/10 px-3 py-1 rounded-full mb-3">
            <School className="h-3.5 w-3.5" />
            Collegiate Career Network &bull; Commonwealth of Virginia
          </div>
          <h1 className="text-3xl sm:text-4xl font-heading font-black tracking-tight text-foreground">
            University &amp; College Portals
          </h1>
          <p className="text-sm text-muted-foreground mt-2 max-w-2xl leading-relaxed">
            Explore dedicated career center hubs, cohort directories, and verified employer pipelines for 
            all 50 institutions across Virginia, from VCCS community colleges to top research universities.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link href="/dashboard/settings?tab=university">
            <Button variant="outline" className="h-10 text-xs font-bold rounded-xl gap-2">
              <ShieldCheck className="h-4 w-4 text-primary" />
              Verify My Enrollment
            </Button>
          </Link>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-3.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search by school name, acronym (e.g. ODU, TCC, UVA, VT), city, major..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-11 text-sm rounded-xl border-border bg-card"
            />
          </div>

          <div className="sm:w-64">
            <select
              value={selectedRegion}
              onChange={(e) => setSelectedRegion(e.target.value)}
              aria-label="Filter institutions by Virginia region"
              className="w-full h-11 px-3 text-xs font-bold rounded-xl border border-border bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
            >
              {VIRGINIA_REGION_HUBS.map((hub) => (
                <option key={hub.id} value={hub.id}>
                  {hub.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Category Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3.5 py-2 text-xs font-bold rounded-xl whitespace-nowrap transition-all cursor-pointer ${
                selectedCategory === cat.id
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Results Count */}
      <div className="flex items-center justify-between text-xs font-mono text-muted-foreground">
        <span>Showing {filteredInstitutions.length} of {VIRGINIA_INSTITUTIONS.length} institutions</span>
        {searchQuery && (
          <button
            onClick={() => setSearchQuery("")}
            className="text-primary hover:underline font-semibold cursor-pointer"
          >
            Clear search
          </button>
        )}
      </div>

      {/* Institution Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredInstitutions.map((inst) => {
          const isVerifiedForThisSchool = verifiedSlugs.has(normalizeInstitutionSlug(inst.slug));
          const isUserSchool = userSchoolSlug === inst.slug;
          const isVccs = inst.category === "vccs_community_college";

          return (
            <Card 
              key={inst.slug} 
              className={`rounded-2xl transition-all duration-200 border bg-card hover:shadow-lg hover:border-primary/40 flex flex-col justify-between ${
                isVerifiedForThisSchool 
                  ? "border-emerald-500/40 ring-1 ring-emerald-500/20" 
                  : "border-border/80"
              }`}
            >
              <CardHeader className="p-5 pb-3 space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <div className={`h-10 w-10 rounded-xl flex items-center justify-center font-black text-sm shrink-0 ${
                      isVerifiedForThisSchool ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400" : "bg-primary/10 text-primary"
                    }`}>
                      {inst.shortName.slice(0, 3)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-muted-foreground font-mono">
                          {inst.shortName}
                        </span>
                        {isVerifiedForThisSchool ? (
                          <Badge className="bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30 text-[10px] font-bold flex items-center gap-1">
                            <ShieldCheck className="h-3 w-3 text-emerald-500" />
                            Verified Access
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="bg-muted text-muted-foreground border-border text-[10px] font-bold flex items-center gap-1">
                            <Lock className="h-3 w-3 text-amber-500/80" />
                            FERPA Gate
                          </Badge>
                        )}
                      </div>
                      <CardTitle className="text-base font-bold text-foreground leading-snug line-clamp-2">
                        {inst.name}
                      </CardTitle>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <MapPin className="h-3.5 w-3.5 shrink-0 text-primary/70" />
                  <span className="truncate">{inst.location} &bull; {inst.region.split("/")[0].trim()}</span>
                </div>
              </CardHeader>

              <CardContent className="p-5 pt-0 space-y-4 flex-1 flex flex-col justify-between">
                <div className="space-y-3">
                  {/* Category & Canvas Badge */}
                  <div className="flex flex-wrap items-center gap-1.5">
                    <Badge 
                      variant="outline" 
                      className={`text-[10px] font-bold rounded-lg ${
                        isVccs 
                          ? "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/30" 
                          : "bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/30"
                      }`}
                    >
                      {isVccs ? "VCCS Community College" : inst.category === "public_university" ? "Public Research 4-Year" : "Private University"}
                    </Badge>
                    <Badge variant="outline" className="text-[10px] font-mono text-muted-foreground border-border">
                      Canvas SIS Ready
                    </Badge>
                  </div>

                  {/* Metrics Bar */}
                  <div className="grid grid-cols-3 gap-2 py-2 px-3 bg-muted/40 rounded-xl text-center border border-border/50">
                    <div>
                      <p className="text-[10px] uppercase font-bold text-muted-foreground">Students</p>
                      <p className="text-xs font-bold text-foreground mt-0.5">{inst.undergrads}</p>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase font-bold text-muted-foreground">Placement</p>
                      <p className="text-xs font-bold text-emerald-600 mt-0.5">{inst.placementRate}</p>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase font-bold text-muted-foreground">Avg Salary</p>
                      <p className="text-xs font-bold text-foreground mt-0.5">{inst.avgStartingSalary}</p>
                    </div>
                  </div>

                  {/* Top Majors */}
                  <div>
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1.5">
                      Top Programs &amp; Majors
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {inst.topMajors.slice(0, 3).map((major) => (
                        <span 
                          key={major} 
                          className="text-[11px] font-medium bg-muted/70 text-foreground px-2 py-0.5 rounded-md"
                        >
                          {major}
                        </span>
                      ))}
                      {inst.topMajors.length > 3 && (
                        <span className="text-[10px] text-muted-foreground font-mono self-center">
                          +{inst.topMajors.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="pt-3 border-t border-border/60 flex items-center gap-2">
                  <Link href={`/dashboard/portal/${inst.slug}`} className="flex-1">
                    <Button 
                      className={`w-full h-9 text-xs font-bold rounded-xl gap-1.5 shadow-sm ${
                        isVerifiedForThisSchool 
                          ? "bg-emerald-600 hover:bg-emerald-700 text-white" 
                          : "bg-[#102b2b] text-[#d8f36b] hover:bg-[#164743]"
                      }`}
                    >
                      {isVerifiedForThisSchool ? (
                        <>
                          <span>Launch Portal</span>
                          <ArrowRight className="h-3.5 w-3.5" />
                        </>
                      ) : (
                        <>
                          <Lock className="h-3 w-3 opacity-70" />
                          <span>Enter Gate</span>
                          <ArrowRight className="h-3.5 w-3.5" />
                        </>
                      )}
                    </Button>
                  </Link>
                  <a 
                    href={inst.website} 
                    target="_blank" 
                    rel="noreferrer" 
                    className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-xl transition"
                    title={`Visit official ${inst.name} website`}
                  >
                    <ExternalLink className="h-4 w-4" />
                  </a>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {filteredInstitutions.length === 0 && (
        <div className="py-16 text-center bg-card rounded-2xl border border-dashed border-border p-8">
          <GraduationCap className="h-10 w-10 text-muted-foreground mx-auto mb-3 opacity-40" />
          <h3 className="text-base font-bold text-foreground">No Virginia institutions found</h3>
          <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
            Try adjusting your search query or reset the category/region filters.
          </p>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => { setSearchQuery(""); setSelectedCategory("all"); setSelectedRegion("all"); }}
            className="mt-4 rounded-xl text-xs font-bold"
          >
            Reset Filters
          </Button>
        </div>
      )}
    </div>
  );
}
