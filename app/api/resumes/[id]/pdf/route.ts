import { NextResponse } from "next/server"

import { getResumeDraftById } from "@/lib/get-resume-draft-from-db"
import { requireDownloadPermit } from "@/lib/security/download-permit"
import { buildResumePrintUrl } from "@/lib/security/preview-url"
import { enforceRateLimit } from "@/lib/security/rate-limit-api"

const GOTENBERG_URL =
  process.env.GOTENBERG_URL ??
  "https://demo.gotenberg.dev/forms/chromium/convert/url"

const RESUME_READY_SELECTOR = "#resume-print-preview[data-resume-ready='true']"

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const rateLimited = enforceRateLimit(
    req,
    "resume-pdf",
    { limit: 10, windowMs: 60 * 60 * 1000 },
    "Too many PDF downloads. Please try again later."
  )
  if (rateLimited) return rateLimited

  const permit = requireDownloadPermit(req)
  if (!permit) {
    return NextResponse.json(
      { error: "A valid download permit is required." },
      { status: 401 }
    )
  }

  try {
    const { id } = await params

    const draft = await getResumeDraftById(id)
    if (!draft) {
      return NextResponse.json({ error: "Resume not found" }, { status: 404 })
    }

    const previewUrl = buildResumePrintUrl(id)

    const formData = new FormData()
    formData.append("url", previewUrl)
    formData.append("waitForSelector", RESUME_READY_SELECTOR)
    formData.append("paperWidth", "8.27")
    formData.append("paperHeight", "11.7")
    formData.append("marginTop", "0")
    formData.append("marginBottom", "0")
    formData.append("marginLeft", "0")
    formData.append("marginRight", "0")
    formData.append("printBackground", "true")

    const gotenbergRes = await fetch(GOTENBERG_URL, {
      method: "POST",
      body: formData,
    })

    if (!gotenbergRes.ok) {
      const detail = await gotenbergRes.text()
      console.error("Gotenberg PDF error:", previewUrl, detail)
      return NextResponse.json(
        {
          error:
            process.env.NODE_ENV === "development"
              ? `Failed to generate PDF. Check RESUME_PREVIEW_BASE_URL and GOTENBERG_URL.`
              : "Failed to generate PDF",
        },
        { status: 502 }
      )
    }

    const pdfBuffer = await gotenbergRes.arrayBuffer()

    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": 'attachment; filename="resume.pdf"',
      },
    })
  } catch (error) {
    console.error("PDF generation error:", error)
    return NextResponse.json(
      { error: "Failed to generate PDF" },
      { status: 500 }
    )
  }
}
