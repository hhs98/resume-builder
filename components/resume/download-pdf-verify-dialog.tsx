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

type Step = "details" | "otp" | "success"

type DownloadState = "idle" | "downloading" | "done" | "error"

type DownloadPdfVerifyDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  fullName: string
  phoneNumber: string
  onVerified: () => void | Promise<void>
}

function maskPhone(phone: string) {
  const digits = phone.replace(/\D/g, "")
  if (digits.length < 4) return phone
  return `•••• ${digits.slice(-4)}`
}

function firstName(fullName: string) {
  return fullName.trim().split(/\s+/)[0] || "there"
}

export function DownloadPdfVerifyDialog({
  open,
  onOpenChange,
  fullName,
  phoneNumber,
  onVerified,
}: DownloadPdfVerifyDialogProps) {
  const { executeV3 } = useGoogleReCaptcha()
  const [step, setStep] = useState<Step>("details")
  const [otp, setOtp] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isRequestingOtp, setIsRequestingOtp] = useState(false)
  const [isVerifying, setIsVerifying] = useState(false)
  const [downloadState, setDownloadState] = useState<DownloadState>("idle")

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

  async function finishVerificationAndDownload() {
    setStep("success")
    setDownloadState("downloading")
    try {
      await onVerified()
      setDownloadState("done")
    } catch {
      setDownloadState("error")
    }
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
      const data = (await res.json()) as { error?: string }
      if (!res.ok) {
        setError(data.error ?? "Could not send verification code.")
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

    setError(null)
    setIsVerifying(true)
    try {
      if (!executeV3) {
        setError("reCAPTCHA is not ready. Please try again.")
        return
      }

      const recaptcha = await executeV3("verify_otp")

      const res = await fetch("/api/download/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone_number: trimmedPhone,
          full_name: trimmedName,
          otp: value,
          recaptcha,
        }),
      })
      const data = (await res.json()) as {
        error?: string
        access_token?: string
      }
      if (!res.ok) {
        setError(data.error ?? "Invalid code. Try again.")
        return
      }

      await finishVerificationAndDownload()
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
              downloadState={downloadState}
              onRetryDownload={() => {
                void (async () => {
                  setDownloadState("downloading")
                  try {
                    await onVerified()
                    setDownloadState("done")
                  } catch {
                    setDownloadState("error")
                  }
                })()
              }}
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
                  href="https://jobmedia.com"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Visit JobMedia
                </a>
              </Button>
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
  downloadState,
  onRetryDownload,
}: {
  name: string
  greeting: string
  downloadState: DownloadState
  onRetryDownload: () => void
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
        You&apos;re all set, {greeting}
      </DialogTitle>

      <DialogDescription className="mt-2 max-w-sm text-sm leading-relaxed text-pretty">
        This resume is now saved to your JobMedia profile as{" "}
        <span className="font-medium text-foreground">{name}</span>. Sign in
        whenever you like to update it, discover openings, and apply without
        starting from scratch.
      </DialogDescription>

      <div className="mt-5 w-full rounded-lg border border-border bg-muted/30 px-4 py-3 text-left text-sm">
        {downloadState === "downloading" ? (
          <p className="flex items-center gap-2 text-muted-foreground">
            <Download className="size-4 shrink-0 animate-pulse" aria-hidden />
            Preparing your PDF download…
          </p>
        ) : null}
        {downloadState === "done" ? (
          <p className="text-foreground">
            <span className="font-medium">PDF ready.</span> If it didn&apos;t
            open automatically, check your downloads folder.
          </p>
        ) : null}
        {downloadState === "error" ? (
          <div className="space-y-2">
            <p className="text-destructive">
              We couldn&apos;t generate your PDF. Your profile was still saved.
            </p>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="w-full"
              onClick={onRetryDownload}
            >
              Try download again
            </Button>
          </div>
        ) : null}
        {downloadState === "idle" ? (
          <p className="text-muted-foreground">Starting your download…</p>
        ) : null}
      </div>
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
