import { NextResponse } from "next/server"

import { prisma } from "@/lib/prisma"
import {
  createEmptyEducationItem,
  createEmptyTrainingItem,
  parseEducationAwards,
} from "@/lib/resume-draft"

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const resume = await prisma.resume.findUnique({
      where: { id },
      include: {
        education: true,
        trainings: true,
        workHistory: true,
        skills: true,
        languages: true,
        references: true,
      },
    })

    if (!resume) {
      return NextResponse.json({ error: "Resume not found" }, { status: 404 })
    }

    const draft = {
      templateId: resume.templateId,
      contact: {
        givenName: resume.givenName,
        familyName: resume.familyName,
        profession: resume.profession,
        currentAddress: resume.currentAddress || "",
        city: resume.city,
        postalCode: resume.postalCode,
        division: resume.division,
        dateOfBirth: resume.dateOfBirth || "",
        gender: resume.gender || "",
        phone: resume.phone,
        email: resume.email,
        photoDataUrl: resume.photoDataUrl,
      },
      summary: resume.summary || "",
      education:
        resume.education.length > 0
          ? resume.education.map((education) => ({
              id: education.id,
              educationLevel: education.educationLevel,
              institution: education.institution,
              institutionLocation: education.institutionLocation,
              degree: education.degree,
              fieldOfStudy: education.fieldOfStudy,
              graduationMonth: education.graduationMonth,
              graduationYear: education.graduationYear,
              description: education.description || "",
              projectUrl: education.projectUrl || "",
              gpa: education.gpa || "",
              awards: parseEducationAwards(education.awards),
            }))
          : [createEmptyEducationItem()],
      trainings:
        resume.trainings.length > 0
          ? resume.trainings.map((training) => ({
              id: training.id,
              courseType: training.courseType,
              instituteName: training.instituteName,
              achievementMonth: training.achievementMonth,
              achievementYear: training.achievementYear,
              certificateFileName: training.certificateFileName || "",
              certificatePdfDataUrl: training.certificatePdfDataUrl,
            }))
          : [createEmptyTrainingItem()],
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
      })),
    }

    return NextResponse.json(draft)
  } catch (error) {
    console.error("Failed to fetch resume:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
