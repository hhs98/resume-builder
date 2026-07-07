export function getResumePreviewBaseUrl(): string {
  const configured = process.env.RESUME_PREVIEW_BASE_URL?.trim().replace(/\/$/, "")
  if (configured) return configured

  const vercelUrl = process.env.VERCEL_URL?.trim()
  if (vercelUrl) {
    return `https://${vercelUrl.replace(/\/$/, "")}`
  }

  if (process.env.NODE_ENV === "production") {
    throw new Error("RESUME_PREVIEW_BASE_URL is required in production.")
  }

  const port = process.env.PORT?.trim() || "3000"
  return `http://localhost:${port}`
}

export function buildResumePrintUrl(resumeId: string): string {
  const baseUrl = getResumePreviewBaseUrl()
  return new URL(`/my-resume/preview/${resumeId}/print`, baseUrl).toString()
}
