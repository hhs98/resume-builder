import { extractText, getDocumentProxy } from "unpdf"

import { generateWithOllama } from "@/lib/ollama"
import {
  EMPTY_RESUME_DRAFT,
  mergeResumeDraft,
  type EducationAward,
  type ResumeDraft,
  type ResumeLanguage,
  type ResumeReference,
  type ResumeSkill,
  type WorkHistoryItem,
} from "@/lib/resume-draft"
import { MONTHS } from "@/lib/resume-form-constants"
import {
  sanitizeHttpsUrl,
  sanitizePhotoDataUrl,
} from "@/lib/security/sanitize-resume"
import { generateId } from "@/lib/utils"

export const MAX_RESUME_PDF_BYTES = 5 * 1024 * 1024
export const MAX_RESUME_PDF_SIZE_MB = 5
export const MAX_RESUME_PDF_PAGES = 5
export const MAX_RESUME_TEXT_CHARS = 14_000

export type ResumePdfPageInfo = {
  totalPages: number
}

export type ParseResumePdfResult = {
  draft: ResumeDraft
  pages: ResumePdfPageInfo
}

export function getResumePdfPageLimitError(totalPages: number): string | null {
  if (totalPages <= MAX_RESUME_PDF_PAGES) return null

  return `This resume has ${totalPages} pages. Maximum allowed is ${MAX_RESUME_PDF_PAGES} pages. Please upload a shorter resume.`
}

export function isResumePdfPageLimitMessage(message: string): boolean {
  return message.includes(`Maximum allowed is ${MAX_RESUME_PDF_PAGES} pages`)
}

function isPdfFile(file: File): boolean {
  const name = file.name.toLowerCase()
  return file.type === "application/pdf" || name.endsWith(".pdf")
}

export function validateResumePdfUpload(
  file: unknown
): { file: File } | { error: string } {
  if (!(file instanceof File)) {
    return { error: "Please upload a PDF resume file." }
  }

  if (!isPdfFile(file)) {
    return { error: "Only PDF files are allowed." }
  }

  if (file.size > MAX_RESUME_PDF_BYTES) {
    return {
      error: `File is too large. Maximum size is ${MAX_RESUME_PDF_SIZE_MB} MB.`,
    }
  }

  return { file }
}

const EDUCATION_LEVEL_VALUES = [
  "post-secondary-or-high-school",
  "technical-vocational",
  "related-courses",
  "certificates-or-diplomas",
  "associates",
  "bachelors",
  "masters-or-specialized",
  "doctoral-or-jd",
] as const

const DEGREE_VALUES = [
  "high-school-diploma",
  "certificate",
  "associate",
  "bachelor",
  "master",
  "doctorate",
  "professional",
  "other",
] as const

const MONTH_NAME_TO_VALUE = Object.fromEntries(
  MONTHS.flatMap((month) => [
    [month.label.toLowerCase(), month.value],
    [month.label.slice(0, 3).toLowerCase(), month.value],
  ])
) as Record<string, string>

type ParsedResumePayload = {
  contact?: Record<string, unknown>
  summary?: unknown
  workHistory?: unknown[]
  education?: Record<string, unknown>
  skills?: unknown[]
  languages?: unknown[]
  references?: unknown[]
}

/** PDF.js can detach the underlying buffer; always pass a copy into unpdf. */
function toPdfBytes(buffer: ArrayBuffer): Uint8Array {
  return new Uint8Array(buffer.slice(0))
}

async function loadPdfDocument(buffer: ArrayBuffer) {
  return getDocumentProxy(toPdfBytes(buffer))
}

export async function getResumePdfPageCount(buffer: ArrayBuffer): Promise<number> {
  const pdf = await loadPdfDocument(buffer)
  const { totalPages } = await extractText(pdf, { mergePages: false })
  return totalPages
}

export async function assertResumePdfPageLimit(
  buffer: ArrayBuffer
): Promise<number> {
  const totalPages = await getResumePdfPageCount(buffer)
  const pageLimitError = getResumePdfPageLimitError(totalPages)

  if (pageLimitError) {
    throw new Error(pageLimitError)
  }

  return totalPages
}

export async function getResumePdfPageInfo(
  buffer: ArrayBuffer
): Promise<ResumePdfPageInfo> {
  const totalPages = await getResumePdfPageCount(buffer)
  return { totalPages }
}

