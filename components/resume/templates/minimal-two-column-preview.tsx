"use client"

import { Phone } from "lucide-react"

import { EducationAdditionalDetails } from "@/components/resume/education-additional-details"
import {
  formatGraduationCompact,
  formatWorkItemDates,
  getContactLocation,
  getDegreeLabel,
  getEducationLevelLabel,
  getFullName,
  getPreviewLanguages,
  getPreviewReferences,
  getPreviewSkills,
  getPreviewWorkHistory,
  hasEducationContent,
  hasPreviewContact,
  hasPreviewLanguages,
  hasPreviewReferences,
  hasPreviewSkills,
  hasPreviewWorkHistory,
  hasSummaryContent,
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
  const gradDate = formatGraduationCompact(draft)

  const workHistory = getPreviewWorkHistory(draft)
  const skills = getPreviewSkills(draft)
  const languages = getPreviewLanguages(draft)
  const references = getPreviewReferences(draft)

  const hasWork = hasPreviewWorkHistory(draft)
  const hasContact = hasPreviewContact(draft)
  const hasSummary = hasSummaryContent(draft)
  const hasSkills = hasPreviewSkills(draft)

  const degreeLine =
    draft.education.degree.trim() !== ""
      ? getDegreeLabel(draft.education.degree)
      : getEducationLevelLabel(draft.education.educationLevel)

  const educationMetaLine = [
    draft.education.institutionLocation,
    gradDate,
  ]
    .filter(Boolean)
    .join(" · ")

  const hasEducation = hasEducationContent(draft)
  const hasReferences = hasPreviewReferences(draft)
  const hasLanguages = hasPreviewLanguages(draft)

  const isEmpty =
    !hasContact &&
    !hasSummary &&
    !hasWork &&
    !hasSkills &&
    !hasEducation &&
    !hasReferences &&
    !hasLanguages

  return (
    <article
      id={id}
      data-resume-template="minimal"
      className={cn(
        "resume-preview resume-preview--minimal mx-auto w-full max-w-[210mm] bg-white shadow-sm",
        "min-h-[297mm] font-serif text-[11px] leading-relaxed",
        className
      )}
      style={{ color: INK }}
    >
      {/* HEADER */}
      <div className="relative px-8 pt-8 pb-7" style={{ backgroundColor: PINK }}>
        <h1 className="text-[28px] font-bold uppercase tracking-wide">
          {name}
        </h1>

        {draft.contact.photoDataUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={draft.contact.photoDataUrl}
            alt=""
            className="absolute top-5 right-8 size-[88px] rounded-full object-cover ring-4 ring-white"
          />
        ) : (
          <span className="absolute top-5 right-8 flex size-[88px] items-center justify-center rounded-full bg-white/60 text-lg font-semibold ring-4 ring-white">
            {name
              .split(" ")
              .map((w) => w[0])
              .join("")
              .slice(0, 2)}
          </span>
        )}
      </div>

      {/* CONTACT */}
      {hasContact ? (
        <div className="flex flex-wrap gap-x-3 gap-y-1 border-b px-8 py-2.5 text-[10px]">
          {draft.contact.email && (
            <span>
              <b>E:</b> {draft.contact.email}
            </span>
          )}
          {draft.contact.phone && (
            <span className="inline-flex items-center gap-1">
              <Phone className="size-3" />
              {draft.contact.phone}
            </span>
          )}
          {address && (
            <span>
              <b>A:</b> {address}
            </span>
          )}
        </div>
      ) : null}

      <div className="grid grid-cols-[2fr_1fr] gap-8 px-8 py-6">
        {/* LEFT */}
        <div className="space-y-6">
          {hasSummary && (
            <section>
              <SectionHeader title="Professional Summary" />
              <p className="mt-3 whitespace-pre-wrap">{draft.summary}</p>
            </section>
          )}

          {/* WORK HISTORY */}
          {hasWork && (
            <section>
              <SectionHeader title="Work History" />

              <div className="mt-3 space-y-5">
                {workHistory.map((work, index) => {
                  const dates = formatWorkItemDates(work)

                  return (
                    <div key={work.id || index} className="space-y-1">
                      <p className="font-bold">{work.employer}</p>

                      <p className="italic">{work.jobTitle}</p>

                      {dates && (
                        <p className="text-[10px] text-slate-600">
                          {dates}
                        </p>
                      )}

                      {work.responsibilities && (
                        <p className="whitespace-pre-wrap text-slate-700">
                          {work.responsibilities}
                        </p>
                      )}
                    </div>
                  )
                })}
              </div>
            </section>
          )}
        </div>

        {/* RIGHT */}
        <aside className="space-y-6">
          {hasSkills && (
            <section>
              <SectionHeader title="Skills" />
              <ul className="mt-3 space-y-2">
                {skills.map((skill) => (
                  <li key={skill.id} className="flex justify-between text-[10px]">
                    {skill.name}
                    <SegmentedRating value={skill.rating} />
                  </li>
                ))}
              </ul>
            </section>
          )}

          {hasLanguages && (
            <section>
              <SectionHeader title="Languages" />
              <ul className="mt-3 space-y-2">
                {languages.map((lang) => (
                  <li key={lang.id} className="flex justify-between text-[10px]">
                    {lang.name}
                    <SegmentedRating value={lang.rating} max={4} />
                  </li>
                ))}
              </ul>
            </section>
          )}

          {hasEducation && (
            <section>
              <SectionHeader title="Education" />
              <div className="mt-3 space-y-1">
                <p className="font-bold">{draft.education.institution}</p>
                <p className="text-[10px] text-slate-600">
                  {educationMetaLine}
                </p>
                <p className="italic">{degreeLine}</p>
                <EducationAdditionalDetails
                  draft={draft}
                  className="mt-2"
                  textClassName="text-[10px] text-slate-700"
                  linkClassName="text-[10px] text-slate-800 underline underline-offset-2"
                />
              </div>
            </section>
          )}

          {hasReferences && (
            <section>
              <SectionHeader title="References" />
              <div className="mt-3 space-y-4">
                {references.map((ref) => (
                  <div key={ref.id} className="space-y-0.5">
                    <p className="font-bold text-[10px]">{ref.name}</p>
                    <p className="text-[9px] italic">
                      {ref.designation}, {ref.organization}
                    </p>
                    <p className="text-[9px]">P: {ref.phone}</p>
                    {ref.email && <p className="text-[9px]">E: {ref.email}</p>}
                  </div>
                ))}
              </div>
            </section>
          )}
        </aside>
      </div>

      {isEmpty && (
        <p className="py-12 text-center text-sm text-neutral-500">
          Fill in the builder steps to see your resume here.
        </p>
      )}
    </article>
  )
}

function SectionHeader({ title }: { title: string }) {
  return (
    <h2 className="text-[11px] font-bold uppercase tracking-[0.12em]">
      {title}
    </h2>
  )
}

function SegmentedRating({ value, max = 5 }: { value: number; max?: number }) {
  return (
    <span className="inline-flex gap-px">
      {Array.from({ length: max }).map((_, i) => {
        const n = i + 1
        return (
          <span
            key={n}
            className="h-2 w-2.5"
            style={{
              backgroundColor: n <= value ? PINK : "#e5e7eb",
            }}
          />
        )
      })}
    </span>
  )
}
