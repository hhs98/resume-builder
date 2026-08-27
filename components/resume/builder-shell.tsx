"use client"

import Image from "next/image"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Check, HelpCircle, Settings } from "lucide-react"

import { Progress } from "@/components/ui/progress"
import { useResumeDraft } from "@/hooks/use-resume-draft"
import { useRequireHeadingContact } from "@/hooks/use-require-heading-contact"
import {
  computeResumeCompleteness,
  FINALIZE_SECTIONS,
  type ResumeDraft,
} from "@/lib/resume-draft"
import { cn } from "@/lib/utils"

export const BUILDER_STEPS = [
  { href: "/new", label: "Heading" },
  { href: "/new/work-history", label: "Work History" },
  { href: "/new/education", label: "Education" },
  { href: "/new/training", label: "Training" },
  { href: "/new/skills", label: "Skills" },
  { href: "/new/languages", label: "Languages" },
  { href: "/new/summary", label: "Summary" },
  { href: "/new/references", label: "References" },
  { href: "/new/finalize", label: "Finalize" },
] as const

function normalizePath(path: string) {
  if (path.length > 1 && path.endsWith("/")) return path.slice(0, -1)
  return path
}

function isStepComplete(href: string, draft: ResumeDraft) {
  if (href === "/new/finalize") {
    return FINALIZE_SECTIONS.every((section) => section.isComplete(draft))
  }

  const section = FINALIZE_SECTIONS.find((item) => item.href === href)
  return section ? section.isComplete(draft) : false
}

