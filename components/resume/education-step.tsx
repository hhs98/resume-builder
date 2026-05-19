"use client"

import Link from "next/link"
import { Lightbulb } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Field, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useResumeDraft } from "@/hooks/use-resume-draft"
import { cn } from "@/lib/utils"
import { MONTHS } from "@/lib/resume-form-constants"

const EDUCATION_LEVELS = [
  {
    id: "education-post-secondary",
    value: "post-secondary-or-high-school",
    label: "Post-Secondary Certificate or High School diploma",
  },
  {
    id: "education-technical",
    value: "technical-vocational",
    label: "Technical or Vocational",
  },
  {
    id: "education-related-courses",
    value: "related-courses",
    label: "Related Courses",
  },
  {
    id: "education-certificates",
    value: "certificates-or-diplomas",
    label: "Certificates or diplomas",
  },
  {
    id: "education-associates",
    value: "associates",
    label: "Associates",
  },
  {
    id: "education-bachelors",
    value: "bachelors",
    label: "Bachelors",
  },
  {
    id: "education-masters",
    value: "masters-or-specialized",
    label: "Masters or Specialized",
  },
  {
    id: "education-doctoral",
    value: "doctoral-or-jd",
    label: "Doctoral or J.D.",
  },
] as const

const DEGREE_OPTIONS = [
  { value: "high-school-diploma", label: "High school diploma" },
  { value: "certificate", label: "Certificate" },
  { value: "associate", label: "Associate's degree" },
  { value: "bachelor", label: "Bachelor's degree" },
  { value: "master", label: "Master's degree" },
  { value: "doctorate", label: "Doctorate" },
  { value: "professional", label: "Professional degree" },
  { value: "other", label: "Other" },
] as const

