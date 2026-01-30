// Database types matching the Supabase schema

export interface Profile {
  id: string;
  full_name: string | null;
  email: string | null;
  phone: string | null;
  location: string | null;
  linkedin_url: string | null;
  website_url: string | null;
  github_url: string | null;
  avatar_url: string | null;
  summary: string | null;
  created_at: string;
  updated_at: string;
}

export interface Resume {
  id: string;
  user_id: string;
  title: string;
  template_id: string | null;
  is_primary: boolean;
  settings: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface WorkExperience {
  id: string;
  user_id: string;
  resume_id: string | null;
  company: string;
  position: string;
  location: string | null;
  start_date: string | null;
  end_date: string | null;
  is_current: boolean;
  description: string | null;
  highlights: string[];
  display_order: number;
  created_at: string;
  updated_at: string;
}

export interface Education {
  id: string;
  user_id: string;
  resume_id: string | null;
  institution: string;
  degree: string | null;
  field_of_study: string | null;
  location: string | null;
  start_date: string | null;
  end_date: string | null;
  gpa: string | null;
  highlights: string[];
  display_order: number;
  created_at: string;
  updated_at: string;
}

export interface Skill {
  id: string;
  user_id: string;
  resume_id: string | null;
  name: string;
  category: string | null;
  proficiency_level: number | null;
  display_order: number;
  created_at: string;
}

export interface Project {
  id: string;
  user_id: string;
  resume_id: string | null;
  name: string;
  description: string | null;
  technologies: string[];
  url: string | null;
  start_date: string | null;
  end_date: string | null;
  highlights: string[];
  display_order: number;
  created_at: string;
  updated_at: string;
}

export interface Certification {
  id: string;
  user_id: string;
  resume_id: string | null;
  name: string;
  issuer: string | null;
  issue_date: string | null;
  expiry_date: string | null;
  credential_id: string | null;
  credential_url: string | null;
  display_order: number;
  created_at: string;
}

export interface Language {
  id: string;
  user_id: string;
  resume_id: string | null;
  language: string;
  proficiency: string;
  display_order: number;
  created_at: string;
}

export interface CustomSection {
  id: string;
  user_id: string;
  resume_id: string | null;
  title: string;
  content: Record<string, unknown>;
  display_order: number;
  created_at: string;
  updated_at: string;
}

export interface Template {
  id: string;
  name: string;
  description: string | null;
  thumbnail_url: string | null;
  layout_config: Record<string, unknown>;
  is_premium: boolean;
  created_at: string;
}

// Combined resume data for editor
export interface ResumeWithData {
  resume: Resume;
  profile: Profile | null;
  workExperiences: WorkExperience[];
  education: Education[];
  skills: Skill[];
  projects: Project[];
  certifications: Certification[];
  languages: Language[];
  customSections: CustomSection[];
}

// Form types for editing
export interface PersonalInfoForm {
  fullName: string;
  email: string;
  phone: string;
  location: string;
  linkedinUrl: string;
  websiteUrl: string;
  githubUrl: string;
  summary: string;
}

export interface WorkExperienceForm {
  id?: string;
  company: string;
  position: string;
  location: string;
  startDate: string;
  endDate: string;
  isCurrent: boolean;
  description: string;
  highlights: string[];
}

export interface EducationForm {
  id?: string;
  institution: string;
  degree: string;
  fieldOfStudy: string;
  location: string;
  startDate: string;
  endDate: string;
  gpa: string;
  highlights: string[];
}

export interface SkillForm {
  id?: string;
  name: string;
  category: string;
  proficiencyLevel: number;
}

export interface ProjectForm {
  id?: string;
  name: string;
  description: string;
  technologies: string[];
  url: string;
  startDate: string;
  endDate: string;
  highlights: string[];
}
