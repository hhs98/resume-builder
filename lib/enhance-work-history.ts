import type { WorkHistoryItem } from "@/lib/resume-draft"
import { formatWorkDates } from "@/lib/resume-draft"
import { generateWithOllama } from "@/lib/ollama"

export type EnhanceWorkHistoryInput = Pick<
  WorkHistoryItem,
  | "jobTitle"
  | "employer"
  | "location"
  | "remote"
  | "startMonth"
  | "startYear"
  | "endMonth"
  | "endYear"
  | "currentJob"
  | "responsibilities"
>

export function buildEnhanceWorkHistoryPrompt(work: EnhanceWorkHistoryInput): string {
  const dates = formatWorkDates(work as WorkHistoryItem)
  const location = [work.location.trim(), work.remote ? "Remote" : ""]
    .filter(Boolean)
    .join(" · ")

  const context = [
    work.jobTitle.trim() && `Job title: ${work.jobTitle.trim()}`,
    work.employer.trim() && `Company Name: ${work.employer.trim()}`,
    location && `Location: ${location}`,
    dates && `Dates: ${dates}`,
  ]
    .filter(Boolean)
    .join("\n")

  const notes = work.responsibilities.trim()

  return `You are a professional resume writer. Write strong resume bullet points for this work experience.

Rules:
- Return 3 to 5 bullet points only
- Start each line with a bullet character (•)
- Use action verbs and ATS-friendly language
- Keep each bullet concise (one line)
- Do not invent employers, dates, job titles, or specific metrics the user did not provide
- If current notes are empty, suggest realistic responsibilities based on the role only
- Do not add introductions, headings, or explanations

${context || "Job details: not provided"}

Current notes:
${notes || "(none)"}`
}

export function normalizeEnhancedResponsibilities(text: string): string {
  return text
    .replace(/\r\n/g, "\n")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const cleaned = line.replace(/^[-*•\s]+/, "").trim()
      return cleaned ? `• ${cleaned}` : ""
    })
    .filter(Boolean)
    .join("\n")
}
