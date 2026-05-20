import { MONTHS } from "@/lib/resume-form-constants"

export type ResumeTemplateId = "classic" | "modern" | "minimal" | "executive"

export type ResumeSkill = {
  id: string
  name: string
  rating: number
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
  }
  skills: ResumeSkill[]
  summary: string
}

export const RESUME_DRAFT_STORAGE_KEY = "jobmedia-resume-draft-v1"

export const EMPTY_RESUME_DRAFT: ResumeDraft = {
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
  },
  skills: [],
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
    summary: patch.summary ?? base.summary,
  }
}

export function getFullName(draft: ResumeDraft) {
  return [draft.contact.givenName, draft.contact.familyName]
    .map((s) => s.trim())
    .filter(Boolean)
    .join(" ")
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
  ]
  const done = checks.filter(Boolean).length
  return Math.round((done / checks.length) * 100)
}

export const FINALIZE_SECTIONS = [
  {
    href: "/new",
    label: "Heading",
    isComplete: (d: ResumeDraft) =>
      Boolean(d.contact.email.trim()) &&
      Boolean(d.contact.givenName.trim() || d.contact.familyName.trim()),
  },
  {
    href: "/new/work-history",
    label: "Work history",
    isComplete: (d: ResumeDraft) =>
      Boolean(
        d.workHistory[0].jobTitle.trim() && d.workHistory[0].employer.trim()
      ),
  },
  {
    href: "/new/education",
    label: "Education",
    isComplete: (d: ResumeDraft) => Boolean(d.education.educationLevel.trim()),
  },
  {
    href: "/new/skills",
    label: "Skills",
    isComplete: (d: ResumeDraft) => d.skills.length > 0,
  },
  {
    href: "/new/summary",
    label: "Summary",
    isComplete: (d: ResumeDraft) => d.summary.trim().length >= 40,
  },
] as const
