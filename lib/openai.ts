import { toUserFacingAiError } from "@/lib/ai-errors"
import { getOpenAiModel } from "@/lib/ai-config"

type OpenAIChatResponse = {
  choices?: Array<{ message?: { content?: string | null } }>
  error?: { message?: string }
}

function getOpenAIConfig() {
  const apiKey = process.env.OPENAI_API_KEY?.trim()

  if (!apiKey) {
    throw new Error("OPENAI_API_KEY is not configured")
  }

  return {
    apiKey,
    model: getOpenAiModel(),
    baseUrl:
      process.env.OPENAI_BASE_URL?.trim().replace(/\/$/, "") ||
      "https://api.openai.com/v1",
  }
}

export async function generateWithOpenAI(prompt: string): Promise<string> {
  const { apiKey, model, baseUrl } = getOpenAIConfig()

  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 90_000)

  try {
    const response = await fetch(`${baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages: [{ role: "user", content: prompt }],
        stream: false,
      }),
      signal: controller.signal,
    })

    if (!response.ok) {
      const detail = await response.text().catch(() => "")
      console.error(
        `OpenAI HTTP ${response.status} (model: ${model})`,
        detail.slice(0, 500)
      )
      throw new Error("OPENAI_HTTP_ERROR")
    }

    const data = (await response.json()) as OpenAIChatResponse
    const generated = data.choices?.[0]?.message?.content?.trim()

    if (!generated) {
      throw new Error("OPENAI_EMPTY_RESPONSE")
    }

    return generated
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      throw new Error("AI request timed out. Please try again.")
    }

    if (
      error instanceof Error &&
      error.message === "OPENAI_API_KEY is not configured"
    ) {
      throw error
    }

    console.error(
      `OpenAI request failed (model: ${model}). ` +
        "Ensure OPENAI_API_KEY is set and AI_PROVIDER=openai.",
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
