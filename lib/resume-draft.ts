import { MONTHS } from "@/lib/resume-form-constants"

export type ResumeTemplateId = "classic" | "modern" | "minimal" | "executive"

export type ResumeSkill = {
  id: string
  name: string
  rating: number
}

export type ResumeLanguage = {
  id: string
  name: string
  rating: number // 1: Beginner, 2: Intermediate, 3: Advanced, 4: Fluent
}

export type ResumeReference = {
  id: string
  name: string
  designation: string
  organization: string
  phone: string
  email: string
}

export type EducationAward = {
  id: string
  title: string
  issuer: string
  year: string
}

export type WorkHistoryItem = {
  id: string
  jobTitle: string
  employer: string
  location: string
  remote: boolean
  startMonth: string
  startYear: string
  endMonth: string
  endYear: string
  currentJob: boolean
  responsibilities: string
}

export type ResumeDraft = {
  id: string
  templateId: ResumeTemplateId
  contact: {
    givenName: string
    familyName: string
    profession: string
    city: string
    postalCode: string
    division: string
    phone: string
    email: string
    photoDataUrl: string | null
  }
  workHistory: WorkHistoryItem[]
  education: {
    educationLevel: string
    institution: string
    institutionLocation: string
    degree: string
    fieldOfStudy: string
    graduationMonth: string
    graduationYear: string
    description: string
    projectUrl: string
    gpa: string
    awards: EducationAward[]
  }
  skills: ResumeSkill[]
  languages: ResumeLanguage[]
  references: ResumeReference[]
  summary: string
}

export const RESUME_DRAFT_STORAGE_KEY = "jobmedia-resume-draft-v1"

export const EMPTY_RESUME_DRAFT: ResumeDraft = {
  id: crypto.randomUUID(),
  templateId: "classic",
  contact: {
    givenName: "",
    familyName: "",
    profession: "",
    city: "",
    postalCode: "",
    division: "",
    phone: "",
    email: "",
    photoDataUrl: null,
  },
  workHistory: [
    {
      id: crypto.randomUUID(),
      jobTitle: "",
      employer: "",
      location: "",
      remote: false,
      startMonth: "",
      startYear: "",
      endMonth: "",
      endYear: "",
      currentJob: false,
      responsibilities: "",
    },
  ],
  education: {
    educationLevel: "",
    institution: "",
    institutionLocation: "",
    degree: "",
    fieldOfStudy: "",
    graduationMonth: "",
    graduationYear: "",
    description: "",
    projectUrl: "",
    gpa: "",
    awards: [],
  },
  skills: [],
  languages: [],
  references: [],
  summary: "",
}

const DEGREE_LABELS: Record<string, string> = {
  "high-school-diploma": "High school diploma",
  certificate: "Certificate",
  associate: "Associate's degree",
  bachelor: "Bachelor's degree",
  master: "Master's degree",
  doctorate: "Doctorate",
  professional: "Professional degree",
  other: "Other",
}

const EDUCATION_LEVEL_LABELS: Record<string, string> = {
  "post-secondary-or-high-school":
    "Post-Secondary Certificate or High School diploma",
  "technical-vocational": "Technical or Vocational",
  "related-courses": "Related Courses",
  "certificates-or-diplomas": "Certificates or diplomas",
  associates: "Associates",
  bachelors: "Bachelors",
  "masters-or-specialized": "Masters or Specialized",
  "doctoral-or-jd": "Doctoral or J.D.",
}

/** Cached snapshot for useSyncExternalStore (stable reference when storage unchanged). */
let cachedSerialized: string | null = null
let cachedDraft: ResumeDraft = EMPTY_RESUME_DRAFT

export function loadResumeDraft(): ResumeDraft {
  if (typeof window === "undefined") return EMPTY_RESUME_DRAFT
  try {
    const raw = localStorage.getItem(RESUME_DRAFT_STORAGE_KEY)
    if (raw === cachedSerialized) {
      return cachedDraft
    }
    cachedSerialized = raw
    if (!raw) {
      cachedDraft = EMPTY_RESUME_DRAFT
      return cachedDraft
    }
    const parsed = JSON.parse(raw) as Partial<ResumeDraft>
    cachedDraft = mergeResumeDraft(EMPTY_RESUME_DRAFT, parsed)
    return cachedDraft
  } catch {
    cachedSerialized = null
    cachedDraft = EMPTY_RESUME_DRAFT
    return cachedDraft
  }
}

