import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

const GOTENBERG_URL =
  process.env.GOTENBERG_URL ??
  "https://demo.gotenberg.dev/forms/chromium/convert/url"

const PREVIEW_BASE_URL =
  process.env.RESUME_PREVIEW_BASE_URL ?? "https://cv.jobmedia.com.bd"

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const resume = await prisma.resume.findUnique({
      where: { id },
      select: { id: true },
    })

    if (!resume) {
      return NextResponse.json({ error: "Resume not found" }, { status: 404 })
    }

    const previewUrl = `${PREVIEW_BASE_URL}/my-resume/preview/${id}/`

    const formData = new FormData()
    formData.append("url", previewUrl)
    formData.append("waitDelay", "10s")
    formData.append("paperWidth", "8.27")
    formData.append("paperHeight", "11.7")

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
