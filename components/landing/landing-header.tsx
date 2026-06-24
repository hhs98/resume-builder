"use client"

import Link from "next/link"
import { Bell, MessageCircle, Search } from "lucide-react"
import Image from "next/image"

import { Input } from "@/components/ui/input"
import { useResumeDraft } from "@/hooks/use-resume-draft"
import { getFullName } from "@/lib/resume-draft"

function getGreetingName(fullName: string) {
  const trimmed = fullName.trim()
  if (!trimmed) return null
  return trimmed.split(/\s+/)[0]
}

export function LandingHeader() {
  const { draft } = useResumeDraft()
  const greetingName = getGreetingName(getFullName(draft))

  return (
    <header className="border-b border-border/60 bg-background">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3 sm:px-6 sm:py-4 lg:grid lg:grid-cols-[auto_1fr_auto] lg:items-center lg:gap-4">
        <div className="flex min-w-0 items-center gap-2.5 sm:gap-4">
          <Link
            href="/"
            className="shrink-0 rounded-md focus-visible:ring-2 focus-visible:ring-blue-500/40 focus-visible:outline-none"
          >
            <Image
              src="/logo.png"
              alt="Job Media"
              width={120}
              height={45}
              className="h-8 w-auto sm:h-9 lg:h-10"
            />
          </Link>
          <span className="truncate text-sm font-extrabold tracking-wide text-foreground sm:text-base">
            MY CV
          </span>
        </div>

        <p className="hidden text-center text-sm text-muted-foreground lg:block lg:text-base">
          {greetingName ? (
            <>
              Let&apos;s get you started with your Resume{" "}
            </>
          ) : (
            "Let's get you started with your Resume"
          )}
        </p>

        <div className="flex shrink-0 items-center justify-end gap-1 sm:gap-2 md:gap-3">
          <div className="relative hidden w-full max-w-xs sm:block">
            <Search
              className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden
            />
            <Input
              type="search"
              placeholder="Search jobs, skills..."
              className="h-9 rounded-full bg-muted/50 pl-9 text-sm"
              readOnly
              aria-label="Search jobs and skills"
            />
          </div>
          <button
            type="button"
            className="flex size-9 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            aria-label="Messages"
          >
            <MessageCircle className="size-5" strokeWidth={1.75} />
          </button>
          <button
            type="button"
            className="flex size-9 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            aria-label="Notifications"
          >
            <Bell className="size-5" strokeWidth={1.75} />
          </button>
        </div>
      </div>
    </header>
  )
}
