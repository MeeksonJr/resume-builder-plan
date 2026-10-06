import nodemailer from "nodemailer";
import { Resend } from "resend";
import { generateUniversityVerificationEmailHtml } from "./university-verification-template";

export interface SendVerificationOptions {
  schoolName: string;
  schoolSlug: string;
  code: string;
  recipientEmail: string;
  verifyUrl: string;
  fallbackEmail?: string;
}

export interface EmailDispatchResult {
  success: boolean;
  provider: "gmail_smtp" | "outlook_smtp" | "resend" | "none";
  deliveredTo?: string;
  messageId?: string;
  error?: string;
}

/**
 * Multi-Tier Email Dispatcher:
 * Tier 1: Gmail SMTP (zero domain verification needed, delivers straight to Outlook/Exchange)
 * Tier 2: Microsoft 365 / Outlook SMTP (fallback if configured)
 * Tier 3: Resend API (tertiary fallback)
 */
export async function sendAcademicVerificationEmail(
  options: SendVerificationOptions
): Promise<EmailDispatchResult> {
  const { schoolName, schoolSlug, code, recipientEmail, verifyUrl, fallbackEmail } = options;
  const targetEmail = recipientEmail.trim().toLowerCase();

  const html = generateUniversityVerificationEmailHtml({
    schoolName,
    schoolSlug,
    code,
    recipientEmail: targetEmail,
    verifyUrl,
    expiresInMinutes: 15,
  });

  const subject = `Your ${schoolName} Verification Code: ${code}`;

  // -------------------------------------------------------------
  // TIER 1: Gmail SMTP via Nodemailer (Zero DNS records required)
  // -------------------------------------------------------------
  const gmailUser = process.env.GMAIL_USER?.trim();
  const gmailAppPass = process.env.GMAIL_APP_PASSWORD?.trim().replace(/\s+/g, "");

  if (gmailUser && gmailAppPass) {
    try {
      console.info(`[EMAIL_DISPATCHER] Attempting Tier 1 (Gmail SMTP) -> ${targetEmail}`);

      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: gmailUser,
          pass: gmailAppPass,
        },
      });

      const info = await transporter.sendMail({
        from: `"${process.env.GMAIL_FROM_NAME || "ResumeForge Academic Verification"}" <${gmailUser}>`,
        to: targetEmail,
        replyTo: gmailUser,
        subject,
        html,
      });

      console.info(`[EMAIL_DISPATCHER] Tier 1 (Gmail SMTP) succeeded! ID: ${info.messageId}`);
      return {
        success: true,
        provider: "gmail_smtp",
        deliveredTo: targetEmail,
        messageId: info.messageId,
      };
    } catch (gmailErr: any) {
      console.warn("[EMAIL_DISPATCHER] Tier 1 (Gmail SMTP) failed:", gmailErr.message);
    }
  }

  // -------------------------------------------------------------
  // TIER 2: Outlook / Microsoft 365 SMTP via Nodemailer
  // -------------------------------------------------------------
  const outlookUser = process.env.OUTLOOK_USER?.trim();
  const outlookPass = process.env.OUTLOOK_PASS?.trim();

  if (outlookUser && outlookPass) {
    try {
      console.info(`[EMAIL_DISPATCHER] Attempting Tier 2 (Outlook SMTP) -> ${targetEmail}`);

      const transporter = nodemailer.createTransport({
        host: "smtp-mail.outlook.com",
        port: 587,
        secure: false,
        requireTLS: true,
        auth: {
          user: outlookUser,
          pass: outlookPass,
        },
      });

      const info = await transporter.sendMail({
        from: `"ResumeForge Verification" <${outlookUser}>`,
        to: targetEmail,
        subject,
        html,
      });

      console.info(`[EMAIL_DISPATCHER] Tier 2 (Outlook SMTP) succeeded! ID: ${info.messageId}`);
      return {
        success: true,
        provider: "outlook_smtp",
        deliveredTo: targetEmail,
        messageId: info.messageId,
      };
    } catch (outlookErr: any) {
      console.warn("[EMAIL_DISPATCHER] Tier 2 (Outlook SMTP) failed:", outlookErr.message);
    }
  }

  // -------------------------------------------------------------
  // TIER 3: Resend API (Tertiary Fallback)
  // -------------------------------------------------------------
  const resendKey = process.env.RESEND_API_KEY?.trim();
  if (resendKey) {
    try {
      console.info(`[EMAIL_DISPATCHER] Attempting Tier 3 (Resend API) -> ${targetEmail}`);
      const resend = new Resend(resendKey);
      const fromEmail = process.env.RESEND_FROM_EMAIL || "ResumeForge <onboarding@resend.dev>";

      // Try sending directly to target school email
      const directResult = await resend.emails.send({
        from: fromEmail,
        to: targetEmail,
        subject,
        html,
      });

      if (!directResult.error) {
        console.info(`[EMAIL_DISPATCHER] Tier 3 (Resend direct) succeeded! ID: ${directResult.data?.id}`);
        return {
          success: true,
          provider: "resend",
          deliveredTo: targetEmail,
          messageId: directResult.data?.id,
        };
      }

      console.warn("[EMAIL_DISPATCHER] Resend direct rejected (likely sandbox restriction):", directResult.error.message);

      // If sandbox restriction and we have a verified fallback account email
      if (fallbackEmail) {
        console.info(`[EMAIL_DISPATCHER] Resend sandbox fallback -> ${fallbackEmail}`);
        const fallbackResult = await resend.emails.send({
          from: fromEmail,
          to: fallbackEmail.trim().toLowerCase(),
          subject: `[Verification Fallback] ${subject}`,
          html,
        });

        if (!fallbackResult.error) {
          return {
            success: true,
            provider: "resend",
            deliveredTo: fallbackEmail,
            messageId: fallbackResult.data?.id,
          };
        }
      }
    } catch (resendErr: any) {
      console.warn("[EMAIL_DISPATCHER] Tier 3 (Resend API) failed:", resendErr.message);
    }
  }

  return {
    success: false,
    provider: "none",
    error: "All configured email providers failed to dispatch message.",
  };
}

