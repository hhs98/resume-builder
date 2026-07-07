"use client"

import { EducationAdditionalDetails } from "@/components/resume/education-additional-details"
import {
  formatMonthYear,
  formatWorkDates,
  getContactLocation,
  getDegreeLabel,
  getEducationLevelLabel,
  getFullName,
  getPreviewSkills,
  getPreviewWorkHistory,
  hasEducationContent,
  hasPreviewContact,
  hasPreviewSkills,
  hasPreviewWorkHistory,
  hasSummaryContent,
  type ResumeDraft,
  type ResumeTemplateId,
} from "@/lib/resume-draft"
import { ExecutiveSidebarPreview } from "@/components/resume/templates/executive-sidebar-preview"
import { ClassicRedPreview } from "@/components/resume/templates/classic-red-preview"
import { MinimalTwoColumnPreview } from "@/components/resume/templates/minimal-two-column-preview"
import { ModernGoldPreview } from "@/components/resume/templates/modern-gold-preview"
import { cn } from "@/lib/utils"
import type { ResumePreviewTone } from "@/lib/resume-preview-tone"

type ResumePreviewProps = {
  draft: ResumeDraft
  templateId?: ResumeTemplateId
  className?: string
  id?: string
  tone?: ResumePreviewTone
}

export function ResumePreview({
  draft,
  templateId = draft.templateId,
  className,
  id,
  tone = "default",
}: ResumePreviewProps) {
  const resolvedTemplateId =
    (templateId as string) === "executive-alt" ? "executive" : templateId

  const name = getFullName(draft) || "Your name"
  const location = getContactLocation(draft)
  const contactLine = [draft.contact.email, draft.contact.phone, location]
    .map((s) => s.trim())
    .filter(Boolean)

  const workHistory = getPreviewWorkHistory(draft)
  const skills = getPreviewSkills(draft)

  const gradDate = formatMonthYear(
    draft.education.graduationMonth,
    draft.education.graduationYear
  )

  const educationLines = [
    draft.education.institution,
    draft.education.fieldOfStudy,
    draft.education.degree ? getDegreeLabel(draft.education.degree) : "",
    gradDate,
    draft.education.institutionLocation,
  ].filter((s) => s.trim())

  const hasWork = hasPreviewWorkHistory(draft)
  const hasEducation = hasEducationContent(draft)
  const hasSkills = hasPreviewSkills(draft)
  const hasSummary = hasSummaryContent(draft)
  const hasContact = hasPreviewContact(draft)

  if (resolvedTemplateId === "executive") {
    return (
      <ExecutiveSidebarPreview
        draft={draft}
        className={className}
        id={id}
        tone={tone}
      />
    )
  }

  if (resolvedTemplateId === "modern") {
    return (
      <ModernGoldPreview draft={draft} className={className} id={id} tone={tone} />
    )
  }

  if (resolvedTemplateId === "classic") {
    return (
      <ClassicRedPreview draft={draft} className={className} id={id} tone={tone} />
    )
  }

  if (resolvedTemplateId === "minimal") {
    return (
      <MinimalTwoColumnPreview
        draft={draft}
        className={className}
        id={id}
        tone={tone}
      />
    )
  }

  return (
    <article
      id={id}
      data-resume-template={resolvedTemplateId}
      className={cn(
        "resume-preview mx-auto w-full max-w-[210mm] bg-white text-[11px] leading-relaxed text-neutral-900 shadow-sm",
        "min-h-[297mm] p-8 sm:p-10",
        className
      )}
    >
      <header className="flex gap-5">
        {draft.contact.photoDataUrl ? (
          // eslint-disable-next-line @next/next/no-img-element -- data URL preview
          <img
            src={draft.contact.photoDataUrl}
            alt=""
            className={cn("size-20 shrink-0 rounded-full object-cover")}
          />
        ) : null}
        <div className="min-w-0 flex-1">
          <h1 className="text-2xl font-bold tracking-tight">{name}</h1>
          {draft.contact.profession.trim() ? (
            <p className="mt-1 text-sm font-medium text-neutral-600">
              {draft.contact.profession}
            </p>
          ) : null}
          {contactLine.length > 0 && hasContact ? (
            <p className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-[10px] text-neutral-600">
              {contactLine.map((item, i) => (
                <span key={item}>
                  {i > 0 ? (
                    <span className="mr-3 text-neutral-400" aria-hidden>
                      |
                    </span>
                  ) : null}
                  {item}
                </span>
              ))}
            </p>
          ) : null}
        </div>
      </header>

      {hasSummary ? (
        <PreviewSection title="Summary">
          <p className="whitespace-pre-wrap">{draft.summary.trim()}</p>
        </PreviewSection>
      ) : null}

      {hasWork ? (
        <PreviewSection title="Experience">
          <div className="space-y-5">
            {workHistory.map((work) => {
              const workDates = formatWorkDates(work)

              const workLocation = [work.location, work.remote ? "Remote" : ""]
                .filter(Boolean)
                .join(" · ")

              const hasItem =
                work.jobTitle.trim() ||
                work.employer.trim() ||
                work.responsibilities.trim() ||
                workDates ||
                workLocation

              if (!hasItem) return null

              return (
                <div
                  key={work.id}
                  className="space-y-1 border-b border-neutral-200 pb-4 last:border-b-0 last:pb-0"
                >
                  {work.jobTitle.trim() ? (
                    <p className="font-semibold text-neutral-900">
                      {work.jobTitle}
                    </p>
                  ) : null}

                  {work.employer.trim() ? (
                    <p className="text-neutral-700">{work.employer}</p>
                  ) : null}

                  {(workDates || workLocation) && (
                    <p className="text-[10px] text-neutral-500">
                      {[workDates, workLocation].filter(Boolean).join(" · ")}
                    </p>
                  )}

                  {work.responsibilities.trim() ? (
                    <p className="whitespace-pre-wrap text-neutral-700">
                      {work.responsibilities}
                    </p>
                  ) : null}
                </div>
              )
            })}
          </div>
        </PreviewSection>
      ) : null}

      {hasEducation ? (
        <PreviewSection title="Education">
          <div className="space-y-1">
            {draft.education.educationLevel.trim() ? (
              <p className="font-semibold text-neutral-900">
                {getEducationLevelLabel(draft.education.educationLevel)}
              </p>
            ) : null}
            {educationLines.map((line) => (
              <p key={line} className="text-neutral-700">
                {line}
              </p>
            ))}
            <EducationAdditionalDetails draft={draft} className="mt-2" />
          </div>
        </PreviewSection>
      ) : null}

      {hasSkills ? (
        <PreviewSection title="Skills">
          <ul className="flex flex-wrap gap-2">
            {skills.map((skill) => (
              <li
                key={skill.id}
                className="rounded-md bg-neutral-100 px-2 py-0.5 text-[10px] text-neutral-800"
              >
                {skill.name}
              </li>
            ))}
          </ul>
        </PreviewSection>
      ) : null}

      {!hasSummary && !hasWork && !hasEducation && !hasSkills ? (
        <p className="py-12 text-center text-sm text-neutral-500">
          Fill in the builder steps to see your resume here.
        </p>
      ) : null}
    </article>
  )
}

function PreviewSection({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) {
  return (
    <section className={cn("mb-6 last:mb-0")}>
      <h2
        className={cn("mb-2 text-[10px] font-bold tracking-widest uppercase")}
      >
        {title}
      </h2>
      {children}
    </section>
  )
}