export async function extractTextFromPdf(
  buffer: ArrayBuffer
): Promise<{ text: string; pages: ResumePdfPageInfo }> {
  const pdf = await loadPdfDocument(buffer)
  const { totalPages, text: pageTexts } = await extractText(pdf, {
    mergePages: false,
  })

  const pageLimitError = getResumePdfPageLimitError(totalPages)
  if (pageLimitError) {
    throw new Error(pageLimitError)
  }

  const text = pageTexts.join("\n").replace(/\s+/g, " ").trim()

  return {
    text,
    pages: { totalPages },
  }
}

export function buildParseResumePrompt(resumeText: string): string {
  const clipped = resumeText.slice(0, MAX_RESUME_TEXT_CHARS)

  return `You are a resume parser. Extract structured data from the resume text below.

Return ONLY valid JSON (no markdown, no commentary) matching this shape:
{
  "contact": {
    "givenName": "",
    "familyName": "",
    "profession": "",
    "city": "",
    "postalCode": "",
    "division": "",
    "phone": "",
    "email": ""
  },
  "summary": "",
  "workHistory": [
    {
      "jobTitle": "",
      "employer": "",
      "location": "",
      "remote": false,
      "startMonth": "01-12 or empty",
      "startYear": "YYYY or empty",
      "endMonth": "01-12 or empty",
      "endYear": "YYYY or empty",
      "currentJob": false,
      "responsibilities": "bullet points joined with newline, each starting with •"
    }
  ],
  "education": {
    "educationLevel": "post-secondary-or-high-school|technical-vocational|related-courses|certificates-or-diplomas|associates|bachelors|masters-or-specialized|doctoral-or-jd",
    "institution": "",
    "institutionLocation": "",
    "degree": "high-school-diploma|certificate|associate|bachelor|master|doctorate|professional|other",
    "fieldOfStudy": "",
    "graduationMonth": "01-12 or empty",
    "graduationYear": "YYYY or empty",
    "description": "",
    "projectUrl": "",
    "gpa": "",
    "awards": [{ "title": "", "issuer": "", "year": "" }]
  },
  "skills": [{ "name": "" }],
  "languages": [{ "name": "", "rating": 1 }],
  "references": [
    {
      "name": "",
      "designation": "",
      "organization": "",
      "phone": "",
      "email": ""
    }
  ]
}

Rules:
- Use empty strings for missing text fields, empty arrays when a section is absent
- Do not invent information that is not in the resume
- Pick the most recent or highest education for the education object
- language rating: 1=Beginner, 2=Intermediate, 3=Fluent, 4=Native
- If end date is Present/Current, set currentJob true and leave endMonth/endYear empty
- division is state/province/region when available

Resume text:
${clipped}`
}

export function extractJsonFromAiResponse(text: string): unknown {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/i)
  const candidate = (fenced?.[1] ?? text).trim()
  const start = candidate.indexOf("{")
  const end = candidate.lastIndexOf("}")

  if (start === -1 || end === -1 || end <= start) {
    throw new Error("AI did not return valid resume data. Please try again.")
  }

  try {
    return JSON.parse(candidate.slice(start, end + 1))
  } catch {
    throw new Error("AI returned unreadable resume data. Please try again.")
  }
}

function asString(value: unknown): string {
  if (typeof value === "number") return String(value)
  return typeof value === "string" ? value.trim() : ""
}

function asBoolean(value: unknown): boolean {
  return value === true
}

function normalizeMonth(value: unknown): string {
  const raw = asString(value).toLowerCase()
  if (!raw) return ""
  if (/^\d{2}$/.test(raw)) return raw
  if (/^\d{1}$/.test(raw)) return `0${raw}`
  return MONTH_NAME_TO_VALUE[raw] ?? ""
}

function normalizeYear(value: unknown): string {
  const raw = asString(value)
  const match = raw.match(/\b(19|20)\d{2}\b/)
  return match?.[0] ?? ""
}

