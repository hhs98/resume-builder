import Link from "next/link"
import { ArrowLeft, Lightbulb } from "lucide-react"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

const maxWidthClasses = {
  "3xl": "max-w-3xl",
  "6xl": "max-w-6xl",
  "7xl": "max-w-7xl",
  full: "max-w-full",
} as const

type BuilderStepPageProps = {
  children: React.ReactNode
  maxWidth?: keyof typeof maxWidthClasses
  className?: string
}

export function BuilderStepPage({
  children,
  maxWidth = "3xl",
  className,
}: BuilderStepPageProps) {
  return (
    <div className={cn("relative min-h-full bg-[#f4f7fb]", className)}>
      <div
        className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,#e8edf4_1px,transparent_1px),linear-gradient(to_bottom,#e8edf4_1px,transparent_1px)] bg-[size:3rem_3rem] [mask-image:radial-gradient(ellipse_at_top,black_30%,transparent_80%)]"
        aria-hidden
      />
      <div
        className={cn(
          "relative mx-auto px-5 py-8 sm:px-8 sm:py-10",
          maxWidthClasses[maxWidth]
        )}
      >
        {children}
      </div>
    </div>
  )
}

type BuilderStepToolbarProps = {
  backHref: string
  backLabel?: string
  className?: string
}

export function BuilderStepToolbar({
  backHref,
  backLabel = "Back",
  className,
}: BuilderStepToolbarProps) {
  return (
    <div className={cn("mb-6 flex items-center justify-between", className)}>
      <Link
        href={backHref}
        className="inline-flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-white/80 hover:text-foreground"
      >
        <ArrowLeft className="size-4" aria-hidden />
        {backLabel}
      </Link>
      <BuilderTipsButton />
    </div>
  )
}

export function BuilderTipsButton({ className }: { className?: string }) {
  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      className={cn(
        "h-9 gap-1.5 rounded-full border-blue-200/80 bg-white/90 px-4 text-[#0A65CC] shadow-sm backdrop-blur hover:bg-blue-50",
        className
      )}
    >
      <Lightbulb className="size-4" aria-hidden />
      Tips
    </Button>
  )
}

type BuilderStepHeaderProps = {
  title: string
  description: string
  action?: React.ReactNode
  centered?: boolean
  className?: string
}

export function BuilderStepHeader({
  title,
  description,
  action,
  centered = false,
  className,
}: BuilderStepHeaderProps) {
  if (centered) {
    return (
      <header
        className={cn("mx-auto max-w-2xl space-y-3 text-center", className)}
      >
        <h1 className="text-2xl font-bold tracking-tight text-balance text-foreground md:text-3xl">
          {title}
        </h1>
        <p className="text-sm leading-relaxed text-pretty text-muted-foreground md:text-base">
          {description}
        </p>
      </header>
    )
  }

  return (
    <div
      className={cn(
        "flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between",
        className
      )}
    >
      <header className="max-w-2xl space-y-2">
        <h1 className="text-2xl font-bold tracking-tight text-balance text-foreground md:text-3xl">
          {title}
        </h1>
        <p className="text-sm leading-relaxed text-pretty text-muted-foreground md:text-base">
          {description}
        </p>
      </header>
      {action}
    </div>
  )
}

type BuilderFormCardProps = {
  children: React.ReactNode
  className?: string
  accent?: boolean
  padding?: "sm" | "md" | "lg"
}

export function BuilderFormCard({
  children,
  className,
  accent = true,
  padding = "md",
}: BuilderFormCardProps) {
  const paddingClass =
    padding === "sm" ? "p-5" : padding === "lg" ? "p-7 sm:p-8" : "p-6 sm:p-7"

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-2xl border border-border/50 bg-white shadow-sm shadow-black/[0.04] ring-1 ring-black/[0.02]",
        paddingClass,
        className
      )}
    >
      {accent ? (
        <div
          className="absolute inset-y-0 left-0 w-1 bg-gradient-to-b from-[#0A65CC] to-[#38BDF8]"
          aria-hidden
        />
      ) : null}
      {children}
    </div>
  )
}
