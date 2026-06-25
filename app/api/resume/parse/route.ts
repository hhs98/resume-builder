import { NextResponse } from "next/server"

import { toUserFacingAiError } from "@/lib/ai-errors"
import { AI_ENHANCE_WINDOW_MS } from "@/lib/enhance-summary"
import {
  isResumePdfPageLimitMessage,
  parseResumePdf,
  RESUME_PARSE_HOURLY_LIMIT,
  validateResumePdfUpload,
} from "@/lib/parse-resume"
import {
  checkRateLimit,
  getClientIp,
  rateLimitHeaders,
} from "@/lib/rate-limit"

export const runtime = "nodejs"
export const maxDuration = 120

export async function POST(request: Request) {
  try {
    const clientIp = getClientIp(request)
    const rateLimit = checkRateLimit(`resume-parse:${clientIp}`, {
      limit: RESUME_PARSE_HOURLY_LIMIT,
      windowMs: AI_ENHANCE_WINDOW_MS,
    })

    if (!rateLimit.allowed) {
      return NextResponse.json(
        {
          error:
            "Upload limit reached. You can parse up to 5 resumes per hour from this network.",
        },
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

    const buffer = await validation.file.arrayBuffer()
    const { draft, pages } = await parseResumePdf(buffer)

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
