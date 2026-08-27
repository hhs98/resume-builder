import { cn } from "@/lib/utils"

type ResumeWatermarkProps = {
  className?: string
}

/** Subtle Job Media brand mark for resume preview + downloaded PDF. */
export function ResumeWatermark({ className }: ResumeWatermarkProps) {
  return (
    <div
      className={cn(
        "pointer-events-none absolute bottom-3 right-4 z-10 flex items-center gap-1.5 opacity-[0.22] print:opacity-[0.28]",
        className
      )}
      aria-hidden
    >
      {/* eslint-disable-next-line @next/next/no-img-element -- print/PDF-safe static asset */}
      <img
        src="/logo.png"
        alt=""
        width={72}
        height={27}
        className="h-[18px] w-auto object-contain"
      />
    </div>
  )
}
