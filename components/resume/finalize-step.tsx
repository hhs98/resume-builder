"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import {
  AlertCircle,
  Award,
  Check,
  Download,
  FileText,
  LayoutList,
  Sparkles,
} from "lucide-react"

import { DownloadPdfVerifyDialog } from "@/components/resume/download-pdf-verify-dialog"
import { ResumePreview } from "@/components/resume/resume-preview"
import { Button } from "@/components/ui/button"
import { useResumeDraft } from "@/hooks/use-resume-draft"
import { downloadResumePdfWithFallback } from "@/lib/download-resume-pdf"
import {
  computeResumeCompleteness,
  FINALIZE_SECTIONS,
  getFullName,
  type ResumeDraft,
  type ResumeTemplateId,
} from "@/lib/resume-draft"
import { cn } from "@/lib/utils"

const TEMPLATES: {
  id: ResumeTemplateId
  name: string
  description: string
  icon: typeof FileText
}[] = [
  {
    id: "classic",
    name: "Classic",
    description: "Traditional layout with clean headings and bullet points.",
    icon: FileText,
  },
  {
    id: "modern",
    name: "Modern",
    description: "Contemporary design with bold headers and subtle accents.",
    icon: Sparkles,
  },
  {
    id: "minimal",
    name: "Minimal",
    description: "Simple, text-focused layout with generous white space.",
    icon: LayoutList,
  },
  {
    id: "executive",
    name: "Executive",
    description: "Sidebar layout with skills and contact in a colored panel.",
    icon: Award,
  },
]

const REVIEW_SECTIONS = FINALIZE_SECTIONS

function getScoreMessage(completeness: number, draft: ResumeDraft) {
  if (!draft.education.educationLevel.trim()) {
    return "Good progress! Add education to reach 90%."
  }
  if (draft.summary.trim().length < 40) {
    return "Almost there! Add a summary to boost your score."
  }
  if (completeness >= 90) {
    return "Excellent! Your resume is ready to download."
  }
  return "Good progress! Keep filling in sections to improve your score."
}

function ScoreRing({ value }: { value: number }) {
  const radius = 28
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (value / 100) * circumference

  return (
    <div className="relative size-16 shrink-0">
      <svg className="size-full -rotate-90" viewBox="0 0 64 64" aria-hidden>
        <circle
          cx="32"
          cy="32"
          r={radius}
          fill="none"
          stroke="#e5e7eb"
          strokeWidth="6"
        />
        <circle
          cx="32"
          cy="32"
          r={radius}
          fill="none"
          stroke="#22c55e"
          strokeWidth="6"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
        />
      </svg>
      <span className="absolute inset-0 flex items-center justify-center text-sm font-bold text-emerald-600">
        {value}%
      </span>
    </div>
  )
}

