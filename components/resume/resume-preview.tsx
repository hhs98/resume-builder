"use client"

import {
  formatMonthYear,
  formatWorkDates,
  getContactLocation,
  getDegreeLabel,
  getEducationLevelLabel,
  getFullName,
  type ResumeDraft,
  type ResumeTemplateId,
} from "@/lib/resume-draft"
import { ExecutiveSidebarPreview } from "@/components/resume/templates/executive-sidebar-preview"
import { ClassicRedPreview } from "@/components/resume/templates/classic-red-preview"
import { MinimalTwoColumnPreview } from "@/components/resume/templates/minimal-two-column-preview"
import { ModernGoldPreview } from "@/components/resume/templates/modern-gold-preview"
import { cn } from "@/lib/utils"

type ResumePreviewProps = {
  draft: ResumeDraft
  templateId?: ResumeTemplateId
  className?: string
  id?: string
}

export function ResumePreview({
  draft,
  templateId = draft.templateId,
  className,
  id,
}: ResumePreviewProps) {
  const name = getFullName(draft) || "Your name"
  const location = getContactLocation(draft)
  const contactLine = [
    draft.contact.email,
    draft.contact.phone,
    location,
  ]
    .map((s) => s.trim())
    .filter(Boolean)

  const workDates = formatWorkDates(draft)
  const workLocation = [
    draft.work.location,
    draft.work.remote ? "Remote" : "",
  ]
    .filter(Boolean)
    .join(" · ")

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

  const hasWork =
    draft.work.jobTitle.trim() ||
    draft.work.employer.trim() ||
    workDates ||
    workLocation

  const hasEducation =
    draft.education.educationLevel.trim() || educationLines.length > 0

  const hasSkills = draft.skills.length > 0
  const hasSummary = draft.summary.trim().length > 0

  if (templateId === "executive") {
    return (
      <ExecutiveSidebarPreview draft={draft} className={className} id={id} />
    )
  }

  if (templateId === "modern") {
    return <ModernGoldPreview draft={draft} className={className} id={id} />
  }

  if (templateId === "classic") {
    return <ClassicRedPreview draft={draft} className={className} id={id} />
  }

  if (templateId === "minimal") {
    return (
      <MinimalTwoColumnPreview draft={draft} className={className} id={id} />
    )
  }

  return (
    <article
      id={id}
      data-resume-template={templateId}
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
            className={cn(
              "size-20 shrink-0 rounded-full object-cover"
            )}
          />
        ) : null}
        <div className="min-w-0 flex-1">
          <h1 className="text-2xl font-bold tracking-tight">
            {name}
          </h1>
          {draft.contact.profession.trim() ? (
            <p className="mt-1 text-sm font-medium text-neutral-600">
              {draft.contact.profession}
            </p>
          ) : null}
          {contactLine.length > 0 ? (
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
          <div className="space-y-1">
            {draft.work.jobTitle.trim() ? (
              <p className="font-semibold text-neutral-900">
                {draft.work.jobTitle}
              </p>
            ) : null}
            {draft.work.employer.trim() ? (
              <p className="text-neutral-700">{draft.work.employer}</p>
            ) : null}
            {(workDates || workLocation) && (
              <p className="text-[10px] text-neutral-500">
                {[workDates, workLocation].filter(Boolean).join(" · ")}
              </p>
            )}
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
          </div>
        </PreviewSection>
      ) : null}

      {hasSkills ? (
        <PreviewSection title="Skills">
          <ul className="flex flex-wrap gap-2">
            {draft.skills.map((skill) => (
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
    <section
      className={cn(
        "mb-6 last:mb-0"
      )}
    >
      <h2
        className={cn(
          "mb-2 text-[10px] font-bold tracking-widest uppercase"
        )}
      >
        {title}
      </h2>
      {children}
    </section>
  )
}
