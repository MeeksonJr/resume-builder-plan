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
                                <!doctype html>
                                <html lang="en">
                                    <head>
                                        <meta charset="utf-8" />
                                        <meta name="viewport" content="width=device-width,initial-scale=1" />
                                        <title>New ResumeForge contact message</title>
                                    </head>
                                    <body style="margin:0;background:#e9eee8;color:#102b2b;font-family:Arial,Helvetica,sans-serif;">
                                        <div style="max-width:640px;margin:0 auto;padding:32px 16px;">
                                            <div style="overflow:hidden;border:1px solid #c9d8d0;background:#f8f4ec;box-shadow:12px 14px 0 rgba(16,43,43,.10);">
                                                <div style="padding:28px 32px;background:#102b2b;color:#f8f4ec;">
                                                    <div style="display:inline-block;padding:8px 10px;background:#d8f36b;color:#102b2b;font-size:15px;font-weight:800;letter-spacing:1px;">R</div>
                                                    <div style="margin-top:18px;color:#d8f36b;font-size:11px;font-weight:700;letter-spacing:2px;text-transform:uppercase;">ResumeForge / Contact</div>
                                                    <h1 style="margin:8px 0 0;font-size:28px;line-height:1.1;letter-spacing:-.5px;">A new message is waiting.</h1>
                                                </div>
                                                <div style="padding:32px;">
                                                    <p style="margin:0 0 22px;color:#52716a;font-size:15px;line-height:1.7;">Someone reached out through the ResumeForge contact page.</p>
                                                    <div style="border:1px solid #c9d8d0;background:#ffffff;padding:20px;">
                                                        <p style="margin:0 0 12px;color:#78928a;font-size:11px;font-weight:700;letter-spacing:1px;text-transform:uppercase;">Message details</p>
                                                        <table role="presentation" style="width:100%;border-collapse:collapse;">
                                                            <tr><td style="padding:7px 0;color:#78928a;font-size:12px;width:90px;">NAME</td><td style="padding:7px 0;color:#102b2b;font-size:14px;font-weight:700;">${escapeHtml(name)}</td></tr>
                                                            <tr><td style="padding:7px 0;color:#78928a;font-size:12px;">EMAIL</td><td style="padding:7px 0;font-size:14px;"><a href="mailto:${escapeHtml(email)}" style="color:#0d8274;font-weight:700;text-decoration:none;">${escapeHtml(email)}</a></td></tr>
                                                            <tr><td style="padding:7px 0;color:#78928a;font-size:12px;">TOPIC</td><td style="padding:7px 0;color:#102b2b;font-size:14px;font-weight:700;">${escapeHtml(subject)}</td></tr>
                                                        </table>
                                                    </div>
                                                    <div style="margin-top:20px;border-left:4px solid #0d8274;background:#dbe8df;padding:20px;">
                                                        <p style="margin:0 0 8px;color:#52716a;font-size:11px;font-weight:700;letter-spacing:1px;text-transform:uppercase;">Message</p>
                                                        <p style="margin:0;color:#365950;font-size:15px;line-height:1.7;white-space:pre-wrap;">${escapeHtml(message)}</p>
                                                    </div>
                                                    <a href="mailto:${escapeHtml(email)}?subject=${encodeURIComponent(`Re: ${subject}`)}" style="display:inline-block;margin-top:24px;padding:13px 20px;background:#102b2b;color:#f8f4ec;font-size:14px;font-weight:700;text-decoration:none;">Reply to ${escapeHtml(name)} &rarr;</a>
                                                </div>
                                                <div style="border-top:1px solid #c9d8d0;padding:18px 32px;color:#78928a;font-size:11px;line-height:1.6;">Sent from the ResumeForge contact form.<br />Reply directly to this message to continue the conversation.</div>
                                            </div>
                                        </div>
                                    </body>
                                </html>
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
