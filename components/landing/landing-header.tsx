"use client"

import { Bell, MessageCircle, Search } from "lucide-react"

import { Input } from "@/components/ui/input"
import { useResumeDraft } from "@/hooks/use-resume-draft"
import { getFullName } from "@/lib/resume-draft"
import Image from "next/image"

function JobMediaLogo() {
  return (
    <div className="flex items-center gap-2.5">
      <Image src="/logo.png" alt="logo" width={120} height={45} />
    </div>
  )
}

function getInitials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return "JM"
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase()
} 

function getGreetingName(fullName: string) {
  const trimmed = fullName.trim()
  if (!trimmed) return null
  return trimmed.split(/\s+/)[0]
}

export function LandingHeader() {
  const { draft } = useResumeDraft()
  const fullName = getFullName(draft)
  const greetingName = getGreetingName(fullName)

  return (
    <header className="border-b border-border/60 bg-background">
      <div className="mx-auto grid max-w-6xl grid-cols-1 items-center gap-4 px-6 py-4 lg:grid-cols-[auto_1fr_auto]">
        <div className="flex items-center gap-4">
          <JobMediaLogo />
          <span className="text-sm font-semibold tracking-wide text-foreground">
            MY CV
          </span>
        </div>

        <p className="text-center text-sm text-muted-foreground lg:text-base">
          {greetingName ? (
            <>
              Let&apos;s get you started with your Resume,{" "}
              <span className="font-medium text-foreground">
                {greetingName}
              </span>
            </>
          ) : (
            "Let's get you started with your Resume"
          )}
        </p>

        <div className="flex items-center justify-end gap-2 sm:gap-3">
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
          <span
            className="flex size-9 shrink-0 items-center justify-center rounded-full bg-blue-600 text-xs font-semibold text-white"
            aria-label="Profile"
          >
            {getInitials(fullName)}
          </span>
        </div>
      </div>
    </header>
  )
}
