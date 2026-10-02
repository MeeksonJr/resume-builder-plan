/**
 * Premium HTML Email Templates for Supabase Auth.
 * These can be copied directly into Supabase Dashboard -> Authentication -> Email Templates:
 * 1. Confirm signup: https://supabase.com/dashboard/project/jlrteuwzpdxpniedzblx/auth/templates/confirm-sign-up
 * 2. Reset password: https://supabase.com/dashboard/project/jlrteuwzpdxpniedzblx/auth/templates/reset-password
 * 3. Magic link: https://supabase.com/dashboard/project/jlrteuwzpdxpniedzblx/auth/templates/magic-link
 * 
 * Supports Supabase template variables:
 * - {{ .ConfirmationURL }} : The link to confirm email / reset password
 * - {{ .Token }}           : The 6-digit confirmation code
 * - {{ .Email }}           : Recipient email address
 * - {{ .SiteURL }}         : Base URL of the website
 */

export const SUPABASE_CONFIRM_SIGNUP_TEMPLATE = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Confirm Your Email - ResumeForge</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      background-color: #081414;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      -webkit-font-smoothing: antialiased;
    }
    table {
      border-spacing: 0;
      width: 100%;
    }
    .wrapper {
      width: 100%;
      table-layout: fixed;
      background-color: #081414;
      padding: 36px 12px 60px;
    }
    .main {
      background-color: #0d1f1f;
      margin: 0 auto;
      width: 100%;
      max-width: 540px;
      border: 1px solid #1c3d38;
      border-radius: 20px;
      box-shadow: 0 20px 35px -5px rgba(0, 0, 0, 0.5);
      overflow: hidden;
    }
    .header {
      padding: 38px 24px 30px;
      text-align: center;
      background: linear-gradient(180deg, #102b2b 0%, #0d1f1f 100%);
      border-bottom: 2px solid #0d8274;
    }
    .brand-icon-box {
      background: linear-gradient(135deg, #0d8274 0%, #085a50 100%);
      width: 48px;
      height: 48px;
      border-radius: 12px;
      margin: 0 auto 14px;
      text-align: center;
      line-height: 48px;
      border: 1px solid #20b2aa;
    }
    .brand-icon-text {
      color: #d8f36b;
      font-size: 22px;
      font-weight: 900;
      letter-spacing: -0.5px;
    }
    .brand-name {
      color: #f8fafc;
      font-size: 22px;
      font-weight: 800;
      letter-spacing: -0.025em;
      margin: 0;
    }
    .brand-tagline {
      color: #8bbcb2;
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.12em;
      margin-top: 4px;
    }
    .badge-pill {
      display: inline-block;
      background-color: rgba(216, 243, 107, 0.12);
      border: 1px solid #d8f36b;
      color: #d8f36b;
      font-size: 10px;
      font-weight: 800;
      letter-spacing: 1px;
      text-transform: uppercase;
      padding: 3px 12px;
      border-radius: 999px;
      margin-top: 14px;
    }
    .content {
      padding: 36px 36px 28px;
      color: #cbd5e1;
    }
    .title {
      color: #ffffff;
      font-size: 22px;
      font-weight: 800;
      margin: 0 0 12px;
      letter-spacing: -0.02em;
    }
    .text {
      font-size: 14px;
      line-height: 1.6;
      margin-bottom: 20px;
      color: #94a3b8;
    }
    .btn-container {
      text-align: center;
      margin: 28px 0;
    }
    .button {
      display: inline-block;
      padding: 15px 36px;
      background: linear-gradient(135deg, #0d8274 0%, #095950 100%);
      color: #d8f36b !important;
      text-decoration: none;
      border-radius: 10px;
      font-weight: 800;
      font-size: 15px;
      box-shadow: 0 8px 20px -3px rgba(13, 130, 116, 0.4);
      border: 1px solid #20b2aa;
    }
    .token-box {
      background-color: rgba(16, 43, 43, 0.6);
      border: 1.5px dashed #0d8274;
      border-radius: 10px;
      padding: 16px;
      margin: 20px 0;
      text-align: center;
    }
    .token-label {
      font-size: 10px;
      font-weight: 800;
      letter-spacing: 1.5px;
      text-transform: uppercase;
      color: #8bbcb2;
      margin-bottom: 4px;
    }
    .token-value {
      font-family: 'SFMono-Regular', Consolas, Menlo, monospace;
      font-size: 26px;
      font-weight: 900;
      letter-spacing: 6px;
      color: #d8f36b;
      line-height: 1.2;
    }
    .footer {
      text-align: center;
      padding: 24px 20px;
      color: #64748b;
      font-size: 11px;
      font-weight: 500;
      border-top: 1px solid #1c3d38;
      background-color: #0a1919;
    }
    .footer p {
      margin: 6px 0;
    }
    .footer a {
      color: #8bbcb2;
      text-decoration: underline;
    }
  </style>
</head>
<body>
  <div class="wrapper">
    <table class="main" role="presentation">
      <tr>
        <td class="header">
          <table role="presentation" width="100%">
            <tr>
              <td align="center">
                <a href="https://resume-builder-plan.vercel.app/" style="text-decoration: none;">
                  <div class="brand-icon-box">
                    <span class="brand-icon-text">RF</span>
                  </div>
                  <h1 class="brand-name">ResumeForge</h1>
                  <div class="brand-tagline">AI Career Studio & Campus Network</div>
                </a>
                <div class="badge-pill">Account Activation</div>
              </td>
            </tr>
          </table>
        </td>
      </tr>
      <tr>
        <td class="content">
          <h2 class="title">Welcome to ResumeForge! 👋</h2>
          <p class="text">
            We're thrilled to have you join us. To get started building ATS-optimized resumes, practicing real-time AI interviews, and joining your campus student cohort, please confirm your email address.
          </p>

          <div class="btn-container">
            <a href="{{ .ConfirmationURL }}" class="button">Confirm Email Address &rarr;</a>
          </div>

          <div class="token-box">
            <div class="token-label">Or Enter This Confirmation Code</div>
            <div class="token-value">{{ .Token }}</div>
          </div>

          <p class="text" style="font-size: 12px; margin-top: 24px;">
            If you did not sign up for ResumeForge, you can safely ignore this email. Your email address will not be registered without verification.
          </p>
        </td>
      </tr>
      <tr>
        <td class="footer">
          <p>&copy; 2026 ResumeForge. All rights reserved.</p>
          <p>
            <a href="https://resume-builder-plan.vercel.app/">Visit Website</a> &bull;
            <a href="https://resume-builder-plan.vercel.app/privacy">Privacy Policy</a> &bull;
            <a href="https://resume-builder-plan.vercel.app/support">Support</a>
          </p>
        </td>
      </tr>
    </table>
  </div>
</body>
</html>
`;

export const SUPABASE_RESET_PASSWORD_TEMPLATE = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Reset Your Password - ResumeForge</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      background-color: #081414;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      -webkit-font-smoothing: antialiased;
    }
    table {
      border-spacing: 0;
      width: 100%;
    }
    .wrapper {
      width: 100%;
      table-layout: fixed;
      background-color: #081414;
      padding: 36px 12px 60px;
    }
    .main {
      background-color: #0d1f1f;
      margin: 0 auto;
      width: 100%;
      max-width: 540px;
      border: 1px solid #1c3d38;
      border-radius: 20px;
      box-shadow: 0 20px 35px -5px rgba(0, 0, 0, 0.5);
      overflow: hidden;
    }
    .header {
      padding: 38px 24px 30px;
      text-align: center;
      background: linear-gradient(180deg, #102b2b 0%, #0d1f1f 100%);
      border-bottom: 2px solid #0d8274;
    }
    .brand-icon-box {
      background: linear-gradient(135deg, #0d8274 0%, #085a50 100%);
      width: 48px;
      height: 48px;
      border-radius: 12px;
      margin: 0 auto 14px;
      text-align: center;
      line-height: 48px;
      border: 1px solid #20b2aa;
    }
    .brand-icon-text {
      color: #d8f36b;
      font-size: 22px;
      font-weight: 900;
      letter-spacing: -0.5px;
    }
    .brand-name {
      color: #f8fafc;
      font-size: 22px;
      font-weight: 800;
      letter-spacing: -0.025em;
      margin: 0;
    }
    .brand-tagline {
      color: #8bbcb2;
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.12em;
      margin-top: 4px;
    }
    .badge-pill {
      display: inline-block;
      background-color: rgba(216, 243, 107, 0.12);
      border: 1px solid #d8f36b;
      color: #d8f36b;
      font-size: 10px;
      font-weight: 800;
      letter-spacing: 1px;
      text-transform: uppercase;
      padding: 3px 12px;
      border-radius: 999px;
      margin-top: 14px;
    }
    .content {
      padding: 36px 36px 28px;
      color: #cbd5e1;
    }
    .title {
      color: #ffffff;
      font-size: 22px;
      font-weight: 800;
      margin: 0 0 12px;
      letter-spacing: -0.02em;
    }
    .text {
      font-size: 14px;
      line-height: 1.6;
      margin-bottom: 20px;
      color: #94a3b8;
    }
    .btn-container {
      text-align: center;
      margin: 28px 0;
    }
    .button {
      display: inline-block;
      padding: 15px 36px;
      background: linear-gradient(135deg, #0d8274 0%, #095950 100%);
      color: #d8f36b !important;
      text-decoration: none;
      border-radius: 10px;
      font-weight: 800;
      font-size: 15px;
      box-shadow: 0 8px 20px -3px rgba(13, 130, 116, 0.4);
      border: 1px solid #20b2aa;
    }
    .footer {
      text-align: center;
      padding: 24px 20px;
      color: #64748b;
      font-size: 11px;
      font-weight: 500;
      border-top: 1px solid #1c3d38;
      background-color: #0a1919;
    }
    .footer p {
      margin: 6px 0;
    }
    .footer a {
      color: #8bbcb2;
      text-decoration: underline;
    }
  </style>
</head>
<body>
  <div class="wrapper">
    <table class="main" role="presentation">
      <tr>
        <td class="header">
          <table role="presentation" width="100%">
            <tr>
              <td align="center">
                <a href="https://resume-builder-plan.vercel.app/" style="text-decoration: none;">
                  <div class="brand-icon-box">
                    <span class="brand-icon-text">RF</span>
                  </div>
                  <h1 class="brand-name">ResumeForge</h1>
                  <div class="brand-tagline">AI Career Studio & Campus Network</div>
                </a>
                <div class="badge-pill">Security & Access</div>
              </td>
            </tr>
          </table>
        </td>
      </tr>
      <tr>
        <td class="content">
          <h2 class="title">Password Reset Request 🔐</h2>
          <p class="text">
            We received a request to reset the password for your ResumeForge account. Click the button below to choose a secure new password. This link is valid for 24 hours.
          </p>

          <div class="btn-container">
            <a href="{{ .ConfirmationURL }}" class="button">Reset Your Password &rarr;</a>
          </div>

          <p class="text" style="font-size: 12px; margin-top: 24px;">
            If you didn't request a password reset, you can safely ignore this email. Your current password will remain unchanged and your account is secure.
          </p>
        </td>
      </tr>
      <tr>
        <td class="footer">
          <p>&copy; 2026 ResumeForge. All rights reserved.</p>
          <p>
            <a href="https://resume-builder-plan.vercel.app/">Visit Website</a> &bull;
            <a href="https://resume-builder-plan.vercel.app/privacy">Privacy Policy</a> &bull;
            <a href="https://resume-builder-plan.vercel.app/support">Support</a>
          </p>
        </td>
      </tr>
    </table>
  </div>
</body>
</html>
`;
