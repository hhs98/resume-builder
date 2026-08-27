import { afterEach, describe, expect, it } from "vitest"

import {
  getAiProvider,
  getOpenAiModel,
  normalizeOpenAiModel,
} from "@/lib/ai-config"

describe("ai-config", () => {
  const originalEnv = { ...process.env }

  afterEach(() => {
    process.env = { ...originalEnv }
  })

  it("defaults to ollama when AI_PROVIDER is unset", () => {
    delete process.env.AI_PROVIDER
    expect(getAiProvider()).toBe("ollama")
  })

  it("uses openai when AI_PROVIDER=openai", () => {
    process.env.AI_PROVIDER = "openai"
    expect(getAiProvider()).toBe("openai")
  })

  it("uses ollama when AI_PROVIDER=ollama", () => {
    process.env.AI_PROVIDER = "ollama"
    expect(getAiProvider()).toBe("ollama")
  })

  it("falls back to ollama for unknown providers", () => {
    process.env.AI_PROVIDER = "anthropic"
    expect(getAiProvider()).toBe("ollama")
  })

  it("defaults OpenAI model to gpt-5-mini", () => {
    delete process.env.OPENAI_MODEL
    expect(getOpenAiModel()).toBe("gpt-5-mini")
  })

  it("normalizes display-style model names to API ids", () => {
    expect(normalizeOpenAiModel("GPT-5 mini")).toBe("gpt-5-mini")
    expect(normalizeOpenAiModel("gpt 5 mini")).toBe("gpt-5-mini")
  })

  it("respects OPENAI_MODEL override", () => {
    process.env.OPENAI_MODEL = "gpt-4.1-mini"
    expect(getOpenAiModel()).toBe("gpt-4.1-mini")
  })
})