function matchOptionValue(
  value: unknown,
  allowed: readonly string[],
  aliases: Record<string, string> = {}
): string {
  const raw = asString(value).toLowerCase()
  if (!raw) return ""

  if (allowed.includes(raw)) return raw

  const alias = aliases[raw]
  if (alias && allowed.includes(alias)) return alias

  for (const option of allowed) {
    if (raw.includes(option) || option.includes(raw)) return option
  }

  for (const [key, mapped] of Object.entries(aliases)) {
    if (raw.includes(key) && allowed.includes(mapped)) return mapped
  }

  return ""
}

const EDUCATION_LEVEL_ALIASES: Record<string, string> = {
  "high school": "post-secondary-or-high-school",
  "high-school": "post-secondary-or-high-school",
  diploma: "post-secondary-or-high-school",
  vocational: "technical-vocational",
  technical: "technical-vocational",
  certificate: "certificates-or-diplomas",
  certificates: "certificates-or-diplomas",
  associate: "associates",
  associates: "associates",
  bachelor: "bachelors",
  bachelors: "bachelors",
  bs: "bachelors",
  ba: "bachelors",
  master: "masters-or-specialized",
  masters: "masters-or-specialized",
  mba: "masters-or-specialized",
  ms: "masters-or-specialized",
  ma: "masters-or-specialized",
  doctoral: "doctoral-or-jd",
  doctorate: "doctoral-or-jd",
  phd: "doctoral-or-jd",
  jd: "doctoral-or-jd",
}

const DEGREE_ALIASES: Record<string, string> = {
  "high school": "high-school-diploma",
  diploma: "high-school-diploma",
  cert: "certificate",
  associate: "associate",
  associates: "associate",
  bachelor: "bachelor",
  bachelors: "bachelor",
  bs: "bachelor",
  ba: "bachelor",
  master: "master",
  masters: "master",
  ms: "master",
  ma: "master",
  mba: "master",
  phd: "doctorate",
  doctorate: "doctorate",
  md: "professional",
  jd: "professional",
}

function normalizeContact(
  value: unknown
): ResumeDraft["contact"] {
  const contact =
    value && typeof value === "object"
      ? (value as Record<string, unknown>)
      : {}

  return {
    givenName: asString(contact.givenName),
    familyName: asString(contact.familyName),
    profession: asString(contact.profession),
    city: asString(contact.city),
    postalCode: asString(contact.postalCode),
    division: asString(contact.division),
    phone: asString(contact.phone),
    email: asString(contact.email),
    photoDataUrl: sanitizePhotoDataUrl(
      typeof contact.photoDataUrl === "string" ? contact.photoDataUrl : null
    ),
  }
}

function normalizeWorkHistory(value: unknown): WorkHistoryItem[] {
  if (!Array.isArray(value)) return EMPTY_RESUME_DRAFT.workHistory

  const items = value
    .filter((item): item is Record<string, unknown> => {
      return typeof item === "object" && item !== null
    })
    .map((item) => {
      const currentJob = asBoolean(item.currentJob)
      const responsibilities = asString(item.responsibilities)
        .replace(/\r\n/g, "\n")
        .split("\n")
        .map((line) => line.trim())
        .filter(Boolean)
        .map((line) => (line.startsWith("•") ? line : `• ${line.replace(/^[-*]\s*/, "")}`))
        .join("\n")

      return {
        id: generateId(),
        jobTitle: asString(item.jobTitle),
        employer: asString(item.employer),
        location: asString(item.location),
        remote: asBoolean(item.remote),
        startMonth: normalizeMonth(item.startMonth),
        startYear: normalizeYear(item.startYear),
        endMonth: currentJob ? "" : normalizeMonth(item.endMonth),
        endYear: currentJob ? "" : normalizeYear(item.endYear),
        currentJob,
        responsibilities,
      }
    })
    .filter(
      (item) =>
        item.jobTitle ||
        item.employer ||
        item.location ||
        item.responsibilities ||
        item.startYear ||
        item.endYear
    )

  return items.length > 0 ? items : EMPTY_RESUME_DRAFT.workHistory
}

function normalizeAwards(value: unknown): EducationAward[] {
  if (!Array.isArray(value)) return []

  return value
    .filter(
      (item): item is Record<string, unknown> =>
        typeof item === "object" && item !== null
    )
    .map((item) => ({
      id: generateId(),
      title: asString(item.title),
      issuer: asString(item.issuer),
      year: normalizeYear(item.year) || asString(item.year),
    }))
    .filter((award) => award.title || award.issuer || award.year)
}

