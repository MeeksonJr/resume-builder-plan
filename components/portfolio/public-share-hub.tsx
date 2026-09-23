"use client";

import * as React from "react";
import Link from "next/link";
import { useTheme } from "next-themes";
import {
    ModernTemplate,
    MinimalTemplate,
    CorporateTemplate,
    CreativeTemplate,
} from "@/components/portfolio/templates";
import { CanvasPortfolioRenderer } from "@/components/portfolio/canvas-portfolio-renderer";
import { DEFAULT_BLOCKS } from "@/components/portfolio/visual-portfolio-builder-studio-client";
import {
    VANITY_PALETTES,
    VANITY_TEMPLATES,
    TYPOGRAPHY_OPTIONS,
    PortfolioTemplateId,
    TypographyStyle,
    generateShareLinks,
} from "@/lib/portfolio/vanity-settings";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    Sun,
    Moon,
    Monitor,
    Share2,
    QrCode,
    Download,
    Check,
    Copy,
    ExternalLink,
    FileText,
    Sparkles,
    Printer,
    SlidersHorizontal,
    RotateCcw,
    ShieldCheck,
    ChevronUp,
    ChevronDown,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface PublicShareHubProps {
    portfolio: any;
    resumes: any[];
    projects: any[];
    profile: any;
    testimonials: any[];
    canvasCourses?: any[];
    slug: string;
    initialTemplate?: PortfolioTemplateId;
    initialAccentColor?: string;
    initialLayoutStyle?: string;
}

