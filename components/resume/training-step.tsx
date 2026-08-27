"use client"

import { useRef, useState } from "react"
import {
  FileUp,
  GraduationCap,
  Plus,
  Trash2,
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
import { useResumeDraft } from "@/hooks/use-resume-draft"
import {
  builderAddButtonClassName,
  builderFieldClassName,
  builderSelectClassName,
} from "@/lib/builder-styles"
import { MONTHS } from "@/lib/resume-form-constants"
import {
  createEmptyTrainingItem,
  MAX_TRAINING_ENTRIES,
  MAX_TRAINING_PDF_BYTES,
  MAX_TRAINING_PDF_SIZE_MB,
  normalizeTrainingList,
  TRAINING_COURSE_TYPE_OPTIONS,
  type TrainingItem,
} from "@/lib/resume-draft"
import { isPdfBuffer } from "@/lib/security/pdf-validation"
import { cn, generateId } from "@/lib/utils"

const fieldClassName = builderFieldClassName
const selectClassName = builderSelectClassName

const ACHIEVEMENT_YEARS = (() => {
  const max = new Date().getFullYear() + 2
  const min = 1970
  const list: number[] = []
  for (let y = max; y >= min; y--) list.push(y)
  return list
})()

function FieldLabel({
  children,
  required,
  htmlFor,
}: {
  children: React.ReactNode
  required?: boolean
  htmlFor?: string
}) {
  return (
    <label
      htmlFor={htmlFor}
      className="mb-2 block text-sm font-medium text-foreground"
    >
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

function formatFileSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export function TrainingStep() {
  const { draft, patchDraft } = useResumeDraft()
  const trainings = normalizeTrainingList(draft.trainings)
  const [uploadErrorById, setUploadErrorById] = useState<
    Record<string, string>
  >({})
  const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({})

  function updateTraining(index: number, patch: Partial<TrainingItem>) {
    const updated = [...trainings]
    updated[index] = { ...updated[index], ...patch }
    patchDraft({ trainings: updated })
  }

  function addTraining() {
    if (trainings.length >= MAX_TRAINING_ENTRIES) return
    patchDraft({
      trainings: [...trainings, { ...createEmptyTrainingItem(), id: generateId() }],
    })
  }

  function removeTraining(index: number) {
    const removed = trainings[index]
    const updated = trainings.filter((_, i) => i !== index)
    if (removed) {
      setUploadErrorById((current) => {
        const next = { ...current }
        delete next[removed.id]
        return next
      })
    }
    patchDraft({
      trainings:
        updated.length > 0
          ? updated
          : [createEmptyTrainingItem()],
    })
  }

  async function handlePdfUpload(index: number, file: File | undefined) {
    const training = trainings[index]
    if (!training || !file) return

    setUploadErrorById((current) => {
      const next = { ...current }
      delete next[training.id]
      return next
    })

    if (
      file.type !== "application/pdf" &&
      !file.name.toLowerCase().endsWith(".pdf")
    ) {
      setUploadErrorById((current) => ({
        ...current,
        [training.id]: "Only PDF files are allowed.",
      }))
      return
    }

    if (file.size > MAX_TRAINING_PDF_BYTES) {
      setUploadErrorById((current) => ({
        ...current,
        [training.id]: `File is too large. Maximum size is ${MAX_TRAINING_PDF_SIZE_MB} MB.`,
      }))
      return
    }

    const buffer = await file.arrayBuffer()
    if (!isPdfBuffer(buffer)) {
      setUploadErrorById((current) => ({
        ...current,
        [training.id]: "Invalid PDF file. Please upload a valid PDF document.",
      }))
      return
    }

    const reader = new FileReader()
    reader.onload = () => {
      if (typeof reader.result !== "string") {
        setUploadErrorById((current) => ({
          ...current,
          [training.id]: "Could not read the PDF. Please try again.",
        }))
        return
      }

      updateTraining(index, {
        certificateFileName: file.name,
        certificatePdfDataUrl: reader.result,
      })
    }
    reader.onerror = () => {
      setUploadErrorById((current) => ({
        ...current,
        [training.id]: "Could not read the PDF. Please try again.",
      }))
    }
    reader.readAsDataURL(file)
  }

  function removePdf(index: number) {
    const training = trainings[index]
    if (!training) return
    updateTraining(index, {
      certificateFileName: "",
      certificatePdfDataUrl: null,
    })
    const input = fileInputRefs.current[training.id]
    if (input) input.value = ""
  }

  const canAddMore = trainings.length < MAX_TRAINING_ENTRIES

  return (
    <BuilderStepPage>
      <div className="mb-6 flex items-center justify-end">
        <BuilderTipsButton />
      </div>

      <BuilderStepHeader
        title="Add your training or courses"
        description="Include certificates, workshops, and professional courses. Uploaded PDFs are saved with your resume but are not shown on the resume layout."
      />

      <div className="mt-8 space-y-6">
        {trainings.map((training, index) => {
          const uploadError = uploadErrorById[training.id]

          return (
            <BuilderFormCard key={training.id}>
              <div className="mb-4 flex items-center justify-between gap-3 pl-2">
                <span className="rounded-full bg-violet-100 px-3 py-1 text-[0.65rem] font-semibold tracking-[0.12em] text-violet-700 uppercase">
                  Training {index + 1}
                </span>
                {trainings.length > 1 ? (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-8 gap-1.5 px-2.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                    onClick={() => removeTraining(index)}
                    aria-label={`Remove training ${index + 1}`}
                  >
                    <Trash2 className="size-3.5" aria-hidden />
                    <span className="text-xs font-medium">Remove</span>
                  </Button>
                ) : null}
              </div>

              <div className="space-y-5 pl-2">
                <div>
                  <FieldLabel htmlFor={`courseType-${training.id}`} required>
                    Training / Course Type
                  </FieldLabel>
                  <Select
                    value={training.courseType || undefined}
                    onValueChange={(v) =>
                      updateTraining(index, { courseType: v })
                    }
                  >
                    <SelectTrigger
                      id={`courseType-${training.id}`}
                      className={selectClassName}
                    >
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      {TRAINING_COURSE_TYPE_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <FieldLabel htmlFor={`instituteName-${training.id}`} required>
                    Institute Name
                  </FieldLabel>
                  <div className="relative">
                    <GraduationCap
                      className="pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2 text-muted-foreground"
                      aria-hidden
                    />
                    <Input
                      id={`instituteName-${training.id}`}
                      placeholder="e.g. Coursera, BDJobs Training"
                      value={training.instituteName}
                      onChange={(e) =>
                        updateTraining(index, {
                          instituteName: e.target.value,
                        })
                      }
                      className={cn(fieldClassName, "pl-10")}
                    />
                  </div>
                </div>

                <div>
                  <FieldLabel>Achievement Date</FieldLabel>
                  <div className="grid grid-cols-2 gap-3">
                    <Select
                      value={training.achievementMonth || undefined}
                      onValueChange={(v) =>
                        updateTraining(index, { achievementMonth: v })
                      }
                    >
                      <SelectTrigger
                        className={selectClassName}
                        aria-label="Achievement month"
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
                      value={training.achievementYear || undefined}
                      onValueChange={(v) =>
                        updateTraining(index, { achievementYear: v })
                      }
                    >
                      <SelectTrigger
                        className={selectClassName}
                        aria-label="Achievement year"
                      >
                        <SelectValue placeholder="Year" />
                      </SelectTrigger>
                      <SelectContent>
                        {ACHIEVEMENT_YEARS.map((y) => (
                          <SelectItem key={y} value={String(y)}>
                            {y}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="rounded-xl border border-dashed border-border/80 bg-[#f8f9fb]/80 p-4">
                  <FieldLabel>Certificate PDF</FieldLabel>
                  <p className="mb-3 text-xs text-muted-foreground">
                    Optional. Max {MAX_TRAINING_PDF_SIZE_MB} MB. Saved with your
                    resume record, but not printed on the resume.
                  </p>

                  {training.certificateFileName ? (
                    <div className="flex items-center justify-between gap-3 rounded-lg border border-border/60 bg-white px-3 py-2.5">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-foreground">
                          {training.certificateFileName}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {training.certificatePdfDataUrl
                            ? "PDF attached"
                            : "Filename saved"}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => removePdf(index)}
                        className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                        aria-label="Remove certificate PDF"
                      >
                        <X className="size-4" aria-hidden />
                      </button>
                    </div>
                  ) : (
                    <label className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border border-border/60 bg-white px-4 py-6 text-center transition-colors hover:border-[#0A65CC]/40 hover:bg-blue-50/40">
                      <FileUp className="size-5 text-[#0A65CC]" aria-hidden />
                      <span className="text-sm font-medium text-foreground">
                        Upload PDF certificate
                      </span>
                      <span className="text-xs text-muted-foreground">
                        PDF only · up to {formatFileSize(MAX_TRAINING_PDF_BYTES)}
                      </span>
                      <input
                        ref={(el) => {
                          fileInputRefs.current[training.id] = el
                        }}
                        type="file"
                        accept="application/pdf,.pdf"
                        className="sr-only"
                        onChange={(e) =>
                          handlePdfUpload(index, e.target.files?.[0])
                        }
                      />
                    </label>
                  )}

                  {uploadError ? (
                    <p className="mt-2 text-xs text-destructive" role="alert">
                      {uploadError}
                    </p>
                  ) : null}
                </div>
              </div>
            </BuilderFormCard>
          )
        })}

        {canAddMore ? (
          <button
            type="button"
            onClick={addTraining}
            className={builderAddButtonClassName}
          >
            <Plus className="size-4" aria-hidden />
            Add Another Training ({trainings.length}/{MAX_TRAINING_ENTRIES})
          </button>
        ) : (
          <p className="text-center text-sm text-muted-foreground">
            Maximum of {MAX_TRAINING_ENTRIES} training entries reached.
          </p>
        )}
      </div>

      <BuilderStepFooter
        backHref="/new/education"
        nextHref="/new/skills"
        nextLabel="Next: Skills"
      />
    </BuilderStepPage>
  )
}
