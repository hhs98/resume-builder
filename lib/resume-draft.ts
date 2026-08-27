import { MONTHS } from "@/lib/resume-form-constants"
import { generateId } from "@/lib/utils"

export type ResumeTemplateId =
  | "classic"
  | "modern"
  | "minimal"
  | "executive"

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

export type EducationItem = {
  id: string
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

export const MAX_EDUCATION_ENTRIES = 3
export const MAX_TRAINING_ENTRIES = 3
export const MAX_TRAINING_PDF_BYTES = 5 * 1024 * 1024
export const MAX_TRAINING_PDF_SIZE_MB = 5

export type TrainingItem = {
  id: string
  courseType: string
  instituteName: string
  achievementMonth: string
  achievementYear: string
  certificateFileName: string
  certificatePdfDataUrl: string | null
}

export type ResumeDraft = {
  id: string
  templateId: ResumeTemplateId
  contact: {
    givenName: string
    familyName: string
    profession: string
    currentAddress: string
    city: string
    postalCode: string
    division: string
    dateOfBirth: string
    gender: string
    phone: string
    email: string
    photoDataUrl: string | null
  }
  workHistory: WorkHistoryItem[]
  education: EducationItem[]
  trainings: TrainingItem[]
  skills: ResumeSkill[]
  languages: ResumeLanguage[]
  references: ResumeReference[]
  summary: string
}

export const RESUME_DRAFT_STORAGE_KEY = "jobmedia-resume-draft-v1"

export function parseEducationAwards(value: unknown): EducationAward[] {
  if (!Array.isArray(value)) return []

  return value
    .filter(
      (item): item is Record<string, unknown> =>
        typeof item === "object" && item !== null
    )
    .map((item) => ({
      id: typeof item.id === "string" ? item.id : generateId(),
      title: typeof item.title === "string" ? item.title : "",
      issuer: typeof item.issuer === "string" ? item.issuer : "",
      year: typeof item.year === "string" ? item.year : "",
    }))
}

export function createEmptyEducationItem(): EducationItem {
  return {
    id: generateId(),
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
  }
}

/** Normalize legacy single-object education drafts into an array (max 3). */
export function normalizeEducationList(value: unknown): EducationItem[] {
  if (Array.isArray(value)) {
    const items = value
      .filter(
        (item): item is Record<string, unknown> =>
          typeof item === "object" && item !== null
      )
      .slice(0, MAX_EDUCATION_ENTRIES)
      .map((item) => ({
        id: typeof item.id === "string" ? item.id : generateId(),
        educationLevel:
          typeof item.educationLevel === "string" ? item.educationLevel : "",
        institution:
          typeof item.institution === "string" ? item.institution : "",
        institutionLocation:
          typeof item.institutionLocation === "string"
            ? item.institutionLocation
            : "",
        degree: typeof item.degree === "string" ? item.degree : "",
        fieldOfStudy:
          typeof item.fieldOfStudy === "string" ? item.fieldOfStudy : "",
        graduationMonth:
          typeof item.graduationMonth === "string" ? item.graduationMonth : "",
        graduationYear:
          typeof item.graduationYear === "string" ? item.graduationYear : "",
        description:
          typeof item.description === "string" ? item.description : "",
        projectUrl: typeof item.projectUrl === "string" ? item.projectUrl : "",
        gpa: typeof item.gpa === "string" ? item.gpa : "",
        awards: parseEducationAwards(item.awards),
      }))

    return items.length > 0 ? items : [createEmptyEducationItem()]
  }

  if (value && typeof value === "object") {
    const item = value as Record<string, unknown>
    return [
      {
        id: typeof item.id === "string" ? item.id : generateId(),
        educationLevel:
          typeof item.educationLevel === "string" ? item.educationLevel : "",
        institution:
          typeof item.institution === "string" ? item.institution : "",
        institutionLocation:
          typeof item.institutionLocation === "string"
            ? item.institutionLocation
            : "",
        degree: typeof item.degree === "string" ? item.degree : "",
        fieldOfStudy:
          typeof item.fieldOfStudy === "string" ? item.fieldOfStudy : "",
        graduationMonth:
          typeof item.graduationMonth === "string" ? item.graduationMonth : "",
        graduationYear:
          typeof item.graduationYear === "string" ? item.graduationYear : "",
        description:
          typeof item.description === "string" ? item.description : "",
        projectUrl: typeof item.projectUrl === "string" ? item.projectUrl : "",
        gpa: typeof item.gpa === "string" ? item.gpa : "",
        awards: parseEducationAwards(item.awards),
      },
    ]
  }

  return [createEmptyEducationItem()]
}

export const TRAINING_COURSE_TYPE_OPTIONS = [
  { value: "certificate", label: "Certificate" },
  { value: "diploma", label: "Diploma" },
  { value: "workshop", label: "Workshop" },
  { value: "online-course", label: "Online Course" },
  { value: "professional-training", label: "Professional Training" },
  { value: "seminar", label: "Seminar" },
  { value: "other", label: "Other" },
] as const

export function getTrainingCourseTypeLabel(value: string) {
  return (
    TRAINING_COURSE_TYPE_OPTIONS.find((option) => option.value === value)
      ?.label ?? value
  )
}

export function createEmptyTrainingItem(): TrainingItem {
  return {
    id: generateId(),
    courseType: "",
    instituteName: "",
    achievementMonth: "",
    achievementYear: "",
    certificateFileName: "",
    certificatePdfDataUrl: null,
  }
}

export function normalizeTrainingList(value: unknown): TrainingItem[] {
  if (!Array.isArray(value)) {
    return [createEmptyTrainingItem()]
  }

  const items = value
    .filter(
      (item): item is Record<string, unknown> =>
        typeof item === "object" && item !== null
    )
    .slice(0, MAX_TRAINING_ENTRIES)
    .map((item) => ({
      id: typeof item.id === "string" ? item.id : generateId(),
      courseType: typeof item.courseType === "string" ? item.courseType : "",
      instituteName:
        typeof item.instituteName === "string" ? item.instituteName : "",
      achievementMonth:
        typeof item.achievementMonth === "string"
          ? item.achievementMonth
          : "",
      achievementYear:
        typeof item.achievementYear === "string" ? item.achievementYear : "",
      certificateFileName:
        typeof item.certificateFileName === "string"
          ? item.certificateFileName
          : "",
      certificatePdfDataUrl:
        typeof item.certificatePdfDataUrl === "string"
          ? item.certificatePdfDataUrl
          : null,
    }))

  return items.length > 0 ? items : [createEmptyTrainingItem()]
}

export const EMPTY_RESUME_DRAFT: ResumeDraft = {
  id: generateId(),
  templateId: "classic",
  contact: {
    givenName: "",
    familyName: "",
    profession: "",
    currentAddress: "",
    city: "",
    postalCode: "",
    division: "",
    dateOfBirth: "",
    gender: "",
    phone: "",
    email: "",
    photoDataUrl: null,
  },
  workHistory: [
    {
      id: generateId(),
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
  education: [createEmptyEducationItem()],
  trainings: [createEmptyTrainingItem()],
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
    const merged = mergeResumeDraft(EMPTY_RESUME_DRAFT, parsed)
    cachedDraft = {
      ...merged,
      education: normalizeEducationList(merged.education),
      trainings: normalizeTrainingList(merged.trainings),
    }
    return cachedDraft
  } catch {
    cachedSerialized = null
    cachedDraft = EMPTY_RESUME_DRAFT
    return cachedDraft
  }
}

export function saveResumeDraft(draft: ResumeDraft) {
  if (typeof window === "undefined") return
  const normalized: ResumeDraft = {
    ...draft,
    education: normalizeEducationList(draft.education),
    trainings: normalizeTrainingList(draft.trainings),
  }

  const persist = (value: ResumeDraft) => {
    const serialized = JSON.stringify(value)
    if (serialized === cachedSerialized) {
      cachedDraft = normalized
      return
    }
    localStorage.setItem(RESUME_DRAFT_STORAGE_KEY, serialized)
    cachedSerialized = serialized
    cachedDraft = normalized
    window.dispatchEvent(new Event("resume-draft-changed"))
  }

  try {
    persist(normalized)
  } catch {
    // Keep PDFs in memory; omit large certificate payloads from localStorage.
    const withoutPdfs: ResumeDraft = {
      ...normalized,
      trainings: normalized.trainings.map((training) => ({
        ...training,
        certificatePdfDataUrl: null,
      })),
    }
    try {
      persist(withoutPdfs)
      cachedDraft = normalized
    } catch {
      cachedDraft = normalized
    }
  }
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
    education:
      patch.education !== undefined
        ? normalizeEducationList(patch.education)
        : base.education,
    trainings:
      patch.trainings !== undefined
        ? normalizeTrainingList(patch.trainings)
        : normalizeTrainingList(base.trainings),
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
  if (!(contact.currentAddress ?? "").trim()) {
    errors.currentAddress = "Current address is required."
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
  if (!(contact.dateOfBirth ?? "").trim()) {
    errors.dateOfBirth = "Date of birth is required."
  }
  if (!(contact.gender ?? "").trim()) {
    errors.gender = "Gender is required."
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

export const GENDER_OPTIONS = [
  { value: "male", label: "Male" },
  { value: "female", label: "Female" },
  { value: "other", label: "Other" },
  { value: "prefer-not-to-say", label: "Prefer not to say" },
] as const

export function getGenderLabel(value: string) {
  return GENDER_OPTIONS.find((option) => option.value === value)?.label ?? value
}

/** Format stored YYYY-MM-DD for resume display. */
export function formatDateOfBirth(value?: string | null) {
  const trimmed = typeof value === "string" ? value.trim() : ""
  if (!trimmed) return ""

  const match = trimmed.match(/^(\d{4})-(\d{2})-(\d{2})$/)
  if (!match) return trimmed

  const [, year, month, day] = match
  const label = MONTHS.find((m) => m.value === month)?.label
  if (label) return `${Number(day)} ${label} ${year}`
  return trimmed
}

export function getContactLocation(draft: ResumeDraft) {
  const parts = [
    draft.contact.currentAddress,
    draft.contact.city,
    draft.contact.division,
    draft.contact.postalCode,
  ]
    .map((s) => (typeof s === "string" ? s.trim() : ""))
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

export function formatGraduationCompact(education: EducationItem) {
  return formatCompactMonthYear(
    education.graduationMonth,
    education.graduationYear
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
      c.currentAddress?.trim() ||
      c.city.trim() ||
      c.postalCode.trim() ||
      c.division.trim() ||
      c.dateOfBirth?.trim() ||
      c.gender?.trim() ||
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

export function getPreviewEducationAwards(
  education: EducationItem
): EducationAward[] {
  return education.awards.filter(hasEducationAwardContent)
}

export function hasEducationItemAdditionalDetails(
  education: EducationItem
): boolean {
  return Boolean(
    education.gpa.trim() ||
      education.description.trim() ||
      education.projectUrl.trim() ||
      education.awards.some(hasEducationAwardContent)
  )
}

export function hasEducationItemContent(education: EducationItem): boolean {
  return Boolean(
    education.educationLevel.trim() ||
      education.institution.trim() ||
      education.institutionLocation.trim() ||
      education.degree.trim() ||
      education.fieldOfStudy.trim() ||
      education.graduationMonth ||
      education.graduationYear ||
      education.gpa.trim() ||
      education.description.trim() ||
      education.projectUrl.trim() ||
      education.awards.some(hasEducationAwardContent)
  )
}

export function hasEducationContent(draft: ResumeDraft): boolean {
  return normalizeEducationList(draft.education).some(hasEducationItemContent)
}

export function getPreviewEducation(draft: ResumeDraft): EducationItem[] {
  return normalizeEducationList(draft.education).filter(hasEducationItemContent)
}

export function hasEducationLevelSelected(draft: ResumeDraft): boolean {
  return normalizeEducationList(draft.education).some((item) =>
    item.educationLevel.trim()
  )
}

export function hasSkillsContent(draft: ResumeDraft): boolean {
  return draft.skills.length > 0
}

export function hasTrainingItemContent(training: TrainingItem): boolean {
  return Boolean(
    training.courseType.trim() ||
      training.instituteName.trim() ||
      training.achievementMonth ||
      training.achievementYear ||
      training.certificateFileName.trim()
  )
}

export function hasTrainingContent(draft: ResumeDraft): boolean {
  return normalizeTrainingList(draft.trainings).some(hasTrainingItemContent)
}

export function getPreviewTrainings(draft: ResumeDraft): TrainingItem[] {
  return normalizeTrainingList(draft.trainings).filter(hasTrainingItemContent)
}

export function isTrainingItemComplete(training: TrainingItem): boolean {
  return Boolean(
    training.courseType.trim() && training.instituteName.trim()
  )
}

export function hasCompleteTrainings(draft: ResumeDraft): boolean {
  const items = getPreviewTrainings(draft)
  if (items.length === 0) return true
  return items.some(isTrainingItemComplete)
}

export function formatTrainingAchievementDate(training: TrainingItem) {
  return formatMonthYear(training.achievementMonth, training.achievementYear)
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
      draft.contact.email.trim() ||
      draft.contact.dateOfBirth?.trim() ||
      draft.contact.gender?.trim()
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
    hasEducationLevelSelected(draft),
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
    isComplete: hasEducationLevelSelected,
  },
  {
    href: "/new/training",
    label: "Training",
    hasContent: hasTrainingContent,
    isComplete: hasCompleteTrainings,
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
