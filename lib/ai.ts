import { getAiProvider } from "@/lib/ai-config"
import { generateWithOllama } from "@/lib/ollama"
import { generateWithOpenAI } from "@/lib/openai"

export { getAiProvider, getOpenAiModel, type AiProvider } from "@/lib/ai-config"

export async function generateWithAi(prompt: string): Promise<string> {
  if (getAiProvider() === "openai") {
    return generateWithOpenAI(prompt)
  }

  return generateWithOllama(prompt)
}
