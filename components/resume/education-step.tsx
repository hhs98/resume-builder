"use client"

import { useState } from "react"
import {
  Building2,
  FileText,
  GraduationCap,
  Link2,
  MapPin,
  Plus,
  Trash2,
  Trophy,
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
  createEmptyEducationItem,
  hasEducationAwardContent,
  MAX_EDUCATION_ENTRIES,
  normalizeEducationList,
  type EducationAward,
  type EducationItem,
} from "@/lib/resume-draft"
import {
  builderAddButtonClassName,
  builderFieldClassName,
  builderSelectClassName,
} from "@/lib/builder-styles"
import { MONTHS } from "@/lib/resume-form-constants"
import { cn, generateId } from "@/lib/utils"

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

const fieldClassName = builderFieldClassName
const selectClassName = builderSelectClassName

const ADDITIONAL_DETAIL_TILES = [
  { key: "description" as const, label: "Description", icon: FileText },
  { key: "awards" as const, label: "Awards", icon: Trophy },
  { key: "projects" as const, label: "Projects", icon: Link2 },
] as const

type DetailSection =
  | (typeof ADDITIONAL_DETAIL_TILES)[number]["key"]
  | "gpa"

function newAward(): EducationAward {
  return {
    id: generateId(),
    title: "",
    issuer: "",
    year: "",
  }
}

