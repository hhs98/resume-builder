"use client"

import type { HTMLInputTypeAttribute } from "react"
import Link from "next/link"
import { Lightbulb, UserRound } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Field, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useResumeDraft } from "@/hooks/use-resume-draft"
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

function FormField({
  id,
  label,
  required,
  placeholder,
  type = "text",
  autoComplete,
  value,
  onChange,
}: {
  id: string
  label: string
  required?: boolean
  placeholder: string
  type?: HTMLInputTypeAttribute
  autoComplete?: string
  value: string
  onChange: (value: string) => void
}) {
  return (
    <Field>
      <FieldLabel htmlFor={id}>
        {label}
        {required ? (
          <span className="text-destructive" aria-hidden>
            {" "}
            *
          </span>
        ) : null}
      </FieldLabel>
      <Input
        id={id}
        name={id}
        type={type}
        required={required}
        placeholder={placeholder}
        autoComplete={autoComplete}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </Field>
  )
}

export function NewContactStep() {
  const { draft, patchDraft } = useResumeDraft()
  const contact = draft.contact

  function updateContact(patch: Partial<typeof contact>) {
    patchDraft({ contact: { ...contact, ...patch } })
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

  return (
    <div className="mx-auto max-w-4xl px-6 py-10 md:px-10 md:py-14">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <header className="max-w-2xl space-y-2">
          <h1 className="text-2xl font-semibold tracking-tight text-balance text-foreground md:text-3xl">
            What&apos;s the best way for employers to contact you?
          </h1>
          <p className="text-sm leading-relaxed text-pretty text-muted-foreground md:text-base">
            We suggest including an email and phone number.
          </p>
        </header>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="shrink-0 gap-1.5 self-start text-muted-foreground hover:text-foreground sm:self-auto"
        >
          <Lightbulb className="size-4" aria-hidden />
          Tips
        </Button>
      </div>

      <div className="mt-8 grid gap-10 lg:grid-cols-[minmax(0,220px)_1fr] lg:items-start lg:gap-12">
        <div className="flex flex-col items-center gap-4 lg:items-stretch">
          <div
            className={cn(
              "relative flex aspect-[4/5] w-full max-w-[220px] flex-col items-center justify-center gap-3 overflow-hidden rounded-xl border border-dashed border-border bg-muted/40 px-4 text-center lg:max-w-none",
              contact.photoDataUrl && "border-solid p-0"
            )}
          >
            {contact.photoDataUrl ? (
              // eslint-disable-next-line @next/next/no-img-element -- data URL preview
              <img
                src={contact.photoDataUrl}
                alt="Profile photo preview"
                className="size-full object-cover"
              />
            ) : (
              <>
                <span
                  className="flex size-14 items-center justify-center rounded-full bg-muted text-muted-foreground"
                  aria-hidden
                >
                  <UserRound className="size-7 stroke-[1.5]" />
                </span>
                <span className="text-xs leading-snug text-muted-foreground">
                  Sample Image for Photo Upload
                </span>
              </>
            )}
          </div>
          <Button
            variant="outline"
            className="w-full max-w-[220px] lg:max-w-none"
            asChild
          >
            <label className="cursor-pointer">
              <input
                type="file"
                accept="image/*"
                className="sr-only"
                aria-label="Upload profile photo"
                onChange={handlePhotoChange}
              />
              Upload Photo
            </label>
          </Button>
        </div>

        <div className="space-y-6">
          <p className="text-xs text-muted-foreground">
            <span className="text-destructive">*</span> indicates a required
            field
          </p>
          <form className="grid max-w-xl gap-6" noValidate>
            <div className="grid gap-6 sm:grid-cols-2">
              <FormField
                id="givenName"
                label="Name"
                placeholder="Rahat"
                autoComplete="given-name"
                value={contact.givenName}
                onChange={(v) => updateContact({ givenName: v })}
              />
              <FormField
                id="familyName"
                label="Surname"
                placeholder="Hossain"
                autoComplete="family-name"
                value={contact.familyName}
                onChange={(v) => updateContact({ familyName: v })}
              />
            </div>

            <FormField
              id="profession"
              label="Profession"
              placeholder="Senior Sales Manager"
              autoComplete="organization-title"
              value={contact.profession}
              onChange={(v) => updateContact({ profession: v })}
            />

            <div className="grid gap-6 sm:grid-cols-2">
              <FormField
                id="city"
                label="City"
                placeholder="Chittagong"
                autoComplete="address-level2"
                value={contact.city}
                onChange={(v) => updateContact({ city: v })}
              />
              <FormField
                id="postalCode"
                label="Zip Code"
                placeholder="4000"
                autoComplete="postal-code"
                value={contact.postalCode}
                onChange={(v) => updateContact({ postalCode: v })}
              />
            </div>

            <Field>
              <FieldLabel htmlFor="division">Division</FieldLabel>
              <Select
                value={contact.division || undefined}
                onValueChange={(v) => updateContact({ division: v })}
              >
                <SelectTrigger id="division" className="w-full">
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
              <input
                type="hidden"
                name="division"
                value={contact.division}
              />
            </Field>

            <FormField
              id="phone"
              label="Phone"
              placeholder="01712-345678"
              autoComplete="tel"
              value={contact.phone}
              onChange={(v) => updateContact({ phone: v })}
            />

            <FormField
              id="email"
              label="Email"
              required
              type="email"
              placeholder="rahat.hossain@email.com"
              autoComplete="email"
              value={contact.email}
              onChange={(v) => updateContact({ email: v })}
            />
          </form>

          <div className="flex justify-end border-t border-border pt-6">
            <Button asChild>
              <Link href="/new/work-history">Next: Work history</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