function normalizeEducation(value: unknown): ResumeDraft["education"] {
  const education =
    value && typeof value === "object"
      ? (value as Record<string, unknown>)
      : {}

  const educationLevel = matchOptionValue(
    education.educationLevel,
    EDUCATION_LEVEL_VALUES,
    EDUCATION_LEVEL_ALIASES
  )

  const degree = matchOptionValue(
    education.degree,
    DEGREE_VALUES,
    DEGREE_ALIASES
  )

  return {
    educationLevel,
    institution: asString(education.institution),
    institutionLocation: asString(education.institutionLocation),
    degree,
    fieldOfStudy: asString(education.fieldOfStudy),
    graduationMonth: normalizeMonth(education.graduationMonth),
    graduationYear: normalizeYear(education.graduationYear),
    description: asString(education.description),
    projectUrl: sanitizeHttpsUrl(asString(education.projectUrl)),
    gpa: asString(education.gpa),
    awards: normalizeAwards(education.awards),
  }
}

function normalizeSkills(value: unknown): ResumeSkill[] {
  if (!Array.isArray(value)) return []

  const seen = new Set<string>()
  const skills: ResumeSkill[] = []

  for (const item of value) {
    const name =
      typeof item === "string"
        ? item.trim()
        : item && typeof item === "object"
          ? asString((item as Record<string, unknown>).name)
          : ""

    if (!name) continue

    const key = name.toLowerCase()
    if (seen.has(key)) continue
    seen.add(key)

    const ratingRaw =
      item && typeof item === "object"
        ? Number((item as Record<string, unknown>).rating)
        : 3

    skills.push({
      id: generateId(),
      name,
      rating: Number.isFinite(ratingRaw)
        ? Math.min(5, Math.max(1, Math.round(ratingRaw)))
        : 3,
    })
  }

  return skills
}

function normalizeLanguages(value: unknown): ResumeLanguage[] {
  if (!Array.isArray(value)) return []

  const seen = new Set<string>()
  const languages: ResumeLanguage[] = []

  for (const item of value) {
    if (!item || typeof item !== "object") continue

    const record = item as Record<string, unknown>
    const name = asString(record.name)
    if (!name) continue

    const key = name.toLowerCase()
    if (seen.has(key)) continue
    seen.add(key)

    const ratingRaw = Number(record.rating)
    const rating = Number.isFinite(ratingRaw)
      ? Math.min(4, Math.max(1, Math.round(ratingRaw)))
      : 2

    languages.push({ id: generateId(), name, rating })
  }

  return languages
}

function normalizeReferences(value: unknown): ResumeReference[] {
  if (!Array.isArray(value)) return []

  return value
    .filter(
      (item): item is Record<string, unknown> =>
        typeof item === "object" && item !== null
    )
    .map((item) => ({
      id: generateId(),
      name: asString(item.name),
      designation: asString(item.designation),
      organization: asString(item.organization),
      phone: asString(item.phone),
      email: asString(item.email),
    }))
    .filter(
      (ref) =>
        ref.name ||
        ref.designation ||
        ref.organization ||
        ref.phone ||
        ref.email
    )
}

export function normalizeParsedResume(raw: unknown): ResumeDraft {
  const payload = (raw ?? {}) as ParsedResumePayload
  const base = { ...EMPTY_RESUME_DRAFT, id: generateId() }

  return mergeResumeDraft(base, {
    contact: normalizeContact(payload.contact),
    summary: asString(payload.summary),
    workHistory: normalizeWorkHistory(payload.workHistory),
    education: normalizeEducation(payload.education),
    skills: normalizeSkills(payload.skills),
    languages: normalizeLanguages(payload.languages),
    references: normalizeReferences(payload.references),
  })
}

export async function parseResumePdf(
  buffer: ArrayBuffer
): Promise<ParseResumePdfResult> {
  const { text, pages } = await extractTextFromPdf(buffer)

  if (!text || text.length < 40) {
    throw new Error(
      "We couldn't read enough text from this PDF. Try a text-based resume file."
    )
  }

  const prompt = buildParseResumePrompt(text)
  const generated = await generateWithOllama(prompt)
  const parsed = extractJsonFromAiResponse(generated)

  return {
    draft: normalizeParsedResume(parsed),
    pages,
  }
}
