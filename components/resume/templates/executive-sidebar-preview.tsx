"use client"

import { EducationAdditionalDetails } from "@/components/resume/education-additional-details"
import { ResumeWatermark } from "@/components/resume/resume-watermark"
import {
  formatDateOfBirth,
  formatGraduationCompact,
  formatTrainingAchievementDate,
  formatWorkItemDates,
  getContactLocation,
  getDegreeLabel,
  getEducationLevelLabel,
  getFullName,
  getGenderLabel,
  getPreviewEducation,
  getPreviewLanguages,
  getPreviewReferences,
  getPreviewSkills,
  getPreviewTrainings,
  getPreviewWorkHistory,
  getTrainingCourseTypeLabel,
  hasEducationContent,
  hasPreviewContact,
  hasPreviewLanguages,
  hasPreviewReferences,
  hasPreviewSkills,
  hasPreviewWorkHistory,
  hasSummaryContent,
  hasTrainingContent,
  type ResumeDraft,
} from "@/lib/resume-draft"
import { cn } from "@/lib/utils"
import {
  getExecutivePreviewColors,
  type ResumePreviewTone,
} from "@/lib/resume-preview-tone"

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
  tone?: ResumePreviewTone
}

export function ExecutiveSidebarPreview({
  draft,
  className,
  id,
  tone = "default",
}: ExecutiveSidebarPreviewProps) {
  const colors = getExecutivePreviewColors(tone)
  const name = getFullName(draft) || "Your name"
  const address = getContactLocation(draft)

  const workHistory = getPreviewWorkHistory(draft)
  const educationEntries = getPreviewEducation(draft)
  const trainingEntries = getPreviewTrainings(draft)
  const skills = getPreviewSkills(draft)
  const languages = getPreviewLanguages(draft)
  const references = getPreviewReferences(draft)

  const hasWork = hasPreviewWorkHistory(draft)
  const hasEducation = hasEducationContent(draft)
  const hasTraining = hasTrainingContent(draft)
  const hasSkills = hasPreviewSkills(draft)
  const hasSummary = hasSummaryContent(draft)
  const hasContact = hasPreviewContact(draft)
  const hasReferences = hasPreviewReferences(draft)
  const hasLanguages = hasPreviewLanguages(draft)

  const isEmpty =
    !hasSummary &&
    !hasWork &&
    !hasEducation &&
    !hasTraining &&
    !hasSkills &&
    !hasContact &&
    !hasReferences &&
    !hasLanguages

  return (
    <article
      id={id}
      data-resume-template="executive"
      className={cn(
        "resume-preview resume-preview--executive relative mx-auto flex w-full max-w-[210mm] overflow-hidden bg-white text-[11px] leading-relaxed text-neutral-800 shadow-sm",
        "min-h-[297mm] font-sans",
        className
      )}
    >
      {/* SIDEBAR */}
      <aside
        className="flex w-[32%] min-w-[140px] shrink-0 flex-col px-5 py-8 text-white"
        style={{ backgroundColor: colors.sidebar }}
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
          <SidebarBlock title="Contact" colors={colors}>
            {address && <ContactRow label="Address" value={address} />}
            {draft.contact.phone.trim() && (
              <ContactRow label="Phone" value={draft.contact.phone} />
            )}
            {draft.contact.email.trim() && (
              <ContactRow label="E-mail" value={draft.contact.email} />
            )}
            {formatDateOfBirth(draft.contact.dateOfBirth) ? (
              <ContactRow
                label="Date of Birth"
                value={formatDateOfBirth(draft.contact.dateOfBirth)}
              />
            ) : null}
            {draft.contact.gender?.trim() ? (
              <ContactRow
                label="Gender"
                value={getGenderLabel(draft.contact.gender)}
              />
            ) : null}
          </SidebarBlock>
        ) : null}

        {hasSkills ? (
          <SidebarBlock title="Skills" colors={colors}>
            <ul className="flex flex-wrap gap-1.5">
              {skills.map((skill) => (
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
          <SidebarBlock title="Languages" colors={colors}>
            <div className="space-y-2">
              {languages.map((lang) => (
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
      <main className="relative min-w-0 flex-1 px-8 py-8">
        {hasSummary ? (
          <p className="text-[11px] leading-relaxed text-neutral-700">
            {draft.summary.trim()}
          </p>
        ) : null}

        {/* WORK HISTORY */}
        {hasWork ? (
          <section className={hasSummary ? "mt-6" : ""}>
            <MainSectionHeader title="Work History" colors={colors} />

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
            <MainSectionHeader title="Education" colors={colors} />
            <div className="mt-4 space-y-4">
              {educationEntries.map((education) => {
                const gradDate = formatGraduationCompact(education)
                const educationTitle =
                  education.degree.trim() !== ""
                    ? getDegreeLabel(education.degree)
                    : education.fieldOfStudy.trim() ||
                      getEducationLevelLabel(education.educationLevel)

                const educationOrg = [
                  education.institution,
                  education.institutionLocation,
                ]
                  .filter((s) => s.trim())
                  .join(", ")

                return (
                  <div key={education.id}>
                    <p className="font-bold text-neutral-900">
                      {educationTitle}
                    </p>
                    <p className="text-[11px] text-neutral-600 italic">
                      {educationOrg}
                    </p>
                    {gradDate ? (
                      <p className="text-[10px] text-neutral-500">{gradDate}</p>
                    ) : null}
                    <EducationAdditionalDetails
                      education={education}
                      className="mt-2"
                      textClassName="text-[11px] text-neutral-700"
                      linkClassName="text-[11px] underline underline-offset-2"
                      linkStyle={{ color: colors.link }}
                    />
                  </div>
                )
              })}
            </div>
          </section>
        ) : null}

        {/* TRAINING */}
        {hasTraining ? (
          <section className="mt-2">
            <MainSectionHeader title="Training & Courses" colors={colors} />
            <div className="mt-4 space-y-3">
              {trainingEntries.map((training) => {
                const dateLabel = formatTrainingAchievementDate(training)
                const typeLabel = training.courseType.trim()
                  ? getTrainingCourseTypeLabel(training.courseType)
                  : ""

                return (
                  <div key={training.id}>
                    {typeLabel ? (
                      <p className="font-bold text-neutral-900">{typeLabel}</p>
                    ) : null}
                    {training.instituteName.trim() ? (
                      <p className="text-[11px] text-neutral-600 italic">
                        {training.instituteName.trim()}
                      </p>
                    ) : null}
                    {dateLabel ? (
                      <p className="text-[10px] text-neutral-500">{dateLabel}</p>
                    ) : null}
                  </div>
                )
              })}
            </div>
          </section>
        ) : null}

        {/* REFERENCES */}
        {hasReferences ? (
          <section className="mt-2">
            <MainSectionHeader title="References" colors={colors} />
            <div className="mt-4 grid grid-cols-2 gap-6">
              {references.map((ref) => (
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
        <ResumeWatermark className="right-4" />
      </main>
    </article>
  )
}

/* helpers */
function SidebarBlock({
  title,
  children,
  colors,
}: {
  title: string
  children: React.ReactNode
  colors: ReturnType<typeof getExecutivePreviewColors>
}) {
  return (
    <section className="mt-7">
      <h2
        className="mb-3 px-5 py-1.5 text-[11px] font-bold text-white"
        style={{ backgroundColor: colors.sidebarHeader }}
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

function MainSectionHeader({
  title,
  colors,
}: {
  title: string
  colors: ReturnType<typeof getExecutivePreviewColors>
}) {
  return (
    <div className="my-4">
      <h2 className="text-[13px] font-bold" style={{ color: colors.accent }}>
        {title}
      </h2>
      <hr className="mt-2 border-neutral-300" />
    </div>
  )
}
