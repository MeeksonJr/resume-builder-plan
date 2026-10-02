/**
 * Beautiful, responsive, institutional HTML email template for University Verification.
 * Designed for maximum deliverability across Outlook, Microsoft 365, Gmail, and Apple Mail.
 */

interface UniversityVerificationEmailOptions {
  schoolName: string;
  schoolSlug: string;
  code: string;
  recipientEmail: string;
  verifyUrl: string;
  expiresInMinutes?: number;
}

export function generateUniversityVerificationEmailHtml({
  schoolName,
  schoolSlug,
  code,
  recipientEmail,
  verifyUrl,
  expiresInMinutes = 15,
}: UniversityVerificationEmailOptions): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${schoolName} Verification - ResumeForge</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      background-color: #f3f6f4;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      color: #102b2b;
      -webkit-font-smoothing: antialiased;
    }
    .wrapper {
      width: 100%;
      table-layout: fixed;
      background-color: #f3f6f4;
      padding: 40px 16px;
    }
    .main-card {
      max-width: 580px;
      margin: 0 auto;
      background-color: #ffffff;
      border: 1px solid #d4dfd9;
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 4px 20px rgba(16, 43, 43, 0.06);
    }
    .header-banner {
      background-color: #102b2b;
      padding: 32px 32px 28px;
      text-align: center;
      color: #ffffff;
      border-bottom: 4px solid #0d8274;
    }
    .badge-pill {
      display: inline-block;
      background-color: rgba(216, 243, 107, 0.18);
      border: 1px solid #d8f36b;
      color: #d8f36b;
      font-size: 11px;
      font-weight: 800;
      letter-spacing: 1px;
      text-transform: uppercase;
      padding: 4px 12px;
      border-radius: 999px;
      margin-bottom: 12px;
    }
    .header-title {
      margin: 0 0 6px;
      font-size: 24px;
      font-weight: 900;
      color: #f8faf8;
      letter-spacing: -0.5px;
    }
    .header-sub {
      margin: 0;
      font-size: 13px;
      color: #9cb8b0;
    }
    .content-body {
      padding: 36px 32px;
    }
    .greeting {
      font-size: 16px;
      line-height: 1.5;
      color: #24423c;
      margin: 0 0 16px;
    }
    .code-container {
      background: linear-gradient(135deg, #f7faf8 0%, #edf4f1 100%);
      border: 2px dashed #0d8274;
      border-radius: 10px;
      padding: 24px 16px;
      text-align: center;
      margin: 28px 0;
    }
    .code-label {
      font-size: 11px;
      text-transform: uppercase;
      font-weight: 800;
      letter-spacing: 1.5px;
      color: #52716a;
      margin-bottom: 8px;
    }
    .otp-code {
      font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace;
      font-size: 38px;
      font-weight: 900;
      letter-spacing: 8px;
      color: #0d8274;
      line-height: 1.2;
      display: inline-block;
      padding: 4px 0 0 8px;
    }
    .expiry-note {
      font-size: 11px;
      color: #718096;
      margin-top: 10px;
    }
    .cta-container {
      text-align: center;
      margin: 32px 0 24px;
    }
    .btn-verify {
      display: inline-block;
      background-color: #102b2b;
      color: #d8f36b !important;
      text-decoration: none;
      font-weight: 800;
      font-size: 14px;
      padding: 14px 32px;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(16, 43, 43, 0.2);
    }
    .outlook-tip {
      background-color: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      padding: 16px;
      margin-top: 28px;
    }
    .outlook-tip-title {
      font-size: 12px;
      font-weight: 700;
      color: #2b6cb0;
      margin: 0 0 6px;
    }
    .outlook-tip-text {
      font-size: 11px;
      line-height: 1.5;
      color: #4a5568;
      margin: 0;
    }
    .footer {
      background-color: #f7faf8;
      padding: 24px 32px;
      border-top: 1px solid #e2ece7;
      text-align: center;
      font-size: 11px;
      color: #718096;
      line-height: 1.6;
    }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="main-card">
      <!-- Header Banner -->
      <div class="header-banner">
        <div class="badge-pill">FERPA Verified Portal</div>
        <h1 class="header-title">${schoolName}</h1>
        <p class="header-sub">ResumeForge Student Career Network</p>
      </div>

      <!-- Main Content -->
      <div class="content-body">
        <p class="greeting">
          Hello Monarch Scholar,
        </p>
        <p class="greeting" style="font-size: 14px; color: #4a5568;">
          We received a request to verify your official institutional status for <strong>${schoolName}</strong> on ResumeForge using your academic email <strong>${recipientEmail}</strong>.
        </p>

        <!-- OTP Code Box -->
        <div class="code-container">
          <div class="code-label">One-Time Verification Code</div>
          <div class="otp-code">${code}</div>
          <div class="expiry-note">Expires in ${expiresInMinutes} minutes &bull; Single-use only</div>
        </div>

        <!-- 1-Click Verification Button -->
        <div class="cta-container">
          <a href="${verifyUrl}" class="btn-verify" target="_blank">
            ⚡ Verify Student Status with 1-Click
          </a>
        </div>

        <!-- Outlook Guidance Callout -->
        <div class="outlook-tip">
          <div class="outlook-tip-title">📬 Using University Outlook or Microsoft 365?</div>
          <p class="outlook-tip-text">
            Campus IT security filters frequently organize automated emails into the <strong>Other</strong> inbox tab, <strong>Junk Email</strong>, or Microsoft Defender Quarantine. Add <code>onboarding@resend.dev</code> to your Safe Senders list to ensure seamless delivery of career fair notifications.
          </p>
        </div>
      </div>

      <!-- Footer -->
      <div class="footer">
        <p style="margin: 0 0 6px;">
          This verification confirms your student directory listing and unlocks your campus portal at <strong>/dashboard/portal/${schoolSlug}</strong>.
        </p>
        <p style="margin: 0;">
          If you did not request this verification, no action is needed and your account remains secure.
        </p>
      </div>
    </div>
  </div>
</body>
</html>
`;
}