export function BuilderShell({ children }: { children: React.ReactNode }) {
  const pathname = normalizePath(usePathname() ?? "")
  const { draft } = useResumeDraft()

  useRequireHeadingContact()

  const completenessPercent = computeResumeCompleteness(draft)
  const activeStepIndex = BUILDER_STEPS.findIndex(
    (step) => normalizePath(step.href) === pathname
  )

  return (
    <div className="flex min-h-svh w-full bg-background">
      <aside className="sticky top-0 hidden h-svh w-64 shrink-0 flex-col bg-gradient-to-b from-[#1a2744] to-[#21304F] md:flex">
        <div className="border-b border-white/10 px-5 py-5">
          <Link
            href="/"
            className="inline-block rounded-md focus-visible:ring-2 focus-visible:ring-white/40 focus-visible:outline-none"
          >
            <Image src="/logo.png" alt="Job Media" width={120} height={45} />
          </Link>
          <p className="mt-3 text-xs font-medium tracking-wide text-slate-400">
            Resume Builder
          </p>
        </div>

        <div className="border-b border-white/10 px-5 py-4">
          <div className="flex items-baseline justify-between gap-2">
            <p
              id="resume-completeness-label"
              className="text-[0.65rem] font-medium tracking-wide text-slate-400"
            >
              Resume completeness
            </p>
            <p
              className="text-sm font-bold tabular-nums text-white"
              aria-hidden
            >
              {completenessPercent}%
            </p>
          </div>
          <Progress
            value={completenessPercent}
            className="mt-2.5 h-2 bg-white/10 [&_[data-slot=progress-indicator]]:bg-gradient-to-r [&_[data-slot=progress-indicator]]:from-[#38BDF8] [&_[data-slot=progress-indicator]]:to-[#0A65CC]"
            aria-labelledby="resume-completeness-label"
            aria-valuetext={`${completenessPercent} percent complete`}
          />
        </div>

        <nav
          className="flex-1 overflow-y-auto px-3 py-4"
          aria-label="Resume builder steps"
        >
          <ol className="space-y-1">
            {BUILDER_STEPS.map((step, index) => {
              const stepPath = normalizePath(step.href)
              const isActive = pathname === stepPath
              const isComplete = isStepComplete(step.href, draft)
              const stepNumber = index + 1

              return (
                <li key={step.href}>
                  <Link
                    href={step.href}
                    className={cn(
                      "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-all",
                      isActive
                        ? "bg-[#0A65CC] font-semibold text-white shadow-md shadow-blue-900/30"
                        : "text-slate-300 hover:bg-white/8 hover:text-white"
                    )}
                    aria-current={isActive ? "step" : undefined}
                    aria-label={`Step ${stepNumber} of ${BUILDER_STEPS.length}: ${step.label}${isComplete ? ", complete" : ""}`}
                  >
                    {isActive ? (
                      <span
                        className="flex size-7 shrink-0 items-center justify-center rounded-full bg-white text-xs font-bold text-[#0A65CC] tabular-nums"
                        aria-hidden
                      >
                        {stepNumber}
                      </span>
                    ) : isComplete ? (
                      <span
                        className="flex size-7 shrink-0 items-center justify-center rounded-full bg-emerald-500/20 ring-1 ring-emerald-400/50"
                        aria-hidden
                      >
                        <Check
                          className="size-3.5 text-emerald-400"
                          strokeWidth={2.5}
                        />
                      </span>
                    ) : (
                      <span
                        className="flex size-7 shrink-0 items-center justify-center rounded-full border border-white/15 text-xs font-semibold text-slate-500 tabular-nums"
                        aria-hidden
                      >
                        {stepNumber}
                      </span>
                    )}
                    <span className="min-w-0 leading-snug">{step.label}</span>
                  </Link>
                </li>
              )
            })}
          </ol>
        </nav>

        <div className="mt-auto border-t border-white/10 px-3 py-4">
          <ul className="space-y-0.5">
            <li>
              <a
                href="https://jobmedia.com.bd"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-slate-400 transition-colors hover:bg-white/8 hover:text-slate-200"
              >
                <HelpCircle className="size-[18px] shrink-0" strokeWidth={1.75} />
                <span>Help Center</span>
              </a>
            </li>
            <li>
              <button
                type="button"
                className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm text-slate-400 transition-colors hover:bg-white/8 hover:text-slate-200"
              >
                <Settings className="size-[18px] shrink-0" strokeWidth={1.75} />
                <span>Settings</span>
              </button>
            </li>
          </ul>
        </div>
      </aside>

      <div className="light-surface flex min-h-svh min-w-0 flex-1 flex-col">
        <div className="border-b border-white/10 bg-gradient-to-r from-[#1a2744] to-[#21304F] px-4 py-3 md:hidden">
          <div className="flex items-center justify-between gap-3">
            <Link
              href="/"
              className="inline-block rounded-md focus-visible:ring-2 focus-visible:ring-white/40 focus-visible:outline-none"
            >
              <Image src="/logo.png" alt="Job Media" width={100} height={38} />
            </Link>
            <p className="text-xs font-medium text-slate-400">
              Step {activeStepIndex >= 0 ? activeStepIndex + 1 : 1} of{" "}
              {BUILDER_STEPS.length}
            </p>
          </div>

          <div className="mt-3">
            <div className="flex items-baseline justify-between gap-2">
              <p
                id="resume-completeness-label-mobile"
                className="text-[0.6rem] font-medium tracking-wide text-slate-400"
              >
                Resume completeness
              </p>
              <p
                className="text-xs font-bold tabular-nums text-white"
                aria-hidden
              >
                {completenessPercent}%
              </p>
            </div>
            <Progress
              value={completenessPercent}
              className="mt-1.5 h-1.5 bg-white/10 [&_[data-slot=progress-indicator]]:bg-gradient-to-r [&_[data-slot=progress-indicator]]:from-[#38BDF8] [&_[data-slot=progress-indicator]]:to-[#0A65CC]"
              aria-labelledby="resume-completeness-label-mobile"
              aria-valuetext={`${completenessPercent} percent complete`}
            />
          </div>

          <nav
            className="mt-3 flex [scrollbar-width:none] gap-1.5 overflow-x-auto pb-1 [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
            aria-label="Resume builder steps"
          >
            {BUILDER_STEPS.map((step, index) => {
              const stepPath = normalizePath(step.href)
              const isActive = pathname === stepPath
              const isComplete = isStepComplete(step.href, draft)
              const stepNumber = index + 1

              return (
                <Link
                  key={step.href}
                  href={step.href}
                  className={cn(
                    "inline-flex shrink-0 items-center gap-1.5 rounded-full py-1.5 pr-3 pl-2 text-xs transition-all",
                    isActive
                      ? "bg-[#0A65CC] font-semibold text-white shadow-sm"
                      : "text-slate-300 hover:bg-white/8 hover:text-white"
                  )}
                  aria-current={isActive ? "step" : undefined}
                  aria-label={`Step ${stepNumber} of ${BUILDER_STEPS.length}: ${step.label}${isComplete ? ", complete" : ""}`}
                >
                  {isActive ? (
                    <span
                      className="flex size-5 items-center justify-center rounded-full bg-white text-[0.65rem] font-bold text-[#0A65CC] tabular-nums"
                      aria-hidden
                    >
                      {stepNumber}
                    </span>
                  ) : isComplete ? (
                    <span
                      className="flex size-5 items-center justify-center rounded-full bg-emerald-500/20 ring-1 ring-emerald-400/50"
                      aria-hidden
                    >
                      <Check
                        className="size-3 text-emerald-400"
                        strokeWidth={2.5}
                      />
                    </span>
                  ) : (
                    <span
                      className="flex size-5 items-center justify-center rounded-full border border-white/15 text-[0.65rem] font-semibold text-slate-500 tabular-nums"
                      aria-hidden
                    >
                      {stepNumber}
                    </span>
                  )}
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
