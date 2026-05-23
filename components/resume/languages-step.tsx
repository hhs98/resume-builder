"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { Lightbulb, Star, X } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Field, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { useResumeDraft } from "@/hooks/use-resume-draft"
import type { ResumeLanguage } from "@/lib/resume-draft"
import { cn } from "@/lib/utils"

const PROFICIENCY_LEVELS = [
  { value: 1, label: "Beginner" },
  { value: 2, label: "Intermediate" },
  { value: 3, label: "Advanced" },
  { value: 4, label: "Fluent" },
]

function LanguageStarRating({
  value,
  onChange,
}: {
  value: number
  onChange: (n: number) => void
}) {
  return (
    <div className="flex flex-col items-center gap-1.5">
      <div className="flex gap-1" role="group">
        {[1, 2, 3, 4].map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => onChange(n)}
            className="rounded p-0.5 text-muted-foreground transition-colors hover:text-blue-500 focus-visible:ring-2 focus-visible:ring-ring"
            aria-label={`${n} out of 4 stars: ${PROFICIENCY_LEVELS.find(l => l.value === n)?.label}`}
          >
            <Star
              className={cn(
                "size-5",
                n <= value && "fill-blue-500 text-blue-500"
              )}
            />
          </button>
        ))}
      </div>
      <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
        {PROFICIENCY_LEVELS.find((l) => l.value === value)?.label || "Select Level"}
      </span>
    </div>
  )
}

export function LanguagesStep() {
  const { draft, patchDraft } = useResumeDraft()
  const languages = draft.languages || []
  const [langName, setLangName] = useState("")

  function setLanguages(next: ResumeLanguage[]) {
    patchDraft({ languages: next })
  }

  function addLanguage() {
    const trimmed = langName.trim()
    if (!trimmed) return
    if (languages.some((l) => l.name.toLowerCase() === trimmed.toLowerCase())) {
      setLangName("")
      return
    }
    setLanguages([
      ...languages,
      { id: crypto.randomUUID(), name: trimmed, rating: 2 },
    ])
    setLangName("")
  }

  function removeLanguage(id: string) {
    setLanguages(languages.filter((l) => l.id !== id))
  }

  function setRating(id: string, rating: number) {
    setLanguages(languages.map((l) => (l.id === id ? { ...l, rating } : l)))
  }

  return (
    <div className="mx-auto max-w-4xl px-6 py-10 md:px-10 md:py-14">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <header className="max-w-2xl space-y-2">
          <h1 className="text-2xl font-semibold tracking-tight text-balance text-foreground md:text-3xl">
            Which languages do you speak?
          </h1>
          <p className="text-sm leading-relaxed text-pretty text-muted-foreground md:text-base">
            Add the languages you know and rate your proficiency level.
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

      <div className="mt-8 space-y-8">
        <section className="rounded-xl border border-border bg-card p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
            <Field className="flex-1">
              <FieldLabel htmlFor="languageName">Language Name</FieldLabel>
              <Input
                id="languageName"
                placeholder="e.g. English, Spanish, French"
                value={langName}
                onChange={(e) => setLangName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault()
                    addLanguage()
                  }
                }}
              />
            </Field>
            <Button type="button" onClick={addLanguage} className="shrink-0">
              Add Language
            </Button>
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-sm font-medium text-foreground">Your Languages</h2>
          {languages.length === 0 ? (
            <div className="rounded-lg border border-dashed border-border py-10 text-center">
              <p className="text-sm text-muted-foreground">
                No languages added yet.
              </p>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {languages.map((l) => (
                <div
                  key={l.id}
                  className="flex items-center justify-between rounded-lg border border-border bg-background p-4 transition-colors hover:border-blue-500/50"
                >
                  <div className="min-w-0">
                    <p className="font-semibold text-foreground truncate">
                      {l.name}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <LanguageStarRating
                      value={l.rating}
                      onChange={(n) => setRating(l.id, n)}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      className="text-muted-foreground hover:text-destructive"
                      onClick={() => removeLanguage(l.id)}
                      aria-label={`Remove ${l.name}`}
                    >
                      <X className="size-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        <div className="flex flex-col-reverse justify-between gap-3 border-t border-border pt-6 sm:flex-row sm:items-center">
          <Button variant="outline" asChild>
            <Link href="/new/skills">Back</Link>
          </Button>
          <Button asChild>
            <Link href="/new/summary">Next: Summary</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
