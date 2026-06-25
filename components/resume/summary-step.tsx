"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import {
  Check,
  ChevronDown,
  Lightbulb,
  Plus,
  Search,
  Sparkles,
  Undo2,
} from "lucide-react"

import { BuilderStepFooter } from "@/components/resume/builder-step-footer"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { useResumeDraft } from "@/hooks/use-resume-draft"
import { countSearchWords, SEARCH_AI_MIN_WORDS } from "@/lib/ai-search"
import {
  aiErrorFromResponse,
  parseAiResponseJson,
  toUserFacingAiError,
} from "@/lib/ai-errors"
import {
  SUMMARY_CHAR_LIMIT,
  normalizeSummaryText,
} from "@/lib/enhance-summary"
import { getPrimaryJobTitle } from "@/lib/resume-draft"
import { cn } from "@/lib/utils"

const POPULAR_TITLES = [
  "Cashier",
  "Customer Service Representative",
  "Manager",
  "Server",
  "Retail",
] as const

const POPULAR_TITLES_MORE = [
  "Sales Associate",
  "Barista",
  "Warehouse Worker",
  "Administrative Assistant",
  "Nurse",
  "Teacher",
] as const

const SUMMARY_EXAMPLES = [
  "Dedicated retail professional with experience delivering fast, friendly service in busy store environments. Comfortable with POS systems, cash handling, and helping customers find the right products.",
  "Customer service representative who listens carefully, solves problems calmly, and keeps a positive attitude under pressure. Strong written and verbal communication skills.",
  "Reliable team member with a track record of showing up on time, following procedures, and supporting coworkers during peak hours. Eager to grow with a stable employer.",
  "Results-oriented manager who coaches staff, meets sales goals, and maintains high standards for cleanliness and presentation on the floor.",
  "Server and hospitality professional focused on accuracy, speed, and creating a welcoming experience for every guest. Familiar with food safety basics and busy dining rushes.",
  "Organized cashier skilled at balancing drawers, processing returns, and reducing wait times at checkout while staying courteous with every customer.",
  "Retail associate who enjoys visual merchandising, restocking efficiently, and learning product details to make thoughtful recommendations.",
  "Patient communicator experienced in de-escalation, policy explanation, and turning frustrated customers into loyal ones.",
  "Hands-on worker comfortable on your feet for long shifts, lifting stock, and adapting when priorities change throughout the day.",
  "Detail-oriented professional with strong data entry skills, attention to accuracy, and the ability to learn new software quickly.",
  "Bilingual team player who bridges language gaps for customers and colleagues, strengthening trust and clarity on the floor.",
  "Self-starter who takes initiative during slow periods—tidying displays, facing shelves, and finding small ways to improve the store.",
  "Training-minded colleague who enjoys onboarding new hires, sharing tips, and modeling company standards for the team.",
  "Safety-conscious worker who follows protocols, reports hazards promptly, and helps maintain a secure environment for staff and shoppers.",
  "Flexible schedule availability including evenings, weekends, and holidays. Motivated to contribute wherever the team needs support most.",
] as const

type SummarySuggestionListProps = {
  summaries: string[]
  currentSummary: string
  onStage: (summary: string) => void
  keyPrefix: string
}

function SummarySuggestionList({
  summaries,
  currentSummary,
  onStage,
  keyPrefix,
}: SummarySuggestionListProps) {
  return (
    <ul className="divide-y divide-blue-200/60">
      {summaries.map((suggestion, index) => {
        const added = currentSummary.trim() === suggestion.trim()

        return (
          <li
            key={`${keyPrefix}-${index}-${suggestion.slice(0, 24)}`}
            className="flex flex-col gap-3 px-4 py-4 sm:flex-row sm:items-start sm:justify-between sm:px-5"
          >
            <p className="min-w-0 flex-1 text-sm leading-relaxed text-foreground">
              {suggestion}
            </p>
            <button
              type="button"
              disabled={added}
              onClick={() => onStage(suggestion)}
              className={cn(
                "inline-flex shrink-0 items-center gap-1 self-start rounded-lg border px-3 py-1.5 text-xs font-semibold transition-colors",
                added
                  ? "cursor-default border-emerald-200 bg-emerald-50 text-emerald-700"
                  : "border-blue-500 bg-white text-blue-600 hover:bg-blue-50"
              )}
            >
              {added ? (
                <Check className="size-3.5" aria-hidden />
              ) : (
                <Plus className="size-3.5" aria-hidden />
              )}
              {added ? "Added" : "ADD"}
            </button>
          </li>
        )
      })}
    </ul>
  )
}

