import { NextResponse } from "next/server"

import {
  getResumePdfPageInfo,
  getResumePdfPageLimitError,
  validateResumePdfUpload,
} from "@/lib/parse-resume"

export const runtime = "nodejs"

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const validation = validateResumePdfUpload(formData.get("file"))

    if ("error" in validation) {
      return NextResponse.json({ error: validation.error }, { status: 400 })
    }

    const buffer = await validation.file.arrayBuffer()
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
