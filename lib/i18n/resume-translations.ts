/**
 * ResumeForge Multi-Language & RTL Dictionary (Phase 46)
 * Supports dynamic section heading translation, date localization, and RTL typography.
 */

export type SupportedLanguage = 
  | 'en' // English (Default)
  | 'es' // Spanish
  | 'fr' // French
  | 'de' // German
  | 'ar' // Arabic (RTL)
  | 'he' // Hebrew (RTL)
  | 'zh' // Chinese
  | 'ja'; // Japanese

export interface ResumeDictionary {
  experience: string;
  education: string;
  skills: string;
  projects: string;
  certifications: string;
  languages: string;
  summary: string;
  present: string;
  coursework: string;
  gpa: string;
  contact: string;
  awards: string;
  portfolio: string;
}

export const RTL_LANGUAGES: SupportedLanguage[] = ['ar', 'he'];

export const RESUME_DICTIONARIES: Record<SupportedLanguage, ResumeDictionary> = {
  en: {
    experience: "Experience",
    education: "Education",
    skills: "Skills",
    projects: "Projects",
    certifications: "Certifications",
    languages: "Languages",
    summary: "Professional Summary",
    present: "Present",
    coursework: "Relevant Coursework",
    gpa: "GPA",
    contact: "Contact",
    awards: "Honors & Awards",
    portfolio: "Portfolio",
  },
  es: {
    experience: "Experiencia Profesional",
    education: "Educación y Formación",
    skills: "Habilidades y Competencias",
    projects: "Proyectos Destacados",
    certifications: "Certificaciones",
    languages: "Idiomas",
    summary: "Perfil Profesional",
    present: "Presente",
    coursework: "Cursos Relevantes",
    gpa: "Promedio",
    contact: "Contacto",
    awards: "Premios y Reconocimientos",
    portfolio: "Portafolio",
  },
  fr: {
    experience: "Expérience Professionnelle",
    education: "Formation Académique",
    skills: "Compétences",
    projects: "Projets Réalisés",
    certifications: "Certifications",
    languages: "Langues",
    summary: "Profil Professionnel",
    present: "Présent",
    coursework: "Cours Pertinents",
    gpa: "Moyenne",
    contact: "Coordonnées",
    awards: "Distinctions & Prix",
    portfolio: "Portfolio",
  },
  de: {
    experience: "Berufserfahrung",
    education: "Ausbildung",
    skills: "Kenntnisse & Fähigkeiten",
    projects: "Projekte",
    certifications: "Zertifikate",
    languages: "Sprachen",
    summary: "Kurzprofil",
    present: "Heute",
    coursework: "Relevante Kurse",
    gpa: "Notendurchschnitt",
    contact: "Kontakt",
    awards: "Auszeichnungen",
    portfolio: "Portfolio",
  },
  ar: {
    experience: "الخبرات المهنية",
    education: "المؤهلات التعليمية",
    skills: "المهارات والقدرات",
    projects: "المشاريع البارزة",
    certifications: "الشهادات المهنية",
    languages: "اللغات",
    summary: "الملخص المهني",
    present: "حتى الآن",
    coursework: "المقررات الدراسية",
    gpa: "المعدل التراكمي",
    contact: "معلومات الاتصال",
    awards: "الجوائز والتكريمات",
    portfolio: "ملف الأعمال",
  },
  he: {
    experience: "ניסיון תעסוקתי",
    education: "השכלה והכשרה",
    skills: "כישורים ומיומנויות",
    projects: "פרויקטים נבחרים",
    certifications: "תעודות והסמכות",
    languages: "שפות",
    summary: "תקציר מקצועי",
    present: "כיום",
    coursework: "קורסים רלוונטיים",
    gpa: "ממוצע ציונים",
    contact: "פרטי יצירת קשר",
    awards: "פרסים והצטיינות",
    portfolio: "תיק עבודות",
  },
  zh: {
    experience: "工作经历",
    education: "教育背景",
    skills: "专业技能",
    projects: "项目经验",
    certifications: "资格认证",
    languages: "语言能力",
    summary: "个人简介",
    present: "至今",
    coursework: "核心课程",
    gpa: "平均成绩",
    contact: "联系方式",
    awards: "荣誉奖项",
    portfolio: "作品集",
  },
  ja: {
    experience: "職務経歴",
    education: "学歴",
    skills: "スキル・資格",
    projects: "プロジェクト実績",
    certifications: "認定資格",
    languages: "語学力",
    summary: "自己PR・要約",
    present: "現在",
    coursework: "主な履修科目",
    gpa: "GPA",
    contact: "連絡先",
    awards: "受賞歴",
    portfolio: "ポートフォリオ",
  },
};

/**
 * Returns the localized label for a resume section.
 */
export function getResumeLabel(
  key: keyof ResumeDictionary,
  language?: string | null
): string {
  const normalizedLang = (language?.toLowerCase() || 'en') as SupportedLanguage;
  const dict = RESUME_DICTIONARIES[normalizedLang] || RESUME_DICTIONARIES.en;
  return dict[key] || RESUME_DICTIONARIES.en[key] || key;
}

/**
 * Checks whether a language code represents a Right-to-Left (RTL) script.
 */
export function isRtlLanguage(language?: string | null): boolean {
  if (!language) return false;
  const normalized = language.toLowerCase() as SupportedLanguage;
  return RTL_LANGUAGES.includes(normalized);
}

/**
 * Localizes a date range string or returns standard formatted date.
 * Handles patterns like "2021-01 - Present" or "Jan 2022 - Present".
 */
export function localizeDateRange(
  dateString: string | null | undefined,
  language?: string | null
): string {
  if (!dateString) return "";
  const presentLabel = getResumeLabel("present", language);
  return dateString
    .replace(/\bpresent\b/gi, presentLabel)
    .replace(/\bcurrent\b/gi, presentLabel)
    .replace(/\bnow\b/gi, presentLabel);
}

/**
 * Language display metadata for selectors
 */
export const LANGUAGE_OPTIONS: { code: SupportedLanguage; label: string; nativeName: string; isRtl: boolean }[] = [
  { code: 'en', label: 'English', nativeName: 'English', isRtl: false },
  { code: 'es', label: 'Spanish', nativeName: 'Español', isRtl: false },
  { code: 'fr', label: 'French', nativeName: 'Français', isRtl: false },
  { code: 'de', label: 'German', nativeName: 'Deutsch', isRtl: false },
  { code: 'ar', label: 'Arabic', nativeName: 'العربية', isRtl: true },
  { code: 'he', label: 'Hebrew', nativeName: 'עברית', isRtl: true },
  { code: 'zh', label: 'Chinese', nativeName: '中文', isRtl: false },
  { code: 'ja', label: 'Japanese', nativeName: '日本語', isRtl: false },
];
