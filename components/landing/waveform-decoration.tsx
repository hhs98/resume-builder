import Image from "next/image"

export function WaveformDecoration() {
  return (
    <div
      className="pointer-events-none flex justify-center pt-12 md:pt-16"
      aria-hidden
    >
      <Image
        src="/ai-visualizer.png"
        alt=""
        width={480}
        height={96}
        className="h-14 w-auto max-w-[min(100%,28rem)] mix-blend-screen opacity-90 md:h-16"
        priority={false}
      />
    </div>
  )
}
