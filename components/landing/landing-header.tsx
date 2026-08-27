"use client"

import Link from "next/link"
import Image from "next/image"
import { Menu, X } from "lucide-react"
import { useState } from "react"

import { Button } from "@/components/ui/button"
import { useResumeDraft } from "@/hooks/use-resume-draft"
import { getFullName } from "@/lib/resume-draft"
import { cn } from "@/lib/utils"

const navLinks = [
  { href: "#features", label: "Features" },
  { href: "#how-it-works", label: "How it works" },
  { href: "#templates", label: "Templates" },
] as const

function getGreetingName(fullName: string) {
  const trimmed = fullName.trim()
  if (!trimmed) return null
  return trimmed.split(/\s+/)[0]
}

export function LandingHeader() {
  const { draft } = useResumeDraft()
  const greetingName = getGreetingName(getFullName(draft))
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 border-b border-white/60 bg-white/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <div className="flex min-w-0 items-center gap-3">
          <Link
            href="/"
            className="shrink-0 rounded-md focus-visible:ring-2 focus-visible:ring-blue-500/40 focus-visible:outline-none"
          >
            <Image
              src="/logo.png"
              alt="Job Media"
              width={120}
              height={45}
              className="h-8 w-auto sm:h-9"
            />
          </Link>
          <div className="hidden h-5 w-px bg-border sm:block" aria-hidden />
          <span className="hidden text-sm font-semibold tracking-wide text-foreground sm:inline">
            Resume Builder
          </span>
        </div>

        <nav className="hidden items-center gap-1 md:flex" aria-label="Main">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted/60 hover:text-foreground"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          {greetingName ? (
            <span className="mr-1 hidden text-sm text-muted-foreground lg:inline">
              Hi, {greetingName}
            </span>
          ) : null}
          <Button
            asChild
            variant="outline"
            size="sm"
            className="hidden border-border/80 bg-white/80 sm:inline-flex"
          >
            <Link href="/import">Import resume</Link>
          </Button>
          <Button
            asChild
            size="sm"
            className="bg-[#0A65CC] text-white shadow-sm hover:bg-[#0952a5]"
          >
            <Link href="/new">Build resume</Link>
          </Button>
          <button
            type="button"
            className="flex size-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted md:hidden"
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileOpen}
            onClick={() => setMobileOpen((open) => !open)}
          >
            {mobileOpen ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </div>

      <div
        className={cn(
          "overflow-hidden border-t border-border/60 bg-white/95 backdrop-blur-xl md:hidden",
          mobileOpen ? "block" : "hidden"
        )}
      >
        <nav className="flex flex-col gap-1 px-4 py-3" aria-label="Mobile">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="rounded-lg px-3 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-muted"
              onClick={() => setMobileOpen(false)}
            >
              {link.label}
            </a>
          ))}
          <Link
            href="/import"
            className="rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted"
            onClick={() => setMobileOpen(false)}
          >
            Import resume
          </Link>
        </nav>
      </div>
    </header>
  )
}
