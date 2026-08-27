import Link from "next/link"
import { ArrowRight } from "lucide-react"

import { Button } from "@/components/ui/button"

const templates = [
  {
    id: "classic",
    name: "Classic",
    description: "Traditional layout with clean headings",
    accent: "bg-red-500",
    bar: "w-3/4",
  },
  {
    id: "modern",
    name: "Modern",
    description: "Bold headers with gold accents",
    accent: "bg-amber-500",
    bar: "w-2/3",
  },
  {
    id: "minimal",
    name: "Minimal",
    description: "Two-column, text-focused design",
    accent: "bg-slate-600",
    bar: "w-1/2",
  },
  {
    id: "executive",
    name: "Executive",
    description: "Sidebar with skills panel",
    accent: "bg-[#21304F]",
    bar: "w-4/5",
  },
] as const

function TemplatePreview({
  accent,
  bar,
}: {
  accent: string
  bar: string
}) {
  return (
    <div className="relative aspect-[8.5/11] overflow-hidden rounded-lg border border-border/80 bg-white p-3 shadow-inner">
      <div className={`mb-3 h-2 rounded-sm ${accent}`} />
      <div className="mb-2 h-1.5 w-1/3 rounded-sm bg-foreground/20" />
      <div className="mb-4 h-1 w-1/2 rounded-sm bg-muted-foreground/20" />
      <div className="space-y-1.5">
        <div className={`h-1 rounded-sm bg-foreground/15 ${bar}`} />
        <div className="h-1 w-full rounded-sm bg-foreground/10" />
        <div className="h-1 w-5/6 rounded-sm bg-foreground/10" />
        <div className="h-1 w-4/5 rounded-sm bg-foreground/10" />
      </div>
      <div className="absolute right-2 bottom-2 left-2 space-y-1">
        <div className="h-1 w-2/5 rounded-sm bg-foreground/15" />
        <div className="h-1 w-full rounded-sm bg-foreground/8" />
      </div>
    </div>
  )
}

export function LandingTemplates() {
  return (
    <section
      id="templates"
      className="scroll-mt-24 border-t border-border/40 bg-gradient-to-b from-white/80 to-[#f0f4fa] px-4 py-20 sm:px-6"
    >
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-xl">
            <p className="text-sm font-semibold uppercase tracking-wider text-[#0A65CC]">
              Templates
            </p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Recruiter-approved designs
            </h2>
            <p className="mt-4 text-base leading-relaxed text-muted-foreground sm:text-lg">
              Four ATS-optimized templates crafted for clarity and impact. Switch
              between them anytime and preview your resume live before downloading.
            </p>
            <Button
              asChild
              className="mt-6 gap-2 bg-[#0A65CC] text-white hover:bg-[#0952a5]"
            >
              <Link href="/new">
                Try templates free
                <ArrowRight className="size-4" aria-hidden />
              </Link>
            </Button>
          </div>

          <div className="inline-flex items-center gap-2 self-start rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-medium text-emerald-800 lg:self-auto">
            <span className="size-2 rounded-full bg-emerald-500" aria-hidden />
            ATS-optimized layouts
          </div>
        </div>

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {templates.map((template) => (
            <article
              key={template.id}
              className="group rounded-2xl border border-border/60 bg-white p-4 shadow-sm transition-all hover:-translate-y-1 hover:border-blue-200/80 hover:shadow-lg"
            >
              <TemplatePreview accent={template.accent} bar={template.bar} />
              <div className="mt-4 px-1">
                <h3 className="font-semibold text-foreground">{template.name}</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  {template.description}
                </p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
