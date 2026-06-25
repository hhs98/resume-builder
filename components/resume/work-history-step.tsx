"use client"

import Link from "next/link"
import { useState } from "react"
import {
  ArrowLeft,
  Calendar,
  Check,
  Lightbulb,
  MapPin,
  Plus,
  Sparkles,
  Trash2,
  Undo2,
} from "lucide-react"

import { BuilderStepFooter } from "@/components/resume/builder-step-footer"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { useResumeDraft } from "@/hooks/use-resume-draft"
import {
  aiErrorFromResponse,
  parseAiResponseJson,
  toUserFacingAiError,
} from "@/lib/ai-errors"
import { normalizeEnhancedResponsibilities } from "@/lib/enhance-work-history"
import { MONTHS } from "@/lib/resume-form-constants"
import { cn, generateId } from "@/lib/utils"

const YEAR_OPTIONS = (() => {
  const max = new Date().getFullYear() + 6
  const min = 1970
  const list: number[] = []

  for (let y = max; y >= min; y--) {
    list.push(y)
  }

  return list
})()

const fieldClassName =
  "h-12 rounded-xl border border-border/70 bg-white px-4 text-sm shadow-none placeholder:text-muted-foreground focus-visible:border-blue-500 focus-visible:ring-2 focus-visible:ring-blue-500/20"

const selectClassName =
  "h-12 w-full rounded-xl border border-border/70 bg-white px-4 text-sm shadow-none focus-visible:border-blue-500 focus-visible:ring-2 focus-visible:ring-blue-500/20"

function ToggleSwitch({
  checked,
  onCheckedChange,
  id,
  "aria-label": ariaLabel,
}: {
  checked: boolean
  onCheckedChange: (checked: boolean) => void
  id?: string
  "aria-label"?: string
}) {
  return (
    <button
      id={id}
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={ariaLabel}
      onClick={() => onCheckedChange(!checked)}
      className={cn(
        "relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors",
        checked ? "bg-blue-600" : "bg-muted-foreground/30"
      )}
    >
      <span
        className={cn(
          "inline-block size-5 rounded-full bg-white shadow-sm transition-transform",
          checked ? "translate-x-5" : "translate-x-0.5"
        )}
      />
    </button>
  )
}

const EMPTY_WORK = {
  id: generateId(),
  jobTitle: "",
  employer: "",
  location: "",
  remote: false,
  startMonth: "",
  startYear: "",
  endMonth: "",
  endYear: "",
  currentJob: false,
  responsibilities: "",
}

