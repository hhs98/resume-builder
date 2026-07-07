import {
  formatEducationAward,
  getPreviewEducationAwards,
  hasEducationAdditionalDetails,
  type ResumeDraft,
} from "@/lib/resume-draft"
import { sanitizeHttpsUrl } from "@/lib/security/sanitize-resume"
import { cn } from "@/lib/utils"

type EducationAdditionalDetailsProps = {
  draft: ResumeDraft
  className?: string
  textClassName?: string
  linkClassName?: string
  linkStyle?: React.CSSProperties
}

export function EducationAdditionalDetails({
  draft,
  className,
  textClassName = "text-[11px] text-neutral-700",
  linkClassName = "text-[11px] text-blue-700 underline underline-offset-2",
  linkStyle,
}: EducationAdditionalDetailsProps) {
  const education = draft.education

  if (!hasEducationAdditionalDetails(draft)) {
    return null
  }

  const awards = getPreviewEducationAwards(draft)
  const projectUrl = sanitizeHttpsUrl(education.projectUrl)

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

      {projectUrl ? (
        <p className={textClassName}>
          <span className="font-semibold text-neutral-900">Project:</span>{" "}
          <a
            href={projectUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={linkClassName}
            style={linkStyle}
          >
            {projectUrl}
          </a>
        </p>
      ) : null}
    </div>
  )
}
