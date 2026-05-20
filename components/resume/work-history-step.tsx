"use client"

import { useId } from "react"
import Link from "next/link"
import { Lightbulb, Plus, Trash2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Field, FieldLabel } from "@/components/ui/field"
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
import { MONTHS } from "@/lib/resume-form-constants"

const YEAR_OPTIONS = (() => {
  const max = new Date().getFullYear() + 6
  const min = 1970
  const list: number[] = []

  for (let y = max; y >= min; y--) {
    list.push(y)
  }

  return list
})()

function FormField({
  id,
  label,
  required,
  placeholder,
  autoComplete,
  value,
  onChange,
}: {
  id: string
  label: string
  required?: boolean
  placeholder: string
  autoComplete?: string
  value: string
  onChange: (value: string) => void
}) {
  return (
    <Field>
      <FieldLabel htmlFor={id}>
        {label}

        {required ? (
          <span className="text-destructive" aria-hidden>
            {" "}
            *
          </span>
        ) : null}
      </FieldLabel>

      <Input
        id={id}
        name={id}
        required={required}
        placeholder={placeholder}
        autoComplete={autoComplete}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </Field>
  )
}

const EMPTY_WORK = {
  id: crypto.randomUUID(),
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

  const workHistory =
    draft.workHistory?.length > 0 ? draft.workHistory : [EMPTY_WORK]

  function updateWork(index: number, patch: Partial<(typeof workHistory)[0]>) {
    const updated = [...workHistory]

    updated[index] = {
      ...updated[index],
      ...patch,
    }

    patchDraft({
      workHistory: updated,
    })
  }

  function addWork() {
    patchDraft({
      workHistory: [
        ...workHistory,
        {
          ...EMPTY_WORK,
          id: crypto.randomUUID(),
        },
      ],
    })
  }

  function removeWork(index: number) {
    const updated = workHistory.filter((_, i) => i !== index)

    patchDraft({
      workHistory:
        updated.length > 0
          ? updated
          : [
              {
                ...EMPTY_WORK,
                id: crypto.randomUUID(),
              },
            ],
    })
  }

  return (
    <div className="mx-auto max-w-4xl px-6 py-10 md:px-10 md:py-14">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <header className="max-w-2xl space-y-2">
          <h1 className="text-2xl font-semibold tracking-tight text-balance text-foreground md:text-3xl">
            Tell us about your work history
          </h1>

          <p className="text-sm leading-relaxed text-pretty text-muted-foreground md:text-base">
            Add your recent jobs first and work backward.
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
        {workHistory.map((work: typeof EMPTY_WORK, index: number) => {
          const currentJobId = `current-job-${work.id}`

          return (
            <div
              key={work.id}
              className="rounded-xl border border-border bg-background p-6"
            >
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-foreground">
                    Work Experience {index + 1}
                  </h2>

                  <p className="text-sm text-muted-foreground">
                    Add your professional experience
                  </p>
                </div>

                {workHistory.length > 1 ? (
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => removeWork(index)}
                  >
                    <Trash2 className="size-4" />
                  </Button>
                ) : null}
              </div>

              <form className="grid gap-6" noValidate>
                <FormField
                  id={`jobTitle-${index}`}
                  label="Title"
                  required
                  placeholder="Software Engineer"
                  autoComplete="organization-title"
                  value={work.jobTitle}
                  onChange={(v) =>
                    updateWork(index, {
                      jobTitle: v,
                    })
                  }
                />

                <FormField
                  id={`employer-${index}`}
                  label="Employer"
                  required
                  placeholder="Google"
                  autoComplete="organization"
                  value={work.employer}
                  onChange={(v) =>
                    updateWork(index, {
                      employer: v,
                    })
                  }
                />

                <FormField
                  id={`location-${index}`}
                  label="Location"
                  placeholder="Dhaka"
                  autoComplete="address-level2"
                  value={work.location}
                  onChange={(v) =>
                    updateWork(index, {
                      location: v,
                    })
                  }
                />

                <Field orientation="horizontal" className="items-center gap-3">
                  <Checkbox
                    id={`remote-${index}`}
                    checked={work.remote}
                    onCheckedChange={(v) =>
                      updateWork(index, {
                        remote: v === true,
                      })
                    }
                  />

                  <FieldLabel
                    htmlFor={`remote-${index}`}
                    className="font-normal"
                  >
                    Remote
                  </FieldLabel>
                </Field>

                <fieldset className="space-y-3">
                  <legend className="text-sm font-medium text-foreground">
                    Start Date
                  </legend>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <Field>
                      <Select
                        value={work.startMonth || undefined}
                        onValueChange={(v) =>
                          updateWork(index, {
                            startMonth: v,
                          })
                        }
                      >
                        <SelectTrigger className="w-full">
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
                    </Field>

                    <Field>
                      <Select
                        value={work.startYear || undefined}
                        onValueChange={(v) =>
                          updateWork(index, {
                            startYear: v,
                          })
                        }
                      >
                        <SelectTrigger className="w-full">
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
                    </Field>
                  </div>
                </fieldset>

                <fieldset className="space-y-3">
                  <legend className="text-sm font-medium text-foreground">
                    End Date
                  </legend>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <Field>
                      <Select
                        value={work.endMonth || undefined}
                        disabled={work.currentJob}
                        onValueChange={(v) =>
                          updateWork(index, {
                            endMonth: v,
                          })
                        }
                      >
                        <SelectTrigger className="w-full">
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
                    </Field>

                    <Field>
                      <Select
                        value={work.endYear || undefined}
                        disabled={work.currentJob}
                        onValueChange={(v) =>
                          updateWork(index, {
                            endYear: v,
                          })
                        }
                      >
                        <SelectTrigger className="w-full">
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
                    </Field>
                  </div>
                </fieldset>

                <Field orientation="horizontal" className="items-center gap-3">
                  <Checkbox
                    id={currentJobId}
                    checked={work.currentJob}
                    onCheckedChange={(v) => {
                      const checked = v === true

                      if (checked) {
                        updateWork(index, {
                          currentJob: true,
                          endMonth: "",
                          endYear: "",
                        })
                      } else {
                        updateWork(index, {
                          currentJob: false,
                        })
                      }
                    }}
                  />

                  <FieldLabel htmlFor={currentJobId} className="font-normal">
                    I currently work here
                  </FieldLabel>
                </Field>

                <Field>
                  <FieldLabel htmlFor={`responsibilities-${index}`}>
                    Responsibilities
                  </FieldLabel>

                  <Textarea
                    id={`responsibilities-${index}`}
                    placeholder="Describe your responsibilities, achievements, and daily tasks..."
                    className="min-h-[140px] resize-y"
                    value={work.responsibilities || ""}
                    onChange={(e) =>
                      updateWork(index, {
                        responsibilities: e.target.value,
                      })
                    }
                  />

                  <p className="mt-1 text-xs text-muted-foreground">
                    Example: Managed a team of 5 developers and improved system
                    performance by 30%.
                  </p>
                </Field>
              </form>
            </div>
          )
        })}

        <Button
          type="button"
          variant="outline"
          className="w-full gap-2"
          onClick={addWork}
        >
          <Plus className="size-4" />
          Add Another Work Experience
        </Button>

        <div className="flex flex-col-reverse justify-between gap-3 border-t border-border pt-6 sm:flex-row sm:items-center">
          <Button variant="outline" asChild>
            <Link href="/new">Back</Link>
          </Button>

          <Button asChild>
            <Link href="/new/education">Next: Education</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