export function saveResumeDraft(draft: ResumeDraft) {
  if (typeof window === "undefined") return
  const serialized = JSON.stringify(draft)
  if (serialized === cachedSerialized) {
    cachedDraft = draft
    return
  }
  localStorage.setItem(RESUME_DRAFT_STORAGE_KEY, serialized)
  cachedSerialized = serialized
  cachedDraft = draft
  window.dispatchEvent(new Event("resume-draft-changed"))
}

export function mergeResumeDraft(
  base: ResumeDraft,
  patch: Partial<ResumeDraft>
): ResumeDraft {
  return {
    ...base,
    ...patch,
    templateId: patch.templateId ?? base.templateId,
    contact: { ...base.contact, ...patch.contact },
    workHistory: patch.workHistory ?? base.workHistory,
    education: { ...base.education, ...patch.education },
    skills: patch.skills ?? base.skills,
    languages: patch.languages ?? base.languages,
    references: patch.references ?? base.references,
    summary: patch.summary ?? base.summary,
  }
}

export function getFullName(draft: ResumeDraft) {
  return [draft.contact.givenName, draft.contact.familyName]
    .map((s) => s.trim())
    .filter(Boolean)
    .join(" ")
}

export function getPrimaryJobTitle(draft: ResumeDraft): string {
  const profession = draft.contact.profession.trim()
  if (profession) return profession

  const currentJob = draft.workHistory.find(
    (work) => work.currentJob && work.jobTitle.trim()
  )
  if (currentJob) return currentJob.jobTitle.trim()

  const latestWithTitle = draft.workHistory.find((work) => work.jobTitle.trim())
  return latestWithTitle?.jobTitle.trim() ?? ""
}

export type HeadingContactErrors = Partial<
  Record<keyof ResumeDraft["contact"], string>
>

export function validateHeadingContact(
  contact: ResumeDraft["contact"]
): HeadingContactErrors {
  const errors: HeadingContactErrors = {}

  if (!contact.givenName.trim()) {
    errors.givenName = "Name is required."
  }
  if (!contact.familyName.trim()) {
    errors.familyName = "Surname is required."
  }
  if (!contact.profession.trim()) {
    errors.profession = "Professional title is required."
  }
  if (!contact.city.trim()) {
    errors.city = "City is required."
  }
  if (!contact.postalCode.trim()) {
    errors.postalCode = "Zip code is required."
  }
  if (!contact.division.trim()) {
    errors.division = "Division is required."
  }
  if (!contact.phone.trim()) {
    errors.phone = "Phone number is required."
  }
  if (!contact.email.trim()) {
    errors.email = "Email address is required."
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contact.email.trim())) {
    errors.email = "Please enter a valid email address."
  }

  return errors
}

export function isHeadingContactValid(contact: ResumeDraft["contact"]) {
  return Object.keys(validateHeadingContact(contact)).length === 0
}

export function getContactLocation(draft: ResumeDraft) {
  const parts = [
    draft.contact.city,
    draft.contact.division,
    draft.contact.postalCode,
  ]
    .map((s) => s.trim())
    .filter(Boolean)
  return parts.join(", ")
}

export function formatMonthYear(month?: string, year?: string) {
  if (!month && !year) return ""
  const label = MONTHS.find((m) => m.value === month)?.label
  if (label && year) return `${label} ${year}`
  return year || label || ""
}

export function formatWorkDates(work: WorkHistoryItem) {
  const start = formatMonthYear(work.startMonth, work.startYear)

  const end = work.currentJob
    ? "Present"
    : formatMonthYear(work.endMonth, work.endYear)

  return [start, end].filter(Boolean).join(" - ")
}

/** Compact range for executive template (e.g. 2023-12 - 2025-12). */
export function formatCompactMonthYear(month?: string, year?: string) {
  if (!year && !month) return ""
  if (year && month) return `${year}-${month}`
  return year || month || ""
}

