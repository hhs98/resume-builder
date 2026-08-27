import { NextResponse } from "next/server"

import { prisma } from "@/lib/prisma"
import { MAX_EDUCATION_ENTRIES, MAX_TRAINING_ENTRIES, type ResumeDraft } from "@/lib/resume-draft"
import { requireDownloadPermit } from "@/lib/security/download-permit"
import { enforceRateLimit } from "@/lib/security/rate-limit-api"
import { sanitizeResumeDraftForSave } from "@/lib/security/sanitize-resume"

export async function POST(req: Request) {
  const rateLimited = enforceRateLimit(
    req,
    "resume-create",
    { limit: 10, windowMs: 60 * 60 * 1000 },
    "Too many resume saves. Please try again later."
  )
  if (rateLimited) return rateLimited

  const permit = requireDownloadPermit(req)
  if (!permit) {
    return NextResponse.json(
      { error: "A valid download permit is required. Verify your phone number first." },
      { status: 401 }
    )
  }

  try {
    const body = (await req.json()) as ResumeDraft
    const draft = sanitizeResumeDraftForSave(body)

    const resume = await prisma.resume.create({
      data: {
        templateId: draft.templateId,
        givenName: draft.contact.givenName,
        familyName: draft.contact.familyName,
        profession: draft.contact.profession,
        currentAddress: draft.contact.currentAddress || null,
        city: draft.contact.city,
        postalCode: draft.contact.postalCode,
        division: draft.contact.division,
        dateOfBirth: draft.contact.dateOfBirth || null,
        gender: draft.contact.gender || null,
        phone: draft.contact.phone,
        email: draft.contact.email,
        photoDataUrl: draft.contact.photoDataUrl,
        summary: draft.summary,
        education: {
          create: draft.education
            .slice(0, MAX_EDUCATION_ENTRIES)
            .map((education) => ({
              educationLevel: education.educationLevel,
              institution: education.institution,
              institutionLocation: education.institutionLocation,
              degree: education.degree,
              fieldOfStudy: education.fieldOfStudy,
              graduationMonth: education.graduationMonth,
              graduationYear: education.graduationYear,
              description: education.description || null,
              projectUrl: education.projectUrl || null,
              gpa: education.gpa || null,
              awards: education.awards,
            })),
        },
        trainings: {
          create: (draft.trainings ?? [])
            .slice(0, MAX_TRAINING_ENTRIES)
            .filter(
              (training) =>
                training.courseType.trim() ||
                training.instituteName.trim() ||
                training.achievementMonth ||
                training.achievementYear ||
                training.certificateFileName.trim() ||
                training.certificatePdfDataUrl
            )
            .map((training) => ({
              courseType: training.courseType,
              instituteName: training.instituteName,
              achievementMonth: training.achievementMonth,
              achievementYear: training.achievementYear,
              certificateFileName: training.certificateFileName || null,
              certificatePdfDataUrl: training.certificatePdfDataUrl,
            })),
        },
        workHistory: {
          create: draft.workHistory.map((work) => ({
            jobTitle: work.jobTitle,
            employer: work.employer,
            location: work.location,
            remote: work.remote,
            startMonth: work.startMonth,
            startYear: work.startYear,
            endMonth: work.endMonth,
            endYear: work.endYear,
            currentJob: work.currentJob,
            responsibilities: work.responsibilities,
          })),
        },
        skills: {
          create: draft.skills.map((skill) => ({
            name: skill.name,
            rating: skill.rating,
          })),
        },
        languages: {
          create: draft.languages.map((lang) => ({
            name: lang.name,
            rating: lang.rating,
          })),
        },
        references: {
          create: draft.references.map((ref) => ({
            name: ref.name,
            designation: ref.designation,
            organization: ref.organization,
            phone: ref.phone,
            email: ref.email,
          })),
        },
      },
    })

    return NextResponse.json({
      success: true,
      id: resume.id,
    })
  } catch (error) {
    console.error("Failed to save resume:", error)

    const message =
      process.env.NODE_ENV === "development" && error instanceof Error
        ? error.message
        : "Failed to save resume"

    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    )
  }
}
