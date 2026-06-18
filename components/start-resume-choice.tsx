import Link from "next/link"
import { FileText, Sparkles } from "lucide-react"

import { cn } from "@/lib/utils"

const choices = [
  {
    href: "/new",
    title: "No, start from scratch",
    description:
      "We'll guide you through the whole process so your skills can shine",
    icon: Sparkles,
  },
  {
    href: "/import",
    title: "Yes, upload from my resume",
    description:
      "We'll give you expert guidance to fill out your info and enhance your resume, from start to finish.",
    icon: FileText,
  },
] as const

export function StartResumeChoice() {
  return (
    <div className="grid gap-5 sm:grid-cols-2">
      {choices.map(({ href, title, description, icon: Icon }) => (
        <Link
          key={href}
          href={href}
          className={cn(
            "group flex flex-col gap-4 rounded-2xl border border-border/60 bg-white p-8 text-left shadow-[0_4px_24px_rgba(15,23,42,0.06)] transition-all",
            "hover:border-blue-200 hover:shadow-[0_8px_32px_rgba(59,130,246,0.12)] focus-visible:ring-2 focus-visible:ring-blue-500/40 focus-visible:ring-offset-2 focus-visible:outline-none"
          )}
        >
          <span className="flex size-11 items-center justify-center rounded-xl bg-blue-600 text-white shadow-sm">
            <Icon className="size-5" aria-hidden strokeWidth={1.75} />
          </span>
          <div className="space-y-2">
            <h2 className="text-lg font-semibold leading-snug text-foreground">
              {title}
            </h2>
            <p className="text-sm leading-relaxed text-muted-foreground">
              {description}
            </p>
          </div>
        </Link>
      ))}
    </div>
  )
}