export function SummaryStep() {
  const { draft, patchDraft } = useResumeDraft()
  const summary = draft.summary
  const [search, setSearch] = useState("")
  const [showMorePopular, setShowMorePopular] = useState(false)
  const [isEnhancing, setIsEnhancing] = useState(false)
  const [enhanceError, setEnhanceError] = useState<string | null>(null)
  const [pendingSummaries, setPendingSummaries] = useState<string[]>([])
  const [searchAiSummaries, setSearchAiSummaries] = useState<string[]>([])
  const [isSearchAiLoading, setIsSearchAiLoading] = useState(false)
  const [searchAiError, setSearchAiError] = useState<string | null>(null)
  const [canUndoSummary, setCanUndoSummary] = useState(false)
  const [undoSummary, setUndoSummary] = useState("")

  const summaryRef = useRef<HTMLTextAreaElement>(null)
  const draftRef = useRef(draft)
  const [lastAiSearchQuery, setLastAiSearchQuery] = useState<string | null>(null)
  const searchAbortRef = useRef<AbortController | null>(null)

  useEffect(() => {
    draftRef.current = draft
  }, [draft])

  const visiblePopularTitles = showMorePopular
    ? [...POPULAR_TITLES, ...POPULAR_TITLES_MORE]
    : [...POPULAR_TITLES]

  const filteredExamples = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return [...SUMMARY_EXAMPLES]
    return SUMMARY_EXAMPLES.filter((s) => s.toLowerCase().includes(q))
  }, [search])

  const searchQuery = search.trim()
  const hasStaticResults = filteredExamples.length > 0
  const searchWordCount = countSearchWords(searchQuery)
  const canSearchWithAi =
    !hasStaticResults &&
    searchQuery.length > 0 &&
    searchWordCount >= SEARCH_AI_MIN_WORDS
  const showNoStaticMatch = !hasStaticResults && searchQuery.length > 0
  const hasAiResultsForQuery =
    lastAiSearchQuery === searchQuery && searchAiSummaries.length > 0
  const showAiSearchButton =
    canSearchWithAi && !isSearchAiLoading && !hasAiResultsForQuery

  useEffect(() => {
    searchAbortRef.current?.abort()
  }, [searchQuery])

  async function runSearchWithAi() {
    if (!canSearchWithAi || isSearchAiLoading) return

    searchAbortRef.current?.abort()
    const controller = new AbortController()
    searchAbortRef.current = controller
    const queryToFetch = searchQuery

    setIsSearchAiLoading(true)
    setSearchAiError(null)

    try {
      const currentDraft = draftRef.current
      const response = await fetch("/api/ai/enhance-summary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: controller.signal,
        body: JSON.stringify({
          input: queryToFetch,
          jobTitle: getPrimaryJobTitle(currentDraft),
          currentSummary: currentDraft.summary,
          skills: currentDraft.skills.map((skill) => skill.name),
        }),
      })

      const data = await parseAiResponseJson<{
        summaries?: string[]
        error?: string
      }>(response)

      if (!response.ok) {
        throw new Error(
          aiErrorFromResponse(
            response,
            data,
            "We couldn't find summary suggestions right now. Please try again."
          )
        )
      }

      if (!data.summaries?.length) {
        throw new Error(
          "AI didn't return any matching summaries. Try a different search phrase."
        )
      }

      setLastAiSearchQuery(queryToFetch)
      setSearchAiSummaries(data.summaries)
    } catch (error) {
      if (controller.signal.aborted) return
      setSearchAiSummaries([])
      setSearchAiError(
        toUserFacingAiError(
          error,
          "We couldn't find summary suggestions right now. Please try again."
        )
      )
    } finally {
      if (!controller.signal.aborted) {
        setIsSearchAiLoading(false)
      }
    }
  }

  const charCount = summary.length

  function appendExample(text: string) {
    const combined = summary.trim() ? `${summary.trim()}\n\n${text}` : text
    patchDraft({ summary: combined.slice(0, SUMMARY_CHAR_LIMIT) })
  }

  function handleSummaryChange(value: string) {
    patchDraft({ summary: value.slice(0, SUMMARY_CHAR_LIMIT) })
  }

  function isExampleAdded(example: string) {
    return summary.includes(example)
  }

  function stageSuggestedSummary(text: string) {
    const normalized = normalizeSummaryText(text)
    if (!normalized) return

    setUndoSummary(summary)
    setCanUndoSummary(true)
    patchDraft({ summary: normalized })
    setEnhanceError(null)
    setSearchAiError(null)
    summaryRef.current?.focus()
  }

  function undoSummaryDraft() {
    if (!canUndoSummary) return
    patchDraft({ summary: undoSummary })
    setCanUndoSummary(false)
    setUndoSummary("")
  }

  async function enhanceSummaryWithAi() {
    const currentDraft = draftRef.current
    const jobTitle = getPrimaryJobTitle(currentDraft)

    if (!summary.trim() && !jobTitle) {
      setEnhanceError(
        "Add a summary draft or job title in your contact/work history before using AI enhance."
      )
      return
    }

    setEnhanceError(null)
    setIsEnhancing(true)

    try {
      const response = await fetch("/api/ai/enhance-summary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          input: summary,
          jobTitle,
          currentSummary: summary,
          skills: currentDraft.skills.map((skill) => skill.name),
        }),
      })

      const data = await parseAiResponseJson<{
        summaries?: string[]
        error?: string
      }>(response)

      if (!response.ok) {
        throw new Error(
          aiErrorFromResponse(
            response,
            data,
            "We couldn't generate summary suggestions right now. Please try again."
          )
        )
      }

      if (!data.summaries?.length) {
        throw new Error(
          "AI didn't return any summary suggestions. Add a bit more detail and try again."
        )
      }

      setPendingSummaries(data.summaries)
    } catch (error) {
      setEnhanceError(
        toUserFacingAiError(
          error,
          "We couldn't generate summary suggestions right now. Please try again."
        )
      )
    } finally {
      setIsEnhancing(false)
    }
  }

  return (
    <div className="min-h-full bg-[#f8f9fb]">
      <div className="mx-auto max-w-6xl px-6 py-8 sm:px-8 sm:py-10">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <header className="max-w-2xl space-y-2">
            <h1 className="text-2xl font-bold tracking-tight text-balance text-[#1f2937] md:text-3xl">
              Briefly tell us about your background
            </h1>
            <p className="text-sm leading-relaxed text-pretty text-muted-foreground md:text-base">
              Choose from our pre-written examples below or write your own
              summary to highlight your key achievements.
            </p>
          </header>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-9 shrink-0 gap-1.5 self-start rounded-full border-blue-200 bg-white px-4 text-blue-600 shadow-none hover:bg-blue-50 sm:self-auto"
          >
            <Lightbulb className="size-4" aria-hidden />
            Tips
          </Button>
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_380px] lg:items-start xl:grid-cols-[1fr_420px]">
          <div className="min-w-0 space-y-6">
            <div className="space-y-3">
              <div className="relative">
                <Search
                  className="pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2 text-muted-foreground"
                  aria-hidden
                />
                <Input
                  id="summarySearch"
                  placeholder="Search by title, industry, or keywords"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && showAiSearchButton) {
                      e.preventDefault()
                      void runSearchWithAi()
                    }
                  }}
                  className="h-12 rounded-xl border border-border/70 bg-white pl-10 text-sm shadow-none"
                  aria-label="Search pre-written summary examples"
                />
              </div>
              {showAiSearchButton ? (
                <Button
                  type="button"
                  onClick={() => void runSearchWithAi()}
                  className="h-10 w-full rounded-xl bg-blue-600 font-semibold hover:bg-blue-700 sm:w-auto sm:px-5"
                >
                  <Sparkles className="size-4" aria-hidden />
                  Search with AI
                </Button>
              ) : null}
            </div>

            <section className="space-y-3">
              <h2 className="text-[0.65rem] font-semibold tracking-[0.14em] text-muted-foreground uppercase">
                Popular
              </h2>
              <div className="flex flex-wrap gap-2">
                {visiblePopularTitles.map((title) => (
                  <button
                    key={title}
                    type="button"
                    onClick={() => setSearch(title)}
                    className="rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700 transition-colors hover:bg-blue-100"
                  >
                    {title}
                  </button>
                ))}
              </div>
              {POPULAR_TITLES_MORE.length > 0 ? (
                <button
                  type="button"
                  onClick={() => setShowMorePopular((open) => !open)}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 transition-colors hover:text-blue-700"
                  aria-expanded={showMorePopular}
                >
                  {showMorePopular ? "Show less" : "Show more"}
                  <ChevronDown
                    className={cn(
                      "size-3.5 transition-transform",
                      showMorePopular && "rotate-180"
                    )}
                    aria-hidden
                  />
                </button>
              ) : null}
            </section>

            <section className="overflow-hidden rounded-2xl border border-border/60 bg-white">
              <div className="flex items-start justify-between gap-3 border-b border-border/60 px-5 py-4">
                <div>
                  <h2 className="text-base font-semibold text-foreground">
                    {showNoStaticMatch ? "Search Results" : "Ready to Use Examples"}
                  </h2>
                  <p className="mt-0.5 text-sm text-muted-foreground">
                    {showNoStaticMatch
                      ? "No curated match found. Use Search with AI when you have at least 5 words."
                      : "Click to quickly add these to your resume"}
                  </p>
                </div>
                {!showNoStaticMatch ? (
                  <span className="shrink-0 text-xs font-medium text-blue-600">
                    Recommended for you
                  </span>
                ) : null}
              </div>
              <div className="max-h-[min(28rem,50vh)] overflow-y-auto overscroll-contain">
                {hasStaticResults ? (
                  <ul className="divide-y divide-border/60">
                    {filteredExamples.map((example) => {
                      const added = isExampleAdded(example)
                      return (
                        <li
                          key={example}
                          className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-start sm:justify-between"
                        >
                          <p className="min-w-0 flex-1 text-sm leading-relaxed text-foreground">
                            {example}
                          </p>
                          <button
                            type="button"
                            disabled={added}
                            onClick={() => appendExample(example)}
                            className={cn(
                              "inline-flex shrink-0 items-center gap-1 self-start rounded-lg border px-3 py-1.5 text-xs font-semibold transition-colors",
                              added
                                ? "cursor-default border-emerald-200 bg-emerald-50 text-emerald-700"
                                : "border-blue-500 text-blue-600 hover:bg-blue-50"
                            )}
                          >
                            {added ? (
                              <Check className="size-3.5" aria-hidden />
                            ) : (
                              <Plus className="size-3.5" aria-hidden />
                            )}
                            {added ? "Added" : "ADD"}
                          </button>
                        </li>
                      )
                    })}
                  </ul>
                ) : searchQuery.length === 0 ? (
                  <div className="px-5 py-8 text-center text-sm text-muted-foreground">
                    Start typing to search curated summaries.
                  </div>
                ) : searchWordCount < SEARCH_AI_MIN_WORDS ? (
                  <div className="px-5 py-8 text-center text-sm text-muted-foreground">
                    Type at least {SEARCH_AI_MIN_WORDS} words, then use Search with
                    AI.
                  </div>
                ) : isSearchAiLoading ? (
                  <div className="flex items-center justify-center gap-2 px-5 py-10 text-sm text-muted-foreground">
                    <Sparkles className="size-4 text-blue-600" aria-hidden />
                    Searching with AI...
                  </div>
                ) : searchAiError ? (
                  <div className="px-5 py-8 text-center text-sm text-destructive">
                    {searchAiError}
                  </div>
                ) : hasAiResultsForQuery ? (
                  <div>
                    <div className="border-b border-blue-200/80 bg-blue-50/40 px-5 py-3">
                      <p className="text-xs font-semibold tracking-wide text-blue-700 uppercase">
                        AI suggestions
                      </p>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        Click ADD to edit a summary in Your Summary.
                      </p>
                    </div>
                    <SummarySuggestionList
                      summaries={searchAiSummaries}
                      currentSummary={summary}
                      onStage={stageSuggestedSummary}
                      keyPrefix="search-ai"
                    />
                  </div>
                ) : showAiSearchButton ? (
                  <div className="flex flex-col items-center gap-3 px-5 py-10 text-center">
                    <p className="text-sm text-muted-foreground">
                      No curated summaries match. Search with AI for suggestions.
                    </p>
                    <Button
                      type="button"
                      onClick={() => void runSearchWithAi()}
                      className="h-10 rounded-xl bg-blue-600 px-5 font-semibold hover:bg-blue-700"
                    >
                      <Sparkles className="size-4" aria-hidden />
                      Search with AI
                    </Button>
                  </div>
                ) : (
                  <div className="px-5 py-8 text-center text-sm text-muted-foreground">
                    No summaries found for this search.
                  </div>
                )}
              </div>
            </section>
          </div>

          <div className="min-w-0 space-y-5 lg:sticky lg:top-6">
            <div className="rounded-2xl border border-border/60 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between gap-3">
                <h2 className="text-base font-semibold text-foreground">
                  Your Summary
                </h2>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    disabled={isEnhancing}
                    onClick={enhanceSummaryWithAi}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-blue-50 px-2.5 py-1 text-sm font-medium text-blue-600 hover:bg-blue-100 disabled:opacity-60"
                  >
                    <Sparkles className="size-3.5" aria-hidden />
                    {isEnhancing ? "Generating..." : "Enhance with AI"}
                  </button>
                  <button
                    type="button"
                    disabled={!canUndoSummary}
                    onClick={undoSummaryDraft}
                    className="inline-flex items-center gap-1.5 text-sm font-medium text-blue-600 hover:text-blue-700 disabled:opacity-40"
                  >
                    <Undo2 className="size-3.5" aria-hidden />
                    Undo
                  </button>
                </div>
              </div>
              <p className="mt-2 text-xs text-muted-foreground">
                Up to {SUMMARY_CHAR_LIMIT} characters.
              </p>
              {enhanceError ? (
                <p className="mt-2 text-xs text-destructive">{enhanceError}</p>
              ) : null}
              {pendingSummaries.length > 0 ? (
                <div className="mt-3 overflow-hidden rounded-xl border border-blue-200 bg-blue-50/50">
                  <div className="border-b border-blue-200/80 px-4 py-3">
                    <p className="text-xs font-semibold tracking-wide text-blue-700 uppercase">
                      AI suggestion
                    </p>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      Click ADD to move a summary into the editor, edit it, then
                      continue.
                    </p>
                  </div>
                  <SummarySuggestionList
                    summaries={pendingSummaries}
                    currentSummary={summary}
                    onStage={stageSuggestedSummary}
                    keyPrefix="custom-ai"
                  />
                </div>
              ) : null}
              <Textarea
                ref={summaryRef}
                id="summary"
                className="mt-4 min-h-48 resize-none rounded-xl border border-border/70 bg-white text-sm leading-relaxed shadow-none"
                placeholder="Start typing your summary here..."
                aria-label="Professional summary"
                value={summary}
                onChange={(e) => handleSummaryChange(e.target.value)}
              />
              <div className="mt-3 flex items-end justify-between gap-4">
                <p className="text-xs leading-relaxed text-muted-foreground">
                  Tip: Use strong action verbs like &apos;Achieved&apos;,
                  &apos;Led&apos;, &apos;Optimized&apos;.
                </p>
                <span
                  className={cn(
                    "grid size-12 shrink-0 place-items-center rounded-full tabular-nums",
                    charCount > SUMMARY_CHAR_LIMIT * 0.9
                      ? "bg-amber-50 text-amber-700"
                      : "bg-blue-50 text-blue-600"
                  )}
                  aria-label={`${charCount} of ${SUMMARY_CHAR_LIMIT} characters`}
                >
                  <span className="flex flex-col items-center justify-center leading-none">
                    <span className="text-xs font-semibold">{charCount}</span>
                    <span className="mt-0.5 text-[0.55rem] font-medium opacity-80">
                      / {SUMMARY_CHAR_LIMIT}
                    </span>
                  </span>
                </span>
              </div>
            </div>

            <div className="flex gap-4 rounded-2xl border-2 border-dashed border-blue-200 bg-blue-50/40 p-4">
              <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-blue-600 text-white">
                <Sparkles className="size-4" aria-hidden />
              </span>
              <div>
                <p className="text-sm font-semibold text-foreground">
                  AI Advice
                </p>
                <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                  Adding specific numbers (e.g. 20% increase) makes your summary
                  3x more effective!
                </p>
              </div>
            </div>
          </div>
        </div>

        <BuilderStepFooter
          backHref="/new/languages"
          nextHref="/new/references"
          nextLabel="Next: References"
        />
      </div>
    </div>
  )
}
