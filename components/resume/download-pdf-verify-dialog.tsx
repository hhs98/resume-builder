"use client"

import { useState } from "react"
import Link from "next/link"
import { ArrowLeft, CheckCircle2, Download, Sparkles } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp"
import { useGoogleReCaptcha } from "@google-recaptcha/react"
import type { ResumeDraft } from "@/lib/resume-draft"

type Step = "details" | "otp" | "success"

type DownloadState = "idle" | "downloading" | "done" | "error"

type DownloadPdfVerifyDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  fullName: string
  phoneNumber: string
  draft: ResumeDraft
  onVerified: (resumeId: string | null) => void | Promise<void>
}

function maskPhone(phone: string) {
  const digits = phone.replace(/\D/g, "")
  if (digits.length < 4) return phone
  return `•••• ${digits.slice(-4)}`
}

function firstName(fullName: string) {
  return fullName.trim().split(/\s+/)[0] || "there"
}

function formatSeconds(seconds: number): string {
  if (seconds <= 0) return "a moment"

  const units = [
    { label: "year", seconds: 31536000 },
    { label: "day", seconds: 86400 },
    { label: "hour", seconds: 3600 },
    { label: "minute", seconds: 60 },
    { label: "second", seconds: 1 },
  ]

  const parts: string[] = []
  let remaining = Math.round(seconds)

  for (const unit of units) {
    const value = Math.floor(remaining / unit.seconds)
    if (value > 0) {
      parts.push(`${value} ${unit.label}${value === 1 ? "" : "s"}`)
      remaining %= unit.seconds
    }
  }

  return parts.join(", ")
}

