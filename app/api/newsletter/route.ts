import { NextResponse } from "next/server";
import { z } from "zod";
import { getResendClient, getResendConfig } from "@/lib/resend";

const newsletterSchema = z.object({
    email: z.string().trim().email().max(320),
});

export async function POST(request: Request) {
    const parsed = newsletterSchema.safeParse(await request.json().catch(() => null));

    if (!parsed.success) {
        return NextResponse.json(
            { error: "Enter a valid email address." },
            { status: 400 },
        );
    }

    const { email } = parsed.data;
    const { from, contactEmail, audienceId } = getResendConfig();

    if (!audienceId && !contactEmail) {
        return NextResponse.json(
            { error: "Newsletter delivery is not configured yet." },
            { status: 503 },
        );
    }

    try {
        const resend = getResendClient();

        if (audienceId) {
            const { error } = await resend.contacts.create({
                email,
                audienceId,
                unsubscribed: false,
            });

            if (error && !error.message.toLowerCase().includes("already exists")) {
                console.error("Resend newsletter contact failed", error);
                return NextResponse.json(
                    { error: "We could not subscribe you. Please try again." },
                    { status: 502 },
                );
            }
        } else if (contactEmail) {
            const { error } = await resend.emails.send({
                from,
                to: [contactEmail],
                subject: "New ResumeForge newsletter subscriber",
                text: `New subscriber: ${email}`,
            });

            if (error) {
                console.error("Resend newsletter notification failed", error);
                return NextResponse.json(
                    { error: "We could not subscribe you. Please try again." },
                    { status: 502 },
                );
            }
        }

        return NextResponse.json({ ok: true });
    } catch (error) {
        console.error("Newsletter route failed", error);
        return NextResponse.json(
            { error: "We could not subscribe you. Please try again." },
            { status: 500 },
        );
    }
}
