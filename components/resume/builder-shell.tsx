"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Sparkles } from "lucide-react"

import { Progress } from "@/components/ui/progress"
import { useResumeDraft } from "@/hooks/use-resume-draft"
import { computeResumeCompleteness } from "@/lib/resume-draft"
import { cn } from "@/lib/utils"

export const BUILDER_STEPS = [
  { href: "/new", label: "Heading" },
  { href: "/new/work-history", label: "Work history" },
  { href: "/new/education", label: "Education" },
  { href: "/new/skills", label: "Skills" },
  { href: "/new/summary", label: "Summary" },
  { href: "/new/finalize", label: "Finalize" },
] as const

function normalizePath(path: string) {
  if (path.length > 1 && path.endsWith("/")) return path.slice(0, -1)
  return path
}

export function BuilderShell({ children }: { children: React.ReactNode }) {
  const pathname = normalizePath(usePathname() ?? "")
  const { draft } = useResumeDraft()

  const completenessPercent = computeResumeCompleteness(draft)

  return (
    <div className="flex min-h-svh w-full bg-background">
      <aside className="sticky top-0 hidden h-svh w-56 shrink-0 flex-col border-r border-border bg-muted/30 md:flex">
        <div className="border-b border-border px-4 py-5">
          <div className="flex items-center gap-2.5">
            <span
              className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-blue-600/10 text-blue-600 dark:bg-blue-500/15 dark:text-blue-400"
              aria-hidden
            >
              <Sparkles className="size-5" strokeWidth={1.75} />
            </span>
            <div className="min-w-0">
              <p className="text-lg leading-none font-semibold tracking-tight">
                <span className="text-red-600 dark:text-red-500">Job&nbsp;</span>
                <span className="text-blue-600 dark:text-blue-500">Media</span>
              </p>
              <p className="mt-1.5 text-[0.65rem] font-medium tracking-wide text-muted-foreground">
                AI Resume Builder
              </p>
            </div>
          </div>
        </div>
        <div className="border-b border-border px-4 py-4">
          <div className="flex items-baseline justify-between gap-2">
            <p
              id="resume-completeness-label"
              className="text-[0.65rem] font-medium tracking-wide text-muted-foreground"
            >
              Resume completeness
            </p>
            <p
              className="text-[0.65rem] font-semibold tabular-nums text-foreground"
              aria-hidden
            >
              {completenessPercent}%
            </p>
          </div>
          <Progress
            value={completenessPercent}
            className="mt-2 h-1.5"
            aria-labelledby="resume-completeness-label"
            aria-valuetext={`${completenessPercent} percent complete`}
          />
        </div>
        <nav
          className="flex-1 overflow-y-auto px-3 py-4"
          aria-label="Resume builder steps"
        >
          <ol className="space-y-0.5">
            {BUILDER_STEPS.map((step, index) => {
              const stepPath = normalizePath(step.href)
              const isActive = pathname === stepPath
              const stepNumber = index + 1

              return (
                <li key={step.href}>
                  <Link
                    href={step.href}
                    className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-muted-foreground transition-colors hover:bg-muted/80 hover:text-foreground"
                    aria-current={isActive ? "step" : undefined}
                    aria-label={`Step ${stepNumber} of ${BUILDER_STEPS.length}: ${step.label}`}
                  >
                    <span
                      className={cn(
                        "flex size-7 shrink-0 items-center justify-center rounded-full border text-xs font-semibold tabular-nums",
                        isActive
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-border bg-background text-muted-foreground"
                      )}
                      aria-hidden
                    >
                      {stepNumber}
                    </span>
                    <span className="min-w-0 leading-snug">{step.label}</span>
                  </Link>
                </li>
              )
            })}
          </ol>
        </nav>
      </aside>

      <div className="flex min-h-svh min-w-0 flex-1 flex-col">
        <div className="border-b border-border bg-muted/20 px-4 py-3 md:hidden">
          <div className="flex items-center gap-2">
            <span
              className="flex size-8 shrink-0 items-center justify-center rounded-md bg-blue-600/10 text-blue-600 dark:bg-blue-500/15 dark:text-blue-400"
              aria-hidden
            >
              <Sparkles className="size-4" strokeWidth={1.75} />
            </span>
            <div className="min-w-0">
              <p className="text-base leading-none font-semibold tracking-tight">
                <span className="text-red-600 dark:text-red-500">Job</span>
                <span className="text-blue-600 dark:text-blue-500">Media</span>
              </p>
              <p className="mt-1 text-[0.6rem] font-medium tracking-wide text-muted-foreground">
                AI Resume Builder
              </p>
            </div>
          </div>
          <div className="mt-3">
            <div className="flex items-baseline justify-between gap-2">
              <p
                id="resume-completeness-label-mobile"
                className="text-[0.6rem] font-medium tracking-wide text-muted-foreground"
              >
                Resume completeness
              </p>
              <p
                className="text-[0.6rem] font-semibold tabular-nums text-foreground"
                aria-hidden
              >
                {completenessPercent}%
              </p>
            </div>
            <Progress
              value={completenessPercent}
              className="mt-1.5 h-1.5"
              aria-labelledby="resume-completeness-label-mobile"
              aria-valuetext={`${completenessPercent} percent complete`}
            />
          </div>
          <nav
            className="mt-2 flex [scrollbar-width:none] gap-1 overflow-x-auto pb-1 [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
            aria-label="Resume builder steps"
          >
            {BUILDER_STEPS.map((step, index) => {
              const stepPath = normalizePath(step.href)
              const isActive = pathname === stepPath
              const stepNumber = index + 1

              return (
                <Link
                  key={step.href}
                  href={step.href}
                  className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-muted py-1.5 pr-3 pl-2 text-xs text-muted-foreground transition-colors hover:bg-muted/80 hover:text-foreground"
                  aria-current={isActive ? "step" : undefined}
                  aria-label={`Step ${stepNumber} of ${BUILDER_STEPS.length}: ${step.label}`}
                >
                  <span
                    className={cn(
                      "flex size-5 items-center justify-center rounded-full text-[0.65rem] font-semibold tabular-nums",
                      isActive
                        ? "bg-primary text-primary-foreground"
                        : "bg-background/80 text-foreground"
                    )}
                    aria-hidden
                  >
                    {stepNumber}
                  </span>
                  <span className="whitespace-nowrap">{step.label}</span>
                </Link>
              )
            })}
          </nav>
        </div>

        <main className="flex-1">{children}</main>
      </div>
    </div>
  )
}
