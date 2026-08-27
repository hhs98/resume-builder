import Link from "next/link"
import { ArrowRight, FileText, Sparkles } from "lucide-react"

import { cn } from "@/lib/utils"

const choices = [
  {
    href: "/new",
    title: "Start from scratch",
    description:
      "Our guided 8-step wizard walks you through every section with AI suggestions along the way.",
    icon: Sparkles,
    badge: "Recommended",
    accent: "group-hover:border-blue-300 group-hover:shadow-[0_12px_40px_rgba(10,101,204,0.15)]",
    iconBg: "bg-gradient-to-br from-[#0A65CC] to-[#38BDF8]",
  },
  {
    href: "/import",
    title: "Upload existing resume",
    description:
      "Import your PDF and let AI extract your experience, education, and skills into an editable draft.",
    icon: FileText,
    badge: "PDF import",
    accent: "group-hover:border-violet-300 group-hover:shadow-[0_12px_40px_rgba(124,58,237,0.12)]",
    iconBg: "bg-gradient-to-br from-violet-600 to-purple-500",
  },
] as const

export function StartResumeChoice() {
  return (
    <div className="grid gap-5 sm:grid-cols-2">
      {choices.map(({ href, title, description, icon: Icon, badge, accent, iconBg }) => (
        <Link
          key={href}
          href={href}
          className={cn(
            "group relative flex flex-col gap-5 overflow-hidden rounded-2xl border border-border/60 bg-white p-7 text-left shadow-sm transition-all sm:p-8",
            "focus-visible:ring-2 focus-visible:ring-blue-500/40 focus-visible:ring-offset-2 focus-visible:outline-none",
            accent
          )}
        >
          <div className="flex items-start justify-between gap-3">
            <span
              className={cn(
                "flex size-12 items-center justify-center rounded-xl text-white shadow-md",
                iconBg
              )}
            >
              <Icon className="size-5" aria-hidden strokeWidth={1.75} />
            </span>
            <span className="rounded-full bg-muted px-2.5 py-1 text-[0.7rem] font-semibold uppercase tracking-wide text-muted-foreground">
              {badge}
            </span>
          </div>

          <div className="space-y-2">
            <h2 className="text-lg font-semibold leading-snug text-foreground sm:text-xl">
              {title}
            </h2>
            <p className="text-sm leading-relaxed text-muted-foreground">
              {description}
            </p>
          </div>

          <span className="mt-auto inline-flex items-center gap-1.5 text-sm font-semibold text-[#0A65CC] transition-transform group-hover:translate-x-0.5">
            Get started
            <ArrowRight className="size-4" aria-hidden />
          </span>
        </Link>
      ))}
    </div>
  )
}
