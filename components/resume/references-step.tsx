"use client"

import Link from "next/link"
import { Lightbulb, Plus, Trash2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Field, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { useResumeDraft } from "@/hooks/use-resume-draft"

function FormField({
  id,
  label,
  required,
  placeholder,
  autoComplete,
  value,
  onChange,
}: {
  id: string
  label: string
  required?: boolean
  placeholder: string
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
        required={required}
        placeholder={placeholder}
        autoComplete={autoComplete}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </Field>
  )
}

const EMPTY_REFERENCE = {
  id: "",
  name: "",
  designation: "",
  organization: "",
  phone: "",
  email: "",
  address: "",
}

export function ReferencesStep() {
  const { draft, patchDraft } = useResumeDraft()
  const references = draft.references || []

  function updateReference(index: number, patch: Partial<(typeof EMPTY_REFERENCE)>) {
    const updated = [...references]
    updated[index] = { ...updated[index], ...patch }
    patchDraft({ references: updated })
  }

  function addReference() {
    patchDraft({
      references: [
        ...references,
        { ...EMPTY_REFERENCE, id: crypto.randomUUID() },
      ],
    })
  }

  function removeReference(index: number) {
    const updated = references.filter((_, i) => i !== index)
    patchDraft({ references: updated })
  }

  return (
    <div className="mx-auto max-w-4xl px-6 py-10 md:px-10 md:py-14">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <header className="max-w-2xl space-y-2">
          <h1 className="text-2xl font-semibold tracking-tight text-balance text-foreground md:text-3xl">
            Add your references
          </h1>
          <p className="text-sm leading-relaxed text-pretty text-muted-foreground md:text-base">
            Provide details of people who can vouch for your professional work.
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

      <div className="mt-8 space-y-8">
        {references.map((ref, index) => (
          <div
            key={ref.id}
            className="rounded-xl border border-border bg-background p-6"
          >
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-foreground">
                  Reference {index + 1}
                </h2>
              </div>
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => removeReference(index)}
              >
                <Trash2 className="size-4" />
              </Button>
            </div>

            <form className="grid gap-6 sm:grid-cols-2" noValidate>
              <FormField
                id={`name-${index}`}
                label="Reference Person Name"
                required
                placeholder="John Doe"
                value={ref.name}
                onChange={(v) => updateReference(index, { name: v })}
              />
              <FormField
                id={`designation-${index}`}
                label="Designation"
                required
                placeholder="Manager"
                value={ref.designation}
                onChange={(v) => updateReference(index, { designation: v })}
              />
              <FormField
                id={`organization-${index}`}
                label="Organization"
                required
                placeholder="Company Name"
                value={ref.organization}
                onChange={(v) => updateReference(index, { organization: v })}
              />
              <FormField
                id={`phone-${index}`}
                label="Phone Number"
                required
                placeholder="+1 234 567 890"
                value={ref.phone}
                onChange={(v) => updateReference(index, { phone: v })}
              />
              <FormField
                id={`email-${index}`}
                label="Email Address"
                placeholder="john@example.com"
                value={ref.email}
                onChange={(v) => updateReference(index, { email: v })}
              />
              <FormField
                id={`address-${index}`}
                label="Address"
                placeholder="City, Country"
                value={ref.address}
                onChange={(v) => updateReference(index, { address: v })}
              />
            </form>
          </div>
        ))}

        <Button
          type="button"
          variant="outline"
          className="w-full gap-2"
          onClick={addReference}
        >
          <Plus className="size-4" />
          Add Another Reference
        </Button>

        <div className="flex flex-col-reverse justify-between gap-3 border-t border-border pt-6 sm:flex-row sm:items-center">
          <Button variant="outline" asChild>
            <Link href="/new/summary">Back</Link>
          </Button>
          <Button asChild>
            <Link href="/new/finalize">Next: Finalize</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
