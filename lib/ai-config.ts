export type AiProvider = "ollama" | "openai"

const AI_PROVIDERS: AiProvider[] = ["ollama", "openai"]

export function getAiProvider(): AiProvider {
  const configured = process.env.AI_PROVIDER?.trim().toLowerCase()

  if (configured && AI_PROVIDERS.includes(configured as AiProvider)) {
    return configured as AiProvider
  }

  return "ollama"
}

const OPENAI_MODEL_ALIASES: Record<string, string> = {
  "gpt-5 mini": "gpt-5-mini",
  "gpt 5 mini": "gpt-5-mini",
  "gpt5mini": "gpt-5-mini",
}

export function normalizeOpenAiModel(raw: string | undefined): string {
  const trimmed = raw?.trim() ?? ""
  if (!trimmed) return "gpt-5-mini"

  const key = trimmed.toLowerCase()
  return OPENAI_MODEL_ALIASES[key] ?? trimmed
}

export function getOpenAiModel(): string {
  return normalizeOpenAiModel(process.env.OPENAI_MODEL)
}
