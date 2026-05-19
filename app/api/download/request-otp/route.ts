import { NextResponse } from "next/server"

import {
  createDownloadOtp,
  normalizePhoneNumber,
} from "@/lib/download-otp-store"

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      full_name?: string
      phone_number?: string
    }

    const fullName = body.full_name?.trim() ?? ""
    const phoneNumber = body.phone_number?.trim() ?? ""

    if (!fullName) {
      return NextResponse.json(
        { error: "Full name is required." },
        { status: 400 }
      )
    }

    if (!normalizePhoneNumber(phoneNumber)) {
      return NextResponse.json(
        { error: "Phone number is required." },
        { status: 400 }
      )
    }

    const code = createDownloadOtp(phoneNumber, fullName)

    if (process.env.NODE_ENV === "development") {
      console.info(
        `[download-otp] ${phoneNumber}: ${code} (expires in 5 minutes)`
      )
    }

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json(
      { error: "Could not send verification code." },
      { status: 500 }
    )
  }
}
