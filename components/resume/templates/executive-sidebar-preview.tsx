"use client"

import {
  formatWorkDatesCompact,
  formatGraduationCompact,
  getContactLocation,
  getDegreeLabel,
  getEducationLevelLabel,
  getFullName,
  type ResumeDraft,
} from "@/lib/resume-draft"
import { cn } from "@/lib/utils"

const SIDEBAR_GREEN = "#1a5c38"
const SIDEBAR_HEADER_GREEN = "#2a6b47"

type ExecutiveSidebarPreviewProps = {
  draft: ResumeDraft
  className?: string
  id?: string
}

export function ExecutiveSidebarPreview({
  draft,
  className,
  id,
}: ExecutiveSidebarPreviewProps) {
  const name = getFullName(draft) || "Your name"
  const address = getContactLocation(draft)
  const workDates = formatWorkDatesCompact(draft)
  const gradDate = formatGraduationCompact(draft)

  const workLocation = [
    draft.work.employer,
    [draft.work.location, draft.work.remote ? "Remote" : ""]
      .filter(Boolean)
      .join(", "),
  ]
    .filter((s) => s.trim())
    .join(", ")

  const educationTitle =
    draft.education.degree.trim() !== ""
      ? getDegreeLabel(draft.education.degree)
      : draft.education.fieldOfStudy.trim() ||
        getEducationLevelLabel(draft.education.educationLevel)

  const educationOrg = [
    draft.education.institution,
    draft.education.institutionLocation,
  ]
    .filter((s) => s.trim())
    .join(", ")

  const hasWork =
    draft.work.jobTitle.trim() ||
    draft.work.employer.trim() ||
    workDates ||
    workLocation

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
      data-resume-template="executive"
      className={cn(
        "resume-preview resume-preview--executive mx-auto flex w-full max-w-[210mm] overflow-hidden bg-white text-[11px] leading-relaxed text-neutral-800 shadow-sm",
        "min-h-[297mm] font-sans",
        className
      )}
    >
      <aside
        className="flex w-[32%] min-w-[140px] shrink-0 flex-col px-5 py-8 text-white"
        style={{ backgroundColor: SIDEBAR_GREEN }}
      >
        <div className="flex flex-col items-center text-center">
          {draft.contact.photoDataUrl ? (
            // eslint-disable-next-line @next/next/no-img-element -- data URL preview
            <img
              src={draft.contact.photoDataUrl}
              alt=""
              className="size-[88px] rounded-full object-cover ring-2 ring-white/30"
            />
          ) : (
            <span
              className="flex size-[88px] items-center justify-center rounded-full border-2 border-white/40 bg-white/10 text-lg font-semibold text-white/90"
              aria-hidden
            >
              {name
                .split(" ")
                .map((w) => w[0])
                .join("")
                .slice(0, 2)
                .toUpperCase()}
            </span>
          )}
          <h1 className="mt-5 text-xl leading-tight font-bold tracking-tight">
            {name}
          </h1>
        </div>

        {hasContact ? (
          <SidebarBlock title="Contact">
            {address ? (
              <ContactRow label="Address" value={address} />
            ) : null}
            {draft.contact.phone.trim() ? (
              <ContactRow label="Phone" value={draft.contact.phone} />
            ) : null}
            {draft.contact.email.trim() ? (
              <ContactRow label="E-mail" value={draft.contact.email} />
            ) : null}
          </SidebarBlock>
        ) : null}

        {hasSkills ? (
          <SidebarBlock title="Skills">
            <ul className="flex flex-wrap gap-1.5">
              {draft.skills.map((skill) => (
                <li
                  key={skill.id}
                  className="rounded-full border border-white/80 px-2.5 py-0.5 text-[9px] leading-snug text-white"
                >
                  {skill.name}
                </li>
              ))}
            </ul>
          </SidebarBlock>
        ) : null}
      </aside>

      <main className="min-w-0 flex-1 px-8 py-8">
        {hasSummary ? (
          <p className="text-[11px] leading-relaxed text-neutral-700">
            {draft.summary.trim()}
          </p>
        ) : null}

        {hasWork ? (
          <section className={hasSummary ? "mt-6" : ""}>
            <MainSectionHeader title="Work History" />
            <div className="mt-4 grid grid-cols-[5.5rem_1fr] gap-x-4 gap-y-1">
              {workDates ? (
                <p className="text-[10px] leading-snug text-neutral-500">
                  {workDates}
                </p>
              ) : (
                <span />
              )}
              <div>
                {draft.work.jobTitle.trim() ? (
                  <p className="font-bold text-neutral-900">
                    {draft.work.jobTitle}
                  </p>
                ) : null}
                {workLocation ? (
                  <p className="text-[11px] text-neutral-600 italic">
                    {workLocation}
                  </p>
                ) : null}
              </div>
            </div>
          </section>
        ) : null}

        {hasEducation ? (
          <section className={hasSummary || hasWork ? "mt-2" : ""}>
            <MainSectionHeader title="Education" />
            <div className="mt-4 grid grid-cols-[5.5rem_1fr] gap-x-4 gap-y-1">
              {gradDate ? (
                <p className="text-[10px] leading-snug text-neutral-500">
                  {gradDate}
                </p>
              ) : (
                <span />
              )}
              <div>
                {educationTitle ? (
                  <p className="font-bold text-neutral-900">{educationTitle}</p>
                ) : null}
                {educationOrg ? (
                  <p className="text-[11px] text-neutral-600 italic">
                    {educationOrg}
                  </p>
                ) : null}
                {draft.education.fieldOfStudy.trim() &&
                draft.education.degree.trim() ? (
                  <p className="mt-1 text-[11px] text-neutral-700">
                    {draft.education.fieldOfStudy}
                  </p>
                ) : null}
              </div>
            </div>
          </section>
        ) : null}

        {isEmpty ? (
          <p className="py-16 text-center text-sm text-neutral-500">
            Fill in the builder steps to see your resume here.
          </p>
        ) : null}
      </main>
    </article>
  )
}

function SidebarBlock({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) {
  return (
    <section className="mt-7 w-full">
      <h2
        className="-mx-5 mb-3 px-5 py-1.5 text-[11px] font-bold tracking-wide text-white"
        style={{ backgroundColor: SIDEBAR_HEADER_GREEN }}
      >
        {title}
      </h2>
      <div className="space-y-3">{children}</div>
    </section>
  )
}

function ContactRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[10px] font-bold">{label}</p>
      <p className="mt-0.5 text-[10px] leading-snug font-normal text-white/95">
        {value}
      </p>
    </div>
  )
}

function MainSectionHeader({ title }: { title: string }) {
  return (
    <div className="my-4">
      <hr className="border-neutral-300" />
      <h2
        className="py-2 text-center text-[13px] font-bold tracking-wide"
        style={{ color: SIDEBAR_GREEN }}
      >
        {title}
      </h2>
      <hr className="border-neutral-300" />
    </div>
  )
}
