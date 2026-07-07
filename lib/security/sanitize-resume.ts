import type { ResumeDraft } from "@/lib/resume-draft"

export const MAX_PHOTO_DATA_URL_LENGTH = 2_800_000
export const MAX_RESUME_FIELD_LENGTH = 10_000
export const MAX_SUMMARY_LENGTH = 5_000

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
      city: clipText(draft.contact.city),
      postalCode: clipText(draft.contact.postalCode),
      division: clipText(draft.contact.division),
      phone: clipText(draft.contact.phone, 32),
      email: clipText(draft.contact.email, 320),
      photoDataUrl: sanitizePhotoDataUrl(draft.contact.photoDataUrl),
    },
    education: {
      ...draft.education,
      description: clipText(draft.education.description, MAX_SUMMARY_LENGTH),
      projectUrl: sanitizeHttpsUrl(draft.education.projectUrl),
    },
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
