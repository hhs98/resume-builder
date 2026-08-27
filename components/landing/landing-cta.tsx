import Link from "next/link"
import { ArrowRight, Sparkles } from "lucide-react"

import { Button } from "@/components/ui/button"

export function LandingCta() {
  return (
    <section className="px-4 py-20 sm:px-6">
      <div className="mx-auto max-w-6xl">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#0A65CC] via-[#1a5fad] to-[#21304F] px-6 py-14 text-center shadow-xl sm:px-12 sm:py-16">
          <div
            className="pointer-events-none absolute -top-24 -right-24 size-64 rounded-full bg-white/10 blur-3xl"
            aria-hidden
          />
          <div
            className="pointer-events-none absolute -bottom-24 -left-24 size-64 rounded-full bg-sky-400/20 blur-3xl"
            aria-hidden
          />

          <div className="relative mx-auto max-w-2xl">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-1.5 text-sm font-medium text-white/90">
              <Sparkles className="size-4" aria-hidden />
              Start free — no subscription required
            </div>
            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Your next opportunity starts with a great resume
            </h2>
            <p className="mt-4 text-base leading-relaxed text-blue-100 sm:text-lg">
              Join thousands of job seekers using Job Media to build resumes that
              open doors. Create yours in minutes.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Button
                asChild
                size="lg"
                className="h-11 gap-2 bg-white px-6 text-base text-[#0A65CC] hover:bg-blue-50"
              >
                <Link href="/new">
                  Create my resume
                  <ArrowRight className="size-4" aria-hidden />
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                size="lg"
                className="h-11 border-white/30 bg-white/10 px-6 text-base text-white hover:bg-white/20 hover:text-white"
              >
                <Link href="/import">I have a resume already</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
