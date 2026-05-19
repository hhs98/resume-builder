"use client"

import { useId } from "react"
import Link from "next/link"
import { Lightbulb } from "lucide-react"

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
import { useResumeDraft } from "@/hooks/use-resume-draft"
import { MONTHS } from "@/lib/resume-form-constants"

const YEAR_OPTIONS = (() => {
  const max = new Date().getFullYear() + 6
  const min = 1970
  const list: number[] = []
  for (let y = max; y >= min; y--) list.push(y)
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

export function WorkHistoryStep() {
  const currentJobId = useId()
  const { draft, patchDraft } = useResumeDraft()
  const work = draft.work

  function updateWork(patch: Partial<typeof work>) {
    patchDraft({ work: { ...work, ...patch } })
  }

  return (
    <div className="mx-auto max-w-4xl px-6 py-10 md:px-10 md:py-14">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <header className="max-w-2xl space-y-2">
          <h1 className="text-2xl font-semibold tracking-tight text-balance text-foreground md:text-3xl">
            Tell us about your most recent job
          </h1>
          <p className="text-sm leading-relaxed text-pretty text-muted-foreground md:text-base">
            We&apos;ll start there and work backward.
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

      <div className="mt-8 max-w-xl space-y-8">
        <p className="text-xs text-muted-foreground">
          <span className="text-destructive">*</span> indicates a required field
        </p>

        <form className="grid gap-6" noValidate>
          <FormField
            id="jobTitle"
            label="Title"
            required
            placeholder="Sales Manager"
            autoComplete="organization-title"
            value={work.jobTitle}
            onChange={(v) => updateWork({ jobTitle: v })}
          />

          <FormField
            id="employer"
            label="Employer"
            required
            placeholder="Dhaka IT Solutions"
            autoComplete="organization"
            value={work.employer}
            onChange={(v) => updateWork({ employer: v })}
          />

          <FormField
            id="location"
            label="Location"
            placeholder="Dhaka"
            autoComplete="address-level2"
            value={work.location}
            onChange={(v) => updateWork({ location: v })}
          />

          <Field orientation="horizontal" className="items-center gap-3">
            <Checkbox
              id="remote"
              checked={work.remote}
              onCheckedChange={(v) => updateWork({ remote: v === true })}
            />
            <FieldLabel htmlFor="remote" className="font-normal">
              Remote
            </FieldLabel>
            <input
              type="hidden"
              name="remote"
              value={work.remote ? "on" : ""}
            />
          </Field>

          <fieldset className="min-w-0 space-y-3 border-0 p-0">
            <legend className="mb-0 w-full text-sm font-medium text-foreground">
              Start Date
            </legend>
            <div className="grid gap-3 sm:grid-cols-2">
              <Field>
                <Select
                  value={work.startMonth || undefined}
                  onValueChange={(v) => updateWork({ startMonth: v })}
                >
                  <SelectTrigger
                    id="startMonth"
                    className="w-full"
                    aria-label="Start date, month"
                  >
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
                <input
                  type="hidden"
                  name="startMonth"
                  value={work.startMonth}
                />
              </Field>
              <Field>
                <Select
                  value={work.startYear || undefined}
                  onValueChange={(v) => updateWork({ startYear: v })}
                >
                  <SelectTrigger
                    id="startYear"
                    className="w-full"
                    aria-label="Start date, year"
                  >
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
                <input
                  type="hidden"
                  name="startYear"
                  value={work.startYear}
                />
              </Field>
            </div>
          </fieldset>

          <fieldset className="min-w-0 space-y-3 border-0 p-0">
            <legend className="mb-0 w-full text-sm font-medium text-foreground">
              End Date
            </legend>
            <div className="grid gap-3 sm:grid-cols-2">
              <Field>
                <Select
                  value={work.endMonth || undefined}
                  onValueChange={(v) => updateWork({ endMonth: v })}
                  disabled={work.currentJob}
                >
                  <SelectTrigger
                    id="endMonth"
                    className="w-full"
                    aria-label="End date, month"
                  >
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
                <input
                  type="hidden"
                  name="endMonth"
                  value={work.endMonth}
                  disabled={work.currentJob}
                />
              </Field>
              <Field>
                <Select
                  value={work.endYear || undefined}
                  onValueChange={(v) => updateWork({ endYear: v })}
                  disabled={work.currentJob}
                >
                  <SelectTrigger
                    id="endYear"
                    className="w-full"
                    aria-label="End date, year"
                  >
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
                <input
                  type="hidden"
                  name="endYear"
                  value={work.endYear}
                  disabled={work.currentJob}
                />
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
                  updateWork({
                    currentJob: true,
                    endMonth: "",
                    endYear: "",
                  })
                } else {
                  updateWork({ currentJob: false })
                }
              }}
            />
            <FieldLabel htmlFor={currentJobId} className="font-normal">
              I currently work here
            </FieldLabel>
            <input
              type="hidden"
              name="currentJob"
              value={work.currentJob ? "on" : ""}
            />
          </Field>
        </form>

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
