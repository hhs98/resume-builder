import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import type { ResumeDraft } from "@/lib/resume-draft"

export async function POST(req: Request) {
  try {
    const draft: ResumeDraft = await req.json()

    const resume = await prisma.resume.create({
      data: {
        templateId: draft.templateId,
        givenName: draft.contact.givenName,
        familyName: draft.contact.familyName,
        profession: draft.contact.profession,
        city: draft.contact.city,
        postalCode: draft.contact.postalCode,
        division: draft.contact.division,
        phone: draft.contact.phone,
        email: draft.contact.email,
        photoDataUrl: draft.contact.photoDataUrl,
        summary: draft.summary,
        education: {
          create: {
            educationLevel: draft.education.educationLevel,
            institution: draft.education.institution,
            institutionLocation: draft.education.institutionLocation,
            degree: draft.education.degree,
            fieldOfStudy: draft.education.fieldOfStudy,
            graduationMonth: draft.education.graduationMonth,
            graduationYear: draft.education.graduationYear,
            description: draft.education.description || null,
            projectUrl: draft.education.projectUrl || null,
            gpa: draft.education.gpa || null,
            awards: draft.education.awards,
          },
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

    return NextResponse.json({ success: true, id: resume.id })
  } catch (error) {
    console.error("Failed to save resume:", error)
    return NextResponse.json({ success: false, error: "Failed to save resume" }, { status: 500 })
  }
}
