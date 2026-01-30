# ResumeAI Pro - Comprehensive Project Plan

> An intelligent, AI-powered resume builder with smart parsing, content generation, and professional PDF export.

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Vision & Goals](#2-vision--goals)
3. [Technical Architecture](#3-technical-architecture)
4. [Tech Stack](#4-tech-stack)
5. [Database Schema](#5-database-schema)
6. [AI Strategy & Model Hierarchy](#6-ai-strategy--model-hierarchy)
7. [Core Features](#7-core-features)
8. [Development Phases](#8-development-phases)
9. [API Design](#9-api-design)
10. [Security & Best Practices](#10-security--best-practices)
11. [Future Enhancements](#11-future-enhancements)
12. [File Structure](#12-file-structure)

---

## 1. Project Overview

### 1.1 What is ResumeAI Pro?

ResumeAI Pro is a modern, AI-powered resume builder that helps job seekers create professional, ATS-friendly resumes with intelligent content suggestions, resume parsing from existing documents, and multiple export formats.

### 1.2 Problem Statement

- **Manual Resume Creation is Tedious**: Writing compelling bullet points and summaries takes hours
- **Existing Resumes are Hard to Migrate**: Users have PDFs but no easy way to extract and edit content
- **ATS Optimization is Complex**: Most users don't know how to optimize for Applicant Tracking Systems
- **Consistency is Difficult**: Maintaining professional formatting and tone across sections is challenging

### 1.3 Solution

A comprehensive platform that:
- **Parses existing resumes** using AI to extract structured data
- **Generates and improves content** with intelligent AI assistance
- **Provides real-time preview** with professional templates
- **Exports ATS-friendly PDFs** optimized for job applications
- **Stores resume data** for easy editing and multiple versions

---

## 2. Vision & Goals

### 2.1 Primary Goals

| Goal | Description |
|------|-------------|
| **Intelligent Parsing** | Upload any resume PDF and automatically extract all sections into editable, structured data |
| **AI-Powered Writing** | Generate, improve, and tailor resume content using advanced language models |
| **Professional Output** | Create beautiful, ATS-compliant resumes in multiple templates |
| **User Experience** | Real-time preview, intuitive editing, and seamless workflow |
| **Data Ownership** | Users own their data with full export capabilities |

### 2.2 Success Metrics

- Resume parse accuracy > 90%
- AI content generation rated helpful > 85% of the time
- Time to create resume < 15 minutes for returning users
- PDF export ATS score > 80% on major ATS platforms

### 2.3 Target Users

1. **Job Seekers** - Need to create or update resumes quickly
2. **Career Changers** - Want AI help rephrasing experience for new industries
3. **Students/New Grads** - Need help crafting their first professional resume
4. **Recruiters** - Parse and standardize candidate resumes

---

## 3. Technical Architecture

### 3.1 High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              CLIENT (Next.js 16)                             │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐ │
│  │   Resume    │  │   Resume    │  │     AI      │  │      PDF            │ │
│  │   Parser    │  │   Editor    │  │  Assistant  │  │      Preview        │ │
│  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────────────┘ │
└─────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                           API ROUTES (Next.js)                               │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐ │
│  │  /api/parse │  │/api/resumes │  │  /api/ai/*  │  │   /api/export       │ │
│  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────────────┘ │
└─────────────────────────────────────────────────────────────────────────────┘
                                      │
                    ┌─────────────────┼─────────────────┐
                    ▼                 ▼                 ▼
          ┌─────────────────┐ ┌─────────────┐ ┌─────────────────────┐
          │    Supabase     │ │  AI Models  │ │   Supabase          │
          │   PostgreSQL    │ │  (Groq →    │ │   Storage           │
          │   + Auth        │ │  Gemini →   │ │   (PDF uploads)     │
          │                 │ │  Vercel)    │ │                     │
          └─────────────────┘ └─────────────┘ └─────────────────────┘
```

### 3.2 Data Flow

#### Resume Upload & Parse Flow
```
User uploads PDF
        │
        ▼
┌───────────────────┐
│  Supabase Storage │ ← Store original PDF
└───────────────────┘
        │
        ▼
┌───────────────────┐
│   PDF.js Extract  │ ← Extract raw text
└───────────────────┘
        │
        ▼
┌───────────────────┐
│   AI Structuring  │ ← Groq/Gemini parse to JSON
│   (with fallback) │
└───────────────────┘
        │
        ▼
┌───────────────────┐
│   Supabase DB     │ ← Store structured resume
└───────────────────┘
        │
        ▼
┌───────────────────┐
│   Resume Editor   │ ← User edits/enhances
└───────────────────┘
```

#### AI Content Generation Flow
```
User requests AI help
        │
        ▼
┌───────────────────────────────────────────────────────────┐
│                    AI Model Fallback Chain                 │
│                                                           │
│   ┌─────────┐    ┌─────────┐    ┌─────────────────────┐  │
│   │  Groq   │ → │ Gemini  │ → │  Vercel AI Gateway  │   │
│   │(Primary)│    │(Backup1)│    │     (Backup2)       │   │
│   └─────────┘    └─────────┘    └─────────────────────┘  │
│                                                           │
│   Llama 3.3 70B   Gemini Pro     OpenAI GPT-4o-mini      │
└───────────────────────────────────────────────────────────┘
        │
        ▼
Stream response to UI
```

---

## 4. Tech Stack

### 4.1 Core Stack

| Category | Technology | Purpose |
|----------|------------|---------|
| **Framework** | Next.js 16 (App Router) | Full-stack React framework with RSC, API routes |
| **Language** | TypeScript | Type safety and developer experience |
| **Styling** | Tailwind CSS v4 + shadcn/ui | Rapid UI development with accessible components |
| **Database** | Supabase (PostgreSQL) | Relational database with JSONB support |
| **Authentication** | Supabase Auth | OAuth, magic links, session management |
| **File Storage** | Supabase Storage | PDF uploads with RLS |

### 4.2 AI Stack

| Provider | Model | Use Case | Priority |
|----------|-------|----------|----------|
| **Groq** | Llama 3.3 70B | Primary - Fast inference for real-time features | 1st |
| **Google** | Gemini 2.0 Flash | Backup - High quality generation | 2nd |
| **Vercel AI Gateway** | OpenAI GPT-4o-mini | Fallback - Reliable backup | 3rd |

### 4.3 Libraries & Tools

| Category | Library | Purpose |
|----------|---------|---------|
| **AI SDK** | `ai` v6 + `@ai-sdk/react` v3 | Unified AI interface with streaming |
| **PDF Parsing** | `pdfjs-dist` | Extract text from uploaded PDFs |
| **PDF Generation** | `@react-pdf/renderer` | Create downloadable resume PDFs |
| **Forms** | `react-hook-form` + `zod` | Form management with validation |
| **State** | `zustand` | Client-side state for resume editing |
| **Data Fetching** | `swr` | Data fetching and caching |
| **DnD** | `@dnd-kit/core` | Drag and drop for section reordering |
| **Rich Text** | `@tiptap/react` | Rich text editing for descriptions |
| **Date Handling** | `date-fns` | Date formatting and manipulation |

### 4.4 Development Tools

| Tool | Purpose |
|------|---------|
| **ESLint** | Code linting |
| **Prettier** | Code formatting |
| **TypeScript** | Static type checking |
| **Husky** | Git hooks |

---

## 5. Database Schema

### 5.1 Design Philosophy

We use a **hybrid approach**:
- **Relational tables** for users, resumes metadata, and relationships
- **JSONB columns** for flexible resume content (following JSON Resume standard)

This provides:
- Fast queries on metadata
- Flexible schema for resume content variations
- Easy AI integration (JSON in, JSON out)
- Portability (JSON Resume is an open standard)

### 5.2 Tables

#### `profiles` (extends Supabase auth.users)
```sql
CREATE TABLE public.profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email TEXT,
    full_name TEXT,
    avatar_url TEXT,
    subscription_tier TEXT DEFAULT 'free', -- 'free', 'pro', 'enterprise'
    ai_credits INTEGER DEFAULT 50,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Trigger to create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, full_name, avatar_url)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name'),
        NEW.raw_user_meta_data->>'avatar_url'
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

#### `resumes`
```sql
CREATE TABLE public.resumes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL DEFAULT 'Untitled Resume',
    slug TEXT UNIQUE, -- For shareable links
    content JSONB NOT NULL DEFAULT '{}', -- JSON Resume format
    template TEXT DEFAULT 'modern', -- Template name
    is_public BOOLEAN DEFAULT FALSE,
    is_primary BOOLEAN DEFAULT FALSE,
    view_count INTEGER DEFAULT 0,
    download_count INTEGER DEFAULT 0,
    last_edited_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for faster queries
CREATE INDEX idx_resumes_user_id ON public.resumes(user_id);
CREATE INDEX idx_resumes_slug ON public.resumes(slug);
CREATE INDEX idx_resumes_content ON public.resumes USING GIN(content);
```

#### `resume_versions` (version history)
```sql
CREATE TABLE public.resume_versions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    resume_id UUID REFERENCES public.resumes(id) ON DELETE CASCADE NOT NULL,
    content JSONB NOT NULL,
    version_number INTEGER NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_resume_versions_resume_id ON public.resume_versions(resume_id);
```

#### `uploaded_files` (PDF uploads)
```sql
CREATE TABLE public.uploaded_files (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    file_name TEXT NOT NULL,
    file_path TEXT NOT NULL,
    file_type TEXT NOT NULL,
    file_size INTEGER,
    parsed_content JSONB, -- Extracted structured data
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_uploaded_files_user_id ON public.uploaded_files(user_id);
```

#### `ai_usage_logs` (track AI usage)
```sql
CREATE TABLE public.ai_usage_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    action_type TEXT NOT NULL, -- 'parse', 'generate', 'improve', 'tailor'
    model_used TEXT NOT NULL,
    tokens_used INTEGER,
    success BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_ai_usage_user_id ON public.ai_usage_logs(user_id);
CREATE INDEX idx_ai_usage_created_at ON public.ai_usage_logs(created_at);
```

### 5.3 Row Level Security (RLS)

```sql
-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resumes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resume_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.uploaded_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_usage_logs ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view own profile"
    ON public.profiles FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
    ON public.profiles FOR UPDATE
    USING (auth.uid() = id);

-- Resumes policies
CREATE POLICY "Users can view own resumes"
    ON public.resumes FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can view public resumes"
    ON public.resumes FOR SELECT
    USING (is_public = TRUE);

CREATE POLICY "Users can insert own resumes"
    ON public.resumes FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own resumes"
    ON public.resumes FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own resumes"
    ON public.resumes FOR DELETE
    USING (auth.uid() = user_id);

-- Resume versions policies
CREATE POLICY "Users can manage own resume versions"
    ON public.resume_versions FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.resumes
            WHERE resumes.id = resume_versions.resume_id
            AND resumes.user_id = auth.uid()
        )
    );

-- Uploaded files policies
CREATE POLICY "Users can manage own files"
    ON public.uploaded_files FOR ALL
    USING (auth.uid() = user_id);

-- AI usage logs policies
CREATE POLICY "Users can view own AI usage"
    ON public.ai_usage_logs FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "System can insert AI usage"
    ON public.ai_usage_logs FOR INSERT
    WITH CHECK (auth.uid() = user_id);
```

### 5.4 JSON Resume Content Structure

The `content` JSONB column follows the [JSON Resume](https://jsonresume.org/schema/) standard:

```typescript
interface ResumeContent {
  basics: {
    name: string;
    label: string; // Job title
    image: string;
    email: string;
    phone: string;
    url: string;
    summary: string;
    location: {
      address: string;
      postalCode: string;
      city: string;
      countryCode: string;
      region: string;
    };
    profiles: Array<{
      network: string;
      username: string;
      url: string;
    }>;
  };
  work: Array<{
    id: string; // For drag-drop
    name: string; // Company name
    position: string;
    url: string;
    startDate: string; // YYYY-MM-DD
    endDate: string;
    summary: string;
    highlights: string[];
  }>;
  volunteer: Array<{
    id: string;
    organization: string;
    position: string;
    url: string;
    startDate: string;
    endDate: string;
    summary: string;
    highlights: string[];
  }>;
  education: Array<{
    id: string;
    institution: string;
    url: string;
    area: string; // Field of study
    studyType: string; // Degree
    startDate: string;
    endDate: string;
    score: string; // GPA
    courses: string[];
  }>;
  awards: Array<{
    id: string;
    title: string;
    date: string;
    awarder: string;
    summary: string;
  }>;
  certificates: Array<{
    id: string;
    name: string;
    date: string;
    issuer: string;
    url: string;
  }>;
  publications: Array<{
    id: string;
    name: string;
    publisher: string;
    releaseDate: string;
    url: string;
    summary: string;
  }>;
  skills: Array<{
    id: string;
    name: string;
    level: string; // Beginner, Intermediate, Advanced, Expert
    keywords: string[];
  }>;
  languages: Array<{
    id: string;
    language: string;
    fluency: string;
  }>;
  interests: Array<{
    id: string;
    name: string;
    keywords: string[];
  }>;
  references: Array<{
    id: string;
    name: string;
    reference: string;
  }>;
  projects: Array<{
    id: string;
    name: string;
    description: string;
    highlights: string[];
    keywords: string[];
    startDate: string;
    endDate: string;
    url: string;
    roles: string[];
    entity: string; // Company/Organization
    type: string; // Personal, Work, Open Source
  }>;
  // Custom sections (extensible)
  custom?: Array<{
    id: string;
    title: string;
    items: Array<{
      id: string;
      title: string;
      subtitle: string;
      date: string;
      description: string;
    }>;
  }>;
  // Metadata
  meta?: {
    theme: string;
    template: string;
    primaryColor: string;
    fontSize: number;
    lineHeight: number;
  };
}
```

---

## 6. AI Strategy & Model Hierarchy

### 6.1 Model Selection Rationale

| Model | Strengths | Use Cases |
|-------|-----------|-----------|
| **Groq (Llama 3.3 70B)** | Ultra-fast inference (~300 tokens/sec), cost-effective | Real-time suggestions, bullet point improvements |
| **Gemini 2.0 Flash** | High quality, good at structured output, multimodal | Resume parsing, complex generation, document analysis |
| **OpenAI GPT-4o-mini** | Reliable, consistent, well-documented | Fallback for all operations |

### 6.2 Fallback Implementation

```typescript
// lib/ai/providers.ts
import { createGroq } from '@ai-sdk/groq';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { createOpenAI } from '@ai-sdk/openai';

export const aiProviders = {
  groq: createGroq({
    apiKey: process.env.GROQ_API_KEY,
  }),
  google: createGoogleGenerativeAI({
    apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY,
  }),
  // Vercel AI Gateway - zero config
  vercel: null, // Uses default gateway
};

export const modelHierarchy = [
  { provider: 'groq', model: 'llama-3.3-70b-versatile' },
  { provider: 'google', model: 'gemini-2.0-flash-001' },
  { provider: 'vercel', model: 'openai/gpt-4o-mini' },
];

export async function generateWithFallback(
  prompt: string,
  options?: GenerateOptions
) {
  for (const { provider, model } of modelHierarchy) {
    try {
      const result = await generateText({
        model: getModel(provider, model),
        prompt,
        ...options,
      });
      return { result, provider, model };
    } catch (error) {
      console.warn(`${provider}/${model} failed, trying next...`);
      continue;
    }
  }
  throw new Error('All AI providers failed');
}
```

### 6.3 AI Features

#### A. Resume Parsing
```typescript
const parsePrompt = `
You are an expert resume parser. Extract all information from the following resume text 
and return it as a valid JSON object following the JSON Resume schema.

Rules:
- Extract ALL information, don't skip anything
- Format dates as YYYY-MM-DD when possible, or YYYY-MM if day is unknown
- If a field is missing, use an empty string or empty array
- For bullet points, each point should be a separate item in the highlights array
- Identify skills from context even if not in a dedicated section
- Parse contact information including LinkedIn, GitHub, and portfolio URLs

Resume Text:
${resumeText}
`;
```

#### B. Bullet Point Improvement
```typescript
const improvePrompt = `
Improve this resume bullet point to be more impactful. Follow these rules:
- Start with a strong action verb
- Quantify results with numbers when possible
- Focus on achievements, not just duties
- Keep it concise (under 20 words if possible)
- Maintain professional tone

Original: "${originalText}"

Return ONLY the improved bullet point, no explanations.
`;
```

#### C. Summary Generation
```typescript
const summaryPrompt = `
Write a professional resume summary for a ${jobTitle} with the following background:

Experience: ${experienceSummary}
Key Skills: ${skills.join(', ')}
Target Role: ${targetRole || jobTitle}

Rules:
- 2-3 sentences maximum
- Highlight most relevant experience and skills
- Include years of experience if significant
- Focus on value proposition
- No first-person pronouns

Return ONLY the summary text.
`;
```

#### D. Job Description Tailoring
```typescript
const tailorPrompt = `
Tailor this resume bullet point for a job requiring: ${jobRequirements}

Original: "${bulletPoint}"

Rules:
- Keep the core achievement
- Align language with job description keywords
- Maintain truthfulness
- Optimize for ATS matching

Return ONLY the tailored bullet point.
`;
```

---

## 7. Core Features

### 7.1 Feature Matrix

| Feature | Priority | Phase | Description |
|---------|----------|-------|-------------|
| **Authentication** | P0 | 1 | Supabase Auth with OAuth (Google, GitHub) |
| **Resume CRUD** | P0 | 1 | Create, read, update, delete resumes |
| **Resume Editor** | P0 | 1 | Form-based editing with live preview |
| **PDF Upload & Parse** | P0 | 2 | Upload PDF, extract text, AI structuring |
| **AI Bullet Improvement** | P0 | 2 | Enhance individual bullet points |
| **AI Summary Generation** | P1 | 2 | Generate professional summaries |
| **PDF Export** | P0 | 3 | Download resume as PDF |
| **Multiple Templates** | P1 | 3 | 4+ professional templates |
| **Drag & Drop Sections** | P1 | 3 | Reorder resume sections |
| **Public Sharing** | P2 | 4 | Share resume via unique link |
| **Job Tailoring** | P2 | 4 | Tailor resume to job description |
| **ATS Score** | P2 | 4 | Analyze ATS compatibility |
| **Version History** | P2 | 5 | Track and restore previous versions |
| **Multiple Resumes** | P1 | 5 | Manage multiple resume variants |

### 7.2 User Stories

#### Authentication
- As a user, I can sign up with email/password or OAuth
- As a user, I can sign in and access my dashboard
- As a user, I can reset my password if forgotten
- As a user, my session persists across browser refreshes

#### Resume Management
- As a user, I can create a new resume from scratch
- As a user, I can view all my resumes in a dashboard
- As a user, I can duplicate an existing resume
- As a user, I can delete a resume I no longer need
- As a user, I can set a primary/default resume

#### Resume Editing
- As a user, I can edit all sections of my resume
- As a user, I can see a live preview as I type
- As a user, I can add/remove items in each section
- As a user, I can reorder sections via drag and drop
- As a user, I can use rich text formatting in descriptions

#### AI Features
- As a user, I can upload an existing PDF resume
- As a user, I can have AI extract data from my uploaded resume
- As a user, I can ask AI to improve a bullet point
- As a user, I can ask AI to generate a summary
- As a user, I can see AI credits remaining
- As a user, I can tailor my resume to a job description

#### Export & Sharing
- As a user, I can download my resume as a PDF
- As a user, I can choose from multiple templates
- As a user, I can customize colors and fonts
- As a user, I can share my resume via a public link
- As a user, I can see view/download counts on shared resumes

---

## 8. Development Phases

### Phase 1: Foundation (Week 1-2)

**Goal**: Set up infrastructure and basic authentication

#### Tasks
- [x] Initialize Next.js 16 project with TypeScript
- [ ] Configure Tailwind CSS v4 + shadcn/ui
- [ ] Set up Supabase project and connect
- [ ] Create database schema and migrations
- [ ] Implement Supabase Auth (email + OAuth)
- [ ] Build authentication UI (sign up, sign in, forgot password)
- [ ] Create protected dashboard layout
- [ ] Set up basic resume CRUD API routes

#### Deliverables
- Working authentication flow
- Protected dashboard page
- Database tables created with RLS
- Basic API routes for resumes

### Phase 2: Resume Editor Core (Week 3-4)

**Goal**: Build the core resume editing experience

#### Tasks
- [ ] Design and build resume form components
  - [ ] Personal Information form
  - [ ] Work Experience form (repeatable)
  - [ ] Education form (repeatable)
  - [ ] Skills form
  - [ ] Projects form
  - [ ] Custom sections form
- [ ] Implement Zustand store for editor state
- [ ] Build live preview component
- [ ] Add form validation with Zod
- [ ] Implement auto-save functionality
- [ ] Create resume list/dashboard view

#### Deliverables
- Fully functional resume editor
- Live preview updating in real-time
- Auto-save to database
- Resume dashboard with list view

### Phase 3: PDF Parsing & AI Integration (Week 5-6)

**Goal**: Implement AI-powered features

#### Tasks
- [ ] Set up AI provider configuration (Groq, Gemini, Vercel)
- [ ] Implement model fallback logic
- [ ] Build PDF upload component with drag-and-drop
- [ ] Implement PDF text extraction with pdf.js
- [ ] Create AI parsing API route
- [ ] Build "Improve Bullet Point" feature
- [ ] Build "Generate Summary" feature
- [ ] Add AI usage tracking and credits system
- [ ] Create loading states and error handling for AI features

#### Deliverables
- Working PDF upload and parse flow
- AI content improvement features
- AI usage tracking
- Graceful fallback between AI providers

### Phase 4: PDF Export & Templates (Week 7-8)

**Goal**: Create professional PDF output

#### Tasks
- [ ] Set up @react-pdf/renderer
- [ ] Design "Modern" template
- [ ] Design "Classic" template
- [ ] Design "Minimal" template
- [ ] Design "Creative" template
- [ ] Implement PDF download functionality
- [ ] Add template preview in editor
- [ ] Implement template customization (colors, fonts)
- [ ] Optimize PDF for ATS compatibility

#### Deliverables
- 4 professional PDF templates
- Working PDF download
- Template customization options
- ATS-friendly output

### Phase 5: Advanced Features (Week 9-10)

**Goal**: Polish and add power-user features

#### Tasks
- [ ] Implement drag-and-drop section reordering
- [ ] Add version history with restoration
- [ ] Build public resume sharing feature
- [ ] Implement view/download analytics
- [ ] Add job description tailoring feature
- [ ] Build ATS score analyzer
- [ ] Implement multiple resume management
- [ ] Add resume duplication feature

#### Deliverables
- Drag-and-drop reordering
- Version history
- Public sharing with analytics
- Job tailoring feature

### Phase 6: Polish & Launch (Week 11-12)

**Goal**: Production readiness

#### Tasks
- [ ] Comprehensive testing (unit, integration, e2e)
- [ ] Performance optimization
- [ ] SEO optimization
- [ ] Accessibility audit (WCAG 2.1 AA)
- [ ] Mobile responsiveness refinement
- [ ] Error handling and edge cases
- [ ] Analytics integration
- [ ] Documentation
- [ ] Launch preparation

#### Deliverables
- Production-ready application
- Full test coverage
- Documentation
- Launch checklist complete

---

## 9. API Design

### 9.1 API Routes Overview

```
/api
├── /auth
│   ├── /callback          # OAuth callback
│   └── /signout           # Sign out
├── /resumes
│   ├── GET /              # List user's resumes
│   ├── POST /             # Create new resume
│   ├── GET /[id]          # Get single resume
│   ├── PUT /[id]          # Update resume
│   ├── DELETE /[id]       # Delete resume
│   ├── POST /[id]/duplicate # Duplicate resume
│   └── GET /[id]/versions # Get version history
├── /ai
│   ├── POST /parse        # Parse uploaded PDF
│   ├── POST /improve      # Improve bullet point
│   ├── POST /generate     # Generate content
│   ├── POST /tailor       # Tailor to job description
│   └── POST /ats-score    # Analyze ATS score
├── /upload
│   └── POST /             # Upload PDF file
└── /public
    └── GET /[slug]        # Get public resume by slug
```

### 9.2 API Schemas

#### Create Resume
```typescript
// POST /api/resumes
interface CreateResumeRequest {
  title: string;
  content?: ResumeContent;
  template?: string;
}

interface CreateResumeResponse {
  id: string;
  title: string;
  content: ResumeContent;
  template: string;
  created_at: string;
}
```

#### Parse Resume
```typescript
// POST /api/ai/parse
interface ParseResumeRequest {
  text: string; // Extracted PDF text
  fileId?: string; // Reference to uploaded file
}

interface ParseResumeResponse {
  content: ResumeContent;
  provider: string;
  model: string;
  confidence: number;
}
```

#### Improve Content
```typescript
// POST /api/ai/improve
interface ImproveRequest {
  text: string;
  type: 'bullet' | 'summary' | 'description';
  context?: {
    jobTitle?: string;
    company?: string;
    industry?: string;
  };
}

interface ImproveResponse {
  improved: string;
  provider: string;
  model: string;
}
```

---

## 10. Security & Best Practices

### 10.1 Security Checklist

- [ ] **Authentication**: Supabase Auth with secure session management
- [ ] **Authorization**: Row Level Security on all tables
- [ ] **Input Validation**: Zod schemas on all API inputs
- [ ] **SQL Injection**: Supabase client uses parameterized queries
- [ ] **XSS Prevention**: React's default escaping + CSP headers
- [ ] **CSRF Protection**: Supabase handles via session cookies
- [ ] **Rate Limiting**: Implement on AI endpoints
- [ ] **File Upload**: Validate file types, size limits
- [ ] **API Keys**: Environment variables, never client-exposed
- [ ] **HTTPS**: Enforced via Vercel deployment

### 10.2 Performance Best Practices

- [ ] **Static Generation**: Pre-render where possible
- [ ] **Streaming**: Stream AI responses for perceived speed
- [ ] **Caching**: SWR for data, `use cache` for expensive computations
- [ ] **Code Splitting**: Dynamic imports for heavy components
- [ ] **Image Optimization**: Next.js Image component
- [ ] **Bundle Size**: Monitor and optimize
- [ ] **Database Indexes**: Proper indexing on queried columns
- [ ] **Lazy Loading**: Load editor components on demand

### 10.3 Accessibility (a11y)

- [ ] **Semantic HTML**: Proper heading hierarchy, landmarks
- [ ] **Keyboard Navigation**: All features keyboard accessible
- [ ] **Screen Reader**: ARIA labels, live regions for AI updates
- [ ] **Color Contrast**: WCAG AA compliance
- [ ] **Focus Management**: Visible focus indicators
- [ ] **Form Labels**: All inputs properly labeled
- [ ] **Error Messages**: Clear, associated with inputs

---

## 11. Future Enhancements

### 11.1 Short-term (3-6 months)

| Feature | Description |
|---------|-------------|
| **Cover Letter Generator** | AI-generated cover letters matching resume |
| **LinkedIn Import** | Import resume data from LinkedIn profile |
| **More Templates** | 10+ additional professional templates |
| **Team/Enterprise** | Shared resumes for recruiters/teams |
| **API Access** | Public API for integrations |
| **Browser Extension** | Quick apply with saved resumes |

### 11.2 Medium-term (6-12 months)

| Feature | Description |
|---------|-------------|
| **Interview Prep** | AI-generated interview questions based on resume |
| **Job Matching** | Suggest jobs based on resume content |
| **Resume Analytics** | Detailed insights on resume performance |
| **A/B Testing** | Test different resume versions |
| **Collaborative Editing** | Real-time collaboration on resumes |
| **Mobile App** | Native iOS/Android apps |

### 11.3 Long-term (12+ months)

| Feature | Description |
|---------|-------------|
| **Career Path AI** | Suggest career progression paths |
| **Skills Gap Analysis** | Identify skills to develop |
| **Salary Insights** | Market rate data for roles |
| **Job Application Tracker** | Track applications sent |
| **Video Resume** | AI-assisted video resume creation |
| **Multi-language** | Full i18n support |

---

## 12. File Structure

```
/
├── app/
│   ├── (auth)/
│   │   ├── sign-in/
│   │   │   └── page.tsx
│   │   ├── sign-up/
│   │   │   └── page.tsx
│   │   ├── forgot-password/
│   │   │   └── page.tsx
│   │   └── layout.tsx
│   ├── (dashboard)/
│   │   ├── dashboard/
│   │   │   └── page.tsx
│   │   ├── resumes/
│   │   │   ├── [id]/
│   │   │   │   ├── edit/
│   │   │   │   │   └── page.tsx
│   │   │   │   └── page.tsx
│   │   │   ├── new/
│   │   │   │   └── page.tsx
│   │   │   └── page.tsx
│   │   ├── settings/
│   │   │   └── page.tsx
│   │   └── layout.tsx
│   ├── (public)/
│   │   └── r/
│   │       └── [slug]/
│   │           └── page.tsx
│   ├── api/
│   │   ├── auth/
│   │   │   ├── callback/
│   │   │   │   └── route.ts
│   │   │   └── signout/
│   │   │       └── route.ts
│   │   ├── resumes/
│   │   │   ├── [id]/
│   │   │   │   ├── duplicate/
│   │   │   │   │   └── route.ts
│   │   │   │   ├── versions/
│   │   │   │   │   └── route.ts
│   │   │   │   └── route.ts
│   │   │   └── route.ts
│   │   ├── ai/
│   │   │   ├── parse/
│   │   │   │   └── route.ts
│   │   │   ├── improve/
│   │   │   │   └── route.ts
│   │   │   ├── generate/
│   │   │   │   └── route.ts
│   │   │   ├── tailor/
│   │   │   │   └── route.ts
│   │   │   └── ats-score/
│   │   │       └── route.ts
│   │   ├── upload/
│   │   │   └── route.ts
│   │   └── public/
│   │       └── [slug]/
│   │           └── route.ts
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── auth/
│   │   ├── sign-in-form.tsx
│   │   ├── sign-up-form.tsx
│   │   └── oauth-buttons.tsx
│   ├── dashboard/
│   │   ├── resume-card.tsx
│   │   ├── resume-list.tsx
│   │   └── stats-overview.tsx
│   ├── editor/
│   │   ├── forms/
│   │   │   ├── basics-form.tsx
│   │   │   ├── work-form.tsx
│   │   │   ├── education-form.tsx
│   │   │   ├── skills-form.tsx
│   │   │   ├── projects-form.tsx
│   │   │   └── custom-section-form.tsx
│   │   ├── preview/
│   │   │   ├── resume-preview.tsx
│   │   │   └── section-preview.tsx
│   │   ├── ai/
│   │   │   ├── ai-improve-button.tsx
│   │   │   ├── ai-generate-dialog.tsx
│   │   │   └── ai-credits-badge.tsx
│   │   ├── editor-layout.tsx
│   │   ├── editor-sidebar.tsx
│   │   └── editor-toolbar.tsx
│   ├── pdf/
│   │   ├── templates/
│   │   │   ├── modern.tsx
│   │   │   ├── classic.tsx
│   │   │   ├── minimal.tsx
│   │   │   └── creative.tsx
│   │   ├── pdf-document.tsx
│   │   └── pdf-download-button.tsx
│   ├── upload/
│   │   ├── file-dropzone.tsx
│   │   └── parse-progress.tsx
│   ├── ui/
│   │   └── ... (shadcn components)
│   └── shared/
│       ├── header.tsx
│       ├── footer.tsx
│       ├── loading.tsx
│       └── error-boundary.tsx
├── lib/
│   ├── ai/
│   │   ├── providers.ts
│   │   ├── prompts.ts
│   │   └── fallback.ts
│   ├── supabase/
│   │   ├── client.ts
│   │   ├── server.ts
│   │   ├── middleware.ts
│   │   └── types.ts
│   ├── pdf/
│   │   ├── parser.ts
│   │   └── generator.ts
│   ├── validations/
│   │   ├── resume.ts
│   │   ├── auth.ts
│   │   └── ai.ts
│   └── utils.ts
├── hooks/
│   ├── use-resume.ts
│   ├── use-ai.ts
│   ├── use-auth.ts
│   └── use-editor.ts
├── stores/
│   └── editor-store.ts
├── types/
│   ├── resume.ts
│   ├── database.ts
│   └── ai.ts
├── scripts/
│   ├── setup-database.sql
│   └── seed-data.sql
├── docs/
│   └── PROJECT_PLAN.md
├── public/
│   └── ...
├── .env.example
├── .env.local
├── next.config.mjs
├── package.json
├── tailwind.config.ts
└── tsconfig.json
```

---

## Appendix A: Environment Variables

```bash
# .env.example

# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# AI Providers
GROQ_API_KEY=your_groq_api_key
GOOGLE_GENERATIVE_AI_API_KEY=your_gemini_api_key
# Vercel AI Gateway uses OPENAI_API_KEY or is zero-config on Vercel

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## Appendix B: Key Dependencies

```json
{
  "dependencies": {
    "next": "^16.0.0",
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "typescript": "^5.7.0",
    
    "@supabase/supabase-js": "^2.47.0",
    "@supabase/ssr": "^0.5.0",
    
    "ai": "^6.0.0",
    "@ai-sdk/react": "^3.0.0",
    "@ai-sdk/groq": "^1.0.0",
    "@ai-sdk/google": "^1.0.0",
    
    "@react-pdf/renderer": "^4.0.0",
    "pdfjs-dist": "^4.0.0",
    
    "react-hook-form": "^7.54.0",
    "@hookform/resolvers": "^3.9.0",
    "zod": "^3.24.0",
    
    "zustand": "^5.0.0",
    "swr": "^2.3.0",
    
    "@dnd-kit/core": "^6.3.0",
    "@dnd-kit/sortable": "^9.0.0",
    
    "@tiptap/react": "^2.10.0",
    "@tiptap/starter-kit": "^2.10.0",
    
    "date-fns": "^4.1.0",
    "clsx": "^2.1.0",
    "tailwind-merge": "^2.6.0",
    
    "@radix-ui/react-*": "latest",
    "lucide-react": "^0.469.0"
  }
}
```

---

## Appendix C: References & Inspiration

### Open Source Projects
- [Open Resume](https://github.com/xitanggg/open-resume) - PDF parsing algorithms, React-PDF usage
- [Reactive Resume](https://github.com/amruthpillai/reactive-resume) - Feature set, template designs, data structure

### Standards
- [JSON Resume Schema](https://jsonresume.org/schema/) - Resume data standard

### Documentation
- [Vercel AI SDK](https://sdk.vercel.ai/) - AI integration patterns
- [Supabase Docs](https://supabase.com/docs) - Auth, database, storage
- [React-PDF](https://react-pdf.org/) - PDF generation
- [PDF.js](https://mozilla.github.io/pdf.js/) - PDF parsing

---

*This document is a living plan and will be updated as the project evolves.*

**Last Updated**: January 2026  
**Version**: 1.0.0
