import Link from "next/link"
import {
  ArrowRight,
  CheckCircle2,
  ShieldCheck,
  Sparkles,
  Zap,
} from "lucide-react"

import { StartResumeChoice } from "@/components/start-resume-choice"
import { Button } from "@/components/ui/button"

const trustPoints = [
  "ATS-friendly templates",
  "AI writing assistant",
  "Free to build",
] as const

const stats = [
  { value: "8", label: "Guided steps" },
  { value: "4", label: "Pro templates" },
  { value: "AI", label: "Smart suggestions" },
] as const

export function LandingHero() {
  return (
    <section className="relative overflow-hidden px-4 pb-20 pt-14 sm:px-6 sm:pt-20 md:pb-28 md:pt-24">
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(10,101,204,0.15),transparent)]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -right-24 top-20 size-72 rounded-full bg-sky-200/40 blur-3xl"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -left-24 bottom-0 size-72 rounded-full bg-blue-100/50 blur-3xl"
        aria-hidden
      />

      <div className="relative mx-auto max-w-6xl">
        <div className="mx-auto max-w-3xl text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-blue-200/80 bg-white/90 px-4 py-1.5 text-sm font-medium text-[#0A65CC] shadow-sm backdrop-blur">
            <Sparkles className="size-4" aria-hidden />
            AI-powered resume builder for Job Media
          </div>

          <h1 className="text-4xl font-bold tracking-tight text-balance text-foreground sm:text-5xl lg:text-[3.25rem] lg:leading-[1.1]">
            Build a resume that{" "}
            <span className="bg-gradient-to-r from-[#0A65CC] via-[#1d7fe8] to-[#38BDF8] bg-clip-text text-transparent">
              gets you noticed
            </span>
          </h1>

          <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-pretty text-muted-foreground sm:text-lg">
            Create a polished, ATS-ready resume in minutes. Start from scratch or
            upload your existing PDF — our AI helps you write stronger bullets,
            skills, and summaries every step of the way.
          </p>

          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button
              asChild
              size="lg"
              className="h-11 gap-2 bg-[#0A65CC] px-6 text-base text-white shadow-md hover:bg-[#0952a5]"
            >
              <Link href="/new">
                Start building
                <ArrowRight className="size-4" aria-hidden />
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="h-11 border-border/80 bg-white/80 px-6 text-base"
            >
              <Link href="/import">Upload existing resume</Link>
            </Button>
          </div>

          <ul className="mt-8 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-sm text-muted-foreground">
            {trustPoints.map((point) => (
              <li key={point} className="flex items-center gap-1.5">
                <CheckCircle2
                  className="size-4 shrink-0 text-emerald-500"
                  aria-hidden
                />
                {point}
              </li>
            ))}
          </ul>
        </div>

        <div className="mx-auto mt-14 max-w-4xl">
          <div className="mb-6 flex items-center justify-between gap-4 px-1">
            <div>
              <p className="text-sm font-semibold text-foreground">
                Choose how you want to start
              </p>
              <p className="text-sm text-muted-foreground">
                Both paths include AI guidance and a live preview
              </p>
            </div>
            <div className="hidden items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700 sm:flex">
              <Zap className="size-3.5" aria-hidden />
              Ready in under 15 min
            </div>
          </div>
          <StartResumeChoice />
        </div>

        <div className="mx-auto mt-16 grid max-w-3xl grid-cols-3 gap-4 sm:gap-8">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="rounded-2xl border border-white/80 bg-white/70 px-4 py-5 text-center shadow-sm backdrop-blur"
            >
              <p className="text-2xl font-bold tracking-tight text-[#0A65CC] sm:text-3xl">
                {stat.value}
              </p>
              <p className="mt-1 text-xs font-medium text-muted-foreground sm:text-sm">
                {stat.label}
              </p>
            </div>
          ))}
        </div>

        <div className="mx-auto mt-10 flex max-w-xl items-center justify-center gap-2 rounded-2xl border border-border/60 bg-white/60 px-4 py-3 text-center text-sm text-muted-foreground backdrop-blur">
          <ShieldCheck className="size-4 shrink-0 text-[#0A65CC]" aria-hidden />
          Your data stays on your device until you choose to download your resume.
        </div>
      </div>
    </section>
  )
}
