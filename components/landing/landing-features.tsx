import {
  Bot,
  FileDown,
  FileUp,
  LayoutTemplate,
  ListChecks,
  WandSparkles,
} from "lucide-react"

const features = [
  {
    icon: Bot,
    title: "AI writing assistant",
    description:
      "Get smart suggestions for work history bullets, skills, and your professional summary — tailored to your role.",
    accent: "from-blue-500/10 to-sky-500/5",
    iconColor: "text-blue-600 bg-blue-100",
  },
  {
    icon: FileUp,
    title: "Import from PDF",
    description:
      "Upload your existing resume and let AI extract your experience, education, and skills into an editable draft.",
    accent: "from-violet-500/10 to-purple-500/5",
    iconColor: "text-violet-600 bg-violet-100",
  },
  {
    icon: LayoutTemplate,
    title: "ATS-friendly templates",
    description:
      "Choose from four professionally designed layouts built to pass applicant tracking systems and look great to recruiters.",
    accent: "from-emerald-500/10 to-teal-500/5",
    iconColor: "text-emerald-600 bg-emerald-100",
  },
  {
    icon: ListChecks,
    title: "Guided step-by-step builder",
    description:
      "Eight clear sections — from contact info to references — with a live completeness score so you never miss a detail.",
    accent: "from-amber-500/10 to-orange-500/5",
    iconColor: "text-amber-600 bg-amber-100",
  },
  {
    icon: WandSparkles,
    title: "Smart skill discovery",
    description:
      "Search curated skills for your industry or let AI recommend the right keywords to strengthen your profile.",
    accent: "from-rose-500/10 to-pink-500/5",
    iconColor: "text-rose-600 bg-rose-100",
  },
  {
    icon: FileDown,
    title: "Professional PDF export",
    description:
      "Download a crisp, print-ready PDF with your chosen template — verified and ready to send to employers.",
    accent: "from-cyan-500/10 to-blue-500/5",
    iconColor: "text-cyan-600 bg-cyan-100",
  },
] as const

export function LandingFeatures() {
  return (
    <section
      id="features"
      className="scroll-mt-24 border-t border-border/40 bg-white/50 px-4 py-20 sm:px-6"
    >
      <div className="mx-auto max-w-6xl">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase tracking-wider text-[#0A65CC]">
            Features
          </p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Everything you need to stand out
          </h2>
          <p className="mt-4 text-base leading-relaxed text-muted-foreground sm:text-lg">
            A complete resume toolkit — from first draft to final download — designed
            for job seekers who want results, not guesswork.
          </p>
        </div>

        <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => (
            <article
              key={feature.title}
              className={`group relative overflow-hidden rounded-2xl border border-border/60 bg-gradient-to-br ${feature.accent} p-6 shadow-sm transition-all hover:-translate-y-0.5 hover:border-blue-200/80 hover:shadow-md`}
            >
              <div
                className={`mb-4 flex size-11 items-center justify-center rounded-xl ${feature.iconColor}`}
              >
                <feature.icon className="size-5" aria-hidden strokeWidth={1.75} />
              </div>
              <h3 className="text-lg font-semibold text-foreground">
                {feature.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {feature.description}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
