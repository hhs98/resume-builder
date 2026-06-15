import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const resume = await prisma.resume.findUnique({
      where: { id },
      include: {
        education: true,
        workHistory: true,
        skills: true,
        languages: true,
        references: true,
      },
    })

    if (!resume) {
      return NextResponse.json({ error: "Resume not found" }, { status: 404 })
    }

    // Transform database model back to ResumeDraft format
    const draft = {
      templateId: resume.templateId,
      contact: {
        givenName: resume.givenName,
        familyName: resume.familyName,
        profession: resume.profession,
        city: resume.city,
        postalCode: resume.postalCode,
        division: resume.division,
        phone: resume.phone,
        email: resume.email,
        photoDataUrl: resume.photoDataUrl,
      },
      summary: resume.summary || "",
      education: resume.education
        ? {
            educationLevel: resume.education.educationLevel,
            institution: resume.education.institution,
            institutionLocation: resume.education.institutionLocation,
            degree: resume.education.degree,
            fieldOfStudy: resume.education.fieldOfStudy,
            graduationMonth: resume.education.graduationMonth,
            graduationYear: resume.education.graduationYear,
          }
        : {
            educationLevel: "",
            institution: "",
            institutionLocation: "",
            degree: "",
            fieldOfStudy: "",
            graduationMonth: "",
            graduationYear: "",
          },
      workHistory: resume.workHistory.map((work) => ({
        id: work.id,
        jobTitle: work.jobTitle,
        employer: work.employer,
        location: work.location,
        remote: work.remote,
        startMonth: work.startMonth,
        startYear: work.startYear,
        endMonth: work.endMonth || "",
        endYear: work.endYear || "",
        currentJob: work.currentJob,
        responsibilities: work.responsibilities || "",
      })),
      skills: resume.skills.map((skill) => ({
        id: skill.id,
        name: skill.name,
        rating: skill.rating,
      })),
      languages: resume.languages.map((lang) => ({
        id: lang.id,
        name: lang.name,
        rating: lang.rating,
      })),
      references: resume.references.map((ref) => ({
        id: ref.id,
        name: ref.name,
        designation: ref.designation,
        organization: ref.organization,
        phone: ref.phone,
        email: ref.email,
        address: ref.address,
      })),
    }

    return NextResponse.json(draft)
  } catch (error) {
    console.error("Failed to fetch resume:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
