"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
    Loader2,
    Building2,
    Check,
    TrendingUp,
    AlertCircle,
    Lightbulb,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface IndustryResult {
    customizedResume: any;
    industryKeywords: string[];
    formattingTips: string[];
    industryInsights: {
        trends: string[];
        valuedSkills: string[];
        commonMistakes: string[];
    };
    changes: {
        section: string;
        change: string;
        reason: string;
    }[];
}

interface IndustrySelectorProps {
    resumeData: any;
    onApply: (customizedResume: any) => void;
}

const INDUSTRIES = [
    { value: "technology", label: "Technology / Software", icon: "💻" },
    { value: "finance", label: "Finance / Banking", icon: "💰" },
    { value: "healthcare", label: "Healthcare / Medical", icon: "🏥" },
    { value: "consulting", label: "Consulting", icon: "📊" },
    { value: "marketing", label: "Marketing / Advertising", icon: "📣" },
    { value: "education", label: "Education", icon: "📚" },
    { value: "manufacturing", label: "Manufacturing", icon: "🏭" },
    { value: "retail", label: "Retail / E-commerce", icon: "🛒" },
    { value: "legal", label: "Legal", icon: "⚖️" },
    { value: "government", label: "Government / Public Sector", icon: "🏛️" },
    { value: "nonprofit", label: "Non-Profit", icon: "❤️" },
    { value: "media", label: "Media / Entertainment", icon: "🎬" },
    { value: "realestate", label: "Real Estate", icon: "🏠" },
    { value: "energy", label: "Energy / Utilities", icon: "⚡" },
    { value: "other", label: "Other", icon: "📋" },
];

type CompanySize = "startup" | "mid" | "enterprise";

