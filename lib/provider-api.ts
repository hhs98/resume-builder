type ProviderErrorBody = {
  message?: string
  error?: string
  errors?: unknown
}

export function formatProviderError(
  data: ProviderErrorBody,
  fallback: string
): string {
  if (typeof data.message === "string" && data.message.trim()) {
    return data.message.trim()
  }

  if (typeof data.error === "string" && data.error.trim()) {
    return data.error.trim()
  }

  if (Array.isArray(data.errors)) {
    const messages = data.errors
      .flatMap((item) => {
        if (typeof item === "string") return [item]
        if (Array.isArray(item)) {
          return item.filter((value): value is string => typeof value === "string")
        }
        return []
      })
      .map((message) => message.trim())
      .filter(Boolean)

    if (messages.length > 0) {
      return messages.join(" ")
    }
  }

  return fallback
}
