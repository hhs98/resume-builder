import { NextResponse } from "next/server"

import { toUserFacingAiError } from "@/lib/ai-errors"
import {
  AI_ENHANCE_HOURLY_LIMIT,
  AI_ENHANCE_WINDOW_MS,
  buildEnhanceSkillsPrompt,
  countSkillWords,
  MAX_SKILL_WORDS,
  normalizeEnhancedSkills,
  type EnhanceSkillsInput,
} from "@/lib/enhance-skills"
import { generateWithOllama } from "@/lib/ollama"
import {
  checkRateLimit,
  getClientIp,
  rateLimitHeaders,
} from "@/lib/rate-limit"

function isEnhanceSkillsInput(value: unknown): value is EnhanceSkillsInput {
  if (!value || typeof value !== "object") return false
  const body = value as Record<string, unknown>

  return (
    typeof body.input === "string" &&
    typeof body.jobTitle === "string" &&
    Array.isArray(body.existingSkills) &&
    body.existingSkills.every((skill) => typeof skill === "string")
  )
}

export async function POST(request: Request) {
  try {
    const clientIp = getClientIp(request)
    const rateLimit = checkRateLimit(`ai-enhance-skills:${clientIp}`, {
      limit: AI_ENHANCE_HOURLY_LIMIT,
      windowMs: AI_ENHANCE_WINDOW_MS,
    })

    if (!rateLimit.allowed) {
      return NextResponse.json(
        {
          error:
            "AI enhance limit reached. You can make up to 5 requests per hour from this network.",
        },
        {
          status: 429,
          headers: rateLimitHeaders(rateLimit),
        }
      )
    }

    const body: unknown = await request.json()

    if (!isEnhanceSkillsInput(body)) {
      return NextResponse.json(
        { error: "Invalid skills payload." },
        { status: 400 }
      )
    }

    if (body.input.length > 1_000) {
      return NextResponse.json(
        { error: "Custom skill input is too long to enhance." },
        { status: 400 }
      )
    }

    if (!body.input.trim() && !body.jobTitle.trim()) {
      return NextResponse.json(
        {
          error:
            "Add a custom skill or job title before using AI enhance.",
        },
        { status: 400 }
      )
    }

    const prompt = buildEnhanceSkillsPrompt(body)
    const generated = await generateWithOllama(prompt)
    const skills = normalizeEnhancedSkills(generated)

    if (skills.length === 0) {
      return NextResponse.json(
        { error: "AI did not return any valid skills." },
        { status: 502 }
      )
    }

    const invalidSkill = skills.find(
      (skill) => countSkillWords(skill) > MAX_SKILL_WORDS
    )
    if (invalidSkill) {
      return NextResponse.json(
        { error: "AI returned a skill that exceeds the 5-word limit." },
        { status: 502 }
      )
    }

    return NextResponse.json({ skills }, { headers: rateLimitHeaders(rateLimit) })
  } catch (error) {
    console.error("Failed to enhance skills:", error)

    return NextResponse.json(
      {
        error: toUserFacingAiError(
          error,
          "We couldn't generate skill suggestions right now. Please try again."
        ),
      },
      { status: 502 }
    )
  }
}
