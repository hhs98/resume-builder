import { notFound } from "next/navigation"

import { ResumePreview } from "@/components/resume/resume-preview"
import { getResumeDraftById } from "@/lib/get-resume-draft-from-db"

export default async function ResumePrintPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const draft = await getResumeDraftById(id)

  if (!draft) {
    notFound()
  }

  return (
    <div className="light-surface min-h-screen bg-white print:bg-white print:p-0">
      <div
        id="resume-print-preview"
        data-resume-ready="true"
        className="mx-auto max-w-[210mm] bg-white shadow-none print:shadow-none"
      >
        <ResumePreview draft={draft} templateId={draft.templateId} />
      </div>
    </div>
  )
}
