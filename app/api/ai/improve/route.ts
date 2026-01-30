import { improveText } from "@/lib/ai";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const requestSchema = z.object({
    text: z.string().min(1),
    type: z.enum(["bullet", "summary", "description"]),
    context: z.string().optional(),
});

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { text, type, context } = requestSchema.parse(body);

        const improved = await improveText(text, type, context);

        return NextResponse.json({ improved });
    } catch (error) {
        console.error("AI Improvement Error:", error);

        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { error: "Invalid request parameters", details: error.errors },
                { status: 400 }
            );
        }

        return NextResponse.json(
            {
                error: "Failed to improve text",
                details: error instanceof Error ? error.message : String(error),
                stack: error instanceof Error ? error.stack : undefined
            },
            { status: 500 }
        );
    }
}
