"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { Lightbulb, Sparkles, Star, X } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Field, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { useResumeDraft } from "@/hooks/use-resume-draft"
import type { ResumeSkill } from "@/lib/resume-draft"
import { cn } from "@/lib/utils"

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

const PREWRITTEN_EXAMPLES = [
  "Cash handling & balancing",
  "Point of sale (POS) systems",
  "Customer conflict resolution",
  "Inventory management",
  "Upselling & cross-selling",
  "Food safety & sanitation",
  "Opening & closing procedures",
  "Team scheduling",
  "Visual merchandising",
  "Loss prevention awareness",
  "Bilingual communication",
  "Active listening",
  "Microsoft Office",
  "Data entry & accuracy",
  "Time management",
  "Training new hires",
  "Quality assurance",
  "Relationship building",
  "Problem solving",
  "Adaptability in fast-paced settings",
] as const

function newSkillId() {
  return crypto.randomUUID()
}

function StarRating({
  value,
  onChange,
}: {
  value: number
  onChange: (n: number) => void
}) {
  return (
    <div className="flex gap-0.5" role="group">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          onClick={() => onChange(n)}
          className="rounded p-0.5 text-muted-foreground transition-colors hover:text-amber-500 focus-visible:ring-2 focus-visible:ring-ring"
          aria-label={`${n} out of 5`}
        >
          <Star
            className={cn(
              "size-4",
              n <= value && "fill-amber-400 text-amber-400"
            )}
          />
        </button>
      ))}
    </div>
  )
}

export function SkillsStep() {
  const { draft, patchDraft } = useResumeDraft()
  const skills = draft.skills
  const [search, setSearch] = useState("")
  const [popularExpanded, setPopularExpanded] = useState(false)
  const [customDraft, setCustomDraft] = useState("")

  function setSkills(next: ResumeSkill[]) {
    patchDraft({ skills: next })
  }

  const filteredExamples = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return [...PREWRITTEN_EXAMPLES]
    return PREWRITTEN_EXAMPLES.filter((s) => s.toLowerCase().includes(q))
  }, [search])

  const skillNamesLower = useMemo(
    () => new Set(skills.map((s) => s.name.toLowerCase())),
    [skills]
  )

  function addSkill(name: string) {
    const trimmed = name.trim()
    if (!trimmed) return
    if (skills.some((s) => s.name.toLowerCase() === trimmed.toLowerCase())) {
      return
    }
    setSkills([...skills, { id: newSkillId(), name: trimmed, rating: 3 }])
  }

  function removeSkill(id: string) {
    setSkills(skills.filter((s) => s.id !== id))
  }

  function setRating(id: string, rating: number) {
    setSkills(skills.map((s) => (s.id === id ? { ...s, rating } : s)))
  }

  function addCustomFromTextarea() {
    const parts = customDraft
      .split(/[,;\n]+/)
      .map((p) => p.trim())
      .filter(Boolean)
    const existing = new Set(skills.map((s) => s.name.toLowerCase()))
    const next = [...skills]
    for (const p of parts) {
      const lower = p.toLowerCase()
      if (existing.has(lower)) continue
      existing.add(lower)
      next.push({ id: newSkillId(), name: p, rating: 3 })
    }
    setSkills(next)
    setCustomDraft("")
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
            What skills would you like to highlight?
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
              htmlFor="skillSearch"
              className="font-normal text-muted-foreground"
            >
              Search by job title for pre-written examples
            </FieldLabel>
            <Input
              id="skillSearch"
              name="skillSearch"
              placeholder="Title, industry, keyword"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              aria-label="Search pre-written skill examples"
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
                No examples match your search. Try another keyword or add your
                own in the editor.
              </p>
            ) : (
              <div className="max-h-[min(28rem,55vh)] overflow-y-auto overscroll-contain pr-1">
                <ul className="grid gap-2">
                  {filteredExamples.map((example) => {
                    const added = skillNamesLower.has(example.toLowerCase())
                    return (
                      <li
                        key={example}
                        className="flex items-center justify-between gap-3 rounded-lg border border-border bg-card px-3 py-2"
                      >
                        <span className="min-w-0 text-sm leading-snug text-foreground">
                          {example}
                        </span>
                        <Button
                          type="button"
                          variant={added ? "secondary" : "outline"}
                          size="sm"
                          className="h-7 shrink-0 px-2 text-xs"
                          disabled={added}
                          onClick={() => addSkill(example)}
                        >
                          {added ? "Added" : "ADD"}
                        </Button>
                      </li>
                    )
                  })}
                </ul>
              </div>
            )}
          </section>
        </div>

        <div className="min-w-0 space-y-8 lg:sticky lg:top-6">
          <section className="space-y-3">
            <h2 className="text-sm font-medium text-foreground">Text Editor</h2>
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
              id="customSkills"
              name="customSkills"
              className="min-h-[120px]"
              placeholder="Add your skills here."
              aria-label="Add your skills"
              value={customDraft}
              onChange={(e) => setCustomDraft(e.target.value)}
              rows={5}
            />
            <Button type="button" size="sm" onClick={addCustomFromTextarea}>
              Add to list
            </Button>
          </section>

          <section className="space-y-4 rounded-lg border border-border bg-card p-4">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <h2 className="text-sm font-medium text-foreground">
                Skills Rating
              </h2>
              <p className="text-xs text-muted-foreground">
                Skills:{" "}
                <span className="font-medium text-foreground">
                  {skills.length}
                </span>
              </p>
            </div>

            <div className="space-y-1">
              {skills.length === 0 ? (
                <p className="py-4 text-sm text-muted-foreground">
                  Add skills from the examples or your own text to rate them
                  here.
                </p>
              ) : (
                <ul className="max-h-[min(24rem,50vh)] space-y-3 overflow-y-auto overscroll-contain pr-1">
                  {skills.map((s) => (
                    <li
                      key={s.id}
                      className="flex flex-col gap-2 rounded-md border border-border bg-background/50 px-3 py-2 sm:flex-row sm:items-center sm:justify-between"
                    >
                      <span className="text-sm text-foreground">{s.name}</span>
                      <div className="flex items-center gap-3">
                        <StarRating
                          value={s.rating}
                          onChange={(n) => setRating(s.id, n)}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon-sm"
                          className="text-muted-foreground hover:text-destructive"
                          onClick={() => removeSkill(s.id)}
                          aria-label={`Remove ${s.name}`}
                        >
                          <X className="size-4" />
                        </Button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </section>

          <div className="flex flex-col gap-3 border-t border-border pt-6 sm:flex-row sm:items-center sm:justify-between">
            <Button variant="outline" asChild className="w-full sm:w-auto">
              <Link href="/new/education">Back</Link>
            </Button>
            <Button asChild className="w-full sm:w-auto">
              <Link href="/new/languages">Next: Languages</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
