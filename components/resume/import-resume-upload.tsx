"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useRef, useState } from "react"
import {
  ArrowLeft,
  FileText,
  Loader2,
  Upload,
  X,
} from "lucide-react"

import { LandingFooter } from "@/components/landing/landing-footer"
import { LandingHeader } from "@/components/landing/landing-header"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  aiErrorFromResponse,
  parseAiResponseJson,
} from "@/lib/ai-errors"
import {
  MAX_RESUME_IMPORT_NOTES_CHARS,
  MAX_RESUME_PDF_BYTES,
  MAX_RESUME_PDF_PAGES,
  MAX_RESUME_PDF_SIZE_MB,
  type ResumePdfPageInfo,
} from "@/lib/parse-resume"
import { saveResumeDraft, type ResumeDraft } from "@/lib/resume-draft"
import { cn } from "@/lib/utils"

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function isPdfFile(file: File): boolean {
  const name = file.name.toLowerCase()
  return file.type === "application/pdf" || name.endsWith(".pdf")
}

function formatPageInfo(pages: ResumePdfPageInfo): string {
  if (pages.totalPages === 1) return "1 page"
  return `${pages.totalPages} pages`
}

export function ImportResumeUpload() {
  const router = useRouter()
  const inputRef = useRef<HTMLInputElement>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [description, setDescription] = useState("")
  const [pageInfo, setPageInfo] = useState<ResumePdfPageInfo | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [isVerifying, setIsVerifying] = useState(false)
  const [isParsing, setIsParsing] = useState(false)

  async function verifyPdfPages(file: File) {
    setIsVerifying(true)
    setPageInfo(null)

    try {
      const formData = new FormData()
      formData.append("file", file)

      const response = await fetch("/api/resume/verify", {
        method: "POST",
        body: formData,
      })

      const data = await parseAiResponseJson<{
        pages?: ResumePdfPageInfo
        error?: string
      }>(response)

      if (!response.ok) {
        setSelectedFile(null)
        throw new Error(
          data.error ?? "We couldn't verify this PDF. Please try another file."
        )
      }

      if (data.pages) {
        setPageInfo(data.pages)
      }
    } catch (verifyError) {
      setSelectedFile(null)
      setPageInfo(null)
      setError(
        verifyError instanceof Error
          ? verifyError.message
          : "We couldn't verify this PDF. Please try another file."
      )
    } finally {
      setIsVerifying(false)
    }
  }

  function validateAndSetFile(file: File | undefined) {
    if (!file) return

    if (!isPdfFile(file)) {
      setSelectedFile(null)
      setPageInfo(null)
      setError("Only PDF files are allowed. Please upload a .pdf resume.")
      return
    }

    if (file.size > MAX_RESUME_PDF_BYTES) {
      setSelectedFile(null)
      setPageInfo(null)
      setError(`File is too large. Maximum size is ${MAX_RESUME_PDF_SIZE_MB} MB.`)
      return
    }

    setError(null)
    setSelectedFile(file)
    void verifyPdfPages(file)
  }

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    validateAndSetFile(e.target.files?.[0])
    e.target.value = ""
  }

  function handleDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault()
    setIsDragging(false)
    validateAndSetFile(e.dataTransfer.files?.[0])
  }

  function clearFile() {
    setSelectedFile(null)
    setPageInfo(null)
    setError(null)
  }

  async function handleUpload() {
    if (!selectedFile) {
      setError("Choose a PDF resume to upload.")
      return
    }

    if (isVerifying) {
      setError("Please wait while we verify your PDF page count.")
      return
    }

    setError(null)
    setIsParsing(true)

    try {
      const formData = new FormData()
      formData.append("file", selectedFile)
      if (description.trim()) {
        formData.append("description", description.trim())
      }

      const response = await fetch("/api/resume/parse", {
        method: "POST",
        body: formData,
      })

      const data = await parseAiResponseJson<{
        draft?: ResumeDraft
        pages?: ResumePdfPageInfo
        error?: string
      }>(response)

      if (!response.ok) {
        throw new Error(
          aiErrorFromResponse(
            response,
            data,
            "We couldn't parse this resume. Please try again."
          )
        )
      }

      if (!data.draft) {
        throw new Error("We couldn't read parsed resume data. Please try again.")
      }

      saveResumeDraft(data.draft)
      router.push("/new")
    } catch (uploadError) {
      setError(
        uploadError instanceof Error
          ? uploadError.message
          : "We couldn't parse this resume. Please try again."
      )
    } finally {
      setIsParsing(false)
    }
  }

  return (
    <div className="light-surface relative flex min-h-svh flex-col bg-[#f4f7fb]">
      <div
        className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,#e8edf4_1px,transparent_1px),linear-gradient(to_bottom,#e8edf4_1px,transparent_1px)] bg-[size:3rem_3rem] [mask-image:radial-gradient(ellipse_at_top,black_30%,transparent_80%)]"
        aria-hidden
      />
      <LandingHeader />

      <main className="relative mx-auto flex w-full max-w-2xl flex-1 flex-col px-6 py-10 sm:px-8 sm:py-12">
        <Link
          href="/"
          className="inline-flex w-fit items-center gap-1.5 rounded-lg px-2 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-white/80 hover:text-foreground"
        >
          <ArrowLeft className="size-4" aria-hidden />
          Back
        </Link>

        <div className="mt-8 rounded-2xl border border-border/50 bg-white p-6 shadow-sm shadow-black/[0.04] ring-1 ring-black/[0.02] sm:p-8">
        <header className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-wider text-[#0A65CC]">
            Import resume
          </p>
          <h1 className="text-2xl font-bold tracking-tight text-balance text-foreground md:text-3xl">
            Upload your resume
          </h1>
          <p className="text-sm leading-relaxed text-pretty text-muted-foreground md:text-base">
            Import an existing resume as a PDF. We&apos;ll extract your details
            and open the builder so you can review and finish your resume.
          </p>
        </header>

        <section className="mt-8 space-y-4">
          <div
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault()
                inputRef.current?.click()
              }
            }}
            onDragEnter={(e) => {
              e.preventDefault()
              setIsDragging(true)
            }}
            onDragOver={(e) => {
              e.preventDefault()
              setIsDragging(true)
            }}
            onDragLeave={(e) => {
              e.preventDefault()
              setIsDragging(false)
            }}
            onDrop={handleDrop}
            onClick={() => !isParsing && !isVerifying && inputRef.current?.click()}
            className={cn(
              "cursor-pointer rounded-2xl border-2 border-dashed bg-white/80 p-8 text-center shadow-sm transition-all sm:p-10",
              isDragging
                ? "border-[#0A65CC] bg-blue-50/60"
                : "border-[#0A65CC]/25 hover:border-[#0A65CC]/50 hover:bg-blue-50/30",
              (isParsing || isVerifying) && "pointer-events-none opacity-70"
            )}
          >
            <input
              ref={inputRef}
              type="file"
              accept="application/pdf,.pdf"
              className="sr-only"
              aria-label="Upload resume PDF"
              disabled={isParsing || isVerifying}
              onChange={handleInputChange}
            />

            <span className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-gradient-to-br from-[#0A65CC]/15 to-[#38BDF8]/15 text-[#0A65CC]">
              <Upload className="size-7" strokeWidth={1.75} aria-hidden />
            </span>

            <p className="mt-5 text-base font-semibold text-foreground">
              Drag &amp; drop your resume here
            </p>
            <p className="mt-1.5 text-sm text-muted-foreground">
              or click to browse files
            </p>

            <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
              <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700">
                PDF only
              </span>
              <span className="rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">
                Max {MAX_RESUME_PDF_SIZE_MB} MB
              </span>
              <span className="rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">
                Max {MAX_RESUME_PDF_PAGES} pages
              </span>
            </div>
          </div>

          {error ? (
            <div
              className="rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive"
              role="alert"
            >
              {error}
            </div>
          ) : null}

          {isVerifying ? (
            <div className="flex items-center gap-2 rounded-xl border border-border/60 bg-white px-4 py-3 text-sm text-muted-foreground">
              <Loader2 className="size-4 shrink-0 animate-spin" aria-hidden />
              Verifying PDF page count…
            </div>
          ) : null}

          {pageInfo ? (
            <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-800">
              Verified: {formatPageInfo(pageInfo)}. This resume can be imported.
            </div>
          ) : null}

          {selectedFile ? (
            <div className="overflow-hidden rounded-2xl border border-border/60 bg-white shadow-sm">
              <div className="flex items-center justify-between gap-3 border-b border-border/60 px-4 py-3 sm:px-5">
                <p className="text-sm font-medium text-foreground">
                  Selected file
                </p>
                <button
                  type="button"
                  onClick={clearFile}
                  disabled={isParsing || isVerifying}
                  className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:opacity-50"
                  aria-label="Remove selected file"
                >
                  <X className="size-4" aria-hidden />
                </button>
              </div>
              <div className="flex items-center gap-3 px-4 py-4 sm:px-5">
                <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-red-50 text-red-600">
                  <FileText className="size-5" aria-hidden />
                </span>
                <div className="min-w-0 flex-1 text-left">
                  <p className="truncate text-sm font-medium text-foreground">
                    {selectedFile.name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatFileSize(selectedFile.size)} · PDF
                    {pageInfo ? ` · ${formatPageInfo(pageInfo)}` : ""}
                  </p>
                </div>
              </div>
            </div>
          ) : null}

          <div className="rounded-2xl border border-border/60 bg-white p-4 shadow-sm sm:p-5">
            <div className="space-y-2">
              <Label htmlFor="resume-import-description">
                Resume notes{" "}
                <span className="font-normal text-muted-foreground">
                  (optional)
                </span>
              </Label>
              <Textarea
                id="resume-import-description"
                value={description}
                onChange={(e) =>
                  setDescription(
                    e.target.value.slice(0, MAX_RESUME_IMPORT_NOTES_CHARS)
                  )
                }
                placeholder="Tell us how you'd like your CV built — target role, skills to highlight, missing details, or anything not clear in the PDF."
                rows={4}
                disabled={isParsing || isVerifying}
                className="min-h-[100px] resize-y bg-white"
              />
              <p className="text-xs text-muted-foreground">
                We use this when extracting your resume so the builder starts closer
                to what you want.{" "}
                <span className="tabular-nums">
                  {description.length}/{MAX_RESUME_IMPORT_NOTES_CHARS}
                </span>
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs text-muted-foreground">
              Supported format: <span className="font-medium">.pdf</span> only
            </p>
            <div className="flex flex-col gap-2 sm:flex-row">
              <Button type="button" variant="outline" asChild disabled={isParsing}>
                <Link href="/new">Start from scratch</Link>
              </Button>
              <Button
                type="button"
                className="rounded-full bg-[#0A65CC] shadow-sm hover:bg-[#0952a5]"
                disabled={!selectedFile || !pageInfo || isParsing || isVerifying}
                onClick={handleUpload}
              >
                {isParsing ? (
                  <>
                    <Loader2 className="size-4 animate-spin" aria-hidden />
                    Parsing resume…
                  </>
                ) : (
                  "Upload & continue"
                )}
              </Button>
            </div>
          </div>

          {isParsing ? (
            <p className="text-sm text-muted-foreground">
              Reading your PDF and filling in the builder. This may take up to a
              minute.
            </p>
          ) : null}
        </section>
        </div>
      </main>

      <LandingFooter />
    </div>
  )
}
