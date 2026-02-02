
export default function AboutPage() {
    return (
        <div className="py-24 bg-background">
            <div className="container mx-auto px-4 max-w-4xl">
                <h1 className="text-4xl font-bold mb-8">About ResumeBuilder</h1>

                <div className="prose prose-lg dark:prose-invert max-w-none">
                    <p className="lead text-xl text-muted-foreground mb-8">
                        We are on a mission to democratize career success. By combining advanced AI with proven hiring strategies, we help job seekers land their dream roles faster.
                    </p>

                    <h2 className="text-2xl font-semibold mt-12 mb-4">Our Story</h2>
                    <p>
                        Founded in 2024, ResumeBuilder started with a simple observation: the hiring process is broken.
                        Great candidates are often filtered out by ATS bots or struggle to articulate their value in interviews.
                    </p>
                    <p>
                        We built a platform that levels the playing field. From parsing existing resumes to simulating real-time voice interviews,
                        our tools are designed to give every candidate the confidence and polish of a professional career coach.
                    </p>

                    <h2 className="text-2xl font-semibold mt-12 mb-4">Our Values</h2>
                    <ul className="list-disc pl-6 space-y-2">
                        <li><strong>Accessibility:</strong> Career tools should be affordable and easy to use.</li>
                        <li><strong>Privacy:</strong> Your career data is yours. We dont sell it.</li>
                        <li><strong>Innovation:</strong> We constantly push the boundaries of what AI can do for careers.</li>
                    </ul>
                </div>
            </div>
        </div>
    );
}
