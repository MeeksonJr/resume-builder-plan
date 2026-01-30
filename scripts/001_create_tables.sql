-- ResumeForge Database Schema
-- This script creates all the necessary tables for the resume builder application

-- ============================================
-- PROFILES TABLE
-- Stores user profile information
-- ============================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "profiles_select_own" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "profiles_insert_own" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "profiles_update_own" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "profiles_delete_own" ON public.profiles FOR DELETE USING (auth.uid() = id);

-- ============================================
-- RESUMES TABLE
-- Stores resume metadata and settings
-- ============================================
CREATE TABLE IF NOT EXISTS public.resumes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL DEFAULT 'Untitled Resume',
  slug TEXT,
  template_id TEXT DEFAULT 'modern',
  is_public BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, slug)
);

ALTER TABLE public.resumes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "resumes_select_own" ON public.resumes FOR SELECT USING (auth.uid() = user_id OR is_public = TRUE);
CREATE POLICY "resumes_insert_own" ON public.resumes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "resumes_update_own" ON public.resumes FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "resumes_delete_own" ON public.resumes FOR DELETE USING (auth.uid() = user_id);

-- ============================================
-- PERSONAL INFO TABLE
-- Stores personal/contact information for each resume
-- ============================================
CREATE TABLE IF NOT EXISTS public.personal_info (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  resume_id UUID NOT NULL REFERENCES public.resumes(id) ON DELETE CASCADE,
  full_name TEXT,
  email TEXT,
  phone TEXT,
  location TEXT,
  website TEXT,
  linkedin TEXT,
  github TEXT,
  portfolio TEXT,
  summary TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(resume_id)
);

ALTER TABLE public.personal_info ENABLE ROW LEVEL SECURITY;

CREATE POLICY "personal_info_select" ON public.personal_info FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.resumes WHERE id = resume_id AND (auth.uid() = user_id OR is_public = TRUE))
);
CREATE POLICY "personal_info_insert" ON public.personal_info FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.resumes WHERE id = resume_id AND auth.uid() = user_id)
);
CREATE POLICY "personal_info_update" ON public.personal_info FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.resumes WHERE id = resume_id AND auth.uid() = user_id)
);
CREATE POLICY "personal_info_delete" ON public.personal_info FOR DELETE USING (
  EXISTS (SELECT 1 FROM public.resumes WHERE id = resume_id AND auth.uid() = user_id)
);

-- ============================================
-- WORK EXPERIENCE TABLE
-- Stores work experience entries
-- ============================================
CREATE TABLE IF NOT EXISTS public.work_experiences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  resume_id UUID NOT NULL REFERENCES public.resumes(id) ON DELETE CASCADE,
  company TEXT NOT NULL,
  position TEXT NOT NULL,
  location TEXT,
  start_date DATE,
  end_date DATE,
  is_current BOOLEAN DEFAULT FALSE,
  description TEXT,
  highlights TEXT[], -- Array of achievement bullet points
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.work_experiences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "work_experiences_select" ON public.work_experiences FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.resumes WHERE id = resume_id AND (auth.uid() = user_id OR is_public = TRUE))
);
CREATE POLICY "work_experiences_insert" ON public.work_experiences FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.resumes WHERE id = resume_id AND auth.uid() = user_id)
);
CREATE POLICY "work_experiences_update" ON public.work_experiences FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.resumes WHERE id = resume_id AND auth.uid() = user_id)
);
CREATE POLICY "work_experiences_delete" ON public.work_experiences FOR DELETE USING (
  EXISTS (SELECT 1 FROM public.resumes WHERE id = resume_id AND auth.uid() = user_id)
);

-- ============================================
-- EDUCATION TABLE
-- Stores education entries
-- ============================================
CREATE TABLE IF NOT EXISTS public.education (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  resume_id UUID NOT NULL REFERENCES public.resumes(id) ON DELETE CASCADE,
  institution TEXT NOT NULL,
  degree TEXT,
  field_of_study TEXT,
  location TEXT,
  start_date DATE,
  end_date DATE,
  is_current BOOLEAN DEFAULT FALSE,
  gpa TEXT,
  description TEXT,
  achievements TEXT[],
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.education ENABLE ROW LEVEL SECURITY;

CREATE POLICY "education_select" ON public.education FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.resumes WHERE id = resume_id AND (auth.uid() = user_id OR is_public = TRUE))
);
CREATE POLICY "education_insert" ON public.education FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.resumes WHERE id = resume_id AND auth.uid() = user_id)
);
CREATE POLICY "education_update" ON public.education FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.resumes WHERE id = resume_id AND auth.uid() = user_id)
);
CREATE POLICY "education_delete" ON public.education FOR DELETE USING (
  EXISTS (SELECT 1 FROM public.resumes WHERE id = resume_id AND auth.uid() = user_id)
);

