# 📄 ResumeAI Pro

> An intelligent, AI-powered resume builder with smart parsing, content generation, professional PDF export, and AI interview preparation.

[![Live Demo](https://img.shields.io/badge/Live_Demo-View_Site-success?style=for-the-badge)](https://resume-builder-plan.vercel.app/)
[![Next.js](https://img.shields.io/badge/Next.js_16-Black?style=for-the-badge&logo=next.js&logoColor=white)](#)
[![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)](#)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](#)

ResumeAI Pro solves the tedious process of resume creation by allowing users to parse existing PDFs, use intelligent AI to rewrite and optimize bullet points, tailor content to specific job descriptions, and export ATS-friendly professional PDFs. 

## 📑 Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Architecture & AI Strategy](#-architecture--ai-strategy)
- [Getting Started (Local Development)](#-getting-started)
- [Verification & Testing](#-verification--testing)
- [Project Structure](#-project-structure)
- [Database Schema](#-database-schema)
- [Roadmap](#-roadmap)

---

## ✨ Features

- **🧠 Intelligent Parsing:** Upload any existing resume PDF and automatically extract all sections into structured, editable data.
- **✨ AI-Powered Writing:** Generate professional summaries, improve bullet points, and tailor your experience to match specific job descriptions.
- **🎨 Professional Output:** Real-time preview with multiple ATS-compliant templates (Modern, Classic, Minimal, Creative) and customizable styling.
- **🎤 AI Interview Prep (Phase 20+):** Practice answering interview questions based on your resume and receive instant, AI-driven feedback and scoring.
- **☁️ Secure Cloud Storage:** Your data is owned by you, securely stored, with full version history and multiple resume variant management.

---

## 🛠 Tech Stack

### Core Technologies
| Category | Technology | Purpose |
|----------|------------|---------|
| **Framework** | Next.js 16 (App Router) | Full-stack React framework with RSC, API routes |
| **Language** | TypeScript | Type safety and developer experience |
| **Styling** | Tailwind CSS v4 + shadcn/ui | Rapid UI development with accessible components |
| **Database/Auth** | Supabase (PostgreSQL) | Relational database with JSONB support, OAuth, RLS |
| **State/Forms** | Zustand, React Hook Form, Zod | Client-side state and rigorous validation |
| **PDF Handling** | `@react-pdf/renderer`, `pdfjs-dist` | Generate downloadable PDFs and extract text |

### AI Providers & Fallback System
ResumeAI Pro implements a robust fallback chain using the Vercel AI SDK to ensure reliable generation:
1. **Groq (Llama 3.3 70B):** Primary provider for ultra-fast inference and real-time suggestions.
2. **Google (Gemini 2.0 Flash):** Secondary provider for high-quality structured output and complex document analysis.
3. **OpenAI (GPT-4o-mini via Vercel AI Gateway):** Reliable fallback for consistent uptime.

---

## 🏗 Architecture & AI Strategy

The platform utilizes a **hybrid data approach**, combining relational tables for user metadata/relationships and `JSONB` columns adhering to the [JSON Resume Schema](https://jsonresume.org/schema/) for maximum flexibility and standard compliance.

```text
CLIENT (Next.js 16)  <--->  API ROUTES (/api/ai, /api/resumes)  <--->  SUPABASE (PostgreSQL + Storage)
                                      |
                                      v
                      AI MODEL CHAIN (Groq -> Gemini -> OpenAI)
```

---

## 🚀 Getting Started

Follow these steps to set up the project locally, including the latest Phase 20 Interview Prep features.

### 1. Prerequisites
- Node.js 18+ and `pnpm` installed.
- A [Supabase](https://supabase.com/) account.
- A **FREE** [Groq API Key](https://console.groq.com/).

### 2. Installation

Clone the repository and install dependencies:
```bash
git clone [https://github.com/MeeksonJr/resume-builder-plan.git](https://github.com/MeeksonJr/resume-builder-plan.git)
cd resume-builder-plan
pnpm install
```

### 3. Environment Variables
Create a `.env.local` file in the root directory using `.env.example` as a template:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# AI Providers
GROQ_API_KEY=your_groq_api_key
GOOGLE_GENERATIVE_AI_API_KEY=your_gemini_api_key

# Resend email delivery
RESEND_API_KEY=re_your_api_key
RESEND_FROM_EMAIL=ResumeForge <hello@your-verified-domain.com>
CONTACT_EMAIL=hello@your-domain.com
RESEND_AUDIENCE_ID=your_resend_audience_id

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

`RESEND_API_KEY` and `CONTACT_EMAIL` enable the contact form. Add `RESEND_AUDIENCE_ID` to save newsletter subscribers as Resend contacts; without an audience, newsletter signups send a notification email to `CONTACT_EMAIL` instead.

### 4. Database Setup & Migration
You can apply the necessary database tables and Row Level Security (RLS) policies using the Supabase CLI or manually via the dashboard.

**Using Supabase CLI:**
```bash
supabase migration up
```

**Manual Setup (For Phase 20 Interview Features):**
1. Open your Supabase Dashboard → SQL Editor.
2. Copy the contents from `supabase/migrations/20260131_interview_answers.sql`.
3. Run the migration to generate `interview_answers` and `interview_feedback` tables.

### 5. Run the Development Server
```bash
pnpm dev
```
Navigate to `http://localhost:3000` to view the application.

---

## 🧪 Verification & Testing

Once the server is running, verify the Phase 20 features (Interview Prep) are functioning correctly:

1. **Basic Flow:** Navigate to `/dashboard/interview-prep`. Start a practice session and submit an answer (minimum 50 characters).
2. **AI Evaluation:** Ensure the loading state appears and Groq returns a score/feedback within 1-3 seconds.
3. **Database Check:** Run the following in your Supabase SQL Editor to verify data persistence:
```sql
   SELECT * FROM interview_answers LIMIT 1;
   SELECT * FROM interview_feedback LIMIT 1;
   ```
4. **Troubleshooting:** If evaluations fail, verify your `GROQ_API_KEY`. If database submissions fail, ensure RLS policies and migrations were applied successfully.

---

## 📂 Project Structure

<details>
<summary>Click to expand folder structure</summary>

```text
/
├── app/                  # Next.js App Router pages and API routes
│   ├── (auth)/           # Authentication flows
│   ├── (dashboard)/      # Protected user dashboard and editor
│   ├── (public)/         # Publicly shared resumes
│   └── api/              # API endpoints (Auth, Resumes, AI, Uploads)
├── components/           # Reusable UI components
│   ├── auth/             # Sign-in/Sign-up components
│   ├── dashboard/        # Dashboard cards and lists
│   ├── editor/           # Resume editing forms, preview, and AI tools
│   ├── pdf/              # React-PDF templates and generation
│   ├── upload/           # Drag-and-drop parsing tools
│   └── ui/               # shadcn/ui components
├── lib/                  # Core utilities and configurations
│   ├── ai/               # Model providers, prompts, and fallback logic
│   ├── supabase/         # Client/Server configs and middleware
│   ├── pdf/              # PDF parsing and generation logic
│   └── validations/      # Zod schemas
├── hooks/                # Custom React hooks
├── stores/               # Zustand state management
├── types/                # TypeScript definitions
└── supabase/migrations/  # Database schema and SQL migrations
```
</details>

---

## 🗄 Database Schema

<details>
<summary>Click to expand core schema overview</summary>

The application relies on several core PostgreSQL tables managed by Supabase, fully secured by Row Level Security (RLS):

- `profiles`: Extends standard Supabase `auth.users` with subscription and AI credit data.
- `resumes`: Stores resume metadata and a flexible `JSONB` column adhering to the JSON Resume schema.
- `resume_versions`: Tracks version history for restoration.
- `uploaded_files`: Manages original PDFs uploaded for parsing.
- `ai_usage_logs`: Tracks token usage and model execution success rates.
- `interview_answers` / `interview_feedback`: (Phase 20 additions) Stores AI mock interview answers and generated feedback metrics.

*See `/scripts/setup-database.sql` for full schema details.*
</details>

---

## 🗺 Roadmap

**Short-term (3-6 months)**
- Cover Letter Generator matching resume context.
- Direct LinkedIn Profile data import.
- Expanded template library (10+ options).

**Medium-term (6-12 months)**
- Comprehensive job matching based on resume content.
- Resume Analytics & A/B testing dashboard.
- Collaborative editing for peer reviews.

**Long-term (12+ months)**
- Career Path AI progression suggestions.
- Skills gap analysis and salary insights.
- Multi-language full i18n support.

---

*This document is a living plan and will be updated as the project evolves.*
