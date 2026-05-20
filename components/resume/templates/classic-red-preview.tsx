"use client"

import {
  formatGraduationCompact,
  formatWorkDatesCompact,
  formatWorkItemDates,
  getContactLocation,
  getDegreeLabel,
  getEducationLevelLabel,
  getFullName,
  type ResumeDraft,
} from "@/lib/resume-draft"
import { cn } from "@/lib/utils"

const RED = "#c41e3a"
const PINK = "#f8d4da"

type ClassicRedPreviewProps = {
  draft: ResumeDraft & {
    workHistory?: any[]
  }
  className?: string
  id?: string
}

export function ClassicRedPreview({
  draft,
  className,
  id,
}: ClassicRedPreviewProps) {
  const name = (getFullName(draft) || "Your name").toUpperCase()
  const address = getContactLocation(draft)
  const gradDate = formatGraduationCompact(draft)

  const workHistory = draft.workHistory || []

  const educationDegreeLine = [
    draft.education.degree.trim()
      ? getDegreeLabel(draft.education.degree)
      : draft.education.fieldOfStudy.trim() ||
        getEducationLevelLabel(draft.education.educationLevel),
    gradDate,
  ]
    .filter(Boolean)
    .join(", ")

  const educationOrgLine = [
    draft.education.institution,
    draft.education.institutionLocation,
  ]
    .filter((s) => s.trim())
    .join(", ")

  const hasContact =
    address || draft.contact.phone.trim() || draft.contact.email.trim()

  const hasSummary = draft.summary.trim().length > 0
  const hasEducation = educationDegreeLine.trim() || educationOrgLine.trim()
  const hasSkills = draft.skills.length > 0
  const hasWork = workHistory.length > 0

  const isEmpty =
    !hasContact && !hasSummary && !hasEducation && !hasSkills && !hasWork

  return (
    <article
      id={id}
      data-resume-template="classic"
      className={cn(
        "resume-preview resume-preview--classic mx-auto w-full max-w-[210mm] bg-white font-sans text-[11px] leading-relaxed text-neutral-800 shadow-sm",
        "min-h-[297mm]",
        className
      )}
    >
      <div className="h-3 w-full" style={{ backgroundColor: PINK }} />

      {/* HEADER */}
      <header className="flex flex-col items-center px-10 pt-6 pb-2 text-center">
        {draft.contact.photoDataUrl ? (
          <img
            src={draft.contact.photoDataUrl}
            alt=""
            className="size-[100px] object-cover"
          />
        ) : (
          <span
            className="flex size-[100px] items-center justify-center bg-neutral-100 text-xl font-bold text-neutral-500"
            aria-hidden
          >
            {name
              .split(" ")
              .map((w) => w[0])
              .join("")
              .slice(0, 2)}
          </span>
        )}

        <h1
          className="mt-4 text-2xl font-bold tracking-[0.2em]"
          style={{ color: RED }}
        >
          {name}
        </h1>
      </header>

      <RedDivider className="mx-10" />

      <div className="space-y-0 px-10 pb-8">
        {/* CONTACT */}
        {hasContact ? (
          <section>
            <SectionHeader title="Contact" />
            <div className="mt-3 grid grid-cols-3 gap-4 text-[10px]">
              {address ? (
                <div>
                  <p className="font-bold text-neutral-900">Address</p>
                  <p className="mt-0.5 text-neutral-800">{address}</p>
                </div>
              ) : (
                <span />
              )}

              {draft.contact.phone.trim() ? (
                <div>
                  <p className="font-bold text-neutral-900">Phone</p>
                  <p className="mt-0.5 text-neutral-800">
                    {draft.contact.phone}
                  </p>
                </div>
              ) : (
                <span />
              )}

              {draft.contact.email.trim() ? (
                <div>
                  <p className="font-bold text-neutral-900">Email</p>
                  <p className="mt-0.5 text-neutral-800">
                    {draft.contact.email}
                  </p>
                </div>
              ) : (
                <span />
              )}
            </div>
            <RedDivider />
          </section>
        ) : null}

        {/* SUMMARY */}
        {hasSummary ? (
          <section>
            <SectionHeader title="Resume Objective" />
            <p className="mt-3 text-[11px] leading-relaxed whitespace-pre-wrap text-neutral-800">
              {draft.summary.trim()}
            </p>
            <RedDivider />
          </section>
        ) : null}

        {/* EDUCATION */}
        {hasEducation ? (
          <section>
            <SectionHeader title="Education" />
            <div className="mt-3 space-y-3">
              {educationDegreeLine ? (
                <p className="text-[11px] text-neutral-800">
                  {educationDegreeLine}
                </p>
              ) : null}

              {educationOrgLine ? (
                <p className="text-[11px] font-bold text-neutral-900">
                  {educationOrgLine}
                </p>
              ) : null}
            </div>
            <RedDivider />
          </section>
        ) : null}

        {/* SKILLS */}
        {hasSkills ? (
          <section>
            <SectionHeader title="Skills" />
            <ul className="mt-3 grid grid-cols-3 gap-x-4 gap-y-3">
              {draft.skills.map((skill) => (
                <li
                  key={skill.id}
                  className="flex items-center gap-1.5 text-[10px] text-neutral-900"
                >
                  <span className="min-w-0 flex-1 leading-snug">
                    {skill.name}
                  </span>
                  <SkillDots rating={skill.rating} />
                </li>
              ))}
            </ul>
            <RedDivider />
          </section>
        ) : null}

        {/* WORK HISTORY (FIXED MULTI) */}
        {hasWork ? (
  <section>
    <SectionHeader title="Work History" />

    <div className="mt-3 space-y-6">
      {workHistory.map((work, index) => {
        const workDates = formatWorkItemDates(work)

        const titleLine = [
          work.jobTitle?.trim(),
          workDates,
        ]
          .filter(Boolean)
          .join(", ")

        const companyLine = [
          work.employer,
          [work.location, work.remote ? "Remote" : ""]
            .filter(Boolean)
            .join(", "),
        ]
          .filter((s) => s?.trim())
          .join(", ")

        return (
          <div key={work.id || index} className="space-y-1">
            {titleLine && (
              <p className="text-[11px] text-neutral-800">
                {titleLine}
              </p>
            )}

            {companyLine && (
              <p className="text-[11px] font-bold text-neutral-900">
                {companyLine}
              </p>
            )}

            {work.responsibilities?.trim() && (
              <p className="text-[11px] whitespace-pre-wrap text-neutral-800">
                {work.responsibilities}
              </p>
            )}
          </div>
        )
      })}
    </div>
  </section>
) : null}

        {/* EMPTY STATE */}
        {isEmpty ? (
          <p className="py-12 text-center text-sm text-neutral-500">
            Fill in the builder steps to see your resume here.
          </p>
        ) : null}
      </div>
    </article>
  )
}

/* helpers unchanged */

function SectionHeader({ title }: { title: string }) {
  return (
    <div className="flex min-h-[1.25rem] items-center">
      <h2
        className="shrink-0 pr-2 text-[11px] font-bold tracking-widest uppercase"
        style={{ color: RED }}
      >
        {title}
      </h2>
      <div className="h-3 min-w-0 flex-1" style={{ backgroundColor: PINK }} />
    </div>
  )
}

function RedDivider({ className }: { className?: string }) {
  return (
    <hr
      className={cn("my-4 border-0 border-t", className)}
      style={{ borderColor: RED }}
    />
  )
}

function SkillDots({ rating }: { rating: number }) {
  return (
    <span className="inline-flex shrink-0 gap-0.5" aria-hidden>
      {[1, 2, 3, 4, 5].map((n) => (
        <span
          key={n}
          className="size-2 rounded-full border"
          style={{
            borderColor: RED,
            backgroundColor: n <= rating ? RED : "transparent",
          }}
        />
      ))}
    </span>
  )
}
