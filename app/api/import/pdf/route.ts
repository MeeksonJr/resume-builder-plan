import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import pdf from "pdf-parse";

// Helper function to extract sections from LinkedIn PDF text
function parseLinkedInText(text: string) {
    const resumeData = {
        title: "Imported Resume",
        personal_info: {
            full_name: "",
            email: "",
            summary: "",
        },
        work_experience: [],
        education: []
    };

    // Very basic extraction logic (LinkedIn PDFs vary, this is a best-effort start)
    // 1. Name is usually at the top
    const lines = text.split('\n').filter(line => line.trim() !== '');
    if (lines.length > 0) {
        resumeData.personal_info.full_name = lines[0];
    }

    // 2. Find Email (simple regex)
    const emailMatch = text.match(/([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)/);
    if (emailMatch) {
        resumeData.personal_info.email = emailMatch[0];
    }

    // 3. Summary
    const summaryStart = text.indexOf("Summary");
    const expStart = text.indexOf("Experience");

    if (summaryStart !== -1 && expStart !== -1) {
        resumeData.personal_info.summary = text.substring(summaryStart + 7, expStart).trim();
    }

    return resumeData;
}

export async function POST(req: Request) {
    try {
        const supabase = await createClient();
        const {
            data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const formData = await req.formData();
        const file = formData.get("file") as File;

        if (!file) {
            return new NextResponse("No file uploaded", { status: 400 });
        }

        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        // Parse PDF
        const data = await pdf(buffer);
        const text = data.text;

        // Extract Data
        const parsedData = parseLinkedInText(text);

        // Create Resume in DB
        const { data: resume, error: resumeError } = await supabase
            .from("resumes")
            .insert({
                user_id: user.id,
                title: `Imported - ${new Date().toLocaleDateString()}`,
                is_primary: false,
            })
            .select()
            .single();

        if (resumeError) throw resumeError;

        // Insert Personal Info
        if (parsedData.personal_info.full_name || parsedData.personal_info.email) {
            await supabase.from("personal_info").upsert({
                resume_id: resume.id,
                full_name: parsedData.personal_info.full_name,
                email: parsedData.personal_info.email,
                summary: parsedData.personal_info.summary,
            });
        }

        // In a real implementation, we would insert Experience/Education loop here
        // For now, we return the ID so the UI can redirect
        return NextResponse.json({ id: resume.id });

    } catch (error: any) {
        console.error("PDF Import Error:", error);
        return new NextResponse(error.message || "Internal Server Error", { status: 500 });
    }
}
