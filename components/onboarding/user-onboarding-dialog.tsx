"use client";

import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  GraduationCap,
  Briefcase,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  School,
  Mail,
  KeyRound,
  Loader2,
  Check,
  ShieldCheck,
  ChevronRight,
  ExternalLink,
  Info,
  MapPin,
  X,
  Zap,
} from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { VIRGINIA_INSTITUTIONS } from "@/lib/university/virginia-institutions";

const POPULAR_UNIVERSITIES = [
  ...VIRGINIA_INSTITUTIONS.map((vi) => ({
    name: vi.name,
    slug: vi.slug,
    domain: vi.domain,
    emailDomains: vi.emailDomains,
    emailFormat: vi.emailFormat,
    sampleEmail: vi.sampleEmail,
    location: vi.location,
    region: vi.region,
    category: vi.category,
    shortName: vi.shortName,
    state: "VA",
    canvasUrl: vi.canvasUrl,
    topMajors: vi.topMajors,
    hasPortal: true,
  })),
  { name: "Stanford University", slug: "stanford", domain: "stanford.edu", location: "Stanford, CA", category: "national" as const },
  { name: "Massachusetts Institute of Technology", slug: "mit", domain: "mit.edu", location: "Cambridge, MA", category: "national" as const },
  { name: "University of California, Berkeley", slug: "berkeley", domain: "berkeley.edu", location: "Berkeley, CA", category: "national" as const },
  { name: "Harvard University", slug: "harvard", domain: "harvard.edu", location: "Cambridge, MA", category: "national" as const },
  { name: "Carnegie Mellon University", slug: "cmu", domain: "cmu.edu", location: "Pittsburgh, PA", category: "national" as const },
  { name: "New York University", slug: "nyu", domain: "nyu.edu", location: "New York, NY", category: "national" as const },
  { name: "University of Michigan", slug: "umich", domain: "umich.edu", location: "Ann Arbor, MI", category: "national" as const },
  { name: "Georgia Institute of Technology", slug: "gatech", domain: "gatech.edu", location: "Atlanta, GA", category: "national" as const },
  { name: "University of Washington", slug: "uw", domain: "uw.edu", location: "Seattle, WA", category: "national" as const },
  { name: "Columbia University", slug: "columbia", domain: "columbia.edu", location: "New York, NY", category: "national" as const },
];

const ROLES = [
  "Software Engineer",
  "Product Manager",
  "Data Scientist / AI Engineer",
  "Fullstack Developer",
  "Cloud & DevOps Engineer",
  "UI/UX Designer",
  "Financial Analyst",
  "Management Consultant",
  "Biotech Researcher",
];

const EXPERIENCE_LEVELS = [
  { id: "student", label: "Student / Intern", desc: "Currently studying or seeking first internship" },
  { id: "entry", label: "Early Career (0-2 yrs)", desc: "Graduated or starting professional journey" },
  { id: "mid", label: "Mid-Level (3-5 yrs)", desc: "Hands-on experience with track record" },
  { id: "senior", label: "Senior / Lead (5+ yrs)", desc: "Specialist or engineering leadership" },
];

type DetectedSchool = {
  name: string;
  slug: string;
  domain: string;
  location: string;
  emailFormat: string;
  sampleEmail: string;
  emailDomains: string[];
};

