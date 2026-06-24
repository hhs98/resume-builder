import { LandingFooter } from "@/components/landing/landing-footer"
import { LandingHeader } from "@/components/landing/landing-header"
import { WaveformDecoration } from "@/components/landing/waveform-decoration"
import { StartResumeChoice } from "@/components/start-resume-choice"
import Image from "next/image"

export function LandingPage() {
  return (
    <div className="light-surface flex min-h-svh flex-col bg-[#f8f9fb]">
      <LandingHeader />

      <main className="relative flex flex-1 flex-col items-center justify-center px-6 py-12 md:py-16">
        <div
          className="pointer-events-none absolute inset-x-0 top-1/3 h-64 -translate-y-1/2 bg-[radial-gradient(ellipse_at_center,rgba(59,130,246,0.08)_0%,transparent_70%)]"
          aria-hidden
        />

        <div className="relative w-full max-w-4xl space-y-10 text-center">
          <header className="mx-auto max-w-2xl space-y-4">
            <h1 className="text-3xl font-semibold tracking-tight text-balance text-foreground md:text-4xl lg:text-[2.5rem] lg:leading-tight">
              Are you uploading an{" "}
              <span className="bg-gradient-to-r from-[#0A65CC] to-[#38BDF8] bg-clip-text text-transparent">
                existing
              </span>
              <span className="block bg-gradient-to-r from-[#0A65CC] to-[#38BDF8] bg-clip-text text-transparent">
                resume?
              </span>
            </h1>
            <p className="text-base leading-relaxed text-pretty text-muted-foreground md:text-lg">
              Just review, edit, and update it with new information.
            </p>
          </header>

          <StartResumeChoice />

          <WaveformDecoration />
          {/* <div>
            <Image
              src="/element.png"
              alt=""
              width={480}
              height={96}
              // className="h-14 w-auto max-w-[min(100%,28rem)] opacity-90 mix-blend-screen md:h-16"
              className="w-full h-auto max-w-4xl"
              priority={false}
            />
          </div> */}
        </div>
      </main>

      <LandingFooter />
    </div>
  )
}
