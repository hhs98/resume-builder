"use client"

import { Phone } from "lucide-react"

import {
  formatGraduationCompact,
  formatWorkDatesCompact,
  getContactLocation,
  getDegreeLabel,
  getEducationLevelLabel,
  getFullName,
  type ResumeDraft,
} from "@/lib/resume-draft"
import { cn } from "@/lib/utils"

const PINK = "#f8d4da"
const INK = "#334155"

type MinimalTwoColumnPreviewProps = {
  draft: ResumeDraft
  className?: string
  id?: string
}

export function MinimalTwoColumnPreview({
  draft,
  className,
  id,
}: MinimalTwoColumnPreviewProps) {
  const name = (getFullName(draft) || "Your name").toUpperCase()
  const address = getContactLocation(draft)
  const workDates = formatWorkDatesCompact(draft)
  const gradDate = formatGraduationCompact(draft)

  const workMetaLine = [
    [draft.work.location, draft.work.remote ? "Remote" : ""]
      .filter(Boolean)
      .join(", "),
    workDates,
  ]
    .filter(Boolean)
    .join(" · ")

  const educationMetaLine = [
    draft.education.institutionLocation,
    gradDate,
  ]
    .filter((s) => s.trim())
    .join(" · ")

  const degreeLine =
    draft.education.degree.trim() !== ""
      ? getDegreeLabel(draft.education.degree)
      : getEducationLevelLabel(draft.education.educationLevel)

  const hasContact =
    address || draft.contact.phone.trim() || draft.contact.email.trim()
  const hasSummary = draft.summary.trim().length > 0
  const hasWork =
    draft.work.employer.trim() ||
    draft.work.jobTitle.trim() ||
    workMetaLine
  const hasSkills = draft.skills.length > 0
  const hasEducation =
    draft.education.institution.trim() ||
    degreeLine.trim() ||
    draft.education.fieldOfStudy.trim() ||
    educationMetaLine

  const isEmpty =
    !hasContact && !hasSummary && !hasWork && !hasSkills && !hasEducation

  return (
    <article
      id={id}
      data-resume-template="minimal"
      className={cn(
        "resume-preview resume-preview--minimal mx-auto w-full max-w-[210mm] overflow-hidden bg-white shadow-sm",
        "min-h-[297mm] font-serif text-[11px] leading-relaxed",
        className
      )}
      style={{ color: INK }}
    >
      <div
        className="relative px-8 pb-7 pt-8"
        style={{ backgroundColor: PINK }}
      >
        <h1 className="max-w-[70%] font-serif text-[28px] leading-tight font-bold tracking-wide uppercase">
          {name}
        </h1>
        {draft.contact.photoDataUrl ? (
          // eslint-disable-next-line @next/next/no-img-element -- data URL preview
          <img
            src={draft.contact.photoDataUrl}
            alt=""
            className="absolute top-5 right-8 size-[88px] rounded-full object-cover ring-4 ring-white"
          />
        ) : (
          <span
            className="absolute top-5 right-8 flex size-[88px] items-center justify-center rounded-full bg-white/60 font-sans text-lg font-semibold text-slate-600 ring-4 ring-white"
            aria-hidden
          >
            {name
              .split(" ")
              .map((w) => w[0])
              .join("")
              .slice(0, 2)}
          </span>
        )}
      </div>

      {hasContact ? (
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 border-b border-neutral-200 px-8 py-2.5 text-[10px]">
          {draft.contact.email.trim() ? (
            <span>
              <span className="font-sans font-bold">E:</span>{" "}
              {draft.contact.email}
            </span>
          ) : null}
          {draft.contact.email.trim() && draft.contact.phone.trim() ? (
            <span className="text-neutral-400" aria-hidden>
              |
            </span>
          ) : null}
          {draft.contact.phone.trim() ? (
            <span className="inline-flex items-center gap-1">
              <Phone className="size-3 shrink-0" strokeWidth={2} aria-hidden />
              {draft.contact.phone}
            </span>
          ) : null}
          {(draft.contact.email.trim() || draft.contact.phone.trim()) &&
          address ? (
            <span className="text-neutral-400" aria-hidden>
              |
            </span>
          ) : null}
          {address ? (
            <span>
              <span className="font-sans font-bold">A:</span> {address}
            </span>
          ) : null}
        </div>
      ) : null}

      <div className="grid grid-cols-[minmax(0,2fr)_minmax(0,1fr)] gap-8 px-8 py-6">
        <div className="min-w-0 space-y-6">
          {hasSummary ? (
            <section>
              <MinimalSectionHeader title="Professional Summary" />
              <p className="mt-3 whitespace-pre-wrap text-[11px] leading-relaxed">
                {draft.summary.trim()}
              </p>
            </section>
          ) : null}

          {hasWork ? (
            <section>
              <MinimalSectionHeader title="Work History" />
              <div className="mt-3 space-y-1">
                {draft.work.employer.trim() ? (
                  <p className="font-bold">{draft.work.employer}</p>
                ) : null}
                {draft.work.jobTitle.trim() ? (
                  <p className="italic">{draft.work.jobTitle}</p>
                ) : null}
                {workMetaLine ? (
                  <p className="text-[10px] text-slate-600">{workMetaLine}</p>
                ) : null}
              </div>
            </section>
          ) : null}

          {isEmpty && !hasSkills && !hasEducation ? (
            <p className="py-8 text-center text-sm text-neutral-500">
              Fill in the builder steps to see your resume here.
            </p>
          ) : null}
        </div>

        <aside className="min-w-0 space-y-6">
          {hasSkills ? (
            <section>
              <MinimalSectionHeader title="Skills" />
              <ul className="mt-3 space-y-2.5">
                {draft.skills.map((skill) => (
                  <li
                    key={skill.id}
                    className="flex items-center justify-between gap-2 text-[10px]"
                  >
                    <span className="min-w-0 leading-snug">{skill.name}</span>
                    <SegmentedRating value={skill.rating} />
                  </li>
                ))}
              </ul>
            </section>
          ) : null}

          {hasEducation ? (
            <section>
              <MinimalSectionHeader title="Education" />
              <div className="mt-3 space-y-1">
                {draft.education.institution.trim() ? (
                  <p className="font-bold">{draft.education.institution}</p>
                ) : null}
                {educationMetaLine ? (
                  <p className="text-[10px] text-slate-600">
                    {educationMetaLine}
                  </p>
                ) : null}
                {degreeLine.trim() ? (
                  <p className="font-bold italic">{degreeLine}</p>
                ) : null}
                {draft.education.fieldOfStudy.trim() ? (
                  <p className="text-[10px]">{draft.education.fieldOfStudy}</p>
                ) : null}
              </div>
            </section>
          ) : null}
        </aside>
      </div>
    </article>
  )
}

function MinimalSectionHeader({ title }: { title: string }) {
  return (
    <div>
      <h2 className="font-sans text-[11px] font-bold tracking-[0.12em] text-slate-800 uppercase">
        {title}
      </h2>
      <hr className="mt-1.5 border-neutral-300" />
    </div>
  )
}

function SegmentedRating({ value }: { value: number }) {
  return (
    <span className="inline-flex shrink-0 gap-px" aria-hidden>
      {[1, 2, 3, 4, 5].map((n) => (
        <span
          key={n}
          className="h-2 w-2.5"
          style={{
            backgroundColor: n <= value ? PINK : "#e5e7eb",
          }}
        />
      ))}
    </span>
  )
}