export function IndustrySelector({
    resumeData,
    onApply,
}: IndustrySelectorProps) {
    const [selectedIndustry, setSelectedIndustry] = useState("");
    const [customIndustry, setCustomIndustry] = useState("");
    const [subIndustry, setSubIndustry] = useState("");
    const [companySize, setCompanySize] = useState<CompanySize>("mid");
    const [targetRole, setTargetRole] = useState("");

    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<IndustryResult | null>(null);
    const [error, setError] = useState<string | null>(null);

    const getIndustryLabel = () => {
        if (selectedIndustry === "other") return customIndustry;
        return INDUSTRIES.find((i) => i.value === selectedIndustry)?.label || "";
    };

    const handleCustomize = async () => {
        const industry = selectedIndustry === "other" ? customIndustry : getIndustryLabel();

        if (!industry) {
            setError("Please select an industry");
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const response = await fetch("/api/ai/industry-customize", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    resumeData,
                    targetIndustry: industry,
                    subIndustry: subIndustry || undefined,
                    companySize,
                    role: targetRole || undefined,
                }),
            });

            if (!response.ok) {
                throw new Error("Failed to customize for industry");
            }

            const data = await response.json();
            setResult(data);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleApply = () => {
        if (result) {
            onApply(result.customizedResume);
            setResult(null);
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Building2 className="h-5 w-5 text-blue-500" />
                    Industry Customization
                </CardTitle>
                <CardDescription>
                    Optimize your resume for a specific industry
                </CardDescription>
            </CardHeader>
            <CardContent>
                <ScrollArea className="max-h-[500px]">
                    <div className="space-y-4 pr-4">
                        {!result ? (
                            <>
                                {/* Industry Selection */}
                                <div className="space-y-2">
                                    <Label>Target Industry</Label>
                                    <Select value={selectedIndustry} onValueChange={setSelectedIndustry}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select an industry..." />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {INDUSTRIES.map((industry) => (
                                                <SelectItem key={industry.value} value={industry.value}>
                                                    <span className="flex items-center gap-2">
                                                        <span>{industry.icon}</span>
                                                        {industry.label}
                                                    </span>
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                {selectedIndustry === "other" && (
                                    <div className="space-y-2">
                                        <Label>Specify Industry</Label>
                                        <Input
                                            placeholder="e.g., Aerospace, Biotechnology..."
                                            value={customIndustry}
                                            onChange={(e) => setCustomIndustry(e.target.value)}
                                        />
                                    </div>
                                )}

                                {/* Sub-industry */}
                                <div className="space-y-2">
                                    <Label>Sub-Industry (Optional)</Label>
                                    <Input
                                        placeholder="e.g., Fintech, SaaS, Mobile Apps..."
                                        value={subIndustry}
                                        onChange={(e) => setSubIndustry(e.target.value)}
                                    />
                                </div>

                                {/* Company Size */}
                                <div className="space-y-2">
                                    <Label>Target Company Size</Label>
                                    <RadioGroup
                                        value={companySize}
                                        onValueChange={(v) => setCompanySize(v as CompanySize)}
                                        className="flex gap-4"
                                    >
                                        <div className="flex items-center space-x-2">
                                            <RadioGroupItem value="startup" id="startup" />
                                            <Label htmlFor="startup" className="cursor-pointer">Startup</Label>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <RadioGroupItem value="mid" id="mid" />
                                            <Label htmlFor="mid" className="cursor-pointer">Mid-size</Label>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <RadioGroupItem value="enterprise" id="enterprise" />
                                            <Label htmlFor="enterprise" className="cursor-pointer">Enterprise</Label>
                                        </div>
                                    </RadioGroup>
                                </div>

                                {/* Target Role */}
                                <div className="space-y-2">
                                    <Label>Target Role (Optional)</Label>
                                    <Input
                                        placeholder="e.g., Product Manager, Data Scientist..."
                                        value={targetRole}
                                        onChange={(e) => setTargetRole(e.target.value)}
                                    />
                                </div>

                                {error && <p className="text-sm text-red-500">{error}</p>}

                                <Button
                                    onClick={handleCustomize}
                                    disabled={loading || (!selectedIndustry || (selectedIndustry === "other" && !customIndustry))}
                                    className="w-full gap-2"
                                >
                                    {loading ? (
                                        <>
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                            Customizing...
                                        </>
                                    ) : (
                                        <>
                                            <Building2 className="h-4 w-4" />
                                            Customize for Industry
                                        </>
                                    )}
                                </Button>
                            </>
                        ) : (
                            <div className="space-y-5">
                                {/* Industry Keywords */}
                                <div>
                                    <h4 className="font-medium text-sm flex items-center gap-2 mb-2">
                                        <TrendingUp className="h-4 w-4 text-green-500" />
                                        Industry Keywords Added
                                    </h4>
                                    <div className="flex flex-wrap gap-1">
                                        {result.industryKeywords.map((keyword, i) => (
                                            <Badge key={i} variant="secondary" className="bg-green-500/20 text-green-700 dark:text-green-300 border border-green-500/30">
                                                {keyword}
                                            </Badge>
                                        ))}
                                    </div>
                                </div>

                                {/* Industry Insights */}
                                <div className="space-y-3">
                                    <h4 className="font-medium text-sm flex items-center gap-2">
                                        <Lightbulb className="h-4 w-4 text-yellow-500" />
                                        Industry Insights
                                    </h4>

                                    <div className="bg-blue-500/10 dark:bg-blue-500/20 p-3 rounded-lg border border-blue-500/20">
                                        <p className="text-xs font-medium text-blue-700 dark:text-blue-300 mb-1">Trends</p>
                                        <ul className="text-sm space-y-1 text-foreground">
                                            {result.industryInsights.trends.map((trend, i) => (
                                                <li key={i}>• {trend}</li>
                                            ))}
                                        </ul>
                                    </div>

                                    <div className="bg-green-500/10 dark:bg-green-500/20 p-3 rounded-lg border border-green-500/20">
                                        <p className="text-xs font-medium text-green-700 dark:text-green-300 mb-1">Most Valued Skills</p>
                                        <div className="flex flex-wrap gap-1">
                                            {result.industryInsights.valuedSkills.map((skill, i) => (
                                                <Badge key={i} variant="outline" className="text-xs border-green-500/30 text-foreground">
                                                    {skill}
                                                </Badge>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="bg-red-500/10 dark:bg-red-500/20 p-3 rounded-lg border border-red-500/20">
                                        <p className="text-xs font-medium text-red-700 dark:text-red-300 mb-1">Common Mistakes to Avoid</p>
                                        <ul className="text-sm space-y-1 text-foreground">
                                            {result.industryInsights.commonMistakes.map((mistake, i) => (
                                                <li key={i} className="flex items-start gap-1">
                                                    <AlertCircle className="h-3 w-3 text-red-500 mt-0.5 flex-shrink-0" />
                                                    {mistake}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>

                                {/* Formatting Tips */}
                                {result.formattingTips.length > 0 && (
                                    <div>
                                        <h4 className="font-medium text-sm mb-2">Formatting Tips</h4>
                                        <ul className="text-sm space-y-1 text-muted-foreground">
                                            {result.formattingTips.map((tip, i) => (
                                                <li key={i}>• {tip}</li>
                                            ))}
                                        </ul>
                                    </div>
                                )}

                                {/* Changes Made */}
                                {result.changes.length > 0 && (
                                    <div>
                                        <h4 className="font-medium text-sm mb-2">
                                            Changes Made ({result.changes.length})
                                        </h4>
                                        <div className="space-y-2">
                                            {result.changes.slice(0, 5).map((change, i) => (
                                                <div key={i} className="text-sm bg-muted/50 p-2 rounded">
                                                    <Badge variant="outline" className="mb-1">
                                                        {change.section}
                                                    </Badge>
                                                    <p>{change.change}</p>
                                                    <p className="text-xs text-muted-foreground mt-1">
                                                        {change.reason}
                                                    </p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                <div className="flex gap-2 pt-2">
                                    <Button
                                        variant="outline"
                                        onClick={() => setResult(null)}
                                        className="flex-1"
                                    >
                                        Try Different Industry
                                    </Button>
                                    <Button onClick={handleApply} className="flex-1 gap-2">
                                        <Check className="h-4 w-4" />
                                        Apply Changes
                                    </Button>
                                </div>
                            </div>
                        )}
                    </div>
                </ScrollArea>
            </CardContent>
        </Card>
    );
}
