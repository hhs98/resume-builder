import { LandingCta } from "@/components/landing/landing-cta"
import { LandingFeatures } from "@/components/landing/landing-features"
import { LandingFooter } from "@/components/landing/landing-footer"
import { LandingHeader } from "@/components/landing/landing-header"
import { LandingHero } from "@/components/landing/landing-hero"
import { LandingHowItWorks } from "@/components/landing/landing-how-it-works"
import { LandingTemplates } from "@/components/landing/landing-templates"

export function LandingPage() {
  return (
    <div className="light-surface flex min-h-svh flex-col bg-[#f4f7fb]">
      <div
        className="pointer-events-none fixed inset-0 bg-[linear-gradient(to_right,#e8edf4_1px,transparent_1px),linear-gradient(to_bottom,#e8edf4_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_at_center,black_20%,transparent_75%)]"
        aria-hidden
      />

      <LandingHeader />

      <main className="relative flex-1">
        <LandingHero />
        <LandingFeatures />
        <LandingHowItWorks />
        <LandingTemplates />
        <LandingCta />
      </main>

      <LandingFooter />
    </div>
  )
}
