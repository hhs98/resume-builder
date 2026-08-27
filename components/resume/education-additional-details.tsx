import {
  formatEducationAward,
  getPreviewEducationAwards,
  hasEducationItemAdditionalDetails,
  type EducationItem,
} from "@/lib/resume-draft"
import { sanitizeHttpsUrl } from "@/lib/security/sanitize-resume"
import { cn } from "@/lib/utils"

type EducationAdditionalDetailsProps = {
  education: EducationItem
  className?: string
  textClassName?: string
  linkClassName?: string
  linkStyle?: React.CSSProperties
}

export function EducationAdditionalDetails({
  education,
  className,
  textClassName = "text-[11px] text-neutral-700",
  linkClassName = "text-[11px] text-blue-700 underline underline-offset-2",
  linkStyle,
}: EducationAdditionalDetailsProps) {
  if (!hasEducationItemAdditionalDetails(education)) {
    return null
  }

  const awards = getPreviewEducationAwards(education)
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