export function formatWorkDatesCompact(
  draft: ResumeDraft,
  showDates: boolean = true
) {
  if (!showDates) return ""

  const history = draft.workHistory ?? []
  if (!history.length) return ""

  const item = history[0]

  const start = formatCompactMonthYear(item?.startMonth, item?.startYear)

  const end = item?.currentJob
    ? "Present"
    : formatCompactMonthYear(item?.endMonth, item?.endYear)

  if (start && end) return `${start} - ${end}`
  return start || end || ""
}

export function formatWorkItemDates(work: WorkHistoryItem) {
  const start = formatCompactMonthYear(work.startMonth, work.startYear)

  const end = work.currentJob
    ? "Present"
    : formatCompactMonthYear(work.endMonth, work.endYear)

  if (start && end) return `${start} - ${end}`
  return start || end || ""
}

export function formatGraduationCompact(draft: ResumeDraft) {
  return formatCompactMonthYear(
    draft.education.graduationMonth,
    draft.education.graduationYear
  )
}

export function getDegreeLabel(value: string) {
  return DEGREE_LABELS[value] ?? value
}

export function getEducationLevelLabel(value: string) {
  return EDUCATION_LEVEL_LABELS[value] ?? value
}

export function hasReferenceContent(ref: ResumeReference): boolean {
  return Boolean(
    ref.name.trim() ||
      ref.designation.trim() ||
      ref.organization.trim() ||
      ref.phone.trim() ||
      ref.email.trim()
  )
}

export function isReferenceComplete(ref: ResumeReference): boolean {
  return Boolean(
    ref.name.trim() &&
      ref.designation.trim() &&
      ref.organization.trim() &&
      ref.phone.trim()
  )
}

export function hasCompleteReferences(draft: ResumeDraft): boolean {
  return draft.references.some(isReferenceComplete)
}

export function hasHeadingContent(draft: ResumeDraft): boolean {
  const c = draft.contact
  return Boolean(
    c.givenName.trim() ||
      c.familyName.trim() ||
      c.profession.trim() ||
      c.city.trim() ||
      c.postalCode.trim() ||
      c.division.trim() ||
      c.phone.trim() ||
      c.email.trim() ||
      c.photoDataUrl
  )
}

export function hasWorkHistoryItemContent(work: WorkHistoryItem): boolean {
  return Boolean(
    work.jobTitle.trim() ||
      work.employer.trim() ||
      work.location.trim() ||
      work.responsibilities.trim() ||
      work.startMonth ||
      work.startYear ||
      work.endMonth ||
      work.endYear
  )
}

export function hasWorkHistoryContent(draft: ResumeDraft): boolean {
  return draft.workHistory.some(hasWorkHistoryItemContent)
}

export function parseEducationAwards(value: unknown): EducationAward[] {
  if (!Array.isArray(value)) return []

  return value
    .filter(
      (item): item is Record<string, unknown> =>
        typeof item === "object" && item !== null
    )
    .map((item) => ({
      id: typeof item.id === "string" ? item.id : crypto.randomUUID(),
      title: typeof item.title === "string" ? item.title : "",
      issuer: typeof item.issuer === "string" ? item.issuer : "",
      year: typeof item.year === "string" ? item.year : "",
    }))
}

export function hasEducationAwardContent(award: EducationAward): boolean {
  return Boolean(award.title.trim() || award.issuer.trim() || award.year.trim())
}

export function formatEducationAward(award: EducationAward): string {
  const title = award.title.trim()
  const meta = [award.issuer.trim(), award.year.trim()].filter(Boolean).join(", ")

  if (!title) return meta
  if (!meta) return title
  return `${title} (${meta})`
}

export function getPreviewEducationAwards(draft: ResumeDraft): EducationAward[] {
  return draft.education.awards.filter(hasEducationAwardContent)
}

export function hasEducationAdditionalDetails(draft: ResumeDraft): boolean {
  const e = draft.education
  return Boolean(
    e.gpa.trim() ||
      e.description.trim() ||
      e.projectUrl.trim() ||
      e.awards.some(hasEducationAwardContent)
  )
}

