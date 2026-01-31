import { NextResponse } from "next/server";
import { translateResume } from "@/lib/ai";

export async function POST(req: Request) {
    try {
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