export function UserOnboardingDialog() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [checking, setChecking] = useState(true);

  // Wizard state
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [targetRole, setTargetRole] = useState("Software Engineer");
  const [experienceLevel, setExperienceLevel] = useState("student");
  const [isStudent, setIsStudent] = useState<boolean | null>(null);

  // School auto-detection state (from signup email)
  const [detectedSchool, setDetectedSchool] = useState<DetectedSchool | null>(null);
  const [detectingSchool, setDetectingSchool] = useState(false);
  // "confirmed" = user said yes | "rejected" = user said no, show manual form | null = not yet decided
  const [schoolConfirmation, setSchoolConfirmation] = useState<"confirmed" | "rejected" | null>(null);

  // Manual school selection state (used when auto-detect is rejected)
  const [selectedSchool, setSelectedSchool] = useState("");
  const [schoolSearch, setSchoolSearch] = useState("");
  const [verificationMethod, setVerificationMethod] = useState<"email" | "canvas" | null>(null);

  // Email verification state
  const [schoolEmail, setSchoolEmail] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [codeSent, setCodeSent] = useState(false);
  const [sendingCode, setSendingCode] = useState(false);
  const [verifyingCode, setVerifyingCode] = useState(false);
  const [isSchoolVerified, setIsSchoolVerified] = useState(false);

  // Canvas verification state
  const [canvasUrl, setCanvasUrl] = useState("https://canvas.instructure.com");
  const [canvasToken, setCanvasToken] = useState("");
  const [verifyingCanvas, setVerifyingCanvas] = useState(false);
  const [savingOnboarding, setSavingOnboarding] = useState(false);

  // Campus Catalog state
  const [campuses, setCampuses] = useState<Array<{
    name: string;
    slug: string;
    domain: string;
    location?: string;
    studentCount?: number;
    hasPortal?: boolean;
    emailFormat?: string;
    sampleEmail?: string;
    emailDomains?: string[];
    category?: string;
    shortName?: string;
    state?: string;
    canvasUrl?: string;
    topMajors?: string[];
  }>>(POPULAR_UNIVERSITIES);
  const [loadingCampuses, setLoadingCampuses] = useState(false);
  const [isDiscoveringSchool, setIsDiscoveringSchool] = useState(false);
  const [campusFilter, setCampusFilter] = useState<"all_va" | "vccs" | "va_4yr" | "all">("all_va");

  // School email format from RapidAPI + AI
  const [schoolFormatData, setSchoolFormatData] = useState<{
    school_name: string;
    domain: string;
    allowed_domains: string[];
    formats: Array<{ pattern: string; example: string; percentage: string }>;
    student_format?: string;
    sample_email?: string;
    found: boolean;
    source?: string;
  } | null>(null);
  const [fetchingFormat, setFetchingFormat] = useState(false);

  const lookupSchoolFormat = async (schoolName: string) => {
    if (!schoolName || schoolName.trim().length < 2) return;
    setFetchingFormat(true);
    try {
      const res = await fetch(`/api/university/format?schoolName=${encodeURIComponent(schoolName.trim())}`);
      if (res.ok) {
        const data = await res.json();
        setSchoolFormatData(data);
        if (data.found && data.sample_email && !schoolEmail) {
          setSchoolEmail(data.sample_email);
        }
      }
    } catch (err) {
      console.warn("Failed to lookup school format:", err);
    } finally {
      setFetchingFormat(false);
    }
  };

  useEffect(() => {
    checkOnboardingStatus();
    fetchCampuses();
  }, []);

  const fetchCampuses = async () => {
    setLoadingCampuses(true);
    try {
      const res = await fetch("/api/university/list");
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.campuses) && data.campuses.length > 0) {
          setCampuses(data.campuses);
          // Auto-seed to Supabase database if cached count in DB is low
          if (data.campuses.length < 25) {
            fetch("/api/university/seed-virginia", { method: "POST" })
              .then(() => fetch("/api/university/list"))
              .then((r) => r.json())
              .then((fresh) => {
                if (Array.isArray(fresh.campuses) && fresh.campuses.length > 0) {
                  setCampuses(fresh.campuses);
                }
              })
              .catch(() => {});
          }
        }
      }
    } catch (err) {
      console.warn("[CAMPUS_CATALOG] Fetch failed:", err);
    } finally {
      setLoadingCampuses(false);
    }
  };

  /**
   * Detects university from the user's signup email.
   * Called in background after onboarding opens for student users.
   */
  const detectSchoolFromEmail = async () => {
    setDetectingSchool(true);
    try {
      const res = await fetch("/api/user/detect-school");
      if (res.ok) {
        const data = await res.json();
        if (data.detected && data.school) {
          setDetectedSchool(data.school);
          // Pre-fill the school email as the signup email
          if (data.email) setSchoolEmail(data.email);
        }
      }
    } catch (err) {
      console.warn("[DETECT_SCHOOL] Failed:", err);
    } finally {
      setDetectingSchool(false);
    }
  };

  const handleAddNewCampus = async (schoolName: string) => {
    if (!schoolName || schoolName.trim().length === 0) return;
    setIsDiscoveringSchool(true);
    try {
      const res = await fetch("/api/university/list", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: schoolName.trim() }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.campus) {
          setCampuses((prev) => {
            const exists = prev.some((c) => c.slug === data.campus.slug);
            return exists ? prev : [data.campus, ...prev];
          });
          setSelectedSchool(data.campus.name);
          setSchoolSearch(data.campus.name);
          toast.success(`Discovered ${data.campus.name}! Campus directory and portal ready.`);
        }
      }
    } catch (err) {
      console.warn("Failed to discover school:", err);
      setSelectedSchool(schoolName);
    } finally {
      setIsDiscoveringSchool(false);
    }
  };

  const checkOnboardingStatus = async () => {
    try {
      const res = await fetch("/api/user/onboarding");
      if (res.ok) {
        const data = await res.json();
        if (!data.onboardingCompleted) {
          setOpen(true);
          // Pre-fill any existing profile data
          if (data.targetRole) setTargetRole(data.targetRole);
          if (data.experienceLevel) setExperienceLevel(data.experienceLevel);
          if (data.isStudent !== undefined) setIsStudent(data.isStudent);
          if (data.universityName) {
            setSelectedSchool(data.universityName);
            setSchoolSearch(data.universityName);
          }
          if (data.schoolVerified) {
            setIsSchoolVerified(true);
          }
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setChecking(false);
    }
  };

  // Trigger school detection when user hits step 3
  useEffect(() => {
    if (step === 3 && !detectedSchool && !detectingSchool) {
      detectSchoolFromEmail();
    }
  }, [step]);

  const activeSchoolName =
    schoolConfirmation === "confirmed" && detectedSchool
      ? detectedSchool.name
      : selectedSchool || schoolSearch || "University Student";

  const matchedCampus = campuses.find((c) => {
    const sName = activeSchoolName.toLowerCase();
    const cName = c.name.toLowerCase();
    const cSlug = c.slug.toLowerCase();
    if (cName === sName || cSlug === sName) return true;
    if (sName.includes("tidewater") && (cSlug.includes("tidewater") || cSlug === "tcc")) return true;
    if (sName === "tcc" && (cSlug.includes("tidewater") || cSlug === "tcc")) return true;
    if (sName.includes("old dominion") && (cSlug.includes("old-dominion") || cSlug === "odu")) return true;
    if (sName === "odu" && (cSlug.includes("old-dominion") || cSlug === "odu")) return true;
    return false;
  });

  const effectiveCampus = schoolConfirmation === "confirmed" && detectedSchool
    ? {
        name: detectedSchool.name,
        slug: detectedSchool.slug,
        domain: detectedSchool.domain,
        emailFormat: detectedSchool.emailFormat,
        sampleEmail: detectedSchool.sampleEmail,
        emailDomains: detectedSchool.emailDomains,
      }
    : matchedCampus;

  const isEmailDomainValid = (() => {
    if (!schoolEmail || !schoolEmail.includes("@")) return true;
    const emailDomain = schoolEmail.split("@")[1]?.toLowerCase().trim();
    if (!emailDomain) return true;
    if (
      emailDomain.endsWith(".edu") ||
      emailDomain.endsWith(".ac.uk") ||
      emailDomain.endsWith(".edu.au") ||
      emailDomain.endsWith(".edu.cn") ||
      emailDomain.endsWith(".edu.ca") ||
      emailDomain.includes("vccs.edu") ||
      emailDomain.includes("tcc.edu")
    ) {
      return true;
    }
    if (schoolFormatData?.allowed_domains && schoolFormatData.allowed_domains.length > 0) {
      if (schoolFormatData.allowed_domains.some(
        (d) => emailDomain === d.toLowerCase() || emailDomain.endsWith("." + d.toLowerCase())
      )) {
        return true;
      }
    }
    if (effectiveCampus?.emailDomains && effectiveCampus.emailDomains.length > 0) {
      return effectiveCampus.emailDomains.some(
        (d) => emailDomain === d.toLowerCase() || emailDomain.endsWith("." + d.toLowerCase())
      );
    }
    if (effectiveCampus?.domain) {
      return (
        emailDomain === effectiveCampus.domain.toLowerCase() ||
        emailDomain.endsWith("." + effectiveCampus.domain.toLowerCase())
      );
    }
    return false;
  })();

  // Auto-lookup school email format when active school changes
  useEffect(() => {
    if (step === 3 && activeSchoolName && activeSchoolName !== "University Student" && activeSchoolName.trim().length >= 2) {
      const timer = setTimeout(() => {
        lookupSchoolFormat(activeSchoolName);
      }, 350);
      return () => clearTimeout(timer);
    }
  }, [step, activeSchoolName]);

  const handleConfirmDetectedSchool = async () => {
    if (!detectedSchool) return;

    // User confirmed their auto-detected school
    setSchoolConfirmation("confirmed");
    setIsStudent(true);
    setIsSchoolVerified(true);
    setSelectedSchool(detectedSchool.name);
    setSchoolSearch(detectedSchool.name);

    // Instantly save to profile in background so school_verified is locked in
    try {
      await fetch("/api/user/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          targetRole,
          experienceLevel,
          isStudent: true,
          universityName: detectedSchool.name,
          universitySlug: detectedSchool.slug,
          schoolVerified: true,
          schoolEmail: schoolEmail || detectedSchool.sampleEmail || null,
        }),
      });

      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("rf-profile-updated"));
      }
      router.refresh();
    } catch (err) {
      console.warn("Failed to auto-save confirmed school:", err);
    }

    toast.success(`Institutional status confirmed for ${detectedSchool.name}! 🎓`);
    // Flow directly to summary step — school part is automatically checked out!
    setStep(4);
  };

  const handleSendEmailCode = async () => {
    if (!schoolEmail || !schoolEmail.includes("@")) {
      toast.error("Please enter a valid university email address (.edu)");
      return;
    }

    const emailDomain = schoolEmail.split("@")[1]?.toLowerCase().trim();
    const isAcademic = emailDomain && (
      emailDomain.endsWith(".edu") ||
      emailDomain.endsWith(".ac.uk") ||
      emailDomain.endsWith(".edu.au") ||
      emailDomain.endsWith(".edu.ca") ||
      emailDomain.includes("vccs.edu") ||
      emailDomain.includes("tcc.edu")
    );

    if (!isAcademic && !isEmailDomainValid) {
      toast.error("Please enter an official academic email ending in .edu");
      return;
    }

    setSendingCode(true);
    try {
      const res = await fetch("/api/university/verify-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          schoolEmail,
          universityName: activeSchoolName,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to send code");

      setCodeSent(true);
      toast.success(data.message || "Verification code sent to your school email!");
    } catch (err: any) {
      toast.error(err.message || "Failed to send verification code");
    } finally {
      setSendingCode(false);
    }
  };

  const handleVerifyEmailCode = async () => {
    if (!verificationCode || verificationCode.length < 4) {
      toast.error("Please enter the verification code");
      return;
    }

    setVerifyingCode(true);
    try {
      const res = await fetch("/api/university/verify-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          schoolEmail,
          code: verificationCode,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Invalid code");

      setIsSchoolVerified(true);
      toast.success("University verified successfully! 🎓");

      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("rf-profile-updated"));
      }
      router.refresh();

      setStep(4);
    } catch (err: any) {
      toast.error(err.message || "Failed to verify code");
    } finally {
      setVerifyingCode(false);
    }
  };

  const handleVerifyCanvas = async () => {
    if (!canvasUrl || !canvasToken) {
      toast.error("Please provide both Canvas URL and Access Token");
      return;
    }

    setVerifyingCanvas(true);
    try {
      const res = await fetch("/api/university/verify-canvas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          canvasInstanceUrl: canvasUrl,
          canvasAccessToken: canvasToken,
          schoolName: activeSchoolName,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Canvas verification failed");

      setIsSchoolVerified(true);
      toast.success(`Verified via Canvas! Welcome ${data.studentName || ""}`);

      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("rf-profile-updated"));
      }
      router.refresh();

      setStep(4);
    } catch (err: any) {
      toast.error(err.message || "Canvas token verification failed");
    } finally {
      setVerifyingCanvas(false);
    }
  };

  const handleCompleteOnboarding = async (skipSchool: boolean = false) => {
    setSavingOnboarding(true);
    try {
      // Use confirmed detected school, or manually selected school
      const schoolName = skipSchool
        ? null
        : (schoolConfirmation === "confirmed" && detectedSchool
            ? detectedSchool.name
            : selectedSchool || schoolSearch || null);

      const schoolSlug = schoolName
        ? schoolName.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")
        : null;

      const res = await fetch("/api/user/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          targetRole,
          experienceLevel,
          isStudent: isStudent === true,
          universityName: schoolName,
          universitySlug: schoolSlug,
          schoolVerified: skipSchool ? false : isSchoolVerified,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to save profile");
      }

      toast.success("Welcome aboard! Your career workspace is ready.");
      setOpen(false);

      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("rf-profile-updated"));
      }
      router.refresh();
    } catch (err: any) {
      toast.error(err.message || "Failed to finalize onboarding");
    } finally {
      setSavingOnboarding(false);
    }
  };

  const filteredSchools = campuses.filter((u) => {
    const q = schoolSearch.toLowerCase().trim();
    const uAny = u as any;
    const matchesQuery =
      !q ||
      u.name.toLowerCase().includes(q) ||
      u.slug.toLowerCase().includes(q) ||
      u.domain.toLowerCase().includes(q) ||
      (uAny.shortName && uAny.shortName.toLowerCase().includes(q)) ||
      (u.location && u.location.toLowerCase().includes(q));

    if (!matchesQuery) return false;

    // Filter by Tab
    if (campusFilter === "vccs") {
      return (
        uAny.category === "vccs_community_college" ||
        u.slug.includes("community-college") ||
        u.domain.includes("vccs")
      );
    }
    if (campusFilter === "va_4yr") {
      return (
        uAny.category === "public_university" ||
        uAny.category === "private_university" ||
        (uAny.state === "VA" && !uAny.category?.includes("community"))
      );
    }
    if (campusFilter === "all_va") {
      return (
        uAny.state === "VA" ||
        u.location?.includes("VA") ||
        u.domain.includes("vccs") ||
        uAny.category?.includes("vccs")
      );
    }
    return true;
  });

  const exactMatchExists = campuses.some(
    (u) => u.name.toLowerCase().trim() === schoolSearch.toLowerCase().trim()
  );

  // Whether we're in the "school detected — confirm?" sub-state
  const showDetectedSchoolConfirm =
    step === 3 &&
    !verificationMethod &&
    schoolConfirmation === null &&
    (detectedSchool !== null || detectingSchool);

  // Whether we're in the manual school selection view
  const showManualSchoolSearch =
    step === 3 &&
    !verificationMethod &&
    !showDetectedSchoolConfirm;

  if (checking || !open) return null;

  return (
    <Dialog open={open} onOpenChange={(val) => !savingOnboarding && setOpen(val)}>
      <DialogContent className="sm:max-w-4xl lg:max-w-5xl w-[96vw] max-h-[90vh] overflow-y-auto p-0 border border-[#102b2b]/20 bg-background shadow-2xl rounded-none">
        {/* Header Banner */}
        <div className="bg-[#102b2b] text-[#fbf8f1] p-6 sm:p-8 border-b border-[#102b2b]/30">
          <div className="flex items-center justify-between">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 bg-[#d8f36b] text-[#102b2b] text-xs font-black uppercase tracking-widest">
              <Sparkles className="h-3.5 w-3.5" />
              Welcome to ResumeForge
            </div>
            <span className="text-xs font-mono font-bold text-[#d8f36b] bg-white/10 px-3 py-1">
              Step {step} of 4
            </span>
          </div>
          <DialogTitle className="text-2xl sm:text-3xl font-black mt-4 text-white tracking-tight">
            {step === 1 && "Customize Your Career Trajectory"}
            {step === 2 && "Are You Currently a Student?"}
            {step === 3 && showDetectedSchoolConfirm && "We Found Your School"}
            {step === 3 && !showDetectedSchoolConfirm && !verificationMethod && "Select & Verify Your University"}
            {step === 3 && verificationMethod === "email" && "Verify with School Email"}
            {step === 3 && verificationMethod === "canvas" && "Verify via Canvas LMS"}
            {step === 4 && "You're All Set!"}
          </DialogTitle>
          <DialogDescription className="text-sm text-white/80 mt-1.5 leading-relaxed max-w-2xl">
            {step === 1 && "Specify your target role and seniority so our AI engine tailors your resumes, job matching, and interview sandboxes."}
            {step === 2 && "Students unlock dedicated campus career portals, cohort analytics, campus fair trackers, and verified badges."}
            {step === 3 && showDetectedSchoolConfirm && "We detected your institution from your sign-up email. Confirm if this is correct, or search manually."}
            {step === 3 && !showDetectedSchoolConfirm && !verificationMethod && "Connect your university via school email or Canvas LMS. You can also skip and configure anytime in Settings."}
            {step === 3 && verificationMethod === "email" && "A 6-digit code will be sent to your school inbox. Check Spam or Junk if you don't see it."}
            {step === 3 && verificationMethod === "canvas" && "Connect your Canvas LMS to instantly verify enrollment and pull course data to your resume."}
            {step === 4 && "Your personalized workspace is configured and ready for lift-off."}
          </DialogDescription>

          {/* Progress Bar */}
          <div className="grid grid-cols-4 gap-2.5 mt-5">
            {[1, 2, 3, 4].map((s) => (
              <div
                key={s}
                className={`h-2 transition-all duration-300 ${
                  s <= step ? "bg-[#d8f36b]" : "bg-white/20"
                }`}
              />
            ))}
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 sm:p-8 space-y-8">

          {/* ─── STEP 1: CAREER TARGET ─────────────────────────────── */}
          {step === 1 && (
            <div className="space-y-6">
              <div>
                <Label className="text-xs font-black uppercase tracking-wider text-muted-foreground block mb-2.5">
                  Target Career Role
                </Label>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 mb-3">
                  {ROLES.map((role) => (
                    <button
                      key={role}
                      type="button"
                      onClick={() => setTargetRole(role)}
                      className={`text-left p-3.5 text-xs font-semibold border transition-all cursor-pointer ${
                        targetRole === role
                          ? "border-[#0d8274] bg-[#0d8274]/10 text-foreground ring-2 ring-[#0d8274]"
                          : "border-border hover:border-foreground/40 bg-card text-muted-foreground"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span>{role}</span>
                        {targetRole === role && <Check className="h-3.5 w-3.5 text-[#0d8274]" />}
                      </div>
                    </button>
                  ))}
                </div>
                <Input
                  value={targetRole}
                  onChange={(e) => setTargetRole(e.target.value)}
                  placeholder="Or enter custom role (e.g. Quantitative Trader, Robotics Engineer)..."
                  className="rounded-none border-border h-11"
                />
              </div>

              <div>
                <Label className="text-xs font-black uppercase tracking-wider text-muted-foreground block mb-2.5">
                  Experience Level
                </Label>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  {EXPERIENCE_LEVELS.map((lvl) => (
                    <div
                      key={lvl.id}
                      onClick={() => setExperienceLevel(lvl.id)}
                      className={`p-4 border cursor-pointer transition-all ${
                        experienceLevel === lvl.id
                          ? "border-[#0d8274] bg-[#0d8274]/10 ring-2 ring-[#0d8274]"
                          : "border-border hover:border-foreground/30 bg-card"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-foreground">{lvl.label}</span>
                        {experienceLevel === lvl.id && (
                          <Check className="h-4 w-4 text-[#0d8274]" />
                        )}
                      </div>
                      <p className="text-[11px] text-muted-foreground mt-1.5 leading-relaxed">{lvl.desc}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end pt-4 border-t border-border">
                <Button
                  onClick={() => setStep(2)}
                  className="bg-[#102b2b] text-[#d8f36b] hover:bg-[#164743] font-bold rounded-none px-8 h-11 cursor-pointer"
                >
                  Continue
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
            </div>
          )}

          {/* ─── STEP 2: STUDENT STATUS ────────────────────────────── */}
          {step === 2 && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div
                  onClick={() => setIsStudent(true)}
                  className={`p-8 border cursor-pointer transition-all flex flex-col items-center text-center ${
                    isStudent === true
                      ? "border-[#0d8274] bg-[#0d8274]/10 ring-2 ring-[#0d8274]"
                      : "border-border hover:border-foreground/30 bg-card"
                  }`}
                >
                  <div className="h-16 w-16 rounded-full bg-[#0d8274]/15 flex items-center justify-center text-[#0d8274] mb-4">
                    <GraduationCap className="h-8 w-8" />
                  </div>
                  <h4 className="font-bold text-foreground text-base">Yes, I am a Student</h4>
                  <p className="text-xs text-muted-foreground mt-2 leading-relaxed max-w-xs">
                    Undergraduate, graduate, or university student seeking campus cohort portals, employer network access, and verified student recruiter badges.
                  </p>
                </div>

                <div
                  onClick={() => setIsStudent(false)}
                  className={`p-8 border cursor-pointer transition-all flex flex-col items-center text-center ${
                    isStudent === false
                      ? "border-[#0d8274] bg-[#0d8274]/10 ring-2 ring-[#0d8274]"
                      : "border-border hover:border-foreground/30 bg-card"
                  }`}
                >
                  <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center text-muted-foreground mb-4">
                    <Briefcase className="h-8 w-8" />
                  </div>
                  <h4 className="font-bold text-foreground text-base">No, I am a Working Professional</h4>
                  <p className="text-xs text-muted-foreground mt-2 leading-relaxed max-w-xs">
                    Full-time professional, freelancer, or career switcher targeting industry roles, autonomous job agents, and marketplace headhunters.
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-border">
                <Button
                  variant="outline"
                  onClick={() => setStep(1)}
                  className="rounded-none border-border px-6 h-11"
                >
                  Back
                </Button>
                <Button
                  disabled={isStudent === null}
                  onClick={() => {
                    if (isStudent === true) {
                      setStep(3);
                    } else {
                      // Non-students skip school step
                      setStep(4);
                    }
                  }}
                  className="bg-[#102b2b] text-[#d8f36b] hover:bg-[#164743] font-bold rounded-none px-8 h-11 cursor-pointer"
                >
                  Continue
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
            </div>
          )}

          {/* ─── STEP 3: UNIVERSITY DETECTION & VERIFICATION ────────── */}
          {step === 3 && (
            <div className="space-y-6">

              {/* SUB-STATE A: Detecting / Confirm detected school */}
              {showDetectedSchoolConfirm && (
                <div className="space-y-5">
                  {detectingSchool ? (
                    <div className="flex flex-col items-center justify-center py-12 space-y-4">
                      <div className="relative">
                        <div className="h-16 w-16 rounded-full bg-[#0d8274]/10 flex items-center justify-center">
                          <GraduationCap className="h-8 w-8 text-[#0d8274]" />
                        </div>
                        <div className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-[#d8f36b] flex items-center justify-center">
                          <Loader2 className="h-3 w-3 text-[#102b2b] animate-spin" />
                        </div>
                      </div>
                      <div className="text-center">
                        <p className="text-sm font-bold text-foreground">Looking up your institution...</p>
                        <p className="text-xs text-muted-foreground mt-1">Checking your sign-up email domain</p>
                      </div>
                    </div>
                  ) : detectedSchool ? (
                    <>
                      {/* Auto-detected school card */}
                      <div className="p-6 border-2 border-[#0d8274] bg-[#0d8274]/5 space-y-4">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-center gap-3">
                            <div className="h-12 w-12 bg-[#0d8274]/15 flex items-center justify-center shrink-0">
                              <GraduationCap className="h-6 w-6 text-[#0d8274]" />
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-black text-foreground">{detectedSchool.name}</span>
                                <Badge className="bg-[#d8f36b] text-[#102b2b] text-[9px] px-1.5 py-0 font-black border-0">
                                  AUTO-DETECTED
                                </Badge>
                              </div>
                              <p className="text-xs text-muted-foreground font-mono mt-0.5">
                                {detectedSchool.domain}
                              </p>
                            </div>
                          </div>
                        </div>

                        {detectedSchool.location && (
                          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                            <MapPin className="h-3.5 w-3.5" />
                            {detectedSchool.location}
                          </div>
                        )}

                        <div className="p-3 bg-background/60 border border-[#0d8274]/20 text-xs">
                          <p className="font-semibold text-foreground mb-1">Email format for {detectedSchool.name}:</p>
                          <p className="font-mono text-[#0d8274]">{detectedSchool.emailFormat}</p>
                          <p className="text-muted-foreground mt-0.5">Example: {detectedSchool.sampleEmail}</p>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-3 pt-2">
                          <Button
                            onClick={handleConfirmDetectedSchool}
                            className="flex-1 bg-[#102b2b] text-[#d8f36b] hover:bg-[#164743] font-bold rounded-none h-11"
                          >
                            <Check className="h-4 w-4 mr-2" />
                            Yes, this is my school
                          </Button>
                          <Button
                            variant="outline"
                            onClick={() => {
                              setSchoolConfirmation("rejected");
                              setDetectedSchool(null);
                            }}
                            className="flex-1 rounded-none border-border h-11 font-semibold"
                          >
                            <X className="h-4 w-4 mr-2" />
                            No, search manually
                          </Button>
                        </div>
                      </div>

                      {/* Info about what happens after confirming */}
                      <div className="p-3 bg-muted/60 border border-border text-xs text-muted-foreground space-y-1.5">
                        <p className="font-semibold text-foreground flex items-center gap-1.5">
                          <Info className="h-3.5 w-3.5 text-blue-500" />
                          What happens next?
                        </p>
                        <ul className="space-y-1 list-disc list-inside text-[11px] leading-relaxed">
                          <li>We'll send a 6-digit code to your school inbox (or you can verify via Canvas)</li>
                          <li>Once verified, your campus portal appears in the sidebar</li>
                          <li>You won't need to verify again — it's permanent</li>
                        </ul>
                      </div>
                    </>
                  ) : null}

                  <div className="flex items-center justify-between pt-4 border-t border-border">
                    <Button
                      variant="outline"
                      onClick={() => setStep(2)}
                      className="rounded-none border-border px-6 h-11"
                    >
                      Back
                    </Button>
                    <Button
                      variant="ghost"
                      onClick={() => handleCompleteOnboarding(true)}
                      className="text-xs text-muted-foreground hover:text-foreground font-semibold"
                    >
                      Skip University for Now →
                    </Button>
                  </div>
                </div>
              )}

              {/* SUB-STATE B: Manual school search (no auto-detect or user rejected) */}
              {showManualSchoolSearch && (
                <div className="space-y-5">
                  <div>
                    <Label className="text-xs font-black uppercase tracking-wider text-muted-foreground block mb-2">
                      Find Your University or Institution
                    </Label>
                    <Input
                      value={schoolSearch}
                      onChange={(e) => {
                        setSchoolSearch(e.target.value);
                        setSelectedSchool(e.target.value);
                      }}
                      placeholder="Search or enter school name (e.g. Stanford, MIT, Berkeley, NYU)..."
                      className="rounded-none border-border h-11"
                    />
                  </div>

                  {/* Discover New University Banner */}
                  {schoolSearch.trim().length > 2 && !exactMatchExists && (
                    <div className="p-3.5 bg-[#0d8274]/10 border border-[#0d8274]/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <div className="text-xs font-bold text-foreground flex items-center gap-1.5">
                          <Sparkles className="h-3.5 w-3.5 text-[#0d8274]" />
                          Don&apos;t see your campus listed?
                        </div>
                        <p className="text-[11px] text-muted-foreground mt-0.5">
                          Add <span className="font-semibold text-foreground">&quot;{schoolSearch}&quot;</span> &mdash; our AI will index your campus departments, faculty, and launch your dedicated portal.
                        </p>
                      </div>
                      <Button
                        type="button"
                        size="sm"
                        disabled={isDiscoveringSchool}
                        onClick={() => handleAddNewCampus(schoolSearch)}
                        className="h-8 text-xs font-bold bg-[#102b2b] text-[#d8f36b] hover:bg-[#164743] shrink-0 rounded-none cursor-pointer"
                      >
                        {isDiscoveringSchool ? (
                          <>
                            <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" />
                            Indexing Campus...
                          </>
                        ) : (
                          <>+ Add &amp; Discover Campus</>
                        )}
                      </Button>
                    </div>
                  )}

                  {/* Filter Tabs for Virginia & National Colleges */}
                  <div>
                    <div className="flex items-center gap-1.5 border-b border-border pb-2.5 overflow-x-auto no-scrollbar">
                      <button
                        type="button"
                        onClick={() => setCampusFilter("all_va")}
                        className={`px-3 py-1.5 text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                          campusFilter === "all_va"
                            ? "bg-[#102b2b] text-[#d8f36b] dark:bg-[#d8f36b] dark:text-[#102b2b]"
                            : "bg-muted/60 text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        🏛️ Virginia Campuses ({campuses.filter((c: any) => c.state === "VA" || c.location?.includes("VA")).length || 50})
                      </button>
                      <button
                        type="button"
                        onClick={() => setCampusFilter("vccs")}
                        className={`px-3 py-1.5 text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                          campusFilter === "vccs"
                            ? "bg-[#102b2b] text-[#d8f36b] dark:bg-[#d8f36b] dark:text-[#102b2b]"
                            : "bg-muted/60 text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        🎓 VCCS Community Colleges (23)
                      </button>
                      <button
                        type="button"
                        onClick={() => setCampusFilter("va_4yr")}
                        className={`px-3 py-1.5 text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                          campusFilter === "va_4yr"
                            ? "bg-[#102b2b] text-[#d8f36b] dark:bg-[#d8f36b] dark:text-[#102b2b]"
                            : "bg-muted/60 text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        🦅 4-Year Universities (27)
                      </button>
                      <button
                        type="button"
                        onClick={() => setCampusFilter("all")}
                        className={`px-3 py-1.5 text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                          campusFilter === "all"
                            ? "bg-[#102b2b] text-[#d8f36b] dark:bg-[#d8f36b] dark:text-[#102b2b]"
                            : "bg-muted/60 text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        🌎 All Institutions ({campuses.length})
                      </button>
                    </div>

                    <div className="flex items-center justify-between my-2.5">
                      <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                        {loadingCampuses ? "Loading Campuses..." : `Institutions Found (${filteredSchools.length})`}
                      </span>
                      <span className="text-[10px] text-muted-foreground font-mono">
                        Instant enrollment &amp; LMS verification
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 max-h-60 overflow-y-auto pr-1">
                      {filteredSchools.map((u) => {
                        const isSelected = selectedSchool === u.name;
                        const hasActiveCohort = (u.studentCount || 0) > 0;
                        const uAny = u as any;

                        return (
                          <button
                            key={u.slug}
                            type="button"
                            onClick={() => {
                              setSelectedSchool(u.name);
                              setSchoolSearch(u.name);
                              if (uAny.canvasUrl) {
                                setCanvasUrl(uAny.canvasUrl);
                              }
                            }}
                            className={`text-left p-3 border transition-all cursor-pointer flex flex-col justify-between ${
                              isSelected
                                ? "border-[#0d8274] bg-[#0d8274]/15 font-bold text-foreground ring-1 ring-[#0d8274]"
                                : "border-border hover:border-foreground/30 bg-card text-muted-foreground"
                            }`}
                          >
                            <div>
                              <div className="flex items-start justify-between gap-1">
                                <span className="text-xs font-bold text-foreground leading-snug line-clamp-2">
                                  {u.name}
                                  {uAny.shortName && <span className="text-muted-foreground font-normal ml-1">({uAny.shortName})</span>}
                                </span>
                                {hasActiveCohort && (
                                  <Badge className="bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30 text-[9px] px-1 py-0 shrink-0 font-mono">
                                    {u.studentCount} Verified
                                  </Badge>
                                )}
                              </div>
                              <div className="flex items-center gap-1.5 mt-1">
                                <span className="text-[10px] text-muted-foreground font-mono">
                                  {u.domain}
                                </span>
                                {uAny.category === "vccs_community_college" ? (
                                  <Badge className="bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-0 text-[8px] px-1 py-0 font-bold">
                                    VCCS
                                  </Badge>
                                ) : uAny.category === "public_university" ? (
                                  <Badge className="bg-sky-500/15 text-sky-700 dark:text-sky-300 border-0 text-[8px] px-1 py-0 font-bold">
                                    VA Public
                                  </Badge>
                                ) : uAny.category === "private_university" ? (
                                  <Badge className="bg-violet-500/15 text-violet-700 dark:text-violet-300 border-0 text-[8px] px-1 py-0 font-bold">
                                    VA Private
                                  </Badge>
                                ) : null}
                              </div>
                            </div>
                            {u.location && (
                              <span className="text-[10px] text-muted-foreground/80 mt-1.5 truncate">
                                📍 {u.location}
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* RapidAPI & AI Email Format Detection Card / Fallback Card */}
                  {activeSchoolName && activeSchoolName !== "University Student" && (
                    <div className="pt-2">
                      {fetchingFormat ? (
                        <div className="p-4 bg-muted/30 border border-border flex items-center gap-3">
                          <Loader2 className="h-4 w-4 animate-spin text-[#0d8274]" />
                          <div>
                            <p className="text-xs font-bold text-foreground">
                              Looking up email format for &quot;{activeSchoolName}&quot;...
                            </p>
                            <p className="text-[11px] text-muted-foreground">
                              Searching academic registries &amp; RocketReach formats via RapidAPI &amp; AI
                            </p>
                          </div>
                        </div>
                      ) : schoolFormatData?.found ? (
                        <div className="p-5 border-2 border-[#0d8274]/40 bg-[#0d8274]/5 space-y-4">
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex items-center gap-3">
                              <div className="h-10 w-10 bg-[#0d8274]/20 border border-[#0d8274]/30 flex items-center justify-center font-black text-sm text-[#0d8274] shrink-0">
                                {schoolFormatData.school_name.slice(0, 2).toUpperCase()}
                              </div>
                              <div>
                                <div className="flex items-center gap-2">
                                  <h4 className="text-sm font-black text-foreground">
                                    {schoolFormatData.school_name} Email Formats
                                  </h4>
                                  <Badge className="bg-[#d8f36b] text-[#102b2b] text-[9px] font-black border-0">
                                    FORMAT DETECTED
                                  </Badge>
                                </div>
                                {schoolFormatData.formats[0] && (
                                  <p className="text-xs text-muted-foreground mt-0.5 leading-snug">
                                    The most common format is <strong className="text-foreground font-mono">{schoolFormatData.formats[0].pattern}</strong> (ex. <span className="font-mono text-foreground font-medium">{schoolFormatData.formats[0].example}</span>), used by <span className="font-bold text-[#0d8274]">{schoolFormatData.formats[0].percentage}</span> of addresses.
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* RocketReach Email Formats Breakdown Table */}
                          <div className="border border-border/80 overflow-hidden bg-card/60">
                            <table className="w-full text-left text-xs">
                              <thead className="bg-muted/80 border-b border-border text-[10px] font-black text-muted-foreground uppercase tracking-wider">
                                <tr>
                                  <th className="p-2.5">Email Format</th>
                                  <th className="p-2.5">Example</th>
                                  <th className="p-2.5 text-right">Percentage</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-border/50 text-[11px]">
                                {schoolFormatData.formats.slice(0, 5).map((fmt, idx) => (
                                  <tr key={idx} className="hover:bg-muted/30">
                                    <td className="p-2.5 font-mono font-bold text-[#0d8274]">{fmt.pattern}</td>
                                    <td className="p-2.5 font-mono text-muted-foreground">{fmt.example}</td>
                                    <td className="p-2.5 text-right font-bold text-foreground">
                                      <span className="inline-flex items-center gap-1.5 justify-end">
                                        <span>{fmt.percentage}</span>
                                        <span className="h-1.5 w-12 bg-muted rounded-none overflow-hidden inline-block">
                                          <span
                                            className="h-full bg-[#0d8274] block"
                                            style={{ width: fmt.percentage.includes("%") ? fmt.percentage : "40%" }}
                                          />
                                        </span>
                                      </span>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>

                          {schoolFormatData.student_format && (
                            <div className="p-2.5 bg-muted/50 border border-border text-[11px] font-mono text-muted-foreground flex items-center justify-between">
                              <span>Student Format: <strong className="text-[#0d8274]">{schoolFormatData.student_format}</strong></span>
                              {schoolFormatData.sample_email && (
                                <span className="text-[10px] text-muted-foreground">Ex: {schoolFormatData.sample_email}</span>
                              )}
                            </div>
                          )}

                          <div className="pt-1 flex items-center justify-between gap-3">
                            <p className="text-xs text-muted-foreground">
                              Verify your enrollment with your official university email
                            </p>
                            <Button
                              type="button"
                              onClick={() => setVerificationMethod("email")}
                              className="bg-[#102b2b] text-[#d8f36b] hover:bg-[#164743] font-bold text-xs h-9 px-4 rounded-none cursor-pointer shrink-0"
                            >
                              <Mail className="h-3.5 w-3.5 mr-1.5" />
                              Verify with School Email
                            </Button>
                          </div>
                        </div>
                      ) : schoolFormatData && !schoolFormatData.found ? (
                        <div className="p-5 border-2 border-amber-500/30 bg-amber-500/5 space-y-4">
                          <div className="flex items-start gap-3">
                            <div className="p-2 bg-amber-500/10 text-amber-600 rounded-none shrink-0 mt-0.5">
                              <Info className="h-5 w-5" />
                            </div>
                            <div>
                              <h4 className="text-sm font-black text-foreground">
                                Could not automatically find email pattern for &quot;{activeSchoolName}&quot;
                              </h4>
                              <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                                We could not retrieve verified email formats for this institution. You can connect your Canvas LMS token to verify student status, or skip to continue as a professional for now.
                              </p>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                            <div
                              onClick={() => setVerificationMethod("canvas")}
                              className="p-4 border border-violet-500/30 hover:border-violet-600 bg-card/80 hover:bg-violet-500/5 cursor-pointer transition-all space-y-1.5"
                            >
                              <div className="flex items-center gap-2 text-violet-700 dark:text-violet-300 font-bold text-xs">
                                <KeyRound className="h-4 w-4" />
                                Enter Canvas LMS Token
                              </div>
                              <p className="text-[11px] text-muted-foreground leading-relaxed">
                                Instant verification. Connect courses &amp; verified GPA directly to your resume bullet points.
                              </p>
                            </div>

                            <div
                              onClick={() => {
                                setIsStudent(false);
                                setStep(4);
                                toast.info("Continuing as professional. You can update to student status in Settings anytime to access your school portal.");
                              }}
                              className="p-4 border border-border hover:border-foreground/40 bg-card/80 hover:bg-muted/40 cursor-pointer transition-all space-y-1.5"
                            >
                              <div className="flex items-center gap-2 text-foreground font-bold text-xs">
                                <Briefcase className="h-4 w-4" />
                                Skip as Professional for now
                              </div>
                              <p className="text-[11px] text-muted-foreground leading-relaxed">
                                Continue with professional tools. You can upgrade to student status anytime in Settings.
                              </p>
                            </div>
                          </div>
                        </div>
                      ) : null}
                    </div>
                  )}

                  {/* Choose verification method */}
                  <div className="pt-2">
                    <Label className="text-xs font-black uppercase tracking-wider text-muted-foreground block mb-3">
                      Choose Verification Method
                    </Label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div
                        onClick={() => setVerificationMethod("email")}
                        className="p-5 border border-border hover:border-[#0d8274] bg-card cursor-pointer transition-all space-y-2 hover:bg-[#0d8274]/5"
                      >
                        <div className="flex items-center gap-2 text-foreground font-bold text-sm">
                          <Mail className="h-5 w-5 text-[#0d8274]" />
                          School Email Code (.edu)
                        </div>
                        <p className="text-xs text-muted-foreground leading-relaxed">
                          Receive a 6-digit confirmation code. Verified status activates your university portal on the dashboard sidebar.
                        </p>
                      </div>

                      <div
                        onClick={() => setVerificationMethod("canvas")}
                        className="p-5 border border-border hover:border-violet-600 bg-card cursor-pointer transition-all space-y-2 hover:bg-violet-500/5"
                      >
                        <div className="flex items-center gap-2 text-foreground font-bold text-sm">
                          <KeyRound className="h-5 w-5 text-violet-600" />
                          Canvas LMS Token
                        </div>
                        <p className="text-xs text-muted-foreground leading-relaxed">
                          Instant verification. Connect courses, assignments &amp; verified GPA directly to your resume bullet points.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-border">
                    <Button
                      variant="outline"
                      onClick={() => setStep(2)}
                      className="rounded-none border-border px-6 h-11"
                    >
                      Back
                    </Button>
                    <Button
                      variant="ghost"
                      onClick={() => handleCompleteOnboarding(true)}
                      className="text-xs text-muted-foreground hover:text-foreground font-semibold"
                    >
                      Skip University for Now →
                    </Button>
                  </div>
                </div>
              )}

              {/* SUB-STATE C: Email Verification Form */}
              {verificationMethod === "email" && (
                <div className="space-y-5">
                  <div className="p-4 bg-[#0d8274]/10 border border-[#0d8274]/20 flex items-center justify-between">
                    <div>
                      <p className="text-sm font-bold text-[#0d8274]">
                        Selected School: {activeSchoolName !== "University Student" ? activeSchoolName : "University"}
                      </p>
                      <p className="text-xs text-muted-foreground">Verify via official student email</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setVerificationMethod(null)}
                      className="text-xs h-8"
                    >
                      Change Method
                    </Button>
                  </div>

                  {schoolFormatData?.found && schoolFormatData.formats && schoolFormatData.formats.length > 0 && (
                    <div className="p-3.5 bg-muted/40 border border-border/80 text-xs space-y-2.5">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-foreground flex items-center gap-1.5 text-xs">
                          <Sparkles className="h-3.5 w-3.5 text-[#0d8274]" />
                          Institutional Email Patterns ({schoolFormatData.domain || effectiveCampus?.domain || "academic domain"})
                        </span>
                        <Badge className="bg-[#d8f36b] text-[#102b2b] text-[9px] font-black border-0">
                          RocketReach Patterns
                        </Badge>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {schoolFormatData.formats.slice(0, 4).map((fmt, idx) => (
                          <div key={idx} className="p-2 bg-background border border-border/60 text-[11px] font-mono flex items-center justify-between">
                            <span className="text-[#0d8274] font-semibold">{fmt.pattern}</span>
                            <span className="text-muted-foreground text-[10px] font-sans font-bold">{fmt.percentage}</span>
                          </div>
                        ))}
                      </div>
                      {schoolFormatData.sample_email && (
                        <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-0.5">
                          <span>
                            Sample: <span className="font-mono text-foreground font-semibold">{schoolFormatData.sample_email}</span>
                          </span>
                          {!schoolEmail && (
                            <button
                              type="button"
                              onClick={() => setSchoolEmail(schoolFormatData.sample_email || "")}
                              className="text-[10px] text-[#0d8274] hover:underline font-semibold"
                            >
                              Use Sample Template
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  )}

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label className="text-xs font-bold text-foreground">University Email (.edu)</Label>
                      {(schoolFormatData?.student_format || effectiveCampus?.emailFormat) && (
                        <span className="text-[11px] text-muted-foreground flex items-center gap-1 font-mono">
                          Format: <strong className="text-[#0d8274]">{schoolFormatData?.student_format || effectiveCampus?.emailFormat}</strong>
                        </span>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Input
                        type="email"
                        value={schoolEmail}
                        onChange={(e) => setSchoolEmail(e.target.value)}
                        placeholder={schoolFormatData?.sample_email || effectiveCampus?.sampleEmail || `student@${effectiveCampus?.domain || "school.edu"}`}
                        className="rounded-none border-border h-11"
                      />
                      <Button
                        onClick={handleSendEmailCode}
                        disabled={sendingCode || !schoolEmail}
                        className="bg-[#102b2b] text-[#d8f36b] hover:bg-[#164743] font-bold rounded-none shrink-0 px-6 h-11"
                      >
                        {sendingCode ? <Loader2 className="h-4 w-4 animate-spin" /> : "Send Code"}
                      </Button>
                    </div>
                    {schoolEmail.includes("@") && (
                      schoolEmail.toLowerCase().trim().endsWith(".edu") || schoolEmail.toLowerCase().includes("vccs.edu") ? (
                        <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold mt-1 flex items-center gap-1.5">
                          <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
                          <span>Academic institution email (.edu) verified format. Ready to receive code.</span>
                        </p>
                      ) : !isEmailDomainValid ? (
                        <p className="text-[11px] text-amber-600 dark:text-amber-400 font-semibold mt-1 flex items-center gap-1.5">
                          <Info className="h-3.5 w-3.5 shrink-0" />
                          <span>Tip: Academic emails end with .edu (e.g. {effectiveCampus?.sampleEmail || `student@${effectiveCampus?.domain || "school.edu"}`}).</span>
                        </p>
                      ) : null
                    )}
                  </div>

                  {codeSent && (
                    <div className="space-y-4 pt-4 border-t border-border">
                      <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-xs text-muted-foreground space-y-1">
                        <p className="font-semibold text-foreground flex items-center gap-1.5">
                          <Mail className="h-3.5 w-3.5 text-emerald-600" />
                          Check your school inbox
                        </p>
                        <p className="text-[11px] leading-relaxed">
                          A 6-digit verification code was sent to <strong>{schoolEmail}</strong>. Check your <strong>Inbox</strong>, <strong>Junk</strong>, or <strong>Spam</strong> folder — campus filters sometimes route automated messages there.
                        </p>
                      </div>

                      <div className="space-y-2">
                        <Label className="text-xs font-bold text-foreground">Enter 6-Digit Code</Label>
                        <div className="flex gap-2">
                          <Input
                            value={verificationCode}
                            onChange={(e) => setVerificationCode(e.target.value)}
                            placeholder="e.g. 582914"
                            maxLength={6}
                            className="rounded-none font-mono text-center tracking-widest text-lg border-border h-11"
                          />
                          <Button
                            onClick={handleVerifyEmailCode}
                            disabled={verifyingCode || verificationCode.length < 4}
                            className="bg-[#0d8274] text-white hover:bg-[#095e54] font-bold rounded-none shrink-0 px-8 h-11"
                          >
                            {verifyingCode ? <Loader2 className="h-4 w-4 animate-spin" /> : "Verify Code"}
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-4 border-t border-border">
                    <Button
                      variant="outline"
                      onClick={() => setVerificationMethod(null)}
                      className="rounded-none border-border px-6 h-11"
                    >
                      Back
                    </Button>
                    <Button
                      variant="ghost"
                      onClick={() => handleCompleteOnboarding(true)}
                      className="text-xs text-muted-foreground hover:text-foreground font-semibold"
                    >
                      Skip &amp; Verify Later in Settings →
                    </Button>
                  </div>
                </div>
              )}

              {/* SUB-STATE D: Canvas Verification */}
              {verificationMethod === "canvas" && (
                <div className="space-y-5">
                  <div className="p-4 bg-violet-500/10 border border-violet-500/20 flex items-center justify-between">
                    <div>
                      <p className="text-sm font-bold text-violet-700 dark:text-violet-300">
                        Canvas LMS Instant Verification
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Connect courses, homework &amp; grades directly to your resume
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setVerificationMethod(null)}
                      className="text-xs h-8"
                    >
                      Change Method
                    </Button>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label className="text-xs font-bold text-foreground">Canvas Instance URL</Label>
                      {activeSchoolName && activeSchoolName !== "University Student" && (
                        <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                          <CheckCircle2 className="h-3 w-3" />
                          Configured for {activeSchoolName}
                        </span>
                      )}
                    </div>
                    <Input
                      value={canvasUrl}
                      onChange={(e) => setCanvasUrl(e.target.value)}
                      placeholder="https://vccs.instructure.com or https://canvas.instructure.com"
                      className="rounded-none border-border h-11"
                    />
                    {canvasUrl && canvasUrl.startsWith("http") && (
                      <div className="pt-0.5 flex items-center justify-between text-[11px]">
                        <span className="text-muted-foreground">Shortcut to generate token:</span>
                        <a
                          href={`${canvasUrl.replace(/\/$/, "")}/profile/settings`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-violet-600 dark:text-violet-400 hover:underline font-semibold flex items-center gap-1"
                        >
                          Open {activeSchoolName !== "University Student" ? activeSchoolName : "Canvas"} Account Settings <ExternalLink className="h-3 w-3" />
                        </a>
                      </div>
                    )}
                  </div>

                  {/* Detailed Step-by-Step Instructions */}
                  <div className="p-4 bg-muted/60 border border-border text-xs text-muted-foreground space-y-2">
                    <p className="font-bold text-foreground flex items-center gap-1.5">
                      <Info className="h-4 w-4 text-violet-600" />
                      Where to find your Canvas LMS Access Token:
                    </p>
                    <ol className="list-decimal list-inside space-y-1 text-[11px] leading-relaxed">
                      <li>Log in to your institution&apos;s Canvas LMS portal (e.g. <code>https://canvas.instructure.com</code> or your campus Canvas URL)</li>
                      <li>Click <strong>Account</strong> in the left sidebar menu &rarr; select <strong>Settings</strong></li>
                      <li>Scroll down to the <strong>Approved Integrations</strong> section</li>
                      <li>Click <strong>+ New Access Token</strong>, enter Purpose: &quot;ResumeForge&quot;, then click <strong>Generate Token</strong></li>
                      <li>Copy the generated token string and paste it into the field below</li>
                    </ol>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs font-bold text-foreground">Canvas Access Token</Label>
                    <Input
                      type="password"
                      value={canvasToken}
                      onChange={(e) => setCanvasToken(e.target.value)}
                      placeholder="Paste Canvas access token here..."
                      className="rounded-none border-border h-11 font-mono"
                    />
                  </div>

                  <Button
                    onClick={handleVerifyCanvas}
                    disabled={verifyingCanvas || !canvasToken}
                    className="w-full bg-[#0d8274] text-white hover:bg-[#095e54] font-bold rounded-none h-12"
                  >
                    {verifyingCanvas ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        Verifying Canvas Token...
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="h-4 w-4 mr-2" />
                        Verify &amp; Link Canvas
                      </>
                    )}
                  </Button>

                  <div className="flex items-center justify-between pt-4 border-t border-border">
                    <Button
                      variant="outline"
                      onClick={() => setVerificationMethod(null)}
                      className="rounded-none border-border px-6 h-11"
                    >
                      Back
                    </Button>
                    <Button
                      variant="ghost"
                      onClick={() => handleCompleteOnboarding(true)}
                      className="text-xs text-muted-foreground hover:text-foreground font-semibold"
                    >
                      Skip &amp; Verify Later in Settings →
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ─── STEP 4: CONFIRMATION ──────────────────────────────── */}
          {step === 4 && (
            <div className="space-y-6 text-center py-6">
              <div className="h-20 w-20 bg-[#d8f36b] text-[#102b2b] flex items-center justify-center mx-auto rounded-none shadow-[4px_6px_0_rgba(16,43,43,.1)]">
                <CheckCircle2 className="h-10 w-10" />
              </div>

              <div>
                <h3 className="text-2xl font-black text-foreground">Workspace Configured!</h3>
                <p className="text-xs text-muted-foreground mt-1.5 max-w-lg mx-auto leading-relaxed">
                  Your profile has been initialized with role-based benchmarks, targeted question banks, and tailored ATS intelligence.
                </p>
              </div>

              <div className="p-5 bg-muted/60 border border-border text-left max-w-lg mx-auto space-y-3 text-xs">
                <div className="flex justify-between border-b border-border/50 pb-2">
                  <span className="text-muted-foreground font-bold">Target Role:</span>
                  <span className="font-bold text-foreground">{targetRole}</span>
                </div>
                <div className="flex justify-between border-b border-border/50 pb-2">
                  <span className="text-muted-foreground font-bold">Career Level:</span>
                  <span className="font-bold text-foreground">
                    {EXPERIENCE_LEVELS.find((l) => l.id === experienceLevel)?.label || experienceLevel}
                  </span>
                </div>
                {isSchoolVerified && (
                  <div className="flex justify-between items-center pt-1">
                    <span className="text-muted-foreground font-bold">University Status:</span>
                    <span className="font-bold text-[#0d8274] flex items-center gap-1.5 bg-[#0d8274]/10 px-2.5 py-1">
                      <ShieldCheck className="h-4 w-4" />
                      {activeSchoolName !== "University Student" ? activeSchoolName : selectedSchool} (Verified)
                    </span>
                  </div>
                )}
                {!isSchoolVerified && isStudent && (
                  <div className="flex justify-between items-center pt-1">
                    <span className="text-muted-foreground font-bold">University:</span>
                    <span className="text-xs text-amber-600 dark:text-amber-400 font-semibold flex items-center gap-1.5">
                      <Info className="h-3.5 w-3.5 shrink-0" />
                      Verify in Settings to unlock campus portal
                    </span>
                  </div>
                )}
              </div>

              <div className="max-w-lg mx-auto pt-2">
                <Button
                  onClick={() => handleCompleteOnboarding(false)}
                  disabled={savingOnboarding}
                  className="w-full bg-[#102b2b] text-[#d8f36b] hover:bg-[#164743] font-bold rounded-none h-12 text-sm shadow-[4px_6px_0_rgba(16,43,43,.15)] cursor-pointer"
                >
                  {savingOnboarding ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Finalizing Setup...
                    </>
                  ) : (
                    <>
                      Enter ResumeForge Dashboard
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
