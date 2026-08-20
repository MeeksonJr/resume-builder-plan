import { Resend } from "resend";

let resendClient: Resend | null = null;

export function getResendClient() {
    const apiKey = process.env.RESEND_API_KEY;

    if (!apiKey) {
        throw new Error("RESEND_API_KEY is not configured");
    }

    resendClient ??= new Resend(apiKey);
    return resendClient;
}

export function getResendConfig() {
    return {
        from: process.env.RESEND_FROM_EMAIL || "ResumeForge <onboarding@resend.dev>",
        contactEmail: process.env.CONTACT_EMAIL,
        audienceId: process.env.RESEND_AUDIENCE_ID,
    };
}

export function escapeHtml(value: string) {
    return value
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}
