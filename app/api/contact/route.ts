import { NextResponse } from "next/server";
import { z } from "zod";
import { escapeHtml, getResendClient, getResendConfig } from "@/lib/resend";

const contactSchema = z.object({
    name: z.string().trim().min(2).max(100),
    email: z.string().trim().email().max(320),
    subject: z.string().trim().min(2).max(160),
    message: z.string().trim().min(10).max(5000),
});

export async function POST(request: Request) {
    const parsed = contactSchema.safeParse(await request.json().catch(() => null));

    if (!parsed.success) {
        return NextResponse.json(
            { error: "Please check your name, email, subject, and message." },
            { status: 400 },
        );
    }

    const { name, email, subject, message } = parsed.data;
    const { from, contactEmail } = getResendConfig();

    if (!contactEmail) {
        return NextResponse.json(
            { error: "Contact delivery is not configured yet." },
            { status: 503 },
        );
    }

    try {
        const { error } = await getResendClient().emails.send({
            from,
            to: [contactEmail],
            replyTo: email,
            subject: `[ResumeForge contact] ${subject}`,
            html: `
                <h2>New ResumeForge contact message</h2>
                <p><strong>From:</strong> ${escapeHtml(name)} &lt;${escapeHtml(email)}&gt;</p>
                <p><strong>Subject:</strong> ${escapeHtml(subject)}</p>
                <hr />
                <p>${escapeHtml(message).replaceAll("\n", "<br />")}</p>
            `,
        });

        if (error) {
            console.error("Resend contact delivery failed", error);
            return NextResponse.json(
                { error: "We could not send your message. Please try again." },
                { status: 502 },
            );
        }

        return NextResponse.json({ ok: true });
    } catch (error) {
        console.error("Contact route failed", error);
        return NextResponse.json(
            { error: "We could not send your message. Please try again." },
            { status: 500 },
        );
    }
}
