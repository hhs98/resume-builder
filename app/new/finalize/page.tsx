import Link from "next/link"
import { Construction } from "lucide-react"

import { Button } from "@/components/ui/button"

export default function FinalizePage() {
  return (
    <div className="mx-auto max-w-6xl px-6 py-10 md:px-10 md:py-14">
      <header className="max-w-2xl space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight text-balance text-foreground md:text-3xl">
          Finalize your resume
        </h1>
        <p className="text-sm leading-relaxed text-pretty text-muted-foreground md:text-base">
          Review, pick a template, and export or share your resume.
        </p>
      </header>

      <section
        className="mt-10 max-w-xl rounded-xl border border-border bg-muted/30 p-8 md:p-10"
        aria-labelledby="finalize-wip-heading"
      >
        <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:gap-6">
          <span
            className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-amber-500/15 text-amber-800 dark:bg-amber-500/20 dark:text-amber-300"
            aria-hidden
          >
            <Construction className="size-7" strokeWidth={1.75} />
          </span>
          <div className="space-y-3">
            <h2
              id="finalize-wip-heading"
              className="inline-flex items-center rounded-full border border-amber-500/35 bg-amber-500/10 px-3 py-1 text-xs font-semibold tracking-wide text-amber-900 uppercase dark:text-amber-200"
            >
              Work in progress
            </h2>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Download, print, and sharing options are not available yet.
              We&apos;re building this step next.
            </p>
          </div>
        </div>
      </section>

      <div className="mt-8">
        <Button variant="outline" asChild className="w-full sm:w-auto">
          <Link href="/new/summary">Back to summary</Link>
        </Button>
      </div>
    </div>
  )
}