const GRADUATION_YEARS = (() => {
  const max = new Date().getFullYear() + 10
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

export function EducationStep() {
  const { draft, patchDraft } = useResumeDraft()
  const education = draft.education
  const educationLevel = education.educationLevel || undefined

  function updateEducation(patch: Partial<typeof education>) {
    patchDraft({ education: { ...education, ...patch } })
  }

  function handleEducationLevelChange(value: string) {
    if (education.educationLevel !== value) {
      updateEducation({
        educationLevel: value,
        degree: "",
        graduationMonth: "",
        graduationYear: "",
      })
    } else {
      updateEducation({ educationLevel: value })
    }
  }

  function handleResetEducationLevel() {
    updateEducation({
      educationLevel: "",
      degree: "",
      graduationMonth: "",
      graduationYear: "",
    })
  }

  const selectedLevelLabel = EDUCATION_LEVELS.find(
    (l) => l.value === educationLevel
  )?.label

  return (
    <div className="mx-auto max-w-4xl px-6 py-10 md:px-10 md:py-14">
      <header className="max-w-2xl space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight text-balance text-foreground md:text-3xl">
          What is your highest level of education?
        </h1>
        <p className="text-sm leading-relaxed text-pretty text-muted-foreground md:text-base">
          Choose the most recent or highest degree you have completed.
        </p>
      </header>

      <div className="mt-8 space-y-8">
        {!educationLevel ? (
          <div className="max-w-xl">
            <fieldset className="min-w-0 border-0 p-0">
              <legend className="sr-only">Highest level of education</legend>
              <RadioGroup
                value={educationLevel}
                onValueChange={handleEducationLevelChange}
                className="grid gap-2"
              >
                {EDUCATION_LEVELS.map((level) => (
                  <div
                    key={level.id}
                    className={cn(
                      "flex cursor-pointer items-center gap-3 rounded-lg border border-border bg-card px-4 py-3 transition-colors",
                      "hover:bg-muted/50"
                    )}
                    onClick={() => handleEducationLevelChange(level.value)}
                  >
                    <RadioGroupItem value={level.value} id={level.id} />
                    <span className="flex-1 text-sm leading-snug font-normal text-foreground">
                      {level.label}
                    </span>
                  </div>
                ))}
              </RadioGroup>
            </fieldset>
          </div>
        ) : (
          <div className="flex max-w-xl flex-col gap-3 rounded-lg border border-border bg-muted/30 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm leading-snug text-foreground">
              {selectedLevelLabel}
            </p>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-8 shrink-0 self-start text-muted-foreground hover:text-foreground sm:self-auto"
              onClick={handleResetEducationLevel}
            >
              Change level
            </Button>
          </div>
        )}

        {educationLevel ? (
          <div className="max-w-3xl space-y-6 border-t border-border pt-10">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div className="max-w-2xl space-y-2">
                <h2 className="text-xl font-semibold tracking-tight text-foreground md:text-2xl">
                  Tell us about your education
                </h2>
                <p className="text-sm leading-relaxed text-pretty text-muted-foreground md:text-base">
                  Enter your education experience so far, even if you are a
                  current student or did not graduate.
                </p>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="shrink-0 gap-1.5 text-muted-foreground hover:text-foreground"
              >
                <Lightbulb className="size-4" aria-hidden />
                Tips
              </Button>
            </div>

            <p className="text-xs text-muted-foreground">
              <span className="text-destructive">*</span> indicates a required
              field
            </p>

            <form className="flex flex-col gap-6" noValidate>
              <div className="grid gap-6 sm:grid-cols-2">
                <FormField
                  id="institution"
                  label="Institution"
                  required
                  placeholder="School Name"
                  autoComplete="organization"
                  value={education.institution}
                  onChange={(v) => updateEducation({ institution: v })}
                />

                <FormField
                  id="institutionLocation"
                  label="Institution Location"
                  placeholder="Chittagong"
                  autoComplete="address-level2"
                  value={education.institutionLocation}
                  onChange={(v) =>
                    updateEducation({ institutionLocation: v })
                  }
                />
              </div>

              <div className="grid gap-6 sm:grid-cols-2">
                <Field>
                  <FieldLabel htmlFor="degree">Degree</FieldLabel>
                  <Select
                    value={education.degree || undefined}
                    onValueChange={(v) => updateEducation({ degree: v })}
                  >
                    <SelectTrigger id="degree" className="w-full">
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      {DEGREE_OPTIONS.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <input
                    type="hidden"
                    name="degree"
                    value={education.degree}
                  />
                </Field>
                <div className="hidden sm:block" aria-hidden />
              </div>

              <div className="grid gap-6 sm:grid-cols-2">
                <FormField
                  id="fieldOfStudy"
                  label="Field of Study"
                  placeholder="Accountant"
                  autoComplete="off"
                  value={education.fieldOfStudy}
                  onChange={(v) => updateEducation({ fieldOfStudy: v })}
                />

                <div>
                  <fieldset className="min-w-0 space-y-2 border-0 p-0">
                    <legend className="text-sm font-medium text-foreground">
                      Graduation Date (or expected Graduation Date)
                    </legend>
                    <div className="grid grid-cols-2 gap-3">
                      <Field>
                        <Select
                          value={education.graduationMonth || undefined}
                          onValueChange={(v) =>
                            updateEducation({ graduationMonth: v })
                          }
                        >
                          <SelectTrigger
                            id="graduationMonth"
                            className="w-full"
                            aria-label="Graduation month"
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
                          name="graduationMonth"
                          value={education.graduationMonth}
                        />
                      </Field>
                      <Field>
                        <Select
                          value={education.graduationYear || undefined}
                          onValueChange={(v) =>
                            updateEducation({ graduationYear: v })
                          }
                        >
                          <SelectTrigger
                            id="graduationYear"
                            className="w-full"
                            aria-label="Graduation year"
                          >
                            <SelectValue placeholder="Year" />
                          </SelectTrigger>
                          <SelectContent>
                            {GRADUATION_YEARS.map((y) => (
                              <SelectItem key={y} value={String(y)}>
                                {y}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <input
                          type="hidden"
                          name="graduationYear"
                          value={education.graduationYear}
                        />
                      </Field>
                    </div>
                  </fieldset>
                </div>
              </div>
            </form>
          </div>
        ) : null}

        <div
          className={cn(
            "flex flex-col-reverse justify-between gap-3 border-t border-border pt-6 sm:flex-row sm:items-center",
            educationLevel ? "max-w-3xl" : "max-w-xl"
          )}
        >
          <Button variant="outline" asChild>
            <Link href="/new/work-history">Back</Link>
          </Button>
          <Button asChild>
            <Link href="/new/skills">Next: Skills</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
