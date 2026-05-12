import Link from "next/link"
import { Sparkles, Upload } from "lucide-react"

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
      "We'll give you expert guidance to fill out your info and enhance your resume, from start to finish",
    icon: Upload,
  },
] as const

export function StartResumeChoice() {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {choices.map(({ href, title, description, icon: Icon }) => (
        <Link
          key={href}
          href={href}
          className={cn(
            "group flex flex-col gap-3 rounded-xl border border-border bg-card p-6 text-left shadow-sm transition-colors",
            "hover:border-ring hover:bg-accent/30 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background focus-visible:outline-none"
          )}
        >
          <span className="flex size-10 items-center justify-center rounded-lg bg-muted text-foreground transition-colors group-hover:bg-background">
            <Icon className="size-5" aria-hidden />
          </span>
          <div className="space-y-1.5">
            <h2 className="text-base leading-snug font-semibold text-foreground">
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
