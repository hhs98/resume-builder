import { NextResponse } from "next/server"

import { getResumeDraftById } from "@/lib/get-resume-draft-from-db"

const GOTENBERG_URL =
  process.env.GOTENBERG_URL ??
  "https://demo.gotenberg.dev/forms/chromium/convert/url"

/** CSS selector present only after resume HTML is in the DOM. */
const RESUME_READY_SELECTOR = "#resume-print-preview[data-resume-ready='true']"

function getPreviewBaseUrl(req: Request): string {
  if (process.env.RESUME_PREVIEW_BASE_URL) {
    return process.env.RESUME_PREVIEW_BASE_URL.replace(/\/$/, "")
  }

  const host =
    req.headers.get("x-forwarded-host") ?? req.headers.get("host")
  const proto = req.headers.get("x-forwarded-proto") ?? "http"

  if (host && !host.includes("localhost") && !host.startsWith("127.0.0.1")) {
    return `${proto}://${host}`
  }

  return "https://cv.jobmedia.com.bd"
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const draft = await getResumeDraftById(id)
    if (!draft) {
      return NextResponse.json({ error: "Resume not found" }, { status: 404 })
    }

    const previewBaseUrl = getPreviewBaseUrl(req)
    // Server-rendered print page — resume HTML is in the initial response (no client fetch).
    const previewUrl = `${previewBaseUrl}/my-resume/preview/${id}`

    const formData = new FormData()
    formData.append("url", previewUrl)
    // Gotenberg: wait until the ready marker exists before printing.
    // https://gotenberg.dev/docs/convert-with-chromium/convert-url-to-pdf
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
      console.error("Gotenberg PDF error:", detail)
      return NextResponse.json(
        { error: "Failed to generate PDF" },
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