export function DownloadPdfVerifyDialog({
  open,
  onOpenChange,
  fullName,
  phoneNumber,
  draft,
  onVerified,
}: DownloadPdfVerifyDialogProps) {
  const { executeV3 } = useGoogleReCaptcha()
  const [step, setStep] = useState<Step>("details")
  const [otp, setOtp] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isRequestingOtp, setIsRequestingOtp] = useState(false)
  const [isVerifying, setIsVerifying] = useState(false)
  const [downloadState, setDownloadState] = useState<DownloadState>("idle")
  const [downloadError, setDownloadError] = useState<string | null>(null)
  const [resumeId, setResumeId] = useState<string | null>(null)
  const [saveSucceeded, setSaveSucceeded] = useState(false)

  const trimmedName = fullName.trim()
  const trimmedPhone = phoneNumber.trim()
  const canVerifyDetails = trimmedName.length > 0 && trimmedPhone.length > 0
  const isBusy = isRequestingOtp || isVerifying

  function resetDialog() {
    setStep("details")
    setOtp("")
    setError(null)
    setIsRequestingOtp(false)
    setIsVerifying(false)
    setDownloadState("idle")
    setDownloadError(null)
    setResumeId(null)
    setSaveSucceeded(false)
  }

  function handleOpenChange(nextOpen: boolean) {
    if (isBusy && !nextOpen) return
    if (!nextOpen) resetDialog()
    onOpenChange(nextOpen)
  }

  function handleDone() {
    resetDialog()
    onOpenChange(false)
  }

  function goBackToDetails() {
    setStep("details")
    setOtp("")
    setError(null)
  }

  async function requestPdfDownload(id: string | null) {
    if (!id) {
      setDownloadState("error")
      setDownloadError(
        "Your resume was saved but the download link is missing. Please close this dialog and try again."
      )
      return
    }

    setDownloadState("downloading")
    setDownloadError(null)
    try {
      await onVerified(id)
      setDownloadState("done")
    } catch (error) {
      setDownloadState("error")
      setDownloadError(
        error instanceof Error
          ? error.message
          : "Could not download your PDF. Please try again."
      )
    }
  }

  async function finishVerificationAndDownload(
    id: string | null,
    saved: boolean,
    saveError?: string
  ) {
    setStep("success")
    setSaveSucceeded(saved)

    if (!saved || !id) {
      setDownloadState("error")
      setDownloadError(
        saveError ??
          "We verified your phone number, but couldn't save your resume. Please try again."
      )
      return
    }

    await requestPdfDownload(id)
  }

  async function handleRequestOtp() {
    if (!canVerifyDetails) return

    try {
      setError(null)
      setIsRequestingOtp(true)

      if (!executeV3) {
        setError("reCAPTCHA is not ready. Please try again.")
        return
      }

      const recaptcha = await executeV3("example")

      const res = await fetch("/api/download/request-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          full_name: trimmedName,
          phone_number: trimmedPhone,
          recaptcha,
        }),
      })
      const data = (await res.json()) as { error?: string | number }
      if (!res.ok) {
        if (typeof data.error === "number") {
          setError(`Please try again in ${formatSeconds(data.error)}.`)
        } else {
          setError(data.error ?? "Could not send verification code.")
        }
        return
      }
      setStep("otp")
      setOtp("")
    } catch {
      setError("Could not send verification code. Try again.")
    } finally {
      setIsRequestingOtp(false)
    }
  }

  async function handleVerifyOtp(code?: string) {
    const value = code ?? otp
    if (value.length !== 6) {
      setError("Enter the 6-digit code.")
      return
    }

    try {
      setError(null)
      setIsVerifying(true)

      const res = await fetch("/api/download/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone_number: trimmedPhone,
          full_name: trimmedName,
          otp: value,
        }),
      })
      const data = (await res.json()) as {
        error?: string
        success?: boolean
      }
      if (!res.ok) {
        setError(data.error ?? "Invalid code. Try again.")
        return
      }

      // After successful OTP verification, send the draft to the resumes API
      const resumeRes = await fetch("/api/resumes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(draft),
      })

      const resumeData = (await resumeRes.json()) as {
        success?: boolean
        id?: string
        error?: string
      }

      const saved = resumeRes.ok && Boolean(resumeData.id)
      if (!saved) {
        console.error("Failed to save resume draft:", resumeData.error)
      }

      let currentId: string | null = null
      if (resumeData.id) {
        setResumeId(resumeData.id)
        currentId = resumeData.id
      }

      await finishVerificationAndDownload(
        currentId,
        saved,
        resumeData.error
      )
    } catch {
      setError("Verification failed. Try again.")
    } finally {
      setIsVerifying(false)
    }
  }

  function handleOtpChange(value: string) {
    setOtp(value)
    if (error) setError(null)
    if (value.length === 6 && !isVerifying) {
      void handleVerifyOtp(value)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="gap-0 overflow-hidden p-0 sm:max-w-md">
        <div
          className={
            step === "success"
              ? "border-b border-emerald-500/20 bg-emerald-500/5 px-6 pt-6 pb-5"
              : "border-b border-border bg-muted/30 px-6 pt-6 pb-5"
          }
        >
          <div className="flex items-center gap-3">
            <span
              className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-blue-600/10 text-blue-600 dark:bg-blue-500/15 dark:text-blue-400"
              aria-hidden
            >
              <Sparkles className="size-5" strokeWidth={1.75} />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-base leading-none font-semibold tracking-tight">
                <span className="text-red-600 dark:text-red-500">
                  Job&nbsp;
                </span>
                <span className="text-blue-600 dark:text-blue-500">Media</span>
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                AI Resume Builder
              </p>
            </div>
            {step === "success" ? (
              <span className="shrink-0 rounded-full bg-emerald-500/15 px-2.5 py-1 text-[0.65rem] font-medium text-emerald-700 dark:text-emerald-400">
                Complete
              </span>
            ) : (
              <span className="shrink-0 rounded-full bg-background px-2.5 py-1 text-[0.65rem] font-medium text-muted-foreground ring-1 ring-border">
                Step {step === "details" ? 1 : 2} of 2
              </span>
            )}
          </div>
        </div>

        <div className="space-y-5 px-6 py-5">
          {step !== "success" ? (
            <div className="space-y-1.5">
              <DialogTitle className="text-base">
                {step === "details"
                  ? "Confirm your details"
                  : "Enter verification code"}
              </DialogTitle>
              <DialogDescription>
                {step === "details"
                  ? "We will text a one-time code to the number below."
                  : `Code sent to ${maskPhone(trimmedPhone)}.`}
              </DialogDescription>
            </div>
          ) : null}

          {error && step !== "success" ? (
            <div
              className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2.5 text-sm text-destructive"
              role="alert"
            >
              {error}
            </div>
          ) : null}

          {step === "details" ? (
            <>
              {!canVerifyDetails ? (
                <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-3 text-sm leading-relaxed text-foreground">
                  <p className="font-medium">Contact info required</p>
                  <p className="mt-1 text-muted-foreground">
                    Add your name and phone on the Heading step before
                    downloading.
                  </p>
                  <Button variant="outline" size="sm" className="mt-3" asChild>
                    <Link href="/new">Go to Heading</Link>
                  </Button>
                </div>
              ) : (
                <dl className="divide-y divide-border overflow-hidden rounded-lg border border-border bg-muted/20 text-sm">
                  <DetailRow label="Full name" value={trimmedName} />
                  <DetailRow label="Phone number" value={trimmedPhone} />
                </dl>
              )}

              <p className="text-xs leading-relaxed text-muted-foreground">
                By continuing, you agree to Job Media&apos;s{" "}
                <Link
                  href="/terms"
                  className="font-medium text-foreground underline underline-offset-2 hover:text-primary"
                >
                  Terms &amp; Conditions
                </Link>{" "}
                and{" "}
                <Link
                  href="/privacy"
                  className="font-medium text-foreground underline underline-offset-2 hover:text-primary"
                >
                  Privacy Policy
                </Link>
                .
              </p>
            </>
          ) : null}

          {step === "otp" ? (
            <div className="space-y-4">
              <div className="flex justify-center py-2">
                <InputOTP
                  maxLength={6}
                  value={otp}
                  onChange={handleOtpChange}
                  disabled={isBusy}
                  autoFocus
                  aria-label="One-time verification code"
                >
                  <InputOTPGroup className="gap-1.5 *:data-[slot=input-otp-slot]:size-10 *:data-[slot=input-otp-slot]:text-base">
                    <InputOTPSlot index={0} />
                    <InputOTPSlot index={1} />
                    <InputOTPSlot index={2} />
                    <InputOTPSlot index={3} />
                    <InputOTPSlot index={4} />
                    <InputOTPSlot index={5} />
                  </InputOTPGroup>
                </InputOTP>
              </div>
              <p className="text-center text-xs text-muted-foreground">
                Didn&apos;t get a code? Check your messages or resend below.
              </p>
            </div>
          ) : null}

          {step === "success" ? (
            <SuccessPanel
              name={trimmedName}
              greeting={firstName(trimmedName)}
              saveSucceeded={saveSucceeded}
              downloadState={downloadState}
              downloadError={downloadError}
            />
          ) : null}
        </div>

        <div className="flex flex-col-reverse gap-2 border-t border-border bg-muted/30 px-6 py-4 sm:flex-row sm:justify-between">
          {step === "success" ? (
            <>
              <Button
                type="button"
                variant="outline"
                className="sm:mr-auto"
                asChild
              >
                <a
                  href="https://jobmedia.com.bd"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Visit JobMedia
                </a>
              </Button>
              {resumeId && downloadState === "error" ? (
                <Button
                  type="button"
                  className="gap-1.5"
                  onClick={() => void requestPdfDownload(resumeId)}
                >
                  <Download className="size-4" aria-hidden />
                  Download again
                </Button>
              ) : null}
              <Button type="button" onClick={handleDone}>
                Done
              </Button>
            </>
          ) : null}

          {step === "otp" ? (
            <Button
              type="button"
              variant="ghost"
              className="gap-1.5 sm:mr-auto"
              disabled={isBusy}
              onClick={goBackToDetails}
            >
              <ArrowLeft className="size-4" aria-hidden />
              Back
            </Button>
          ) : null}

          {step === "details" ? (
            <Button
              type="button"
              variant="outline"
              className="cursor-pointer"
              disabled={isBusy}
              onClick={() => handleOpenChange(false)}
            >
              Cancel
            </Button>
          ) : null}

          {step === "details" ? (
            <Button
              type="button"
              className="cursor-pointer sm:min-w-[7.5rem]"
              onClick={handleRequestOtp}
              disabled={!canVerifyDetails || isRequestingOtp}
            >
              {isRequestingOtp ? "Sending code…" : "Send code"}
            </Button>
          ) : null}

          {step === "otp" ? (
            <div className="flex flex-col gap-2 sm:flex-row">
              <Button
                type="button"
                variant="outline"
                className="cursor-pointer"
                disabled={isBusy}
                onClick={handleRequestOtp}
              >
                {isRequestingOtp ? "Resending…" : "Resend code"}
              </Button>
              <Button
                type="button"
                className="cursor-pointer sm:min-w-[9rem]"
                onClick={() => handleVerifyOtp()}
                disabled={otp.length !== 6 || isVerifying}
              >
                {isVerifying ? "Verifying…" : "Verify & continue"}
              </Button>
            </div>
          ) : null}
        </div>
      </DialogContent>
    </Dialog>
  )
}