export interface DigestNotificationItem {
  id?: string;
  title: string;
  description: string;
  time: string;
  type: "email" | "autopilot" | "university" | "background" | "system";
}

export interface SendDigestOptions {
  recipientEmail: string;
  userName?: string;
  notifications: DigestNotificationItem[];
}

/**
 * Dispatches a formatted notification digest email to the user
 */
export async function sendNotificationDigestEmail(
  options: SendDigestOptions
): Promise<EmailDispatchResult> {
  const { recipientEmail, userName = "Member", notifications } = options;
  const targetEmail = recipientEmail.trim().toLowerCase();

  const notificationRowsHtml = notifications
    .map(
      (n) => `
      <tr style="border-bottom: 1px solid #e2e8f0;">
        <td style="padding: 14px 16px;">
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 4px;">
            <strong style="color: #0f172a; font-size: 14px;">${n.title}</strong>
            <span style="font-size: 11px; color: #64748b; background: #f1f5f9; padding: 2px 8px; border-radius: 4px; font-family: monospace;">${n.time}</span>
          </div>
          <p style="margin: 0; font-size: 13px; color: #475569; line-height: 1.5;">${n.description}</p>
        </td>
      </tr>`
    )
    .join("");

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>ResumeForge Activity Digest</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 24px; color: #1e293b;">
  <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);">
    <div style="background-color: #102b2b; padding: 24px 32px; border-bottom: 3px solid #d8f36b;">
      <h1 style="color: #ffffff; margin: 0; font-size: 20px; font-weight: 800; letter-spacing: -0.5px;">ResumeForge Activity Digest</h1>
      <p style="color: #94a3b8; margin: 6px 0 0 0; font-size: 13px;">Latest updates from your autopilot swarms and platform services</p>
    </div>

    <div style="padding: 32px;">
      <p style="font-size: 15px; margin-top: 0; color: #334155;">Hello <strong>${userName}</strong>,</p>
      <p style="font-size: 14px; color: #475569; line-height: 1.6;">Here is a summary of recent events, completed background tasks, and university verification updates on your ResumeForge account:</p>

      <table style="width: 100%; border-collapse: collapse; margin: 24px 0; border: 1px solid #e2e8f0; border-radius: 6px; overflow: hidden;">
        <tbody>
          ${notificationRowsHtml}
        </tbody>
      </table>

      <div style="text-align: center; margin: 32px 0 16px 0;">
        <a href="http://localhost:3000/dashboard" style="background-color: #102b2b; color: #d8f36b; padding: 12px 28px; text-decoration: none; font-weight: 700; font-size: 14px; border-radius: 4px; display: inline-block;">Open Your Dashboard →</a>
      </div>
    </div>

    <div style="background-color: #f8fafc; padding: 16px 32px; border-top: 1px solid #e2e8f0; font-size: 11px; color: #94a3b8; text-align: center;">
      ResumeForge Autonomous Career Platform • Delivered via Nodemailer Multi-Tier Dispatcher
    </div>
  </div>
