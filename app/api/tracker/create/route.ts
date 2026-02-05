import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { z } from "zod";

const createApplicationSchema = z.object({
    company: z.string().min(1),
    role: z.string().min(1),
    url: z.string().url().optional().or(z.literal("")),
    location: z.string().optional(),
    salary_range: z.string().optional(),
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
        const body = createApplicationSchema.parse(json);

        const { data: application, error } = await supabase
            .from("applications")
            .insert({
                user_id: user.id,
                company: body.company,
                role: body.role,
                url: body.url || null,
                location: body.location || null,
                salary_range: body.salary_range || null,
                status: "applied", // Default status
            })
            .select()
            .single();

        if (error) {
            return new NextResponse(error.message, { status: 500 });
        }

        return NextResponse.json(application);
    } catch (error) {
        if (error instanceof z.ZodError) {
            return new NextResponse(JSON.stringify(error.issues), { status: 422 });
        }

        return new NextResponse("Internal Server Error", { status: 500 });
    }
}