export function hasEducationContent(draft: ResumeDraft): boolean {
  const e = draft.education
  return Boolean(
    e.educationLevel.trim() ||
      e.institution.trim() ||
      e.institutionLocation.trim() ||
      e.degree.trim() ||
      e.fieldOfStudy.trim() ||
      e.graduationMonth ||
      e.graduationYear ||
      e.gpa.trim() ||
      e.description.trim() ||
      e.projectUrl.trim() ||
      e.awards.some(hasEducationAwardContent)
  )
}

export function hasSkillsContent(draft: ResumeDraft): boolean {
  return draft.skills.length > 0
}

export function hasLanguagesContent(draft: ResumeDraft): boolean {
  return draft.languages.length > 0
}

export function hasSummaryContent(draft: ResumeDraft): boolean {
  return draft.summary.trim().length > 0
}

export function hasReferencesContent(draft: ResumeDraft): boolean {
  return draft.references.some(hasReferenceContent)
}

export function getPreviewWorkHistory(draft: ResumeDraft): WorkHistoryItem[] {
  return draft.workHistory.filter(hasWorkHistoryItemContent)
}

export function getPreviewReferences(draft: ResumeDraft): ResumeReference[] {
  return draft.references.filter(hasReferenceContent)
}

export function getPreviewLanguages(draft: ResumeDraft): ResumeLanguage[] {
  return draft.languages.filter((language) => language.name.trim())
}

export function getPreviewSkills(draft: ResumeDraft): ResumeSkill[] {
  return draft.skills.filter((skill) => skill.name.trim())
}

export function hasPreviewWorkHistory(draft: ResumeDraft): boolean {
  return getPreviewWorkHistory(draft).length > 0
}

export function hasPreviewReferences(draft: ResumeDraft): boolean {
  return getPreviewReferences(draft).length > 0
}

export function hasPreviewLanguages(draft: ResumeDraft): boolean {
  return getPreviewLanguages(draft).length > 0
}

export function hasPreviewSkills(draft: ResumeDraft): boolean {
  return getPreviewSkills(draft).length > 0
}

export function hasPreviewContact(draft: ResumeDraft): boolean {
  return Boolean(
    getContactLocation(draft) ||
      draft.contact.phone.trim() ||
      draft.contact.email.trim()
  )
}

export function computeResumeCompleteness(draft: ResumeDraft): number {
  const checks = [
    Boolean(draft.contact.email.trim()),
    Boolean(draft.contact.givenName.trim() || draft.contact.familyName.trim()),
    Boolean(draft.contact.phone.trim() || draft.contact.profession.trim()),
    Boolean(
      draft.workHistory[0].jobTitle.trim() &&
      draft.workHistory[0].employer.trim()
    ),
    Boolean(draft.education.educationLevel.trim()),
    draft.skills.length > 0,
    draft.summary.trim().length >= 40,
    hasCompleteReferences(draft),
    draft.languages.length > 0,
  ]
  const done = checks.filter(Boolean).length
  return Math.round((done / checks.length) * 100)
}

export const FINALIZE_SECTIONS = [
  {
    href: "/new",
    label: "Heading",
    hasContent: hasHeadingContent,
    isComplete: (d: ResumeDraft) => isHeadingContactValid(d.contact),
  },
  {
    href: "/new/work-history",
    label: "Work history",
    hasContent: hasWorkHistoryContent,
    isComplete: (d: ResumeDraft) =>
      Boolean(
        d.workHistory[0].jobTitle.trim() && d.workHistory[0].employer.trim()
      ),
  },
  {
    href: "/new/education",
    label: "Education",
    hasContent: hasEducationContent,
    isComplete: (d: ResumeDraft) => Boolean(d.education.educationLevel.trim()),
  },
  {
    href: "/new/skills",
    label: "Skills",
    hasContent: hasSkillsContent,
    isComplete: (d: ResumeDraft) => d.skills.length > 0,
  },
  {
    href: "/new/languages",
    label: "Languages",
    hasContent: hasLanguagesContent,
    isComplete: (d: ResumeDraft) => d.languages.length > 0,
  },
  {
    href: "/new/summary",
    label: "Summary",
    hasContent: hasSummaryContent,
    isComplete: (d: ResumeDraft) => d.summary.trim().length >= 40,
  },
  {
    href: "/new/references",
    label: "References",
    hasContent: hasReferencesContent,
    isComplete: (d: ResumeDraft) => hasCompleteReferences(d),
  },
] as const
