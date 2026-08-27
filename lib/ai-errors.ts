const FRIENDLY_PREFIXES =
  /^(AI |Add |Invalid |You've |We |The AI |Summary |Custom |Responsibilities )/i

const FRIENDLY_PHRASES =
  /limit reached|too long|before using|did not return|exceeds the|Please try again/i

const TECHNICAL_PHRASES =
  /fetch failed|failed to fetch|networkerror|econn|enotfound|etimedout|econnreset|abort|ollama_|ollama |openai_|openai /i

function collectErrorText(error: Error): string {
  const parts = [error.message]
  const cause = error.cause

  if (cause instanceof Error) {
    parts.push(cause.message)
  } else if (cause && typeof cause === "object" && "code" in cause) {
    parts.push(String((cause as { code: unknown }).code))
  }

  return parts.filter(Boolean).join(" ")
}

function looksUserFacing(message: string): boolean {
  const trimmed = message.trim()
  if (!trimmed || TECHNICAL_PHRASES.test(trimmed)) return false
  if (FRIENDLY_PREFIXES.test(trimmed) || FRIENDLY_PHRASES.test(trimmed)) {
    return true
  }
  return (
    trimmed.length <= 120 &&
    !/ollama|openai|econn|enotfound|status \d{3}|fetch/i.test(trimmed)
  )
}

/**
 * Maps technical fetch / Ollama / network errors to copy safe to show in the UI.
 */
export function toUserFacingAiError(
  error: unknown,
  fallback = "Something went wrong with AI. Please try again."
): string {
  if (error instanceof Error) {
    if (error.name === "AbortError") {
      return "The AI request took too long. Please try again."
    }

    const message = collectErrorText(error).trim()
    if (!message) return fallback

    if (looksUserFacing(message)) {
      return error.message.trim() || message
    }

    const lower = message.toLowerCase()

    if (
      lower === "failed to fetch" ||
      lower.includes("networkerror") ||
      lower.includes("load failed") ||
      lower.includes("network request failed")
    ) {
      return "We couldn't reach the server. Check your internet connection and try again."
    }

    if (
      lower.includes("fetch failed") ||
      lower.includes("econnrefused") ||
      lower.includes("enotfound") ||
      lower.includes("econnreset") ||
      lower.includes("etimedout") ||
      lower.includes("service unavailable")
    ) {
      return "The AI service is unavailable right now. Please try again in a few minutes."
    }

    if (lower.includes("timed out") || lower.includes("timeout")) {
      return "The AI request took too long. Please try again."
    }

    if (
      (lower.includes("ollama") || lower.includes("openai")) &&
      lower.includes("empty")
    ) {
      return "AI didn't return any suggestions. Add a bit more detail and try again."
    }

    if (
      lower.includes("ollama request failed") ||
      lower.includes("openai request failed") ||
      lower.includes("openai_api_key is not configured") ||
      /status 5\d{2}/.test(lower) ||
      lower.includes("bad gateway")
    ) {
      return "The AI service encountered a problem. Please try again shortly."
    }

    if (lower.startsWith("http ")) {
      return fallback
    }
  }

  return fallback
}

export async function parseAiResponseJson<T extends { error?: string }>(
  response: Response
): Promise<T> {
  try {
    return (await response.json()) as T
  } catch {
    throw new Error(
      toUserFacingAiError(
        new Error(`HTTP ${response.status}`),
        "We couldn't read the AI response. Please try again."
      )
    )
  }
}

export function aiErrorFromResponse(
  response: Response,
  data: { error?: string },
  fallback: string
): string {
  if (data.error) {
    return toUserFacingAiError(new Error(data.error), fallback)
  }

  if (response.status === 429) {
    return "You've reached the AI usage limit for now. Please wait a bit and try again."
  }

  if (response.status >= 500) {
    return "The AI service is temporarily unavailable. Please try again shortly."
  }

  return toUserFacingAiError(new Error(`HTTP ${response.status}`), fallback)
}
