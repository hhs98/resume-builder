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
  getClassicPreviewColors,
  type ResumePreviewTone,
} from "@/lib/resume-preview-tone"

type ClassicRedPreviewProps = {
  draft: ResumeDraft & {
    workHistory?: any[]
  }
  className?: string
  id?: string
  tone?: ResumePreviewTone
}

export function ClassicRedPreview({
  draft,
  className,
  id,
  tone = "default",
}: ClassicRedPreviewProps) {
  const colors = getClassicPreviewColors(tone)
  const name = (getFullName(draft) || "Your name").toUpperCase()
  const address = getContactLocation(draft)

  const workHistory = getPreviewWorkHistory(draft)
  const educationEntries = getPreviewEducation(draft)
  const trainingEntries = getPreviewTrainings(draft)
  const skills = getPreviewSkills(draft)
  const languages = getPreviewLanguages(draft)
  const references = getPreviewReferences(draft)

  const hasContact = hasPreviewContact(draft)
  const hasSummary = hasSummaryContent(draft)
  const hasEducation = hasEducationContent(draft)
  const hasTraining = hasTrainingContent(draft)
  const hasSkills = hasPreviewSkills(draft)
  const hasWork = hasPreviewWorkHistory(draft)
  const hasReferences = hasPreviewReferences(draft)
  const hasLanguages = hasPreviewLanguages(draft)

  const isEmpty =
    !hasContact &&
    !hasSummary &&
    !hasEducation &&
    !hasTraining &&
    !hasSkills &&
    !hasWork &&
    !hasReferences &&
    !hasLanguages

  return (
    <article
      id={id}
      data-resume-template="classic"
      className={cn(
        "resume-preview resume-preview--classic relative mx-auto w-full max-w-[210mm] bg-white font-sans text-[11px] leading-relaxed text-neutral-800 shadow-sm",
        "min-h-[297mm]",
        className
      )}
    >
      <div className="h-3 w-full" style={{ backgroundColor: colors.pink }} />

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
          style={{ color: colors.red }}
        >
          {name}
        </h1>
      </header>

      <RedDivider className="mx-10" colors={colors} />

      <div className="space-y-0 px-10 pb-8">
        {/* CONTACT */}
        {hasContact ? (
          <section>
            <SectionHeader title="Contact" colors={colors} />
            <div className="mt-3 grid grid-cols-3 gap-4 text-[10px]">
              {address ? (
                <div>
                  <p className="font-bold text-neutral-900">Address</p>
                  <p className="mt-0.5 text-neutral-800">{address}</p>
                </div>
              ) : null}

              {draft.contact.phone.trim() ? (
                <div>
                  <p className="font-bold text-neutral-900">Phone</p>
                  <p className="mt-0.5 text-neutral-800">
                    {draft.contact.phone}
                  </p>
                </div>
              ) : null}

              {draft.contact.email.trim() ? (
                <div>
                  <p className="font-bold text-neutral-900">Email</p>
                  <p className="mt-0.5 text-neutral-800">
                    {draft.contact.email}
                  </p>
                </div>
              ) : null}

              {formatDateOfBirth(draft.contact.dateOfBirth) ? (
                <div>
                  <p className="font-bold text-neutral-900">Date of Birth</p>
                  <p className="mt-0.5 text-neutral-800">
                    {formatDateOfBirth(draft.contact.dateOfBirth)}
                  </p>
                </div>
              ) : null}

              {draft.contact.gender?.trim() ? (
                <div>
                  <p className="font-bold text-neutral-900">Gender</p>
                  <p className="mt-0.5 text-neutral-800">
                    {getGenderLabel(draft.contact.gender)}
                  </p>
                </div>
              ) : null}
            </div>
            <RedDivider colors={colors} />
          </section>
        ) : null}

        {/* SUMMARY */}
        {hasSummary ? (
          <section>
            <SectionHeader title="Resume Objective" colors={colors} />
            <p className="mt-3 text-[11px] leading-relaxed whitespace-pre-wrap text-neutral-800">
              {draft.summary.trim()}
            </p>
            <RedDivider colors={colors} />
          </section>
        ) : null}

        {/* EDUCATION */}
        {hasEducation ? (
          <section>
            <SectionHeader title="Education" colors={colors} />
            <div className="mt-3 space-y-4">
              {educationEntries.map((education) => {
                const gradDate = formatGraduationCompact(education)
                const educationDegreeLine = [
                  education.degree.trim()
                    ? getDegreeLabel(education.degree)
                    : education.fieldOfStudy.trim() ||
                      getEducationLevelLabel(education.educationLevel),
                  gradDate,
                ]
                  .filter(Boolean)
                  .join(", ")

                const educationOrgLine = [
                  education.institution,
                  education.institutionLocation,
                ]
                  .filter((s) => s.trim())
                  .join(", ")

                return (
                  <div key={education.id} className="space-y-1">
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

                    <EducationAdditionalDetails
                      education={education}
                      className="mt-2"
                      textClassName="text-[11px] text-neutral-800"
                      linkClassName="text-[11px] underline underline-offset-2"
                      linkStyle={{ color: colors.link }}
                    />
                  </div>
                )
              })}
            </div>
            <RedDivider colors={colors} />
          </section>
        ) : null}

        {/* TRAINING */}
        {hasTraining ? (
          <section>
            <SectionHeader title="Training & Courses" colors={colors} />
            <div className="mt-3 space-y-3">
              {trainingEntries.map((training) => {
                const dateLabel = formatTrainingAchievementDate(training)
                const typeLabel = training.courseType.trim()
                  ? getTrainingCourseTypeLabel(training.courseType)
                  : ""

                return (
                  <div key={training.id} className="space-y-0.5">
                    {typeLabel ? (
                      <p className="text-[11px] font-bold text-neutral-900">
                        {typeLabel}
                      </p>
                    ) : null}
                    {training.instituteName.trim() ? (
                      <p className="text-[11px] text-neutral-800">
                        {training.instituteName.trim()}
                      </p>
                    ) : null}
                    {dateLabel ? (
                      <p className="text-[10px] text-neutral-600">{dateLabel}</p>
                    ) : null}
                  </div>
                )
              })}
            </div>
            <RedDivider colors={colors} />
          </section>
        ) : null}

        {/* SKILLS */}
        {hasSkills ? (
          <section>
            <SectionHeader title="Skills" colors={colors} />
            <ul className="mt-3 grid grid-cols-3 gap-x-4 gap-y-3">
              {skills.map((skill) => (
                <li
                  key={skill.id}
                  className="flex items-center gap-1.5 text-[10px] text-neutral-900"
                >
                  <span className="min-w-0 flex-1 leading-snug">
                    {skill.name}
                  </span>
                  <SkillDots rating={skill.rating} colors={colors} />
                </li>
              ))}
            </ul>
            <RedDivider colors={colors} />
          </section>
        ) : null}

        {/* LANGUAGES */}
        {hasLanguages ? (
          <section>
            <SectionHeader title="Languages" colors={colors} />
            <ul className="mt-3 grid grid-cols-3 gap-x-4 gap-y-3">
              {languages.map((lang) => (
                <li
                  key={lang.id}
                  className="flex items-center gap-1.5 text-[10px] text-neutral-900"
                >
                  <span className="min-w-0 flex-1 leading-snug">
                    {lang.name}
                  </span>
                  <SkillDots rating={lang.rating} max={4} colors={colors} />
                </li>
              ))}
            </ul>
            <RedDivider colors={colors} />
          </section>
        ) : null}

        {/* WORK HISTORY (FIXED MULTI) */}
        {hasWork ? (
  <section>
    <SectionHeader title="Work History" colors={colors} />

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
    <RedDivider colors={colors} />
  </section>
) : null}

        {/* REFERENCES */}
        {hasReferences ? (
          <section>
            <SectionHeader title="References" colors={colors} />
            <div className="mt-3 grid grid-cols-2 gap-x-8 gap-y-6">
              {references.map((ref) => (
                <div key={ref.id} className="space-y-1">
                  <p className="text-[11px] font-bold text-neutral-900">
                    {ref.name}
                  </p>
                  <p className="text-[10px] text-neutral-800">
                    {ref.designation}, {ref.organization}
                  </p>
                  <p className="text-[10px] text-neutral-800">
                    Phone: {ref.phone}
                  </p>
                  {ref.email ? (
                    <p className="text-[10px] text-neutral-800">
                      Email: {ref.email}
                    </p>
                  ) : null}
                </div>
              ))}
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
      <ResumeWatermark />
    </article>
  )
}

function SectionHeader({
  title,
  colors,
}: {
  title: string
  colors: ReturnType<typeof getClassicPreviewColors>
}) {
  return (
    <div className="flex min-h-[1.25rem] items-center">
      <h2
        className="shrink-0 pr-2 text-[11px] font-bold tracking-widest uppercase"
        style={{ color: colors.red }}
      >
        {title}
      </h2>
      <div
        className="h-3 min-w-0 flex-1"
        style={{ backgroundColor: colors.pink }}
      />
    </div>
  )
}

function RedDivider({
  className,
  colors,
}: {
  className?: string
  colors: ReturnType<typeof getClassicPreviewColors>
}) {
  return (
    <hr
      className={cn("my-4 border-0 border-t", className)}
      style={{ borderColor: colors.red }}
    />
  )
}

function SkillDots({
  rating,
  max = 5,
  colors,
}: {
  rating: number
  max?: number
  colors: ReturnType<typeof getClassicPreviewColors>
}) {
  return (
    <span className="inline-flex shrink-0 gap-0.5" aria-hidden>
      {Array.from({ length: max }).map((_, i) => {
        const n = i + 1
        return (
          <span
            key={n}
            className="size-2 rounded-full border"
            style={{
              borderColor: colors.red,
              backgroundColor: n <= rating ? colors.red : "transparent",
            }}
          />
        )
      })}
    </span>
  )
}
