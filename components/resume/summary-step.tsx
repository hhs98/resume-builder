"use client"

import { useMemo, useState } from "react"
import {
  Check,
  ChevronDown,
  Lightbulb,
  Plus,
  Search,
  Sparkles,
} from "lucide-react"

import { BuilderStepFooter } from "@/components/resume/builder-step-footer"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { useResumeDraft } from "@/hooks/use-resume-draft"
import { cn } from "@/lib/utils"

const SUMMARY_CHAR_LIMIT = 500

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

export function SummaryStep() {
  const { draft, patchDraft } = useResumeDraft()
  const summary = draft.summary
  const [search, setSearch] = useState("")
  const [showMorePopular, setShowMorePopular] = useState(false)

  const visiblePopularTitles = showMorePopular
    ? [...POPULAR_TITLES, ...POPULAR_TITLES_MORE]
    : [...POPULAR_TITLES]

  const filteredExamples = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return [...SUMMARY_EXAMPLES]
    return SUMMARY_EXAMPLES.filter((s) => s.toLowerCase().includes(q))
  }, [search])

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
                className="h-12 rounded-xl border border-border/70 bg-white pl-10 text-sm shadow-none"
                aria-label="Search pre-written summary examples"
              />
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
                    Ready to Use Examples
                  </h2>
                </div>
                <span className="shrink-0 text-xs font-medium text-blue-600">
                  Recommended for you
                </span>
              </div>
              <ul className="max-h-[min(28rem,50vh)] divide-y divide-border/60 overflow-y-auto overscroll-contain">
                {filteredExamples.length === 0 ? (
                  <li className="px-5 py-8 text-center text-sm text-muted-foreground">
                    No examples match your search.
                  </li>
                ) : (
                  filteredExamples.map((example) => {
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
                  })
                )}
              </ul>
            </section>
          </div>

          <div className="min-w-0 space-y-5 lg:sticky lg:top-6">
            <div className="rounded-2xl border border-border/60 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between gap-3">
                <h2 className="text-base font-semibold text-foreground">
                  Your Summary
                </h2>
                <button
                  type="button"
                  className="inline-flex items-center gap-1.5 rounded-lg bg-blue-50 px-2.5 py-1 text-sm font-medium text-blue-600 hover:bg-blue-100"
                >
                  <Sparkles className="size-3.5" aria-hidden />
                  Enhance with AI
                </button>
              </div>
              <Textarea
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
