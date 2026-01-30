import {
  FileUp,
  Sparkles,
  FileText,
  Wand2,
  Download,
  Shield,
  Zap,
  Target,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const features = [
  {
    icon: FileUp,
    title: "Upload & Extract",
    description:
      "Upload your existing PDF resume and let AI extract all your information automatically. No manual data entry required.",
  },
  {
    icon: Sparkles,
    title: "AI Enhancement",
    description:
      "Improve your bullet points, summaries, and descriptions with AI-powered suggestions tailored to your industry.",
  },
  {
    icon: Target,
    title: "Job Tailoring",
    description:
      "Paste a job description and get AI recommendations on how to optimize your resume for that specific role.",
  },
  {
    icon: FileText,
    title: "Multiple Templates",
    description:
      "Choose from professionally designed templates that are clean, modern, and ATS-friendly.",
  },
  {
    icon: Wand2,
    title: "Smart Suggestions",
    description:
      "Get intelligent suggestions for skills, keywords, and improvements based on your target industry.",
  },
  {
    icon: Download,
    title: "Export Anywhere",
    description:
      "Download your resume as PDF or share it with a unique link. Perfect formatting every time.",
  },
  {
    icon: Shield,
    title: "Secure & Private",
    description:
      "Your data is encrypted and secure. We never share your information with third parties.",
  },
  {
    icon: Zap,
    title: "Fast Generation",
    description:
      "Create a professional resume in minutes, not hours. Our AI handles the heavy lifting.",
  },
];

export function Features() {
  return (
    <section className="px-4 py-16 md:py-24" id="features">
      <div className="mx-auto max-w-6xl">
        <div className="text-center">
          <h2 className="text-balance text-3xl font-bold tracking-tight md:text-4xl">
            Everything You Need to Land Your Dream Job
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-pretty text-muted-foreground">
            Our AI-powered platform handles every aspect of resume creation,
            from data extraction to content optimization.
          </p>
        </div>

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((feature) => (
            <Card
              key={feature.title}
              className="border-border/50 bg-card/50 backdrop-blur-sm transition-all hover:border-primary/20 hover:shadow-lg"
            >
              <CardHeader className="pb-2">
                <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                  <feature.icon className="h-6 w-6 text-primary" />
                </div>
                <CardTitle className="text-lg">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  {feature.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
