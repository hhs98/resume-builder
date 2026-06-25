"use client"

import {
  Lightbulb,
  Plus,
  Trash2,
} from "lucide-react"

import { BuilderStepFooter } from "@/components/resume/builder-step-footer"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useResumeDraft } from "@/hooks/use-resume-draft"
import { hasReferenceContent } from "@/lib/resume-draft"
import { generateId } from "@/lib/utils"

const EMPTY_REFERENCE = {
  id: "",
  name: "",
  designation: "",
  organization: "",
  phone: "",
  email: "",
}

function FloatingField({
  id,
  label,
  placeholder,
  value,
  onChange,
  type = "text",
  autoComplete,
}: {
  id: string
  label: string
  placeholder?: string
  value: string
  onChange: (value: string) => void
  type?: string
  autoComplete?: string
}) {
  return (
    <div className="relative pt-2">
      <label
        htmlFor={id}
        className="absolute top-0 left-3 z-10 bg-white px-1 text-xs font-medium text-muted-foreground"
      >
        {label}
      </label>
      <Input
        id={id}
        name={id}
        type={type}
        placeholder={placeholder}
        autoComplete={autoComplete}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-12 rounded-xl border border-border/70 bg-white px-4 text-sm shadow-none"
      />
    </div>
  )
}

export function ReferencesStep() {
  const { draft, patchDraft } = useResumeDraft()
  const references =
    draft.references?.length > 0
      ? draft.references
      : [{ ...EMPTY_REFERENCE, id: generateId() }]

  function persistReferences(refs: (typeof EMPTY_REFERENCE)[]) {
    const hasOtherContent = (index: number) =>
      refs.some((ref, i) => i !== index && hasReferenceContent(ref))

    patchDraft({
      references: refs.filter(
        (ref, index) => hasReferenceContent(ref) || hasOtherContent(index)
      ),
    })
  }

  function updateReference(
    index: number,
    patch: Partial<(typeof EMPTY_REFERENCE)>
  ) {
    const updated = [...references]
    updated[index] = { ...updated[index], ...patch }
    persistReferences(updated)
  }

  function addReference() {
    persistReferences([
      ...references,
      { ...EMPTY_REFERENCE, id: generateId() },
    ])
  }

  function removeReference(index: number) {
    persistReferences(references.filter((_, i) => i !== index))
  }

  return (
    <div className="min-h-full bg-[#f8f9fb]">
      <div className="mx-auto max-w-3xl px-6 py-8 sm:px-8 sm:py-10">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <header className="max-w-2xl space-y-2">
            <h1 className="text-2xl font-bold tracking-tight text-balance text-[#1f2937] md:text-3xl">
              Add your references
            </h1>
            <p className="text-sm leading-relaxed text-pretty text-muted-foreground md:text-base">
              Provide details of people who can vouch for your professional
              work.
            </p>
          </header>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-9 shrink-0 gap-1.5 self-start rounded-full border-blue-200 bg-white px-4 text-blue-600 shadow-none hover:bg-blue-50 sm:self-auto"
          >
            <Lightbulb className="size-4" aria-hidden />
            Tips
          </Button>
        </div>

        <div className="mt-8 space-y-5">
          {references.map((ref, index) => (
            <div
              key={ref.id}
              className="relative overflow-hidden rounded-2xl border border-border/60 bg-white p-5 shadow-sm sm:p-6"
            >
              <div
                className="absolute inset-y-0 left-0 w-1 bg-blue-600"
                aria-hidden
              />

              <div className="mb-5 flex items-center justify-between gap-3 pl-2">
                <span className="rounded-full bg-blue-50 px-3 py-1 text-[0.65rem] font-semibold tracking-[0.12em] text-blue-700 uppercase">
                  Reference {index + 1}
                </span>
                {references.length > 1 ? (
                  <button
                    type="button"
                    onClick={() => removeReference(index)}
                    className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                    aria-label={`Remove reference ${index + 1}`}
                  >
                    <Trash2 className="size-4" />
                  </button>
                ) : null}
              </div>

              <div className="grid gap-5 pl-2 sm:grid-cols-2">
                <FloatingField
                  id={`name-${index}`}
                  label="Full Name"
                  placeholder="Dr. Sarah Mitchell"
                  value={ref.name}
                  onChange={(v) => updateReference(index, { name: v })}
                />
                <FloatingField
                  id={`designation-${index}`}
                  label="Job Title"
                  placeholder="Principal Data Scientist"
                  value={ref.designation}
                  onChange={(v) => updateReference(index, { designation: v })}
                />
                <FloatingField
                  id={`organization-${index}`}
                  label="Company"
                  placeholder="TechCorp Inc."
                  value={ref.organization}
                  onChange={(v) => updateReference(index, { organization: v })}
                />
                <FloatingField
                  id={`email-${index}`}
                  label="Email"
                  type="email"
                  placeholder="sarah.mitchell@techcorp.com"
                  value={ref.email}
                  onChange={(v) => updateReference(index, { email: v })}
                />
                <FloatingField
                  id={`phone-${index}`}
                  label="Phone"
                  placeholder="+1 (555) 123-4567"
                  value={ref.phone}
                  onChange={(v) => updateReference(index, { phone: v })}
                />
              </div>
            </div>
          ))}

          <button
            type="button"
            onClick={addReference}
            className="flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-blue-300 bg-blue-50/30 px-6 py-4 text-sm font-semibold text-blue-600 transition-colors hover:bg-blue-50/60"
          >
            <Plus className="size-4" aria-hidden />
            Add Another Reference
          </button>
        </div>

        <BuilderStepFooter
          backHref="/new/summary"
          nextHref="/new/finalize"
          nextLabel="Next: Finalize"
          hint={
            <p className="flex items-center gap-2 text-sm text-muted-foreground">
              Final step next
              <span className="flex gap-1.5" aria-hidden>
                <span className="size-2 rounded-full bg-blue-600" />
                <span className="size-2 rounded-full bg-border" />
              </span>
            </p>
          }
        />
      </div>
    </div>
  )
}
