"use client"

import {
  Building2,
  FileText,
  GraduationCap,
  Lightbulb,
  Link2,
  MapPin,
  Plus,
  Trophy,
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
import { useResumeDraft } from "@/hooks/use-resume-draft"
import { MONTHS } from "@/lib/resume-form-constants"
import { cn } from "@/lib/utils"

const EDUCATION_LEVELS = [
  {
    value: "post-secondary-or-high-school",
    label: "Post-Secondary Certificate or High School Diploma",
  },
  {
    value: "technical-vocational",
    label: "Technical or Vocational",
  },
  {
    value: "related-courses",
    label: "Related Courses",
  },
  {
    value: "certificates-or-diplomas",
    label: "Certificates or Diplomas",
  },
  {
    value: "associates",
    label: "Associates",
  },
  {
    value: "bachelors",
    label: "Bachelors",
  },
  {
    value: "masters-or-specialized",
    label: "Masters or Specialized",
  },
  {
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

const fieldClassName =
  "h-12 rounded-xl border border-border/70 bg-white px-4 text-sm shadow-none placeholder:text-muted-foreground focus-visible:border-blue-500 focus-visible:ring-2 focus-visible:ring-blue-500/20"

const selectClassName =
  "h-12 w-full rounded-xl border border-border/70 bg-white px-4 text-sm shadow-none focus-visible:border-blue-500 focus-visible:ring-2 focus-visible:ring-blue-500/20"

const ADDITIONAL_DETAIL_TILES = [
  { label: "Description", icon: FileText },
  { label: "Awards", icon: Trophy },
  { label: "Projects", icon: Link2 },
] as const

function FieldLabel({
  children,
  required,
}: {
  children: React.ReactNode
  required?: boolean
}) {
  return (
    <label className="mb-2 block text-sm font-medium text-foreground">
      {children}
      {required ? (
        <span className="text-destructive" aria-hidden>
          {" "}
          *
        </span>
      ) : null}
    </label>
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
    (level) => level.value === educationLevel
  )?.label

  return (
    <div className="min-h-full bg-[#f8f9fb]">
      <div className="mx-auto max-w-3xl px-6 py-8 sm:px-8 sm:py-10">
        {!educationLevel ? (
          <>
            <header className="mx-auto max-w-2xl space-y-2 text-center">
              <h1 className="text-2xl font-bold tracking-tight text-balance text-[#1f2937] md:text-3xl">
                What is your highest level of education?
              </h1>
              <p className="text-sm leading-relaxed text-pretty text-muted-foreground md:text-base">
                Choose the most recent or highest degree you have completed.
              </p>
            </header>

            <fieldset className="mx-auto mt-8 max-w-2xl min-w-0 border-0 p-0">
              <legend className="sr-only">Highest level of education</legend>
              <ul className="space-y-3">
                {EDUCATION_LEVELS.map((level) => {
                  const selected = educationLevel === level.value

                  return (
                    <li key={level.value}>
                      <button
                        type="button"
                        onClick={() => handleEducationLevelChange(level.value)}
                        className={cn(
                          "flex w-full items-center justify-between gap-4 rounded-xl border px-5 py-4 text-left transition-all",
                          selected
                            ? "border-blue-500 bg-blue-50 font-semibold text-[#1f2937] shadow-sm ring-1 ring-blue-500/20"
                            : "border-border/70 bg-white text-foreground hover:border-blue-200 hover:bg-white"
                        )}
                        aria-pressed={selected}
                      >
                        <span className="text-sm leading-snug sm:text-base">
                          {level.label}
                        </span>
                        <span
                          className={cn(
                            "flex size-5 shrink-0 items-center justify-center rounded-full border-2",
                            selected
                              ? "border-blue-600"
                              : "border-muted-foreground/35"
                          )}
                          aria-hidden
                        >
                          {selected ? (
                            <span className="size-2.5 rounded-full bg-blue-600" />
                          ) : null}
                        </span>
                      </button>
                    </li>
                  )
                })}
              </ul>
            </fieldset>
          </>
        ) : (
          <>
            <div className="flex items-start justify-end">
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

            <div className="mt-4 flex items-center justify-between gap-4 rounded-xl border border-border/60 bg-[#f3f4f6] px-4 py-3 sm:px-5">
              <div className="flex min-w-0 items-center gap-3">
                <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-blue-600 text-white">
                  <GraduationCap className="size-4" aria-hidden />
                </span>
                <p className="truncate text-sm font-medium text-foreground sm:text-base">
                  {selectedLevelLabel}
                </p>
              </div>
              <button
                type="button"
                onClick={handleResetEducationLevel}
                className="shrink-0 text-sm font-medium text-blue-600 transition-colors hover:text-blue-700"
              >
                Change level
              </button>
            </div>

            <header className="mt-8 space-y-2">
              <h1 className="text-2xl font-bold tracking-tight text-balance text-[#1f2937] md:text-3xl">
                Tell us about your education
              </h1>
              <p className="text-sm leading-relaxed text-pretty text-muted-foreground md:text-base">
                Enter your education experience so far, even if you are
                currently a student or didn&apos;t graduate.
              </p>
            </header>

            <form className="mt-8 space-y-5" noValidate>
              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <FieldLabel required>Institution</FieldLabel>
                  <div className="relative">
                    <Building2
                      className="pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2 text-muted-foreground"
                      aria-hidden
                    />
                    <Input
                      id="institution"
                      placeholder="e.g. Stanford University"
                      autoComplete="organization"
                      value={education.institution}
                      onChange={(e) =>
                        updateEducation({ institution: e.target.value })
                      }
                      className={cn(fieldClassName, "pl-10")}
                    />
                  </div>
                </div>

                <div>
                  <FieldLabel>Institution Location</FieldLabel>
                  <div className="relative">
                    <MapPin
                      className="pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2 text-muted-foreground"
                      aria-hidden
                    />
                    <Input
                      id="institutionLocation"
                      placeholder="e.g. California, USA"
                      autoComplete="address-level2"
                      value={education.institutionLocation}
                      onChange={(e) =>
                        updateEducation({
                          institutionLocation: e.target.value,
                        })
                      }
                      className={cn(fieldClassName, "pl-10")}
                    />
                  </div>
                </div>
              </div>

              <div>
                <FieldLabel>Degree</FieldLabel>
                <Select
                  value={education.degree || undefined}
                  onValueChange={(v) => updateEducation({ degree: v })}
                >
                  <SelectTrigger id="degree" className={selectClassName}>
                    <SelectValue placeholder="Select your degree" />
                  </SelectTrigger>
                  <SelectContent>
                    {DEGREE_OPTIONS.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <input type="hidden" name="degree" value={education.degree} />
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <FieldLabel>Field of Study</FieldLabel>
                  <Input
                    id="fieldOfStudy"
                    placeholder="e.g. Computer Science"
                    autoComplete="off"
                    value={education.fieldOfStudy}
                    onChange={(e) =>
                      updateEducation({ fieldOfStudy: e.target.value })
                    }
                    className={fieldClassName}
                  />
                </div>

                <div>
                  <FieldLabel>Graduation Date</FieldLabel>
                  <div className="grid grid-cols-2 gap-3">
                    <Select
                      value={education.graduationMonth || undefined}
                      onValueChange={(v) =>
                        updateEducation({ graduationMonth: v })
                      }
                    >
                      <SelectTrigger
                        id="graduationMonth"
                        className={selectClassName}
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
                    <Select
                      value={education.graduationYear || undefined}
                      onValueChange={(v) =>
                        updateEducation({ graduationYear: v })
                      }
                    >
                      <SelectTrigger
                        id="graduationYear"
                        className={selectClassName}
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
                  </div>
                  <input
                    type="hidden"
                    name="graduationMonth"
                    value={education.graduationMonth}
                  />
                  <input
                    type="hidden"
                    name="graduationYear"
                    value={education.graduationYear}
                  />
                </div>
              </div>

              <div className="rounded-2xl border border-border/60 bg-white p-5 sm:p-6">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <h2 className="text-base font-semibold text-foreground">
                    Additional Details
                  </h2>
                  <button
                    type="button"
                    className="inline-flex items-center gap-1.5 text-sm font-medium text-blue-600 transition-colors hover:text-blue-700"
                  >
                    <Plus className="size-4" aria-hidden />
                    Add GPA or Honours
                  </button>
                </div>

                <div className="mt-4 grid gap-3 sm:grid-cols-3">
                  {ADDITIONAL_DETAIL_TILES.map(({ label, icon: Icon }) => (
                    <button
                      key={label}
                      type="button"
                      className="flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border/80 bg-[#f8f9fb]/60 px-4 py-8 text-sm font-medium text-muted-foreground transition-colors hover:border-blue-300 hover:bg-blue-50/40 hover:text-blue-700"
                    >
                      <Icon className="size-5" strokeWidth={1.75} aria-hidden />
                      {label}
                    </button>
                  ))}
                </div>
              </div>
            </form>
          </>
        )}

        <BuilderStepFooter
          backHref="/new/work-history"
          nextHref="/new/skills"
          nextLabel="Next: Skills"
          nextDisabled={!educationLevel}
        />
      </div>
    </div>
  )
}
