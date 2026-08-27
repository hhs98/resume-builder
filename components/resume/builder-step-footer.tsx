import Link from "next/link"
import { ArrowLeft, ArrowRight } from "lucide-react"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export const builderNextButtonClassName =
  "h-12 w-full gap-2 rounded-full bg-[#0A65CC] px-8 text-base font-semibold text-white shadow-[0_4px_16px_rgba(10,101,204,0.3)] hover:bg-[#0952a5] sm:w-auto"

export const builderBackLinkClassName =
  "inline-flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-white/80 hover:text-foreground"

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
        "sticky bottom-0 z-10 -mx-5 mt-10 border-t border-border/50 bg-[#f4f7fb]/90 px-5 py-6 backdrop-blur-md sm:-mx-8 sm:px-8",
        className
      )}
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
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

        {hint ? (
          <div className="order-2 flex justify-center sm:order-2 sm:flex-1">
            {hint}
          </div>
        ) : (
          <div className="hidden sm:order-2 sm:block sm:flex-1" />
        )}

        <div className="order-1 flex w-full flex-col items-stretch gap-3 sm:order-3 sm:w-auto sm:items-center sm:justify-end">
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
      </div>
    </div>
  )
}