export function WorkHistoryStep() {
  const { draft, patchDraft } = useResumeDraft()
  const [enhancingIndex, setEnhancingIndex] = useState<number | null>(null)
  const [enhanceError, setEnhanceError] = useState<{
    index: number
    message: string
  } | null>(null)
  const [pendingSuggestionByWorkId, setPendingSuggestionByWorkId] = useState<
    Record<string, string>
  >({})
  const [addedSuggestionByWorkId, setAddedSuggestionByWorkId] = useState<
    Record<string, boolean>
  >({})
  const [undoByWorkId, setUndoByWorkId] = useState<Record<string, string>>({})

  const workHistory =
    draft.workHistory?.length > 0 ? draft.workHistory : [EMPTY_WORK]

  function updateWork(index: number, patch: Partial<(typeof workHistory)[0]>) {
    const updated = [...workHistory]
    updated[index] = { ...updated[index], ...patch }
    patchDraft({ workHistory: updated })
  }

  function addWork() {
    patchDraft({
      workHistory: [
        ...workHistory,
        { ...EMPTY_WORK, id: generateId() },
      ],
    })
  }

  function removeWork(index: number) {
    const updated = workHistory.filter((_, i) => i !== index)
    patchDraft({
      workHistory:
        updated.length > 0
          ? updated
          : [{ ...EMPTY_WORK, id: generateId() }],
    })
  }

  async function enhanceResponsibilities(index: number) {
    const work = workHistory[index]
    if (!work) return

    if (!work.jobTitle.trim() && !work.employer.trim()) {
      setEnhanceError({
        index,
        message: "Add a job title or employer before using AI Suggest.",
      })
      return
    }

    setEnhanceError(null)
    setEnhancingIndex(index)

    try {
      const response = await fetch("/api/ai/enhance-work-history", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jobTitle: work.jobTitle,
          employer: work.employer,
          location: work.location,
          remote: work.remote,
          startMonth: work.startMonth,
          startYear: work.startYear,
          endMonth: work.endMonth,
          endYear: work.endYear,
          currentJob: work.currentJob,
          responsibilities: work.responsibilities || "",
        }),
      })

      const data = await parseAiResponseJson<{
        responsibilities?: string
        error?: string
      }>(response)

      if (!response.ok) {
        throw new Error(
          aiErrorFromResponse(
            response,
            data,
            "We couldn't generate suggestions right now. Please try again."
          )
        )
      }

      if (!data.responsibilities?.trim()) {
        throw new Error(
          "AI didn't return any suggestions. Add a bit more detail and try again."
        )
      }

      const normalized = normalizeEnhancedResponsibilities(data.responsibilities)
      setPendingSuggestionByWorkId((current) => ({
        ...current,
        [work.id]: normalized,
      }))
      setAddedSuggestionByWorkId((current) => {
        const next = { ...current }
        delete next[work.id]
        return next
      })
      setUndoByWorkId((current) => {
        const next = { ...current }
        delete next[work.id]
        return next
      })
    } catch (error) {
      setEnhanceError({
        index,
        message: toUserFacingAiError(
          error,
          "We couldn't generate suggestions right now. Please try again."
        ),
      })
    } finally {
      setEnhancingIndex(null)
    }
  }

  function addAllSuggestions(index: number) {
    const work = workHistory[index]
    if (!work) return

    const pendingSuggestion = pendingSuggestionByWorkId[work.id]
    if (!pendingSuggestion?.trim()) return

    const current = work.responsibilities.trim()
    const toAdd = pendingSuggestion.trim()

    setUndoByWorkId((currentUndo) => {
      if (work.id in currentUndo) return currentUndo
      return {
        ...currentUndo,
        [work.id]: work.responsibilities || "",
      }
    })

    updateWork(index, {
      responsibilities: current ? `${current}\n${toAdd}` : toAdd,
    })
    setAddedSuggestionByWorkId((current) => ({
      ...current,
      [work.id]: true,
    }))
    setEnhanceError(null)
  }

  function undoSuggestion(index: number) {
    const work = workHistory[index]
    if (!work) return

    const previous = undoByWorkId[work.id]
    if (previous === undefined) return

    updateWork(index, { responsibilities: previous })
    setAddedSuggestionByWorkId((current) => {
      const next = { ...current }
      delete next[work.id]
      return next
    })
    setUndoByWorkId((current) => {
      const next = { ...current }
      delete next[work.id]
      return next
    })
  }

  return (
    <div className="min-h-full bg-[#f8f9fb]">
      <div className="mx-auto max-w-3xl px-6 py-8 sm:px-8 sm:py-10">
        <div className="flex items-center justify-between">
          <Link
            href="/new"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="size-4" aria-hidden />
            Back
          </Link>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-9 gap-1.5 rounded-full border-blue-200 bg-white px-4 text-blue-600 shadow-none hover:bg-blue-50"
          >
            <Lightbulb className="size-4" aria-hidden />
            Tips
          </Button>
        </div>

        <header className="mt-8 space-y-2">
          <h1 className="text-2xl font-bold tracking-tight text-balance text-[#1f2937] md:text-3xl">
            Tell us about your work history
          </h1>
          <p className="text-sm leading-relaxed text-pretty text-muted-foreground md:text-base">
            Add your recent jobs first and work backward.
          </p>
        </header>

        <div className="mt-8 space-y-6">
          {workHistory.map((work, index) => {
            const currentJobId = `current-job-${work.id}`
            const remoteId = `remote-${work.id}`
            const pendingSuggestion = pendingSuggestionByWorkId[work.id]
            const suggestionAdded = Boolean(
              pendingSuggestion && addedSuggestionByWorkId[work.id]
            )
            const canUndo = work.id in undoByWorkId

            return (
              <div
                key={work.id}
                className="relative overflow-hidden rounded-2xl border border-border/60 bg-white p-6 shadow-sm sm:p-7"
              >
                <div
                  className="absolute inset-y-0 left-0 w-1 bg-blue-600"
                  aria-hidden
                />

                <div className="mb-4 flex items-center justify-between gap-3 pl-2">
                  <span className="rounded-full bg-violet-100 px-3 py-1 text-[0.65rem] font-semibold tracking-[0.12em] text-violet-700 uppercase">
                    Experience {index + 1}
                  </span>
                  {workHistory.length > 1 ? (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-8 gap-1.5 px-2.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                      onClick={() => removeWork(index)}
                      aria-label={`Remove work experience ${index + 1}`}
                    >
                      <Trash2 className="size-3.5" aria-hidden />
                      <span className="text-xs font-medium">Remove</span>
                    </Button>
                  ) : null}
                </div>

                <div className="space-y-4 pl-2">
                  <Input
                    id={`jobTitle-${index}`}
                    placeholder="Job Title"
                    autoComplete="organization-title"
                    value={work.jobTitle}
                    onChange={(e) =>
                      updateWork(index, { jobTitle: e.target.value })
                    }
                    className={fieldClassName}
                  />

                  <Input
                    id={`employer-${index}`}
                    placeholder="Company name"
                    autoComplete="organization"
                    value={work.employer}
                    onChange={(e) =>
                      updateWork(index, { employer: e.target.value })
                    }
                    className={fieldClassName}
                  />

                  <div className="relative">
                    <MapPin
                      className="pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2 text-muted-foreground"
                      aria-hidden
                    />
                    <Input
                      id={`location-${index}`}
                      placeholder="Location"
                      autoComplete="address-level2"
                      value={work.location}
                      onChange={(e) =>
                        updateWork(index, { location: e.target.value })
                      }
                      className={cn(fieldClassName, "pl-10")}
                    />
                  </div>

                  <div className="flex items-center justify-between gap-4 py-1">
                    <label
                      htmlFor={remoteId}
                      className="text-sm text-foreground"
                    >
                      This is a remote position
                    </label>
                    <ToggleSwitch
                      id={remoteId}
                      checked={work.remote}
                      onCheckedChange={(checked) =>
                        updateWork(index, { remote: checked })
                      }
                      aria-label="Remote position"
                    />
                  </div>

                  <div className="grid gap-6 sm:grid-cols-2">
                    <div>
                      <p className="mb-2 text-[0.65rem] font-semibold tracking-[0.14em] text-muted-foreground uppercase">
                        Start Date
                      </p>
                      <div className="grid grid-cols-2 gap-3">
                        <Select
                          value={work.startMonth || undefined}
                          onValueChange={(v) =>
                            updateWork(index, { startMonth: v })
                          }
                        >
                          <SelectTrigger className={selectClassName}>
                            <SelectValue placeholder="Month" />
                          </SelectTrigger>
                          <SelectContent>
                            {MONTHS.map((m) => (
                              <SelectItem key={m.value} value={m.value}>
                                {m.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Select
                          value={work.startYear || undefined}
                          onValueChange={(v) =>
                            updateWork(index, { startYear: v })
                          }
                        >
                          <SelectTrigger className={selectClassName}>
                            <SelectValue placeholder="Year" />
                          </SelectTrigger>
                          <SelectContent>
                            {YEAR_OPTIONS.map((y) => (
                              <SelectItem key={y} value={String(y)}>
                                {y}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div>
                      <p className="mb-2 text-[0.65rem] font-semibold tracking-[0.14em] text-muted-foreground uppercase">
                        End Date
                      </p>
                      <div className="grid grid-cols-2 gap-3">
                        <Select
                          value={work.endMonth || undefined}
                          disabled={work.currentJob}
                          onValueChange={(v) =>
                            updateWork(index, { endMonth: v })
                          }
                        >
                          <SelectTrigger className={selectClassName}>
                            <SelectValue placeholder="Month" />
                          </SelectTrigger>
                          <SelectContent>
                            {MONTHS.map((m) => (
                              <SelectItem key={m.value} value={m.value}>
                                {m.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Select
                          value={work.endYear || undefined}
                          disabled={work.currentJob}
                          onValueChange={(v) =>
                            updateWork(index, { endYear: v })
                          }
                        >
                          <SelectTrigger className={selectClassName}>
                            <SelectValue placeholder="Year" />
                          </SelectTrigger>
                          <SelectContent>
                            {YEAR_OPTIONS.map((y) => (
                              <SelectItem key={y} value={String(y)}>
                                {y}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-4 rounded-xl bg-blue-50 px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      <Calendar
                        className="size-4 shrink-0 text-blue-600"
                        aria-hidden
                      />
                      <label
                        htmlFor={currentJobId}
                        className="text-sm font-medium text-foreground"
                      >
                        I currently work here
                      </label>
                    </div>
                    <ToggleSwitch
                      id={currentJobId}
                      checked={work.currentJob}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          updateWork(index, {
                            currentJob: true,
                            endMonth: "",
                            endYear: "",
                          })
                        } else {
                          updateWork(index, { currentJob: false })
                        }
                      }}
                      aria-label="I currently work here"
                    />
                  </div>

                  <div>
                    <div className="mb-2 flex flex-wrap items-center justify-between gap-3">
                      <p className="text-sm font-medium text-foreground">
                        Description &amp; Key Responsibilities
                      </p>
                      <div className="flex flex-wrap items-center gap-1">
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          disabled={enhancingIndex === index}
                          onClick={() => enhanceResponsibilities(index)}
                          className="h-8 gap-1.5 px-2 text-blue-600 hover:bg-blue-50 hover:text-blue-700 disabled:opacity-60"
                        >
                          <Sparkles className="size-3.5" aria-hidden />
                          {enhancingIndex === index
                            ? "Generating..."
                            : "AI Suggest"}
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          disabled={!canUndo}
                          onClick={() => undoSuggestion(index)}
                          className="h-8 gap-1.5 px-2 text-blue-600 hover:bg-blue-50 hover:text-blue-700 disabled:opacity-40"
                        >
                          <Undo2 className="size-3.5" aria-hidden />
                          Undo
                        </Button>
                      </div>
                    </div>
                    {enhanceError?.index === index ? (
                      <p className="mb-2 text-xs text-destructive">
                        {enhanceError.message}
                      </p>
                    ) : null}
                    {pendingSuggestion ? (
                      <div className="mb-3 overflow-hidden rounded-xl border border-blue-200 bg-blue-50/50">
                        <div className="border-b border-blue-200/80 px-4 py-3">
                          <p className="text-xs font-semibold tracking-wide text-blue-700 uppercase">
                            AI suggestion
                          </p>
                          <p className="mt-0.5 text-xs text-muted-foreground">
                            Review below, then add all bullets at once.
                          </p>
                        </div>
                        <p className="whitespace-pre-wrap px-4 py-3 text-sm leading-relaxed text-foreground">
                          {pendingSuggestion}
                        </p>
                        <div className="border-t border-blue-200/80 px-4 py-3">
                          <Button
                            type="button"
                            size="sm"
                            disabled={suggestionAdded}
                            onClick={() => addAllSuggestions(index)}
                            className={cn(
                              "gap-1.5",
                              suggestionAdded
                                ? "cursor-default border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-50"
                                : "bg-blue-600 text-white hover:bg-blue-700"
                            )}
                            variant={suggestionAdded ? "outline" : "default"}
                          >
                            {suggestionAdded ? (
                              <Check className="size-3.5" aria-hidden />
                            ) : (
                              <Plus className="size-3.5" aria-hidden />
                            )}
                            {suggestionAdded ? "Added" : "ADD"}
                          </Button>
                        </div>
                      </div>
                    ) : null}
                    <Textarea
                      id={`responsibilities-${index}`}
                      placeholder="Describe your impact and achievements..."
                      className="min-h-36 resize-y rounded-xl border border-border/70 bg-white px-4 py-3 text-sm shadow-none focus-visible:border-blue-500 focus-visible:ring-2 focus-visible:ring-blue-500/20"
                      value={work.responsibilities || ""}
                      onChange={(e) =>
                        updateWork(index, {
                          responsibilities: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>
              </div>
            )
          })}

          <button
            type="button"
            onClick={addWork}
            className="flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-border/80 bg-white/50 px-6 py-8 text-sm font-semibold text-muted-foreground transition-colors hover:border-blue-300 hover:bg-blue-50/40 hover:text-blue-700"
          >
            <Plus className="size-4" aria-hidden />
            Add Another Work Experience
          </button>
        </div>

        <BuilderStepFooter
          backHref="/new"
          nextHref="/new/education"
          nextLabel="Next: Education"
        />
      </div>
    </div>
  )
}
