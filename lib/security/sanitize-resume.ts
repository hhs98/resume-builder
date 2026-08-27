import {
  MAX_EDUCATION_ENTRIES,
  MAX_TRAINING_ENTRIES,
  MAX_TRAINING_PDF_BYTES,
  type ResumeDraft,
} from "@/lib/resume-draft"

export const MAX_PHOTO_DATA_URL_LENGTH = 2_800_000
/** ~5MB binary → ~6.8MB base64 data URL */
export const MAX_TRAINING_PDF_DATA_URL_LENGTH =
  Math.ceil(MAX_TRAINING_PDF_BYTES * (4 / 3)) + 64
export const MAX_RESUME_FIELD_LENGTH = 10_000
export const MAX_SUMMARY_LENGTH = 5_000

const ALLOWED_GENDERS = new Set([
  "male",
  "female",
  "other",
  "prefer-not-to-say",
])

const ALLOWED_COURSE_TYPES = new Set([
  "certificate",
  "diploma",
  "workshop",
  "online-course",
  "professional-training",
  "seminar",
  "other",
])

function sanitizeGender(value: string): string {
  const trimmed = value.trim().toLowerCase()
  return ALLOWED_GENDERS.has(trimmed) ? trimmed : ""
}

function sanitizeDateOfBirth(value: string): string {
  const trimmed = value.trim()
  return /^\d{4}-\d{2}-\d{2}$/.test(trimmed) ? trimmed : ""
}

function sanitizeCourseType(value: string): string {
  const trimmed = value.trim().toLowerCase()
  return ALLOWED_COURSE_TYPES.has(trimmed) ? trimmed : ""
}

export function sanitizeHttpsUrl(url: string): string {
  const trimmed = url.trim()
  if (!trimmed) return ""

  try {
    const parsed = new URL(trimmed)
    if (parsed.protocol !== "https:") return ""
    return parsed.toString()
  } catch {
    return ""
  }
}

export function sanitizePhotoDataUrl(value: string | null): string | null {
  if (!value) return null

  const trimmed = value.trim()
  if (!trimmed || trimmed.length > MAX_PHOTO_DATA_URL_LENGTH) return null
  if (!/^data:image\/(jpeg|jpg|png|webp);base64,/i.test(trimmed)) return null

  return trimmed
}

export function sanitizeTrainingPdfDataUrl(value: string | null): string | null {
  if (!value) return null

  const trimmed = value.trim()
  if (!trimmed || trimmed.length > MAX_TRAINING_PDF_DATA_URL_LENGTH) return null
  if (!/^data:application\/pdf;base64,/i.test(trimmed)) return null

  return trimmed
}

function clipText(value: string, max = MAX_RESUME_FIELD_LENGTH): string {
  return value.trim().slice(0, max)
}

export function sanitizeResumeDraftForSave(draft: ResumeDraft): ResumeDraft {
  return {
    ...draft,
    summary: clipText(draft.summary, MAX_SUMMARY_LENGTH),
    contact: {
      ...draft.contact,
      givenName: clipText(draft.contact.givenName),
      familyName: clipText(draft.contact.familyName),
      profession: clipText(draft.contact.profession),
      currentAddress: clipText(draft.contact.currentAddress ?? ""),
      city: clipText(draft.contact.city),
      postalCode: clipText(draft.contact.postalCode),
      division: clipText(draft.contact.division),
      dateOfBirth: sanitizeDateOfBirth(draft.contact.dateOfBirth ?? ""),
      gender: sanitizeGender(draft.contact.gender ?? ""),
      phone: clipText(draft.contact.phone, 32),
      email: clipText(draft.contact.email, 320),
      photoDataUrl: sanitizePhotoDataUrl(draft.contact.photoDataUrl),
    },
    education: draft.education
      .slice(0, MAX_EDUCATION_ENTRIES)
      .map((education) => ({
        ...education,
        description: clipText(education.description, MAX_SUMMARY_LENGTH),
        projectUrl: sanitizeHttpsUrl(education.projectUrl),
      })),
    trainings: (draft.trainings ?? [])
      .slice(0, MAX_TRAINING_ENTRIES)
      .map((training) => ({
        ...training,
        courseType: sanitizeCourseType(training.courseType),
        instituteName: clipText(training.instituteName),
        achievementMonth: clipText(training.achievementMonth, 8),
        achievementYear: clipText(training.achievementYear, 8),
        certificateFileName: clipText(training.certificateFileName, 255),
        certificatePdfDataUrl: sanitizeTrainingPdfDataUrl(
          training.certificatePdfDataUrl
        ),
      })),
    workHistory: draft.workHistory.map((work) => ({
      ...work,
      jobTitle: clipText(work.jobTitle),
      employer: clipText(work.employer),
      location: clipText(work.location),
      responsibilities: clipText(work.responsibilities, MAX_SUMMARY_LENGTH),
    })),
    skills: draft.skills.map((skill) => ({
      ...skill,
      name: clipText(skill.name, 200),
    })),
    languages: draft.languages.map((language) => ({
      ...language,
      name: clipText(language.name, 200),
    })),
    references: draft.references.map((reference) => ({
      ...reference,
      name: clipText(reference.name),
      designation: clipText(reference.designation),
      organization: clipText(reference.organization),
      phone: clipText(reference.phone, 32),
      email: clipText(reference.email, 320),
    })),
  }
}
