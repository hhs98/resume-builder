import Link from "next/link"
import Image from "next/image"

const footerLinks = [
  { href: "https://jobmedia.com.bd/privacy-policy", label: "Privacy Policy", external: true },
  { href: "https://jobmedia.com.bd/contact", label: "Contact", external: true },
  { href: "https://jobmedia.com.bd", label: "Job Media", external: true },
] as const

const productLinks = [
  { href: "/new", label: "Build resume" },
  { href: "/import", label: "Import PDF" },
  { href: "#features", label: "Features" },
  { href: "#how-it-works", label: "How it works" },
] as const

export function LandingFooter() {
  const year = new Date().getFullYear()

  return (
    <footer className="border-t border-border/60 bg-white">
      <div className="mx-auto max-w-6xl px-6 py-12">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div className="sm:col-span-2 lg:col-span-2">
            <Link href="/" className="inline-block rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/40">
              <Image
                src="/logo.png"
                alt="Job Media"
                width={120}
                height={45}
                className="h-9 w-auto"
              />
            </Link>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-muted-foreground">
              Job Media AI Resume Builder helps you create professional,
              ATS-friendly resumes with AI-powered writing tools and beautiful
              templates.
            </p>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-foreground">Product</h3>
            <nav className="mt-4 flex flex-col gap-2.5" aria-label="Product">
              {productLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-foreground">Legal & support</h3>
            <nav className="mt-4 flex flex-col gap-2.5" aria-label="Legal">
              {footerLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                >
                  {link.label}
                </a>
              ))}
            </nav>
          </div>
        </div>

        <div className="mt-10 flex flex-col items-center justify-between gap-4 border-t border-border/60 pt-8 text-sm text-muted-foreground sm:flex-row">
          <p>© {year} Job Media. All rights reserved.</p>
          <p className="text-xs">Built for job seekers in Bangladesh and beyond.</p>
        </div>
      </div>
    </footer>
  )
}