-- ============================================
-- SKILLS TABLE
-- Stores skills for each resume
-- ============================================
CREATE TABLE IF NOT EXISTS public.skills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  resume_id UUID NOT NULL REFERENCES public.resumes(id) ON DELETE CASCADE,
  category TEXT, -- e.g., "Programming Languages", "Frameworks", "Tools"
  name TEXT NOT NULL,
  proficiency_level INTEGER, -- 1-5 scale
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.skills ENABLE ROW LEVEL SECURITY;

CREATE POLICY "skills_select" ON public.skills FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.resumes WHERE id = resume_id AND (auth.uid() = user_id OR is_public = TRUE))
);
CREATE POLICY "skills_insert" ON public.skills FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.resumes WHERE id = resume_id AND auth.uid() = user_id)
);
CREATE POLICY "skills_update" ON public.skills FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.resumes WHERE id = resume_id AND auth.uid() = user_id)
);
CREATE POLICY "skills_delete" ON public.skills FOR DELETE USING (
  EXISTS (SELECT 1 FROM public.resumes WHERE id = resume_id AND auth.uid() = user_id)
);

-- ============================================
-- PROJECTS TABLE
-- Stores project entries
-- ============================================
CREATE TABLE IF NOT EXISTS public.projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  resume_id UUID NOT NULL REFERENCES public.resumes(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  technologies TEXT[],
  url TEXT,
  github_url TEXT,
  start_date DATE,
  end_date DATE,
  is_current BOOLEAN DEFAULT FALSE,
  highlights TEXT[],
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "projects_select" ON public.projects FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.resumes WHERE id = resume_id AND (auth.uid() = user_id OR is_public = TRUE))
);
CREATE POLICY "projects_insert" ON public.projects FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.resumes WHERE id = resume_id AND auth.uid() = user_id)
);
CREATE POLICY "projects_update" ON public.projects FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.resumes WHERE id = resume_id AND auth.uid() = user_id)
);
CREATE POLICY "projects_delete" ON public.projects FOR DELETE USING (
  EXISTS (SELECT 1 FROM public.resumes WHERE id = resume_id AND auth.uid() = user_id)
);

-- ============================================
-- CERTIFICATIONS TABLE
-- Stores certifications
-- ============================================
CREATE TABLE IF NOT EXISTS public.certifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  resume_id UUID NOT NULL REFERENCES public.resumes(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  issuer TEXT,
  issue_date DATE,
  expiry_date DATE,
  credential_id TEXT,
  credential_url TEXT,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.certifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "certifications_select" ON public.certifications FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.resumes WHERE id = resume_id AND (auth.uid() = user_id OR is_public = TRUE))
);
CREATE POLICY "certifications_insert" ON public.certifications FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.resumes WHERE id = resume_id AND auth.uid() = user_id)
);
CREATE POLICY "certifications_update" ON public.certifications FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.resumes WHERE id = resume_id AND auth.uid() = user_id)
);
CREATE POLICY "certifications_delete" ON public.certifications FOR DELETE USING (
  EXISTS (SELECT 1 FROM public.resumes WHERE id = resume_id AND auth.uid() = user_id)
);

-- ============================================
-- LANGUAGES TABLE
-- Stores language proficiencies
-- ============================================
CREATE TABLE IF NOT EXISTS public.languages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  resume_id UUID NOT NULL REFERENCES public.resumes(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  proficiency TEXT, -- e.g., "Native", "Fluent", "Intermediate", "Basic"
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.languages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "languages_select" ON public.languages FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.resumes WHERE id = resume_id AND (auth.uid() = user_id OR is_public = TRUE))
);
CREATE POLICY "languages_insert" ON public.languages FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.resumes WHERE id = resume_id AND auth.uid() = user_id)
);
CREATE POLICY "languages_update" ON public.languages FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.resumes WHERE id = resume_id AND auth.uid() = user_id)
);
CREATE POLICY "languages_delete" ON public.languages FOR DELETE USING (
  EXISTS (SELECT 1 FROM public.resumes WHERE id = resume_id AND auth.uid() = user_id)
);

-- ============================================
-- CUSTOM SECTIONS TABLE
-- Allows users to create custom resume sections
-- ============================================
CREATE TABLE IF NOT EXISTS public.custom_sections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  resume_id UUID NOT NULL REFERENCES public.resumes(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content JSONB, -- Flexible JSON structure for custom content
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.custom_sections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "custom_sections_select" ON public.custom_sections FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.resumes WHERE id = resume_id AND (auth.uid() = user_id OR is_public = TRUE))
);
CREATE POLICY "custom_sections_insert" ON public.custom_sections FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.resumes WHERE id = resume_id AND auth.uid() = user_id)
);
CREATE POLICY "custom_sections_update" ON public.custom_sections FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.resumes WHERE id = resume_id AND auth.uid() = user_id)
);
CREATE POLICY "custom_sections_delete" ON public.custom_sections FOR DELETE USING (
  EXISTS (SELECT 1 FROM public.resumes WHERE id = resume_id AND auth.uid() = user_id)
);