export function FinalizeStep() {
  const { draft, patchDraft } = useResumeDraft()
  const [verifyDialogOpen, setVerifyDialogOpen] = useState(false)
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false)

  const completeness = computeResumeCompleteness(draft)
  const displayName = getFullName(draft)
  const phoneNumber = draft.contact.phone

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "p") {
        event.preventDefault()
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [])

  async function handleDownloadAfterVerify(
    savedResumeId: string,
    permitToken: string
  ) {
    setIsDownloadingPdf(true)
    try {
      await downloadResumePdfWithFallback(
        savedResumeId,
        displayName.trim() || "resume",
        { permitToken }
      )
    } catch (error) {
      console.error("Failed to generate PDF", error)
      throw error
    } finally {
      setIsDownloadingPdf(false)
    }
  }

  return (
    <div className="min-h-full bg-[#f8f9fb]">
      <div className="mx-auto max-w-7xl px-6 py-8 sm:px-8 sm:py-10">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <header className="max-w-2xl space-y-2">
            <h1 className="text-2xl font-bold tracking-tight text-balance text-[#1f2937] md:text-3xl">
              Finalize your resume
            </h1>
            <p className="text-sm leading-relaxed text-pretty text-muted-foreground md:text-base">
              Pick a template, review your content, then download your resume.
              We&apos;ve optimized everything for ATS readability.
            </p>
          </header>

          <div className="flex shrink-0 items-center gap-4 rounded-2xl border border-border/60 bg-white px-5 py-4 shadow-sm">
            <ScoreRing value={completeness} />
            <div>
              <p className="text-sm font-semibold text-foreground">
                Resume Score
              </p>
              <p className="mt-0.5 max-w-xs text-xs leading-relaxed text-muted-foreground">
                {getScoreMessage(completeness, draft)}
              </p>
            </div>
          </div>
        </div>

        <div className="mt-8 grid gap-6 xl:grid-cols-[minmax(0,400px)_1fr] xl:items-start">
          <div className="space-y-5">
            <section className="relative overflow-hidden rounded-2xl border border-border/60 bg-white p-5 shadow-sm">
              <div
                className="absolute inset-y-0 left-0 w-1 bg-blue-600"
                aria-hidden
              />
              <h2 className="pl-3 text-base font-semibold text-foreground">
                1. Choose a Template
              </h2>
              <div className="mt-4 space-y-3 pl-3">
                {TEMPLATES.map((template) => {
                  const selected = draft.templateId === template.id
                  const Icon = template.icon
                  return (
                    <button
                      key={template.id}
                      type="button"
                      onClick={() => patchDraft({ templateId: template.id })}
                      className={cn(
                        "flex w-full items-start gap-3 rounded-xl border p-4 text-left transition-all",
                        selected
                          ? "border-blue-500 bg-blue-50/50 ring-1 ring-blue-500/20"
                          : "border-border/70 bg-[#f8f9fb]/50 hover:border-blue-200"
                      )}
                      aria-pressed={selected}
                    >
                      <span
                        className={cn(
                          "flex size-10 shrink-0 items-center justify-center rounded-lg",
                          selected
                            ? "bg-blue-100 text-blue-600"
                            : "bg-white text-muted-foreground"
                        )}
                      >
                        <Icon className="size-5" strokeWidth={1.75} />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="flex items-center justify-between gap-2">
                          <span className="text-sm font-semibold text-foreground">
                            {template.name}
                          </span>
                          <span
                            className={cn(
                              "flex size-4 shrink-0 items-center justify-center rounded-full border-2",
                              selected
                                ? "border-blue-600"
                                : "border-muted-foreground/30"
                            )}
                            aria-hidden
                          >
                            {selected ? (
                              <span className="size-2 rounded-full bg-blue-600" />
                            ) : null}
                          </span>
                        </span>
                        <span className="mt-0.5 block text-xs leading-relaxed text-muted-foreground">
                          {template.description}
                        </span>
                      </span>
                    </button>
                  )
                })}
              </div>
            </section>

            <section className="rounded-2xl border border-border/60 bg-white p-5 shadow-sm">
              <h2 className="text-base font-semibold text-foreground">
                2. Review Sections
              </h2>
              <ul className="mt-4 divide-y divide-border/60">
                {REVIEW_SECTIONS.map((section) => {
                  const hasContent = section.hasContent(draft)
                  const complete = section.isComplete(draft)
                  return (
                    <li key={section.href}>
                      <div className="flex items-center justify-between gap-3 py-3.5">
                        <div className="flex min-w-0 items-center gap-3">
                          {hasContent ? (
                            <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                              <Check className="size-3.5" strokeWidth={2.5} />
                            </span>
                          ) : (
                            <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground">
                              <AlertCircle className="size-3.5" />
                            </span>
                          )}
                          <div className="min-w-0">
                            <span className="text-sm font-medium text-foreground">
                              {section.label}
                            </span>
                            {hasContent ? (
                              <p className="text-xs text-emerald-600">
                                {complete ? "Done" : "In progress"}
                              </p>
                            ) : null}
                          </div>
                        </div>
                        <Link
                          href={section.href}
                          className={cn(
                            "shrink-0 text-sm font-medium",
                            hasContent
                              ? "text-blue-600 hover:text-blue-700"
                              : "text-red-500 hover:text-red-600"
                          )}
                        >
                          {hasContent ? "Edit" : "Add"}
                        </Link>
                      </div>
                    </li>
                  )
                })}
              </ul>
            </section>

            <div className="space-y-2">
              <Button
                type="button"
                className="h-12 w-full gap-2 rounded-xl bg-[#21304F] text-base font-semibold hover:bg-[#1a2840]"
                onClick={() => setVerifyDialogOpen(true)}
                disabled={isDownloadingPdf}
              >
                <Download className="size-4" aria-hidden />
                {isDownloadingPdf ? "Generating PDF…" : "Download PDF"}
              </Button>
              <p className="text-center text-xs text-muted-foreground">
                No subscription required for one-time download.
              </p>
            </div>

            <DownloadPdfVerifyDialog
              open={verifyDialogOpen}
              onOpenChange={setVerifyDialogOpen}
              fullName={displayName}
              phoneNumber={phoneNumber}
              draft={draft}
              onVerified={handleDownloadAfterVerify}
            />
          </div>

          <div
            className="min-w-0 xl:sticky xl:top-6"
            id="resume-preview-panel"
          >
            <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-linear-to-b from-slate-50 to-white p-4 shadow-sm sm:p-5">
              <div className="mb-4">
                <span className="rounded-full bg-[#1e3a5f] px-3 py-1 text-[0.65rem] font-semibold tracking-[0.14em] text-white uppercase">
                  Preview
                </span>
              </div>

              <div className="flex justify-center overflow-hidden rounded-xl border border-slate-200 bg-white p-3 shadow-sm sm:p-4">
                <div className="origin-top scale-[0.85] sm:scale-[0.65] md:scale-[0.72] lg:scale-[0.8] xl:scale-[0.85]">
                  <div id="resume-print-preview" data-resume-ready="true">
                    <ResumePreview
                      draft={draft}
                      templateId={draft.templateId}
                      tone="preview"
                      className="shadow-none ring-1 ring-slate-200"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
