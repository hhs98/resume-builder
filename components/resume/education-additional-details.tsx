import {
  formatEducationAward,
  getPreviewEducationAwards,
  hasEducationAdditionalDetails,
  type ResumeDraft,
} from "@/lib/resume-draft"
import { cn } from "@/lib/utils"

type EducationAdditionalDetailsProps = {
  draft: ResumeDraft
  className?: string
  textClassName?: string
  linkClassName?: string
}

export function EducationAdditionalDetails({
  draft,
  className,
  textClassName = "text-[11px] text-neutral-700",
  linkClassName = "text-[11px] text-blue-700 underline underline-offset-2",
}: EducationAdditionalDetailsProps) {
  const education = draft.education

  if (!hasEducationAdditionalDetails(draft)) {
    return null
  }

  const awards = getPreviewEducationAwards(draft)

  return (
    <div className={cn("space-y-2", className)}>
      {education.gpa.trim() ? (
        <p className={textClassName}>
          <span className="font-semibold text-neutral-900">GPA:</span>{" "}
          {education.gpa.trim()}
        </p>
      ) : null}

      {education.description.trim() ? (
        <p className={cn(textClassName, "whitespace-pre-wrap")}>
          {education.description.trim()}
        </p>
      ) : null}

      {awards.length > 0 ? (
        <ul className={cn("list-disc space-y-1 pl-4", textClassName)}>
          {awards.map((award) => (
            <li key={award.id}>{formatEducationAward(award)}</li>
          ))}
        </ul>
      ) : null}

      {education.projectUrl.trim() ? (
        <p className={textClassName}>
          <span className="font-semibold text-neutral-900">Project:</span>{" "}
          <a
            href={education.projectUrl.trim()}
            target="_blank"
            rel="noopener noreferrer"
            className={linkClassName}
          >
            {education.projectUrl.trim()}
          </a>
        </p>
      ) : null}
    </div>
  )
}
