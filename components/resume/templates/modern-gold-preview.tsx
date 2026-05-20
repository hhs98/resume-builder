"use client"

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

const GOLD = "#d49000"
const CONTACT_BAR = "#f5f5f5"

type ModernGoldPreviewProps = {
  draft: ResumeDraft
  className?: string
  id?: string
}

export function ModernGoldPreview({
  draft,
  className,
  id,
}: ModernGoldPreviewProps) {
  const name = getFullName(draft) || "Your name"
  const address = getContactLocation(draft)
  const gradDate = formatGraduationCompact(draft)

  const workHistory = draft.workHistory || []

  const educationTitle =
    draft.education.degree.trim() !== ""
      ? getDegreeLabel(draft.education.degree)
      : draft.education.fieldOfStudy.trim() ||
        getEducationLevelLabel(draft.education.educationLevel)

  const educationOrg = [
    draft.education.institution,
    draft.education.institutionLocation,
  ]
    .filter(Boolean)
    .join(", ")

  const hasWork =
    Array.isArray(workHistory) &&
    workHistory.some(
      (w) =>
        w?.jobTitle?.trim() ||
        w?.employer?.trim() ||
        w?.responsibilities?.trim()
    )

  const hasEducation =
    educationTitle.trim() ||
    educationOrg.trim() ||
    gradDate ||
    draft.education.educationLevel.trim()

  const hasSkills = draft.skills.length > 0
  const hasSummary = draft.summary.trim().length > 0
  const hasContact =
    address || draft.contact.phone.trim() || draft.contact.email.trim()

  const isEmpty =
    !hasSummary && !hasWork && !hasEducation && !hasSkills && !hasContact

  return (
    <article
      id={id}
      data-resume-template="modern"
      className={cn(
        "resume-preview resume-preview--modern mx-auto w-full max-w-[210mm] overflow-hidden bg-white font-sans text-[11px] leading-relaxed text-neutral-800 shadow-sm",
        "min-h-[297mm]",
        className
      )}
    >
      {/* HEADER */}
      <header
        className="flex items-center gap-5 px-8 py-6"
        style={{ backgroundColor: GOLD }}
      >
        {draft.contact.photoDataUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={draft.contact.photoDataUrl}
            alt=""
            className="size-[72px] shrink-0 rounded-full object-cover ring-2 ring-white/50"
          />
        ) : (
          <span className="flex size-[72px] items-center justify-center rounded-full bg-white/20 text-lg font-bold text-white">
            {name
              .split(" ")
              .map((w) => w[0])
              .join("")
              .slice(0, 2)
              .toUpperCase()}
          </span>
        )}
        <h1 className="text-3xl font-bold tracking-tight text-white">{name}</h1>
      </header>

      {/* CONTACT */}
      {hasContact ? (
        <div
          className="grid grid-cols-[auto_1fr_auto] items-stretch px-8 py-4"
          style={{ backgroundColor: CONTACT_BAR }}
        >
          <div className="flex items-center pr-6">
            <p className="text-sm font-bold" style={{ color: GOLD }}>
              Contact
            </p>
          </div>

          <div className="grid flex-1 grid-cols-2 gap-x-8 gap-y-2 border-l border-neutral-300 pl-6">
            {address ? (
              <div>
                <p className="text-[10px] font-bold text-neutral-900">
                  Address
                </p>
                <p className="mt-0.5 text-[10px] text-neutral-800">{address}</p>
              </div>
            ) : (
              <span />
            )}

            {draft.contact.email.trim() ? (
              <div>
                <p className="text-[10px] font-bold text-neutral-900">E-mail</p>
                <p className="mt-0.5 text-[10px] text-neutral-800">
                  {draft.contact.email}
                </p>
              </div>
            ) : (
              <span />
            )}
          </div>

          {draft.contact.phone.trim() ? (
            <div className="border-l border-neutral-300 pl-6">
              <p className="text-[10px] font-bold text-neutral-900">Phone</p>
              <p className="mt-0.5 text-[10px] text-neutral-800">
                {draft.contact.phone}
              </p>
            </div>
          ) : null}
        </div>
      ) : null}

      {/* BODY */}
      <div className="space-y-6 px-8 py-6">
        {/* SUMMARY */}
        {hasSummary ? (
          <p className="text-[11px] leading-relaxed text-neutral-800">
            {draft.summary.trim()}
          </p>
        ) : null}

        {/* WORK HISTORY (MULTIPLE) */}
        {hasWork ? (
          <section>
            <SectionHeading title="Work History" />

            <div className="mt-4 space-y-6">
              {workHistory.map((work, index) => {
                const workDates = formatWorkDatesCompact({
                  workHistory: [work],
                } as any)

                const workOrgLine = [
                  work.employer,
                  [work.location, work.remote ? "Remote" : ""]
                    .filter(Boolean)
                    .join(", "),
                ]
                  .filter(Boolean)
                  .join(", ")

                return (
                  <div key={work.id || index} className="space-y-1">
                    <div className="grid grid-cols-[5.5rem_1fr] gap-x-4">
                      {workDates ? (
                        <p className="text-[10px] font-bold text-neutral-900">
                          {workDates}
                        </p>
                      ) : (
                        <span />
                      )}

                      <div>
                        {work.jobTitle?.trim() ? (
                          <p className="font-bold text-neutral-900">
                            {work.jobTitle}
                          </p>
                        ) : null}

                        {workOrgLine ? (
                          <p className="text-[11px] italic text-neutral-800">
                            {workOrgLine}
                          </p>
                        ) : null}

                        {work.responsibilities?.trim() ? (
                          <p className="mt-2 whitespace-pre-wrap text-[11px] text-neutral-700">
                            {work.responsibilities}
                          </p>
                        ) : null}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </section>
        ) : null}

        {/* SKILLS */}
        {hasSkills ? (
          <section>
            <SectionHeading title="Skills" />
            <ul className="mt-4 grid grid-cols-3 gap-x-6 gap-y-4">
              {draft.skills.map((skill) => (
                <li key={skill.id} className="min-w-0">
                  <p className="text-[10px] font-medium text-neutral-900">
                    {skill.name}
                  </p>
                  <div className="mt-1.5 h-1.5 w-full rounded-full bg-neutral-200">
                    <div
                      className="h-full rounded-full"
                      style={{
                        backgroundColor: GOLD,
                        width: `${(skill.rating / 5) * 100}%`,
                      }}
                    />
                  </div>
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        {/* EDUCATION */}
        {hasEducation ? (
          <section>
            <SectionHeading title="Education" />

            <div className="mt-4 grid grid-cols-[5.5rem_1fr] gap-x-4">
              {gradDate ? (
                <p className="text-[10px] font-bold text-neutral-900">
                  {gradDate}
                </p>
              ) : (
                <span />
              )}

              <div>
                {educationTitle ? (
                  <p className="font-bold text-neutral-900">
                    {educationTitle}
                  </p>
                ) : null}

                {educationOrg ? (
                  <p className="text-[11px] italic text-neutral-800">
                    {educationOrg}
                  </p>
                ) : null}
              </div>
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

/* helpers */
function SectionHeading({ title }: { title: string }) {
  return (
    <div>
      <h2 className="text-[13px] font-bold tracking-wide text-neutral-800">
        {title}
      </h2>
      <hr className="mt-2 border-neutral-300" />
    </div>
  )
}