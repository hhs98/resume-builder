"use client"

import { useEffect, useState, use } from "react"
import { ResumePreview } from "@/components/resume/resume-preview"
import { useResumeDraft } from "@/hooks/use-resume-draft"
import type { ResumeDraft } from "@/lib/resume-draft"

export default function PreviewPage({
  searchParams,
}: {
  searchParams: Promise<{ id?: string }>
}) {
  const { id } = use(searchParams)
  const { draft: localDraft } = useResumeDraft()
  const [dbDraft, setDbDraft] = useState<ResumeDraft | null>(null)
  const [loading, setLoading] = useState(!!id)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!id) return

    async function fetchResume() {
      try {
        setLoading(true)
        const res = await fetch(`/api/resumes/${id}`)
        if (!res.ok) {
          throw new Error("Failed to fetch stored resume")
        }
        const data = await res.json()
        setDbDraft(data)
      } catch (err) {
        console.error(err)
        setError("Resume not found or could not be loaded.")
      } finally {
        setLoading(false)
      }
    }

    void fetchResume()
  }, [id])

  const draftToRender = id ? dbDraft : localDraft

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-muted/30">
        <div className="animate-pulse text-muted-foreground font-medium">
          Loading stored resume...
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-muted/30 p-8 overflow-y-auto">
        <div className="text-center w-full">
           <div className="text-destructive font-medium mb-8">
            <p>{error}</p>
            <p className="text-xs text-muted-foreground mt-2">Showing local draft instead.</p>
          </div>
          <div className="mx-auto max-w-[210mm] shadow-2xl print:shadow-none">
            <ResumePreview draft={localDraft} templateId={localDraft.templateId} />
          </div>
        </div>
      </div>
    )
  }

  if (!draftToRender) return null

  return (
    <div className="min-h-screen bg-muted/30 py-8 px-4 sm:py-12 sm:px-6 lg:px-8 print:p-0 print:bg-white">
      <div 
        id="resume-print-preview"
        className="mx-auto max-w-[210mm] shadow-2xl print:shadow-none"
      >
        <ResumePreview draft={draftToRender} templateId={draftToRender.templateId} />
      </div>
    </div>
  )
}
