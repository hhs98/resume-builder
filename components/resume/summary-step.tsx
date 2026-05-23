"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { Lightbulb, Sparkles } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Field, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { useResumeDraft } from "@/hooks/use-resume-draft"

const POPULAR_TITLES_INITIAL = [
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
  const [popularExpanded, setPopularExpanded] = useState(false)

  const filteredExamples = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return [...SUMMARY_EXAMPLES]
    return SUMMARY_EXAMPLES.filter((s) => s.toLowerCase().includes(q))
  }, [search])

  function appendExample(text: string) {
    const t = summary.trim()
    patchDraft({ summary: t ? `${t}\n\n${text}` : text })
  }

  function applyPopularTitle(title: string) {
    setSearch(title)
  }

  const popularTitles = popularExpanded
    ? [...POPULAR_TITLES_INITIAL, ...POPULAR_TITLES_MORE]
    : [...POPULAR_TITLES_INITIAL]

  return (
    <div className="mx-auto max-w-6xl px-6 py-10 md:px-10 md:py-14">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <header className="max-w-2xl space-y-2">
          <h1 className="text-2xl font-semibold tracking-tight text-balance text-foreground md:text-3xl">
            Briefly tell us about your background
          </h1>
          <p className="text-sm leading-relaxed text-pretty text-muted-foreground md:text-base">
            Choose from our pre-written examples below or write your own.
          </p>
        </header>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="shrink-0 gap-1.5 self-start text-muted-foreground hover:text-foreground sm:self-auto"
        >
          <Lightbulb className="size-4" aria-hidden />
          Tips
        </Button>
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-2 lg:items-start">
        <div className="min-h-0 min-w-0 space-y-8">
          <Field>
            <FieldLabel
              htmlFor="summarySearch"
              className="font-normal text-muted-foreground"
            >
              Search by job title for pre-written examples
            </FieldLabel>
            <Input
              id="summarySearch"
              name="summarySearch"
              placeholder="Search by job title"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              aria-label="Search pre-written summary examples"
            />
          </Field>

          <section className="space-y-3">
            <h2 className="text-sm font-medium text-foreground">
              Popular Job Titles
            </h2>
            <div className="flex flex-wrap gap-2">
              {popularTitles.map((title) => (
                <Button
                  key={title}
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-8 rounded-full font-normal"
                  onClick={() => applyPopularTitle(title)}
                >
                  {title}
                </Button>
              ))}
              {!popularExpanded ? (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-8 text-muted-foreground"
                  onClick={() => setPopularExpanded(true)}
                >
                  + See more
                </Button>
              ) : null}
            </div>
          </section>

          <section className="flex min-h-0 flex-col space-y-3">
            <h2 className="text-sm font-medium text-foreground">
              Ready to use examples
            </h2>
            {filteredExamples.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No examples match your search. Try another keyword or write your
                own summary.
              </p>
            ) : (
              <div className="max-h-[min(28rem,55vh)] overflow-y-auto overscroll-contain pr-1">
                <ul className="grid gap-2">
                  {filteredExamples.map((example) => (
                    <li
                      key={example}
                      className="flex flex-col gap-2 rounded-lg border border-border bg-card px-3 py-2 sm:flex-row sm:items-start sm:justify-between sm:gap-3"
                    >
                      <span className="line-clamp-4 min-w-0 text-sm leading-snug text-foreground">
                        {example}
                      </span>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="h-7 shrink-0 self-start px-2 text-xs sm:self-center"
                        onClick={() => appendExample(example)}
                      >
                        ADD
                      </Button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </section>
        </div>

        <div className="min-w-0 space-y-6 lg:sticky lg:top-6">
          <section className="space-y-3">
            <h2 className="text-sm font-medium text-foreground">
              Your summary
            </h2>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="w-fit gap-1.5"
            >
              <Sparkles className="size-4" aria-hidden />
              Enhance with AI
            </Button>
            <Textarea
              id="summary"
              name="summary"
              className="min-h-[220px]"
              placeholder="Write your summary here."
              aria-label="Professional summary"
              value={summary}
              onChange={(e) => patchDraft({ summary: e.target.value })}
              rows={10}
            />
          </section>

          <div className="flex flex-col gap-3 border-t border-border pt-6 sm:flex-row sm:items-center sm:justify-between">
            <Button variant="outline" asChild className="w-full sm:w-auto">
              <Link href="/new/languages">Back</Link>
            </Button>
            <Button asChild className="w-full sm:w-auto">
              <Link href="/new/references">Next: References</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
