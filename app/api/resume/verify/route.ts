import { NextResponse } from "next/server"

import {
  getResumePdfPageInfo,
  getResumePdfPageLimitError,
  validateResumePdfUpload,
} from "@/lib/parse-resume"
import { enforceRateLimit } from "@/lib/security/rate-limit-api"
import { isPdfBuffer, PDF_MAGIC_BYTE_ERROR } from "@/lib/security/pdf-validation"

export const runtime = "nodejs"

export async function POST(request: Request) {
  const rateLimited = enforceRateLimit(
    request,
    "resume-verify",
    { limit: 20, windowMs: 60 * 60 * 1000 },
    "Too many PDF verification attempts. Please try again later."
  )
  if (rateLimited) return rateLimited

  try {
    const formData = await request.formData()
    const validation = validateResumePdfUpload(formData.get("file"))

    if ("error" in validation) {
      return NextResponse.json({ error: validation.error }, { status: 400 })
    }

    const buffer = await validation.file.arrayBuffer()

    if (!isPdfBuffer(buffer)) {
      return NextResponse.json({ error: PDF_MAGIC_BYTE_ERROR }, { status: 400 })
    }

    const pages = await getResumePdfPageInfo(buffer)
    const pageLimitError = getResumePdfPageLimitError(pages.totalPages)

    if (pageLimitError) {
      return NextResponse.json({ error: pageLimitError }, { status: 400 })
    }

    return NextResponse.json({ pages })
  } catch (error) {
    console.error("Failed to verify resume PDF pages:", error)

    return NextResponse.json(
      { error: "We couldn't read this PDF. Please try another file." },
      { status: 400 }
    )
  }
}
