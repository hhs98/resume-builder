function sanitizeFileName(name: string) {
  return name
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-_]/g, "")
}

export async function downloadResumePdfUrl(
  resumeId: string,
  displayName: string,
  options?: {
    permitToken?: string | null
  }
): Promise<void> {
  const permitToken = options?.permitToken ?? null

  if (!permitToken) {
    throw new Error(
      "Download authorization is missing. Verify your phone number and try again."
    )
  }

  const res = await fetch(`/api/resumes/${resumeId}/pdf`, {
    method: "POST",
    headers: {
      "X-Download-Permit": permitToken,
    },
  })

  if (!res.ok) {
    let message = "Failed to generate PDF."

    try {
      const data = (await res.json()) as { error?: string }
      if (data.error) message = data.error
    } catch {
      // Response was not JSON — keep default message.
    }

    throw new Error(message)
  }

  const blob = await res.blob()
  const downloadUrl = window.URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = downloadUrl
  const baseName = sanitizeFileName(displayName) || "resume"
  a.download = `${baseName}.pdf`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  window.URL.revokeObjectURL(downloadUrl)
}

export async function downloadResumePdfWithFallback(
  resumeId: string,
  displayName: string,
  options?: {
    permitToken?: string | null
  }
): Promise<void> {
  await downloadResumePdfUrl(resumeId, displayName.trim() || "resume", options)
}
