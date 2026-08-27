"use client"

import { useState } from "react"
import {
  Globe,
  GripVertical,
  Plus,
  Search,
  Star,
  X,
} from "lucide-react"

import { BuilderStepFooter } from "@/components/resume/builder-step-footer"
import {
  BuilderFormCard,
  BuilderStepHeader,
  BuilderStepPage,
  BuilderTipsButton,
} from "@/components/resume/builder-step-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useResumeDraft } from "@/hooks/use-resume-draft"
import type { ResumeLanguage } from "@/lib/resume-draft"
import { cn, generateId } from "@/lib/utils"

type ProficiencyLevel = {
  value: 1 | 2 | 3 | 4
  badge: string
  label: string
  isStar?: boolean
}

const PROFICIENCY_LEVELS: ProficiencyLevel[] = [
  { value: 1, badge: "A1", label: "Beginner" },
  { value: 2, badge: "B1", label: "Intermediate" },
  { value: 3, badge: "C1", label: "Fluent" },
  { value: 4, badge: "★", label: "Native", isStar: true },
]

export function LanguagesStep() {
  const { draft, patchDraft } = useResumeDraft()
  const languages = draft.languages || []
  const [langName, setLangName] = useState("")
  const [selectedLevel, setSelectedLevel] = useState(2)
  const [draggingId, setDraggingId] = useState<string | null>(null)
  const canReorder = languages.length > 1

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
      { id: generateId(), name: trimmed, rating: selectedLevel },
    ])
    setLangName("")
  }

  function removeLanguage(id: string) {
    setLanguages(languages.filter((l) => l.id !== id))
  }

  function setRating(id: string, rating: number) {
    setLanguages(languages.map((l) => (l.id === id ? { ...l, rating } : l)))
  }

  function reorderLanguages(fromId: string, toId: string) {
    const fromIndex = languages.findIndex((l) => l.id === fromId)
    const toIndex = languages.findIndex((l) => l.id === toId)
    if (fromIndex === -1 || toIndex === -1 || fromIndex === toIndex) return

    const next = [...languages]
    const [moved] = next.splice(fromIndex, 1)
    next.splice(toIndex, 0, moved)
    setLanguages(next)
  }

  function handleDragStart(event: React.DragEvent, id: string) {
    setDraggingId(id)
    event.dataTransfer.effectAllowed = "move"
    event.dataTransfer.setData("text/plain", id)
  }

  function handleDragOver(event: React.DragEvent) {
    event.preventDefault()
    event.dataTransfer.dropEffect = "move"
  }

  function handleDrop(event: React.DragEvent, targetId: string) {
    event.preventDefault()
    const fromId = event.dataTransfer.getData("text/plain") || draggingId
    if (fromId && fromId !== targetId) {
      reorderLanguages(fromId, targetId)
    }
    setDraggingId(null)
  }

  function handleDragEnd() {
    setDraggingId(null)
  }

  function getLevelLabel(rating: number) {
    return PROFICIENCY_LEVELS.find((l) => l.value === rating)?.label ?? "Intermediate"
  }

  function getLevelBadge(rating: number) {
    return PROFICIENCY_LEVELS.find((l) => l.value === rating)?.badge ?? "B1"
  }

  return (
    <BuilderStepPage>
      <BuilderStepHeader
        title="Which languages do you speak?"
        description="Add the languages you know and rate your proficiency level."
        action={<BuilderTipsButton />}
      />

        <BuilderFormCard className="mt-8" padding="sm">
          <div className="pl-2">
            <label
              htmlFor="languageName"
              className="mb-2 block text-sm font-medium text-foreground"
            >
              Language Name
            </label>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <div className="relative min-w-0 flex-1">
                <Input
                  id="languageName"
                  placeholder="e.g. English, Spanish, Mandarin"
                  value={langName}
                  onChange={(e) => setLangName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault()
                      addLanguage()
                    }
                  }}
                  className="h-12 rounded-xl border border-border/70 bg-white pr-10 text-sm shadow-none"
                />
                <Search
                  className="pointer-events-none absolute top-1/2 right-4 size-4 -translate-y-1/2 text-muted-foreground"
                  aria-hidden
                />
              </div>
              <Button
                type="button"
                onClick={addLanguage}
                className="h-12 shrink-0 rounded-xl bg-blue-600 px-5 font-semibold hover:bg-blue-700"
              >
                <Plus className="size-4" aria-hidden />
                Add Language
              </Button>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
              {PROFICIENCY_LEVELS.map((level) => {
                const selected = selectedLevel === level.value
                return (
                  <button
                    key={level.value}
                    type="button"
                    onClick={() => setSelectedLevel(level.value)}
                    className="flex flex-col items-center gap-2 rounded-xl p-2 transition-colors hover:bg-blue-50/50"
                    aria-pressed={selected}
                  >
                    <span
                      className={cn(
                        "flex size-12 items-center justify-center rounded-full border-2 text-sm font-semibold transition-colors",
                        selected
                          ? "border-blue-600 bg-blue-50 text-blue-600"
                          : "border-border/70 bg-white text-muted-foreground"
                      )}
                    >
                      {level.isStar ? (
                        <Star
                          className={cn(
                            "size-5",
                            selected && "fill-blue-600 text-blue-600"
                          )}
                          aria-hidden
                        />
                      ) : (
                        level.badge
                      )}
                    </span>
                    <span
                      className={cn(
                        "text-xs font-medium",
                        selected ? "text-blue-600" : "text-muted-foreground"
                      )}
                    >
                      {level.label}
                    </span>
                  </button>
                )
              })}
            </div>
          </div>
        </BuilderFormCard>

        <section className="mt-8">
          <div className="flex items-center gap-2">
            <h2 className="text-base font-semibold text-foreground">
              Your Languages
            </h2>
            <span className="rounded-full bg-blue-50 px-2 py-0.5 text-xs font-semibold text-blue-600">
              {languages.length}
            </span>
          </div>
          {canReorder ? (
            <p className="mt-1 text-xs text-muted-foreground">
              Drag languages to change their order on your resume.
            </p>
          ) : null}

          {languages.length === 0 ? (
            <div className="mt-4 flex flex-col items-center justify-center rounded-2xl border border-border/60 bg-white px-6 py-14 text-center">
              <Globe
                className="size-10 text-muted-foreground/40"
                aria-hidden
              />
              <p className="mt-4 text-sm font-medium text-muted-foreground">
                No languages added yet.
              </p>
              <p className="mt-1 text-sm text-muted-foreground/80">
                Start by typing a language above.
              </p>
            </div>
          ) : (
            <ul className="mt-4 space-y-3">
              {languages.map((lang) => (
                <li
                  key={lang.id}
                  onDragOver={canReorder ? handleDragOver : undefined}
                  onDrop={canReorder ? (e) => handleDrop(e, lang.id) : undefined}
                  className={cn(
                    "flex flex-col gap-4 rounded-2xl border border-border/60 bg-white p-4 transition-opacity sm:flex-row sm:items-center sm:justify-between sm:gap-3",
                    draggingId === lang.id && "opacity-50",
                    canReorder &&
                      draggingId &&
                      draggingId !== lang.id &&
                      "border-dashed border-blue-300"
                  )}
                >
                  <div className="flex min-w-0 items-center justify-between gap-3 sm:justify-start">
                    <div className="flex min-w-0 items-center gap-3">
                      {canReorder ? (
                        <span
                          draggable
                          onDragStart={(e) => handleDragStart(e, lang.id)}
                          onDragEnd={handleDragEnd}
                          className="flex shrink-0 cursor-grab touch-none rounded-lg bg-[#f8f9fb] p-2 text-muted-foreground hover:text-foreground active:cursor-grabbing sm:bg-transparent sm:p-1"
                          aria-label={`Drag to reorder ${lang.name}`}
                          title="Drag to reorder"
                        >
                          <GripVertical className="size-4" aria-hidden />
                        </span>
                      ) : null}
                      <span className="flex size-11 shrink-0 items-center justify-center rounded-full border-2 border-blue-600 bg-blue-50 text-xs font-semibold text-blue-600 sm:size-10">
                        {getLevelBadge(lang.rating) === "★" ? (
                          <Star className="size-4 fill-blue-600 text-blue-600" />
                        ) : (
                          getLevelBadge(lang.rating)
                        )}
                      </span>
                      <div className="min-w-0">
                        <p className="truncate text-base font-semibold text-foreground sm:text-sm">
                          {lang.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {getLevelLabel(lang.rating)}
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeLanguage(lang.id)}
                      className="flex size-9 shrink-0 items-center justify-center rounded-full bg-[#f8f9fb] text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive sm:hidden"
                      aria-label={`Remove ${lang.name}`}
                    >
                      <X className="size-4" />
                    </button>
                  </div>

                  <div className="flex items-center gap-2 sm:shrink-0">
                    <div className="w-full sm:w-auto">
                      <p className="mb-2 text-xs font-medium text-muted-foreground sm:hidden">
                        Change proficiency
                      </p>
                      <div className="grid grid-cols-4 gap-2 sm:flex sm:gap-1">
                        {PROFICIENCY_LEVELS.map((level) => {
                          const selected = lang.rating === level.value
                          return (
                            <button
                              key={level.value}
                              type="button"
                              onClick={() => setRating(lang.id, level.value)}
                              className={cn(
                                "flex flex-col items-center justify-center gap-1 rounded-xl border px-1 py-2.5 transition-colors sm:size-8 sm:rounded-full sm:px-0 sm:py-0",
                                selected
                                  ? "border-blue-600 bg-blue-50 text-blue-600"
                                  : "border-border/70 bg-[#f8f9fb] text-muted-foreground hover:border-blue-200 sm:bg-white"
                              )}
                              aria-label={`Set ${lang.name} to ${level.label}`}
                              aria-pressed={selected}
                            >
                              <span className="text-[0.65rem] font-semibold sm:contents">
                                {level.isStar ? (
                                  <Star
                                    className={cn(
                                      "size-3.5 sm:size-3",
                                      selected && "fill-blue-600 text-blue-600"
                                    )}
                                  />
                                ) : (
                                  level.badge
                                )}
                              </span>
                              <span className="text-[0.6rem] font-medium leading-none sm:hidden">
                                {level.label}
                              </span>
                            </button>
                          )
                        })}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeLanguage(lang.id)}
                      className="hidden rounded-md p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive sm:block"
                      aria-label={`Remove ${lang.name}`}
                    >
                      <X className="size-4" />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        <BuilderStepFooter
          backHref="/new/skills"
          nextHref="/new/summary"
          nextLabel="Next: Summary"
        />
    </BuilderStepPage>
  )
}
