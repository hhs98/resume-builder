"use client"

import type { HTMLInputTypeAttribute, ReactNode } from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import {
  ArrowRight,
  Lock,
  Plus,
  Sparkles,
  UserRound,
} from "lucide-react"

import { builderNextButtonClassName } from "@/components/resume/builder-step-footer"
import {
  BuilderFormCard,
  BuilderStepHeader,
  BuilderStepPage,
  BuilderTipsButton,
} from "@/components/resume/builder-step-layout"
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
  GENDER_OPTIONS,
  type HeadingContactErrors,
} from "@/lib/resume-draft"
import { builderFieldClassName } from "@/lib/builder-styles"
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

const fieldClassName = builderFieldClassName

function FieldLabel({
  htmlFor,
  children,
  required,
}: {
  htmlFor: string
  children: ReactNode
  required?: boolean
}) {
  return (
    <label
      htmlFor={htmlFor}
      className="mb-1.5 block text-sm font-medium text-foreground"
    >
      {children}
      {required ? (
        <span className="text-destructive" aria-hidden>
          {" "}
          *
        </span>
      ) : null}
    </label>
  )
}

function FormField({
  id,
  label,
  placeholder,
  required,
  type = "text",
  autoComplete,
  value,
  onChange,
  className,
  error,
  suffix,
}: {
  id: string
  label: string
  placeholder?: string
  required?: boolean
  type?: HTMLInputTypeAttribute
  autoComplete?: string
  value: string
  onChange: (value: string) => void
  className?: string
  error?: string
  suffix?: ReactNode
}) {
  return (
    <div className="space-y-0">
      <FieldLabel htmlFor={id} required={required}>
        {label}
      </FieldLabel>
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
          aria-required={required}
          className={cn(
            fieldClassName,
            error &&
              "ring-2 ring-destructive/30 focus-visible:border-destructive focus-visible:ring-destructive/20",
            className
          )}
        />
        {suffix}
      </div>
      {error ? (
        <p className="mt-1.5 text-xs text-destructive" role="alert">
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
    <BuilderStepPage maxWidth="6xl">
      <div className="mb-6 flex items-center justify-end">
        <BuilderTipsButton />
      </div>

      <div className="flex flex-col gap-8 lg:flex-row lg:items-start">
        <aside className="relative w-full shrink-0 overflow-hidden rounded-2xl bg-gradient-to-br from-[#0A65CC] via-[#1a6fd4] to-[#21304F] px-6 py-8 text-white shadow-sm lg:sticky lg:top-8 lg:w-[300px] lg:px-7 lg:py-10 xl:w-[320px]">
          <div
            className="pointer-events-none absolute -right-12 -top-12 size-40 rounded-full bg-white/10 blur-2xl"
            aria-hidden
          />
          <div className="relative">
            <p className="text-xs font-semibold uppercase tracking-wider text-blue-100">
              Step 1 of 9
            </p>
            <h2 className="mt-2 text-xl font-bold tracking-tight text-balance">
              Let&apos;s put a face to your name.
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-blue-100/90">
              Employers make decisions in seconds. Make yours count.
            </p>

            <div className="mt-8 flex flex-col items-center">
              <div className="relative">
                <div
                  className={cn(
                    "flex size-36 items-center justify-center rounded-full border-2 border-dashed border-white/50 p-2 sm:size-40",
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
                    <span className="flex size-20 items-center justify-center rounded-full bg-white/15 text-white/90 sm:size-24">
                      <UserRound
                        className="size-10 stroke-[1.25] sm:size-12"
                        aria-hidden
                      />
                    </span>
                  )}
                </div>
                <label className="absolute -top-1 -right-1 flex size-8 cursor-pointer items-center justify-center rounded-lg bg-white text-[#0A65CC] shadow-md transition-colors hover:bg-blue-50">
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

              <label className="mt-5 cursor-pointer">
                <input
                  type="file"
                  accept="image/*"
                  className="sr-only"
                  aria-label="Upload profile photo"
                  onChange={handlePhotoChange}
                />
                <span className="inline-flex h-10 min-w-38 items-center justify-center rounded-full border border-white/60 bg-white/10 px-5 text-sm font-medium text-white backdrop-blur transition-colors hover:bg-white/20">
                  Upload Photo
                </span>
              </label>
            </div>
          </div>
        </aside>

        <div className="min-w-0 flex-1 space-y-6">
          <BuilderStepHeader
            title="What&apos;s the best way for employers to contact you?"
            description="Provide your basic contact information to make it easier for recruiters to reach you. Fields marked with * are required."
          />

          <BuilderFormCard accent={false} padding="lg">
            <form
              className="flex flex-col gap-4"
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
                <FormField
                  id="givenName"
                  label="Name"
                  required
                  placeholder="e.g. Abdullah"
                  autoComplete="given-name"
                  value={contact.givenName}
                  onChange={(v) => updateContact({ givenName: v })}
                  error={errors.givenName}
                />
                <FormField
                  id="familyName"
                  label="Surname"
                  required
                  placeholder="e.g. Rahman"
                  autoComplete="family-name"
                  value={contact.familyName}
                  onChange={(v) => updateContact({ familyName: v })}
                  error={errors.familyName}
                />
              </div>

              <FormField
                id="profession"
                label="Professional Title"
                required
                placeholder="e.g. Senior UX Designer"
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

              <FormField
                id="currentAddress"
                label="Current Address"
                required
                placeholder="e.g. House 12, Road 5, Banani"
                autoComplete="street-address"
                value={contact.currentAddress ?? ""}
                onChange={(v) => updateContact({ currentAddress: v })}
                error={errors.currentAddress}
              />

              <div className="grid gap-4 sm:grid-cols-2">
                <FormField
                  id="city"
                  label="City"
                  required
                  placeholder="e.g. Dhaka"
                  autoComplete="address-level2"
                  value={contact.city}
                  onChange={(v) => updateContact({ city: v })}
                  error={errors.city}
                />
                <FormField
                  id="postalCode"
                  label="Zip Code"
                  required
                  placeholder="e.g. 1213"
                  autoComplete="postal-code"
                  value={contact.postalCode}
                  onChange={(v) => updateContact({ postalCode: v })}
                  error={errors.postalCode}
                />
              </div>

              <div className="space-y-0">
                <FieldLabel htmlFor="division" required>
                  Division
                </FieldLabel>
                <Select
                  value={contact.division || undefined}
                  onValueChange={(v) => updateContact({ division: v })}
                >
                  <SelectTrigger
                    id="division"
                    aria-invalid={Boolean(errors.division)}
                    aria-required
                    className={cn(
                      fieldClassName,
                      "w-full text-muted-foreground data-placeholder:text-muted-foreground",
                      errors.division &&
                        "ring-2 ring-destructive/30 focus-visible:border-destructive focus-visible:ring-destructive/20"
                    )}
                  >
                    <SelectValue placeholder="Select division" />
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
                  <p className="mt-1.5 text-xs text-destructive" role="alert">
                    {errors.division}
                  </p>
                ) : null}
              </div>
              <input type="hidden" name="division" value={contact.division} />

              <div className="grid gap-4 sm:grid-cols-2">
                <FormField
                  id="dateOfBirth"
                  label="Date of Birth"
                  required
                  type="date"
                  autoComplete="bday"
                  value={contact.dateOfBirth ?? ""}
                  onChange={(v) => updateContact({ dateOfBirth: v })}
                  error={errors.dateOfBirth}
                  className={cn(
                    !(contact.dateOfBirth ?? "").trim() &&
                      "text-muted-foreground"
                  )}
                />

                <div className="space-y-0">
                  <FieldLabel htmlFor="gender" required>
                    Gender
                  </FieldLabel>
                  <Select
                    value={contact.gender || undefined}
                    onValueChange={(v) => updateContact({ gender: v })}
                  >
                    <SelectTrigger
                      id="gender"
                      aria-invalid={Boolean(errors.gender)}
                      aria-required
                      className={cn(
                        fieldClassName,
                        "w-full text-muted-foreground data-placeholder:text-muted-foreground",
                        errors.gender &&
                          "ring-2 ring-destructive/30 focus-visible:border-destructive focus-visible:ring-destructive/20"
                      )}
                    >
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                    <SelectContent>
                      {GENDER_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.gender ? (
                    <p className="mt-1.5 text-xs text-destructive" role="alert">
                      {errors.gender}
                    </p>
                  ) : null}
                </div>
              </div>
              <input type="hidden" name="gender" value={contact.gender ?? ""} />

              <div className="grid gap-4 sm:grid-cols-2">
                <FormField
                  id="phone"
                  label="Phone Number"
                  required
                  placeholder="e.g. 01700000000"
                  autoComplete="tel"
                  value={contact.phone}
                  onChange={(v) => updateContact({ phone: v })}
                  error={errors.phone}
                />
                <FormField
                  id="email"
                  label="Email Address"
                  required
                  type="email"
                  placeholder="e.g. you@example.com"
                  autoComplete="email"
                  value={contact.email}
                  onChange={(v) => updateContact({ email: v })}
                  error={errors.email}
                />
              </div>

              <div className="mt-4 flex flex-col gap-4">
                <Button type="submit" className={builderNextButtonClassName}>
                  Save &amp; Continue
                  <ArrowRight className="size-4" aria-hidden />
                </Button>

                <p className="flex items-center justify-center gap-1.5 text-center text-xs text-muted-foreground">
                  <Lock className="size-3.5 shrink-0" aria-hidden />
                  Your data is saved automatically.
                </p>
              </div>
            </form>
          </BuilderFormCard>
        </div>
      </div>
    </BuilderStepPage>
  )
}
