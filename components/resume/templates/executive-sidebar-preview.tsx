"use client"

import {
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

const PROFICIENCY_LABELS: Record<number, string> = {
  1: "Beginner",
  2: "Intermediate",
  3: "Advanced",
  4: "Fluent",
}

type ExecutiveSidebarPreviewProps = {
  draft: ResumeDraft
  className?: string
  id?: string
}

function formatWorkItemDates(work: any) {
  const start =
    work.startMonth && work.startYear
      ? `${work.startMonth} ${work.startYear}`
      : ""

  const end = work.currentJob
    ? "Present"
    : work.endMonth && work.endYear
      ? `${work.endMonth} ${work.endYear}`
      : ""

  if (start && end) return `${start} - ${end}`
  return start || end || ""
}

export function ExecutiveSidebarPreview({
  draft,
  className,
  id,
}: ExecutiveSidebarPreviewProps) {
  const name = getFullName(draft) || "Your name"
  const address = getContactLocation(draft)

  const workHistory = draft.workHistory ?? []
  const gradDate = formatGraduationCompact(draft)

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

  const hasWork = workHistory.length > 0

  const hasEducation =
    educationTitle.trim() ||
    educationOrg.trim() ||
    gradDate ||
    draft.education.educationLevel.trim()

  const hasSkills = draft.skills.length > 0
  const hasSummary = draft.summary.trim().length > 0
  const hasContact =
    address || draft.contact.phone.trim() || draft.contact.email.trim()
  const hasReferences = (draft.references || []).length > 0
  const hasLanguages = (draft.languages || []).length > 0

  const isEmpty =
    !hasSummary &&
    !hasWork &&
    !hasEducation &&
    !hasSkills &&
    !hasContact &&
    !hasReferences &&
    !hasLanguages

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
      {/* SIDEBAR */}
      <aside
        className="flex w-[32%] min-w-[140px] shrink-0 flex-col px-5 py-8 text-white"
        style={{ backgroundColor: SIDEBAR_GREEN }}
      >
        <div className="flex flex-col items-center text-center">
          {draft.contact.photoDataUrl ? (
            <img
              src={draft.contact.photoDataUrl}
              alt=""
              className="size-[88px] rounded-full object-cover ring-2 ring-white/30"
            />
          ) : (
            <span className="flex size-[88px] items-center justify-center rounded-full border-2 border-white/40 bg-white/10 text-lg font-semibold text-white/90">
              {name
                .split(" ")
                .map((w) => w[0])
                .join("")
                .slice(0, 2)
                .toUpperCase()}
            </span>
          )}

          <h1 className="mt-5 text-xl font-bold">{name}</h1>
        </div>

        {hasContact ? (
          <SidebarBlock title="Contact">
            {address && <ContactRow label="Address" value={address} />}
            {draft.contact.phone.trim() && (
              <ContactRow label="Phone" value={draft.contact.phone} />
            )}
            {draft.contact.email.trim() && (
              <ContactRow label="E-mail" value={draft.contact.email} />
            )}
          </SidebarBlock>
        ) : null}

        {hasSkills ? (
          <SidebarBlock title="Skills">
            <ul className="flex flex-wrap gap-1.5">
              {draft.skills.map((skill) => (
                <li
                  key={skill.id}
                  className="rounded-full border border-white/80 px-2.5 py-0.5 text-[9px]"
                >
                  {skill.name}
                </li>
              ))}
            </ul>
          </SidebarBlock>
        ) : null}

        {hasLanguages ? (
          <SidebarBlock title="Languages">
            <div className="space-y-2">
              {(draft.languages || []).map((lang) => (
                <div key={lang.id}>
                  <p className="text-[10px] font-bold">{lang.name}</p>
                  <p className="text-[9px] text-white/70 italic">
                    {PROFICIENCY_LABELS[lang.rating]}
                  </p>
                </div>
              ))}
            </div>
          </SidebarBlock>
        ) : null}
      </aside>

      {/* MAIN */}
      <main className="min-w-0 flex-1 px-8 py-8">
        {hasSummary ? (
          <p className="text-[11px] leading-relaxed text-neutral-700">
            {draft.summary.trim()}
          </p>
        ) : null}

        {/* WORK HISTORY */}
        {hasWork ? (
          <section className={hasSummary ? "mt-6" : ""}>
            <MainSectionHeader title="Work History" />

            <div className="mt-4 space-y-6">
              {workHistory.map((work, index) => {
                const dates = formatWorkItemDates(work)

                return (
                  <div key={work.id || index} className="space-y-1">
                    <div className="flex justify-between gap-3">
                      <p className="font-bold text-neutral-900">
                        {work.jobTitle}
                      </p>

                      {dates && (
                        <p className="text-[10px] text-neutral-500">
                          {dates}
                        </p>
                      )}
                    </div>

                    <p className="text-[11px] text-neutral-600 italic">
                      {work.employer}
                      {work.location || work.remote ? (
                        <>
                          {" · "}
                          {[work.location, work.remote ? "Remote" : ""]
                            .filter(Boolean)
                            .join(", ")}
                        </>
                      ) : null}
                    </p>

                    {work.responsibilities?.trim() && (
                      <p className="text-[11px] whitespace-pre-wrap text-neutral-700">
                        {work.responsibilities}
                      </p>
                    )}
                  </div>
                )
              })}
            </div>
          </section>
        ) : null}

        {/* EDUCATION */}
        {hasEducation ? (
          <section className="mt-2">
            <MainSectionHeader title="Education" />
            <div className="mt-4">
              <p className="font-bold text-neutral-900">{educationTitle}</p>
              <p className="text-[11px] text-neutral-600 italic">
                {educationOrg}
              </p>
              {gradDate && (
                <p className="text-[10px] text-neutral-500">{gradDate}</p>
              )}
            </div>
          </section>
        ) : null}

        {/* REFERENCES */}
        {hasReferences ? (
          <section className="mt-2">
            <MainSectionHeader title="References" />
            <div className="mt-4 grid grid-cols-2 gap-6">
              {(draft.references || []).map((ref) => (
                <div key={ref.id} className="space-y-1">
                  <p className="font-bold text-neutral-900">{ref.name}</p>
                  <p className="text-[10px] text-neutral-600">
                    {ref.designation}, {ref.organization}
                  </p>
                  <p className="text-[10px] text-neutral-600">
                    Phone: {ref.phone}
                  </p>
                  {ref.email && (
                    <p className="text-[10px] text-neutral-600">
                      Email: {ref.email}
                    </p>
                  )}
                  {ref.address && (
                    <p className="text-[10px] text-neutral-600">
                      {ref.address}
                    </p>
                  )}
                </div>
              ))}
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

/* helpers */
function SidebarBlock({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) {
  return (
    <section className="mt-7">
      <h2
        className="mb-3 px-5 py-1.5 text-[11px] font-bold text-white"
        style={{ backgroundColor: SIDEBAR_HEADER_GREEN }}
      >
        {title}
      </h2>
      <div className="space-y-3">{children}</div>
    </section>
  )
}

function ContactRow({
  label,
  value,
}: {
  label: string
  value: string
}) {
  return (
    <div>
      <p className="text-[10px] font-bold">{label}</p>
      <p className="text-[10px] text-white/90">{value}</p>
    </div>
  )
}

function MainSectionHeader({ title }: { title: string }) {
  return (
    <div className="my-4">
      <h2 className="text-[13px] font-bold text-[#1a5c38]">{title}</h2>
      <hr className="mt-2 border-neutral-300" />
    </div>
  )
}
