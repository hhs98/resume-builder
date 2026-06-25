import { toUserFacingAiError } from "@/lib/ai-errors"

type OllamaGenerateResponse = {
  response?: string
  error?: string
}

function getOllamaConfig() {
  return {
    baseUrl:
      process.env.OLLAMA_BASE_URL ||
      "https://hollama.jobmedia.com.bd/",
    model: process.env.OLLAMA_MODEL || "qwen2.5:7b",
  }
}

export async function generateWithOllama(prompt: string): Promise<string> {
  const { baseUrl, model } = getOllamaConfig()

  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 90_000)

  try {
    const response = await fetch(`${baseUrl}/api/generate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model,
        prompt,
        stream: false,
      }),
      signal: controller.signal,
    })

    if (!response.ok) {
      const detail = await response.text().catch(() => "")
      console.error(
        `Ollama HTTP ${response.status} at ${baseUrl} (model: ${model})`,
        detail.slice(0, 500)
      )
      throw new Error("OLLAMA_HTTP_ERROR")
    }

    const data = (await response.json()) as OllamaGenerateResponse
    const generated = data.response?.trim()

    if (!generated) {
      throw new Error("OLLAMA_EMPTY_RESPONSE")
    }

    return generated
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      throw new Error("AI request timed out. Please try again.")
    }

    console.error(
      `Ollama request failed at ${baseUrl} (model: ${model}). ` +
        "Ensure Ollama is running and OLLAMA_BASE_URL is correct.",
      error
    )

    throw new Error(
      toUserFacingAiError(
        error,
        "The AI service is unavailable right now. Please try again in a few minutes."
      )
    )
  } finally {
    clearTimeout(timeout)
  }
}