-- ============================================
-- UPLOADED RESUMES TABLE
-- Stores uploaded resume files for parsing
-- ============================================
CREATE TABLE IF NOT EXISTS public.uploaded_resumes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  filename TEXT NOT NULL,
  file_url TEXT,
  file_type TEXT, -- pdf, docx, etc.
  file_size INTEGER,
  parsed_data JSONB, -- Extracted data from the resume
  parsing_status TEXT DEFAULT 'pending', -- pending, processing, completed, failed
  parsing_error TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.uploaded_resumes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "uploaded_resumes_select_own" ON public.uploaded_resumes FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "uploaded_resumes_insert_own" ON public.uploaded_resumes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "uploaded_resumes_update_own" ON public.uploaded_resumes FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "uploaded_resumes_delete_own" ON public.uploaded_resumes FOR DELETE USING (auth.uid() = user_id);

-- ============================================
-- AI GENERATION HISTORY TABLE
-- Tracks AI-generated content for auditing and improvement
-- ============================================
CREATE TABLE IF NOT EXISTS public.ai_generations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  resume_id UUID REFERENCES public.resumes(id) ON DELETE SET NULL,
  generation_type TEXT NOT NULL, -- summary, bullet_point, skill_suggestion, etc.
  prompt TEXT,
  input_context JSONB, -- Context provided to AI
  output TEXT, -- Generated content
  model_used TEXT, -- groq, gemini, openai
  tokens_used INTEGER,
  rating INTEGER, -- User rating 1-5
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.ai_generations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "ai_generations_select_own" ON public.ai_generations FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "ai_generations_insert_own" ON public.ai_generations FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "ai_generations_update_own" ON public.ai_generations FOR UPDATE USING (auth.uid() = user_id);

-- ============================================
-- RESUME TEMPLATES TABLE (Admin managed)
-- Stores available resume templates
-- ============================================
CREATE TABLE IF NOT EXISTS public.templates (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  preview_image TEXT,
  config JSONB, -- Template configuration (colors, fonts, layout)
  is_premium BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Templates are readable by everyone
ALTER TABLE public.templates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "templates_select_all" ON public.templates FOR SELECT USING (is_active = TRUE);

-- ============================================
-- PROFILE TRIGGER
-- Auto-create profile on user signup
-- ============================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', NULL)
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- UPDATED_AT TRIGGER FUNCTION
-- Automatically update updated_at timestamp
-- ============================================
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at trigger to all relevant tables
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_resumes_updated_at BEFORE UPDATE ON public.resumes FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_personal_info_updated_at BEFORE UPDATE ON public.personal_info FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_work_experiences_updated_at BEFORE UPDATE ON public.work_experiences FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_education_updated_at BEFORE UPDATE ON public.education FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_skills_updated_at BEFORE UPDATE ON public.skills FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON public.projects FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_certifications_updated_at BEFORE UPDATE ON public.certifications FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_languages_updated_at BEFORE UPDATE ON public.languages FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_custom_sections_updated_at BEFORE UPDATE ON public.custom_sections FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_uploaded_resumes_updated_at BEFORE UPDATE ON public.uploaded_resumes FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_templates_updated_at BEFORE UPDATE ON public.templates FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================
-- INSERT DEFAULT TEMPLATES
-- ============================================
INSERT INTO public.templates (id, name, description, is_premium, config) VALUES
  ('modern', 'Modern', 'Clean and modern design with a focus on readability', FALSE, '{"primaryColor": "#0070f3", "fontFamily": "Inter"}'),
  ('classic', 'Classic', 'Traditional professional resume format', FALSE, '{"primaryColor": "#1a1a1a", "fontFamily": "Georgia"}'),
  ('minimal', 'Minimal', 'Simple and elegant minimalist design', FALSE, '{"primaryColor": "#333333", "fontFamily": "Helvetica"}'),
  ('creative', 'Creative', 'Bold and creative layout for designers', TRUE, '{"primaryColor": "#6366f1", "fontFamily": "Poppins"}'),
  ('executive', 'Executive', 'Premium executive-level resume template', TRUE, '{"primaryColor": "#0f172a", "fontFamily": "Merriweather"}')
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================
CREATE INDEX IF NOT EXISTS idx_resumes_user_id ON public.resumes(user_id);
CREATE INDEX IF NOT EXISTS idx_work_experiences_resume_id ON public.work_experiences(resume_id);
CREATE INDEX IF NOT EXISTS idx_education_resume_id ON public.education(resume_id);
CREATE INDEX IF NOT EXISTS idx_skills_resume_id ON public.skills(resume_id);
CREATE INDEX IF NOT EXISTS idx_projects_resume_id ON public.projects(resume_id);
CREATE INDEX IF NOT EXISTS idx_certifications_resume_id ON public.certifications(resume_id);
CREATE INDEX IF NOT EXISTS idx_languages_resume_id ON public.languages(resume_id);
CREATE INDEX IF NOT EXISTS idx_custom_sections_resume_id ON public.custom_sections(resume_id);
CREATE INDEX IF NOT EXISTS idx_uploaded_resumes_user_id ON public.uploaded_resumes(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_generations_user_id ON public.ai_generations(user_id);