function SuccessPanel({
  name,
  greeting,
  saveSucceeded,
  downloadState,
  downloadError,
}: {
  name: string
  greeting: string
  saveSucceeded: boolean
  downloadState: DownloadState
  downloadError: string | null
}) {
  return (
    <div className="flex flex-col items-center py-2 text-center">
      <span
        className="flex size-14 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
        aria-hidden
      >
        <CheckCircle2 className="size-8" strokeWidth={1.75} />
      </span>

      <DialogTitle className="mt-4 text-lg">
        {saveSucceeded
          ? `You're all set, ${greeting}`
          : "Verification complete"}
      </DialogTitle>

      <DialogDescription className="mt-2 max-w-sm text-sm leading-relaxed text-pretty">
        {saveSucceeded ? (
          <>
            This resume is now saved to your JobMedia profile as{" "}
            <span className="font-medium text-foreground">{name}</span>. Sign in
            whenever you like to update it, discover openings, and apply without
            starting from scratch.
          </>
        ) : (
          <>
            We verified your phone number, but couldn&apos;t save your resume.
            Please try again or contact support.
          </>
        )}
      </DialogDescription>

      {saveSucceeded ? (
        <div className="mt-5 w-full rounded-lg border border-border bg-muted/30 px-4 py-3 text-left text-sm">
          {downloadState === "downloading" || downloadState === "idle" ? (
            <p className="flex items-center gap-2 text-muted-foreground">
              <Download className="size-4 shrink-0 animate-pulse" aria-hidden />
              {downloadState === "idle"
                ? "Starting your download…"
                : "Preparing your PDF download…"}
            </p>
          ) : null}
          {downloadState === "done" ? (
            <p className="text-foreground">
              <span className="font-medium">PDF ready.</span> Your resume has
              been downloaded successfully.
            </p>
          ) : null}
          {downloadState === "error" && downloadError ? (
            <div
              className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2.5 text-destructive"
              role="alert"
            >
              <p className="font-medium">Download failed</p>
              <p className="mt-1 text-sm leading-relaxed">{downloadError}</p>
            </div>
          ) : null}
        </div>
      ) : downloadError ? (
        <div
          className="mt-5 w-full rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2.5 text-left text-sm text-destructive"
          role="alert"
        >
          <p className="font-medium">Could not save resume</p>
          <p className="mt-1 leading-relaxed">{downloadError}</p>
        </div>
      ) : null}
    </div>
  )
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid gap-0.5 px-4 py-3 sm:grid-cols-[7.5rem_1fr] sm:gap-4">
      <dt className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
        {label}
      </dt>
      <dd className="font-medium text-foreground">{value}</dd>
    </div>
  )
}
