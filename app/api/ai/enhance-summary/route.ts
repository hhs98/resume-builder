import { NextResponse } from "next/server"

import { toUserFacingAiError } from "@/lib/ai-errors"
import {
  buildEnhanceSummaryPrompt,
  normalizeEnhancedSummaries,
  SUMMARY_CHAR_LIMIT,
  type EnhanceSummaryInput,
} from "@/lib/enhance-summary"
import { generateWithOllama } from "@/lib/ollama"
import {
  AI_RATE_LIMIT_ERROR,
  checkAiRateLimit,
  rateLimitHeaders,
} from "@/lib/rate-limit"

function isEnhanceSummaryInput(value: unknown): value is EnhanceSummaryInput {
  if (!value || typeof value !== "object") return false
  const body = value as Record<string, unknown>

  return (
    typeof body.input === "string" &&
    typeof body.jobTitle === "string" &&
    typeof body.currentSummary === "string" &&
    Array.isArray(body.skills) &&
    body.skills.every((skill) => typeof skill === "string")
  )
}

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

    const body: unknown = await request.json()

    if (!isEnhanceSummaryInput(body)) {
      return NextResponse.json(
        { error: "Invalid summary payload." },
        { status: 400 }
      )
    }

    if (body.input.length > 2_000) {
      return NextResponse.json(
        { error: "Summary input is too long to enhance." },
        { status: 400 }
      )
    }

    if (
      !body.input.trim() &&
      !body.jobTitle.trim() &&
      !body.currentSummary.trim()
    ) {
      return NextResponse.json(
        {
          error:
            "Add a search term, job title, or summary draft before using AI enhance.",
        },
        { status: 400 }
      )
    }

    const prompt = buildEnhanceSummaryPrompt(body)
    const generated = await generateWithOllama(prompt)
    const summaries = normalizeEnhancedSummaries(generated)

    if (summaries.length === 0) {
      return NextResponse.json(
        { error: "AI did not return any valid summaries." },
        { status: 502 }
      )
    }

    const tooLong = summaries.find(
      (summary) => summary.length > SUMMARY_CHAR_LIMIT
    )
    if (tooLong) {
      return NextResponse.json(
        {
          error: `AI returned a summary that exceeds the ${SUMMARY_CHAR_LIMIT}-character limit.`,
        },
        { status: 502 }
      )
    }

    return NextResponse.json(
      { summaries },
      { headers: rateLimitHeaders(rateLimit) }
    )
  } catch (error) {
    console.error("Failed to enhance summary:", error)

    return NextResponse.json(
      {
        error: toUserFacingAiError(
          error,
          "We couldn't generate summary suggestions right now. Please try again."
        ),
      },
      { status: 502 }
    )
  }
}
