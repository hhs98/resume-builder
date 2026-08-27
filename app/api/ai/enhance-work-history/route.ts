import { NextResponse } from "next/server"

import { toUserFacingAiError } from "@/lib/ai-errors"
import {
  buildEnhanceWorkHistoryPrompt,
  normalizeEnhancedResponsibilities,
  type EnhanceWorkHistoryInput,
} from "@/lib/enhance-work-history"
import { generateWithAi } from "@/lib/ai"
import {
  AI_RATE_LIMIT_ERROR,
  checkAiRateLimit,
  rateLimitHeaders,
} from "@/lib/rate-limit"

function isEnhanceWorkHistoryInput(
  value: unknown
): value is EnhanceWorkHistoryInput {
  if (!value || typeof value !== "object") return false
  const body = value as Record<string, unknown>

  return (
    typeof body.jobTitle === "string" &&
    typeof body.employer === "string" &&
    typeof body.location === "string" &&
    typeof body.remote === "boolean" &&
    typeof body.startMonth === "string" &&
    typeof body.startYear === "string" &&
    typeof body.endMonth === "string" &&
    typeof body.endYear === "string" &&
    typeof body.currentJob === "boolean" &&
    typeof body.responsibilities === "string"
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

    if (!isEnhanceWorkHistoryInput(body)) {
      return NextResponse.json(
        { error: "Invalid work history payload." },
        { status: 400 }
      )
    }

    if (!body.jobTitle.trim() && !body.employer.trim()) {
      return NextResponse.json(
        { error: "Add a job title or employer before using AI Suggest." },
        { status: 400 }
      )
    }

    if (body.responsibilities.length > 4_000) {
      return NextResponse.json(
        { error: "Responsibilities text is too long to enhance." },
        { status: 400 }
      )
    }

    const prompt = buildEnhanceWorkHistoryPrompt(body)
    const generated = await generateWithAi(prompt)

    return NextResponse.json(
      {
        responsibilities: normalizeEnhancedResponsibilities(generated),
      },
      { headers: rateLimitHeaders(rateLimit) }
    )
  } catch (error) {
    console.error("Failed to enhance work history:", error)
    console.log(prompt)

    return NextResponse.json(
      {
        error: toUserFacingAiError(
          error,
          "We couldn't generate suggestions right now. Please try again."
        ),
      },
      { status: 502 }
    )
  }
}
