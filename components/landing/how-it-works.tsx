import { Badge } from "@/components/ui/badge";

const steps = [
  {
    step: "01",
    title: "Upload or Start Fresh",
    description:
      "Upload your existing resume (PDF) to auto-extract all your data, or start from scratch with our guided editor.",
  },
  {
    step: "02",
    title: "Edit & Enhance",
    description:
      "Review and edit your information using our intuitive editor. Use AI to improve your content and add missing sections.",
  },
  {
    step: "03",
    title: "Customize & Style",
    description:
      "Choose from professional templates, adjust colors and fonts, and make it uniquely yours.",
  },
  {
    step: "04",
    title: "Export & Apply",
    description:
      "Download your polished resume as a PDF or share it with a link. Track views and applications.",
  },
];

export function HowItWorks() {
  return (
    <section className="bg-muted/30 px-4 py-16 md:py-24" id="how-it-works">
      <div className="mx-auto max-w-5xl">
        <div className="text-center">
          <Badge variant="outline" className="mb-4">
            Simple Process
          </Badge>
          <h2 className="text-balance text-3xl font-bold tracking-tight md:text-4xl">
            Four Steps to Your Perfect Resume
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-pretty text-muted-foreground">
            Creating a professional resume has never been easier. Follow our
            simple process to get started.
          </p>
        </div>

        <div className="mt-12 grid gap-8 md:grid-cols-2">
          {steps.map((item, index) => (
            <div key={item.step} className="relative flex gap-6">
              <div className="flex flex-col items-center">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary text-lg font-bold text-primary-foreground">
                  {item.step}
                </div>
                {index < steps.length - 1 && (
                  <div className="mt-2 h-full w-px bg-border md:hidden" />
                )}
              </div>
              <div className="pb-8 md:pb-0">
                <h3 className="text-xl font-semibold">{item.title}</h3>
                <p className="mt-2 text-muted-foreground">{item.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
