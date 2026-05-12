import { Sparkles } from "lucide-react"

import { StartResumeChoice } from "@/components/start-resume-choice"

export default function Page() {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center px-6 py-16">
      <div className="w-full max-w-2xl space-y-10">
        <div className="flex justify-center sm:justify-start">
          <div className="flex items-center gap-2.5">
            <span
              className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-blue-600/10 text-blue-600 dark:bg-blue-500/15 dark:text-blue-400"
              aria-hidden
            >
              <Sparkles className="size-5" strokeWidth={1.75} />
            </span>
            <div className="min-w-0 text-center sm:text-left">
              <p className="text-lg leading-none font-semibold tracking-tight">
                <span className="text-red-600 dark:text-red-500">Job&nbsp;</span>
                <span className="text-blue-600 dark:text-blue-500">Media</span>
              </p>
              <p className="mt-1.5 text-[0.65rem] font-medium tracking-wide text-muted-foreground">
                AI Resume Builder
              </p>
            </div>
          </div>
        </div>

        <header className="space-y-3 text-center sm:text-left">
          <h1 className="text-2xl font-semibold tracking-tight text-balance text-foreground sm:text-3xl">
            Are you uploading an existing resume?
          </h1>
          <p className="text-base leading-relaxed text-pretty text-muted-foreground">
            Just review, edit, and update it with new information
          </p>
        </header>

        <StartResumeChoice />
      </div>
    </div>
  )
}
