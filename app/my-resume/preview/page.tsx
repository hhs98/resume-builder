"use client"

import { ResumePreview } from "@/components/resume/resume-preview"
import { useResumeDraft } from "@/hooks/use-resume-draft"

export default function PreviewPage() {
  const { draft: localDraft } = useResumeDraft()

  if (!localDraft) return null

  return (
    <div className="min-h-screen bg-muted/30 py-8 px-4 sm:py-12 sm:px-6 lg:px-8 print:p-0 print:bg-white">
      <div 
        id="resume-print-preview"
        className="mx-auto max-w-[210mm] shadow-2xl print:shadow-none"
      >
        <ResumePreview draft={localDraft} templateId={localDraft.templateId} />
      </div>
    </div>
  )
}