function getInitialOpenSections(education: EducationItem): DetailSection[] {
  const open: DetailSection[] = []
  if (education.description?.trim()) open.push("description")
  if (education.awards?.some(hasEducationAwardContent)) open.push("awards")
  if (education.projectUrl?.trim()) open.push("projects")
  if (education.gpa?.trim()) open.push("gpa")
  return open
}

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
  const educationList = normalizeEducationList(draft.education)

  const [openSectionsById, setOpenSectionsById] = useState<
    Record<string, DetailSection[]>
  >(() =>
    Object.fromEntries(
      educationList.map((item) => [item.id, getInitialOpenSections(item)])
    )
  )

  function updateEducation(index: number, patch: Partial<EducationItem>) {
    const updated = [...educationList]
    updated[index] = { ...updated[index], ...patch }
    patchDraft({ education: updated })
  }

  function addEducation() {
    if (educationList.length >= MAX_EDUCATION_ENTRIES) return
    const next = createEmptyEducationItem()
    setOpenSectionsById((current) => ({ ...current, [next.id]: [] }))
    patchDraft({ education: [...educationList, next] })
  }

  function removeEducation(index: number) {
    const removed = educationList[index]
    const updated = educationList.filter((_, i) => i !== index)
    if (removed) {
      setOpenSectionsById((current) => {
        const next = { ...current }
        delete next[removed.id]
        return next
      })
    }
    patchDraft({
      education:
        updated.length > 0 ? updated : [createEmptyEducationItem()],
    })
  }

  function getOpenSections(educationId: string): DetailSection[] {
    return openSectionsById[educationId] ?? []
  }

  function isSectionOpen(educationId: string, section: DetailSection) {
    return getOpenSections(educationId).includes(section)
  }

  function toggleSection(
    index: number,
    education: EducationItem,
    section: DetailSection
  ) {
    setOpenSectionsById((current) => {
      const open = current[education.id] ?? []
      const isOpen = open.includes(section)

      if (isOpen) {
        return {
          ...current,
          [education.id]: open.filter((item) => item !== section),
        }
      }

      if (section === "awards" && education.awards.length === 0) {
        updateEducation(index, { awards: [newAward()] })
      }

      return {
        ...current,
        [education.id]: [...open, section],
      }
    })
  }

  function updateAward(
    index: number,
    education: EducationItem,
    awardId: string,
    patch: Partial<EducationAward>
  ) {
    updateEducation(index, {
      awards: education.awards.map((award) =>
        award.id === awardId ? { ...award, ...patch } : award
      ),
    })
  }

  function addAward(index: number, education: EducationItem) {
    updateEducation(index, { awards: [...education.awards, newAward()] })
  }

  function removeAward(
    index: number,
    education: EducationItem,
    awardId: string
  ) {
    const nextAwards = education.awards.filter((award) => award.id !== awardId)
    updateEducation(index, {
      awards: nextAwards.length > 0 ? nextAwards : [newAward()],
    })
  }

  function sectionHasContent(
    education: EducationItem,
    section: DetailSection
  ) {
    switch (section) {
      case "description":
        return education.description.trim().length > 0
      case "awards":
        return education.awards.some(hasEducationAwardContent)
      case "projects":
        return education.projectUrl.trim().length > 0
      case "gpa":
        return education.gpa.trim().length > 0
    }
  }

  function handleEducationLevelChange(index: number, value: string) {
    const education = educationList[index]
    if (!education) return

    if (education.educationLevel !== value) {
      updateEducation(index, {
        educationLevel: value,
        degree: "",
        graduationMonth: "",
        graduationYear: "",
      })
    } else {
      updateEducation(index, { educationLevel: value })
    }
  }

  function handleResetEducationLevel(index: number) {
    updateEducation(index, {
      educationLevel: "",
      degree: "",
      graduationMonth: "",
      graduationYear: "",
    })
  }

  const canAddMore = educationList.length < MAX_EDUCATION_ENTRIES
  const showEntryForms = educationList.some((item) => item.educationLevel)
  const onlyEmptyFirst =
    educationList.length === 1 && !educationList[0]?.educationLevel

  return (
    <BuilderStepPage>
      {onlyEmptyFirst ? (
        <>
          <BuilderStepHeader
            title="What is your highest level of education?"
            description="Choose the most recent or highest degree you have completed. You can add up to 3 education entries."
            centered
          />

          <fieldset className="mx-auto mt-8 max-w-2xl min-w-0 border-0 p-0">
            <legend className="sr-only">Highest level of education</legend>
            <ul className="space-y-3">
              {EDUCATION_LEVELS.map((level) => (
                <li key={level.value}>
                  <button
                    type="button"
                    onClick={() =>
                      handleEducationLevelChange(0, level.value)
                    }
                    className={cn(
                      "flex w-full items-center justify-between gap-4 rounded-xl border px-5 py-4 text-left transition-all",
                      "border-border/70 bg-white text-foreground hover:border-blue-200 hover:bg-white"
                    )}
                    aria-pressed={false}
                  >
                    <span className="text-sm leading-snug sm:text-base">
                      {level.label}
                    </span>
                    <span
                      className="flex size-5 shrink-0 items-center justify-center rounded-full border-2 border-muted-foreground/35"
                      aria-hidden
                    />
                  </button>
                </li>
              ))}
            </ul>
          </fieldset>
        </>
      ) : (
        <>
          <div className="flex items-start justify-end">
            <BuilderTipsButton />
          </div>

          <BuilderStepHeader
            title="Tell us about your education"
            description="Enter your education experience so far, even if you are currently a student or didn&apos;t graduate. You can add up to 3 entries."
          />

          <div className="mt-8 space-y-6">
            {educationList.map((education, index) => {
              const educationLevel = education.educationLevel || undefined
              const selectedLevelLabel = EDUCATION_LEVELS.find(
                (level) => level.value === educationLevel
              )?.label

              return (
                <BuilderFormCard key={education.id}>
                  <div className="mb-4 flex items-center justify-between gap-3 pl-2">
                    <span className="rounded-full bg-violet-100 px-3 py-1 text-[0.65rem] font-semibold tracking-[0.12em] text-violet-700 uppercase">
                      Education {index + 1}
                    </span>
                    {educationList.length > 1 ? (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-8 gap-1.5 px-2.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                        onClick={() => removeEducation(index)}
                        aria-label={`Remove education ${index + 1}`}
                      >
                        <Trash2 className="size-3.5" aria-hidden />
                        <span className="text-xs font-medium">Remove</span>
                      </Button>
                    ) : null}
                  </div>

                  {!educationLevel ? (
                    <div className="space-y-3 pl-2">
                      <p className="text-sm font-medium text-foreground">
                        Select education level
                      </p>
                      <ul className="space-y-2">
                        {EDUCATION_LEVELS.map((level) => (
                          <li key={level.value}>
                            <button
                              type="button"
                              onClick={() =>
                                handleEducationLevelChange(index, level.value)
                              }
                              className="flex w-full items-center justify-between gap-4 rounded-xl border border-border/70 bg-white px-4 py-3 text-left text-sm transition-all hover:border-blue-200 hover:bg-blue-50/40"
                            >
                              {level.label}
                            </button>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ) : (
                    <div className="space-y-5 pl-2">
                      <div className="flex items-center justify-between gap-4 rounded-xl border border-border/60 bg-[#f3f4f6] px-4 py-3">
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
                          onClick={() => handleResetEducationLevel(index)}
                          className="shrink-0 text-sm font-medium text-blue-600 transition-colors hover:text-blue-700"
                        >
                          Change level
                        </button>
                      </div>

                      <form className="space-y-5" noValidate>
                        <div className="grid gap-5 sm:grid-cols-2">
                          <div>
                            <FieldLabel required>Institution</FieldLabel>
                            <div className="relative">
                              <Building2
                                className="pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2 text-muted-foreground"
                                aria-hidden
                              />
                              <Input
                                id={`institution-${education.id}`}
                                placeholder="e.g. Stanford University"
                                autoComplete="organization"
                                value={education.institution}
                                onChange={(e) =>
                                  updateEducation(index, {
                                    institution: e.target.value,
                                  })
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
                                id={`institutionLocation-${education.id}`}
                                placeholder="e.g. California, USA"
                                autoComplete="address-level2"
                                value={education.institutionLocation}
                                onChange={(e) =>
                                  updateEducation(index, {
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
                            onValueChange={(v) =>
                              updateEducation(index, { degree: v })
                            }
                          >
                            <SelectTrigger
                              id={`degree-${education.id}`}
                              className={selectClassName}
                            >
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
                        </div>

                        <div className="grid gap-5 sm:grid-cols-2">
                          <div>
                            <FieldLabel>Field of Study</FieldLabel>
                            <Input
                              id={`fieldOfStudy-${education.id}`}
                              placeholder="e.g. Computer Science"
                              autoComplete="off"
                              value={education.fieldOfStudy}
                              onChange={(e) =>
                                updateEducation(index, {
                                  fieldOfStudy: e.target.value,
                                })
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
                                  updateEducation(index, {
                                    graduationMonth: v,
                                  })
                                }
                              >
                                <SelectTrigger
                                  id={`graduationMonth-${education.id}`}
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
                                  updateEducation(index, {
                                    graduationYear: v,
                                  })
                                }
                              >
                                <SelectTrigger
                                  id={`graduationYear-${education.id}`}
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
                          </div>
                        </div>

                        <div className="rounded-2xl border border-border/60 bg-white p-5 sm:p-6">
                          <div className="flex flex-wrap items-center justify-between gap-3">
                            <h2 className="text-base font-semibold text-foreground">
                              Additional Details
                            </h2>
                            <button
                              type="button"
                              onClick={() =>
                                toggleSection(index, education, "gpa")
                              }
                              aria-expanded={isSectionOpen(
                                education.id,
                                "gpa"
                              )}
                              className={cn(
                                "inline-flex items-center gap-1.5 text-sm font-medium transition-colors",
                                isSectionOpen(education.id, "gpa") ||
                                  sectionHasContent(education, "gpa")
                                  ? "text-blue-700"
                                  : "text-blue-600 hover:text-blue-700"
                              )}
                            >
                              <Plus className="size-4" aria-hidden />
                              {isSectionOpen(education.id, "gpa")
                                ? "Hide GPA or Honours"
                                : "Add GPA or Honours"}
                            </button>
                          </div>

                          <div className="mt-4 grid gap-3 sm:grid-cols-3">
                            {ADDITIONAL_DETAIL_TILES.map(
                              ({ key, label, icon: Icon }) => {
                                const open = isSectionOpen(education.id, key)
                                const hasContent = sectionHasContent(
                                  education,
                                  key
                                )

                                return (
                                  <button
                                    key={key}
                                    type="button"
                                    onClick={() =>
                                      toggleSection(index, education, key)
                                    }
                                    aria-expanded={open}
                                    className={cn(
                                      "flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed px-4 py-8 text-sm font-medium transition-colors",
                                      open || hasContent
                                        ? "border-blue-400 bg-blue-50/60 text-blue-700"
                                        : "border-border/80 bg-[#f8f9fb]/60 text-muted-foreground hover:border-blue-300 hover:bg-blue-50/40 hover:text-blue-700"
                                    )}
                                  >
                                    <Icon
                                      className="size-5"
                                      strokeWidth={1.75}
                                      aria-hidden
                                    />
                                    {label}
                                  </button>
                                )
                              }
                            )}
                          </div>

                          {isSectionOpen(education.id, "gpa") ? (
                            <div className="mt-4 space-y-2 rounded-xl border border-border/60 bg-[#f8f9fb]/80 p-4">
                              <FieldLabel>GPA or Honours</FieldLabel>
                              <Input
                                id={`educationGpa-${education.id}`}
                                placeholder="e.g. 3.8/4.0 or First Class Honours"
                                value={education.gpa}
                                onChange={(e) =>
                                  updateEducation(index, {
                                    gpa: e.target.value,
                                  })
                                }
                                className={fieldClassName}
                              />
                              <p className="text-xs text-muted-foreground">
                                Include your GPA, class rank, or honours if they
                                strengthen your application.
                              </p>
                            </div>
                          ) : null}

                          {isSectionOpen(education.id, "description") ? (
                            <div className="mt-4 space-y-2 rounded-xl border border-border/60 bg-[#f8f9fb]/80 p-4">
                              <FieldLabel>Description</FieldLabel>
                              <Textarea
                                id={`educationDescription-${education.id}`}
                                placeholder="Describe coursework, achievements, or activities relevant to your education..."
                                className="min-h-32 resize-y rounded-xl border border-border/70 bg-white px-4 py-3 text-sm shadow-none focus-visible:border-blue-500 focus-visible:ring-2 focus-visible:ring-blue-500/20"
                                value={education.description}
                                onChange={(e) =>
                                  updateEducation(index, {
                                    description: e.target.value,
                                  })
                                }
                              />
                            </div>
                          ) : null}

                          {isSectionOpen(education.id, "awards") ? (
                            <div className="mt-4 space-y-4 rounded-xl border border-border/60 bg-[#f8f9fb]/80 p-4">
                              <div className="flex items-center justify-between gap-3">
                                <FieldLabel>Awards &amp; Honors</FieldLabel>
                                <button
                                  type="button"
                                  onClick={() => addAward(index, education)}
                                  className="inline-flex items-center gap-1 text-sm font-medium text-blue-600 transition-colors hover:text-blue-700"
                                >
                                  <Plus className="size-4" aria-hidden />
                                  Add award
                                </button>
                              </div>

                              <div className="space-y-4">
                                {education.awards.map((award, awardIndex) => (
                                  <div
                                    key={award.id}
                                    className="space-y-3 rounded-xl border border-border/60 bg-white p-4"
                                  >
                                    <div className="flex items-center justify-between gap-3">
                                      <p className="text-sm font-medium text-foreground">
                                        Award {awardIndex + 1}
                                      </p>
                                      {education.awards.length > 1 ? (
                                        <button
                                          type="button"
                                          onClick={() =>
                                            removeAward(
                                              index,
                                              education,
                                              award.id
                                            )
                                          }
                                          className="rounded-md p-1 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                                          aria-label={`Remove award ${awardIndex + 1}`}
                                        >
                                          <X className="size-4" aria-hidden />
                                        </button>
                                      ) : null}
                                    </div>

                                    <div>
                                      <FieldLabel required>Award title</FieldLabel>
                                      <Input
                                        id={`award-title-${award.id}`}
                                        placeholder="e.g. Dean's List"
                                        value={award.title}
                                        onChange={(e) =>
                                          updateAward(
                                            index,
                                            education,
                                            award.id,
                                            { title: e.target.value }
                                          )
                                        }
                                        className={fieldClassName}
                                      />
                                    </div>

                                    <div className="grid gap-3 sm:grid-cols-2">
                                      <div>
                                        <FieldLabel>Issuer</FieldLabel>
                                        <Input
                                          id={`award-issuer-${award.id}`}
                                          placeholder="e.g. Stanford University"
                                          value={award.issuer}
                                          onChange={(e) =>
                                            updateAward(
                                              index,
                                              education,
                                              award.id,
                                              { issuer: e.target.value }
                                            )
                                          }
                                          className={fieldClassName}
                                        />
                                      </div>
                                      <div>
                                        <FieldLabel>Year</FieldLabel>
                                        <Input
                                          id={`award-year-${award.id}`}
                                          placeholder="e.g. 2024"
                                          inputMode="numeric"
                                          value={award.year}
                                          onChange={(e) =>
                                            updateAward(
                                              index,
                                              education,
                                              award.id,
                                              { year: e.target.value }
                                            )
                                          }
                                          className={fieldClassName}
                                        />
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          ) : null}

                          {isSectionOpen(education.id, "projects") ? (
                            <div className="mt-4 space-y-2 rounded-xl border border-border/60 bg-[#f8f9fb]/80 p-4">
                              <FieldLabel>Project URL</FieldLabel>
                              <div className="relative">
                                <Link2
                                  className="pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2 text-muted-foreground"
                                  aria-hidden
                                />
                                <Input
                                  id={`educationProjectUrl-${education.id}`}
                                  type="url"
                                  placeholder="https://github.com/you/project"
                                  value={education.projectUrl}
                                  onChange={(e) =>
                                    updateEducation(index, {
                                      projectUrl: e.target.value,
                                    })
                                  }
                                  className={cn(fieldClassName, "pl-10")}
                                />
                              </div>
                              <p className="text-xs text-muted-foreground">
                                Share a link to a portfolio project, thesis, or
                                capstone related to your education.
                              </p>
                            </div>
                          ) : null}
                        </div>
                      </form>
                    </div>
                  )}
                </BuilderFormCard>
              )
            })}

            {showEntryForms && canAddMore ? (
              <button
                type="button"
                onClick={addEducation}
                className={builderAddButtonClassName}
              >
                <Plus className="size-4" aria-hidden />
                Add Another Education ({educationList.length}/
                {MAX_EDUCATION_ENTRIES})
              </button>
            ) : null}

            {showEntryForms && !canAddMore ? (
              <p className="text-center text-sm text-muted-foreground">
                Maximum of {MAX_EDUCATION_ENTRIES} education entries reached.
              </p>
            ) : null}
          </div>
        </>
      )}

      <BuilderStepFooter
        backHref="/new/work-history"
        nextHref="/new/training"
        nextLabel="Next: Training"
        nextDisabled={!educationList.some((item) => item.educationLevel.trim())}
      />
    </BuilderStepPage>
  )
}
