"use client"

import type { HTMLInputTypeAttribute, ReactNode } from "react"
import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  ArrowRight,
  Lightbulb,
  Lock,
  Plus,
  Sparkles,
  UserRound,
} from "lucide-react"

import { builderNextButtonClassName } from "@/components/resume/builder-step-footer"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useResumeDraft } from "@/hooks/use-resume-draft"
import {
  validateHeadingContact,
  type HeadingContactErrors,
} from "@/lib/resume-draft"
import { cn } from "@/lib/utils"

const BD_DIVISIONS = [
  "Barishal",
  "Chattogram",
  "Dhaka",
  "Khulna",
  "Mymensingh",
  "Rajshahi",
  "Rangpur",
  "Sylhet",
] as const

const fieldClassName =
  "h-12 rounded-xl border-0 bg-[#f3f4f6] px-4 text-sm shadow-none placeholder:text-muted-foreground focus-visible:border-blue-500 focus-visible:ring-2 focus-visible:ring-blue-500/20"

function PlaceholderField({
  id,
  placeholder,
  required,
  type = "text",
  autoComplete,
  value,
  onChange,
  className,
  error,
  overlay,
  suffix,
}: {
  id: string
  placeholder: string
  required?: boolean
  type?: HTMLInputTypeAttribute
  autoComplete?: string
  value: string
  onChange: (value: string) => void
  className?: string
  error?: string
  overlay?: ReactNode
  suffix?: ReactNode
}) {
  return (
    <div className="space-y-1.5">
      <div className="relative">
        <Input
          id={id}
          name={id}
          type={type}
          required={required}
          placeholder={placeholder}
          autoComplete={autoComplete}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          aria-invalid={Boolean(error)}
          className={cn(
            fieldClassName,
            error &&
              "ring-2 ring-destructive/30 focus-visible:border-destructive focus-visible:ring-destructive/20",
            className
          )}
        />
        {overlay}
        {suffix}
      </div>
      {error ? (
        <p className="text-xs text-destructive" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  )
}

export function NewContactStep() {
  const router = useRouter()
  const { draft, patchDraft } = useResumeDraft()
  const contact = draft.contact
  const [errors, setErrors] = useState<HeadingContactErrors>({})
  const [submitError, setSubmitError] = useState<string | null>(null)

  function updateContact(patch: Partial<typeof contact>) {
    patchDraft({ contact: { ...contact, ...patch } })
    setSubmitError(null)

    const nextErrors = { ...errors }
    for (const key of Object.keys(patch) as Array<keyof typeof contact>) {
      delete nextErrors[key]
    }
    if (Object.keys(nextErrors).length !== Object.keys(errors).length) {
      setErrors(nextErrors)
    }
  }

  function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file?.type.startsWith("image/")) return
    const reader = new FileReader()
    reader.onload = () => {
      if (typeof reader.result === "string") {
        updateContact({ photoDataUrl: reader.result })
      }
    }
    reader.readAsDataURL(file)
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()

    const validationErrors = validateHeadingContact(contact)
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
      setSubmitError("Please fill in all required fields before continuing.")
      return
    }

    setErrors({})
    setSubmitError(null)
    router.push("/new/work-history")
  }

  return (
    <div className="flex min-h-full flex-col lg:min-h-[calc(100svh)] lg:flex-row">
      <aside className="flex shrink-0 flex-col justify-center bg-[#4B8AD2] px-8 py-12 text-white lg:w-[340px] lg:px-10 lg:py-16 xl:w-[380px]">
        <div className="mx-auto w-full max-w-sm lg:max-w-none">
          <h2 className="text-2xl font-bold tracking-tight text-balance lg:text-[1.75rem] lg:leading-tight">
            Let&apos;s put a face to your name.
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-blue-100 lg:text-[0.95rem]">
            Employers make decisions in seconds. Make yours count.
          </p>

          <div className="mt-10 flex flex-col items-center">
            <div className="relative">
              <div
                className={cn(
                  "flex size-40 items-center justify-center rounded-full border-2 border-dashed border-white/70 p-2 sm:size-44",
                  contact.photoDataUrl && "border-solid border-white/90"
                )}
              >
                {contact.photoDataUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element -- data URL preview
                  <img
                    src={contact.photoDataUrl}
                    alt="Profile photo preview"
                    className="size-full rounded-full object-cover"
                  />
                ) : (
                  <span className="flex size-24 items-center justify-center rounded-full bg-blue-500/50 text-white/90 sm:size-28">
                    <UserRound className="size-12 stroke-[1.25] sm:size-14" aria-hidden />
                  </span>
                )}
              </div>
              <label className="absolute -top-1 -right-1 flex size-8 cursor-pointer items-center justify-center rounded-md bg-[#21304F] text-white shadow-md transition-colors hover:bg-[#1a2840]">
                <Plus className="size-4" strokeWidth={2.5} aria-hidden />
                <input
                  type="file"
                  accept="image/*"
                  className="sr-only"
                  aria-label="Upload profile photo"
                  onChange={handlePhotoChange}
                />
              </label>
            </div>

            <label className="mt-6 cursor-pointer">
              <input
                type="file"
                accept="image/*"
                className="sr-only"
                aria-label="Upload profile photo"
                onChange={handlePhotoChange}
              />
              <span className="inline-flex h-10 min-w-38 items-center justify-center rounded-lg border border-white/80 bg-transparent px-5 text-sm font-medium text-white transition-colors hover:bg-white/10">
                Upload Photo
              </span>
            </label>
          </div>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col bg-[#f8f9fb] lg:min-h-[calc(100svh)]">
        <div className="flex flex-wrap items-center justify-end gap-2 border-b border-border/50 bg-white px-6 py-4 sm:gap-3 sm:px-8">
          <Button
            type="button"
            variant="secondary"
            size="sm"
            className="h-9 gap-1.5 rounded-full bg-[#f3f4f6] px-4 text-foreground shadow-none hover:bg-[#e9eaec]"
          >
            <Lightbulb className="size-4 text-muted-foreground" aria-hidden />
            Tips
          </Button>
          {/* <Button
            variant="link"
            size="sm"
            className="h-9 px-3 text-blue-600"
            asChild
          >
            <Link href="/my-resume/preview" target="_blank">
              Preview
            </Link>
          </Button>
          <Button
            size="sm"
            className="h-9 rounded-lg bg-[#21304F] px-4 text-white hover:bg-[#1a2840]"
            asChild
          >
            <Link href="/">Save &amp; Exit</Link>
          </Button> */}
        </div>

        <div className="flex flex-1 justify-center overflow-y-auto px-6 py-8 sm:px-10 sm:py-10 lg:items-center lg:py-12">
          <div className="w-full max-w-xl">
            <header className="space-y-2">
              <h1 className="text-2xl font-bold tracking-tight text-balance text-[#1f2937] md:text-3xl">
                What&apos;s the best way for employers to contact you?
              </h1>
              <p className="text-sm leading-relaxed text-pretty text-muted-foreground md:text-base">
                Provide your basic contact information to make it easier for
                recruiters to reach you.
              </p>
            </header>

            <form
              className="mt-8 flex flex-col gap-4"
              noValidate
              onSubmit={handleSubmit}
            >
            {submitError ? (
              <div
                className="rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive"
                role="alert"
              >
                {submitError}
              </div>
            ) : null}

            <div className="grid gap-4 sm:grid-cols-2">
              <PlaceholderField
                id="givenName"
                placeholder="Name"
                autoComplete="given-name"
                value={contact.givenName}
                onChange={(v) => updateContact({ givenName: v })}
                error={errors.givenName}
              />
              <PlaceholderField
                id="familyName"
                placeholder="Surname"
                autoComplete="family-name"
                value={contact.familyName}
                onChange={(v) => updateContact({ familyName: v })}
                error={errors.familyName}
              />
            </div>

            <PlaceholderField
              id="profession"
              placeholder="Professional Title (e.g. Senior UX Designer)"
              autoComplete="organization-title"
              value={contact.profession}
              onChange={(v) => updateContact({ profession: v })}
              className="bg-blue-50 pr-11 text-blue-900 placeholder:text-blue-400/80 focus-visible:bg-blue-50"
              error={errors.profession}
              suffix={
                <Sparkles
                  className="pointer-events-none absolute top-1/2 right-4 size-4 -translate-y-1/2 text-blue-500"
                  aria-hidden
                />
              }
            />

            <div className="grid gap-4 sm:grid-cols-2">
              <PlaceholderField
                id="city"
                placeholder="City"
                autoComplete="address-level2"
                value={contact.city}
                onChange={(v) => updateContact({ city: v })}
                error={errors.city}
              />
              <PlaceholderField
                id="postalCode"
                placeholder="Zip Code"
                autoComplete="postal-code"
                value={contact.postalCode}
                onChange={(v) => updateContact({ postalCode: v })}
                error={errors.postalCode}
              />
            </div>

            <div className="space-y-1.5">
              <Select
                value={contact.division || undefined}
                onValueChange={(v) => updateContact({ division: v })}
              >
                <SelectTrigger
                  id="division"
                  aria-invalid={Boolean(errors.division)}
                  className={cn(
                    fieldClassName,
                    "w-full text-muted-foreground data-placeholder:text-muted-foreground",
                    errors.division &&
                      "ring-2 ring-destructive/30 focus-visible:border-destructive focus-visible:ring-destructive/20"
                  )}
                >
                  <SelectValue placeholder="Division / Department" />
                </SelectTrigger>
                <SelectContent>
                  {BD_DIVISIONS.map((d) => (
                    <SelectItem key={d} value={d}>
                      {d}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.division ? (
                <p className="text-xs text-destructive" role="alert">
                  {errors.division}
                </p>
              ) : null}
            </div>
            <input type="hidden" name="division" value={contact.division} />

            <div className="grid gap-4 sm:grid-cols-2">
              <PlaceholderField
                id="phone"
                placeholder="Phone Number"
                autoComplete="tel"
                value={contact.phone}
                onChange={(v) => updateContact({ phone: v })}
                error={errors.phone}
              />
              <PlaceholderField
                id="email"
                placeholder=""
                required
                type="email"
                autoComplete="email"
                value={contact.email}
                onChange={(v) => updateContact({ email: v })}
                error={errors.email}
                className={cn(!contact.email && "placeholder:text-transparent")}
                overlay={
                  !contact.email ? (
                    <span className="pointer-events-none absolute top-1/2 left-4 -translate-y-1/2 text-sm text-muted-foreground">
                      Email Address{" "}
                      <span className="text-destructive" aria-hidden>
                        *
                      </span>
                    </span>
                  ) : null
                }
              />
            </div>

            <div className="mt-4 flex flex-col gap-4">
              <Button
                type="submit"
                className={builderNextButtonClassName}
              >
                Save &amp; Continue
                <ArrowRight className="size-4" aria-hidden />
              </Button>

              <p className="flex items-center justify-center gap-1.5 text-center text-xs text-muted-foreground">
                <Lock className="size-3.5 shrink-0" aria-hidden />
                Your data is saved automatically.
              </p>
            </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
