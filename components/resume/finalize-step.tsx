"use client"

import { useState } from "react"
import Link from "next/link"
import {
  Check,
  Circle,
  Download,
  LayoutTemplate,
} from "lucide-react"

import { ResumePreview } from "@/components/resume/resume-preview"
import { Button } from "@/components/ui/button"
import {
  computeResumeCompleteness,
  FINALIZE_SECTIONS,
  getFullName,
  type ResumeTemplateId,
} from "@/lib/resume-draft"
import { useResumeDraft } from "@/hooks/use-resume-draft"
import { DownloadPdfVerifyDialog } from "@/components/resume/download-pdf-verify-dialog"
import { downloadResumePdf } from "@/lib/download-resume-pdf"
import { cn } from "@/lib/utils"

const TEMPLATES: {
  id: ResumeTemplateId
  name: string
  description: string
}[] = [
  {
    id: "classic",
    name: "Classic",
    description: "Red accents, pink highlights, and skill dot ratings",
  },
  {
    id: "modern",
    name: "Modern",
    description: "Gold header, contact bar, and skill progress bars",
  },
  {
    id: "minimal",
    name: "Minimal",
    description: "Pink header, two columns, serif body, skill bars",
  },
  {
    id: "executive",
    name: "Executive",
    description: "Green sidebar with photo, skills pills, and timeline",
  },
]

export function FinalizeStep() {
  const { draft, patchDraft } = useResumeDraft()
  const [verifyDialogOpen, setVerifyDialogOpen] = useState(false)
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false)

  const completeness = computeResumeCompleteness(draft)
  const displayName = getFullName(draft)
  const phoneNumber = draft.contact.phone

  async function handleDownloadAfterVerify() {
    setIsDownloadingPdf(true)
    try {
      await downloadResumePdf(
        "resume-print-preview",
        displayName.trim() || "resume"
      )
    } catch (error) {
      console.error("Failed to generate PDF", error)
    } finally {
      setIsDownloadingPdf(false)
    }
  }

  // console.log(draft)

  return (
    <div className="mx-auto max-w-7xl px-6 py-10 md:px-10 md:py-14">
      <header className="max-w-2xl space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight text-balance text-foreground md:text-3xl">
          Finalize your resume
        </h1>
        <p className="text-sm leading-relaxed text-pretty text-muted-foreground md:text-base">
          Pick a template, review your content, then download your
          resume.
        </p>
        <p className="text-xs text-muted-foreground">
          Resume completeness:{" "}
          <span className="font-semibold text-foreground">{completeness}%</span>
        </p>
      </header>

      <div className="mt-8 grid gap-10 xl:grid-cols-[minmax(0,380px)_1fr] xl:items-start">
        <div className="space-y-8">
          <section className="space-y-3" aria-labelledby="template-picker-heading">
            <div className="flex items-center gap-2">
              <LayoutTemplate
                className="size-4 text-muted-foreground"
                aria-hidden
              />
              <h2
                id="template-picker-heading"
                className="text-sm font-medium text-foreground"
              >
                Template
              </h2>
            </div>
            <div className="grid gap-2">
              {TEMPLATES.map((t) => {
                const selected = draft.templateId === t.id
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => patchDraft({ templateId: t.id })}
                    className={cn(
                      "rounded-lg border px-4 py-3 text-left transition-colors",
                      selected
                        ? "border-primary bg-primary/5 ring-1 ring-primary"
                        : "border-border bg-card hover:bg-muted/50"
                    )}
                    aria-pressed={selected}
                  >
                    <p className="text-sm font-medium text-foreground">
                      {t.name}
                    </p>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {t.description}
                    </p>
                  </button>
                )
              })}
            </div>
          </section>

          <section className="space-y-3" aria-labelledby="sections-checklist-heading">
            <h2
              id="sections-checklist-heading"
              className="text-sm font-medium text-foreground"
            >
              Sections
            </h2>
            <ul className="space-y-1 rounded-lg border border-border bg-card p-2">
              {FINALIZE_SECTIONS.map((section) => {
                const complete = section.isComplete(draft)
                return (
                  <li key={section.href}>
                    <Link
                      href={section.href}
                      className="flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors hover:bg-muted/60"
                    >
                      {complete ? (
                        <span
                          className="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary"
                          aria-hidden
                        >
                          <Check className="size-3.5" />
                        </span>
                      ) : (
                        <span
                          className="flex size-6 shrink-0 items-center justify-center rounded-full border border-border text-muted-foreground"
                          aria-hidden
                        >
                          <Circle className="size-3" />
                        </span>
                      )}
                      <span className="flex-1 text-foreground">
                        {section.label}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {complete ? "Done" : "Edit"}
                      </span>
                    </Link>
                  </li>
                )
              })}
            </ul>
          </section>

          <section
            className="flex flex-col gap-2 sm:flex-row sm:flex-wrap"
            aria-label="Export resume"
          >
            <Button
              type="button"
              className="gap-1.5 cursor-pointer"
              onClick={() => setVerifyDialogOpen(true)}
              disabled={isDownloadingPdf}
            >
              <Download className="size-4" aria-hidden />
              {isDownloadingPdf ? "Generating PDF…" : "Download PDF"}
            </Button>
          </section>

          <DownloadPdfVerifyDialog
            open={verifyDialogOpen}
            onOpenChange={setVerifyDialogOpen}
            fullName={displayName}
            phoneNumber={phoneNumber}
            onVerified={handleDownloadAfterVerify}
          />

          <div className="flex flex-col gap-3 border-t border-border pt-6 sm:flex-row">
            <Button variant="outline" asChild className="w-full sm:w-auto cursor-pointer">
              <Link href="/new/summary">Back to summary</Link>
            </Button>
          </div>
        </div>

        <div className="min-w-0 xl:sticky xl:top-6" id="resume-preview-panel">
          <p className="mb-3 text-xs font-medium tracking-wide text-muted-foreground uppercase print:hidden">
            Preview
          </p>
          <div className="overflow-hidden rounded-xl border border-border bg-muted/40 p-3 sm:p-4 print:border-0 print:bg-transparent print:p-0">
            <div
              id="resume-print-preview"
              className="origin-top scale-[0.72] sm:scale-[0.85] lg:scale-100 print:scale-100"
            >
              <ResumePreview draft={draft} templateId={draft.templateId} />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
