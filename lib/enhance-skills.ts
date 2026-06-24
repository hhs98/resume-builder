export const MAX_SKILL_WORDS = 5

export const AI_ENHANCE_HOURLY_LIMIT = 5
export const AI_ENHANCE_WINDOW_MS = 60 * 60 * 1000

export type EnhanceSkillsInput = {
  input: string
  jobTitle: string
  existingSkills: string[]
}

export function countSkillWords(value: string): number {
  return value.trim().split(/\s+/).filter(Boolean).length
}

export function normalizeSkillName(
  value: string,
  maxWords: number = MAX_SKILL_WORDS
): string {
  return value
    .trim()
    .replace(/^[-*•\d.)\s]+/, "")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, maxWords)
    .join(" ")
}

export function parseSkillSuggestions(
  text: string,
  maxWords: number = MAX_SKILL_WORDS
): string[] {
  const seen = new Set<string>()
  const skills: string[] = []

  for (const part of text.split(/[\n,;]+/)) {
    const normalized = normalizeSkillName(part, maxWords)
    if (!normalized) continue

    const key = normalized.toLowerCase()
    if (seen.has(key)) continue

    seen.add(key)
    skills.push(normalized)
  }

  return skills
}

export function buildEnhanceSkillsPrompt(input: EnhanceSkillsInput): string {
  const userInput = input.input.trim()
  const jobTitle = input.jobTitle.trim()
  const existing = input.existingSkills
    .map((skill) => skill.trim())
    .filter(Boolean)

  const context = [
    jobTitle && `Job title: ${jobTitle}`,
    existing.length > 0 && `Already selected skills: ${existing.join(", ")}`,
  ]
    .filter(Boolean)
    .join("\n")

  return `You are a professional resume writer. Suggest resume-ready skill phrases.

Rules:
- Return 5 to 8 skills only
- One skill per line
- Each skill must be ${MAX_SKILL_WORDS} words or fewer
- Use concise, ATS-friendly phrases (tools, methods, soft skills)
- Do not repeat skills already selected
- Do not add numbering, bullets, explanations, or headings
- If user input is empty, infer skills from the job title

${context || "Context: general workforce resume"}

User input:
${userInput || "(none)"}`
}

export function normalizeEnhancedSkills(
  text: string,
  maxWords: number = MAX_SKILL_WORDS
): string[] {
  return parseSkillSuggestions(text, maxWords).filter(
    (skill) => countSkillWords(skill) <= maxWords
  )
}