</body>
</html>`;

  const subject = `ResumeForge Activity Digest: ${notifications.length} New Platform Updates`;

  // TIER 1: Gmail SMTP via Nodemailer
  const gmailUser = process.env.GMAIL_USER?.trim();
  const gmailAppPass = process.env.GMAIL_APP_PASSWORD?.trim().replace(/\s+/g, "");

  if (gmailUser && gmailAppPass) {
    try {
      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: gmailUser,
          pass: gmailAppPass,
        },
      });

      const info = await transporter.sendMail({
        from: `"ResumeForge" <${gmailUser}>`,
        to: targetEmail,
        subject,
        html,
      });

      console.info(`[DIGEST_DISPATCHER] Tier 1 (Gmail SMTP) sent! ID: ${info.messageId}`);
      return {
        success: true,
        provider: "gmail_smtp",
        deliveredTo: targetEmail,
        messageId: info.messageId,
      };
    } catch (gmailErr: any) {
      console.warn("[DIGEST_DISPATCHER] Tier 1 failed:", gmailErr.message);
    }
  }

  // TIER 2: Outlook SMTP
  const outlookUser = process.env.OUTLOOK_USER?.trim();
  const outlookPass = process.env.OUTLOOK_PASSWORD?.trim();

  if (outlookUser && outlookPass) {
    try {
      const transporter = nodemailer.createTransport({
        host: "smtp.office365.com",
        port: 587,
        secure: false,
        auth: {
          user: outlookUser,
          pass: outlookPass,
        },
        tls: { ciphers: "SSLv3" },
      });

      const info = await transporter.sendMail({
        from: `"ResumeForge" <${outlookUser}>`,
        to: targetEmail,
        subject,
        html,
      });

      return {
        success: true,
        provider: "outlook_smtp",
        deliveredTo: targetEmail,
        messageId: info.messageId,
      };
    } catch (outlookErr: any) {
      console.warn("[DIGEST_DISPATCHER] Tier 2 failed:", outlookErr.message);
    }
  }

  // TIER 3: Resend API
  const resendKey = process.env.RESEND_API_KEY?.trim();
  if (resendKey) {
    try {
      const resend = new Resend(resendKey);
      const fromEmail = process.env.RESEND_FROM_EMAIL || "ResumeForge <onboarding@resend.dev>";
      const result = await resend.emails.send({
        from: fromEmail,
        to: targetEmail,
        subject,
        html,
      });

      if (!result.error) {
        return {
          success: true,
          provider: "resend",
          deliveredTo: targetEmail,
          messageId: result.data?.id,
        };
      }
    } catch (resendErr: any) {
      console.warn("[DIGEST_DISPATCHER] Tier 3 failed:", resendErr.message);
    }
  }

  return {
    success: false,
    provider: "none",
    error: "All email providers failed or were not configured.",
  };
}
