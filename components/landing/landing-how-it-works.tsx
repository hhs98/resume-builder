import { Download, PenLine, Upload } from "lucide-react"

const steps = [
  {
    step: "01",
    icon: Upload,
    title: "Start or import",
    description:
      "Begin with our guided wizard or upload your existing PDF resume. AI structures your content automatically.",
  },
  {
    step: "02",
    icon: PenLine,
    title: "Build with AI help",
    description:
      "Fill each section with confidence. Get AI suggestions for bullets, skills, and summaries as you go.",
  },
  {
    step: "03",
    icon: Download,
    title: "Pick a template & download",
    description:
      "Preview your resume live, choose from four pro templates, and export a polished PDF ready to apply.",
  },
] as const

export function LandingHowItWorks() {
  return (
    <section
      id="how-it-works"
      className="scroll-mt-24 px-4 py-20 sm:px-6"
    >
      <div className="mx-auto max-w-6xl">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase tracking-wider text-[#0A65CC]">
            How it works
          </p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            From blank page to job-ready in three steps
          </h2>
          <p className="mt-4 text-base leading-relaxed text-muted-foreground sm:text-lg">
            No design skills needed. We handle the structure, formatting, and AI
            polish — you focus on your story.
          </p>
        </div>

        <ol className="relative mt-14 grid gap-8 lg:grid-cols-3">
          <div
            className="pointer-events-none absolute top-16 right-[16.67%] left-[16.67%] hidden h-px bg-gradient-to-r from-transparent via-blue-300 to-transparent lg:block"
            aria-hidden
          />
          {steps.map((item, index) => (
            <li key={item.step} className="relative">
              <div className="flex h-full flex-col rounded-2xl border border-border/60 bg-white p-8 shadow-sm">
                <div className="mb-6 flex items-center justify-between">
                  <span className="text-4xl font-bold text-blue-100">
                    {item.step}
                  </span>
                  <div className="flex size-12 items-center justify-center rounded-xl bg-[#0A65CC] text-white shadow-md">
                    <item.icon className="size-5" aria-hidden strokeWidth={1.75} />
                  </div>
                </div>
                <h3 className="text-xl font-semibold text-foreground">
                  {item.title}
                </h3>
                <p className="mt-3 flex-1 text-sm leading-relaxed text-muted-foreground">
                  {item.description}
                </p>
                {index < steps.length - 1 ? (
                  <div
                    className="mx-auto mt-6 h-8 w-px bg-border lg:hidden"
                    aria-hidden
                  />
                ) : null}
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}