export function PublicShareHub({
    portfolio,
    resumes,
    projects,
    profile,
    testimonials,
    canvasCourses = [],
    slug,
    initialTemplate = "modern",
    initialAccentColor = "#3b82f6",
    initialLayoutStyle = "professional",
}: PublicShareHubProps) {
    const { theme, setTheme, resolvedTheme } = useTheme();
    const [mounted, setMounted] = React.useState(false);

    // Vanity Customizer State
    const [template, setTemplate] = React.useState<PortfolioTemplateId>(initialTemplate);
    const [accentColor, setAccentColor] = React.useState<string>(initialAccentColor);
    const [typography, setTypography] = React.useState<TypographyStyle>("sans");
    const [layoutStyle, setLayoutStyle] = React.useState<string>(initialLayoutStyle);
    const isCanvasActive =
        portfolio?.active_layout === "canvas" ||
        portfolio?.theme_settings?.active_layout === "canvas" ||
        (Array.isArray(portfolio?.custom_blocks) && portfolio.custom_blocks.length > 0 && portfolio?.active_layout !== "template");

    const [layoutEngine, setLayoutEngine] = React.useState<"canvas" | "template">(() => {
        if (isCanvasActive) return "canvas";
        if (portfolio?.active_layout === "template") return "template";
        if (typeof window !== "undefined") {
            const saved = localStorage.getItem("resumeforge_portfolio_active_layout");
            if (saved === "canvas" || saved === "template") return saved;
        }
        return "template";
    });

    // Share Modal & UI State
    const [shareOpen, setShareOpen] = React.useState(false);
    const [copied, setCopied] = React.useState(false);
    const [isBarMinimized, setIsBarMinimized] = React.useState(false);

    React.useEffect(() => {
        setMounted(true);
    }, []);

    const displayName = portfolio?.full_name || profile?.full_name || "Professional";
    const shareLinks = React.useMemo(() => {
        return generateShareLinks(slug, displayName);
    }, [slug, displayName]);

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(shareLinks.fullUrl);
            setCopied(true);
            toast.success("Vanity portfolio link copied to clipboard!");
            setTimeout(() => setCopied(false), 2500);
        } catch {
            toast.error("Failed to copy URL");
        }
    };

    const handlePrint = () => {
        window.print();
    };

    const handleResetVanity = () => {
        setTemplate(initialTemplate);
        setAccentColor(initialAccentColor);
        setLayoutStyle(initialLayoutStyle);
        setTypography("sans");
        setLayoutEngine(isCanvasActive ? "canvas" : "template");
        toast.info("Reset to candidate's original styling");
    };

    // Find if candidate has an active resume to link
    const primaryResume = resumes && resumes.length > 0 ? resumes[0] : null;
    const resumeUrl = primaryResume ? `/r/${primaryResume.slug || primaryResume.id}` : null;

    // Typography class lookup
    const fontClass = TYPOGRAPHY_OPTIONS.find((t) => t.id === typography)?.cssClass || "font-sans";

    const templateProps = {
        portfolio,
        resumes,
        projects,
        profile,
        testimonials,
        canvasCourses,
        accentColor,
        layoutStyle,
    };

    // Render active template
    const renderActiveTemplate = () => {
        if (layoutEngine === "canvas") {
            const canvasBlocks = (portfolio?.custom_blocks && Array.isArray(portfolio.custom_blocks) && portfolio.custom_blocks.length > 0)
                ? portfolio.custom_blocks
                : DEFAULT_BLOCKS;
            return (
                <div className="max-w-4xl mx-auto px-4 py-20 sm:py-28">
                    <CanvasPortfolioRenderer
                        blocks={canvasBlocks}
                        profile={profile}
                        portfolio={portfolio}
                    />
                </div>
            );
        }
        switch (template) {
            case "minimal":
                return <MinimalTemplate {...templateProps} />;
            case "corporate":
                return <CorporateTemplate {...templateProps} />;
            case "creative":
                return <CreativeTemplate {...templateProps} />;
            case "modern":
            default:
                return <ModernTemplate {...templateProps} />;
        }
    };

    return (
        <div className={cn("relative min-h-screen transition-colors duration-200", fontClass)}>
            {/* Top Floating Share Hub Navigation Dock (Print-hidden) */}
            <header className="fixed top-3 inset-x-0 z-50 px-3 sm:px-6 pointer-events-none print:hidden flex justify-center">
                <div
                    className={cn(
                        "pointer-events-auto w-full max-w-5xl rounded-full border border-border/70 bg-background/85 backdrop-blur-xl shadow-xl transition-all duration-300 px-3 sm:px-5 py-2",
                        isBarMinimized ? "max-w-fit py-1.5 px-3" : ""
                    )}
                >
                    <div className="flex items-center justify-between gap-2">
                        {/* Left: Candidate Identification */}
                        <div className="flex items-center gap-2.5 min-w-0">
                            <div
                                className="h-8 w-8 rounded-full flex items-center justify-center font-bold text-xs text-white shrink-0 shadow-xs"
                                style={{ backgroundColor: accentColor }}
                            >
                                {displayName.charAt(0).toUpperCase()}
                            </div>

                            {!isBarMinimized && (
                                <div className="min-w-0 hidden sm:block">
                                    <div className="flex items-center gap-1.5">
                                        <span className="font-bold text-xs text-foreground truncate">
                                            {displayName}
                                        </span>
                                        <Badge
                                            variant="secondary"
                                            className="h-4 px-1.5 text-[9px] font-semibold gap-0.5 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20 shrink-0"
                                        >
                                            <ShieldCheck className="h-2.5 w-2.5" />
                                            Verified
                                        </Badge>
                                    </div>
                                    <p className="text-[10px] text-muted-foreground truncate">
                                        {portfolio?.tagline || "Professional Portfolio Hub"}
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* Right: Controls & Interactive Vanity Actions */}
                        <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
                            {/* Customize Vanity Styling Popover */}
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="h-7 sm:h-8 px-2 sm:px-3 text-xs gap-1.5 rounded-full border-border/80 bg-background/80 hover:bg-muted"
                                        title="Customize view & layout"
                                    >
                                        <SlidersHorizontal className="h-3.5 w-3.5 text-primary" />
                                        <span className="hidden md:inline font-medium">Customize</span>
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent
                                    align="end"
                                    sideOffset={8}
                                    className="w-80 p-4 space-y-4 rounded-2xl shadow-2xl border-border/80 bg-background/95 backdrop-blur-2xl"
                                >
                                    <div className="flex items-center justify-between pb-2 border-b border-border/60">
                                        <div className="space-y-0.5">
                                            <h4 className="font-bold text-xs flex items-center gap-1.5">
                                                <Sparkles className="h-3.5 w-3.5 text-primary" />
                                                Vanity Layout & Style
                                            </h4>
                                            <p className="text-[10px] text-muted-foreground">
                                                Preview this portfolio in alternative designs
                                            </p>
                                        </div>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={handleResetVanity}
                                            className="h-6 w-6 rounded-full text-muted-foreground hover:text-foreground"
                                            title="Reset to author defaults"
                                        >
                                            <RotateCcw className="h-3 w-3" />
                                        </Button>
                                    </div>

                                    {/* 0. Layout Engine Switcher (Canvas Studio vs Templates) */}
                                    {((portfolio?.custom_blocks && portfolio.custom_blocks.length > 0) || isCanvasActive) && (
                                        <div className="space-y-1.5 pb-2 border-b border-border/50">
                                            <label className="text-[11px] font-semibold text-foreground uppercase tracking-wider block">
                                                Layout Engine
                                            </label>
                                            <div className="grid grid-cols-2 gap-1.5">
                                                <button
                                                    type="button"
                                                    onClick={() => setLayoutEngine("canvas")}
                                                    className={cn(
                                                        "text-center py-1.5 px-2 rounded-xl border text-xs font-bold transition-all",
                                                        layoutEngine === "canvas"
                                                            ? "border-primary bg-primary/10 text-primary shadow-xs"
                                                            : "border-border/60 hover:bg-muted/50 text-foreground"
                                                    )}
                                                >
                                                    Canvas Studio
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => setLayoutEngine("template")}
                                                    className={cn(
                                                        "text-center py-1.5 px-2 rounded-xl border text-xs font-bold transition-all",
                                                        layoutEngine === "template"
                                                            ? "border-primary bg-primary/10 text-primary shadow-xs"
                                                            : "border-border/60 hover:bg-muted/50 text-foreground"
                                                    )}
                                                >
                                                    Archetypes
                                                </button>
                                            </div>
                                        </div>
                                    )}

                                    {/* 1. Template Layouts */}
                                    <div className="space-y-2">
                                        <label className="text-[11px] font-semibold text-foreground uppercase tracking-wider block">
                                            Template Archetype
                                        </label>
                                        <div className="grid grid-cols-2 gap-1.5">
                                            {VANITY_TEMPLATES.map((tmpl) => (
                                                <button
                                                    key={tmpl.id}
                                                    type="button"
                                                    onClick={() => setTemplate(tmpl.id)}
                                                    className={cn(
                                                        "text-left p-2 rounded-xl border text-xs transition-all relative",
                                                        template === tmpl.id
                                                            ? "border-primary bg-primary/10 font-bold text-primary shadow-xs"
                                                            : "border-border/60 hover:border-border hover:bg-muted/50 text-foreground"
                                                    )}
                                                >
                                                    <div className="flex items-center justify-between">
                                                        <span>{tmpl.name}</span>
                                                        {template === tmpl.id && (
                                                            <Check className="h-3 w-3 text-primary" />
                                                        )}
                                                    </div>
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* 2. Curated Accent Palettes */}
                                    <div className="space-y-2">
                                        <label className="text-[11px] font-semibold text-foreground uppercase tracking-wider block">
                                            Accent Palette
                                        </label>
                                        <div className="flex items-center justify-between gap-1.5 pt-1">
                                            {VANITY_PALETTES.map((pal) => (
                                                <button
                                                    key={pal.id}
                                                    type="button"
                                                    onClick={() => setAccentColor(pal.hex)}
                                                    className={cn(
                                                        "h-7 w-7 rounded-full transition-transform flex items-center justify-center relative",
                                                        pal.bgClass,
                                                        accentColor.toLowerCase() === pal.hex.toLowerCase()
                                                            ? "scale-110 ring-2 ring-offset-2 ring-primary ring-offset-background shadow-md"
                                                            : "hover:scale-105 opacity-85 hover:opacity-100"
                                                    )}
                                                    title={`${pal.name}: ${pal.description}`}
                                                >
                                                    {accentColor.toLowerCase() === pal.hex.toLowerCase() && (
                                                        <Check className="h-3.5 w-3.5 text-white" />
                                                    )}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* 3. Typography Selection */}
                                    <div className="space-y-2">
                                        <label className="text-[11px] font-semibold text-foreground uppercase tracking-wider block">
                                            Typography
                                        </label>
                                        <div className="grid grid-cols-3 gap-1.5">
                                            {TYPOGRAPHY_OPTIONS.map((opt) => (
                                                <button
                                                    key={opt.id}
                                                    type="button"
                                                    onClick={() => setTypography(opt.id)}
                                                    className={cn(
                                                        "py-1.5 px-2 rounded-lg border text-center text-[11px] transition-all",
                                                        typography === opt.id
                                                            ? "border-primary bg-primary/10 font-bold text-primary"
                                                            : "border-border/60 hover:bg-muted/50 text-foreground"
                                                    )}
                                                >
                                                    {opt.name.split(" ")[0]}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* 4. Density Style */}
                                    <div className="space-y-1.5 pt-1">
                                        <div className="flex items-center justify-between text-[11px]">
                                            <span className="font-medium text-muted-foreground">Density</span>
                                            <div className="flex gap-1">
                                                <button
                                                    type="button"
                                                    onClick={() => setLayoutStyle("compact")}
                                                    className={cn(
                                                        "px-2 py-0.5 rounded text-[10px] font-semibold transition-all",
                                                        layoutStyle === "compact"
                                                            ? "bg-primary text-primary-foreground shadow-xs"
                                                            : "bg-muted text-muted-foreground hover:text-foreground"
                                                    )}
                                                >
                                                    Compact
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => setLayoutStyle("professional")}
                                                    className={cn(
                                                        "px-2 py-0.5 rounded text-[10px] font-semibold transition-all",
                                                        layoutStyle === "professional"
                                                            ? "bg-primary text-primary-foreground shadow-xs"
                                                            : "bg-muted text-muted-foreground hover:text-foreground"
                                                    )}
                                                >
                                                    Balanced
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => setLayoutStyle("creative")}
                                                    className={cn(
                                                        "px-2 py-0.5 rounded text-[10px] font-semibold transition-all",
                                                        layoutStyle === "creative" || layoutStyle === "spacious"
                                                            ? "bg-primary text-primary-foreground shadow-xs"
                                                            : "bg-muted text-muted-foreground hover:text-foreground"
                                                    )}
                                                >
                                                    Spacious
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </PopoverContent>
                            </Popover>

                            {/* Theme Toggle (Light / Dark / System) */}
                            {mounted && (
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-7 w-7 sm:h-8 sm:w-8 rounded-full text-foreground hover:bg-muted"
                                            title="Toggle theme (Light / Dark / System)"
                                        >
                                            {resolvedTheme === "dark" ? (
                                                <Moon className="h-3.5 w-3.5 text-blue-400" />
                                            ) : (
                                                <Sun className="h-3.5 w-3.5 text-amber-500" />
                                            )}
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end" className="w-32 rounded-xl">
                                        <DropdownMenuItem onClick={() => setTheme("light")} className="gap-2 text-xs">
                                            <Sun className="h-3.5 w-3.5 text-amber-500" />
                                            <span>Light</span>
                                            {theme === "light" && <Check className="h-3 w-3 ml-auto text-primary" />}
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => setTheme("dark")} className="gap-2 text-xs">
                                            <Moon className="h-3.5 w-3.5 text-blue-400" />
                                            <span>Dark</span>
                                            {theme === "dark" && <Check className="h-3 w-3 ml-auto text-primary" />}
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => setTheme("system")} className="gap-2 text-xs">
                                            <Monitor className="h-3.5 w-3.5 text-muted-foreground" />
                                            <span>System</span>
                                            {theme === "system" && <Check className="h-3 w-3 ml-auto text-primary" />}
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            )}

                            {/* Verified Resume Quick Link (if available) */}
                            {resumeUrl && (
                                <Button
                                    variant="outline"
                                    size="sm"
                                    asChild
                                    className="h-7 sm:h-8 px-2 sm:px-3 text-xs gap-1.5 rounded-full border-border/80 bg-background/80 hover:bg-muted hidden md:inline-flex"
                                    title="View verified resume"
                                >
                                    <Link href={resumeUrl}>
                                        <FileText className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                                        <span className="font-medium">Resume</span>
                                    </Link>
                                </Button>
                            )}

                            {/* Share Hub & QR Modal Button */}
                            <Button
                                variant="default"
                                size="sm"
                                onClick={() => setShareOpen(true)}
                                className="h-7 sm:h-8 px-2.5 sm:px-3.5 text-xs gap-1.5 rounded-full font-bold shadow-xs"
                                style={{ backgroundColor: accentColor }}
                            >
                                <Share2 className="h-3.5 w-3.5 text-white" />
                                <span className="text-white">Share</span>
                            </Button>

                            {/* Print / Save PDF Button */}
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={handlePrint}
                                className="h-7 w-7 sm:h-8 sm:w-8 rounded-full text-foreground hover:bg-muted hidden sm:inline-flex"
                                title="Print or save as PDF"
                            >
                                <Printer className="h-3.5 w-3.5" />
                            </Button>

                            {/* Minimize / Expand Bar Button */}
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setIsBarMinimized(!isBarMinimized)}
                                className="h-7 w-7 rounded-full text-muted-foreground hover:text-foreground"
                                title={isBarMinimized ? "Expand toolbar" : "Minimize toolbar"}
                            >
                                {isBarMinimized ? (
                                    <ChevronDown className="h-3.5 w-3.5" />
                                ) : (
                                    <ChevronUp className="h-3.5 w-3.5" />
                                )}
                            </Button>
                        </div>
                    </div>
                </div>
            </header>

            {/* Share & QR Code Dialog */}
            <Dialog open={shareOpen} onOpenChange={setShareOpen}>
                <DialogContent className="sm:max-w-md rounded-3xl p-6 bg-background/95 backdrop-blur-2xl border-border/80">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-base font-bold">
                            <QrCode className="h-5 w-5 text-primary" />
                            Share Portfolio Hub
                        </DialogTitle>
                        <DialogDescription className="text-xs">
                            Share {displayName}&apos;s verified public portfolio with recruiters, clients, or on social networks.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 pt-2">
                        {/* 1. Vanity URL Display with 1-Click Copy */}
                        <div className="space-y-1.5">
                            <label className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                                Public Vanity URL
                            </label>
                            <div className="flex items-center gap-2 p-1.5 rounded-xl border border-border/70 bg-muted/40">
                                <span className="font-mono text-xs px-2 truncate flex-1 text-foreground">
                                    {shareLinks.fullUrl}
                                </span>
                                <Button
                                    size="sm"
                                    variant="secondary"
                                    onClick={handleCopy}
                                    className="h-7 px-2.5 text-xs font-bold gap-1 rounded-lg shrink-0"
                                >
                                    {copied ? (
                                        <>
                                            <Check className="h-3 w-3 text-emerald-600" />
                                            <span>Copied</span>
                                        </>
                                    ) : (
                                        <>
                                            <Copy className="h-3 w-3" />
                                            <span>Copy</span>
                                        </>
                                    )}
                                </Button>
                            </div>
                        </div>

                        {/* 2. High-Res QR Code Card */}
                        <div className="flex flex-col sm:flex-row items-center gap-4 p-4 rounded-2xl bg-muted/30 border border-border/60">
                            <div className="bg-white p-2 rounded-xl shadow-xs shrink-0 border border-neutral-200">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                    src={shareLinks.qrCodeUrl}
                                    alt="Portfolio QR Code"
                                    className="h-28 w-28 object-contain"
                                />
                            </div>
                            <div className="space-y-2 text-center sm:text-left">
                                <h4 className="text-xs font-bold text-foreground flex items-center justify-center sm:justify-start gap-1">
                                    <QrCode className="h-3.5 w-3.5 text-primary" />
                                    Mobile QR Code
                                </h4>
                                <p className="text-[11px] text-muted-foreground leading-relaxed">
                                    Recruiters can scan this code during career fairs or directly from a printed resume.
                                </p>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="h-7 text-xs font-semibold gap-1.5 rounded-lg"
                                    asChild
                                >
                                    <a
                                        href={shareLinks.qrCodeUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        download={`portfolio-qr-${slug}.png`}
                                    >
                                        <Download className="h-3 w-3" />
                                        Save QR (PNG)
                                    </a>
                                </Button>
                            </div>
                        </div>

                        {/* 3. Instant Social Network Channels */}
                        <div className="space-y-2">
                            <label className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                                Fast Share Channels
                            </label>
                            <div className="grid grid-cols-3 gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="h-8 text-xs font-semibold rounded-xl"
                                    asChild
                                >
                                    <a href={shareLinks.linkedin} target="_blank" rel="noopener noreferrer">
                                        LinkedIn
                                    </a>
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="h-8 text-xs font-semibold rounded-xl"
                                    asChild
                                >
                                    <a href={shareLinks.twitter} target="_blank" rel="noopener noreferrer">
                                        Twitter / X
                                    </a>
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="h-8 text-xs font-semibold rounded-xl"
                                    asChild
                                >
                                    <a href={shareLinks.whatsapp} target="_blank" rel="noopener noreferrer">
                                        WhatsApp
                                    </a>
                                </Button>
                            </div>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Render Selected Dynamic Template */}
            <main>{renderActiveTemplate()}</main>

            {/* Verified Footer Credit (Print-hidden) */}
            <footer className="py-8 border-t border-border/60 text-center space-y-2 bg-background/50 print:hidden">
                <p className="text-xs text-muted-foreground">
                    Verified candidate portfolio hosted on{" "}
                    <span className="font-semibold text-foreground">ResumeForge</span>
                </p>
                <Button variant="link" size="sm" asChild className="text-xs text-primary font-semibold">
                    <Link href="/?utm_source=portfolio_hub_footer&utm_medium=referral">
                        Build your AI-powered portfolio & ATS resume <span aria-hidden="true">&rarr;</span>
                    </Link>
                </Button>
            </footer>
        </div>
    );
}
