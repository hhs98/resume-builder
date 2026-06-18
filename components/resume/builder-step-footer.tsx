import Link from "next/link"
import { ArrowLeft, ArrowRight } from "lucide-react"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export const builderNextButtonClassName =
  "h-12 w-full gap-2 rounded-full bg-blue-600 px-8 text-base font-semibold shadow-[0_4px_14px_rgba(37,99,235,0.35)] hover:bg-blue-700 sm:w-auto"

export const builderBackLinkClassName =
  "inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"

type BuilderStepFooterProps = {
  backHref: string
  nextLabel: string
  nextHref?: string
  nextDisabled?: boolean
  secondaryAction?: React.ReactNode
  hint?: React.ReactNode
  className?: string
}

export function BuilderStepFooter({
  backHref,
  nextLabel,
  nextHref,
  nextDisabled = false,
  secondaryAction,
  hint,
  className,
}: BuilderStepFooterProps) {
  const nextButtonContent = (
    <>
      {nextLabel}
      <ArrowRight className="size-4" aria-hidden />
    </>
  )

  return (
    <div
      className={cn(
        "mt-10 flex flex-col gap-4 border-t border-border/60 pt-8 sm:flex-row sm:items-center sm:justify-between",
        className
      )}
    >
      <div className="order-1 flex w-full flex-col items-stretch gap-3 sm:order-2 sm:w-auto sm:items-center sm:justify-end">
        {secondaryAction}
        {nextDisabled || !nextHref ? (
          <Button
            type="button"
            disabled={nextDisabled}
            className={builderNextButtonClassName}
          >
            {nextButtonContent}
          </Button>
        ) : (
          <Button asChild className={builderNextButtonClassName}>
            <Link href={nextHref}>{nextButtonContent}</Link>
          </Button>
        )}
      </div>

      {hint ? (
        <div className="order-2 flex justify-center sm:order-0 sm:flex-1">
          {hint}
        </div>
      ) : null}

      <Link
        href={backHref}
        className={cn(
          builderBackLinkClassName,
          "order-3 justify-center sm:order-1 sm:justify-start"
        )}
      >
        <ArrowLeft className="size-4" aria-hidden />
        Back
      </Link>
    </div>
  )
}
