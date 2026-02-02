"use client";

import { motion } from "framer-motion";
import { Bot, Mic, FileText, BarChart, Globe, Zap } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const features = [
    {
        title: "AI Resume Writer",
        description: "Generate professional bullet points and summaries tailored to your role in seconds.",
        icon: Bot,
        color: "text-blue-500",
    },
    {
        title: "Voice Interview Coach",
        description: "Practice with our realistic AI interviewer. Speak naturally and get instant feedback.",
        icon: Mic,
        color: "text-purple-500",
    },
    {
        title: "ATS Optimization",
        description: "Ensure your resume passes the bots with built-in keyword analysis and scoring.",
        icon: BarChart,
        color: "text-green-500",
    },
    {
        title: "Public Portfolios",
        description: "Showcase your work with a beautiful, shared link. Perfect for networking.",
        icon: Globe,
        color: "text-orange-500",
    },
    {
        title: "Cover Letter Generator",
        description: "Create personalized cover letters for every job application instantly.",
        icon: FileText,
        color: "text-pink-500",
    },
    {
        title: "Real-time Feedback",
        description: "Get detailed insights on your interview performance, tone, and content.",
        icon: Zap,
        color: "text-yellow-500",
    },
];

const container = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1,
        },
    },
};

const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
};

export function FeaturesSection() {
    return (
        <section className="py-24 bg-muted/50" id="features">
            <div className="container mx-auto px-4">
                <div className="text-center mb-16">
                    <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-4">
                        Everything you need to get hired
                    </h2>
                    <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                        Our platform combines advanced AI with proven career strategies to give you the competitive edge.
                    </p>
                </div>

                <motion.div
                    variants={container}
                    initial="hidden"
                    whileInView="show"
                    viewport={{ once: true, margin: "-100px" }}
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
                >
                    {features.map((feature, index) => (
                        <motion.div key={index} variants={item}>
                            <Card className="h-full border-none shadow-sm hover:shadow-md transition-shadow">
                                <CardHeader>
                                    <div className={`w-12 h-12 rounded-lg bg-background flex items-center justify-center mb-4 shadow-sm ${feature.color}`}>
                                        <feature.icon className="h-6 w-6" />
                                    </div>
                                    <CardTitle className="text-xl">{feature.title}</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-muted-foreground">
                                        {feature.description}
                                    </p>
                                </CardContent>
                            </Card>
                        </motion.div>
                    ))}
                </motion.div>
            </div>
        </section>
    );
}
