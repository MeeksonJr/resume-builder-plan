import { NextResponse } from "next/server";
import { translateResume } from "@/lib/ai";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: Request) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: "Unauthorized. Please log in to translate resumes." }, { status: 401 });
        }

        const { data, targetLanguage } = await req.json();

        if (!data || !targetLanguage) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        const translatedData = await translateResume(data, targetLanguage);

        return NextResponse.json(translatedData);
    } catch (error) {
        console.error("AI Translation Error:", error);
        return NextResponse.json({ error: "Failed to translate resume" }, { status: 500 });
    }
}
