export const SUMMARY_CHAR_LIMIT = 1000

export type EnhanceSummaryInput = {
  input: string
  jobTitle: string
  currentSummary: string
  skills: string[]
}

export function normalizeSummaryText(
  value: string,
  maxChars: number = SUMMARY_CHAR_LIMIT
): string {
  return value.trim().slice(0, maxChars)
}

export function parseSummarySuggestions(
  text: string,
  maxChars: number = SUMMARY_CHAR_LIMIT
): string[] {
  const seen = new Set<string>()
  const summaries: string[] = []

  for (const part of text.split(/\n\s*\n+/)) {
    const normalized = normalizeSummaryText(
      part.replace(/^[-*•\d.)]+\s*/, ""),
      maxChars
    )
    if (!normalized) continue

    const key = normalized.toLowerCase()
    if (seen.has(key)) continue

    seen.add(key)
    summaries.push(normalized)
  }

  return summaries
}

export function buildEnhanceSummaryPrompt(input: EnhanceSummaryInput): string {
  const userInput = input.input.trim()
  const jobTitle = input.jobTitle.trim()
  const currentSummary = input.currentSummary.trim()
  const skills = input.skills.map((skill) => skill.trim()).filter(Boolean)

  const context = [
    jobTitle && `Job title: ${jobTitle}`,
    skills.length > 0 && `Selected skills: ${skills.join(", ")}`,
    currentSummary && `Current summary draft:\n${currentSummary}`,
  ]
    .filter(Boolean)
    .join("\n\n")

  return `You are a professional resume writer. Write professional resume summary options.

Rules:
- Return 3 to 4 summary options only
- Separate each option with one blank line
- Each option must be ${SUMMARY_CHAR_LIMIT} characters or fewer
- Use first person is optional; professional tone; ATS-friendly
- Highlight strengths, experience, and value for the role
- Do not invent employers, degrees, or metrics the user did not provide
- Do not add numbering, bullets, labels, or explanations

${context || "Context: general workforce resume"}

User input:
${userInput || "(none)"}`
}

export function normalizeEnhancedSummaries(
  text: string,
  maxChars: number = SUMMARY_CHAR_LIMIT
): string[] {
  return parseSummarySuggestions(text, maxChars).filter(
    (summary) => summary.length > 0 && summary.length <= maxChars
  )
}
