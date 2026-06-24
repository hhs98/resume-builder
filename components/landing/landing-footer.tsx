import Link from "next/link"

const footerLinks = [
  { href: "https://jobmedia.com.bd/privacy-policy", label: "Privacy Policy", external: true },
  // { href: "/terms", label: "Terms of Service" },
  { href: "https://jobmedia.com.bd/contact", label: "Contact US", external: true },
  { href: "https://jobmedia.com.bd", label: "Support", external: true },
] as const

export function LandingFooter() {
  const year = new Date().getFullYear()

  return (
    <footer className="border-t border-border/60 bg-background">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-6 py-6 text-sm text-muted-foreground sm:flex-row">
        <p>
          <span className="font-medium text-foreground">Job Media AI</span> ©{" "}
          {year} Job Media AI. All rights reserved.
        </p>
        <nav className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
          {footerLinks.map((link) =>
            "external" in link && link.external ? (
              <a
                key={link.href}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className="transition-colors hover:text-foreground"
              >
                {link.label}
              </a>
            ) : (
              <Link
                key={link.href}
                href={link.href}
                className="transition-colors hover:text-foreground"
              >
                {link.label}
              </Link>
            )
          )}
        </nav>
      </div>
    </footer>
  )
}
