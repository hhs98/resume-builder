import { NextResponse } from "next/server"

import { toUserFacingAiError } from "@/lib/ai-errors"
import {
  isResumePdfPageLimitMessage,
  MAX_RESUME_IMPORT_NOTES_CHARS,
  parseResumePdf,
  validateResumePdfUpload,
} from "@/lib/parse-resume"
import { isPdfBuffer, PDF_MAGIC_BYTE_ERROR } from "@/lib/security/pdf-validation"
import {
  AI_RATE_LIMIT_ERROR,
  checkAiRateLimit,
  rateLimitHeaders,
} from "@/lib/rate-limit"

export const runtime = "nodejs"
export const maxDuration = 120

export async function POST(request: Request) {
  try {
    const rateLimit = checkAiRateLimit(request)

    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: AI_RATE_LIMIT_ERROR },
        {
          status: 429,
          headers: rateLimitHeaders(rateLimit),
        }
      )
    }

    const formData = await request.formData()
    const validation = validateResumePdfUpload(formData.get("file"))

    if ("error" in validation) {
      return NextResponse.json({ error: validation.error }, { status: 400 })
    }

    const rawNotes = formData.get("description")
    const userNotes =
      typeof rawNotes === "string"
        ? rawNotes.trim().slice(0, MAX_RESUME_IMPORT_NOTES_CHARS)
        : ""

    const buffer = await validation.file.arrayBuffer()

    if (!isPdfBuffer(buffer)) {
      return NextResponse.json({ error: PDF_MAGIC_BYTE_ERROR }, { status: 400 })
    }

    const { draft, pages } = await parseResumePdf(buffer, userNotes)

    return NextResponse.json(
      { draft, pages },
      { headers: rateLimitHeaders(rateLimit) }
    )
  } catch (error) {
    console.error("Failed to parse resume PDF:", error)

    if (error instanceof Error && isResumePdfPageLimitMessage(error.message)) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json(
      {
        error: toUserFacingAiError(
          error,
          "We couldn't parse this resume right now. Please try again."
        ),
      },
      { status: 502 }
    )
  }
}
