import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { z } from "zod";

const urlSchema = z.object({
    url: z.string().url(),
});

export async function POST(req: Request) {
    try {
        const supabase = await createClient();
        const {
            data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const json = await req.json();
        const { url } = urlSchema.parse(json);

        // Fetch HTML
        const response = await fetch(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)'
            }
        });

        if (!response.ok) {
            throw new Error("Failed to fetch profile");
        }

        const html = await response.text();

        // Basic Extraction using Regex (No cheerio needed for simple OG tags)
        const titleMatch = html.match(/<meta property="og:title" content="([^"]*)"/);
        const descMatch = html.match(/<meta property="og:description" content="([^"]*)"/);
        const imageMatch = html.match(/<meta property="og:image" content="([^"]*)"/);

        const title = titleMatch ? titleMatch[1] : "Imported Profile";
        const summary = descMatch ? descMatch[1] : "";

        // Create Resume
        const { data: resume, error: resumeError } = await supabase
            .from("resumes")
            .insert({
                user_id: user.id,
                title: `Imported from URL - ${new Date().toLocaleDateString()}`,
                is_primary: false,
            })
            .select()
            .single();

        if (resumeError) throw resumeError;

        // Save extracted info
        // For now, we put the summary in personal_info
        await supabase.from("personal_info").upsert({
            resume_id: resume.id,
            summary: `Imported from ${url}\n\n${summary}`,
            full_name: title.split(" | ")[0] || "Unknown User", // Approximate name extraction
            website: url
        });

        return NextResponse.json({ id: resume.id });

    } catch (error: any) {
        console.error("URL Import Error:", error);
        return new NextResponse(error.message || "Internal Server Error", { status: 500 });
    }
}
